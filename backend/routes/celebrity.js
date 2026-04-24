const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM celebrity_styles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM celebrity_styles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { celebrity_name, style_category, signature_looks, key_pieces, brands, description, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO celebrity_styles (celebrity_name, style_category, signature_looks, key_pieces, brands, description, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [celebrity_name, style_category, signature_looks, key_pieces, brands, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { celebrity_name, style_category, signature_looks, key_pieces, brands, description, image_url } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE celebrity_styles SET celebrity_name=$1, style_category=$2, signature_looks=$3, key_pieces=$4, brands=$5, description=$6, image_url=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [celebrity_name, style_category, signature_looks, key_pieces, brands, description, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM celebrity_styles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
