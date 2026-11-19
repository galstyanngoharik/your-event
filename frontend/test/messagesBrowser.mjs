import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { browserClient } from './messagesBrowserClient.mjs';
import { messagingFixture, png } from './messagesBrowserFixture.mjs';

const root = resolve(import.meta.dirname, '../dist');
const output = await mkdtemp(join(tmpdir(), 'yourevent-messages-'));
const imagePath = join(output, 'test.png');
await writeFile(imagePath, Buffer.from(png, 'base64'));
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const asset = pathname.startsWith('/assets/') ? join(root, pathname) : join(root, 'index.html');
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' };
    response.writeHead(200, { 'Content-Type': types[extname(asset)] || 'application/octet-stream' });
    response.end(await readFile(asset));
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = browserClient(join(output, 'chrome-profile'));
const { command, evaluate, waitFor } = browser;
const failures = [];
let fixture;
browser.on('Fetch.requestPaused', async ({ requestId, request }, sessionId) => {
  try {
    if (new URL(request.url).origin === origin) {
      await command('Fetch.continueRequest', { requestId }, sessionId);
      return;
    }
    const result = fixture.respond(request);
    await command('Fetch.fulfillRequest', {
      requestId, responseCode: 200,
      responseHeaders: [
        { name: 'Content-Type', value: result.mime || 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: origin },
        { name: 'Access-Control-Allow-Headers', value: 'authorization,content-type' },
        { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
      ],
      body: result.raw || Buffer.from(JSON.stringify(result.data)).toString('base64'),
    }, sessionId);
  } catch (error) {
    failures.push(error.message);
    await command('Fetch.failRequest', { requestId, errorReason: 'Failed' }, sessionId);
  }
});
const deadline = setTimeout(() => {
  console.error('Messages browser test timed out.');
  browser.kill(); server.close(); process.exit(1);
}, 150000);
const checks = [];
try {
  await command('Browser.getVersion');
  for (const role of ['organizer', 'provider']) {
    for (const theme of ['light', 'dark']) {
      for (const width of [390, 768, 1440]) {
        fixture = messagingFixture(role);
        const { targetId } = await command('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await command('Target.attachToTarget', { targetId, flatten: true });
        await command('Page.enable', {}, sessionId);
        await command('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, sessionId);
        await command('Emulation.setDeviceMetricsOverride', { width, height: width < 640 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 640 }, sessionId);
        await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
        await command('Page.addScriptToEvaluateOnNewDocument', {
          source: `localStorage.removeItem('authToken'); localStorage.setItem('yourevent-theme','${theme}'); window.confirm=()=>true;`,
        }, sessionId);
        await command('Page.navigate', { url: `${origin}/login` }, sessionId);
        const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`, sessionId);
        const input = (selector, value) => evaluate(`(() => {
          const element = document.querySelector(${JSON.stringify(selector)});
          const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,${JSON.stringify(value)});
          element.dispatchEvent(new Event('input',{bubbles:true}));
        })()`, sessionId);
        await waitFor(`document.querySelector('input[type="email"]')`, sessionId);
        await input('input[type="email"]', 'test@example.test');
        await input('input[type="password"]', 'BrowserPass123!');
        await click('button[type="submit"]');
        await waitFor(`location.pathname === '/${role}'`, sessionId);
        await evaluate(`history.pushState(null,'','/${role}/messages'); dispatchEvent(new PopStateEvent('popstate'));`, sessionId);
        await waitFor(`document.querySelectorAll('.ye-conversation-card').length === 2`, sessionId);
        await input('[aria-label="Search conversations"]', 'No matching partner');
        await waitFor(`document.querySelectorAll('.ye-conversation-card').length === 0`, sessionId);
        await click('[aria-label="Clear conversation search"]');
        await waitFor(`document.querySelectorAll('.ye-conversation-card').length === 2`, sessionId);
        const listScreenshot = await command('Page.captureScreenshot', { format: 'png' }, sessionId);
        await writeFile(join(output, `${role}-${theme}-${width}-list.png`), Buffer.from(listScreenshot.data, 'base64'));
        await input('[aria-label="Search conversations"]', 'ANI');
        await waitFor(`document.querySelectorAll('.ye-conversation-card').length === 1`, sessionId);
        await click('.ye-conversation-card');
        await waitFor(`document.querySelector('.ye-message-history')?.textContent.includes('The venue is ready.')`, sessionId);
        assert.equal(await evaluate('location.search', sessionId), '?chat=1');
        await waitFor(`(() => { const history = document.querySelector('.ye-message-history');
          return history.scrollHeight > history.clientHeight && history.scrollHeight - history.scrollTop - history.clientHeight < 5; })()`, sessionId);
        const activeScreenshot = await command('Page.captureScreenshot', { format: 'png' }, sessionId);
        await writeFile(join(output, `${role}-${theme}-${width}-active.png`), Buffer.from(activeScreenshot.data, 'base64'));
        await input('[aria-label="Message"]', 'Browser test message');
        await waitFor(`!document.querySelector('[aria-label="Send message"]').disabled`, sessionId);
        await click('[aria-label="Send message"]');
        await waitFor(`document.querySelector('.ye-message-history').textContent.includes('Browser test message')`, sessionId);
        const openLastMenu = async () => {
          await evaluate(`Array.from(document.querySelectorAll('.ye-message-actions summary')).at(-1).click()`, sessionId);
          await waitFor(`document.querySelector('.ye-message-actions[open]')`, sessionId);
        };
        await openLastMenu();
        await evaluate(`document.querySelector('.ye-message-actions[open] button').click()`, sessionId);
        await waitFor(`document.querySelector('[aria-label="Edit message"]')`, sessionId);
        await input('[aria-label="Edit message"]', 'Edited browser message');
        await evaluate(`document.querySelector('[aria-label="Edit message"]').closest('form').querySelector('button[type="submit"]').click()`, sessionId);
        await waitFor(`document.querySelector('.ye-message-history').textContent.includes('Edited browser message')`, sessionId);
        await openLastMenu();
        await evaluate(`document.querySelector('.ye-message-actions[open] button:last-child').click()`, sessionId);
        await waitFor(`document.querySelector('.ye-message-history').textContent.includes('This message was deleted')`, sessionId);
        const { root: documentRoot } = await command('DOM.getDocument', {}, sessionId);
        const { nodeId } = await command('DOM.querySelector', { nodeId: documentRoot.nodeId, selector: '.ye-composer input[type="file"]' }, sessionId);
        await command('DOM.setFileInputFiles', { nodeId, files: [imagePath] }, sessionId);
        await waitFor(`document.querySelector('.ye-composer-preview')`, sessionId);
        await click('[aria-label="Send message"]');
        await waitFor(`document.querySelector('.ye-message-image img')?.complete`, sessionId);
        await click('.ye-message-image');
        await waitFor(`document.querySelector('dialog[open]')`, sessionId);
        await click('[aria-label="Close image preview"]');
        if (width < 768) await click('[aria-label="Back to conversations"]');
        await input('[aria-label="Search conversations"]', 'Alex');
        await waitFor(`document.querySelectorAll('.ye-conversation-card').length === 1 && document.querySelector('.ye-conversation-card').textContent.includes('Alex')`, sessionId);
        await click('.ye-conversation-card');
        await waitFor(`document.querySelector('.ye-message-history').textContent.includes('second conversation')`, sessionId);
        const geometry = await evaluate(`(() => {
          const composer = document.querySelector('.ye-composer').getBoundingClientRect();
          const history = document.querySelector('.ye-message-history');
          return { overflow: document.documentElement.scrollWidth > innerWidth,
            composerVisible: composer.bottom <= innerHeight && composer.top >= 0,
            listVisible: getComputedStyle(document.querySelector('.ye-conversations')).display !== 'none',
            historyScrollable: getComputedStyle(history).overflowY === 'auto',
            theme: document.documentElement.dataset.theme };
        })()`, sessionId);
        assert.equal(geometry.overflow, false);
        assert.equal(geometry.composerVisible, true);
        assert.equal(geometry.listVisible, width >= 768);
        assert.equal(geometry.historyScrollable, true);
        assert.equal(geometry.theme, theme);
        assert.ok(['POST', 'PATCH', 'DELETE'].every(method => fixture.operations.includes(method)));
        const screenshot = await command('Page.captureScreenshot', { format: 'png' }, sessionId);
        await writeFile(join(output, `${role}-${theme}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
        checks.push({ role, theme, width, ...geometry });
        await command('Target.closeTarget', { targetId });
        console.log(`Passed: ${role}, ${theme}, ${width}px — search, switch, send, edit, delete, image upload/preview, layout.`);
      }
    }
  }
  assert.deepEqual(failures, []);
  await writeFile(join(output, 'results.json'), JSON.stringify(checks, null, 2));
  console.log(`12 interactive browser scenarios passed. Screenshots: ${output}`);
} finally {
  clearTimeout(deadline);
  await command('Browser.close').catch(browser.kill);
  await new Promise(resolve => server.close(resolve));
}
