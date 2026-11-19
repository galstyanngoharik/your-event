const { Op, fn, col, where } = require('sequelize');

function serviceFilters(query, alias = 'Service', includeSearch = true) {
  const conditions = [{ active: true }];
  const city = String(query.city || '').trim().toLowerCase().slice(0, 100);
  if (city) conditions.push(where(fn('lower', fn('trim', col(`${alias}.city`))), city));
  if (query.category) conditions.push({ category: { [Op.iLike]: `%${String(query.category).slice(0, 80)}%` } });
  if (query.maxPrice !== undefined && query.maxPrice !== '') {
    const price = Number(query.maxPrice);
    if (!Number.isFinite(price) || price < 0) {
      const error = new Error('Invalid maximum price');
      error.status = 400;
      throw error;
    }
    conditions.push({ price: { [Op.lte]: price } });
  }
  const search = String(query.search || '').trim().slice(0, 100);
  if (includeSearch && search) {
    conditions.push({ [Op.or]: ['title', '$provider.name$', '$provider.businessName$'].map(
      field => ({ [field]: { [Op.iLike]: `%${search}%` } })
    ) });
  }
  return { [Op.and]: conditions };
}

module.exports = serviceFilters;
