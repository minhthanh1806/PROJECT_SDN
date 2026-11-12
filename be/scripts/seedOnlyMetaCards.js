const mongoose = require('mongoose');
const axios = require('axios');
const Card = require('../models/Card');
const Deck = require('../models/Deck');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yugioh_db';

// Danh sách các Archetype Meta hiện tại (2024-2026)
const META_ARCHETYPES = [
  'Mitsurugi',
  'K9',
  'Kewl Tune',
  'Snake-Eye',
  'Sinful Spoils',
  'Diabellstar',
  'Tenpai Dragon',
  'Sangen',
  'Fiendsmith',
  'Kashtira',
  'Tearlaments',
  'Yubel',
  'Voiceless Voice',
  'Branded',
  'Despia',
  'Purrely',
  'Labrynth'
];

// Danh sách các lá bài Staples, Handtraps, Boss Monster Meta bắt buộc có
const META_STAPLE_NAMES = [
  'Ash Blossom & Joyous Spring',
  'Maxx "C"',
  'Infinite Impermanence',
  'Nibiru, the Primal Being',
  'Effect Veiler',
  'Droll & Lock Bird',
  'Ghost Ogre & Snow Rabbit',
  'Ghost Belle & Haunted Mansion',
  'Ghost Mourner & Moonlit Chill',
  'Dimension Shifter',
  'Called by the Grave',
  'Crossout Designator',
  'Triple Tactics Talent',
  'Triple Tactics Thrust',
  'Super Polymerization',
  'Forbidden Droplet',
  'Dark Ruler No More',
  'Pot of Prosperity',
  'Pot of Extravagance',
  'Terraforming',
  'Foolish Burial',
  'Foolish Burial Goods',
  'Harpie\'s Feather Duster',
  'Cosmic Cyclone',
  'Evenly Matched',
  'Red Reboot',
  'S:P Little Knight',
  'I:P Masquerena',
  'Divine Arsenal AA-ZEUS - Sky Thunder',
  'Super Starslayer TY-PHON - Sky Crisis',
  'Baronne de Fleur',
  'Accesscode Talker',
  'Chaos Angel',
  'PSY-Framelord Omega',
  'Herald of the Arc Light',
  'Abyss Dweller',
  'Knightmare Phoenix',
  'Knightmare Cerberus',
  'Knightmare Unicorn',
  'Apollousa, Bow of the Goddess',
  'Underworld Goddess of the Closed World',
  'Promethean Princess, Bestower of Flames',
  'Mudragon of the Swamp',
  'Garura, Wings of Resonant Life',
  'Number 39: Utopia',
  'Number 41: Bagooska the Terribly Tired Tapir',
  'Toadally Awesome',
  'Artifact Durendal'
];

async function translateToVietnamese(text) {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (res.data) {
      if (Array.isArray(res.data)) return res.data.join('\n');
      if (typeof res.data === 'string') return res.data;
    }
  } catch (e) {
    // fallback
  }
  return text;
}

function calculateMinPrice(prices) {
  if (!prices) return 0;
  const p = [
    parseFloat(prices.cardmarket_price),
    parseFloat(prices.tcgplayer_price),
    parseFloat(prices.ebay_price),
    parseFloat(prices.amazon_price),
    parseFloat(prices.coolstuffinc_price)
  ].filter((val) => !isNaN(val) && val > 0);
  return p.length > 0 ? Math.min(...p) : 0;
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  // 1. Lấy tất cả card_id đang được dùng trong các Decks để đảm bảo không bị thiếu lá nào trong deck
  const decks = await Deck.find().lean();
  const deckCardIds = new Set();
  decks.forEach((d) => {
    (d.main_deck || []).forEach((c) => deckCardIds.add(c.card_id));
    (d.extra_deck || []).forEach((c) => deckCardIds.add(c.card_id));
    (d.side_deck || []).forEach((c) => deckCardIds.add(c.card_id));
  });
  console.log(`Cards used in decks: ${deckCardIds.size} cards.`);

  // 2. Tìm tất cả các lá bài trong DB khớp với Meta Archetypes hoặc Meta Staples hoặc Cards in Decks
  const archetypeRegexes = META_ARCHETYPES.map((a) => new RegExp(a, 'i'));
  const stapleRegexes = META_STAPLE_NAMES.map((s) => new RegExp(`^${s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));

  const metaCardsFromDb = await Card.find({
    $or: [
      { archetype: { $in: archetypeRegexes } },
      { name: { $in: stapleRegexes } },
      { id: { $in: Array.from(deckCardIds) } }
    ]
  }).lean();

  console.log(`Matched ${metaCardsFromDb.length} meta cards currently in DB.`);

  // 3. Nếu thiếu archetype meta nào (ví dụ Tenpai, Fiendsmith, Snake-Eye), fetch thêm trực tiếp từ YGOPRODeck API
  const archetypesToFetch = ['Mitsurugi', 'K9', 'Kewl', 'Snake-Eye', 'Tenpai Dragon', 'Fiendsmith', 'Kashtira', 'Tearlaments', 'Yubel'];
  const fetchedApiCards = [];

  for (const arch of archetypesToFetch) {
    try {
      console.log(`Checking/fetching archetype [${arch}] from YGOPRODeck API...`);
      const res = await axios.get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(arch)}`, { timeout: 10000 });
      if (res.data?.data) {
        fetchedApiCards.push(...res.data.data);
      }
    } catch (e) {
      console.warn(`Could not fetch ${arch}:`, e.message);
    }
  }

  // Gộp tất cả thẻ meta vào 1 Map theo ID
  const finalMetaMap = new Map();

  // Đưa thẻ DB vào Map trước
  metaCardsFromDb.forEach((c) => {
    finalMetaMap.set(c.id, c);
  });

  // Đưa thẻ từ API vào Map (chuẩn hóa dữ liệu)
  for (const raw of fetchedApiCards) {
    const prices = raw.card_prices?.[0] || {};
    const minPrice = calculateMinPrice(prices);
    const existing = finalMetaMap.get(raw.id);

    const doc = {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      frameType: raw.frameType,
      desc: raw.desc,
      desc_vi: existing?.desc_vi || '',
      race: raw.race,
      attribute: raw.attribute,
      archetype: raw.archetype || raw.name,
      atk: raw.atk,
      def: raw.def,
      level: raw.level,
      scale: raw.scale,
      linkval: raw.linkval,
      linkmarkers: raw.linkmarkers,
      card_images: (raw.card_images || []).map((img) => ({
        id: img.id,
        image_url: img.image_url,
        image_url_small: img.image_url_small,
        image_url_cropped: img.image_url_cropped
      })),
      card_sets: (raw.card_sets || []).map((s) => ({
        set_name: s.set_name,
        set_code: s.set_code,
        set_rarity: s.set_rarity,
        set_rarity_code: s.set_rarity_code,
        set_price: parseFloat(s.set_price) || 0
      })),
      card_prices: {
        cardmarket_price: parseFloat(prices.cardmarket_price) || 0,
        tcgplayer_price: parseFloat(prices.tcgplayer_price) || 0,
        ebay_price: parseFloat(prices.ebay_price) || 0,
        amazon_price: parseFloat(prices.amazon_price) || 0,
        coolstuffinc_price: parseFloat(prices.coolstuffinc_price) || 0
      },
      min_price: minPrice > 0 ? minPrice : (parseFloat(prices.tcgplayer_price) || 1.0),
      banlist_info: raw.banlist_info || { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' }
    };

    finalMetaMap.set(doc.id, doc);
  }

  const allMetaCards = Array.from(finalMetaMap.values());
  console.log(`Total meta cards prepared: ${allMetaCards.length} cards.`);

  // 4. Xóa toàn bộ 14,000 thẻ rác/không phải meta trong collection cards!
  console.log('Replacing Card collection with ONLY current Meta cards...');
  await Card.deleteMany({});
  console.log('Old card collection cleared.');

  // 5. Chèn toàn bộ thẻ Meta vào DB hàng loạt siêu tốc
  console.log(`Bulk inserting ${allMetaCards.length} authentic Meta cards into MongoDB...`);
  await Card.insertMany(allMetaCards);

  const finalCount = await Card.countDocuments();
  console.log(`SUCCESS! Total cards in database is now strictly: ${finalCount} current Meta cards.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
