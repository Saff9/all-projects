"""
File services module for Apex Smart
Provides file processing, parsing, and content extraction
"""
from src.services.files.processor import FileProcessor, get_file_processor
from src.services.files.parsers import (
    PDFParser,
    DocxParser,
    ImageParser,
    CodeParser,
    get_parser_for_file,
    is_file_supported,
    get_supported_extensions
)

__all__ = [
    "FileProcessor",
    "get_file_processor",
    "PDFParser",
    "DocxParser",
    "ImageParser",
    "CodeParser",
    "get_parser_for_file",
    "is_file_supported",
    "get_supported_extensions"
]
