const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yugioh_db';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // ==========================================
  // 1. THÊM NGƯỜI DÙNG MỚI (USERS)
  // ==========================================
  const newUsersData = [
    { username: 'JesseKotton', role: 'user', favorites: [14558127, 23434538, 84815190] },
    { username: 'JoshuaSchmidt', role: 'user', favorites: [9674034, 72270339, 29301450] },
    { username: 'Pakawat_YGO', role: 'user', favorites: [32909498, 48626373, 68304193] },
    { username: 'KaibaBoy', role: 'user', favorites: [89631139, 70095154, 83764719] },
    { username: 'YugiDuelist', role: 'user', favorites: [46986414, 38033121, 33396948] },
    { username: 'NguyenVanAn', role: 'user', favorites: [91810826, 39931513, 66730191] },
    { username: 'TranThiMai', role: 'user', favorites: [572850, 37961969, 92731385] },
    { username: 'LeHoangNam', role: 'user', favorites: [10045474, 41420027, 15693423] },
    { username: 'MasterDuelKing', role: 'user', favorites: [23434538, 14558127, 27204311] },
    { username: 'ShadowDuelist', role: 'user', favorites: [10000000, 10000010, 10000020] },
    { username: 'CyberDragonFan', role: 'user', favorites: [70095154, 86066372, 84013237] },
    { username: 'AkizaRose', role: 'user', favorites: [73580471, 44508094, 27548199] },
    { username: 'SoulburnerX', role: 'user', favorites: [2772337, 65741786, 86066372] },
    { username: 'JoeyTheLuck', role: 'user', favorites: [74677422, 12580477, 44095762] },
    { username: 'YGO_Judge_Hanoi', role: 'admin', favorites: [41420027, 40605147, 84749824] }
  ];

  let addedUserCount = 0;
  for (const u of newUsersData) {
    const exists = await User.findOne({ username: u.username });
    if (!exists) {
      await User.create({
        username: u.username,
        password: hashPassword('123456'), // Mật khẩu mặc định: 123456
        role: u.role,
        favorites: u.favorites || []
      });
      addedUserCount++;
    }
  }
  const totalUsers = await User.countDocuments();
  console.log(`✅ Đã thêm ${addedUserCount} người dùng mới! Tổng người dùng hiện tại: ${totalUsers}`);

  // ==========================================
  // 2. THÊM DECKS MỚI (DECKS)
  // ==========================================
  // Lấy danh sách thẻ từ MongoDB làm tài nguyên xây dựng Decks
  const allCards = await Card.find().lean();
  const cardByName = (name) => {
    const found = allCards.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!found) {
      // Fallback thẻ đầu tiên
      return {
        card_id: allCards[0].id,
        name: allCards[0].name,
        card_type: allCards[0].type,
        image_url: allCards[0].card_images?.[0]?.image_url || '',
        image_url_small: allCards[0].card_images?.[0]?.image_url_small || '',
        price: allCards[0].min_price || 0
      };
    }
    return {
      card_id: found.id,
      name: found.name,
      card_type: found.type,
      image_url: found.card_images?.[0]?.image_url || '',
      image_url_small: found.card_images?.[0]?.image_url_small || '',
      price: found.min_price || 0
    };
  };

  const makeDeckCard = (name, qty = 3) => {
    const c = cardByName(name);
    return { ...c, quantity: qty };
  };

  const calculateDeckStats = (main, extra, side = []) => {
    let monsterCount = 0, spellCount = 0, trapCount = 0, totalPrice = 0;
    main.forEach(c => {
      const q = c.quantity || 1;
      const t = (c.card_type || '').toLowerCase();
      if (t.includes('spell')) spellCount += q;
      else if (t.includes('trap')) trapCount += q;
      else monsterCount += q;
      totalPrice += (c.price || 0) * q;
    });
    extra.forEach(c => { totalPrice += (c.price || 0) * (c.quantity || 1); });
    side.forEach(c => { totalPrice += (c.price || 0) * (c.quantity || 1); });

    return {
      main_count: main.reduce((s, c) => s + (c.quantity || 1), 0),
      extra_count: extra.reduce((s, c) => s + (c.quantity || 1), 0),
      side_count: side.reduce((s, c) => s + (c.quantity || 1), 0),
      monster_count: monsterCount,
      spell_count: spellCount,
      trap_count: trapCount,
      total_price: Number(totalPrice.toFixed(2))
    };
  };

  const newDecksList = [
    // 1. Kashtira Arise-Heart Dimension Lock
    {
      name: 'Kashtira Arise-Heart Dimension Lock (Tier 1)',
      format: 'TCG',
      category: 'Tournament Meta',
      archetype: 'Kashtira',
      author: 'JesseKotton',
      tournament: 'YCS Indianapolis 2026 Champion',
      description: 'Chiến thuật Kashtira áp đảo với Arise-Heart loại bỏ toàn bộ bài gửi xuống GY và khóa từng ô zone của đối thủ.',
      is_featured: true,
      views: 1850,
      likes: 240,
      main: [
        makeDeckCard('Kashtira Fenrir', 3),
        makeDeckCard('Kashtira Unicorn', 3),
        makeDeckCard('Kashtira Riseheart', 3),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Nibiru, the Primal Being', 2),
        makeDeckCard('Droll & Lock Bird', 3),
        makeDeckCard('Kashtira Birth', 3),
        makeDeckCard('Terraforming', 1),
        makeDeckCard('Triple Tactics Talent', 3),
        makeDeckCard('Triple Tactics Thrust', 2),
        makeDeckCard('Pot of Greed', 1),
        makeDeckCard('Called by the Grave', 1),
        makeDeckCard('Crossout Designator', 2),
        makeDeckCard('Infinite Impermanence', 3),
        makeDeckCard('Dimensional Barrier', 3),
        makeDeckCard('Solemn Judgment', 3),
        makeDeckCard('Evenly Matched', 2)
      ],
      extra: [
        makeDeckCard('Kashtira Arise-Heart', 3),
        makeDeckCard('Kashtira Shangri-Ira', 3),
        makeDeckCard('Divine Arsenal AA-ZEUS - Sky Thunder', 2),
        makeDeckCard('Baronne de Fleur', 1),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('Accesscode Talker', 1),
        makeDeckCard('I:P Masquerena', 1),
        makeDeckCard('Knightmare Unicorn', 1),
        makeDeckCard('Knightmare Phoenix', 1)
      ]
    },

    // 2. Snake-Eye Diabellstar Fire Turbo
    {
      name: 'Snake-Eye Diabellstar Fire Turbo (Meta King)',
      format: 'TCG',
      category: 'Tournament Meta',
      archetype: 'Snake-Eye',
      author: 'JoshuaSchmidt',
      tournament: 'European Championship Winner',
      description: 'Combo lửa siêu dày và tái nguyên vô tận từ Diabellstar, Snake-Eye Ash và Flamberge Dragon.',
      is_featured: true,
      views: 3200,
      likes: 410,
      main: [
        makeDeckCard('Snake-Eye Ash', 3),
        makeDeckCard('Snake-Eye Oak', 2),
        makeDeckCard('Snake-Eyes Flamberge Dragon', 2),
        makeDeckCard('Diabellstar the Black Witch', 3),
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Ghost Ogre & Snow Rabbit', 2),
        makeDeckCard('Original Sinful Spoils - Snake-Eye', 1),
        makeDeckCard('Super Polymerization', 3),
        makeDeckCard('Triple Tactics Talent', 3),
        makeDeckCard('Called by the Grave', 1),
        makeDeckCard('Crossout Designator', 2),
        makeDeckCard('Cosmic Cyclone', 3),
        makeDeckCard('Infinite Impermanence', 3),
        makeDeckCard('Solemn Strike', 3),
        makeDeckCard('Torrential Tribute', 3)
      ],
      extra: [
        makeDeckCard('Promethean Princess, Bestower of Flames', 2),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('I:P Masquerena', 2),
        makeDeckCard('Apollousa, Bow of the Goddess', 1),
        makeDeckCard('Accesscode Talker', 1),
        makeDeckCard('Baronne de Fleur', 1),
        makeDeckCard('Borreload Savage Dragon', 1),
        makeDeckCard('Knightmare Phoenix', 2),
        makeDeckCard('Knightmare Unicorn', 2),
        makeDeckCard('Divine Arsenal AA-ZEUS - Sky Thunder', 1)
      ]
    },

    // 3. Tenpai Dragon Sangen Synchro OTK
    {
      name: 'Tenpai Dragon Sangen Synchro OTK (Bản Thi Đấu)',
      format: 'TCG',
      category: 'Tournament Meta',
      archetype: 'Tenpai Dragon',
      author: 'NguyenVanAn',
      tournament: 'Hanoi YGO Open 2026',
      description: 'Tấn công hủy diệt ngay trong Battle Phase với khả năng Synchro tức thì không thể bị cản phá của Tenpai Dragon.',
      is_featured: true,
      views: 2450,
      likes: 380,
      main: [
        makeDeckCard('Tenpai Dragon Chundra', 3),
        makeDeckCard('Tenpai Dragon Paidra', 3),
        makeDeckCard('Tenpai Dragon Fadra', 3),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Droll & Lock Bird', 3),
        makeDeckCard('Nibiru, the Primal Being', 2),
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Sangen Kaimen', 3),
        makeDeckCard('Sangen Summoning', 3),
        makeDeckCard('Terraforming', 1),
        makeDeckCard('Raigeki', 2),
        makeDeckCard("Harpie's Feather Duster", 1),
        makeDeckCard('Dark Hole', 2),
        makeDeckCard('Super Polymerization', 3),
        makeDeckCard('Called by the Grave', 1),
        makeDeckCard('Evenly Matched', 3),
        makeDeckCard('Infinite Impermanence', 3)
      ],
      extra: [
        makeDeckCard('Trident Dragion', 2),
        makeDeckCard('Baronne de Fleur', 2),
        makeDeckCard('Black Rose Dragon', 2),
        makeDeckCard('Borreload Savage Dragon', 2),
        makeDeckCard('Stardust Dragon', 1),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('Knightmare Phoenix', 2),
        makeDeckCard('Divine Arsenal AA-ZEUS - Sky Thunder', 2)
      ]
    },

    // 4. Blue-Eyes Ultimate Kaiba Dragon
    {
      name: 'Blue-Eyes White Dragon Cường Quyền Tối Thượng',
      format: 'TCG',
      category: 'Anime Deck',
      archetype: 'Blue-Eyes',
      author: 'KaibaBoy',
      tournament: 'Battle City Classic',
      description: 'Sức mạnh thần thoại của 3 Rồng Trắng Mắt Xanh kết hợp cùng dàn Spell công phá kinh điển.',
      is_featured: false,
      views: 1420,
      likes: 195,
      main: [
        makeDeckCard('Blue-Eyes White Dragon', 3),
        makeDeckCard('Cyber Dragon', 3),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Monster Reborn', 1),
        makeDeckCard('Raigeki', 1),
        makeDeckCard("Harpie's Feather Duster", 1),
        makeDeckCard('Polymerization', 3),
        makeDeckCard('Super Polymerization', 3),
        makeDeckCard('Swords of Revealing Light', 3),
        makeDeckCard('Mystical Space Typhoon', 3),
        makeDeckCard('Foolish Burial', 1),
        makeDeckCard('Mirror Force', 3),
        makeDeckCard('Torrential Tribute', 3),
        makeDeckCard('Solemn Judgment', 3),
        makeDeckCard('Solemn Strike', 3)
      ],
      extra: [
        makeDeckCard('Baronne de Fleur', 2),
        makeDeckCard('Stardust Dragon', 2),
        makeDeckCard('Number 39: Utopia', 2),
        makeDeckCard('Divine Arsenal AA-ZEUS - Sky Thunder', 2),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('Accesscode Talker', 1),
        makeDeckCard('Knightmare Phoenix', 2),
        makeDeckCard('Knightmare Unicorn', 2)
      ]
    },

    // 5. Dark Magician Ultimate Spellcaster Atem
    {
      name: 'Phù Thủy Áo Đen Dark Magician Ma Pháp Tối Thượng',
      format: 'TCG',
      category: 'Anime Deck',
      archetype: 'Dark Magician',
      author: 'YugiDuelist',
      tournament: 'Vua Trò Chơi Duels',
      description: 'Lối chơi ma pháp biến hóa thần sầu của Phù Thủy Áo Đen và Nữ Phù Thủy Áo Đen.',
      is_featured: false,
      views: 1980,
      likes: 310,
      main: [
        makeDeckCard('Dark Magician', 3),
        makeDeckCard('Dark Magician Girl', 3),
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Ghost Ogre & Snow Rabbit', 2),
        makeDeckCard('Monster Reborn', 1),
        makeDeckCard('Raigeki', 1),
        makeDeckCard('Dark Hole', 1),
        makeDeckCard('Polymerization', 2),
        makeDeckCard('Super Polymerization', 3),
        makeDeckCard('Change of Heart', 1),
        makeDeckCard('Swords of Revealing Light', 3),
        makeDeckCard('Terraforming', 1),
        makeDeckCard('Foolish Burial', 1),
        makeDeckCard('Mirror Force', 3),
        makeDeckCard('Torrential Tribute', 3),
        makeDeckCard('Solemn Judgment', 3),
        makeDeckCard('Infinite Impermanence', 3)
      ],
      extra: [
        makeDeckCard('Baronne de Fleur', 2),
        makeDeckCard('Borreload Savage Dragon', 2),
        makeDeckCard('Number 39: Utopia', 2),
        makeDeckCard('Time Thief Redoer', 2),
        makeDeckCard('Abyss Dweller', 1),
        makeDeckCard('I:P Masquerena', 2),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('Knightmare Phoenix', 2)
      ]
    },

    // 6. Egyptian God Divine Power
    {
      name: 'Tam Thần Ai Cập Giáng Lâm (Slifer, Obelisk, Ra)',
      format: 'TCG',
      category: 'Anime Deck',
      archetype: 'Egyptian God',
      author: 'ShadowDuelist',
      tournament: 'Battle City Finals',
      description: 'Triệu hồi sức mạnh nguyên thủy của 3 Vị Thần Ai Cập: Slifer, Obelisk và The Winged Dragon of Ra.',
      is_featured: true,
      views: 2950,
      likes: 450,
      main: [
        makeDeckCard('Slifer the Sky Dragon', 2),
        makeDeckCard('Obelisk the Tormentor', 2),
        makeDeckCard('The Winged Dragon of Ra', 2),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Maxx "C"', 3),
        makeDeckCard('Nibiru, the Primal Being', 2),
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Monster Reborn', 1),
        makeDeckCard('Raigeki', 1),
        makeDeckCard("Harpie's Feather Duster", 1),
        makeDeckCard('Pot of Greed', 1),
        makeDeckCard('Change of Heart', 1),
        makeDeckCard('Swords of Revealing Light', 3),
        makeDeckCard('Triple Tactics Talent', 3),
        makeDeckCard('Called by the Grave', 1),
        makeDeckCard('Crossout Designator', 2),
        makeDeckCard('Mirror Force', 3),
        makeDeckCard('Solemn Judgment', 3),
        makeDeckCard('Infinite Impermanence', 3)
      ],
      extra: [
        makeDeckCard('Divine Arsenal AA-ZEUS - Sky Thunder', 2),
        makeDeckCard('Baronne de Fleur', 2),
        makeDeckCard('Number 39: Utopia', 2),
        makeDeckCard('Time Thief Redoer', 2),
        makeDeckCard('Accesscode Talker', 1),
        makeDeckCard('Apollousa, Bow of the Goddess', 1),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('I:P Masquerena', 2),
        makeDeckCard('Knightmare Unicorn', 1)
      ]
    },

    // 7. Master Duel Exodia FTK Draw
    {
      name: 'Exodia Thần Sức Mạnh Bất Khả Chiến Bại (OTK)',
      format: 'Master Duel',
      category: 'Master Duel',
      archetype: 'Exodia',
      author: 'MasterDuelKing',
      tournament: 'Master Duel WCS',
      description: 'Chiến thuật rút bài liên tục gom đủ 5 mảnh Exodia trên tay giành chiến thắng ngay lập tức.',
      is_featured: false,
      views: 3100,
      likes: 390,
      main: [
        makeDeckCard('Exodia the Forbidden One', 1),
        makeDeckCard('Left Arm of the Forbidden One', 1),
        makeDeckCard('Right Arm of the Forbidden One', 1),
        makeDeckCard('Left Leg of the Forbidden One', 1),
        makeDeckCard('Right Leg of the Forbidden One', 1),
        makeDeckCard('Maxx "C"', 3),
        makeDeckCard('Ash Blossom & Joyous Spring', 3),
        makeDeckCard('Droll & Lock Bird', 3),
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Pot of Greed', 1),
        makeDeckCard('Triple Tactics Talent', 3),
        makeDeckCard('Triple Tactics Thrust', 3),
        makeDeckCard('Terraforming', 1),
        makeDeckCard('Foolish Burial Goods', 3),
        makeDeckCard('Called by the Grave', 1),
        makeDeckCard('Crossout Designator', 2),
        makeDeckCard('Swords of Revealing Light', 3),
        makeDeckCard('Solemn Judgment', 3),
        makeDeckCard('Evenly Matched', 3)
      ],
      extra: [
        makeDeckCard('I:P Masquerena', 2),
        makeDeckCard('S:P Little Knight', 2),
        makeDeckCard('Knightmare Phoenix', 2),
        makeDeckCard('Knightmare Unicorn', 2),
        makeDeckCard('Apollousa, Bow of the Goddess', 1),
        makeDeckCard('Accesscode Talker', 1),
        makeDeckCard('Number 39: Utopia', 2),
        makeDeckCard('Abyss Dweller', 2),
        makeDeckCard('Divine Arsenal AA-ZEUS - Sky Thunder', 1)
      ]
    },

    // 8. Handtrap Anti-Meta Budget Deck
    {
      name: 'Anti-Meta Handtrap Control Siêu Tiết Kiệm (Budget)',
      format: 'TCG',
      category: 'Budget Deck',
      archetype: 'Anti-Meta',
      author: 'LeHoangNam',
      tournament: 'Budget League Champion',
      description: 'Bộ bài giá rẻ nhưng hiệu quả cực cao, ngắt toàn bộ combo của đối thủ bằng dàn cạm bẫy và handtrap.',
      is_featured: false,
      views: 1250,
      likes: 215,
      main: [
        makeDeckCard('Effect Veiler', 3),
        makeDeckCard('Ghost Ogre & Snow Rabbit', 3),
        makeDeckCard('Ghost Belle & Haunted Mansion', 3),
        makeDeckCard('Droll & Lock Bird', 3),
        makeDeckCard('Dark Hole', 3),
        makeDeckCard('Raigeki', 2),
        makeDeckCard('Mystical Space Typhoon', 3),
        makeDeckCard('Cosmic Cyclone', 3),
        makeDeckCard('Swords of Revealing Light', 3),
        makeDeckCard('Mirror Force', 3),
        makeDeckCard('Torrential Tribute', 3),
        makeDeckCard('Solemn Judgment', 3),
        makeDeckCard('Solemn Strike', 3),
        makeDeckCard('Solemn Warning', 3),
        makeDeckCard('Dimensional Barrier', 2)
      ],
      extra: [
        makeDeckCard('Number 39: Utopia', 3),
        makeDeckCard('Abyss Dweller', 3),
        makeDeckCard('Time Thief Redoer', 3),
        makeDeckCard('Knightmare Phoenix', 3),
        makeDeckCard('Knightmare Unicorn', 3)
      ]
    }
  ];

  let addedDeckCount = 0;
  for (const d of newDecksList) {
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = await Deck.findOne({ slug });
    if (!exists) {
      const stats = calculateDeckStats(d.main, d.extra);
      const coverCard = d.main[0];
      await Deck.create({
        name: d.name,
        slug,
        format: d.format,
        category: d.category,
        archetype: d.archetype,
        author: d.author,
        tournament: d.tournament,
        description: d.description,
        is_featured: d.is_featured,
        views: d.views,
        likes: d.likes,
        cover_card_id: coverCard.card_id,
        cover_card_name: coverCard.name,
        cover_image_url: coverCard.image_url,
        main_deck: d.main,
        extra_deck: d.extra,
        side_deck: [],
        stats
      });
      addedDeckCount++;
    }
  }

  const totalDecks = await Deck.countDocuments();
  console.log(`✅ Đã thêm ${addedDeckCount} bộ bài mới! Tổng số Decks hiện tại: ${totalDecks}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding users and decks:', err);
  process.exit(1);
});
