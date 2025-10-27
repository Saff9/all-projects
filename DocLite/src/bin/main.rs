use std::path::PathBuf;
use std::time::Instant;
use clap::{Parser, Subcommand};
use colored::*;
use rustyline::error::ReadlineError;
use rustyline::DefaultEditor;
use doclite::engine::db::Database;
use doclite::value::types::DocValue;

#[derive(Parser)]
#[command(name = "doclite")]
#[command(about = "DocLite: Fast, serverless embedded NoSQL document database engine", long_about = None)]
struct Cli {
    /// Path to the database file (defaults to ':memory:' if omitted)
    #[arg(short, long, default_value = "database.docdb")]
    db: String,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Run an interactive REPL shell (default)
    Shell,
    /// Query documents from a collection
    Query {
        /// Collection name
        collection: String,
        /// Filter JSON string (e.g. '{"age": {"$gte": 21}}')
        #[arg(default_value = "{}")]
        filter: String,
    },
    /// Insert a document into a collection
    Insert {
        /// Collection name
        collection: String,
        /// Document JSON string
        doc: String,
    },
    /// Execute an aggregation pipeline
    Aggregate {
        /// Collection name
        collection: String,
        /// Pipeline JSON array (e.g. '[{"$match": ...}, {"$group": ...}]')
        pipeline: String,
    },
    /// Show database and collection statistics
    Stats,
    /// Run performance benchmark
    Bench {
        /// Number of documents to insert and query
        #[arg(short, long, default_value_t = 10000)]
        count: usize,
    },
    /// Export database to JSON file
    Export {
        /// Output file path
        output: PathBuf,
    },
    /// Import JSON array into a collection
    Import {
        /// Collection name
        collection: String,
        /// Input file path
        input: PathBuf,
    },
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    let db = if cli.db == ":memory:" {
        Database::open_in_memory()?
    } else {
        Database::open(&cli.db)?
    };

    match cli.command {
        Some(Commands::Shell) | None => run_repl(db.clone(), &cli.db)?,
        Some(Commands::Query { collection, filter }) => {
            let coll = db.collection(&collection)?;
            let filter_json: serde_json::Value = serde_json::from_str(&filter)?;
            let filter_doc = DocValue::from_json(&filter_json);
            let cursor = coll.find(filter_doc)?;
            let docs = cursor.to_vec();
            let count = docs.len();
            for doc in &docs {
                println!("{}", doc.to_json_string(true));
            }
            println!("{}", format!("(Found {} documents)", count).green());
        }
        Some(Commands::Insert { collection, doc }) => {
            let coll = db.collection(&collection)?;
            let json_val: serde_json::Value = serde_json::from_str(&doc)?;
            let doc_val = DocValue::from_json(&json_val);
            let id = coll.insert_one(doc_val)?;
            println!("{} Inserted with _id: {}", "✓".green(), id.to_hex().cyan());
        }
        Some(Commands::Aggregate { collection, pipeline }) => {
            let coll = db.collection(&collection)?;
            let pipe_json: serde_json::Value = serde_json::from_str(&pipeline)?;
            let pipe_arr = match DocValue::from_json(&pipe_json) {
                DocValue::Array(arr) => arr,
                _ => return Err("Pipeline must be a JSON array".into()),
            };
            let results = coll.aggregate(pipe_arr)?;
            for doc in &results {
                println!("{}", doc.to_json_string(true));
            }
            println!("{}", format!("(Aggregated {} results)", results.len()).green());
        }
        Some(Commands::Stats) => {
            let stats = db.stats()?;
            println!("{}", "=== DocLite Database Statistics ===".bold().cyan());
            println!("  Total Pages:        {}", stats.total_pages);
            println!("  Page Size:          {} bytes", stats.page_size);
            println!("  Collections:        {}", stats.collections_count);
            println!("  Total Documents:    {}", stats.total_documents);
            println!("\n{}", "=== Collections ===".bold().cyan());
            for name in db.list_collections() {
                let coll = db.collection(&name)?;
                let c_stats = coll.stats()?;
                println!("  * {}: {} docs (Pages: {}, Indexes: {})",
                    name.bold(),
                    c_stats.count.to_string().yellow(),
                    c_stats.total_pages,
                    c_stats.indexes.join(", ")
                );
            }
        }
        Some(Commands::Bench { count }) => {
            run_benchmark(&db, count)?;
        }
        Some(Commands::Export { output }) => {
            db.export_json(&output)?;
            println!("{} Successfully exported database to {}", "✓".green(), output.display());
        }
        Some(Commands::Import { collection, input }) => {
            let imported = db.import_json(&collection, &input)?;
            println!("{} Successfully imported {} documents into collection '{}'", "✓".green(), imported, collection);
        }
    }

    db.checkpoint()?;
    Ok(())
}

fn run_benchmark(db: &Database, count: usize) -> Result<(), Box<dyn std::error::Error>> {
    println!("{}", "==================================================".cyan());
    println!("{}", format!("   DocLite High-Throughput Benchmark ({} ops)", count).bold().cyan());
    println!("{}", "==================================================".cyan());

    let coll = db.collection("bench_users")?;

    // 1. Benchmark Sequential Inserts
    let t0 = Instant::now();
    for i in 0..count {
        let doc = DocValue::Object(vec![
            ("seq".to_string(), DocValue::Int32(i as i32)),
            ("username".to_string(), DocValue::String(format!("user_{:06}", i))),
            ("age".to_string(), DocValue::Int32(18 + (i % 60) as i32)),
            ("score".to_string(), DocValue::Float64(50.0 + (i % 50) as f64)),
            ("active".to_string(), DocValue::Bool(i % 2 == 0)),
        ]);
        coll.insert_one(doc)?;
    }
    let dur_insert = t0.elapsed();
    let insert_ops = count as f64 / dur_insert.as_secs_f64();
    println!("  {} Inserts:       {:.2?} ({:.0} ops/sec)", "✓".green(), dur_insert, insert_ops);

    // 2. Benchmark Index Creation
    let t1 = Instant::now();
    coll.create_index(vec!["age".to_string()], false)?;
    let dur_idx = t1.elapsed();
    println!("  {} Index Build:   {:.2?}", "✓".green(), dur_idx);

    // 3. Benchmark Indexed Range Queries
    let t2 = Instant::now();
    let query_runs = 1000.min(count);
    let mut total_found = 0;
    for i in 0..query_runs {
        let min_age = 25 + (i % 20) as i32;
        let filter = DocValue::Object(vec![
            ("age".to_string(), DocValue::Object(vec![
                ("$gte".to_string(), DocValue::Int32(min_age)),
                ("$lte".to_string(), DocValue::Int32(min_age + 2)),
            ])),
        ]);
        let cursor = coll.find(filter)?;
        total_found += cursor.count();
    }
    let dur_query = t2.elapsed();
    let query_ops = query_runs as f64 / dur_query.as_secs_f64();
    println!("  {} Index Queries: {:.2?} ({:.0} queries/sec, matched {} docs)", "✓".green(), dur_query, query_ops, total_found);

    // 4. Benchmark Aggregation Pipeline
    let t3 = Instant::now();
    let pipeline = vec![
        DocValue::Object(vec![
            ("$match".to_string(), DocValue::Object(vec![
                ("active".to_string(), DocValue::Bool(true)),
            ])),
        ]),
        DocValue::Object(vec![
            ("$group".to_string(), DocValue::Object(vec![
                ("_id".to_string(), DocValue::String("$age".to_string())),
                ("avg_score".to_string(), DocValue::Object(vec![
                    ("$avg".to_string(), DocValue::String("$score".to_string())),
                ])),
                ("total_users".to_string(), DocValue::Object(vec![
                    ("$count".to_string(), DocValue::Null),
                ])),
            ])),
        ]),
        DocValue::Object(vec![
            ("$sort".to_string(), DocValue::Object(vec![
                ("_id".to_string(), DocValue::Int32(1)),
            ])),
        ]),
    ];
    let agg_res = coll.aggregate(pipeline)?;
    let dur_agg = t3.elapsed();
    println!("  {} Aggregation:   {:.2?} (grouped into {} buckets)", "✓".green(), dur_agg, agg_res.len());

    println!("{}", "==================================================".cyan());
    println!("{}", "   Benchmark Complete!".bold().green());
    println!("{}", "==================================================".cyan());
    Ok(())
}

fn run_repl(db: Database, db_name: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("{}", "╔════════════════════════════════════════════════════════════╗".bold().cyan());
    println!("{}", "║              DocLite Interactive Database REPL             ║".bold().cyan());
    println!("{}", "║      Serverless NoSQL Document DB with Full ACID & WAL     ║".bold().cyan());
    println!("{}", "║       Type 'help' for commands, 'exit' to quit shell       ║".bold().cyan());
    println!("{}", "╚════════════════════════════════════════════════════════════╝".bold().cyan());

    let mut rl = DefaultEditor::new()?;
    let mut current_collection = "users".to_string();

    loop {
        let prompt = format!("{}[{}:{}]> ", "doclite".bold().cyan(), db_name.yellow(), current_collection.green());
        let readline = rl.readline(&prompt);

        match readline {
            Ok(line) => {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }
                let _ = rl.add_history_entry(trimmed);

                if trimmed == "exit" || trimmed == "quit" {
                    println!("{}", "Goodbye!".cyan());
                    break;
                } else if trimmed == "help" {
                    print_help();
                } else if trimmed.starts_with("use ") {
                    let parts: Vec<&str> = trimmed.split_whitespace().collect();
                    if parts.len() == 2 {
                        current_collection = parts[1].to_string();
                        println!("Switched to collection '{}'", current_collection.green());
                    } else {
                        println!("{}", "Usage: use <collection_name>".yellow());
                    }
                } else if trimmed == "show collections" || trimmed == "collections" {
                    let colls = db.list_collections();
                    println!("{}", "Collections:".bold());
                    for c in colls {
                        println!("  * {}", c.green());
                    }
                } else if trimmed == "stats" {
                    let stats = db.stats()?;
                    println!("Total Pages: {}, Collections: {}, Total Docs: {}", stats.total_pages, stats.collections_count, stats.total_documents);
                } else if trimmed == "compact" {
                    db.compact()?;
                    println!("{} Database defragmented and compacted.", "✓".green());
                } else if trimmed == "checkpoint" {
                    db.checkpoint()?;
                    println!("{} Checkpoint completed. WAL flushed and truncated.", "✓".green());
                } else if trimmed.starts_with("insert ") {
                    let json_str = &trimmed[7..];
                    match serde_json::from_str::<serde_json::Value>(json_str) {
                        Ok(v) => {
                            let doc = DocValue::from_json(&v);
                            let coll = db.collection(&current_collection)?;
                            let id = coll.insert_one(doc)?;
                            println!("{} Inserted: {}", "✓".green(), id.to_hex().cyan());
                        }
                        Err(e) => println!("{} Invalid JSON: {}", "Error:".red(), e),
                    }
                } else if trimmed.starts_with("find") {
                    let json_str = if trimmed.len() > 4 { trimmed[4..].trim() } else { "{}" };
                    let json_str = if json_str.is_empty() { "{}" } else { json_str };
                    match serde_json::from_str::<serde_json::Value>(json_str) {
                        Ok(v) => {
                            let filter = DocValue::from_json(&v);
                            let coll = db.collection(&current_collection)?;
                            let cursor = coll.find(filter)?;
                            let docs = cursor.to_vec();
                            let count = docs.len();
                            for doc in &docs {
                                println!("{}", doc.to_json_string(true));
                            }
                            println!("{}", format!("(Found {} documents)", count).green());
                        }
                        Err(e) => println!("{} Invalid JSON: {}", "Error:".red(), e),
                    }
                } else if trimmed.starts_with("delete ") {
                    let json_str = &trimmed[7..];
                    match serde_json::from_str::<serde_json::Value>(json_str) {
                        Ok(v) => {
                            let filter = DocValue::from_json(&v);
                            let coll = db.collection(&current_collection)?;
                            let res = coll.delete_many(filter)?;
                            println!("{} Deleted {} documents", "✓".green(), res.deleted_count);
                        }
                        Err(e) => println!("{} Invalid JSON: {}", "Error:".red(), e),
                    }
                } else if trimmed.starts_with("index ") {
                    let field = trimmed[6..].trim();
                    let coll = db.collection(&current_collection)?;
                    coll.create_index(vec![field.to_string()], false)?;
                    println!("{} Created index on field '{}'", "✓".green(), field);
                } else {
                    println!("{} Unknown command '{}'. Type 'help' for available commands.", "Unknown:".yellow(), trimmed);
                }
            }
            Err(ReadlineError::Interrupted) | Err(ReadlineError::Eof) => {
                println!("{}", "Goodbye!".cyan());
                break;
            }
            Err(err) => {
                println!("Error: {:?}", err);
                break;
            }
        }
    }

    Ok(())
}

fn print_help() {
    println!("{}", "\nAvailable REPL Commands:".bold().cyan());
    println!("  {}                - Switch active collection", "use <collection>".yellow());
    println!("  {}       - List all collections", "show collections".yellow());
    println!("  {}        - Insert document (e.g. insert {{\"name\": \"Alice\"}})", "insert <json>".yellow());
    println!("  {}          - Query documents (e.g. find {{\"age\": {{\"$gt\": 20}}}})", "find [<json>]".yellow());
    println!("  {}        - Delete documents matching filter", "delete <json>".yellow());
    println!("  {}         - Create secondary index on field", "index <field>".yellow());
    println!("  {}                 - Display database statistics", "stats".yellow());
    println!("  {}               - Defragment pages across collections", "compact".yellow());
    println!("  {}            - Durably checkpoint WAL to disk", "checkpoint".yellow());
    println!("  {}                  - Display this help message", "help".yellow());
    println!("  {}                  - Exit the REPL\n", "exit / quit".yellow());
}
