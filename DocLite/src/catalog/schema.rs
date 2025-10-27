use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::error::{DocError, Result};
use crate::storage::buffer_pool::BufferPool;
use crate::storage::page::{PageId, PageType, INVALID_PAGE_ID, PAGE_SIZE};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexInfo {
    pub name: String,
    pub fields: Vec<String>,
    pub unique: bool,
    pub root_page_id: PageId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionInfo {
    pub name: String,
    pub first_data_page: PageId,
    pub last_data_page: PageId,
    pub indexes: Vec<IndexInfo>,
    pub document_count: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CatalogData {
    pub collections: HashMap<String, CollectionInfo>,
}

pub struct Catalog {
    pub root_page_id: PageId,
    pub data: CatalogData,
}

impl Catalog {
    pub fn new(root_page_id: PageId) -> Self {
        Self {
            root_page_id,
            data: CatalogData {
                collections: HashMap::new(),
            },
        }
    }

    pub fn load(root_page_id: PageId, buffer_pool: &BufferPool) -> Result<Self> {
        if root_page_id == INVALID_PAGE_ID {
            return Ok(Self::new(INVALID_PAGE_ID));
        }

        let json_bytes = buffer_pool.read_page(root_page_id, |page| {
            if page.data[4] != PageType::Catalog as u8 {
                return Err(DocError::Corruption(format!("Expected catalog page at ID {}, got {}", root_page_id, page.data[4])));
            }
            let mut len_bytes = [0u8; 4];
            len_bytes.copy_from_slice(&page.data[5..9]);
            let len = u32::from_le_bytes(len_bytes) as usize;
            if len > PAGE_SIZE - 9 {
                return Err(DocError::Corruption("Catalog payload exceeds page size".to_string()));
            }
            Ok(page.data[9..9 + len].to_vec())
        })??;

        let data: CatalogData = serde_json::from_slice(&json_bytes)
            .map_err(|e| DocError::Corruption(format!("Failed to parse catalog schema: {}", e)))?;

        Ok(Self {
            root_page_id,
            data,
        })
    }

    pub fn save(&mut self, buffer_pool: &BufferPool) -> Result<PageId> {
        let json_bytes = serde_json::to_vec(&self.data)
            .map_err(|e| DocError::Serialization(e.to_string()))?;

        if json_bytes.len() > PAGE_SIZE - 9 {
            return Err(DocError::Internal("Catalog metadata too large for single page".to_string()));
        }

        if self.root_page_id == INVALID_PAGE_ID {
            self.root_page_id = buffer_pool.allocate_page()?;
        }

        buffer_pool.write_page(self.root_page_id, |page| {
            page.data.fill(0);
            page.data[4] = PageType::Catalog as u8;
            let len_bytes = (json_bytes.len() as u32).to_le_bytes();
            page.data[5..9].copy_from_slice(&len_bytes);
            page.data[9..9 + json_bytes.len()].copy_from_slice(&json_bytes);
            page.write_checksum();
        })?;

        Ok(self.root_page_id)
    }

    pub fn get_collection(&self, name: &str) -> Option<&CollectionInfo> {
        self.data.collections.get(name)
    }

    pub fn get_collection_mut(&mut self, name: &str) -> Option<&mut CollectionInfo> {
        self.data.collections.get_mut(name)
    }

    pub fn create_collection(&mut self, name: &str, first_page: PageId) -> Result<&mut CollectionInfo> {
        if self.data.collections.contains_key(name) {
            return Err(DocError::CollectionAlreadyExists(name.to_string()));
        }

        let info = CollectionInfo {
            name: name.to_string(),
            first_data_page: first_page,
            last_data_page: first_page,
            indexes: Vec::new(),
            document_count: 0,
        };

        self.data.collections.insert(name.to_string(), info);
        Ok(self.data.collections.get_mut(name).unwrap())
    }

    pub fn drop_collection(&mut self, name: &str) -> Result<CollectionInfo> {
        self.data
            .collections
            .remove(name)
            .ok_or_else(|| DocError::CollectionNotFound(name.to_string()))
    }
}
