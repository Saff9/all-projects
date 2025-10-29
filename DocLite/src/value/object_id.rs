use std::fmt;
use std::sync::atomic::{AtomicU32, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use rand::RngCore;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

static COUNTER: AtomicU32 = AtomicU32::new(0);
static MACHINE_AND_PROC: std::sync::OnceLock<[u8; 5]> = std::sync::OnceLock::new();

fn get_machine_and_proc() -> &'static [u8; 5] {
    MACHINE_AND_PROC.get_or_init(|| {
        let mut bytes = [0u8; 5];
        rand::thread_rng().fill_bytes(&mut bytes);
        bytes
    })
}

/// A 12-byte BSON-compatible ObjectId:
/// - 4-byte timestamp (seconds since Unix epoch)
/// - 5-byte random machine + process identifier
/// - 3-byte monotonically incrementing counter
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ObjectId {
    bytes: [u8; 12],
}

impl ObjectId {
    /// Generate a new unique ObjectId.
    pub fn new() -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as u32;

        let timestamp_bytes = now.to_be_bytes();
        let machine_proc = get_machine_and_proc();
        let count = COUNTER.fetch_add(1, Ordering::Relaxed);
        let count_bytes = count.to_be_bytes(); // last 3 bytes used

        let mut bytes = [0u8; 12];
        bytes[0..4].copy_from_slice(&timestamp_bytes);
        bytes[4..9].copy_from_slice(machine_proc);
        bytes[9] = count_bytes[1];
        bytes[10] = count_bytes[2];
        bytes[11] = count_bytes[3];

        Self { bytes }
    }

    /// Construct an ObjectId from raw 12 bytes.
    pub const fn from_bytes(bytes: [u8; 12]) -> Self {
        Self { bytes }
    }

    /// Return reference to raw 12 bytes.
    pub fn as_bytes(&self) -> &[u8; 12] {
        &self.bytes
    }

    /// Convert raw 12 bytes to byte array.
    pub fn to_bytes(self) -> [u8; 12] {
        self.bytes
    }

    /// Parse a 24-character hexadecimal string into an ObjectId.
    pub fn parse_str(hex_str: &str) -> Result<Self, String> {
        if hex_str.len() != 24 {
            return Err(format!("Invalid ObjectId length: expected 24 hex chars, got {}", hex_str.len()));
        }
        let mut bytes = [0u8; 12];
        for i in 0..12 {
            let slice = &hex_str[i * 2..i * 2 + 2];
            bytes[i] = u8::from_str_radix(slice, 16)
                .map_err(|e| format!("Invalid hex byte '{}': {}", slice, e))?;
        }
        Ok(Self { bytes })
    }

    /// Convert the ObjectId to a 24-character lowercase hex string.
    pub fn to_hex(&self) -> String {
        let mut s = String::with_capacity(24);
        for b in &self.bytes {
            use std::fmt::Write;
            let _ = write!(&mut s, "{:02x}", b);
        }
        s
    }

    /// Extract the timestamp component (seconds since Unix epoch).
    pub fn timestamp(&self) -> u32 {
        u32::from_be_bytes([self.bytes[0], self.bytes[1], self.bytes[2], self.bytes[3]])
    }
}

impl Default for ObjectId {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Debug for ObjectId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "ObjectId(\"{}\")", self.to_hex())
    }
}

impl fmt::Display for ObjectId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_hex())
    }
}

impl Serialize for ObjectId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_hex())
    }
}

impl<'de> Deserialize<'de> for ObjectId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        ObjectId::parse_str(&s).map_err(serde::de::Error::custom)
    }
}
