#!/usr/bin/env python3
"""
Deployment readiness test script
Verifies that the bot is ready for production deployment
"""

import os
import sys
import json
import sqlite3
import logging
from pathlib import Path

def test_environment_variables():
    """Test required environment variables"""
    print("🔍 Testing environment variables...")
    
    required_vars = ['BOT_TOKEN', 'WEBHOOK_URL']
    optional_vars = ['ADMIN_ID', 'LOG_LEVEL', 'ENVIRONMENT']
    
    missing_required = []
    for var in required_vars:
        if not os.getenv(var):
            missing_required.append(var)
    
    if missing_required:
        print(f"❌ Missing required environment variables: {', '.join(missing_required)}")
        print("💡 Copy .env.example to .env and fill in your values")
        return False
    
    print("✅ Environment variables configured")
    return True

def test_dependencies():
    """Test Python dependencies"""
    print("📦 Testing Python dependencies...")
    
    try:
        import telegram
        print("✅ python-telegram-bot imported successfully")
    except ImportError:
        print("❌ python-telegram-bot not installed")
        return False
    
    try:
        import dotenv
        print("✅ python-dotenv imported successfully")
    except ImportError:
        print("❌ python-dotenv not installed")
        return False
    
    return True

def test_database():
    """Test database initialization"""
    print("🗄️  Testing database...")
    
    try:
        from db.models import init_db
        init_db()
        print("✅ Database initialized successfully")
        
        # Test database access
        from db.database import get_connection
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cur.fetchall()]
        
        expected_tables = ['businesses', 'leads']
        missing_tables = [table for table in expected_tables if table not in tables]
        
        if missing_tables:
            print(f"❌ Missing database tables: {', '.join(missing_tables)}")
            return False
        
        print(f"✅ Database tables present: {', '.join(tables)}")
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_handlers():
    """Test handler imports"""
    print("🤖 Testing handlers...")
    
    try:
        from handlers.setup import setup_handler
        print("✅ Setup handler imported")
    except ImportError as e:
        print(f"❌ Setup handler error: {e}")
        return False
    
    try:
        from handlers.form import form_handler
        print("✅ Form handler imported")
    except ImportError as e:
        print(f"❌ Form handler error: {e}")
        return False
    
    try:
        from handlers.admin import admin_handlers
        print(f"✅ Admin handlers imported ({len(admin_handlers)} handlers)")
    except ImportError as e:
        print(f"❌ Admin handlers error: {e}")
        return False
    
    return True

def test_services():
    """Test service imports"""
    print("🔧 Testing services...")
    
    try:
        from services.lead_service import create_lead
        print("✅ Lead service imported")
    except ImportError as e:
        print(f"❌ Lead service error: {e}")
        return False
    
    try:
        from services.scoring import calculate_score
        print("✅ Scoring service imported")
    except ImportError as e:
        print(f"❌ Scoring service error: {e}")
        return False
    
    return True

def test_health_check():
    """Test health check endpoint"""
    print("🏥 Testing health check...")
    
    try:
        from health import start_health_check
        print("✅ Health check module imported")
        
        # Note: We don't start the server in test mode
        # but we verify the module is importable
        return True
        
    except ImportError as e:
        print(f"❌ Health check error: {e}")
        return False

def test_logging():
    """Test logging configuration"""
    print("📝 Testing logging...")
    
    try:
        from core.logger import setup_logger
        logger = setup_logger()
        logger.info("Test log message")
        print("✅ Logging configured successfully")
        return True
    except Exception as e:
        print(f"❌ Logging error: {e}")
        return False

def test_rate_limiter():
    """Test rate limiter"""
    print("⏱️  Testing rate limiter...")
    
    try:
        from core.ratelimiter import rate_limiter
        # Test basic functionality
        result = rate_limiter.allowed(12345)
        print(f"✅ Rate limiter working (allowed: {result})")
        return True
    except Exception as e:
        print(f"❌ Rate limiter error: {e}")
        return False

def test_input_validation():
    """Test input validation"""
    print("✅ Testing input validation...")
    
    try:
        from core.sanitizer import clean_name, clean_phone, clean_email, clean_text
        
        # Test name validation
        assert clean_name("John Doe") == "John Doe"
        assert clean_name("Jo") is None  # Too short
        
        # Test phone validation
        assert clean_phone("+1234567890") == "1234567890"
        assert clean_phone("invalid") is None
        
        # Test email validation
        assert clean_email("test@example.com") == "test@example.com"
        assert clean_email("invalid") is None
        
        # Test text cleaning
        assert len(clean_text("Hello World", 5)) == 5
        
        print("✅ Input validation working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Input validation error: {e}")
        return False

def main():
    """Run all deployment readiness tests"""
    print("🚀 Lead Bot Deployment Readiness Test")
    print("=" * 50)
    
    tests = [
        test_environment_variables,
        test_dependencies,
        test_database,
        test_handlers,
        test_services,
        test_health_check,
        test_logging,
        test_rate_limiter,
        test_input_validation,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            print()  # Empty line for readability
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Bot is ready for deployment.")
        print()
        print("📋 Next steps:")
        print("1. Set up your environment variables in .env")
        print("2. Deploy using: ./deploy.sh production")
        print("3. Monitor logs and health checks")
        return 0
    else:
        print("⚠️  Some tests failed. Please fix the issues before deploying.")
        print("💡 Run with DEBUG=1 for more detailed error information")
        return 1

if __name__ == "__main__":
    sys.exit(main())