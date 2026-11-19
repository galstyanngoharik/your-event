const { test } = require('node:test');
const assert = require('node:assert/strict');
let event;
const models = {
  db: {}, User: {}, Expense: {}, Guest: {}, Invitation: {}, Service: {}, Favorite: {},
  Conversation: {}, Message: {}, Review: {}, Task: { bulkCreate: async () => [] },
  Event: {
    async create(data) {
      event = { id: 1, currency: 'AMD', ...data, async update(changes) { Object.assign(this, changes); } };
      return event;
    },
    async findByPk() { return event; },
  },
};
require.cache[require.resolve('../src/models')] = { exports: models };
const router = require('../src/routes');
const invoke = (method, path, body) => new Promise((resolve, reject) => {
  const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]).route;
  const res = { status() { return this; }, json: resolve };
  route.stack.at(-1).handle({ body, params: { id: '1' }, user: { id: 7 } }, res, reject);
});
const payload = { title: 'Currency test', type: 'birthday', date: '2030-01-01', city: 'Yerevan', budget: 120.5 };

test('all four currencies pass event creation validation and partial updates retain currency', async () => {
  for (const currency of ['AMD', 'USD', 'EUR', 'RUB']) {
    const created = await invoke('post', '/events', { ...payload, currency });
    assert.equal(created.currency, currency);
    assert.equal(created.budget, 120.5);
    await invoke('patch', '/events/:id', { title: 'Updated' });
    assert.equal(event.currency, currency);
    assert.equal(event.budget, 120.5);
  }
});

test('legacy payloads default to AMD; unsupported currencies are rejected', async () => {
  assert.equal((await invoke('post', '/events', payload)).currency, 'AMD');
  for (const currency of ['BAD', 'usd', '', null]) {
    await assert.rejects(invoke('post', '/events', { ...payload, currency }));
  }
  await assert.rejects(invoke('patch', '/events/:id', { currency: 'BAD' }));
  assert.equal(event.currency, 'AMD');
});
