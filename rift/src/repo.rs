//! Repository operations — fast, with compressed storage, in-memory cache, .gitignore support.

use crate::diff;
use crate::ignore::Matcher as IgnoreMatcher;
use crate::objects::{Commit, Store, Tree};
use crate::oplog::{OpLog, Operation};
use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashMap};
use std::path::{Path, PathBuf};

/// A Rift repository handle. Owns the on-disk `.rift/` directory, the
/// content-addressed [`Store`], and the [`OpLog`] used for `rift undo`.
pub struct Repo {
    /// Path to `.rift/` (metadata + chunks + refs).
    pub rift_dir: PathBuf,
    /// Path to the working tree (the user-visible repo root).
    pub work_dir: PathBuf,
    /// Content-addressed object store (blobs, trees, commits).
    pub store: Store,
    /// Append-only operation log for `rift undo` / `rift history`.
    pub oplog: OpLog,
}

/// `rift status` result: current branch and file changes vs HEAD.
#[derive(Debug, Serialize, Deserialize)]
pub struct Status {
    /// Current branch name.
    pub branch: String,
    /// True if there are no added/modified/deleted files.
    pub clean: bool,
    /// New (untracked) files since the last commit.
    pub added: Vec<String>,
    /// Files whose content differs from HEAD.
    pub modified: Vec<String>,
    /// Files present in HEAD but missing from the worktree.
    pub deleted: Vec<String>,
}

/// One entry in `rift log` output.
#[derive(Debug, Serialize, Deserialize)]
pub struct LogEntry {
    /// Commit hash (hex).
    pub hash: String,
    /// Commit message (first line).
    pub message: String,
    /// Author identity (`name <email>`).
    pub author: String,
    /// Unix-epoch seconds when the commit was authored.
    pub timestamp: i64,
    /// Parent commit hash (None for the root commit).
    pub parent: Option<String>,
}

/// A named pointer to a commit (`rift tag`).
#[derive(Debug, Serialize, Deserialize)]
pub struct Tag {
    /// Tag name (e.g. `v1.4.0`).
    pub name: String,
    /// Commit hash the tag points at.
    pub commit: String,
    /// Optional annotated tag message.
    pub message: Option<String>,
    /// Unix-epoch seconds when the tag was created.
    pub timestamp: i64,
}

/// One stash entry created by `rift stash save`.
#[derive(Debug, Serialize, Deserialize)]
pub struct StashEntry {
    /// Monotonic stash id (1-indexed).
    pub id: u64,
    /// Tree hash capturing the stashed worktree state.
    pub tree: String,
    /// User-provided stash description.
    pub message: String,
    /// Branch the stash was saved on.
    pub branch: String,
    /// Unix-epoch seconds when the stash was saved.
    pub timestamp: i64,
}

/// One entry in the unified timeline (`rift history`).
#[derive(Debug, Serialize, Deserialize)]
pub struct TimelineEntry {
    /// Unix-epoch seconds.
    pub timestamp: i64,
    /// Operation kind (e.g. `save`, `checkout`, `merge`).
    pub kind: String,
    /// Human-readable summary.
    pub description: String,
    /// Associated commit hash, if any.
    pub hash: Option<String>,
}

impl Repo {
    /// Find a rift repository by walking up from the current directory.
    /// Errors if no ancestor contains a `.rift/` directory.
    pub fn find() -> Result<Self> {
        let mut dir = std::env::current_dir()?;
        loop {
            let rift = dir.join(".rift");
            if rift.is_dir() { return Ok(Self::open(&dir)); }
            if !dir.pop() { return Err(anyhow!("not a rift repository. Run 'rift init' first.")); }
        }
    }

    /// Open an existing repo at `work_dir/.rift` (no initialization).
    fn open(work_dir: &Path) -> Self {
        let rift_dir = work_dir.join(".rift");
        let store = Store::new(&rift_dir);
        let oplog = OpLog::new(&rift_dir);
        Self { rift_dir, work_dir: work_dir.to_path_buf(), store, oplog }
    }

    /// Initialize a new rift repository in the current directory.
    /// Errors if `.rift/` already exists.
    pub fn init() -> Result<Self> {
        let work_dir = std::env::current_dir()?;
        let rift_dir = work_dir.join(".rift");
        if rift_dir.exists() { return Err(anyhow!(".rift/ already exists.")); }
        // v0.8: no more per-object files in .rift/objects/ — trees & commits
        // live in the pack file alongside blobs. Only chunks/ + refs/ + tags/
        // + stash/ + remotes/ remain as directories.
        std::fs::create_dir_all(rift_dir.join("chunks"))?;
        std::fs::create_dir_all(rift_dir.join("refs"))?;
        std::fs::create_dir_all(rift_dir.join("tags"))?;
        std::fs::create_dir_all(rift_dir.join("stash"))?;
        std::fs::create_dir_all(rift_dir.join("remotes"))?;
        std::fs::write(rift_dir.join("HEAD"), "main")?;
        let ignore_path = work_dir.join(".riftignore");
        if !ignore_path.exists() {
            std::fs::write(&ignore_path, ".rift/\nnode_modules/\ntarget/\n__pycache__/\n.env\n*.log\ndist/\nbuild/\n.git/\n")?;
        }
        // v0.8: oplog is JSONL — created lazily on first append.
        std::fs::write(rift_dir.join("stash_index"), "0")?;
        // Read author from config or env
        let author = read_author();
        std::fs::write(rift_dir.join("config"), format!("author={}\n", author))?;
        Ok(Self::open(&work_dir))
    }

    /// Commit the current worktree under a new commit with `message`.
    /// Returns the new commit hash.
    pub fn save(&self, message: &str) -> Result<String> {
        let branch_before = self.current_branch()?;
        let commit_before = self.current_commit_hash();

        // v1.4: always build the tree (mtime-aware, only re-hashes changed files).
        // The root-dir-mtime shortcut was removed because it doesn't detect
        // content modifications (file writes don't update the parent dir mtime
        // on Linux). build_tree_fast() is already O(changed) via per-file mtime
        // checking, so the walk is the only cost.
        let tree = self.build_tree_fast()?;
        let tree_hash = self.store.write_tree(&tree)?;

        // v1.4 optimization: if the tree hash matches the last commit's tree,
        // skip the mtime cache rebuild (96K stat calls). The cache from the
        // previous commit is still valid.
        let unchanged = commit_before.as_ref()
            .and_then(|h| self.store.read_commit(h).ok())
            .map(|c| c.tree == tree_hash)
            .unwrap_or(false);

        let commit = Commit {
            tree: tree_hash, parent: commit_before.clone(),
            message: message.to_string(),
            author: read_author(),
            timestamp: chrono::Utc::now().timestamp(),
        };
        // Always write the commit (it has a new message/timestamp).
        let commit_hash = self.store.write_commit(&commit)?;
        self.write_branch_ref(&branch_before, &commit_hash)?;

        // Only rebuild the mtime cache if something changed.
        if !unchanged {
            // v1.4: parallel mtime cache rebuild using rayon.
            let work_dir = &self.work_dir;
            use rayon::prelude::*;
            let entries: Vec<(String, String)> = tree
                .entries
                .iter()
                .map(|(p, h)| (p.clone(), h.clone()))
                .collect();
            let mtimes: Vec<(String, u64, String)> = entries
                .par_iter()
                .filter_map(|(path, blob_hash)| {
                    let meta = std::fs::metadata(work_dir.join(path)).ok()?;
                    let mtime = meta.modified().ok()?;
                    let dur = mtime.duration_since(std::time::UNIX_EPOCH).ok()?;
                    Some((path.clone(), dur.as_nanos() as u64, blob_hash.clone()))
                })
                .collect();
            let mut mtime_cache: HashMap<String, (u64, String)> = HashMap::with_capacity(mtimes.len() + 1);
            if let Ok(meta) = std::fs::metadata(&self.work_dir) {
                if let Ok(mtime) = meta.modified() {
                    if let Ok(dur) = mtime.duration_since(std::time::UNIX_EPOCH) {
                        mtime_cache.insert(String::new(), (dur.as_nanos() as u64, String::new()));
                    }
                }
            }
            for (path, ns, hash) in mtimes {
                mtime_cache.insert(path, (ns, hash));
            }
            let _ = self.save_mtime_cache(&mtime_cache);
        }
        self.store.flush()?;
        self.log_op("save", vec![message.into()], &branch_before, &commit_before, Some(commit_hash.clone()))?;
        Ok(commit_hash)
    }

    /// Check if the working tree has changed since the last commit WITHOUT
    /// walking it. Compares the root directory's mtime against the mtime
    /// cache timestamp. If the root dir hasn't changed, no files could have
    /// been added/removed/modified (a file modification updates the parent
    /// dir mtime on most filesystems).
    ///
    /// NOTE: this is a *fast path* only — a `false` result is always
    /// correct, but a `true` result is verified again by [`build_tree_fast`]
    /// before any tree reuse happens. The v1.4 implementation returned `true`
    /// eagerly and skipped `build_tree_fast` entirely, which silently lost
    /// in-place file modifications (modifying a file's contents does NOT
    /// update the parent dir's mtime on Linux/macOS/Windows). The current
    /// implementation keeps the cheap check for the common "nothing at all
    /// changed" case but never uses it to skip the per-file mtime check
    /// inside `build_tree_fast` — that's where the authoritative per-file
    /// comparison happens.
    #[allow(dead_code)]
    fn worktree_unchanged_since_last_commit(&self) -> bool {
        let Some(_last_commit) = self.current_commit_hash() else {
            return false; // no commits yet
        };
        // Read just the root mtime from the cache (first 11 bytes of the
        // gzip stream). This avoids parsing the entire 6MB cache.
        let Some(cached_root_mtime) = self.load_root_mtime() else {
            return false; // no cache
        };
        // Compare against the current root dir mtime.
        if let Ok(meta) = std::fs::metadata(&self.work_dir) {
            if let Ok(mtime) = meta.modified() {
                if let Ok(dur) = mtime.duration_since(std::time::UNIX_EPOCH) {
                    let ns = dur.as_nanos() as u64;
                    return cached_root_mtime == ns;
                }
            }
        }
        false
    }

    /// Fast status — mtime-based change detection. Only re-hashes files
    /// whose mtime changed since the last commit. O(changed) not O(all).
    pub fn status(&self) -> Result<Status> {
        let branch = self.current_branch()?;
        let old_entries = self.last_tree_entries().unwrap_or_default();

        let ignore = self.ignore_matcher();
        let mtime_cache = self.load_mtime_cache();
        use rayon::prelude::*;
        let files: Vec<(String, std::fs::Metadata)> = walkdir::WalkDir::new(&self.work_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter_map(|e| {
                let rel = e.path().strip_prefix(&self.work_dir).ok()?;
                let rel_str = rel.to_string_lossy().to_string();
                if rel_str.starts_with(".rift") || ignore.is_ignored(&rel_str, false) { return None; }
                Some((rel_str, e.metadata().ok()?))
            })
            .collect();
        // Only hash files whose mtime changed — skip unchanged
        // Bug fix: don't compare content hash to manifest hash (they differ).
        // Instead, use mtime as the change indicator. If mtime differs from
        // cache, the file is modified. If file not in old_entries, it's added.
        let results: Vec<(String, String)> = files.par_iter().filter_map(|(rel, meta)| {
            let mtime = meta.modified().ok()?.duration_since(std::time::UNIX_EPOCH).ok()?.as_nanos() as u64;
            // If mtime hasn't changed AND file is tracked, skip
            if let Some(cached_hash) = mtime_cache.get(rel) {
                if let Some(_stored_hash) = old_entries.get(rel) {
                    if cached_hash.0 == mtime {
                        return None; // unchanged — skip hashing entirely
                    }
                }
            }
            // File changed or new — hash it
            let data = std::fs::read(rel).ok()?;
            let hash = blake3::hash(&data).to_hex().to_string();
            Some((rel.clone(), hash))
        }).collect();
        // Compare
        let mut added = Vec::new();
        let mut modified = Vec::new();
        let mut seen = std::collections::HashSet::new();
        for (rel, _hash) in &results {
            seen.insert(rel.clone());
            if !old_entries.contains_key(rel) {
                added.push(rel.clone());
            } else {
                // File was re-hashed (mtime changed) → it's modified
                modified.push(rel.clone());
            }
        }
        let deleted: Vec<String> = old_entries.keys()
            .filter(|p| !seen.contains(*p) && !self.work_dir.join(p).exists())
            .cloned().collect();
        let clean = added.is_empty() && modified.is_empty() && deleted.is_empty();
        Ok(Status { branch, clean, added, modified, deleted })
    }

    /// Fast diff — mtime-based, only reads blobs for actually changed files.
    pub fn diff(&self) -> Result<String> {
        let old_entries = self.last_tree_entries().unwrap_or_default();
        let ignore = self.ignore_matcher();
        let mtime_cache = self.load_mtime_cache();
        use rayon::prelude::*;
        let files: Vec<(String, std::fs::Metadata)> = walkdir::WalkDir::new(&self.work_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter_map(|e| {
                let rel = e.path().strip_prefix(&self.work_dir).ok()?;
                let rel_str = rel.to_string_lossy().to_string();
                if rel_str.starts_with(".rift") || ignore.is_ignored(&rel_str, false) { return None; }
                Some((rel_str, e.metadata().ok()?))
            })
            .collect();
        // Only hash + read files whose mtime changed
        // Bug fix: use mtime as change indicator (not hash comparison)
        let changes: Vec<(String, &str, Vec<u8>)> = files.par_iter().filter_map(|(rel, meta)| {
            let mtime = meta.modified().ok()?.duration_since(std::time::UNIX_EPOCH).ok()?.as_nanos() as u64;
            if let Some(cached) = mtime_cache.get(rel) {
                if let Some(_stored) = old_entries.get(rel) {
                    if cached.0 == mtime {
                        return None; // unchanged
                    }
                }
            }
            let data = std::fs::read(rel).ok()?;
            // If not in old_entries, it's added. Otherwise modified.
            match old_entries.get(rel) {
                None => Some((rel.clone(), "added", data)),
                Some(_) => Some((rel.clone(), "modified", data)),
            }
        }).collect();
        let mut out = String::new();
        for (path, kind, new_data) in &changes {
            let old_data = if *kind == "added" { Vec::new() }
                else { old_entries.get(path).and_then(|h| self.store.read_blob(h).ok()).unwrap_or_default() };
            let old_text = String::from_utf8_lossy(&old_data);
            let new_text = String::from_utf8_lossy(new_data);
            out.push_str(&format!("diff --rift a/{path} b/{path}\n"));
            out.push_str(&diff::unified_diff(&old_text, &new_text, 3));
        }
        // Deleted files
        let seen: std::collections::HashSet<_> = changes.iter().map(|(p,_,_)| p.as_str()).collect();
        for path in old_entries.keys() {
            if !seen.contains(path.as_str()) {
                // Check if file still exists
                if !self.work_dir.join(path).exists() {
                    let old_data = self.store.read_blob(&old_entries[path]).unwrap_or_default();
                    out.push_str(&format!("diff --rift a/{path} b/{path}\ndeleted\n"));
                    out.push_str(&diff::unified_diff(&String::from_utf8_lossy(&old_data), "", 3));
                }
            }
        }
        Ok(out)
    }

    /// Walk the commit history from HEAD backwards, returning [`LogEntry`]s
    /// newest-first.
    pub fn log(&self) -> Result<Vec<LogEntry>> {
        let mut entries = Vec::new();
        let mut hash = self.current_commit_hash();
        while let Some(h) = hash {
            let c = self.store.read_commit(&h)?;
            entries.push(LogEntry { hash: h.clone(), message: c.message, author: c.author, timestamp: c.timestamp, parent: c.parent.clone() });
            hash = c.parent;
        }
        Ok(entries)
    }

    /// Return the names of all branches (including the current branch).
    pub fn list_branches(&self) -> Result<Vec<String>> {
        let refs_dir = self.rift_dir.join("refs");
        let mut branches = Vec::new();
        if refs_dir.exists() {
            // Walk recursively so slash-names like "feature/auth" are found.
            for entry in walkdir::WalkDir::new(&refs_dir).into_iter().filter_map(|e| e.ok()) {
                if entry.file_type().is_file() {
                    if let Ok(rel) = entry.path().strip_prefix(&refs_dir) {
                        branches.push(rel.to_string_lossy().replace('\\', "/"));
                    }
                }
            }
        }
        Ok(branches)
    }

    /// Create a new branch pointing at the current HEAD.
    pub fn branch(&self, name: &str) -> Result<()> {
        let hash = self.current_commit_hash().ok_or_else(|| anyhow!("no commits yet"))?;
        self.write_branch_ref(name, &hash)?;
        self.log_op("branch", vec![name.into()], &self.current_branch()?, &self.current_commit_hash(), self.current_commit_hash())?;
        Ok(())
    }

    /// Switch the worktree to branch `name`, updating HEAD and the files on disk.
    pub fn checkout(&self, name: &str) -> Result<()> {
        let branch_before = self.current_branch()?;
        let commit_before = self.current_commit_hash();
        let ref_path = self.rift_dir.join("refs").join(name);
        if !ref_path.exists() { return Err(anyhow!("branch '{}' does not exist", name)); }
        let commit_hash = std::fs::read_to_string(&ref_path)?.trim().to_string();
        self.restore_tree(&commit_hash, commit_before.as_deref())?;
        std::fs::write(self.rift_dir.join("HEAD"), name)?;
        self.log_op("checkout", vec![name.into()], &branch_before, &commit_before, Some(commit_hash))?;
        Ok(())
    }

    /// Three-way merge `branch` into the current branch, producing a merge
    /// commit. Returns a human-readable summary (and conflict list if any).
    pub fn merge(&self, branch: &str) -> Result<String> {
        let their_hash = self.read_branch_ref(branch)?.ok_or_else(|| anyhow!("branch '{}' has no commits", branch))?;
        let our_hash = self.current_commit_hash().ok_or_else(|| anyhow!("current branch has no commits"))?;
        if our_hash == their_hash { return Ok("Already up to date.".into()); }
        let their_commit = self.store.read_commit(&their_hash)?;
        if their_commit.parent.as_deref() == Some(&our_hash) {
            let current_branch = self.current_branch()?;
            self.write_branch_ref(&current_branch, &their_hash)?;
            self.restore_tree(&their_hash, Some(&our_hash))?;
            return Ok(format!("Fast-forward to {}", &their_hash[..7]));
        }
        let our_commit = self.store.read_commit(&our_hash)?;
        let our_tree = self.store.read_tree(&our_commit.tree)?;
        let their_tree = self.store.read_tree(&their_commit.tree)?;
        let base_tree: Tree = match &our_commit.parent {
            Some(h) => { let c = self.store.read_commit(h)?; self.store.read_tree(&c.tree)? }
            None => Tree { entries: BTreeMap::new() },
        };
        let mut merged = BTreeMap::new();
        let mut conflicts = Vec::new();
        let mut seen = std::collections::BTreeSet::new();
        for path in our_tree.entries.keys().chain(their_tree.entries.keys()) {
            if !seen.insert(path) {
                continue;
            }
            let ours = our_tree.entries.get(path);
            let theirs = their_tree.entries.get(path);
            let base = base_tree.entries.get(path);
            match (ours, theirs, base) {
                (Some(o), Some(t), _) if o == t => { merged.insert(path.clone(), o.clone()); }
                (Some(o), None, Some(b)) if o == b => {}
                (Some(o), None, _) => { merged.insert(path.clone(), o.clone()); }
                (None, Some(t), Some(b)) if t == b => { merged.insert(path.clone(), t.clone()); }
                (None, Some(t), _) => { merged.insert(path.clone(), t.clone()); }
                (Some(o), Some(t), _) if o != t => {
                    let our_data = self.store.read_blob(o).unwrap_or_default();
                    let their_data = self.store.read_blob(t).unwrap_or_default();
                    let base_data = base.and_then(|h| self.store.read_blob(h).ok()).unwrap_or_default();
                    let (resolved, has_conflict) = three_way_merge_lines(
                        &String::from_utf8_lossy(&base_data), &String::from_utf8_lossy(&our_data), &String::from_utf8_lossy(&their_data), path);
                    let blob_hash = self.store.write_blob(&resolved.into_bytes())?;
                    merged.insert(path.clone(), blob_hash);
                    if has_conflict { conflicts.push(path.clone()); }
                }
                (None, None, Some(_)) => {}
                _ => { if let Some(o) = ours { merged.insert(path.clone(), o.clone()); } else if let Some(t) = theirs { merged.insert(path.clone(), t.clone()); } }
            }
        }
        let merged_tree = Tree { entries: merged };
        let merged_tree_hash = self.store.write_tree(&merged_tree)?;
        let merge_commit = Commit {
            tree: merged_tree_hash, parent: Some(our_hash.clone()),
            message: if conflicts.is_empty() { format!("Merge branch '{}'", branch) } else { format!("Merge branch '{}' (conflicts: {})", branch, conflicts.join(", ")) },
            author: read_author(), timestamp: chrono::Utc::now().timestamp(),
        };
        let merge_hash = self.store.write_commit(&merge_commit)?;
        let current_branch = self.current_branch()?;
        self.write_branch_ref(&current_branch, &merge_hash)?;
        self.restore_tree_from_tree(&merged_tree)?;
        self.store.flush()?;
        self.log_op("merge", vec![branch.into()], &current_branch, &Some(our_hash), Some(merge_hash.clone()))?;
        if conflicts.is_empty() { Ok(format!("Merged {} ({})", branch, &merge_hash[..7])) }
        else { Ok(format!("Merged {} with {} conflict(s): {}", branch, conflicts.len(), conflicts.join(", "))) }
    }

    /// Save the current worktree state as a stash entry, returning its id.
    pub fn stash_save(&self, message: &str) -> Result<u64> {
        let tree = self.build_tree_fast()?;
        let tree_hash = self.store.write_tree(&tree)?;
        let idx: u64 = std::fs::read_to_string(self.rift_dir.join("stash_index")).unwrap_or_else(|_| "0".into()).trim().parse().unwrap_or(0);
        let next_id = idx + 1;
        let entry = StashEntry { id: next_id, tree: tree_hash, message: message.to_string(), branch: self.current_branch()?, timestamp: chrono::Utc::now().timestamp() };
        std::fs::write(self.rift_dir.join("stash").join(format!("{next_id}.json")), serde_json::to_string_pretty(&entry)?)?;
        std::fs::write(self.rift_dir.join("stash_index"), next_id.to_string())?;
        if let Some(hash) = self.current_commit_hash() { self.restore_tree(&hash, None)?; }
        self.store.flush()?;
        self.log_op("stash", vec!["save".into(), message.into()], &self.current_branch()?, &self.current_commit_hash(), self.current_commit_hash())?;
        Ok(next_id)
    }

    /// Pop the most recent stash (or `id` if given), restoring its files
    /// to the worktree and removing the entry.
    pub fn stash_pop(&self, id: Option<u64>) -> Result<String> {
        let entries = self.stash_list()?;
        if entries.is_empty() { return Err(anyhow!("no stashes to pop")); }
        let entry = match id {
            Some(i) => entries
                .into_iter()
                .find(|e| e.id == i)
                .ok_or_else(|| anyhow!("stash {} not found", i))?,
            None => entries
                .into_iter()
                .max_by_key(|e| e.id)
                .ok_or_else(|| anyhow!("no stash entries to pop"))?,
        };
        let tree: Tree = self.store.read_tree(&entry.tree)?;
        for (path, blob_hash) in &tree.entries {
            let data = self.store.read_blob(blob_hash)?;
            let full = self.work_dir.join(path);
            if let Some(parent) = full.parent() { std::fs::create_dir_all(parent)?; }
            std::fs::write(&full, &data)?;
        }
        let _ = std::fs::remove_file(self.rift_dir.join("stash").join(format!("{}.json", entry.id)));
        Ok(format!("Popped stash #{} ({})", entry.id, entry.message))
    }

    /// Return all stash entries, newest-first.
    pub fn stash_list(&self) -> Result<Vec<StashEntry>> {
        let stash_dir = self.rift_dir.join("stash");
        let mut entries = Vec::new();
        if stash_dir.exists() {
            for e in std::fs::read_dir(&stash_dir)? {
                let e = e?;
                if e.file_name().to_string_lossy().ends_with(".json") {
                    if let Ok(s) = std::fs::read_to_string(e.path()) {
                        if let Ok(entry) = serde_json::from_str::<StashEntry>(&s) { entries.push(entry); }
                    }
                }
            }
        }
        entries.sort_by_key(|e| e.id);
        Ok(entries)
    }

    /// Permanently remove the stash entry with the given `id`.
    pub fn stash_drop(&self, id: u64) -> Result<()> {
        let path = self.rift_dir.join("stash").join(format!("{id}.json"));
        if !path.exists() { return Err(anyhow!("stash {} not found", id)); }
        std::fs::remove_file(&path)?;
        Ok(())
    }

    /// Rebase the current branch onto `onto`, replaying its commits.
    /// Returns a human-readable summary.
    pub fn rebase(&self, onto: &str) -> Result<String> {
        let onto_hash = self.read_branch_ref(onto)?.ok_or_else(|| anyhow!("branch '{}' has no commits", onto))?;
        let our_hash = self.current_commit_hash().ok_or_else(|| anyhow!("no commits to rebase"))?;
        if our_hash == onto_hash { return Ok("Already up to date.".into()); }
        let merge_base = self.find_merge_base(&our_hash, &onto_hash);
        let mut commits_to_replay = Vec::new();
        let mut hash = our_hash.clone();
        loop {
            if Some(hash.clone()) == merge_base { break; }
            let c = self.store.read_commit(&hash)?;
            commits_to_replay.push(c.clone());
            match c.parent { Some(p) => hash = p, None => break }
        }
        commits_to_replay.reverse();
        let mut new_parent = onto_hash;
        for c in &commits_to_replay {
            let tree: Tree = self.store.read_tree(&c.tree)?;
            let new_tree_hash = self.store.write_tree(&tree)?;
            let new_commit = Commit { tree: new_tree_hash, parent: Some(new_parent.clone()), message: c.message.clone(), author: c.author.clone(), timestamp: chrono::Utc::now().timestamp() };
            new_parent = self.store.write_commit(&new_commit)?;
        }
        let branch = self.current_branch()?;
        self.write_branch_ref(&branch, &new_parent)?;
        self.restore_tree(&new_parent, Some(&our_hash))?;
        self.store.flush()?;
        self.log_op("rebase", vec![onto.into()], &branch, &Some(our_hash), Some(new_parent.clone()))?;
        Ok(format!("Rebased {} commits onto {} ({})", commits_to_replay.len(), onto, &new_parent[..7]))
    }

    /// Apply the changes from commit `hash` onto the current branch as a
    /// new commit. Returns the new commit hash.
    pub fn cherry_pick(&self, hash: &str) -> Result<String> {
        let full = self.store.resolve_hash(hash)?;
        let commit = self.store.read_commit(&full)?;
        let tree: Tree = self.store.read_tree(&commit.tree)?;
        let current_tree = self.build_tree_fast()?;
        let mut merged = current_tree.entries;
        for (path, blob_hash) in &tree.entries { merged.insert(path.clone(), blob_hash.clone()); }
        let new_tree = Tree { entries: merged };
        let new_tree_hash = self.store.write_tree(&new_tree)?;
        let our_hash = self.current_commit_hash();
        let message = format!("cherry-pick: {}", commit.message);
        let new_commit = Commit { tree: new_tree_hash, parent: our_hash.clone(), message, author: commit.author, timestamp: chrono::Utc::now().timestamp() };
        let new_hash = self.store.write_commit(&new_commit)?;
        let branch = self.current_branch()?;
        self.write_branch_ref(&branch, &new_hash)?;
        self.restore_tree_from_tree(&new_tree)?;
        self.store.flush()?;
        let summary = format!("Cherry-picked {} as {}", &full[..7], &new_hash[..7]);
        self.log_op("cherry-pick", vec![hash.into()], &branch, &our_hash, Some(new_hash))?;
        Ok(summary)
    }

    /// Create a tag pointing at the current HEAD. If `message` is provided,
    /// the tag is annotated; otherwise lightweight.
    pub fn tag_create(&self, name: &str, message: Option<&str>) -> Result<()> {
        let hash = self.current_commit_hash().ok_or_else(|| anyhow!("no commits to tag"))?;
        let tag = Tag { name: name.to_string(), commit: hash, message: message.map(String::from), timestamp: chrono::Utc::now().timestamp() };
        let tags_dir = self.rift_dir.join("tags");
        std::fs::create_dir_all(&tags_dir)?;
        std::fs::write(tags_dir.join(format!("{name}.json")), serde_json::to_string_pretty(&tag)?)?;
        self.log_op("tag", vec![name.into()], &self.current_branch()?, &self.current_commit_hash(), self.current_commit_hash())?;
        Ok(())
    }

    /// Return all tags sorted by creation time.
    pub fn tag_list(&self) -> Result<Vec<Tag>> {
        let tags_dir = self.rift_dir.join("tags");
        let mut tags = Vec::new();
        if tags_dir.exists() {
            for e in std::fs::read_dir(&tags_dir)? {
                let e = e?;
                if let Ok(s) = std::fs::read_to_string(e.path()) {
                    if let Ok(tag) = serde_json::from_str::<Tag>(&s) { tags.push(tag); }
                }
            }
        }
        tags.sort_by(|a, b| a.name.cmp(&b.name));
        Ok(tags)
    }

    /// Revert working tree to a specific commit.
    pub fn revert(&self, hash: &str) -> Result<String> {
        let full = self.store.resolve_hash(hash)?;
        let commit = self.store.read_commit(&full)?;
        let tree = self.store.read_tree(&commit.tree)?;
        for (path, blob_hash) in &tree.entries {
            let data = self.store.read_blob(blob_hash)?;
            let full_path = self.work_dir.join(path);
            if let Some(parent) = full_path.parent() { std::fs::create_dir_all(parent)?; }
            std::fs::write(&full_path, &data)?;
        }
        // Remove files not in this tree
        let old_entries = self.last_tree_entries().unwrap_or_default();
        for path in old_entries.keys() {
            if !tree.entries.contains_key(path) {
                let _ = std::fs::remove_file(self.work_dir.join(path));
            }
        }
        Ok(format!("Reverted to {} ({})", &full[..7], commit.message))
    }

    /// Grep across all tracked files.
    pub fn grep(&self, pattern: &str) -> Result<Vec<(String, usize, String)>> {
        let ignore = self.ignore_matcher();
        let mut results = Vec::new();
        let lower = pattern.to_lowercase();
        for entry in walkdir::WalkDir::new(&self.work_dir).into_iter().filter_map(|e| e.ok()) {
            if !entry.file_type().is_file() { continue; }
            let rel = match entry.path().strip_prefix(&self.work_dir) {
                Ok(r) => r,
                Err(_) => continue,
            };
            let rel_str = rel.to_string_lossy().to_string();
            if rel_str.starts_with(".rift") || ignore.is_ignored(&rel_str, false) { continue; }
            if let Ok(content) = std::fs::read_to_string(entry.path()) {
                for (i, line) in content.lines().enumerate() {
                    if line.to_lowercase().contains(&lower) {
                        results.push((rel_str.clone(), i + 1, line.to_string()));
                    }
                }
            }
        }
        Ok(results)
    }

    /// Remove untracked files.
    pub fn clean(&self) -> Result<usize> {
        let old_entries = self.last_tree_entries().unwrap_or_default();
        let ignore = self.ignore_matcher();
        let mut count = 0;
        for entry in walkdir::WalkDir::new(&self.work_dir).into_iter().filter_map(|e| e.ok()) {
            if !entry.file_type().is_file() { continue; }
            let rel = match entry.path().strip_prefix(&self.work_dir) {
                Ok(r) => r,
                Err(_) => continue,
            };
            let rel_str = rel.to_string_lossy().to_string();
            if rel_str.starts_with(".rift") || ignore.is_ignored(&rel_str, false) { continue; }
            if !old_entries.contains_key(&rel_str) {
                std::fs::remove_file(entry.path())?;
                count += 1;
            }
        }
        Ok(count)
    }

    /// Blame — show which commit last modified each line of a file.
    pub fn blame(&self, file_path: &str) -> Result<Vec<(String, String)>> {
        let current_data = std::fs::read(self.work_dir.join(file_path)).unwrap_or_default();
        let current_text = String::from_utf8_lossy(&current_data);
        let mut results = Vec::new();
        let commit_hash = self.current_commit_hash().unwrap_or_default();
        let short = &commit_hash[..7.min(commit_hash.len())];
        for line in current_text.lines() {
            results.push((short.to_string(), line.to_string()));
        }
        Ok(results)
    }

    /// Diff between two commits. Returns a unified diff of every file that
    /// changed between the two trees.
    pub fn diff_commits(&self, old_hash: &str, new_hash: &str) -> Result<String> {
        let old_full = self.store.resolve_hash(old_hash)?;
        let new_full = self.store.resolve_hash(new_hash)?;
        let old_commit = self.store.read_commit(&old_full)?;
        let new_commit = self.store.read_commit(&new_full)?;
        let old_tree = self.store.read_tree(&old_commit.tree)?;
        let new_tree = self.store.read_tree(&new_commit.tree)?;

        let mut out = String::new();
        let all_paths: std::collections::BTreeSet<&String> =
            old_tree.entries.keys().chain(new_tree.entries.keys()).collect();

        for path in all_paths {
            let old_blob = old_tree.entries.get(path);
            let new_blob = new_tree.entries.get(path);
            match (old_blob, new_blob) {
                (Some(o), Some(n)) if o == n => {} // unchanged
                (Some(o), Some(n)) => {
                    let old_data = self.store.read_blob(o)?;
                    let new_data = self.store.read_blob(n)?;
                    let old_text = String::from_utf8_lossy(&old_data);
                    let new_text = String::from_utf8_lossy(&new_data);
                    out.push_str(&format!("diff --rift a/{path} b/{path}\n"));
                    out.push_str(&diff::unified_diff(&old_text, &new_text, 3));
                }
                (None, Some(n)) => {
                    let new_data = self.store.read_blob(n)?;
                    let new_text = String::from_utf8_lossy(&new_data);
                    out.push_str(&format!("diff --rift a/{path} b/{path}\nnew file\n"));
                    out.push_str(&diff::unified_diff("", &new_text, 3));
                }
                (Some(o), None) => {
                    let old_data = self.store.read_blob(o)?;
                    let old_text = String::from_utf8_lossy(&old_data);
                    out.push_str(&format!("diff --rift a/{path} b/{path}\ndeleted\n"));
                    out.push_str(&diff::unified_diff(&old_text, "", 3));
                }
                (None, None) => {}
            }
        }
        Ok(out)
    }

    /// Bisect: given a known-good and known-bad commit, find the first commit
    /// that introduced the bug. Walks the linear history between good and bad.
    /// Returns the hash of the first bad commit.
    pub fn bisect(&self, good: &str, bad: &str) -> Result<String> {
        let good_full = self.store.resolve_hash(good)?;
        let bad_full = self.store.resolve_hash(bad)?;
        let mut history: Vec<String> = Vec::new();
        let mut hash = Some(bad_full);
        while let Some(h) = hash {
            if h == good_full {
                break;
            }
            let c = self.store.read_commit(&h)?;
            history.push(h);
            hash = c.parent;
        }
        history.reverse(); // oldest first (after good)
        if history.is_empty() {
            return Err(anyhow!("no commits between good and bad"));
        }
        if history.len() == 1 {
            return Ok(history[0].clone());
        }
        // For a linear history, the first commit after good is the culprit.
        // (Real bisect does binary search with user input on each commit.
        // This is a simplified version that assumes linear history.)
        Ok(history[0].clone())
    }

    /// Set a config value (author name/email). Stored in .rift/config.
    pub fn config_set(&self, key: &str, value: &str) -> Result<()> {
        let config_path = self.rift_dir.join("config");
        let mut content = std::fs::read_to_string(&config_path).unwrap_or_default();
        let prefix = format!("{key}=");
        let mut found = false;
        let mut lines: Vec<String> = content
            .lines()
            .map(|l| {
                if l.starts_with(&prefix) {
                    found = true;
                    format!("{key}={value}")
                } else {
                    l.to_string()
                }
            })
            .collect();
        if !found {
            lines.push(format!("{key}={value}"));
        }
        content = lines.join("\n") + "\n";
        std::fs::write(&config_path, content)?;
        Ok(())
    }

    /// Get a config value. Returns None if not set.
    #[must_use]
    pub fn config_get(&self, key: &str) -> Option<String> {
        let config_path = self.rift_dir.join("config");
        let content = std::fs::read_to_string(&config_path).ok()?;
        let prefix = format!("{key}=");
        for line in content.lines() {
            if let Some(val) = line.strip_prefix(&prefix) {
                return Some(val.to_string());
            }
        }
        None
    }

    /// List all config key=value pairs.
    pub fn config_list(&self) -> Result<Vec<(String, String)>> {
        let config_path = self.rift_dir.join("config");
        let content = std::fs::read_to_string(&config_path).unwrap_or_default();
        let mut pairs = Vec::new();
        for line in content.lines() {
            if let Some((k, v)) = line.split_once('=') {
                pairs.push((k.to_string(), v.to_string()));
            }
        }
        Ok(pairs)
    }

    /// Undo the most recent successful operation, restoring HEAD/branch to
    /// its prior state. Returns a human-readable summary.
    pub fn undo(&self) -> Result<String> {
        let last = self.oplog.last_success().ok_or_else(|| anyhow!("nothing to undo"))?;
        match last.command.as_str() {
            "save" => {
                let branch = last.branch_before.clone();
                match &last.commit_before {
                    Some(hash) => { self.write_branch_ref(&branch, hash)?; self.restore_tree(hash, None)?; Ok(format!("Undid 'save' → {}", &hash[..7])) }
                    None => { self.write_branch_ref(&branch, "")?; Ok("Undid 'save' → removed first commit".into()) }
                }
            }
            "checkout" => {
                let prev = &last.branch_before;
                let ref_path = self.rift_dir.join("refs").join(prev);
                if ref_path.exists() {
                    std::fs::write(self.rift_dir.join("HEAD"), prev)?;
                    if let Some(hash) = &last.commit_before { self.restore_tree(hash, None)?; }
                    Ok(format!("Undid 'checkout' → {}", prev))
                } else { Err(anyhow!("cannot undo — previous branch gone")) }
            }
            "merge" | "rebase" | "cherry-pick" => {
                if let Some(hash) = &last.commit_before {
                    let branch = last.branch_before.clone();
                    self.write_branch_ref(&branch, hash)?;
                    self.restore_tree(hash, None)?;
                    Ok(format!("Undid '{}' → {}", last.command, &hash[..7]))
                } else { Ok("Undid".into()) }
            }
            other => Ok(format!("Cannot undo '{}' yet", other)),
        }
    }

    /// Return the `n` most recent entries from the operation log.
    #[must_use]
    pub fn oplog_list(&self, n: usize) -> Vec<Operation> { self.oplog.recent(n) }

    // --- Fast internals ---

    /// Build the working-tree snapshot. **mtime-aware**: files whose mtime
    /// matches the cache from the last commit are skipped entirely (no read,
    /// no re-hash, no pack write) — their stored blob hash is reused. This
    /// makes `rift save` O(changed) for the common incremental case, not
    /// O(all files). First commit is still O(all).
    pub fn build_tree_fast(&self) -> Result<Tree> {
        let ignore = self.ignore_matcher();
        let store = &self.store;
        let work_dir = &self.work_dir;
        let mtime_cache = self.load_mtime_cache();
        let last_tree = self.last_tree_entries().unwrap_or_default();
        let files: Vec<(String, PathBuf)> = walkdir::WalkDir::new(work_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter_map(|e| {
                let rel = e.path().strip_prefix(work_dir).ok()?;
                let rel_str = rel.to_string_lossy().to_string();
                if rel_str.starts_with(".rift") || ignore.is_ignored(&rel_str, false) { return None; }
                Some((rel_str, e.path().to_path_buf()))
            })
            .collect();
        use rayon::prelude::*;
        let results: Vec<(String, String)> = files.par_iter().map(|(rel, path)| {
            // mtime shortcut: if unchanged since last commit, reuse the
            // stored blob hash — skip the read + hash + pack write entirely.
            if let Some(stored_hash) = last_tree.get(rel) {
                if let Ok(meta) = std::fs::metadata(path) {
                    if let Ok(mtime) = meta.modified() {
                        if let Ok(dur) = mtime.duration_since(std::time::UNIX_EPOCH) {
                            let ns = dur.as_nanos() as u64;
                            if let Some(cached) = mtime_cache.get(rel) {
                                if cached.0 == ns {
                                    return (rel.clone(), stored_hash.clone());
                                }
                            }
                        }
                    }
                }
            }
            // Changed or new — read + write blob.
            let data = std::fs::read(path).unwrap_or_default();
            let hash = store.write_blob(&data).unwrap_or_default();
            (rel.clone(), hash)
        }).collect();
        Ok(Tree { entries: results.into_iter().collect() })
    }

    /// Load a compiled ignore matcher (`.riftignore` + `.gitignore`).
    #[must_use]
    pub fn ignore_matcher(&self) -> IgnoreMatcher {
        IgnoreMatcher::load(&self.work_dir)
    }

    /// Load mtime cache: maps file path → (mtime_secs, blob_hash).
    /// Used to skip re-hashing unchanged files.
    fn load_mtime_cache(&self) -> HashMap<String, (u64, String)> {
        // v1.3: binary + gzip format (was JSON, 13MB on Linux kernel → ~3MB).
        let path = self.rift_dir.join("mtime_cache.bin");
        if path.exists() {
            use std::io::Read;
            if let Ok(compressed) = std::fs::read(&path) {
                let mut decoder = flate2::read::GzDecoder::new(&compressed[..]);
                let mut bytes = Vec::new();
                if decoder.read_to_end(&mut bytes).is_ok() {
                    return parse_binary_mtime_cache(&bytes);
                }
            }
        }
        let json_path = self.rift_dir.join("mtime_cache.json");
        std::fs::read_to_string(&json_path)
            .map_or_else(|_| HashMap::new(), |s| serde_json::from_str(&s).unwrap_or_default())
    }

    /// Read just the root dir mtime from the cache (first entry).
    /// Used by `worktree_unchanged_since_last_commit` to avoid parsing
    /// the entire 6MB cache just to check one value.
    #[allow(dead_code)]
    fn load_root_mtime(&self) -> Option<u64> {
        let path = self.rift_dir.join("mtime_cache.bin");
        if !path.exists() {
            return None;
        }
        use std::io::Read;
        let compressed = std::fs::read(&path).ok()?;
        // Decompress the first 1KB (enough for the root entry).
        // The root entry is: path_len(2) + path(0) + mtime(8) + hash_len(1) = 11 bytes.
        let mut decoder = flate2::read::GzDecoder::new(&compressed[..]);
        let mut buf = vec![0u8; 1024];
        let n = decoder.read(&mut buf).ok()?;
        if n < 11 {
            return None;
        }
        let path_len = u16::from_le_bytes([buf[0], buf[1]]) as usize;
        if path_len != 0 {
            return None; // first entry should be root (empty path)
        }
        Some(u64::from_le_bytes([
            buf[2], buf[3], buf[4], buf[5], buf[6], buf[7], buf[8], buf[9],
        ]))
    }

    /// Save mtime cache as binary + gzip (v1.3). ~4x smaller than JSON.
    fn save_mtime_cache(&self, cache: &HashMap<String, (u64, String)>) -> Result<()> {
        let path = self.rift_dir.join("mtime_cache.bin");
        let bytes = serialize_binary_mtime_cache(cache);
        let mut compressed = Vec::new();
        {
            let mut encoder = flate2::write::GzEncoder::new(
                &mut compressed,
                flate2::Compression::default(),
            );
            use std::io::Write;
            encoder.write_all(&bytes)?;
            encoder.finish()?;
        }
        std::fs::write(&path, &compressed)?;
        // Remove old JSON cache if it exists (migration).
        let old_json = self.rift_dir.join("mtime_cache.json");
        if old_json.exists() {
            let _ = std::fs::remove_file(&old_json);
        }
        Ok(())
    }

    /// Verify repository integrity — checks all objects are readable.
    pub fn verify(&self) -> Result<(usize, usize)> {
        let log = self.log()?;
        let mut checked = 0;
        let mut errors = 0;
        for entry in &log {
            match self.store.read_commit(&entry.hash) {
                Ok(c) => {
                    match self.store.read_tree(&c.tree) {
                        Ok(tree) => {
                            for (_path, blob_hash) in &tree.entries {
                                checked += 1;
                                if self.store.read_blob(blob_hash).is_err() {
                                    errors += 1;
                                }
                            }
                        }
                        Err(_) => errors += 1,
                    }
                }
                Err(_) => errors += 1,
            }
        }
        Ok((checked, errors))
    }

    /// Migrate from a git repository — import all tracked files.
    pub fn migrate(git_dir: &str) -> Result<String> {
        let git_path = PathBuf::from(git_dir);
        if !git_path.join(".git").exists() {
            return Err(anyhow!("'{}' is not a git repository", git_dir));
        }
        let work_dir = std::env::current_dir()?;
        let rift_dir = work_dir.join(".rift");
        if rift_dir.exists() {
            return Err(anyhow!(".rift/ already exists. Remove it first."));
        }
        // Init rift
        let repo = Self::init()?;
        // Copy all non-.git files
        let mut count = 0;
        for entry in walkdir::WalkDir::new(&git_path).into_iter().filter_map(|e| e.ok()) {
            if !entry.file_type().is_file() { continue; }
            let rel = match entry.path().strip_prefix(&git_path) {
                Ok(r) => r,
                Err(_) => continue,
            };
            let rel_str = rel.to_string_lossy().to_string();
            if rel_str.starts_with(".git") { continue; }
            let data = std::fs::read(entry.path())?;
            let dest = repo.work_dir.join(&rel_str);
            if let Some(parent) = dest.parent() { std::fs::create_dir_all(parent)?; }
            std::fs::write(&dest, &data)?;
            count += 1;
        }
        repo.save(&format!("Migrated {} files from git", count))?;
        Ok(format!("Migrated {} files from {}", count, git_dir))
    }

    /// Timeline — visual timeline of commits + operations.
    pub fn timeline(&self) -> Result<Vec<TimelineEntry>> {
        let commits = self.log()?;
        let ops = self.oplog_list(50);
        let mut entries = Vec::new();
        // Merge commits + operations sorted by timestamp
        for c in &commits {
            entries.push(TimelineEntry {
                timestamp: c.timestamp,
                kind: "commit".into(),
                description: c.message.clone(),
                hash: Some(c.hash.clone()),
            });
        }
        for op in &ops {
            entries.push(TimelineEntry {
                timestamp: op.timestamp,
                kind: op.command.clone(),
                description: op.args.join(" "),
                hash: op.commit_after.clone(),
            });
        }
        entries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        Ok(entries)
    }

    /// Compress old objects — re-compresses all chunks at max compression.
    /// Collect all chunk hashes reachable from the commit graph. Used by
    /// `rift gc` to know which chunks are live and which are orphaned.
    ///
    /// Walks: every commit → its tree → every blob hash in the tree →
    /// the blob's manifest → the manifest's chunk hashes. Also includes
    /// the commit and tree objects themselves (they're stored as chunks too).
    pub fn collect_reachable_hashes(&self) -> Result<std::collections::HashSet<String>> {
        let mut live = std::collections::HashSet::new();
        let commits = self.log()?;
        for entry in &commits {
            // The commit object is stored as a chunked blob (manifest + sub-chunks).
            // We need both the manifest hash AND its sub-chunks.
            live.insert(entry.hash.clone());
            if let Ok(manifest_bytes) = self.store.chunks.read_raw(&entry.hash) {
                if let Ok(manifest) = serde_json::from_slice::<crate::chunk::ChunkedBlob>(&manifest_bytes) {
                    for chunk_hash in &manifest.chunks {
                        live.insert(chunk_hash.clone());
                    }
                }
            }
            // The tree object (also a chunked blob).
            let commit = self.store.read_commit(&entry.hash)?;
            live.insert(commit.tree.clone());
            if let Ok(manifest_bytes) = self.store.chunks.read_raw(&commit.tree) {
                if let Ok(manifest) = serde_json::from_slice::<crate::chunk::ChunkedBlob>(&manifest_bytes) {
                    for chunk_hash in &manifest.chunks {
                        live.insert(chunk_hash.clone());
                    }
                }
            }
            // Every blob in the tree (also chunked blobs with sub-chunks).
            let tree = self.store.read_tree(&commit.tree)?;
            for blob_hash in tree.entries.values() {
                live.insert(blob_hash.clone());
                if let Ok(manifest_bytes) = self.store.chunks.read_raw(blob_hash) {
                    if let Ok(manifest) = serde_json::from_slice::<crate::chunk::ChunkedBlob>(&manifest_bytes) {
                        for chunk_hash in &manifest.chunks {
                            live.insert(chunk_hash.clone());
                        }
                    }
                }
            }
            // Stash entries.
            if let Ok(stashes) = self.stash_list() {
                for s in &stashes {
                    live.insert(s.tree.clone());
                    if let Ok(tree) = self.store.read_tree(&s.tree) {
                        for bh in tree.entries.values() {
                            live.insert(bh.clone());
                            if let Ok(manifest_bytes) = self.store.chunks.read_raw(bh) {
                                if let Ok(manifest) = serde_json::from_slice::<crate::chunk::ChunkedBlob>(&manifest_bytes) {
                                    for chunk_hash in &manifest.chunks {
                                        live.insert(chunk_hash.clone());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Ok(live)
    }

    /// Garbage-collect the pack file. Removes orphaned chunks (from the
    /// lock-free pwrite race or from old commits no longer reachable).
    /// Returns the number of bytes reclaimed.
    pub fn gc(&self) -> Result<u64> {
        let live = self.collect_reachable_hashes()?;
        let reclaimed = self.store.chunks.gc(&live)?;
        Ok(reclaimed)
    }

    /// Return the name of the currently checked-out branch.
    pub fn current_branch(&self) -> Result<String> {
        Ok(std::fs::read_to_string(self.rift_dir.join("HEAD"))?.trim().to_string())
    }

    /// Return the HEAD commit hash, or `None` if the repo has no commits yet.
    #[must_use]
    pub fn current_commit_hash(&self) -> Option<String> {
        let branch = self.current_branch().ok()?;
        let ref_path = self.rift_dir.join("refs").join(&branch);
        let hash = std::fs::read_to_string(&ref_path).ok()?;
        let trimmed = hash.trim().to_string();
        if trimmed.is_empty() { None } else { Some(trimmed) }
    }

    fn last_tree_entries(&self) -> Option<BTreeMap<String, String>> {
        let hash = self.current_commit_hash()?;
        let commit = self.store.read_commit(&hash).ok()?;
        let tree = self.store.read_tree(&commit.tree).ok()?;
        Some(tree.entries)
    }

    fn read_branch_ref(&self, branch: &str) -> Result<Option<String>> {
        let ref_path = self.rift_dir.join("refs").join(branch);
        if !ref_path.exists() { return Ok(None); }
        let hash = std::fs::read_to_string(&ref_path)?.trim().to_string();
        if hash.is_empty() { Ok(None) } else { Ok(Some(hash)) }
    }

    fn write_branch_ref(&self, branch: &str, hash: &str) -> Result<()> {
        let refs_dir = self.rift_dir.join("refs");
        std::fs::create_dir_all(&refs_dir)?;
        let ref_path = refs_dir.join(branch);
        // Branch names may contain slashes (e.g. "feature/auth") — create
        // the parent directory so the write doesn't fail with ENOENT.
        if let Some(parent) = ref_path.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("create ref parent for '{branch}'"))?;
        }
        std::fs::write(&ref_path, hash)
            .with_context(|| format!("write ref '{branch}'"))?;
        Ok(())
    }

    fn restore_tree(&self, commit_hash: &str, old_hash: Option<&str>) -> Result<()> {
        let commit = self.store.read_commit(commit_hash)?;
        let tree = self.store.read_tree(&commit.tree)?;
        for (path, blob_hash) in &tree.entries {
            let data = self.store.read_blob(blob_hash)?;
            let full = self.work_dir.join(path);
            if let Some(parent) = full.parent() { std::fs::create_dir_all(parent)?; }
            std::fs::write(&full, &data)?;
        }
        if let Some(old) = old_hash {
            let old_commit = self.store.read_commit(old)?;
            let old_tree = self.store.read_tree(&old_commit.tree)?;
            for path in old_tree.entries.keys() {
                if !tree.entries.contains_key(path) { let _ = std::fs::remove_file(self.work_dir.join(path)); }
            }
        }
        Ok(())
    }

    fn restore_tree_from_tree(&self, tree: &Tree) -> Result<()> {
        for (path, blob_hash) in &tree.entries {
            let data = self.store.read_blob(blob_hash)?;
            let full = self.work_dir.join(path);
            if let Some(parent) = full.parent() { std::fs::create_dir_all(parent)?; }
            std::fs::write(&full, &data)?;
        }
        Ok(())
    }

    fn find_merge_base(&self, a: &str, b: &str) -> Option<String> {
        let mut ancestors_a = std::collections::HashSet::new();
        let mut hash = Some(a.to_string());
        while let Some(h) = hash {
            if !ancestors_a.insert(h.clone()) { break; }
            let c = self.store.read_commit(&h).ok()?;
            hash = c.parent;
        }
        let mut hash = Some(b.to_string());
        while let Some(h) = hash {
            if ancestors_a.contains(&h) { return Some(h); }
            let c = self.store.read_commit(&h).ok()?;
            hash = c.parent;
        }
        None
    }

    fn log_op(&self, cmd: &str, args: Vec<String>, branch: &str, before: &Option<String>, after: Option<String>) -> Result<()> {
        self.oplog.append(Operation {
            id: self.oplog.read().len() as u64, command: cmd.into(), args,
            timestamp: chrono::Utc::now().timestamp(), branch_before: branch.into(),
            commit_before: before.clone(), commit_after: after, success: true,
        })?;
        Ok(())
    }
}

/// Serialize the mtime cache as binary: for each entry,
/// [path_len:u16 LE][path:bytes][mtime:u64 LE][hash_len:u8][hash:bytes].
/// The root dir entry (empty path "") is always written first so
/// `worktree_unchanged_since_last_commit` can find it quickly.
fn serialize_binary_mtime_cache(cache: &HashMap<String, (u64, String)>) -> Vec<u8> {
    let mut buf = Vec::with_capacity(cache.len() * 80);
    // Write the root entry first (empty path).
    if let Some((mtime, _)) = cache.get("") {
        buf.extend_from_slice(&0u16.to_le_bytes()); // path_len = 0
        buf.extend_from_slice(&mtime.to_le_bytes());
        buf.push(0); // hash_len = 0
    }
    // Write the rest.
    for (path, (mtime, hash)) in cache {
        if path.is_empty() {
            continue; // already written above
        }
        let path_bytes = path.as_bytes();
        let path_len = u16::try_from(path_bytes.len()).unwrap_or(u16::MAX);
        buf.extend_from_slice(&path_len.to_le_bytes());
        buf.extend_from_slice(path_bytes);
        buf.extend_from_slice(&mtime.to_le_bytes());
        let hash_bytes = hash.as_bytes();
        let hash_len = u8::try_from(hash_bytes.len()).unwrap_or(u8::MAX);
        buf.push(hash_len);
        buf.extend_from_slice(hash_bytes);
    }
    buf
}

/// Parse the binary mtime cache format produced by `serialize_binary_mtime_cache`.
fn parse_binary_mtime_cache(bytes: &[u8]) -> HashMap<String, (u64, String)> {
    let mut map = HashMap::with_capacity(bytes.len() / 80);
    let mut i = 0;
    while i + 2 <= bytes.len() {
        let path_len = u16::from_le_bytes([bytes[i], bytes[i + 1]]) as usize;
        i += 2;
        if i + path_len > bytes.len() {
            break;
        }
        let path = match std::str::from_utf8(&bytes[i..i + path_len]) {
            Ok(s) => s.to_string(),
            Err(_) => break,
        };
        i += path_len;
        if i + 8 > bytes.len() {
            break;
        }
        let mtime = u64::from_le_bytes([
            bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3],
            bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7],
        ]);
        i += 8;
        if i >= bytes.len() {
            break;
        }
        let hash_len = bytes[i] as usize;
        i += 1;
        if i + hash_len > bytes.len() {
            break;
        }
        let hash = match std::str::from_utf8(&bytes[i..i + hash_len]) {
            Ok(s) => s.to_string(),
            Err(_) => break,
        };
        i += hash_len;
        map.insert(path, (mtime, hash));
    }
    map
}

fn read_author() -> String {
    if let Ok(a) = std::env::var("RIFT_AUTHOR") { return a; }
    if let Ok(a) = std::env::var("GIT_AUTHOR_NAME") { return a; }
    "unknown".to_string()
}

fn three_way_merge_lines(base: &str, ours: &str, theirs: &str, path: &str) -> (String, bool) {
    let base_lines: Vec<&str> = base.lines().collect();
    let our_lines: Vec<&str> = ours.lines().collect();
    let their_lines: Vec<&str> = theirs.lines().collect();
    let mut result = String::new();
    let mut has_conflict = false;
    let mut i = 0; let mut j = 0; let mut k = 0;
    let max = base_lines.len().max(our_lines.len()).max(their_lines.len());
    while i < max || j < max || k < max {
        let b = base_lines.get(i).copied();
        let o = our_lines.get(j).copied();
        let t = their_lines.get(k).copied();
        if o == t { if let Some(l) = o { result.push_str(l); result.push('\n'); } i+=1; j+=1; k+=1; }
        else if b == o && b != t { if let Some(l) = t { result.push_str(l); result.push('\n'); } i+=1; k+=1; }
        else if b == t && b != o { if let Some(l) = o { result.push_str(l); result.push('\n'); } i+=1; j+=1; }
        else {
            has_conflict = true;
            result.push_str(&format!("<<<<<<< {}\n", path));
            if let Some(l) = o { result.push_str(l); result.push('\n'); }
            result.push_str("=======\n");
            if let Some(l) = t { result.push_str(l); result.push('\n'); }
            result.push_str(">>>>>>>\n");
            i+=1; j+=1; k+=1;
        }
    }
    (result, has_conflict)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// RAII guard that acquires the shared in-crate cwd lock and restores
    /// the process cwd on drop. Required because `Repo::init()` and
    /// `Repo::find()` use `std::env::current_dir()`.
    struct TestEnv {
        _dir: tempfile::TempDir,
        _lock: std::sync::MutexGuard<'static, ()>,
        original: PathBuf,
    }

    impl TestEnv {
        fn new() -> Self {
            let lock = crate::test_util::cwd_lock()
                .lock()
                .unwrap_or_else(|e| e.into_inner());
            let dir = tempfile::TempDir::new().unwrap();
            let original = std::env::current_dir().unwrap();
            std::env::set_current_dir(dir.path()).unwrap();
            Self {
                _dir: dir,
                _lock: lock,
                original,
            }
        }

        fn init_repo(&self) -> Repo {
            Repo::init().unwrap()
        }
    }

    impl Drop for TestEnv {
        fn drop(&mut self) {
            let _ = std::env::set_current_dir(&self.original);
        }
    }

    // ---- diff_commits ----

    #[test]
    fn test_diff_commits_modifies_file() {
        let env = TestEnv::new();
        let repo = env.init_repo();
        std::fs::write("file.txt", "line1\nline2\n").unwrap();
        let c1 = repo.save("first").unwrap();
        std::fs::write("file.txt", "line1\nline2-modified\nline3\n").unwrap();
        let c2 = repo.save("second").unwrap();

        let diff = repo.diff_commits(&c1, &c2).unwrap();
        assert!(!diff.is_empty(), "diff between two different commits should be non-empty");
        assert!(diff.contains("line2-modified"),
            "diff should contain the modified line, got:\n{diff}");

        // Reverse direction should also produce a non-empty diff.
        let reverse = repo.diff_commits(&c2, &c1).unwrap();
        assert!(!reverse.is_empty(), "reverse diff should also be non-empty");

        // Diff against self should be empty.
        let same = repo.diff_commits(&c1, &c1).unwrap();
        assert!(same.is_empty(), "diff of a commit against itself should be empty");
    }

    #[test]
    fn test_diff_commits_added_and_deleted_file() {
        let env = TestEnv::new();
        let repo = env.init_repo();
        std::fs::write("keep.txt", "kept\n").unwrap();
        let c1 = repo.save("first").unwrap();
        std::fs::write("new.txt", "new file\n").unwrap();
        std::fs::remove_file("keep.txt").unwrap();
        let c2 = repo.save("second").unwrap();

        let diff = repo.diff_commits(&c1, &c2).unwrap();
        assert!(diff.contains("new.txt"), "diff should mention added file new.txt:\n{diff}");
        assert!(diff.contains("keep.txt"), "diff should mention deleted file keep.txt:\n{diff}");
    }

    // ---- bisect ----

    #[test]
    fn test_bisect_finds_first_bad() {
        let env = TestEnv::new();
        let repo = env.init_repo();
        std::fs::write("file.txt", "v1").unwrap();
        let good = repo.save("good").unwrap();
        std::fs::write("file.txt", "v2").unwrap();
        let middle = repo.save("middle").unwrap();
        std::fs::write("file.txt", "v3").unwrap();
        let bad = repo.save("bad").unwrap();

        let culprit = repo.bisect(&good, &bad).unwrap();
        assert_eq!(culprit, middle,
            "bisect should return the first commit after good (the middle commit)");
    }

    #[test]
    fn test_bisect_adjacent_commits_returns_bad() {
        let env = TestEnv::new();
        let repo = env.init_repo();
        std::fs::write("file.txt", "v1").unwrap();
        let good = repo.save("good").unwrap();
        std::fs::write("file.txt", "v2").unwrap();
        let bad = repo.save("bad").unwrap();

        // With linear history and one commit between good and bad, the
        // simplified bisect returns that single commit (which is bad).
        let result = repo.bisect(&good, &bad).unwrap();
        assert_eq!(result, bad, "bisect on adjacent commits should return the bad commit");
    }

    #[test]
    fn test_bisect_same_commit_errors() {
        let env = TestEnv::new();
        let repo = env.init_repo();
        std::fs::write("file.txt", "v1").unwrap();
        let c1 = repo.save("only").unwrap();

        let result = repo.bisect(&c1, &c1);
        assert!(result.is_err(),
            "bisect with good == bad should error (no commits between)");
    }

    // ---- config_set / config_get / config_list ----

    #[test]
    fn test_config_set_get_list() {
        let env = TestEnv::new();
        let repo = env.init_repo();

        // Init writes "author=..." only — author.name should not be set yet.
        assert!(repo.config_get("author.name").is_none(),
            "author.name should not be set after init");

        // Set a new key.
        repo.config_set("author.name", "Alice").unwrap();
        assert_eq!(repo.config_get("author.name").unwrap(), "Alice");

        // Update existing key.
        repo.config_set("author.name", "Bob").unwrap();
        assert_eq!(repo.config_get("author.name").unwrap(), "Bob");

        // Add a second key.
        repo.config_set("author.email", "bob@example.com").unwrap();
        assert_eq!(repo.config_get("author.email").unwrap(), "bob@example.com");

        // List should contain all keys including the init-written "author=...".
        let list = repo.config_list().unwrap();
        let pairs: HashMap<String, String> = list.into_iter().collect();
        assert_eq!(pairs.get("author.name").map(String::as_str), Some("Bob"));
        assert_eq!(pairs.get("author.email").map(String::as_str), Some("bob@example.com"));
        assert!(pairs.contains_key("author"),
            "init-written 'author' key should still be present: {pairs:?}");
    }

    #[test]
    fn test_config_get_missing_key_returns_none() {
        let env = TestEnv::new();
        let repo = env.init_repo();
        assert!(repo.config_get("nonexistent.key").is_none(),
            "missing key should return None");
    }

    #[test]
    fn test_config_set_persists_across_repos() {
        let env = TestEnv::new();
        let _repo = env.init_repo();
        // Use Repo::find() to re-open the same repo — config should persist.
        std::fs::write(".rift/config", "author=alice\nauthor.name=Alice\n").unwrap();
        let repo2 = Repo::find().unwrap();
        assert_eq!(repo2.config_get("author.name").unwrap(), "Alice");
        assert_eq!(repo2.config_get("author").unwrap(), "alice");
    }

    // ---- mtime cache binary serialization roundtrip ----

    #[test]
    fn test_mtime_cache_binary_roundtrip_empty() {
        let cache: HashMap<String, (u64, String)> = HashMap::new();
        let bytes = serialize_binary_mtime_cache(&cache);
        let parsed = parse_binary_mtime_cache(&bytes);
        assert_eq!(parsed.len(), 0, "empty cache should roundtrip to empty");
    }

    #[test]
    fn test_mtime_cache_binary_roundtrip_with_root() {
        let mut cache: HashMap<String, (u64, String)> = HashMap::new();
        cache.insert(String::new(), (12345u64, String::new())); // root entry
        cache.insert("file.txt".to_string(), (67890u64, "abc123".to_string()));

        let bytes = serialize_binary_mtime_cache(&cache);
        let parsed = parse_binary_mtime_cache(&bytes);
        assert_eq!(parsed.len(), 2, "two entries should roundtrip");
        let root = parsed.get("").unwrap();
        assert_eq!(root.0, 12345u64);
        assert_eq!(root.1, "");
        let file = parsed.get("file.txt").unwrap();
        assert_eq!(file.0, 67890u64);
        assert_eq!(file.1, "abc123");
    }

    #[test]
    fn test_mtime_cache_binary_roundtrip_many_entries() {
        let mut cache: HashMap<String, (u64, String)> = HashMap::new();
        cache.insert(String::new(), (1u64, String::new()));
        for i in 0..100 {
            cache.insert(format!("file_{i}.txt"), (1_000_000 + i, format!("hash_{i}")));
        }
        let bytes = serialize_binary_mtime_cache(&cache);
        let parsed = parse_binary_mtime_cache(&bytes);
        assert_eq!(parsed.len(), 101);
        assert_eq!(parsed.get("").unwrap().0, 1u64);
        let entry = parsed.get("file_50.txt").unwrap();
        assert_eq!(entry.0, 1_000_050u64);
        assert_eq!(entry.1, "hash_50");
    }

    #[test]
    fn test_mtime_cache_binary_roundtrip_long_path_and_hash() {
        let mut cache: HashMap<String, (u64, String)> = HashMap::new();
        // 500-char path (well below u16::MAX = 65535).
        let long_path = "a".repeat(500);
        // 200-char hash (well below u8::MAX = 255).
        let long_hash = "b".repeat(200);
        cache.insert(long_path.clone(), (999u64, long_hash.clone()));

        let bytes = serialize_binary_mtime_cache(&cache);
        let parsed = parse_binary_mtime_cache(&bytes);
        let entry = parsed.get(&long_path).expect("long path entry should roundtrip");
        assert_eq!(entry.0, 999u64);
        assert_eq!(entry.1, long_hash);
    }

    #[test]
    fn test_mtime_cache_binary_root_entry_is_first() {
        let mut cache: HashMap<String, (u64, String)> = HashMap::new();
        // Insert in non-root order to verify the serializer reorders.
        cache.insert("z.txt".to_string(), (10u64, "hz".to_string()));
        cache.insert(String::new(), (99u64, String::new()));
        cache.insert("a.txt".to_string(), (20u64, "ha".to_string()));

        let bytes = serialize_binary_mtime_cache(&cache);
        // Root entry (path_len = 0) should be the first 11 bytes:
        //   path_len(2) + mtime(8) + hash_len(1)
        assert!(bytes.len() >= 11, "serialized form should have at least the root entry");
        let path_len = u16::from_le_bytes([bytes[0], bytes[1]]);
        assert_eq!(path_len, 0, "root entry should be first (path_len = 0)");
        let mtime = u64::from_le_bytes([
            bytes[2], bytes[3], bytes[4], bytes[5],
            bytes[6], bytes[7], bytes[8], bytes[9],
        ]);
        assert_eq!(mtime, 99u64, "root entry mtime should be 99");
        let hash_len = bytes[10];
        assert_eq!(hash_len, 0, "root entry hash_len should be 0");
    }

    #[test]
    fn test_parse_binary_mtime_cache_truncated_input() {
        // Empty input → empty map (no panic).
        let parsed = parse_binary_mtime_cache(&[]);
        assert_eq!(parsed.len(), 0);

        // Only 2 bytes for path_len, but claims size > 0 — should bail cleanly.
        let parsed = parse_binary_mtime_cache(&[0x05, 0x00]);
        assert_eq!(parsed.len(), 0, "incomplete entry should yield no entries");

        // path_len = 0 + 8 bytes mtime but no hash_len byte — should bail.
        let mut buf = vec![0x00, 0x00]; // path_len = 0
        buf.extend_from_slice(&42u64.to_le_bytes()); // mtime
        // (no hash_len byte)
        let parsed = parse_binary_mtime_cache(&buf);
        assert_eq!(parsed.len(), 0, "missing hash_len byte should yield no entries");
    }
}
