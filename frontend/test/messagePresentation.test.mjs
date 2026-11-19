import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { transformWithOxc } from 'vite';

const source = await readFile(new URL('../src/features/messages/conversationPresentation.ts', import.meta.url), 'utf8');
const compiled = await transformWithOxc(source, 'conversationPresentation.ts');
const code = compiled.code.replace(/export\s*\{[^}]+\};?/g, '').replace(/export /g, '');
const { filterConversations, groupedMessage, conversationTime } = runInNewContext(`${code}\n({ filterConversations, groupedMessage, conversationTime });`);
const conversations = [
  { id: 1, provider: { name: 'Ani', businessName: 'Studio One' }, organizer: { name: 'Mary' }, messages: [{ body: 'Venue details' }] },
  { id: 2, provider: { name: 'Alex' }, organizer: { name: 'John' }, messages: [] },
];

test('conversation search uses existing partner names, business names and actual last text without changing order', () => {
  assert.equal(filterConversations(conversations, true, ' ANI ')[0].id, 1);
  assert.equal(filterConversations(conversations, true, 'studio')[0].id, 1);
  assert.equal(filterConversations(conversations, true, 'venue')[0].id, 1);
  assert.equal(filterConversations(conversations, false, 'mary')[0].id, 1);
  assert.equal(filterConversations(conversations, false, 'Ani').length, 0);
  assert.equal(filterConversations(conversations, true, 'missing').length, 0);
  assert.equal(filterConversations(conversations, true, ''), conversations);
  assert.equal(conversations.length, 2);
});

test('consecutive groups require the same sender, a maximum five-minute gap and the same local day', () => {
  const first = { senderId: 1, createdAt: '2026-11-19T10:00:00' };
  assert.equal(groupedMessage(first, { ...first, createdAt: '2026-11-19T10:05:00' }), true);
  assert.equal(groupedMessage(first, { ...first, createdAt: '2026-11-19T10:05:01' }), false);
  assert.equal(groupedMessage(first, { ...first, senderId: 2 }), false);
  assert.equal(groupedMessage({ ...first, deletedAt: first.createdAt }, first), false);
  assert.equal(groupedMessage(first, { ...first, createdAt: '2026-11-19T09:59:00' }), false);
  assert.equal(groupedMessage(undefined, first), false);
  assert.equal(groupedMessage({ ...first, createdAt: '2026-11-19T23:59:00' }, { ...first, createdAt: '2026-11-20T00:01:00' }), false);
});

test('timestamps handle today, older dates and invalid values', () => {
  const now = new Date('2026-11-19T12:00:00');
  assert.ok(conversationTime('2026-11-19T10:00:00', now));
  assert.ok(conversationTime('2026-11-18T10:00:00', now));
  assert.match(conversationTime('2025-11-18T10:00:00', now), /2025/);
  assert.equal(conversationTime('invalid', now), '');
});
