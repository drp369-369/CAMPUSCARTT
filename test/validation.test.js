// test/validation.test.js - Comprehensive Input & Schema Validation Tests
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const {
  validateUniversityEmail,
  validateUserRegistration,
  validateUserLogin,
  validateProductListing,
  validateReport
} = require('../api/lib/validation');

function runValidationTests() {
  console.log('----------------------------------------------------');
  console.log('  CAMPUSCART VALIDATION & SCHEMA GUARD TEST SUITE');
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

  // 1. Email Domain Validation
  console.log('Test 1: Email Domain Verification...');
  assert(!validateUniversityEmail('not-an-email').valid, 'Rejects invalid string');
  assert(!validateUniversityEmail('user@').valid, 'Rejects missing domain');
  assert(validateUniversityEmail('student@university.edu.in').valid, 'Accepts standard university email');

  // Test configured domain whitelist
  process.env.ALLOWED_EMAIL_DOMAINS = 'rvu.edu.in,student.rvu.edu.in';
  assert(validateUniversityEmail('deep@student.rvu.edu.in').valid, 'Accepts allowed student.rvu.edu.in domain');
  assert(validateUniversityEmail('prof@rvu.edu.in').valid, 'Accepts allowed rvu.edu.in domain');
  const rejectedDomain = validateUniversityEmail('user@gmail.com');
  assert(!rejectedDomain.valid, 'Rejects unverified public domain (gmail.com)');
  delete process.env.ALLOWED_EMAIL_DOMAINS;

  // 2. User Registration Validation
  console.log('\nTest 2: User Registration Payload Validation...');
  const validReg = validateUserRegistration({
    name: 'Yuvrat Mittal',
    email: 'yuvrat@college.edu',
    password: 'Password123',
    branch: 'CSE',
    year: '3rd Year'
  });
  assert(validReg.valid, 'Valid registration payload passes');
  assert(validReg.sanitized.profile.branch === 'CSE', 'Sanitizes branch profile field');

  const shortPass = validateUserRegistration({
    name: 'Deep',
    email: 'deep@college.edu',
    password: 'short'
  });
  assert(!shortPass.valid, 'Rejects password shorter than 8 characters');

  const noNumberPass = validateUserRegistration({
    name: 'Deep',
    email: 'deep@college.edu',
    password: 'passwordonly'
  });
  assert(!noNumberPass.valid, 'Rejects password without a number');

  // 3. User Login Validation
  console.log('\nTest 3: User Login Payload Validation...');
  assert(validateUserLogin({ email: 'deep@college.edu', password: 'Password123' }).valid, 'Valid login credentials pass');
  assert(!validateUserLogin({ email: '', password: 'Password123' }).valid, 'Rejects empty email');
  assert(!validateUserLogin({ email: 'deep@college.edu', password: '' }).valid, 'Rejects empty password');

  // 4. Product Listing Validation
  console.log('\nTest 4: Product Listing Schema Validation...');
  const validProduct = validateProductListing({
    title: 'Casio fx-991EX ClassWiz',
    description: 'Scientific calculator used for 1 semester in good condition.',
    category: 'stationery',
    price: 850,
    originalPrice: 1500,
    condition: 'Excellent',
    location: 'Block C'
  });
  assert(validProduct.valid, 'Valid product payload passes');
  assert(validProduct.sanitized.price === 850, 'Price parsed correctly');

  const badCategory = validateProductListing({
    title: 'Casio Calculator',
    description: 'Scientific calculator in good condition.',
    category: 'invalid_category_xyz',
    price: 800
  });
  assert(!badCategory.valid, 'Rejects unlisted category');

  const badPrice = validateProductListing({
    title: 'Casio Calculator',
    description: 'Scientific calculator in good condition.',
    category: 'stationery',
    price: -50
  });
  assert(!badPrice.valid, 'Rejects negative price');

  const shortDesc = validateProductListing({
    title: 'Casio Calculator',
    description: 'Too short',
    category: 'stationery',
    price: 500
  });
  assert(!shortDesc.valid, 'Rejects description shorter than 10 characters');

  // 5. Report Listing Validation
  console.log('\nTest 5: Report Listing Payload Validation...');
  const validReport = validateReport({
    productId: '672778a1bc4f1a2345678901',
    reason: 'scam',
    details: 'Seller asking for advance deposit.'
  });
  assert(validReport.valid, 'Valid report payload passes');

  const badReason = validateReport({
    productId: '672778a1bc4f1a2345678901',
    reason: 'not_a_real_reason'
  });
  assert(!badReason.valid, 'Rejects unlisted report reason');

  const missingId = validateReport({
    reason: 'inappropriate'
  });
  assert(!missingId.valid, 'Rejects report missing productId');

  console.log('\n====================================================');
  console.log(`  VALIDATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runValidationTests();
}

module.exports = { runValidationTests };
