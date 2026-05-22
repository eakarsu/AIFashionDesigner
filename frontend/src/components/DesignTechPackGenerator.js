import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const initial = {
  design_name: 'Spring Sheath',
  silhouette: 'A-Line',
  fabric: 'Silk Charmeuse',
  color_palette: 'Blush + Ivory + Camel',
  season: 'Spring',
  sizing: 'XS-XL',
  notes: 'French seams; bias-cut hem; sustainable lining.',
};

export default function DesignTechPackGenerator({ token }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const generate = async () => {
    setBusy(true);
    setStatus('');
    try {
      const res = await fetch(`${API}/api/custom-views/design-tech-pack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.text();
        setStatus(`Error: ${err}`);
        setBusy(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tech-pack-${form.design_name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setStatus('Tech-pack PDF downloaded.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      background: '#16213e', padding: 24, borderRadius: 12,
      border: '1px solid #2a3a5c', color: '#e6e6e6'
    }}>
      <h3 style={{ marginTop: 0, color: '#e94560' }}>Design Tech-Pack PDF</h3>
      <p style={{ color: '#8892b0', fontSize: 13, marginTop: -8 }}>
        Generate a printable spec sheet for production handoff
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          ['design_name', 'Design Name'],
          ['silhouette', 'Silhouette'],
          ['fabric', 'Primary Fabric'],
          ['color_palette', 'Color Palette'],
          ['season', 'Season'],
          ['sizing', 'Sizing Range'],
        ].map(([k, label]) => (
          <div key={k}>
            <label style={{ display: 'block', fontSize: 12, color: '#8892b0', marginBottom: 4 }}>{label}</label>
            <input
              data-testid={`tp-${k}`}
              type="text"
              value={form[k]}
              onChange={e => update(k, e.target.value)}
              style={{
                width: '100%', padding: 8, borderRadius: 6,
                background: '#0f1424', border: '1px solid #2a3a5c', color: '#e6e6e6'
              }}
            />
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#8892b0', marginBottom: 4 }}>Construction Notes</label>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            rows={4}
            style={{
              width: '100%', padding: 8, borderRadius: 6,
              background: '#0f1424', border: '1px solid #2a3a5c', color: '#e6e6e6'
            }}
          />
        </div>
      </div>
      <button
        data-testid="tp-generate"
        onClick={generate}
        disabled={busy}
        style={{
          marginTop: 16, padding: '10px 18px', borderRadius: 6,
          background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {busy ? 'Generating...' : 'Generate PDF'}
      </button>
      {status && <div style={{ marginTop: 12, fontSize: 13, color: '#8892b0' }}>{status}</div>}
    </div>
  );
}
