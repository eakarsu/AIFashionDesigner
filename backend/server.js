require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Make pool available to routes
app.locals.pool = pool;

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
