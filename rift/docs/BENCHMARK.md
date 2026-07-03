# Rift Benchmarks

How we measure, what we measure, and what the numbers actually mean.
If you want to reproduce, run `rift bench` and read this file alongside
the output.

## How to run it yourself

```bash
$ rift bench
┌─ rift bench ─────────────────────────────────────────┐
│  binary     2,221 KB   (git: 3,987 KB)   rift 1.8x   │
│  cold       8 ms       (git: 7 ms)        ~tie        │
│  incr       6 ms       (git: 8 ms)        rift 1.3x   │
│  status     3 ms       (git: 3 ms)        tie         │
│  log        2 ms       (git: 1 ms)       tie         │
│  storage    1,210 KB   (git: 3,140 KB)   rift 2.6x   │
└──────────────────────────────────────────────────────┘
```

Numbers vary by machine. The above are on a Linux dev box with NVMe
and a recent i7. On a 5-year-old laptop, everything is 2-3x slower but
the ratios hold.

`rift bench` creates 80 test files in a temp dir, commits them with
both rift and git, then runs the read-only commands (status, log) 3
times each and takes the minimum. The minimum is the cleanest
measurement: least affected by background load.

## What's measured

Six metrics. Picked because they cover the cost of using the tool day
to day.

1. **Binary size.** The stripped release binary. `ls -l` on rift,
   `ls -l $(which git)` on git.
2. **Cold commit.** Create 80 fresh files of mixed sizes (1 KB to
   100 KB). `rift save -m "init"` and `git add . && git commit -m
   "init"`. Wall clock time, median of 5 runs.
3. **Incremental commit.** Take the repo from above, modify 1 file
   out of 500 (we extend it to 500 files first), commit. This is the
   common case for daily work.
4. **Status.** `rift status` / `git status` on a 500-file repo with 2
   modified files. Median of 5 runs.
5. **Log.** `rift log` / `git log` on a 100-commit repo. Median of 5
   runs.
6. **Storage.** `du -sh .rift` and `du -sh .git` after the same
   content was committed.

## The spawn-overhead caveat

Every `rift <cmd>` and `git <cmd>` invocation pays a process spawn
cost. Kernel forks, binary loads, runtime initializes, then the
command actually runs.

On a fast Linux machine this is 1-2 ms. On macOS it's 3-5 ms (the
mach-o loader is slower). On Windows it can be 10+ ms (PE loader, plus
Defender scanning the binary on launch).

This means sub-10 ms measurements are mostly noise. A 7 ms status vs
a 3 ms status might be a real win, or it might be one extra cache miss
in the loader, or it might be that git's binary was already paged in
from a previous run.

For this reason:

- We take the minimum of 3 runs for read-only commands.
- We don't claim a winner on differences under 3 ms.
- We do claim a winner on storage (no spawn cost) and binary size (no
  spawn cost).
- The cold commit and incremental commit numbers have ~25 ms of spawn
  overhead in them (we measure the whole process, not just the
  internals). The relative ratio still means something, but absolute
  numbers should be read as "wall clock including process startup",
  not "pure algorithm time".

If you want to see the pure algorithm time, run `rift bench --internal`
(which we haven't built yet). The plan is an in-process benchmark
that measures just the `Repo::save` call without the CLI parsing.
Today, use the wall clock numbers and apply judgment.

## Results table

Numbers from a representative run on Linux, NVMe, i7-12700, kernel
6.5. Numbers vary by machine. Don't quote these as "the" numbers.
Quote the ratio.

| Metric | Rift 1.0.0 | Git 2.43 | Winner | Notes |
|--------|-----------|----------|--------|-------|
| Binary size | 2,221 KB | 3,987 KB | Rift 1.8x | Stripped, statically linked |
| Cold commit (80 files) | 8 ms | 7 ms | ~tie | Within spawn-overhead noise |
| Incremental commit (1 of 500) | 6 ms | 8 ms | Rift 1.3x | mtime cache helps |
| Status (500 files, 2 changed) | 3 ms | 3 ms | tie | Both fast |
| Log (100 commits) | 2 ms | 1 ms | tie | Sub-10ms = noise |
| Storage (80 files, 1 commit) | 1,210 KB | 3,140 KB | Rift 2.6x | Per-object files waste blocks |
| Storage (openclaw, 57K files) | 241 MB | 959 MB | Rift 4.0x | Real-world repo |

Rift wins clearly on binary and storage. The speed wins are smaller
and partly noise. The honest summary: rift is in the same speed class
as git for daily operations, and significantly smaller on disk.

## Binary size

```
rift   ████████████████████                          2,221 KB
git    ██████████████████████████████████████████    3,987 KB
       ├─────────┬─────────┬─────────┬────────┤
       0        1,000     2,000     3,000   4,000 KB
```

Rift's binary is 56% of git's. The win comes from four things:

1. **No dynamic linking beyond libc.** Git links libcurl, libssl,
   libexpat, zlib, libpcre. Rift bundles everything statically.
   Static linking makes the binary bigger per-byte but eliminates
   shared library startup cost.
2. **`strip = true` in the release profile.** Removes debug symbols.
   Git is also stripped in most distros, but we wanted to be explicit.
3. **LTO.** `lto = true` in the release profile does cross-crate
   optimization. Removes dead code that would otherwise be linked in.
   `codegen-units = 1` makes LTO more effective.
4. **`panic = "abort"`.** Removes the unwind tables. Saves ~100 KB.

The crypto dependencies (aes-gcm, ring, zeroize) added ~200 KB over
v0.9. Worth it for at-rest encryption.

## Storage

```
rift   ███████████                                1,210 KB
git    █████████████████████████████              3,140 KB
       ├──────────┬──────────┬──────────┬────────┤
       0       1,000     2,000      3,000    4,000 KB

Real-world repo (openclaw, 57K files, 1 commit):
rift   ████████████████████████████████████        241 MB
git    ████████████████████████████████████████████████████████████████████████  959 MB
       ├──────────┬──────────┬──────────┬────────┤
       0        250        500        750      1,000 MB
```

Rift's storage is 38% of git's on a small repo, 25% on a big one.

The win is structural. Git stores each object as its own file:

```
.git/objects/a1/b2c3d4...   (one blob, 4 KB block on disk)
.git/objects/d4/e5f6a7...   (another blob, 4 KB block on disk)
.git/objects/...             (thousands more)
```

Each file takes at least one 4 KB filesystem block. A 200-byte blob
wastes 3.9 KB. On a 1000-file repo, that's megabytes of wasted space.

Rift stores every object in one pack file:

```
.rift/chunks/pack.dat   (one file, exactly as big as the data)
.rift/chunks/pack.idx    (binary index, 44 bytes per object)
```

No per-object block overhead. The pack is exactly the sum of compressed
chunk sizes. The index is exactly 24 + 44 * N bytes for N objects.

On the 57K-file openclaw repo: rift's pack.dat is 240 MB of actual
compressed data. Git's `.git/objects/` is 959 MB, of which roughly 700
MB is wasted filesystem block overhead.

Rift also compresses each chunk with gzip before writing. Git
compresses too, but only inside pack files (created by `git gc`), not
on every commit. On a fresh clone, git's loose objects are
uncompressed.

## Why rift wins storage

Two reasons:

1. **One file vs many.** No filesystem block overhead.
2. **Compressed from the start.** Every chunk is gzip-compressed on
   write, not deferred to a manual `gc`.

The structural reason (one file) is the bigger win. The compression
is nice but git would get the same benefit from running `git gc` after
every commit (which nobody does).

## Why rift wins binary size

Already covered above, but the short version: no dynamic deps, strip,
LTO, panic=abort. Plus Rust's compiler is good at dead-code
elimination when the call graph is static.

## Where git wins

Honesty matters. Git wins or ties on:

- **Cold commit.** 7 ms vs 8 ms. Within noise. Could go either way.
- **Status.** Both ~3 ms. Tie.
- **Log.** Git is 1 ms, rift is 2 ms. Sub-10 ms is noise. Tie.
- **Ecosystem.** Git has 20 years of tooling. Rift has 1.0. Git wins
  by a mile here.
- **Long-history repos.** Linux kernel, chromium, webkit. Rift's
  in-memory index doesn't scale past a few million objects. Git's
  pack format does. Use git for those.

## Reproducing the benchmark

```bash
git clone https://github.com/Saff9/rift.git
cd rift
cargo build --release
./target/release/rift bench
```

If you want to benchmark on the openclaw repo (the 57K-file test):

```bash
rift clone https://github.com/openclaw/openclaw.git /tmp/openclaw-rift
du -sh /tmp/openclaw-rift/.rift

git clone https://github.com/openclaw/openclaw.git /tmp/openclaw-git
du -sh /tmp/openclaw-git/.git
```

The ratios will be close to what we report. Absolute numbers will
depend on your disk (HDD vs SSD vs NVMe matters a lot for the cold
commit) and your CPU (BLAKE3 loves AVX2).

## What we don't measure

Things we deliberately leave out:

- **Network operations.** Push, pull, clone over HTTP. These depend on
  your network and the remote server. Measuring them in a benchmark is
  misleading.
- **Memory usage.** Rift's in-memory cache holds decompressed chunks.
  On a huge repo it can grow. We have a cap (1024 chunks) but haven't
  measured exactly how it behaves under load.
- **Cold-cache startup.** The first `rift status` after boot is slower
  because the binary isn't in page cache. We don't measure this
  because it depends on what else the machine is doing.
- **Disk write durability.** We `fsync` on save. We don't measure
  fsync latency because it varies wildly by filesystem (ext4 with
  journal vs ZFS vs network filesystems).

If you want to measure any of these, the code is open. We'd love to
see the results.
