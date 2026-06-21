"""
PDF parser for Apex Smart
Extracts text from PDF files
"""
from typing import Optional, Dict, Any
from pathlib import Path


class PDFParser:
    """Parser for PDF files"""
    
    def __init__(self):
        self.name = "PDF Parser"
        self.supported_extensions = [".pdf"]
    
    def parse(self, file_path: str) -> Dict[str, Any]:
        """
        Parse PDF file and extract text
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Dictionary with extracted text and metadata
        """
        result = {
            "text": "",
            "metadata": {},
            "pages": 0,
            "error": None
        }
        
        try:
            # Try using pdfplumber first (better for complex PDFs)
            try:
                import pdfplumber
                
                with pdfplumber.open(file_path) as pdf:
                    result["pages"] = len(pdf.pages)
                    
                    # Extract metadata
                    if pdf.metadata:
                        result["metadata"] = {
                            k: str(v) for k, v in pdf.metadata.items()
                            if v is not None
                        }
                    
                    # Extract text from all pages
                    text_parts = []
                    for i, page in enumerate(pdf.pages):
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(f"--- Page {i + 1} ---\n{page_text}")
                    
                    result["text"] = "\n\n".join(text_parts)
                    
            except ImportError:
                # Fallback to PyPDF2
                import PyPDF2
                
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    result["pages"] = len(pdf_reader.pages)
                    
                    # Extract metadata
                    if pdf_reader.metadata:
                        result["metadata"] = {
                            k: str(v) for k, v in pdf_reader.metadata.items()
                            if v is not None
                        }
                    
                    # Extract text from all pages
                    text_parts = []
                    for i, page in enumerate(pdf_reader.pages):
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(f"--- Page {i + 1} ---\n{page_text}")
                    
                    result["text"] = "\n\n".join(text_parts)
            
            # Calculate word count
            result["word_count"] = len(result["text"].split())
            
        except Exception as e:
            result["error"] = "Failed to parse PDF file. Please ensure the file is a valid PDF."
        
        return result
    
    def get_preview(self, file_path: str, max_chars: int = 1000) -> str:
        """
        Get a preview of the PDF content
        
        Args:
            file_path: Path to PDF file
            max_chars: Maximum characters to return
            
        Returns:
            Preview text
        """
        result = self.parse(file_path)
        
        if result["error"]:
            return f"Error: {result['error']}"
        
        text = result["text"]
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        return text
    
    def extract_tables(self, file_path: str) -> list:
        """
        Extract tables from PDF (requires pdfplumber)
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            List of tables as lists of lists
        """
        tables = []
        
        try:
            import pdfplumber
            
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
                        
        except ImportError:
            pass
        
        return tables
