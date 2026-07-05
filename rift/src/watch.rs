//! Auto-snapshot watch mode — runs in background, commits on file change.
//! Like a time machine: never lose work, every change is auto-saved.

use crate::repo::Repo;
use notify_debouncer_mini::{new_debouncer, DebounceEventHandler, DebouncedEvent};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// Run auto-snapshot watch mode: blocks forever, committing the worktree as
/// an auto-snapshot whenever a file changes (debounced to 10 s).
pub fn run_watch(repo: Repo) -> anyhow::Result<()> {
    let last_save = Arc::new(Mutex::new(Instant::now() - Duration::from_secs(60)));
    let work_dir = repo.work_dir.clone();
    let repo = Arc::new(repo);

    struct Handler {
        repo: Arc<Repo>,
        last_save: Arc<Mutex<Instant>>,
    }
    impl DebounceEventHandler for Handler {
        fn handle_event(&mut self, _res: Result<Vec<DebouncedEvent>, notify::Error>) {
            let mut last = match self.last_save.lock() {
                Ok(g) => g,
                Err(_) => return, // poisoned
            };
            if last.elapsed() < Duration::from_secs(10) {
                return; // debounce: at most one save per 10s
            }
            *last = Instant::now();
            drop(last);
            let ts = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
            match self.repo.save(&format!("auto-snapshot {ts}")) {
                Ok(hash) => {
                    eprintln!("[rift watch] auto-saved: {} (auto-snapshot {ts})", &hash[..7])
                }
                Err(e) => eprintln!("[rift watch] save failed: {e}"),
            }
        }
    }

    let mut debouncer = new_debouncer(
        Duration::from_secs(2),
        Handler {
            repo,
            last_save,
        },
    )?;
    debouncer
        .watcher()
        .watch(&work_dir, notify::RecursiveMode::Recursive)?;

    eprintln!(
        "[rift watch] watching {} — auto-saves every 10s on change",
        work_dir.display()
    );
    eprintln!("[rift watch] press Ctrl+C to stop");

    // Block forever
    loop {
        std::thread::sleep(Duration::from_secs(60));
    }
}
