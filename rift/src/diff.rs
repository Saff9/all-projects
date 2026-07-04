//! Line-based diff — produces a unified diff between two text blobs.

/// Compute a unified diff between two strings. Returns diff lines.
#[must_use]
pub fn unified_diff(old: &str, new: &str, context: usize) -> String {
    let old_lines: Vec<&str> = old.lines().collect();
    let new_lines: Vec<&str> = new.lines().collect();

    // LCS-based diff
    let ops = lcs_diff(&old_lines, &new_lines);
    if ops.iter().all(|(_, t)| *t == DiffType::Equal) {
        return String::new(); // identical
    }

    let mut out = String::from("--- a\n+++ b\n");
    // Group hunks with context
    let mut i = 0;
    while i < ops.len() {
        if matches!(ops[i].1, DiffType::Equal) {
            i += 1;
            continue;
        }
        // hunk start
        let hunk_start = i.saturating_sub(context);
        let mut j = i;
        while j < ops.len() {
            if matches!(ops[j].1, DiffType::Equal) {
                // check if the equal run is long enough to break
                let mut k = j;
                while k < ops.len() && matches!(ops[k].1, DiffType::Equal) { k += 1; }
                if k - j > 2 * context || k == ops.len() { break; }
                j = k;
            } else { j += 1; }
        }
        let hunk_end = (j + context).min(ops.len());

        // line numbers
        let mut old_line = 0;
        let mut new_line = 0;
        for (idx, _) in ops[..hunk_start].iter().enumerate() {
            match ops[idx].1 {
                DiffType::Equal => { old_line += 1; new_line += 1; }
                DiffType::Delete => { old_line += 1; }
                DiffType::Insert => { new_line += 1; }
            }
        }
        let old_count = ops[hunk_start..hunk_end].iter().filter(|(_, t)| !matches!(t, DiffType::Insert)).count();
        let new_count = ops[hunk_start..hunk_end].iter().filter(|(_, t)| !matches!(t, DiffType::Delete)).count();
        out.push_str(&format!("@@ -{},{} +{},{} @@\n", old_line + 1, old_count, new_line + 1, new_count));
        for k in hunk_start..hunk_end {
            let (content, t) = &ops[k];
            match t {
                DiffType::Equal => out.push(' '),
                DiffType::Delete => out.push('-'),
                DiffType::Insert => out.push('+'),
            }
            out.push_str(content);
            out.push('\n');
        }
        i = hunk_end;
    }
    out
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum DiffType { Equal, Delete, Insert }

fn lcs_diff<'a>(old: &[&'a str], new: &[&'a str]) -> Vec<(&'a str, DiffType)> {
    let n = old.len();
    let m = new.len();
    // dp table
    let mut dp = vec![vec![0usize; m + 1]; n + 1];
    for i in (0..n).rev() {
        for j in (0..m).rev() {
            if old[i] == new[j] {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            } else {
                dp[i][j] = dp[i + 1][j].max(dp[i][j + 1]);
            }
        }
    }
    let mut out = Vec::new();
    let mut i = 0;
    let mut j = 0;
    while i < n && j < m {
        if old[i] == new[j] {
            out.push((old[i], DiffType::Equal));
            i += 1; j += 1;
        } else if dp[i + 1][j] >= dp[i][j + 1] {
            out.push((old[i], DiffType::Delete));
            i += 1;
        } else {
            out.push((new[j], DiffType::Insert));
            j += 1;
        }
    }
    while i < n { out.push((old[i], DiffType::Delete)); i += 1; }
    while j < m { out.push((new[j], DiffType::Insert)); j += 1; }
    out
}

/// Summary of changes between two trees.
#[must_use]
pub fn diff_summary(old_entries: &std::collections::BTreeMap<String, String>, new_entries: &std::collections::BTreeMap<String, String>) -> Vec<(String, String)> {
    let mut changes = Vec::new();
    for (path, hash) in new_entries {
        match old_entries.get(path) {
            Some(old_hash) if old_hash == hash => {} // unchanged
            Some(_) => changes.push((path.clone(), "modified".to_string())),
            None => changes.push((path.clone(), "added".to_string())),
        }
    }
    for path in old_entries.keys() {
        if !new_entries.contains_key(path) {
            changes.push((path.clone(), "deleted".to_string()));
        }
    }
    changes
}
