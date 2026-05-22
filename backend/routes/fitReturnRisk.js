const router = require('express').Router();
const auth = require('../middleware/auth');

router.post('/score', auth, (req, res) => {
  const {
    sizeVarianceCm = 0,
    stretchPercent = 0,
    reviewFitComplaints = 0,
    returnWindowDays = 30,
    tryOnConfidence = 5,
  } = req.body || {};

  const score = Math.min(100, Math.round(
    Math.max(0, Number(sizeVarianceCm) || 0) * 9 +
    Math.max(0, 20 - (Number(stretchPercent) || 0)) * 1.2 +
    (Number(reviewFitComplaints) || 0) * 8 +
    Math.max(0, 14 - (Number(returnWindowDays) || 0)) * 2 +
    Math.max(0, 5 - (Number(tryOnConfidence) || 0)) * 9
  ));

  const recommendations = [
    score >= 65 && 'Require fit note review before purchase or rental approval.',
    (Number(sizeVarianceCm) || 0) > 3 && 'Choose adjustable closures or size up with tailoring plan.',
    (Number(stretchPercent) || 0) < 8 && 'Avoid low-stretch silhouettes for high-mobility use.',
    (Number(reviewFitComplaints) || 0) > 2 && 'Compare garment measurements against similar returned items.',
  ].filter(Boolean);

  res.json({
    feature: 'fit_return_risk',
    score,
    level: score >= 70 ? 'high' : score >= 35 ? 'medium' : 'low',
    recommendations: recommendations.length ? recommendations : ['Fit risk is acceptable for this item.'],
  });
});

module.exports = router;
