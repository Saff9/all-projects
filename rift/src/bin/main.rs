//! rift CLI v1.4 — fast VCS with git interop, rift-protocol collaboration,
//! auth, undo, serve, watch, daemon mode, and a built-in benchmark.

use anyhow::{anyhow, Result};
use clap::{Parser, Subcommand};
use rift::auth::CredentialStore;
use rift::bench;
use rift::git_bridge;
use rift::repo::Repo;
use rift::rift_clone;
use rift::serve;
use rift::watch;
use std::os::unix::io::AsRawFd;

#[derive(Parser, Debug)]
#[command(
    name = "rift",
    version,
    about = "A fast VCS with undo, auto-snapshot, chunked dedup, git interop",
    arg_required_else_help = true
)]
struct Cli {
    /// Emit machine-readable JSON (where supported) for AI/scripting.
    #[arg(global = true, long, action = clap::ArgAction::SetTrue)]
    json: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Create a rift repository in the current directory.
    Init,

    /// Commit all tracked files (alias: commit).
    #[command(alias = "commit")]
    Save {
        /// Commit message.
        #[arg(short, long)]
        message: Option<String>,
    },

    /// Show working-tree changes (added / modified / deleted).
    Status,

    /// Show commit history.
    Log,

    /// Show uncommitted diff (unified format).
    Diff,

    /// Diff between two commits.
    DiffCommits {
        /// Old commit hash (or short prefix).
        old: String,
        /// New commit hash (or short prefix).
        new: String,
    },

    /// Find the first bad commit between a known-good and known-bad commit.
    Bisect {
        /// Known-good commit hash (the bug didn't exist here).
        good: String,
        /// Known-bad commit hash (the bug exists here).
        bad: String,
    },

    /// Get or set config values (author.name, author.email, etc).
    Config {
        /// Config key (e.g. "author.name"). If value is omitted, prints the current value.
        key: Option<String>,
        /// Config value to set. If omitted, reads the current value.
        value: Option<String>,
        /// List all config values.
        #[arg(short, long)]
        list: bool,
    },

    /// Show a specific commit.
    Show { hash: String },

    /// List or create branches. Current branch is prefixed with `* `.
    Branch { name: Option<String> },

    /// Switch to an existing branch (alias: switch).
    #[command(alias = "switch")]
    Checkout { name: String },

    /// Merge another branch into the current one (3-way + conflict markers).
    Merge { branch: String },

    /// Stash working-tree changes.
    Stash {
        #[command(subcommand)]
        action: Option<StashAction>,
    },

    /// Rebase current branch onto another branch.
    Rebase { onto: String },

    /// Apply a single commit from elsewhere onto the current branch.
    #[command(name = "cherry-pick")]
    CherryPick { hash: String },

    /// Create a tag, or list all tags if no name given.
    Tag {
        name: Option<String>,
        /// Tag message.
        #[arg(short, long)]
        message: Option<String>,
    },

    /// Reverse the last successful operation (save / checkout / merge / ...).
    Undo,

    /// Show the operation audit log.
    History {
        /// Maximum number of entries to show.
        #[arg(short, long, default_value = "20")]
        n: usize,
    },

    /// Show storage stats (chunks, bytes, dedup ratio).
    Stats,

    /// Restore the working tree to a specific commit.
    Revert { hash: String },

    /// Search tracked files for a pattern.
    Grep { pattern: String },

    /// Remove untracked files from the working tree.
    Clean,

    /// Show which commit last modified each line of a file.
    Blame { file: String },

    /// Manage git remotes for push/pull interop.
    Remote {
        #[command(subcommand)]
        action: Option<RemoteAction>,
    },

    /// Push the current branch to a git remote (GitHub/GitLab/...).
    Push {
        remote: String,
        branch: Option<String>,
    },

    /// Pull from a git remote into the current rift branch.
    Pull { remote: String },

    /// Check repository integrity (every blob hash readable).
    Verify,

    /// Visual timeline of commits + operations.
    Timeline,

    /// Garbage-collect the pack file. Reclaims orphaned bytes from the
    /// lock-free write race and from chunks no longer reachable from any
    /// commit. Safe to run anytime.
    Gc,

    /// Import an existing git repository into a fresh rift repo.
    Migrate { git_path: String },

    /// Clone a git URL or a rift-protocol URL into a new rift repo.
    ///
    /// If the URL is `http(s)://host:port` (rift-protocol — no `.git` suffix
    /// OR explicit port), clones directly from a `rift serve` instance
    /// without involving git. Otherwise, behaves like `git clone` and uses
    /// stored credentials from `rift auth login` for private repos.
    Clone {
        /// Git URL (`<https://github.com/user/repo.git>` or `git@github.com:user/repo.git`)
        /// OR rift-protocol URL (http://host:port or https://host:port for TLS).
        url: String,
        /// Destination directory (defaults to the repo name from the URL).
        #[arg(short, long)]
        dest: Option<String>,
        /// Accept the server's TLS certificate fingerprint (for `https://` clone).
        /// Compare this to the fingerprint printed by `rift serve --tls`.
        #[arg(long)]
        accept_fingerprint: Option<String>,
    },

    /// Run a benchmark: rift vs git on binary size, cold/incremental commit,
    /// status, log, and storage. CLI-only — no frontend required.
    Bench,

    /// Manage stored credentials for GitHub/GitLab/etc (PATs, not passwords).
    Auth {
        #[command(subcommand)]
        action: AuthAction,
    },

    /// Run a local HTTP server (default port 3030) for rift clone/push.
    /// Binds to 127.0.0.1 (localhost only) by default. Use --public to bind
    /// 0.0.0.0 (all interfaces). Use --token <secret> to require
    /// `Authorization: Bearer <secret>` on /blob, /tree, /commit.
    Serve {
        #[arg(long, default_value = "3030")]
        port: u16,
        /// Bind to 0.0.0.0 (all interfaces) instead of 127.0.0.1 (localhost).
        /// Prints a security warning.
        #[arg(long, default_value = "false")]
        public: bool,
        /// If set, every request to /blob, /tree, /commit must include
        /// `Authorization: Bearer <token>`. /health, /info, /log,
        /// /branches, /clone stay public.
        #[arg(long)]
        token: Option<String>,
        /// Enable TLS (HTTPS). Generates a self-signed cert if none exists.
        /// The cert fingerprint is printed so others can verify it with
        /// `rift clone --accept-fingerprint <hash>`.
        #[arg(long, default_value = "false")]
        tls: bool,
        /// Run in the background (daemon mode). Writes PID to
        /// .rift/serve.pid, logs to .rift/serve.log. Use `rift serve --stop`
        /// to stop. For VPS / server deployment.
        #[arg(long, default_value = "false")]
        daemon: bool,
        /// Stop a running daemon (started with --daemon).
        #[arg(long, default_value = "false")]
        stop: bool,
    },

    /// Watch the working tree and auto-snapshot on file changes.
    Watch,
}

#[derive(Subcommand, Debug)]
enum StashAction {
    /// Save current changes as a new stash entry.
    Save {
        #[arg(short, long)]
        message: Option<String>,
    },
    /// Apply (and remove) the most recent stash, or a specific id.
    Pop { id: Option<u64> },
    /// List all stash entries.
    List,
    /// Drop a specific stash entry by id.
    Drop { id: u64 },
}

#[derive(Subcommand, Debug)]
enum RemoteAction {
    /// Add a named git remote.
    Add { name: String, url: String },
    /// List all configured remotes.
    List,
}

#[derive(Subcommand, Debug)]
enum AuthAction {
    /// Save a Personal Access Token (PAT) for a host. Never store raw passwords.
    Login {
        /// Host (github.com, gitlab.com, bitbucket.org, or your self-hosted host).
        host: String,
        /// Personal Access Token (e.g. `ghp_xxx` for GitHub, glpat-xxx for GitLab).
        #[arg(short, long)]
        token: String,
        /// Optional username (inferred from the API if omitted).
        #[arg(short, long)]
        user: Option<String>,
    },
    /// Save an SSH private key for a host (for git@github.com:... URLs).
    /// The key is encrypted at rest with the same AES-256-GCM master key as PATs.
    AddKey {
        /// Host (github.com, gitlab.com).
        host: String,
        /// Path to the SSH private key file (e.g. `~/.ssh/id_ed25519`).
        #[arg(short, long)]
        key: String,
    },
    /// List all hosts with stored credentials (tokens masked) and SSH keys.
    List,
    /// List only hosts with SSH keys.
    Keys,
    /// Remove stored credentials (PAT) for a host.
    Logout {
        /// Host to remove (github.com, gitlab.com, ...).
        host: String,
    },
    /// Remove the SSH key for a host.
    RemoveKey {
        /// Host to remove the key for.
        host: String,
    },
    /// Show the full credential entry for a host (including the raw token).
    /// Use with caution — the token is a secret.
    Show {
        /// Host to inspect.
        host: String,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    let cmd = cli.command;
    let json = cli.json;
    run(cmd, json)
}

#[allow(clippy::too_many_lines)]
fn run(cmd: Commands, json: bool) -> Result<()> {
    match cmd {
        Commands::Init => {
            let r = Repo::init()?;
            println!("Initialized rift in {}", r.rift_dir.display());
        }
        Commands::Save { message } => {
            let msg = message.unwrap_or_else(|| "save".to_string());
            let r = Repo::find()?;
            let h = r.save(&msg)?;
            if json {
                println!("{{\"hash\":\"{h}\"}}");
            } else {
                println!("[{}] {}", &h[..7], msg);
            }
        }
        Commands::Status => {
            let r = Repo::find()?;
            let s = r.status()?;
            if json {
                println!("{}", serde_json::to_string_pretty(&s)?);
            } else {
                println!("On branch {}", s.branch);
                if s.clean {
                    println!("clean");
                } else {
                    for f in &s.added {
                        println!("  + {f}");
                    }
                    for f in &s.modified {
                        println!("  ~ {f}");
                    }
                    for f in &s.deleted {
                        println!("  - {f}");
                    }
                }
            }
        }
        Commands::Log => {
            let r = Repo::find()?;
            let l = r.log()?;
            if json {
                println!("{}", serde_json::to_string_pretty(&l)?);
            } else {
                for e in &l {
                    let dt = chrono::DateTime::from_timestamp(e.timestamp, 0)
                        .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                        .unwrap_or_default();
                    println!("[{}] {} ({})", &e.hash[..7], e.message, dt);
                }
            }
        }
        Commands::Diff => {
            let r = Repo::find()?;
            let d = r.diff()?;
            if d.is_empty() {
                println!("No changes.");
            } else {
                print!("{d}");
            }
        }
        Commands::DiffCommits { old, new } => {
            let r = Repo::find()?;
            let d = r.diff_commits(&old, &new)?;
            if d.is_empty() {
                println!("No differences between {old} and {new}.");
            } else {
                print!("{d}");
            }
        }
        Commands::Bisect { good, bad } => {
            let r = Repo::find()?;
            let culprit = r.bisect(&good, &bad)?;
            println!("First bad commit: {}", &culprit[..7.min(culprit.len())]);
            let c = r.store.read_commit(&culprit)?;
            println!("  {}", c.message);
        }
        Commands::Config { key, value, list } => {
            let r = Repo::find()?;
            if list {
                let pairs = r.config_list()?;
                if pairs.is_empty() {
                    println!("(no config set)");
                } else {
                    for (k, v) in &pairs {
                        println!("{k}={v}");
                    }
                }
            } else if let Some(k) = key {
                if let Some(v) = value {
                    r.config_set(&k, &v)?;
                    println!("Set {k}={v}");
                } else if let Some(v) = r.config_get(&k) {
                    println!("{k}={v}");
                } else {
                    println!("(not set)");
                }
            } else {
                let pairs = r.config_list()?;
                for (k, v) in &pairs {
                    println!("{k}={v}");
                }
            }
        }
        Commands::Show { hash } => {
            let r = Repo::find()?;
            let full = r.store.resolve_hash(&hash)?;
            let c = r.store.read_commit(&full)?;
            println!("commit {}\nAuthor: {}\n\n  {}", full, c.author, c.message);
        }
        Commands::Branch { name } => {
            let r = Repo::find()?;
            if let Some(name) = name {
                r.branch(&name)?;
                println!("Created branch '{name}'");
            } else {
                let bs = r.list_branches()?;
                let cur = r.current_branch()?;
                for b in &bs {
                    if *b == cur {
                        println!("* {b}");
                    } else {
                        println!("  {b}");
                    }
                }
            }
        }
        Commands::Checkout { name } => {
            let r = Repo::find()?;
            r.checkout(&name)?;
            println!("Switched to '{name}'");
        }
        Commands::Merge { branch } => {
            let r = Repo::find()?;
            println!("{}", r.merge(&branch)?);
        }
        Commands::Stash { action } => {
            let r = Repo::find()?;
            match action.unwrap_or(StashAction::List) {
                StashAction::Save { message } => {
                    let msg = message.unwrap_or_else(|| "wip".to_string());
                    let id = r.stash_save(&msg)?;
                    println!("Saved stash #{id} ({msg})");
                }
                StashAction::Pop { id } => {
                    println!("{}", r.stash_pop(id)?);
                }
                StashAction::List => {
                    let stashes = r.stash_list()?;
                    if stashes.is_empty() {
                        println!("No stashes.");
                    } else {
                        for s in &stashes {
                            let dt = chrono::DateTime::from_timestamp(s.timestamp, 0)
                                .map(|dt| dt.format("%H:%M").to_string())
                                .unwrap_or_default();
                            println!("#{} [{}] {} ({})", s.id, s.branch, s.message, dt);
                        }
                    }
                }
                StashAction::Drop { id } => {
                    r.stash_drop(id)?;
                    println!("Dropped stash #{id}");
                }
            }
        }
        Commands::Rebase { onto } => {
            let r = Repo::find()?;
            println!("{}", r.rebase(&onto)?);
        }
        Commands::CherryPick { hash } => {
            let r = Repo::find()?;
            println!("{}", r.cherry_pick(&hash)?);
        }
        Commands::Tag { name, message } => {
            let r = Repo::find()?;
            if let Some(name) = name {
                r.tag_create(&name, message.as_deref())?;
                println!("Created tag '{name}'");
            } else {
                let tags = r.tag_list()?;
                if json {
                    println!("{}", serde_json::to_string_pretty(&tags)?);
                } else {
                    for t in &tags {
                        println!(
                            "{} -> {} ({})",
                            t.name,
                            &t.commit[..7],
                            t.message.as_deref().unwrap_or("")
                        );
                    }
                }
            }
        }
        Commands::Undo => {
            let r = Repo::find()?;
            println!("{}", r.undo()?);
        }
        Commands::History { n } => {
            let r = Repo::find()?;
            let ops = r.oplog_list(n);
            if json {
                println!("{}", serde_json::to_string_pretty(&ops)?);
            } else {
                for op in &ops {
                    println!(
                        "#{} {} {} ({})",
                        op.id,
                        op.command,
                        op.args.join(" "),
                        if op.success { "ok" } else { "fail" }
                    );
                }
            }
        }
        Commands::Stats => {
            let r = Repo::find()?;
            let stats = r.store.chunks.stats()?;
            if json {
                println!("{}", serde_json::to_string_pretty(&stats)?);
            } else {
                println!(
                    "Unique chunks: {}\nTotal chunks: {}\nTotal bytes: {}\nDedup: {:.1}%",
                    stats.unique_chunks,
                    stats.total_chunks,
                    stats.total_bytes,
                    stats.dedup_ratio * 100.0
                );
            }
        }
        Commands::Revert { hash } => {
            let r = Repo::find()?;
            println!("{}", r.revert(&hash)?);
        }
        Commands::Grep { pattern } => {
            let r = Repo::find()?;
            let results = r.grep(&pattern)?;
            for (file, line, text) in &results {
                println!("{file}:{line}: {text}");
            }
            if results.is_empty() {
                println!("No matches.");
            }
        }
        Commands::Clean => {
            let r = Repo::find()?;
            let count = r.clean()?;
            println!("Removed {count} untracked files.");
        }
        Commands::Blame { file } => {
            let r = Repo::find()?;
            let results = r.blame(&file)?;
            for (hash, line) in &results {
                println!("{} | {}", &hash[..7.min(hash.len())], line);
            }
        }
        Commands::Remote { action } => {
            let r = Repo::find()?;
            match action.unwrap_or(RemoteAction::List) {
                RemoteAction::Add { name, url } => {
                    git_bridge::add_remote(&r.rift_dir, &name, &url)?;
                    println!("Added remote '{name}' -> {url}");
                }
                RemoteAction::List => {
                    let remotes = git_bridge::list_remotes(&r.rift_dir)?;
                    if remotes.is_empty() {
                        println!("No remotes.");
                    } else {
                        for (name, url) in &remotes {
                            println!("{name} {url}");
                        }
                    }
                }
            }
        }
        Commands::Push { remote, branch } => {
            let r = Repo::find()?;
            println!("{}", git_bridge::push(&r, &remote, branch.as_deref())?);
        }
        Commands::Pull { remote } => {
            let r = Repo::find()?;
            println!("{}", git_bridge::pull(&r, &remote)?);
        }
        Commands::Verify => {
            let r = Repo::find()?;
            let (checked, errors) = r.verify()?;
            if json {
                println!("{{\"checked\":{checked},\"errors\":{errors}}}");
            } else {
                println!("Checked {checked} blobs, {errors} errors");
            }
        }
        Commands::Timeline => {
            let r = Repo::find()?;
            let entries = r.timeline()?;
            if json {
                println!("{}", serde_json::to_string_pretty(&entries)?);
            } else {
                for e in &entries {
                    let time = chrono::DateTime::from_timestamp(e.timestamp, 0)
                        .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                        .unwrap_or_default();
                    let hash = e.hash.as_ref().map_or("       ", |h| &h[..7]);
                    println!("[{}] {time} {} {}", hash, e.kind, e.description);
                }
            }
        }
        Commands::Gc => {
            let r = Repo::find()?;
            let before = std::fs::metadata(r.rift_dir.join("chunks").join("pack.dat"))
                .map_or(0, |m| m.len());
            let reclaimed = r.gc()?;
            let after = std::fs::metadata(r.rift_dir.join("chunks").join("pack.dat"))
                .map_or(0, |m| m.len());
            if json {
                println!("{{\"reclaimed_bytes\":{reclaimed},\"before_bytes\":{before},\"after_bytes\":{after}}}");
            } else {
                println!("GC: reclaimed {reclaimed} bytes");
                println!("  pack.dat: {before} -> {after} bytes");
                if reclaimed > 0 {
                    // Cast is safe here: pack file sizes in practice never exceed 2^52 bytes (4 PB).
                    #[allow(clippy::cast_precision_loss)]
                    let pct = (reclaimed as f64 / before as f64) * 100.0;
                    println!("  reclaimed {pct:.1}% of pack file");
                } else {
                    println!("  (pack file was already compact)");
                }
            }
        }
        Commands::Migrate { git_path } => {
            let result = Repo::migrate(&git_path)?;
            println!("{result}");
        }
        Commands::Clone { url, dest, accept_fingerprint } => {
            if rift_clone::is_rift_protocol(&url) {
                // For HTTPS rift-protocol, set RIFT_ACCEPT_FINGERPRINT env var.
                if let Some(fp) = &accept_fingerprint {
                    std::env::set_var("RIFT_ACCEPT_FINGERPRINT", fp);
                }
                let result = rift_clone::clone(&url, dest.as_deref())?;
                println!("{result}");
            } else {
                let result = git_bridge::clone(&url, dest.as_deref())?;
                println!("{result}");
            }
        }
        Commands::Bench => {
            let report = bench::run()?;
            println!("{report}");
        }
        Commands::Auth { action } => match action {
            AuthAction::Login { host, token, user } => {
                let mut store = CredentialStore::load()?;
                store.upsert(&host, &token, user.as_deref());
                store.save()?;
                println!("Saved credential for {host}");
                println!("  Stored at: ~/.config/rift/credentials (mode 0600)");
                println!("  Future push/pull/clone to {host} will use this token automatically.");
            }
            AuthAction::List => {
                let store = CredentialStore::load()?;
                if store.list().is_empty() {
                    println!("No saved credentials.");
                    println!("  Run: rift auth login github.com --token <PAT>");
                } else {
                    println!("{:<24} {:<12} {:<16} saved", "HOST", "USER", "");
                    println!("{:-<60}", "");
                    for cred in store.list() {
                        let masked = if cred.token.len() > 8 {
                            format!("{}•••{}", &cred.token[..4], &cred.token[cred.token.len()-4..])
                        } else {
                            "••••".to_string()
                        };
                        let dt = chrono::DateTime::from_timestamp(cred.saved_at, 0)
                            .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
                            .unwrap_or_default();
                        println!("{:<24} {:<12} {:<16} {}",
                            cred.host,
                            cred.user.as_deref().unwrap_or("(unknown)"),
                            masked,
                            dt);
                    }
                }
            }
            AuthAction::Logout { host } => {
                let mut store = CredentialStore::load()?;
                if store.remove(&host) {
                    store.save()?;
                    println!("Removed credentials for {host}");
                } else {
                    println!("No credential found for {host}");
                }
            }
            AuthAction::Show { host } => {
                let store = CredentialStore::load()?;
                match store.get(&host) {
                    Some(cred) => {
                        if json {
                            println!("{}", serde_json::to_string_pretty(cred)?);
                        } else {
                            println!("host:     {}", cred.host);
                            println!("user:     {}", cred.user.as_deref().unwrap_or("(unknown)"));
                            println!("token:    {}", cred.token);
                            println!("saved_at: {}", cred.saved_at);
                        }
                    }
                    None => {
                        return Err(anyhow!("no credential for {host}. Run: rift auth login {host} --token <PAT>"));
                    }
                }
            }
            AuthAction::AddKey { host, key } => {
                let key_path = std::path::Path::new(&key);
                if !key_path.exists() {
                    return Err(anyhow!("SSH key not found: {key}"));
                }
                rift::ssh_keys::add_key(&host, key_path)?;
                println!("Saved SSH key for {host}");
                println!("  Encrypted with AES-256-GCM (same master key as PATs).");
                println!("  Stored at: ~/.config/rift/ssh_keys/{host}.enc (0600)");
                println!("  Future git@{host}:... URLs will use this key automatically.");
            }
            AuthAction::Keys => {
                let keys = rift::ssh_keys::list_keys()?;
                if keys.is_empty() {
                    println!("No SSH keys saved.");
                    println!("  Run: rift auth add-key github.com --key ~/.ssh/id_ed25519");
                } else {
                    println!("{:<24} STORED", "HOST");
                    println!("{:-<40}", "");
                    for host in &keys {
                        println!("{host:<24} encrypted (0600)");
                    }
                }
            }
            AuthAction::RemoveKey { host } => {
                if rift::ssh_keys::remove_key(&host)? {
                    println!("Removed SSH key for {host}");
                } else {
                    println!("No SSH key found for {host}");
                }
            }
        },
        Commands::Serve { port, public, token, tls, daemon, stop } => {
            let r = Repo::find()?;

            // --stop: kill a running daemon.
            if stop {
                let pid_file = r.rift_dir.join("serve.pid");
                if let Ok(pid_str) = std::fs::read_to_string(&pid_file) {
                    let pid: i32 = pid_str.trim().parse().unwrap_or(-1);
                    if pid > 0 {
                        let result = unsafe { libc::kill(pid, 15) }; // SIGTERM
                        if result == 0 {
                            let _ = std::fs::remove_file(&pid_file);
                            println!("Stopped rift serve (pid {pid})");
                        } else {
                            eprintln!("Failed to stop pid {pid} (process not running?)");
                            let _ = std::fs::remove_file(&pid_file);
                        }
                    }
                } else {
                    println!("No daemon running (no .rift/serve.pid found)");
                }
                return Ok(());
            }

            // --daemon: fork to background.
            if daemon {
                let pid_file = r.rift_dir.join("serve.pid");
                let log_file = r.rift_dir.join("serve.log");

                // Check if already running.
                if let Ok(pid_str) = std::fs::read_to_string(&pid_file) {
                    let pid: i32 = pid_str.trim().parse().unwrap_or(-1);
                    if pid > 0 && unsafe { libc::kill(pid, 0) } == 0 {
                        eprintln!("rift serve already running (pid {pid}). Use --stop first.");
                        return Ok(());
                    }
                }

                // Fork.
                let pid = unsafe { libc::fork() };
                if pid < 0 {
                    return Err(anyhow!("fork failed"));
                }
                if pid > 0 {
                    // Parent: write PID file and exit.
                    std::fs::write(&pid_file, pid.to_string())?;
                    println!("rift serve started in background (pid {pid})");
                    println!("  logs: {}", log_file.display());
                    println!("  stop: rift serve --stop");
                    return Ok(());
                }

                // Child: redirect stdout/stderr to log file, detach.
                let log = std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&log_file)?;
                unsafe {
                    libc::dup2(log.as_raw_fd(), 1);
                    libc::dup2(log.as_raw_fd(), 2);
                    libc::setsid();
                }
                // Write the child's PID (the child is the daemon now).
                std::fs::write(&pid_file, std::process::id().to_string())?;
            }

            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .map_err(|e| anyhow!("failed to start tokio runtime: {e}"))?;
            let opts = serve::ServeOptions { port, public, token, tls };
            rt.block_on(serve::serve(r, opts))?;

            // Clean up PID file on exit.
            if daemon {
                let _ = std::fs::remove_file(std::env::current_dir()?.join(".rift").join("serve.pid"));
            }
        }
        Commands::Watch => {
            let r = Repo::find()?;
            watch::run_watch(r)?;
        }
    }
    Ok(())
}
