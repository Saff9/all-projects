"""
Integration test for DocLite Python Driver
"""
import os
import sys

# Add python directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

from doclite import DocLite

def test_python_driver():
    print("Testing DocLite Python Driver...")
    with DocLite() as db:
        users = db.users
        
        # 1. Single Insert
        uid = users.insert_one({"name": "Grace Hopper", "year": 1906, "pioneer": True})
        print(f"  [OK] Inserted document ID: {uid}")
        assert len(uid) == 24
        
        # 2. Batch Insert
        ids = users.insert_many([
            {"name": "Ada Lovelace", "year": 1815, "pioneer": True},
            {"name": "Alan Turing", "year": 1912, "pioneer": True},
            {"name": "Claude Shannon", "year": 1916, "pioneer": True},
        ])
        print(f"  [OK] Batch inserted {len(ids)} documents: {ids}")
        assert len(ids) == 3
        
        # 3. Count Documents
        total = users.count_documents()
        print(f"  [OK] Total documents: {total}")
        assert total == 4
        
        # 4. Create Secondary Index
        users.create_index(["name"], unique=True)
        print("  [OK] Unique index created on 'name'")
        
        # 5. Point Find One with Index Scan
        doc = users.find_one({"name": "Grace Hopper"})
        print(f"  [OK] Found document: {doc}")
        assert doc["name"] == "Grace Hopper"
        assert doc["year"] == 1906
        
        # 6. Range Query with Operator ($gte)
        results = users.find({"year": {"$gte": 1900}})
        print(f"  [OK] Query returned {len(results)} records")
        assert len(results) == 3
        
        # 7. Update Operator ($set)
        mod_count = users.update_one({"name": "Ada Lovelace"}, {"$set": {"award": "First Programmer"}})
        print(f"  [OK] Updated {mod_count} document")
        assert mod_count == 1
        ada = users.find_one({"name": "Ada Lovelace"})
        assert ada.get("award") == "First Programmer"
        
        # 8. Aggregation Pipeline
        agg = users.aggregate([
            {"$match": {"pioneer": True}},
            {"$group": {"_id": "$pioneer", "avg_year": {"$avg": "$year"}, "total": {"$count": None}}},
        ])
        print(f"  [OK] Aggregation result: {agg}")
        assert len(agg) == 1
        assert agg[0]["total"] == 4
        
        # 9. Delete One
        del_count = users.delete_one({"name": "Claude Shannon"})
        print(f"  [OK] Deleted {del_count} document")
        assert del_count == 1
        assert users.count_documents() == 3
        
        # 10. Checkpoint
        db.checkpoint()
        print("  [OK] Checkpoint executed successfully")
        
    print("\n[OK] All Python Driver integration tests passed with 100% success!\n")

if __name__ == "__main__":
    test_python_driver()
