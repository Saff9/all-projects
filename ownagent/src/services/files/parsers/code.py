"""
Code/text file parser for Apex Smart
Handles plain text and code files
"""
from typing import Dict, Any, Optional
from pathlib import Path
import json


class CodeParser:
    """Parser for text and code files"""
    
    # Language detection based on extension
    LANGUAGE_MAP = {
        ".py": "Python",
        ".js": "JavaScript",
        ".ts": "TypeScript",
        ".jsx": "JSX",
        ".tsx": "TSX",
        ".html": "HTML",
        ".htm": "HTML",
        ".css": "CSS",
        ".scss": "SCSS",
        ".sass": "Sass",
        ".json": "JSON",
        ".xml": "XML",
        ".yaml": "YAML",
        ".yml": "YAML",
        ".csv": "CSV",
        ".java": "Java",
        ".cpp": "C++",
        ".c": "C",
        ".h": "C Header",
        ".hpp": "C++ Header",
        ".rs": "Rust",
        ".go": "Go",
        ".rb": "Ruby",
        ".php": "PHP",
        ".swift": "Swift",
        ".kt": "Kotlin",
        ".scala": "Scala",
        ".r": "R",
        ".sql": "SQL",
        ".sh": "Shell",
        ".bash": "Bash",
        ".zsh": "Zsh",
        ".ps1": "PowerShell",
        ".txt": "Text",
        ".md": "Markdown",
        ".rst": "reStructuredText",
        ".ini": "INI",
        ".cfg": "Config",
        ".toml": "TOML"
    }
    
    def __init__(self):
        self.name = "Code/Text Parser"
    
    def parse(self, file_path: str) -> Dict[str, Any]:
        """
        Parse text/code file
        
        Args:
            file_path: Path to file
            
        Returns:
            Dictionary with content and metadata
        """
        result = {
            "text": "",
            "metadata": {},
            "language": "Unknown",
            "error": None
        }
        
        try:
            path = Path(file_path)
            ext = path.suffix.lower()
            
            # Detect language
            result["language"] = self.LANGUAGE_MAP.get(ext, "Text")
            
            # Read file
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                # Try with different encoding
                with open(file_path, 'r', encoding='latin-1') as f:
                    content = f.read()
            
            result["text"] = content
            
            # Calculate metrics
            lines = content.split('\n')
            result["metadata"] = {
                "lines": len(lines),
                "characters": len(content),
                "words": len(content.split()),
                "language": result["language"],
                "extension": ext
            }
            
            # Special handling for specific formats
            if ext == '.json':
                try:
                    parsed = json.loads(content)
                    result["metadata"]["json_keys"] = list(parsed.keys()) if isinstance(parsed, dict) else []
                    result["metadata"]["json_type"] = type(parsed).__name__
                except json.JSONDecodeError:
                    pass
            
            elif ext == '.csv':
                lines_count = len([l for l in lines if l.strip()])
                if lines_count > 0:
                    first_line = lines[0]
                    columns = first_line.split(',')
                    result["metadata"]["csv_rows"] = lines_count
                    result["metadata"]["csv_columns"] = len(columns)
            
        except Exception as e:
            result["error"] = f"Failed to parse file: {str(e)}"
        
        return result
    
    def get_preview(self, file_path: str, max_lines: int = 50) -> str:
        """
        Get a preview of the file content
        
        Args:
            file_path: Path to file
            max_lines: Maximum lines to return
            
        Returns:
            Preview text
        """
        result = self.parse(file_path)
        
        if result["error"]:
            return f"Error: {result['error']}"
        
        lines = result["text"].split('\n')
        if len(lines) > max_lines:
            preview_lines = lines[:max_lines]
            preview_lines.append(f"\n... ({len(lines) - max_lines} more lines)")
            return '\n'.join(preview_lines)
        
        return result["text"]
    
    def get_language(self, file_path: str) -> str:
        """Get programming language for a file"""
        ext = Path(file_path).suffix.lower()
        return self.LANGUAGE_MAP.get(ext, "Text")
    
    def is_code_file(self, file_path: str) -> bool:
        """Check if file is a code file (not plain text)"""
        ext = Path(file_path).suffix.lower()
        language = self.LANGUAGE_MAP.get(ext, "Text")
        return language not in ["Text", "Markdown", "JSON", "XML", "YAML", "CSV", "INI", "Config", "TOML"]
    
    def extract_imports(self, file_path: str) -> list:
        """
        Extract import statements from code files
        
        Args:
            file_path: Path to code file
            
        Returns:
            List of import statements
        """
        result = self.parse(file_path)
        
        if result["error"] or not result["text"]:
            return []
        
        content = result["text"]
        language = result["language"]
        imports = []
        
        lines = content.split('\n')
        
        if language == "Python":
            for line in lines:
                line = line.strip()
                if line.startswith(('import ', 'from ')):
                    imports.append(line)
        
        elif language in ["JavaScript", "TypeScript", "JSX", "TSX"]:
            for line in lines:
                line = line.strip()
                if line.startswith(('import ', 'require(')):
                    imports.append(line)
        
        elif language == "Java":
            for line in lines:
                line = line.strip()
                if line.startswith('import '):
                    imports.append(line)
        
        elif language == "Go":
            in_import = False
            for line in lines:
                line = line.strip()
                if line.startswith('import '):
                    if '(' in line:
                        in_import = True
                    imports.append(line)
                elif in_import:
                    imports.append(line)
                    if ')' in line:
                        in_import = False
        
        return imports
    
    def extract_functions(self, file_path: str) -> list:
        """
        Extract function/class definitions from code files
        
        Args:
            file_path: Path to code file
            
        Returns:
            List of function/class names
        """
        result = self.parse(file_path)
        
        if result["error"] or not result["text"]:
            return []
        
        content = result["text"]
        language = result["language"]
        definitions = []
        
        import re
        
        if language == "Python":
            # Match function and class definitions
            pattern = r'^(?:async\s+)?def\s+(\w+)|^class\s+(\w+)'
            for match in re.finditer(pattern, content, re.MULTILINE):
                name = match.group(1) or match.group(2)
                if name:
                    definitions.append(name)
        
        elif language in ["JavaScript", "TypeScript"]:
            # Match function declarations
            patterns = [
                r'(?:export\s+)?(?:async\s+)?function\s+(\w+)',
                r'(?:export\s+)?class\s+(\w+)',
                r'(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|\w+)\s*=>',
                r'(?:export\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*{'
            ]
            for pattern in patterns:
                for match in re.finditer(pattern, content):
                    name = match.group(1)
                    if name:
                        definitions.append(name)
        
        return definitions
