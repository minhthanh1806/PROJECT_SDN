const Card = require('../models/Card');
const Deck = require('../models/Deck');
const User = require('../models/User');

// 1. Thống kê tổng quan hệ thống (KPIs, Charts, Top Decks)
exports.getOverviewStats = async (req, res) => {
  try {
    const [totalCards, totalDecks, totalUsers, formatAgg, categoryAgg, topDecks, recentUsers] = await Promise.all([
      Card.countDocuments(),
      Deck.countDocuments(),
      User.countDocuments(),
      Deck.aggregate([
        { $group: { _id: '$format', count: { $sum: 1 } } }
      ]),
      Deck.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Deck.find().sort({ likes: -1, views: -1 }).limit(5).select('name format category stats likes views is_featured').lean(),
      User.find().sort({ createdAt: -1 }).limit(5).select('username role createdAt favorites').lean()
    ]);

    // Format aggregation map
    const formatStats = {};
    formatAgg.forEach(f => {
      if (f._id) formatStats[f._id] = f.count;
    });

    const categoryStats = {};
    categoryAgg.forEach(c => {
      if (c._id) categoryStats[c._id] = c.count;
    });

    return res.json({
      success: true,
      data: {
        totalCards,
        totalDecks,
        totalUsers,
        formatStats,
        categoryStats,
        topDecks,
        recentUsers: recentUsers.map(u => ({
          id: u._id,
          username: u.username,
          role: u.role || 'user',
          favoritesCount: (u.favorites || []).length,
          createdAt: u.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('[Admin getOverviewStats error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lấy danh sách Decks dành cho Quản trị viên (có phân trang & lọc)
exports.getAdminDecks = async (req, res) => {
  try {
    const { q, format, category, page = 1, limit = 15 } = req.query;
    const query = {};

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { archetype: { $regex: q.trim(), $options: 'i' } },
        { author: { $regex: q.trim(), $options: 'i' } }
      ];
    }
    if (format) query.format = format;
    if (category) query.category = category;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [totalDecks, decks] = await Promise.all([
      Deck.countDocuments(query),
      Deck.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
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
    console.error('[Admin getAdminDecks error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Thêm mới bộ bài (Deck)
exports.createAdminDeck = async (req, res) => {
  try {
    const {
      name,
      description = '',
      category = 'Tournament Meta',
      format = 'TCG',
      archetype = '',
      author = 'Admin',
      tournament = '',
      is_featured = false,
      cover_card_name = '',
      main_deck = [],
      extra_deck = [],
      side_deck = []
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên bộ bài không được để trống' });
    }

    // Tính toán thống kê
    let monsterCount = 0;
    let spellCount = 0;
    let trapCount = 0;
    let totalPrice = 0;

    main_deck.forEach(c => {
      const qty = c.quantity || 1;
      const typeLower = (c.card_type || '').toLowerCase();
      if (typeLower.includes('spell')) spellCount += qty;
      else if (typeLower.includes('trap')) trapCount += qty;
      else monsterCount += qty;
      totalPrice += (c.price || 0) * qty;
    });

    extra_deck.forEach(c => {
      totalPrice += (c.price || 0) * (c.quantity || 1);
    });

    side_deck.forEach(c => {
      totalPrice += (c.price || 0) * (c.quantity || 1);
    });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newDeck = new Deck({
      name: name.trim(),
      slug,
      description,
      category,
      format,
      archetype: archetype.trim(),
      author: author.trim() || 'Admin',
      tournament: tournament.trim(),
      cover_card_name: cover_card_name || (main_deck[0]?.name || ''),
      cover_image_url: main_deck[0]?.image_url || '',
      cover_card_id: main_deck[0]?.card_id || null,
      main_deck,
      extra_deck,
      side_deck,
      stats: {
        main_count: main_deck.reduce((s, c) => s + (c.quantity || 1), 0),
        extra_count: extra_deck.reduce((s, c) => s + (c.quantity || 1), 0),
        side_count: side_deck.reduce((s, c) => s + (c.quantity || 1), 0),
        monster_count: monsterCount,
        spell_count: spellCount,
        trap_count: trapCount,
        total_price: Number(totalPrice.toFixed(2))
      },
      is_featured: !!is_featured
    });

    await newDeck.save();

    return res.status(201).json({
      success: true,
      message: 'Tạo bộ bài mới thành công',
      data: newDeck
    });
  } catch (error) {
    console.error('[Admin createAdminDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Cập nhật bộ bài
exports.updateAdminDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const deck = await Deck.findById(id);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ bài' });
    }

    // Nếu có cập nhật danh sách thẻ, tính lại stats
    if (updateData.main_deck || updateData.extra_deck || updateData.side_deck) {
      const main = updateData.main_deck || deck.main_deck;
      const extra = updateData.extra_deck || deck.extra_deck;
      const side = updateData.side_deck || deck.side_deck;

      let monsterCount = 0;
      let spellCount = 0;
      let trapCount = 0;
      let totalPrice = 0;

      main.forEach(c => {
        const qty = c.quantity || 1;
        const typeLower = (c.card_type || '').toLowerCase();
        if (typeLower.includes('spell')) spellCount += qty;
        else if (typeLower.includes('trap')) trapCount += qty;
        else monsterCount += qty;
        totalPrice += (c.price || 0) * qty;
      });
      extra.forEach(c => { totalPrice += (c.price || 0) * (c.quantity || 1); });
      side.forEach(c => { totalPrice += (c.price || 0) * (c.quantity || 1); });

      updateData.stats = {
        main_count: main.reduce((s, c) => s + (c.quantity || 1), 0),
        extra_count: extra.reduce((s, c) => s + (c.quantity || 1), 0),
        side_count: side.reduce((s, c) => s + (c.quantity || 1), 0),
        monster_count: monsterCount,
        spell_count: spellCount,
        trap_count: trapCount,
        total_price: Number(totalPrice.toFixed(2))
      };
    }

    if (updateData.name && updateData.name !== deck.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updated = await Deck.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();

    return res.json({
      success: true,
      message: 'Cập nhật bộ bài thành công',
      data: updated
    });
  } catch (error) {
    console.error('[Admin updateAdminDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Xóa bộ bài
exports.deleteAdminDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Deck.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bộ bài cần xóa' });
    }

    return res.json({
      success: true,
      message: `Đã xóa bộ bài "${deleted.name}" thành công`
    });
  } catch (error) {
    console.error('[Admin deleteAdminDeck error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Quản lý danh sách Thẻ bài & Giá
exports.getAdminCards = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (q && q.trim()) {
      const term = q.trim();
      const numId = Number(term);
      if (!isNaN(numId) && numId > 0) {
        query.$or = [{ id: numId }, { name: { $regex: term, $options: 'i' } }];
      } else {
        query.name = { $regex: term, $options: 'i' };
      }
    }

    if (type) query.type = type;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [totalCards, cards] = await Promise.all([
      Card.countDocuments(query),
      Card.find(query)
        .sort({ id: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    return res.json({
      success: true,
      data: cards,
      pagination: {
        totalCards,
        totalPages: Math.ceil(totalCards / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('[Admin getAdminCards error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Cập nhật giá thẻ bài
exports.updateCardPrice = async (req, res) => {
  try {
    const { id } = req.params; // card id (number)
    const { min_price, cardmarket_price, tcgplayer_price, ebay_price, amazon_price } = req.body;

    const card = await Card.findOne({ id: Number(id) });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ bài' });
    }

    if (min_price !== undefined) {
      card.min_price = Number(min_price) || 0;
    }

    const prices = card.card_prices || {};
    if (cardmarket_price !== undefined) prices.cardmarket_price = Number(cardmarket_price);
    if (tcgplayer_price !== undefined) prices.tcgplayer_price = Number(tcgplayer_price);
    if (ebay_price !== undefined) prices.ebay_price = Number(ebay_price);
    if (amazon_price !== undefined) prices.amazon_price = Number(amazon_price);
    card.card_prices = prices;
    card.price_updated_at = new Date();

    await card.save();

    return res.json({
      success: true,
      message: `Đã cập nhật giá lá bài "${card.name}" thành công`,
      data: card
    });
  } catch (error) {
    console.error('[Admin updateCardPrice error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7.1 Thêm mới lá bài (Create Card)
exports.createAdminCard = async (req, res) => {
  try {
    const {
      id,
      name,
      type = 'Normal Monster',
      frameType,
      desc = '',
      race = '',
      attribute = '',
      archetype = '',
      atk,
      def,
      level,
      min_price = 0,
      image_url = '',
      ban_tcg = 'Unlimited'
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên lá bài không được để trống' });
    }

    let cardId = Number(id);
    if (!cardId || isNaN(cardId) || cardId <= 0) {
      cardId = Math.floor(10000000 + Math.random() * 90000000);
      let exists = await Card.findOne({ id: cardId });
      while (exists) {
        cardId = Math.floor(10000000 + Math.random() * 90000000);
        exists = await Card.findOne({ id: cardId });
      }
    } else {
      const exists = await Card.findOne({ id: cardId });
      if (exists) {
        return res.status(400).json({ success: false, message: `Passcode ID #${cardId} đã tồn tại trong hệ thống` });
      }
    }

    const imgRemote = image_url && image_url.trim()
      ? image_url.trim()
      : `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`;
    const imgRemoteSmall = `https://images.ygoprodeck.com/images/cards_small/${cardId}.jpg`;

    let inferredFrame = frameType;
    if (!inferredFrame) {
      const t = (type || '').toLowerCase();
      if (t.includes('spell')) inferredFrame = 'spell';
      else if (t.includes('trap')) inferredFrame = 'trap';
      else if (t.includes('fusion')) inferredFrame = 'fusion';
      else if (t.includes('synchro')) inferredFrame = 'synchro';
      else if (t.includes('xyz')) inferredFrame = 'xyz';
      else if (t.includes('link')) inferredFrame = 'link';
      else if (t.includes('ritual')) inferredFrame = 'ritual';
      else if (t.includes('effect')) inferredFrame = 'effect';
      else inferredFrame = 'normal';
    }

    const priceNum = Math.max(0, parseFloat(min_price) || 0);

    const newCard = new Card({
      id: cardId,
      name: name.trim(),
      type,
      frameType: inferredFrame,
      desc: desc.trim(),
      race: race.trim(),
      attribute: attribute.trim(),
      archetype: archetype.trim(),
      atk: atk !== undefined && atk !== '' ? Number(atk) : undefined,
      def: def !== undefined && def !== '' ? Number(def) : undefined,
      level: level !== undefined && level !== '' ? Number(level) : undefined,
      min_price: priceNum,
      card_prices: {
        tcgplayer_price: priceNum,
        cardmarket_price: priceNum,
        ebay_price: 0,
        amazon_price: 0,
        coolstuffinc_price: 0
      },
      card_images: [{
        id: cardId,
        image_url: imgRemote,
        image_url_small: imgRemoteSmall,
        local_image: `/images/cards/${cardId}.jpg`,
        local_image_small: `/images/cards/${cardId}_small.jpg`
      }],
      card_sets: [],
      banlist_info: {
        ban_tcg: ban_tcg || 'Unlimited',
        ban_ocg: ban_tcg || 'Unlimited',
        ban_goat: 'Unlimited'
      },
      price_updated_at: new Date()
    });

    await newCard.save();

    return res.status(201).json({
      success: true,
      message: `Đã thêm mới lá bài "${newCard.name}" (#${newCard.id}) thành công!`,
      data: newCard
    });
  } catch (error) {
    console.error('[Admin createAdminCard error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7.2 Cập nhật toàn diện thông tin thẻ bài
exports.updateAdminCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      race,
      attribute,
      archetype,
      atk,
      def,
      level,
      desc,
      min_price,
      image_url,
      ban_tcg
    } = req.body;

    const card = await Card.findOne({ id: Number(id) });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ bài' });
    }

    if (name) card.name = name.trim();
    if (type) card.type = type;
    if (race !== undefined) card.race = race.trim();
    if (attribute !== undefined) card.attribute = attribute.trim();
    if (archetype !== undefined) card.archetype = archetype.trim();
    if (desc !== undefined) card.desc = desc.trim();
    if (atk !== undefined) card.atk = atk !== '' ? Number(atk) : undefined;
    if (def !== undefined) card.def = def !== '' ? Number(def) : undefined;
    if (level !== undefined) card.level = level !== '' ? Number(level) : undefined;
    if (min_price !== undefined) {
      card.min_price = Math.max(0, parseFloat(min_price) || 0);
      if (card.card_prices) {
        card.card_prices.tcgplayer_price = card.min_price;
      }
      card.price_updated_at = new Date();
    }
    if (ban_tcg) {
      if (!card.banlist_info) card.banlist_info = {};
      card.banlist_info.ban_tcg = ban_tcg;
    }
    if (image_url && image_url.trim()) {
      if (card.card_images && card.card_images.length > 0) {
        card.card_images[0].image_url = image_url.trim();
      } else {
        card.card_images = [{
          id: card.id,
          image_url: image_url.trim(),
          image_url_small: image_url.trim()
        }];
      }
    }

    await card.save();

    return res.json({
      success: true,
      message: `Đã cập nhật thông tin lá bài "${card.name}" thành công!`,
      data: card
    });
  } catch (error) {
    console.error('[Admin updateAdminCard error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7.3 Xóa thẻ bài khỏi cơ sở dữ liệu
exports.deleteAdminCard = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Card.findOneAndDelete({ id: Number(id) });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ bài để xóa' });
    }

    return res.json({
      success: true,
      message: `Đã xóa lá bài "${deleted.name}" (#${deleted.id}) khỏi cơ sở dữ liệu.`
    });
  } catch (error) {
    console.error('[Admin deleteAdminCard error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Quản lý danh sách Tài khoản Người dùng
exports.getAdminUsers = async (req, res) => {
  try {
    const { q, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (q && q.trim()) {
      query.username = { $regex: q.trim(), $options: 'i' };
    }
    if (role) query.role = role;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    const formattedUsers = users.map(u => ({
      id: u._id,
      username: u.username,
      role: u.role || 'user',
      favoritesCount: (u.favorites || []).length,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    return res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('[Admin getAdminUsers error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Đổi Role người dùng (user <-> admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role không hợp lệ' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: `Đã đổi quyền của "${user.username}" thành ${role}`,
      data: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('[Admin updateUserRole error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Không cho phép xóa tài khoản admin cuối cùng
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Admin duy nhất trong hệ thống' });
      }
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: `Đã xóa tài khoản "${user.username}" thành công`
    });
  } catch (error) {
    console.error('[Admin deleteUser error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
