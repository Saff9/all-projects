# Rift: A Content-Addressed Version Control System with Pack-File Storage, Encrypted Credentials, and Peer-to-Peer Collaboration

**Version 1.3.0** | **Date: 2026-10-17** | **License: MIT**

## Abstract

Rift is a version control system written in Rust that stores all objects (blobs, trees, commits) in a single pack file with a binary index, rather than one file per object as git does. This design choice, combined with BLAKE3 content hashing, lock-free parallel writes, and mtime-aware incremental commits, results in a binary that is 1.4x smaller than git, status that is 1.4x faster on a 96,000-file repository (the Linux kernel), and storage that is competitive with git even on adversarial workloads. Rift also introduces features absent from git: a universal `undo` that reverses any operation, an operation audit log, encrypted-at-rest credential storage (AES-256-GCM), and peer-to-peer repository sharing via a built-in HTTP server. This paper describes the architecture, the benchmark methodology, and the tradeoffs.

## 1. Problem Statement

Git, the dominant version control system, has several properties that are suboptimal for modern hardware and workflows:

1. **Object storage granularity.** Git stores each object (blob, tree, commit) as an individual file in `.git/objects/`. On filesystems with 4KB block allocation, a 200-byte commit object consumes 4KB of disk. A repository with 100,000 objects wastes ~400MB to filesystem block overhead alone.

2. **Binary size.** The git executable on Linux is 3.9MB. This includes features most users never use (SVN bridge, HTTP smart protocol, credential helpers). For CI runners, Docker images, and embedded systems, every megabyte matters.

3. **No undo.** Git's reflog is an implementation detail, not a user-facing feature. Reverting a bad `merge` or `rebase` requires understanding reflog internals. Rift treats undo as a first-class operation.

4. **Credential storage.** Git stores credentials in plaintext helper files or OS keychain wrappers. Rift encrypts all credentials at rest with AES-256-GCM.

5. **Peer-to-peer collaboration.** Git requires a hosting service (GitHub, GitLab) or SSH access for collaboration. Rift includes a built-in HTTP server that lets any two machines share a repository directly, with TLS and bearer auth.

## 2. Design Goals

| Goal | Approach |
|------|----------|
| Small binary | Single static binary, LTO, strip, no dynamic linking |
| Small storage | One pack file for all objects, 8KB chunked dedup |
| Fast status/diff | mtime-aware change detection (O(changed), not O(all)) |
| Fast commits | Lock-free parallel writes (AtomicU64 + pwrite) |
| Undo | Append-only JSONL operation log, every command recorded |
| Security | AES-256-GCM encrypted credentials, zeroize on drop |
| P2P collaboration | Built-in HTTP server with TLS + bearer auth |
| Git interop | Export to git format for push/pull, import via migrate/clone |

### Non-goals

- Drop-in git replacement. Rift does not support the full git protocol.
- Hosting platform. Rift is a CLI tool, not a GitHub competitor.
- Merge algorithm parity. Rift's 3-way merge is simpler than git's.

## 3. Architecture

### 3.1 Storage Model

All rift objects live in a single file: `.rift/chunks/pack.dat`. The index lives in `.rift/chunks/pack.idx`. There is no `.rift/objects/` directory (unlike git's `.git/objects/`).

**Pack file format (`pack.dat`):** append-only sequence of compressed chunks. Each chunk is either:
- Raw: `0xFF` sentinel byte + uncompressed data (when compression doesn't shrink the data)
- Compressed: gzip stream (level 6, default)

**Index format (`pack.idx`):** binary, little-endian.

```
magic            : 8 bytes  = b"RIFTIDX1"
version          : u16 LE   (currently 1; future-proof)
padding          : 6 bytes  (zero)
entry_count      : u64 LE
total_referenced : u64 LE   (for dedup ratio)
entries[]        : 44 bytes each
    hash_bytes   : 32 bytes (raw BLAKE3)
    offset       : u64 LE  (byte offset in pack.dat)
    compressed_len: u32 LE
```

The version field (added in v1.3) allows future format changes with auto-migration. Old v1.0 indices (no version byte, 24-byte header) are auto-detected and migrated on next flush.

### 3.2 Content Addressing

Rift uses BLAKE3 (not SHA-1 as in git) for content addressing. BLAKE3 is:
- 5x faster than SHA-256 on modern CPUs (SIMD-parallel)
- Not vulnerable to the collision attacks that affected SHA-1
- Tree-structured, enabling parallel hashing of large blobs

### 3.3 Chunked Dedup

Each blob is split into 8KB chunks. Each chunk is independently hashed and stored. A manifest (JSON: `ChunkedBlob { chunks: [hash, ...], size }`) records the order. This means:

- Two files that share 90% of their content share 90% of their chunks.
- A 1GB file modified by 1 byte only stores 1 new 8KB chunk.

### 3.4 Lock-Free Parallel Writes

The key performance innovation in v1.0 was replacing mutex-serialized pack writes with lock-free parallel writes:

1. Compress the chunk (parallel-safe, no lock)
2. Quick dedup check under the index lock (microseconds)
3. Atomically claim a byte range in `pack.dat` via `AtomicU64::fetch_add` — no lock held
4. `pwrite` at the claimed offset — parallel-safe (disjoint regions)
5. Brief index lock to insert the `(hash → offset, len)` entry

If two threads race on the same hash, both claim space and both write (to disjoint offsets), but only one wins the index insert. The loser's bytes are orphaned in `pack.dat`. These orphans are reclaimed by `rift gc`.

### 3.5 mtime-Aware Incremental Save

`rift save` does not re-hash every file. It checks the mtime of each file against a cache from the last commit. Only files whose mtime changed are re-hashed and re-written. This makes `rift save` O(changed) for the common incremental case, not O(all files).

### 3.6 Atomic Writes (Crash Safety)

`flush()` writes the index atomically:
1. Write to `pack.idx.tmp`
2. `fsync` the temp file
3. `rename` to `pack.idx`

Also `fsync`s `pack.dat` before the index points to it. A crash at any point leaves the old files intact. Verified by `kill -9` mid-save testing.

### 3.7 Encrypted Credential Store

Personal Access Tokens (PATs) and SSH private keys are encrypted with AES-256-GCM before writing to disk:
- Master key: 32 random bytes from `OsRng` CSPRNG, stored in `~/.config/rift/master.key` (0600)
- Each token encrypted: `nonce[12] || ciphertext || tag[16]`, base64-encoded
- The `Credential` struct implements `Zeroize` — tokens are wiped from memory on drop
- `redact_url()` replaces `token@` with `***@` in all log output

### 3.8 Peer-to-Peer Collaboration

`rift serve` runs an HTTP server on top of the repository. Other users can clone via `rift clone http://host:port`. The clone fetches `/clone` (manifest), `/commit/<hash>`, `/tree/<hash>`, then all blobs in parallel via rayon.

Security:
- Binds to `127.0.0.1` by default (localhost only)
- `--public` flag binds `0.0.0.0` (with warning)
- `--token <secret>` requires `Authorization: Bearer <secret>` on `/blob`, `/tree`, `/commit`
- `--tls` generates a self-signed cert (rcgen), prints the fingerprint for TOFU verification
- Rate limiting (100 req/60s per IP) only on `--public` mode

### 3.9 Operation Log and Undo

Every rift command is appended to `.rift/oplog.jsonl` (one JSON object per line, O(1) append). Each entry records: command, args, branch_before, commit_before, commit_after, success. `rift undo` reads the last entry and reverses it.

## 4. Benchmark Methodology

All benchmarks run on the same machine. The `rift bench` command (built into the CLI) creates 80 test files, commits them with both rift and git, times each operation, and prints a table. Read-only commands (status, log) run 3 times with the minimum.

### 4.1 Standard Benchmark (80 files)

```
| Metric           |  Rift |   Git | Winner |  Ratio  |
|------------------|-------|-------|--------|---------|
| Binary size (KB) | 2,820 | 3,987 | Rift   |  1.4x   |
| Cold commit (ms) |   5.0 |    21 | Rift   |  4.2x   |
| Incremental (ms) |   3.0 |   7.0 | Rift   |  2.3x   |
| status (ms)      |   1.0 |   2.0 | Rift   |  2.0x   |
| log (ms)         |   1.0 |   1.0 | tie    |  1.0x   |
| Storage (KB)     |    45 |    51 | Rift   |  1.1x   |
```

Rift wins 5 of 6 metrics. The `log` metric is a tie because both are sub-millisecond (within spawn-overhead noise).

### 4.2 Linux Kernel Benchmark (96,000 files)

The real test. Cloned `torvalds/linux.git` (shallow, depth=1) and migrated to rift.

**Repository size:**
- git `.git`: 296 MB
- rift `.rift`: 391 MB

Rift is larger here. The Linux kernel has many binary files (device trees, firmware) that don't compress well in 8KB chunks, and the shallow clone means git has minimal history to store. On repositories with more text and more history, rift's pack file wins.

**Operation timing (96K files):**

| Operation | Rift | Git | Winner |
|-----------|------|-----|--------|
| status | 1,411 ms | 2,009 ms | **Rift 1.4x** |
| log | 171 ms | 4 ms | Git |
| diff | 1,107 ms | 167 ms | Git |
| verify/fsck | 8,702 ms | 9,539 ms | **Rift 1.1x** |
| gc | 3,131 ms | N/A | Rift only |

Rift's `status` is 1.4x faster than git's on the Linux kernel. This is because rift's mtime-aware change detection only re-hashes files whose mtime changed, while git re-stats every file.

Rift's `log` is slower (171ms vs 4ms) because rift's log walks the commit chain via pack file reads, while git's log reads from the packed refs directly. This is a known tradeoff of the pack-file-only design.

Rift's `diff` is slower (1107ms vs 167ms) for the same reason — it reads blobs from the pack file rather than from individual object files.

### 4.3 openclaw/openclaw Benchmark (57,000 files)

| Metric | Rift | Git |
|--------|------|-----|
| Files | 57,004 | 57,004 |
| Storage | 241 MB | 959 MB |
| Verify | 0 errors | N/A |
| Clone time | 64s | 43s |

Rift is 4x smaller on openclaw (241MB vs 959MB) because openclaw has more text files and more dedup opportunity. The clone is slower because rift clone goes through the git clone + migrate path (two steps) rather than git's single-step clone.

### 4.4 Storage Comparison Chart

```
Binary size (MB):
  Rift  ████████░░░░░░░░░░░░  2.8
  Git   ████████████████████  3.9

Storage on 80-file repo (KB):
  Rift  ██████████████████░░░  45
  Git   █████████████████████  51

Storage on openclaw (MB):
  Rift  ████████████░░░░░░░░  241
  Git   █████████████████████  959  (4x larger)

Storage on linux kernel (MB):
  Rift  █████████████████████  391
  Git   ████████████████░░░░░  296
```

## 5. Tradeoffs

### What rift gave up

1. **Git's ecosystem.** Rift can push to/pull from GitHub via git interop, but it's not git. Tools that parse `.git/` (GitHub Desktop, Tower, VS Code's git integration) don't work with rift.

2. **Log performance.** Rift's log walks the commit chain (O(n) pack reads). Git's log reads packed refs (O(1)). On the Linux kernel, rift log is 40x slower. For repos with long histories, this matters.

3. **Diff performance.** Rift reads blobs from the pack file. Git reads from individual object files (which the OS page cache handles efficiently). On the Linux kernel, rift diff is 6x slower.

4. **Merge sophistication.** Rift's 3-way merge is line-based and simple. Git's merge (recursive, ort) handles renames, directory moves, and complex histories.

5. **Pack file repacking.** Rift's gc rewrites the entire pack file (no incremental repacking). For large repos, gc takes seconds (3s on the Linux kernel). Git's gc is incremental and faster on large repos.

### What rift gained

1. **Smaller binary.** 2.8MB vs 3.9MB. Matters for containers, CI, embedded.
2. **Undo.** A real undo that works on any operation. Git has reflog (hidden, confusing).
3. **Encrypted credentials.** PATs and SSH keys encrypted at rest. Git stores them plaintext.
4. **P2P collaboration.** `rift serve` + `rift clone http://host:port`. No GitHub needed.
5. **Operation audit log.** Every command logged with full state for reversal.
6. **Simpler internals.** One pack file, one index. Git has loose objects, packed objects, pack indexes, multi-pack indexes, commit graphs, and more.

## 6. Future Work

1. **Pack file delta compression.** Currently each chunk is compressed independently. Storing deltas (like git's pack files) would improve ratio for repos with many similar files.
2. **Incremental gc.** Rewrite only the orphaned regions, not the whole pack file.
3. **Log cache.** Cache the commit chain in memory after first read.
4. **SSH protocol for serve.** Currently HTTP only. SSH would avoid the TLS cert management.
5. **Proper bisect.** The current `bisect` assumes linear history. A real bisect does binary search with user input.

## 7. Conclusion

Rift is a working version control system that is smaller, faster for status (the most common operation), and more secure than git for credential storage. It is not a git replacement — it's an alternative that makes different tradeoffs. For personal projects, small teams, and use cases where binary size, security, or P2P collaboration matter more than ecosystem compatibility, rift is a viable choice.

The code is MIT licensed, available at `https://github.com/Saff9/rift`, and installable via `cargo install rift-vcs` or `curl -fsSL https://raw.githubusercontent.com/Saff9/rift/main/scripts/install.sh | sh`.

## Appendix A: Command Reference

36 commands total: `init`, `save`, `status`, `log`, `diff`, `diff-commits`, `bisect`, `config`, `show`, `branch`, `checkout`, `merge`, `stash`, `rebase`, `cherry-pick`, `tag`, `undo`, `history`, `stats`, `revert`, `grep`, `clean`, `blame`, `verify`, `timeline`, `gc`, `migrate`, `clone`, `bench`, `auth` (login/add-key/list/keys/logout/remove-key/show), `remote`, `push`, `pull`, `serve`, `watch`.

## Appendix B: Reproducing the Benchmarks

```bash
# Install rift
cargo install --path .

# Run the standard benchmark (80 files)
rift bench

# Benchmark on the Linux kernel
git clone --depth 1 https://github.com/torvalds/linux.git
mkdir linux-rift && cd linux-rift
rift init
rift migrate ../linux
rift verify
rift stats --json
# Time operations
time rift status
time rift log
time rift verify
time rift gc
```

## Appendix C: Test Coverage

50 unit tests, all passing:

- `chunk::tests`: atomic flush, versioning (v1.0 migration, v1.3 roundtrip, future version rejected), gc reclaims orphans
- `auth::tests`: encryption roundtrip, wrong-key fails, on-disk encryption, migration
- `ssh_keys::tests`: key encrypts at rest, roundtrip, remove, list
- `serve::tests`: bearer auth (accept/reject/wrong), rate limit (429 after 100, per-IP), health public
- `ignore::tests`: glob, anchored, directory, extension, negation, recursive
- `tls::tests`: cert generation, fingerprint deterministic
- `rift_clone::tests`: URL detection, parsing
