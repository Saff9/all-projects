//! Operation log — every rift command is logged with enough info to undo it.
//! This is the key innovation: `rift undo` actually works because every
//! operation is recorded.
//!
//! v0.8: switched from a single JSON array (`oplog.json`, O(n²) rewrite on
//! every append) to JSONL (`oplog.jsonl`, one object per line, O(1) append).
//! The `Operation` struct is unchanged so per-line JSON is identical to the
//! old array entries — consumers of `rift history --json` see the same shape.
//!
//! Backwards-compat: if `oplog.jsonl` is missing but a legacy `oplog.json`
//! array file exists, it is migrated on first open (read array → write JSONL
//! → rename old file to `.bak`).

use anyhow::Context;
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, BufWriter, Write};
use std::path::{Path, PathBuf};

/// One recorded operation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    /// Monotonic operation id (1-indexed).
    pub id: u64,
    /// Command name, e.g. `"save"`, `"checkout"`, `"merge"`, `"branch"`.
    pub command: String,
    /// Command-line args captured at invocation time.
    pub args: Vec<String>,
    /// Unix-epoch seconds when the operation was logged.
    pub timestamp: i64,
    /// Branch checked out when the operation started.
    pub branch_before: String,
    /// HEAD commit hash before the operation (None if no commits yet).
    pub commit_before: Option<String>,
    /// HEAD commit hash after the operation (None on failure or no commits).
    pub commit_after: Option<String>,
    /// Whether the operation completed successfully.
    pub success: bool,
}

/// The operation log, stored at `.rift/oplog.jsonl` (one JSON object per line).
pub struct OpLog {
    /// Path to the JSONL log file.
    pub path: PathBuf,
}

impl OpLog {
    /// Open the operation log under `rift_dir`, migrating a legacy
    /// `oplog.json` array file on first use if needed.
    #[must_use]
    pub fn new(rift_dir: &Path) -> Self {
        let path = rift_dir.join("oplog.jsonl");
        let log = Self { path };
        log.maybe_migrate_legacy(rift_dir);
        log
    }

    /// If we have a legacy `oplog.json` (array) and no `oplog.jsonl`,
    /// convert it once and rename the old file to `.bak`.
    fn maybe_migrate_legacy(&self, rift_dir: &Path) {
        if self.path.exists() {
            return;
        }
        let legacy = rift_dir.join("oplog.json");
        let Ok(text) = std::fs::read_to_string(&legacy) else {
            return;
        };
        let Ok(ops) = serde_json::from_str::<Vec<Operation>>(&text) else {
            return;
        };
        if let Err(e) = self.write_all(&ops) {
            eprintln!("[rift] warning: oplog migration failed: {e}");
            return;
        }
        let _ = std::fs::rename(&legacy, rift_dir.join("oplog.json.bak"));
    }

    /// Read all operations (parsing each JSONL line; malformed lines skipped).
    #[must_use]
    pub fn read(&self) -> Vec<Operation> {
        let Ok(file) = std::fs::File::open(&self.path) else {
            return Vec::new();
        };
        let reader = BufReader::new(file);
        let mut out = Vec::new();
        for line in reader.lines().flatten() {
            if line.trim().is_empty() {
                continue;
            }
            if let Ok(op) = serde_json::from_str::<Operation>(&line) {
                out.push(op);
            }
        }
        out
    }

    /// Append a single operation — O(1) file append, no full rewrite.
    pub fn append(&self, op: Operation) -> anyhow::Result<()> {
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent).with_context(|| "create oplog parent")?;
        }
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .with_context(|| format!("open oplog at {}", self.path.display()))?;
        let mut w = BufWriter::new(file);
        let line = serde_json::to_string(&op).context("serialize oplog entry")?;
        w.write_all(line.as_bytes()).with_context(|| "write oplog line")?;
        w.write_all(b"\n").with_context(|| "write oplog newline")?;
        w.flush().with_context(|| "flush oplog")?;
        Ok(())
    }

    /// Internal helper for the legacy migration — write a list of ops as JSONL.
    fn write_all(&self, ops: &[Operation]) -> anyhow::Result<()> {
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&self.path)?;
        let mut w = BufWriter::new(file);
        for op in ops {
            let line = serde_json::to_string(op)?;
            w.write_all(line.as_bytes())?;
            w.write_all(b"\n")?;
        }
        w.flush()?;
        Ok(())
    }

    /// Get the last N operations.
    #[must_use]
    pub fn recent(&self, n: usize) -> Vec<Operation> {
        let mut ops = self.read();
        let len = ops.len();
        if len > n {
            ops.drain(..len - n);
        }
        ops.reverse();
        ops
    }

    /// Get the last successful operation.
    #[must_use]
    pub fn last_success(&self) -> Option<Operation> {
        self.read().into_iter().rev().find(|op| op.success)
    }
}
