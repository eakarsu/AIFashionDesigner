import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function CollectionTrendChart({ token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`${API}/api/custom-views/collection-trends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setRows(d.data || []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: 16 }}>Loading trend chart...</div>;
  if (err) return <div style={{ padding: 16, color: '#e94560' }}>Error: {err}</div>;

  const max = Math.max(1, ...rows.map(r => r.total));
  return (
    <div style={{
      background: '#16213e', padding: 24, borderRadius: 12,
      border: '1px solid #2a3a5c', color: '#e6e6e6'
    }}>
      <h3 style={{ marginTop: 0, color: '#e94560' }}>Collection Trends by Season</h3>
      <p style={{ color: '#8892b0', fontSize: 13, marginTop: -8 }}>
        Designs &amp; collections grouped by season
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 240, padding: '16px 0' }}>
        {rows.map(r => {
          const designH = (r.designs / max) * 200;
          const collH = (r.collections / max) * 200;
          return (
            <div key={r.season} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 210, justifyContent: 'center' }}>
                <div
                  data-testid={`bar-designs-${r.season}`}
                  style={{
                    width: 30, height: designH,
                    background: 'linear-gradient(180deg, #e94560, #b81c3f)',
                    borderRadius: '4px 4px 0 0',
                  }}
                  title={`${r.designs} designs`}
                />
                <div
                  style={{
                    width: 30, height: collH,
                    background: 'linear-gradient(180deg, #f5b942, #c98e1f)',
                    borderRadius: '4px 4px 0 0',
                  }}
                  title={`${r.collections} collections`}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 13 }}>{r.season}</div>
              <div style={{ fontSize: 11, color: '#8892b0' }}>{r.total} total</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#8892b0', marginTop: 8 }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#e94560', marginRight: 6, verticalAlign: 'middle' }} />Designs</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f5b942', marginRight: 6, verticalAlign: 'middle' }} />Collections</span>
      </div>
    </div>
  );
}
