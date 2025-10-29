use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::{Cursor, Read, Write};
use crate::error::{DocError, Result};

pub const PAGE_SIZE: usize = 4096;
pub const DB_HEADER_MAGIC: &[u8; 8] = b"DOCLITE\0";
pub const DB_FORMAT_VERSION: u32 = 1;

pub type PageId = u32;
pub const INVALID_PAGE_ID: PageId = u32::MAX;
pub const HEADER_PAGE_ID: PageId = 0;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum PageType {
    Header = 0,
    SlottedData = 1,
    BTreeInternal = 2,
    BTreeLeaf = 3,
    Overflow = 4,
    FreeList = 5,
    Catalog = 6,
}

impl PageType {
    pub fn from_u8(v: u8) -> Option<Self> {
        match v {
            0 => Some(PageType::Header),
            1 => Some(PageType::SlottedData),
            2 => Some(PageType::BTreeInternal),
            3 => Some(PageType::BTreeLeaf),
            4 => Some(PageType::Overflow),
            5 => Some(PageType::FreeList),
            6 => Some(PageType::Catalog),
            _ => None,
        }
    }
}

/// Raw memory page buffer of fixed 4096 bytes.
#[derive(Clone)]
pub struct Page {
    pub data: [u8; PAGE_SIZE],
}

impl Page {
    pub fn new() -> Self {
        Self {
            data: [0u8; PAGE_SIZE],
        }
    }

    pub fn as_slice(&self) -> &[u8] {
        &self.data
    }

    pub fn as_mut_slice(&mut self) -> &mut [u8] {
        &mut self.data
    }

    /// Calculate CRC32 checksum over page payload (bytes 4..PAGE_SIZE).
    pub fn compute_checksum(&self) -> u32 {
        crc32fast::hash(&self.data[4..])
    }

    /// Store computed CRC32 in the first 4 bytes of the page.
    pub fn write_checksum(&mut self) {
        let crc = self.compute_checksum();
        let mut cursor = Cursor::new(&mut self.data[0..4]);
        let _ = cursor.write_u32::<LittleEndian>(crc);
    }

    /// Verify page CRC32 checksum.
    pub fn verify_checksum(&self) -> bool {
        let mut cursor = Cursor::new(&self.data[0..4]);
        let stored_crc = cursor.read_u32::<LittleEndian>().unwrap_or(0);
        let computed = self.compute_checksum();
        stored_crc == computed
    }
}

impl Default for Page {
    fn default() -> Self {
        Self::new()
    }
}

/// Database Global Header (Page 0) metadata.
#[derive(Debug, Clone)]
pub struct DbHeader {
    pub magic: [u8; 8],
    pub version: u32,
    pub page_size: u32,
    pub total_pages: u32,
    pub free_list_head: PageId,
    pub catalog_root_page: PageId,
    pub wal_lsn: u64,
}

impl DbHeader {
    pub fn new() -> Self {
        Self {
            magic: *DB_HEADER_MAGIC,
            version: DB_FORMAT_VERSION,
            page_size: PAGE_SIZE as u32,
            total_pages: 1, // Page 0 initialized
            free_list_head: INVALID_PAGE_ID,
            catalog_root_page: INVALID_PAGE_ID,
            wal_lsn: 0,
        }
    }

    pub fn encode_to_page(&self, page: &mut Page) -> Result<()> {
        let mut cursor = Cursor::new(&mut page.data[4..]); // Skip 4 bytes for CRC
        cursor.write_all(&self.magic).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(self.version).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(self.page_size).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(self.total_pages).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(self.free_list_head).map_err(DocError::Io)?;
        cursor.write_u32::<LittleEndian>(self.catalog_root_page).map_err(DocError::Io)?;
        cursor.write_u64::<LittleEndian>(self.wal_lsn).map_err(DocError::Io)?;
        
        page.write_checksum();
        Ok(())
    }

    pub fn decode_from_page(page: &Page) -> Result<Self> {
        let mut cursor = Cursor::new(&page.data[4..]);
        let mut magic = [0u8; 8];
        cursor.read_exact(&mut magic).map_err(DocError::Io)?;
        if &magic != DB_HEADER_MAGIC {
            return Err(DocError::InvalidHeader("Invalid database magic header signature".to_string()));
        }

        let version = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        if version != DB_FORMAT_VERSION {
            return Err(DocError::InvalidHeader(format!("Unsupported database format version: {}", version)));
        }

        let page_size = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let total_pages = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let free_list_head = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let catalog_root_page = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let wal_lsn = cursor.read_u64::<LittleEndian>().map_err(DocError::Io)?;

        Ok(Self {
            magic,
            version,
            page_size,
            total_pages,
            free_list_head,
            catalog_root_page,
            wal_lsn,
        })
    }
}
