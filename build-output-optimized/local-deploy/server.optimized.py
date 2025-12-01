#!/usr/bin/env python3
import http.server
import socketserver
import os
import socket
import webbrowser
import threading
import time
from datetime import datetime
import mimetypes
import gzip
from io import BytesIO

# Cache for static files
file_cache = {}
cache_timestamps = {}

class OptimizedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.enable_compression = True
        self.cache_max_age = 3600  # 1 hour cache
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Security: Only serve files from current directory
        if '..' in self.path or self.path.startswith('/'):
            self.send_error(403, "Forbidden")
            return
        
        filepath = self.path.lstrip('/')
        
        # Check if file exists
        if not os.path.exists(filepath):
            self.send_error(404, "File not found")
            return
        
        # Get file info
        stat_info = os.stat(filepath)
        file_mtime = stat_info.st_mtime
        file_size = stat_info.st_size
        
        # Check cache
        cache_key = filepath
        if cache_key in file_cache and cache_timestamps.get(cache_key, 0) >= file_mtime:
            content, content_type, compressed = file_cache[cache_key]
            self.serve_cached_content(content, content_type, file_mtime, compressed)
            return
        
        # Read and cache file
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(filepath)
            if content_type is None:
                content_type = 'application/octet-stream'
            
            # Compress if beneficial
            compressed = False
            if self.enable_compression and content_type.startswith('text/') and len(content) > 1024:
                compressed_content = self.compress_content(content)
                if len(compressed_content) < len(content) * 0.9:  # Only use compression if it helps
                    content = compressed_content
                    compressed = True
            
            # Cache the content
            file_cache[cache_key] = (content, content_type, compressed)
            cache_timestamps[cache_key] = file_mtime
            
            # Serve content
            self.serve_cached_content(content, content_type, file_mtime, compressed)
            
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def compress_content(self, content):
        buffer = BytesIO()
        with gzip.GzipFile(fileobj=buffer, mode='wb') as gz_file:
            gz_file.write(content)
        return buffer.getvalue()
    
    def serve_cached_content(self, content, content_type, file_mtime, compressed):
        self.send_response(200)
        
        # Set headers
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', f'public, max-age={self.cache_max_age}')
        self.send_header('Last-Modified', self.date_time_string(file_mtime))
        
        # Compression header
        if compressed:
            self.send_header('Content-Encoding', 'gzip')
        
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        
        # Performance headers
        self.send_header('Access-Control-Allow-Origin', '*')
        
        self.end_headers()
        self.wfile.write(content)
    
    def end_headers(self):
        # Add custom headers
        self.send_header('Server', 'AtomicClock-Optimized/1.0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Optimized logging - less verbose
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def open_browser(url):
    time.sleep(1)  # Give server time to start
    try:
        webbrowser.open(url)
        print("🌐 Browser opened automatically")
    except Exception as e:
        print(f"⚠️ Could not open browser: {e}")

def main():
    PORT = 8080
    HOST = '0.0.0.0'
    
    print("🚀 Atomic Clock Display - Optimized Server")
    print("=" * 50)
    
    # Get network info
    local_ip = get_local_ip()
    hostname = socket.gethostname()
    
    print(f"📡 Server Information:")
    print(f"   Local IP: {local_ip}")
    print(f"   Hostname: {hostname}")
    print(f"   Port: {PORT}")
    print(f"   Directory: {os.getcwd()}")
    print()
    
    # Create server
    try:
        with socketserver.TCPServer((HOST, PORT), OptimizedHTTPRequestHandler) as httpd:
            print(f"🚀 Optimized server started successfully!")
            print(f"📡 Listening on {HOST}:{PORT}")
            print()
            print("🌐 Access URLs:")
            print(f"   Local: http://localhost:{PORT}")
            print(f"   Network: http://{local_ip}:{PORT}")
            print()
            print("⚡ Optimizations Active:")
            print("   ✅ File caching enabled")
            print("   ✅ Gzip compression for text files")
            print("   ✅ Security headers configured")
            print("   ✅ Performance headers added")
            print()
            print("🛑 Press Ctrl+C to stop the server")
            print("=" * 50)
            
            # Open browser in background
            browser_thread = threading.Thread(target=open_browser, args=(f"http://{local_ip}:{PORT}",))
            browser_thread.daemon = True
            browser_thread.start()
            
            # Start server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Please try a different port.")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
