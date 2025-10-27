use std::fs::File;
use std::io::{BufReader, BufWriter, Write};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use crate::catalog::Catalog;
use crate::engine::collection::Collection;
use crate::engine::tx::Transaction;
use crate::error::{DocError, Result};
use crate::storage::buffer_pool::{BufferPool, DEFAULT_POOL_CAPACITY};
use crate::storage::page::INVALID_PAGE_ID;
use crate::storage::pager::Pager;
use crate::storage::slotted_page::SlottedPage;
use crate::value::types::DocValue;
use crate::wal::log::Wal;
use crate::wal::recovery::RecoveryEngine;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseStats {
    pub total_pages: u32,
    pub page_size: u32,
    pub collections_count: usize,
    pub total_documents: u64,
}

#[derive(Clone)]
pub struct Database {
    pub(crate) buffer_pool: BufferPool,
    pub(crate) catalog: Arc<RwLock<Catalog>>,
    pub(crate) wal: Arc<Wal>,
    pub(crate) db_path: Option<PathBuf>,
}

impl Database {
    /// Return the database file path on disk, or None if in-memory.
    pub fn path(&self) -> Option<&Path> {
        self.db_path.as_deref()
    }

    /// Open an existing database or create a new one at the specified file path.
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        let path_buf = path.as_ref().to_path_buf();
        let wal_path = format!("{}-wal", path_buf.display());

        let mut pager = Pager::open(&path_buf)?;

        // Run crash recovery on startup
        let last_lsn = RecoveryEngine::recover_from_path(&wal_path, &mut pager)?;

        let wal = Wal::open(&wal_path)?;
        if last_lsn > 0 {
            wal.set_last_lsn(last_lsn);
        }

        let buffer_pool = BufferPool::new(pager, DEFAULT_POOL_CAPACITY);

        // Load catalog root page ID from header
        let catalog_root_page = buffer_pool.read_page(0, |page| {
            crate::storage::page::DbHeader::decode_from_page(page).map(|h| h.catalog_root_page)
        })??;

        let catalog = Catalog::load(catalog_root_page, &buffer_pool)?;

        let db = Self {
            buffer_pool,
            catalog: Arc::new(RwLock::new(catalog)),
            wal: Arc::new(wal),
            db_path: Some(path_buf),
        };

        Ok(db)
    }

    /// Open an in-memory ephemeral database.
    pub fn open_in_memory() -> Result<Self> {
        let pager = Pager::open_in_memory()?;
        let wal = Wal::open_in_memory();
        let buffer_pool = BufferPool::new(pager, DEFAULT_POOL_CAPACITY);
        let catalog = Catalog::new(INVALID_PAGE_ID);

        Ok(Self {
            buffer_pool,
            catalog: Arc::new(RwLock::new(catalog)),
            wal: Arc::new(wal),
            db_path: None,
        })
    }

    /// Get a handle to a collection. Automatically creates the collection if it does not already exist.
    pub fn collection(&self, name: &str) -> Result<Collection> {
        {
            let cat = self.catalog.read();
            if cat.get_collection(name).is_some() {
                return Ok(Collection::new(name, self.buffer_pool.clone(), self.catalog.clone()));
            }
        }

        // Create new collection
        let first_data_page = self.buffer_pool.allocate_page()?;
        self.buffer_pool.write_page(first_data_page, |page| {
            SlottedPage::init(page, INVALID_PAGE_ID, INVALID_PAGE_ID);
        })?;

        {
            let mut cat = self.catalog.write();
            cat.create_collection(name, first_data_page)?;
            let root_cat_page = cat.save(&self.buffer_pool)?;

            // Update header catalog root page
            self.buffer_pool.write_page(0, |header_page| -> Result<()> {
                let mut header = crate::storage::page::DbHeader::decode_from_page(header_page)?;
                header.catalog_root_page = root_cat_page;
                header.encode_to_page(header_page)?;
                Ok(())
            })??;
        }

        self.buffer_pool.flush_all()?;

        Ok(Collection::new(name, self.buffer_pool.clone(), self.catalog.clone()))
    }

    /// List all collection names in the database.
    pub fn list_collections(&self) -> Vec<String> {
        let cat = self.catalog.read();
        cat.data.collections.keys().cloned().collect()
    }

    /// Drop an existing collection and reclaim its storage pages.
    pub fn drop_collection(&self, name: &str) -> Result<()> {
        let mut cat = self.catalog.write();
        let info = cat.drop_collection(name)?;

        // Free data pages
        let mut curr_page = info.first_data_page;
        while curr_page != INVALID_PAGE_ID {
            let next_page = self.buffer_pool.read_page(curr_page, |page| {
                SlottedPage::get_next_page(page)
            })?;
            let _ = self.buffer_pool.free_page(curr_page);
            curr_page = next_page;
        }

        cat.save(&self.buffer_pool)?;
        self.buffer_pool.flush_all()?;
        Ok(())
    }

    /// Begin an ACID transaction.
    pub fn begin_transaction(&self) -> Result<Transaction> {
        let tx_id = self.wal.next_tx_id();
        self.wal.log_begin(tx_id)?;
        Ok(Transaction::new(tx_id, self.wal.clone(), self.buffer_pool.clone()))
    }

    /// Checkpoint WAL: flushes dirty pages to disk and resets WAL space.
    pub fn checkpoint(&self) -> Result<()> {
        self.buffer_pool.flush_all()?;
        self.wal.truncate()?;
        Ok(())
    }

    /// Retrieve database-wide statistics.
    pub fn stats(&self) -> Result<DatabaseStats> {
        let cat = self.catalog.read();
        let coll_count = cat.data.collections.len();
        let total_docs: u64 = cat.data.collections.values().map(|c| c.document_count).sum();

        let (total_pages, page_size) = self.buffer_pool.read_page(0, |page| {
            crate::storage::page::DbHeader::decode_from_page(page).map(|h| (h.total_pages, h.page_size))
        })??;

        Ok(DatabaseStats {
            total_pages,
            page_size,
            collections_count: coll_count,
            total_documents: total_docs,
        })
    }

    /// Compact/defragment all pages in all collections.
    pub fn compact(&self) -> Result<()> {
        let coll_names = self.list_collections();
        for name in coll_names {
            let _coll = self.collection(&name)?;
            let first_page = {
                let cat = self.catalog.read();
                cat.get_collection(&name).unwrap().first_data_page
            };
            let mut curr = first_page;
            while curr != INVALID_PAGE_ID {
                let next = self.buffer_pool.write_page(curr, |page| {
                    SlottedPage::defragment(page);
                    SlottedPage::get_next_page(page)
                })?;
                curr = next;
            }
        }
        self.buffer_pool.flush_all()?;
        Ok(())
    }

    /// Export all collections and their documents to a single JSON file.
    pub fn export_json<P: AsRef<Path>>(&self, path: P) -> Result<()> {
        let file = File::create(path).map_err(DocError::Io)?;
        let mut writer = BufWriter::new(file);

        let mut root = serde_json::Map::new();
        for coll_name in self.list_collections() {
            let coll = self.collection(&coll_name)?;
            let docs = coll.find(DocValue::Null)?.to_vec();
            let json_docs: Vec<serde_json::Value> = docs.iter().map(|d| d.to_json()).collect();
            root.insert(coll_name, serde_json::Value::Array(json_docs));
        }

        serde_json::to_writer_pretty(&mut writer, &serde_json::Value::Object(root))
            .map_err(|e| DocError::Serialization(e.to_string()))?;
        writer.flush().map_err(DocError::Io)?;
        Ok(())
    }

    /// Import an array of JSON documents into a collection.
    pub fn import_json<P: AsRef<Path>>(&self, coll_name: &str, path: P) -> Result<usize> {
        let file = File::open(path).map_err(DocError::Io)?;
        let reader = BufReader::new(file);

        let json_val: serde_json::Value = serde_json::from_reader(reader)
            .map_err(|e| DocError::Serialization(e.to_string()))?;

        let coll = self.collection(coll_name)?;
        let mut count = 0;

        match json_val {
            serde_json::Value::Array(arr) => {
                for item in arr {
                    let doc = DocValue::from_json(&item);
                    coll.insert_one(doc)?;
                    count += 1;
                }
            }
            serde_json::Value::Object(_) => {
                let doc = DocValue::from_json(&json_val);
                coll.insert_one(doc)?;
                count = 1;
            }
            _ => return Err(DocError::Serialization("Expected JSON object or array".to_string())),
        }

        self.buffer_pool.flush_all()?;
        Ok(count)
    }
}
