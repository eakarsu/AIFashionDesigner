const rateLimit = require('express-rate-limit');

let ipKeyGenerator;
try { ({ ipKeyGenerator } = require('express-rate-limit')); } catch (_) { ipKeyGenerator = null; }

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) return `user:${req.user.id}`;
    if (ipKeyGenerator) return ipKeyGenerator(req, res);
    return req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please try again after an hour.' }
});

// Stricter limiter for auth endpoints to prevent brute-force
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: (req, res) => (ipKeyGenerator ? ipKeyGenerator(req, res) : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' }
});

module.exports = { aiRateLimiter, authRateLimiter };
