// test/e2e-interactions.test.js - End-to-end interactive DOM testing in headless Chrome
const { spawn } = require('child_process');
const { startServer, stopServer } = require('../server.js');

const PORT = 3000;
const URL = `http://127.0.0.1:${PORT}/`;

// Script injected into Chrome to simulate actual user interactions
const clientTestScript = `
  window.addEventListener('load', function runInteractionTests() {
    const results = [];
    function check(name, pass, detail = '') {
      results.push({ name, pass, detail });
    }

    try {
      // 1. Initial State
      const cards = document.querySelectorAll('.product-card');
      check('Product cards rendered', cards.length === 6, 'Found ' + cards.length + ' cards');

      // 2. Open Modal Interaction
      if (cards.length > 0) {
        cards[0].click();
        const modal = document.getElementById('product-modal-overlay');
        const modalActive = modal && modal.classList.contains('active');
        check('Modal opens on card click', modalActive);

        // Check Modal content
        const modalBody = document.getElementById('modal-body-content');
        check('Modal contains seller contact button', !!modalBody.querySelector('#modal-contact-seller-btn'));

        // Close Modal
        const closeBtn = document.getElementById('modal-close-btn');
        closeBtn.click();
        check('Modal closes on close button click', !modal.classList.contains('active'));
      }

      // 3. Category Filter Tab Interaction
      const tabs = document.querySelectorAll('.filter-tab');
      const textbooksTab = Array.from(tabs).find(t => t.textContent.includes('Textbooks'));
      if (textbooksTab) {
        textbooksTab.click();
        const filteredCards = document.querySelectorAll('.product-card');
        check('Filter tab isolates textbooks category', filteredCards.length === 1, 'Found ' + filteredCards.length + ' cards');
      }

      // Reset to all
      const allTab = Array.from(tabs).find(t => t.textContent.includes('All'));
      if (allTab) {
        allTab.click();
        check('Reset tab restores all listings', document.querySelectorAll('.product-card').length === 6);
      }

      // 4. Search Filter Interaction
      const headerSearch = document.getElementById('header-search-input');
      if (headerSearch) {
        headerSearch.value = 'Casio';
        headerSearch.dispatchEvent(new Event('input'));
        const searchResults = document.querySelectorAll('.product-card');
        check('Header search filters by keyword', searchResults.length === 1 && searchResults[0].textContent.includes('Casio'));
      }

      const dumpEl = document.getElementById('__e2e_dump');
      if (dumpEl) {
        dumpEl.setAttribute('data-results', JSON.stringify(results));
      }
    } catch (err) {
      const dumpEl = document.getElementById('__e2e_dump');
      if (dumpEl) {
        dumpEl.setAttribute('data-results', JSON.stringify([{ name: 'Exception during test', pass: false, detail: err.message }]));
      }
    }
  });
`;

async function run() {
  console.log('----------------------------------------------------');
  console.log('  CAMPUSCART FRONTEND INTERACTION E2E TEST');
  console.log('----------------------------------------------------');

  await startServer(PORT, '127.0.0.1');

  try {
    // Inject the interaction test script into the page and dump DOM with result marker
    const fs = require('fs');
    const indexHtml = fs.readFileSync('public/index.html', 'utf8');
    const injectedHtml = indexHtml.replace(
      '</body>',
      `<div id="__e2e_dump"></div><script>${clientTestScript}</script></body>`
    );
    fs.writeFileSync('public/test-e2e.html', injectedHtml);

    let html = '';
    await new Promise((resolve, reject) => {
      const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--dump-dom',
        `http://127.0.0.1:${PORT}/test-e2e.html`
      ]);
      proc.stdout.on('data', d => html += d.toString());
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Chrome failed with code ${code}`));
      });
    });

    fs.unlinkSync('public/test-e2e.html');

    const match = html.match(/id="__e2e_dump" data-results="([^"]+)"/);
    if (!match) {
      throw new Error('Could not find __e2e_dump in rendered DOM');
    }

    const unescaped = match[1].replace(/&quot;/g, '"');
    const results = JSON.parse(unescaped);

    let passed = 0;
    let failed = 0;
    results.forEach(r => {
      if (r.pass) {
        console.log(`  [PASS] ${r.name} ${r.detail ? '(' + r.detail + ')' : ''}`);
        passed++;
      } else {
        console.error(`  [FAIL] ${r.name} - ${r.detail}`);
        failed++;
      }
    });

    console.log('\n====================================================');
    console.log(`  E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } finally {
    await stopServer();
  }
}

run().catch(err => {
  console.error('E2E execution failed:', err);
  process.exit(1);
});
