const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'celebrity_styles',
  scope: 'shared',
  columns: ['celebrity_name', 'style_category', 'signature_looks', 'key_pieces', 'brands', 'description', 'image_url'],
  requiredFields: ['celebrity_name']
});

module.exports = router;
