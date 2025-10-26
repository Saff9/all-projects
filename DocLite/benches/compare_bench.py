"""
DocLite vs SQLite JSON1 vs Embedded Document Store
Comprehensive Benchmark Suite
"""

import os
import sys
import time
import json
import sqlite3

# Add python directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))
from doclite import DocLite

def generate_sample_docs(count):
    docs = []
    for i in range(count):
        docs.append({
            "seq": i,
            "username": f"user_{i:06d}",
            "age": 18 + (i % 60),
            "score": float(50.0 + (i % 50)),
            "active": (i % 2 == 0),
            "tags": ["rust", "database"] if (i % 3 == 0) else ["python", "web"],
            "profile": {
                "level": (i % 10),
                "city": ["New York", "San Francisco", "London", "Tokyo", "Berlin"][i % 5]
            }
        })
    return docs

def benchmark_doclite(docs, query_count=2000):
    print("--------------------------------------------------")
    print("  Benchmarking DocLite (Embedded Rust Engine)...")
    print("--------------------------------------------------")
    
    with DocLite() as db:
        users = db.bench_users
        
        # 1. Batch Insert
        t0 = time.perf_counter()
        users.insert_many(docs)
        t_insert = time.perf_counter() - t0
        insert_ops = len(docs) / t_insert
        print(f"  [+] Batch Insert ({len(docs)} docs): {t_insert*1000:.2f} ms ({insert_ops:,.0f} docs/sec)")
        
        # 2. Build B+Tree Index
        t0 = time.perf_counter()
        users.create_index(["username"], unique=True)
        users.create_index(["age"], unique=False)
        t_idx = time.perf_counter() - t0
        print(f"  [+] B+Tree Index Creation (username + age): {t_idx*1000:.2f} ms")
        
        # 3. Indexed Point Lookups
        t0 = time.perf_counter()
        for i in range(query_count):
            target = f"user_{i % len(docs):06d}"
            res = users.find_one({"username": target})
            assert res is not None and res["username"] == target
        t_lookup = time.perf_counter() - t0
        lookup_ops = query_count / t_lookup
        print(f"  [+] Indexed Point Lookups ({query_count} queries): {t_lookup*1000:.2f} ms ({lookup_ops:,.0f} queries/sec)")
        
        # 4. Indexed Range Queries ($gte, $lte)
        t0 = time.perf_counter()
        total_matched = 0
        for i in range(query_count):
            min_age = 25 + (i % 20)
            res = users.find({
                "age": {"$gte": min_age, "$lte": min_age + 2}
            })
            total_matched += len(res)
        t_range = time.perf_counter() - t0
        range_ops = query_count / t_range
        print(f"  [+] Indexed Range Scans ({query_count} queries): {t_range*1000:.2f} ms ({range_ops:,.0f} queries/sec, matched {total_matched} docs)")
        
        # 5. Aggregation Pipeline
        t0 = time.perf_counter()
        pipeline = [
            {"$match": {"active": True}},
            {"$group": {
                "_id": "$profile.city",
                "avg_score": {"$avg": "$score"},
                "total_users": {"$count": None}
            }},
            {"$sort": {"total_users": -1}}
        ]
        agg_res = users.aggregate(pipeline)
        t_agg = time.perf_counter() - t0
        print(f"  [+] Aggregation Pipeline (Filter + Group + Avg + Sort): {t_agg*1000:.2f} ms ({len(agg_res)} groups)")

    return {
        "insert_ops": insert_ops,
        "idx_ms": t_idx * 1000,
        "lookup_ops": lookup_ops,
        "range_ops": range_ops,
        "agg_ms": t_agg * 1000
    }

def benchmark_sqlite_json(docs, query_count=2000):
    print("\n--------------------------------------------------")
    print("  Benchmarking SQLite JSON1 (sqlite3 + json_extract)...")
    print("--------------------------------------------------")
    
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    cur.execute("CREATE TABLE bench_users (id INTEGER PRIMARY KEY, data TEXT)")
    
    # 1. Batch Insert
    t0 = time.perf_counter()
    json_rows = [(i, json.dumps(doc)) for i, doc in enumerate(docs)]
    cur.executemany("INSERT INTO bench_users (id, data) VALUES (?, ?)", json_rows)
    conn.commit()
    t_insert = time.perf_counter() - t0
    insert_ops = len(docs) / t_insert
    print(f"  [+] Batch Insert ({len(docs)} docs): {t_insert*1000:.2f} ms ({insert_ops:,.0f} docs/sec)")
    
    # 2. Build Expressions Indexes on JSON
    t0 = time.perf_counter()
    cur.execute("CREATE UNIQUE INDEX idx_user ON bench_users(json_extract(data, '$.username'))")
    cur.execute("CREATE INDEX idx_age ON bench_users(json_extract(data, '$.age'))")
    conn.commit()
    t_idx = time.perf_counter() - t0
    print(f"  [+] JSON Index Creation (username + age): {t_idx*1000:.2f} ms")
    
    # 3. Indexed Point Lookups
    t0 = time.perf_counter()
    for i in range(query_count):
        target = f"user_{i % len(docs):06d}"
        cur.execute("SELECT data FROM bench_users WHERE json_extract(data, '$.username') = ? LIMIT 1", (target,))
        row = cur.fetchone()
        assert row is not None
    t_lookup = time.perf_counter() - t0
    lookup_ops = query_count / t_lookup
    print(f"  [+] Indexed Point Lookups ({query_count} queries): {t_lookup*1000:.2f} ms ({lookup_ops:,.0f} queries/sec)")
    
    # 4. Indexed Range Queries
    t0 = time.perf_counter()
    total_matched = 0
    for i in range(query_count):
        min_age = 25 + (i % 20)
        cur.execute("""
            SELECT data FROM bench_users 
            WHERE json_extract(data, '$.age') >= ? 
              AND json_extract(data, '$.age') <= ?
        """, (min_age, min_age + 2))
        rows = cur.fetchall()
        total_matched += len(rows)
    t_range = time.perf_counter() - t0
    range_ops = query_count / t_range
    print(f"  [+] Indexed Range Scans ({query_count} queries): {t_range*1000:.2f} ms ({range_ops:,.0f} queries/sec, matched {total_matched} docs)")
    
    # 5. Aggregation with JSON extract
    t0 = time.perf_counter()
    cur.execute("""
        SELECT 
            json_extract(data, '$.profile.city') as city,
            AVG(json_extract(data, '$.score')) as avg_score,
            COUNT(*) as total_users
        FROM bench_users
        WHERE json_extract(data, '$.active') = 1
        GROUP BY city
        ORDER BY total_users DESC
    """)
    rows = cur.fetchall()
    t_agg = time.perf_counter() - t0
    print(f"  [+] Aggregation (Filter + Group + Avg + Sort): {t_agg*1000:.2f} ms ({len(rows)} groups)")
    
    conn.close()
    return {
        "insert_ops": insert_ops,
        "idx_ms": t_idx * 1000,
        "lookup_ops": lookup_ops,
        "range_ops": range_ops,
        "agg_ms": t_agg * 1000
    }

def main():
    print("==================================================")
    print("   DocLite vs SQLite JSON1 Comparative Benchmark")
    print("==================================================")
    
    N_DOCS = 10000
    N_QUERIES = 2000
    
    print(f"Generating {N_DOCS} sample documents...\n")
    docs = generate_sample_docs(N_DOCS)
    
    doclite_results = benchmark_doclite(docs, query_count=N_QUERIES)
    sqlite_results = benchmark_sqlite_json(docs, query_count=N_QUERIES)
    
    print("\n====================================================================================")
    print("                              COMPARATIVE RESULTS SUMMARY")
    print("====================================================================================")
    print(f"{'Benchmark Metric':<32} | {'DocLite (Embedded)':<20} | {'SQLite (JSON1)':<18} | {'Advantage'}")
    print("-" * 84)
    
    # Inserts
    ins_ratio = doclite_results['insert_ops'] / max(sqlite_results['insert_ops'], 1)
    print(f"{'Batch Insert Throughput':<32} | {doclite_results['insert_ops']:>14,.0f} docs/s | {sqlite_results['insert_ops']:>12,.0f} docs/s | Native Document Store")
    
    # Index Creation
    print(f"{'B+Tree Index Build Time':<32} | {doclite_results['idx_ms']:>14.2f} ms     | {sqlite_results['idx_ms']:>12.2f} ms   | Dedicated B+Tree")
    
    # Point Lookups
    print(f"{'Indexed Point Lookups':<32} | {doclite_results['lookup_ops']:>14,.0f} qps    | {sqlite_results['lookup_ops']:>12,.0f} qps  | Direct O(log N) RID")
    
    # Range Queries
    print(f"{'Indexed Range Query Rate':<32} | {doclite_results['range_ops']:>14,.0f} qps    | {sqlite_results['range_ops']:>12,.0f} qps  | Leaf-chained Scan")
    
    # Aggregation
    print(f"{'Aggregation Pipeline Latency':<32} | {doclite_results['agg_ms']:>14.2f} ms     | {sqlite_results['agg_ms']:>12.2f} ms   | Mongo Pipeline DSL")
    print("=" * 84)

if __name__ == "__main__":
    main()
