#!/usr/bin/env python3
"""
DocLite Python Quickstart Example

Usage:
    python examples/python_quickstart.py
"""

import os
import sys

# Add python directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

from doclite import DocLite

def main():
    print("=== DocLite Python Quickstart ===")

    # 1. Connect to local database file (or in-memory if no path is given)
    with DocLite("quickstart_python.docdb") as db:
        products = db.products

        # 2. Create index on SKU
        products.create_index(["sku"], unique=True)
        print("[+] Unique index created on 'sku'")

        # 3. Batch insert products
        items = [
            {"sku": "LAPTOP-01", "name": "ThinkPad X1", "price": 1499.99, "stock": 25, "category": "electronics"},
            {"sku": "PHONE-02", "name": "Pixel 9 Pro", "price": 999.00, "stock": 50, "category": "electronics"},
            {"sku": "BOOK-03", "name": "Rust Programming", "price": 49.50, "stock": 100, "category": "books"},
        ]
        ids = products.insert_many(items)
        print(f"[+] Inserted {len(ids)} products")

        # 4. Point lookup using B+Tree index scan
        laptop = products.find_one({"sku": "LAPTOP-01"})
        print(f"\n--- Point Lookup: {laptop['name']} ---")
        print(f"  Price: ${laptop['price']}, Stock: {laptop['stock']}")

        # 5. Filter Query ($gte, $in)
        print("\n--- Query: Electronics >= $500 ---")
        expensive_tech = products.find({
            "category": "electronics",
            "price": {"$gte": 500.0}
        })
        for item in expensive_tech:
            print(f"  - {item['name']}: ${item['price']}")

        # 6. Update Product
        products.update_one(
            {"sku": "PHONE-02"},
            {"$inc": {"stock": -5}}  # Sold 5 units
        )
        print("\n[+] Stock updated for Pixel 9 Pro")

        # 7. Aggregation Pipeline
        print("\n--- Category Inventory Report ---")
        report = products.aggregate([
            {"$group": {
                "_id": "$category",
                "avg_price": {"$avg": "$price"},
                "total_items": {"$sum": "$stock"}
            }},
            {"$sort": {"total_items": -1}}
        ])
        for row in report:
            print(f"  Category: {row['_id']} | Avg Price: ${row['avg_price']:.2f} | In Stock: {row['total_items']}")

        # 8. Checkpoint WAL
        db.checkpoint()
        print("\n[+] Checkpoint completed. Saved to 'quickstart_python.docdb'.")

if __name__ == "__main__":
    main()
