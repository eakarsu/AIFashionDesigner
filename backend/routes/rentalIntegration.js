// Fashion rental integration: suggest rental options for one-time wear.
const router = require('express').Router();
const auth = require('../middleware/auth');

// Stubbed catalog — production wires to Rent the Runway / Nuuly partner APIs.
const CATALOG = [
  { id: 'rtr-001', brand: 'Carolina Herrera', category: 'gown', rent_4d_usd: 75, retail_usd: 1200 },
  { id: 'rtr-002', brand: 'Reformation', category: 'dress', rent_4d_usd: 45, retail_usd: 280 },
  { id: 'nuuly-001', brand: 'Free People', category: 'top', rent_month_usd: 18, retail_usd: 120 },
  { id: 'rtr-003', brand: 'Theory', category: 'suit', rent_4d_usd: 95, retail_usd: 950 },
];

// GET /api/rental-integration/search?category=gown&max_rent=100
router.get('/search', auth, (req, res) => {
  const { category, max_rent } = req.query;
  let list = CATALOG;
  if (category) list = list.filter(x => x.category === category);
  if (max_rent) list = list.filter(x => (x.rent_4d_usd || x.rent_month_usd) <= Number(max_rent));
  return res.json({ count: list.length, options: list });
});

// POST /api/rental-integration/recommend { occasion, budget, dress_code }
router.post('/recommend', auth, (req, res) => {
  const { dress_code, budget } = req.body || {};
  const recs = CATALOG.filter(x => (x.rent_4d_usd || x.rent_month_usd) <= Number(budget || 200));
  // TODO: configure credentials — RTR_API_KEY, NUULY_API_KEY
  return res.json({ dress_code: dress_code || null, recommendations: recs });
});

module.exports = router;
