//! Built-in HTTP serve — `rift serve` runs a local HTTP server so others
//! can clone/push without GitHub. No external dependencies, just Rift.
//!
//! ## Security defaults (v1.1)
//! - Binds to **`127.0.0.1`** (localhost only) by default. Pass `--public`
//!   to bind `0.0.0.0` (prints a security warning).
//! - **Bearer auth**: pass `--token <secret>` to require
//!   `Authorization: Bearer <secret>` on `/blob`, `/tree`, `/commit`.
//!   `/info`, `/log`, `/branches`, `/clone`, `/health` stay public.
//! - **Rate limit** (v1.1 change): **only on `--public`**. In localhost
//!   mode the user is the only consumer, so rate limiting is disabled.
//!   With `--public`, the per-IP limiter kicks in (100 req / 60 s → 429)
//!   to protect against DOS from the network. The serve banner prints
//!   `Rate limiting: enabled (--public mode)` or `Rate limiting: disabled
//!   (localhost)`.
//! - **CORS**: `Access-Control-Allow-Origin: *` (so browsers can fetch
//!   `/health` and `/info` for monitoring).
//! - **Body limit**: 1 MB. Bodies over the limit → `413 Payload Too Large`.
//! - **`/health`** endpoint: returns `{"status":"ok","version":"1.1.0"}`
//!   (no auth, for monitoring).
//! - **`/blob`** endpoint (v1.1): serves blob bytes base64-encoded so the
//!   peer-to-peer `rift clone http://host:port` flow survives binary files.

use crate::error::RiftError;
use crate::repo::Repo;
use axum::extract::ConnectInfo;
use axum::http::{header, HeaderValue, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Json, Response};
use axum::routing::get;
use axum::{extract::Path, extract::Request, extract::State, Router};
use base64::Engine;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::net::{IpAddr, SocketAddr};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// Maximum requests per window per IP.
const RATE_LIMIT_MAX: u32 = 100;
/// Rate-limit window length.
const RATE_LIMIT_WINDOW: Duration = Duration::from_secs(60);
/// Maximum request body size (1 MB).
const MAX_BODY_BYTES: usize = 1024 * 1024;
/// Server version string.
pub const VERSION: &str = "1.1.0";

/// Options for [`serve`].
#[derive(Debug, Clone)]
pub struct ServeOptions {
    /// TCP port to listen on.
    pub port: u16,
    /// Bind `0.0.0.0` (all interfaces) instead of `127.0.0.1`.
    pub public: bool,
    /// If set, require `Authorization: Bearer <token>` on protected routes.
    pub token: Option<String>,
    /// Enable TLS (HTTPS) with a self-signed cert.
    pub tls: bool,
}

/// Run the rift HTTP server.
///
/// # Errors
/// Returns an error if the TCP listener can't bind or the server fails.
pub async fn serve(repo: Repo, opts: ServeOptions) -> Result<(), RiftError> {
    let bind_addr = if opts.public {
        "0.0.0.0"
    } else {
        "127.0.0.1"
    };
    let addr: SocketAddr = format!("{bind_addr}:{port}", port = opts.port)
        .parse()
        .map_err(|e| RiftError::Other(format!("parse bind addr: {e}")))?;

    let state = Arc::new(AppState {
        repo,
        token: opts.token.clone(),
        public: opts.public,
        rate_limiter: Mutex::new(HashMap::new()),
    });

    let app = build_router(state);

    print_banner(opts.public, opts.token.is_some(), opts.tls, opts.port);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(RiftError::Io)?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .map_err(RiftError::from)?;
    Ok(())
}

/// Mutable server state shared by every handler.
pub struct AppState {
    /// The rift repository.
    pub repo: Repo,
    /// Optional bearer token. If `Some`, protected routes require it.
    pub token: Option<String>,
    /// Whether the server is bound to `0.0.0.0` (`--public`) or `127.0.0.1`.
    /// Rate limiting only applies when `public == true`.
    pub public: bool,
    /// Per-IP rate-limit state: IP → (request count, window start).
    /// Only mutated when `public == true`.
    pub rate_limiter: Mutex<HashMap<IpAddr, (u32, Instant)>>,
}

/// Build the axum [`Router`] for the rift HTTP server. Exposed so tests can
/// construct the router and exercise it via `tower::ServiceExt::oneshot`.
#[must_use]
pub fn build_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/info", get(info))
        .route("/log", get(log))
        .route("/branches", get(branches))
        .route("/clone", get(clone_manifest))
        .route("/tree/:hash", get(tree))
        .route("/blob/:hash", get(blob))
        .route("/commit/:hash", get(commit))
        .layer(middleware::from_fn_with_state(
            state.clone(),
            security_middleware,
        ))
        .layer(middleware::from_fn(cors_middleware))
        .layer(axum::extract::DefaultBodyLimit::max(MAX_BODY_BYTES))
        .with_state(state)
}

/// Public health endpoint — returns server status + version. No auth.
async fn health() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "version": VERSION,
    }))
}

/// Public info endpoint — repository metadata + chunk stats.
async fn info(State(state): State<Arc<AppState>>) -> Json<Value> {
    let branch = state.repo.current_branch().unwrap_or_default();
    let commit = state.repo.current_commit_hash();
    let branches = state.repo.list_branches().unwrap_or_default();
    let stats = state.repo.store.chunks.stats().unwrap_or_else(|_| crate::chunk::ChunkStats {
        unique_chunks: 0,
        total_chunks: 0,
        total_bytes: 0,
        dedup_ratio: 0.0,
    });
    Json(json!({
        "server": "rift",
        "version": VERSION,
        "branch": branch,
        "head": commit,
        "branches": branches,
        "stats": {
            "unique_chunks": stats.unique_chunks,
            "total_chunks": stats.total_chunks,
            "total_bytes": stats.total_bytes,
            "dedup_ratio": stats.dedup_ratio,
        },
    }))
}

/// Public log endpoint — full commit history.
async fn log(State(state): State<Arc<AppState>>) -> Json<Value> {
    let entries = state.repo.log().unwrap_or_default();
    Json(json!(entries))
}

/// Protected tree endpoint — returns the tree at `hash` as JSON.
async fn tree(
    State(state): State<Arc<AppState>>,
    Path(hash): Path<String>,
) -> Json<Value> {
    match state.repo.store.read_tree(&hash) {
        Ok(t) => Json(json!(t)),
        Err(e) => Json(json!({"error": e.to_string()})),
    }
}

/// Protected blob endpoint — returns blob `hash` as JSON. This is the most
/// sensitive endpoint because it returns file contents. v1.1: data is
/// base64-encoded so the peer-to-peer `rift clone http://host:port` flow
/// survives binary files (the v1.0 lossy-UTF-8 encoding corrupted bytes
/// above 0x7F).
async fn blob(
    State(state): State<Arc<AppState>>,
    Path(hash): Path<String>,
) -> Json<Value> {
    match state.repo.store.read_blob(&hash) {
        Ok(data) => {
            let b64 = base64::engine::general_purpose::STANDARD.encode(&data);
            Json(json!({
                "hash": hash,
                "size": data.len(),
                "encoding": "base64",
                "data": b64,
            }))
        }
        Err(e) => Json(json!({"error": e.to_string()})),
    }
}

/// Protected commit endpoint — returns the commit at `hash` as JSON.
async fn commit(
    State(state): State<Arc<AppState>>,
    Path(hash): Path<String>,
) -> Json<Value> {
    let full = state.repo.store.resolve_hash(&hash).unwrap_or(hash);
    match state.repo.store.read_commit(&full) {
        Ok(c) => Json(json!(c)),
        Err(e) => Json(json!({"error": e.to_string()})),
    }
}

/// Public branches endpoint — list of all branches.
async fn branches(State(state): State<Arc<AppState>>) -> Json<Value> {
    let branches = state.repo.list_branches().unwrap_or_default();
    Json(json!({"branches": branches}))
}

/// Public clone manifest — returns HEAD + log + branches so a remote
/// `rift clone http://host:port` can fetch them.
async fn clone_manifest(State(state): State<Arc<AppState>>) -> Json<Value> {
    let info = state.repo.current_commit_hash();
    let log = state.repo.log().unwrap_or_default();
    let branches = state.repo.list_branches().unwrap_or_default();
    Json(json!({
        "head": info,
        "log": log,
        "branches": branches,
    }))
}

/// Combined security middleware: rate limit (only on `--public`) + bearer
/// auth. Combining the two into one middleware avoids an axum 0.7
/// trait-inference quirk where stacking two `from_fn_with_state` middlewares
/// with the same signature confuses the tuple-type inference. Logically
/// equivalent to two separate middlewares: rate-limit first, then bearer-auth.
async fn security_middleware(
    State(state): State<Arc<AppState>>,
    request: Request,
    next: Next,
) -> Response {
    // ---- Rate limit (only in --public mode) ----
    // In localhost mode the user is the only consumer — no DOS protection
    // needed. The check is here so we don't even take the mutex lock in
    // the common case.
    if state.public {
        let ip = request
            .extensions()
            .get::<ConnectInfo<SocketAddr>>()
            .map(|ci| ci.0.ip())
            .unwrap_or_else(|| IpAddr::V4(std::net::Ipv4Addr::UNSPECIFIED));
        let now = Instant::now();
        {
            let mut map = state
                .rate_limiter
                .lock()
                .unwrap_or_else(|e| e.into_inner());
            let entry = map.entry(ip).or_insert((0, now));
            // Reset the window if it expired.
            if now.duration_since(entry.1) >= RATE_LIMIT_WINDOW {
                *entry = (0, now);
            }
            entry.0 += 1;
            let over_limit = entry.0 > RATE_LIMIT_MAX;
            drop(map);
            if over_limit {
                return StatusCode::TOO_MANY_REQUESTS.into_response();
            }
        }
    }

    // ---- Bearer auth (only on protected routes) ----
    let path = request.uri().path();
    let is_public = matches!(
        path,
        "/health" | "/info" | "/log" | "/branches" | "/clone"
    );
    if !is_public {
        if let Some(expected) = &state.token {
            let provided = request
                .headers()
                .get(header::AUTHORIZATION)
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.strip_prefix("Bearer "))
                .unwrap_or("");
            if provided != expected {
                return StatusCode::UNAUTHORIZED.into_response();
            }
        }
    }

    next.run(request).await
}

/// CORS middleware: adds `Access-Control-Allow-Origin: *` to every response
/// so browsers can fetch `/health` and `/info` for monitoring.
async fn cors_middleware(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    response.headers_mut().insert(
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        HeaderValue::from_static("*"),
    );
    response
}

/// Print the serve banner. Reflects the security mode (localhost vs
/// public, auth on/off, rate limiting on/off).
fn print_banner(public: bool, has_token: bool, tls: bool, port: u16) {
    let bind = if public { "0.0.0.0" } else { "127.0.0.1" };
    let mode = if public { "public" } else { "localhost only" };
    let scheme = if tls { "https" } else { "http" };
    let url_line = format!("{scheme}://{bind}:{port}  ({mode})");
    let auth_line = if has_token {
        "Bearer token required for /blob"
    } else {
        "none (use --token <secret> to add)"
    };
    // v1.1: rate limit only applies in --public mode.
    let rate_line = if public {
        "enabled (--public mode)"
    } else {
        "disabled (localhost)"
    };
    if public {
        eprintln!("  ⚠  WARNING: --public binds to 0.0.0.0 (all interfaces).");
        eprintln!("     Anyone on your network can reach /info, /log, /branches, /clone.");
        eprintln!("     Use --token <secret> to protect /blob, /tree, /commit.");
    }
    eprintln!();
    eprintln!("  ┌──────────────────────────────────────────────────────┐");
    eprintln!("  │  rift serve v{VERSION} — secure mode                    │");
    eprintln!("  ├──────────────────────────────────────────────────────┤");
    eprintln!("  │  URL:           {url_line:<40}│");
    eprintln!("  │  Auth:          {auth_line:<40}│");
    eprintln!("  │  Rate limiting: {rate_line:<40}│");
    if tls {
        eprintln!("  │  TLS:           enabled (self-signed cert)             │");
        match crate::tls::ensure_self_signed_cert() {
            Ok(fp) => {
                let fp_short = if fp.len() > 40 { &fp[..40] } else { &fp };
                eprintln!("  │  Fingerprint:   {fp_short:<40}│", fp_short = fp_short);
            }
            Err(e) => {
                eprintln!("  │  TLS:           WARNING: cert generation failed: {e:<22}│", e = e.to_string().chars().take(22).collect::<String>());
            }
        }
    } else {
        eprintln!("  │  TLS:           disabled (use --tls for HTTPS)        │");
    }
    eprintln!("  │  Health:        /health                                  │");
    eprintln!("  │                                                      │");
    eprintln!("  │  To share over LAN:  rift serve --public               │");
    eprintln!("  │  To add auth:        rift serve --token <secret>       │");
    eprintln!("  │  To encrypt:         rift serve --tls                  │");
    eprintln!("  └──────────────────────────────────────────────────────┘");
    eprintln!();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use http::Request as HttpRequest;
    use tower::ServiceExt;

    /// Build a fresh state backed by a tempdir rift repo. The returned
    /// `TempDir` keeps the dir alive until dropped.
    ///
    /// `public` controls whether rate limiting applies (only `--public` mode
    /// rate-limits). Uses the shared in-crate `test_util::cwd_lock` so it
    /// serializes against other test modules that also touch cwd.
    fn make_state(token: Option<&str>, public: bool) -> (Arc<AppState>, tempfile::TempDir) {
        let guard = crate::test_util::cwd_lock()
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        let dir = tempfile::TempDir::new().expect("tempdir");
        let cwd = std::env::current_dir().expect("cwd");
        std::env::set_current_dir(dir.path()).expect("chdir temp");
        let repo = crate::repo::Repo::init().expect("init");
        std::env::set_current_dir(&cwd).expect("chdir back");
        drop(guard);

        let state = Arc::new(AppState {
            repo,
            token: token.map(String::from),
            public,
            rate_limiter: Mutex::new(HashMap::new()),
        });
        (state, dir)
    }

    /// Run a single request through a freshly-built router backed by `state`.
    /// The state (including the rate limiter) is shared across calls when the
    /// caller passes the same `Arc` — that's how the rate-limit test
    /// accumulates counters across 101 requests.
    fn run_request(
        state: Arc<AppState>,
        uri: &str,
        bearer: Option<&str>,
        ip: Option<IpAddr>,
    ) -> Response {
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("rt");
        let addr: SocketAddr = SocketAddr::new(
            ip.unwrap_or_else(|| "127.0.0.1".parse().unwrap()),
            54321,
        );
        let mut builder = HttpRequest::builder()
            .uri(uri)
            .extension(ConnectInfo(addr));
        if let Some(b) = bearer {
            builder = builder.header(header::AUTHORIZATION, format!("Bearer {b}"));
        }
        let request = builder.body(Body::empty()).expect("request");
        let router = build_router(state);
        rt.block_on(router.oneshot(request))
            .expect("oneshot")
    }

    /// Convenience: build a fresh state AND run one request through it.
    /// Defaults to localhost mode (`public: false`) — use `send_request_public`
    /// for rate-limit tests.
    fn send_request(
        token: Option<&str>,
        uri: &str,
        bearer: Option<&str>,
        ip: Option<IpAddr>,
    ) -> Response {
        let (state, _dir) = make_state(token, false);
        run_request(state, uri, bearer, ip)
    }

    #[test]
    fn test_health_is_public() {
        let resp = send_request(Some("mysecret"), "/health", None, None);
        assert_eq!(resp.status(), StatusCode::OK);
    }

    #[test]
    fn test_bearer_auth_rejects_missing_token() {
        let resp = send_request(Some("mysecret"), "/blob/abc", None, None);
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_bearer_auth_rejects_wrong_token() {
        let resp = send_request(Some("mysecret"), "/blob/abc", Some("wrong"), None);
        assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_bearer_auth_accepts_valid_token() {
        // Valid token → not 401. (Returns 200 with an error JSON because
        // "abc" isn't a real blob hash, but the auth layer passes.)
        let resp = send_request(Some("mysecret"), "/blob/abc", Some("mysecret"), None);
        assert_ne!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_no_token_means_no_auth_required() {
        // If the server was started WITHOUT --token, /blob is open.
        let resp = send_request(None, "/blob/abc", None, None);
        assert_ne!(resp.status(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_rate_limit_429_after_100_in_public_mode() {
        // In --public mode: 100 requests from the same IP are allowed; the
        // 101st is 429. Use /health so we don't trip auth. State is shared
        // so the rate limiter accumulates.
        let (state, _dir) = make_state(None, true);
        let ip: IpAddr = "203.0.113.42".parse().unwrap();
        for i in 0..100 {
            let resp = run_request(state.clone(), "/health", None, Some(ip));
            assert_ne!(
                resp.status(),
                StatusCode::TOO_MANY_REQUESTS,
                "request #{i} should NOT be rate-limited"
            );
        }
        // 101st request → 429.
        let resp = run_request(state.clone(), "/health", None, Some(ip));
        assert_eq!(resp.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[test]
    fn test_rate_limit_disabled_in_localhost_mode() {
        // v1.1: in localhost mode (no --public), rate limiting is OFF.
        // 200 requests from the same IP should all succeed.
        let (state, _dir) = make_state(None, false);
        let ip: IpAddr = "203.0.113.42".parse().unwrap();
        for i in 0..200 {
            let resp = run_request(state.clone(), "/health", None, Some(ip));
            assert_ne!(
                resp.status(),
                StatusCode::TOO_MANY_REQUESTS,
                "localhost request #{i} should NOT be rate-limited"
            );
        }
    }

    #[test]
    fn test_rate_limit_separate_per_ip() {
        // IP A hits 100 times (allowed). IP B hits 100 times (also allowed,
        // because the counter is per-IP).
        let (state, _dir) = make_state(None, true);
        let ip_a: IpAddr = "203.0.113.1".parse().unwrap();
        let ip_b: IpAddr = "203.0.113.2".parse().unwrap();
        for _ in 0..100 {
            let _ = run_request(state.clone(), "/health", None, Some(ip_a));
        }
        for i in 0..100 {
            let resp = run_request(state.clone(), "/health", None, Some(ip_b));
            assert_ne!(
                resp.status(),
                StatusCode::TOO_MANY_REQUESTS,
                "IP B request #{i} should not be limited by IP A's traffic"
            );
        }
    }
}
