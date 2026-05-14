const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'fashion_history',
  scope: 'shared',
  columns: ['era', 'title', 'description', 'key_designers', 'iconic_looks', 'cultural_impact', 'image_url'],
  requiredFields: ['era', 'title']
});

module.exports = router;
