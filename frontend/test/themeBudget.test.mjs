import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { transformWithOxc } from 'vite';

const themeSource = await readFile(new URL('../src/features/theme/useTheme.ts', import.meta.url), 'utf8');
const budgetSource = await readFile(new URL('../src/features/events/budgetProgress.ts', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const compile = async (source, filename) => {
  const result = await transformWithOxc(source, filename);
  return result.code.replace(/export\s*\{[^}]+\};?/g, '').replace(/export function /g, 'function ');
};
const budgetCode = await compile(budgetSource, 'budgetProgress.ts');
const calculate = runInNewContext(`${budgetCode}\nbudgetProgress;`);
const themeCode = (await compile(themeSource, 'useTheme.ts'))
  .replace(/import\s*\{([^}]+)\}\s*from\s*["']react["'];?/, 'const {$1} = hooks;');

function themeHarness(saved, storageUnavailable = false, pathname = '/organizer/profile') {
  const document = { documentElement: { dataset: {} } };
  const values = new Map(saved ? [['yourevent-theme', saved]] : []);
  const window = new EventTarget();
  window.location = { pathname };
  let subscribe;
  const localStorage = {
    getItem(key) { if (storageUnavailable) throw new Error('Storage blocked'); return values.get(key) || null; },
    setItem(key, value) { if (storageUnavailable) throw new Error('Storage blocked'); values.set(key, value); },
  };
  const context = { document, localStorage, window, Event, hooks: {
    useSyncExternalStore(register, getSnapshot) { subscribe = register; return getSnapshot(); },
  } };
  runInNewContext(bootstrap, context);
  const evaluate = runInNewContext(`${themeCode}\nuseTheme;`, context);
  return { evaluate, document, values, window, refresh: () => runInNewContext(bootstrap, context), subscribe: (callback) => subscribe(callback) };
}

test('Light Mode defaults before React rendering and toggles to Dark Mode and back', () => {
  const view = themeHarness();
  assert.equal(view.document.documentElement.dataset.theme, 'light');
  assert.equal(view.evaluate().theme, 'light');
  view.evaluate().toggleTheme();
  assert.equal(view.evaluate().theme, 'dark');
  assert.equal(view.values.get('yourevent-theme'), 'dark');
  view.evaluate().toggleTheme();
  assert.equal(view.evaluate().theme, 'light');
});

test('saved selection is restored by the head script before the application loads', () => {
  const view = themeHarness('dark');
  assert.equal(view.document.documentElement.dataset.theme, 'dark');
  view.evaluate().toggleTheme();
  view.document.documentElement.dataset.theme = 'dark';
  view.refresh();
  assert.equal(view.document.documentElement.dataset.theme, 'light');
  assert.equal(themeHarness('unknown').evaluate().theme, 'light');
});

test('theme remains usable when localStorage is unavailable', () => {
  const view = themeHarness(undefined, true);
  assert.equal(view.evaluate().theme, 'light');
  view.evaluate().toggleTheme();
  assert.equal(view.evaluate().theme, 'dark');
  view.evaluate().toggleTheme();
  assert.equal(view.evaluate().theme, 'light');
});

test('theme subscribers receive changes and storage events and can unsubscribe', () => {
  const view = themeHarness();
  view.evaluate();
  let changes = 0;
  const unsubscribe = view.subscribe(() => { changes++; });
  view.evaluate().toggleTheme();
  assert.equal(changes, 1);
  view.window.dispatchEvent(Object.assign(new Event('storage'), { key: 'yourevent-theme', newValue: 'light' }));
  assert.equal(view.evaluate().theme, 'light');
  assert.equal(changes, 2);
  unsubscribe();
  view.evaluate().toggleTheme();
  assert.equal(changes, 2);
});

test('budget percentage follows expenses and budget changes', () => {
  assert.equal(calculate(500000, 150000).percentage, 30);
  assert.equal(calculate(500000, 200000).percentage, 40);
  assert.equal(calculate(500000, 100000).percentage, 20);
  assert.equal(calculate(1000000, 150000).percentage, 15);
});

test('overspending retains the actual percentage while capping the arc', () => {
  const result = calculate(100000, 125000);
  assert.equal(result.percentage, 125);
  assert.equal(result.progress, 100);
  assert.equal(result.overspent, true);
  assert.equal(calculate(100, 100).overspent, false);
});

test('zero, missing and invalid budgets avoid division errors', () => {
  for (const budget of [0, undefined, null, NaN, Infinity, -1]) {
    const result = calculate(budget, 1000);
    assert.equal(result.percentage, 0);
    assert.equal(result.progress, 0);
    assert.equal(result.overspent, false);
  }
  assert.equal(calculate(100, NaN).percentage, 0);
});

test('login and signup share the saved theme while public invitations remain light', () => {
  for (const pathname of ['/invite/example']) {
    const view = themeHarness('dark', false, pathname);
    assert.equal(view.document.documentElement.dataset.themeScope, 'public');
    assert.equal(view.values.get('yourevent-theme'), 'dark');
  }
  for (const pathname of ['/', '/login', '/register', '/organizer', '/organizer/events/1', '/provider/profile']) {
    const view = themeHarness('dark', false, pathname);
    assert.equal(view.document.documentElement.dataset.themeScope, 'app');
  }
});
