# Contributing to Rift

Thanks for wanting to help. This file is short on purpose. Read it, then
go look at the code.

## Build

You need Rust 1.70+ (stable) and a C compiler (for the `ring` crate).

```bash
git clone https://github.com/Saff9/rift.git
cd rift
cargo build --release
./target/release/rift --help
```

First build is slow (~30 seconds) because of BLAKE3 and ring. After
that, incremental builds are fast.

## Tests

```bash
cargo test --release
```

21 tests as of v1.0. Most are in `src/auth.rs` and `src/serve.rs`
because those modules are where the security guarantees live. The rest
of the codebase is exercised by manual end-to-end runs documented in
the worklog.

If you add a feature, add a test. If you fix a bug, add a test that
would have caught it.

## Lint

We run clippy at `clippy::pedantic`. The CI build fails on warnings.

```bash
cargo clippy --release -- -D warnings
```

If pedantic complains about something stylistic and the fix would hurt
readability, add an `#[allow(...)]` at the call site. Don't disable the
lint globally. The `lib.rs` already has a list of allows for things
we've decided are stylistic. Add to it only if you have a real reason.

## Code style

- **No `unwrap` in library code.** Use `?`. Use `.unwrap_or_default()`
  if there's a sensible default. The CLI can panic with a clear
  message, but the library must always return a `Result`.
- **`anyhow` for the CLI, `thiserror` for the library.** Library
  functions return `Result<T, RiftError>`. The CLI uses `anyhow::Result`
  for top-level reporting. `From<RiftError> for anyhow::Error` is
  derived automatically by thiserror, so `?` works across the boundary.
- **Doc comments on every public item.** `cargo doc --no-deps` should
  produce useful output. Include `# Errors` and `# Panics` sections
  where applicable.
- **Parallel by default.** Anything that walks files or processes
  multiple objects should use `rayon`. `par_iter` is the default. Don't
  add new sequential loops for things that could be parallel.
- **`--json` on every command.** If you add a command, it must support
  `--json`. Mirror the existing JSON shapes. Stable field names matter
  more than perfect structure.

## Architecture

The crate has 11 modules. The dependency graph is roughly:

```
bin/main.rs  (CLI dispatch, clap)
   │
   ▼
repo.rs  (Repo: every command as a method)
   │
   ├── chunk.rs      (ChunkStore: pack file + binary index)
   ├── objects.rs    (Tree, Commit, Store trait)
   ├── oplog.rs      (JSONL append-only audit log)
   ├── diff.rs       (LCS-based unified diff)
   ├── ignore.rs     (.gitignore-style pattern matching)
   ├── git_bridge.rs (push/pull/clone via temp git repo)
   ├── serve.rs      (axum HTTP server, auth, rate limit)
   ├── watch.rs      (notify-debouncer-mini auto-snapshot)
   ├── auth.rs       (AES-256-GCM credential store)
   └── error.rs      (RiftError, thiserror)
```

`repo.rs` is the brain. Every command is a method on `Repo`. If you're
adding a command, you're adding a method to `Repo` and a match arm in
`bin/main.rs`. That's it.

`chunk.rs` is the storage layer. One `pack.dat` file holds every
object. A binary `pack.idx` indexes it. The write path is lock-free
(`AtomicU64` + `pwrite`), the read path is in-memory cache first. If
you're touching storage, read `docs/DESIGN.md` first.

`serve.rs` and `auth.rs` are the security boundary. If you're touching
either, think hard about what an attacker could do. Tokens must never
appear in logs. URLs are passed through `redact_url()` before any
`eprintln!`.

## Where to add tests

- **Auth changes** - in `src/auth.rs`, near the existing 4 tests. Cover
  the roundtrip, the wrong-key case, and the migration path.
- **Serve changes** - in `src/serve.rs`, near the existing 6 tests. Use
  `tower::ServiceExt::oneshot` to exercise the router without binding a
  port. Cover both auth-required and auth-not-required paths.
- **Storage changes** - in `src/chunk.rs`. Use `tempfile` to make a
  temp dir. Roundtrip a blob, verify the index, verify dedup.
- **New commands** - in `tests/` as integration tests if they touch
  multiple modules, or as unit tests in `repo.rs` if they're local
  logic.

## PR checklist

Before you open a PR:

- [ ] `cargo build --release` is clean (0 warnings).
- [ ] `cargo clippy --release -- -D warnings` is clean.
- [ ] `cargo test --release` passes.
- [ ] You added a test for the new behavior or the bug fix.
- [ ] You added a doc comment to every new public item.
- [ ] If you added a CLI command, it supports `--json`.
- [ ] You updated `CHANGELOG.md` under an "Unreleased" section.
- [ ] No secrets, tokens, or credentials in the diff.
- [ ] No `unwrap()` or `expect()` added to library code.

Keep PRs small. One feature or one fix per PR. Big multi-change PRs get
stuck in review forever.

## Building the Windows MSI locally

The Windows installer is built by `cargo-wix` (a cargo subcommand,
not a Rust library). It's already wired into the release workflow
on CI. To test it locally on a Windows machine:

```powershell
cargo install cargo-wix --locked
cargo build --release
cargo wix
# Output: target\wix\rift-vcs-<version>-x86_64.msi
```

The template lives at `wix/main.wxs`. The license agreement text
shown in the installer comes from `wix/license.rtf`, which is a
regenerated RTF copy of the top-level `LICENSE` file. If you change
the license text, regenerate `license.rtf` (see
`docs/PUBLISHING.md`).

For the full publish-to-crates.io runbook (account, API token,
`cargo login`, version bumping, yanking), see
[docs/PUBLISHING.md](docs/PUBLISHING.md).

## Style notes

We don't have a formatter beyond `rustfmt`. Run `cargo fmt` before
committing. Don't reformat code you're not touching.

We do not accept AI-generated documentation that says things like
"leveraging" or "seamless" or "comprehensive". Write like a human
explaining to a coworker. If you can't explain why a change is good in
two plain sentences, the change probably isn't ready.

## Code of conduct

Be respectful. Be honest. Don't be a jerk. No AI-generated fluff in
docs or code.
