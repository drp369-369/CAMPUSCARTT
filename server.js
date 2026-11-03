// server.js - Lightweight local development server for CampusCart
// Runs with zero extra dependencies using Node's native HTTP module.
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Emulate Vercel Serverless Function routing for /api/*
  if (pathname.startsWith('/api/')) {
    const route = pathname.replace(/^\/api\//, '').replace(/\/$/, '');
    const apiFilePath = path.join(__dirname, 'api', `${route}.js`);

    if (fs.existsSync(apiFilePath)) {
      try {
        // Mock res.status and res.json helpers to match Vercel Serverless Function API
        res.status = function (statusCode) {
          res.statusCode = statusCode;
          return res;
        };
        res.json = function (data) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        const handler = require(apiFilePath);
        return await handler(req, res);
      } catch (err) {
        console.error(`API execution error on ${pathname}:`, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
  }

  // Handle Static Files from /public
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();

  // Security check: ensure path stays within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: check if filePath + '.html' exists
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', MIME_TYPES['.html']);
        return fs.createReadStream(htmlPath).pipe(res);
      }

      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head><title>404 - Not Found | CampusCart</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
          <h1>404 - Page Not Found</h1>
          <p>The requested file <code>${pathname}</code> was not found on this campus server.</p>
          <a href="/" style="color: #2563eb;">Return to CampusCart Home</a>
        </body>
        </html>
      `);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  CampusCart Local Server running`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  API Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
