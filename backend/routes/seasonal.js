const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'seasonal_collections',
  scope: 'shared',
  columns: ['name', 'season', 'year', 'style', 'key_pieces', 'color_palette', 'description', 'image_url'],
  requiredFields: ['name']
});

module.exports = router;
