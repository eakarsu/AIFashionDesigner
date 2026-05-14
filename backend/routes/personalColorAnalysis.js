// Personal color analysis: analyze skin/hair/eye colour, recommend
// flattering palettes.
const router = require('express').Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const SEASON_PALETTES = {
  spring: ['#FFC4A3', '#FFE9A8', '#A4E1B2', '#FFD1DC'],
  summer: ['#A9C9DC', '#D8B7DD', '#F2C6DE', '#C6E2D5'],
  autumn: ['#C57F4F', '#B58156', '#8E7C36', '#A0522D'],
  winter: ['#0D3B66', '#FAF0CA', '#F4D35E', '#EE964B'],
};

function determineSeason(skinHex, hairHex, eyeHex) {
  // Trivial mapping by lightness of skin
  const s = parseInt(skinHex.replace('#', '').slice(0, 2), 16);
  const h = parseInt(hairHex.replace('#', '').slice(0, 2), 16);
  if (s > 200 && h < 80) return 'winter';
  if (s > 200 && h > 130) return 'summer';
  if (s < 200 && h > 130) return 'spring';
  return 'autumn';
}

// POST /api/personal-color-analysis/analyze { skin_hex, hair_hex, eye_hex }
router.post('/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const { skin_hex, hair_hex, eye_hex } = req.body || {};
    if (!skin_hex || !hair_hex || !eye_hex) return res.status(400).json({ error: 'skin_hex, hair_hex, eye_hex required' });
    const season = determineSeason(skin_hex, hair_hex, eye_hex);
    return res.json({ skin_hex, hair_hex, eye_hex, season, recommended_palette: SEASON_PALETTES[season] });
  } catch (e) {
    return res.status(500).json({ error: 'analyze failed' });
  }
});

module.exports = router;
