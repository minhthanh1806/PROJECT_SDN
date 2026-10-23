const mongoose = require('mongoose');

const cardImageSchema = new mongoose.Schema({
  id: { type: Number },
  image_url: { type: String },
  image_url_small: { type: String },
  image_url_cropped: { type: String },
  local_image: { type: String },        // Đường dẫn ảnh lưu tại server, vd: /images/cards/12345678.jpg
  local_image_small: { type: String }   // /images/cards/12345678_small.jpg
}, { _id: false });

const cardSetSchema = new mongoose.Schema({
  set_name: { type: String },
  set_code: { type: String },
  set_rarity: { type: String },
  set_rarity_code: { type: String },
  set_price: { type: Number, default: 0 }
}, { _id: false });

const cardPricesSchema = new mongoose.Schema({
  cardmarket_price: { type: Number, default: 0 },   // Euro (€)
  tcgplayer_price: { type: Number, default: 0 },    // USD ($)
  ebay_price: { type: Number, default: 0 },         // USD ($)
  amazon_price: { type: Number, default: 0 },       // USD ($)
  coolstuffinc_price: { type: Number, default: 0 }  // USD ($)
}, { _id: false });

const banlistInfoSchema = new mongoose.Schema({
  ban_tcg: { type: String, default: 'Unlimited' },
  ban_ocg: { type: String, default: 'Unlimited' },
  ban_goat: { type: String, default: 'Unlimited' }
}, { _id: false });

const cardSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  type: { type: String, index: true },
  frameType: { type: String },
  desc: { type: String },
  race: { type: String, index: true },
  attribute: { type: String, index: true },
  archetype: { type: String, index: true },
  atk: { type: Number, index: true },
  def: { type: Number, index: true },
  level: { type: Number, index: true },
  scale: { type: Number },
  linkval: { type: Number },
  linkmarkers: [{ type: String }],
  
  card_images: [cardImageSchema],
  card_sets: [cardSetSchema],
  card_prices: cardPricesSchema,
  
  // Trường tối ưu riêng cho web để tìm kiếm, sắp xếp giá nhanh
  min_price: { type: Number, default: 0, index: true },
  banlist_info: banlistInfoSchema,
  price_updated_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Tạo index text cho tìm kiếm tên thẻ
cardSchema.index({ name: 'text', archetype: 'text' });

module.exports = mongoose.model('Card', cardSchema);
