use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::Cursor;
use crate::storage::page::{Page, PageId, PageType, INVALID_PAGE_ID, PAGE_SIZE};

pub const SLOTTED_HEADER_SIZE: usize = 22;
pub const SLOT_ENTRY_SIZE: usize = 4; // u16 offset, u16 length

/// A Record Identifier pointing to a specific page and slot.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct RecordId {
    pub page_id: PageId,
    pub slot_id: u16,
}

impl RecordId {
    pub fn new(page_id: PageId, slot_id: u16) -> Self {
        Self { page_id, slot_id }
    }

    pub fn to_u64(&self) -> u64 {
        ((self.page_id as u64) << 16) | (self.slot_id as u64)
    }

    pub fn from_u64(val: u64) -> Self {
        let page_id = (val >> 16) as u32;
        let slot_id = (val & 0xFFFF) as u16;
        Self { page_id, slot_id }
    }
}

/// Slot entry within the slotted page table.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Slot {
    pub offset: u16,
    pub length: u16,
}

impl Slot {
    pub fn is_deleted(&self) -> bool {
        self.offset == 0 && self.length == 0
    }
}

/// Helper for reading and modifying a Slotted Data Page.
pub struct SlottedPage;

impl SlottedPage {
    /// Initialize a raw page as a fresh Slotted Data Page.
    pub fn init(page: &mut Page, prev_page: PageId, next_page: PageId) {
        page.data.fill(0);
        page.data[4] = PageType::SlottedData as u8;
        page.data[5] = 0; // Flags

        let mut cursor = Cursor::new(&mut page.data[6..SLOTTED_HEADER_SIZE]);
        cursor.write_u16::<LittleEndian>(0).unwrap(); // slot_count = 0
        cursor.write_u16::<LittleEndian>(PAGE_SIZE as u16).unwrap(); // free_space_offset = 4096
        cursor.write_u32::<LittleEndian>(next_page).unwrap();
        cursor.write_u32::<LittleEndian>(prev_page).unwrap();
        cursor.write_u32::<LittleEndian>(0).unwrap(); // lsn

        page.write_checksum();
    }

    pub fn get_slot_count(page: &Page) -> u16 {
        let mut cursor = Cursor::new(&page.data[6..8]);
        cursor.read_u16::<LittleEndian>().unwrap_or(0)
    }

    pub fn set_slot_count(page: &mut Page, count: u16) {
        let mut cursor = Cursor::new(&mut page.data[6..8]);
        let _ = cursor.write_u16::<LittleEndian>(count);
    }

    pub fn get_free_space_offset(page: &Page) -> u16 {
        let mut cursor = Cursor::new(&page.data[8..10]);
        cursor.read_u16::<LittleEndian>().unwrap_or(PAGE_SIZE as u16)
    }

    pub fn set_free_space_offset(page: &mut Page, offset: u16) {
        let mut cursor = Cursor::new(&mut page.data[8..10]);
        let _ = cursor.write_u16::<LittleEndian>(offset);
    }

    pub fn get_next_page(page: &Page) -> PageId {
        let mut cursor = Cursor::new(&page.data[10..14]);
        cursor.read_u32::<LittleEndian>().unwrap_or(INVALID_PAGE_ID)
    }

    pub fn set_next_page(page: &mut Page, next_page: PageId) {
        let mut cursor = Cursor::new(&mut page.data[10..14]);
        let _ = cursor.write_u32::<LittleEndian>(next_page);
    }

    pub fn get_prev_page(page: &Page) -> PageId {
        let mut cursor = Cursor::new(&page.data[14..18]);
        cursor.read_u32::<LittleEndian>().unwrap_or(INVALID_PAGE_ID)
    }

    pub fn set_prev_page(page: &mut Page, prev_page: PageId) {
        let mut cursor = Cursor::new(&mut page.data[14..18]);
        let _ = cursor.write_u32::<LittleEndian>(prev_page);
    }

    /// Read a specific slot from the slot table.
    pub fn get_slot(page: &Page, slot_id: u16) -> Option<Slot> {
        let slot_count = Self::get_slot_count(page);
        if slot_id >= slot_count {
            return None;
        }

        let slot_pos = SLOTTED_HEADER_SIZE + (slot_id as usize) * SLOT_ENTRY_SIZE;
        let mut cursor = Cursor::new(&page.data[slot_pos..slot_pos + SLOT_ENTRY_SIZE]);
        let offset = cursor.read_u16::<LittleEndian>().ok()?;
        let length = cursor.read_u16::<LittleEndian>().ok()?;

        Some(Slot { offset, length })
    }

    /// Write or update a slot entry in the table.
    pub fn set_slot(page: &mut Page, slot_id: u16, slot: Slot) {
        let slot_pos = SLOTTED_HEADER_SIZE + (slot_id as usize) * SLOT_ENTRY_SIZE;
        let mut cursor = Cursor::new(&mut page.data[slot_pos..slot_pos + SLOT_ENTRY_SIZE]);
        let _ = cursor.write_u16::<LittleEndian>(slot.offset);
        let _ = cursor.write_u16::<LittleEndian>(slot.length);
    }

    /// Calculate total contiguous free space available without defragmentation.
    pub fn free_space(page: &Page) -> usize {
        let slot_count = Self::get_slot_count(page) as usize;
        let slot_end = SLOTTED_HEADER_SIZE + slot_count * SLOT_ENTRY_SIZE;
        let free_space_offset = Self::get_free_space_offset(page) as usize;

        if free_space_offset > slot_end {
            free_space_offset - slot_end
        } else {
            0
        }
    }

    /// Calculate total free space including fragmented space from deleted slots.
    pub fn total_free_space(page: &Page) -> usize {
        let slot_count = Self::get_slot_count(page);
        let mut used_payload = 0;
        for i in 0..slot_count {
            if let Some(slot) = Self::get_slot(page, i) {
                if !slot.is_deleted() {
                    used_payload += slot.length as usize;
                }
            }
        }
        let header_and_slots = SLOTTED_HEADER_SIZE + (slot_count as usize) * SLOT_ENTRY_SIZE;
        if PAGE_SIZE > header_and_slots + used_payload {
            PAGE_SIZE - (header_and_slots + used_payload)
        } else {
            0
        }
    }

    /// Defragment/compact all active records inside the page to remove holes.
    pub fn defragment(page: &mut Page) {
        let slot_count = Self::get_slot_count(page);
        let mut records: Vec<(u16, Vec<u8>)> = Vec::new();

        for i in 0..slot_count {
            if let Some(slot) = Self::get_slot(page, i) {
                if !slot.is_deleted() {
                    let start = slot.offset as usize;
                    let end = start + slot.length as usize;
                    records.push((i, page.data[start..end].to_vec()));
                }
            }
        }

        // Reset free space offset to top of page payload area
        let mut current_offset = PAGE_SIZE;

        // Clear payload area
        let slot_table_end = SLOTTED_HEADER_SIZE + (slot_count as usize) * SLOT_ENTRY_SIZE;
        page.data[slot_table_end..PAGE_SIZE].fill(0);

        // Copy records backwards from end of page
        for (slot_id, payload) in records {
            current_offset -= payload.len();
            page.data[current_offset..current_offset + payload.len()].copy_from_slice(&payload);
            Self::set_slot(
                page,
                slot_id,
                Slot {
                    offset: current_offset as u16,
                    length: payload.len() as u16,
                },
            );
        }

        Self::set_free_space_offset(page, current_offset as u16);
        page.write_checksum();
    }

    /// Attempt to insert a record payload into the slotted page.
    /// Returns `Some(slot_id)` on success, or `None` if page does not have sufficient space.
    pub fn insert_record(page: &mut Page, record_data: &[u8]) -> Option<u16> {
        let req_len = record_data.len();
        if req_len == 0 || req_len > PAGE_SIZE - SLOTTED_HEADER_SIZE - SLOT_ENTRY_SIZE {
            return None;
        }

        // Find reusable dead slot or allocate new slot
        let slot_count = Self::get_slot_count(page);
        let mut target_slot_id = None;

        for i in 0..slot_count {
            if let Some(slot) = Self::get_slot(page, i) {
                if slot.is_deleted() {
                    target_slot_id = Some(i);
                    break;
                }
            }
        }

        let needed_space = if target_slot_id.is_some() {
            req_len
        } else {
            req_len + SLOT_ENTRY_SIZE
        };

        if Self::free_space(page) < needed_space {
            if Self::total_free_space(page) >= needed_space {
                Self::defragment(page);
            } else {
                return None;
            }
        }

        let slot_id = match target_slot_id {
            Some(id) => id,
            None => {
                Self::set_slot_count(page, slot_count + 1);
                slot_count
            }
        };

        let mut offset = Self::get_free_space_offset(page) as usize;
        offset -= req_len;

        page.data[offset..offset + req_len].copy_from_slice(record_data);
        Self::set_free_space_offset(page, offset as u16);
        Self::set_slot(
            page,
            slot_id,
            Slot {
                offset: offset as u16,
                length: req_len as u16,
            },
        );

        page.write_checksum();
        Some(slot_id)
    }

    /// Read a record payload by slot_id.
    pub fn read_record<'a>(page: &'a Page, slot_id: u16) -> Option<&'a [u8]> {
        let slot = Self::get_slot(page, slot_id)?;
        if slot.is_deleted() {
            return None;
        }
        let start = slot.offset as usize;
        let end = start + slot.length as usize;
        if end <= PAGE_SIZE {
            Some(&page.data[start..end])
        } else {
            None
        }
    }

    /// Delete a record at slot_id.
    pub fn delete_record(page: &mut Page, slot_id: u16) -> bool {
        let _slot = match Self::get_slot(page, slot_id) {
            Some(s) if !s.is_deleted() => s,
            _ => return false,
        };

        Self::set_slot(
            page,
            slot_id,
            Slot {
                offset: 0,
                length: 0,
            },
        );

        // If this was the last slot in the table, decrement slot_count
        let mut slot_count = Self::get_slot_count(page);
        while slot_count > 0 {
            if let Some(last_slot) = Self::get_slot(page, slot_count - 1) {
                if last_slot.is_deleted() {
                    slot_count -= 1;
                    Self::set_slot_count(page, slot_count);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        page.write_checksum();
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slotted_page_crud() {
        let mut page = Page::new();
        SlottedPage::init(&mut page, INVALID_PAGE_ID, INVALID_PAGE_ID);

        let data1 = b"Hello DocLite Storage Engine!";
        let data2 = b"Secondary document payload";
        let data3 = b"Third record to be inserted";

        let slot0 = SlottedPage::insert_record(&mut page, data1).unwrap();
        let slot1 = SlottedPage::insert_record(&mut page, data2).unwrap();
        let slot2 = SlottedPage::insert_record(&mut page, data3).unwrap();

        assert_eq!(slot0, 0);
        assert_eq!(slot1, 1);
        assert_eq!(slot2, 2);

        assert_eq!(SlottedPage::read_record(&page, slot0).unwrap(), data1);
        assert_eq!(SlottedPage::read_record(&page, slot1).unwrap(), data2);
        assert_eq!(SlottedPage::read_record(&page, slot2).unwrap(), data3);

        // Delete middle slot and insert another
        assert!(SlottedPage::delete_record(&mut page, slot1));
        assert!(SlottedPage::read_record(&page, slot1).is_none());

        let data4 = b"Replaced payload in deleted slot";
        let slot_reused = SlottedPage::insert_record(&mut page, data4).unwrap();
        assert_eq!(slot_reused, 1); // Reuses deleted slot 1
        assert_eq!(SlottedPage::read_record(&page, slot_reused).unwrap(), data4);
    }
}
