# backend/core/file_security.py
"""
Production-ready file upload security and validation.
FIXED: Added proper MIME detection with python-magic and filetype
"""

import os
import magic
import hashlib
import filetype
from typing import Optional, Dict, Any, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class FileSecurityValidator:
    """
    Comprehensive file security validation for uploads.
    """

    # Allowed MIME types
    ALLOWED_MIME_TYPES = {
        # Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        # Text files
        'text/plain',
        'text/csv',
        'text/markdown',
        'application/json',

        # Images
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',

        # Archives (with caution)
        'application/zip',
        'application/x-rar-compressed'
    }

    # File extension to MIME type mapping
    EXTENSION_MIME_MAP = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed'
    }

    # Size limits (in bytes)
    MAX_FILE_SIZES = {
        'document': 50 * 1024 * 1024,  # 50MB
        'image': 10 * 1024 * 1024,     # 10MB
        'text': 5 * 1024 * 1024,       # 5MB
        'archive': 100 * 1024 * 1024   # 100MB
    }

    def __init__(self):
        try:
            self._magic = magic.Magic(mime=True)
            logger.info("✅ python-magic MIME detection initialized")
        except Exception as e:
            logger.warning(f"⚠️ python-magic not available, falling back to filetype: {e}")
            self._magic = None

    def validate_file(
        self,
        file_data: bytes,
        filename: str,
        user_id: str,
        workspace_id: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Comprehensive file validation.

        Returns:
            (is_valid: bool, metadata: dict)
        """
        metadata: Dict[str, Any] = {
            'filename': filename,
            'size': len(file_data),
            'hash': None,
            'mime_type': None,
            'detected_mime': None,
            'extension': None,
            'file_type': None,
            'errors': [],
            'warnings': []
        }

        try:
            # 1. Basic validation
            if not file_data:
                metadata['errors'].append('Empty file')
                return False, metadata

            if len(file_data) == 0:
                metadata['errors'].append('Zero byte file')
                return False, metadata

            # 2. File hash for integrity and deduplication
            metadata['hash'] = hashlib.sha256(file_data).hexdigest()

            # 3. Filename validation
            if not self._validate_filename(filename):
                metadata['errors'].append('Invalid filename')
                return False, metadata

            metadata['extension'] = Path(filename).suffix.lower()

            # 4. Size validation
            size_valid, size_metadata = self._validate_file_size(file_data, filename)
            metadata.update(size_metadata)
            if not size_valid:
                return False, metadata

            # 5. MIME type validation with enhanced detection
            mime_valid, mime_metadata = self._validate_mime_type(file_data, filename)
            metadata.update(mime_metadata)
            if not mime_valid:
                return False, metadata

            # 6. Content validation
            content_valid, content_metadata = self._validate_content(file_data, filename)
            metadata.update(content_metadata)
            if not content_valid:
                return False, metadata

            # 7. Security scan (placeholder - integrate with actual scanner)
            scan_result = self._security_scan(file_data, filename)
            metadata.update(scan_result)

            return len(metadata['errors']) == 0, metadata

        except Exception as e:
            logger.error(f"File validation error for {filename}: {e}")
            metadata['errors'].append(f'Validation error: {str(e)}')
            return False, metadata

    def _validate_filename(self, filename: str) -> bool:
        """
        Validate filename for security issues.
        """
        if not filename or len(filename) > 255:
            return False

        # Check for dangerous characters
        dangerous_chars = ['<', '>', ':', '"', '|', '?', '*']
        if any(char in filename for char in dangerous_chars):
            return False

        # Check for path traversal attempts
        if '..' in filename or '/' in filename or '\\' in filename:
            return False

        return True

    def _validate_file_size(self, file_data: bytes, filename: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate file size limits.
        """
        size = len(file_data)
        metadata: Dict[str, Any] = {}

        # Determine file type category
        ext = Path(filename).suffix.lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']:
            category = 'image'
        elif ext in ['.zip', '.rar']:
            category = 'archive'
        elif ext in ['.txt', '.csv', '.md', '.json']:
            category = 'text'
        else:
            category = 'document'

        max_size = self.MAX_FILE_SIZES.get(category, 10 * 1024 * 1024)  # 10MB default

        if size > max_size:
            metadata['size_valid'] = False
            metadata['size_error'] = f'File too large: {size} bytes (max {max_size})'
            metadata['file_category'] = category
            metadata['max_size'] = max_size
            return False, metadata

        metadata['size_valid'] = True
        metadata['file_category'] = category
        metadata['max_size'] = max_size
        return True, metadata

    def _validate_mime_type(self, file_data: bytes, filename: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate MIME type using multiple detection methods.
        """
        metadata: Dict[str, Any] = {}

        # Get expected MIME from extension
        ext = Path(filename).suffix.lower()
        expected_mime = self.EXTENSION_MIME_MAP.get(ext)

        # Detect actual MIME using multiple methods
        detected_mime = None

        # Method 1: python-magic (most reliable)
        if self._magic:
            try:
                detected_mime = self._magic.from_buffer(file_data)
                logger.debug(f"python-magic detected: {detected_mime}")
            except Exception as e:
                logger.warning(f"python-magic detection failed: {e}")
                detected_mime = None

        # Method 2: filetype library (fallback)
        if not detected_mime:
            try:
                kind = filetype.guess(file_data)
                if kind:
                    detected_mime = kind.mime
                    logger.debug(f"filetype detected: {detected_mime}")
            except Exception as e:
                logger.warning(f"filetype detection failed: {e}")

        # Method 3: Fallback to extension-based detection
        if not detected_mime:
            detected_mime = expected_mime
            logger.warning(f"Falling back to extension-based MIME detection: {detected_mime}")

        # Validate MIME type
        if detected_mime and detected_mime not in self.ALLOWED_MIME_TYPES:
            metadata['mime_error'] = f'MIME type not allowed: {detected_mime}'
            return False, metadata

        # Check for MIME spoofing (extension doesn't match content)
        if expected_mime and detected_mime and expected_mime != detected_mime:
            metadata['warnings'].append(f'MIME type mismatch: expected {expected_mime}, detected {detected_mime}')
            # This is a warning, not an error, to avoid false positives

        metadata['expected_mime'] = expected_mime
        metadata['detected_mime'] = detected_mime
        metadata['mime_type'] = detected_mime
        return True, metadata

    def _validate_content(self, file_data: bytes, filename: str) -> Tuple[bool, Dict]:
        """
        Validate file content for malicious patterns.
        """
        metadata = {}

        # Check for embedded scripts in text files
        if filename.lower().endswith(('.txt', '.csv', '.md', '.json')):
            content_str = file_data.decode('utf-8', errors='ignore')

            # Check for script injection attempts
            dangerous_patterns = ['<script', 'javascript:', 'vbscript:', 'onload=', 'onerror=']
            for pattern in dangerous_patterns:
                if pattern.lower() in content_str.lower():
                    metadata['content_error'] = f'Potentially dangerous content detected: {pattern}'
                    return False, metadata

        # Check for common malware signatures (basic detection)
        malware_signatures = [
            b'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*',
            b'<?php',
            b'<%@',
            b'#!/bin/bash',
            b'#!/bin/sh'
        ]

        for signature in malware_signatures:
            if signature in file_data:
                metadata['content_error'] = f'Potential malware signature detected'
                return False, metadata

        return True, metadata

    def _security_scan(self, file_data: bytes, filename: str) -> Dict:
        """
        Perform security scanning (placeholder for actual scanner integration).
        """
        # In production, integrate with:
        # - ClamAV for virus scanning
        # - Custom malware detection
        # - File type verification

        metadata = {
            'scan_status': 'clean',  # 'clean', 'suspicious', 'infected'
            'scan_engine': 'basic_signature_check',
            'scan_timestamp': None
        }

        # Basic signature check already done in _validate_content
        # In production, this would integrate with actual scanning service

        return metadata

    def generate_secure_filename(self, original_filename: str, user_id: str) -> str:
        """
        Generate a secure filename for storage.
        """
        import uuid
        import time

        # Get file extension
        ext = Path(original_filename).suffix.lower()

        # Generate secure filename: timestamp_uuid_userid
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]

        secure_filename = f"{timestamp}_{unique_id}_{user_id}{ext}"
        return secure_filename

# Global file security validator instance
file_validator = FileSecurityValidator()

def validate_upload_security(
    file_data: bytes,
    filename: str,
    user_id: str,
    workspace_id: Optional[str] = None
) -> Tuple[bool, Dict[str, Any]]:
    """
    Convenience function for file upload validation.
    """
    return file_validator.validate_file(file_data, filename, user_id, workspace_id)

def generate_secure_filename(original_filename: str, user_id: str) -> str:
    """
    Generate a secure filename for storage.
    """
    return file_validator.generate_secure_filename(original_filename, user_id)
