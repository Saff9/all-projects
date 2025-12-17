import os
import hashlib
from typing import Tuple, Generator
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

# 600,000 iterations for robust brute-force resistance (OWASP 2023+ recommendation)
KDF_ITERATIONS = 600_000
KEY_SIZE_BYTES = 32  # 256-bit AES
NONCE_SIZE_BYTES = 12  # Standard GCM 96-bit nonce
CHUNK_ENCRYPTION_SIZE = 64 * 1024 * 1024  # 64MB streaming chunk size


def generate_salt() -> bytes:
    """Generate a cryptographically secure 16-byte salt."""
    return os.urandom(16)


def derive_key(master_password: str, salt: bytes) -> bytes:
    """
    Derive a 256-bit encryption key from master password using PBKDF2-HMAC-SHA256.
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_SIZE_BYTES,
        salt=salt,
        iterations=KDF_ITERATIONS,
        backend=default_backend(),
    )
    return kdf.derive(master_password.encode("utf-8"))


def hash_master_password(master_password: str, salt: bytes) -> str:
    """
    Create a deterministic verification hash for local unlock validation.
    """
    derived = derive_key(master_password, salt)
    return hashlib.sha256(derived).hexdigest()


def encrypt_data(data: bytes, key: bytes, associated_data: bytes = None) -> bytes:
    """
    Encrypt data with AES-256-GCM.
    Returns: nonce (12 bytes) + ciphertext (includes 16-byte authentication tag).
    """
    aesgcm = AESGCM(key)
    nonce = os.urandom(NONCE_SIZE_BYTES)
    ciphertext = aesgcm.encrypt(nonce, data, associated_data)
    return nonce + ciphertext


def decrypt_data(encrypted_data: bytes, key: bytes, associated_data: bytes = None) -> bytes:
    """
    Decrypt AES-256-GCM payload (nonce + ciphertext).
    Raises cryptography.exceptions.InvalidTag if authentication fails (wrong password or tampered).
    """
    if len(encrypted_data) < NONCE_SIZE_BYTES + 16:
        raise ValueError("Encrypted data is too short to be valid AES-GCM payload.")
    
    nonce = encrypted_data[:NONCE_SIZE_BYTES]
    ciphertext = encrypted_data[NONCE_SIZE_BYTES:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, associated_data)


def encrypt_file_chunk(
    chunk_bytes: bytes,
    key: bytes,
    chunk_index: int,
    file_id: str
) -> bytes:
    """
    Encrypt a file chunk binding it cryptographically to file_id and chunk_index.
    Prevents chunk-swapping or reordering attacks.
    """
    associated_data = f"{file_id}:{chunk_index}".encode("utf-8")
    return encrypt_data(chunk_bytes, key, associated_data)


def decrypt_file_chunk(
    encrypted_chunk: bytes,
    key: bytes,
    chunk_index: int,
    file_id: str
) -> bytes:
    """
    Decrypt and authenticate a file chunk.
    """
    associated_data = f"{file_id}:{chunk_index}".encode("utf-8")
    return decrypt_data(encrypted_chunk, key, associated_data)
