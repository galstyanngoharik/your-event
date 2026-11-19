// Optional local visual check with the installed Chrome; API/database records are never changed.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const output = await mkdtemp(join(tmpdir(), 'yourevent-premium-'));
const fixtures = spawnSync(process.execPath, ['--test', 'test/premiumRoutes.test.mjs'], {
  cwd: resolve(import.meta.dirname, '..'),
  env: { ...process.env, YOUREVENT_UI_CAPTURE_DIR: output }, encoding: 'utf8',
});
if (fixtures.status !== 0) throw new Error(fixtures.stdout + fixtures.stderr);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless', '--remote-debugging-pipe', '--no-first-run', '--disable-background-networking',
  '--hide-scrollbars', `--user-data-dir=${join(output, 'chrome-profile')}`,
], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
let sequence = 0;
let buffer = '';
const pending = new Map();
const listeners = new Map();
chrome.stdio[4].setEncoding('utf8');
chrome.stdio[4].on('data', chunk => {
  buffer += chunk;
  let boundary;
  while ((boundary = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, boundary));
    buffer = buffer.slice(boundary + 1);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(JSON.stringify(message.error)));
      else request?.resolve(message.result);
    } else {
      const key = `${message.sessionId}:${message.method}`;
      listeners.get(key)?.(message.params);
      listeners.delete(key);
    }
  }
});
function command(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    chrome.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
}
function event(sessionId, method) {
  return new Promise(resolve => listeners.set(`${sessionId}:${method}`, resolve));
}
const deadline = setTimeout(() => { console.error('Browser verification timed out.'); chrome.kill(); process.exit(1); }, 180000);
const results = [];
try {
  await command('Browser.getVersion');
  const { targetId } = await command('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await command('Target.attachToTarget', { targetId, flatten: true });
  await command('Page.enable', {}, sessionId);
  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  const files = (await readdir(output)).filter(name => name.endsWith('.html'));
  for (const width of [390, 768, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', {
      width, height: 1000, deviceScaleFactor: 1, mobile: width < 640,
    }, sessionId);
    for (const filename of files) {
      const loaded = event(sessionId, 'Page.loadEventFired');
      await command('Page.navigate', { url: pathToFileURL(join(output, filename)).href }, sessionId);
      await loaded;
      const { result } = await command('Runtime.evaluate', {
        expression: `document.fonts.ready.then(() => ({
          page: document.documentElement.scrollWidth > innerWidth,
          content: [...document.querySelectorAll('main')].some(main => main.scrollWidth > main.clientWidth),
          background: getComputedStyle(document.querySelector('main') || document.body).backgroundColor,
          headerInk: document.querySelector('.ye-header h1') ? getComputedStyle(document.querySelector('.ye-header h1')).color : null
        }))`, awaitPromise: true, returnByValue: true,
      }, sessionId);
      const row = { filename, width, ...result.value };
      results.push(row);
      if (filename.includes('-dark') && row.headerInk === 'rgb(53, 16, 24)') throw new Error(`Dark header contrast failed: ${filename}`);
      if (row.page || row.content) console.log('OVERFLOW', JSON.stringify(row));
      if (/OrganizerDashboard|MyEventsPage|EventDetailsPage|MessagesPage|LoginPage|ProviderDashboard/.test(filename)) {
        const screenshot = await command('Page.captureScreenshot', { format: 'png' }, sessionId);
        await writeFile(join(output, filename.replace('.html', `-${width}.png`)), Buffer.from(screenshot.data, 'base64'));
      }
    }
    console.log(`Verified ${files.length} Light/Dark page layouts at ${width}px.`);
  }
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2));
  const failures = results.filter(row => row.page || row.content);
  console.log(`Browser layouts: ${results.length}; horizontal overflow failures: ${failures.length}.`);
  console.log(`Snapshots and results: ${output}`);
  if (failures.length) process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  await command('Browser.close').catch(() => chrome.kill());
}
