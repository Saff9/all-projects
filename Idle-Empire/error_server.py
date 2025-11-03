import http.server
import socketserver

class ErrorHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        print("\n\n=== BROWSER ERROR CAUGHT ===")
        print(post_data)
        print("============================\n\n")
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.end_headers()

handler = ErrorHandler
httpd = socketserver.TCPServer(("", 8081), handler)
print("Listening for browser errors on port 8081...")
httpd.serve_forever()
