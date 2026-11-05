const mongoose = require('mongoose');

const deckCardSchema = new mongoose.Schema(
  {
    card_id: { type: Number, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1, max: 3 },
    card_type: { type: String }, // Monster, Spell, Trap, Fusion, Synchro, Xyz, Link, etc.
    image_url: { type: String },
    image_url_small: { type: String },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const deckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, index: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Tournament Meta', 'Top Archetype', 'Budget Deck', 'Master Duel', 'Anime Deck', 'Community'],
      default: 'Tournament Meta',
      index: true
    },
    format: {
      type: String,
      enum: ['TCG', 'OCG', 'Master Duel', 'GOAT', 'Edison'],
      default: 'TCG',
      index: true
    },
    archetype: { type: String, default: '', index: true },
    author: { type: String, default: 'YGO Pro Deck' },
    tournament: { type: String, default: '' }, // Ví dụ: "YCS Indianapolis 2026", "WCQ Top 8"
    cover_card_id: { type: Number },
    cover_card_name: { type: String },
    cover_image_url: { type: String },

    // 3 phần chính của bộ bài Yu-Gi-Oh
    main_deck: [deckCardSchema],
    extra_deck: [deckCardSchema],
    side_deck: [deckCardSchema],

    // Thống kê nhanh
    stats: {
      main_count: { type: Number, default: 0 },
      extra_count: { type: Number, default: 0 },
      side_count: { type: Number, default: 0 },
      monster_count: { type: Number, default: 0 },
      spell_count: { type: Number, default: 0 },
      trap_count: { type: Number, default: 0 },
      total_price: { type: Number, default: 0 }
    },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

deckSchema.index({ name: 'text', archetype: 'text', description: 'text', author: 'text' });

module.exports = mongoose.model('Deck', deckSchema);
