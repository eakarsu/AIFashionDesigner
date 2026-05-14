const router = require('express').Router();
const { buildCrudRoutes } = require('../utils/crudHelper');

buildCrudRoutes(router, {
  table: 'stylist_chats',
  scope: 'user',
  columns: ['question', 'response', 'category', 'tags'],
  requiredFields: ['question']
});

module.exports = router;
