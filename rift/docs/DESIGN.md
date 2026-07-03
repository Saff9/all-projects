# Rift Design

This is a technical document. It's not marketing. If you want the pitch,
read the README. If you want to know why the pack file looks the way it
does, keep reading.

## Problem statement

Git is good. Git is also big, slow for some operations, has no real
undo, and stores objects in a way that wastes disk on small repos.

Concretely:

- **Git binary is 3.9 MB.** A lot of that is the git protocol, the
  scripting layer, libcurl, libssl. For a tool you use every day, that
  is fine. For a tool you ship inside a Docker layer or embed in a
  CI runner, it's a tax.
- **Git stores each object as its own file.** A repo with 1000 files at
  HEAD has at least 1000 blob files in `.git/objects/`. Each file takes
  at least one 4 KB filesystem block on ext4. Most of those blocks are
  mostly empty. On a 57K-file repo we measured, git used 959 MB where
  rift used 241 MB. That's a 4x waste for no benefit.
- **Git has no undo.** Reflog exists. It's hidden. New users don't know
  about it. Old users forget the syntax. The result is that a
  misjudged `git reset --hard` destroys work and there's no obvious way
  back.
- **Git's object format is verbose.** Each blob is prefixed with a
  header. Trees are binary. The format was designed for streaming, not
  for compact storage.

Rift is an attempt to fix those things without giving up the parts of
git that work.

## Design goals

In priority order:

1. **Small binary.** Target 2.5 MB or under. Statically linked, no
   runtime deps, stripped.
2. **Small storage.** Beat git on real-world repos. Not "smaller on
   toy benchmarks". Smaller on a 57K-file repo.
3. **Fast status and diff.** These run on every save. They have to be
   fast or the tool feels sluggish.
4. **Real undo.** Any mutating command can be reversed. The undo is
   first-class, not a hidden log you have to know about.
5. **Git interop.** Push and pull to GitHub, GitLab, anywhere that
   speaks git. Rift does not need to replace git everywhere to be
   useful. It needs to coexist.
6. **Scriptable.** `--json` on every command. The CLI is also an API.

Things we explicitly did not prioritize:

- **GitHub-native features.** No pull requests, no issues, no actions.
  Use GitHub for those. Rift is a local tool.
- **Beating git on every microbenchmark.** We're close on status and
  log, sometimes slower, sometimes faster. The wins are in binary
  size, storage, and undo. Don't oversell the speed.
- **Backwards compatibility with git's wire protocol.** We bridge
  through git itself for push/pull. Simpler.

## Architecture

### Pack-file storage

Every rift object (blob, tree, commit) lives in one file:
`.rift/chunks/pack.dat`. The file is append-only. New objects go at the
end. Objects are never modified in place.

A second file, `.rift/chunks/pack.idx`, indexes the pack. The index is
binary. Format:

```
magic            : 8 bytes   = b"RIFTIDX1"
entry_count      : u64 LE
total_referenced : u64 LE    (sum of chunk counts across all manifests)
entries[]        : 44 bytes each
    hash_bytes        : 32 bytes  (raw BLAKE3)
    offset            : u64 LE    (offset into pack.dat)
    compressed_len    : u32 LE    (length of compressed bytes)
```

44 bytes per entry. A repo with 100K objects has a 4.4 MB index. Git's
equivalent `.git/objects/pack/*.idx` is similar size, so we're not
winning here. We win on the pack itself, because git's pack is only
created by `git gc`, not on every commit. Rift's pack is the only
storage from day one.

The index is loaded into memory on `Repo::open` and stays there. Lookups
are `O(1)` HashMap hits. Resolving a short hash scans the in-memory
index, not the filesystem.

If the index is missing or the magic doesn't match, the store starts
empty. No migration step. A fresh repo is just a missing pack file.

### Content-addressed with BLAKE3

Every object is addressed by its BLAKE3 hash. We picked BLAKE3 over
SHA-1 (what git uses) and SHA-256 for three reasons:

1. **BLAKE3 is faster than SHA-256.** Roughly 5x on modern hardware
   thanks to SIMD. For a VCS that hashes files constantly, that matters.
2. **BLAKE3 is a tree hash.** It can hash a 10 GB file in parallel
   across cores. SHA-256 is single-threaded.
3. **SHA-1 is broken.** SHAttered (2017) showed chosen-prefix
   collisions. Git has mitigations (collision detection in
   `sha1dc`), but it's still SHA-1 underneath. BLAKE3 has no known
   practical attacks.

BLAKE3 outputs 32 bytes (256 bits). We store the raw bytes in the
index, hex-encode for user-facing display. Short hashes use the first 7
hex chars (28 bits, ~268M namespace, fine for any repo smaller than
Linux).

### Chunked dedup

Files are split into 8 KB chunks before hashing. A `ChunkedBlob`
manifest records the ordered list of chunk hashes plus the total
uncompressed size:

```json
{
  "chunks": ["a1b2c3...", "d4e5f6...", ...],
  "size": 24576
}
```

Why 8 KB? Smaller chunks mean better dedup (a 1-line change in a 1 MB
file reuses 127 of 128 chunks). Bigger chunks mean less index overhead.
8 KB is the same default git uses for blobs in pack files. It's a
reasonable middle ground.

The manifest is itself stored as a chunk in the pack file. So a tree
references a manifest hash, the manifest references chunk hashes, and
the chunks live in the pack. Three-level indirection, but every level
is a HashMap lookup.

Dedup happens at the chunk level. If you change one line in a 1 MB file,
one chunk changes. The other 127 are reused. The pack file gets 8 KB
of new data, not 1 MB. The index gets one new entry.

The index tracks `total_referenced` (sum of chunk counts across all
manifests). Dedup ratio is `1 - unique / total_referenced`. We compute
this on every `rift stats` call. The number is real, not made up.

### Lock-free parallel writes

The hot path is `Repo::save` with a few hundred files. We hash and
compress each file in parallel with rayon. The bottleneck was the index
mutex: every chunk write took the lock to record its offset.

Fix: the write path is now lock-free. `pack_len: AtomicU64` on
`ChunkStore`. Each writer calls `fetch_add(chunk_len)` to claim a
position in the pack file, then `pwrite` (via `FileExt::write_all_at`)
at that offset without holding the lock. The index is updated after the
write, under the mutex, but the I/O doesn't wait.

Race on duplicate hashes: two writers can both write the same content.
The loser's bytes are orphaned at the end of the pack. Harmless. The
index records the first writer's offset.

Result: 100-file save went from 55 ms (mutex-bound) to 7 ms (parallel
I/O).

### mtime-aware incremental save

`build_tree_fast` caches the mtime of every file when it saves a tree.
On the next save, it walks the working directory and compares mtimes.
Unchanged files reuse their stored blob hash. No read, no hash, no pack
write.

This makes incremental save `O(changed_files)`, not `O(all_files)`. On
a 500-file repo with one file changed, save takes 6 ms instead of 8 ms.
For a 5000-file repo with one file changed, the win is bigger.

mtime is read in nanosecond precision. The kernel may not actually
provide nanosecond resolution on all filesystems (ext4 does, FAT doesn't),
but we don't care. We compare for equality, not ordering.

Tradeoff: if something modifies a file without changing the mtime
(some build tools do this), rift won't notice. The fix is `rift save
--force` which re-hashes everything. We've never needed it.

### JSONL oplog

`.rift/oplog.jsonl` is the operation audit log. One JSON object per
line, appended on every mutating command. Format:

```json
{"op":"save","before":{"branch":"main","commit":"a1b2c3..."},"after":{"commit":"d4e5f6..."},"ts":1699104123}
{"op":"checkout","before":{"branch":"main","commit":"d4e5f6..."},"after":{"branch":"feature","commit":"a1b2c3..."},"ts":1699104156}
```

Append is `O(1)`. We seek to end, write one line, flush. No rewrite of
existing data. The old v0.7 format was a JSON array, which meant a full
file rewrite on every operation. That was `O(n^2)` over the life of a
repo. JSONL is the fix.

`rift undo` reads the last line, restores the `before` state, and
appends a new `undo` operation. You can chain undos.

`rift history` reads the whole log and prints it. For very long logs
this is `O(n)`, but in practice it's fast because the file is small
and sequentially read.

Backwards compat: if `oplog.jsonl` is missing but a legacy `oplog.json`
exists, we convert it on first open and rename the old file to
`.oplog.json.bak`. One-shot migration.

### Encrypted credential store

GitHub and GitLab PATs are secrets. We encrypt them at rest.

Design:

- **Master key.** 32 random bytes from `OsRng`, stored in
  `~/.config/rift/master.key` with `0600` perms. Generated on first
  use. Never printed, never logged, never sent anywhere.
- **Per-token encryption.** Each PAT is encrypted with AES-256-GCM. The
  on-disk format is `nonce[12] || ciphertext || tag[16]`, base64-encoded
  in JSON. The nonce is fresh per token, generated from `OsRng`.
- **Plaintext fields.** `host`, `user`, `saved_at` stay plaintext. They
  have to, so we can list and find without decrypting everything.
- **Memory wipe.** The `Credential` struct derives `Zeroize`. When it
  goes out of scope, the token field is overwritten with zeros. Not
  perfect (the compiler can be clever about copies), but better than
  nothing.
- **URL redaction.** `redact_url()` replaces `token@` with `***@` in
  any URL before it gets logged. Every error path in `git_bridge.rs`
  uses this.

Backwards compat: legacy v0.9 stored tokens as plaintext with a
`sealed: false` flag. On first load in v1.0, we encrypt every token
and rewrite the file with `sealed: true`. Migration is transparent.

### Secure serve

`rift serve` runs an axum HTTP server. Defaults:

- **Bind 127.0.0.1.** Localhost only. Not exposed to the network
  unless you ask.
- **`--public` flag** binds 0.0.0.0. Prints a warning. We don't
  silently expose your repo.
- **Bearer auth.** `--token <secret>` requires
  `Authorization: Bearer <secret>` on `/blob`, `/tree`, `/commit`.
  `/health`, `/info`, `/log`, `/branches`, `/clone` stay public so
  monitoring tools work without auth.
- **Rate limit.** 100 requests per 60 seconds per IP. Over that, 429.
  Stops brute force on the bearer token and resource exhaustion on
  `/clone` (which is expensive).
- **CORS.** `Access-Control-Allow-Origin: *`. Lets browsers hit
  `/health` for monitoring. Not a security issue because the public
  endpoints don't return sensitive data.
- **Body limit.** 1 MB. Rift's server doesn't accept large uploads
  today, but the limit is defense in depth.

The point of `rift serve` is collaboration without GitHub. Two people
on the same VPN can `rift clone http://coworker:3030/repo` and work. The
security model assumes the network is hostile, even on localhost, so
rate limit and body limit apply everywhere.

## Tradeoffs

What we gave up:

- **Git's mature ecosystem.** No GitHub Desktop integration. No
  SourceTree support. No IDE plugins beyond VS Code's generic SCM.
  This is the biggest cost. Rift works fine standalone, but if your
  workflow depends on a git GUI, rift is not for you yet.
- **GitHub's PR workflow.** Rift pushes to GitHub as git commits, so
  PRs work, but you do them through GitHub's web UI. There's no
  `rift pr create`.
- **Tooling around git objects.** Tools like `git-filter-repo`,
  `bfg`, `git-extras` don't work on rift. The pack format is
  different. If you depend on these, rift is not a drop-in replacement.
- **Branching model flexibility.** Rift has branches, but no detached
  HEAD, no per-branch config. We made the common case fast and left
  the exotic stuff out.
- **Long-history performance.** We've tested up to 57K files in one
  commit. We have not tested 20 years of Linux kernel history. At some
  scale, the in-memory index stops fitting in RAM and we'd need a
  B-tree on disk. That's future work.

## Benchmark methodology

We measure six things:

1. **Binary size** - `ls -l` on the stripped release binary.
2. **Cold commit (80 files)** - create 80 fresh files, `rift save`.
   Median of 5 runs.
3. **Incremental commit** - modify 1 of 500 files, `rift save`. Median
   of 5 runs.
4. **Status** - `rift status` on a 500-file repo with 2 modified files.
   Median of 5 runs.
5. **Log** - `rift log` on a 100-commit repo. Median of 5 runs.
6. **Storage** - `du -sh .rift` after the test repo is committed.

For rift-vs-git comparisons, we use `time` (wall clock) on each
command. Run `rift bench` to reproduce.

### The spawn-overhead caveat

Every `rift <cmd>` invocation pays a process spawn cost: kernel forks,
binary loads, runtime initializes, command runs. On a fast machine this
is about 1-2 ms. On a slow machine it's 5-10 ms.

This means sub-10 ms measurements are mostly noise. A 7 ms status vs a
3 ms status might be a real win, or might be one extra cache miss in
the loader. We report the numbers, but don't read too much into a 2 ms
difference.

For the same reason, `rift bench` runs each command 3 times and takes
the minimum. The minimum is the cleanest measurement (least affected
by other processes). It still includes spawn overhead.

Full methodology and results are in `docs/BENCHMARK.md`.

## Future work

Things we want to do but haven't:

- **Delta compression.** Git's pack files store deltas (only the
  changed lines between versions of the same file). Rift stores full
  chunks. For files that change line-by-line over many commits (think
  CHANGELOG.md), git's storage is smaller. We'd add a delta-compressed
  layer on top of the chunk store, similar to git's pack v2.
- **SSH auth.** Today we use HTTPS PATs. SSH would let `rift clone`
  work without storing any tokens. We'd depend on `ssh2` or shell out
  to `ssh`.
- **Pack repacking.** The pack file is append-only. Orphaned bytes from
  duplicate writes and deleted objects accumulate. We need a `rift gc`
  that rewrites the pack without the orphans. Should be offline (no
  concurrent writes during gc).
- **Partial clone.** `rift clone` today downloads the whole pack. For
  huge repos, you want to fetch only the trees and the chunks for the
  files you actually read. Design is straightforward (the index tells
  you what to fetch); implementation is not done.
- **Branch namespaces.** `feature/auth` works today. `owner/feature/x`
  doesn't. We want git-compatible ref namespaces.
- **Better merge.** Today we do 3-way merge with conflict markers. We
  don't do rename detection. We don't do criss-cross merges well. There
  is real work here.
