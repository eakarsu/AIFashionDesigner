import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { features } from './Dashboard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Field definitions for each feature
const featureFields = {
  outfits: {
    columns: ['name', 'occasion', 'style', 'season'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'occasion', label: 'Occasion', type: 'text' },
      { key: 'style', label: 'Style', type: 'text' },
      { key: 'season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'] },
      { key: 'items', label: 'Items', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'occasion', label: 'Occasion', type: 'text', placeholder: 'e.g., Business meeting, date night' },
      { key: 'style', label: 'Style', type: 'text', placeholder: 'e.g., Casual, formal, bohemian' },
      { key: 'season', label: 'Season', type: 'text', placeholder: 'e.g., Summer, Winter' },
      { key: 'preferences', label: 'Preferences', type: 'textarea', placeholder: 'Any specific preferences...' },
    ],
  },
  styles: {
    columns: ['name', 'category', 'color_scheme'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'key_pieces', label: 'Key Pieces', type: 'textarea' },
      { key: 'color_scheme', label: 'Color Scheme', type: 'text' },
    ],
    aiFields: [
      { key: 'description', label: 'Describe Your Style', type: 'textarea', placeholder: 'Describe what you typically wear...' },
      { key: 'items', label: 'Favorite Items', type: 'textarea', placeholder: 'List some of your favorite clothing items...' },
    ],
  },
  colors: {
    columns: ['name', 'primary_color', 'secondary_color', 'accent_color', 'season'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'primary_color', label: 'Primary Color', type: 'text' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'text' },
      { key: 'accent_color', label: 'Accent Color', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'season', label: 'Season', type: 'text' },
      { key: 'skin_tone', label: 'Skin Tone', type: 'text' },
    ],
    aiFields: [
      { key: 'skinTone', label: 'Skin Tone', type: 'text', placeholder: 'e.g., Fair, medium, olive, dark' },
      { key: 'hairColor', label: 'Hair Color', type: 'text', placeholder: 'e.g., Blonde, brunette, black, red' },
      { key: 'eyeColor', label: 'Eye Color', type: 'text', placeholder: 'e.g., Blue, brown, green, hazel' },
      { key: 'preferences', label: 'Color Preferences', type: 'textarea', placeholder: 'Any colors you love or want to avoid...' },
    ],
  },
  trends: {
    columns: ['name', 'category', 'season', 'year', 'popularity'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'season', label: 'Season', type: 'text' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'popularity', label: 'Popularity (1-100)', type: 'number' },
      { key: 'key_pieces', label: 'Key Pieces', type: 'textarea' },
    ],
    aiFields: [
      { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Womenswear, Menswear, Accessories' },
      { key: 'season', label: 'Season', type: 'text', placeholder: 'e.g., Spring/Summer 2025' },
      { key: 'year', label: 'Year', type: 'text', placeholder: 'e.g., 2025' },
    ],
  },
  wardrobe: {
    columns: ['name', 'category', 'color', 'brand', 'season'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'] },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'size', label: 'Size', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'] },
    ],
  },
  ratings: {
    columns: ['outfit_name', 'occasion', 'overall_score', 'color_score', 'style_score'],
    fields: [
      { key: 'outfit_name', label: 'Outfit Name', type: 'text', required: true },
      { key: 'occasion', label: 'Occasion', type: 'text' },
      { key: 'overall_score', label: 'Overall Score', type: 'number' },
      { key: 'color_score', label: 'Color Score', type: 'number' },
      { key: 'style_score', label: 'Style Score', type: 'number' },
      { key: 'feedback', label: 'Feedback', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'outfitDescription', label: 'Describe Your Outfit', type: 'textarea', placeholder: 'Describe what you are wearing in detail...' },
      { key: 'occasion', label: 'Occasion', type: 'text', placeholder: 'e.g., Work, date night, casual outing' },
    ],
  },
  moodboards: {
    columns: ['name', 'theme', 'aesthetic', 'colors'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'theme', label: 'Theme', type: 'text' },
      { key: 'aesthetic', label: 'Aesthetic', type: 'text' },
      { key: 'colors', label: 'Colors', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'elements', label: 'Elements', type: 'textarea' },
    ],
    aiFields: [
      { key: 'theme', label: 'Theme', type: 'text', placeholder: 'e.g., Romantic, Urban, Minimalist' },
      { key: 'aesthetic', label: 'Aesthetic', type: 'text', placeholder: 'e.g., Soft, Bold, Vintage' },
      { key: 'colors', label: 'Color Preferences', type: 'text', placeholder: 'e.g., Pastels, Earth tones, Monochrome' },
    ],
  },
  stylist: {
    columns: ['question', 'category', 'tags'],
    fields: [
      { key: 'question', label: 'Question', type: 'textarea', required: true },
      { key: 'response', label: 'Response', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'text' },
    ],
    aiFields: [
      { key: 'message', label: 'Ask Your Stylist', type: 'textarea', placeholder: 'Ask any fashion question...' },
      { key: 'context', label: 'Context (Optional)', type: 'textarea', placeholder: 'Any additional context about your style, body type, budget, etc.' },
    ],
  },
  fabrics: {
    columns: ['name', 'type', 'weight', 'sustainability_rating'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'weight', label: 'Weight', type: 'text' },
      { key: 'texture', label: 'Texture', type: 'text' },
      { key: 'care_instructions', label: 'Care Instructions', type: 'textarea' },
      { key: 'sustainability_rating', label: 'Sustainability (1-10)', type: 'number' },
      { key: 'best_for', label: 'Best For', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'garmentType', label: 'Garment Type', type: 'text', placeholder: 'e.g., Summer dress, winter coat, workout gear' },
      { key: 'climate', label: 'Climate', type: 'text', placeholder: 'e.g., Hot and humid, cold and dry' },
      { key: 'budget', label: 'Budget', type: 'text', placeholder: 'e.g., Budget-friendly, mid-range, luxury' },
      { key: 'preferences', label: 'Preferences', type: 'textarea', placeholder: 'e.g., Sustainable, easy care, soft texture' },
    ],
  },
  seasonal: {
    columns: ['name', 'season', 'year', 'style'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'season', label: 'Season', type: 'select', options: ['Spring', 'Summer', 'Fall', 'Winter'] },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'style', label: 'Style', type: 'text' },
      { key: 'key_pieces', label: 'Key Pieces', type: 'textarea' },
      { key: 'color_palette', label: 'Color Palette', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'season', label: 'Season', type: 'text', placeholder: 'e.g., Spring, Summer, Fall, Winter' },
      { key: 'style', label: 'Style Preference', type: 'text', placeholder: 'e.g., Minimalist, Bohemian, Classic' },
      { key: 'budget', label: 'Budget', type: 'text', placeholder: 'e.g., $500, $1000, $2000' },
    ],
  },
  bodytype: {
    columns: ['body_type', 'celebrity_examples'],
    fields: [
      { key: 'body_type', label: 'Body Type', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'recommended_styles', label: 'Recommended Styles', type: 'textarea' },
      { key: 'avoid_styles', label: 'Styles to Avoid', type: 'textarea' },
      { key: 'key_tips', label: 'Key Tips', type: 'textarea' },
      { key: 'celebrity_examples', label: 'Celebrity Examples', type: 'text' },
    ],
    aiFields: [
      { key: 'bodyType', label: 'Body Type', type: 'text', placeholder: 'e.g., Hourglass, pear, apple, rectangle' },
      { key: 'preferences', label: 'Style Preferences', type: 'textarea', placeholder: 'What styles do you enjoy?' },
      { key: 'concerns', label: 'Concerns', type: 'textarea', placeholder: 'Any areas you want to highlight or downplay?' },
    ],
  },
  accessories: {
    columns: ['name', 'category', 'style', 'brand', 'color'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Jewelry', 'Bags', 'Scarves', 'Belts', 'Eyewear', 'Hats', 'Watches', 'Hair Accessories', 'Gloves'] },
      { key: 'style', label: 'Style', type: 'text' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'outfitDescription', label: 'Describe Your Outfit', type: 'textarea', placeholder: 'What are you wearing that needs accessories?' },
      { key: 'occasion', label: 'Occasion', type: 'text', placeholder: 'e.g., Wedding, office, casual brunch' },
      { key: 'style', label: 'Style', type: 'text', placeholder: 'e.g., Classic, bohemian, edgy' },
    ],
  },
  history: {
    columns: ['era', 'title', 'key_designers'],
    fields: [
      { key: 'era', label: 'Era', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'key_designers', label: 'Key Designers', type: 'text' },
      { key: 'iconic_looks', label: 'Iconic Looks', type: 'textarea' },
      { key: 'cultural_impact', label: 'Cultural Impact', type: 'textarea' },
    ],
    aiFields: [
      { key: 'era', label: 'Era', type: 'text', placeholder: 'e.g., 1920s, Renaissance, Victorian' },
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g., Evening wear, streetwear, accessories' },
    ],
  },
  sustainable: {
    columns: ['name', 'brand', 'category', 'eco_rating', 'price_range'],
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'eco_rating', label: 'Eco Rating (1-10)', type: 'number' },
      { key: 'materials', label: 'Materials', type: 'textarea' },
      { key: 'certifications', label: 'Certifications', type: 'text' },
      { key: 'price_range', label: 'Price Range', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'currentWardrobe', label: 'Current Wardrobe', type: 'textarea', placeholder: 'Describe your current wardrobe and shopping habits' },
      { key: 'goals', label: 'Sustainability Goals', type: 'textarea', placeholder: 'What sustainability goals do you have?' },
      { key: 'budget', label: 'Budget', type: 'text', placeholder: 'e.g., Budget-friendly, mid-range, investment' },
    ],
  },
  celebrity: {
    columns: ['celebrity_name', 'style_category', 'brands'],
    fields: [
      { key: 'celebrity_name', label: 'Celebrity Name', type: 'text', required: true },
      { key: 'style_category', label: 'Style Category', type: 'text' },
      { key: 'signature_looks', label: 'Signature Looks', type: 'textarea' },
      { key: 'key_pieces', label: 'Key Pieces', type: 'textarea' },
      { key: 'brands', label: 'Brands', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    aiFields: [
      { key: 'celebrity', label: 'Celebrity', type: 'text', placeholder: 'e.g., Zendaya, Harry Styles, Rihanna' },
      { key: 'budget', label: 'Budget', type: 'text', placeholder: 'e.g., Under $100, $100-$500, any budget' },
      { key: 'occasion', label: 'Occasion', type: 'text', placeholder: 'e.g., Everyday, red carpet, casual' },
    ],
  },
};

function renderCellValue(key, value) {
  if (value === null || value === undefined) return '-';

  if (['primary_color', 'secondary_color', 'accent_color'].includes(key) && value?.startsWith('#')) {
    return <><span className="color-swatch" style={{ background: value }}></span>{value}</>;
  }
  if (['overall_score', 'color_score', 'style_score'].includes(key)) {
    const num = parseFloat(value);
    const cls = num >= 8 ? 'score-high' : num >= 6 ? 'score-medium' : 'score-low';
    return <span className={`score-badge ${cls}`}>{num.toFixed(1)}</span>;
  }
  if (key === 'eco_rating') {
    const num = parseInt(value);
    return (
      <div className="eco-dots">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`eco-dot ${i < num ? 'filled' : ''}`}></span>
        ))}
      </div>
    );
  }
  if (key === 'popularity') {
    return <><div className="popularity-bar"><div className="popularity-fill" style={{ width: `${value}%` }}></div></div>{value}%</>;
  }
  const str = String(value);
  return str.length > 50 ? str.substring(0, 50) + '...' : str;
}

function formatAIResponse(text) {
  if (!text) return '';
  // Convert markdown-style formatting to HTML-like display
  let formatted = text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
  return formatted;
}

export default function FeaturePage({ token, user, onLogout }) {
  const { featureId } = useParams();
  const navigate = useNavigate();
  const feature = features.find(f => f.id === featureId);
  const config = featureFields[featureId];

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiInputs, setAiInputs] = useState({});
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}${feature.endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [feature?.endpoint, token]);

  useEffect(() => {
    if (feature) fetchItems();
  }, [feature, fetchItems]);

  if (!feature || !config) return <div>Feature not found</div>;

  const openDetail = (item) => { setSelectedItem(item); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedItem(null); };

  const openNewForm = () => {
    setFormData({});
    setEditItem(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setFormData({ ...item });
    setEditItem(item);
    setShowForm(true);
    setShowModal(false);
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const url = editItem ? `${API}${feature.endpoint}/${editItem.id}` : `${API}${feature.endpoint}`;
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (res.ok) {
        setShowForm(false);
        setEditItem(null);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`${API}${feature.endpoint}/${id}`, { method: 'DELETE', headers });
      closeModal();
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAI = async () => {
    if (!feature.aiEndpoint) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch(`${API}${feature.aiEndpoint}`, {
        method: 'POST', headers, body: JSON.stringify(aiInputs)
      });
      const data = await res.json();
      if (data.result) setAiResult(data.result);
      else if (data.error) setAiResult('Error: ' + data.error);
    } catch (err) {
      setAiResult('Error: Could not connect to AI service');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="top-bar">
        <h1>AI Fashion Designer</h1>
        <div className="top-bar-right">
          <span className="user-info">{user?.name}</span>
          <button className="logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="feature-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          &larr; Back to Dashboard
        </button>
        <h2>{feature.icon} {feature.title}</h2>
        <p>{feature.desc}</p>
        <div className="feature-actions">
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openNewForm}>
            + New Item
          </button>
        </div>
      </div>

      <div className="feature-content">
        {/* AI Section */}
        {feature.aiEndpoint && config.aiFields && (
          <div className="ai-section">
            <h3>AI Assistant</h3>
            <div className="ai-form">
              {config.aiFields.map(field => (
                <div key={field.key} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={aiInputs[field.key] || ''}
                      onChange={e => setAiInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type="text"
                      value={aiInputs[field.key] || ''}
                      onChange={e => setAiInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
              <div className="full-width">
                <button className="btn btn-gold" onClick={handleAI} disabled={aiLoading} style={{ width: 'auto' }}>
                  {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            {aiLoading && (
              <div className="ai-output" style={{ marginTop: 24 }}>
                <div className="ai-loading">
                  <div className="spinner"></div>
                  AI is crafting your personalized fashion advice...
                </div>
              </div>
            )}

            {aiResult && !aiLoading && (
              <div className="ai-output">
                <div
                  className="ai-output-content"
                  dangerouslySetInnerHTML={{ __html: formatAIResponse(aiResult) }}
                />
              </div>
            )}
          </div>
        )}

        {/* Data Table */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>
            All Items ({items.length})
          </h3>
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-loading"><div className="spinner"></div> Loading...</div></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{feature.icon}</div>
            <p>No items yet. Click "New Item" to add your first one!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {config.columns.map(col => (
                  <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} onClick={() => openDetail(item)}>
                  <td>{idx + 1}</td>
                  {config.columns.map(col => (
                    <td key={col}>{renderCellValue(col, item[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h3>{selectedItem.name || selectedItem.body_type || selectedItem.celebrity_name || selectedItem.outfit_name || selectedItem.question?.substring(0, 40) || selectedItem.title || 'Item Details'}</h3>
            <div className="detail-grid">
              {config.fields.map(field => {
                const val = selectedItem[field.key];
                if (val === null || val === undefined || val === '') return null;
                const isLong = String(val).length > 80;
                return (
                  <div key={field.key} className={`detail-item ${isLong || field.type === 'textarea' ? 'full-width' : ''}`}>
                    <div className="detail-label">{field.label}</div>
                    <div className="detail-value">
                      {['primary_color', 'secondary_color', 'accent_color'].includes(field.key) && String(val).startsWith('#') ? (
                        <><span className="color-swatch" style={{ background: val }}></span>{val}</>
                      ) : field.key === 'eco_rating' || field.key === 'sustainability_rating' ? (
                        <div className="eco-dots">
                          {Array.from({ length: 10 }, (_, i) => (
                            <span key={i} className={`eco-dot ${i < parseInt(val) ? 'filled' : ''}`}></span>
                          ))}
                          <span style={{ marginLeft: 8 }}>{val}/10</span>
                        </div>
                      ) : ['overall_score', 'color_score', 'style_score'].includes(field.key) ? (
                        <span className={`score-badge ${parseFloat(val) >= 8 ? 'score-high' : parseFloat(val) >= 6 ? 'score-medium' : 'score-low'}`}>
                          {parseFloat(val).toFixed(1)}
                        </span>
                      ) : field.key === 'popularity' ? (
                        <><div className="popularity-bar"><div className="popularity-fill" style={{ width: `${val}%` }}></div></div> {val}%</>
                      ) : String(val)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-small" onClick={() => openEditForm(selectedItem)}>Edit</button>
              <button className="btn btn-danger btn-small" onClick={() => handleDelete(selectedItem.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            <h3>{editItem ? 'Edit Item' : 'New Item'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {config.fields.map(field => (
                <div key={field.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label>{field.label}{field.required ? ' *' : ''}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={e => handleFormChange(field.key, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={e => handleFormChange(field.key, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData[field.key] || ''}
                      onChange={e => handleFormChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleSave}>
                {editItem ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-secondary btn-small" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
