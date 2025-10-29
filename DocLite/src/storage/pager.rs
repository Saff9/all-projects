use std::fs::{File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};
use crate::error::{DocError, Result};
use crate::storage::page::{DbHeader, Page, PageId, HEADER_PAGE_ID, PAGE_SIZE};

pub enum PagerStorage {
    Disk {
        file: File,
        path: PathBuf,
    },
    Memory {
        pages: Vec<Page>,
    },
}

pub struct Pager {
    storage: PagerStorage,
    header: DbHeader,
}

impl Pager {
    /// Open an existing database file or create a new one on disk.
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        let path_buf = path.as_ref().to_path_buf();
        let file_exists = path_buf.exists();

        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(&path_buf)
            .map_err(DocError::Io)?;

        let metadata = file.metadata().map_err(DocError::Io)?;
        let file_len = metadata.len();

        let mut pager = Self {
            storage: PagerStorage::Disk {
                file,
                path: path_buf,
            },
            header: DbHeader::new(),
        };

        if file_exists && file_len >= PAGE_SIZE as u64 {
            // Read and decode header page
            let header_page = pager.read_page_raw(HEADER_PAGE_ID)?;
            pager.header = DbHeader::decode_from_page(&header_page)?;
        } else {
            // Initialize new database file with header page
            let mut header_page = Page::new();
            pager.header.encode_to_page(&mut header_page)?;
            pager.write_page_raw(HEADER_PAGE_ID, &header_page)?;
            pager.sync()?;
        }

        Ok(pager)
    }

    /// Create an in-memory ephemeral Pager.
    pub fn open_in_memory() -> Result<Self> {
        let header = DbHeader::new();
        let mut header_page = Page::new();
        header.encode_to_page(&mut header_page)?;

        Ok(Self {
            storage: PagerStorage::Memory {
                pages: vec![header_page],
            },
            header,
        })
    }

    pub fn header(&self) -> &DbHeader {
        &self.header
    }

    pub fn header_mut(&mut self) -> &mut DbHeader {
        &mut self.header
    }

    pub fn save_header(&mut self) -> Result<()> {
        let mut header_page = Page::new();
        self.header.encode_to_page(&mut header_page)?;
        self.write_page_raw(HEADER_PAGE_ID, &header_page)?;
        Ok(())
    }

    /// Allocate a new page ID, expanding total pages count.
    pub fn allocate_page(&mut self) -> Result<PageId> {
        let new_id = self.header.total_pages;
        self.header.total_pages += 1;
        
        let blank_page = Page::new();
        self.write_page_raw(new_id, &blank_page)?;
        self.save_header()?;

        Ok(new_id)
    }

    /// Read raw 4096-byte page directly from storage.
    pub fn read_page_raw(&mut self, page_id: PageId) -> Result<Page> {
        match &mut self.storage {
            PagerStorage::Disk { file, .. } => {
                let offset = (page_id as u64) * (PAGE_SIZE as u64);
                file.seek(SeekFrom::Start(offset)).map_err(DocError::Io)?;
                let mut page = Page::new();
                file.read_exact(&mut page.data).map_err(DocError::Io)?;
                Ok(page)
            }
            PagerStorage::Memory { pages } => {
                if let Some(page) = pages.get(page_id as usize) {
                    Ok(page.clone())
                } else {
                    Err(DocError::PageNotFound(page_id))
                }
            }
        }
    }

    /// Write raw 4096-byte page directly to storage.
    pub fn write_page_raw(&mut self, page_id: PageId, page: &Page) -> Result<()> {
        match &mut self.storage {
            PagerStorage::Disk { file, .. } => {
                let offset = (page_id as u64) * (PAGE_SIZE as u64);
                file.seek(SeekFrom::Start(offset)).map_err(DocError::Io)?;
                file.write_all(&page.data).map_err(DocError::Io)?;
                Ok(())
            }
            PagerStorage::Memory { pages } => {
                let idx = page_id as usize;
                if idx < pages.len() {
                    pages[idx] = page.clone();
                } else {
                    while pages.len() < idx {
                        pages.push(Page::new());
                    }
                    pages.push(page.clone());
                }
                Ok(())
            }
        }
    }

    /// Flush all pending writes to disk (fsync).
    pub fn sync(&mut self) -> Result<()> {
        match &mut self.storage {
            PagerStorage::Disk { file, .. } => {
                file.flush().map_err(DocError::Io)?;
                file.sync_all().map_err(DocError::Io)?;
                Ok(())
            }
            PagerStorage::Memory { .. } => Ok(()),
        }
    }
}
