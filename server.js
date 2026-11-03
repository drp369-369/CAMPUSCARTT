// server.js - Robust local development server for CampusCart
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const http = require('http');
const fs = require('fs');
const path = require('path');

// Lightweight .env file loader for local development without external dependencies
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

loadEnvFile(path.join(__dirname, '.env'));

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper: Parse request body for POST/PUT requests
function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(req.method)) {
      return resolve(null);
    }
    let bodyChunks = [];
    req.on('data', (chunk) => bodyChunks.push(chunk));
    req.on('end', () => {
      const rawBody = Buffer.concat(bodyChunks).toString();
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          return resolve(JSON.parse(rawBody));
        } catch {
          return resolve(rawBody);
        }
      }
      resolve(rawBody);
    });
    req.on('error', () => resolve(null));
  });
}

// Request dispatcher
async function requestHandler(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = reqUrl.pathname;

  // Emulate Vercel Serverless Function routing for /api/*
  if (pathname.startsWith('/api/')) {
    const route = pathname.replace(/^\/api\//, '').replace(/\/$/, '');
    
    // Check both /api/<route>.js and /api/<route>/index.js
    const candidatePath1 = path.join(__dirname, 'api', `${route}.js`);
    const candidatePath2 = path.join(__dirname, 'api', route, 'index.js');
    let apiFilePath = null;

    if (fs.existsSync(candidatePath1) && fs.statSync(candidatePath1).isFile()) {
      apiFilePath = candidatePath1;
    } else if (fs.existsSync(candidatePath2) && fs.statSync(candidatePath2).isFile()) {
      apiFilePath = candidatePath2;
    }

    if (apiFilePath) {
      try {
        // Convert searchParams into a plain object for req.query
        const queryObj = {};
        for (const [key, value] of reqUrl.searchParams.entries()) {
          queryObj[key] = value;
        }
        req.query = queryObj;
        req.body = await parseRequestBody(req);

        res.status = function (statusCode) {
          res.statusCode = statusCode;
          return res;
        };

        res.json = function (data) {
          res.setHeader('Content-Type', 'application/json; charset=UTF-8');
          res.end(JSON.stringify(data));
          return res;
        };

        res.send = function (data) {
          if (typeof data === 'object') {
            return res.json(data);
          }
          res.end(data);
          return res;
        };

        // Clear module cache in development for hot reloading of API functions
        if (process.env.NODE_ENV !== 'production') {
          delete require.cache[require.resolve(apiFilePath)];
        }

        const handler = require(apiFilePath);
        return await handler(req, res);
      } catch (err) {
        console.error(`[API Error] ${pathname}:`, err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        return res.end(JSON.stringify({
          error: 'Internal Server Error',
          message: err.message,
          route: pathname
        }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      return res.end(JSON.stringify({
        error: 'Not Found',
        message: `API endpoint '${pathname}' does not exist.`
      }));
    }
  }

  // Handle Static Files from /public
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const normalizedPath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, normalizedPath);
  const ext = path.extname(filePath).toLowerCase();

  // Security check: prevent directory traversal attacks
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    return res.end('Access Denied: Path traversal detected');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check for clean URLs (e.g. /about -> /about.html)
      const htmlCandidate = filePath + '.html';
      if (fs.existsSync(htmlCandidate) && fs.statSync(htmlCandidate).isFile()) {
        res.statusCode = 200;
        res.setHeader('Content-Type', MIME_TYPES['.html']);
        return fs.createReadStream(htmlCandidate).pipe(res);
      }

      // Friendly 404 Fallback
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>404 - Not Found | CampusCart</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 4rem; background: #f8fafc; color: #0f172a; }
            .card { background: #fff; max-width: 500px; margin: 0 auto; padding: 2.5rem; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            h1 { color: #ef4444; font-size: 2rem; margin-bottom: 0.5rem; }
            p { color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; }
            a { display: inline-block; background: #2563eb; color: #fff; padding: 0.6rem 1.25rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The campus resource <code>${escapeHtml(pathname)}</code> does not exist.</p>
            <a href="/">Back to CampusCart Home</a>
          </div>
        </body>
        </html>
      `);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    fs.createReadStream(filePath).pipe(res);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const server = http.createServer(requestHandler);

function startServer(port = PORT, host = HOST) {
  return new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      console.log(`===============================================`);
      console.log(`  CampusCart Local Server running`);
      console.log(`  URL: http://localhost:${port}`);
      console.log(`  API Health: http://localhost:${port}/api/health`);
      console.log(`===============================================`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

function stopServer() {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { server, startServer, stopServer, requestHandler };
