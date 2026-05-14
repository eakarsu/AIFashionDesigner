// Apply pass 5 — backlog extensions for AIFashionDesigner
//
// Implements the 3 deferred backlog items from _AUDIT_NOTE.md:
//   1. Virtual try-on (NEEDS-CREDS)
//      -> env: TRYON_PROVIDER (e.g. "vto-stub"), TRYON_API_KEY
//      -> registry of try-on requests; actual image generation deferred to provider.
//   2. Pinterest / Instagram social integration (NEEDS-CREDS)
//      -> env: PINTEREST_OAUTH_TOKEN, INSTAGRAM_OAUTH_TOKEN  (per-user OAuth in production)
//   3. Fashion rental marketplace (TOO-RISKY -> additive registry only)
//      -> No external integration; tracks user-saved rental listings.
//
// All endpoints use auth middleware. CREATE TABLE IF NOT EXISTS only.
// PRODUCT-DECISION: tryon_jobs and rental_listings are queue/registry tables.

const router = require('express').Router();
const auth = require('../middleware/auth');

async function bootstrap(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tryon_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        outfit_id INTEGER,
        garment_image_url TEXT,
        person_image_url TEXT,
        status TEXT DEFAULT 'pending',
        result_url TEXT,
        provider TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_shares (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        platform TEXT NOT NULL,
        outfit_id INTEGER,
        external_post_id TEXT,
        share_url TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rental_listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        title TEXT NOT NULL,
        category TEXT,
        size TEXT,
        rental_price_per_day DECIMAL(10,2),
        provider TEXT,
        listing_url TEXT,
        status TEXT DEFAULT 'saved',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (e) {
    console.error('extensions bootstrap warning:', e.message);
  }
}

let bootstrapped = false;
router.use(async (req, res, next) => {
  if (!bootstrapped) {
    await bootstrap(req.app.locals.pool);
    bootstrapped = true;
  }
  next();
});

// ── 1. Virtual try-on (NEEDS-CREDS) ───────────────────────────────────────
function tryonEnvCheck() {
  const missing = [];
  if (!process.env.TRYON_PROVIDER) missing.push('TRYON_PROVIDER');
  if (!process.env.TRYON_API_KEY) missing.push('TRYON_API_KEY');
  return missing;
}

router.get('/tryon/status', auth, (req, res) => {
  const missing = tryonEnvCheck();
  if (missing.length) return res.status(503).json({ error: 'try-on not configured', missing });
  res.json({ provider: process.env.TRYON_PROVIDER, configured: true });
});

router.post('/tryon/jobs', auth, async (req, res) => {
  const missing = tryonEnvCheck();
  if (missing.length) return res.status(503).json({ error: 'try-on not configured', missing });
  try {
    const { outfit_id, garment_image_url, person_image_url } = req.body || {};
    if (!garment_image_url) return res.status(400).json({ error: 'garment_image_url required' });
    const r = await req.app.locals.pool.query(
      `INSERT INTO tryon_jobs (user_id, outfit_id, garment_image_url, person_image_url, provider, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [req.user?.id || null, outfit_id || null, garment_image_url, person_image_url || null, process.env.TRYON_PROVIDER]
    );
    res.json({ job: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/tryon/jobs', auth, async (req, res) => {
  try {
    const r = await req.app.locals.pool.query(
      `SELECT * FROM tryon_jobs WHERE user_id = $1 ORDER BY id DESC LIMIT 100`,
      [req.user?.id || null]
    );
    res.json({ jobs: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── 2. Social sharing — Pinterest / Instagram (NEEDS-CREDS) ───────────────
function socialEnvCheck(platform) {
  if (platform === 'pinterest' && !process.env.PINTEREST_OAUTH_TOKEN) return ['PINTEREST_OAUTH_TOKEN'];
  if (platform === 'instagram' && !process.env.INSTAGRAM_OAUTH_TOKEN) return ['INSTAGRAM_OAUTH_TOKEN'];
  return [];
}

router.post('/social/share', auth, async (req, res) => {
  try {
    const { platform, outfit_id } = req.body || {};
    if (!platform) return res.status(400).json({ error: 'platform required' });
    if (!['pinterest','instagram'].includes(platform)) return res.status(400).json({ error: 'platform must be pinterest|instagram' });
    const missing = socialEnvCheck(platform);
    if (missing.length) return res.status(503).json({ error: `${platform} not configured`, missing });
    const r = await req.app.locals.pool.query(
      `INSERT INTO social_shares (user_id, platform, outfit_id, status)
       VALUES ($1, $2, $3, 'queued') RETURNING *`,
      [req.user?.id || null, platform, outfit_id || null]
    );
    res.json({ share: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/social/shares', auth, async (req, res) => {
  try {
    const r = await req.app.locals.pool.query(
      `SELECT * FROM social_shares WHERE user_id = $1 ORDER BY id DESC LIMIT 100`,
      [req.user?.id || null]
    );
    res.json({ shares: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── 3. Fashion rental marketplace (TOO-RISKY -> additive listing registry)
router.get('/rentals', auth, async (req, res) => {
  try {
    const r = await req.app.locals.pool.query(
      `SELECT * FROM rental_listings WHERE user_id = $1 ORDER BY id DESC LIMIT 200`,
      [req.user?.id || null]
    );
    res.json({ listings: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/rentals', auth, async (req, res) => {
  try {
    const { title, category, size, rental_price_per_day, provider, listing_url, notes } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const r = await req.app.locals.pool.query(
      `INSERT INTO rental_listings (user_id, title, category, size, rental_price_per_day, provider, listing_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user?.id || null, title, category || null, size || null, rental_price_per_day || null, provider || null, listing_url || null, notes || null]
    );
    res.json({ listing: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/rentals/:id', auth, async (req, res) => {
  try {
    await req.app.locals.pool.query(
      `DELETE FROM rental_listings WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user?.id || null]
    );
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
