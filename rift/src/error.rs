//! Typed library error — used by `auth.rs`, `chunk.rs`, `objects.rs`.
//!
//! The CLI (`bin/main.rs`) keeps using `anyhow::Result` for top-level error
//! reporting; the blanket `From<RiftError> for anyhow::Error` (via the
//! `std::error::Error` impl thiserror generates) means `?` works seamlessly
//! between library functions and CLI code.

use thiserror::Error;

/// The single typed error returned by every public library function.
///
/// Designed so callers can `match` on the variant they care about
/// (e.g. `Auth`, `NotFound`) while still getting rich messages for
/// everything else.
#[derive(Debug, Error)]
pub enum RiftError {
    /// I/O error from the filesystem or a mutex.
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    /// Encryption/decryption failure (AES-256-GCM).
    #[error("crypto error: {0}")]
    Crypto(String),

    /// Object not found in the pack index.
    #[error("not found: {0}")]
    NotFound(String),

    /// Authentication / authorization failure.
    #[error("auth error: {0}")]
    Auth(String),

    /// Serialization / deserialization failure.
    #[error("parse error: {0}")]
    Parse(#[from] serde_json::Error),

    /// Anything else, with a context string for diagnostics.
    #[error("{0}")]
    Other(String),
}

/// Extension trait that lets you add a context string to any `Result`
/// whose error type implements `Display` — a poor-man's `anyhow::Context`
/// for `Result<_, RiftError>`.
///
/// # Example
/// ```ignore
/// std::fs::write(&path, &bytes)
///     .ctx(format!("write credentials to {}", path.display()))?;
/// ```
pub trait RiftContext<T> {
    /// Wrap the underlying error in `RiftError::Other` with the given
    /// context string prepended to the original error message.
    fn ctx<C: Into<String>>(self, ctx: C) -> Result<T, RiftError>;
}

impl<T, E> RiftContext<T> for Result<T, E>
where
    E: std::fmt::Display,
{
    fn ctx<C: Into<String>>(self, ctx: C) -> Result<T, RiftError> {
        self.map_err(|e| RiftError::Other(format!("{}: {e}", ctx.into())))
    }
}
