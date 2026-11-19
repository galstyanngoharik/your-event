// Read-only PostgreSQL verification; no application records are changed.
require('dotenv').config();
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { Sequelize } = require('sequelize');
const serviceFilters = require('../src/utils/serviceFilters');
const db = new Sequelize(process.env.DATABASE_URL, { logging: false });
const generator = db.getQueryInterface().queryGenerator;
const services = `(VALUES
  (1, 'Yerevan photography', ' Yerevan ', 'photography', 100, true, 1),
  (2, 'New York venue', 'New York', 'venue', 200, true, 2),
  (3, 'LA music', 'Los Angeles', 'music', 300, true, 2),
  (4, 'York venue', 'York', 'venue', 400, true, 2),
  (5, 'Missing city', NULL, 'venue', 500, true, 1),
  (6, 'Empty city', '', 'venue', 600, true, 1),
  (7, 'Inactive', 'Yerevan', 'photography', 50, false, 1)
) AS "Service"(id, title, city, category, price, active, "providerId")`;
const providers = `(VALUES (1, 'Ani', 'Ani Studio'), (2, 'Alex', 'Alex Events'))
  AS "provider"(id, name, "businessName")`;
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function find(query, offset = 0, limit = 12) {
  const where = generator.whereQuery(serviceFilters(query));
  const base = `FROM ${services} JOIN ${providers} ON "provider".id = "Service"."providerId" ${where}`;
  const count = await client.query(`SELECT count(*) ${base}`);
  const direction = query.sort === 'price_desc' ? 'DESC' : 'ASC';
  const rows = await client.query(`SELECT "Service".id ${base} ORDER BY price ${direction}, "Service".id LIMIT $1 OFFSET $2`, [limit, offset]);
  return { count: Number(count.rows[0].count), ids: rows.rows.map(row => row.id) };
}
(async () => {
  await client.connect();
  assert.deepEqual(await find({ city: 'New York', search: 'Ani' }), { count: 0, ids: [] });
  assert.deepEqual(await find({ city: 'yerevan', search: 'Ani' }), { count: 1, ids: [1] });
  assert.deepEqual(await find({ city: '', search: 'Ani' }), { count: 3, ids: [1, 5, 6] });
  assert.deepEqual(await find({ city: ' New York ' }), { count: 1, ids: [2] });
  assert.deepEqual(await find({ city: 'Los Angeles' }), { count: 1, ids: [3] });
  assert.deepEqual(await find({ city: 'York' }), { count: 1, ids: [4] });
  assert.deepEqual(await find({ city: 'Yerevan', category: 'venue', search: 'Ani' }), { count: 0, ids: [] });
  assert.deepEqual(await find({ city: 'Yerevan', category: 'photo', maxPrice: 100 }), { count: 1, ids: [1] });
  assert.deepEqual(await find({ city: 'Yerevan', maxPrice: 99 }), { count: 0, ids: [] });
  assert.deepEqual(await find({ category: 'venue', sort: 'price_desc' }, 1, 1), { count: 4, ids: [5] });
  const providerWhere = generator.whereQuery(serviceFilters({ city: 'New York' }, 'Services', false));
  const matching = await client.query(`SELECT DISTINCT "provider".name FROM ${services.replaceAll('"Service"', '"Services"')}
    JOIN ${providers} ON "provider".id = "Services"."providerId" ${providerWhere} AND "provider".name ILIKE '%Ani%'`);
  assert.equal(matching.rows.length, 0);
  console.log('11 PostgreSQL catalog checks passed; no application records changed.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => client.end());
