"""
Tests for model configuration
"""

import pytest
from src.models.config import SUPPORTED_MODELS, DEFAULT_MODEL


def test_supported_models_list():
    """Test that supported models list is not empty and contains expected models"""
    assert len(SUPPORTED_MODELS) > 0
    assert "qwen2.5-coder:1.5b-base" in SUPPORTED_MODELS
    assert "qwen2.5-coder:3b" in SUPPORTED_MODELS
    assert "qwen2.5-coder:latest" in SUPPORTED_MODELS
    assert "deepseek-coder:6.7b-instruct-q4_0" in SUPPORTED_MODELS


def test_default_model():
    """Test that default model is valid"""
    assert DEFAULT_MODEL in SUPPORTED_MODELS
    assert DEFAULT_MODEL == "qwen2.5-coder:3b"


def test_config_constants():
    """Test configuration constants are properly defined"""
    from src.models.config import OLLAMA_BASE_URL, API_HOST, API_PORT

    assert OLLAMA_BASE_URL.startswith("http://")
    assert isinstance(API_HOST, str)
    assert isinstance(API_PORT, int)
    assert API_PORT > 0