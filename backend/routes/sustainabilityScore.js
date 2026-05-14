// Sustainability score: track eco-impact of wardrobe.
const router = require('express').Router();
const auth = require('../middleware/auth');

// kg CO2e per garment by material
const CO2 = { cotton: 5.5, polyester: 9.5, wool: 11.8, linen: 3.1, recycled: 2.0, leather: 17.0 };

// POST /api/sustainability-score/calc { items:[{material, weight_g}] }
router.post('/calc', auth, async (req, res) => {
  try {
    const { items = [] } = req.body || {};
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items[] required' });
    const lines = items.map(it => ({
      material: it.material,
      weight_g: Number(it.weight_g),
      co2_kg: Math.round((CO2[it.material] || 6.0) * (Number(it.weight_g) / 1000) * 100) / 100,
    }));
    const total = lines.reduce((a, b) => a + b.co2_kg, 0);
    const grade = total < 5 ? 'A' : total < 10 ? 'B' : total < 25 ? 'C' : 'D';
    return res.json({ items: lines, total_co2_kg: Math.round(total * 100) / 100, grade });
  } catch (e) {
    return res.status(500).json({ error: 'calc failed' });
  }
});

module.exports = router;
