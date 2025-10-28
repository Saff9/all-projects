pub mod aggregation;
pub mod catalog;
pub mod engine;
pub mod error;
pub mod ffi;
pub mod index;
pub mod query;
pub mod storage;
pub mod update;
pub mod value;
pub mod wal;

// Re-export primary user-facing types
pub use engine::{Collection, CollectionStats, Cursor, Database, DatabaseStats, DeleteResult, Transaction, UpdateResult};
pub use error::{DocError, Result};
pub use index::IndexKey;
pub use query::{ExplainPlan, QueryFilter, ScanType};
pub use value::{ObjectId, DocValue, ValueCodec};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crud_and_query_operators() {
        let db = Database::open_in_memory().unwrap();
        let coll = db.collection("users").unwrap();

        let doc1 = DocValue::Object(vec![
            ("name".to_string(), DocValue::String("Alice".to_string())),
            ("age".to_string(), DocValue::Int32(28)),
            ("city".to_string(), DocValue::String("New York".to_string())),
            ("tags".to_string(), DocValue::Array(vec![
                DocValue::String("rust".to_string()),
                DocValue::String("developer".to_string()),
            ])),
        ]);

        let doc2 = DocValue::Object(vec![
            ("name".to_string(), DocValue::String("Bob".to_string())),
            ("age".to_string(), DocValue::Int32(35)),
            ("city".to_string(), DocValue::String("San Francisco".to_string())),
            ("tags".to_string(), DocValue::Array(vec![
                DocValue::String("manager".to_string()),
            ])),
        ]);

        let id1 = coll.insert_one(doc1).unwrap();
        let id2 = coll.insert_one(doc2).unwrap();

        assert_ne!(id1, id2);

        // Find by exact match
        let found = coll.find_one(DocValue::Object(vec![
            ("name".to_string(), DocValue::String("Alice".to_string())),
        ])).unwrap().unwrap();
        assert_eq!(found.get("name").unwrap().as_str().unwrap(), "Alice");
        assert_eq!(found.get("age").unwrap().as_i64().unwrap(), 28);

        // Query with $gte operator
        let results = coll.find(DocValue::Object(vec![
            ("age".to_string(), DocValue::Object(vec![
                ("$gte".to_string(), DocValue::Int32(30)),
            ])),
        ])).unwrap().to_vec();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].get("name").unwrap().as_str().unwrap(), "Bob");

        // Query with $in array operator
        let in_results = coll.find(DocValue::Object(vec![
            ("tags".to_string(), DocValue::Object(vec![
                ("$in".to_string(), DocValue::Array(vec![DocValue::String("rust".to_string())])),
            ])),
        ])).unwrap().to_vec();
        assert_eq!(in_results.len(), 1);
        assert_eq!(in_results[0].get("name").unwrap().as_str().unwrap(), "Alice");

        // Update with $inc and $set
        let update_res = coll.update_one(
            DocValue::Object(vec![("name".to_string(), DocValue::String("Alice".to_string()))]),
            DocValue::Object(vec![
                ("$inc".to_string(), DocValue::Object(vec![("age".to_string(), DocValue::Int32(1))])),
                ("$set".to_string(), DocValue::Object(vec![("city".to_string(), DocValue::String("Boston".to_string()))])),
            ]),
            false,
        ).unwrap();
        assert_eq!(update_res.modified_count, 1);

        let updated_alice = coll.find_one(DocValue::Object(vec![
            ("name".to_string(), DocValue::String("Alice".to_string())),
        ])).unwrap().unwrap();
        assert_eq!(updated_alice.get("age").unwrap().as_i64().unwrap(), 29);
        assert_eq!(updated_alice.get("city").unwrap().as_str().unwrap(), "Boston");

        // Delete one
        let del_res = coll.delete_one(DocValue::Object(vec![
            ("name".to_string(), DocValue::String("Bob".to_string())),
        ])).unwrap();
        assert_eq!(del_res.deleted_count, 1);
        assert_eq!(coll.count_documents(DocValue::Null).unwrap(), 1);
    }

    #[test]
    fn test_btree_indexing_and_unique_constraints() {
        let db = Database::open_in_memory().unwrap();
        let coll = db.collection("products").unwrap();

        coll.create_index(vec!["sku".to_string()], true).unwrap();

        let p1 = DocValue::Object(vec![
            ("sku".to_string(), DocValue::String("PROD-001".to_string())),
            ("title".to_string(), DocValue::String("Mechanical Keyboard".to_string())),
            ("price".to_string(), DocValue::Float64(129.99)),
        ]);
        coll.insert_one(p1).unwrap();

        let p2 = DocValue::Object(vec![
            ("sku".to_string(), DocValue::String("PROD-002".to_string())),
            ("title".to_string(), DocValue::String("Gaming Mouse".to_string())),
            ("price".to_string(), DocValue::Float64(79.99)),
        ]);
        coll.insert_one(p2).unwrap();

        // Duplicate SKU insert should fail with DuplicateKey
        let p_dup = DocValue::Object(vec![
            ("sku".to_string(), DocValue::String("PROD-001".to_string())),
            ("title".to_string(), DocValue::String("Duplicate Item".to_string())),
            ("price".to_string(), DocValue::Float64(9.99)),
        ]);
        let err = coll.insert_one(p_dup).unwrap_err();
        match err {
            DocError::DuplicateKey { .. } => {}
            other => panic!("Expected DuplicateKey error, got: {:?}", other),
        }

        // Verify index scan acceleration
        let cursor = coll.find(DocValue::Object(vec![
            ("sku".to_string(), DocValue::String("PROD-002".to_string())),
        ])).unwrap();
        let plan = cursor.explain().unwrap();
        assert!(matches!(plan.scan_type, crate::query::ScanType::IndexScan { .. }));
    }

    #[test]
    fn test_aggregation_pipeline() {
        let db = Database::open_in_memory().unwrap();
        let coll = db.collection("orders").unwrap();

        coll.insert_one(DocValue::Object(vec![
            ("customer".to_string(), DocValue::String("Alice".to_string())),
            ("category".to_string(), DocValue::String("Electronics".to_string())),
            ("amount".to_string(), DocValue::Float64(150.0)),
            ("items".to_string(), DocValue::Array(vec![
                DocValue::String("Headphones".to_string()),
                DocValue::String("Cable".to_string()),
            ])),
        ])).unwrap();

        coll.insert_one(DocValue::Object(vec![
            ("customer".to_string(), DocValue::String("Bob".to_string())),
            ("category".to_string(), DocValue::String("Electronics".to_string())),
            ("amount".to_string(), DocValue::Float64(300.0)),
            ("items".to_string(), DocValue::Array(vec![
                DocValue::String("Monitor".to_string()),
            ])),
        ])).unwrap();

        coll.insert_one(DocValue::Object(vec![
            ("customer".to_string(), DocValue::String("Alice".to_string())),
            ("category".to_string(), DocValue::String("Books".to_string())),
            ("amount".to_string(), DocValue::Float64(50.0)),
            ("items".to_string(), DocValue::Array(vec![
                DocValue::String("Rust Book".to_string()),
            ])),
        ])).unwrap();

        // Group by category, calculating sum(amount) and count
        let pipeline = vec![
            DocValue::Object(vec![
                ("$group".to_string(), DocValue::Object(vec![
                    ("_id".to_string(), DocValue::String("$category".to_string())),
                    ("total_sales".to_string(), DocValue::Object(vec![
                        ("$sum".to_string(), DocValue::String("$amount".to_string())),
                    ])),
                    ("order_count".to_string(), DocValue::Object(vec![
                        ("$count".to_string(), DocValue::Null),
                    ])),
                ])),
            ]),
            DocValue::Object(vec![
                ("$sort".to_string(), DocValue::Object(vec![
                    ("total_sales".to_string(), DocValue::Int32(-1)),
                ])),
            ]),
        ];

        let results = coll.aggregate(pipeline).unwrap();
        assert_eq!(results.len(), 2);

        let first = &results[0];
        assert_eq!(first.get("_id").unwrap().as_str().unwrap(), "Electronics");
        assert_eq!(first.get("total_sales").unwrap().as_f64().unwrap(), 450.0);
        assert_eq!(first.get("order_count").unwrap().as_i64().unwrap(), 2);
    }

    #[test]
    fn test_large_document_overflow() {
        let db = Database::open_in_memory().unwrap();
        let coll = db.collection("large_docs").unwrap();

        // Create a 20KB text field
        let huge_content = "DocLite Embedded Engine - High Performance Systems ".repeat(400);
        let doc = DocValue::Object(vec![
            ("title".to_string(), DocValue::String("Large Document Payload".to_string())),
            ("payload".to_string(), DocValue::String(huge_content.clone())),
        ]);

        let id = coll.insert_one(doc).unwrap();

        let fetched = coll.find_one(DocValue::Object(vec![
            ("_id".to_string(), DocValue::ObjectId(id)),
        ])).unwrap().unwrap();

        assert_eq!(fetched.get("title").unwrap().as_str().unwrap(), "Large Document Payload");
        assert_eq!(fetched.get("payload").unwrap().as_str().unwrap(), huge_content);
    }

    #[test]
    fn test_disk_persistence_and_wal_recovery() {
        let tmp_dir = std::env::temp_dir().join(format!("doclite_test_{}", ObjectId::new().to_hex()));
        std::fs::create_dir_all(&tmp_dir).unwrap();
        let db_path = tmp_dir.join("persist_test.docdb");

        {
            let db = Database::open(&db_path).unwrap();
            let coll = db.collection("accounts").unwrap();
            coll.insert_one(DocValue::Object(vec![
                ("username".to_string(), DocValue::String("charlie".to_string())),
                ("balance".to_string(), DocValue::Int32(1000)),
            ])).unwrap();
            coll.insert_one(DocValue::Object(vec![
                ("username".to_string(), DocValue::String("david".to_string())),
                ("balance".to_string(), DocValue::Int32(2500)),
            ])).unwrap();
            // Checkpoint WAL
            db.checkpoint().unwrap();
        }

        // Re-open database from disk
        {
            let db = Database::open(&db_path).unwrap();
            let coll = db.collection("accounts").unwrap();
            assert_eq!(coll.count_documents(DocValue::Null).unwrap(), 2);

            let charlie = coll.find_one(DocValue::Object(vec![
                ("username".to_string(), DocValue::String("charlie".to_string())),
            ])).unwrap().unwrap();
            assert_eq!(charlie.get("balance").unwrap().as_i64().unwrap(), 1000);
        }

        let _ = std::fs::remove_dir_all(&tmp_dir);
    }
}
