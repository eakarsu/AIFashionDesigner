const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/wardrobe/cost-per-wear — must be before /:id
router.get('/cost-per-wear', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(
      `SELECT id, name, category, brand, purchase_price, wear_count,
              CASE WHEN wear_count > 0 THEN ROUND(purchase_price / wear_count, 2) ELSE NULL END AS cost_per_wear
       FROM wardrobe
       WHERE user_id = $1 AND purchase_price IS NOT NULL AND wear_count IS NOT NULL AND wear_count > 0
       ORDER BY cost_per_wear ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/wardrobe — paginated, user-isolated
router.get('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Schema patches are applied once at server boot in server.js#ensureSchemaPatches.

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM wardrobe WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM wardrobe WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/wardrobe/:id — user-isolated
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      'SELECT * FROM wardrobe WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/wardrobe — requires item_name (name) and category; inserts user_id
router.post('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, category, color, brand, size, material, season, image_url, purchase_price } = req.body;

    // Support both 'name' and 'item_name' fields
    const itemName = name || req.body.item_name;

    if (!itemName || !category) {
      return res.status(400).json({ error: 'item_name and category are required' });
    }

    const result = await pool.query(
      'INSERT INTO wardrobe (user_id, name, category, color, brand, size, material, season, image_url, purchase_price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [req.user.id, itemName, category, color, brand, size, material, season, image_url, purchase_price || null]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/wardrobe/:id — user-isolated
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, color, brand, size, material, season, image_url, purchase_price } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE wardrobe SET name=$1, category=$2, color=$3, brand=$4, size=$5, material=$6, season=$7, image_url=$8, purchase_price=$9, updated_at=NOW() WHERE id=$10 AND user_id=$11 RETURNING *',
      [name, category, color, brand, size, material, season, image_url, purchase_price || null, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/wardrobe/:id — user-isolated
router.delete('/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query(
      'DELETE FROM wardrobe WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/wardrobe/:id/log-wear — increment wear_count
router.post('/:id/log-wear', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query(
      'UPDATE wardrobe SET wear_count = COALESCE(wear_count, 0) + 1, updated_at=NOW() WHERE id = $1 AND user_id = $2 RETURNING id, name, wear_count, purchase_price',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const item = result.rows[0];
    res.json({
      ...item,
      cost_per_wear: item.purchase_price && item.wear_count > 0
        ? parseFloat((item.purchase_price / item.wear_count).toFixed(2))
        : null
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
