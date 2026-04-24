const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM sustainable_fashion ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM sustainable_fashion WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, brand, category, eco_rating, materials, certifications, price_range, description } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO sustainable_fashion (name, brand, category, eco_rating, materials, certifications, price_range, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, brand, category, eco_rating, materials, certifications, price_range, description]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, brand, category, eco_rating, materials, certifications, price_range, description } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE sustainable_fashion SET name=$1, brand=$2, category=$3, eco_rating=$4, materials=$5, certifications=$6, price_range=$7, description=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, brand, category, eco_rating, materials, certifications, price_range, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM sustainable_fashion WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
