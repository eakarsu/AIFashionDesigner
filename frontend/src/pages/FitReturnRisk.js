import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function FitReturnRisk({ token, onLogout }) {
  const [form, setForm] = useState({
    sizeVarianceCm: 4,
    stretchPercent: 6,
    reviewFitComplaints: 3,
    returnWindowDays: 10,
    tryOnConfidence: 2,
  });
  const [result, setResult] = useState(null);

  const submit = async () => {
    const response = await fetch(`${API}/api/fit-return-risk/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1>Fit Return Risk</h1>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
      <div className="feature-grid">
        <div className="feature-card" style={{ cursor: 'default' }}>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} style={{ display: 'block', marginBottom: 12 }}>
              {key.replace(/([A-Z])/g, ' $1')}
              <input type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
            </label>
          ))}
          <button onClick={submit}>Score fit risk</button>
        </div>
        {result && (
          <div className="feature-card" style={{ cursor: 'default' }}>
            <h2>{result.level.toUpperCase()} · {result.score}/100</h2>
            <ul>{result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
