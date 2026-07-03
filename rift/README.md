# Rift

<div align="center">

```
  ╱╲
 ╱  ╲   rift
╱╱╱╱╲╲
╲╱╱╱╱╱   fast version control
 ╲╱╱╱
  ╲╱
```

A version control system written in Rust. It does what git does
(commits, branches, merges, push, pull) but with a smaller binary, smaller
storage, and an actual undo button.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org)

</div>

## What is Rift

Rift is a content-addressed VCS written in Rust. You run `rift init`, edit
files, `rift save`, and you have commits. There's no staging area. Every
object goes into one append-only pack file addressed by BLAKE3. You can
push to and pull from git remotes (GitHub, GitLab, anything that speaks
git) without leaving rift.

## Why

We started rift because git is bigger and slower than it needs to be for
personal work, and there's no undo. Concrete reasons:

- **Smaller binary.** ~2.2 MB vs git's ~3.9 MB. Statically linked, stripped.
- **Smaller storage.** One pack file for every object. Git stores each
  object as its own file, which means thousands of 4 KB filesystem blocks
  for a repo with a few thousand files. We measured 4x smaller on a 57K-file
  repo (241 MB vs 959 MB).
- **Real undo.** `rift undo` reverses save, checkout, merge, rebase,
  cherry-pick. Git has reflog, which is hidden and easy to misuse.
- **Git interop.** Push and pull work against any git remote. You don't
  have to pick a side.
- **`--json` on every command.** Scripting is a first-class use case.

## Install

See [INSTALL.md](INSTALL.md) for the full list. Short version:

```bash
curl -fsSL https://raw.githubusercontent.com/Saff9/rift/main/scripts/install.sh | sh
```

(curl install is the plan. Today, build from source or `cargo install
--path .` from a clone. See [INSTALL.md](INSTALL.md).)

## Quick start

```bash
$ rift init
Initialized rift in /home/me/project/.rift

$ echo "hello world" > README.md
$ rift save -m "first commit"
[9f4a7c1] first commit

$ rift log
[9f4a7c1] first commit (2026-11-04 14:02)

$ echo "hello world, again" >> README.md
$ rift status
On branch main
  ~ README.md

$ rift undo
Restored to previous state.

$ rift serve --port 3030
┌─ rift serve ────────────────────────────────┐
│  http://127.0.0.1:3030                       │
│  auth: off     bind: localhost               │
└──────────────────────────────────────────────┘
```

## What works

31 commands. Grouped so you can see the shape of the thing.

**Day-to-day:** `init`, `save` (alias: `commit`), `status`, `log`, `diff`,
`show`, `grep`, `blame`.

**Branching:** `branch`, `checkout` (alias: `switch`), `merge`, `rebase`,
`cherry-pick`, `revert`, `tag`.

**Stash:** `stash save`, `stash pop`, `stash list`, `stash drop`.

**History and undo:** `undo`, `history`, `timeline`, `verify`, `stats`,
`compress`, `clean`.

**Git interop:** `clone`, `remote add`, `remote list`, `push`, `pull`,
`migrate`.

**Self-hosting:** `serve --port N [--public] [--token SECRET] [--tls]`,
`watch`.

**Auth:** `auth login` (PAT), `auth add-key` (SSH key), `auth list`,
`auth keys`, `auth logout`, `auth remove-key`, `auth show`.

**Benchmarking:** `bench` (runs rift vs git, prints a table).

Every command takes `--json`. Run `rift --help` for the full reference.

## How it's different from git

| Feature | Rift | Git |
|---------|------|-----|
| Binary size | 2.8 MB | 3.9 MB |
| Object storage | one pack file | one file per object |
| Staging area | no | yes |
| Undo | yes (any operation) | no (reflog, hidden) |
| Operation log | yes (every command logged) | no |
| Auto-snapshot | yes (`rift watch`) | no |
| `--json` on every command | yes | no |
| Push/pull to GitHub | yes (via git bridge) | yes |
| Speed (cold commit, 80 files) | ~8 ms | ~7 ms |
| Speed (status, 500 files) | ~3 ms | ~3 ms |
| Storage (57K files, real repo) | 241 MB | 959 MB |
| Mature ecosystem | no | yes |

## Self-hosting with `rift serve`

`rift serve` runs a small HTTP server on top of your repo. Other people
can clone from you without GitHub. Useful for pair work behind a VPN.

```bash
# localhost only (default)
rift serve --port 3030

# bind 0.0.0.0 (prints a warning)
rift serve --port 3030 --public

# require a bearer token on /blob, /tree, /commit
rift serve --port 3030 --token hunter2
```

Endpoints:

- `GET /health` - public, returns `{"status":"ok","version":"1.0.0"}`
- `GET /info` - public, repo summary
- `GET /log` - public, commit log
- `GET /branches` - public, branch list
- `GET /clone` - public, full repo bundle for `rift clone`
- `GET /blob/{hash}` - protected if `--token` set
- `GET /tree/{hash}` - protected if `--token` set
- `GET /commit/{hash}` - protected if `--token` set

Rate limit is 100 requests per 60 seconds per IP. Over that you get 429.

## Auth

`rift auth login` stores a Personal Access Token for a host. Tokens are
encrypted at rest with AES-256-GCM. The master key lives in
`~/.config/rift/master.key` (0600). When you push, pull, or clone a
private repo, rift injects the token into the URL automatically.

```bash
$ rift auth login github.com --token ghp_xxxx
Saved credential for github.com

$ rift auth list
github.com    ghp_••••••••••••    (2026-11-04 14:08)

$ rift clone https://github.com/me/private-repo.git
Cloning into private-repo...
Done. 1,204 files, 18 MB.
```

The `Credential` struct implements `Zeroize`, so the plaintext token is
wiped from memory when it goes out of scope. URLs are redacted with
`***@` before they hit any log line.

## Status

This is v1.0. It works. It's not as battle-tested as git.

We've used it for personal projects, for cloning real-world repos (the
57K-file openclaw test), and for the development of rift itself. We have
21 unit tests, clean clippy under `clippy::pedantic`, and verified
end-to-end behavior. We have not run it inside a Fortune 500 CI pipeline.

Use rift for personal projects, side projects, and experiments. Don't
bet your company's main repo on it yet. If you do try it and find bugs,
file them. We fix things fast.

## License

MIT. See [LICENSE](LICENSE).

## Contributing

Yes, please. See [CONTRIBUTING.md](CONTRIBUTING.md) for build steps,
code style, and where tests go. Keep PRs small and focused.
