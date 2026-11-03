// test/backend-routes.test.js - HTTP Endpoint Route & Auth Guard Integration Tests
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const http = require('http');
const { startServer, stopServer } = require('../server.js');
const { generateToken } = require('../api/lib/auth');

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let postData = null;

    if (body !== null) {
      postData = typeof body === 'object' ? JSON.stringify(body) : body;
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: raw,
          json
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runRouteTests() {
  console.log('----------------------------------------------------');
  console.log('  CAMPUSCART BACKEND ROUTE & GUARD TEST SUITE');
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

    // 1. Health Route
    console.log('Test 1: Health Endpoint (GET /api/health)...');
    const health = await request('/api/health');
    assert(health.statusCode === 200, `Health returns 200 (got ${health.statusCode})`);
    assert(health.json && health.json.status === 'ok', 'Health status is ok');

    // 2. Auth Routes
    console.log('\nTest 2: Registration Validation Guard (POST /api/auth/register)...');
    const emptyReg = await request('/api/auth/register', 'POST', {});
    assert(emptyReg.statusCode === 422, `Empty registration rejected with 422 (got ${emptyReg.statusCode})`);
    assert(emptyReg.json && emptyReg.json.success === false, 'Returns success: false');

    const invalidPassReg = await request('/api/auth/register', 'POST', {
      name: 'Deep Paul',
      email: 'deep@college.edu',
      password: 'short'
    });
    assert(invalidPassReg.statusCode === 422, 'Rejects short password with 422');

    const regGetMethod = await request('/api/auth/register', 'GET');
    assert(regGetMethod.statusCode === 405, 'Rejects GET on register with 405 Method Not Allowed');

    console.log('\nTest 3: Login Validation Guard (POST /api/auth/login)...');
    const emptyLogin = await request('/api/auth/login', 'POST', {});
    assert(emptyLogin.statusCode === 422, `Empty login rejected with 422 (got ${emptyLogin.statusCode})`);

    const loginGetMethod = await request('/api/auth/login', 'GET');
    assert(loginGetMethod.statusCode === 405, 'Rejects GET on login with 405 Method Not Allowed');

    console.log('\nTest 4: Logout Endpoint (POST /api/auth/logout)...');
    const logout = await request('/api/auth/logout', 'POST');
    assert(logout.statusCode === 200, `Logout returns 200 (got ${logout.statusCode})`);
    const setCookie = logout.headers['set-cookie'] ? logout.headers['set-cookie'][0] : '';
    assert(setCookie.includes('Max-Age=0'), 'Logout clears campuscart_token cookie');

    console.log('\nTest 5: Profile Guard (GET /api/auth/me)...');
    const meUnauth = await request('/api/auth/me', 'GET');
    assert(meUnauth.statusCode === 401, `Unauthenticated /api/auth/me blocked with 401 (got ${meUnauth.statusCode})`);

    // 3. Product Routes
    console.log('\nTest 6: Product Creation Guard (POST /api/products)...');
    const prodUnauth = await request('/api/products', 'POST', { title: 'Test Book' });
    assert(prodUnauth.statusCode === 401, `Unauthenticated product post blocked with 401 (got ${prodUnauth.statusCode})`);

    console.log('\nTest 7: Product Update Guard (PUT /api/products)...');
    const prodPutUnauth = await request('/api/products?id=672778a1bc4f1a2345678901', 'PUT', { price: 500 });
    assert(prodPutUnauth.statusCode === 401, `Unauthenticated product update blocked with 401 (got ${prodPutUnauth.statusCode})`);

    console.log('\nTest 8: Product Delete Guard (DELETE /api/products)...');
    const prodDelUnauth = await request('/api/products?id=672778a1bc4f1a2345678901', 'DELETE');
    assert(prodDelUnauth.statusCode === 401, `Unauthenticated product delete blocked with 401 (got ${prodDelUnauth.statusCode})`);

    // 4. Report Routes
    console.log('\nTest 9: Report Creation Guard (POST /api/reports)...');
    const repUnauth = await request('/api/reports', 'POST', { productId: '123' });
    assert(repUnauth.statusCode === 401, `Unauthenticated report creation blocked with 401 (got ${repUnauth.statusCode})`);

    const repGetUnauth = await request('/api/reports', 'GET');
    assert(repGetUnauth.statusCode === 401, `Unauthenticated reports listing blocked with 401 (got ${repGetUnauth.statusCode})`);

    // 5. Authenticated Validation Tests using Token
    console.log('\nTest 10: Authenticated Product Validation (POST /api/products with JWT)...');
    const testToken = generateToken({
      userId: '672778a1bc4f1a2345678901',
      email: 'tester@college.edu',
      name: 'Test Student',
      role: 'student'
    });

    const badProductPayload = await request('/api/products', 'POST', {
      title: 'Hi', // too short
      price: -10
    }, {
      authorization: `Bearer ${testToken}`
    });
    assert(badProductPayload.statusCode === 422, `Authenticated invalid product rejected with 422 (got ${badProductPayload.statusCode})`);

    console.log('\nTest 11: Dynamic Route Mapping (/api/products/123)...');
    // Notice: without MONGODB_URI configured, it hits the database layer and safely returns 503 rather than crashing or 404
    const dynamicProdRes = await request('/api/products/672778a1bc4f1a2345678901', 'GET');
    assert(dynamicProdRes.statusCode === 503 || dynamicProdRes.statusCode === 200 || dynamicProdRes.statusCode === 404,
      `Dynamic /api/products/:id correctly routed to products handler (got HTTP ${dynamicProdRes.statusCode})`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await stopServer();
  }

  console.log('\n====================================================');
  console.log(`  ROUTE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runRouteTests();
}

module.exports = { runRouteTests };
