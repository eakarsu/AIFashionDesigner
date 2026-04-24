const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT * FROM outfits ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT * FROM outfits WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, occasion, style, season, items, description, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO outfits (name, occasion, style, season, items, description, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, occasion, style, season, items, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, occasion, style, season, items, description, image_url } = req.body;
    const result = await pool.query(
      'UPDATE outfits SET name=$1, occasion=$2, style=$3, season=$4, items=$5, description=$6, image_url=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, occasion, style, season, items, description, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await pool.query('DELETE FROM outfits WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
