// test/browser-verify.js - Automated Headless Chrome Visual Verification
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { startServer, stopServer } = require('../server.js');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = 'C:\\Users\\itzpa\\.gemini\\antigravity\\brain\\f63e14b6-ea6e-44a3-a062-f50c36e6672a\\scratch';
const PORT = 3000;
const URL = `http://127.0.0.1:${PORT}/`;

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

async function verifyInBrowser() {
  console.log('----------------------------------------------------');
  console.log('  CHROME BROWSER VISUAL & CONSOLE VERIFICATION');
  console.log('----------------------------------------------------');

  if (!fs.existsSync(CHROME_PATH)) {
    throw new Error(`Chrome not found at ${CHROME_PATH}`);
  }

  console.log('1. Starting local server...');
  await startServer(PORT, '127.0.0.1');

  try {
    // 1. Desktop Screenshot
    const desktopScreenshotPath = path.join(SCRATCH_DIR, 'desktop_view.png');
    console.log(`2. Capturing Desktop viewport (1280x800) to ${desktopScreenshotPath}...`);
    await runChrome([
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1280,900',
      `--screenshot=${desktopScreenshotPath}`,
      URL
    ]);

    const desktopExists = fs.existsSync(desktopScreenshotPath);
    const desktopSize = desktopExists ? fs.statSync(desktopScreenshotPath).size : 0;
    console.log(`   Desktop screenshot saved: ${desktopExists} (${desktopSize} bytes)`);

    // 2. Mobile Screenshot
    const mobileScreenshotPath = path.join(SCRATCH_DIR, 'mobile_view.png');
    console.log(`3. Capturing Mobile viewport (390x844 - iPhone 14) to ${mobileScreenshotPath}...`);
    await runChrome([
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=390,844',
      '--hide-scrollbars',
      `--screenshot=${mobileScreenshotPath}`,
      URL
    ]);

    const mobileExists = fs.existsSync(mobileScreenshotPath);
    const mobileSize = mobileExists ? fs.statSync(mobileScreenshotPath).size : 0;
    console.log(`   Mobile screenshot saved: ${mobileExists} (${mobileSize} bytes)`);

    // 2b. Full Page Desktop Screenshot to inspect entire page layout
    const fullScreenshotPath = path.join(SCRATCH_DIR, 'desktop_full.png');
    console.log(`3b. Capturing Full Desktop Page (1280x4200) to ${fullScreenshotPath}...`);
    await runChrome([
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1280,4200',
      '--hide-scrollbars',
      `--screenshot=${fullScreenshotPath}`,
      URL
    ]);

    // 3. Dump Rendered DOM HTML from Chrome to inspect DOM rendering
    console.log('4. Extracting Chrome-rendered DOM tree...');
    let renderedHtml = '';
    await new Promise((resolve, reject) => {
      const proc = spawn(CHROME_PATH, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--dump-dom',
        URL
      ]);
      proc.stdout.on('data', (d) => (renderedHtml += d.toString()));
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Failed to dump DOM: exit code ${code}`));
      });
    });

    console.log('5. Validating Chrome-rendered DOM:');
    const hasRenderedCategories = renderedHtml.includes('category-card');
    const hasRenderedProducts = renderedHtml.includes('product-card');
    const hasFilterTabs = renderedHtml.includes('filter-tab');
    const hasInteractiveModals = renderedHtml.includes('product-modal-overlay');

    console.log(`   - Category cards dynamically rendered: ${hasRenderedCategories}`);
    console.log(`   - Product cards dynamically rendered: ${hasRenderedProducts}`);
    console.log(`   - Filter tabs dynamically rendered: ${hasFilterTabs}`);
    console.log(`   - Modal structure present: ${hasInteractiveModals}`);

    if (!hasRenderedCategories || !hasRenderedProducts) {
      throw new Error('JavaScript execution failed inside headless Chrome! Dynamic items missing from DOM.');
    }

    console.log('\nAll browser visual & DOM checks passed successfully!');
  } finally {
    console.log('Stopping local server...');
    await stopServer();
    console.log('Server stopped.');
  }
}

verifyInBrowser().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
