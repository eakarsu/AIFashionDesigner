require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Make pool available to routes
app.locals.pool = pool;

// Security headers
app.use(helmet());

// Env-based CORS allowlist
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/styles', require('./routes/styles'));
app.use('/api/colors', require('./routes/colors'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/wardrobe', require('./routes/wardrobe'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/moodboards', require('./routes/moodboards'));
app.use('/api/stylist', require('./routes/stylist'));
app.use('/api/fabrics', require('./routes/fabrics'));
app.use('/api/seasonal', require('./routes/seasonal'));
app.use('/api/bodytype', require('./routes/bodytype'));
app.use('/api/accessories', require('./routes/accessories'));
app.use('/api/history', require('./routes/history'));
app.use('/api/sustainable', require('./routes/sustainable'));
app.use('/api/celebrity', require('./routes/celebrity'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/calendar', require('./routes/calendar'));
// Apply pass 5 — backlog extensions (try-on, social shares, rentals)
app.use('/api/extensions', require('./routes/extensions'));
app.use('/api/agentic-stylist', require('./routes/agenticStylist'));
app.use('/api/virtual-wardrobe', require('./routes/virtualWardrobe'));
app.use('/api/personal-color-analysis', require('./routes/personalColorAnalysis'));
app.use('/api/sustainability-score', require('./routes/sustainabilityScore'));
app.use('/api/rental-integration', require('./routes/rentalIntegration'));
app.use('/api/style-evolution', require('./routes/styleEvolution'));
app.use('/api/influencer-collab', require('./routes/influencerCollab'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Bootstrap schema additions on startup so the schema-vs-route mismatch
// flagged in the audit (missing user_id columns, wear_count, purchase_price)
// is auto-corrected without re-running the destructive seed.
async function ensureSchemaPatches() {
  const userScopedTables = [
    'outfits', 'wardrobe', 'ratings', 'moodboards',
    'stylist_chats', 'styles', 'trends', 'color_palettes',
    'fabrics', 'seasonal_collections', 'bodytype_guides',
    'accessories', 'fashion_history', 'sustainable_fashion',
    'celebrity_styles'
  ];
  for (const t of userScopedTables) {
    try {
      await pool.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS user_id INTEGER`);
    } catch (e) {
      // Table may not exist yet; seed will create it. Ignore here.
    }
  }
  // Wardrobe extras
  try {
    await pool.query(`ALTER TABLE wardrobe ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2)`);
    await pool.query(`ALTER TABLE wardrobe ADD COLUMN IF NOT EXISTS wear_count INTEGER DEFAULT 0`);
  } catch (e) { /* ignore */ }
}

ensureSchemaPatches()
  .then(() => {
    
// === Batch 03 Gaps & Frontend Mounts ===
try {
  const _batch03 = require('./routes/batch03Gaps');
  if (typeof authenticateToken === 'function') app.use('/api', authenticateToken, _batch03);
  else app.use('/api', _batch03);
} catch (_e) { /* batch03 gap routes optional */ }

app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Schema patch failed (continuing anyway):', err.message);
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  });
