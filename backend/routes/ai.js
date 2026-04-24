const router = require('express').Router();
const https = require('https');
const auth = require('../middleware/auth');

function callOpenRouter(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Fashion Designer'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            resolve(parsed.choices[0].message.content);
          }
        } catch (e) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Generate outfit suggestion
router.post('/generate-outfit', auth, async (req, res) => {
  try {
    const { occasion, style, season, preferences } = req.body;
    const prompt = `Create a detailed outfit suggestion for: Occasion: ${occasion}, Style: ${style}, Season: ${season}, Preferences: ${preferences}. Include specific clothing items, colors, and styling tips.`;
    const result = await callOpenRouter(prompt, 'You are an expert fashion designer and stylist. Provide detailed, creative outfit suggestions with specific items, colors, brands, and styling tips.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze style
router.post('/analyze-style', auth, async (req, res) => {
  try {
    const { description, items } = req.body;
    const prompt = `Analyze this fashion style: ${description}. Items worn: ${items}. Provide a detailed style analysis including style category, strengths, areas for improvement, and personalized recommendations.`;
    const result = await callOpenRouter(prompt, 'You are a professional fashion style analyst. Analyze clothing choices and provide insightful, constructive feedback about personal style.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Color palette
router.post('/color-palette', auth, async (req, res) => {
  try {
    const { skinTone, hairColor, eyeColor, preferences } = req.body;
    const prompt = `Create a personalized color palette for someone with: Skin tone: ${skinTone}, Hair: ${hairColor}, Eyes: ${eyeColor}, Preferences: ${preferences}. Suggest primary, secondary, and accent colors for their wardrobe with hex codes.`;
    const result = await callOpenRouter(prompt, 'You are a color theory expert specializing in fashion. Create personalized color palettes that complement individual features and suggest specific hex color codes.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trend forecast
router.post('/trend-forecast', auth, async (req, res) => {
  try {
    const { category, season, year } = req.body;
    const prompt = `Forecast fashion trends for ${category} in ${season} ${year}. Include emerging styles, colors, patterns, fabrics, and key pieces to invest in.`;
    const result = await callOpenRouter(prompt, 'You are a fashion trend forecaster with deep knowledge of runway shows, street style, and emerging designers. Provide detailed trend predictions.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate outfit
router.post('/rate-outfit', auth, async (req, res) => {
  try {
    const { outfitDescription, occasion } = req.body;
    const prompt = `Rate this outfit on a scale of 1-10: ${outfitDescription}. Occasion: ${occasion}. Provide scores for: Overall Look, Color Coordination, Occasion Appropriateness, Trend Alignment, and Creativity. Give detailed feedback and improvement suggestions.`;
    const result = await callOpenRouter(prompt, 'You are a fashion critic and stylist. Rate outfits fairly and provide constructive, detailed feedback with specific improvement suggestions.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mood board
router.post('/mood-board', auth, async (req, res) => {
  try {
    const { theme, aesthetic, colors } = req.body;
    const prompt = `Create a detailed fashion mood board concept for: Theme: ${theme}, Aesthetic: ${aesthetic}, Colors: ${colors}. Describe the visual elements, textures, patterns, key pieces, and overall mood in vivid detail.`;
    const result = await callOpenRouter(prompt, 'You are a creative director specializing in fashion mood boards. Create vivid, inspiring mood board concepts with detailed visual descriptions.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Personal stylist chat
router.post('/stylist-chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    const prompt = `${context ? 'Context: ' + context + '. ' : ''}User question: ${message}`;
    const result = await callOpenRouter(prompt, 'You are a warm, knowledgeable personal fashion stylist. Answer fashion questions with expertise, provide personalized advice, and be encouraging while being honest about what works and what doesn\'t.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fabric advisor
router.post('/fabric-advice', auth, async (req, res) => {
  try {
    const { garmentType, climate, budget, preferences } = req.body;
    const prompt = `Recommend fabrics for: Garment: ${garmentType}, Climate: ${climate}, Budget: ${budget}, Preferences: ${preferences}. Include fabric types, pros/cons, care instructions, and sustainability ratings.`;
    const result = await callOpenRouter(prompt, 'You are a textile expert and fashion designer. Provide detailed fabric recommendations with practical care advice and sustainability considerations.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seasonal collection
router.post('/seasonal-collection', auth, async (req, res) => {
  try {
    const { season, style, budget } = req.body;
    const prompt = `Design a capsule collection for ${season} with ${style} style and ${budget} budget. Include 10 essential pieces with descriptions, styling combinations, and investment priorities.`;
    const result = await callOpenRouter(prompt, 'You are a fashion designer creating seasonal capsule collections. Design practical, stylish collections that maximize outfit combinations.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Body type advice
router.post('/bodytype-advice', auth, async (req, res) => {
  try {
    const { bodyType, preferences, concerns } = req.body;
    const prompt = `Provide styling advice for ${bodyType} body type. Preferences: ${preferences}. Concerns: ${concerns}. Include flattering silhouettes, patterns, fabrics, and specific clothing recommendations.`;
    const result = await callOpenRouter(prompt, 'You are a body-positive fashion stylist. Provide inclusive, empowering styling advice that celebrates all body types while helping people feel confident.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accessory matcher
router.post('/accessory-match', auth, async (req, res) => {
  try {
    const { outfitDescription, occasion, style } = req.body;
    const prompt = `Suggest accessories to complement this outfit: ${outfitDescription}. Occasion: ${occasion}, Style: ${style}. Include jewelry, bags, shoes, belts, scarves, and other accessories with specific recommendations.`;
    const result = await callOpenRouter(prompt, 'You are an accessories expert and fashion stylist. Suggest the perfect accessories to complete any outfit with specific product recommendations.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fashion history
router.post('/fashion-history', auth, async (req, res) => {
  try {
    const { era, topic } = req.body;
    const prompt = `Tell me about fashion in the ${era} era, focusing on ${topic}. Include key designers, iconic looks, cultural influences, and lasting impact on modern fashion.`;
    const result = await callOpenRouter(prompt, 'You are a fashion historian with encyclopedic knowledge. Share fascinating fashion history with engaging storytelling and connections to modern style.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sustainable fashion
router.post('/sustainable-advice', auth, async (req, res) => {
  try {
    const { currentWardrobe, goals, budget } = req.body;
    const prompt = `Provide sustainable fashion advice. Current wardrobe: ${currentWardrobe}. Goals: ${goals}. Budget: ${budget}. Include eco-friendly brands, upcycling ideas, capsule wardrobe tips, and environmental impact information.`;
    const result = await callOpenRouter(prompt, 'You are a sustainable fashion expert. Provide practical, actionable advice for building an eco-friendly wardrobe without sacrificing style.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Celebrity style
router.post('/celebrity-style', auth, async (req, res) => {
  try {
    const { celebrity, budget, occasion } = req.body;
    const prompt = `Help me achieve ${celebrity}'s style on a ${budget} budget for ${occasion}. Analyze their signature looks, key pieces, and provide affordable alternatives to recreate their iconic style.`;
    const result = await callOpenRouter(prompt, 'You are a celebrity fashion expert. Help recreate celebrity looks with affordable alternatives while maintaining the essence of their style.');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
