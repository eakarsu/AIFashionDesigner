const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM fabrics ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM fabrics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, type, weight, texture, care_instructions, sustainability_rating, best_for, description } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO fabrics (name, type, weight, texture, care_instructions, sustainability_rating, best_for, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, type, weight, texture, care_instructions, sustainability_rating, best_for, description]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, weight, texture, care_instructions, sustainability_rating, best_for, description } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE fabrics SET name=$1, type=$2, weight=$3, texture=$4, care_instructions=$5, sustainability_rating=$6, best_for=$7, description=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, type, weight, texture, care_instructions, sustainability_rating, best_for, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM fabrics WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
