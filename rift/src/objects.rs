//! Objects — tree + commit, both stored in the pack file (since v0.8).
//!
//! Before v0.8, `Store` wrote every tree/commit as an individual file under
//! `.rift/objects/<2chars>/<rest>`. That's the same anti-pattern that bloats
//! Git (4KB filesystem block per object). Now trees and commits are serialized
//! to JSON and routed through the `ChunkStore` pack file, exactly like blobs.
//! The `.rift/objects/` directory is no longer created or touched.

use crate::chunk::ChunkStore;
use crate::error::{RiftContext, RiftError};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

/// A tree — maps relative paths to chunked blob hashes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tree {
    /// Map of relative path → blob hash.
    pub entries: BTreeMap<String, String>,
}

/// A commit — a tree + parent + message + author + timestamp.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Commit {
    /// Hash of the tree this commit points at.
    pub tree: String,
    /// Parent commit hash, if any. `None` for the initial commit.
    pub parent: Option<String>,
    /// Commit message.
    pub message: String,
    /// Author name (from `RIFT_AUTHOR`, `GIT_AUTHOR_NAME`, or `"unknown"`).
    pub author: String,
    /// Unix timestamp when the commit was created.
    pub timestamp: i64,
}

/// The store — wraps [`ChunkStore`] for blobs + trees + commits. All three
/// live in the same `pack.dat`.
pub struct Store {
    /// `.rift/` directory.
    pub rift_dir: PathBuf,
    /// The underlying chunk store (manages `pack.dat` + `pack.idx`).
    pub chunks: ChunkStore,
}

impl Store {
    /// Open a store rooted at `rift_dir`.
    #[must_use]
    pub fn new(rift_dir: &Path) -> Self {
        Self {
            rift_dir: rift_dir.to_path_buf(),
            chunks: ChunkStore::new(rift_dir),
        }
    }

    /// Write a tree (manifest of path→hash), return its hash.
    ///
    /// # Errors
    /// Returns `RiftError::Parse` if serialization fails, or any error
    /// from [`ChunkStore::write`].
    pub fn write_tree(&self, tree: &Tree) -> Result<String, RiftError> {
        let bytes = serde_json::to_vec(tree).ctx("serialize tree")?;
        self.chunks.write(&bytes)
    }

    /// Read a tree by hash.
    ///
    /// # Errors
    /// Returns `RiftError::NotFound` if the hash isn't in the index,
    /// `RiftError::Parse` if the bytes don't deserialize as a `Tree`.
    pub fn read_tree(&self, hash: &str) -> Result<Tree, RiftError> {
        let bytes = self
            .chunks
            .read(hash)
            .ctx(format!("read tree {hash}"))?;
        serde_json::from_slice(&bytes).ctx(format!("parse tree {hash}"))
    }

    /// Write a commit, return its hash.
    ///
    /// # Errors
    /// Returns `RiftError::Parse` if serialization fails, or any error
    /// from [`ChunkStore::write`].
    pub fn write_commit(&self, commit: &Commit) -> Result<String, RiftError> {
        let bytes = serde_json::to_vec(commit).ctx("serialize commit")?;
        self.chunks.write(&bytes)
    }

    /// Read a commit by hash.
    ///
    /// # Errors
    /// Returns `RiftError::NotFound` if the hash isn't in the index,
    /// `RiftError::Parse` if the bytes don't deserialize as a `Commit`.
    pub fn read_commit(&self, hash: &str) -> Result<Commit, RiftError> {
        let bytes = self
            .chunks
            .read(hash)
            .ctx(format!("read commit {hash}"))?;
        serde_json::from_slice(&bytes).ctx(format!("parse commit {hash}"))
    }

    /// Write file data as a chunked blob, return its hash.
    ///
    /// # Errors
    /// See [`ChunkStore::write`].
    pub fn write_blob(&self, data: &[u8]) -> Result<String, RiftError> {
        self.chunks.write(data)
    }

    /// Read file data from a chunked blob hash.
    ///
    /// # Errors
    /// See [`ChunkStore::read`].
    pub fn read_blob(&self, hash: &str) -> Result<Vec<u8>, RiftError> {
        self.chunks.read(hash)
    }

    /// Persist the in-memory pack index to disk. Call once after a batch of
    /// writes (e.g. at the end of `Repo::save`). See [`ChunkStore::flush`].
    ///
    /// # Errors
    /// Returns `RiftError::Io` on filesystem failure.
    pub fn flush(&self) -> Result<(), RiftError> {
        self.chunks.flush()
    }

    /// Find a stored object by short hash prefix. O(unique_objects) but fully
    /// in-memory — no disk walk (the v0.7 impl walked `.rift/objects/`).
    ///
    /// # Errors
    /// Returns `RiftError::NotFound` if no stored hash starts with `short`.
    pub fn resolve_hash(&self, short: &str) -> Result<String, RiftError> {
        if short.len() >= 64 {
            return Ok(short.to_string());
        }
        self.chunks
            .find_by_prefix(short)
            .ok_or_else(|| RiftError::NotFound(format!("no object found matching '{short}'")))
    }
}
