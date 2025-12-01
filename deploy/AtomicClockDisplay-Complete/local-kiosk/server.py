#!/usr/bin/env python3
"""
Atomic Clock Display - Local Web Server
Simple HTTP server for local network deployment
"""

import http.server
import socketserver
import socket
import sys
import os
import webbrowser
from datetime import datetime

# Configuration
PORT = 8080
HOST = '0.0.0.0'  # Listen on all interfaces

def get_local_ip():
    """Get the local IP address"""
    try:
        # Create a socket to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def print_banner():
    """Print server startup banner"""
    local_ip = get_local_ip()
    print("=" * 60)
    print("🌐 Atomic Clock Display - Local Web Server")
    print("=" * 60)
    print(f"📡 Server Information:")
    print(f"   Local IP: {local_ip}")
    print(f"   Port: {PORT}")
    print(f"   Directory: {os.getcwd()}")
    print()
    print(f"🌐 Access URLs:")
    print(f"   Local: http://localhost:{PORT}")
    print(f"   Network: http://{local_ip}:{PORT}")
    print()
    print("🎯 Features:")
    print("   ✅ Real-time network status monitoring")
    print("   ✅ Offline detection and indication")
    print("   ✅ 12 beautiful themes with auto-rotation")
    print("   ✅ Optimized weather display")
    print("   ✅ Single row theme panel")
    print("   ✅ Full kiosk mode support")
    print()
    print("📱 Share this URL with other devices on your network:")
    print(f"   http://{local_ip}:{PORT}")
    print()
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 60)

class AtomicClockHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with additional features"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def log_message(self, format, *args):
        """Custom log messages with timestamps"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {format % args}")
    
    def end_headers(self):
        """Add security headers"""
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests with custom routing"""
        # Serve index.html for root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Add network status endpoint
        if self.path == '/network-status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            local_ip = get_local_ip()
            status = {
                'online': True,
                'ip': local_ip,
                'port': PORT,
                'url': f'http://{local_ip}:{PORT}',
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(str(status).replace("'", '"').encode())
            return
        
        # Serve files normally
        super().do_GET()

def start_server():
    """Start the web server"""
    print_banner()
    
    try:
        # Create server
        with socketserver.TCPServer((HOST, PORT), AtomicClockHandler) as httpd:
            print(f"🚀 Server started successfully!")
            print(f"📡 Listening on {HOST}:{PORT}")
            print()
            
            # Open browser automatically (optional)
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🌐 Browser opened automatically")
            except:
                print("⚠️  Could not open browser automatically")
            
            print("⏳ Waiting for connections...")
            print()
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except PermissionError:
        print(f"❌ Permission denied: Port {PORT} may require administrator privileges")
        print("💡 Try running as administrator or use a different port")
        sys.exit(1)
    except OSError as e:
        if e.errno == 10048:  # Address already in use
            print(f"❌ Port {PORT} is already in use")
            print("💡 Try stopping other servers or use a different port")
        else:
            print(f"❌ Network error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Check Python version
    if sys.version_info < (3, 6):
        print("❌ Python 3.6 or higher is required")
        sys.exit(1)
    
    # Start the server
    start_server()
