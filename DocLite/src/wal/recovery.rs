use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use crate::error::{DocError, Result};
use crate::storage::page::{Page, PageId, PAGE_SIZE};
use crate::storage::pager::Pager;
use crate::wal::record::{WalFrame, WalOpType};

pub struct RecoveryEngine;

impl RecoveryEngine {
    /// Perform crash recovery by replaying committed WAL frames into the database pager.
    pub fn recover_from_path<P: AsRef<Path>>(wal_path: P, pager: &mut Pager) -> Result<u64> {
        let path = wal_path.as_ref();
        if !path.exists() {
            return Ok(0);
        }

        let file = File::open(path).map_err(DocError::Io)?;
        let mut reader = BufReader::new(file);

        let mut frames = Vec::new();
        let mut max_lsn = 0;

        while let Some(frame) = WalFrame::decode(&mut reader)? {
            if frame.lsn > max_lsn {
                max_lsn = frame.lsn;
            }
            frames.push(frame);
        }

        if frames.is_empty() {
            return Ok(0);
        }

        // Analysis Phase: Identify committed and aborted transactions
        let mut committed_tx = HashSet::new();
        let mut aborted_tx = HashSet::new();

        for frame in &frames {
            match frame.op_type {
                WalOpType::Commit => {
                    committed_tx.insert(frame.tx_id);
                }
                WalOpType::Abort => {
                    aborted_tx.insert(frame.tx_id);
                }
                _ => {}
            }
        }

        // Redo Phase: Replay page updates of committed transactions
        // Map latest page state: page_id -> Page
        let mut latest_pages: HashMap<PageId, Page> = HashMap::new();

        for frame in frames {
            if frame.op_type == WalOpType::PageUpdate {
                // If transaction committed (or tx_id == 0 for implicit system checkpoints)
                if frame.tx_id == 0 || committed_tx.contains(&frame.tx_id) {
                    if frame.payload.len() == PAGE_SIZE {
                        let mut page = Page::new();
                        page.data.copy_from_slice(&frame.payload);
                        latest_pages.insert(frame.page_id, page);
                    }
                }
            }
        }

        // Write recovered pages to disk
        for (page_id, page) in latest_pages {
            pager.write_page_raw(page_id, &page)?;
        }

        pager.sync()?;
        Ok(max_lsn)
    }
}
