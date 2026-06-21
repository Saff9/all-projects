"""
File parsers module for Apex Smart
Provides text extraction from various file formats
"""
from typing import Dict, Type, Optional, Any
from pathlib import Path

# Import parsers
from src.services.files.parsers.pdf import PDFParser
from src.services.files.parsers.docx import DocxParser
from src.services.files.parsers.image import ImageParser
from src.services.files.parsers.code import CodeParser

# Registry of file parsers
PARSERS: Dict[str, Type] = {
    ".pdf": PDFParser,
    ".docx": DocxParser,
    ".png": ImageParser,
    ".jpg": ImageParser,
    ".jpeg": ImageParser,
    ".webp": ImageParser,
    ".gif": ImageParser,
    ".bmp": ImageParser,
    ".txt": CodeParser,
    ".md": CodeParser,
    ".py": CodeParser,
    ".js": CodeParser,
    ".ts": CodeParser,
    ".jsx": CodeParser,
    ".tsx": CodeParser,
    ".html": CodeParser,
    ".css": CodeParser,
    ".json": CodeParser,
    ".xml": CodeParser,
    ".yaml": CodeParser,
    ".yml": CodeParser,
    ".csv": CodeParser,
    ".java": CodeParser,
    ".cpp": CodeParser,
    ".c": CodeParser,
    ".h": CodeParser,
    ".hpp": CodeParser,
    ".rs": CodeParser,
    ".go": CodeParser,
    ".rb": CodeParser,
    ".php": CodeParser,
    ".swift": CodeParser,
    ".kt": CodeParser,
    ".scala": CodeParser,
    ".r": CodeParser,
    ".sql": CodeParser,
    ".sh": CodeParser,
    ".bash": CodeParser,
    ".zsh": CodeParser,
    ".ps1": CodeParser,
}


def get_parser_for_file(file_path: str) -> Optional[Any]:
    """
    Get appropriate parser for a file
    
    Args:
        file_path: Path to the file
        
    Returns:
        Parser instance or None if no parser available
    """
    ext = Path(file_path).suffix.lower()
    parser_class = PARSERS.get(ext)
    
    if parser_class:
        return parser_class()
    
    return None


def is_file_supported(file_path: str) -> bool:
    """Check if file type is supported"""
    ext = Path(file_path).suffix.lower()
    return ext in PARSERS


def get_supported_extensions() -> list:
    """Get list of supported file extensions"""
    return list(PARSERS.keys())


__all__ = [
    "PDFParser",
    "DocxParser", 
    "ImageParser",
    "CodeParser",
    "get_parser_for_file",
    "is_file_supported",
    "get_supported_extensions"
]
