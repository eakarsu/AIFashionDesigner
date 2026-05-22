import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function cellColor(value, max) {
  const t = Math.min(1, value / max);
  // Cool teal -> warm coral palette
  const r = Math.round(20 + (233 - 20) * t);
  const g = Math.round(160 - (160 - 69) * t);
  const b = Math.round(180 - (180 - 96) * t);
  return `rgb(${r},${g},${b})`;
}

export default function ColorPaletteHeatmap({ token }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`${API}/api/custom-views/color-palette-heatmap`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setPayload(d))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: 16 }}>Loading heatmap...</div>;
  if (err) return <div style={{ padding: 16, color: '#e94560' }}>Error: {err}</div>;
  if (!payload) return null;

  const { colors, seasons, data, max } = payload;

  return (
    <div style={{
      background: '#16213e', padding: 24, borderRadius: 12,
      border: '1px solid #2a3a5c', color: '#e6e6e6'
    }}>
      <h3 style={{ marginTop: 0, color: '#e94560' }}>Color Palette Heatmap</h3>
      <p style={{ color: '#8892b0', fontSize: 13, marginTop: -8 }}>
        Usage frequency: color x season
      </p>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 6, fontSize: 12, color: '#8892b0' }}>Color</th>
            {seasons.map(s => (
              <th key={s} style={{ padding: 6, fontSize: 12, color: '#8892b0' }}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.color}>
              <td style={{ padding: 6, fontSize: 13 }}>{row.color}</td>
              {seasons.map(s => {
                const v = row[s];
                return (
                  <td
                    key={s}
                    data-testid={`heat-${row.color}-${s}`}
                    title={`${row.color} / ${s}: ${v}`}
                    style={{
                      background: cellColor(v, max),
                      color: '#0f1424',
                      textAlign: 'center',
                      padding: '10px 8px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 13,
                      minWidth: 40,
                    }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16, fontSize: 12, color: '#8892b0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Low</span>
        <div style={{
          flex: 1, height: 8, borderRadius: 4,
          background: 'linear-gradient(90deg, rgb(20,160,180), rgb(233,69,96))'
        }} />
        <span>High</span>
      </div>
    </div>
  );
}
