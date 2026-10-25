const Card = require('../models/Card');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Lấy danh sách thẻ có phân trang, tìm kiếm, lọc và sắp xếp
exports.getCards = async (req, res) => {
  try {
    const {
      fname,
      type,
      attribute,
      race,
      level,
      atk_min,
      atk_max,
      def_min,
      def_max,
      archetype,
      cardset,
      banlist,
      sort,
      page = 1,
      limit = 30
    } = req.query;

    const query = {};

    // 1. Tìm gần đúng theo tên
    if (fname && fname.trim() !== '') {
      query.name = { $regex: fname.trim(), $options: 'i' };
    }

    // 2. Bộ lọc
    if (type && type.trim() !== '') {
      query.type = type.trim();
    }
    if (attribute) {
      query.attribute = attribute;
    }
    if (race) {
      query.race = race;
    }
    if (level) {
      query.level = Number(level);
    }
    if (archetype) {
      query.archetype = archetype;
    }
    if (cardset) {
      query['card_sets.set_code'] = { $regex: cardset, $options: 'i' };
    }
    if (banlist) {
      query['banlist_info.ban_tcg'] = banlist;
    }

    // ATK / DEF range
    const hasAtkMin = atk_min !== undefined && atk_min !== '';
    const hasAtkMax = atk_max !== undefined && atk_max !== '';
    if (hasAtkMin || hasAtkMax) {
      query.atk = {};
      if (hasAtkMin) query.atk.$gte = Number(atk_min);
      if (hasAtkMax) query.atk.$lte = Number(atk_max);
    }

    const hasDefMin = def_min !== undefined && def_min !== '';
    const hasDefMax = def_max !== undefined && def_max !== '';
    if (hasDefMin || hasDefMax) {
      query.def = {};
      if (hasDefMin) query.def.$gte = Number(def_min);
      if (hasDefMax) query.def.$lte = Number(def_max);
    }

    // 3. Sắp xếp
    let sortOptions = { name: 1 }; // Mặc định sắp theo tên A-Z
    switch (sort) {
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'atk':
      case 'atk_desc':
        sortOptions = { atk: -1 };
        break;
      case 'def':
      case 'def_desc':
        sortOptions = { def: -1 };
        break;
      case 'level':
      case 'level_desc':
        sortOptions = { level: -1 };
        break;
      case 'price_asc':
        sortOptions = { min_price: 1 };
        break;
      case 'price_desc':
        sortOptions = { min_price: -1 };
        break;
      case 'new':
        sortOptions = { id: -1 };
        break;
      default:
        sortOptions = { name: 1 };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [totalCards, cards] = await Promise.all([
      Card.countDocuments(query),
      Card.find(query)
        .sort(sortOptions)
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
    console.error('[getCards error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết một thẻ bài qua ID
exports.getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findOne({ id: Number(id) }).lean();

    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ bài' });
    }

    return res.json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('[getCardById error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách metadata cho bộ lọc (types, attributes, races, archetypes)
exports.getFilterOptions = async (req, res) => {
  try {
    const [types, attributes, races] = await Promise.all([
      Card.distinct('type'),
      Card.distinct('attribute'),
      Card.distinct('race')
    ]);

    return res.json({
      success: true,
      data: {
        types: types.filter(Boolean).sort(),
        attributes: attributes.filter(Boolean).sort(),
        races: races.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error('[getFilterOptions error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thẻ bài theo mã bộ thẻ (set_code)
exports.getCardsBySet = async (req, res) => {
  try {
    const { setCode } = req.params;
    const cards = await Card.find({
      'card_sets.set_code': { $regex: `^${setCode}`, $options: 'i' }
    }).lean();

    return res.json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    console.error('[getCardsBySet error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware/Handler on-demand fallback cho ảnh thẻ bài:
// Nếu ảnh cục bộ chưa có, tải về lưu vào máy chủ rồi trả về cho client!
exports.serveCardImage = async (req, res) => {
  try {
    const { filename } = req.params; // vd: 12345678.jpg hoặc 12345678_small.jpg
    const isSmall = filename.includes('_small');
    const cardId = filename.replace('_small', '').replace('.jpg', '');
    const localPath = path.join(__dirname, '../public/images/cards', filename);

    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }

    // Nếu chưa tải về máy chủ, tìm link gốc của thẻ để tải ngay và lưu
    const card = await Card.findOne({ id: Number(cardId) }).lean();
    if (!card || !card.card_images || !card.card_images[0]) {
      return res.status(404).send('Not Found');
    }

    const remoteUrl = isSmall 
      ? card.card_images[0].image_url_small 
      : card.card_images[0].image_url;

    if (!remoteUrl) return res.status(404).send('Not Found');

    const response = await axios({
      method: 'GET',
      url: remoteUrl,
      responseType: 'stream',
      timeout: 10000
    });

    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      res.sendFile(localPath);
    });

    writer.on('error', () => {
      res.status(500).send('Error saving image');
    });

  } catch (err) {
    res.status(404).send('Image not available');
  }
};
