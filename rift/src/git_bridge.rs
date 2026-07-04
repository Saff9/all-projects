//! Git bridge — `rift push`, `rift pull`, `rift clone` work with GitHub/GitLab.
//!
//! How it works:
//! - `rift clone <url>`: `git clone` into a temp dir, then import files into a
//!   fresh rift repo. Credentials (PAT) are auto-injected from the auth store.
//! - `rift push <remote>`: exports current rift state to a temp git repo, then
//!   `git push`. Credentials injected from the auth store.
//! - `rift pull <remote>`: `git fetch` into temp, then import changed files.
//! - `rift remote add <name> <url>`: stores a remote URL (like git remote add).
//!
//! This means rift repos can push to and pull from GitHub, GitLab, Bitbucket,
//! and any git hosting — while keeping rift's own history format.

use crate::auth::{host_from_url, inject_credentials, redact_url, CredentialStore};
use crate::ignore::Matcher as IgnoreMatcher;
use crate::repo::Repo;
use anyhow::{anyhow, Result};
use std::path::Path;
use std::process::Command;

/// Add a remote (stores URL in `.rift/remotes/{name}`).
pub fn add_remote(rift_dir: &Path, name: &str, url: &str) -> Result<()> {
    let remotes_dir = rift_dir.join("remotes");
    std::fs::create_dir_all(&remotes_dir)?;
    let ref_path = remotes_dir.join(name);
    if let Some(parent) = ref_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&ref_path, url)?;
    Ok(())
}

/// List remotes.
pub fn list_remotes(rift_dir: &Path) -> Result<Vec<(String, String)>> {
    let remotes_dir = rift_dir.join("remotes");
    let mut remotes = Vec::new();
    if remotes_dir.exists() {
        for entry in std::fs::read_dir(&remotes_dir)? {
            let entry = entry?;
            let name = entry.file_name().to_string_lossy().to_string();
            let url = std::fs::read_to_string(entry.path())?.trim().to_string();
            remotes.push((name, url));
        }
    }
    Ok(remotes)
}

/// Push to a git remote (GitHub/GitLab/etc).
/// Exports current rift state to a temp git repo, then `git push`.
/// Credentials are auto-injected from the auth store if available.
pub fn push(repo: &Repo, remote: &str, branch: Option<&str>) -> Result<String> {
    let remotes_dir = repo.rift_dir.join("remotes");
    let remote_url = std::fs::read_to_string(remotes_dir.join(remote))
        .map_err(|_| anyhow!("remote '{}' not found. Run: rift remote add {} <url>", remote, remote))?
        .trim()
        .to_string();

    // Inject stored credentials (PAT) if we have them for this host.
    let store = CredentialStore::load().unwrap_or_default();
    let authed_url = inject_credentials(&remote_url, &store);
    // `authed_url` carries the PAT inline — only use it for the git command,
    // never for logging.
    let safe_url = redact_url(&authed_url);

    let branch_name = match branch {
        Some(b) => b.to_string(),
        None => repo.current_branch()?,
    };

    // Create temp git repo
    let temp_git = repo.rift_dir.join("git_export");
    if temp_git.exists() {
        std::fs::remove_dir_all(&temp_git)?;
    }
    std::fs::create_dir_all(&temp_git)?;

    run_cmd("git", &["init"], &temp_git)?;
    // Configure git identity for the temp repo (needed for commits).
    run_cmd("git", &["config", "user.email", "rift@local"], &temp_git)?;
    run_cmd("git", &["config", "user.name", "rift"], &temp_git)?;

    // Export current working tree files
    let current_tree = repo.build_tree_fast()?;
    for (path, blob_hash) in &current_tree.entries {
        let data = repo.store.read_blob(blob_hash)?;
        let dest = temp_git.join(path);
        if let Some(parent) = dest.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&dest, &data)?;
    }

    run_cmd("git", &["add", "-A"], &temp_git)?;
    let commit_msg = format!("rift push: {}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"));
    run_cmd("git", &["commit", "-m", &commit_msg, "--allow-empty"], &temp_git)?;

    run_cmd("git", &["remote", "add", "origin", &authed_url], &temp_git)?;

    let push_result = Command::new("git")
        .args(["push", "-u", "origin", &format!("HEAD:{}", branch_name), "--force"])
        .current_dir(&temp_git)
        .output();

    match push_result {
        Ok(o) if o.status.success() => {
            Ok(format!("Pushed to {} (branch: {})", remote, branch_name))
        }
        Ok(o) => {
            let err = String::from_utf8_lossy(&o.stderr);
            // If auth failed, give a helpful hint.
            if err.contains("Authentication failed") || err.contains("403") {
                let host = host_from_url(&remote_url);
                Err(anyhow!(
                    "authentication failed for {host}. Run: rift auth login {host} --token <PAT>"
                ))
            } else {
                Err(anyhow!("git push {} failed: {}", safe_url, err.trim()))
            }
        }
        Err(e) => Err(anyhow!("git not found or push failed: {}", e)),
    }
}

/// Pull from a git remote (GitHub/GitLab/etc).
/// `git clone` into temp, then import files into rift working directory.
/// Credentials are auto-injected from the auth store if available.
pub fn pull(repo: &Repo, remote: &str) -> Result<String> {
    let remotes_dir = repo.rift_dir.join("remotes");
    let remote_url = std::fs::read_to_string(remotes_dir.join(remote))
        .map_err(|_| anyhow!("remote '{}' not found. Run: rift remote add {} <url>", remote, remote))?
        .trim()
        .to_string();

    let store = CredentialStore::load().unwrap_or_default();
    let authed_url = inject_credentials(&remote_url, &store);
    let safe_url = redact_url(&authed_url);

    let temp_clone = repo.rift_dir.join("git_import");
    if temp_clone.exists() {
        std::fs::remove_dir_all(&temp_clone)?;
    }

    let clone_result = Command::new("git")
        .args(["clone", "--depth", "1", &authed_url])
        .arg(temp_clone.as_os_str())
        .output();

    match clone_result {
        Ok(o) if o.status.success() => {}
        Ok(o) => {
            let err = String::from_utf8_lossy(&o.stderr);
            if err.contains("Authentication failed") || err.contains("403") {
                let host = host_from_url(&remote_url);
                return Err(anyhow!(
                    "authentication failed for {host}. Run: rift auth login {host} --token <PAT>"
                ));
            }
            return Err(anyhow!("git clone {} failed: {}", safe_url, err.trim()));
        }
        Err(e) => return Err(anyhow!("git not found: {}", e)),
    }

    let git_dir = temp_clone.join(".git");
    if git_dir.exists() {
        std::fs::remove_dir_all(&git_dir)?;
    }

    // Import files using proper ignore matching
    let ignore = IgnoreMatcher::load(&repo.work_dir);
    let mut count = 0;
    for entry in walkdir::WalkDir::new(&temp_clone).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let rel = match entry.path().strip_prefix(&temp_clone) {
                Ok(r) => r,
                Err(_) => continue,
            };
            let rel_str = rel.to_string_lossy().to_string();
            if ignore.is_ignored(&rel_str, false) {
                continue;
            }
            let data = std::fs::read(entry.path())?;
            let dest = repo.work_dir.join(&rel_str);
            if let Some(parent) = dest.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::write(&dest, &data)?;
            count += 1;
        }
    }

    let _ = std::fs::remove_dir_all(&temp_clone);

    let msg = format!("Pulled from {} ({} files)", remote, count);
    repo.save(&msg)?;

    Ok(format!("Pulled {} files from {} (remote: {})", count, remote, &safe_url[..safe_url.len().min(40)]))
}

/// Clone a git URL into a new rift repo in `dest` (or a dir derived from the URL
/// if `dest` is None). Credentials are auto-injected from the auth store.
///
/// This is `rift clone` — like `git clone` but creates a rift repo.
pub fn clone(url: &str, dest: Option<&str>) -> Result<String> {
    let store = CredentialStore::load().unwrap_or_default();
    let authed_url = inject_credentials(url, &store);
    let safe_url = redact_url(&authed_url);

    // Derive destination dir from URL if not given.
    // e.g. https://github.com/user/repo.git → ./repo
    let dest_path = dest.map_or_else(
        || {
            let name = url
                .trim_end_matches('/')
                .trim_end_matches(".git")
                .rsplit('/')
                .next()
                .unwrap_or("rift-clone");
            std::path::PathBuf::from(name)
        },
        std::path::PathBuf::from,
    );

    if dest_path.exists() {
        return Err(anyhow!(
            "destination '{}' already exists. Remove it or pass a different path.",
            dest_path.display()
        ));
    }

    // Clone into temp via git, then import into rift.
    let temp_clone = std::env::temp_dir().join(format!("rift-clone-{}", std::process::id()));
    if temp_clone.exists() {
        std::fs::remove_dir_all(&temp_clone)?;
    }

    eprintln!("Cloning {} ...", redact_url(url));
    let clone_result = Command::new("git")
        .args(["clone", "--depth", "1", &authed_url])
        .arg(temp_clone.as_os_str())
        .output();

    match clone_result {
        Ok(o) if o.status.success() => {}
        Ok(o) => {
            let err = String::from_utf8_lossy(&o.stderr);
            if err.contains("Authentication failed") || err.contains("403") {
                let host = host_from_url(url);
                return Err(anyhow!(
                    "authentication failed for {host}.\n  Run: rift auth login {host} --token <PAT>\n  then retry: rift clone {}",
                    redact_url(url)
                ));
            }
            return Err(anyhow!("git clone {} failed: {}", safe_url, err.trim()));
        }
        Err(e) => return Err(anyhow!("git not found: {}", e)),
    }

    // Remove .git from clone
    let git_dir = temp_clone.join(".git");
    if git_dir.exists() {
        std::fs::remove_dir_all(&git_dir)?;
    }

    // Create the destination dir and init rift there.
    std::fs::create_dir_all(&dest_path)?;
    let cwd = std::env::current_dir()?;
    let abs_dest = cwd.join(&dest_path);
    std::env::set_current_dir(&abs_dest)?;
    let repo = Repo::init()?;

    // Copy files from temp_clone into the rift work dir (using ignore matching).
    let ignore = IgnoreMatcher::load(&repo.work_dir);
    let mut count = 0;
    for entry in walkdir::WalkDir::new(&temp_clone).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let rel = match entry.path().strip_prefix(&temp_clone) {
                Ok(r) => r,
                Err(_) => continue,
            };
            let rel_str = rel.to_string_lossy().to_string();
            if ignore.is_ignored(&rel_str, false) {
                continue;
            }
            let data = std::fs::read(entry.path())?;
            let dest_file = repo.work_dir.join(&rel_str);
            if let Some(parent) = dest_file.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::write(&dest_file, &data)?;
            count += 1;
        }
    }

    let _ = std::fs::remove_dir_all(&temp_clone);
    std::env::set_current_dir(&cwd)?;

    // Save the initial commit.
    let msg = format!("Cloned {} ({} files)", redact_url(url), count);
    // We need to save from within the dest dir — re-open the repo there.
    std::env::set_current_dir(&abs_dest)?;
    let repo = Repo::find()?;
    repo.save(&msg)?;
    std::env::set_current_dir(&cwd)?;

    Ok(format!(
        "Cloned {} files from {} into {}",
        count,
        redact_url(url),
        dest_path.display()
    ))
}

fn run_cmd(cmd: &str, args: &[&str], cwd: &Path) -> Result<()> {
    let result = Command::new(cmd)
        .args(args)
        .current_dir(cwd)
        .output()?;
    if !result.status.success() {
        let err = String::from_utf8_lossy(&result.stderr);
        if !err.contains("master ->") && !err.contains("main ->") && !err.contains("branch") {
            return Err(anyhow!("{} {:?} failed: {}", cmd, args, err.trim()));
        }
    }
    Ok(())
}
