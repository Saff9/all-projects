use std::cmp::Ordering;
use std::fmt;
use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::Cursor;
use crate::error::{DocError, Result};
use crate::value::codec::ValueCodec;
use crate::value::types::DocValue;

/// An index key, representing one or more field values in compound indexes.
#[derive(Clone, PartialEq, Eq)]
pub struct IndexKey {
    pub values: Vec<DocValue>,
}

impl IndexKey {
    pub fn new_single(val: DocValue) -> Self {
        Self {
            values: vec![val],
        }
    }

    pub fn new_compound(vals: Vec<DocValue>) -> Self {
        Self { values: vals }
    }

    pub fn encode(&self) -> Result<Vec<u8>> {
        let mut buf = Vec::new();
        buf.write_u16::<LittleEndian>(self.values.len() as u16).map_err(DocError::Io)?;
        for v in &self.values {
            ValueCodec::encode_to(&mut buf, v)?;
        }
        Ok(buf)
    }

    pub fn decode(bytes: &[u8]) -> Result<Self> {
        let mut cursor = Cursor::new(bytes);
        let count = cursor.read_u16::<LittleEndian>().map_err(DocError::Io)? as usize;
        let mut values = Vec::with_capacity(count);
        for _ in 0..count {
            values.push(ValueCodec::decode_from(&mut cursor)?);
        }
        Ok(Self { values })
    }
}

impl Ord for IndexKey {
    fn cmp(&self, other: &Self) -> Ordering {
        for (v1, v2) in self.values.iter().zip(other.values.iter()) {
            let cmp = v1.cmp(v2);
            if cmp != Ordering::Equal {
                return cmp;
            }
        }
        self.values.len().cmp(&other.values.len())
    }
}

impl PartialOrd for IndexKey {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl fmt::Debug for IndexKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.values.len() == 1 {
            write!(f, "Key({:?})", self.values[0])
        } else {
            write!(f, "CompoundKey({:?})", self.values)
        }
    }
}

impl fmt::Display for IndexKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.values.len() == 1 {
            write!(f, "{}", self.values[0])
        } else {
            let items: Vec<String> = self.values.iter().map(|v| v.to_string()).collect();
            write!(f, "[{}]", items.join(", "))
        }
    }
}
