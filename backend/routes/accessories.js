const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM accessories ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM accessories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, category, style, material, color, brand, description, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO accessories (name, category, style, material, color, brand, description, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, category, style, material, color, brand, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, style, material, color, brand, description, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE accessories SET name=$1, category=$2, style=$3, material=$4, color=$5, brand=$6, description=$7, image_url=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, category, style, material, color, brand, description, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM accessories WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
