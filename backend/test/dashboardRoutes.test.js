const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'dashboard-test-secret-with-more-than-32-characters';
let captured;
const records = [{ id: 1, organizerId: 7 }, { id: 2, organizerId: 9 }];
const models = {
  User: { findByPk: async id => ({ id, role: id === 8 ? 'provider' : 'organizer' }) },
  Event: { findAll: async options => {
    captured = options;
    return records.filter(event => event.organizerId === options.where.organizerId);
  } },
  db: {}, Invitation: {}, Service: {}, Favorite: {}, Conversation: {}, Message: {}, Review: {},
  Task: {}, Expense: {}, Guest: {},
};
require.cache[require.resolve('../src/models')] = { exports: models };
const router = require('../src/routes');
function invoke(userId, query = {}) {
  const route = router.stack.find(layer => layer.route?.path === '/events' && layer.route.methods.get).route;
  return new Promise((resolve, reject) => {
    const req = { query, headers: userId ? { authorization: `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET)}` } : {} };
    const res = { status() { return this; }, json: resolve };
    let index = 0;
    const next = error => {
      if (error) return reject(error);
      try { route.stack[index++].handle(req, res, next); } catch (failure) { reject(failure); }
    };
    next();
  });
}

test('analytics includes real child associations separately and scopes the query to authenticated organizer', async () => {
  assert.deepEqual(await invoke(7, { analytics: 'true' }), [records[0]]);
  assert.equal(captured.where.organizerId, 7);
  assert.deepEqual(captured.include.map(item => item.as), ['tasks', 'expenses', 'guests']);
  assert.ok(captured.include.every(item => item.separate));
  assert.deepEqual(await invoke(9, { analytics: 'true' }), [records[1]]);
});

test('regular event listing remains lightweight, unauthenticated and provider access are denied', async () => {
  await invoke(7);
  assert.deepEqual(captured.include, []);
  await assert.rejects(invoke(null, { analytics: 'true' }), { status: 401 });
  await assert.rejects(invoke(8, { analytics: 'true' }), { status: 403 });
});
