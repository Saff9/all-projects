use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::io::{Cursor, Read, Write};
use crate::error::{DocError, Result};
use crate::value::object_id::ObjectId;
use crate::value::types::DocValue;

const TAG_NULL: u8 = 0x00;
const TAG_BOOL: u8 = 0x01;
const TAG_INT32: u8 = 0x02;
const TAG_INT64: u8 = 0x03;
const TAG_FLOAT64: u8 = 0x04;
const TAG_STRING: u8 = 0x05;
const TAG_OBJECT_ID: u8 = 0x06;
const TAG_DATETIME: u8 = 0x07;
const TAG_BINARY: u8 = 0x08;
const TAG_ARRAY: u8 = 0x09;
const TAG_OBJECT: u8 = 0x0A;
const TAG_MIN_KEY: u8 = 0x0B;
const TAG_MAX_KEY: u8 = 0x0C;

pub struct ValueCodec;

impl ValueCodec {
    /// Encode a DocValue into a byte buffer.
    pub fn encode(value: &DocValue) -> Result<Vec<u8>> {
        let mut buf = Vec::new();
        Self::encode_to(&mut buf, value)?;
        Ok(buf)
    }

    /// Encode a DocValue into a write stream.
    pub fn encode_to<W: Write>(w: &mut W, value: &DocValue) -> Result<()> {
        match value {
            DocValue::MinKey => {
                w.write_u8(TAG_MIN_KEY)?;
            }
            DocValue::MaxKey => {
                w.write_u8(TAG_MAX_KEY)?;
            }
            DocValue::Null => {
                w.write_u8(TAG_NULL)?;
            }
            DocValue::Bool(b) => {
                w.write_u8(TAG_BOOL)?;
                w.write_u8(if *b { 1 } else { 0 })?;
            }
            DocValue::Int32(n) => {
                w.write_u8(TAG_INT32)?;
                w.write_i32::<LittleEndian>(*n)?;
            }
            DocValue::Int64(n) => {
                w.write_u8(TAG_INT64)?;
                w.write_i64::<LittleEndian>(*n)?;
            }
            DocValue::Float64(f) => {
                w.write_u8(TAG_FLOAT64)?;
                w.write_f64::<LittleEndian>(*f)?;
            }
            DocValue::String(s) => {
                w.write_u8(TAG_STRING)?;
                let bytes = s.as_bytes();
                w.write_u32::<LittleEndian>(bytes.len() as u32)?;
                w.write_all(bytes)?;
            }
            DocValue::ObjectId(id) => {
                w.write_u8(TAG_OBJECT_ID)?;
                w.write_all(id.as_bytes())?;
            }
            DocValue::DateTime(ms) => {
                w.write_u8(TAG_DATETIME)?;
                w.write_i64::<LittleEndian>(*ms)?;
            }
            DocValue::Binary(bytes) => {
                w.write_u8(TAG_BINARY)?;
                w.write_u32::<LittleEndian>(bytes.len() as u32)?;
                w.write_all(bytes)?;
            }
            DocValue::Array(arr) => {
                w.write_u8(TAG_ARRAY)?;
                w.write_u32::<LittleEndian>(arr.len() as u32)?;
                for item in arr {
                    Self::encode_to(w, item)?;
                }
            }
            DocValue::Object(obj) => {
                w.write_u8(TAG_OBJECT)?;
                w.write_u32::<LittleEndian>(obj.len() as u32)?;
                for (k, v) in obj {
                    let k_bytes = k.as_bytes();
                    w.write_u32::<LittleEndian>(k_bytes.len() as u32)?;
                    w.write_all(k_bytes)?;
                    Self::encode_to(w, v)?;
                }
            }
        }
        Ok(())
    }

    /// Decode a DocValue from a byte slice.
    pub fn decode(bytes: &[u8]) -> Result<DocValue> {
        let mut cursor = Cursor::new(bytes);
        Self::decode_from(&mut cursor)
    }

    /// Decode a DocValue from a read stream.
    pub fn decode_from<R: Read>(r: &mut R) -> Result<DocValue> {
        let tag = r.read_u8().map_err(DocError::Io)?;
        match tag {
            TAG_MIN_KEY => Ok(DocValue::MinKey),
            TAG_MAX_KEY => Ok(DocValue::MaxKey),
            TAG_NULL => Ok(DocValue::Null),
            TAG_BOOL => {
                let b = r.read_u8().map_err(DocError::Io)?;
                Ok(DocValue::Bool(b != 0))
            }
            TAG_INT32 => {
                let n = r.read_i32::<LittleEndian>().map_err(DocError::Io)?;
                Ok(DocValue::Int32(n))
            }
            TAG_INT64 => {
                let n = r.read_i64::<LittleEndian>().map_err(DocError::Io)?;
                Ok(DocValue::Int64(n))
            }
            TAG_FLOAT64 => {
                let f = r.read_f64::<LittleEndian>().map_err(DocError::Io)?;
                Ok(DocValue::Float64(f))
            }
            TAG_STRING => {
                let len = r.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;
                let mut buf = vec![0u8; len];
                r.read_exact(&mut buf).map_err(DocError::Io)?;
                let s = String::from_utf8(buf).map_err(|e| DocError::Serialization(e.to_string()))?;
                Ok(DocValue::String(s))
            }
            TAG_OBJECT_ID => {
                let mut bytes = [0u8; 12];
                r.read_exact(&mut bytes).map_err(DocError::Io)?;
                Ok(DocValue::ObjectId(ObjectId::from_bytes(bytes)))
            }
            TAG_DATETIME => {
                let ms = r.read_i64::<LittleEndian>().map_err(DocError::Io)?;
                Ok(DocValue::DateTime(ms))
            }
            TAG_BINARY => {
                let len = r.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;
                let mut buf = vec![0u8; len];
                r.read_exact(&mut buf).map_err(DocError::Io)?;
                Ok(DocValue::Binary(buf))
            }
            TAG_ARRAY => {
                let count = r.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;
                let mut arr = Vec::with_capacity(count);
                for _ in 0..count {
                    arr.push(Self::decode_from(r)?);
                }
                Ok(DocValue::Array(arr))
            }
            TAG_OBJECT => {
                let count = r.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;
                let mut obj = Vec::with_capacity(count);
                for _ in 0..count {
                    let k_len = r.read_u32::<LittleEndian>().map_err(DocError::Io)? as usize;
                    let mut k_buf = vec![0u8; k_len];
                    r.read_exact(&mut k_buf).map_err(DocError::Io)?;
                    let k = String::from_utf8(k_buf)
                        .map_err(|e| DocError::Serialization(e.to_string()))?;
                    let v = Self::decode_from(r)?;
                    obj.push((k, v));
                }
                Ok(DocValue::Object(obj))
            }
            other => Err(DocError::Corruption(format!("Unknown DocValue tag: 0x{:02x}", other))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_value_codec_roundtrip() {
        let doc = DocValue::Object(vec![
            ("_id".to_string(), DocValue::ObjectId(ObjectId::new())),
            ("name".to_string(), DocValue::String("Alice".to_string())),
            ("age".to_string(), DocValue::Int32(30)),
            ("score".to_string(), DocValue::Float64(99.5)),
            ("active".to_string(), DocValue::Bool(true)),
            ("tags".to_string(), DocValue::Array(vec![
                DocValue::String("rust".to_string()),
                DocValue::String("database".to_string()),
            ])),
        ]);

        let encoded = ValueCodec::encode(&doc).unwrap();
        let decoded = ValueCodec::decode(&encoded).unwrap();

        assert_eq!(doc, decoded);
    }
}
