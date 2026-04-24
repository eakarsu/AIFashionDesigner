const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM fashion_history ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM fashion_history WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { era, title, description, key_designers, iconic_looks, cultural_impact, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO fashion_history (era, title, description, key_designers, iconic_looks, cultural_impact, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [era, title, description, key_designers, iconic_looks, cultural_impact, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { era, title, description, key_designers, iconic_looks, cultural_impact, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE fashion_history SET era=$1, title=$2, description=$3, key_designers=$4, iconic_looks=$5, cultural_impact=$6, image_url=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [era, title, description, key_designers, iconic_looks, cultural_impact, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM fashion_history WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
