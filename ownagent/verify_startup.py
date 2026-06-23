#!/usr/bin/env python3
"""
LocalAI Startup Verification Script
Tests that the application starts correctly without errors
"""

import subprocess
import sys
import time
import requests
from pathlib import Path

def check_python_syntax():
    """Check if main.py has valid Python syntax"""
    print("🔍 Checking Python syntax...")
    result = subprocess.run(
        [sys.executable, "-m", "py_compile", "src/api/main.py"],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"❌ Syntax error: {result.stderr}")
        return False
    print("✅ Syntax check passed")
    return True

def check_imports():
    """Check if all imports can be loaded"""
    print("\n🔍 Checking imports...")
    try:
        from src.api.main import app, logger
        from src.models.config import API_PORT, OLLAMA_BASE_URL, SUPPORTED_MODELS
        print(f"✅ Imports successful")
        print(f"   - API Port: {API_PORT}")
        print(f"   - Ollama URL: {OLLAMA_BASE_URL}")
        print(f"   - Models: {len(SUPPORTED_MODELS)}")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def check_app_routes():
    """Check if FastAPI app is properly configured"""
    print("\n🔍 Checking FastAPI routes...")
    try:
        from src.api.main import app
        routes = [route.path for route in app.routes]
        required_routes = ["/", "/health", "/api/models", "/v1/chat/completions"]
        
        for route in required_routes:
            if route in routes:
                print(f"✅ Route {route} found")
            else:
                print(f"❌ Route {route} NOT found")
                return False
        
        return True
    except Exception as e:
        print(f"❌ Route check error: {e}")
        return False

def main():
    """Run all checks"""
    print("=" * 60)
    print("🚀 LocalAI Startup Verification")
    print("=" * 60)
    
    checks = [
        ("Python Syntax", check_python_syntax),
        ("Imports", check_imports),
        ("Routes", check_app_routes),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ {name} check failed: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("📊 Verification Results")
    print("=" * 60)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 All checks passed! Application is ready to run.")
        print("\nTo start the server, run:")
        print("  python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000")
        print("\nOr:")
        print("  cd src/api && python main.py")
        return 0
    else:
        print("\n❌ Some checks failed. Fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
