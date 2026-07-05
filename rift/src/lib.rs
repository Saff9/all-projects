//! Rift v1.1 — fast VCS with undo, auto-snapshot, chunked dedup, git
//! interop, **encrypted credential storage**, a **secure-by-default
//! `serve` mode**, and **peer-to-peer collaboration via `rift clone` over
//! rift-protocol**. This is the collaboration release.
//!
//! v1.1 highlights (vs v1.0):
//! - **`rift clone http://host:port`** — clone a repo directly from a `rift
//!   serve` instance over rift-protocol (no git involved). The peer-to-peer
//!   collaboration path. Detects rift-protocol URLs (http(s):// + (no .git
//!   OR explicit port)) and routes to `rift_clone::clone` instead of
//!   `git_bridge::clone`. Auth: if the server returns 401, retries with
//!   `Authorization: Bearer $RIFT_TOKEN`.
//! - **Rate limit only on `--public`** — localhost serve mode (the default)
//!   skips the rate limiter entirely (you're the only user). `--public`
//!   enables the 100 req/60s per-IP limiter (DOS protection from the
//!   network). The serve banner now prints `Rate limiting: enabled
//!   (--public mode)` or `Rate limiting: disabled (localhost)`.
//! - **`rift bench`** CLI command — replaces the GUI benchmark panel.
//!   Creates a temp dir with 80 test files, times rift vs git on binary
//!   size, cold commit, incremental commit, status, log, storage, and
//!   prints a comparison table. CLI-only — does NOT require the Next.js
//!   frontend.
//! - **Dead-code cleanup** — `cargo clippy --release -- -D warnings -W
//!   dead_code` is clean.
//!
//! v1.0 highlights (retained):
//! - **Encrypted credentials at rest** — every PAT stored in
//!   `~/.config/rift/credentials` is encrypted with AES-256-GCM. The 32-byte
//!   master key lives in `~/.config/rift/master.key` (0600). Plaintext tokens
//!   never touch disk after the first v1.0 save. Legacy v0.9 files
//!   (`sealed: false`) auto-migrate on first load.
//! - **Secure `rift serve`** — binds to `127.0.0.1` (localhost only) by
//!   default. New `--public` flag binds `0.0.0.0` (shows a warning). New
//!   `--token <bearer>` flag protects sensitive endpoints (`/blob`, `/tree`,
//!   `/commit`) with `Authorization: Bearer <token>`. Per-IP rate limit
//!   (100 req / 60 s → 429) when `--public`. CORS `*` header. 1 MB request
//!   body limit. New public `/health` endpoint for monitoring.
//! - **Typed library errors** — new `RiftError` enum (thiserror) used by
//!   `auth.rs`, `chunk.rs`, `objects.rs`. The CLI keeps `anyhow` for
//!   top-level reporting.
//! - **`zeroize`** — secrets (`Credential::token`) are wiped from memory
//!   on drop.
//! - **`redact_url`** — replaces `token@` with `***@` in any logged URL,
//!   so error messages and `eprintln!` calls never leak tokens.
//! - All v0.9 features retained: pack-file storage, binary index, JSONL
//!   oplog, clap CLI, lock-free pwrite, mtime-aware save, clone, ignore.
//!
//! Unique features no other VCS has:
//! 1. `rift undo` — reverses any operation (git has no undo)
//! 2. `rift history` — full operation audit log
//! 3. `rift timeline` — visual timeline of commits + operations
//! 4. `rift verify` — checks repository integrity
//! 5. `rift migrate` / `rift clone` — import from git / clone a git URL
//! 6. `rift serve` / `rift watch` — built-in server + auto-snapshot
//! 7. `rift auth` — credential management with at-rest encryption
//! 8. `--json` on every command for AI/scripting

#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![allow(clippy::module_name_repetitions)] // e.g. ChunkStore is fine
#![allow(clippy::must_use_candidate)] // too noisy for a VCS
#![allow(clippy::missing_errors_doc)] // 28-command CLI; # Errors boilerplate is noise
#![allow(clippy::missing_panics_doc)] // same — panics are rare and obvious
#![allow(clippy::cast_possible_truncation)] // intentional casts (e.g. timestamps)
#![allow(clippy::cast_sign_loss)] // same
#![allow(clippy::cast_precision_loss)] // u64→f64 for ratios is fine
#![allow(clippy::similar_names)] // `h` vs `hash` is fine
#![allow(clippy::too_many_lines)] // some functions are long by design
#![allow(clippy::struct_excessive_bools)] // ServeOptions has 2 bools, fine
#![allow(clippy::doc_markdown)] // we don't escape every "GitHub" in prose
#![allow(clippy::items_after_statements)] // watch.rs has a local Handler struct
#![allow(clippy::many_single_char_names)] // diff loops use i/j/k
#![allow(clippy::uninlined_format_args)] // `format!("{}", x)` vs `format!("{x}")` is stylistic
#![allow(clippy::redundant_closure_for_method_calls)] // `.map(|e| e.ok())` vs `.map(Result::ok)` is stylistic
#![allow(clippy::format_push_string)] // `push_str(&format!(...))` is fine
#![allow(clippy::manual_let_else)] // `match` vs `let else` is stylistic
#![allow(clippy::manual_map)] // `match` vs `map` is stylistic
#![allow(clippy::option_option)] // `&Option<T>` vs `Option<&T>` would require API churn
#![allow(clippy::needless_pass_by_value)] // would require API changes
#![allow(clippy::single_match)] // single-arm match is sometimes clearer
#![allow(clippy::single_match_else)] // same with else branch
#![allow(clippy::match_same_arms)] // explicit is fine
#![allow(clippy::map_unwrap_or)] // map().unwrap_or_else() is readable
#![allow(clippy::unnecessary_map_or)] // map_or is not always clearer
#![allow(clippy::if_not_else)] // `if !x { ... } else { ... }` is sometimes clearer
#![allow(clippy::unnecessary_sort_by)] // sort_by is fine
#![allow(clippy::ref_option)] // would require API churn
#![allow(clippy::double_must_use)] // stylistic
#![allow(clippy::unnecessary_lazy_evaluations)] // stylistic
#![allow(clippy::semicolon_if_nothing_returned)] // stylistic
#![allow(clippy::lines_filter_map_ok)] // ours is well-behaved
#![allow(clippy::needless_range_loop)] // explicit index is sometimes clearer
#![allow(clippy::needless_borrows_for_generic_args)] // stylistic
#![allow(clippy::suspicious_open_options)] // false positive
#![allow(clippy::for_kv_map)] // we use the value sometimes
#![allow(clippy::unchecked_time_subtraction)] // we know it's safe

pub mod auth;
pub mod bench;
pub mod chunk;
pub mod diff;
pub mod error;
pub mod git_bridge;
pub mod ignore;
pub mod objects;
pub mod oplog;
pub mod repo;
pub mod rift_clone;
pub mod serve;
pub mod ssh_keys;
pub mod tls;
pub mod watch;

/// Test-only utilities shared across in-crate test modules.
///
/// The defining member is [`cwd_lock`]: a process-wide `Mutex<()>` that
/// serializes any test that needs to mutate the process cwd (because
/// `Repo::init()` and `Repo::find()` use `std::env::current_dir()`).
/// Without it, parallel tests in different `src/*.rs` modules would race
/// on the cwd and intermittently fail.
#[cfg(test)]
pub(crate) mod test_util {
    use std::sync::{Mutex, OnceLock};

    static CWD_LOCK: OnceLock<Mutex<()>> = OnceLock::new();

    /// Get the global cwd lock shared by every in-crate test module.
    /// Tests that touch `std::env::set_current_dir` should hold this lock
    /// for the duration of their cwd-mutating section.
    pub fn cwd_lock() -> &'static Mutex<()> {
        CWD_LOCK.get_or_init(|| Mutex::new(()))
    }
}
