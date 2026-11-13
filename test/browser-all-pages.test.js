// test/browser-all-pages.test.js - Comprehensive Chrome Headless Verification of All Marketplace Pages
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { startServer, stopServer } = require('../server.js');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = 'C:\\Users\\itzpa\\.gemini\\antigravity\\brain\\f63e14b6-ea6e-44a3-a062-f50c36e6672a\\scratch';
const PORT = 3000;

function runChrome(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CHROME_PATH, args);
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve({ code, stderr });
      else reject(new Error(`Chrome exited with code ${code}: ${stderr}`));
    });
  });
}

async function dumpDom(url) {
  let html = '';
  await new Promise((resolve, reject) => {
    const proc = spawn(CHROME_PATH, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--dump-dom',
      url
    ]);
    proc.stdout.on('data', (d) => (html += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed to dump DOM for ${url}: exit code ${code}`));
    });
  });
  return html;
}

async function run() {
  console.log('========================================================');
  console.log('  CAMPUSCART COMPREHENSIVE ALL-PAGES BROWSER TEST');
  console.log('========================================================\n');

  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome not found at ${CHROME_PATH}`);
  }

  await startServer(PORT, '127.0.0.1');

  try {
    const pages = [
      { name: 'Homepage (/)', path: '/', checkText: 'CampusCart', shot: 'page_home.png' },
      { name: 'Explore Marketplace (/explore.html)', path: '/explore.html', checkText: 'Campus Marketplace', shot: 'page_explore.png' },
      { name: 'Product Detail (/product.html?id=item-1)', path: '/product.html?id=item-1', checkText: 'Chat with Seller', shot: 'page_product.png' },
      { name: 'Sell Item (Guard Redirect)', path: '/sell.html', checkText: 'Sign In to CampusCart', shot: 'page_sell_guard.png' },
      { name: 'Safe Meetup Spots (/meetup-spots.html)', path: '/meetup-spots.html', checkText: 'Verified Campus Exchange Spots', shot: 'page_meetup.png' },
      { name: 'Sign In (/login.html)', path: '/login.html', checkText: 'Sign In to CampusCart', shot: 'page_login.png' },
      { name: 'Registration (/register.html)', path: '/register.html', checkText: 'Join Your Campus Marketplace', shot: 'page_register.png' },
    ];

    let passed = 0;

    for (const page of pages) {
      const fullUrl = `http://127.0.0.1:${PORT}${page.path}`;
      const shotPath = path.join(SCRATCH_DIR, page.shot);

      console.log(`Checking ${page.name}...`);

      // 1. Screenshot
      await runChrome([
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,800',
        `--screenshot=${shotPath}`,
        fullUrl
      ]);

      // 2. DOM Check
      const dom = await dumpDom(fullUrl);
      const matches = dom.includes(page.checkText);

      if (matches) {
        console.log(`  [PASS] Rendered correctly with target string: "${page.checkText}"`);
        console.log(`  [PASS] Screenshot captured to ${page.shot} (${fs.statSync(shotPath).size} bytes)`);
        passed++;
      } else {
        console.error(`  [FAIL] Missing text: "${page.checkText}" in rendered DOM for ${page.path}`);
      }
    }

    console.log('\n========================================================');
    console.log(`  BROWSER VERIFICATION: ${passed}/${pages.length} PAGES PASSED`);
    console.log('========================================================\n');

    if (passed !== pages.length) {
      process.exit(1);
    }
  } finally {
    await stopServer();
  }
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
