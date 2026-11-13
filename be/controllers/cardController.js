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

// Dịch văn bản tiếng Anh sang tiếng Việt
async function translateToVietnamese(text) {
  if (!text || !text.trim()) return '';

  // Thử Google Translate endpoint 1
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data.join('\n');
      }
      if (typeof response.data === 'string' && response.data.trim()) {
        return response.data;
      }
    }
  } catch (err1) {
    console.warn('[Translate Provider 1 failed, trying Provider 2]:', err1.message);
  }

  // 2. Thử Provider 2: api.mymemory.translated.net
  try {
    const cleanText = text.substring(0, 500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|vi`;
    const response = await axios.get(url, { timeout: 8000 });
    const trans = response.data?.responseData?.translatedText;
    if (trans && typeof trans === 'string' && trans.trim()) {
      return trans;
    }
  } catch (err2) {
    console.warn('[Translate Provider 2 failed, trying Provider 3]:', err2.message);
  }

  // 3. Thử Provider 3: translate.googleapis.com (gtx)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (response.data && Array.isArray(response.data[0])) {
      return response.data[0].map((item) => item[0]).join('');
    }
  } catch (err3) {
    console.warn('[Translate Provider 3 failed, using dictionary fallback]:', err3.message);
  }

  // 4. Fallback cuối cùng: Từ điển thuật ngữ Yu-Gi-Oh để luôn trả về bản dịch dễ hiểu
  let fallback = text;
  const glossary = [
    [/When this card is Normal Summoned/gi, 'Khi lá bài này được Triệu hồi Thường'],
    [/If this card is Normal or Special Summoned/gi, 'Nếu lá bài này được Triệu hồi Thường hoặc Triệu hồi Đặc biệt'],
    [/Special Summon this card/gi, 'Triệu hồi Đặc biệt lá bài này'],
    [/Special Summon/gi, 'Triệu hồi Đặc biệt'],
    [/Normal Summon\/Set/gi, 'Triệu hồi Thường/Úp'],
    [/Normal Summon/gi, 'Triệu hồi Thường'],
    [/from your hand or GY/gi, 'từ trên tay hoặc Mộ (GY)'],
    [/from your Deck to your hand/gi, 'từ Bộ bài vào tay của bạn'],
    [/from your Deck/gi, 'từ Bộ bài'],
    [/from your hand/gi, 'từ trên tay'],
    [/to the GY/gi, 'vào Mộ (GY)'],
    [/in your GY/gi, 'trong Mộ (GY) của bạn'],
    [/Quick Effect/gi, 'Hiệu ứng Nhanh (Quick Effect)'],
    [/You can target/gi, 'Bạn có thể chọn mục tiêu'],
    [/Once per turn/gi, 'Mỗi lượt một lần'],
    [/destroy that card/gi, 'phá hủy lá bài đó'],
    [/destroy it/gi, 'phá hủy nó'],
    [/negate the activation/gi, 'phủ nhận kích hoạt'],
    [/negate its effects/gi, 'vô hiệu hóa hiệu ứng của nó'],
    [/banish it/gi, 'trục xuất lá bài đó'],
    [/Ritual Summon/gi, 'Triệu hồi Nghi thức (Ritual Summon)'],
    [/Synchro Summon/gi, 'Triệu hồi Đồng bộ (Synchro Summon)'],
    [/Xyz Summon/gi, 'Triệu hồi Xyz'],
    [/Link Summon/gi, 'Triệu hồi Link'],
    [/tribute/gi, 'hiến tế'],
    [/opponent controls/gi, 'đối thủ điều khiển'],
    [/Spell\/Trap/gi, 'Phép/Bẫy'],
    [/Spell Card/gi, 'Lá Phép'],
    [/Trap Card/gi, 'Lá Bẫy'],
    [/Monster Card/gi, 'Quái thú']
  ];
  glossary.forEach(([pattern, replacement]) => {
    fallback = fallback.replace(pattern, replacement);
  });
  return fallback;
}

// API Dịch hiệu ứng lá bài sang tiếng Việt (hoặc lấy bản dịch đã cache trong DB)
exports.translateCardEffect = async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true' || req.body?.force === true;

    const card = await Card.findOne({ id: Number(id) });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thẻ bài' });
    }

    // Nếu đã có bản dịch và không yêu cầu ép dịch lại
    if (card.desc_vi && card.desc_vi.trim() !== '' && !force) {
      return res.json({
        success: true,
        desc_vi: card.desc_vi,
        from_cache: true
      });
    }

    if (!card.desc || !card.desc.trim()) {
      return res.json({
        success: true,
        desc_vi: 'Lá bài này không có mô tả hoặc hiệu ứng.',
        from_cache: true
      });
    }

    const translated = await translateToVietnamese(card.desc);

    if (translated && translated.trim()) {
      card.desc_vi = translated;
      await card.save();
    }

    return res.json({
      success: true,
      desc_vi: translated || card.desc,
      from_cache: false
    });
  } catch (error) {
    console.error('[translateCardEffect error]', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể dịch hiệu ứng thẻ bài vào lúc này: ' + error.message
    });
  }
};

// Đọc dữ liệu lịch sử Banlist chính thức từ YGOPRODeck (TCG, OCG, Master Duel)
const allBanlistsPath = path.join(__dirname, '../data/ygoprodeck_all_banlists.json');
let ALL_BANLISTS = { TCG: {}, OCG: {}, 'Master Duel': {} };

try {
  if (fs.existsSync(allBanlistsPath)) {
    ALL_BANLISTS = JSON.parse(fs.readFileSync(allBanlistsPath, 'utf8'));
  }
} catch (err) {
  console.error('[Load ygoprodeck_all_banlists.json error]', err);
}

// Lấy danh sách các lá bài thuộc Banlist hỗ trợ cả 3 format: TCG, OCG, Master Duel
// Hỗ trợ gom nhóm (format=grouped), lọc format (ban_format=TCG|OCG|Master Duel), lọc tháng (month=YYYY-MM) và chế độ xem (mode=changes | full)
exports.getSampleBannedCards = async (req, res) => {
  try {
    const { format, date, month, mode = 'changes', ban_format = 'TCG' } = req.query;

    // Chuẩn hóa tên format: 'TCG', 'OCG', 'Master Duel'
    let selectedBanFormat = 'TCG';
    const bfUpper = (ban_format || '').trim().toUpperCase();
    if (bfUpper === 'OCG') selectedBanFormat = 'OCG';
    else if (bfUpper === 'MASTER DUEL' || bfUpper === 'MASTER_DUEL' || bfUpper === 'MD') selectedBanFormat = 'Master Duel';

    const currentFormatData = ALL_BANLISTS[selectedBanFormat] || {};

    const targetMonth = month ? month.trim() : (date && date.trim().length === 7 ? date.trim() : null);
    const targetDate = !targetMonth && date && date.trim() !== '' ? date.trim() : null;

    // Tạo danh sách monthSummaries chuẩn xác cho format được chọn
    const monthSummaries = Object.values(currentFormatData)
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

    // Nếu chọn một tháng cụ thể trong dữ liệu chính thức YGOPRODeck
    const effectiveMonth = targetMonth || (targetDate ? targetDate.slice(0, 7) : null);
    if (effectiveMonth && currentFormatData[effectiveMonth]) {
      const mData = currentFormatData[effectiveMonth];
      const sourceEntries = mode === 'full' ? mData.fullCards : mData.changedCards;
      const entryMap = new Map(sourceEntries.map(e => [Number(e.id), e]));
      const cardIds = Array.from(entryMap.keys());

      const dbCards = await Card.find({ id: { $in: cardIds } }).sort({ name: 1 }).lean();

      // Gắn đúng trạng thái ban, prev_ban_status và ban_date tại thời điểm tháng đó
      const enrichedCards = dbCards.map(card => {
        const entry = entryMap.get(Number(card.id));
        return {
          ...card,
          ban_date: `${mData.date}T00:00:00.000Z`,
          prev_ban_status: entry.prevStatus,
          is_ban_change: entry.isChange,
          ban_format: selectedBanFormat,
          banlist_info: {
            ...(card.banlist_info || {}),
            ban_status: entry.status,
            ban_tcg: entry.status // Đảm bảo tương thích ngược
          }
        };
      });

      if (format === 'grouped') {
        const forbidden = enrichedCards.filter(c => c.banlist_info.ban_status === 'Forbidden');
        const limited = enrichedCards.filter(c => c.banlist_info.ban_status === 'Limited');
        const semiLimited = enrichedCards.filter(c => c.banlist_info.ban_status === 'Semi-Limited');

        return res.json({
          success: true,
          data: {
            ban_format: selectedBanFormat,
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
        ban_format: selectedBanFormat,
        totalCount: enrichedCards.length
      });
    }

    // Mặc định: Xem toàn bộ banlist hiện hành của format đó
    // Xác định trường query theo format
    let queryField = 'banlist_info.ban_tcg';
    if (selectedBanFormat === 'OCG') queryField = 'banlist_info.ban_ocg';
    else if (selectedBanFormat === 'Master Duel') queryField = 'banlist_info.ban_master_duel';

    let baseQuery = {
      [queryField]: { $in: ['Forbidden', 'Limited', 'Semi-Limited'] }
    };

    // Nếu format là Master Duel mà db chưa có ban_master_duel trực tiếp, lấy snapshot tháng mới nhất của MD
    if (selectedBanFormat === 'Master Duel' && Object.keys(currentFormatData).length > 0) {
      const latestMonthKey = Object.keys(currentFormatData).sort().pop();
      const latestMD = currentFormatData[latestMonthKey];
      const entryMap = new Map((latestMD.fullCards || []).map(e => [Number(e.id), e]));
      const cardIds = Array.from(entryMap.keys());
      const dbCards = await Card.find({ id: { $in: cardIds } }).sort({ name: 1 }).lean();

      const enrichedCards = dbCards.map(card => {
        const entry = entryMap.get(Number(card.id));
        return {
          ...card,
          ban_format: 'Master Duel',
          banlist_info: {
            ...(card.banlist_info || {}),
            ban_status: entry?.status || 'Limited',
            ban_tcg: entry?.status || 'Limited'
          }
        };
      });

      if (format === 'grouped') {
        const forbidden = enrichedCards.filter(c => c.banlist_info.ban_status === 'Forbidden');
        const limited = enrichedCards.filter(c => c.banlist_info.ban_status === 'Limited');
        const semiLimited = enrichedCards.filter(c => c.banlist_info.ban_status === 'Semi-Limited');

        return res.json({
          success: true,
          data: {
            ban_format: 'Master Duel',
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
        ban_format: 'Master Duel',
        totalCount: enrichedCards.length
      });
    }

    if (effectiveMonth === 'pre-2022' || effectiveMonth === '2021-01') {
      baseQuery.ban_date = { $lte: new Date('2021-12-31T23:59:59.999Z') };
    }

    if (format === 'grouped') {
      const [forbidden, limited, semiLimited] = await Promise.all([
        Card.find({ ...baseQuery, [queryField]: 'Forbidden' }).sort({ name: 1 }).lean(),
        Card.find({ ...baseQuery, [queryField]: 'Limited' }).sort({ name: 1 }).lean(),
        Card.find({ ...baseQuery, [queryField]: 'Semi-Limited' }).sort({ name: 1 }).lean()
      ]);

      const mapBanStatus = (cards, status) => cards.map(c => ({
        ...c,
        ban_format: selectedBanFormat,
        banlist_info: {
          ...(c.banlist_info || {}),
          ban_status: status,
          ban_tcg: status
        }
      }));

      const fCards = mapBanStatus(forbidden, 'Forbidden');
      const lCards = mapBanStatus(limited, 'Limited');
      const sCards = mapBanStatus(semiLimited, 'Semi-Limited');

      return res.json({
        success: true,
        data: {
          ban_format: selectedBanFormat,
          forbidden: fCards,
          limited: lCards,
          semiLimited: sCards,
          monthSummaries,
          availableMonths: monthSummaries.map(s => s.month),
          availableDates: monthSummaries.map(s => s.dates[0]),
          stats: {
            forbiddenCount: fCards.length,
            limitedCount: lCards.length,
            semiLimitedCount: sCards.length,
            totalCount: fCards.length + lCards.length + sCards.length
          }
        }
      });
    }

    const cards = await Card.find(baseQuery).sort({ name: 1 }).lean();
    return res.json({
      success: true,
      data: cards,
      ban_format: selectedBanFormat,
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

    writer.on('error', (err) => {
      console.error('[serveCardImage write error]', err);
      res.status(500).send('Error saving image');
    });

  } catch (err) {
    res.status(404).send('Image not available');
  }
};
