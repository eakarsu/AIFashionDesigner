const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'sustainable_fashion',
  scope: 'shared',
  columns: ['name', 'brand', 'category', 'eco_rating', 'materials', 'certifications', 'price_range', 'description'],
  requiredFields: ['name']
});

module.exports = router;
