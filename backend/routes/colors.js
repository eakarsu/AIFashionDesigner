const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'color_palettes',
  scope: 'shared',
  columns: ['name', 'primary_color', 'secondary_color', 'accent_color', 'description', 'season', 'skin_tone'],
  requiredFields: ['name']
});

module.exports = router;
