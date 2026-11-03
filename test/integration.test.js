// test/integration.test.js - Automated Integration Test Suite for CampusCart
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const http = require('http');
const { startServer, stopServer } = require('../server.js');

const TEST_PORT = 3000;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'object' ? JSON.stringify(options.body) : options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('  CAMPUSCART AUTOMATED INTEGRATION TEST SUITE');
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
    console.log(`Starting server on port ${TEST_PORT}...`);
    await startServer(TEST_PORT, '127.0.0.1');
    console.log('Server started successfully.\n');

    // Test 1: Landing Page GET /
    console.log('Test 1: Testing Landing Page (GET /)...');
    const homeRes = await makeRequest('/');
    assert(homeRes.statusCode === 200, `Status code is 200 (got ${homeRes.statusCode})`);
    assert(homeRes.headers['content-type'].includes('text/html'), `Content-Type is text/html`);
    assert(homeRes.body.includes('CampusCart'), `Body contains "CampusCart"`);
    assert(homeRes.body.includes('Your Campus. Your Marketplace.'), `Body contains brand tagline`);
    assert(homeRes.body.includes('CS3911 Startup Practicum 3'), `Body contains course identifier`);

    // Test 2: API Health Check (GET /api/health)
    console.log('\nTest 2: Testing API Health Check (GET /api/health)...');
    const healthRes = await makeRequest('/api/health');
    assert(healthRes.statusCode === 200, `Status code is 200 (got ${healthRes.statusCode})`);
    assert(healthRes.headers['content-type'].includes('application/json'), `Content-Type is application/json`);
    const healthJson = JSON.parse(healthRes.body);
    assert(healthJson.status === 'ok', `JSON status is "ok" (got "${healthJson.status}")`);
    assert(healthJson.app === 'CampusCart API', `JSON app is "CampusCart API"`);
    assert(healthJson.tagline === 'Your Campus. Your Marketplace.', `JSON tagline matches`);

    // Test 3: Static Asset Serving (GET /css/style.css)
    console.log('\nTest 3: Testing Static CSS Asset (GET /css/style.css)...');
    const cssRes = await makeRequest('/css/style.css');
    assert(cssRes.statusCode === 200, `Status code is 200 (got ${cssRes.statusCode})`);
    assert(cssRes.headers['content-type'].includes('text/css'), `Content-Type is text/css`);
    assert(cssRes.body.includes('--primary'), `Contains CSS custom properties`);

    // Test 4: Static JS Config (GET /js/config.js)
    console.log('\nTest 4: Testing Client Config (GET /js/config.js)...');
    const jsRes = await makeRequest('/js/config.js');
    assert(jsRes.statusCode === 200, `Status code is 200 (got ${jsRes.statusCode})`);
    assert(jsRes.headers['content-type'].includes('application/javascript'), `Content-Type is application/javascript`);
    assert(jsRes.body.includes('CampusCartConfig'), `Contains CampusCartConfig definition`);

    // Test 5: Unknown API Route 404 (GET /api/nonexistent)
    console.log('\nTest 5: Testing 404 on Unknown API Route (GET /api/nonexistent)...');
    const notFoundRes = await makeRequest('/api/nonexistent');
    assert(notFoundRes.statusCode === 404, `Status code is 404 (got ${notFoundRes.statusCode})`);
    const notFoundJson = JSON.parse(notFoundRes.body);
    assert(notFoundJson.error === 'Not Found', `Returns Not Found JSON error`);

    // Test 6: Method Not Allowed 405 (POST /api/health)
    console.log('\nTest 6: Testing 405 Method Not Allowed (POST /api/health)...');
    const postHealthRes = await makeRequest('/api/health', { method: 'POST' });
    assert(postHealthRes.statusCode === 405, `Status code is 405 (got ${postHealthRes.statusCode})`);

  } catch (err) {
    console.error('Unexpected test execution error:', err);
    failed++;
  } finally {
    console.log('\nStopping server...');
    await stopServer();
    console.log('Server stopped.');
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };

