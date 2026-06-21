"""
File processor for Apex Smart
Orchestrates file parsing and content extraction
"""
from typing import Dict, Any, Optional
from pathlib import Path
import asyncio

from src.services.files.parsers import get_parser_for_file, is_file_supported


class FileProcessor:
    """Main file processing orchestrator"""
    
    def __init__(self):
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        self.max_text_length = 100000  # Max characters to extract
    
    async def process_file(self, file_path: str) -> Dict[str, Any]:
        """
        Process a file and extract content
        
        Args:
            file_path: Path to the file
            
        Returns:
            Processing result with extracted text and metadata
        """
        result = {
            "success": False,
            "file_path": file_path,
            "text": None,
            "metadata": {},
            "error": None
        }
        
        try:
            path = Path(file_path)
            
            # Check if file exists
            if not path.exists():
                result["error"] = "File not found"
                return result
            
            # Check file size
            file_size = path.stat().st_size
            if file_size > self.max_file_size:
                result["error"] = f"File too large ({file_size} bytes). Max: {self.max_file_size} bytes"
                return result
            
            # Check if supported
            if not is_file_supported(file_path):
                result["error"] = f"Unsupported file type: {path.suffix}"
                return result
            
            # Get appropriate parser
            parser = get_parser_for_file(file_path)
            if not parser:
                result["error"] = "No parser available for this file type"
                return result
            
            # Parse file (run in thread pool to not block)
            loop = asyncio.get_event_loop()
            parse_result = await loop.run_in_executor(None, parser.parse, file_path)
            
            if parse_result.get("error"):
                result["error"] = parse_result["error"]
                return result
            
            # Extract and limit text
            text = parse_result.get("text", "")
            if len(text) > self.max_text_length:
                text = text[:self.max_text_length] + "\n\n[Content truncated due to length]"
            
            result["success"] = True
            result["text"] = text
            result["metadata"] = parse_result.get("metadata", {})
            result["word_count"] = parse_result.get("word_count", len(text.split()))
            
        except Exception as e:
            result["error"] = f"Processing failed: {str(e)}"
        
        return result
    
    async def get_file_summary(self, file_path: str, max_length: int = 500) -> str:
        """
        Get a summary of file content
        
        Args:
            file_path: Path to the file
            max_length: Maximum summary length
            
        Returns:
            Summary text
        """
        result = await self.process_file(file_path)
        
        if not result["success"]:
            return f"Could not process file: {result['error']}"
        
        text = result["text"]
        metadata = result["metadata"]
        
        # Build summary
        summary_parts = []
        
        # Add file info
        path = Path(file_path)
        summary_parts.append(f"File: {path.name}")
        summary_parts.append(f"Type: {metadata.get('language', path.suffix)}")
        
        if "lines" in metadata:
            summary_parts.append(f"Lines: {metadata['lines']}")
        if "pages" in metadata:
            summary_parts.append(f"Pages: {metadata['pages']}")
        
        summary_parts.append(f"Words: {result.get('word_count', 0)}")
        summary_parts.append("")
        
        # Add content preview
        preview = text[:max_length] if len(text) <= max_length else text[:max_length] + "..."
        summary_parts.append("Preview:")
        summary_parts.append(preview)
        
        return "\n".join(summary_parts)
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """
        Get basic file information without full processing
        
        Args:
            file_path: Path to the file
            
        Returns:
            File information
        """
        path = Path(file_path)
        
        info = {
            "exists": path.exists(),
            "name": path.name,
            "extension": path.suffix.lower(),
            "supported": is_file_supported(file_path)
        }
        
        if path.exists():
            stat = path.stat()
            info["size"] = stat.st_size
            info["size_human"] = self._format_size(stat.st_size)
            info["modified"] = stat.st_mtime
        
        return info
    
    def _format_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        size = float(size_bytes)
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    async def batch_process(self, file_paths: list) -> list:
        """
        Process multiple files concurrently
        
        Args:
            file_paths: List of file paths
            
        Returns:
            List of processing results
        """
        tasks = [self.process_file(path) for path in file_paths]
        return await asyncio.gather(*tasks)


# Global processor instance
_processor: Optional[FileProcessor] = None


def get_file_processor() -> FileProcessor:
    """Get or create global file processor"""
    global _processor
    if _processor is None:
        _processor = FileProcessor()
    return _processor
