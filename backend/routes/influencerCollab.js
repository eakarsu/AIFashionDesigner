// Influencer collaboration: partner with influencers, affiliate revenue.
const router = require('express').Router();
const auth = require('../middleware/auth');

const INFLUENCERS = [
  { handle: '@lacy.lou', niche: 'casual', followers: 42000, commission_pct: 0.1 },
  { handle: '@suit.up', niche: 'menswear', followers: 88000, commission_pct: 0.08 },
  { handle: '@ecoecho', niche: 'sustainable', followers: 21000, commission_pct: 0.12 },
];

// GET /api/influencer-collab/match?niche=sustainable
router.get('/match', auth, (req, res) => {
  const { niche } = req.query;
  const list = niche ? INFLUENCERS.filter(i => i.niche === niche) : INFLUENCERS;
  return res.json({ count: list.length, influencers: list });
});

// POST /api/influencer-collab/track-sale { influencer_handle, order_total_usd }
router.post('/track-sale', auth, (req, res) => {
  const { influencer_handle, order_total_usd } = req.body || {};
  if (!influencer_handle || !order_total_usd) return res.status(400).json({ error: 'influencer_handle + order_total_usd required' });
  const inf = INFLUENCERS.find(i => i.handle === influencer_handle);
  if (!inf) return res.status(404).json({ error: 'influencer not found' });
  const commission = Math.round(Number(order_total_usd) * inf.commission_pct * 100) / 100;
  return res.json({ influencer_handle, order_total_usd: Number(order_total_usd), commission });
});

module.exports = router;
