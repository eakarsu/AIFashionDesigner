const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'fabrics',
  scope: 'shared',
  columns: ['name', 'type', 'weight', 'texture', 'care_instructions', 'sustainability_rating', 'best_for', 'description'],
  requiredFields: ['name']
});

module.exports = router;
