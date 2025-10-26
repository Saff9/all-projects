# DocLite: The Serverless Embedded NoSQL Database Engine

[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](LICENSE-MIT)
[![Rust: 2021 Edition](https://img.shields.io/badge/Rust-1.75%2B-orange.svg?logo=rust)](https://www.rust-lang.org)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![C-ABI Supported](https://img.shields.io/badge/C--ABI-Shared%20%26%20Static-green.svg)]()
[![Zero Daemon](https://img.shields.io/badge/Zero--Daemon-Pure%20Embedded-purple.svg)]()
[![ACID WAL](https://img.shields.io/badge/ACID-ARIES%20WAL-red.svg)]()
[![Sponsor](https://img.shields.io/badge/Sponsor-Razorpay-0c2340.svg?logo=razorpay&logoColor=white)](https://razorpay.me/@CodeChap?amount=kXxURMaXFk%2Bmrv%2B9uGrYpg%3D%3D)

> **DocLite** is the **SQLite of NoSQL**: a fast, zero-configuration, single-file embedded document database written in memory-safe **Rust**. It brings the simplicity, instant cold-start, and single-file portability of SQLite to modern **JSON/BSON document stores** with complete **MongoDB-compatible query filtering, update modifiers, multi-stage aggregation pipelines, on-disk B+Tree indexing, and ARIES-style crash-resilient WAL transactions**.

DocLite runs **in-process** directly linked into your application binary or loaded via C-ABI / Python — with **zero background daemons, zero network overhead, and zero configuration**.

---

## ❓ Is DocLite MongoDB-Type or Postgres-Type?

> **Short Answer**: DocLite gives you the **Developer Experience & Query Model of MongoDB**, built on top of the **Single-File, ACID Storage Architecture of SQLite & Postgres**.

| Aspect | Type / Model | How DocLite Works |
| :--- | :---: | :--- |
| **Data & Document Model** | 🍃 **MongoDB-Type** | Schema-free JSON/BSON document collections, nested objects, and arrays. |
| **Query & Filter Syntax** | 🍃 **MongoDB-Type** | Rich MQL operators: `$eq`, `$gt`, `$in`, `$or`, `$elemMatch`, `$regex`, dot-notation paths (`"user.address.city"`). |
| **Update Engine** | 🍃 **MongoDB-Type** | Atomic in-place modifiers: `$set`, `$unset`, `$inc`, `$mul`, `$push`, `$pull`, `$addToSet`, `$currentDate`, upsert. |
| **Analytics Engine** | 🍃 **MongoDB-Type** | Multi-stage Aggregation Pipeline (`$match` ➔ `$group` ➔ `$sort` ➔ `$unwind` ➔ `$project`). |
| **Operational Model** | 🪶 **SQLite-Type** | **Zero Daemons / Zero Servers / Zero Ports**. Pure in-process library compiled into your binary or loaded dynamically. |
| **Storage Architecture** | 🐘 **Postgres / SQLite-Grade** | 4096-byte binary slotted-pages, in-place defragmentation, chained overflow pages (>16MB), and on-disk B+Tree indexing. |
| **Durability & Recovery** | 🐘 **Postgres / SQLite-Grade** | **Full ACID Transactions** with synchronous Write-Ahead Logging (WAL), CRC32 frame checksums, and ARIES crash recovery. |

---

## 📑 Table of Contents

1. [Is DocLite MongoDB-Type or Postgres-Type?](#-is-doclite-mongodb-type-or-postgres-type)
2. [Why DocLite? ("What We Have vs Alternatives")](#-why-doclite-what-we-have-vs-alternatives)
3. [Comparative Performance Benchmarks](#-comparative-performance-benchmarks)
4. [Architecture & Storage Internals](#-architecture--storage-internals)
5. [Language SDKs & Quickstart](#-language-sdks--quickstart)
   - [Rust API](#1-rust-api)
   - [Python Driver (`doclite`)](#2-python-driver-doclite)
   - [C / C++ Embedding (`doclite.h`)](#3-c--c-embedding-docliteh)
   - [Interactive REPL & CLI](#4-interactive-repl--cli)
6. [Complete Query & Filter Operator Reference](#-complete-query--filter-operator-reference)
7. [Complete Update Modifier Reference](#-complete-update-modifier-reference)
8. [Complete Aggregation Pipeline Reference](#-complete-aggregation-pipeline-reference)
9. [Building, Testing & CLI Guide](#-building-testing--cli-guide)
10. [💖 Sponsoring & Supporting](#-sponsoring--supporting)
11. [License](#-license)

---

## 💡 Why DocLite? ("What We Have vs Alternatives")

Developers building desktop apps, edge microservices, mobile applications, games, and CLI tools frequently need document storage. However, they are forced to choose between heavyweight client-server databases (MongoDB) or relational engines with awkward JSON text strings (SQLite JSON1).

**DocLite bridges this gap** by offering a purpose-built document storage engine designed from the ground up for embedded workloads.

### Feature Comparison Matrix

| Feature / Capability | **DocLite** | **SQLite (JSON1)** | **TinyDB (Python)** | **DuckDB** | **MongoDB (Server)** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Operational Model** | **Pure Embedded (In-Process)** | Pure Embedded (In-Process) | Pure Embedded (In-Process) | Pure Embedded (In-Process) | Heavy Client-Server Daemon |
| **Underlying Data Format** | **Native Slotted-Page Binary BSON** | Relational rows + Text JSON strings | Monolithic formatted JSON file | Columnar Vectorized relational | WiredTiger BSON cluster |
| **Query Dialect** | **Native MongoDB Filter DSL** | SQL functions (`json_extract`) | Python queries / lambdas | SQL dialect | MongoDB MQL |
| **Aggregation Pipeline** | **Multi-stage Pipeline ($group, $match, $unwind...)** | SQL `GROUP BY` & Window functions | None (Manual Python loops) | SQL OLAP functions | Aggregation Pipeline |
| **Secondary Indexing** | **On-Disk B+Tree on any deep JSON path** | Generated columns index | In-memory dict only | Columnar ART / Min-Max | WiredTiger B-Tree |
| **Large Document Overflow** | **Automatic Chained Overflow (>16MB)** | Text string column limits | Loads entire file in RAM | Vector batch limits | 16MB document hard limit |
| **ACID Durability** | **ARIES Write-Ahead Log (WAL) + CRC32** | Rollback Journal / WAL | None (Rewrites entire file) | Write-Ahead Log | WiredTiger Journal |
| **Memory Footprint** | **Ultra-Low (<4MB base page cache)** | Very Low | High (Loads all JSON to RAM) | Medium / High | High (>500MB daemon base) |
| **Cold Start Latency** | **< 1 millisecond** | < 1 millisecond | Moderate (Parses file) | < 5 milliseconds | 2–5 seconds (Daemon boot) |
| **Multi-Language C-ABI** | **Yes (`.dll`, `.so`, `.dylib`, `.h`)** | Yes | Python only | Yes | Client drivers over TCP |
| **Single-File Portability** | **Single `.docdb` file** | Single `.db` file | Single `.json` file | Single `.duckdb` file | Directory with 50+ data files |

### Key Advantages of DocLite

1. **Native Binary Slotted Pages vs Text JSON Parsing**:
   SQLite with JSON1 stores documents as raw `TEXT` strings. On every query, filter, or update, SQLite must parse the text JSON characters into syntax trees. DocLite encodes documents into compact binary BSON records stored in fixed 4096-byte slotted pages — reading a field requires zero text parsing.
2. **True MongoDB Operator Parity**:
   Query your data using intuitive operators (`$gte`, `$in`, `$regex`, `$elemMatch`, `$push`, `$inc`) without writing convoluted SQL string expressions like `WHERE json_extract(data, '$.user.tags[0]') = 'rust'`.
3. **Dedicated On-Disk B+Tree Indexing on Deep JSON Paths**:
   Create single or compound indexes directly on nested paths (`"address.geo.lat"`, `"items.sku"`). Point lookups and range scans execute in $O(\log N)$ page traversals.
4. **Zero-Daemon, Zero-Port, Single-File Deployment**:
   No ports to configure, no Docker containers to maintain, and no authentication daemons. Copy your `.docdb` file across Windows, Linux, and macOS.

---

## ⚡ Comparative Performance Benchmarks

The benchmark below compares **DocLite (Rust engine via C-ABI/Python)** directly against **SQLite (JSON1 / `json_extract`)** on identical workloads consisting of 10,000 JSON documents with complex nested fields, arrays, and multi-stage queries.

*Hardware: AMD Ryzen / Intel x86_64, Windows 11 / Linux 6.x, NVMe SSD.*

### Benchmark Summary

| Benchmark Metric | DocLite (Rust Engine) | SQLite (JSON1 Extension) | Advantage / Note |
| :--- | :---: | :---: | :--- |
| **Native Bulk Inserts** | **345,904 docs/sec** | 256,100 docs/sec | Native slotted-page binary serializer |
| **Python Batch Inserts** | **106,499 docs/sec** | 205,290 docs/sec | Batched page allocations + single catalog commit |
| **Indexed Point Lookups** | **19,803 queries/sec** | 442,302 queries/sec | Direct $O(\log N)$ on-disk B+Tree RecordId fetch |
| **Indexed Range Query Rate** | **30,263 queries/sec** (Native Rust) | 4,059 queries/sec | Sequential leaf-chained page scan |
| **Aggregation Pipeline Latency**| **31.10 ms** (10,000 docs) | 12.95 ms (SQL Engine) | Complete MongoDB-compatible aggregation engine |
| **Binary Executable Size** | **2.85 MB** (doclite.exe) | ~1.5 MB (sqlite3) | Self-contained engine + REPL + Query Optimizer |
| **Cold Start Time** | **< 0.8 ms** | < 0.5 ms | Sub-millisecond instant initialization |

To run the comparative benchmark yourself:
```bash
python benches/compare_bench.py
```
Or run the native high-throughput engine benchmark:
```bash
doclite :memory: bench --count 50000
```

---

## 🏗 Architecture & Storage Internals

DocLite is structured as a layered, modular database engine:

```
+-----------------------------------------------------------------------------------+
|                                  Client Layer                                     |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |     Rust API        |   |    C FFI C-ABI      |   |  Interactive CLI Shell  |  |
|  |  (doclite library)  |   |  (doclite.dll/.so)  |   |    (doclite-cli REPL)   |  |
|  +----------+----------+   +----------+----------+   +------------+------------+  |
|             |                         |                           |               |
|             +-------------------------+---------------------------+               |
+---------------------------------------+-------------------------------------------+
                                        |
+---------------------------------------v-------------------------------------------+
|                          Document Query & Execution Engine                        |
|  +-----------------------------------------------------------------------------+  |
|  | Query Parser & Compiler (MongoDB filter syntax: $eq, $gt, $in, $or, etc.)   |  |
|  +-----------------------------------------------------------------------------+  |
|  | Aggregation Pipeline ($match, $project, $group, $sort, $skip, $limit, ...) |  |
|  +-----------------------------------------------------------------------------+  |
|  | Query Optimizer (Index Selection, Plan Generation: IndexScan vs SeqScan)     |  |
|  +-----------------------------------------------------------------------------+  |
|  | Update Engine ($set, $unset, $inc, $push, $pull, $addToSet, upsert)         |  |
|  +-----------------------------------------------------------------------------+  |
+---------------------------------------+-------------------------------------------+
                                        |
+---------------------------------------v-------------------------------------------+
|                          Index & Transaction Manager                              |
|  +-----------------------------------------------------------------------------+  |
|  | B+Tree Index Manager (Primary `_id` & Secondary Compound / Unique Indexes)  |  |
|  +-----------------------------------------------------------------------------+  |
|  | Transaction Coordinator (ACID, MVCC / Snapshot Isolation, Locks)           |  |
|  +-----------------------------------------------------------------------------+  |
+---------------------------------------+-------------------------------------------+
                                        |
+---------------------------------------v-------------------------------------------+
|                          Storage Engine & Buffer Manager                          |
|  +-----------------------------------------------------------------------------+  |
|  | Buffer Pool Manager (LRU Page Cache, Pin/Unpin, Dirty Page Tracker)         |  |
|  +-----------------------------------------------------------------------------+  |
|  | Slotted-Page Storage (4096-byte pages, Slot Table, In-Place Defragmentation)|  |
|  +-----------------------------------------------------------------------------+  |
|  | Write-Ahead Log (WAL) Engine (CRC32 Checksum, LSN, ARIES Crash Recovery)    |  |
|  +-----------------------------------------------------------------------------+  |
|  | Large Document Chained Overflow Manager (>16MB document support)            |  |
|  +-----------------------------------------------------------------------------+  |
|  | Disk VFS Layer (OS-independent file locking, fsync)                         |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 1. Slotted-Page Storage Format (`4096 bytes`)

Each data page uses a **slotted-page layout** allowing variable-length documents to be inserted, updated, and deleted without external fragmentation:

```
+-----------------------------------------------------------------------------+
| Page Header (24B) | Slot Directory (Slot 0, 1, 2...) -> |   Free Space      |
| CRC32, PageType,  | Offset & Length pointers            |   (Grows down)    |
| FreeSpaceOffset   | (Grows right)                       |                   |
+-------------------+-------------------------------------+-------------------+
|                   <- Document Payloads (Stored bottom-up)                   |
|                   [Record 2 Payload] [Record 1 Payload] [Record 0 Payload]  |
+-----------------------------------------------------------------------------+
```

- When records are deleted, the slot is marked as dead.
- If contiguous space is insufficient for a new record, the page automatically performs **in-place defragmentation** before allocating new pages.

### 2. Large Document Overflow Chaining (`>16MB`)

Documents larger than inline page capacity (`MAX_INLINE_DOC_SIZE = 3800 bytes`) are automatically chunked and stored across a doubly-linked chain of dedicated overflow pages:

```
[Slotted Data Page] 
  └── Slot 0: [OVERFLOW_FLAG (0xFF) | Total Size (u32) | First Overflow Page ID (u32)]
        │
        ├──> [Overflow Page 1] (Next: Page 2, Data: 4084 bytes)
        ├──> [Overflow Page 2] (Next: Page 3, Data: 4084 bytes)
        └──> [Overflow Page 3] (Next: 0xFFFFFFFF, Data: Remaining bytes)
```

### 3. Write-Ahead Logging (WAL) & ARIES Crash Durability

All mutating operations write an append-only log frame to the `.wal` file before dirty pages are flushed to the `.docdb` database file:

```
+-----------------------------------------------------------------------------+
| WAL Frame Header (24B)                                                      |
| [ Magic: 0x57414C31 | LSN: u64 | PageId: u32 | CRC32: u32 | PayloadLen: u32]|
+-----------------------------------------------------------------------------+
| Page Payload (4096 bytes)                                                   |
+-----------------------------------------------------------------------------+
```

On restart after an unexpected crash or power loss, DocLite's **ARIES recovery engine**:
1. Scans the WAL log forwards verifying CRC32 checksums.
2. Reconstructs all committed page updates into the database.
3. Performs a clean atomic checkpoint and truncates the WAL.

---

## 🚀 Language SDKs & Quickstart

### 1. Rust API

Add to your `Cargo.toml`:
```toml
[dependencies]
doclite = { path = "../doclite" }
serde_json = "1.0"
```

```rust
use doclite::{Database, DocValue};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Open on-disk database (or Database::open_in_memory())
    let db = Database::open("app.docdb")?;
    let users = db.collection("users")?;

    // Create unique secondary index
    users.create_index(vec!["email".to_string()], true)?;

    // 1. Insert Document
    let doc = DocValue::from_json(&serde_json::json!({
        "username": "johndoe",
        "email": "john@example.com",
        "age": 30,
        "tags": ["rust", "database", "backend"],
        "profile": { "city": "San Francisco", "tier": "gold" }
    }));
    let id = users.insert_one(doc)?;
    println!("Inserted Document ObjectId: {}", id);

    // 2. Query with MongoDB Filter Operators
    let filter = DocValue::from_json(&serde_json::json!({
        "age": { "$gte": 25 },
        "tags": { "$in": ["rust"] },
        "profile.tier": "gold"
    }));
    let cursor = users.find(filter)?;
    for user in cursor {
        println!("Found: {}", user);
    }

    // 3. Update with Modifiers
    users.update_one(
        DocValue::from_json(&serde_json::json!({ "username": "johndoe" })),
        DocValue::from_json(&serde_json::json!({
            "$inc": { "age": 1 },
            "$push": { "tags": "distributed" }
        })),
        false, // upsert
    )?;

    // 4. Aggregation Pipeline
    let pipeline = vec![
        DocValue::from_json(&serde_json::json!({ "$match": { "age": { "$gte": 20 } } })),
        DocValue::from_json(&serde_json::json!({
            "$group": {
                "_id": "$profile.city",
                "avg_age": { "$avg": "$age" },
                "user_count": { "$count": null }
            }
        })),
        DocValue::from_json(&serde_json::json!({ "$sort": { "user_count": -1 } })),
    ];
    let agg_results = users.aggregate(pipeline)?;
    for bucket in agg_results {
        println!("Aggregation Result: {}", bucket);
    }

    // Durably checkpoint WAL to database file
    db.checkpoint()?;
    Ok(())
}
```

---

### 2. Python Driver (`doclite`)

DocLite includes a pure ctypes Python driver that loads `doclite.dll` (Windows) or `libdoclite.so` (Linux/macOS) with a PyMongo-like API.

```python
from doclite import DocLite

# Connect to database file (or in-memory if path is None)
with DocLite("app.docdb") as db:
    users = db.users

    # Create secondary index
    users.create_index(["email"], unique=True)

    # Bulk Insert
    users.insert_many([
        {"username": "alice", "email": "alice@site.com", "age": 28, "role": "admin"},
        {"username": "bob", "email": "bob@site.com", "age": 35, "role": "user"},
        {"username": "carol", "email": "carol@site.com", "age": 24, "role": "user"}
    ])

    # Point Lookup (Uses B+Tree Index Scan)
    alice = users.find_one({"email": "alice@site.com"})
    print(f"User: {alice['username']}, Age: {alice['age']}")

    # Complex Range Query
    adults = users.find({"age": {"$gte": 25, "$lte": 40}})
    for user in adults:
        print(f"Matched: {user['username']}")

    # Aggregation Pipeline
    stats = users.aggregate([
        {"$match": {"age": {"$gte": 20}}},
        {"$group": {
            "_id": "$role",
            "avg_age": {"$avg": "$age"},
            "count": {"$count": None}
        }},
        {"$sort": {"count": -1}}
    ])
    print("Role Stats:", stats)
```

---

### 3. C / C++ Embedding (`doclite.h`)

Include `include/doclite.h` and link against `doclite.dll` / `libdoclite.so`:

```c
#include <stdio.h>
#include "doclite.h"

int main() {
    doclite_db_t* db = NULL;
    if (doclite_open("embedded.docdb", &db) != 0) {
        fprintf(stderr, "Failed to open database: %s\n", doclite_last_error(db));
        return 1;
    }

    // Insert Document
    char* inserted_id = NULL;
    doclite_insert_one(db, "sensors", "{\"device_id\": 42, \"temp\": 23.8, \"status\": \"ok\"}", &inserted_id);
    printf("Inserted sensor ID: %s\n", inserted_id);
    doclite_free_string(inserted_id);

    // Query Document
    char* result_json = NULL;
    doclite_find_one(db, "sensors", "{\"device_id\": 42}", &result_json);
    printf("Queried Sensor: %s\n", result_json);
    doclite_free_string(result_json);

    // Clean Close
    doclite_close(db);
    return 0;
}
```

---

### 4. Interactive REPL & CLI

Launch the interactive REPL shell:
```bash
doclite my_app.docdb
```

```text
╔════════════════════════════════════════════════════════════╗
║              DocLite Interactive Database REPL             ║
║      Serverless NoSQL Document DB with Full ACID & WAL     ║
║       Type 'help' for commands, 'exit' to quit shell       ║
╚════════════════════════════════════════════════════════════╝

doclite[my_app.docdb:users]> insert {"name": "Alice", "age": 28, "tags": ["rust", "db"]}
✓ Inserted: 66c8b415a781290312000001

doclite[my_app.docdb:users]> find {"age": {"$gte": 20}}
{
  "_id": "66c8b415a781290312000001",
  "age": 28,
  "name": "Alice",
  "tags": [
    "rust",
    "db"
  ]
}
(Found 1 documents in 0.42ms)

doclite[my_app.docdb:users]> create_index email --unique
✓ Unique Index 'users_email' created successfully.

doclite[my_app.docdb:users]> explain {"age": {"$gte": 20}}
{
  "collection": "users",
  "scan_type": "SequentialScan",
  "total_keys_examined": 0,
  "total_docs_examined": 1,
  "returned_docs": 1,
  "execution_time_ms": 0.31
}

doclite[my_app.docdb:users]> stats
Database Statistics:
  Total Pages:      6 (24.58 KB)
  Collections:      1
  Total Documents:  1

doclite[my_app.docdb:users]> checkpoint
✓ Checkpoint completed. WAL flushed and truncated.
```

---

## 🔍 Complete Query & Filter Operator Reference

DocLite supports full nested dot-notation paths (e.g. `"user.address.zipcode"`) and standard MongoDB query operators:

### Comparison Operators
- `$eq`: Matches values equal to a specified value.
- `$ne`: Matches all values that are not equal to a specified value.
- `$gt`: Matches values that are greater than a specified value.
- `$gte`: Matches values that are greater than or equal to a specified value.
- `$lt`: Matches values that are less than a specified value.
- `$lte`: Matches values that are less than or equal to a specified value.
- `$in`: Matches any of the values specified in an array.
- `$nin`: Matches none of the values specified in an array.

### Logical Operators
- `$and`: Joins query clauses with a logical `AND` returns all documents that match both clauses.
- `$or`: Joins query clauses with a logical `OR` returns all documents that match either clause.
- `$nor`: Joins query clauses with a logical `NOR` returns all documents that fail both clauses.
- `$not`: Inverts the effect of a query predicate.

### Element & Array Operators
- `$exists`: Matches documents that have the specified field (`true` or `false`).
- `$type`: Matches documents where field type matches (`"string"`, `"int"`, `"float"`, `"bool"`, `"array"`, `"object"`, `"null"`, `"objectId"`).
- `$size`: Matches arrays with a specified number of elements.
- `$all`: Matches arrays that contain all elements specified in the query.
- `$elemMatch`: Matches documents that contain an array field with at least one element matching all specified criteria.
- `$regex`: Matches string values using regular expression patterns.
- `$mod`: Performs a modulo operation on numeric fields (`[divisor, remainder]`).

---

## ✏️ Complete Update Modifier Reference

Mutate documents atomically using MongoDB-standard update syntax:

- `$set`: Sets the value of a field in a document.
- `$unset`: Removes the specified field from a document.
- `$inc`: Increments the value of the field by the specified amount (positive or negative).
- `$mul`: Multiplies the value of the field by the specified amount.
- `$min`: Only updates the field if the specified value is less than the existing field value.
- `$max`: Only updates the field if the specified value is greater than the existing field value.
- `$rename`: Renames a field.
- `$currentDate`: Sets the value of a field to current date/time.
- `$push`: Appends a specified value to an array.
- `$pull`: Removes all instances of a value from an existing array.
- `$addToSet`: Adds elements to an array only if they do not already exist in the set.

---

## 📊 Complete Aggregation Pipeline Reference

DocLite provides a high-throughput multi-stage Aggregation Pipeline engine:

### Pipeline Stages
- `$match`: Filters the document stream to allow only matching documents to pass into the next pipeline stage.
- `$project`: Reshapes each document in the stream (including, excluding, or renaming fields).
- `$group`: Groups input documents by a specified identifier expression and applies accumulators.
- `$sort`: Reorders the document stream by specified field keys (`1` for ascending, `-1` for descending).
- `$skip`: Skips the first $N$ documents in the stream.
- `$limit`: Limits the stream to at most $N$ documents.
- `$unwind`: Deconstructs an array field from the input documents to output a document for each element.
- `$addFields`: Adds new computed or static fields to documents.
- `$count`: Delivers a document containing the count of documents passed to this stage.

### Group Accumulator Operators
- `$sum`: Calculates the collective sum of numeric values.
- `$avg`: Calculates the collective average of numeric values.
- `$min`: Resolves the minimum value.
- `$max`: Resolves the maximum value.
- `$count`: Counts the number of documents in each group.
- `$first`: Returns the first value in the group.
- `$last`: Returns the last value in the group.
- `$push`: Returns an array of all values for that field in the group.
- `$addToSet`: Returns an array of all unique values for that field in the group.

---

## 🛠 Building, Testing & CLI Guide

### Prerequisites
- **Rust Toolchain**: `cargo 1.75+`
- **C Compiler (Optional for C-ABI)**: `gcc`, `clang`, or `MSVC`
- **Python 3.8+ (Optional for Python SDK)**

### Build Artifacts
```bash
# Build standalone CLI and shared libraries in release mode
cargo build --release
```
Compiled targets:
- `target/release/doclite` (Standalone executable CLI & REPL shell)
- `target/release/doclite.dll` (Windows C-ABI dynamic library)
- `target/release/libdoclite.so` (Linux C-ABI shared library)
- `target/release/libdoclite.dylib` (macOS C-ABI shared library)

### Running Unit & Integration Tests
```bash
cargo test
```
Tests all subsystems:
- Slotted page allocation, record insertion, slot reuse, in-place defragmentation.
- BSON binary codec encoding/decoding roundtrip.
- On-disk B+Tree multi-level parent splitting, point lookups, and unique constraints.
- Multi-stage Aggregation pipeline evaluation.
- Large document chained overflow handling (>20KB).
- Write-Ahead Log (WAL) frame encoding, CRC32 verification, and ARIES crash recovery.

---

## 💖 Sponsoring & Supporting

**DocLite** is 100% free and open-source software built for developers, indie hackers, and enterprises who need blazing fast, single-file embedded document storage without database server overhead.

If DocLite is saving you server bills, simplifying your architecture, or helping your project, please consider sponsoring development:

👉 **[Support / Sponsor DocLite on Razorpay](https://razorpay.me/@CodeChap?amount=kXxURMaXFk%2Bmrv%2B9uGrYpg%3D%3D)**

Every contribution directly funds further performance optimizations, multi-language bindings, and long-term maintenance.

---

## 📄 License

DocLite is open-source software dual-licensed under:
- **MIT License** ([LICENSE-MIT](LICENSE-MIT))
- **Apache License, Version 2.0** ([LICENSE-APACHE](LICENSE-APACHE))

Repository: [https://github.com/saff9/DocLite](https://github.com/saff9/DocLite)

You may choose to use DocLite under either license at your option.
