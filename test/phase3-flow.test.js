// test/phase3-flow.test.js - Phase 3 Frontend-Backend Integration Test & Visual Verification
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { startServer, stopServer } = require('../server.js');

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = 'C:\\Users\\itzpa\\.gemini\\antigravity\\brain\\f63e14b6-ea6e-44a3-a062-f50c36e6672a\\scratch';

function makeRequest(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    }).on('error', reject);
  });
}

function captureScreenshot(pagePath, outputFileName, width = 1280, height = 900) {
  return new Promise((resolve, reject) => {
    const dest = path.join(SCRATCH_DIR, outputFileName);
    const proc = spawn(CHROME_PATH, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--window-size=${width},${height}`,
      '--hide-scrollbars',
      `--screenshot=${dest}`,
      `${BASE_URL}${pagePath}`
    ]);
    proc.on('close', code => {
      if (code === 0) resolve(dest);
      else reject(new Error(`Screenshot failed with code ${code}`));
    });
  });
}

async function runPhase3Tests() {
  console.log('----------------------------------------------------');
  console.log('  CAMPUSCART PHASE 3 FLOW & FRONTEND VERIFICATION');
  console.log('----------------------------------------------------');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await startServer(PORT, '127.0.0.1');

    // 1. Verify Page Deliveries (HTTP 200)
    console.log('Test 1: Verifying Frontend Pages & Scripts...');
    const pages = [
      { path: '/', titleCheck: 'CampusCart' },
      { path: '/login.html', titleCheck: 'Sign In' },
      { path: '/register.html', titleCheck: 'Registration' },
      { path: '/explore.html', titleCheck: 'Marketplace' },
      { path: '/sell.html', titleCheck: 'Sell' },
      { path: '/dashboard.html', titleCheck: 'Dashboard' },
      { path: '/product.html?id=prod-001', titleCheck: 'Product' },
      { path: '/js/api.js', scriptCheck: 'CampusCartAPI' },
      { path: '/js/auth.js', scriptCheck: 'CampusCartAuth' }
    ];

    for (const page of pages) {
      const res = await makeRequest(page.path);
      assert(res.statusCode === 200, `GET ${page.path} returns HTTP 200`);
      if (page.titleCheck) {
        assert(res.body.includes(page.titleCheck), `Page body contains "${page.titleCheck}"`);
      }
      if (page.scriptCheck) {
        assert(res.body.includes(page.scriptCheck), `Script defines "${page.scriptCheck}"`);
      }
    }

    // 2. Headless Chrome Visual Capture of All Marketplace Pages
    console.log('\nTest 2: Headless Chrome Visual Screenshots...');
    if (fs.existsSync(CHROME_PATH)) {
      const screenshots = [
        { path: '/login.html', file: 'p3_login.png' },
        { path: '/register.html', file: 'p3_register.png' },
        { path: '/explore.html', file: 'p3_explore.png' },
        { path: '/sell.html', file: 'p3_sell.png' },
        { path: '/dashboard.html', file: 'p3_dashboard.png' },
        { path: '/product.html?id=prod-001', file: 'p3_product.html.png' }
      ];

      for (const s of screenshots) {
        const fileLoc = await captureScreenshot(s.path, s.file);
        const exists = fs.existsSync(fileLoc);
        const size = exists ? fs.statSync(fileLoc).size : 0;
        assert(exists && size > 50000, `Captured screenshot ${s.file} (${size} bytes)`);
      }
    } else {
      console.warn('Chrome executable not found for visual screenshots.');
    }

    // 3. Inspect Rendered DOM & Client Script Execution in Explore Page
    console.log('\nTest 3: Chrome Dynamic DOM Execution on Explore Page...');
    let exploreDom = '';
    await new Promise((resolve) => {
      const proc = spawn(CHROME_PATH, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--dump-dom',
        `${BASE_URL}/explore.html`
      ]);
      proc.stdout.on('data', d => exploreDom += d.toString());
      proc.on('close', resolve);
    });

    assert(exploreDom.includes('product-card'), 'Explore page renders dynamic product cards');
    assert(exploreDom.includes('filter-tab'), 'Explore page renders category filter pills');
    assert(exploreDom.includes('Explore Marketplace'), 'Explore page title is verified');

  } catch (err) {
    console.error('Phase 3 test execution error:', err);
    failed++;
  } finally {
    await stopServer();
  }

  console.log('\n====================================================');
  console.log(`  PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase3Tests();
}

module.exports = { runPhase3Tests };
