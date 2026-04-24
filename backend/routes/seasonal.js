const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM seasonal_collections ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM seasonal_collections WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, season, year, style, key_pieces, color_palette, description, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO seasonal_collections (name, season, year, style, key_pieces, color_palette, description, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, season, year, style, key_pieces, color_palette, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, season, year, style, key_pieces, color_palette, description, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE seasonal_collections SET name=$1, season=$2, year=$3, style=$4, key_pieces=$5, color_palette=$6, description=$7, image_url=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, season, year, style, key_pieces, color_palette, description, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM seasonal_collections WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
