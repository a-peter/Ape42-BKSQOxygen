#!/usr/bin/env node
'use strict';

// Minimal static server for dev/preview.html (serves the widget root folder).
// Usage: node dev/server.js [port]

const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT  = path.resolve(__dirname, '..');
const PORT  = parseInt(process.argv[2]) || 8642;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg' };

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const file    = path.join(ROOT, urlPath === '/' ? 'dev/preview.html' : urlPath);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
    });
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}/`));
