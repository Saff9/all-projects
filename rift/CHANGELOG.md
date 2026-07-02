# Changelog

## v1.2.0 (2026-11-04)

The production release. Everything from v1.1 plus TLS, SSH keys, and
distribution-ready packaging.

### Added

- **TLS for rift-protocol.** `rift serve --tls` generates a
  self-signed certificate (rcgen) and serves over HTTPS. The cert
  fingerprint (BLAKE3 of the DER) is printed in the banner.
  `rift clone https://host:port --accept-fingerprint <hash>` verifies
  the cert via TOFU (trust on first use, same model as SSH). Cert and
  key live in `~/.config/rift/cert.pem` and `key.pem` (0600).
- **SSH key authentication.** `rift auth add-key github.com --key
  ~/.ssh/id_ed25519` stores an SSH private key encrypted with the same
  AES-256-GCM master key as PATs. Stored at
  `~/.config/rift/ssh_keys/<host>.enc` (0600). Future `git@host:...`
  URLs use the key automatically (via `GIT_SSH_COMMAND` with a temp
  file that's zeroized after use). `rift auth keys` lists, `rift auth
  remove-key` removes.
- **`rift bench` CLI command.** Replaces the old GUI benchmark panel.
  Creates 80 test files, times rift vs git on 6 metrics (binary size,
  cold commit, incremental commit, status, log, storage), prints a
  table. Read-only commands run 3 times with the min.
- **crates.io publish-ready.** Package renamed to `rift-vcs` (binary
  stays `rift`). All metadata added. `cargo publish --dry-run` passes.
  See `docs/PUBLISHING.md`.
- **Windows MSI installer.** WiX template at `wix/main.wxs`. GitHub
  Actions `release.yml` builds for linux-x86_64, linux-aarch64,
  macos-x86_64, macos-aarch64, and windows-x86_64 (MSI).
- **install.sh script.** `curl -fsSL https://raw.githubusercontent.com/Saff9/rift/main/scripts/install.sh | sh`
  detects OS/arch, downloads the binary, installs to `/usr/local/bin`
  or `~/.local/bin`.

### Changed

- **`rift clone` now routes automatically.** HTTP(S) URLs with a port
  or no `.git` suffix go to the rift-protocol cloner. Otherwise it's
  git clone. No user input needed.
- **Rate limiting only on `--public`.** Localhost serve mode (the
  default) has no rate limit. You're the only user. `--public` enables
  the 100 req/60s limiter for DOS protection from the network.
- **Binary size: 2,778 KB** (was 2,221 KB in v1.0). The increase is
  from `rustls` + `rcgen` (TLS) and the bench module. Still 1.4x
  smaller than git (3,987 KB).

### Fixed

- **Serve route syntax bug.** v1.0 used axum 0.8 `{hash}` syntax but
  the project pins axum 0.7. All `/blob`, `/tree`, `/commit` routes
  silently returned 404. Fixed to axum 0.7 `:hash` syntax.
- **`/blob` endpoint returns base64.** Was lossy UTF-8, which corrupted
  binary files during rift-protocol clone. Now base64-encoded.
- **Icon was JPEG.** The image generator returned a JPEG with a `.png`
  extension. Converted to real PNG via PIL.

## v1.1.0 (2026-11-04)

The collaboration release. Rift can now clone directly from a `rift
serve` instance over HTTP, no git involved.

### Added

- **`rift clone http://host:port`.** Clones a repo directly from a
  `rift serve` instance. Fetches `/clone` manifest, then `/commit`,
  `/tree`, `/blob` for each file. The peer-to-peer collaboration path.
  Auth: if the server returns 401, retries with `Authorization: Bearer
  $RIFT_TOKEN`.
- **`rift bench` CLI command.** Replaces the GUI benchmark panel
  (which was removed). Times rift vs git on 6 metrics.

### Changed

- **Rate limit only on `--public`.** Localhost serve has no rate limit.
- **Dead-code cleanup.** `cargo clippy --release -D warnings -W
  dead_code` is clean.

## v1.0.0 (2026-11-04)

The security release. Rift was usable before. Now it's safe to put
real credentials in.

### Added

- **Encrypted credentials at rest.** Every Personal Access Token stored
  with `rift auth login` is encrypted with AES-256-GCM before it hits
  disk. The 32-byte master key lives in `~/.config/rift/master.key`
  with 0600 perms. Plaintext tokens never touch disk after v1.0 saves
  them. Legacy v0.9 plaintext files auto-migrate on first load. The
  `Credential` struct implements `Zeroize`, so tokens get wiped from
  memory when they go out of scope.
- **Secure `rift serve`.** Binds to `127.0.0.1` (localhost only) by
  default. New `--public` flag binds `0.0.0.0` and prints a warning.
  New `--token <bearer>` flag protects `/blob`, `/tree`, `/commit`
  with `Authorization: Bearer <token>`. Public endpoints (`/health`,
  `/info`, `/log`, `/branches`, `/clone`) stay open for monitoring.
  Per-IP rate limit (100 req / 60 s, then 429). CORS `*` header. 1 MB
  request body limit. New `/health` endpoint returns
  `{"status":"ok","version":"1.0.0"}`.
- **`redact_url` helper.** Every URL that might contain a token goes
  through `redact_url` before it hits any log line. Token is replaced
  with `***@`. No more "my PAT leaked into a CI log" accidents.
- **Typed library errors.** New `RiftError` enum (thiserror) with
  `Io`, `Crypto`, `NotFound`, `Auth`, `Parse`, `Other` variants. Used
  by `auth.rs`, `chunk.rs`, `objects.rs`. The CLI keeps `anyhow` for
  top-level reporting; the blanket `From<RiftError> for anyhow::Error`
  means `?` works across the boundary.
- **21 unit tests.** Was 11 in v0.9. The new 10 cover the auth
  encryption roundtrip, wrong-key rejection, on-disk encryption
  verification, plaintext migration, bearer auth accept/reject on
  serve, rate limit, and public health endpoint.
- **`rift bench` command.** Runs the standard 6-metric benchmark
  (binary, cold commit, incremental commit, status, log, storage)
  against rift and git in a temp dir. Prints a table. Documented in
  `docs/BENCHMARK.md`.

### Changed

- **`clippy::pedantic` is clean.** Set in `lib.rs` with a curated list
  of `#![allow]` for stylistic lints we disagree with. CI fails on
  warnings. The list of allows is small and each one is justified.
- **Doc comments on every public item.** `cargo doc --no-deps` produces
  useful output. `# Errors` and `# Panics` sections where applicable.
- **Binary is 2,221 KB.** Up from 2,105 KB in v0.9 because of the
  crypto dependencies (aes-gcm, ring, zeroize, thiserror). Still 1.8x
  smaller than git's 3,987 KB.
- **`src/serve.rs` grew from 86 to 463 lines.** Most of the growth is
  the auth middleware, rate limiter, banner, and tests.
- **`src/auth.rs` grew from 211 to 540 lines.** Most of the growth is
  the AES-256-GCM encryption path, the legacy migration, and tests.

### Fixed

- **Tokens no longer appear in logs.** Every error message in
  `git_bridge.rs` now goes through `redact_url` before `eprintln!`.
- **Serve no longer binds 0.0.0.0 by default.** Was a real footgun.
  Now you have to opt in with `--public`.
- **Credentials file is created with 0600 perms.** v0.9 created it
  with default umask, which could be 0644 on some systems. Fixed.

### Migration from v0.9

You don't need to do anything. On first `rift auth` call in v1.0,
the loader detects the `sealed: false` flag on the legacy credentials
file, encrypts every token, and rewrites the file with `sealed: true`.
Your existing repos and credentials carry over.

The `serve` command's default bind changed from `0.0.0.0` to
`127.0.0.1`. If you were relying on the old behavior, add `--public`
to your serve command.

### Known issues

- **No SSH auth.** Only HTTPS with PATs. SSH support is planned.
- **No `rift gc`.** Orphaned bytes from duplicate writes accumulate
  in the pack file. Not a problem in practice (orphans are small), but
  worth knowing.
- **No partial clone.** `rift clone` downloads the whole pack. For
  huge repos, this is a lot of data. Partial clone is planned.

---

## v0.9.0 (2026-10-28)

Auth, clone, serve URL, proper gitignore, E2E tests. See the worklog
for the full story.

## v0.8.0 (2026-10-21)

Senior rewrite. Pack-file storage for all objects, binary pack index,
JSONL oplog, clap CLI, wired serve and watch. The release where rift
stopped being a prototype and started being a real tool.

## v0.7.0 (2026-10-17)

Pack-file storage for blobs only. First storage win vs git (3.7x
binary, 8.4x storage on 100 files).

## v0.6.0 (2026-10-17)

`verify`, `timeline`, `compress`, `migrate` commands. mtime-based
change detection.

## v0.5.0 (2026-10-17)

Compressed chunk storage. In-memory blob cache. `revert`, `grep`,
`clean`, `blame`. Proper gitignore support. Parallel status and diff.

## v0.4.0 (2026-10-17)

Git interop (`push`, `pull`, `remote`). Rayon parallel hashing.

## v0.3.0 (2026-10-17)

Stripped binary (639 KB). Hand-rolled arg parsing.

## v0.2.0 (2026-10-17)

3-way merge, stash, rebase, cherry-pick, tags, clone (rift-to-rift),
undo, operation log, auto-snapshot (watch), built-in HTTP serve, stats,
`--json` on every command.

## v0.1.0 (2026-10-17)

init, save, status, log, diff, branch, checkout, merge. BLAKE3.
Chunked blob storage (8 KB chunks with dedup). LCS-based unified diff.

The first commit. Three hundred lines of Rust, a single pack file,
and a stubborn belief that git could be smaller.
