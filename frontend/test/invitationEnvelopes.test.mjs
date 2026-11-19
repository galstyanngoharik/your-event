import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const server = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), server: { middlewareMode: true, hmr: false }, appType: 'custom' });
after(() => server.close());
const { default: Envelope } = await server.ssrLoadModule('/src/components/invitations/InvitationEnvelope.tsx');
const { default: Selector } = await server.ssrLoadModule('/src/features/events/components/InvitationEnvelopeSelector.tsx');
const { invitationEnvelopes } = await server.ssrLoadModule('/src/features/events/invitationEnvelopes.ts');
const noop = () => {};
const renderEnvelope = (envelope) => renderToStaticMarkup(createElement(Envelope, { envelope }, 'Invitation content'));

test('exactly three configured PNG envelopes and default burgundy fallback', () => {
  assert.equal(invitationEnvelopes.length, 3);
  const burgundy = renderEnvelope('invitation1');
  assert.match(burgundy, /\/images\/invitation1\.png/);
  assert.equal(renderEnvelope(undefined), burgundy);
  assert.equal(renderEnvelope(null), burgundy);
});

test('both selections use identical full-screen dimensions, animation and invitation content', () => {
  const burgundy = renderEnvelope('invitation1');
  const rose = renderEnvelope('invitation2');
  assert.match(rose, /\/images\/invitation2\.png/);
  assert.equal(rose.replaceAll('invitation2.png', 'invitation1.png').replaceAll('Dusty Rose Envelope', 'Burgundy Envelope'), burgundy);
  assert.match(rose, /h-svh w-full/);
  assert.match(rose, /duration-700/);
  assert.match(rose, /aria-hidden="true" inert=""/);
});

test('inline chooser contains exactly three cropped envelope images and restores the selected state', () => {
  for (const value of ['invitation1', 'invitation2', 'invitation3']) {
    const html = renderToStaticMarkup(createElement(Selector, { value, onChange: noop }));
    assert.equal((html.match(/<image /g) || []).length, 3);
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
    assert.equal((html.match(/aria-pressed="false"/g) || []).length, 2);
    assert.match(html, /<details/);
    assert.doesNotMatch(html, /<dialog/);
    assert.match(html, /viewBox="260 104 1270 710"/);
    assert.match(html, /preserveAspectRatio="xMidYMid slice"/);
  }
});

test('cream envelope uses its own crop without changing full-screen behavior', () => {
  const cream = renderEnvelope('invitation3');
  assert.match(cream, /\/images\/invitation3\.png/);
  assert.match(cream, /viewBox="224 116 1260 696"/);
  assert.match(cream, /h-svh w-full/);
  assert.match(cream, /duration-700/);
});
