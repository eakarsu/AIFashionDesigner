import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const features = [
  { id: 'outfits', icon: '👗', title: 'AI Outfit Generator', desc: 'Generate complete outfit suggestions powered by AI for any occasion', endpoint: '/api/outfits', aiEndpoint: '/api/ai/generate-outfit' },
  { id: 'styles', icon: '🎨', title: 'Style Analyzer', desc: 'Analyze and discover your personal fashion style with AI insights', endpoint: '/api/styles', aiEndpoint: '/api/ai/analyze-style' },
  { id: 'colors', icon: '🌈', title: 'Color Palette Creator', desc: 'AI-generated color palettes tailored to your features and preferences', endpoint: '/api/colors', aiEndpoint: '/api/ai/color-palette' },
  { id: 'trends', icon: '📈', title: 'Trend Forecaster', desc: 'Stay ahead with AI-powered fashion trend predictions and analysis', endpoint: '/api/trends', aiEndpoint: '/api/ai/trend-forecast' },
  { id: 'wardrobe', icon: '🏪', title: 'Wardrobe Manager', desc: 'Organize and optimize your wardrobe with smart categorization', endpoint: '/api/wardrobe' },
  { id: 'ratings', icon: '⭐', title: 'Outfit Rater', desc: 'Get AI-powered outfit ratings with detailed scoring and feedback', endpoint: '/api/ratings', aiEndpoint: '/api/ai/rate-outfit' },
  { id: 'moodboards', icon: '🎭', title: 'Mood Board Generator', desc: 'Create stunning fashion mood boards with AI-powered curation', endpoint: '/api/moodboards', aiEndpoint: '/api/ai/mood-board' },
  { id: 'stylist', icon: '💬', title: 'Personal Stylist Chat', desc: 'Chat with your AI personal stylist for instant fashion advice', endpoint: '/api/stylist', aiEndpoint: '/api/ai/stylist-chat' },
  { id: 'fabrics', icon: '🧵', title: 'Fabric Advisor', desc: 'Expert AI guidance on fabrics, materials, and care instructions', endpoint: '/api/fabrics', aiEndpoint: '/api/ai/fabric-advice' },
  { id: 'seasonal', icon: '🍂', title: 'Seasonal Collections', desc: 'Curated seasonal capsule collections designed by AI', endpoint: '/api/seasonal', aiEndpoint: '/api/ai/seasonal-collection' },
  { id: 'bodytype', icon: '👤', title: 'Body Type Stylist', desc: 'Personalized style recommendations for every body type', endpoint: '/api/bodytype', aiEndpoint: '/api/ai/bodytype-advice' },
  { id: 'accessories', icon: '💎', title: 'Accessory Matcher', desc: 'Find the perfect accessories to complete any outfit with AI', endpoint: '/api/accessories', aiEndpoint: '/api/ai/accessory-match' },
  { id: 'history', icon: '📚', title: 'Fashion History Explorer', desc: 'Explore fashion through the ages with AI-guided historical insights', endpoint: '/api/history', aiEndpoint: '/api/ai/fashion-history' },
  { id: 'sustainable', icon: '🌿', title: 'Sustainable Fashion', desc: 'Discover eco-friendly fashion choices with AI sustainability advice', endpoint: '/api/sustainable', aiEndpoint: '/api/ai/sustainable-advice' },
  { id: 'celebrity', icon: '🌟', title: 'Celebrity Style Match', desc: 'Recreate celebrity looks on any budget with AI styling guidance', endpoint: '/api/celebrity', aiEndpoint: '/api/ai/celebrity-style' },
  { id: 'wardrobe-audit', icon: '🧹', title: 'Wardrobe Audit', desc: 'AI audit of your wardrobe with keep/donate/repair and gap analysis', endpoint: '/api/wardrobe', aiEndpoint: '/api/ai/wardrobe-audit' },
  { id: 'personal-color', icon: '🎯', title: 'Personal Color Analysis', desc: 'AI seasonal color analysis from your skin, hair, and eye tones', endpoint: '/api/colors', aiEndpoint: '/api/ai/personal-color-analysis' },
  { id: 'fit-return-risk', icon: '📏', title: 'Fit Return Risk', desc: 'Estimate return risk from garment measurements, stretch, reviews, and try-on confidence', endpoint: '/api/fit-return-risk', route: '/fit-return-risk' },
];

export { features };

export default function Dashboard({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    features.forEach(f => {
      fetch(`${API}${f.endpoint}?page=1&limit=1`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          // Backend may return either a paginated envelope { data, pagination }
          // or a raw array. Handle both shapes.
          if (Array.isArray(data)) {
            setCounts(prev => ({ ...prev, [f.id]: data.length }));
          } else if (data && typeof data === 'object' && data.pagination) {
            setCounts(prev => ({ ...prev, [f.id]: data.pagination.total }));
          } else if (data && Array.isArray(data.data)) {
            setCounts(prev => ({ ...prev, [f.id]: data.data.length }));
          }
        })
        .catch(() => {});
    });
  }, [token]);

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1>AI Fashion Designer</h1>
        <div className="top-bar-right">
          <span className="user-info">Welcome, {user?.name || 'Designer'}</span>
          <button className="logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <aside
        data-testid="sidebar-design-views"
        style={{
          position: 'fixed', top: 80, left: 16, width: 180, padding: 16,
          background: '#16213e', border: '1px solid #2a3a5c', borderRadius: 12, zIndex: 10,
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', color: '#e94560', fontSize: 14 }}>Navigation</h4>
        <button
          onClick={() => navigate('/custom-views')}
          style={{
            width: '100%', padding: '10px 12px', background: '#e94560', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Design Views
        </button>
      </aside>

      <div className="dashboard-hero">
        <h2>Your AI-Powered Fashion Studio</h2>
        <p>18 intelligent fashion tools at your fingertips. Design, analyze, and elevate your style with artificial intelligence.</p>
      </div>

      <div className="feature-grid">
        {features.map(f => (
          <div key={f.id} className="feature-card" onClick={() => navigate(f.route || `/feature/${f.id}`)}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="card-footer">
              <span className="card-count">{counts[f.id] !== undefined ? `${counts[f.id]} items` : 'Loading...'}</span>
              <span className="card-arrow">&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
