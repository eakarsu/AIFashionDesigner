// Style evolution tracking: show how style changes over time.
const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/style-evolution/timeline?bucket=quarter
router.get('/timeline', auth, async (req, res) => {
  try {
    const bucket = (req.query.bucket || 'quarter') === 'month' ? 'month' : 'quarter';
    const pool = req.app.locals.pool;
    const r = await pool.query(
      `SELECT date_trunc('${bucket}', created_at) AS period, category, COUNT(*) AS n
       FROM history WHERE user_id = $1 GROUP BY 1, 2 ORDER BY 1 ASC`,
      [req.user.id]
    ).catch(() => ({ rows: [] }));
    const grouped = {};
    for (const row of r.rows) {
      const k = row.period.toISOString ? row.period.toISOString() : row.period;
      grouped[k] = grouped[k] || {};
      grouped[k][row.category] = Number(row.n);
    }
    const milestones = Object.keys(grouped).map(period => ({ period, breakdown: grouped[period] }));
    return res.json({ bucket, milestones });
  } catch (e) {
    return res.status(500).json({ error: 'timeline failed' });
  }
});

module.exports = router;
