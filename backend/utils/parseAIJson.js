/**
 * 3-strategy JSON parser for AI responses.
 *  1. Direct JSON.parse
 *  2. First {...} block extracted by regex
 *  3. Repair truncated/unclosed JSON
 */
function parseAIJson(text) {
  if (!text || typeof text !== 'string') return null;

  // 1. direct
  try { return JSON.parse(text); } catch (_) {}

  // 2. extract first {...}
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  } catch (_) {}

  // 3. repair
  try {
    const m = text.match(/\{[\s\S]*\}?/);
    if (!m) return null;
    let fixed = m[0].replace(/,\s*$/, '');
    const opens = { '{': 0, '[': 0 };
    const closes = { '}': '{', ']': '[' };
    let inString = false;
    let escape = false;
    for (const ch of fixed) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{' || ch === '[') opens[ch]++;
      if (ch === '}' || ch === ']') opens[closes[ch]]--;
    }
    if (inString) fixed += '"';
    for (let i = 0; i < opens['[']; i++) fixed += ']';
    for (let i = 0; i < opens['{']; i++) fixed += '}';
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(fixed);
  } catch (_) {
    return null;
  }
}

module.exports = { parseAIJson };
