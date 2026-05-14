const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'bodytype_guides',
  scope: 'shared',
  columns: ['body_type', 'description', 'recommended_styles', 'avoid_styles', 'key_tips', 'celebrity_examples'],
  requiredFields: ['body_type']
});

module.exports = router;
