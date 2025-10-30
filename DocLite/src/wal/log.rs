use std::fs::{File, OpenOptions};
use std::io::{Seek, SeekFrom, Write};
use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};
use parking_lot::Mutex;
use crate::error::{DocError, Result};
use crate::storage::page::{Page, PageId};
use crate::wal::record::WalFrame;

pub struct WalInner {
    file: Option<File>,
    mem_frames: Vec<WalFrame>,
}

pub struct Wal {
    inner: Mutex<WalInner>,
    next_lsn: AtomicU64,
    next_tx_id: AtomicU64,
}

impl Wal {
    /// Open or create a WAL log file on disk.
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        let wal_path = path.as_ref().to_path_buf();
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .open(&wal_path)
            .map_err(DocError::Io)?;

        Ok(Self {
            inner: Mutex::new(WalInner {
                file: Some(file),
                mem_frames: Vec::new(),
            }),
            next_lsn: AtomicU64::new(1),
            next_tx_id: AtomicU64::new(1),
        })
    }

    /// Open an in-memory WAL for ephemeral databases.
    pub fn open_in_memory() -> Self {
        Self {
            inner: Mutex::new(WalInner {
                file: None,
                mem_frames: Vec::new(),
            }),
            next_lsn: AtomicU64::new(1),
            next_tx_id: AtomicU64::new(1),
        }
    }

    pub fn next_tx_id(&self) -> u64 {
        self.next_tx_id.fetch_add(1, Ordering::SeqCst)
    }

    pub fn next_lsn(&self) -> u64 {
        self.next_lsn.fetch_add(1, Ordering::SeqCst)
    }

    pub fn set_last_lsn(&self, lsn: u64) {
        self.next_lsn.store(lsn + 1, Ordering::SeqCst);
    }

    /// Append a WAL frame to disk and sync.
    pub fn append_frame(&self, frame: &WalFrame) -> Result<()> {
        let mut inner = self.inner.lock();
        let encoded = frame.encode();

        if let Some(file) = &mut inner.file {
            file.seek(SeekFrom::End(0)).map_err(DocError::Io)?;
            file.write_all(&encoded).map_err(DocError::Io)?;
            file.flush().map_err(DocError::Io)?;
        } else {
            inner.mem_frames.push(frame.clone());
        }

        Ok(())
    }

    /// Write page update frame to WAL.
    pub fn log_page_update(&self, tx_id: u64, page_id: PageId, page: &Page) -> Result<u64> {
        let lsn = self.next_lsn();
        let frame = WalFrame::new_page_update(lsn, tx_id, page_id, page);
        self.append_frame(&frame)?;
        Ok(lsn)
    }

    /// Log transaction begin.
    pub fn log_begin(&self, tx_id: u64) -> Result<u64> {
        let lsn = self.next_lsn();
        let frame = WalFrame::new_begin(lsn, tx_id);
        self.append_frame(&frame)?;
        Ok(lsn)
    }

    /// Log transaction commit and flush.
    pub fn log_commit(&self, tx_id: u64) -> Result<u64> {
        let lsn = self.next_lsn();
        let frame = WalFrame::new_commit(lsn, tx_id);
        self.append_frame(&frame)?;
        self.sync()?;
        Ok(lsn)
    }

    /// Log transaction abort.
    pub fn log_abort(&self, tx_id: u64) -> Result<u64> {
        let lsn = self.next_lsn();
        let frame = WalFrame::new_abort(lsn, tx_id);
        self.append_frame(&frame)?;
        Ok(lsn)
    }

    /// Durably flush WAL writes to physical disk media.
    pub fn sync(&self) -> Result<()> {
        let mut inner = self.inner.lock();
        if let Some(file) = &mut inner.file {
            file.flush().map_err(DocError::Io)?;
            file.sync_all().map_err(DocError::Io)?;
        }
        Ok(())
    }

    /// Truncate and reset the WAL file during checkpoint.
    pub fn truncate(&self) -> Result<()> {
        let mut inner = self.inner.lock();
        if let Some(file) = &mut inner.file {
            file.set_len(0).map_err(DocError::Io)?;
            file.seek(SeekFrom::Start(0)).map_err(DocError::Io)?;
            file.flush().map_err(DocError::Io)?;
            file.sync_all().map_err(DocError::Io)?;
        } else {
            inner.mem_frames.clear();
        }
        Ok(())
    }
}
