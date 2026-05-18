#!/usr/bin/env python3
"""
Health check endpoint for monitoring and load balancers
Returns JSON status for health checks
"""

import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
import time
from config import LOG_LEVEL

logger = logging.getLogger(__name__)

class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            health_status = {
                "status": "healthy",
                "timestamp": time.time(),
                "service": "leads-bot",
                "version": "1.0.0"
            }
            
            self.wfile.write(json.dumps(health_status).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging for health checks
        pass

def start_health_server(port=8080):
    """Start health check server in a separate thread"""
    try:
        server = HTTPServer(('0.0.0.0', port), HealthCheckHandler)
        logger.info(f"Health check server started on port {port}")
        server.serve_forever()
    except Exception as e:
        logger.error(f"Health check server failed: {e}")

def start_health_check():
    """Start health check server in background thread"""
    health_thread = threading.Thread(target=start_health_server, daemon=True)
    health_thread.start()