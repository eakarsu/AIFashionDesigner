const router = require('express').Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../services/openrouter');
const { parseAIJson } = require('../utils/parseAIJson');

// Helper for thin AI endpoints
async function aiHandler(req, res, prompt, systemPrompt) {
  try {
    const result = await callOpenRouter(prompt, systemPrompt);
    res.json({ result });
  } catch (err) {
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}

// Generate outfit suggestion
router.post('/generate-outfit', auth, aiRateLimiter, (req, res) => {
  const { occasion, style, season, preferences } = req.body;
  const prompt = `Create a detailed outfit suggestion for: Occasion: ${occasion}, Style: ${style}, Season: ${season}, Preferences: ${preferences}. Include specific clothing items, colors, and styling tips.`;
  return aiHandler(req, res, prompt, 'You are an expert fashion designer and stylist. Provide detailed, creative outfit suggestions with specific items, colors, brands, and styling tips.');
});

// Analyze style
router.post('/analyze-style', auth, aiRateLimiter, (req, res) => {
  const { description, items } = req.body;
  const prompt = `Analyze this fashion style: ${description}. Items worn: ${items}. Provide a detailed style analysis including style category, strengths, areas for improvement, and personalized recommendations.`;
  return aiHandler(req, res, prompt, 'You are a professional fashion style analyst. Analyze clothing choices and provide insightful, constructive feedback about personal style.');
});

// Color palette
router.post('/color-palette', auth, aiRateLimiter, (req, res) => {
  const { skinTone, hairColor, eyeColor, preferences } = req.body;
  const prompt = `Create a personalized color palette for someone with: Skin tone: ${skinTone}, Hair: ${hairColor}, Eyes: ${eyeColor}, Preferences: ${preferences}. Suggest primary, secondary, and accent colors for their wardrobe with hex codes.`;
  return aiHandler(req, res, prompt, 'You are a color theory expert specializing in fashion. Create personalized color palettes that complement individual features and suggest specific hex color codes.');
});

// Trend forecast
router.post('/trend-forecast', auth, aiRateLimiter, (req, res) => {
  const { category, season, year } = req.body;
  const prompt = `Forecast fashion trends for ${category} in ${season} ${year}. Include emerging styles, colors, patterns, fabrics, and key pieces to invest in.`;
  return aiHandler(req, res, prompt, 'You are a fashion trend forecaster with deep knowledge of runway shows, street style, and emerging designers. Provide detailed trend predictions.');
});

// Rate outfit
router.post('/rate-outfit', auth, aiRateLimiter, (req, res) => {
  const { outfitDescription, occasion } = req.body;
  const prompt = `Rate this outfit on a scale of 1-10: ${outfitDescription}. Occasion: ${occasion}. Provide scores for: Overall Look, Color Coordination, Occasion Appropriateness, Trend Alignment, and Creativity. Give detailed feedback and improvement suggestions.`;
  return aiHandler(req, res, prompt, 'You are a fashion critic and stylist. Rate outfits fairly and provide constructive, detailed feedback with specific improvement suggestions.');
});

// Mood board
router.post('/mood-board', auth, aiRateLimiter, (req, res) => {
  const { theme, aesthetic, colors } = req.body;
  const prompt = `Create a detailed fashion mood board concept for: Theme: ${theme}, Aesthetic: ${aesthetic}, Colors: ${colors}. Describe the visual elements, textures, patterns, key pieces, and overall mood in vivid detail.`;
  return aiHandler(req, res, prompt, 'You are a creative director specializing in fashion mood boards. Create vivid, inspiring mood board concepts with detailed visual descriptions.');
});

// Personal stylist chat
router.post('/stylist-chat', auth, aiRateLimiter, (req, res) => {
  const { message, context } = req.body;
  const prompt = `${context ? 'Context: ' + context + '. ' : ''}User question: ${message}`;
  return aiHandler(req, res, prompt, 'You are a warm, knowledgeable personal fashion stylist. Answer fashion questions with expertise, provide personalized advice, and be encouraging while being honest about what works and what doesn\'t.');
});

// Fabric advisor
router.post('/fabric-advice', auth, aiRateLimiter, (req, res) => {
  const { garmentType, climate, budget, preferences } = req.body;
  const prompt = `Recommend fabrics for: Garment: ${garmentType}, Climate: ${climate}, Budget: ${budget}, Preferences: ${preferences}. Include fabric types, pros/cons, care instructions, and sustainability ratings.`;
  return aiHandler(req, res, prompt, 'You are a textile expert and fashion designer. Provide detailed fabric recommendations with practical care advice and sustainability considerations.');
});

// Seasonal collection
router.post('/seasonal-collection', auth, aiRateLimiter, (req, res) => {
  const { season, style, budget } = req.body;
  const prompt = `Design a capsule collection for ${season} with ${style} style and ${budget} budget. Include 10 essential pieces with descriptions, styling combinations, and investment priorities.`;
  return aiHandler(req, res, prompt, 'You are a fashion designer creating seasonal capsule collections. Design practical, stylish collections that maximize outfit combinations.');
});

// Body type advice
router.post('/bodytype-advice', auth, aiRateLimiter, (req, res) => {
  const { bodyType, preferences, concerns } = req.body;
  const prompt = `Provide styling advice for ${bodyType} body type. Preferences: ${preferences}. Concerns: ${concerns}. Include flattering silhouettes, patterns, fabrics, and specific clothing recommendations.`;
  return aiHandler(req, res, prompt, 'You are a body-positive fashion stylist. Provide inclusive, empowering styling advice that celebrates all body types while helping people feel confident.');
});

// Accessory matcher
router.post('/accessory-match', auth, aiRateLimiter, (req, res) => {
  const { outfitDescription, occasion, style } = req.body;
  const prompt = `Suggest accessories to complement this outfit: ${outfitDescription}. Occasion: ${occasion}, Style: ${style}. Include jewelry, bags, shoes, belts, scarves, and other accessories with specific recommendations.`;
  return aiHandler(req, res, prompt, 'You are an accessories expert and fashion stylist. Suggest the perfect accessories to complete any outfit with specific product recommendations.');
});

// Fashion history
router.post('/fashion-history', auth, aiRateLimiter, (req, res) => {
  const { era, topic } = req.body;
  const prompt = `Tell me about fashion in the ${era} era, focusing on ${topic}. Include key designers, iconic looks, cultural influences, and lasting impact on modern fashion.`;
  return aiHandler(req, res, prompt, 'You are a fashion historian with encyclopedic knowledge. Share fascinating fashion history with engaging storytelling and connections to modern style.');
});

// Sustainable fashion
router.post('/sustainable-advice', auth, aiRateLimiter, (req, res) => {
  const { currentWardrobe, goals, budget } = req.body;
  const prompt = `Provide sustainable fashion advice. Current wardrobe: ${currentWardrobe}. Goals: ${goals}. Budget: ${budget}. Include eco-friendly brands, upcycling ideas, capsule wardrobe tips, and environmental impact information.`;
  return aiHandler(req, res, prompt, 'You are a sustainable fashion expert. Provide practical, actionable advice for building an eco-friendly wardrobe without sacrificing style.');
});

// Celebrity style
router.post('/celebrity-style', auth, aiRateLimiter, (req, res) => {
  const { celebrity, budget, occasion } = req.body;
  const prompt = `Help me achieve ${celebrity}'s style on a ${budget} budget for ${occasion}. Analyze their signature looks, key pieces, and provide affordable alternatives to recreate their iconic style.`;
  return aiHandler(req, res, prompt, 'You are a celebrity fashion expert. Help recreate celebrity looks with affordable alternatives while maintaining the essence of their style.');
});

/**
 * POST /api/ai/trip-packing-list
 * Pulls user's wardrobe rows and asks AI for a day-by-day plan + checklist.
 */
router.post('/trip-packing-list', auth, aiRateLimiter, async (req, res) => {
  try {
    const { trip_start, trip_end, events, weather_description } = req.body;
    if (!trip_start || !trip_end) {
      return res.status(400).json({ error: 'trip_start and trip_end are required' });
    }

    const pool = req.app.locals.pool;
    const wardrobeResult = await pool.query(
      'SELECT id, name, category, color, brand, size, material, season FROM wardrobe WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const wardrobeItems = wardrobeResult.rows;
    const wardrobeList = wardrobeItems.map(w =>
      `- [${w.category}] ${w.name}${w.color ? ' (' + w.color + ')' : ''}${w.brand ? ' by ' + w.brand : ''}`
    ).join('\n');

    const eventsText = Array.isArray(events) && events.length > 0
      ? events.map(e => `  - ${e.date}: ${e.event_type}`).join('\n')
      : '  (No specific events provided)';

    const prompt = `
Trip: ${trip_start} to ${trip_end}
Weather: ${weather_description || 'Not specified'}

Events:
${eventsText}

My Wardrobe:
${wardrobeList || '(No wardrobe items found)'}

Generate a day-by-day outfit plan and a consolidated packing checklist.
Return valid JSON with this structure:
{
  "daily_outfits": [
    { "date": "YYYY-MM-DD", "event_type": "string", "outfit": "description", "items": ["item1", "item2"] }
  ],
  "packing_list": ["item1", "item2", ...],
  "tips": ["tip1", "tip2"]
}`;

    const result = await callOpenRouter(
      prompt,
      'You are an expert travel stylist. Generate practical day-by-day outfit plans and packing checklists. Always respond with valid JSON only, no markdown.'
    );

    const parsed = parseAIJson(result) || { raw: result };
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ai/wardrobe-audit
 * Pulls user's wardrobe rows and asks AI for donate/repair/keep + gap analysis.
 * Apply pass 4 (mechanical backlog).
 */
router.post('/wardrobe-audit', auth, aiRateLimiter, async (req, res) => {
  try {
    const { goals, lifestyle } = req.body || {};
    const pool = req.app.locals.pool;
    const wardrobeResult = await pool.query(
      'SELECT id, name, category, color, brand, size, material, season, wear_count, purchase_price FROM wardrobe WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    );
    const items = wardrobeResult.rows;
    const wardrobeList = items.map(w =>
      `- [${w.category || 'uncategorized'}] ${w.name}${w.color ? ' (' + w.color + ')' : ''}${w.brand ? ' by ' + w.brand : ''}${w.wear_count != null ? ' [worn ' + w.wear_count + 'x]' : ''}`
    ).join('\n');

    const prompt = `
Audit the wardrobe below and return recommendations.

Lifestyle: ${lifestyle || 'Not specified'}
Goals: ${goals || 'General optimization'}

My Wardrobe (${items.length} items):
${wardrobeList || '(No wardrobe items found)'}

Return valid JSON with this structure:
{
  "keep": [{ "name": "string", "reason": "string" }],
  "donate": [{ "name": "string", "reason": "string" }],
  "repair": [{ "name": "string", "reason": "string" }],
  "supplement": [{ "category": "string", "reason": "string" }],
  "gap_analysis": "string",
  "summary": "string"
}`;

    const result = await callOpenRouter(
      prompt,
      'You are an expert wardrobe consultant. Analyze a wardrobe and recommend keep/donate/repair actions plus gaps to fill. Respond with valid JSON only, no markdown.'
    );
    const parsed = parseAIJson(result) || { raw: result, result };
    res.json(parsed);
  } catch (err) {
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ai/personal-color-analysis
 * Takes user-supplied skin/hair/eye color tags and returns flattering palette
 * mapped to existing colors rows. Apply pass 4 (mechanical backlog).
 */
router.post('/personal-color-analysis', auth, aiRateLimiter, async (req, res) => {
  try {
    const { skin_tone, hair_color, eye_color, undertone, contrast_level } = req.body || {};
    if (!skin_tone && !hair_color && !eye_color) {
      return res.status(400).json({ error: 'At least one of skin_tone, hair_color, eye_color is required' });
    }

    const pool = req.app.locals.pool;
    let availableColors = [];
    try {
      const colorRows = await pool.query(
        'SELECT id, name, primary_color, secondary_color, accent_color, season FROM color_palettes ORDER BY id DESC LIMIT 30'
      );
      availableColors = colorRows.rows;
    } catch (_) { /* table may not exist yet */ }

    const colorsList = availableColors.map(c =>
      `- ${c.name}: primary=${c.primary_color || '?'} secondary=${c.secondary_color || '?'} accent=${c.accent_color || '?'} (${c.season || 'all'})`
    ).join('\n');

    const prompt = `
Perform a personal color analysis.

Skin tone: ${skin_tone || 'not provided'}
Hair color: ${hair_color || 'not provided'}
Eye color: ${eye_color || 'not provided'}
Undertone: ${undertone || 'unknown'}
Contrast level: ${contrast_level || 'unknown'}

Existing color palettes available in this app:
${colorsList || '(none stored yet)'}

Return valid JSON with this structure:
{
  "season_type": "Spring|Summer|Autumn|Winter",
  "undertone": "warm|cool|neutral",
  "best_colors": [{ "name": "string", "hex": "#RRGGBB", "why": "string" }],
  "avoid_colors": [{ "name": "string", "hex": "#RRGGBB", "why": "string" }],
  "matched_palettes": [{ "id": number, "name": "string", "match_reason": "string" }],
  "styling_tips": ["string"]
}`;

    const result = await callOpenRouter(
      prompt,
      'You are a certified personal color analyst. Give a season type, undertone, recommended palette with hex codes, colors to avoid, and map results to provided palettes. Respond with valid JSON only, no markdown.'
    );
    const parsed = parseAIJson(result) || { raw: result, result };
    res.json(parsed);
  } catch (err) {
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Apply pass 5 wave-1 — sustainability-score + style-evolution
// ============================================================

/**
 * POST /api/ai/sustainability-score
 * Body: { items?: [{name, brand?, fabric?, condition?, year_acquired?}] }
 * If items omitted, pulls user's wardrobe rows.
 */
router.post('/sustainability-score', auth, aiRateLimiter, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    let { items } = req.body || {};
    if (!Array.isArray(items)) {
      try {
        const r = await pool.query(
          `SELECT id, name, brand, category, fabric, condition, color, year_acquired
           FROM wardrobe WHERE user_id = $1 LIMIT 200`,
          [req.user.id]
        );
        items = r.rows;
      } catch { items = []; }
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'items array required (or wardrobe rows must exist)' });
    }

    const sysPrompt = 'You are a sustainable-fashion analyst. Score garments on eco-impact (carbon, water, microplastic shedding, dye chemistry, durability, repairability) using publicly known fabric/brand heuristics. Return strict JSON only, no markdown.';
    const prompt = `Items:
${JSON.stringify(items).substring(0, 6000)}

Return JSON:
{
  "aggregate_score": 0-100,
  "score_breakdown": {"carbon": 0-100, "water": 0-100, "microplastic": 0-100, "longevity": 0-100, "circularity": 0-100},
  "per_item": [{"id_or_index": "...", "name": "...", "score": 0-100, "main_concerns": ["..."]}],
  "improvement_plan": [{"action": "swap|repair|donate|repurpose|keep", "item_ref": "...", "reason": "..."}],
  "executive_summary": "<3-5 sentences>",
  "disclaimer": "Heuristic guidance based on public fabric/brand data — not a verified LCA."
}`;

    const result = await callOpenRouter(prompt, sysPrompt);
    const parsed = parseAIJson(result) || { raw: result };
    res.json({ count: items.length, score: parsed });
  } catch (err) {
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ai/style-evolution
 * Body: { window_months?: number }  (default 24)
 */
router.post('/style-evolution', auth, aiRateLimiter, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const windowMonths = Math.min(Math.max(parseInt(req.body?.window_months || 24, 10) || 24, 6), 120);

    let history = [];
    try {
      const r = await pool.query(
        `SELECT created_at, action, payload FROM history
         WHERE user_id = $1 AND created_at >= NOW() - ($2 || ' months')::interval
         ORDER BY created_at ASC LIMIT 500`,
        [req.user.id, String(windowMonths)]
      );
      history = r.rows;
    } catch {
      try {
        const r = await pool.query(
          `SELECT id, name, brand, category, color, year_acquired, created_at FROM wardrobe
           WHERE user_id = $1 ORDER BY COALESCE(year_acquired, EXTRACT(YEAR FROM created_at)) ASC LIMIT 200`,
          [req.user.id]
        );
        history = r.rows.map(x => ({ created_at: x.created_at, action: 'wardrobe_add', payload: x }));
      } catch { history = []; }
    }

    if (history.length === 0) {
      return res.status(404).json({ error: 'No history or wardrobe data found for this user.' });
    }

    const sysPrompt = 'You are a style anthropologist. Analyze a user\'s clothing/fashion timeline and identify their style evolution: phases, recurring motifs, color shifts, brand drift, and milestone garments. Return strict JSON only.';
    const prompt = `Window: last ${windowMonths} months
History (up to 200 events):
${JSON.stringify(history.slice(0, 200)).substring(0, 7000)}

Return JSON:
{
  "phases": [{"name": "...", "approx_period": "YYYY-Q? .. YYYY-Q?", "characteristics": ["..."]}],
  "recurring_motifs": ["..."],
  "color_palette_shifts": [{"from_palette": "...", "to_palette": "...", "approx_when": "..."}],
  "brand_drift": [{"from": "...", "to": "...", "trend": "more|less|same"}],
  "milestone_items": [{"name": "...", "why_milestone": "..."}],
  "next_phase_prediction": {"label": "...", "rationale": "..."},
  "executive_summary": "<3-5 sentences>"
}`;

    const result = await callOpenRouter(prompt, sysPrompt);
    const parsed = parseAIJson(result) || { raw: result };
    res.json({ window_months: windowMonths, event_count: history.length, evolution: parsed });
  } catch (err) {
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
