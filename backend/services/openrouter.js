const https = require('https');

/**
 * Centralized OpenRouter caller. Returns assistant message string.
 * Throws on transport / API errors.
 */
function callOpenRouter(prompt, systemPrompt, opts = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';
  const max_tokens = opts.max_tokens || 2000;
  const temperature = opts.temperature ?? 0.7;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return Promise.reject(new Error('OPENROUTER_API_KEY is not configured'));
  }
  const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
  const endpoint = new URL(`${baseUrl}/chat/completions`);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens,
      temperature
    });

    const options = {
      hostname: endpoint.hostname,
      port: endpoint.port || 443,
      path: endpoint.pathname + endpoint.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
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
            return reject(new Error(parsed.error.message || 'OpenRouter API error'));
          }
          const content = parsed.choices?.[0]?.message?.content;
          if (!content) return reject(new Error('OpenRouter returned an empty response'));
          resolve(content);
        } catch (e) {
          reject(new Error('Failed to parse AI response: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { callOpenRouter };
