import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { File } from 'node:buffer';
import { transformWithOxc } from 'vite';

const source = await readFile(new URL('../src/features/messages/useVoiceRecorder.ts', import.meta.url), 'utf8');
const transformed = await transformWithOxc(source, 'useVoiceRecorder.ts');
const executable = transformed.code
  .replace(/import\s*\{([^}]+)\}\s*from\s*["']react["'];?/, 'const {$1} = hooks;')
  .replace(/export\s*\{[^}]+\};?/g, '')
  .replace(/export function /g, 'function ');

function harness({ permission, secure = true, supported = true } = {}) {
  const slots = [];
  const cleanups = [];
  const timers = new Set();
  const revoked = [];
  const instances = [];
  let cursor = 0;
  let clock = 100;
  let stopped = 0;
  let requests = 0;
  const track = { stop() { stopped++; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(callback) {
      const index = cursor++;
      if (!slots[index]) { slots[index] = true; cleanups.push(callback()); }
    },
  };
  class Recorder {
    static isTypeSupported(type) { return type === 'audio/webm;codecs=opus'; }
    constructor(_stream, options) {
      this.state = 'inactive';
      this.mimeType = options?.mimeType || 'audio/webm';
      instances.push(this);
    }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      queueMicrotask(() => {
        this.ondataavailable?.({ data: new Blob(['recorded audio'], { type: this.mimeType }) });
        this.onstop?.();
      });
    }
  }
  const evaluateRecorder = runInNewContext(`${executable}\nuseVoiceRecorder;`, {
    hooks, Blob, File, DOMException,
    window: { isSecureContext: secure },
    navigator: { mediaDevices: { getUserMedia: () => { requests++; return permission ? permission(stream) : Promise.resolve(stream); } } },
    MediaRecorder: supported ? Recorder : undefined,
    URL: { createObjectURL: () => 'blob:voice-test', revokeObjectURL: (url) => revoked.push(url) },
    performance: { now: () => clock },
    Date,
    setInterval: (callback) => { timers.add(callback); return callback; },
    clearInterval: (callback) => timers.delete(callback),
  });
  return {
    render() { cursor = 0; return evaluateRecorder(); },
    advance(milliseconds) { clock += milliseconds; for (const callback of timers) callback(); },
    unmount() { cleanups.forEach((cleanup) => cleanup?.()); },
    get stopped() { return stopped; },
    get requests() { return requests; },
    get timerCount() { return timers.size; },
    stream, revoked, instances,
  };
}

test('record, timer, stop, preview and discard release tracks and object URLs', async () => {
  const view = harness();
  await view.render().start();
  assert.equal(view.render().status, 'recording');
  view.advance(1250);
  assert.equal(view.render().seconds, 1);
  view.render().stop();
  assert.equal(view.stopped, 1);
  assert.equal(view.timerCount, 0);
  await Promise.resolve();
  const preview = view.render();
  assert.equal(preview.status, 'preview');
  assert.equal(preview.recording.duration, 1.25);
  assert.equal(preview.recording.file.type, 'audio/webm;codecs=opus');
  assert.ok(preview.recording.file.size > 0);
  preview.reset();
  assert.equal(view.render().recording, null);
  assert.deepEqual(view.revoked, ['blob:voice-test']);
});

test('cancel while permission is pending stops a late microphone stream', async () => {
  let grant;
  const view = harness({ permission: () => new Promise((resolve) => { grant = resolve; }) });
  const pending = view.render().start();
  assert.equal(view.render().status, 'requesting');
  view.render().reset();
  grant(view.stream);
  await pending;
  assert.equal(view.render().status, 'idle');
  assert.equal(view.stopped, 1);
  assert.equal(view.instances.length, 0);
});

test('cancel and unmount during recording discard pending audio and stop the microphone', async () => {
  for (const unmount of [false, true]) {
    const view = harness();
    await view.render().start();
    view.advance(1000);
    if (unmount) view.unmount();
    else view.render().reset();
    await Promise.resolve();
    assert.equal(view.stopped, 1);
    assert.equal(view.timerCount, 0);
    assert.equal(view.render().recording, null);
  }
});

test('recording stops automatically before the two-minute server limit', async () => {
  const view = harness();
  await view.render().start();
  view.advance(119000);
  assert.equal(view.stopped, 1);
  await Promise.resolve();
  assert.equal(view.render().status, 'preview');
  assert.equal(view.render().recording.duration, 119);
});

test('permission denial, unsupported browsers and insecure origins produce useful errors', async () => {
  const denied = harness({ permission: async () => { throw new DOMException('Denied', 'NotAllowedError'); } });
  await denied.render().start();
  assert.match(denied.render().error, /denied/);
  assert.equal(denied.render().status, 'idle');
  for (const configuration of [{ secure: false }, { supported: false }]) {
    const view = harness(configuration);
    await view.render().start();
    assert.match(view.render().error, /HTTPS or localhost/);
    assert.equal(view.requests, 0);
  }
});

test('recording errors release the microphone and permit another attempt', async () => {
  const view = harness();
  await view.render().start();
  view.instances[0].onerror();
  await Promise.resolve();
  assert.equal(view.stopped, 1);
  assert.match(view.render().error, /Recording failed/);
  await view.render().start();
  assert.equal(view.render().status, 'recording');
  view.unmount();
});
