---
name: Bug report
about: Something in Rift is broken or behaves wrong
title: "[bug] "
labels: bug
assignees: ''
---

## Environment

- **Rift version**: <!-- run `rift --version` and paste here -->
- **OS**: <!-- Linux / macOS / Windows, and distro/version if relevant (e.g. Ubuntu 22.04, macOS 14.2, Windows 11) -->
- **Rust toolchain** (if you built from source): <!-- `rustc --version` -->

## What you did

<!-- Steps to reproduce. Include the exact commands you ran. -->

```bash
rift ...
```

## What happened

<!-- The actual behavior. Paste the error message, the bad output, or describe
the crash. Attach a backtrace if Rift panicked (`RUST_BACKTRACE=1 rift ...`). -->

```
<paste output here>
```

## What you expected

<!-- The behavior you expected instead. -->

## Repro repo (optional)

<!-- If the bug needs a repo to reproduce, paste a small script that builds one:

```bash
mkdir /tmp/repro && cd /tmp/repro
rift init
echo hello > file.txt
rift save -m "add file"
rift ...
```
-->

## Extra context

<!-- Anything else. Logs from `rift serve`, `~/.config/rift/` files (redact
tokens!), unusual filesystem (NFS, WSL2, tmpfs), etc. -->
