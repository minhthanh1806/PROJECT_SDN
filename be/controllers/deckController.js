const Deck = require('../models/Deck');
const Card = require('../models/Card');
const path = require('path');
const fs = require('fs');

// Đọc dữ liệu Banlist của tất cả các format (TCG, OCG, Master Duel)
let BANLIST_CACHE = { TCG: new Map(), OCG: new Map(), 'Master Duel': new Map() };
try {
  const banPath = path.join(__dirname, '../data/ygoprodeck_all_banlists.json');
  if (fs.existsSync(banPath)) {
    const raw = JSON.parse(fs.readFileSync(banPath, 'utf8'));
    ['TCG', 'OCG', 'Master Duel'].forEach((fmt) => {
      const formatObj = raw[fmt] || {};
      const months = Object.keys(formatObj).sort();
      if (months.length > 0) {
        const latestKey = months[months.length - 1];
        const latestData = formatObj[latestKey];
        const map = new Map();
        (latestData.fullCards || []).forEach((c) => {
          map.set(Number(c.id), c.status);
        });
        BANLIST_CACHE[fmt] = map;
      }
    });
  }
} catch (err) {
  console.error('[Load banlists in deckController error]', err);
}

// 1. Lấy danh sách Deck kèm tìm kiếm, bộ lọc nâng cao và phân trang
exports.getDecks = async (req, res) => {
  try {
    const {
      q,              // Từ khóa tìm kiếm (tên deck, archetype, tác giả, mô tả)
      category,       // 'Tournament Meta', 'Top Archetype', 'Budget Deck', 'Master Duel', 'Anime Deck', 'Community'
      format,         // 'TCG', 'OCG', 'Master Duel', 'GOAT', 'Edison'
      archetype,      // Lọc theo archetype
      card_id,        // Lọc deck có chứa lá bài cụ thể
      price_min,      // Giá thấp nhất ($)
      price_max,      // Giá cao nhất ($)
      sort = 'newest',// 'newest', 'price_asc', 'price_desc', 'views', 'likes'
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Tìm kiếm từ khóa
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: regex },
        { archetype: regex },
        { author: regex },
        { tournament: regex },
        { description: regex }
      ];
    }

    // Bộ lọc Category & Format
    if (category && category.trim()) {
      // Hỗ trợ tìm kiếm category linh hoạt (ví dụ: 'Budget Deck', 'Budget Decks', 'Top Archetypes')
      const catTrim = category.trim();
      const catRegex = new RegExp(`^${catTrim.replace(/s$/i, '')}`, 'i');
      query.category = catRegex;
    }
    if (format && format.trim()) {
      query.format = new RegExp(`^${format.trim()}$`, 'i');
    }
    if (archetype && archetype.trim()) {
      query.archetype = new RegExp(`^${archetype.trim()}$`, 'i');
    }

    // Lọc deck có chứa một lá bài nhất định (Main, Extra, hoặc Side)
    if (card_id) {
      const cid = Number(card_id);
      const cardFilter = [
        { 'main_deck.card_id': cid },
        { 'extra_deck.card_id': cid },
        { 'side_deck.card_id': cid }
      ];
      // Nếu đã có $or từ keyword search thì gộp lại bằng $and để không ghi đè
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: cardFilter }];
        delete query.$or;
      } else {
        query.$or = cardFilter;
      }
    }

    // Lọc theo khoảng giá ($)
    const hasMin = price_min !== undefined && price_min !== '';
    const hasMax = price_max !== undefined && price_max !== '';
    if (hasMin || hasMax) {
      query['stats.total_price'] = {};
      if (hasMin) {
        query['stats.total_price'].$gte = Number(price_min);
      }
      if (hasMax) {
        query['stats.total_price'].$lte = Number(price_max);
      }
    }

    // Sắp xếp
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOption = { 'stats.total_price': 1 };
        break;
      case 'price_desc':
        sortOption = { 'stats.total_price': -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'likes':
        sortOption = { likes: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [totalDecks, decks] = await Promise.all([
      Deck.countDocuments(query),
      Deck.find(query).sort(sortOption).skip(skip).limit(limitNum).lean()
    ]);

    return res.json({
      success: true,
      data: decks,
      pagination: {
        totalDecks,
        totalPages: Math.ceil(totalDecks / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('[getDecks error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lấy chi tiết một Deck theo ID hoặc Slug (tự động tăng views và populate trạng thái Banlist)
exports.getDeckById = async (req, res) => {
  try {
    const { id } = req.params;
    let deck;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      deck = await Deck.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean();
    } else {
      deck = await Deck.findOneAndUpdate({ slug: id }, { $inc: { views: 1 } }, { new: true }).lean();
    }

    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ bài này' });
    }

    // Thu thập tất cả card_id trong Main, Extra, Side để tra cứu banlist_info
    const allCardIds = [
      ...(deck.main_deck || []).map((c) => c.card_id),
      ...(deck.extra_deck || []).map((c) => c.card_id),
      ...(deck.side_deck || []).map((c) => c.card_id)
    ];

    const cardsInDb = await Card.find({ id: { $in: allCardIds } })
      .select('id name banlist_info desc desc_vi type attribute race level atk def')
      .lean();

    const cardInfoMap = new Map();
    cardsInDb.forEach((c) => cardInfoMap.set(c.id, c));

    // Xác định Format của Deck để lấy đúng Banlist tương ứng
    const deckFormat = deck.format || 'TCG';
    const activeBanMap = BANLIST_CACHE[deckFormat] || BANLIST_CACHE.TCG;

    // Hàm bổ sung thông tin banlist_info CHUẨN XÁC theo Format của Deck
    const enrichCard = (c) => {
      const dbInfo = cardInfoMap.get(c.card_id);
      const banInfo = dbInfo?.banlist_info || {};

      let ban_status = null;
      // 1. Kiểm tra trong snapshot Banlist chính thức của format đó trước
      if (activeBanMap && activeBanMap.has(c.card_id)) {
        ban_status = activeBanMap.get(c.card_id);
      } else if (deckFormat === 'OCG') {
        ban_status = banInfo.ban_ocg || null;
      } else if (deckFormat === 'Master Duel') {
        ban_status = banInfo.ban_master_duel || null;
      } else if (deckFormat === 'GOAT') {
        ban_status = banInfo.ban_goat || null;
      } else {
        ban_status = banInfo.ban_tcg || null;
      }

      if (ban_status === 'Unlimited' || ban_status === 'None') {
        ban_status = null;
      }

      return {
        ...c,
        ban_status,
        banlist_info: banInfo,
        desc: dbInfo?.desc || '',
        desc_vi: dbInfo?.desc_vi || '',
        attribute: dbInfo?.attribute,
        race: dbInfo?.race,
        level: dbInfo?.level,
        atk: dbInfo?.atk,
        def: dbInfo?.def
      };
    };

    const enrichedMain = (deck.main_deck || []).map(enrichCard);
    const enrichedExtra = (deck.extra_deck || []).map(enrichCard);
    const enrichedSide = (deck.side_deck || []).map(enrichCard);

    // Thống kê các lá bị cấm / giới hạn trong bộ bài
    const bannedCardsList = [];
    [...enrichedMain, ...enrichedExtra, ...enrichedSide].forEach((c) => {
      if (c.ban_status && (c.ban_status === 'Forbidden' || c.ban_status === 'Limited' || c.ban_status === 'Semi-Limited')) {
        const existing = bannedCardsList.find((b) => b.card_id === c.card_id);
        if (!existing) {
          bannedCardsList.push({
            card_id: c.card_id,
            name: c.name,
            ban_status: c.ban_status,
            quantity: c.quantity,
            image_url_small: c.image_url_small
          });
        }
      }
    });

    return res.json({
      success: true,
      data: {
        ...deck,
        main_deck: enrichedMain,
        extra_deck: enrichedExtra,
        side_deck: enrichedSide,
        banned_cards: bannedCardsList,
        ban_summary: {
          forbidden_count: bannedCardsList.filter((c) => c.ban_status === 'Forbidden').length,
          limited_count: bannedCardsList.filter((c) => c.ban_status === 'Limited').length,
          semi_limited_count: bannedCardsList.filter((c) => c.ban_status === 'Semi-Limited').length,
          total_banned_unique: bannedCardsList.length
        }
      }
    });
  } catch (error) {
    console.error('[getDeckById error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Like/Thích một Deck
exports.likeDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await Deck.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy deck' });
    }
    return res.json({ success: true, likes: deck.likes });
  } catch (error) {
    console.error('[likeDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Lấy danh sách thống kê metadata cho Decks (Categories, Formats, Archetypes tiêu biểu)
exports.getDeckMeta = async (req, res) => {
  try {
    const [categories, formats, archetypes, featuredDecks] = await Promise.all([
      Deck.distinct('category'),
      Deck.distinct('format'),
      Deck.distinct('archetype'),
      Deck.find({ is_featured: true }).limit(4).lean()
    ]);

    return res.json({
      success: true,
      data: {
        categories: categories.filter(Boolean),
        formats: formats.filter(Boolean),
        archetypes: archetypes.filter(Boolean),
        featuredDecks
      }
    });
  } catch (error) {
    console.error('[getDeckMeta error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Lấy danh sách Decks của chính người dùng đang đăng nhập
exports.getUserDecks = async (req, res) => {
  try {
    const userId = req.user._id;
    const decks = await Deck.find({ user_id: userId })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: decks
    });
  } catch (error) {
    console.error('[getUserDecks error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper tính toán thống kê stats của bộ bài
function calculateDeckStats(main = [], extra = [], side = []) {
  let monsterCount = 0;
  let spellCount = 0;
  let trapCount = 0;
  let totalPrice = 0;

  main.forEach((c) => {
    const qty = c.quantity || 1;
    const typeLower = (c.card_type || '').toLowerCase();
    if (typeLower.includes('spell')) spellCount += qty;
    else if (typeLower.includes('trap')) trapCount += qty;
    else monsterCount += qty;
    totalPrice += (c.price || 0) * qty;
  });

  extra.forEach((c) => {
    totalPrice += (c.price || 0) * (c.quantity || 1);
  });
  side.forEach((c) => {
    totalPrice += (c.price || 0) * (c.quantity || 1);
  });

  return {
    main_count: main.reduce((s, c) => s + (c.quantity || 1), 0),
    extra_count: extra.reduce((s, c) => s + (c.quantity || 1), 0),
    side_count: side.reduce((s, c) => s + (c.quantity || 1), 0),
    monster_count: monsterCount,
    spell_count: spellCount,
    trap_count: trapCount,
    total_price: Number(totalPrice.toFixed(2))
  };
}

// 6. Người dùng tạo mới bộ bài cá nhân (Deck Builder)
exports.createUserDeck = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      description = '',
      category = 'Community',
      format = 'TCG',
      archetype = '',
      main_deck = [],
      extra_deck = [],
      side_deck = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên bộ bài' });
    }

    const stats = calculateDeckStats(main_deck, extra_deck, side_deck);
    const coverCard = main_deck[0] || extra_deck[0] || {};
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const newDeck = new Deck({
      name: name.trim(),
      slug,
      description,
      user_id: user._id,
      author: user.username || 'User',
      category: ['Tournament Meta', 'Top Archetype', 'Budget Deck', 'Master Duel', 'Anime Deck', 'Community'].includes(category)
        ? category
        : 'Community',
      format: ['TCG', 'OCG', 'Master Duel', 'GOAT', 'Edison'].includes(format) ? format : 'TCG',
      archetype: (archetype || '').trim(),
      cover_card_id: coverCard.card_id || null,
      cover_card_name: coverCard.name || '',
      cover_image_url: coverCard.image_url || '',
      main_deck,
      extra_deck,
      side_deck,
      stats,
      is_featured: false
    });

    await newDeck.save();

    return res.status(201).json({
      success: true,
      message: 'Tạo bộ bài mới thành công',
      data: newDeck
    });
  } catch (error) {
    console.error('[createUserDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Người dùng cập nhật bộ bài của chính mình
exports.updateUserDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deck = await Deck.findById(id);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ bài' });
    }

    // Kiểm tra quyền sở hữu bộ bài (chỉ chủ sở hữu deck hoặc admin mới được sửa)
    if (String(deck.user_id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa bộ bài này' });
    }

    const {
      name,
      description,
      category,
      format,
      archetype,
      main_deck,
      extra_deck,
      side_deck
    } = req.body;

    if (name) deck.name = name.trim();
    if (description !== undefined) deck.description = description;
    if (category) deck.category = category;
    if (format) deck.format = format;
    if (archetype !== undefined) deck.archetype = archetype.trim();

    if (main_deck) deck.main_deck = main_deck;
    if (extra_deck) deck.extra_deck = extra_deck;
    if (side_deck) deck.side_deck = side_deck;

    deck.stats = calculateDeckStats(deck.main_deck, deck.extra_deck, deck.side_deck);

    const coverCard = deck.main_deck[0] || deck.extra_deck[0] || {};
    deck.cover_card_id = coverCard.card_id || null;
    deck.cover_card_name = coverCard.name || '';
    deck.cover_image_url = coverCard.image_url || '';

    await deck.save();

    return res.json({
      success: true,
      message: 'Cập nhật bộ bài thành công',
      data: deck
    });
  } catch (error) {
    console.error('[updateUserDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Người dùng xóa bộ bài của chính mình
exports.deleteUserDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deck = await Deck.findById(id);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ bài' });
    }

    // Kiểm tra quyền sở hữu
    if (String(deck.user_id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bộ bài này' });
    }

    await Deck.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Đã xóa bộ bài thành công'
    });
  } catch (error) {
    console.error('[deleteUserDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
