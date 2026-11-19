import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { transformWithOxc } from 'vite';

const source = await readFile(new URL('../src/features/events/timelineTime.ts', import.meta.url), 'utf8');
const transformed = await transformWithOxc(source, 'timelineTime.ts');
const code = transformed.code.replace(/export\s*\{[^}]+\};?/g, '').replace(/export function /g, 'function ');
const duration = runInNewContext(`${code}\nactivityDuration;`);

test('single-day durations use literal local times without UTC conversion', () => {
  assert.equal(duration('15:00', '16:30'), 90);
  assert.equal(duration('00:00', '23:59'), 1439);
  assert.equal(duration('18:00', '20:00'), 120);
});

test('optional end times and invalid time strings produce no duration', () => {
  for (const end of [null, undefined, '', '24:00', '9:00', '12:60']) assert.equal(duration('10:00', end), null);
  assert.equal(duration('invalid', '12:00'), null);
});

test('equal and overnight times remain invalid for the single-day schedule', () => {
  assert.equal(duration('12:00', '12:00'), 0);
  assert.ok(duration('23:30', '00:30') < 0);
});
