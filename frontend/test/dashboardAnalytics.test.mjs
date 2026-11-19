import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { transformWithOxc } from 'vite';

const source = await readFile(new URL('../src/features/dashboard/analytics.ts', import.meta.url), 'utf8');
const compiled = await transformWithOxc(source, 'analytics.ts');
const code = compiled.code.replace(/import[^;]+;/g, '').replace(/export\s*\{[^}]+\};?/g, '').replace(/export /g, '');
const currencySource = await readFile(new URL('../src/features/events/currency.ts', import.meta.url), 'utf8');
const currencyCompiled = await transformWithOxc(currencySource, 'currency.ts');
const currencyCode = currencyCompiled.code.replace(/export\s*\{[^}]+\};?/g, '').replace(/export /g, '');
const calculate = runInNewContext(`${currencyCode}\n${code}\ncalculateAnalytics;`);
const event = (id, overrides = {}) => ({
  id, budget: '100', date: '2026-12-20', status: 'planning', tasks: [], expenses: [], guests: [], ...overrides,
});

test('aggregates persisted data, deduplicates records, scopes selection, excludes cancelled upcoming events', () => {
  const first = event(1, { tasks: [{ id: 1, completed: true }, { id: 2, completed: false }],
    expenses: [{ id: 1, category: 'Venue', amount: '30' }, { id: 2, category: '', amount: '10' }], guests: [{ id: 1 }] });
  const second = event(2, { budget: '50', status: 'cancelled', expenses: [{ id: 3, category: 'Venue', amount: '10' }], guests: [{ id: 2 }] });
  const all = calculate([first, first, second], 'all', Date.parse('2026-11-19'));
  assert.equal(all.events, 2);
  assert.equal(all.upcoming, 1);
  assert.equal(all.budget, 150);
  assert.equal(all.spent, 50);
  assert.equal(all.remaining, 100);
  assert.equal(all.guests, 2);
  assert.equal(all.taskPercentage, 50);
  assert.equal(all.categories.find(item => item.name === 'Venue').percentage, 80);
  assert.equal(all.categories.find(item => item.name === 'Uncategorized').amount, 10);
  const selected = calculate([first, second], '1');
  assert.equal(selected.events, 1);
  assert.equal(selected.spent, 40);
  assert.equal(selected.budget, 100);
});

test('handles zero, invalid numbers, no tasks and spending above budget', () => {
  const empty = calculate([]);
  assert.equal(empty.taskPercentage, 0);
  assert.equal(empty.spent, 0);
  const over = calculate([event(1, { budget: 0, expenses: [{ id: 1, category: 'Food', amount: 200 }] })]);
  assert.equal(over.remaining, -200);
  assert.equal(over.categories[0].percentage, 100);
  const invalid = calculate([event(1, { budget: 'bad', expenses: [{ id: 2, amount: 'bad' }] })]);
  assert.equal(invalid.budget, 0);
  assert.equal(invalid.spent, 0);
  assert.equal(invalid.categories[0].percentage, 0);
});

test('recalculates after tasks are added, completed, reopened, deleted and expenses changed', () => {
  const data = event(1);
  data.tasks.push({ id: 1, completed: false });
  assert.equal(calculate([data]).taskPercentage, 0);
  data.tasks[0].completed = true;
  assert.equal(calculate([data]).taskPercentage, 100);
  data.tasks[0].completed = false;
  assert.equal(calculate([data]).completed, 0);
  data.tasks.pop();
  assert.equal(calculate([data]).totalTasks, 0);
  data.expenses.push({ id: 1, category: 'Food', amount: 25 });
  assert.equal(calculate([data]).remaining, 75);
});

test('currency arithmetic does not show tiny negative remaining amounts from floating point rounding', () => {
  const data = event(1, { budget: '0.30', expenses: [
    { id: 1, category: 'Food', amount: '0.10' }, { id: 2, category: 'Food', amount: '0.20' },
  ] });
  const result = calculate([data]);
  assert.equal(result.spent, 0.3);
  assert.equal(result.remaining, 0);
  assert.equal(result.categories[0].amount, 0.3);
  assert.equal(result.categories[0].percentage, 100);
});

test('mixed currencies are never added together and selection follows the event currency', () => {
  const amd = event(1, { currency: 'AMD', budget: 1000, expenses: [{ id: 1, category: 'Food', amount: 200 }] });
  const usd = event(2, { currency: 'USD', budget: 100, expenses: [{ id: 2, category: 'Venue', amount: 30 }] });
  const all = calculate([amd, usd]);
  assert.equal(all.events, 2);
  assert.equal(all.budget, 1000);
  assert.equal(all.spent, 200);
  const dollars = calculate([amd, usd], 'all', Date.now(), 'USD');
  assert.equal(dollars.budget, 100);
  assert.equal(dollars.spent, 30);
  assert.equal(dollars.remaining, 70);
  assert.equal(dollars.categories.length, 1);
  assert.equal(calculate([amd, usd], '2').currency, 'USD');
  assert.equal(calculate([amd, usd], '2').budget, 100);
});
