const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Sequelize, Op } = require('sequelize');
const serviceFilters = require('../src/utils/serviceFilters');
const db = new Sequelize('postgres://test:test@localhost/test', { logging: false });
const generator = db.getQueryInterface().queryGenerator;
const sql = query => generator.whereQuery(serviceFilters(query));

test('city comparison uses normalized exact equality without wildcard matching', () => {
  const query = sql({ city: ' New York ' });
  assert.match(query, /lower\(trim\("Service"\."city"\)\) = 'new york'/);
  assert.doesNotMatch(query, /ILIKE/);
  assert.equal(sql({ city: ' Yerevan ' }), sql({ city: 'yerevan' }));
  assert.doesNotMatch(sql({ city: 'York' }), /new york/);
  assert.doesNotMatch(sql({ city: '' }), /"city"/);
});

test('provider search and service search are OR alternatives inside AND city/category/price constraints', () => {
  const query = sql({ city: 'New York', search: 'Ani', category: 'music', maxPrice: '500' });
  assert.match(query, /city.* = 'new york'/);
  assert.match(query, /AND.*category.*ILIKE '%music%'/);
  assert.match(query, /AND.*price.*<= 500/);
  assert.match(query, /AND \(.*title.* OR .*provider.*name.* OR .*provider.*businessName/);
  assert.match(query, /'%Ani%'/);
  assert.doesNotMatch(sql({ maxPrice: '' }), /"price"/);
  assert.match(sql({ maxPrice: '0' }), /<= 0/);
  assert.throws(() => serviceFilters({ maxPrice: 'invalid' }), { status: 400 });
});

test('provider catalog uses the same city/category/price conditions on its services', () => {
  const query = generator.whereQuery(serviceFilters({ city: ' YEREVAN ', search: 'Ani', maxPrice: 10 }, 'Services', false));
  assert.match(query, /lower\(trim\("Services"\."city"\)\) = 'yerevan'/);
  assert.match(query, /"price" <= 10/);
  assert.doesNotMatch(query, /Ani/);
  assert.equal(serviceFilters({})[Op.and][0].active, true);
});
