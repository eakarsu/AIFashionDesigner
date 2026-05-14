const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/outfits — paginated, user-isolated
router.get('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM outfits WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM outfits WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/outfits/:id — user-isolated
router.get('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(
      'SELECT * FROM outfits WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/outfits — requires name or occasion; inserts user_id
router.post('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, occasion, style, season, items, description, image_url } = req.body;

    if (!name && !occasion) {
      return res.status(400).json({ error: 'At least name or occasion is required' });
    }

    const result = await pool.query(
      'INSERT INTO outfits (user_id, name, occasion, style, season, items, description, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user.id, name, occasion, style, season, items, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/outfits/:id — user-isolated
router.put('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, occasion, style, season, items, description, image_url } = req.body;
    const result = await pool.query(
      'UPDATE outfits SET name=$1, occasion=$2, style=$3, season=$4, items=$5, description=$6, image_url=$7, updated_at=NOW() WHERE id=$8 AND user_id=$9 RETURNING *',
      [name, occasion, style, season, items, description, image_url, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/outfits/:id — user-isolated
router.delete('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await pool.query('DELETE FROM outfits WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
