use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::cmp::Ordering;
use std::io::Cursor;
use crate::error::{DocError, Result};
use crate::index::key::IndexKey;
use crate::storage::buffer_pool::BufferPool;
use crate::storage::page::{Page, PageId, PageType, INVALID_PAGE_ID, PAGE_SIZE};
use crate::storage::slotted_page::RecordId;

pub const BTREE_HEADER_SIZE: usize = 20;
pub const MAX_BTREE_PAYLOAD: usize = PAGE_SIZE - BTREE_HEADER_SIZE;

#[derive(Debug, Clone)]
pub struct LeafEntry {
    pub key: IndexKey,
    pub rid: RecordId,
}

#[derive(Debug, Clone)]
pub struct InternalEntry {
    pub key: IndexKey,
    pub child_page: PageId,
}

pub struct BTreeLeafNode {
    pub prev_leaf: PageId,
    pub next_leaf: PageId,
    pub entries: Vec<LeafEntry>,
}

pub struct BTreeInternalNode {
    pub first_child: PageId,
    pub entries: Vec<InternalEntry>,
}

pub struct BTree {
    pub root_page_id: PageId,
    pub unique: bool,
    pub name: String,
    pub buffer_pool: BufferPool,
}

impl BTree {
    /// Create a new empty B+Tree with an initial empty leaf root page.
    pub fn create(name: impl Into<String>, unique: bool, buffer_pool: BufferPool) -> Result<Self> {
        let root_page_id = buffer_pool.allocate_page()?;
        let name_str = name.into();

        buffer_pool.write_page(root_page_id, |page| {
            page.data.fill(0);
            page.data[4] = PageType::BTreeLeaf as u8;
            page.data[5] = 1; // is_leaf = 1
            
            let mut cursor = Cursor::new(&mut page.data[6..BTREE_HEADER_SIZE]);
            cursor.write_u16::<LittleEndian>(0).unwrap(); // num_keys = 0
            cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).unwrap(); // prev_leaf
            cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).unwrap(); // next_leaf
            cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).unwrap(); // parent
            page.write_checksum();
        })?;

        Ok(Self {
            root_page_id,
            unique,
            name: name_str,
            buffer_pool,
        })
    }

    /// Open an existing B+Tree with a given root page ID.
    pub fn open(name: impl Into<String>, root_page_id: PageId, unique: bool, buffer_pool: BufferPool) -> Self {
        Self {
            root_page_id,
            unique,
            name: name.into(),
            buffer_pool,
        }
    }

    /// Insert an `(IndexKey, RecordId)` pair into the B+Tree.
    pub fn insert(&mut self, key: IndexKey, rid: RecordId) -> Result<()> {
        let (leaf_page_id, path) = self.find_leaf_page_with_path(&key)?;

        let (should_split, promoted) = self.buffer_pool.write_page(leaf_page_id, |page| {
            let mut leaf = Self::decode_leaf(page)?;

            // Check unique constraint
            if self.unique {
                for entry in &leaf.entries {
                    if entry.key == key {
                        return Err(DocError::DuplicateKey {
                            index_name: self.name.clone(),
                            key: format!("{}", key),
                        });
                    }
                }
            }

            // Insert entry into sorted position
            let idx = leaf.entries.partition_point(|entry| entry.key < key);
            leaf.entries.insert(idx, LeafEntry { key: key.clone(), rid });

            // Check if leaf needs to be split
            let encoded_size = Self::encoded_leaf_size(&leaf);
            if encoded_size > MAX_BTREE_PAYLOAD && leaf.entries.len() > 1 {
                let mid = leaf.entries.len() / 2;
                let right_entries = leaf.entries.split_off(mid);
                let split_key = right_entries[0].key.clone();

                Self::encode_leaf(page, &leaf)?;
                Ok((true, Some((split_key, right_entries, leaf.next_leaf))))
            } else {
                Self::encode_leaf(page, &leaf)?;
                Ok((false, None))
            }
        })??;

        if should_split {
            if let Some((split_key, right_entries, old_next_leaf)) = promoted {
                let right_page_id = self.buffer_pool.allocate_page()?;

                // Link leaf siblings
                self.buffer_pool.write_page(leaf_page_id, |page| {
                    let mut cursor = Cursor::new(&mut page.data[12..16]);
                    let _ = cursor.write_u32::<LittleEndian>(right_page_id);
                    page.write_checksum();
                })?;

                self.buffer_pool.write_page(right_page_id, |page| -> Result<()> {
                    let right_leaf = BTreeLeafNode {
                        prev_leaf: leaf_page_id,
                        next_leaf: old_next_leaf,
                        entries: right_entries,
                    };
                    Self::encode_leaf(page, &right_leaf)?;
                    Ok(())
                })??;

                if old_next_leaf != INVALID_PAGE_ID {
                    self.buffer_pool.write_page(old_next_leaf, |page| {
                        let mut cursor = Cursor::new(&mut page.data[8..12]);
                        let _ = cursor.write_u32::<LittleEndian>(right_page_id);
                        page.write_checksum();
                    })?;
                }

                self.insert_into_parent(path, leaf_page_id, split_key, right_page_id)?;
            }
        }

        Ok(())
    }

    /// Exact point lookup for all `RecordId`s matching a given `IndexKey`.
    pub fn get_exact(&self, key: &IndexKey) -> Result<Vec<RecordId>> {
        let leaf_page_id = self.find_leaf_page(self.root_page_id, key)?;
        let mut results = Vec::new();
        let mut curr_page_id = leaf_page_id;

        'outer: while curr_page_id != INVALID_PAGE_ID {
            let (next_page, done) = self.buffer_pool.read_page(curr_page_id, |page| {
                let leaf = Self::decode_leaf(page).unwrap();
                let start_idx = leaf.entries.partition_point(|entry| &entry.key < key);
                let mut finished = false;
                for entry in &leaf.entries[start_idx..] {
                    if &entry.key == key {
                        results.push(entry.rid);
                        if self.unique {
                            finished = true;
                            break;
                        }
                    } else {
                        finished = true;
                        break;
                    }
                }
                (leaf.next_leaf, finished || (self.unique && !results.is_empty()))
            })?;

            if done || (self.unique && !results.is_empty()) {
                break 'outer;
            }
            curr_page_id = next_page;
        }

        Ok(results)
    }

    /// Perform a range scan over the index keys.
    pub fn range_scan(
        &self,
        start_key: Option<&IndexKey>,
        end_key: Option<&IndexKey>,
        include_start: bool,
        include_end: bool,
    ) -> Result<Vec<RecordId>> {
        let start_leaf = if let Some(sk) = start_key {
            self.find_leaf_page(self.root_page_id, sk)?
        } else {
            self.find_first_leaf_page(self.root_page_id)?
        };

        let mut results = Vec::new();
        let mut curr_page_id = start_leaf;

        'scan: while curr_page_id != INVALID_PAGE_ID {
            let (next_page, stop) = self.buffer_pool.read_page(curr_page_id, |page| {
                let leaf = Self::decode_leaf(page).unwrap();
                let mut should_stop = false;
                let start_idx = if let Some(sk) = start_key {
                    let idx = leaf.entries.partition_point(|entry| &entry.key < sk);
                    if !include_start && idx < leaf.entries.len() && &leaf.entries[idx].key == sk {
                        idx + 1
                    } else {
                        idx
                    }
                } else {
                    0
                };

                for entry in &leaf.entries[start_idx..] {
                    if let Some(ek) = end_key {
                        let cmp = entry.key.cmp(ek);
                        if cmp == Ordering::Greater || (!include_end && cmp == Ordering::Equal) {
                            should_stop = true;
                            break;
                        }
                    }

                    results.push(entry.rid);
                }

                (leaf.next_leaf, should_stop)
            })?;

            if stop {
                break 'scan;
            }
            curr_page_id = next_page;
        }

        Ok(results)
    }

    /// Delete a `(key, RecordId)` pair from the B+Tree.
    pub fn delete(&mut self, key: &IndexKey, rid: RecordId) -> Result<bool> {
        let leaf_page_id = self.find_leaf_page(self.root_page_id, key)?;
        
        self.buffer_pool.write_page(leaf_page_id, |page| {
            let mut leaf = Self::decode_leaf(page)?;
            if let Some(pos) = leaf.entries.iter().position(|e| &e.key == key && e.rid == rid) {
                leaf.entries.remove(pos);
                Self::encode_leaf(page, &leaf)?;
                Ok(true)
            } else {
                Ok(false)
            }
        })?
    }

    fn find_leaf_page_with_path(&self, key: &IndexKey) -> Result<(PageId, Vec<PageId>)> {
        let mut current_page_id = self.root_page_id;
        let mut path = Vec::new();

        loop {
            let (is_leaf, next_child) = self.buffer_pool.read_page(current_page_id, |page| -> Result<(bool, PageId)> {
                let is_leaf = page.data[5] == 1;
                if is_leaf {
                    Ok((true, current_page_id))
                } else {
                    let internal = Self::decode_internal(page)?;
                    let mut next_child = internal.first_child;
                    for entry in &internal.entries {
                        if key >= &entry.key {
                            next_child = entry.child_page;
                        } else {
                            break;
                        }
                    }
                    Ok((false, next_child))
                }
            })??;

            if is_leaf {
                return Ok((current_page_id, path));
            }

            path.push(current_page_id);
            current_page_id = next_child;
        }
    }

    fn find_leaf_page(&self, mut current_page_id: PageId, key: &IndexKey) -> Result<PageId> {
        loop {
            let (is_leaf, next_child) = self.buffer_pool.read_page(current_page_id, |page| -> Result<(bool, PageId)> {
                let is_leaf = page.data[5] == 1;
                if is_leaf {
                    Ok((true, current_page_id))
                } else {
                    let internal = Self::decode_internal(page)?;
                    let mut next_child = internal.first_child;
                    for entry in &internal.entries {
                        if key >= &entry.key {
                            next_child = entry.child_page;
                        } else {
                            break;
                        }
                    }
                    Ok((false, next_child))
                }
            })??;

            if is_leaf {
                return Ok(current_page_id);
            }
            current_page_id = next_child;
        }
    }

    fn find_first_leaf_page(&self, mut current_page_id: PageId) -> Result<PageId> {
        loop {
            let (is_leaf, next_child) = self.buffer_pool.read_page(current_page_id, |page| -> Result<(bool, PageId)> {
                let is_leaf = page.data[5] == 1;
                if is_leaf {
                    Ok((true, current_page_id))
                } else {
                    let internal = Self::decode_internal(page)?;
                    Ok((false, internal.first_child))
                }
            })??;

            if is_leaf {
                return Ok(current_page_id);
            }
            current_page_id = next_child;
        }
    }

    fn insert_into_parent(
        &mut self,
        mut path: Vec<PageId>,
        child_id: PageId,
        split_key: IndexKey,
        right_child_id: PageId,
    ) -> Result<()> {
        if let Some(parent_id) = path.pop() {
            let (parent_split, parent_promoted) = self.buffer_pool.write_page(parent_id, |page| -> Result<(bool, Option<(IndexKey, PageId, Vec<InternalEntry>)>)> {
                let mut internal = Self::decode_internal(page)?;
                let idx = internal.entries.partition_point(|entry| entry.key < split_key);
                internal.entries.insert(idx, InternalEntry {
                    key: split_key.clone(),
                    child_page: right_child_id,
                });

                let encoded_size = Self::encoded_internal_size(&internal);
                if encoded_size > MAX_BTREE_PAYLOAD && internal.entries.len() > 1 {
                    let mid = internal.entries.len() / 2;
                    let median_key = internal.entries[mid].key.clone();
                    let right_first_child = internal.entries[mid].child_page;
                    let right_entries = internal.entries.split_off(mid + 1);
                    internal.entries.truncate(mid);

                    Self::encode_internal(page, &internal)?;
                    Ok((true, Some((median_key, right_first_child, right_entries))))
                } else {
                    Self::encode_internal(page, &internal)?;
                    Ok((false, None))
                }
            })??;

            if parent_split {
                if let Some((median_key, right_first_child, right_entries)) = parent_promoted {
                    let new_right_internal_id = self.buffer_pool.allocate_page()?;
                    self.buffer_pool.write_page(new_right_internal_id, |page| -> Result<()> {
                        let right_node = BTreeInternalNode {
                            first_child: right_first_child,
                            entries: right_entries,
                        };
                        Self::encode_internal(page, &right_node)?;
                        Ok(())
                    })??;

                    self.insert_into_parent(path, parent_id, median_key, new_right_internal_id)?;
                }
            }
        } else {
            // Root was split -> allocate new root
            let new_root_id = self.buffer_pool.allocate_page()?;
            self.buffer_pool.write_page(new_root_id, |page| -> Result<()> {
                let root_node = BTreeInternalNode {
                    first_child: child_id,
                    entries: vec![InternalEntry {
                        key: split_key,
                        child_page: right_child_id,
                    }],
                };
                Self::encode_internal(page, &root_node)?;
                Ok(())
            })??;

            self.root_page_id = new_root_id;
        }

        Ok(())
    }

    fn encoded_internal_size(internal: &BTreeInternalNode) -> usize {
        let mut sz = 0;
        for entry in &internal.entries {
            sz += 2 + entry.key.encode().map(|k| k.len()).unwrap_or(0) + 4;
        }
        sz
    }

    fn encode_leaf(page: &mut Page, leaf: &BTreeLeafNode) -> Result<()> {
        page.data.fill(0);
        page.data[4] = PageType::BTreeLeaf as u8;
        page.data[5] = 1; // is_leaf = 1

        let mut cursor = Cursor::new(&mut page.data[6..BTREE_HEADER_SIZE]);
        cursor.write_u16::<LittleEndian>(leaf.entries.len() as u16).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(leaf.prev_leaf).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(leaf.next_leaf).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).map_err(DocError::Io)?;

        let mut body = Vec::new();
        for entry in &leaf.entries {
            let encoded_key = entry.key.encode()?;
            body.write_u16::<LittleEndian>(encoded_key.len() as u16).map_err(DocError::Io)?;
            body.extend_from_slice(&encoded_key);
            body.write_u64::<LittleEndian>(entry.rid.to_u64()).map_err(DocError::Io)?;
        }

        if body.len() > MAX_BTREE_PAYLOAD {
            return Err(DocError::Internal("Leaf payload exceeds maximum page size".to_string()));
        }

        page.data[BTREE_HEADER_SIZE..BTREE_HEADER_SIZE + body.len()].copy_from_slice(&body);
        page.write_checksum();
        Ok(())
    }

    fn decode_leaf(page: &Page) -> Result<BTreeLeafNode> {
        let mut cursor = Cursor::new(&page.data[6..BTREE_HEADER_SIZE]);
        let count = cursor.read_u16::<LittleEndian>().map_err(DocError::Io)? as usize;
        let prev_leaf = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let next_leaf = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;

        let mut body_cursor = Cursor::new(&page.data[BTREE_HEADER_SIZE..]);
        let mut entries = Vec::with_capacity(count);

        for _ in 0..count {
            let key_len = body_cursor.read_u16::<LittleEndian>().map_err(DocError::Io)? as usize;
            let mut key_buf = vec![0u8; key_len];
            use std::io::Read;
            body_cursor.read_exact(&mut key_buf).map_err(DocError::Io)?;
            let key = IndexKey::decode(&key_buf)?;
            let rid_val = body_cursor.read_u64::<LittleEndian>().map_err(DocError::Io)?;
            let rid = RecordId::from_u64(rid_val);
            entries.push(LeafEntry { key, rid });
        }

        Ok(BTreeLeafNode {
            prev_leaf,
            next_leaf,
            entries,
        })
    }

    fn encoded_leaf_size(leaf: &BTreeLeafNode) -> usize {
        let mut sz = 0;
        for entry in &leaf.entries {
            sz += 2 + entry.key.encode().map(|k| k.len()).unwrap_or(0) + 8;
        }
        sz
    }

    fn encode_internal(page: &mut Page, internal: &BTreeInternalNode) -> Result<()> {
        page.data.fill(0);
        page.data[4] = PageType::BTreeInternal as u8;
        page.data[5] = 0; // is_leaf = 0

        let mut cursor = Cursor::new(&mut page.data[6..BTREE_HEADER_SIZE]);
        cursor.write_u16::<LittleEndian>(internal.entries.len() as u16).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(internal.first_child).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).map_err(DocError::Io)?;

        let mut body = Vec::new();
        for entry in &internal.entries {
            let encoded_key = entry.key.encode()?;
            body.write_u16::<LittleEndian>(encoded_key.len() as u16).map_err(DocError::Io)?;
            body.extend_from_slice(&encoded_key);
            body.write_u32::<LittleEndian>(entry.child_page).map_err(DocError::Io)?;
        }

        page.data[BTREE_HEADER_SIZE..BTREE_HEADER_SIZE + body.len()].copy_from_slice(&body);
        page.write_checksum();
        Ok(())
    }

    fn decode_internal(page: &Page) -> Result<BTreeInternalNode> {
        let mut cursor = Cursor::new(&page.data[6..BTREE_HEADER_SIZE]);
        let count = cursor.read_u16::<LittleEndian>().map_err(DocError::Io)? as usize;
        let first_child = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;

        let mut body_cursor = Cursor::new(&page.data[BTREE_HEADER_SIZE..]);
        let mut entries = Vec::with_capacity(count);

        for _ in 0..count {
            let key_len = body_cursor.read_u16::<LittleEndian>().map_err(DocError::Io)? as usize;
            let mut key_buf = vec![0u8; key_len];
            use std::io::Read;
            body_cursor.read_exact(&mut key_buf).map_err(DocError::Io)?;
            let key = IndexKey::decode(&key_buf)?;
            let child_page = body_cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
            entries.push(InternalEntry { key, child_page });
        }

        Ok(BTreeInternalNode {
            first_child,
            entries,
        })
    }
}
