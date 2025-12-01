#!/usr/bin/env python3
"""
Atomic Clock & Weather Display - Hardened & Optimized Server
Security-hardened HTTP server with advanced performance optimizations
Version: 2.0.0-Hardened
"""

import os
import sys
import time
import gzip
import hashlib
import socket
import threading
import urllib.parse
from datetime import datetime, timedelta
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from pathlib import Path
import json
import logging
import ssl
import secrets
from typing import Dict, List, Optional, Tuple, Any

# Security: Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SecurityConfig:
    """Security configuration class"""
    
    # Security: Rate limiting
    RATE_LIMIT_REQUESTS = 100
    RATE_LIMIT_WINDOW = 60  # seconds
    
    # Security: File size limits
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {
        '.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg',
        '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
    }
    
    # Security: Blocked paths
    BLOCKED_PATHS = {
        '..', '.htaccess', '.env', 'config.py', 'server.log',
        '__pycache__', '.git', '.DS_Store', 'Thumbs.db'
    }
    
    # Security: CSP configuration
    CSP_POLICY = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self' https://api.openweathermap.org https://api.weatherapi.com https://ipapi.co; "
        "img-src 'self' data:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    
    # Security: Headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': CSP_POLICY
    }

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = {}
        self.lock = threading.Lock()
    
    def is_allowed(self, client_ip: str) -> bool:
        """Check if request is allowed"""
        now = time.time()
        
        with self.lock:
            # Clean old requests
            if client_ip in self.requests:
                self.requests[client_ip] = [
                    req_time for req_time in self.requests[client_ip]
                    if now - req_time < SecurityConfig.RATE_LIMIT_WINDOW
                ]
            else:
                self.requests[client_ip] = []
            
            # Check rate limit
            if len(self.requests[client_ip]) >= SecurityConfig.RATE_LIMIT_REQUESTS:
                return False
            
            # Add current request
            self.requests[client_ip].append(now)
            return True

class CacheManager:
    """Advanced caching with security considerations"""
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()
        self.max_cache_size = 100
        self.cache_timeout = 3600  # 1 hour
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get cached item"""
        with self.lock:
            if key in self.cache:
                item = self.cache[key]
                if time.time() - item['timestamp'] < self.cache_timeout:
                    return item
                else:
                    del self.cache[key]
            return None
    
    def set(self, key: str, content: bytes, content_type: str, etag: str = None) -> None:
        """Set cached item"""
        with self.lock:
            # Clean old items if cache is full
            if len(self.cache) >= self.max_cache_size:
                oldest_key = min(self.cache.keys(), 
                               key=lambda k: self.cache[k]['timestamp'])
                del self.cache[oldest_key]
            
            self.cache[key] = {
                'content': content,
                'content_type': content_type,
                'etag': etag or self.generate_etag(content),
                'timestamp': time.time(),
                'compressed': self.should_compress(content_type)
            }
    
    def generate_etag(self, content: bytes) -> str:
        """Generate ETag for content"""
        return f'"{hashlib.md5(content).hexdigest()}"'
    
    def should_compress(self, content_type: str) -> bool:
        """Check if content should be compressed"""
        compressible_types = {
            'text/html', 'text/css', 'text/javascript', 'application/javascript',
            'application/json', 'text/xml', 'application/xml'
        }
        return any(ct in content_type for ct in compressible_types)

class HardenedRequestHandler(SimpleHTTPRequestHandler):
    """Security-hardened request handler"""
    
    # Security: Hide server information
    server_version = "HardenedServer"
    sys_version = ""
    
    def __init__(self, *args, rate_limiter: RateLimiter, cache_manager: CacheManager, **kwargs):
        self.rate_limiter = rate_limiter
        self.cache_manager = cache_manager
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests with security and performance optimizations"""
        try:
            # Security: Rate limiting
            client_ip = self.client_address[0]
            if not self.rate_limiter.is_allowed(client_ip):
                self.send_error(429, "Rate limit exceeded")
                logger.warning(f"Rate limit exceeded for {client_ip}")
                return
            
            # Security: Path validation
            if not self.is_path_safe(self.path):
                self.send_error(403, "Forbidden")
                logger.warning(f"Blocked path access: {self.path} from {client_ip}")
                return
            
            # Performance: Check cache
            cache_key = f"{client_ip}:{self.path}"
            cached_item = self.cache_manager.get(cache_key)
            
            if cached_item:
                self.serve_cached_response(cached_item)
                return
            
            # Security: Serve file with validation
            self.serve_file_safe()
            
        except Exception as e:
            logger.error(f"Error handling request: {e}")
            self.send_error(500, "Internal Server Error")
    
    def is_path_safe(self, path: str) -> bool:
        """Check if path is safe"""
        # Security: Decode and normalize path
        try:
            decoded_path = urllib.parse.unquote(path)
            normalized_path = os.path.normpath(decoded_path)
        except Exception:
            return False
        
        # Security: Check for blocked paths
        if any(blocked in normalized_path for blocked in SecurityConfig.BLOCKED_PATHS):
            return False
        
        # Security: Check for directory traversal
        if '..' in normalized_path or normalized_path.startswith('/'):
            return False
        
        # Security: Check file extension
        if normalized_path != '/' and not any(normalized_path.endswith(ext) for ext in SecurityConfig.ALLOWED_EXTENSIONS):
            return False
        
        return True
    
    def serve_file_safe(self):
        """Serve file with security checks"""
        try:
            # Security: Resolve path safely
            if self.path == '/':
                file_path = self.directory / 'index.html'
            else:
                file_path = self.directory / self.path.lstrip('/')
            
            # Security: Ensure file is within directory
            try:
                file_path.resolve().relative_to(self.directory.resolve())
            except ValueError:
                self.send_error(403, "Forbidden")
                return
            
            # Security: Check file exists and is file
            if not file_path.exists() or not file_path.is_file():
                self.send_error(404, "File not found")
                return
            
            # Security: Check file size
            if file_path.stat().st_size > SecurityConfig.MAX_FILE_SIZE:
                self.send_error(413, "File too large")
                return
            
            # Performance: Read and cache file
            content = file_path.read_bytes()
            content_type = self.guess_type(str(file_path))
            etag = self.cache_manager.generate_etag(content)
            
            # Performance: Cache the file
            cache_key = f"{self.client_address[0]}:{self.path}"
            self.cache_manager.set(cache_key, content, content_type, etag)
            
            # Security: Serve with headers
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('ETag', etag)
            self.send_header('Cache-Control', 'public, max-age=3600')
            
            # Security: Add security headers
            for header, value in SecurityConfig.SECURITY_HEADERS.items():
                self.send_header(header, value)
            
            # Performance: Compression
            if self.cache_manager.should_compress(content_type):
                compressed_content = gzip.compress(content)
                self.send_header('Content-Encoding', 'gzip')
                self.send_header('Content-Length', str(len(compressed_content)))
                self.end_headers()
                self.wfile.write(compressed_content)
            else:
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            
            logger.info(f"Served: {self.path} to {self.client_address[0]}")
            
        except Exception as e:
            logger.error(f"Error serving file: {e}")
            self.send_error(500, "Internal Server Error")
    
    def serve_cached_response(self, cached_item: Dict[str, Any]):
        """Serve cached response"""
        try:
            self.send_response(200)
            self.send_header('Content-Type', cached_item['content_type'])
            self.send_header('ETag', cached_item['etag'])
            self.send_header('Cache-Control', 'public, max-age=3600')
            
            # Security: Add security headers
            for header, value in SecurityConfig.SECURITY_HEADERS.items():
                self.send_header(header, value)
            
            # Performance: Serve compressed if available
            if cached_item['compressed']:
                compressed_content = gzip.compress(cached_item['content'])
                self.send_header('Content-Encoding', 'gzip')
                self.send_header('Content-Length', str(len(compressed_content)))
                self.end_headers()
                self.wfile.write(compressed_content)
            else:
                self.send_header('Content-Length', str(len(cached_item['content'])))
                self.end_headers()
                self.wfile.write(cached_item['content'])
            
            logger.info(f"Served from cache: {self.path} to {self.client_address[0]}")
            
        except Exception as e:
            logger.error(f"Error serving cached response: {e}")
            self.send_error(500, "Internal Server Error")
    
    def do_HEAD(self):
        """Handle HEAD requests"""
        try:
            if not self.is_path_safe(self.path):
                self.send_error(403, "Forbidden")
                return
            
            if self.path == '/':
                file_path = self.directory / 'index.html'
            else:
                file_path = self.directory / self.path.lstrip('/')
            
            if not file_path.exists() or not file_path.is_file():
                self.send_error(404, "File not found")
                return
            
            content_type = self.guess_type(str(file_path))
            content = file_path.read_bytes()
            etag = self.cache_manager.generate_etag(content)
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('ETag', etag)
            self.send_header('Cache-Control', 'public, max-age=3600')
            
            # Security: Add security headers
            for header, value in SecurityConfig.SECURITY_HEADERS.items():
                self.send_header(header, value)
            
            self.end_headers()
            
        except Exception as e:
            logger.error(f"Error handling HEAD request: {e}")
            self.send_error(500, "Internal Server Error")
    
    def log_message(self, format: str, *args):
        """Override log_message for security"""
        # Security: Don't log sensitive information
        logger.info(f"{self.client_address[0]} - {format % args}")

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Threaded HTTP server for better performance"""
    
    def __init__(self, *args, rate_limiter: RateLimiter, cache_manager: CacheManager, **kwargs):
        self.rate_limiter = rate_limiter
        self.cache_manager = cache_manager
        super().__init__(*args, **kwargs)
    
    def finish_request(self, request, client_address):
        """Override to pass rate limiter and cache manager"""
        self.RequestHandlerClass(
            request, client_address, self,
            self.directory,
            rate_limiter=self.rate_limiter,
            cache_manager=self.cache_manager
        )

class HardenedServer:
    """Main hardened server class"""
    
    def __init__(self, host: str = '0.0.0.0', port: int = 8080, directory: str = '.'):
        self.host = host
        self.port = port
        self.directory = Path(directory).resolve()
        self.rate_limiter = RateLimiter()
        self.cache_manager = CacheManager()
        self.server = None
        
        # Security: Validate directory
        if not self.directory.exists() or not self.directory.is_dir():
            raise ValueError(f"Invalid directory: {directory}")
    
    def start(self, ssl_enabled: bool = False):
        """Start the hardened server"""
        try:
            # Create server
            self.server = ThreadedHTTPServer(
                (self.host, self.port),
                rate_limiter=self.rate_limiter,
                cache_manager=self.cache_manager
            )
            self.server.directory = self.directory
            
            # Security: Enable SSL if requested
            if ssl_enabled:
                self.setup_ssl()
            
            # Performance: Configure server
            self.server.request_queue_size = 100
            self.server.allow_reuse_address = True
            
            # Get network info
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            
            # Display server info
            self.display_server_info(local_ip, ssl_enabled)
            
            # Start server
            logger.info(f"Server starting on {self.host}:{self.port}")
            self.server.serve_forever()
            
        except KeyboardInterrupt:
            logger.info("Server stopped by user")
        except Exception as e:
            logger.error(f"Server error: {e}")
            raise
        finally:
            self.stop()
    
    def setup_ssl(self):
        """Setup SSL/TLS"""
        try:
            # Security: Create self-signed certificate if not exists
            cert_file = 'server.crt'
            key_file = 'server.key'
            
            if not os.path.exists(cert_file) or not os.path.exists(key_file):
                self.generate_self_signed_cert(cert_file, key_file)
            
            # Security: Configure SSL context
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            context.minimum_version = ssl.TLSVersion.TLSv1_2
            context.set_ciphers('ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS')
            context.load_cert_chain(cert_file, key_file)
            
            self.server.socket = context.wrap_socket(
                self.server.socket,
                server_side=True
            )
            
            logger.info("SSL/TLS enabled")
            
        except Exception as e:
            logger.error(f"SSL setup failed: {e}")
            raise
    
    def generate_self_signed_cert(self, cert_file: str, key_file: str):
        """Generate self-signed SSL certificate"""
        try:
            from cryptography import x509
            from cryptography.x509.oid import NameOID
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            import ipaddress
            
            # Generate private key
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )
            
            # Create certificate
            subject = issuer = x509.Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "CA"),
                x509.NameAttribute(NameOID.LOCALITY_NAME, "San Francisco"),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Atomic Clock Display"),
                x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
            ])
            
            cert = x509.CertificateBuilder().subject_name(
                subject
            ).issuer_name(
                issuer
            ).public_key(
                private_key.public_key()
            ).serial_number(
                x509.random_serial_number()
            ).not_valid_before(
                datetime.utcnow()
            ).not_valid_after(
                datetime.utcnow() + timedelta(days=365)
            ).add_extension(
                x509.SubjectAlternativeName([
                    x509.DNSName("localhost"),
                    x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
                    x509.IPAddress(ipaddress.IPv4Address("0.0.0.0")),
                ]),
                critical=False
            ).sign(private_key, hashes.SHA256())
            
            # Write certificate
            with open(cert_file, "wb") as f:
                f.write(cert.public_bytes(serialization.Encoding.PEM))
            
            # Write private key
            with open(key_file, "wb") as f:
                f.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            
            logger.info("Self-signed certificate generated")
            
        except ImportError:
            logger.error("cryptography library required for SSL certificate generation")
            raise
        except Exception as e:
            logger.error(f"Certificate generation failed: {e}")
            raise
    
    def display_server_info(self, local_ip: str, ssl_enabled: bool):
        """Display server information"""
        protocol = "https" if ssl_enabled else "http"
        
        print("=" * 60)
        print("🔒 Atomic Clock Display - Hardened & Optimized Server")
        print("=" * 60)
        print("🛡️  Security Features:")
        print("   ✅ Rate limiting (100 requests/minute)")
        print("   ✅ Input validation and sanitization")
        print("   ✅ Security headers (CSP, XSS protection)")
        print("   ✅ Path traversal protection")
        print("   ✅ File size and type validation")
        print("   ✅ SSL/TLS encryption" + (" (enabled)" if ssl_enabled else " (disabled)"))
        print()
        print("⚡ Performance Features:")
        print("   ✅ Advanced caching with ETags")
        print("   ✅ Gzip compression")
        print("   ✅ Threaded request handling")
        print("   ✅ Memory-efficient serving")
        print()
        print("📡 Server Information:")
        print(f"   Local IP: {local_ip}")
        print(f"   Port: {self.port}")
        print(f"   Directory: {self.directory}")
        print()
        print("🌐 Access URLs:")
        print(f"   Local: {protocol}://localhost:{self.port}")
        print(f"   Network: {protocol}://{local_ip}:{self.port}")
        print()
        print("🎯 Features:")
        print("   ✅ Real-time network status monitoring")
        print("   ✅ Offline detection and indication")
        print("   ✅ 12 beautiful themes with auto-rotation")
        print("   ✅ Optimized weather display")
        print("   ✅ Single row theme panel")
        print("   ✅ Full kiosk mode support")
        print("   ✅ Security-hardened architecture")
        print()
        print("📱 Share this URL with other devices on your network:")
        print(f"   {protocol}://{local_ip}:{self.port}")
        print()
        print("🛑 Press Ctrl+C to stop the server")
        print("=" * 60)
    
    def stop(self):
        """Stop the server"""
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            logger.info("Server stopped")

def main():
    """Main function"""
    try:
        # Parse arguments
        import argparse
        parser = argparse.ArgumentParser(description='Hardened Atomic Clock Display Server')
        parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
        parser.add_argument('--port', type=int, default=8080, help='Port to bind to')
        parser.add_argument('--directory', default='.', help='Directory to serve')
        parser.add_argument('--ssl', action='store_true', help='Enable SSL/TLS')
        
        args = parser.parse_args()
        
        # Create and start server
        server = HardenedServer(args.host, args.port, args.directory)
        server.start(ssl_enabled=args.ssl)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"Server failed to start: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
