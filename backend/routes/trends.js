const router = require('express').Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');
const { parseAIJson } = require('../utils/parseAIJson');

// Paginated list (user-scoped if user_id present, else global view of seed data)
router.get('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM trends WHERE user_id IS NULL OR user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM trends WHERE user_id IS NULL OR user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      'SELECT * FROM trends WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, category, season, year, description, popularity, key_pieces, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await req.app.locals.pool.query(
      'INSERT INTO trends (user_id, name, category, season, year, description, popularity, key_pieces, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [req.user.id, name, category, season, year, description, popularity, key_pieces, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, season, year, description, popularity, key_pieces, image_url } = req.body;
    // Only allow user to update rows they own (ignore seed data)
    const result = await req.app.locals.pool.query(
      'UPDATE trends SET name=$1, category=$2, season=$3, year=$4, description=$5, popularity=$6, key_pieces=$7, image_url=$8, updated_at=NOW() WHERE id=$9 AND user_id=$10 RETURNING *',
      [name, category, season, year, description, popularity, key_pieces, image_url, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found or not owned by you' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await req.app.locals.pool.query(
      'DELETE FROM trends WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted successfully', count: result.rowCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/trends/ai-alert — uses centralized openrouter helper + 3-strategy parser
router.post('/ai-alert', auth, aiRateLimiter, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { category } = req.body;

    let query = 'SELECT * FROM trends ORDER BY created_at DESC LIMIT 50';
    const params = [];
    if (category) {
      query = 'SELECT * FROM trends WHERE category = $1 ORDER BY created_at DESC LIMIT 50';
      params.push(category);
    }
    const trends = await pool.query(query, params);

    if (trends.rows.length === 0) {
      return res.json({ alerts: [], message: 'No trends to analyze.' });
    }

    const trendSummary = trends.rows.map(t =>
      `${t.name} (${t.category}): ${t.season} ${t.year}, popularity=${t.popularity || 'N/A'}`
    ).join('\n');

    const systemPrompt = `You are a fashion trend analyst. Analyze stored fashion trends and detect significant shifts that warrant alerts. Return JSON:
{
  "alerts": [
    {
      "category": "<category>",
      "shift_detected": true|false,
      "shift_description": "<what changed>",
      "urgency": "high|medium|low",
      "recommended_action": "<what the user should do>",
      "trending_items": ["item1", "item2"]
    }
  ],
  "overall_trend_summary": "<2-3 sentence summary of current trends>",
  "hot_categories": ["category1", "category2"]
}`;

    const prompt = `Analyze these ${trends.rows.length} fashion trends and detect significant shifts:
${trendSummary}`;

    const result = await callOpenRouter(prompt, systemPrompt, { max_tokens: 1500 });
    const parsed = parseAIJson(result);

    res.json({
      analysis: result,
      parsed,
      trends_analyzed: trends.rows.length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
