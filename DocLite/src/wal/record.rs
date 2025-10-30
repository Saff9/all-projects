use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::{Cursor, Read};
use crate::error::{DocError, Result};
use crate::storage::page::{Page, PageId};

pub const WAL_MAGIC: &[u8; 8] = b"DOCWAL\0\0";
pub const WAL_HEADER_SIZE: usize = 36; // Magic(8) + LSN(8) + TxID(8) + OpType(1) + Reserved(3) + PageID(4) + PayloadLen(4) + CRC32(4)

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum WalOpType {
    Begin = 1,
    Commit = 2,
    Abort = 3,
    PageUpdate = 4,
    Checkpoint = 5,
}

impl WalOpType {
    pub fn from_u8(v: u8) -> Option<Self> {
        match v {
            1 => Some(WalOpType::Begin),
            2 => Some(WalOpType::Commit),
            3 => Some(WalOpType::Abort),
            4 => Some(WalOpType::PageUpdate),
            5 => Some(WalOpType::Checkpoint),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct WalFrame {
    pub lsn: u64,
    pub tx_id: u64,
    pub op_type: WalOpType,
    pub page_id: PageId,
    pub payload: Vec<u8>,
}

impl WalFrame {
    pub fn new_begin(lsn: u64, tx_id: u64) -> Self {
        Self {
            lsn,
            tx_id,
            op_type: WalOpType::Begin,
            page_id: 0,
            payload: Vec::new(),
        }
    }

    pub fn new_commit(lsn: u64, tx_id: u64) -> Self {
        Self {
            lsn,
            tx_id,
            op_type: WalOpType::Commit,
            page_id: 0,
            payload: Vec::new(),
        }
    }

    pub fn new_abort(lsn: u64, tx_id: u64) -> Self {
        Self {
            lsn,
            tx_id,
            op_type: WalOpType::Abort,
            page_id: 0,
            payload: Vec::new(),
        }
    }

    pub fn new_page_update(lsn: u64, tx_id: u64, page_id: PageId, page: &Page) -> Self {
        Self {
            lsn,
            tx_id,
            op_type: WalOpType::PageUpdate,
            page_id,
            payload: page.data.to_vec(),
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(WAL_HEADER_SIZE + self.payload.len());
        buf.extend_from_slice(WAL_MAGIC);
        let _ = buf.write_u64::<LittleEndian>(self.lsn);
        let _ = buf.write_u64::<LittleEndian>(self.tx_id);
        let _ = buf.write_u8(self.op_type as u8);
        buf.extend_from_slice(&[0u8; 3]); // reserved padding
        let _ = buf.write_u32::<LittleEndian>(self.page_id);
        let _ = buf.write_u32::<LittleEndian>(self.payload.len() as u32);

        let mut hasher = crc32fast::Hasher::new();
        hasher.update(&buf[8..]);
        hasher.update(&self.payload);
        let crc = hasher.finalize();
        let _ = buf.write_u32::<LittleEndian>(crc);

        buf.extend_from_slice(&self.payload);
        buf
    }

    pub fn decode<R: Read>(reader: &mut R) -> Result<Option<Self>> {
        let mut header_buf = [0u8; WAL_HEADER_SIZE];
        let _ = match reader.read_exact(&mut header_buf) {
            Ok(_) => WAL_HEADER_SIZE,
            Err(e) if e.kind() == std::io::ErrorKind::UnexpectedEof => return Ok(None),
            Err(e) => return Err(DocError::Io(e)),
        };

        if &header_buf[0..8] != WAL_MAGIC {
            return Err(DocError::Corruption("Invalid WAL magic signature".to_string()));
        }

        let mut cursor = Cursor::new(&header_buf[8..]);
        let lsn = cursor.read_u64::<LittleEndian>().map_err(DocError::Io)?;
        let tx_id = cursor.read_u64::<LittleEndian>().map_err(DocError::Io)?;
        let op_type_u8 = cursor.read_u8().map_err(DocError::Io)?;
        let op_type = WalOpType::from_u8(op_type_u8)
            .ok_or_else(|| DocError::Corruption(format!("Unknown WAL op type {}", op_type_u8)))?;
        
        let mut pad = [0u8; 3];
        cursor.read_exact(&mut pad).map_err(DocError::Io)?;
        let page_id = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let payload_len = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;
        let stored_crc = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;

        let mut payload = vec![0u8; payload_len];
        if payload_len > 0 {
            reader.read_exact(&mut payload).map_err(DocError::Io)?;
        }

        // Verify checksum
        let mut hasher = crc32fast::Hasher::new();
        hasher.update(&header_buf[8..WAL_HEADER_SIZE - 4]);
        hasher.update(&payload);
        let computed_crc = hasher.finalize();

        if stored_crc != computed_crc {
            return Err(DocError::Corruption(format!(
                "WAL frame CRC mismatch at LSN {}: stored {:08x}, computed {:08x}",
                lsn, stored_crc, computed_crc
            )));
        }

        Ok(Some(Self {
            lsn,
            tx_id,
            op_type,
            page_id,
            payload,
        }))
    }
}
