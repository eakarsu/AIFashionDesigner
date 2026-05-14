const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'ratings',
  scope: 'user',
  columns: ['outfit_name', 'occasion', 'overall_score', 'color_score', 'style_score', 'feedback', 'description'],
  requiredFields: ['outfit_name']
});

module.exports = router;
