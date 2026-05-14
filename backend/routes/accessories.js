const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'accessories',
  scope: 'shared',
  columns: ['name', 'category', 'style', 'material', 'color', 'brand', 'description', 'image_url'],
  requiredFields: ['name']
});

module.exports = router;
