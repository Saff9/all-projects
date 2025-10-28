use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use parking_lot::Mutex;
use crate::error::{DocError, Result};
use crate::storage::freelist::FreeList;
use crate::storage::page::{Page, PageId, INVALID_PAGE_ID};
use crate::storage::pager::Pager;

pub const DEFAULT_POOL_CAPACITY: usize = 1024; // 4MB cache default

pub struct Frame {
    pub page_id: PageId,
    pub page: Page,
    pub is_dirty: bool,
    pub pin_count: usize,
    pub last_accessed: u64,
}

pub struct BufferPoolInner {
    pub pager: Pager,
    pub frames: HashMap<PageId, usize>, // page_id -> pool vector index
    pub pool: Vec<Frame>,
    pub capacity: usize,
}

#[derive(Clone)]
pub struct BufferPool {
    inner: Arc<Mutex<BufferPoolInner>>,
    access_counter: Arc<AtomicU64>,
}

impl BufferPool {
    pub fn new(pager: Pager, capacity: usize) -> Self {
        Self {
            inner: Arc::new(Mutex::new(BufferPoolInner {
                pager,
                frames: HashMap::new(),
                pool: Vec::with_capacity(capacity),
                capacity,
            })),
            access_counter: Arc::new(AtomicU64::new(0)),
        }
    }

    /// Read a page from cache or disk into a caller buffer.
    pub fn read_page<F, R>(&self, page_id: PageId, f: F) -> Result<R>
    where
        F: FnOnce(&Page) -> R,
    {
        let mut inner = self.inner.lock();
        let frame_idx = self.get_or_load_frame(&mut inner, page_id)?;
        
        let counter = self.access_counter.fetch_add(1, Ordering::Relaxed);
        inner.pool[frame_idx].last_accessed = counter;
        
        let result = f(&inner.pool[frame_idx].page);
        Ok(result)
    }

    /// Modify a page in the buffer pool.
    pub fn write_page<F, R>(&self, page_id: PageId, f: F) -> Result<R>
    where
        F: FnOnce(&mut Page) -> R,
    {
        let mut inner = self.inner.lock();
        let frame_idx = self.get_or_load_frame(&mut inner, page_id)?;
        
        let counter = self.access_counter.fetch_add(1, Ordering::Relaxed);
        inner.pool[frame_idx].last_accessed = counter;
        inner.pool[frame_idx].is_dirty = true;
        
        let result = f(&mut inner.pool[frame_idx].page);
        inner.pool[frame_idx].page.write_checksum();
        
        Ok(result)
    }

    /// Allocate a new page and return its PageId.
    pub fn allocate_page(&self) -> Result<PageId> {
        let mut inner = self.inner.lock();
        let page_id = FreeList::allocate(&mut inner.pager)?;
        
        let blank_page = Page::new();
        inner.pager.write_page_raw(page_id, &blank_page)?;
        
        Ok(page_id)
    }

    /// Free an existing page back to the freelist.
    pub fn free_page(&self, page_id: PageId) -> Result<()> {
        let mut inner = self.inner.lock();
        if let Some(&frame_idx) = inner.frames.get(&page_id) {
            inner.pool[frame_idx].is_dirty = false;
            inner.frames.remove(&page_id);
        }
        FreeList::free(&mut inner.pager, page_id)
    }

    /// Flush all dirty pages in the pool to disk and perform fsync.
    pub fn flush_all(&self) -> Result<()> {
        let mut inner = self.inner.lock();
        let mut dirty_pages = Vec::new();
        for frame in &mut inner.pool {
            if frame.is_dirty && frame.page_id != INVALID_PAGE_ID {
                frame.page.write_checksum();
                dirty_pages.push((frame.page_id, frame.page.clone()));
                frame.is_dirty = false;
            }
        }
        for (page_id, page) in dirty_pages {
            inner.pager.write_page_raw(page_id, &page)?;
        }
        inner.pager.sync()?;
        Ok(())
    }

    fn get_or_load_frame(&self, inner: &mut BufferPoolInner, page_id: PageId) -> Result<usize> {
        if let Some(&frame_idx) = inner.frames.get(&page_id) {
            return Ok(frame_idx);
        }

        // Need to load page from disk
        let page = inner.pager.read_page_raw(page_id)?;

        // If pool is not full, push new frame
        if inner.pool.len() < inner.capacity {
            let frame_idx = inner.pool.len();
            inner.pool.push(Frame {
                page_id,
                page,
                is_dirty: false,
                pin_count: 0,
                last_accessed: self.access_counter.fetch_add(1, Ordering::Relaxed),
            });
            inner.frames.insert(page_id, frame_idx);
            return Ok(frame_idx);
        }

        // LRU Eviction: Find unpinned frame with smallest last_accessed
        let mut victim_idx = None;
        let mut min_access = u64::MAX;

        for (i, frame) in inner.pool.iter().enumerate() {
            if frame.pin_count == 0 && frame.last_accessed < min_access {
                min_access = frame.last_accessed;
                victim_idx = Some(i);
            }
        }

        let idx = victim_idx.ok_or(DocError::BufferPoolExhausted)?;

        // If victim is dirty, flush it to disk first
        if inner.pool[idx].is_dirty && inner.pool[idx].page_id != INVALID_PAGE_ID {
            inner.pool[idx].page.write_checksum();
            inner.pager.write_page_raw(inner.pool[idx].page_id, &inner.pool[idx].page)?;
            inner.pool[idx].is_dirty = false;
        }

        inner.frames.remove(&inner.pool[idx].page_id);
        inner.pool[idx] = Frame {
            page_id,
            page,
            is_dirty: false,
            pin_count: 0,
            last_accessed: self.access_counter.fetch_add(1, Ordering::Relaxed),
        };
        inner.frames.insert(page_id, idx);

        Ok(idx)
    }
}

impl Drop for BufferPoolInner {
    fn drop(&mut self) {
        for frame in &mut self.pool {
            if frame.is_dirty && frame.page_id != INVALID_PAGE_ID {
                frame.page.write_checksum();
                let _ = self.pager.write_page_raw(frame.page_id, &frame.page);
                frame.is_dirty = false;
            }
        }
        let _ = self.pager.sync();
    }
}
