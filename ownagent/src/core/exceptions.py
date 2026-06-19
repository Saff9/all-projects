"""
Custom exceptions for Apex Smart API
"""
from typing import Optional


class ApexSmartException(Exception):
    """Base exception for Apex Smart"""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ProviderError(ApexSmartException):
    """AI Provider related errors"""
    def __init__(self, message: str, provider: Optional[str] = None):
        self.provider = provider
        super().__init__(message, code="PROVIDER_ERROR")


class ProviderNotConfiguredError(ProviderError):
    """Provider API key not configured"""
    def __init__(self, provider: str):
        super().__init__(
            f"Provider '{provider}' is not configured. Please set the API key.",
            provider=provider
        )
        self.code = "PROVIDER_NOT_CONFIGURED"


class ProviderUnavailableError(ProviderError):
    """Provider API is unavailable"""
    def __init__(self, provider: str, details: Optional[str] = None):
        msg = f"Provider '{provider}' is currently unavailable"
        if details:
            msg += f": {details}"
        super().__init__(msg, provider=provider)
        self.code = "PROVIDER_UNAVAILABLE"


class RateLimitError(ProviderError):
    """Rate limit exceeded"""
    def __init__(self, provider: str, retry_after: Optional[int] = None):
        self.retry_after = retry_after
        super().__init__(
            f"Rate limit exceeded for provider '{provider}'",
            provider=provider
        )
        self.code = "RATE_LIMIT_EXCEEDED"


class ValidationError(ApexSmartException):
    """Input validation error"""
    def __init__(self, message: str, field: Optional[str] = None):
        self.field = field
        super().__init__(message, code="VALIDATION_ERROR")


class NotFoundError(ApexSmartException):
    """Resource not found"""
    def __init__(self, resource: str, identifier: Optional[str] = None):
        msg = f"{resource} not found"
        if identifier:
            msg += f": {identifier}"
        super().__init__(msg, code="NOT_FOUND")


class FileError(ApexSmartException):
    """File processing error"""
    def __init__(self, message: str, filename: Optional[str] = None):
        self.filename = filename
        super().__init__(message, code="FILE_ERROR")


class SecurityError(ApexSmartException):
    """Security related errors"""
    def __init__(self, message: str):
        super().__init__(message, code="SECURITY_ERROR")


class EncryptionError(SecurityError):
    """Encryption/decryption error"""
    def __init__(self, message: str = "Failed to encrypt/decrypt data"):
        super().__init__(message)
        self.code = "ENCRYPTION_ERROR"
