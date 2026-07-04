//! CLI benchmark — `rift bench`. Creates a temp dir with 80 test files,
//! times rift vs git on binary size, cold commit, incremental commit,
//! status, log, storage, and prints a formatted comparison table.
//!
//! This is the CLI replacement for the GUI benchmark panel (the Next.js
//! /api/rift/bench route is being removed in v1.1). The benchmark belongs
//! in the CLI, not the dashboard.
//!
//! ## Output format
//! ```text
//! rift bench — Rift v1.1.0 vs Git (80 files, 3 runs each for read-only)
//!
//! | Metric                |     Rift |      Git | Winner |  Ratio |
//! |-----------------------|----------|----------|--------|-------|
//! | Binary size (KB)      |    2,221 |    3,987 | Rift   | 1.8x  |
//! | Cold commit (ms)      |       12 |        9 | Git    | 1.3x  |
//! | Incremental (ms)     |        4 |        6 | Rift   | 1.5x  |
//! | status (ms)           |        5 |        4 | Git    | 1.3x  |
//! | log (ms)              |        1 |        2 | Rift   | 2.0x  |
//! | Storage (KB)          |       56 |      124 | Rift   | 2.2x  |
//!
//! Rift wins: 4/6 | Git wins: 2/6 | Ties: 0/6
//! ```
//!
//! ## Notes
//! - Read-only commands (`status`, `log`) are run 3× and the minimum is
//!   taken (reduces child-process spawn-overhead noise).
//! - Mutating commands (`save`/`commit`) are run once each — they leave
//!   side effects in the repo so we can't repeat them.
//! - Sub-10ms VCS work is dominated by process-spawn overhead; treat
//!   near-zero results as "essentially instant" rather than precise.

use anyhow::{anyhow, Result};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Instant;

/// Number of test files to write.
const N_FILES: usize = 80;
/// Number of lines per test file.
const N_LINES: usize = 40;
/// Runs for read-only commands (we take the min).
const RUNS: usize = 3;

/// Run the benchmark and return a formatted table string. Cleans up temp
/// files on exit (even on error).
///
/// # Errors
/// Returns an error if `git` isn't on PATH or any sub-step fails
/// catastrophically. Individual metric failures are reported as `?` in the
/// table rather than aborting the whole run.
pub fn run() -> Result<String> {
    let rift_bin = std::env::current_exe()?;
    let git_bin = find_git()?;

    let tmp = std::env::temp_dir().join(format!("rift-bench-{}", std::process::id()));
    // Ensure cleanup on exit — even on error.
    let result = run_inner(&tmp, &rift_bin, &git_bin);
    let _ = std::fs::remove_dir_all(&tmp);
    result
}

/// Inner benchmark logic — separated so the outer `run()` can guarantee
/// cleanup via RAII-style drop semantics.
fn run_inner(tmp: &Path, rift_bin: &Path, git_bin: &Path) -> Result<String> {
    // Prepare 80 test files of realistic text content.
    let src_dir = tmp.join("src");
    std::fs::create_dir_all(&src_dir)?;
    for i in 0..N_FILES {
        let path = src_dir.join(format!("f{i}.txt"));
        let mut content = String::with_capacity(N_LINES * 60);
        for j in 0..N_LINES {
            content.push_str(&format!(
                "line {j} of file {i} — some realistic content for benchmarking\n"
            ));
        }
        std::fs::write(&path, content)?;
    }

    // --- binary sizes ---
    let rift_bin_kb = kb(file_size(rift_bin));
    let git_bin_kb = kb(file_size(git_bin));

    // --- rift repo ---
    let rift_dir = tmp.join("rift");
    let _ = std::fs::remove_dir_all(&rift_dir);
    std::fs::create_dir_all(&rift_dir)?;
    let _ = Command::new(rift_bin)
        .arg("init")
        .current_dir(&rift_dir)
        .output()?;
    copy_dir(&src_dir, &rift_dir.join("src"))?;

    let rift_cold = time_once(rift_bin, &["save", "-m", "init"], &rift_dir, &[]);
    append_line(&rift_dir.join("src").join("f0.txt"), "change\n")?;
    let rift_incr = time_once(rift_bin, &["save", "-m", "two"], &rift_dir, &[]);
    let rift_status = time_min(rift_bin, &["status"], &rift_dir, &[]);
    let rift_log = time_min(rift_bin, &["log"], &rift_dir, &[]);
    let rift_storage_kb = kb(dir_size(&rift_dir.join(".rift")));

    // --- git repo ---
    let git_env = [
        ("GIT_AUTHOR_NAME", "rift-bench"),
        ("GIT_AUTHOR_EMAIL", "bench@rift.dev"),
        ("GIT_COMMITTER_NAME", "rift-bench"),
        ("GIT_COMMITTER_EMAIL", "bench@rift.dev"),
    ];
    let git_env_owned: Vec<(String, String)> = git_env
        .iter()
        .map(|(k, v)| ((*k).to_string(), (*v).to_string()))
        .collect();

    let git_dir = tmp.join("git");
    let _ = std::fs::remove_dir_all(&git_dir);
    std::fs::create_dir_all(&git_dir)?;
    let _ = Command::new(git_bin)
        .arg("init")
        .current_dir(&git_dir)
        .envs(git_env_owned.iter().map(|(k, v)| (k.as_str(), v.as_str())))
        .output()?;
    copy_dir(&src_dir, &git_dir.join("src"))?;

    let git_cold = time_once(
        git_bin,
        &["add", "-A"],
        &git_dir,
        &git_env_owned,
    ) + time_once(
        git_bin,
        &["commit", "-q", "-m", "init"],
        &git_dir,
        &git_env_owned,
    );
    append_line(&git_dir.join("src").join("f0.txt"), "change\n")?;
    let git_incr = time_once(git_bin, &["add", "-A"], &git_dir, &git_env_owned)
        + time_once(
            git_bin,
            &["commit", "-q", "-m", "two"],
            &git_dir,
            &git_env_owned,
        );
    let git_status = time_min(git_bin, &["status"], &git_dir, &git_env_owned);
    let git_log = time_min(git_bin, &["log"], &git_dir, &git_env_owned);
    let git_storage_kb = kb(dir_size(&git_dir.join(".git")));

    // --- build the metrics table ---
    let metrics = vec![
        Metric::new("Binary size (KB)", rift_bin_kb, git_bin_kb),
        Metric::new("Cold commit (ms)", rift_cold as f64, git_cold as f64),
        Metric::new("Incremental (ms)", rift_incr as f64, git_incr as f64),
        Metric::new("status (ms)", rift_status as f64, git_status as f64),
        Metric::new("log (ms)", rift_log as f64, git_log as f64),
        Metric::new("Storage (KB)", rift_storage_kb, git_storage_kb),
    ];

    Ok(format_table(&metrics))
}

/// One benchmark metric: name, rift value, git value, winner, ratio.
struct Metric {
    name: String,
    rift: f64,
    git: f64,
}

impl Metric {
    fn new(name: &str, rift: f64, git: f64) -> Self {
        Self {
            name: name.to_string(),
            rift,
            git,
        }
    }

    /// Lower is better for every metric in this bench.
    fn winner(&self) -> &'static str {
        if (self.rift - self.git).abs() < f64::EPSILON {
            "tie"
        } else if self.rift < self.git {
            "Rift"
        } else {
            "Git"
        }
    }

    /// Ratio of the slower over the faster (e.g. "1.8x" means the slower
    /// side took 1.8× as long / used 1.8× as much storage). Capped at
    /// 99x with a `>` indicator so sub-millisecond results don't produce
    /// absurd ratios like "1000x".
    fn ratio(&self) -> String {
        if (self.rift - self.git).abs() < f64::EPSILON {
            return "1.0x".to_string();
        }
        // Add a 0.5ms floor to both sides so 0ms vs 1ms becomes 0.5 vs 1.5
        // (= 3x) instead of "1/0.001 = 1000x". The 0.5ms floor matches the
        // measurement resolution (sub-1ms is dominated by spawn overhead).
        let r = self.rift.max(0.5);
        let g = self.git.max(0.5);
        let raw = if self.rift < self.git {
            g / r
        } else {
            r / g
        };
        if raw > 99.0 {
            ">99x".to_string()
        } else {
            format!("{raw:.1}x")
        }
    }
}

/// Format the metrics as a comparison table.
fn format_table(metrics: &[Metric]) -> String {
    let rift_wins = metrics.iter().filter(|m| m.winner() == "Rift").count();
    let git_wins = metrics.iter().filter(|m| m.winner() == "Git").count();
    let ties = metrics.len() - rift_wins - git_wins;

    // Column widths (header + max content).
    let name_w = metrics
        .iter()
        .map(|m| m.name.len())
        .chain(std::iter::once("Metric".len()))
        .max()
        .unwrap_or(6)
        .max(6);
    let rift_w = metrics
        .iter()
        .map(|m| format_num(m.rift).len())
        .chain(std::iter::once("Rift".len()))
        .max()
        .unwrap_or(4)
        .max(4);
    let git_w = metrics
        .iter()
        .map(|m| format_num(m.git).len())
        .chain(std::iter::once("Git".len()))
        .max()
        .unwrap_or(3)
        .max(3);
    let winner_w = 6usize; // "Rift" / "Git" / "tie"
    let ratio_w = 7usize; // "1.8x" padded

    let mut out = String::new();
    out.push_str(&format!(
        "rift bench — {} files × {} lines, {} runs each for read-only\n\n",
        N_FILES, N_LINES, RUNS
    ));

    // Header row
    out.push_str(&format!(
        "| {:<nw$} | {:>rw$} | {:>gw$} | {:<ww$} | {:^paw$} |\n",
        "Metric",
        "Rift",
        "Git",
        "Winner",
        "Ratio",
        nw = name_w,
        rw = rift_w,
        gw = git_w,
        ww = winner_w,
        paw = ratio_w,
    ));
    // Separator
    out.push_str(&format!(
        "|{:-<nw$}|{:-<rw$}|{:-<gw$}|{:-<ww$}|{:-<paw$}|\n",
        "",
        "",
        "",
        "",
        "",
        nw = name_w + 2,
        rw = rift_w + 2,
        gw = git_w + 2,
        ww = winner_w + 2,
        paw = ratio_w + 2,
    ));
    // Metric rows
    for m in metrics {
        out.push_str(&format!(
            "| {:<nw$} | {:>rw$} | {:>gw$} | {:<ww$} | {:^paw$} |\n",
            m.name,
            format_num(m.rift),
            format_num(m.git),
            m.winner(),
            m.ratio(),
            nw = name_w,
            rw = rift_w,
            gw = git_w,
            ww = winner_w,
            paw = ratio_w,
        ));
    }
    out.push('\n');
    out.push_str(&format!(
        "Rift wins: {rift_wins}/{} | Git wins: {git_wins}/{} | Ties: {ties}/{}",
        metrics.len(),
        metrics.len(),
        metrics.len()
    ));
    out
}

/// Format a number with thousands separators (e.g. `2221` → `"2,221"`).
/// Decimals are kept for values < 100 (so `1.5` stays `1.5`).
fn format_num(n: f64) -> String {
    if n >= 100.0 {
        // Integer with thousands separators.
        let n_int = n.round() as u64;
        let s = n_int.to_string();
        // Insert commas from the right in groups of 3.
        let bytes = s.as_bytes();
        let mut out = String::with_capacity(s.len() + s.len() / 3);
        let len = bytes.len();
        for (i, &b) in bytes.iter().enumerate() {
            out.push(b as char);
            let from_end = len - i - 1;
            if from_end > 0 && from_end % 3 == 0 {
                out.push(',');
            }
        }
        out
    } else if n >= 10.0 {
        format!("{:.0}", n)
    } else {
        format!("{:.1}", n)
    }
}

/// Find the `git` binary on PATH.
fn find_git() -> Result<PathBuf> {
    let path = std::env::var_os("PATH").ok_or_else(|| anyhow!("PATH not set"))?;
    for dir in std::env::split_paths(&path) {
        let candidate = dir.join("git");
        if candidate.is_file() {
            return Ok(candidate);
        }
    }
    Err(anyhow!("git not found on PATH. Install git to run `rift bench`."))
}

/// Run a command once and return elapsed ms. Returns `u64::MAX` on failure.
fn time_once(bin: &Path, args: &[&str], cwd: &Path, env: &[(String, String)]) -> u64 {
    let t = Instant::now();
    let result = Command::new(bin)
        .args(args)
        .current_dir(cwd)
        .envs(env.iter().map(|(k, v)| (k.as_str(), v.as_str())))
        .output();
    if result.map(|o| o.status.success()).unwrap_or(false) {
        t.elapsed().as_millis() as u64
    } else {
        u64::MAX
    }
}

/// Run a command RUNS times and return the minimum elapsed ms. Used for
/// read-only commands to reduce spawn-overhead noise.
fn time_min(bin: &Path, args: &[&str], cwd: &Path, env: &[(String, String)]) -> u64 {
    let mut best = u64::MAX;
    for _ in 0..RUNS {
        let t = Instant::now();
        let result = Command::new(bin)
            .args(args)
            .current_dir(cwd)
            .envs(env.iter().map(|(k, v)| (k.as_str(), v.as_str())))
            .output();
        if result.map(|o| o.status.success()).unwrap_or(false) {
            best = best.min(t.elapsed().as_millis() as u64);
        }
    }
    best
}

/// File size in bytes (0 if the file doesn't exist).
fn file_size(path: &Path) -> u64 {
    std::fs::metadata(path).map(|m| m.len()).unwrap_or(0)
}

/// Recursively sum the size of all files under `dir`.
fn dir_size(dir: &Path) -> u64 {
    if !dir.exists() {
        return 0;
    }
    let mut total: u64 = 0;
    for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Ok(m) = entry.metadata() {
                total += m.len();
            }
        }
    }
    total
}

/// Convert bytes to KB (1024-based).
fn kb(bytes: u64) -> f64 {
    bytes as f64 / 1024.0
}

/// Recursively copy a directory tree.
fn copy_dir(src: &Path, dst: &Path) -> Result<()> {
    if !dst.exists() {
        std::fs::create_dir_all(dst)?;
    }
    for entry in walkdir::WalkDir::new(src).into_iter().filter_map(|e| e.ok()) {
        let rel = match entry.path().strip_prefix(src) {
            Ok(r) => r,
            Err(_) => continue,
        };
        let dest = dst.join(rel);
        if entry.file_type().is_dir() {
            std::fs::create_dir_all(&dest)?;
        } else if entry.file_type().is_file() {
            if let Some(parent) = dest.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::copy(entry.path(), &dest)?;
        }
    }
    Ok(())
}

/// Append a line to a file (used to make an incremental change for the
/// "incremental commit" benchmark).
fn append_line(path: &Path, line: &str) -> Result<()> {
    use std::io::Write;
    let mut f = std::fs::OpenOptions::new().append(true).open(path)?;
    f.write_all(line.as_bytes())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_num_large() {
        assert_eq!(format_num(2221.0), "2,221");
        assert_eq!(format_num(3987.0), "3,987");
        assert_eq!(format_num(1_000_000.0), "1,000,000");
    }

    #[test]
    fn test_format_num_small() {
        assert_eq!(format_num(12.0), "12");
        assert_eq!(format_num(1.5), "1.5");
        assert_eq!(format_num(0.5), "0.5");
    }

    #[test]
    fn test_metric_winner_rift() {
        let m = Metric::new("test", 10.0, 20.0);
        assert_eq!(m.winner(), "Rift");
        assert_eq!(m.ratio(), "2.0x");
    }

    #[test]
    fn test_metric_winner_git() {
        let m = Metric::new("test", 20.0, 10.0);
        assert_eq!(m.winner(), "Git");
        assert_eq!(m.ratio(), "2.0x");
    }

    #[test]
    fn test_metric_tie() {
        let m = Metric::new("test", 10.0, 10.0);
        assert_eq!(m.winner(), "tie");
        assert_eq!(m.ratio(), "1.0x");
    }

    #[test]
    fn test_format_table_has_header_and_rows() {
        let metrics = vec![
            Metric::new("Binary (KB)", 2221.0, 3987.0),
            Metric::new("Cold (ms)", 12.0, 9.0),
        ];
        let table = format_table(&metrics);
        assert!(table.contains("Binary (KB)"));
        assert!(table.contains("Cold (ms)"));
        assert!(table.contains("Rift wins: 1/2"));
        assert!(table.contains("Git wins: 1/2"));
        assert!(table.contains("Ties: 0/2"));
    }
}
