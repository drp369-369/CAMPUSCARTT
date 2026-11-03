// test/auth.test.js - Authentication & Security Tests
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
  authenticateUser,
  requireAuth,
  requireAdmin
} = require('../api/lib/auth');

async function runAuthTests() {
  console.log('----------------------------------------------------');
  console.log('  CAMPUSCART AUTHENTICATION & SECURITY TEST SUITE');
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

  // 1. Password Hashing with bcrypt
  console.log('Test 1: bcrypt Password Hashing...');
  const plain = 'StrongPass123';
  const hashed = await hashPassword(plain);
  assert(hashed && hashed.startsWith('$2'), 'Produces valid bcrypt hash');
  assert(hashed !== plain, 'Password is not plaintext');

  const matchTrue = await comparePassword(plain, hashed);
  assert(matchTrue === true, 'comparePassword validates correct password');

  const matchFalse = await comparePassword('WrongPassword', hashed);
  assert(matchFalse === false, 'comparePassword rejects incorrect password');

  // 2. JWT Generation & Verification
  console.log('\nTest 2: JWT Session Token Lifecycle...');
  const mockUser = {
    _id: '672778a1bc4f1a2345678901',
    name: 'Deep Ranjan Paul',
    email: 'deep@student.college.edu',
    role: 'student'
  };

  const token = generateToken(mockUser);
  assert(typeof token === 'string' && token.split('.').length === 3, 'Produces valid 3-part JWT token');

  const decoded = verifyToken(token);
  assert(decoded !== null, 'Token verifies successfully');
  assert(decoded.userId === '672778a1bc4f1a2345678901', 'Decodes correct userId');
  assert(decoded.email === 'deep@student.college.edu', 'Decodes correct email');
  assert(decoded.role === 'student', 'Decodes correct role');

  const tamperedToken = token.slice(0, -5) + 'abcde';
  assert(verifyToken(tamperedToken) === null, 'Rejects tampered JWT token');

  // 3. Token Extraction
  console.log('\nTest 3: Token Extraction from Headers & Cookies...');
  const reqWithBearer = {
    headers: { authorization: `Bearer ${token}` }
  };
  assert(extractToken(reqWithBearer) === token, 'Extracts token from Authorization: Bearer header');

  const reqWithCookie = {
    headers: { cookie: `other_pref=dark; campuscart_token=${token}; lang=en` }
  };
  assert(extractToken(reqWithCookie) === token, 'Extracts token from campuscart_token cookie');

  const reqEmpty = { headers: {} };
  assert(extractToken(reqEmpty) === null, 'Returns null when no token is present');

  // 4. Authenticate Middleware
  console.log('\nTest 4: authenticateUser Middleware...');
  const reqAuth = { headers: { authorization: `Bearer ${token}` } };
  const user = authenticateUser(reqAuth);
  assert(user !== null && reqAuth.user.userId === mockUser._id, 'Attaches decoded user to req.user');

  // 5. RequireAuth Middleware Guard
  console.log('\nTest 5: requireAuth Higher-Order Guard...');
  let handlerCalled = false;
  const mockHandler = async (req, res) => {
    handlerCalled = true;
    res.statusCode = 200;
  };

  const protectedHandler = requireAuth(mockHandler);

  // Unauthenticated request
  const unauthRes = {
    statusCode: 0,
    setHeader() {},
    end(str) { this.body = JSON.parse(str); }
  };
  await protectedHandler({ headers: {} }, unauthRes);
  assert(unauthRes.statusCode === 401, 'Blocks unauthenticated request with HTTP 401');
  assert(!handlerCalled, 'Inner handler not called for unauthenticated request');

  // Authenticated request
  handlerCalled = false;
  const authRes = { statusCode: 0, setHeader() {}, end() {} };
  await protectedHandler({ headers: { authorization: `Bearer ${token}` } }, authRes);
  assert(handlerCalled, 'Inner handler called for authenticated request');

  console.log('\n====================================================');
  console.log(`  AUTH RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runAuthTests();
}

module.exports = { runAuthTests };
