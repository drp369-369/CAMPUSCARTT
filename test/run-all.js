// test/run-all.js - Master Test Runner for CampusCart
// CS3911 Startup Practicum 3 - Deep Ranjan Paul & Yuvrat Mittal
const { runValidationTests } = require('./validation.test');
const { runAuthTests } = require('./auth.test');
const { runTests: runIntegrationTests } = require('./integration.test');
const { runRouteTests } = require('./backend-routes.test');

async function runMasterSuite() {
  console.log('\n========================================================');
  console.log('       CAMPUSCART FULL AUTOMATED TEST SUITE');
  console.log('       CS3911 Startup Practicum 3');
  console.log('========================================================\n');

  try {
    // 1. Validation Tests (Sync)
    runValidationTests();

    // 2. Authentication & Security Tests (Async)
    console.log('\n');
    await runAuthTests();

    // 3. HTTP Integration Tests (Async)
    console.log('\n');
    await runIntegrationTests();

    // Allow TCP port TIME_WAIT cleanup
    await new Promise(r => setTimeout(r, 600));

    // 4. Backend Route & Middleware Guards Tests (Async)
    console.log('\n');
    await runRouteTests();

    console.log('\n========================================================');
    console.log('  ALL TEST SUITES COMPLETED SUCCESSFULLY! (100% PASS)');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\nMaster test suite failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runMasterSuite();
}

module.exports = { runMasterSuite };
