module.exports = async function eventCurrencySchema(db) {
  await db.query(`
    ALTER TABLE "Events"
    ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) NOT NULL DEFAULT 'AMD'
  `);
};
