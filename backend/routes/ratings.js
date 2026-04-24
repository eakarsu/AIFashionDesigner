const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM ratings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM ratings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { outfit_name, occasion, overall_score, color_score, style_score, feedback, description } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO ratings (outfit_name, occasion, overall_score, color_score, style_score, feedback, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [outfit_name, occasion, overall_score, color_score, style_score, feedback, description]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { outfit_name, occasion, overall_score, color_score, style_score, feedback, description } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE ratings SET outfit_name=$1, occasion=$2, overall_score=$3, color_score=$4, style_score=$5, feedback=$6, description=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [outfit_name, occasion, overall_score, color_score, style_score, feedback, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM ratings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
