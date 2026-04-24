const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM color_palettes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM color_palettes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, primary_color, secondary_color, accent_color, description, season, skin_tone } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO color_palettes (name, primary_color, secondary_color, accent_color, description, season, skin_tone) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, primary_color, secondary_color, accent_color, description, season, skin_tone]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, primary_color, secondary_color, accent_color, description, season, skin_tone } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE color_palettes SET name=$1, primary_color=$2, secondary_color=$3, accent_color=$4, description=$5, season=$6, skin_tone=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, primary_color, secondary_color, accent_color, description, season, skin_tone, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM color_palettes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
