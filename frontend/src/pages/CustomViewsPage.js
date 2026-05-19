import React from 'react';
import { useNavigate } from 'react-router-dom';
import CollectionTrendChart from '../components/CollectionTrendChart';
import ColorPaletteHeatmap from '../components/ColorPaletteHeatmap';
import DesignTechPackGenerator from '../components/DesignTechPackGenerator';
import DesignRulesEditor from '../components/DesignRulesEditor';

export default function CustomViewsPage({ token, user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="feature-page" style={{ minHeight: '100vh', background: '#0f1424', color: '#e6e6e6' }}>
      <div className="top-bar">
        <h1>AI Fashion Designer — Design Views</h1>
        <div className="top-bar-right">
          <span className="user-info">{user?.name}</span>
          <button className="logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <button
          className="back-btn"
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent', color: '#e94560', border: '1px solid #e94560',
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginBottom: 16,
          }}
        >
          &larr; Back to Dashboard
        </button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#e94560', marginBottom: 4 }}>
          Custom Design Views
        </h2>
        <p style={{ color: '#8892b0', marginTop: 0, marginBottom: 24 }}>
          Specialty dashboards: trend analytics, color heatmaps, tech-pack export, and rule library.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          <CollectionTrendChart token={token} />
          <ColorPaletteHeatmap token={token} />
          <DesignTechPackGenerator token={token} />
          <DesignRulesEditor token={token} />
        </div>
      </div>
    </div>
  );
}
