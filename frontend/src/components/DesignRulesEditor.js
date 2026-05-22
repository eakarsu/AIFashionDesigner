import React, { useEffect, useState, useCallback } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const empty = {
  rule_type: 'silhouette',
  silhouette: '',
  fabric: '',
  guideline: '',
  severity: 'recommended',
};

export default function DesignRulesEditor({ token }) {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/custom-views/design-rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setRules(d.data || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.guideline) { setStatus('Guideline is required.'); return; }
    const url = editingId
      ? `${API}/api/custom-views/design-rules/${editingId}`
      : `${API}/api/custom-views/design-rules`;
    const method = editingId ? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
    if (r.ok) {
      setStatus(editingId ? 'Rule updated.' : 'Rule created.');
      setForm(empty);
      setEditingId(null);
      load();
    } else {
      setStatus('Save failed.');
    }
  };

  const edit = (rule) => {
    setEditingId(rule.id);
    setForm({
      rule_type: rule.rule_type || 'silhouette',
      silhouette: rule.silhouette || '',
      fabric: rule.fabric || '',
      guideline: rule.guideline || '',
      severity: rule.severity || 'recommended',
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    await fetch(`${API}/api/custom-views/design-rules/${id}`, {
      method: 'DELETE', headers,
    });
    setStatus('Rule deleted.');
    load();
  };

  const ctl = { width: '100%', padding: 8, background: '#0f1424', color: '#e6e6e6', border: '1px solid #2a3a5c', borderRadius: 6 };

  return (
    <div style={{ background: '#16213e', padding: 24, borderRadius: 12, border: '1px solid #2a3a5c', color: '#e6e6e6' }}>
      <h3 style={{ marginTop: 0, color: '#e94560' }}>Design Rules Editor</h3>
      <p style={{ color: '#8892b0', fontSize: 13, marginTop: -8 }}>CRUD silhouettes &amp; fabric construction rules</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8892b0' }}>Type</label>
          <select data-testid="rule-type" value={form.rule_type} onChange={e => setForm(f => ({ ...f, rule_type: e.target.value }))} style={ctl}>
            <option value="silhouette">Silhouette</option>
            <option value="fabric">Fabric</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8892b0' }}>Silhouette</label>
          <input data-testid="rule-silhouette" value={form.silhouette} onChange={e => setForm(f => ({ ...f, silhouette: e.target.value }))} style={ctl} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8892b0' }}>Fabric</label>
          <input data-testid="rule-fabric" value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} style={ctl} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#8892b0' }}>Guideline</label>
          <textarea data-testid="rule-guideline" value={form.guideline} onChange={e => setForm(f => ({ ...f, guideline: e.target.value }))} rows={2} style={ctl} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#8892b0' }}>Severity</label>
          <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} style={ctl}>
            <option value="recommended">recommended</option>
            <option value="required">required</option>
            <option value="optional">optional</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button data-testid="rule-save" onClick={submit} style={{ padding: '8px 16px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
          {editingId ? 'Update Rule' : 'Add Rule'}
        </button>
        {editingId && (
          <button onClick={() => { setEditingId(null); setForm(empty); }} style={{ padding: '8px 16px', background: '#2a3a5c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
      {status && <div style={{ marginTop: 10, fontSize: 12, color: '#8892b0' }}>{status}</div>}
      <h4 style={{ marginTop: 24, marginBottom: 8 }}>Existing Rules ({rules.length})</h4>
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#8892b0', borderBottom: '1px solid #2a3a5c' }}>
              <th style={{ padding: 6 }}>Type</th>
              <th style={{ padding: 6 }}>Silhouette</th>
              <th style={{ padding: 6 }}>Fabric</th>
              <th style={{ padding: 6 }}>Guideline</th>
              <th style={{ padding: 6 }}>Severity</th>
              <th style={{ padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1c2a48' }}>
                <td style={{ padding: 6 }}>{r.rule_type}</td>
                <td style={{ padding: 6 }}>{r.silhouette || '-'}</td>
                <td style={{ padding: 6 }}>{r.fabric || '-'}</td>
                <td style={{ padding: 6 }}>{r.guideline}</td>
                <td style={{ padding: 6 }}>{r.severity}</td>
                <td style={{ padding: 6 }}>
                  <button onClick={() => edit(r)} style={{ marginRight: 6, padding: '4px 10px', background: '#2a3a5c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => remove(r.id)} style={{ padding: '4px 10px', background: '#b81c3f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
