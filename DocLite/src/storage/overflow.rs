use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::Cursor;
use crate::error::{DocError, Result};
use crate::storage::page::{Page, PageId, PageType, INVALID_PAGE_ID, PAGE_SIZE};
use crate::storage::pager::Pager;

pub const OVERFLOW_FLAG: u8 = 0xFF;
pub const OVERFLOW_HEADER_SIZE: usize = 13; // CRC(4) + Type(1) + NextPage(4) + ChunkLen(4)
pub const MAX_OVERFLOW_CHUNK: usize = PAGE_SIZE - OVERFLOW_HEADER_SIZE;

/// Writes large document data across one or more chained overflow pages.
/// Returns the first `PageId` in the chain.
pub fn write_overflow_chain(pager: &mut Pager, data: &[u8]) -> Result<PageId> {
    let mut chunks = data.chunks(MAX_OVERFLOW_CHUNK).peekable();
    let mut first_page_id = INVALID_PAGE_ID;
    let mut prev_page_id = INVALID_PAGE_ID;

    while let Some(chunk) = chunks.next() {
        let current_page_id = pager.allocate_page()?;
        if first_page_id == INVALID_PAGE_ID {
            first_page_id = current_page_id;
        }

        // If we had a previous page, link it to current
        if prev_page_id != INVALID_PAGE_ID {
            let mut prev_page = pager.read_page_raw(prev_page_id)?;
            let mut cursor = Cursor::new(&mut prev_page.data[5..9]);
            cursor.write_u32::<LittleEndian>(current_page_id).unwrap();
            prev_page.write_checksum();
            pager.write_page_raw(prev_page_id, &prev_page)?;
        }

        let mut page = Page::new();
        page.data[4] = PageType::Overflow as u8;
        let mut cursor = Cursor::new(&mut page.data[5..OVERFLOW_HEADER_SIZE]);
        cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).unwrap(); // Next page placeholder
        cursor.write_u32::<LittleEndian>(chunk.len() as u32).unwrap();
        
        page.data[OVERFLOW_HEADER_SIZE..OVERFLOW_HEADER_SIZE + chunk.len()].copy_from_slice(chunk);
        page.write_checksum();
        pager.write_page_raw(current_page_id, &page)?;

        prev_page_id = current_page_id;
    }

    Ok(first_page_id)
}

/// Reads the complete byte buffer from a chained sequence of overflow pages.
pub fn read_overflow_chain(pager: &mut Pager, first_page_id: PageId, total_len: usize) -> Result<Vec<u8>> {
    let mut buffer = Vec::with_capacity(total_len);
    let mut current_page_id = first_page_id;

    while current_page_id != INVALID_PAGE_ID {
        let page = pager.read_page_raw(current_page_id)?;
        if page.data[4] != PageType::Overflow as u8 {
            return Err(DocError::Corruption(format!("Expected overflow page at ID {}, got type {}", current_page_id, page.data[4])));
        }

        let mut cursor = Cursor::new(&page.data[5..OVERFLOW_HEADER_SIZE]);
        let next_page_id = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let chunk_len = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;

        if chunk_len > MAX_OVERFLOW_CHUNK {
            return Err(DocError::Corruption(format!("Invalid overflow chunk length: {}", chunk_len)));
        }

        buffer.extend_from_slice(&page.data[OVERFLOW_HEADER_SIZE..OVERFLOW_HEADER_SIZE + chunk_len]);
        current_page_id = next_page_id;
    }

    if buffer.len() != total_len {
        return Err(DocError::Corruption(format!("Overflow chain length mismatch: expected {}, got {}", total_len, buffer.len())));
    }

    Ok(buffer)
}
