//! Rift-protocol clone — clone a repo directly from `rift serve` without
//! involving git. This is the peer-to-peer collaboration path:
//!
//! ```text
//! # On machine A:
//! $ rift serve --public --port 3030
//!
//! # On machine B:
//! $ rift clone http://A:3030 --dest my-repo
//! ```
//!
//! ## How it works
//! 1. `GET /clone` → manifest `{head, log, branches}`
//! 2. `GET /commit/<head>` → commit JSON
//! 3. `GET /tree/<tree_hash>` → tree JSON
//! 4. For each `path → blob_hash` in the tree: `GET /blob/<hash>` → base64 bytes
//! 5. Write the bytes to `<dest>/<path>`
//! 6. `rift init` + `rift save` in `<dest>` to produce a fresh rift repo
//!
//! ## Auth
//! If the server returns 401 on any request, retry once with
//! `Authorization: Bearer <RIFT_TOKEN>` (env var). If still 401, error out
//! with a helpful hint.
//!
//! ## Limitations
//! - HTTP only (no TLS). For HTTPS rift URLs, the URL still routes here if
//!   it has a port (the TLS handshake will fail with a clear error).
//! - The `/blob` endpoint serves data base64-encoded (so binary files
//!   survive the round trip).

use crate::objects::{Commit, Tree};
use crate::repo::Repo;
use anyhow::{anyhow, bail, Result};
use base64::Engine;
use serde::Deserialize;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::time::Duration;

/// Default per-request timeout (connect + read).
const HTTP_TIMEOUT: Duration = Duration::from_secs(30);

/// Clone a rift repo from a `rift serve` URL.
///
/// `url` is the base URL, e.g. `http://host:port`. `dest` is the destination
/// directory (defaults to a name derived from host:port).
///
/// # Errors
/// Returns an error if the URL isn't a valid `http://host:port` form, the
/// server returns 401 and `RIFT_TOKEN` isn't set, the server returns a
/// non-200 status, the manifest/tree/blob/commit JSON is malformed, or the
/// destination directory already exists.
pub fn clone(url: &str, dest: Option<&str>) -> Result<String> {
    let (host, port, _scheme) = parse_rift_url(url)?;

    // Derive destination dir if not given.
    let dest_path = dest.map_or_else(
        || std::path::PathBuf::from(format!("rift-{host}-{port}")),
        std::path::PathBuf::from,
    );
    if dest_path.exists() {
        bail!(
            "destination '{}' already exists. Remove it or pass a different path.",
            dest_path.display()
        );
    }

    // Pull bearer token from env (if set) — used only if the server returns 401.
    let env_token = std::env::var("RIFT_TOKEN").ok().filter(|t| !t.is_empty());

    eprintln!("Cloning from rift://{host}:{port} …");

    // 1. Fetch manifest
    let manifest: CloneManifest = fetch_json(&host, port, "/clone", env_token.as_deref())?;
    let head = manifest
        .head
        .ok_or_else(|| anyhow!("server manifest has no head commit (empty repo?)"))?;

    // 2. Fetch HEAD commit
    let commit: Commit = fetch_json(
        &host,
        port,
        &format!("/commit/{head}"),
        env_token.as_deref(),
    )?;

    // 3. Fetch tree
    let tree: Tree = fetch_json(
        &host,
        port,
        &format!("/tree/{}", commit.tree),
        env_token.as_deref(),
    )?;

    // 4. Fetch all blobs IN PARALLEL using rayon, then write to dest.
    // The old code fetched one blob at a time (60K HTTP requests for the
    // Linux kernel). Parallel fetching cuts wall time dramatically.
    std::fs::create_dir_all(&dest_path)?;
    let entries: Vec<(String, String)> = tree.entries.into_iter().collect();
    let total = entries.len();

    use rayon::prelude::*;
    let fetched: Vec<(String, Vec<u8>)> = entries
        .par_iter()
        .filter_map(|(path, blob_hash)| {
            let blob: BlobResponse = fetch_json(
                &host,
                port,
                &format!("/blob/{blob_hash}"),
                env_token.as_deref(),
            )
            .ok()?;
            let data = if blob.encoding.as_deref() == Some("base64") {
                base64::engine::general_purpose::STANDARD
                    .decode(&blob.data)
                    .ok()?
            } else {
                blob.data.into_bytes()
            };
            Some((path.clone(), data))
        })
        .collect();

    let mut count = 0usize;
    for (path, data) in &fetched {
        let dest_file = dest_path.join(path);
        if let Some(parent) = dest_file.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        std::fs::write(&dest_file, data)?;
        count += 1;
    }
    if count < total {
        eprintln!("warning: fetched {count}/{total} blobs (some failed)");
    }

    // 5. Init rift repo at dest, then save.
    let cwd = std::env::current_dir()?;
    let abs_dest = cwd.join(&dest_path);
    std::env::set_current_dir(&abs_dest)?;
    let repo = Repo::init()?;
    let msg = format!("Cloned from rift://{host}:{port} ({count} files)");
    repo.save(&msg)?;
    std::env::set_current_dir(&cwd)?;

    Ok(format!(
        "Cloned {count} files from rift://{host}:{port} into {}",
        dest_path.display()
    ))
}

/// Detect whether a URL is a rift-protocol URL (vs. a github/gitlab git URL).
///
/// Per the v1.1 spec: a URL is rift-protocol if it starts with `http://` or
/// `https://` AND (has no `.git` suffix OR has an explicit port number).
/// Otherwise it's a git URL and goes through `git_bridge::clone`.
#[must_use]
pub fn is_rift_protocol(url: &str) -> bool {
    let starts_http = url.starts_with("http://") || url.starts_with("https://");
    if !starts_http {
        return false;
    }
    let has_git_suffix = std::path::Path::new(url)
        .extension()
        .is_some_and(|ext| ext.eq_ignore_ascii_case("git"));
    let after_scheme = url.split("://").nth(1).unwrap_or("");
    let host_port = after_scheme.split(['/', '?', '#']).next().unwrap_or(after_scheme);
    let has_port = host_port
        .rsplit_once(':')
        .is_some_and(|(_, p)| p.parse::<u16>().is_ok());
    !has_git_suffix || has_port
}

// ---------- internals ----------

/// Parsed `/clone` manifest from the server.
#[derive(Debug, Deserialize)]
struct CloneManifest {
    head: Option<String>,
}

/// Parsed `/blob/<hash>` response.
#[derive(Debug, Deserialize)]
struct BlobResponse {
    /// The blob bytes, encoded per `encoding`.
    data: String,
    /// Encoding: `"base64"` (v1.1+) or absent (legacy lossy-UTF-8).
    encoding: Option<String>,
}

/// Parse a rift serve URL into (host, port, scheme). Accepts
/// `http://host:port` or `https://host:port` (with optional trailing path).
fn parse_rift_url(url: &str) -> Result<(String, u16, &'static str)> {
    let (scheme, rest) = url
        .strip_prefix("http://")
        .map(|r| ("http", r))
        .or_else(|| url.strip_prefix("https://").map(|r| ("https", r)))
        .ok_or_else(|| anyhow!("rift-protocol URL must start with http:// or https:// (got {url})"))?;
    let host_port = rest.split(['/', '?', '#']).next().unwrap_or(rest);
    let (host, port_str) = host_port.rsplit_once(':').ok_or_else(|| {
        anyhow!("rift-protocol URL must include :port (got {url}). Example: http://127.0.0.1:3030")
    })?;
    if host.is_empty() {
        bail!("empty host in URL: {url}");
    }
    let port: u16 = port_str
        .parse()
        .map_err(|_| anyhow!("invalid port '{port_str}' in URL: {url}"))?;
    Ok((host.to_string(), port, scheme))
}

/// Fetch a JSON endpoint. The first attempt is unauthenticated; if the
/// server returns 401 and a token is available, retry once with
/// `Authorization: Bearer <token>`.
fn fetch_json<T: serde::de::DeserializeOwned>(
    host: &str,
    port: u16,
    path: &str,
    token: Option<&str>,
) -> Result<T> {
    let resp = http_get(host, port, path, None)?;
    if resp.status == 401 {
        if let Some(t) = token {
            let resp2 = http_get(host, port, path, Some(t))?;
            if resp2.status == 401 {
                bail!("server rejected bearer token (401). Check RIFT_TOKEN.");
            }
            if resp2.status != 200 {
                bail!("server returned {} for {path} (with auth)", resp2.status);
            }
            return parse_json(&resp2.body);
        }
        bail!("server requires authentication (401). Set RIFT_TOKEN=<secret> and retry.");
    }
    if resp.status != 200 {
        bail!("server returned {} for {path}", resp.status);
    }
    parse_json(&resp.body)
}

/// Parse JSON body, with a helpful error message that includes a body preview.
fn parse_json<T: serde::de::DeserializeOwned>(body: &str) -> Result<T> {
    serde_json::from_str(body).map_err(|e| {
        let preview = body.chars().take(200).collect::<String>();
        anyhow!("parse JSON response: {e}\nbody preview: {preview}")
    })
}

/// A parsed HTTP response.
struct HttpResponse {
    status: u16,
    body: String,
}

/// Minimal HTTP/1.0 GET client over `std::net::TcpStream`. Sends
/// `Connection: close` so the server closes after responding, then reads
/// until EOF. If `bearer` is `Some`, sends `Authorization: Bearer <bearer>`.
fn http_get(host: &str, port: u16, path: &str, bearer: Option<&str>) -> Result<HttpResponse> {
    let mut stream = TcpStream::connect((host, port))
        .map_err(|e| anyhow!("connect to {host}:{port}: {e}"))?;
    stream.set_read_timeout(Some(HTTP_TIMEOUT))?;
    stream.set_write_timeout(Some(HTTP_TIMEOUT))?;

    let auth_line = bearer
        .map_or_else(String::new, |t| format!("Authorization: Bearer {t}\r\n"));
    let request = format!(
        "GET {path} HTTP/1.0\r\nHost: {host}\r\n{auth_line}Connection: close\r\n\r\n"
    );
    stream.write_all(request.as_bytes())?;

    // Read until EOF (Connection: close).
    let mut buf = Vec::new();
    stream.read_to_end(&mut buf)?;
    let response = String::from_utf8_lossy(&buf).into_owned();

    // Split headers + body at the first \r\n\r\n.
    let split_at = response
        .find("\r\n\r\n")
        .ok_or_else(|| anyhow!("malformed HTTP response: no header/body separator"))?;
    let headers = &response[..split_at];
    let body = &response[split_at + 4..];

    // Parse status code from the first line.
    let first_line = headers
        .lines()
        .next()
        .ok_or_else(|| anyhow!("malformed HTTP response: no status line"))?;
    let parts: Vec<&str> = first_line.splitn(3, ' ').collect();
    if parts.len() < 2 {
        bail!("malformed status line: {first_line}");
    }
    let status: u16 = parts[1]
        .parse()
        .map_err(|_| anyhow!("invalid status code: {}", parts[1]))?;

    // Handle chunked transfer encoding if present.
    let body = if headers.to_ascii_lowercase().contains("transfer-encoding: chunked") {
        decode_chunked(body)?
    } else {
        body.to_string()
    };

    Ok(HttpResponse { status, body })
}

/// Decode an HTTP/1.1 chunked-encoded body. Each chunk is
/// `<size in hex>\r\n<bytes>\r\n`. Terminated by a zero-size chunk.
fn decode_chunked(body: &str) -> Result<String> {
    let mut out = String::new();
    let bytes = body.as_bytes();
    let mut pos = 0usize;
    while pos < bytes.len() {
        let crlf = body[pos..]
            .find("\r\n")
            .ok_or_else(|| anyhow!("chunked: missing CRLF after size"))?;
        let size_str = body[pos..pos + crlf].trim();
        let size = usize::from_str_radix(size_str, 16)
            .map_err(|e| anyhow!("chunked: invalid size '{size_str}': {e}"))?;
        pos += crlf + 2;
        if size == 0 {
            break;
        }
        if pos + size > bytes.len() {
            bail!("chunked: chunk extends past body end");
        }
        out.push_str(&body[pos..pos + size]);
        pos += size + 2; // skip trailing \r\n
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_rift_protocol_http_with_port() {
        assert!(is_rift_protocol("http://127.0.0.1:3030"));
        assert!(is_rift_protocol("http://10.0.0.1:3030/"));
    }

    #[test]
    fn test_is_rift_protocol_https_with_port() {
        assert!(is_rift_protocol("https://my-host:8443"));
    }

    #[test]
    fn test_is_not_rift_protocol_when_git_suffix() {
        assert!(!is_rift_protocol("https://github.com/user/repo.git"));
        assert!(!is_rift_protocol("http://github.com/user/repo.git"));
    }

    #[test]
    fn test_is_rift_protocol_when_no_git_no_port() {
        // Per spec: no .git suffix → rift-protocol (even without a port).
        assert!(is_rift_protocol("https://github.com/user/repo"));
    }

    #[test]
    fn test_is_not_rift_protocol_for_ssh_or_other() {
        assert!(!is_rift_protocol("git@github.com:user/repo.git"));
        assert!(!is_rift_protocol("ssh://git@github.com/user/repo.git"));
        assert!(!is_rift_protocol("/local/path"));
    }

    #[test]
    fn test_parse_rift_url_http() {
        let (host, port, scheme) = parse_rift_url("http://127.0.0.1:3030").unwrap();
        assert_eq!(host, "127.0.0.1");
        assert_eq!(port, 3030);
        assert_eq!(scheme, "http");
    }

    #[test]
    fn test_parse_rift_url_with_path() {
        let (host, port, _) = parse_rift_url("http://example.com:8080/some/path").unwrap();
        assert_eq!(host, "example.com");
        assert_eq!(port, 8080);
    }

    #[test]
    fn test_parse_rift_url_rejects_no_port() {
        assert!(parse_rift_url("http://example.com").is_err());
    }

    #[test]
    fn test_parse_rift_url_rejects_non_http() {
        assert!(parse_rift_url("git@github.com:user/repo.git").is_err());
        assert!(parse_rift_url("ssh://git@github.com/user/repo.git").is_err());
    }

    #[test]
    fn test_decode_chunked_simple() {
        let body = "5\r\nhello\r\n0\r\n\r\n";
        let decoded = decode_chunked(body).unwrap();
        assert_eq!(decoded, "hello");
    }

    #[test]
    fn test_decode_chunked_multi() {
        let body = "3\r\nabc\r\n3\r\ndef\r\n0\r\n\r\n";
        let decoded = decode_chunked(body).unwrap();
        assert_eq!(decoded, "abcdef");
    }
}
