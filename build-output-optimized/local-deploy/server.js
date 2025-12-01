#!/usr/bin/env node
/**
 * Atomic Clock Display - Local Web Server (Node.js)
 * Simple Express server for local network deployment
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PORT = 8080;
const HOST = '0.0.0.0'; // Listen on all interfaces

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

function printBanner() {
    const localIP = getLocalIP();
    console.log('='.repeat(60));
    console.log('🌐 Atomic Clock Display - Local Web Server (Node.js)');
    console.log('='.repeat(60));
    console.log(`📡 Server Information:`);
    console.log(`   Local IP: ${localIP}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Directory: ${process.cwd()}`);
    console.log('');
    console.log(`🌐 Access URLs:`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`   Network: http://${localIP}:${PORT}`);
    console.log('');
    console.log('🎯 Features:');
    console.log('   ✅ Real-time network status monitoring');
    console.log('   ✅ Offline detection and indication');
    console.log('   ✅ 12 beautiful themes with auto-rotation');
    console.log('   ✅ Optimized weather display');
    console.log('   ✅ Single row theme panel');
    console.log('   ✅ Full kiosk mode support');
    console.log('');
    console.log(`📱 Share this URL with other devices on your network:`);
    console.log(`   http://${localIP}:${PORT}`);
    console.log('');
    console.log('🛑 Press Ctrl+C to stop the server');
    console.log('='.repeat(60));
}

function getContentType(filePath) {
    const extname = String(path.extname(filePath)).toLowerCase();
    return mimeTypes[extname] || 'application/octet-stream';
}

function serveFile(filePath, res) {
    const contentType = getContentType(filePath);
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>The requested file was not found.</p>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Server Error</h1><p>Sorry, there was a problem loading the file.</p>', 'utf-8');
                console.error(`Server error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, {
                'Content-Type': contentType,
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'SAMEORIGIN',
                'X-XSS-Protection': '1; mode=block',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
}

function startServer() {
    printBanner();
    
    const server = http.createServer((req, res) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
        
        // Parse URL
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }
        
        // Handle network status endpoint
        if (req.url === '/network-status') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            const localIP = getLocalIP();
            const status = {
                online: true,
                ip: localIP,
                port: PORT,
                url: `http://${localIP}:${PORT}`,
                timestamp: new Date().toISOString()
            };
            res.end(JSON.stringify(status));
            return;
        }
        
        // Security: Prevent directory traversal
        if (filePath.includes('..')) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>400 Bad Request</h1><p>Invalid path.</p>', 'utf-8');
            return;
        }
        
        // Check if file exists
        fs.exists(filePath, (exists) => {
            if (exists) {
                serveFile(filePath, res);
            } else {
                // Try adding .html extension
                if (!path.extname(filePath)) {
                    serveFile(filePath + '.html', res);
                } else {
                    // 404 Not Found
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1><p>The requested file was not found.</p>', 'utf-8');
                }
            }
        });
    });
    
    server.listen(PORT, HOST, () => {
        const localIP = getLocalIP();
        console.log(`🚀 Server started successfully!`);
        console.log(`📡 Listening on ${HOST}:${PORT}`);
        console.log('');
        
        // Try to open browser automatically
        const { exec } = require('child_process');
        const url = `http://localhost:${PORT}`;
        
        switch (process.platform) {
            case 'win32':
                exec(`start ${url}`);
                console.log('🌐 Browser opened automatically');
                break;
            case 'darwin':
                exec(`open ${url}`);
                console.log('🌐 Browser opened automatically');
                break;
            default:
                exec(`xdg-open ${url}`);
                console.log('🌐 Browser opened automatically');
                break;
        }
        
        console.log('⏳ Waiting for connections...');
        console.log('');
    });
    
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use`);
            console.error('💡 Try stopping other servers or use a different port');
        } else if (error.code === 'EACCES') {
            console.error(`❌ Permission denied: Port ${PORT} may require administrator privileges`);
            console.error('💡 Try running as administrator or use a different port');
        } else {
            console.error(`❌ Server error: ${error}`);
        }
        process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Server stopped by user');
        server.close(() => {
            console.log('✅ Server closed gracefully');
            process.exit(0);
        });
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Server terminated');
        server.close(() => {
            console.log('✅ Server closed gracefully');
            process.exit(0);
        });
    });
}

// Start the server
startServer();
