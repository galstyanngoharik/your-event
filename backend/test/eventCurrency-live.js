require('dotenv').config();
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { db, User, Event, Expense } = require('../src/models');
const ensureCurrency = require('../src/utils/eventCurrencySchema');

(async () => {
  await db.authenticate();
  // Startup normally applies the same additive, idempotent migration.
  await ensureCurrency(db);
  const transaction = await db.transaction();
  try {
    const user = await User.create({
      name: 'Currency verification', email: `currency-${randomUUID()}@example.test`,
      role: 'organizer', passwordHash: 'test-only-no-login',
    }, { transaction });
    for (const currency of ['AMD', 'USD', 'EUR', 'RUB']) {
      const event = await Event.create({
        organizerId: user.id, title: 'Currency verification', type: 'birthday',
        date: '2030-01-01', city: 'Yerevan', budget: 120.5, currency,
      }, { transaction });
      const expense = await Expense.create({ eventId: event.id, title: 'Venue', category: 'Venue', amount: 20.25 }, { transaction });
      await event.reload({ transaction });
      assert.equal(event.currency, currency);
      assert.equal(Number(event.budget), 120.5);
      assert.equal(Number(expense.amount), 20.25);
      await event.update({ title: 'Edited title' }, { transaction });
      assert.equal(event.currency, currency);
    }
    const legacy = await Event.create({
      organizerId: user.id, title: 'Legacy payload', type: 'birthday', date: '2030-01-01', city: 'Yerevan', budget: 50,
    }, { transaction });
    assert.equal(legacy.currency, 'AMD');
    const [defaults] = await db.query(`SELECT column_default FROM information_schema.columns WHERE table_name = 'Events' AND column_name = 'currency'`, { transaction });
    assert.match(defaults[0].column_default, /AMD/);
    console.log('PostgreSQL verification passed: four currencies persist, legacy default AMD, budget and expense amounts unchanged.');
  } finally { await transaction.rollback(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.close());
