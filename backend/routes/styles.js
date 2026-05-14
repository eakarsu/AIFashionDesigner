const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'styles',
  scope: 'shared',
  columns: ['name', 'category', 'description', 'key_pieces', 'color_scheme', 'image_url'],
  requiredFields: ['name']
});

module.exports = router;
