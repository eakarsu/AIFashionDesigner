require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('Starting database seed...');

  // Create tables
  await pool.query(`
    DROP TABLE IF EXISTS users, outfits, styles, color_palettes, trends, wardrobe, ratings,
    moodboards, stylist_chats, fabrics, seasonal_collections, bodytype_guides, accessories,
    fashion_history, sustainable_fashion, celebrity_styles CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE outfits (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      occasion VARCHAR(255),
      style VARCHAR(255),
      season VARCHAR(100),
      items TEXT,
      description TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE styles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      description TEXT,
      key_pieces TEXT,
      color_scheme VARCHAR(255),
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE color_palettes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      primary_color VARCHAR(50),
      secondary_color VARCHAR(50),
      accent_color VARCHAR(50),
      description TEXT,
      season VARCHAR(100),
      skin_tone VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE trends (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      season VARCHAR(100),
      year INTEGER,
      description TEXT,
      popularity INTEGER,
      key_pieces TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE wardrobe (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      color VARCHAR(100),
      brand VARCHAR(255),
      size VARCHAR(50),
      material VARCHAR(255),
      season VARCHAR(100),
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE ratings (
      id SERIAL PRIMARY KEY,
      outfit_name VARCHAR(255) NOT NULL,
      occasion VARCHAR(255),
      overall_score DECIMAL(3,1),
      color_score DECIMAL(3,1),
      style_score DECIMAL(3,1),
      feedback TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE moodboards (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      theme VARCHAR(255),
      aesthetic VARCHAR(255),
      colors VARCHAR(500),
      description TEXT,
      elements TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE stylist_chats (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      response TEXT,
      category VARCHAR(255),
      tags VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE fabrics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255),
      weight VARCHAR(100),
      texture VARCHAR(255),
      care_instructions TEXT,
      sustainability_rating INTEGER,
      best_for TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE seasonal_collections (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      season VARCHAR(100),
      year INTEGER,
      style VARCHAR(255),
      key_pieces TEXT,
      color_palette VARCHAR(500),
      description TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE bodytype_guides (
      id SERIAL PRIMARY KEY,
      body_type VARCHAR(255) NOT NULL,
      description TEXT,
      recommended_styles TEXT,
      avoid_styles TEXT,
      key_tips TEXT,
      celebrity_examples VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE accessories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      style VARCHAR(255),
      material VARCHAR(255),
      color VARCHAR(100),
      brand VARCHAR(255),
      description TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE fashion_history (
      id SERIAL PRIMARY KEY,
      era VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      key_designers VARCHAR(500),
      iconic_looks TEXT,
      cultural_impact TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE sustainable_fashion (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255),
      category VARCHAR(255),
      eco_rating INTEGER,
      materials TEXT,
      certifications VARCHAR(500),
      price_range VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE celebrity_styles (
      id SERIAL PRIMARY KEY,
      celebrity_name VARCHAR(255) NOT NULL,
      style_category VARCHAR(255),
      signature_looks TEXT,
      key_pieces TEXT,
      brands VARCHAR(500),
      description TEXT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
    ['demo@fashionai.com', hashedPassword, 'Fashion Designer']
  );

  // Seed outfits (15 items)
  const outfits = [
    ['Classic Business Chic', 'Office', 'Professional', 'Fall', 'Navy blazer, white silk blouse, tailored trousers, pointed-toe pumps', 'A timeless business look combining authority with elegance'],
    ['Weekend Bohemian', 'Casual', 'Bohemian', 'Spring', 'Flowy maxi dress, denim jacket, ankle boots, layered necklaces', 'Effortless weekend style with bohemian flair'],
    ['Evening Glamour', 'Gala', 'Glamorous', 'Winter', 'Sequin midi dress, strappy heels, clutch bag, statement earrings', 'Show-stopping evening wear for formal events'],
    ['Street Style Cool', 'Casual', 'Streetwear', 'Summer', 'Oversized graphic tee, cargo pants, chunky sneakers, bucket hat', 'Urban street style with attitude'],
    ['Garden Party Elegance', 'Garden Party', 'Romantic', 'Spring', 'Floral midi skirt, cashmere cardigan, espadrilles, straw bag', 'Elegant garden party ensemble'],
    ['Minimalist Modern', 'Work', 'Minimalist', 'All Season', 'Black turtleneck, wide-leg pants, clean-line coat, simple studs', 'Clean lines and neutral tones for modern minimalism'],
    ['Vintage Revival', 'Date Night', 'Vintage', 'Fall', 'High-waisted jeans, tucked blouse, leather belt, retro sunglasses', 'Vintage-inspired date night look'],
    ['Athletic Luxe', 'Brunch', 'Athleisure', 'Spring', 'Matching set, white sneakers, designer crossbody, gold hoops', 'Elevated athletic wear for casual occasions'],
    ['Tropical Vacation', 'Beach', 'Resort', 'Summer', 'Linen shirt, printed shorts, slide sandals, panama hat', 'Relaxed resort wear for tropical getaways'],
    ['Power Meeting', 'Conference', 'Executive', 'Winter', 'Structured blazer, pencil skirt, silk scarf, leather briefcase', 'Commanding presence for important meetings'],
    ['Cozy Autumn', 'Weekend', 'Casual Chic', 'Fall', 'Oversized knit sweater, leather leggings, ankle boots, crossbody bag', 'Warm and stylish for autumn days'],
    ['Festival Ready', 'Music Festival', 'Eclectic', 'Summer', 'Crochet top, denim cutoffs, combat boots, body chain', 'Festival-ready eclectic style'],
    ['Cocktail Hour', 'Cocktail Party', 'Sophisticated', 'Winter', 'Little black dress, stiletto heels, pearl necklace, velvet clutch', 'Classic cocktail party sophistication'],
    ['Sporty Casual', 'Errands', 'Sporty', 'Spring', 'Zip-up hoodie, joggers, running shoes, baseball cap', 'Comfortable sporty look for daily errands'],
    ['Art Gallery Opening', 'Cultural Event', 'Avant-Garde', 'Fall', 'Asymmetric top, tailored culottes, architectural jewelry, ankle boots', 'Creative and artistic ensemble for cultural events']
  ];
  for (const o of outfits) {
    await pool.query('INSERT INTO outfits (name, occasion, style, season, items, description) VALUES ($1,$2,$3,$4,$5,$6)', o);
  }

  // Seed styles (15 items)
  const styles = [
    ['Minimalist', 'Modern', 'Clean lines, neutral palette, quality over quantity', 'White tee, tailored trousers, structured coat', 'Black, white, grey, beige'],
    ['Bohemian', 'Free-spirited', 'Flowing fabrics, earthy tones, layered accessories', 'Maxi dress, fringe bag, turquoise jewelry', 'Earth tones, turquoise, rust'],
    ['Classic Preppy', 'Traditional', 'Polished, collegiate-inspired, timeless pieces', 'Polo shirt, chinos, loafers, blazer', 'Navy, red, green, white'],
    ['Streetwear', 'Urban', 'Casual, bold graphics, sneaker culture', 'Oversized hoodie, joggers, high-top sneakers', 'Bold colors, black, white'],
    ['Romantic', 'Feminine', 'Soft fabrics, floral prints, delicate details', 'Lace blouse, flowing skirt, ballet flats', 'Pastels, blush, lavender'],
    ['Edgy Rock', 'Alternative', 'Leather, dark palette, bold accessories', 'Leather jacket, band tee, skinny jeans, boots', 'Black, dark red, silver'],
    ['Scandinavian', 'Nordic', 'Functional, clean, cozy hygge-inspired', 'Wool sweater, straight-leg jeans, white sneakers', 'Muted neutrals, soft blues'],
    ['Glamorous', 'Luxury', 'High-impact, statement pieces, red carpet worthy', 'Sequin dress, fur stole, stilettos', 'Gold, silver, jewel tones'],
    ['Athleisure', 'Sport-luxe', 'Athletic wear elevated for everyday style', 'Matching set, designer sneakers, minimal jewelry', 'Monochromatic, pastels'],
    ['Vintage', 'Retro', 'Period-inspired pieces from various decades', 'A-line dress, cat-eye glasses, kitten heels', 'Retro prints, muted colors'],
    ['Cottagecore', 'Rural', 'Romantic rural aesthetic, handmade feel', 'Prairie dress, straw hat, woven basket', 'Floral, cream, sage green'],
    ['Dark Academia', 'Intellectual', 'Scholarly, literary-inspired, autumnal', 'Tweed blazer, turtleneck, Oxford shoes', 'Brown, burgundy, forest green'],
    ['Coastal Grandmother', 'Relaxed', 'Effortless, Nancy Meyers-inspired elegance', 'Linen pants, cashmere sweater, espadrilles', 'White, beige, soft blue'],
    ['Y2K Revival', 'Retro-modern', 'Early 2000s nostalgia with modern updates', 'Low-rise jeans, baby tee, platform shoes', 'Pink, silver, baby blue'],
    ['Quiet Luxury', 'Understated', 'Subtle, high-quality, logo-free sophistication', 'Cashmere sweater, tailored pants, leather bag', 'Camel, cream, charcoal']
  ];
  for (const s of styles) {
    await pool.query('INSERT INTO styles (name, category, description, key_pieces, color_scheme) VALUES ($1,$2,$3,$4,$5)', s);
  }

  // Seed color palettes (15 items)
  const colors = [
    ['Autumn Warmth', '#8B4513', '#D2691E', '#CD853F', 'Rich warm tones perfect for fall wardrobes', 'Fall', 'Warm'],
    ['Ocean Breeze', '#1E90FF', '#87CEEB', '#00CED1', 'Cool coastal colors inspired by the sea', 'Summer', 'Cool'],
    ['Rose Garden', '#FF69B4', '#FFB6C1', '#DB7093', 'Romantic pink tones for feminine looks', 'Spring', 'Fair'],
    ['Forest Moss', '#228B22', '#556B2F', '#8FBC8F', 'Natural green palette inspired by forests', 'Fall', 'Olive'],
    ['Midnight Elegance', '#191970', '#000080', '#C0C0C0', 'Sophisticated dark palette for evening', 'Winter', 'All'],
    ['Sunset Glow', '#FF6347', '#FF7F50', '#FFD700', 'Vibrant warm sunset-inspired colors', 'Summer', 'Medium'],
    ['Lavender Fields', '#9370DB', '#E6E6FA', '#DDA0DD', 'Soft purple tones for a dreamy aesthetic', 'Spring', 'Fair'],
    ['Desert Sand', '#D2B48C', '#F5DEB3', '#DEB887', 'Neutral earth tones inspired by desert landscapes', 'All Season', 'Warm'],
    ['Berry Bliss', '#8B008B', '#C71585', '#FF1493', 'Bold berry shades for statement looks', 'Winter', 'Cool'],
    ['Sage Serenity', '#9DC183', '#ACB78E', '#C4CDA5', 'Calming sage greens for everyday wear', 'Spring', 'Neutral'],
    ['Copper & Gold', '#B87333', '#DAA520', '#CD7F32', 'Metallic warm tones for luxury styling', 'Fall', 'Warm'],
    ['Arctic Ice', '#F0F8FF', '#B0E0E6', '#ADD8E6', 'Icy cool tones for winter wardrobes', 'Winter', 'Fair'],
    ['Terracotta Dreams', '#E2725B', '#CC5500', '#C04000', 'Earthy terracotta tones for boho style', 'Fall', 'Medium'],
    ['Pastel Paradise', '#FFB3BA', '#BAFFC9', '#BAE1FF', 'Soft pastel combination for spring', 'Spring', 'All'],
    ['Charcoal & Cream', '#36454F', '#FFFDD0', '#808080', 'Classic neutral combination for minimalists', 'All Season', 'All']
  ];
  for (const c of colors) {
    await pool.query('INSERT INTO color_palettes (name, primary_color, secondary_color, accent_color, description, season, skin_tone) VALUES ($1,$2,$3,$4,$5,$6,$7)', c);
  }

  // Seed trends (15 items)
  const trends = [
    ['Quiet Luxury', 'Womenswear', 'Fall', 2024, 'Understated elegance with premium fabrics and minimal branding', 92, 'Cashmere sweaters, tailored coats, leather accessories'],
    ['Dopamine Dressing', 'Womenswear', 'Spring', 2024, 'Bold, joyful colors that boost mood through fashion', 88, 'Bright blazers, colorful dresses, vibrant accessories'],
    ['Mob Wife Aesthetic', 'Womenswear', 'Winter', 2024, 'Bold, luxurious style inspired by Italian glamour', 85, 'Fur coats, gold jewelry, leopard print, red lips'],
    ['Gorpcore', 'Unisex', 'Fall', 2024, 'Outdoor technical wear adapted for urban settings', 80, 'Hiking boots, puffer vests, cargo pants'],
    ['Sheer Everything', 'Womenswear', 'Spring', 2024, 'Transparent fabrics used in unexpected ways', 78, 'Sheer tops, see-through skirts, layered mesh'],
    ['Cherry Red', 'Unisex', 'Winter', 2024, 'The color of the season taking over wardrobes', 90, 'Red leather, red knits, red accessories'],
    ['Oversized Tailoring', 'Unisex', 'Fall', 2024, 'Relaxed, oversized versions of classic tailored pieces', 87, 'Oversized blazers, wide pants, baggy suits'],
    ['Coquette Aesthetic', 'Womenswear', 'Spring', 2024, 'Ultra-feminine with bows, lace, and pastels', 83, 'Bow accessories, lace tops, ballet flats'],
    ['Metallics', 'Womenswear', 'Winter', 2024, 'Silver and gold metallic fabrics for day and night', 81, 'Metallic skirts, silver boots, gold blouses'],
    ['Denim on Denim', 'Unisex', 'Summer', 2024, 'Canadian tuxedo reimagined for modern style', 76, 'Denim jackets, jeans, denim shirts'],
    ['Butter Yellow', 'Womenswear', 'Spring', 2024, 'Soft buttery yellow as the it color', 84, 'Yellow dresses, knits, accessories'],
    ['Utility Chic', 'Unisex', 'Fall', 2024, 'Military and workwear inspired fashion', 79, 'Cargo pants, utility vests, combat boots'],
    ['Ballet Core', 'Womenswear', 'Spring', 2024, 'Dance-inspired fashion with tutus and wraps', 82, 'Wrap tops, tulle skirts, ballet flats'],
    ['Coastal Cowgirl', 'Womenswear', 'Summer', 2024, 'Beachy meets Western style fusion', 75, 'Cowboy boots, denim, crochet tops'],
    ['Neo Grunge', 'Unisex', 'Fall', 2024, 'Updated 90s grunge for the new generation', 77, 'Flannel shirts, combat boots, ripped jeans']
  ];
  for (const t of trends) {
    await pool.query('INSERT INTO trends (name, category, season, year, description, popularity, key_pieces) VALUES ($1,$2,$3,$4,$5,$6,$7)', t);
  }

  // Seed wardrobe (15 items)
  const wardrobeItems = [
    ['Navy Blazer', 'Outerwear', 'Navy', 'Ralph Lauren', 'M', 'Wool blend', 'All Season'],
    ['White Silk Blouse', 'Tops', 'White', 'Equipment', 'S', 'Silk', 'Spring'],
    ['Black Skinny Jeans', 'Bottoms', 'Black', 'AG Jeans', '28', 'Stretch denim', 'All Season'],
    ['Cashmere Sweater', 'Tops', 'Camel', 'Everlane', 'M', 'Cashmere', 'Winter'],
    ['Little Black Dress', 'Dresses', 'Black', 'Theory', '6', 'Crepe', 'All Season'],
    ['Leather Ankle Boots', 'Shoes', 'Black', 'Stuart Weitzman', '8', 'Leather', 'Fall'],
    ['Trench Coat', 'Outerwear', 'Beige', 'Burberry', 'M', 'Cotton gabardine', 'Spring'],
    ['Tailored Trousers', 'Bottoms', 'Charcoal', 'Hugo Boss', '30', 'Wool', 'All Season'],
    ['Striped Breton Tee', 'Tops', 'Navy/White', 'Saint James', 'M', 'Cotton', 'Spring'],
    ['Silk Scarf', 'Accessories', 'Multicolor', 'Hermes', 'OS', 'Silk twill', 'All Season'],
    ['White Sneakers', 'Shoes', 'White', 'Common Projects', '40', 'Leather', 'Spring'],
    ['Denim Jacket', 'Outerwear', 'Medium Wash', 'Levis', 'M', 'Denim', 'Summer'],
    ['Wool Coat', 'Outerwear', 'Camel', 'Max Mara', 'M', 'Virgin wool', 'Winter'],
    ['Floral Midi Skirt', 'Bottoms', 'Floral Print', 'Reformation', 'S', 'Viscose', 'Summer'],
    ['Classic Pumps', 'Shoes', 'Nude', 'Jimmy Choo', '38', 'Patent leather', 'All Season']
  ];
  for (const w of wardrobeItems) {
    await pool.query('INSERT INTO wardrobe (name, category, color, brand, size, material, season) VALUES ($1,$2,$3,$4,$5,$6,$7)', w);
  }

  // Seed ratings (15 items)
  const ratings = [
    ['Power Suit Ensemble', 'Business Meeting', 9.2, 8.5, 9.5, 'Excellent tailoring with perfect color coordination. The structured silhouette commands attention.', 'Navy suit with white shirt and burgundy tie'],
    ['Casual Friday Look', 'Office Casual', 7.8, 7.5, 8.0, 'Good balance of casual and professional. Consider adding a statement accessory.', 'Dark jeans, blazer, and loafers'],
    ['Date Night Outfit', 'Romantic Dinner', 8.5, 9.0, 8.5, 'Romantic and elegant. The color palette is very flattering.', 'Red dress with gold jewelry and heels'],
    ['Beach Day Ensemble', 'Vacation', 7.0, 7.5, 7.0, 'Perfectly appropriate for the occasion. Great use of light fabrics.', 'Linen shorts, cotton shirt, sandals'],
    ['Gala Showstopper', 'Black Tie', 9.8, 9.5, 9.8, 'Absolutely stunning. Red carpet worthy with impeccable styling.', 'Emerald gown with diamond accessories'],
    ['Brunch with Friends', 'Social', 8.0, 8.5, 7.5, 'Effortlessly chic. The mix of textures adds visual interest.', 'Knit top, midi skirt, ankle boots'],
    ['Job Interview Look', 'Professional', 8.8, 8.0, 9.0, 'Professional and polished without being boring. Great first impression.', 'Grey suit, blue shirt, minimal jewelry'],
    ['Music Festival Fit', 'Festival', 7.5, 8.0, 8.5, 'Creative and fun. The layering is practical for weather changes.', 'Crop top, high-waisted shorts, boots'],
    ['Wedding Guest', 'Formal', 9.0, 9.0, 8.8, 'Elegant without upstaging the bride. Perfect color choice.', 'Dusty rose maxi dress with subtle jewelry'],
    ['Airport Style', 'Travel', 7.2, 7.0, 7.5, 'Comfortable yet put-together. Smart choice of wrinkle-free fabrics.', 'Joggers, cashmere hoodie, clean sneakers'],
    ['Art Exhibition', 'Cultural', 8.3, 8.5, 8.8, 'Artistically inspired outfit that shows personality.', 'Architectural black top, wide pants, statement jewelry'],
    ['Gym to Brunch', 'Athleisure', 7.0, 7.5, 7.0, 'Good athleisure transition. The accessories elevate the sporty base.', 'Matching set with gold jewelry and designer bag'],
    ['Holiday Party', 'Festive', 8.7, 9.0, 8.5, 'Festive without being costume-like. Love the sparkle.', 'Sequin top, black trousers, heeled boots'],
    ['Spring Picnic', 'Outdoor', 8.0, 8.5, 7.8, 'Fresh and season-appropriate. The prints are cheerful.', 'Floral dress, jean jacket, white sneakers'],
    ['Winter Layering', 'Everyday', 8.5, 8.0, 9.0, 'Masterful layering with great texture mixing.', 'Turtleneck, vest, coat, scarf, boots']
  ];
  for (const r of ratings) {
    await pool.query('INSERT INTO ratings (outfit_name, occasion, overall_score, color_score, style_score, feedback, description) VALUES ($1,$2,$3,$4,$5,$6,$7)', r);
  }

  // Seed moodboards (15 items)
  const moodboards = [
    ['Parisian Chic', 'French Style', 'Elegant', '#000000, #FFFFFF, #FF0000', 'Effortless Parisian elegance with classic French styling', 'Cafe terraces, striped shirts, berets, cobblestone streets'],
    ['Tropical Paradise', 'Vacation', 'Vibrant', '#00CED1, #FF6347, #FFD700', 'Lush tropical aesthetics for resort wear inspiration', 'Palm trees, exotic flowers, turquoise water, sunset skies'],
    ['Nordic Winter', 'Scandinavian', 'Minimalist', '#F5F5F5, #87CEEB, #696969', 'Clean Scandinavian design meets cozy winter fashion', 'Snow landscapes, wool textures, candlelight, wooden cabins'],
    ['Urban Nightlife', 'City', 'Edgy', '#000000, #FFD700, #800080', 'City lights and nightlife-inspired fashion', 'Neon signs, city skylines, metallic fabrics, dark alleys'],
    ['English Garden', 'Romantic', 'Soft', '#FFB6C1, #98FB98, '#FFF8DC', 'Romantic English garden aesthetic', 'Rose gardens, tea parties, lace, vintage china'],
    ['Desert Nomad', 'Bohemian', 'Earthy', '#DEB887, #CD853F, #8B4513', 'Desert-inspired bohemian wanderlust', 'Sand dunes, cacti, woven textiles, sunset hues'],
    ['Art Deco Glamour', '1920s', 'Luxurious', '#FFD700, #000000, #006400', 'Great Gatsby-era opulence and geometric patterns', 'Gold leaf, geometric patterns, champagne, jazz clubs'],
    ['Japanese Minimalism', 'Zen', 'Serene', '#FFFFFF, #000000, #C4A882', 'Wabi-sabi inspired fashion with Japanese aesthetics', 'Zen gardens, origami, clean lines, natural materials'],
    ['Coastal Living', 'Beach', 'Relaxed', '#87CEEB, #F5F5DC, #F4A460', 'Beachside lifestyle fashion inspiration', 'Seashells, driftwood, linen, sandy textures'],
    ['Rock & Roll', 'Music', 'Rebellious', '#000000, #FF0000, #C0C0C0', 'Rock-inspired fashion with attitude', 'Electric guitars, leather, studs, concert stages'],
    ['Autumn Harvest', 'Seasonal', 'Warm', '#FF8C00, #8B0000, #556B2F', 'Fall harvest inspired warm-toned fashion', 'Pumpkin patches, fallen leaves, plaid, warm drinks'],
    ['Mediterranean Summer', 'Travel', 'Sun-kissed', '#1E90FF, '#FFFFFF, #FF6347', 'Sun-drenched Mediterranean style inspiration', 'Whitewashed buildings, olive groves, blue seas, terracotta'],
    ['Vintage Hollywood', 'Glamour', 'Dramatic', '#C0C0C0, #000000, #FF0000', 'Old Hollywood glamour and movie star style', 'Red carpets, film noir, fur stoles, vintage cameras'],
    ['Modern Warrior', 'Empowerment', 'Bold', '#000000, #800020, #C0C0C0', 'Strong, empowered fashion for the modern warrior', 'Armor-inspired, structured shoulders, bold silhouettes'],
    ['Spring Awakening', 'Fresh', 'Blooming', '#FFB7C5, #98FB98, #E6E6FA', 'Fresh spring vibes with blooming florals', 'Cherry blossoms, butterfly wings, morning dew, pastels']
  ];
  for (const m of moodboards) {
    await pool.query('INSERT INTO moodboards (name, theme, aesthetic, colors, description, elements) VALUES ($1,$2,$3,$4,$5,$6)', m);
  }

  // Seed stylist chats (15 items)
  const chats = [
    ['What should I wear to a job interview at a tech startup?', 'Smart casual is key for tech interviews. Opt for dark jeans or chinos, a crisp button-down, and clean sneakers or loafers. A blazer optional but adds polish.', 'Professional', 'interview, tech, casual'],
    ['How do I build a capsule wardrobe?', 'Start with 30-35 versatile pieces in a cohesive color palette. Include quality basics, a few statement pieces, and ensure everything mixes and matches.', 'Wardrobe Building', 'capsule, basics, planning'],
    ['What colors suit pale skin and dark hair?', 'Your Snow White coloring looks amazing in jewel tones like emerald, sapphire, and ruby. Also try true white, black, and navy for classic contrast.', 'Color Analysis', 'colors, skin tone, contrast'],
    ['How do I dress for my body shape?', 'Focus on highlighting what you love. For any body type, well-fitted clothes in quality fabrics will always look best. Balance proportions with strategic silhouettes.', 'Body Type', 'body shape, fit, proportion'],
    ['What are the must-have accessories for fall?', 'A quality leather belt, structured bag, silk scarf, gold layered necklaces, and a classic watch. These elevate any outfit instantly.', 'Accessories', 'fall, accessories, essentials'],
    ['How to transition summer clothes to fall?', 'Layer summer dresses with turtlenecks, add boots to shorts outfits, throw blazers over sundresses, and use scarves to add warmth and texture.', 'Seasonal', 'transition, layering, seasonal'],
    ['What shoes go with everything?', 'White sneakers, nude pumps, black ankle boots, and tan loafers are four shoes that work with virtually everything in your closet.', 'Shoes', 'shoes, versatile, basics'],
    ['How to mix patterns like a pro?', 'Stick to a shared color palette, vary the scale of patterns, use one dominant and one subtle pattern, and ground the look with solid pieces.', 'Styling Tips', 'patterns, mixing, advanced'],
    ['What is my style personality?', 'Your style personality depends on what makes you feel most confident. Common types include Classic, Creative, Dramatic, Natural, Romantic, and Gamine.', 'Style Identity', 'personality, identity, self'],
    ['Best investment pieces for women?', 'A tailored blazer, quality leather bag, cashmere sweater, perfect trench coat, and diamond studs. These cost-per-wear pieces last years.', 'Investment', 'investment, quality, wardrobe'],
    ['How to dress for a first date?', 'Wear something that makes you feel confident and like yourself. A flattering top with jeans and heels or a casual dress works perfectly. Avoid anything brand new.', 'Dating', 'date, confidence, casual'],
    ['Can I wear navy and black together?', 'Absolutely! Navy and black is a sophisticated combination. The key is to make it intentional with different textures and clear color distinction.', 'Color Rules', 'navy, black, color mixing'],
    ['How to look put-together on a budget?', 'Focus on fit, keep clothes clean and pressed, stick to a color palette, accessorize strategically, and invest in alterations for thrift finds.', 'Budget', 'budget, affordable, tips'],
    ['What is quiet luxury?', 'Quiet luxury focuses on premium materials, impeccable construction, and understated design without visible logos. Think Loro Piana, The Row, and Brunello Cucinelli.', 'Trends', 'quiet luxury, stealth wealth'],
    ['How to style a white t-shirt?', 'Tuck into high-waisted trousers with heels for polish, knot at the waist with a midi skirt, layer under a blazer, or pair with jeans and statement jewelry.', 'Basics', 'white tee, versatile, styling']
  ];
  for (const c of chats) {
    await pool.query('INSERT INTO stylist_chats (question, response, category, tags) VALUES ($1,$2,$3,$4)', c);
  }

  // Seed fabrics (15 items)
  const fabricItems = [
    ['Italian Wool', 'Natural', 'Medium', 'Smooth', 'Dry clean only. Store with cedar to prevent moths.', 9, 'Suits, coats, trousers', 'Premium Italian wool known for its softness and drape'],
    ['Japanese Denim', 'Natural', 'Heavy', 'Rugged', 'Wash inside out in cold water. Air dry for best results.', 7, 'Jeans, jackets, skirts', 'Selvedge denim from traditional Japanese looms'],
    ['Mulberry Silk', 'Natural', 'Light', 'Silky smooth', 'Hand wash or dry clean. Keep away from direct sunlight.', 8, 'Blouses, dresses, scarves', 'The finest quality silk with natural sheen'],
    ['Organic Cotton', 'Natural', 'Light-Medium', 'Soft', 'Machine washable. Tumble dry low. Gets softer with each wash.', 10, 'T-shirts, casual wear, undergarments', 'Sustainably grown cotton without pesticides'],
    ['Cashmere', 'Natural', 'Light', 'Ultra-soft', 'Hand wash in cold water. Lay flat to dry. Use cashmere comb.', 7, 'Sweaters, scarves, cardigans', 'Luxurious fiber from cashmere goats'],
    ['Tencel Lyocell', 'Semi-synthetic', 'Light', 'Smooth, cool', 'Machine wash cold. Iron on low. Eco-friendly production.', 10, 'Shirts, dresses, activewear', 'Sustainable fabric made from eucalyptus wood pulp'],
    ['French Linen', 'Natural', 'Medium', 'Textured, crisp', 'Machine wash warm. Embrace natural wrinkles or iron damp.', 9, 'Summer dresses, pants, home textiles', 'Classic linen from French flax fields'],
    ['Merino Wool', 'Natural', 'Light-Medium', 'Soft, non-itchy', 'Machine wash wool cycle. Lay flat to dry.', 9, 'Base layers, sweaters, activewear', 'Temperature-regulating wool thats naturally odor-resistant'],
    ['Recycled Polyester', 'Synthetic', 'Variable', 'Smooth', 'Machine washable. Quick dry. Low heat ironing.', 8, 'Activewear, outerwear, linings', 'Made from recycled plastic bottles'],
    ['Bamboo Jersey', 'Semi-synthetic', 'Light', 'Buttery soft', 'Machine wash cold. Tumble dry low.', 8, 'T-shirts, loungewear, undergarments', 'Incredibly soft fabric with natural antibacterial properties'],
    ['Leather', 'Natural', 'Heavy', 'Smooth to textured', 'Condition regularly. Store in breathable bag. Avoid water.', 5, 'Jackets, bags, shoes, belts', 'Timeless material that develops beautiful patina'],
    ['Velvet', 'Can be natural or synthetic', 'Medium', 'Plush, luxurious', 'Steam to remove wrinkles. Dry clean recommended.', 6, 'Evening wear, blazers, accessories', 'Rich, textured fabric perfect for formal occasions'],
    ['Satin', 'Synthetic blend', 'Light', 'Glossy, smooth', 'Hand wash or dry clean. Iron on reverse side.', 5, 'Evening gowns, lingerie, blouses', 'Glossy fabric with beautiful drape and sheen'],
    ['Tweed', 'Natural', 'Heavy', 'Rough, textured', 'Dry clean only. Brush after wearing. Store with space.', 7, 'Jackets, skirts, coats', 'Classic British fabric associated with heritage style'],
    ['Modal', 'Semi-synthetic', 'Light', 'Silky smooth', 'Machine wash cold. Retains color well.', 9, 'Underwear, t-shirts, loungewear', 'Beech tree-derived fabric softer than cotton']
  ];
  for (const f of fabricItems) {
    await pool.query('INSERT INTO fabrics (name, type, weight, texture, care_instructions, sustainability_rating, best_for, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', f);
  }

  // Seed seasonal collections (15 items)
  const seasonal = [
    ['Winter Wonderland', 'Winter', 2024, 'Classic', 'Wool coat, cashmere sweater, leather boots, knit scarf', 'Ivory, charcoal, burgundy', 'Luxurious winter essentials in rich, warm tones'],
    ['Spring Bloom', 'Spring', 2024, 'Romantic', 'Floral dress, light cardigan, ballet flats, straw tote', 'Blush, sage, cream', 'Fresh spring pieces inspired by blooming gardens'],
    ['Summer Breeze', 'Summer', 2024, 'Casual', 'Linen shirt, cotton shorts, espadrilles, sun hat', 'White, ocean blue, coral', 'Breezy summer staples for effortless style'],
    ['Autumn Leaves', 'Fall', 2024, 'Cozy', 'Chunky knit, corduroy pants, suede boots, felt hat', 'Rust, olive, camel', 'Warm autumn pieces in nature-inspired hues'],
    ['Resort Luxe', 'Spring', 2024, 'Luxury', 'Silk kaftan, gold sandals, oversized sunglasses, clutch', 'Turquoise, gold, white', 'Luxury resort wear for tropical getaways'],
    ['Urban Winter', 'Winter', 2024, 'Streetwear', 'Puffer jacket, hoodie, cargo pants, chunky boots', 'Black, grey, neon green', 'Street-ready winter layers with urban edge'],
    ['Transitional Edit', 'Fall', 2024, 'Minimalist', 'Trench coat, turtleneck, wide-leg pants, loafers', 'Camel, black, cream', 'Key transitional pieces between seasons'],
    ['Festival Season', 'Summer', 2024, 'Bohemian', 'Crochet top, denim shorts, cowboy boots, fringe bag', 'Sunset orange, turquoise, brown', 'Festival-ready pieces with boho flair'],
    ['Holiday Glamour', 'Winter', 2024, 'Glamorous', 'Sequin dress, velvet blazer, satin heels, crystal clutch', 'Red, gold, emerald', 'Show-stopping holiday party outfits'],
    ['Spring Work Capsule', 'Spring', 2024, 'Professional', 'Blazer, silk blouse, tailored pants, pointed pumps', 'Navy, blush, white', 'Professional spring wardrobe essentials'],
    ['Beach Weekend', 'Summer', 2024, 'Relaxed', 'Swimsuit, coverup, flip flops, woven bag', 'Aqua, sand, white', 'Essential beach weekend packing list'],
    ['Ski Lodge Chic', 'Winter', 2024, 'Sport Luxe', 'Ski jacket, thermal leggings, snow boots, beanie', 'Navy, red, white', 'Fashionable ski wear for the slopes'],
    ['Garden Party', 'Spring', 2024, 'Elegant', 'Tea-length dress, wedge heels, fascinator, pearl earrings', 'Lavender, mint, lemon', 'Elegant garden party ensembles'],
    ['Back to Campus', 'Fall', 2024, 'Preppy', 'Varsity jacket, plaid skirt, loafers, backpack', 'Navy, red, cream', 'Campus-ready preppy style essentials'],
    ['New Year Reset', 'Winter', 2024, 'Minimalist', 'White shirt, perfect jeans, clean sneakers, quality tote', 'White, indigo, tan', 'Fresh start with wardrobe basics reset']
  ];
  for (const s of seasonal) {
    await pool.query('INSERT INTO seasonal_collections (name, season, year, style, key_pieces, color_palette, description) VALUES ($1,$2,$3,$4,$5,$6,$7)', s);
  }

  // Seed body type guides (15 items)
  const bodyGuides = [
    ['Hourglass', 'Balanced bust and hips with defined waist', 'Wrap dresses, belted styles, fitted tops, high-waisted pants', 'Boxy shapes, shapeless dresses', 'Emphasize your natural waist with belts and fitted silhouettes', 'Scarlett Johansson, Sofia Vergara'],
    ['Pear', 'Narrower shoulders with wider hips', 'A-line skirts, boat neck tops, structured shoulders, dark bottoms', 'Clingy fabrics on lower half, skinny jeans with wide tops', 'Draw attention upward with statement necklines and earrings', 'Jennifer Lopez, Beyonce'],
    ['Apple', 'Broader midsection with slender legs', 'Empire waist dresses, V-necks, A-line silhouettes, straight-leg pants', 'Tight waistbands, clingy fabrics around middle', 'Show off your great legs and décolletage', 'Drew Barrymore, Oprah Winfrey'],
    ['Rectangle', 'Balanced proportions with less defined waist', 'Peplum tops, belted jackets, ruched dresses, layered outfits', 'Straight shift dresses, boxy cuts', 'Create curves with strategic draping and cinched waists', 'Cameron Diaz, Natalie Portman'],
    ['Inverted Triangle', 'Broader shoulders with narrow hips', 'V-neck tops, A-line skirts, wide-leg pants, boot-cut jeans', 'Puffy sleeves, shoulder pads, halter necks', 'Balance proportions with volume on the lower half', 'Angelina Jolie, Naomi Campbell'],
    ['Petite', 'Under 5\'4" with proportional frame', 'High-waisted styles, vertical stripes, monochromatic looks, pointed shoes', 'Oversized clothes, ankle straps, wide horizontal prints', 'Create elongating lines and avoid overwhelming proportions', 'Reese Witherspoon, Ariana Grande'],
    ['Tall', 'Over 5\'8" with long proportions', 'Maxi dresses, wide-leg pants, horizontal stripes, belted styles', 'Too-short hemlines, cropped pants without intention', 'Embrace your height with long, flowing silhouettes', 'Taylor Swift, Gigi Hadid'],
    ['Athletic', 'Broad shoulders, defined muscles, straight torso', 'Feminine details, soft fabrics, ruching, flowy skirts', 'Stiff structured pieces that add bulk', 'Soften angular lines with draping and curves', 'Serena Williams, Jessica Biel'],
    ['Plus Size Hourglass', 'Curvy with defined waist', 'Structured wrap dresses, supportive fabrics, defined shoulders', 'Shapeless mumus, overly restrictive clothing', 'Invest in quality undergarments and tailored fits', 'Ashley Graham, Lizzo'],
    ['Slim Rectangle', 'Lean and straight with minimal curves', 'Layered looks, texture mixing, boyfriend jeans, cropped jackets', 'Overly fitted sheaths, very baggy clothes', 'Add dimension with texture, layers, and interesting details', 'Keira Knightley, Kate Middleton'],
    ['Full Bust', 'Prominent bust regardless of body type', 'V-necks, wrap styles, supportive structured tops, darker colors up top', 'Crew necks, ruching at bust, double-breasted jackets', 'Find the right fit in tops first, then coordinate bottoms', 'Christina Hendricks, Salma Hayek'],
    ['Long Torso', 'Torso longer than legs', 'High-waisted everything, cropped tops, long necklaces', 'Low-rise pants, tucked-in shirts without high waist', 'Visually shorten the torso and lengthen the legs', 'Kendall Jenner, Blake Lively'],
    ['Short Torso', 'Legs longer than torso', 'Low-rise styles, longer tops, empire waists, untucked blouses', 'High-waisted styles, cropped tops, wide belts', 'Elongate the torso with longer top proportions', 'Lucy Liu, Mila Kunis'],
    ['Curvy Plus', 'Full figured with defined curves', 'Structured knits, A-line dresses, bootcut pants, fitted blazers', 'Shapeless clothing, very stiff fabrics', 'Choose fabrics with stretch that skim rather than cling', 'Queen Latifah, Rebel Wilson'],
    ['Muscular Build', 'Well-defined muscles, athletic physique', 'Stretchy fabrics, relaxed fits, soft materials, draped styles', 'Very tight clothing, stiff non-stretch fabrics', 'Choose flexible fabrics that accommodate your build comfortably', 'Gal Gadot, Halle Berry']
  ];
  for (const b of bodyGuides) {
    await pool.query('INSERT INTO bodytype_guides (body_type, description, recommended_styles, avoid_styles, key_tips, celebrity_examples) VALUES ($1,$2,$3,$4,$5,$6)', b);
  }

  // Seed accessories (15 items)
  const accessoryItems = [
    ['Classic Pearl Necklace', 'Jewelry', 'Classic', 'Pearl', 'White', 'Mikimoto', 'Timeless strand of cultured Akoya pearls'],
    ['Leather Crossbody Bag', 'Bags', 'Casual', 'Leather', 'Tan', 'Coach', 'Versatile everyday crossbody in pebbled leather'],
    ['Gold Hoop Earrings', 'Jewelry', 'Versatile', '14K Gold', 'Gold', 'Mejuri', 'Medium-sized gold hoops perfect for any occasion'],
    ['Silk Square Scarf', 'Scarves', 'Elegant', 'Silk', 'Multicolor', 'Hermes', 'Hand-rolled silk scarf with equestrian print'],
    ['Leather Belt', 'Belts', 'Classic', 'Leather', 'Black', 'Gucci', 'Classic leather belt with understated buckle'],
    ['Aviator Sunglasses', 'Eyewear', 'Classic', 'Metal', 'Gold/Green', 'Ray-Ban', 'Iconic aviator frames with polarized lenses'],
    ['Cashmere Beanie', 'Hats', 'Casual', 'Cashmere', 'Grey', 'Johnstons of Elgin', 'Super soft Scottish cashmere beanie'],
    ['Diamond Studs', 'Jewelry', 'Classic', 'Diamond/Gold', 'Clear', 'Tiffany & Co', 'Brilliant-cut diamond stud earrings'],
    ['Structured Tote Bag', 'Bags', 'Professional', 'Saffiano Leather', 'Black', 'Prada', 'Classic structured tote for work and travel'],
    ['Wool Fedora', 'Hats', 'Chic', 'Wool Felt', 'Camel', 'Janessa Leone', 'Handcrafted wool fedora with leather trim'],
    ['Chain Link Bracelet', 'Jewelry', 'Modern', 'Sterling Silver', 'Silver', 'David Yurman', 'Bold chain link bracelet with toggle clasp'],
    ['Evening Clutch', 'Bags', 'Formal', 'Satin', 'Black', 'Jimmy Choo', 'Crystal-embellished satin evening clutch'],
    ['Ankle Strap Watch', 'Watches', 'Minimalist', 'Stainless Steel', 'Rose Gold', 'Daniel Wellington', 'Slim minimalist watch with mesh strap'],
    ['Embroidered Headband', 'Hair Accessories', 'Trendy', 'Velvet', 'Navy', 'Lele Sadoughi', 'Padded velvet headband with pearl embroidery'],
    ['Leather Gloves', 'Gloves', 'Classic', 'Lambskin', 'Black', 'Dents', 'Butter-soft lambskin gloves with cashmere lining']
  ];
  for (const a of accessoryItems) {
    await pool.query('INSERT INTO accessories (name, category, style, material, color, brand, description) VALUES ($1,$2,$3,$4,$5,$6,$7)', a);
  }

  // Seed fashion history (15 items)
  const historyItems = [
    ['1920s', 'The Roaring Twenties', 'Flappers revolutionized fashion with shorter hemlines, dropped waists, and a rejection of corseted silhouettes', 'Coco Chanel, Jean Patou, Madeleine Vionnet', 'Flapper dresses, cloche hats, art deco jewelry, T-strap shoes', 'Women gained freedom of movement and expression through fashion'],
    ['1930s', 'Hollywood Glamour Era', 'The golden age of Hollywood influenced elegant bias-cut gowns and sophisticated daywear', 'Elsa Schiaparelli, Mainbocher, Adrian', 'Bias-cut gowns, fur stoles, wide-leg trousers, berets', 'Cinema became the primary fashion influencer for the masses'],
    ['1940s', 'Wartime Fashion', 'World War II rationing led to practical, military-inspired clothing with limited fabric usage', 'Claire McCardell, Norman Norell', 'Utility suits, A-line skirts, turbans, platform shoes', 'Women entered the workforce and fashion adapted to practicality'],
    ['1950s', 'The New Look', 'Dior\'s New Look brought back femininity with cinched waists and full skirts after wartime austerity', 'Christian Dior, Cristobal Balenciaga, Hubert de Givenchy', 'Full skirts, petticoats, pencil skirts, pearls, cat-eye glasses', 'Post-war prosperity fueled a return to glamour and femininity'],
    ['1960s', 'Youth Revolution', 'The counterculture movement brought mini skirts, mod fashion, and a youthful energy to style', 'Mary Quant, Andre Courreges, Paco Rabanne', 'Mini skirts, go-go boots, shift dresses, psychedelic prints', 'Youth culture became the driving force of fashion for the first time'],
    ['1970s', 'Bohemian Freedom', 'Disco, punk, and bohemian movements created diverse style tribes', 'Yves Saint Laurent, Halston, Vivienne Westwood', 'Bell-bottoms, platform shoes, wrap dresses, punk leather', 'Fashion democratized with multiple coexisting style movements'],
    ['1980s', 'Power Dressing', 'Bold shoulders, excess, and power dressing defined the decade of opulence', 'Giorgio Armani, Thierry Mugler, Versace', 'Power suits, shoulder pads, neon colors, leg warmers', 'Fashion became a symbol of ambition and economic excess'],
    ['1990s', 'Minimalism & Grunge', 'The decade of contrasts between minimalist luxury and grunge rebellion', 'Calvin Klein, Marc Jacobs, Tom Ford', 'Slip dresses, flannel shirts, minimalist suits, chokers', 'Anti-fashion sentiment emerged alongside refined minimalism'],
    ['2000s', 'Y2K & Celebrity Culture', 'Celebrity style, reality TV, and fast fashion transformed how people consumed fashion', 'Alexander McQueen, John Galliano, Stella McCartney', 'Low-rise jeans, velour tracksuits, logo mania, stilettos', 'Fast fashion democratized trends but raised sustainability concerns'],
    ['2010s', 'Social Media Era', 'Instagram, influencers, and athleisure transformed the fashion landscape', 'Phoebe Philo, Demna Gvasalia, Virgil Abloh', 'Athleisure, sneaker culture, oversized silhouettes, sustainable fashion', 'Social media democratized fashion influence beyond traditional gatekeepers'],
    ['Ancient Egypt', 'Fashion of the Pharaohs', 'Draped linen garments, elaborate jewelry, and symbolic headdresses defined Egyptian style', 'Royal artisans and textile weavers', 'Linen sheath dresses, gold collars, kohl-lined eyes, sandals', 'Fashion served religious, social, and climatic purposes simultaneously'],
    ['Renaissance', 'Art Meets Fashion', 'Elaborate textiles, structured garments, and rich colors reflected the era\'s artistic achievements', 'Italian and Flemish textile guilds', 'Corsets, ruffs, brocade gowns, doublets, ornate jewelry', 'Fashion became a display of wealth, status, and artistic patronage'],
    ['Victorian Era', 'Modesty & Elegance', 'Strict dress codes, elaborate construction, and the birth of haute couture', 'Charles Frederick Worth, the father of haute couture', 'Crinolines, bustles, corsets, high collars, mourning dress', 'The first fashion houses established fashion as a formal industry'],
    ['Belle Epoque', 'The Beautiful Era', 'Opulent, decorative fashion marked the pre-WWI period of European prosperity', 'Paul Poiret, Jacques Doucet, Jeanne Lanvin', 'S-bend corsets, picture hats, tea gowns, parasols', 'Fashion reflected unprecedented luxury before the world changed forever'],
    ['2020s', 'Post-Pandemic Fashion', 'Comfort-first dressing, sustainability focus, and digital fashion define the current era', 'Daniel Lee, Jonathan Anderson, Pierpaolo Piccioli', 'Comfortable luxury, gender-fluid fashion, upcycled pieces', 'The pandemic permanently shifted priorities toward comfort and sustainability']
  ];
  for (const h of historyItems) {
    await pool.query('INSERT INTO fashion_history (era, title, description, key_designers, iconic_looks, cultural_impact) VALUES ($1,$2,$3,$4,$5,$6)', h);
  }

  // Seed sustainable fashion (15 items)
  const sustainableItems = [
    ['Recycled Ocean Jacket', 'Patagonia', 'Outerwear', 10, 'Recycled ocean plastics, recycled polyester', 'B Corp, Fair Trade, bluesign', '$200-$350', 'Jacket made from recycled ocean plastics recovered from coastal areas'],
    ['Organic Cotton Basics Set', 'Pact', 'Basics', 9, '100% organic cotton, natural dyes', 'GOTS, Fair Trade', '$25-$45', 'Everyday basics made with organic cotton and ethical manufacturing'],
    ['Hemp Blend Trousers', 'Thought Clothing', 'Bottoms', 9, 'Hemp, organic cotton blend', 'GOTS, Soil Association', '$80-$120', 'Comfortable trousers made from sustainable hemp blend fabric'],
    ['Tencel Wrap Dress', 'Reformation', 'Dresses', 8, 'Tencel lyocell, recycled fabric', 'Eco-cert, Climate Neutral', '$150-$250', 'Beautiful wrap dress made from sustainably sourced Tencel'],
    ['Upcycled Denim Collection', 'RE/DONE', 'Denim', 10, 'Upcycled vintage Levi\'s denim', 'Upcycled certification', '$200-$400', 'Vintage Levi\'s reimagined into modern silhouettes'],
    ['Bamboo Loungewear Set', 'Boody', 'Loungewear', 8, 'Bamboo viscose, organic cotton', 'FSC, OEKO-TEX', '$40-$80', 'Ultra-soft loungewear from sustainable bamboo sources'],
    ['Recycled Cashmere Sweater', 'Naadam', 'Knitwear', 8, 'Recycled cashmere from factory waste', 'SFA member', '$150-$250', 'Luxurious cashmere sweater from recycled cashmere fibers'],
    ['Plant-Based Sneakers', 'Veja', 'Footwear', 9, 'Organic cotton, wild rubber, recycled plastic', 'B Corp', '$100-$180', 'Iconic sneakers made with transparent and sustainable materials'],
    ['Cork Leather Handbag', 'Matt & Nat', 'Bags', 9, 'Cork, recycled nylon lining, vegan leather', 'PETA approved vegan', '$80-$200', 'Stylish vegan bag using innovative cork leather alternative'],
    ['Linen Summer Collection', 'EILEEN FISHER', 'Multi-category', 9, 'Organic linen, responsible wool', 'B Corp, SA8000', '$100-$300', 'Timeless linen pieces designed for circular fashion'],
    ['Deadstock Fabric Dress', 'Christy Dawn', 'Dresses', 10, 'Deadstock and surplus fabrics', 'Farm-to-Closet certified', '$150-$300', 'One-of-a-kind dresses made from fashion industry surplus fabrics'],
    ['Recycled Wool Coat', 'Stella McCartney', 'Outerwear', 8, 'Recycled wool, recycled polyester', 'Fur-free, leather-free', '$800-$1500', 'Luxury outerwear from recycled and regenerated wool fibers'],
    ['Organic Silk Blouse', 'People Tree', 'Tops', 9, 'Peace silk (ahimsa), organic cotton', 'GOTS, Fair Trade, WFTO', '$60-$120', 'Fair trade blouse using cruelty-free peace silk production'],
    ['Algae-Based Flip Flops', 'Allbirds', 'Footwear', 9, 'SweetFoam (sugarcane-based), algae foam', 'B Corp, Carbon Neutral', '$35-$50', 'Comfortable flip flops with carbon-negative SweetFoam soles'],
    ['Pinatex Leather Jacket', 'Nanushka', 'Outerwear', 9, 'Pinatex (pineapple leaf fiber), recycled poly', 'PETA approved, vegan', '$400-$700', 'Stunning vegan leather jacket made from pineapple leaf fibers']
  ];
  for (const s of sustainableItems) {
    await pool.query('INSERT INTO sustainable_fashion (name, brand, category, eco_rating, materials, certifications, price_range, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', s);
  }

  // Seed celebrity styles (15 items)
  const celeb = [
    ['Zendaya', 'Chameleon', 'Red carpet transformations, editorial dressing, risk-taking fashion choices', 'Structured suits, vintage pieces, custom gowns', 'Valentino, Versace, Tom Ford, Vivienne Westwood', 'Fashion chameleon who transforms with every appearance, styled by Law Roach'],
    ['Harry Styles', 'Gender-Fluid', 'Gender-bending fashion, vintage-inspired, bold patterns and colors', 'Flared trousers, pearl necklaces, feather boas, statement rings', 'Gucci, JW Anderson, Harris Reed', 'Pioneering gender-fluid fashion in mainstream pop culture'],
    ['Rihanna', 'Trendsetter', 'Bold, fashion-forward choices mixing high fashion with streetwear', 'Oversized outerwear, bodycon dresses, statement accessories', 'Dior, Balenciaga, Bottega Veneta, own Fenty brand', 'Fashion mogul who creates trends through her own Fenty brand'],
    ['Timothee Chalamet', 'Modern Romantic', 'Romantic, artistic fashion with youthful energy and vintage influence', 'Sequin harnesses, backless tops, embroidered jackets', 'Haider Ackermann, Louis Vuitton, Stella McCartney', 'Redefining mens red carpet fashion with daring choices'],
    ['Blake Lively', 'Glamour Queen', 'Old Hollywood glamour meets modern sophistication, self-styled', 'Embellished gowns, power suits, metallic fabrics', 'Versace, Ralph Lauren, Michael Kors, Chanel', 'Self-styled fashion icon known for Met Gala coordination'],
    ['A$AP Rocky', 'Streetwear King', 'High-fashion streetwear fusion, vintage finds, bold layering', 'Babushka headscarf, kilts, vintage band tees, designer sneakers', 'Dior, Gucci, Rick Owens, Raf Simons', 'Bridge between streetwear and high fashion communities'],
    ['Cate Blanchett', 'Sustainable Elegance', 'Rewearing and sustainable high fashion, architectural silhouettes', 'Repeat outfits, sustainable designers, structured gowns', 'Armani, Givenchy, Stella McCartney', 'Champion of sustainable fashion on the red carpet'],
    ['Bad Bunny', 'Boundary Breaker', 'Breaking masculine fashion norms with nail art, skirts, and bold color', 'Oversized silhouettes, nail art, bright colors, skirts', 'Jacquemus, Burberry, Chrome Hearts', 'Challenging gender norms in Latin music and fashion culture'],
    ['Jennifer Aniston', 'Timeless Classic', 'Clean, classic American style that never goes out of fashion', 'Little black dress, fitted jeans, blazers, minimal jewelry', 'Chanel, Tom Ford, The Row, James Perse', 'Embodiment of classic American style that spans decades'],
    ['BTS (Group)', 'K-Fashion', 'Korean fashion influence, matching group aesthetics, bold experimentation', 'Oversized blazers, harnesses, platform shoes, statement accessories', 'Louis Vuitton, custom Dior, Korean designers', 'Brought K-fashion to global mainstream audiences'],
    ['Lady Gaga', 'Avant-Garde', 'Extreme fashion art, meat dress legacy, theatrical dressing', 'Architectural pieces, extreme platforms, custom creations', 'Valentino, Schiaparelli, Alexander McQueen, Versace', 'Pushed fashion into performance art territory'],
    ['David Beckham', 'Refined Masculine', 'Evolution from sporty to refined, classic tailoring with edge', 'Perfectly fitted suits, leather jackets, peacoats', 'Tom Ford, Ralph Lauren, Kent & Curwen', 'Helped mainstream mens interest in fashion and grooming'],
    ['Billie Eilish', 'Oversized Rebel', 'Challenging beauty standards with oversized silhouettes and bold choices', 'Oversized everything, neon colors, chains, custom designs', 'Gucci, Burberry, custom pieces', 'Uses fashion to challenge body image expectations'],
    ['Lupita Nyongo', 'Color Master', 'Bold color choices, celebrating African heritage, custom couture', 'Vibrant colors, structural gowns, African-inspired accessories', 'Versace, Prada, custom African designers', 'Celebrates diversity and African heritage through fashion'],
    ['Pharrell Williams', 'Creative Pioneer', 'Boundary-pushing fashion that merges music, art, and culture', 'Buffalo hat, shorts suits, Chanel accessories', 'Louis Vuitton (creative director), Chanel, Billionaire Boys Club', 'From musician to luxury fashion creative director']
  ];
  for (const c of celeb) {
    await pool.query('INSERT INTO celebrity_styles (celebrity_name, style_category, signature_looks, key_pieces, brands, description) VALUES ($1,$2,$3,$4,$5,$6)', c);
  }

  console.log('Database seeded successfully!');
  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
