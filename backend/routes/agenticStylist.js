// Agentic stylist: NL brief → complete outfit + shopping links.
const router = require('express').Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');
const { parseAIJson } = require('../utils/parseAIJson');

// POST /api/agentic-stylist/recommend { occasion, dress_code, budget, body_type?, season? }
router.post('/recommend', auth, aiRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.occasion) return res.status(400).json({ error: 'occasion required' });
    const system = 'You are a personal stylist. Output JSON {"outfit":{"top":"...","bottom":"...","shoes":"...","accessories":["..."]},"total_estimate_usd":num,"shopping_links":["..."]}.';
    let raw, parsed;
    try {
      raw = await callOpenRouter(JSON.stringify(body), system);
      parsed = parseAIJson(raw) || { raw };
    } catch (e) {
      return res.status(503).json({ error: 'LLM unavailable', detail: e.message });
    }
    return res.json({ brief: body, recommendation: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'recommend failed' });
  }
});

module.exports = router;
