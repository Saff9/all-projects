//! Gitignore-style pattern matching — replaces the old broken `contains()`
//! logic that matched "node" in "anode.txt".
//!
//! ## Supported patterns (gitignore spec subset)
//! - `*.ext`           → any file ending in `.ext`
//! - `dir/`            → any path under `dir/` (directory match)
//! - `file.txt`        → exact filename anywhere in the tree
//! - `/file.txt`       → exact filename at repo root only
//! - `a/b/c`           → path relative to repo root
//! - `**/pattern`      → pattern in any subdirectory
//! - `pattern/**`      → everything under `pattern/`
//! - `!pattern`        → negate (re-include a previously excluded path)
//! - `# comment`       → ignored
//! - blank lines       → ignored
//!
//! Patterns are read from `.riftignore` and `.gitignore` (in that order).
//! Negations from `.riftignore` can override `.gitignore` excludes.

use std::path::Path;

/// A single ignore pattern compiled from a gitignore-style line.
#[derive(Debug, Clone)]
pub struct Pattern {
    /// The raw pattern string (without leading `!`).
    pub raw: String,
    /// Whether this pattern is a negation (re-include).
    pub negate: bool,
    /// Whether the pattern is anchored to the repo root (starts with `/`).
    pub anchored: bool,
    /// Whether the pattern targets a directory (ends with `/`).
    pub dir_only: bool,
    /// Whether the pattern contains `**` (recursive match).
    pub recursive: bool,
}

impl Pattern {
    /// Compile a single gitignore-style line into a Pattern.
    /// Returns None for comments and blank lines.
    #[must_use]
    pub fn parse(line: &str) -> Option<Self> {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            return None;
        }
        let (raw, negate) =
            trimmed.strip_prefix('!').map_or((trimmed, false), |rest| (rest, true));
        let anchored = raw.starts_with('/');
        let raw = raw.trim_start_matches('/');
        let dir_only = raw.ends_with('/');
        let raw = raw.trim_end_matches('/').to_string();
        let recursive = raw.contains("**");
        Some(Self { raw, negate, anchored, dir_only, recursive })
    }

    /// Test whether a relative path matches this pattern.
    #[must_use]
    pub fn matches(&self, rel_path: &str, is_dir: bool) -> bool {
        if self.dir_only && !is_dir {
            return false;
        }
        let path = rel_path.replace('\\', "/");
        if self.anchored {
            // Pattern is anchored to root — match the full path prefix.
            return self.match_segment(&path);
        }
        if self.recursive {
            // Strip a leading `**/` so `**/temp` matches `temp`, `a/temp`,
            // `a/b/temp`, etc. Without this, glob_match treats `**` as two
            // literal `*` and won't match a bare filename.
            let pat = self.raw.strip_prefix("**/").unwrap_or(&self.raw);
            // Match `pat` against the full path AND every suffix.
            if glob_match(pat, &path) {
                return true;
            }
            return path.split('/').enumerate().any(|(i, _)| {
                let suffix = path.split('/').skip(i).collect::<Vec<_>>().join("/");
                glob_match(pat, &suffix)
            });
        }
        // Non-anchored, non-recursive: match the pattern as a suffix of any
        // path component. `*.log` matches `a/b/c.log`. `file.txt` matches
        // `file.txt` and `dir/file.txt`.
        if self.match_segment(&path) {
            return true;
        }
        // Match any trailing component.
        path.split('/').any(|comp| self.match_segment(comp))
    }

    /// Match a single path segment (or full anchored path) against the
    /// pattern using simple `*`/`?` glob semantics (no `**` here — that's
    /// handled by the recursive branch above).
    fn match_segment(&self, path: &str) -> bool {
        glob_match(&self.raw, path)
    }
}

/// Simple glob matcher supporting `*` (any chars) and `?` (one char).
/// Does NOT handle `**` (that's split out in `Pattern::matches`).
fn glob_match(pattern: &str, text: &str) -> bool {
    let p: Vec<char> = pattern.chars().collect();
    let t: Vec<char> = text.chars().collect();
    glob_match_inner(&p, 0, &t, 0)
}

const fn glob_match_inner(p: &[char], pi: usize, t: &[char], ti: usize) -> bool {
    let mut pi = pi;
    let mut ti = ti;
    let mut star_pi: Option<usize> = None;
    let mut star_ti = 0;
    while ti < t.len() {
        if pi < p.len() && (p[pi] == '?' || p[pi] == t[ti]) {
            pi += 1;
            ti += 1;
        } else if pi < p.len() && p[pi] == '*' {
            star_pi = Some(pi);
            star_ti = ti;
            pi += 1;
        } else if let Some(spi) = star_pi {
            pi = spi + 1;
            star_ti += 1;
            ti = star_ti;
        } else {
            return false;
        }
    }
    while pi < p.len() && p[pi] == '*' {
        pi += 1;
    }
    pi == p.len()
}

/// A compiled ignore file — a list of patterns loaded from `.riftignore`
/// and `.gitignore`. Use `Matcher::is_ignored` to test paths.
#[derive(Debug, Clone, Default)]
pub struct Matcher {
    patterns: Vec<Pattern>,
}

impl Matcher {
    /// Load patterns from `.riftignore` and `.gitignore` in `root`.
    /// `.riftignore` patterns take precedence (loaded last so their
    /// negations win).
    #[must_use]
    pub fn load(root: &Path) -> Self {
        let mut patterns = Vec::new();
        for name in &[".gitignore", ".riftignore"] {
            let path = root.join(name);
            if let Ok(s) = std::fs::read_to_string(&path) {
                for line in s.lines() {
                    if let Some(p) = Pattern::parse(line) {
                        patterns.push(p);
                    }
                }
            }
        }
        // Built-in defaults — always ignore these (matching git's defaults).
        for default in &[".rift/", ".git/"] {
            if let Some(p) = Pattern::parse(default) {
                patterns.push(p);
            }
        }
        Self { patterns }
    }

    /// Test whether a relative path is ignored. Honors negations (`!`).
    /// The last matching pattern wins (gitignore semantics).
    #[must_use]
    pub fn is_ignored(&self, rel_path: &str, is_dir: bool) -> bool {
        let mut ignored = false;
        for p in &self.patterns {
            if p.matches(rel_path, is_dir) {
                ignored = !p.negate;
            }
        }
        ignored
    }

    /// Number of loaded patterns.
    #[must_use]
    pub fn len(&self) -> usize {
        self.patterns.len()
    }

    /// Whether the matcher has any patterns.
    #[must_use]
    pub fn is_empty(&self) -> bool {
        self.patterns.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_glob_basic() {
        assert!(glob_match("*.log", "app.log"));
        assert!(!glob_match("*.log", "app.txt"));
        assert!(glob_match("a?c", "abc"));
        assert!(!glob_match("a?c", "abbc"));
        assert!(glob_match("*", "anything"));
        assert!(glob_match("file.txt", "file.txt"));
    }

    #[test]
    fn test_pattern_extension() {
        let p = Pattern::parse("*.log").unwrap();
        assert!(p.matches("app.log", false));
        assert!(p.matches("src/app.log", false));
        assert!(!p.matches("app.txt", false));
    }

    #[test]
    fn test_pattern_directory() {
        let p = Pattern::parse("node_modules/").unwrap();
        assert!(p.matches("node_modules", true));
        assert!(p.matches("node_modules/express", true));
        assert!(!p.matches("node_modules", false)); // dir_only
    }

    #[test]
    fn test_pattern_anchored() {
        let p = Pattern::parse("/secret.env").unwrap();
        assert!(p.matches("secret.env", false));
        assert!(!p.matches("src/secret.env", false));
    }

    #[test]
    fn test_pattern_negation() {
        let m = Matcher {
            patterns: vec![
                Pattern::parse("*.log").unwrap(),
                Pattern::parse("!important.log").unwrap(),
            ],
        };
        assert!(m.is_ignored("app.log", false));
        assert!(!m.is_ignored("important.log", false));
    }

    #[test]
    fn test_pattern_recursive() {
        let p = Pattern::parse("**/temp").unwrap();
        assert!(p.matches("temp", true));
        assert!(p.matches("a/b/temp", true));
        assert!(p.matches("src/temp", true));
    }
}
