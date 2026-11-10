const mongoose = require('mongoose');
const Card = require('../models/Card');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yugioh_db';

const targetNames = [
  // 1. Classic & Iconic (12)
  'Blue-Eyes White Dragon', 'Dark Magician', 'Dark Magician Girl', 'Red-Eyes Black Dragon',
  'Exodia the Forbidden One', 'Left Arm of the Forbidden One', 'Right Arm of the Forbidden One',
  'Left Leg of the Forbidden One', 'Right Leg of the Forbidden One',
  'Slifer the Sky Dragon', 'Obelisk the Tormentor', 'The Winged Dragon of Ra',

  // 2. Legendary Spells (10)
  'Monster Reborn', 'Pot of Greed', 'Raigeki', "Harpie's Feather Duster", 'Dark Hole',
  'Polymerization', 'Super Polymerization', 'Change of Heart', 'Swords of Revealing Light',
  'Terraforming',

  // 3. Iconic & Staple Traps (8)
  'Mirror Force', 'Torrential Tribute', 'Solemn Judgment', 'Solemn Strike', 'Solemn Warning',
  'Infinite Impermanence', 'Evenly Matched', 'Dimensional Barrier',

  // 4. Modern Hand Traps & Staples (10)
  'Ash Blossom & Joyous Spring', 'Maxx "C"', 'Effect Veiler', 'Nibiru, the Primal Being',
  'Ghost Ogre & Snow Rabbit', 'Ghost Belle & Haunted Mansion', 'Droll & Lock Bird',
  'Called by the Grave', 'Crossout Designator', 'Triple Tactics Talent',

  // 5. Extra Deck Boss Monsters (10)
  'Baronne de Fleur', 'Accesscode Talker', 'S:P Little Knight', 'I:P Masquerena',
  'Apollousa, Bow of the Goddess', 'Divine Arsenal AA-ZEUS - Sky Thunder',
  'Knightmare Phoenix', 'Knightmare Unicorn', 'Borreload Savage Dragon', 'Number 39: Utopia',

  // 6. Tearlaments Core (15)
  'Tearlaments Scheiren', 'Tearlaments Havnis', 'Tearlaments Merrli', 'Tearlaments Reinoheart',
  'Tearlaments Kashtira', 'Tearlaments Kitkallos', 'Tearlaments Rulkallos', 'Tearlaments Kaleido-Heart',
  'Primeval Planet Perlereino', 'Tearlaments Scream', 'Tearlaments Sulliek', 'Tearlaments Cryme',
  'Tearlaments Grief', 'Tearlaments Metanoise', 'Tearlaments Heartbeat',

  // 7. Tenpai Dragon Core (7)
  'Tenpai Dragon Chundra', 'Tenpai Dragon Paidra', 'Tenpai Dragon Fadra',
  'Sangen Kaimen', 'Sangen Summoning', 'Bident Dragion', 'Trident Dragion',

  // 8. Kashtira Core (8)
  'Kashtira Fenrir', 'Kashtira Unicorn', 'Kashtira Riseheart', 'Kashtira Shangri-Ira',
  'Kashtira Arise-Heart', 'Pressured Planet Wraitsoth', 'Kashtira Birth', 'Kashtira Theosis',

  // 9. Snake-Eye & Fire King Core (7)
  'Snake-Eye Ash', 'Snake-Eye Poplar', 'Snake-Eye Oak', 'Snake-Eyes Flamberge Dragon',
  'Diabellstar the Black Witch', 'Original Sinful Spoils - Snake-Eye', 'Promethean Princess, Bestower of Flames',

  // 10. Meta Staples & Searchers (13)
  'Cyber Dragon', 'Elemental HERO Neos', 'Stardust Dragon', 'Black Rose Dragon',
  'Time Thief Redoer', 'Abyss Dweller', 'Bagooska the Terribly Tired Tapir',
  'Foolish Burial', 'Foolish Burial Goods', 'Reinforcement of the Army',
  'Mystical Space Typhoon', 'Cosmic Cyclone', 'Triple Tactics Thrust'
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // Lấy các thẻ theo danh sách tên mục tiêu
  const selectedCards = await Card.find({
    name: { $in: targetNames }
  }).lean();

  console.log(`Tìm thấy ${selectedCards.length} thẻ theo danh sách định sẵn.`);

  // Loại trùng lặp theo ID hoặc Name
  const uniqueMap = new Map();
  selectedCards.forEach(c => {
    if (!uniqueMap.has(c.name)) {
      uniqueMap.set(c.name, c);
    }
  });

  // Nếu chưa đủ 100 lá bài, lấy thêm các lá bài phổ biến khác từ database cho đúng tròn 100 lá
  if (uniqueMap.size < 100) {
    const needMore = 100 - uniqueMap.size;
    const existingIds = Array.from(uniqueMap.values()).map(c => c.id);
    const extraCards = await Card.find({
      id: { $nin: existingIds },
      min_price: { $gt: 0 },
      'card_images.0.image_url': { $exists: true }
    }).sort({ min_price: -1 }).limit(needMore).lean();

    extraCards.forEach(c => {
      if (uniqueMap.size < 100 && !uniqueMap.has(c.name)) {
        uniqueMap.set(c.name, c);
      }
    });
  }

  // Cắt đúng 100 lá bài
  const final100 = Array.from(uniqueMap.values()).slice(0, 100);
  console.log(`Đã chọn chính xác ${final100.length} lá bài chất lượng cao.`);

  // Xóa toàn bộ thẻ cũ và lưu đúng 100 lá bài vào MongoDB
  await Card.deleteMany({});
  await Card.insertMany(final100);

  const total = await Card.countDocuments();
  console.log(`✅ Hoàn tất! Tổng số lá bài trong MongoDB hiện tại: ${total} lá.`);

  process.exit(0);
}

run().catch(err => {
  console.error('Lỗi khi seed 100 thẻ bài:', err);
  process.exit(1);
});
