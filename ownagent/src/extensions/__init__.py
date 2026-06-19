"""
Extensions system for the Local AI System
Allows adding custom functionality through plugins
"""

import importlib
import os
from typing import List, Dict, Any


class Extension:
    """Base class for extensions"""

    def __init__(self, name: str):
        self.name = name

    def initialize(self, app):
        """Called when the extension is loaded"""
        pass

    def get_routes(self) -> List[Dict[str, Any]]:
        """Return additional routes to add to the API"""
        return []

    def get_cli_commands(self) -> List[Any]:
        """Return additional CLI commands"""
        return []


# Registry of loaded extensions
_extensions: List[Extension] = []


def register_extension(extension: Extension):
    """Register an extension"""
    _extensions.append(extension)


def load_extensions():
    """Load all extensions from extensions directory"""
    extensions_dir = os.path.dirname(__file__)
    for filename in os.listdir(extensions_dir):
        if filename.endswith('.py') and filename != '__init__.py':
            module_name = filename[:-3]
            try:
                module = importlib.import_module(f'src.extensions.{module_name}')
                # Assume each module has an 'extension' instance
                if hasattr(module, 'extension'):
                    register_extension(module.extension)
            except ImportError as e:
                print(f"Failed to load extension {module_name}: {e}")


def get_all_extensions() -> List[Extension]:
    """Get all loaded extensions"""
    return _extensions.copy()