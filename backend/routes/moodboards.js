const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'moodboards',
  scope: 'user',
  columns: ['name', 'theme', 'aesthetic', 'colors', 'description', 'elements', 'image_url'],
  requiredFields: ['name']
});

module.exports = router;
