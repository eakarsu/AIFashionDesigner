const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM bodytype_guides ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM bodytype_guides WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { body_type, description, recommended_styles, avoid_styles, key_tips, celebrity_examples } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO bodytype_guides (body_type, description, recommended_styles, avoid_styles, key_tips, celebrity_examples) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [body_type, description, recommended_styles, avoid_styles, key_tips, celebrity_examples]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { body_type, description, recommended_styles, avoid_styles, key_tips, celebrity_examples } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE bodytype_guides SET body_type=$1, description=$2, recommended_styles=$3, avoid_styles=$4, key_tips=$5, celebrity_examples=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [body_type, description, recommended_styles, avoid_styles, key_tips, celebrity_examples, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM bodytype_guides WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
