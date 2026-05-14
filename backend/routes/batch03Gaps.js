// ============================================================
// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated Gap-feature endpoints (lean v0).
// TODO: configure credentials (set OPENROUTER_API_KEY).
// ============================================================
const express = require('express');
const router = express.Router();

let _gfReady = false;
async function ensureGapTable(pool) {
  if (_gfReady || !pool) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS gap_features (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL,
      user_id INT,
      input JSONB,
      output JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    _gfReady = true;
  } catch (_) { /* tolerant of missing DB */ }
}

async function callAI(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, status: 503, error: 'AI service unavailable. Set OPENROUTER_API_KEY (TODO: configure credentials).' };
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return { ok: r.ok, status: r.status, text, raw: data };
  } catch (e) {
    return { ok: false, status: 500, error: String(e.message || e) };
  }
}

function buildHandler(slug, label, hint) {
  return async (req, res) => {
    const body = req.body || {};
    const userId = req.user?.id || null;
    const prompt = `Feature: ${label}\nContext hint: ${hint}\nUser input:\n${JSON.stringify(body, null, 2)}\n\nProduce a concise, actionable response.`;
    const ai = await callAI(prompt);
    try {
      const pool = req.app.locals.pool || req.app.get('pool') || null;
      if (pool) {
        await ensureGapTable(pool);
        await pool.query('INSERT INTO gap_features(slug, user_id, input, output) VALUES ($1,$2,$3,$4)',
          [slug, userId, body, { text: ai.text || ai.error || null }]);
      }
    } catch (_) { /* tolerant */ }
    if (!ai.ok) return res.status(ai.status || 500).json({ error: ai.error || ai.text || `Upstream error (${ai.status})`, slug });
    res.json({ slug, label, result: ai.text });
  };
}

router.post('/gap-no-ar-vr-virtual-try-on-vision-generation', buildHandler('gap-ai-no-ar-vr-virtual-try-on-vision-generation', 'No AR/VR virtual try-on (vision generation)', 'No AR/VR virtual try-on (vision generation)'));
router.post('/gap-no-wardrobe-audit-donate-buy-recommendation-from-inventory', buildHandler('gap-ai-no-wardrobe-audit-donate-buy-recommendation-from-inventory', 'No wardrobe-audit (donate/buy recommendation from inventory)', 'No wardrobe-audit (donate/buy recommendation from inventory)'));
router.post('/gap-no-personal-colour-analysis-agent', buildHandler('gap-ai-no-personal-colour-analysis-agent', 'No personal-colour-analysis agent', 'No personal-colour-analysis agent'));
router.post('/gap-no-e-commerce-shop-connector-shopify-amazon-surfaced', buildHandler('gap-non-no-e-commerce-shop-connector-shopify-amazon-surfaced', 'No e-commerce shop connector (Shopify/Amazon) surfaced', 'No e-commerce shop connector (Shopify/Amazon) surfaced'));
router.post('/gap-no-social-sharing-connector-pinterest-instagram', buildHandler('gap-non-no-social-sharing-connector-pinterest-instagram', 'No social-sharing connector (Pinterest/Instagram)', 'No social-sharing connector (Pinterest/Instagram)'));
router.post('/gap-no-multi-user-collaboration-friend-styling-threads', buildHandler('gap-non-no-multi-user-collaboration-friend-styling-threads', 'No multi-user collaboration / friend-styling threads', 'No multi-user collaboration / friend-styling threads'));
router.post('/gap-no-cost-budget-tracker', buildHandler('gap-non-no-cost-budget-tracker', 'No cost / budget tracker', 'No cost / budget tracker'));
router.post('/gap-no-notifications-subsystem', buildHandler('gap-non-no-notifications-subsystem', 'No notifications subsystem', 'No notifications subsystem'));
router.post('/gap-no-webhooks', buildHandler('gap-non-no-webhooks', 'No webhooks', 'No webhooks'));
router.post('/gap-no-search-endpoint-observed', buildHandler('gap-non-no-search-endpoint-observed', 'No search endpoint observed', 'No search endpoint observed'));

module.exports = router;
