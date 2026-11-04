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
      if (banlist === 'Banned') {
        // Lấy tất cả các thẻ bị cấm hoặc giới hạn (Forbidden, Limited, Semi-Limited)
        query['banlist_info.ban_tcg'] = { $in: ['Forbidden', 'Limited', 'Semi-Limited'] };
      } else {
        query['banlist_info.ban_tcg'] = banlist;
      }
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

// Đọc dữ liệu lịch sử Banlist TCG chính thức từ YGOPRODeck (2022 - 2026)
const ygoprodeckBanlistPath = path.join(__dirname, '../data/ygoprodeck_tcg_banlists.json');
let YGOPRODECK_BANLISTS = {};
try {
  if (fs.existsSync(ygoprodeckBanlistPath)) {
    YGOPRODECK_BANLISTS = JSON.parse(fs.readFileSync(ygoprodeckBanlistPath, 'utf8'));
  }
} catch (err) {
  console.error('[Load ygoprodeck_tcg_banlists.json error]', err);
}

// Lấy toàn bộ danh sách các lá bài thuộc Banlist (chuẩn YGOPRODeck API)
// Hỗ trợ gom nhóm (format=grouped), lọc theo tháng (month=YYYY-MM) và chế độ xem (mode=changes | full)
exports.getSampleBannedCards = async (req, res) => {
  try {
    const { format, date, month, mode = 'changes' } = req.query;

    const targetMonth = month ? month.trim() : (date && date.trim().length === 7 ? date.trim() : null);
    const targetDate = !targetMonth && date && date.trim() !== '' ? date.trim() : null;

    // Tạo danh sách monthSummaries chuẩn xác từ YGOPRODeck (2022 -> 2026)
    const monthSummaries = Object.values(YGOPRODECK_BANLISTS)
      .sort((a, b) => b.month.localeCompare(a.month))
      .map(m => ({
        month: m.month,
        label: `Tháng ${String(m.monthNum).padStart(2, '0')}/${m.year}`,
        year: m.year,
        monthNum: m.monthNum,
        dates: [m.date],
        totalCount: mode === 'full' ? m.fullStats.totalCount : m.changeStats.totalCount,
        forbiddenCount: mode === 'full' ? m.fullStats.forbiddenCount : m.changeStats.forbiddenCount,
        limitedCount: mode === 'full' ? m.fullStats.limitedCount : m.changeStats.limitedCount,
        semiLimitedCount: mode === 'full' ? m.fullStats.semiLimitedCount : m.changeStats.semiLimitedCount,
        changeStats: m.changeStats,
        fullStats: m.fullStats
      }));

    // Nếu chọn một tháng cụ thể trong dữ liệu chính thức YGOPRODeck (2022 - 2026)
    const effectiveMonth = targetMonth || (targetDate ? targetDate.slice(0, 7) : null);
    if (effectiveMonth && YGOPRODECK_BANLISTS[effectiveMonth]) {
      const mData = YGOPRODECK_BANLISTS[effectiveMonth];
      const sourceEntries = mode === 'full' ? mData.fullCards : mData.changedCards;
      const entryMap = new Map(sourceEntries.map(e => [Number(e.id), e]));
      const cardIds = Array.from(entryMap.keys());

      const dbCards = await Card.find({ id: { $in: cardIds } }).sort({ name: 1 }).lean();

      // Gắn đúng trạng thái ban_tcg, prev_ban_status và ban_date tại thời điểm tháng đó
      const enrichedCards = dbCards.map(card => {
        const entry = entryMap.get(Number(card.id));
        return {
          ...card,
          ban_date: `${mData.date}T00:00:00.000Z`,
          prev_ban_status: entry.prevStatus,
          is_ban_change: entry.isChange,
          banlist_info: {
            ...(card.banlist_info || {}),
            ban_tcg: entry.status
          }
        };
      });

      if (format === 'grouped') {
        const forbidden = enrichedCards.filter(c => c.banlist_info.ban_tcg === 'Forbidden');
        const limited = enrichedCards.filter(c => c.banlist_info.ban_tcg === 'Limited');
        const semiLimited = enrichedCards.filter(c => c.banlist_info.ban_tcg === 'Semi-Limited');

        return res.json({
          success: true,
          data: {
            forbidden,
            limited,
            semiLimited,
            monthSummaries,
            availableMonths: monthSummaries.map(s => s.month),
            availableDates: monthSummaries.map(s => s.dates[0]),
            stats: {
              forbiddenCount: forbidden.length,
              limitedCount: limited.length,
              semiLimitedCount: semiLimited.length,
              totalCount: enrichedCards.length
            }
          }
        });
      }

      return res.json({
        success: true,
        data: enrichedCards,
        totalCount: enrichedCards.length
      });
    }

    // Mặc định (Xem toàn bộ 253 lá bài trong Banlist hiện hành hoặc lọc pre-2022)
    const baseQuery = {
      'banlist_info.ban_tcg': { $in: ['Forbidden', 'Limited', 'Semi-Limited'] }
    };

    if (effectiveMonth === 'pre-2022' || effectiveMonth === '2021-01') {
      baseQuery.ban_date = { $lte: new Date('2021-12-31T23:59:59.999Z') };
    }

    if (format === 'grouped') {
      const [forbidden, limited, semiLimited] = await Promise.all([
        Card.find({ ...baseQuery, 'banlist_info.ban_tcg': 'Forbidden' }).sort({ name: 1 }).lean(),
        Card.find({ ...baseQuery, 'banlist_info.ban_tcg': 'Limited' }).sort({ name: 1 }).lean(),
        Card.find({ ...baseQuery, 'banlist_info.ban_tcg': 'Semi-Limited' }).sort({ name: 1 }).lean()
      ]);

      return res.json({
        success: true,
        data: {
          forbidden,
          limited,
          semiLimited,
          monthSummaries,
          availableMonths: monthSummaries.map(s => s.month),
          availableDates: monthSummaries.map(s => s.dates[0]),
          stats: {
            forbiddenCount: forbidden.length,
            limitedCount: limited.length,
            semiLimitedCount: semiLimited.length,
            totalCount: forbidden.length + limited.length + semiLimited.length
          }
        }
      });
    }

    const cards = await Card.find(baseQuery)
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      data: cards,
      totalCount: cards.length
    });
  } catch (error) {
    console.error('[getSampleBannedCards error]', error);
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
