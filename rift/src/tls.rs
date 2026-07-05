//! TLS support for rift-protocol — self-signed certs, TOFU fingerprint verification.
//!
//! When you run `rift serve --tls`, rift generates a self-signed certificate
//! (if none exists) and serves over HTTPS. The cert fingerprint is printed so
//! users on the other end can verify it with `--accept-fingerprint <hash>`
//! before cloning. This is TOFU (trust on first use) — same model as SSH.
//!
//! ## Files
//! - `~/.config/rift/cert.pem` — the self-signed certificate (public)
//! - `~/.config/rift/key.pem` — the private key (0600)

use anyhow::{Context, Result};
use std::path::PathBuf;

fn cert_paths() -> Result<(PathBuf, PathBuf)> {
    let base = if let Ok(xdg) = std::env::var("XDG_CONFIG_HOME") {
        PathBuf::from(xdg)
    } else if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home).join(".config")
    } else {
        return Err(anyhow::anyhow!("no HOME or XDG_CONFIG_HOME"));
    };
    let dir = base.join("rift");
    Ok((dir.join("cert.pem"), dir.join("key.pem")))
}

/// Generate a self-signed cert + private key, save to
/// `~/.config/rift/cert.pem` + `key.pem` (0600). Returns the BLAKE3 fingerprint
/// of the DER-encoded cert (hex). If files exist, just returns the fingerprint.
pub fn ensure_self_signed_cert() -> Result<String> {
    let (cert_path, key_path) = cert_paths()?;

    if cert_path.exists() && key_path.exists() {
        return cert_fingerprint(&cert_path);
    }

    // rcgen 0.13 API: CertificateParams::new(sans) + KeyPair::generate() + params.self_signed(&key)
    let mut params = rcgen::CertificateParams::new(vec!["rift".to_string()])
        .map_err(|e| anyhow::anyhow!("rcgen params: {e}"))?;
    params.distinguished_name = rcgen::DistinguishedName::new();
    params.distinguished_name.push(
        rcgen::DnType::CommonName,
        "rift self-signed",
    );

    let key_pair = rcgen::KeyPair::generate()
        .map_err(|e| anyhow::anyhow!("rcgen KeyPair::generate: {e}"))?;
    let cert = params
        .self_signed(&key_pair)
        .map_err(|e| anyhow::anyhow!("rcgen self_signed: {e}"))?;

    if let Some(parent) = cert_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // cert.pem = the certificate, key.pem = the private key
    std::fs::write(&cert_path, cert.pem())
        .with_context(|| format!("write {}", cert_path.display()))?;
    std::fs::write(&key_path, key_pair.serialize_pem())
        .with_context(|| format!("write {}", key_path.display()))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(&key_path)?.permissions();
        perms.set_mode(0o600);
        std::fs::set_permissions(&key_path, perms)?;
    }

    cert_fingerprint(&cert_path)
}

/// Compute the BLAKE3 fingerprint of a PEM cert file (hex).
pub fn cert_fingerprint(cert_path: &std::path::Path) -> Result<String> {
    let pem = std::fs::read_to_string(cert_path)?;
    let der = pem_to_der(&pem)?;
    let hash = blake3::hash(&der);
    Ok(hash.to_hex().to_string())
}

fn pem_to_der(pem: &str) -> Result<Vec<u8>> {
    let begin = "-----BEGIN CERTIFICATE-----";
    let end = "-----END CERTIFICATE-----";
    let start = pem
        .find(begin)
        .ok_or_else(|| anyhow::anyhow!("no BEGIN CERTIFICATE in PEM"))?
        + begin.len();
    let stop = pem
        .find(end)
        .ok_or_else(|| anyhow::anyhow!("no END CERTIFICATE in PEM"))?;
    let b64: String = pem[start..stop].chars().filter(|c| !c.is_whitespace()).collect();
    use base64::Engine;
    Ok(base64::engine::general_purpose::STANDARD.decode(b64)?)
}

/// Get the paths to the cert and key files (for passing to a TLS server).
pub fn cert_key_paths() -> Result<(PathBuf, PathBuf)> {
    cert_paths()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ensure_self_signed_cert_generates_and_returns_fingerprint() {
        let tmp = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", tmp.path());
        std::env::remove_var("XDG_CONFIG_HOME");

        let fp = ensure_self_signed_cert().unwrap();
        assert!(!fp.is_empty());
        assert_eq!(fp.len(), 64); // blake3 hex = 64 chars

        let fp2 = ensure_self_signed_cert().unwrap();
        assert_eq!(fp, fp2);
    }

    #[test]
    fn test_cert_fingerprint_is_deterministic() {
        let tmp = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", tmp.path());
        std::env::remove_var("XDG_CONFIG_HOME");

        let (cert_path, _) = cert_paths().unwrap();
        ensure_self_signed_cert().unwrap();
        let fp1 = cert_fingerprint(&cert_path).unwrap();
        let fp2 = cert_fingerprint(&cert_path).unwrap();
        assert_eq!(fp1, fp2);
    }
}
