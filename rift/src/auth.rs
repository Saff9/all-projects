//! Credential store — encrypts GitHub/GitLab access tokens at rest with
//! AES-256-GCM so that a leaked `~/.config/rift/credentials` file is useless
//! without the master key.
//!
//! ## Design (v1.0)
//! - Master key: 32 random bytes from `OsRng`, stored in
//!   `~/.config/rift/master.key` with `0600` perms. Generated on first use.
//! - Credentials file: JSON with a `sealed: bool` flag. When `sealed == true`
//!   (v1.0), the `token` field of each credential is base64-encoded
//!   `nonce[12] || ciphertext || tag[16]`. The `host`, `user`, `saved_at`
//!   fields stay plaintext.
//! - Backwards-compat: if `sealed == false` (legacy v0.9 plaintext tokens),
//!   `load()` auto-migrates: encrypts every token and rewrites the file with
//!   `sealed: true`.
//! - In memory, `Credential::token` always holds the plaintext token. The
//!   `Zeroize` derive macro wipes it from memory when the credential is
//!   dropped.
//! - `redact_url()` replaces `token@` with `***@` for safe logging.
//!
//! ## Commands
//! - `rift auth login <host> --token <PAT>` — save a token for a host
//! - `rift auth list` — show which hosts have credentials (token masked)
//! - `rift auth logout <host>` — remove credentials for a host
//! - `rift auth show <host>` — show the full credential entry

use crate::error::{RiftContext, RiftError};
use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use rand::rngs::OsRng;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use zeroize::Zeroize;

/// AES-256-GCM key length (256 bits).
const KEY_LEN: usize = 32;
/// AES-GCM nonce length (96 bits).
const NONCE_LEN: usize = 12;

/// One saved credential entry. The `token` field is zeroized on drop.
#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
pub struct Credential {
    /// The host, e.g. `github.com`, `gitlab.com`. Plaintext — not secret.
    #[zeroize(skip)]
    pub host: String,
    /// Personal Access Token (PAT). In memory this is plaintext; on disk it
    /// is base64-encoded `nonce || ciphertext || tag`.
    pub token: String,
    /// Username (optional, inferred from the API if absent). Plaintext.
    #[zeroize(skip)]
    pub user: Option<String>,
    /// Unix timestamp when the credential was saved. Plaintext.
    #[zeroize(skip)]
    pub saved_at: i64,
}

/// The credential store — a map of host → credential plus a `sealed` flag.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CredentialStore {
    /// `true` if tokens are encrypted on disk (v1.0). `false` for legacy
    /// v0.9 plaintext files. Defaults to `false` if missing during
    /// deserialization, which triggers auto-migration on the next save.
    #[serde(default)]
    pub sealed: bool,
    /// Map of host → credential.
    pub credentials: BTreeMap<String, Credential>,
}

impl CredentialStore {
    /// Load from the default path (`~/.config/rift/credentials`).
    ///
    /// If `sealed == false` on disk (legacy v0.9), auto-migrates: encrypts
    /// every token and rewrites the file with `sealed: true`.
    ///
    /// # Errors
    /// Returns `RiftError::Io` if the file exists but can't be read,
    /// `RiftError::Parse` if it can't be deserialized, or `RiftError::Crypto`
    /// if decryption fails.
    pub fn load() -> Result<Self, RiftError> {
        let path = credentials_path()?;
        Self::load_from(&path)
    }

    /// Load from a specific path. Used by `load()` and by tests.
    ///
    /// # Errors
    /// See [`CredentialStore::load`].
    pub fn load_from(path: &Path) -> Result<Self, RiftError> {
        let raw = match std::fs::read_to_string(path) {
            Ok(s) => s,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                return Ok(Self::default());
            }
            Err(e) => return Err(RiftError::Io(e)),
        };
        let mut store: Self =
            serde_json::from_str(&raw).ctx(format!("parse credentials at {}", path.display()))?;

        if store.sealed {
            // Decrypt every token in memory.
            let key_path = master_key_path_for(path);
            let key = load_master_key_from(&key_path)
                .ctx("load master key to decrypt credentials")?;
            for cred in store.credentials.values_mut() {
                let plaintext = decrypt(&key, &cred.token)
                    .ctx(format!("decrypt token for host '{}'", cred.host))?;
                cred.token = String::from_utf8(plaintext)
                    .map_err(|e| RiftError::Crypto(format!("decrypted token is not valid UTF-8: {e}")))?;
            }
        } else {
            // Legacy plaintext — auto-migrate.
            store.sealed = true;
            store.save_to(path)?;
        }
        Ok(store)
    }

    /// Save to the default path with `0600` perms. Encrypts every token
    /// before writing.
    ///
    /// # Errors
    /// Returns `RiftError::Io` for filesystem failures or
    /// `RiftError::Crypto` for encryption failures.
    pub fn save(&self) -> Result<(), RiftError> {
        let path = credentials_path()?;
        self.save_to(&path)
    }

    /// Save to a specific path. Used by `save()` and by tests.
    ///
    /// # Errors
    /// See [`CredentialStore::save`].
    pub fn save_to(&self, path: &Path) -> Result<(), RiftError> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .ctx(format!("create config dir {}", parent.display()))?;
        }

        // Get or create the master key.
        let key_path = master_key_path_for(path);
        let key = load_or_create_master_key_from(&key_path)?;

        // Encrypt every token. We clone so the in-memory store retains the
        // plaintext (the on-disk clone gets the ciphertext).
        let mut sealed_store = self.clone();
        for cred in sealed_store.credentials.values_mut() {
            let ciphertext =
                encrypt(&key, cred.token.as_bytes()).ctx("encrypt credential token")?;
            cred.token = ciphertext;
        }
        sealed_store.sealed = true;

        let json = serde_json::to_string_pretty(&sealed_store)?;
        std::fs::write(path, json.as_bytes())
            .ctx(format!("write credentials to {}", path.display()))?;

        // Restrict to owner on Unix.
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(path)
                .ctx(format!("stat credentials {}", path.display()))?
                .permissions();
            perms.set_mode(0o600);
            std::fs::set_permissions(path, perms)
                .ctx(format!("chmod 0600 credentials {}", path.display()))?;
        }
        Ok(())
    }

    /// Add or update a credential for a host.
    pub fn upsert(&mut self, host: &str, token: &str, user: Option<&str>) {
        self.credentials.insert(
            host.to_string(),
            Credential {
                host: host.to_string(),
                token: token.to_string(),
                user: user.map(String::from),
                saved_at: chrono::Utc::now().timestamp(),
            },
        );
    }

    /// Remove credentials for a host. Returns `true` if something was removed.
    #[must_use]
    pub fn remove(&mut self, host: &str) -> bool {
        self.credentials.remove(host).is_some()
    }

    /// Look up credentials for a host.
    #[must_use]
    pub fn get(&self, host: &str) -> Option<&Credential> {
        self.credentials.get(host)
    }

    /// Iterate all credentials.
    #[must_use]
    pub fn list(&self) -> Vec<&Credential> {
        self.credentials.values().collect()
    }

    /// Load the 32-byte master key from `~/.config/rift/master.key`.
    /// Creates it (CSPRNG) if it doesn't exist yet. Used by `ssh_keys`
    /// to encrypt/decrypt SSH private keys with the same key as PATs.
    pub fn master_key(&self) -> anyhow::Result<[u8; KEY_LEN]> {
        let path = credentials_path()?;
        let key_path = master_key_path_for(&path);
        load_or_create_master_key_from(&key_path)
            .map_err(|e| anyhow::anyhow!("{e}"))
    }
}

// ---------- Encryption helpers ----------

/// Encrypt `plaintext` with AES-256-GCM under `key`. Returns base64 of
/// `nonce[12] || ciphertext || tag[16]`.
///
/// # Errors
/// Returns `RiftError::Crypto` if AES-GCM encryption fails (extremely
/// unlikely — only on RNG failure or invalid key length).
pub fn encrypt(key: &[u8; KEY_LEN], plaintext: &[u8]) -> Result<String, RiftError> {
    let mut nonce_bytes = [0u8; NONCE_LEN];
    OsRng.fill_bytes(&mut nonce_bytes);

    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| RiftError::Crypto(format!("aes-gcm encrypt: {e}")))?;

    // ciphertext already includes the 16-byte tag appended.
    let mut out = Vec::with_capacity(NONCE_LEN + ciphertext.len());
    out.extend_from_slice(&nonce_bytes);
    out.extend_from_slice(&ciphertext);
    Ok(B64.encode(&out))
}

/// Convenience: encrypt a String and return the sealed base64 string.
/// Used by `ssh_keys` to store SSH private keys with the same crypto as PATs.
pub fn encrypt_string(plaintext: &str, key: &[u8; KEY_LEN]) -> anyhow::Result<String> {
    encrypt(key, plaintext.as_bytes()).map_err(|e| anyhow::anyhow!("{e}"))
}

/// Convenience: decrypt a sealed base64 string back to a String.
/// Used by `ssh_keys` to load SSH private keys.
pub fn decrypt_string(sealed: &str, key: &[u8; KEY_LEN]) -> anyhow::Result<String> {
    let bytes = decrypt(key, sealed).map_err(|e| anyhow::anyhow!("{e}"))?;
    String::from_utf8(bytes).map_err(|e| anyhow::anyhow!("decrypted data is not valid UTF-8: {e}"))
}

/// Decrypt a base64 `nonce || ciphertext || tag` blob produced by
/// [`encrypt`]. Returns the plaintext bytes.
///
/// # Errors
/// Returns `RiftError::Crypto` on base64 decode failure, malformed input,
/// or AES-GCM authentication failure (wrong key / tampered ciphertext).
pub fn decrypt(key: &[u8; KEY_LEN], sealed: &str) -> Result<Vec<u8>, RiftError> {
    let raw = B64
        .decode(sealed)
        .map_err(|e| RiftError::Crypto(format!("base64 decode token: {e}")))?;
    if raw.len() < NONCE_LEN + 16 {
        return Err(RiftError::Crypto(format!(
            "sealed token too short: {} bytes (need at least {})",
            raw.len(),
            NONCE_LEN + 16
        )));
    }
    let nonce = Nonce::from_slice(&raw[..NONCE_LEN]);
    let ciphertext = &raw[NONCE_LEN..];
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| RiftError::Crypto(format!("aes-gcm decrypt: {e}")))
}

// ---------- Master key management ----------

/// Path to the master key file: sibling of the credentials file.
fn master_key_path_for(credentials_path: &Path) -> PathBuf {
    credentials_path
        .parent()
        .unwrap_or_else(|| Path::new("."))
        .join("master.key")
}

/// Load the 32-byte master key from `path`. Returns `RiftError::NotFound`
/// if the file doesn't exist yet.
fn load_master_key_from(path: &Path) -> Result<[u8; KEY_LEN], RiftError> {
    let bytes = std::fs::read(path).ctx(format!("read master key {}", path.display()))?;
    if bytes.len() != KEY_LEN {
        return Err(RiftError::Crypto(format!(
            "master key at {} is {} bytes (expected {}); delete it to regenerate",
            path.display(),
            bytes.len(),
            KEY_LEN
        )));
    }
    let mut key = [0u8; KEY_LEN];
    key.copy_from_slice(&bytes);
    Ok(key)
}

/// Load the 32-byte master key, or generate + persist a new one if it
/// doesn't exist yet. Perms are set to `0600` on Unix.
fn load_or_create_master_key_from(path: &Path) -> Result<[u8; KEY_LEN], RiftError> {
    if let Ok(key) = load_master_key_from(path) {
        return Ok(key);
    }
    // Generate a fresh key.
    let mut key = [0u8; KEY_LEN];
    OsRng.fill_bytes(&mut key);

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).ctx(format!("create master key dir {}", parent.display()))?;
    }
    std::fs::write(path, &key).ctx(format!("write master key {}", path.display()))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(path)
            .ctx(format!("stat master key {}", path.display()))?
            .permissions();
        perms.set_mode(0o600);
        std::fs::set_permissions(path, perms)
            .ctx(format!("chmod 0600 master key {}", path.display()))?;
    }
    Ok(key)
}

// ---------- Path resolution ----------

/// Path to the credentials file: `~/.config/rift/credentials`.
/// Respects `$XDG_CONFIG_HOME` if set; otherwise `~/.config`.
///
/// # Errors
/// Returns `RiftError::Other` if neither `XDG_CONFIG_HOME` nor `HOME` is set.
pub fn credentials_path() -> Result<PathBuf, RiftError> {
    let base = if let Ok(xdg) = std::env::var("XDG_CONFIG_HOME") {
        PathBuf::from(xdg)
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home).join(".config")
    } else {
        return Err(RiftError::Other(
            "no HOME or XDG_CONFIG_HOME — cannot locate config dir".to_string(),
        ));
    };
    Ok(base.join("rift").join("credentials"))
}

// ---------- URL helpers ----------

/// Extract the host from a git URL.
/// - `https://github.com/user/repo.git` → `github.com`
/// - `git@gitlab.com:user/repo.git`     → `gitlab.com`
/// - `http://localhost:3030`             → `localhost:3030`
/// - `https://user:pass@bitbucket.org/u/r.git` → `bitbucket.org`
#[must_use]
pub fn host_from_url(url: &str) -> String {
    // SSH form: git@host:path
    if let Some(rest) = url.strip_prefix("git@") {
        if let Some((host, _)) = rest.split_once(':') {
            return host.to_string();
        }
        return rest.to_string();
    }
    // HTTP(S) form: scheme://[user:pass@]host[:port]/path
    if let Some(after_scheme) = url.split("://").nth(1) {
        // Authority ends at the first '/' (start of the path).
        let auth_end = after_scheme.find('/').unwrap_or(after_scheme.len());
        let authority = &after_scheme[..auth_end];
        // authority may be "user:pass@host" — take the last segment after '@'
        if let Some(idx) = authority.rfind('@') {
            return authority[idx + 1..].to_string();
        }
        return authority.to_string();
    }
    // Fallback: treat the whole thing as a host.
    url.to_string()
}

/// Inject credentials into a git URL so `git push`/`pull` authenticates
/// without prompting. Returns the URL with `https://<token>@host/...`.
/// If no credential is stored for the host, returns the URL unchanged.
#[must_use]
pub fn inject_credentials(url: &str, store: &CredentialStore) -> String {
    let host = host_from_url(url);
    let Some(cred) = store.get(&host) else {
        return url.to_string();
    };
    // Only HTTPS URLs can carry an inline token.
    if let Some(rest) = url.strip_prefix("https://") {
        return format!("https://{}@{}", cred.token, rest);
    }
    if let Some(rest) = url.strip_prefix("http://") {
        return format!("http://{}@{}", cred.token, rest);
    }
    // SSH URLs: convert to https with token (works for GitHub/GitLab).
    if url.starts_with("git@") {
        if let Some(rest) = url.strip_prefix("git@") {
            if let Some((host, path)) = rest.split_once(':') {
                return format!("https://{}@{}/{}", cred.token, host, path);
            }
        }
    }
    url.to_string()
}

/// Replace `://<token>@` with `://***@` in a URL, for safe logging.
/// Returns the URL unchanged if it has no inline credentials.
///
/// # Example
/// ```ignore
/// use rift::auth::redact_url;
/// assert_eq!(
///     redact_url("https://ghp_secret@github.com/user/repo.git"),
///     "https://***@github.com/user/repo.git",
/// );
/// ```
#[must_use]
pub fn redact_url(url: &str) -> String {
    if let Some(scheme_end) = url.find("://").map(|i| i + 3) {
        if let Some(at) = url[scheme_end..].find('@') {
            let at_pos = scheme_end + at;
            let before = &url[..scheme_end];
            let after = &url[at_pos + 1..];
            return format!("{before}***@{after}");
        }
    }
    url.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    /// Make a fresh tempdir and return the credentials path inside it.
    fn temp_creds_path() -> (TempDir, PathBuf) {
        let dir = TempDir::new().expect("tempdir");
        let path = dir.path().join("credentials");
        (dir, path)
    }

    #[test]
    fn test_host_from_url() {
        assert_eq!(host_from_url("https://github.com/user/repo.git"), "github.com");
        assert_eq!(host_from_url("git@gitlab.com:user/repo.git"), "gitlab.com");
        assert_eq!(host_from_url("http://localhost:3030"), "localhost:3030");
        assert_eq!(
            host_from_url("https://user:pass@bitbucket.org/u/r.git"),
            "bitbucket.org"
        );
    }

    #[test]
    fn test_inject_credentials_https() {
        let mut store = CredentialStore::default();
        store.upsert("github.com", "ghp_abc123", None);
        let url = inject_credentials("https://github.com/user/repo.git", &store);
        assert_eq!(url, "https://ghp_abc123@github.com/user/repo.git");
    }

    #[test]
    fn test_inject_credentials_ssh_to_https() {
        let mut store = CredentialStore::default();
        store.upsert("gitlab.com", "glpat-xyz", None);
        let url = inject_credentials("git@gitlab.com:user/repo.git", &store);
        assert_eq!(url, "https://glpat-xyz@gitlab.com/user/repo.git");
    }

    #[test]
    fn test_redact_url() {
        assert_eq!(
            redact_url("https://ghp_secret@github.com/user/repo.git"),
            "https://***@github.com/user/repo.git"
        );
        // No credentials — returned unchanged.
        assert_eq!(
            redact_url("https://github.com/user/repo.git"),
            "https://github.com/user/repo.git"
        );
        // http scheme, with port.
        assert_eq!(
            redact_url("http://tok@host.local:3030/repo"),
            "http://***@host.local:3030/repo"
        );
    }

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let key = [0x42u8; 32];
        let plaintext = "ghp_test123fake";
        let sealed = encrypt(&key, plaintext.as_bytes()).expect("encrypt");
        let decrypted = decrypt(&key, &sealed).expect("decrypt");
        assert_eq!(decrypted, plaintext.as_bytes());
    }

    #[test]
    fn test_wrong_master_key_fails() {
        let key_a = [0x01u8; 32];
        let key_b = [0x02u8; 32];
        let plaintext = "ghp_test123fake";
        let sealed = encrypt(&key_a, plaintext.as_bytes()).expect("encrypt");
        assert!(decrypt(&key_b, &sealed).is_err());
    }

    #[test]
    fn test_credentials_file_is_encrypted_on_disk() {
        let (_dir, path) = temp_creds_path();
        let mut store = CredentialStore::default();
        store.upsert("github.com", "ghp_test123fake", Some("octocat"));
        store.save_to(&path).expect("save");

        // The token must NOT appear in the raw file bytes.
        let raw = std::fs::read_to_string(&path).expect("read file");
        assert!(
            !raw.contains("ghp_test123fake"),
            "plaintext token leaked to disk: {raw}"
        );
        // The host + user + sealed flag ARE present (they're not secret).
        assert!(raw.contains("github.com"));
        assert!(raw.contains("octocat"));
        assert!(raw.contains("\"sealed\": true"));
    }

    #[test]
    fn test_migration_from_plaintext() {
        let (_dir, path) = temp_creds_path();
        // Write a legacy plaintext file (v0.9 format, no `sealed` field).
        let legacy = serde_json::json!({
            "credentials": {
                "github.com": {
                    "host": "github.com",
                    "token": "ghp_legacy_plaintext",
                    "user": "octocat",
                    "saved_at": 1_700_000_000
                }
            }
        });
        std::fs::write(&path, legacy.to_string()).expect("write legacy");

        // Load — should auto-migrate.
        let store = CredentialStore::load_from(&path).expect("load");
        // In memory, the token is plaintext.
        assert_eq!(store.get("github.com").expect("cred").token, "ghp_legacy_plaintext");
        assert!(store.sealed);

        // On disk now: sealed == true, token is encrypted, plaintext gone.
        let raw = std::fs::read_to_string(&path).expect("read migrated");
        assert!(raw.contains("\"sealed\": true"));
        assert!(
            !raw.contains("ghp_legacy_plaintext"),
            "plaintext token not migrated: {raw}"
        );

        // A second load should decrypt and give back the plaintext token.
        let store2 = CredentialStore::load_from(&path).expect("reload");
        assert_eq!(
            store2.get("github.com").expect("cred").token,
            "ghp_legacy_plaintext"
        );
    }
}
