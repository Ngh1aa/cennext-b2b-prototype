/*
 * End-to-end test for the G.I.E concept prototype.
 * Run: py -3 -m http.server 8906 --bind 127.0.0.1   (repo root)
 *      NODE_PATH=<dir with playwright> node tests/e2e.cjs
 * Exits 1 on any failed check.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8906/';
const PAGES = ['index.html', 'services.html', 'service.html?id=automation', 'service.html?id=repair', 'service.html?id=missing',
  'programs.html', 'program.html?id=volume-repair', 'program.html?id=planned-maintenance', 'program.html?id=missing',
  'repair-vs-replace.html', 'why-gie.html', 'contact.html', 'rfq.html', 'requests.html', 'request.html?id=RFQ-1001',
  'request.html?id=RFQ-1002', 'request.html?id=missing', 'design-system.html', 'component-states.html', 'sitemap.html',
  'user-flow.html', 'prototype.html'];

const results = [];
async function check(name, fn) {
  try { await fn(); results.push([name, true]); console.log(`PASS ${name}`); }
  catch (error) { results.push([name, false]); console.log(`FAIL ${name}\n     ${String(error.message).split('\n')[0]}`); }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${page.url()}: ${m.text()}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${page.url()}: ${e.message}`));
  const go = (path) => page.goto(BASE + path, { waitUntil: 'load' });
  const text = (selector) => page.locator(selector).first().innerText();

  await check('every page loads without console errors and has no href="#"', async () => {
    for (const path of PAGES) {
      await go(path);
      await page.waitForLoadState('networkidle');
      const empty = await page.locator('a[href="#"], a:not([href])').count();
      assert.equal(empty, 0, `${path} has ${empty} empty links`);
    }
  });

  await check('reset demo data restores the seed', async () => {
    await go('requests.html');
    await page.waitForSelector('.c-request-row');
    await page.click('#demo-reset');
    await page.waitForSelector('dialog[open]');
    await Promise.all([page.waitForEvent('load'), page.click('dialog [data-value="ok"]')]);
    await page.waitForSelector('.ui-toast:not([hidden])');
    assert.match(await text('.ui-toast'), /reset/i);
    await page.waitForSelector('.c-request-row');
    assert.equal(await page.locator('.c-request-row').count(), 2);
  });

  await check('service detail shows scope, process, deliverables, related programs and CTA', async () => {
    await go('service.html?id=integration');
    await page.waitForSelector('h1:has-text("System integration")');
    assert.equal(await page.locator('.c-process li').count(), 4);
    assert.match(await text('.c-detail-aside'), /Proposed deliverables/);
    await page.click('.c-link-card');
    await page.waitForSelector('h1:has-text("Modernization roadmap")');
    await go('service.html?id=integration');
    await page.waitForSelector('a:has-text("Start a brief for this service")');
    await page.click('a:has-text("Start a brief for this service")');
    await page.waitForSelector('#f-service');
    assert.equal(await page.locator('input[name="service"][value="integration"]').isChecked(), true);
  });

  await check('service detail not-found state', async () => {
    await go('service.html?id=missing');
    await page.waitForSelector('h1:has-text("could not find that service")');
    assert.equal(await page.locator('.ui-link-list a').count(), 4);
  });

  await check('programs list and program detail with not-found state', async () => {
    await go('programs.html');
    await page.waitForSelector('#program-list .program-link');
    assert.equal(await page.locator('#program-list .program-link').count(), 3);
    await page.locator('#program-list .program-link').nth(1).click();
    await page.waitForSelector('h1:has-text("Planned maintenance program")');
    assert.equal(await page.locator('.program-card').count(), 4);
    await page.click('a:has-text("Start a program brief")');
    await page.waitForSelector('#f-service');
    assert.match(await page.locator('#f-program').inputValue(), /planned-maintenance/);
    await go('program.html?id=missing');
    await page.waitForSelector('h1:has-text("Program not found")');
  });

  await check('repair vs replace tool validates, gives a result and carries it into the brief', async () => {
    await go('repair-vs-replace.html');
    await page.click('#rvr-form button[type="submit"]');
    await page.waitForSelector('#rvr-errors:not([hidden])');
    assert.equal(await page.locator('#rvr-errors li').count(), 7);
    await page.fill('#rvr-hp', '150');
    await page.selectOption('#rvr-age', 'mid');
    await page.selectOption('#rvr-failure', 'winding');
    await page.check('input[name="parts"][value="available"]');
    await page.check('input[name="special"][value="no"]');
    await page.selectOption('#rvr-lead', 'long');
    await page.selectOption('#rvr-downtime', 'high');
    await page.click('#rvr-form button[type="submit"]');
    await page.waitForSelector('#rvr-verdict-title');
    assert.match(await text('#rvr-verdict-title'), /Repair looks favourable/i);
    await page.click('#rvr-carry');
    await page.waitForURL(/rfq\.html\?id=RFQ-\d+&step=2/);
    await page.waitForSelector('#f-type');
    assert.match(await text('#rfq-panel .ui-note'), /Repair looks favourable/);
    assert.equal(await page.locator('#f-type').inputValue(), 'Electric motor');
  });

  let reference = '';
  await check('brief builder: seven steps, inline validation, autosave, attachments, failure and confirmation', async () => {
    await go('rfq.html?new=1');
    await page.waitForSelector('#rfq-step-title');
    // Step 1: required service
    await page.click('#rfq-form button[type="submit"]');
    await page.waitForSelector('#rfq-errors:not([hidden])');
    await page.check('input[name="service"][value="automation"]');
    await page.waitForSelector('#rfq-save[data-state="saved"]');
    reference = (await text('#rfq-save')).match(/RFQ-\d+/)[0];
    await page.click('#rfq-form button[type="submit"]');
    // Step 2: inline validation on blur
    await page.waitForSelector('#f-description');
    await page.fill('#f-description', 'too short');
    await page.locator('#f-description').blur();
    await page.waitForSelector('#f-description-error:not([hidden])');
    assert.equal(await page.locator('#f-description').getAttribute('aria-invalid'), 'true');
    await page.fill('#f-description', 'Connect the new palletiser to the existing line controls.');
    await page.selectOption('#f-type', 'Production line');
    await page.fill('#f-site', 'Packing hall');
    await page.fill('#f-quantity', '2');
    await page.click('#rfq-form button[type="submit"]');
    // Step 3, then reload to prove the draft survives
    await page.waitForSelector('input[name="urgency"]');
    await page.check('input[name="urgency"][value="urgent"]');
    await page.waitForSelector('#urgent-note');
    await page.selectOption('#f-budget', '$10,000 to $50,000');
    await page.fill('#f-startDate', '2020-01-01');
    await page.locator('#f-startDate').blur();
    await page.waitForSelector('#f-startDate-error:not([hidden])');
    await page.fill('#f-startDate', '');
    await page.waitForSelector('#rfq-save[data-state="saved"]');
    await page.reload();
    await page.waitForSelector('#f-budget');
    assert.equal(await page.locator('#f-budget').inputValue(), '$10,000 to $50,000');
    assert.equal(await page.locator('input[name="urgency"][value="urgent"]').isChecked(), true);
    await page.click('#rfq-form button[type="submit"]');
    // Step 4: attachments, names only, list and remove
    await page.waitForSelector('.c-dropzone');
    assert.match(await text('.c-files'), /No files added/);
    await page.setInputFiles('#f-files', [
      { name: 'layout.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') },
      { name: 'io-list.csv', mimeType: 'text/csv', buffer: Buffer.from('a,b') }
    ]);
    await page.waitForSelector('.c-file-list li >> nth=1');
    await page.click('button[data-remove="0"]');
    await page.waitForFunction(() => document.querySelectorAll('.c-file-list li').length === 1);
    assert.match(await text('.c-file-list'), /io-list\.csv/);
    await page.click('#rfq-form button[type="submit"]');
    // Step 5: contact validation
    await page.waitForSelector('#f-email');
    await page.fill('#f-name', 'Test Engineer');
    await page.fill('#f-company', 'Test Plant');
    await page.fill('#f-email', 'not-an-email');
    await page.locator('#f-email').blur();
    await page.waitForSelector('#f-email-error:not([hidden])');
    await page.check('input[name="method"][value="Phone"]');
    await page.click('#rfq-form button[type="submit"]');
    await page.waitForSelector('#rfq-errors:not([hidden])');
    assert.equal(await page.locator('#rfq-errors li').count(), 2);
    await page.fill('#f-email', 'test@example.com');
    await page.fill('#f-phone', '+1 555 010 0199');
    await page.click('#rfq-form button[type="submit"]');
    // Step 6: review, edit link, simulated failure then retry
    await page.waitForSelector('#rfq-submit');
    assert.match(await text('#rfq-panel'), /io-list\.csv/);
    await page.click('[data-goto="2"]');
    await page.waitForSelector('#f-site');
    await page.click('[data-review]');
    await page.waitForSelector('#rfq-submit');
    await page.check('#demo-fail');
    await page.click('#rfq-submit');
    await page.waitForSelector('#rfq-submit-error:not([hidden])');
    await page.click('#rfq-submit-error [data-retry]');
    // Step 7: confirmation with a reference and an honest note
    await page.waitForSelector('.c-confirm');
    const confirmation = await text('.c-confirm');
    assert.match(confirmation, new RegExp(reference));
    assert.match(confirmation, /Nothing was sent/);
  });

  await check('my requests: list, filters, search empty state and submitted status', async () => {
    await go('requests.html');
    await page.waitForSelector('.c-request-row');
    assert.match(await text(`.c-request-row:has-text("${reference}")`), /Submitted/);
    await page.click('[data-filter="draft"]');
    await page.waitForFunction(() => [...document.querySelectorAll('.c-request-row .ui-badge')].every((b) => b.textContent === 'Draft'));
    await page.fill('#request-search', 'zzzz-no-match');
    await page.waitForSelector('text=No requests match');
    await page.click('[data-clear]');
    await page.waitForSelector('.c-request-row');
  });

  await check('request detail: locked edit, duplicate, withdraw with status timeline', async () => {
    await go(`request.html?id=${reference}`);
    await page.waitForSelector('.c-timeline');
    assert.equal(await page.locator('.c-detail-actions button:has-text("Edit")').isDisabled(), true);
    await page.click('[data-action="withdraw"]');
    await page.waitForSelector('dialog[open]');
    await page.click('dialog [data-value="ok"]');
    await page.waitForSelector('.c-timeline__item.is-withdrawn');
    assert.match(await text('.c-detail-meta'), /Withdrawn/);
    await page.click('[data-action="duplicate"]');
    await page.waitForURL(/rfq\.html\?id=RFQ-\d+/);
    await page.waitForSelector('#rfq-step-title');
    const copy = new URL(page.url()).searchParams.get('id');
    assert.notEqual(copy, reference);
    await go(`request.html?id=${copy}`);
    await page.waitForSelector('a:has-text("Continue editing")');
    await page.click('a:has-text("Continue editing")');
    await page.waitForSelector('#rfq-submit');
    await go(`rfq.html?id=${reference}`);
    await page.waitForSelector('text=can no longer be edited');
  });

  await check('request detail not-found state', async () => {
    await go('request.html?id=RFQ-0000');
    await page.waitForSelector('h1:has-text("Request not found")');
  });

  await check('simulated load failure shows a recoverable error', async () => {
    await go('requests.html');
    await page.waitForSelector('.c-request-row');
    await page.check('#demo-fail');
    await go('requests.html');
    await page.waitForSelector('.ui-state--error');
    await page.click('[data-retry]');
    await page.waitForSelector('.c-request-row');
  });

  await check('empty request list state', async () => {
    await page.evaluate(() => { const s = JSON.parse(sessionStorage.getItem('gie-demo-state')); s.requests = []; sessionStorage.setItem('gie-demo-state', JSON.stringify(s)); });
    await go('requests.html');
    await page.waitForSelector('h2:has-text("No requests yet")');
  });

  await check('contact form: validation, failure, retry and honest success', async () => {
    await go('contact.html');
    await page.click('#contact-submit');
    await page.waitForSelector('#contact-errors:not([hidden])');
    assert.equal(await page.locator('#contact-errors li').count(), 4);
    await page.fill('#c-name', 'Test Engineer');
    await page.fill('#c-email', 'test@example.com');
    await page.selectOption('#c-topic', 'Plant support programs');
    await page.fill('#c-message', 'Short');
    await page.locator('#c-message').blur();
    await page.waitForSelector('#c-message-error:not([hidden])');
    await page.fill('#c-message', 'Which program suits a plant with twenty critical motors?');
    await page.check('#demo-fail');
    await page.click('#contact-submit');
    await page.waitForSelector('#contact-failure:not([hidden])');
    assert.equal(await page.locator('#c-message').inputValue(), 'Which program suits a plant with twenty critical motors?');
    await page.click('#contact-retry');
    await page.waitForSelector('#contact-success:not([hidden])');
    assert.match(await text('#contact-success'), /MSG-0001/);
    assert.match(await text('#contact-success'), /Nothing was sent/);
  });

  await check('reset after changes restores both examples', async () => {
    await go('index.html');
    await page.click('#demo-reset');
    await page.waitForSelector('dialog[open]');
    await Promise.all([page.waitForEvent('load'), page.click('dialog [data-value="ok"]')]);
    await page.waitForSelector('.ui-toast:not([hidden])');
    await go('requests.html');
    await page.waitForSelector('.c-request-row');
    assert.equal(await page.locator('.c-request-row').count(), 2);
  });

  await check('no console errors during the run', async () => {
    assert.deepEqual(consoleErrors, []);
  });

  await browser.close();
  const failed = results.filter(([, ok]) => !ok).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
