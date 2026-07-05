//! SSH key management — store private keys encrypted at rest for git
//! push/pull/clone over SSH.
//!
//! When you run `rift auth add-key github.com --key ~/.ssh/id_ed25519`,
//! rift reads the key, encrypts it with the same AES-256-GCM master key
//! used for PATs, and stores it at `~/.config/rift/ssh_keys/<host>.enc`.
//!
//! When `rift push` or `rift clone git@github.com:...` needs the key:
//! 1. Decrypt it in memory.
//! 2. Write to a temp file (0600).
//! 3. Set `GIT_SSH_COMMAND=ssh -i <tmpfile> -o StrictHostKeyChecking=accept-new`.
//! 4. Run the git command.
//! 5. Delete the temp file (zeroized first).
//!
//! The key is never stored in plaintext on disk after `add-key`.

use crate::auth::{self, CredentialStore};
use anyhow::{Context, Result};
use std::path::PathBuf;

/// Directory where encrypted SSH keys live: `~/.config/rift/ssh_keys/`.
fn ssh_keys_dir() -> Result<PathBuf> {
    let base = if let Ok(xdg) = std::env::var("XDG_CONFIG_HOME") {
        PathBuf::from(xdg)
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home).join(".config")
    } else {
        return Err(anyhow::anyhow!("no HOME or XDG_CONFIG_HOME"));
    };
    Ok(base.join("rift").join("ssh_keys"))
}

/// Save an SSH private key for a host. Reads the key file, encrypts it
/// with the master key (same as PATs), stores at `ssh_keys/<host>.enc`.
pub fn add_key(host: &str, key_path: &std::path::Path) -> Result<()> {
    let key_data = std::fs::read_to_string(key_path)
        .with_context(|| format!("read SSH key {}", key_path.display()))?;

    let store = CredentialStore::load()?;
    let master_key = store.master_key()?;

    let encrypted = auth::encrypt_string(&key_data, &master_key)?;

    let dir = ssh_keys_dir()?;
    std::fs::create_dir_all(&dir)?;
    let path = dir.join(format!("{host}.enc"));
    std::fs::write(&path, &encrypted)
        .with_context(|| format!("write {}", path.display()))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(&path)?.permissions();
        perms.set_mode(0o600);
        std::fs::set_permissions(&path, perms)?;
    }

    Ok(())
}

/// Load and decrypt the SSH key for a host. Returns the plaintext key data.
pub fn get_key(host: &str) -> Result<Option<String>> {
    let dir = ssh_keys_dir()?;
    let path = dir.join(format!("{host}.enc"));
    if !path.exists() {
        return Ok(None);
    }

    let encrypted = std::fs::read_to_string(&path)?;
    let store = CredentialStore::load()?;
    let master_key = store.master_key()?;
    let key_data = auth::decrypt_string(&encrypted, &master_key)?;
    Ok(Some(key_data))
}

/// Remove the SSH key for a host. Returns true if a key was removed.
pub fn remove_key(host: &str) -> Result<bool> {
    let dir = ssh_keys_dir()?;
    let path = dir.join(format!("{host}.enc"));
    if path.exists() {
        std::fs::remove_file(&path)?;
        Ok(true)
    } else {
        Ok(false)
    }
}

/// List all hosts that have SSH keys stored.
pub fn list_keys() -> Result<Vec<String>> {
    let dir = ssh_keys_dir()?;
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let mut hosts = Vec::new();
    for entry in std::fs::read_dir(&dir)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().to_string();
        if let Some(host) = name.strip_suffix(".enc") {
            hosts.push(host.to_string());
        }
    }
    hosts.sort();
    Ok(hosts)
}

/// Write the decrypted SSH key for a host to a temp file, returning the path.
/// The caller MUST delete this file with `shred_temp_key` after use.
pub fn write_key_to_temp(host: &str) -> Result<Option<PathBuf>> {
    let Some(key_data) = get_key(host)? else {
        return Ok(None);
    };

    let tmp_path = std::env::temp_dir().join(format!("rift-ssh-key-{host}-{}", std::process::id()));

    std::fs::write(&tmp_path, &key_data)
        .with_context(|| format!("write SSH key to {}", tmp_path.display()))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(&tmp_path)?.permissions();
        perms.set_mode(0o600);
        std::fs::set_permissions(&tmp_path, perms)?;
    }

    Ok(Some(tmp_path))
}

/// Securely delete a temp key file (overwrite with zeros, then remove).
pub fn shred_temp_key(path: &std::path::Path) -> Result<()> {
    if path.exists() {
        let len = std::fs::metadata(path)?.len() as usize;
        let zeros = vec![0u8; len];
        let _ = std::fs::write(path, &zeros);
        std::fs::remove_file(path)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ssh_key_encrypts_at_rest() {
        let tmp = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", tmp.path());
        std::env::remove_var("XDG_CONFIG_HOME");

        let fake_key = "-----BEGIN OPENSSH PRIVATE KEY-----\nfake_key_data_here\n-----END OPENSSH PRIVATE KEY-----\n";
        let key_file = tmp.path().join("id_test");
        std::fs::write(&key_file, fake_key).unwrap();

        add_key("test.example.com", &key_file).unwrap();

        // The stored file must NOT contain the plaintext key.
        let dir = ssh_keys_dir().unwrap();
        let stored = std::fs::read_to_string(dir.join("test.example.com.enc")).unwrap();
        assert!(!stored.contains("BEGIN OPENSSH PRIVATE KEY"));
        assert!(!stored.contains("fake_key_data_here"));

        // get_key should decrypt and return the original.
        let recovered = get_key("test.example.com").unwrap().unwrap();
        assert_eq!(recovered, fake_key);
    }

    #[test]
    fn test_ssh_key_roundtrip() {
        let tmp = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", tmp.path());
        std::env::remove_var("XDG_CONFIG_HOME");

        let key_data = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIfake test@host\n";
        let key_file = tmp.path().join("id_ed25519");
        std::fs::write(&key_file, key_data).unwrap();

        add_key("github.com", &key_file).unwrap();
        let recovered = get_key("github.com").unwrap().unwrap();
        assert_eq!(recovered, key_data);
    }

    #[test]
    fn test_remove_key() {
        let tmp = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", tmp.path());
        std::env::remove_var("XDG_CONFIG_HOME");

        let key_file = tmp.path().join("k");
        std::fs::write(&key_file, "fake key").unwrap();
        add_key("remove.example.com", &key_file).unwrap();

        assert!(remove_key("remove.example.com").unwrap());
        assert!(!remove_key("remove.example.com").unwrap());
    }

    #[test]
    fn test_list_keys() {
        let tmp = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", tmp.path());
        std::env::remove_var("XDG_CONFIG_HOME");

        let key_file = tmp.path().join("k");
        std::fs::write(&key_file, "fake").unwrap();
        add_key("zzz.example.com", &key_file).unwrap();
        add_key("aaa.example.com", &key_file).unwrap();

        let hosts = list_keys().unwrap();
        assert_eq!(hosts, vec!["aaa.example.com", "zzz.example.com"]);
    }
}
