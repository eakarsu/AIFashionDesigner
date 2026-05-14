// Virtual wardrobe: 3D model of wardrobe, try combinations in AR. v0
// exposes a combinatorial outfit generator over the user's wardrobe items.
const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/virtual-wardrobe/combinations?limit=20
router.get('/combinations', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const pool = req.app.locals.pool;
    const tops = await pool.query(`SELECT id, label FROM wardrobe WHERE user_id = $1 AND category = 'top' LIMIT 50`, [req.user.id]).catch(() => ({ rows: [] }));
    const bottoms = await pool.query(`SELECT id, label FROM wardrobe WHERE user_id = $1 AND category = 'bottom' LIMIT 50`, [req.user.id]).catch(() => ({ rows: [] }));
    const shoes = await pool.query(`SELECT id, label FROM wardrobe WHERE user_id = $1 AND category = 'shoes' LIMIT 30`, [req.user.id]).catch(() => ({ rows: [] }));

    const combos = [];
    for (const t of tops.rows) for (const b of bottoms.rows) for (const s of shoes.rows) {
      if (combos.length >= limit) break;
      combos.push({ top: t, bottom: b, shoes: s });
    }
    return res.json({ count: combos.length, combinations: combos });
  } catch (e) {
    return res.status(500).json({ error: 'combinations failed' });
  }
});

// POST /api/virtual-wardrobe/ar-render { combo:{top_id,bottom_id,shoes_id} }
router.post('/ar-render', auth, async (req, res) => {
  // TODO: configure credentials — AR_RENDER_SERVICE_URL
  return res.json({ note: 'AR render stub — wire to AR_RENDER_SERVICE_URL', combo: req.body?.combo });
});

module.exports = router;
