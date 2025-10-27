use std::sync::Arc;
use crate::error::{DocError, Result};
use crate::storage::buffer_pool::BufferPool;
use crate::wal::log::Wal;

pub struct Transaction {
    pub tx_id: u64,
    pub wal: Arc<Wal>,
    pub buffer_pool: BufferPool,
    pub is_active: bool,
}

impl Transaction {
    pub fn new(tx_id: u64, wal: Arc<Wal>, buffer_pool: BufferPool) -> Self {
        Self {
            tx_id,
            wal,
            buffer_pool,
            is_active: true,
        }
    }

    /// Commit the transaction durably to disk.
    pub fn commit(&mut self) -> Result<()> {
        if !self.is_active {
            return Err(DocError::TransactionError("Transaction is not active".to_string()));
        }

        self.wal.log_commit(self.tx_id)?;
        self.buffer_pool.flush_all()?;
        self.is_active = false;
        Ok(())
    }

    /// Rollback/Abort the transaction.
    pub fn rollback(&mut self) -> Result<()> {
        if !self.is_active {
            return Err(DocError::TransactionError("Transaction is not active".to_string()));
        }

        self.wal.log_abort(self.tx_id)?;
        self.is_active = false;
        Ok(())
    }
}

impl Drop for Transaction {
    fn drop(&mut self) {
        if self.is_active {
            let _ = self.rollback();
        }
    }
}
