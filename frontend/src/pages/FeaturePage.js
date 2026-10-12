
import FullAIExamples, { useFullAIExamples } from "../components/FullAIExamples.jsx";
import NativeAIReport, { reportText } from "../components/NativeAIReport";
import useNativeAIRequest from "../components/useNativeAIRequest";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { features } from './Dashboard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Illustrative prompt inputs only. These never stand in for selected records or uploads.
const aiExampleValues = {
  occasion: ['Business meeting', 'Outdoor wedding', 'Weekend brunch'],
  style: ['Tailored and understated', 'Romantic and relaxed', 'Minimalist with bold accessories'],
  season: ['Spring', 'Summer', 'Fall'],
  preferences: ['Comfortable natural fabrics and low heels', 'Rewearable pieces and warm colors', 'Easy care layers with one statement piece'],
  description: ['Linen separates and simple leather shoes', 'A floral midi dress with a light jacket', 'Dark denim, a crisp shirt, and a structured coat'],
  items: ['White shirt, navy trousers, tan loafers', 'Floral dress, cream cardigan, flat sandals', 'Dark jeans, black boots, wool coat'],
  skinTone: ['Medium olive complexion', 'Fair complexion with neutral undertones', 'Deep complexion with warm undertones'],
  skin_tone: ['Medium olive complexion', 'Fair neutral complexion', 'Deep warm complexion'],
  hairColor: ['Dark brown', 'Auburn', 'Black'],
  hair_color: ['Dark brown', 'Auburn', 'Black'],
  eyeColor: ['Hazel', 'Green', 'Brown'],
  eye_color: ['Hazel', 'Green', 'Brown'],
  undertone: ['Warm', 'Neutral', 'Cool'],
  contrast_level: ['Medium', 'Low', 'High'],
  category: ['Womenswear', 'Accessories', 'Menswear'],
  year: ['2026', '2027', '2028'],
  outfitDescription: ['Navy suit, ivory blouse, and tan loafers', 'Sage midi dress with cream sandals', 'Black jeans, white shirt, and leather jacket'],
  theme: ['Coastal spring', 'Modern garden', 'City evening'],
  aesthetic: ['Airy and polished', 'Soft and romantic', 'Sleek and graphic'],
  colors: ['Ivory, sea blue, sand', 'Sage, blush, cream', 'Charcoal, cobalt, white'],
  message: ['How can I style a navy suit for a daytime meeting?', 'Suggest a rewearable outfit for an outdoor wedding.', 'Build a compact travel wardrobe for a city weekend.'],
  context: ['Business casual office; prefer comfortable shoes; budget $200', 'Warm afternoon event; avoid dry clean only fabrics; budget $300', 'Three day trip with one dinner; carry on luggage; budget $250'],
  garmentType: ['Summer dress', 'Lightweight work trousers', 'Winter coat'],
  climate: ['Warm and humid', 'Temperate with occasional rain', 'Cold and dry'],
  budget: ['Under $200', '$200 to $500', 'Investment piece up to $800'],
  bodyType: ['Pear', 'Rectangle', 'Hourglass'],
  concerns: ['Prefer movement around the hips and a defined shoulder', 'Would like more waist definition without tight clothing', 'Prefer balanced proportions and easy layering'],
  era: ['1920s', '1970s', '1990s'],
  topic: ['Evening wear', 'Everyday streetwear', 'Accessories'],
  currentWardrobe: ['Mostly denim and cotton basics; buy a few new items each season', 'Office staples and occasion wear; repair rarely', 'Small capsule wardrobe; often buy secondhand'],
  goals: ['Buy fewer, more durable items and repair basics', 'Reduce impulse purchases and rent occasion wear', 'Build a versatile secondhand capsule'],
  celebrity: ['Zendaya', 'Harry Styles', 'Rihanna'],
  lifestyle: ['Hybrid office worker who walks to transit', 'Frequent weekend traveler', 'Remote worker attending monthly client meetings']
};

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
  'wardrobe-audit': {
    columns: ['name', 'category', 'color', 'brand', 'season'],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'season', label: 'Season', type: 'text' },
    ],
    aiFields: [
      { key: 'lifestyle', label: 'Lifestyle', type: 'textarea', placeholder: 'e.g., remote worker, frequent traveller, parent of toddlers' },
      { key: 'goals', label: 'Goals', type: 'textarea', placeholder: 'e.g., capsule wardrobe, more sustainable, declutter' },
    ],
  },
  'personal-color': {
    columns: ['name', 'primary_color', 'secondary_color', 'accent_color', 'season'],
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'primary_color', label: 'Primary Color', type: 'text' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'text' },
      { key: 'accent_color', label: 'Accent Color', type: 'text' },
      { key: 'season', label: 'Season', type: 'text' },
    ],
    aiFields: [
      { key: 'skin_tone', label: 'Skin Tone', type: 'text', placeholder: 'e.g., fair, medium, olive, deep' },
      { key: 'hair_color', label: 'Hair Color', type: 'text', placeholder: 'e.g., blonde, brunette, black, red' },
      { key: 'eye_color', label: 'Eye Color', type: 'text', placeholder: 'e.g., blue, brown, green, hazel' },
      { key: 'undertone', label: 'Undertone', type: 'text', placeholder: 'warm, cool, or neutral' },
      { key: 'contrast_level', label: 'Contrast Level', type: 'text', placeholder: 'low, medium, or high' },
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
  let parsed = value;
  if (typeof value === 'string' && /^[\s]*[\[{]/.test(value)) {
    try { parsed = JSON.parse(value); } catch (_) { /* Keep the original text. */ }
  }
  const str = reportText(parsed);
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
  const fullAIExamples = useFullAIExamples();

  const nativeAIRequest = useNativeAIRequest();

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
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const limit = 20;

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}${feature.endpoint}?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
        setPagination({ page: 1, limit: data.length, total: data.length, totalPages: 1 });
      } else if (data && Array.isArray(data.data)) {
        setItems(data.data);
        setPagination(data.pagination || { page, limit, total: data.data.length, totalPages: 1 });
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [feature?.endpoint, token, page]);

  useEffect(() => {
    if (feature) fetchItems();
  }, [feature, fetchItems]);

  useEffect(() => {
    nativeAIRequest.cancel();
    setAiLoading(false);
    setAiResult(null);
    setAiInputs({});
  }, [nativeAIRequest.cancel, featureId]);

  if (!feature || !config) return <div data-full-ai-workspace="FeaturePage"><FullAIExamples controller={fullAIExamples} disabled={Boolean(aiLoading || loading)} />Feature not found</div>;

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
    setAiResult(null);
    try {
      const res = await nativeAIRequest.run((signal) => fetch(`${API}${feature.aiEndpoint}`, { ...({
        method: 'POST', headers, body: JSON.stringify(aiInputs)
      }), ...({ signal }) }).then(async (response) => { await response.clone().arrayBuffer(); return response; }));
      const data = await res.json();
      if (res.status === 503) {
        setAiResult('AI service unavailable: ' + (data.error || 'API key not configured'));
      } else if (data.result !== undefined) {
        setAiResult(data.result);
      } else if (data.error) {
        setAiResult('Error: ' + data.error);
      } else if (data.raw !== undefined) {
        setAiResult(data.raw);
      } else {
        setAiResult(data);
      }
    } catch (err) {
      setAiResult('Error: Could not connect to AI service');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="feature-page" data-full-ai-workspace="FeaturePage"><FullAIExamples controller={fullAIExamples} disabled={Boolean(aiLoading || loading)} />
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
                    <textarea data-ai-field={field.key}
                      value={aiInputs[field.key] || ''}
                      onChange={e => setAiInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder} data-full-ai-field={fullAIExamples.bind({ current: aiInputs[field.key] || '', change: e => setAiInputs(prev => ({ ...prev, [field.key]: e.target.value })), label: field.label, sample: aiExampleValues[field.key], manual: false, json: false }, "p1-23022", field.key)}
                    />
                  ) : (
                    <input data-ai-field={field.key}
                      type="text"
                      value={aiInputs[field.key] || ''}
                      onChange={e => setAiInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder} data-full-ai-field={fullAIExamples.bind({ current: aiInputs[field.key] || '', change: e => setAiInputs(prev => ({ ...prev, [field.key]: e.target.value })), label: field.label, sample: aiExampleValues[field.key], manual: false, json: false }, "p1-23337", field.key)}
                    />
                  )}
                </div>
              ))}
              <div className="full-width">
                <button className="btn btn-gold" onClick={handleAI} disabled={aiLoading} style={{ width: 'auto' }}>
                  {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>
                {nativeAIRequest.busy && <button type="button" className="btn btn-secondary" onClick={nativeAIRequest.cancel}>Cancel request</button>}
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

            {aiResult !== null && !aiLoading && (
              <div className="ai-output">
                <NativeAIReport response={aiResult} />
              </div>
            )}
          </div>
        )}

        {/* Data Table */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>
            All Items ({pagination.total})
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
                  <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                  {config.columns.map(col => (
                    <td key={col}>{renderCellValue(col, item[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 16 }}>
            <button
              className="btn btn-secondary btn-small"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ width: 'auto' }}
            >
              Prev
            </button>
            <span style={{ fontSize: 13 }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <button
              className="btn btn-secondary btn-small"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              style={{ width: 'auto' }}
            >
              Next
            </button>
          </div>
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
                if (val === null || val === undefined) return null;
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
                      ) : typeof val === 'object' || (typeof val === 'string' && /^[\s]*[\[{]/.test(val)) ? (
                        <NativeAIReport response={val} title={field.label} />
                      ) : reportText(val)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-small" onClick={() => openEditForm(selectedItem)}>Edit</button>
              <button className="btn btn-danger btn-small" onClick={() => handleDelete(selectedItem.id)}>Delete</button>
              <button className="btn btn-secondary btn-small" onClick={closeModal}>Cancel</button>
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
