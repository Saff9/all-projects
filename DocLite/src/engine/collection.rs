use std::sync::Arc;
use std::time::Instant;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use crate::catalog::{Catalog, IndexInfo};
use crate::error::{DocError, Result};
use crate::index::btree::BTree;
use crate::index::key::IndexKey;
use crate::query::filter::QueryFilter;
use crate::query::planner::{ExplainPlan, QueryPlanner, ScanType};
use crate::storage::buffer_pool::BufferPool;
use crate::storage::overflow::OVERFLOW_FLAG;
use crate::storage::page::{PageId, INVALID_PAGE_ID};
use crate::storage::slotted_page::{RecordId, SlottedPage};
use crate::update::operator::UpdateEngine;
use crate::value::codec::ValueCodec;
use crate::value::object_id::ObjectId;
use crate::value::types::DocValue;
use crate::engine::cursor::Cursor;

pub const MAX_INLINE_DOC_SIZE: usize = 3500;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateResult {
    pub matched_count: usize,
    pub modified_count: usize,
    pub upserted_id: Option<ObjectId>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteResult {
    pub deleted_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionStats {
    pub name: String,
    pub count: u64,
    pub total_pages: usize,
    pub indexes: Vec<String>,
}

pub struct Collection {
    pub name: String,
    pub buffer_pool: BufferPool,
    pub catalog: Arc<RwLock<Catalog>>,
}

impl Collection {
    pub fn new(name: impl Into<String>, buffer_pool: BufferPool, catalog: Arc<RwLock<Catalog>>) -> Self {
        Self {
            name: name.into(),
            buffer_pool,
            catalog,
        }
    }

    /// Insert a single document. If `_id` is not present, a new `ObjectId` is automatically generated.
    pub fn insert_one(&self, mut doc: DocValue) -> Result<ObjectId> {
        let doc_obj = doc.as_object_mut().ok_or_else(|| {
            DocError::InvalidUpdate("Inserted document must be a JSON object".to_string())
        })?;

        // Ensure _id exists
        let id = match doc_obj.iter().find(|(k, _)| k == "_id") {
            Some((_, DocValue::ObjectId(oid))) => *oid,
            Some((_, DocValue::String(s))) => ObjectId::parse_str(s).unwrap_or_else(|_| ObjectId::new()),
            _ => {
                let oid = ObjectId::new();
                doc_obj.insert(0, ("_id".to_string(), DocValue::ObjectId(oid)));
                oid
            }
        };

        // Binary encode document
        let encoded = ValueCodec::encode(&doc)?;

        let mut cat = self.catalog.write();
        let coll_info = cat
            .get_collection_mut(&self.name)
            .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;

        let mut target_page_id = coll_info.last_data_page;

        // Handle large document overflow chaining
        let payload_to_store = if encoded.len() > MAX_INLINE_DOC_SIZE {
            // Write overflow chain directly via buffer pool pager
            let first_overflow_id = self.buffer_pool.allocate_page()?;
            let mut ptr_payload = vec![OVERFLOW_FLAG];
            ptr_payload.extend_from_slice(&(encoded.len() as u32).to_le_bytes());
            ptr_payload.extend_from_slice(&first_overflow_id.to_le_bytes());

            // Write chunks into overflow pages
            self.write_overflow_chunks(first_overflow_id, &encoded)?;
            ptr_payload
        } else {
            encoded
        };

        // Attempt to insert record into the last data page
        let mut maybe_slot = self.buffer_pool.write_page(target_page_id, |page| {
            SlottedPage::insert_record(page, &payload_to_store)
        })?;

        if maybe_slot.is_none() {
            // Allocate a new Slotted Data Page and link it
            let new_page_id = self.buffer_pool.allocate_page()?;
            self.buffer_pool.write_page(new_page_id, |new_page| {
                SlottedPage::init(new_page, target_page_id, INVALID_PAGE_ID);
            })?;

            // Update next pointer of current last page
            self.buffer_pool.write_page(target_page_id, |old_page| {
                SlottedPage::set_next_page(old_page, new_page_id);
            })?;

            // Insert into the new page
            maybe_slot = self.buffer_pool.write_page(new_page_id, |page| {
                SlottedPage::insert_record(page, &payload_to_store)
            })?;

            coll_info.last_data_page = new_page_id;
            target_page_id = new_page_id;
        }

        let slot_id = maybe_slot.ok_or_else(|| DocError::Internal("Failed to insert record into freshly allocated page".to_string()))?;
        let rid = RecordId::new(target_page_id, slot_id);

        // Update secondary indexes
        for index in coll_info.indexes.iter_mut() {
            let mut btree = BTree::open(&index.name, index.root_page_id, index.unique, self.buffer_pool.clone());
            let mut key_values = Vec::new();
            for field in &index.fields {
                let val = doc.get_path(field).cloned().unwrap_or(DocValue::Null);
                key_values.push(val);
            }
            let key = IndexKey::new_compound(key_values);

            if let Err(e) = btree.insert(key, rid) {
                // Rollback inserted slot
                let _ = self.buffer_pool.write_page(target_page_id, |page| {
                    SlottedPage::delete_record(page, slot_id);
                });
                return Err(e);
            }
            index.root_page_id = btree.root_page_id;
        }

        coll_info.document_count += 1;
        cat.save(&self.buffer_pool)?;

        Ok(id)
    }

    /// Insert multiple documents in an atomic batch with optimized single catalog commit.
    pub fn insert_many(&self, docs: Vec<DocValue>) -> Result<Vec<ObjectId>> {
        if docs.is_empty() {
            return Ok(Vec::new());
        }

        let count = docs.len();
        let mut ids = Vec::with_capacity(count);

        let mut cat = self.catalog.write();
        let coll_info = cat
            .get_collection_mut(&self.name)
            .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;

        let mut target_page_id = coll_info.last_data_page;

        for mut doc in docs {
            let doc_obj = doc.as_object_mut().ok_or_else(|| {
                DocError::InvalidUpdate("Inserted document must be a JSON object".to_string())
            })?;

            // Ensure _id exists
            let id = match doc_obj.iter().find(|(k, _)| k == "_id") {
                Some((_, DocValue::ObjectId(oid))) => *oid,
                Some((_, DocValue::String(s))) => ObjectId::parse_str(s).unwrap_or_else(|_| ObjectId::new()),
                _ => {
                    let oid = ObjectId::new();
                    doc_obj.insert(0, ("_id".to_string(), DocValue::ObjectId(oid)));
                    oid
                }
            };

            // Binary encode document
            let encoded = ValueCodec::encode(&doc)?;

            // Handle large document overflow chaining
            let payload_to_store = if encoded.len() > MAX_INLINE_DOC_SIZE {
                let first_overflow_id = self.buffer_pool.allocate_page()?;
                let mut ptr_payload = vec![OVERFLOW_FLAG];
                ptr_payload.extend_from_slice(&(encoded.len() as u32).to_le_bytes());
                ptr_payload.extend_from_slice(&first_overflow_id.to_le_bytes());

                self.write_overflow_chunks(first_overflow_id, &encoded)?;
                ptr_payload
            } else {
                encoded
            };

            // Attempt to insert record into the last data page
            let mut maybe_slot = self.buffer_pool.write_page(target_page_id, |page| {
                SlottedPage::insert_record(page, &payload_to_store)
            })?;

            if maybe_slot.is_none() {
                // Allocate a new Slotted Data Page and link it
                let new_page_id = self.buffer_pool.allocate_page()?;
                self.buffer_pool.write_page(new_page_id, |new_page| {
                    SlottedPage::init(new_page, target_page_id, INVALID_PAGE_ID);
                })?;

                self.buffer_pool.write_page(target_page_id, |old_page| {
                    SlottedPage::set_next_page(old_page, new_page_id);
                })?;

                maybe_slot = self.buffer_pool.write_page(new_page_id, |page| {
                    SlottedPage::insert_record(page, &payload_to_store)
                })?;

                coll_info.last_data_page = new_page_id;
                target_page_id = new_page_id;
            }

            let slot_id = maybe_slot.ok_or_else(|| DocError::Internal("Failed to insert record into page".to_string()))?;
            let rid = RecordId::new(target_page_id, slot_id);

            // Update secondary indexes
            for index in coll_info.indexes.iter_mut() {
                let mut btree = BTree::open(&index.name, index.root_page_id, index.unique, self.buffer_pool.clone());
                let mut key_values = Vec::new();
                for field in &index.fields {
                    let val = doc.get_path(field).cloned().unwrap_or(DocValue::Null);
                    key_values.push(val);
                }
                let key = IndexKey::new_compound(key_values);
                btree.insert(key, rid)?;
                index.root_page_id = btree.root_page_id;
            }

            ids.push(id);
        }

        coll_info.document_count += count as u64;
        cat.save(&self.buffer_pool)?;

        Ok(ids)
    }

    /// Find a single document matching the filter with immediate early exit on match.
    pub fn find_one(&self, filter: DocValue) -> Result<Option<DocValue>> {
        let (indexes, first_page) = {
            let cat = self.catalog.read();
            let info = cat
                .get_collection(&self.name)
                .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;
            (info.indexes.clone(), info.first_data_page)
        };

        // Query Optimizer: Attempt index selection
        if let Some(matched_idx) = QueryPlanner::select_index(&filter, &indexes) {
            let index_info = indexes.iter().find(|i| i.name == matched_idx.index_name).unwrap();
            let btree = BTree::open(&index_info.name, index_info.root_page_id, index_info.unique, self.buffer_pool.clone());

            let record_ids = if let Some(exact_k) = &matched_idx.exact_key {
                btree.get_exact(exact_k)?
            } else {
                btree.range_scan(
                    matched_idx.start_key.as_ref(),
                    matched_idx.end_key.as_ref(),
                    matched_idx.include_start,
                    matched_idx.include_end,
                )?
            };

            for rid in record_ids {
                if let Some(doc) = self.read_document_at_record_id(rid)? {
                    if QueryFilter::matches(&doc, &filter)? {
                        return Ok(Some(doc));
                    }
                }
            }

            return Ok(None);
        }

        // Sequential Scan with immediate early exit
        let mut curr_page_id = first_page;
        while curr_page_id != INVALID_PAGE_ID {
            let (next_page_id, page_docs) = self.buffer_pool.read_page(curr_page_id, |page| {
                let slot_count = SlottedPage::get_slot_count(page);
                let next_id = SlottedPage::get_next_page(page);
                let mut raw_records = Vec::new();

                for slot_id in 0..slot_count {
                    if let Some(record_bytes) = SlottedPage::read_record(page, slot_id) {
                        raw_records.push(record_bytes.to_vec());
                    }
                }

                (next_id, raw_records)
            })?;

            for raw in page_docs {
                let doc = self.decode_raw_record_payload(&raw)?;
                if QueryFilter::matches(&doc, &filter)? {
                    return Ok(Some(doc));
                }
            }

            curr_page_id = next_page_id;
        }

        Ok(None)
    }

    /// Fast document count matching filter.
    pub fn count_documents(&self, filter: DocValue) -> Result<usize> {
        if filter.is_null() || filter.as_object().map(|o| o.is_empty()).unwrap_or(false) {
            let cat = self.catalog.read();
            let info = cat
                .get_collection(&self.name)
                .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;
            return Ok(info.document_count as usize);
        }

        let cursor = self.find(filter)?;
        Ok(cursor.count())
    }

    /// Query the collection, utilizing index scans when available or sequential table scans.
    pub fn find(&self, filter: DocValue) -> Result<Cursor> {
        let start_time = Instant::now();

        let (indexes, first_page) = {
            let cat = self.catalog.read();
            let info = cat
                .get_collection(&self.name)
                .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;
            (info.indexes.clone(), info.first_data_page)
        };

        // Query Optimizer: Attempt index selection
        if let Some(matched_idx) = QueryPlanner::select_index(&filter, &indexes) {
            let index_info = indexes.iter().find(|i| i.name == matched_idx.index_name).unwrap();
            let btree = BTree::open(&index_info.name, index_info.root_page_id, index_info.unique, self.buffer_pool.clone());

            let record_ids = if let Some(exact_k) = &matched_idx.exact_key {
                btree.get_exact(exact_k)?
            } else {
                btree.range_scan(
                    matched_idx.start_key.as_ref(),
                    matched_idx.end_key.as_ref(),
                    matched_idx.include_start,
                    matched_idx.include_end,
                )?
            };

            let mut docs = Vec::new();
            let total_keys = record_ids.len();

            for rid in record_ids {
                if let Some(doc) = self.read_document_at_record_id(rid)? {
                    if QueryFilter::matches(&doc, &filter)? {
                        docs.push(doc);
                    }
                }
            }

            let elapsed = start_time.elapsed().as_secs_f64() * 1000.0;
            let plan = ExplainPlan {
                collection: self.name.clone(),
                scan_type: ScanType::IndexScan {
                    index_name: matched_idx.index_name.clone(),
                    is_exact: matched_idx.exact_key.is_some(),
                },
                index_name: Some(matched_idx.index_name),
                filter: filter.to_json(),
                total_keys_examined: total_keys,
                total_docs_examined: docs.len(),
                returned_docs: docs.len(),
                execution_time_ms: elapsed,
            };

            return Ok(Cursor::new(docs, Some(plan)));
        }

        // Sequential Scan fallback
        let mut docs = Vec::new();
        let mut curr_page_id = first_page;
        let mut examined = 0;

        while curr_page_id != INVALID_PAGE_ID {
            let (next_page_id, page_docs) = self.buffer_pool.read_page(curr_page_id, |page| {
                let slot_count = SlottedPage::get_slot_count(page);
                let next_id = SlottedPage::get_next_page(page);
                let mut raw_records = Vec::new();

                for slot_id in 0..slot_count {
                    if let Some(record_bytes) = SlottedPage::read_record(page, slot_id) {
                        raw_records.push(record_bytes.to_vec());
                    }
                }

                (next_id, raw_records)
            })?;

            for raw in page_docs {
                examined += 1;
                let doc = self.decode_raw_record_payload(&raw)?;
                if QueryFilter::matches(&doc, &filter)? {
                    docs.push(doc);
                }
            }

            curr_page_id = next_page_id;
        }

        let elapsed = start_time.elapsed().as_secs_f64() * 1000.0;
        let plan = ExplainPlan {
            collection: self.name.clone(),
            scan_type: ScanType::SequentialScan,
            index_name: None,
            filter: filter.to_json(),
            total_keys_examined: 0,
            total_docs_examined: examined,
            returned_docs: docs.len(),
            execution_time_ms: elapsed,
        };

        Ok(Cursor::new(docs, Some(plan)))
    }

    /// Update a single document matching the filter.
    pub fn update_one(&self, filter: DocValue, update: DocValue, upsert: bool) -> Result<UpdateResult> {
        let first_match = self.find_one(filter.clone())?;

        if let Some(mut doc) = first_match {
            let id = doc.get("_id").and_then(|v| v.as_object_id()).ok_or_else(|| {
                DocError::Internal("Document missing _id".to_string())
            })?;

            let modified = UpdateEngine::apply_update(&mut doc, &update)?;
            if modified {
                // Delete old document and insert updated document
                self.delete_one(DocValue::Object(vec![("_id".to_string(), DocValue::ObjectId(id))]))?;
                self.insert_one(doc)?;
            }

            Ok(UpdateResult {
                matched_count: 1,
                modified_count: if modified { 1 } else { 0 },
                upserted_id: None,
            })
        } else if upsert {
            let mut new_doc = filter;
            UpdateEngine::apply_update(&mut new_doc, &update)?;
            let id = self.insert_one(new_doc)?;
            Ok(UpdateResult {
                matched_count: 0,
                modified_count: 0,
                upserted_id: Some(id),
            })
        } else {
            Ok(UpdateResult {
                matched_count: 0,
                modified_count: 0,
                upserted_id: None,
            })
        }
    }

    /// Update all documents matching the filter.
    pub fn update_many(&self, filter: DocValue, update: DocValue) -> Result<UpdateResult> {
        let matches = self.find(filter)?.to_vec();
        let mut modified_count = 0;

        for mut doc in matches {
            let id = doc.get("_id").and_then(|v| v.as_object_id()).ok_or_else(|| {
                DocError::Internal("Document missing _id".to_string())
            })?;

            let modified = UpdateEngine::apply_update(&mut doc, &update)?;
            if modified {
                self.delete_one(DocValue::Object(vec![("_id".to_string(), DocValue::ObjectId(id))]))?;
                self.insert_one(doc)?;
                modified_count += 1;
            }
        }

        Ok(UpdateResult {
            matched_count: modified_count,
            modified_count,
            upserted_id: None,
        })
    }

    /// Delete a single document matching the filter.
    pub fn delete_one(&self, filter: DocValue) -> Result<DeleteResult> {
        let first_page = {
            let cat = self.catalog.read();
            cat.get_collection(&self.name)
                .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?
                .first_data_page
        };

        let mut curr_page_id = first_page;

        while curr_page_id != INVALID_PAGE_ID {
            let (next_page_id, maybe_deleted) = self.buffer_pool.write_page(curr_page_id, |page| {
                let slot_count = SlottedPage::get_slot_count(page);
                let next_id = SlottedPage::get_next_page(page);

                for slot_id in 0..slot_count {
                    if let Some(raw) = SlottedPage::read_record(page, slot_id) {
                        if let Ok(doc) = self.decode_raw_record_payload(raw) {
                            if QueryFilter::matches(&doc, &filter).unwrap_or(false) {
                                SlottedPage::delete_record(page, slot_id);
                                return (next_id, Some((slot_id, doc)));
                            }
                        }
                    }
                }

                (next_id, None)
            })?;

            if let Some((slot_id, deleted_doc)) = maybe_deleted {
                let rid = RecordId::new(curr_page_id, slot_id);
                let mut cat = self.catalog.write();
                if let Some(info) = cat.get_collection_mut(&self.name) {
                    if info.document_count > 0 {
                        info.document_count -= 1;
                    }

                    // Remove from secondary indexes
                    for index in info.indexes.iter_mut() {
                        let mut btree = BTree::open(&index.name, index.root_page_id, index.unique, self.buffer_pool.clone());
                        let mut key_values = Vec::new();
                        for field in &index.fields {
                            let val = deleted_doc.get_path(field).cloned().unwrap_or(DocValue::Null);
                            key_values.push(val);
                        }
                        let key = IndexKey::new_compound(key_values);
                        let _ = btree.delete(&key, rid);
                        index.root_page_id = btree.root_page_id;
                    }
                }
                cat.save(&self.buffer_pool)?;
                return Ok(DeleteResult { deleted_count: 1 });
            }

            curr_page_id = next_page_id;
        }

        Ok(DeleteResult { deleted_count: 0 })
    }

    /// Delete all documents matching the filter.
    pub fn delete_many(&self, filter: DocValue) -> Result<DeleteResult> {
        let mut total_deleted = 0;
        loop {
            let res = self.delete_one(filter.clone())?;
            if res.deleted_count == 0 {
                break;
            }
            total_deleted += res.deleted_count;
        }
        Ok(DeleteResult { deleted_count: total_deleted })
    }

    /// Execute an Aggregation Pipeline on this collection.
    pub fn aggregate(&self, pipeline: Vec<DocValue>) -> Result<Vec<DocValue>> {
        let all_docs = self.find(DocValue::Null)?.to_vec();
        crate::aggregation::AggregationPipeline::execute(all_docs, &pipeline)
    }

    /// Create a secondary index on the specified fields.
    pub fn create_index(&self, fields: Vec<String>, unique: bool) -> Result<()> {
        let index_name = format!("{}_{}", self.name, fields.join("_"));

        {
            let cat = self.catalog.read();
            let info = cat
                .get_collection(&self.name)
                .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;

            if info.indexes.iter().any(|i| i.name == index_name) {
                return Err(DocError::IndexAlreadyExists(index_name));
            }
        }

        let mut btree = BTree::create(&index_name, unique, self.buffer_pool.clone())?;

        // Populate index with existing documents
        let first_page = {
            let cat = self.catalog.read();
            cat.get_collection(&self.name).unwrap().first_data_page
        };

        let mut curr_page_id = first_page;
        while curr_page_id != INVALID_PAGE_ID {
            let (next_page_id, records) = self.buffer_pool.read_page(curr_page_id, |page| {
                let slot_count = SlottedPage::get_slot_count(page);
                let next_id = SlottedPage::get_next_page(page);
                let mut list = Vec::new();

                for slot_id in 0..slot_count {
                    if let Some(raw) = SlottedPage::read_record(page, slot_id) {
                        list.push((slot_id, raw.to_vec()));
                    }
                }
                (next_id, list)
            })?;

            for (slot_id, raw) in records {
                let doc = self.decode_raw_record_payload(&raw)?;
                let mut key_values = Vec::new();
                for f in &fields {
                    let val = doc.get_path(f).cloned().unwrap_or(DocValue::Null);
                    key_values.push(val);
                }
                let key = IndexKey::new_compound(key_values);
                let rid = RecordId::new(curr_page_id, slot_id);
                btree.insert(key, rid)?;
            }

            curr_page_id = next_page_id;
        }

        // Register in catalog
        let mut cat = self.catalog.write();
        let info = cat.get_collection_mut(&self.name).unwrap();
        info.indexes.push(IndexInfo {
            name: index_name,
            fields,
            unique,
            root_page_id: btree.root_page_id,
        });

        cat.save(&self.buffer_pool)?;
        Ok(())
    }

    /// Drop a secondary index.
    pub fn drop_index(&self, index_name: &str) -> Result<()> {
        let mut cat = self.catalog.write();
        let info = cat
            .get_collection_mut(&self.name)
            .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;

        let pos = info
            .indexes
            .iter()
            .position(|i| i.name == index_name)
            .ok_or_else(|| DocError::IndexNotFound(index_name.to_string()))?;

        info.indexes.remove(pos);
        cat.save(&self.buffer_pool)?;
        Ok(())
    }

    /// Collection stats.
    pub fn stats(&self) -> Result<CollectionStats> {
        let (count, first_page, indexes) = {
            let cat = self.catalog.read();
            let info = cat
                .get_collection(&self.name)
                .ok_or_else(|| DocError::CollectionNotFound(self.name.clone()))?;
            let idx_names: Vec<String> = info.indexes.iter().map(|i| i.name.clone()).collect();
            (info.document_count, info.first_data_page, idx_names)
        };

        let mut total_pages = 0;
        let mut curr_page = first_page;
        while curr_page != INVALID_PAGE_ID {
            total_pages += 1;
            curr_page = self.buffer_pool.read_page(curr_page, |page| {
                SlottedPage::get_next_page(page)
            })?;
        }

        Ok(CollectionStats {
            name: self.name.clone(),
            count,
            total_pages,
            indexes,
        })
    }

    fn read_document_at_record_id(&self, rid: RecordId) -> Result<Option<DocValue>> {
        let raw = self.buffer_pool.read_page(rid.page_id, |page| {
            SlottedPage::read_record(page, rid.slot_id).map(|r| r.to_vec())
        })?;

        match raw {
            Some(bytes) => Ok(Some(self.decode_raw_record_payload(&bytes)?)),
            None => Ok(None),
        }
    }

    fn decode_raw_record_payload(&self, raw: &[u8]) -> Result<DocValue> {
        if !raw.is_empty() && raw[0] == OVERFLOW_FLAG && raw.len() == 9 {
            // Read overflow chain
            let mut len_bytes = [0u8; 4];
            len_bytes.copy_from_slice(&raw[1..5]);
            let total_len = u32::from_le_bytes(len_bytes) as usize;

            let mut page_bytes = [0u8; 4];
            page_bytes.copy_from_slice(&raw[5..9]);
            let first_overflow_page = u32::from_le_bytes(page_bytes);

            let chain_bytes = self.read_overflow_chain(first_overflow_page, total_len)?;
            ValueCodec::decode(&chain_bytes)
        } else {
            ValueCodec::decode(raw)
        }
    }

    fn write_overflow_chunks(&self, first_page_id: PageId, data: &[u8]) -> Result<()> {
        let chunk_size = 4096 - 13;
        let chunks: Vec<&[u8]> = data.chunks(chunk_size).collect();
        let mut curr_page_id = first_page_id;

        for (i, chunk) in chunks.iter().enumerate() {
            let is_last = i == chunks.len() - 1;
            let next_page_id = if is_last {
                INVALID_PAGE_ID
            } else {
                self.buffer_pool.allocate_page()?
            };

            self.buffer_pool.write_page(curr_page_id, |page| {
                page.data.fill(0);
                page.data[4] = 4; // Overflow page type
                page.data[5..9].copy_from_slice(&next_page_id.to_le_bytes());
                page.data[9..13].copy_from_slice(&(chunk.len() as u32).to_le_bytes());
                page.data[13..13 + chunk.len()].copy_from_slice(chunk);
                page.write_checksum();
            })?;

            curr_page_id = next_page_id;
        }

        Ok(())
    }

    fn read_overflow_chain(&self, first_page_id: PageId, total_len: usize) -> Result<Vec<u8>> {
        let mut buf = Vec::with_capacity(total_len);
        let mut curr_page_id = first_page_id;

        while curr_page_id != INVALID_PAGE_ID {
            let (next_id, chunk_data) = self.buffer_pool.read_page(curr_page_id, |page| {
                let mut next_bytes = [0u8; 4];
                next_bytes.copy_from_slice(&page.data[5..9]);
                let next_page = u32::from_le_bytes(next_bytes);

                let mut len_bytes = [0u8; 4];
                len_bytes.copy_from_slice(&page.data[9..13]);
                let chunk_len = u32::from_le_bytes(len_bytes) as usize;

                (next_page, page.data[13..13 + chunk_len].to_vec())
            })?;

            buf.extend_from_slice(&chunk_data);
            curr_page_id = next_id;
        }

        Ok(buf)
    }
}
