use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::Cursor;
use crate::error::{DocError, Result};
use crate::storage::page::{Page, PageId, PageType, INVALID_PAGE_ID, PAGE_SIZE};
use crate::storage::pager::Pager;

pub const FREELIST_HEADER_SIZE: usize = 12; // CRC(4) + Type(1) + NextFreeListPage(4) + Count(2) + Reserved(1)
pub const MAX_PAGES_PER_FREELIST_NODE: usize = (PAGE_SIZE - FREELIST_HEADER_SIZE) / 4;

pub struct FreeList;

impl FreeList {
    /// Allocate a page either by popping from the free list or allocating a new page.
    pub fn allocate(pager: &mut Pager) -> Result<PageId> {
        let head_id = pager.header().free_list_head;
        if head_id == INVALID_PAGE_ID {
            return pager.allocate_page();
        }

        let mut head_page = pager.read_page_raw(head_id)?;
        let mut cursor = Cursor::new(&head_page.data[5..FREELIST_HEADER_SIZE]);
        let next_head_id = cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;
        let count = cursor.read_u16::<LittleEndian>().map_err(DocError::Io)?;

        if count == 0 {
            // Unlink empty head page
            pager.header_mut().free_list_head = next_head_id;
            pager.save_header()?;
            return Ok(head_id);
        }

        // Pop last page ID from node
        let target_idx = (count - 1) as usize;
        let offset = FREELIST_HEADER_SIZE + target_idx * 4;
        let mut entry_cursor = Cursor::new(&head_page.data[offset..offset + 4]);
        let reclaimed_id = entry_cursor.read_u32::<LittleEndian>().map_err(DocError::Io)?;

        // Update count on head page
        let mut count_cursor = Cursor::new(&mut head_page.data[9..11]);
        count_cursor.write_u16::<LittleEndian>(count - 1).map_err(DocError::Io)?;
        head_page.write_checksum();
        pager.write_page_raw(head_id, &head_page)?;

        Ok(reclaimed_id)
    }

    /// Return a freed page back to the free list for future allocation.
    pub fn free(pager: &mut Pager, page_id: PageId) -> Result<()> {
        let head_id = pager.header().free_list_head;
        if head_id == INVALID_PAGE_ID {
            // Make freed page the head node
            let mut page = Page::new();
            page.data[4] = PageType::FreeList as u8;
            let mut cursor = Cursor::new(&mut page.data[5..FREELIST_HEADER_SIZE]);
            cursor.write_u32::<LittleEndian>(INVALID_PAGE_ID).map_err(DocError::Io)?;
            cursor.write_u16::<LittleEndian>(0).map_err(DocError::Io)?; // Count = 0
            page.write_checksum();
            pager.write_page_raw(page_id, &page)?;

            pager.header_mut().free_list_head = page_id;
            pager.save_header()?;
            return Ok(());
        }

        let mut head_page = pager.read_page_raw(head_id)?;
        let mut cursor = Cursor::new(&head_page.data[9..11]);
        let count = cursor.read_u16::<LittleEndian>().map_err(DocError::Io)? as usize;

        if count < MAX_PAGES_PER_FREELIST_NODE {
            // Push into current head page
            let offset = FREELIST_HEADER_SIZE + count * 4;
            let mut entry_cursor = Cursor::new(&mut head_page.data[offset..offset + 4]);
            entry_cursor.write_u32::<LittleEndian>(page_id).map_err(DocError::Io)?;

            let mut count_cursor = Cursor::new(&mut head_page.data[9..11]);
            count_cursor.write_u16::<LittleEndian>((count + 1) as u16).map_err(DocError::Io)?;
            head_page.write_checksum();
            pager.write_page_raw(head_id, &head_page)?;
        } else {
            // Current head is full, make new freed page the new head
            let mut new_head = Page::new();
            new_head.data[4] = PageType::FreeList as u8;
            let mut new_cursor = Cursor::new(&mut new_head.data[5..FREELIST_HEADER_SIZE]);
            new_cursor.write_u32::<LittleEndian>(head_id).map_err(DocError::Io)?; // Point to old head
            new_cursor.write_u16::<LittleEndian>(0).map_err(DocError::Io)?;
            new_head.write_checksum();
            pager.write_page_raw(page_id, &new_head)?;

            pager.header_mut().free_list_head = page_id;
            pager.save_header()?;
        }

        Ok(())
    }
}
