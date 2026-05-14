/**
 * Generic CRUD helper for raw-SQL Postgres routes.
 * Adds:
 *  - paginated GET with { data, pagination } envelope
 *  - user_id scoping (when scope === 'user')
 *  - shared seed data + user-owned rows (when scope === 'shared')
 *  - basic POST/PUT/DELETE with user_id stamped on insert
 *
 * Schema patches in server.js ensure user_id column exists on all tables.
 */
const auth = require('../middleware/auth');

function buildCrudRoutes(router, opts) {
  const {
    table,
    columns,            // array of writable column names
    scope = 'user',     // 'user' | 'shared' | 'global'
    requiredFields = [] // POST validation
  } = opts;

  // Build WHERE clause helpers based on scope
  function listWhere(req) {
    if (scope === 'user') return { sql: 'WHERE user_id = $1', params: [req.user.id] };
    if (scope === 'shared') return { sql: 'WHERE user_id IS NULL OR user_id = $1', params: [req.user.id] };
    return { sql: '', params: [] };
  }
  function rowWhere(req) {
    if (scope === 'user') return { sql: 'AND user_id = $2', params: [req.user.id] };
    if (scope === 'shared') return { sql: 'AND (user_id IS NULL OR user_id = $2)', params: [req.user.id] };
    return { sql: '', params: [] };
  }

  router.get('/', auth, async (req, res) => {
    try {
      const pool = req.app.locals.pool;
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;
      const w = listWhere(req);

      const countResult = await pool.query(`SELECT COUNT(*) FROM ${table} ${w.sql}`, w.params);
      const total = parseInt(countResult.rows[0].count);

      const params = [...w.params, limit, offset];
      const result = await pool.query(
        `SELECT * FROM ${table} ${w.sql} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
      );

      res.json({
        data: result.rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.get('/:id', auth, async (req, res) => {
    try {
      const pool = req.app.locals.pool;
      const w = rowWhere(req);
      const params = [req.params.id, ...w.params];
      const result = await pool.query(
        `SELECT * FROM ${table} WHERE id = $1 ${w.sql}`,
        params
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.post('/', auth, async (req, res) => {
    try {
      // Validate required fields
      for (const f of requiredFields) {
        if (req.body[f] === undefined || req.body[f] === null || req.body[f] === '') {
          return res.status(400).json({ error: `${f} is required` });
        }
      }

      const pool = req.app.locals.pool;
      const cols = scope === 'global' ? columns : ['user_id', ...columns];
      const values = scope === 'global'
        ? columns.map(c => req.body[c] ?? null)
        : [req.user.id, ...columns.map(c => req.body[c] ?? null)];
      const placeholders = values.map((_, i) => `$${i + 1}`).join(',');

      const result = await pool.query(
        `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.put('/:id', auth, async (req, res) => {
    try {
      const pool = req.app.locals.pool;
      const setClauses = columns.map((c, i) => `${c}=$${i + 1}`);
      setClauses.push(`updated_at=NOW()`);
      const values = columns.map(c => req.body[c] ?? null);
      const idIdx = values.length + 1;

      let sql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = $${idIdx}`;
      const params = [...values, req.params.id];
      if (scope === 'user') {
        sql += ` AND user_id = $${idIdx + 1}`;
        params.push(req.user.id);
      }
      sql += ' RETURNING *';

      const result = await pool.query(sql, params);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found or not owned by you' });
      res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  router.delete('/:id', auth, async (req, res) => {
    try {
      const pool = req.app.locals.pool;
      let sql = `DELETE FROM ${table} WHERE id = $1`;
      const params = [req.params.id];
      if (scope === 'user') {
        sql += ' AND user_id = $2';
        params.push(req.user.id);
      }
      const result = await pool.query(sql, params);
      res.json({ message: 'Deleted successfully', count: result.rowCount });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  return router;
}

module.exports = { buildCrudRoutes };
