use std::fmt;
use std::io;

/// Specialized Result type for DocLite operations.
pub type Result<T> = std::result::Result<T, DocError>;

/// Comprehensive error types for the DocLite database engine.
#[derive(Debug)]
pub enum DocError {
    /// I/O error interacting with disk storage or WAL files.
    Io(io::Error),
    /// Data serialization or deserialization error.
    Serialization(String),
    /// Database file or page corruption detected (e.g. CRC32 mismatch).
    Corruption(String),
    /// Invalid database header or signature mismatch.
    InvalidHeader(String),
    /// Page not found or invalid page ID.
    PageNotFound(u32),
    /// Buffer pool is exhausted and no frames can be evicted.
    BufferPoolExhausted,
    /// Duplicate key error for unique index.
    DuplicateKey {
        index_name: String,
        key: String,
    },
    /// Collection not found in catalog.
    CollectionNotFound(String),
    /// Collection already exists.
    CollectionAlreadyExists(String),
    /// Index not found.
    IndexNotFound(String),
    /// Index already exists.
    IndexAlreadyExists(String),
    /// Invalid query syntax or unsupported operator.
    InvalidQuery(String),
    /// Invalid aggregation pipeline stage or accumulator.
    InvalidAggregation(String),
    /// Invalid update operator or modification syntax.
    InvalidUpdate(String),
    /// Transaction conflict or invalid transaction state.
    TransactionError(String),
    /// Document size exceeds maximum permitted overflow limit.
    DocumentTooLarge(usize),
    /// Generic internal engine error.
    Internal(String),
}

impl fmt::Display for DocError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DocError::Io(err) => write!(f, "I/O error: {}", err),
            DocError::Serialization(msg) => write!(f, "Serialization error: {}", msg),
            DocError::Corruption(msg) => write!(f, "Data corruption error: {}", msg),
            DocError::InvalidHeader(msg) => write!(f, "Invalid database header: {}", msg),
            DocError::PageNotFound(id) => write!(f, "Page ID {} not found", id),
            DocError::BufferPoolExhausted => write!(f, "Buffer pool exhausted (all frames pinned)"),
            DocError::DuplicateKey { index_name, key } => {
                write!(f, "Duplicate key error on index '{}': key '{}'", index_name, key)
            }
            DocError::CollectionNotFound(name) => write!(f, "Collection '{}' not found", name),
            DocError::CollectionAlreadyExists(name) => write!(f, "Collection '{}' already exists", name),
            DocError::IndexNotFound(name) => write!(f, "Index '{}' not found", name),
            DocError::IndexAlreadyExists(name) => write!(f, "Index '{}' already exists", name),
            DocError::InvalidQuery(msg) => write!(f, "Invalid query: {}", msg),
            DocError::InvalidAggregation(msg) => write!(f, "Invalid aggregation pipeline: {}", msg),
            DocError::InvalidUpdate(msg) => write!(f, "Invalid update expression: {}", msg),
            DocError::TransactionError(msg) => write!(f, "Transaction error: {}", msg),
            DocError::DocumentTooLarge(sz) => write!(f, "Document size ({} bytes) exceeds maximum limit", sz),
            DocError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for DocError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            DocError::Io(err) => Some(err),
            _ => None,
        }
    }
}

impl From<io::Error> for DocError {
    fn from(err: io::Error) -> Self {
        DocError::Io(err)
    }
}

impl From<serde_json::Error> for DocError {
    fn from(err: serde_json::Error) -> Self {
        DocError::Serialization(err.to_string())
    }
}
