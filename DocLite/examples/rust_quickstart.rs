//! DocLite Quickstart Example in Rust
//!
//! To run this example:
//! ```bash
//! cargo run --example rust_quickstart
//! ```

use doclite::{Database, DocValue};
use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== DocLite Rust Quickstart ===");

    // 1. Open or create a local database file (or Database::open_in_memory())
    let db = Database::open("quickstart_demo.docdb")?;
    let users = db.collection("users")?;

    // 2. Create a unique secondary index on the "email" field
    users.create_index(vec!["email".to_string()], true)?;
    println!("✓ Unique index created on 'email'");

    // 3. Insert documents
    let doc1 = DocValue::from_json(&json!({
        "name": "Alice Cooper",
        "email": "alice@music.com",
        "age": 28,
        "role": "artist",
        "tags": ["rock", "metal", "audio"]
    }));
    let id1 = users.insert_one(doc1)?;
    println!("✓ Inserted document ID: {}", id1);

    let doc2 = DocValue::from_json(&json!({
        "name": "Bob Dylan",
        "email": "bob@music.com",
        "age": 82,
        "role": "legend",
        "tags": ["folk", "poetry", "acoustic"]
    }));
    let id2 = users.insert_one(doc2)?;
    println!("✓ Inserted document ID: {}", id2);

    // 4. Query documents using MongoDB filter syntax
    println!("\n--- Querying users (age >= 25) ---");
    let filter = DocValue::from_json(&json!({
        "age": { "$gte": 25 }
    }));
    let cursor = users.find(filter)?;
    for user in cursor {
        println!("  Matched: {}", user);
    }

    // 5. Point lookup using index scan
    println!("\n--- Point lookup by unique email ---");
    let point_doc = users.find_one(DocValue::from_json(&json!({ "email": "alice@music.com" })))?;
    if let Some(user) = point_doc {
        println!("  Found Alice: {}", user);
    }

    // 6. Update with atomic modifiers
    users.update_one(
        DocValue::from_json(&json!({ "email": "alice@music.com" })),
        DocValue::from_json(&json!({
            "$inc": { "age": 1 },
            "$push": { "tags": "hall_of_fame" }
        })),
        false,
    )?;
    println!("✓ Alice's record updated");

    // 7. Multi-stage Aggregation Pipeline
    println!("\n--- Aggregation Pipeline ---");
    let pipeline = vec![
        DocValue::from_json(&json!({ "$match": { "age": { "$gte": 20 } } })),
        DocValue::from_json(&json!({
            "$group": {
                "_id": "$role",
                "avg_age": { "$avg": "$age" },
                "count": { "$count": null }
            }
        })),
        DocValue::from_json(&json!({ "$sort": { "count": -1 } })),
    ];
    let agg_results = users.aggregate(pipeline)?;
    for bucket in agg_results {
        println!("  Role Group: {}", bucket);
    }

    // 8. Durably checkpoint WAL to disk
    db.checkpoint()?;
    println!("\n✓ Checkpoint completed. All changes committed to 'quickstart_demo.docdb'.");

    Ok(())
}
