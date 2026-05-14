const router = require('express').Router();
const auth = require('../middleware/auth');

// Ensure outfit_calendar table exists on first use
async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS outfit_calendar (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      outfit_id INTEGER,
      planned_date DATE NOT NULL,
      event_type VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

/**
 * POST /api/calendar
 * Create a planned outfit entry.
 * Body: { outfit_id, planned_date, event_type, notes }
 */
router.post('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await ensureTable(pool);

    const { outfit_id, planned_date, event_type, notes } = req.body;

    if (!planned_date) {
      return res.status(400).json({ error: 'planned_date is required' });
    }

    const result = await pool.query(
      'INSERT INTO outfit_calendar (user_id, outfit_id, planned_date, event_type, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, outfit_id || null, planned_date, event_type || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * GET /api/calendar
 * Returns user's planned outfits for a date range, joined with outfit details.
 * Query: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
router.get('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await ensureTable(pool);

    const { start_date, end_date } = req.query;

    let query = `
      SELECT c.*, o.name AS outfit_name, o.occasion, o.style, o.season, o.items, o.description AS outfit_description
      FROM outfit_calendar c
      LEFT JOIN outfits o ON o.id = c.outfit_id AND o.user_id = c.user_id
      WHERE c.user_id = $1
    `;
    const params = [req.user.id];

    if (start_date) {
      params.push(start_date);
      query += ` AND c.planned_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND c.planned_date <= $${params.length}`;
    }

    query += ' ORDER BY c.planned_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * GET /api/calendar/packing-list
 * Returns all planned outfits in a date range as a formatted packing list.
 * Query: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
router.get('/packing-list', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await ensureTable(pool);

    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const result = await pool.query(`
      SELECT c.planned_date, c.event_type, c.notes,
             o.name AS outfit_name, o.items AS outfit_items, o.style, o.season
      FROM outfit_calendar c
      LEFT JOIN outfits o ON o.id = c.outfit_id AND o.user_id = c.user_id
      WHERE c.user_id = $1 AND c.planned_date >= $2 AND c.planned_date <= $3
      ORDER BY c.planned_date ASC
    `, [req.user.id, start_date, end_date]);

    const entries = result.rows;

    // Build a deduplicated packing list from outfit items
    const allItems = new Set();
    const dailyPlan = entries.map(e => {
      const items = e.outfit_items ? e.outfit_items.split(',').map(i => i.trim()) : [];
      items.forEach(i => i && allItems.add(i));
      return {
        date: e.planned_date,
        event_type: e.event_type,
        outfit: e.outfit_name || 'No outfit assigned',
        items,
        notes: e.notes
      };
    });

    res.json({
      trip_range: { start_date, end_date },
      daily_plan: dailyPlan,
      packing_list: Array.from(allItems)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * DELETE /api/calendar/:id — remove a calendar entry (user-isolated)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await pool.query(
      'DELETE FROM outfit_calendar WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
