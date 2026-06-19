"""
Security utilities for API key encryption and general security functions
"""
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from typing import Optional

from src.core.exceptions import EncryptionError


class EncryptionManager:
    """Manages encryption and decryption of sensitive data"""
    
    _instance: Optional['EncryptionManager'] = None
    _fernet: Optional[Fernet] = None
    
    def __new__(cls) -> 'EncryptionManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_fernet()
        return cls._instance
    
    def _init_fernet(self) -> None:
        """Initialize Fernet with encryption key from environment"""
        encryption_key = os.getenv("GENZSMART_ENCRYPTION_KEY")
        
        if not encryption_key:
            # Generate a key for development (not recommended for production)
            import secrets
            encryption_key = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()
            os.environ["GENZSMART_ENCRYPTION_KEY"] = encryption_key
        
        try:
            # Ensure key is properly formatted for Fernet (32 bytes, base64 encoded)
            key_bytes = encryption_key.encode() if isinstance(encryption_key, str) else encryption_key
            try:
                decoded = base64.urlsafe_b64decode(key_bytes + b'=' * (-len(key_bytes) % 4))
                if len(decoded) == 32:
                    key = key_bytes
                else:
                    raise ValueError("Invalid key length")
            except Exception:
                # Derive a proper key using PBKDF2
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=b'genzsmart_salt_v1',  # In production, use a random salt stored securely
                    iterations=100000,
                )
                key = base64.urlsafe_b64encode(kdf.derive(key_bytes))
            
            self._fernet = Fernet(key)
        except Exception as e:
            raise EncryptionError(f"Failed to initialize encryption: {str(e)}")
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt a string value
        
        Args:
            plaintext: The string to encrypt
            
        Returns:
            Base64 encoded encrypted string
        """
        if not plaintext:
            return ""
        
        if self._fernet is None:
            raise EncryptionError("Encryption not initialized")
        
        try:
            encrypted = self._fernet.encrypt(plaintext.encode())
            return encrypted.decode()
        except Exception as e:
            raise EncryptionError(f"Encryption failed: {str(e)}")
    
    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt an encrypted string
        
        Args:
            ciphertext: The encrypted string (base64 encoded)
            
        Returns:
            Decrypted plaintext string
        """
        if not ciphertext:
            return ""
        
        if self._fernet is None:
            raise EncryptionError("Encryption not initialized")
        
        try:
            decrypted = self._fernet.decrypt(ciphertext.encode())
            return decrypted.decode()
        except Exception as e:
            raise EncryptionError(f"Decryption failed: {str(e)}")
    
    def mask_api_key(self, api_key: str) -> str:
        """
        Mask an API key for display (show only last 4 characters)
        
        Args:
            api_key: The API key to mask
            
        Returns:
            Masked API key (e.g., "sk-****1234")
        """
        if not api_key:
            return ""
        
        if len(api_key) <= 8:
            return "****"
        
        return f"{api_key[:4]}****{api_key[-4:]}"


# Global encryption manager instance
encryption_manager = EncryptionManager()


def get_encryption_manager() -> EncryptionManager:
    """Get the global encryption manager instance"""
    return encryption_manager
