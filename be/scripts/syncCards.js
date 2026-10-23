const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Card = require('../models/Card');
const connectDB = require('../config/db');

const IMAGES_DIR = path.join(__dirname, '../public/images/cards');

// Đảm bảo thư mục public/images/cards tồn tại
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Hàm tính giá nhỏ nhất hợp lệ (> 0)
function calculateMinPrice(prices) {
  if (!prices) return 0;
  const values = [
    parseFloat(prices.cardmarket_price) || 0,
    parseFloat(prices.tcgplayer_price) || 0,
    parseFloat(prices.ebay_price) || 0,
    parseFloat(prices.amazon_price) || 0,
    parseFloat(prices.coolstuffinc_price) || 0
  ].filter(p => p > 0);

  return values.length > 0 ? Math.min(...values) : 0;
}

// Hàm tải ảnh an toàn với timeout và retry
async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) {
    return true; // Đã có rồi thì bỏ qua
  }
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 10000
    });
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destPath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => {
        fs.unlink(destPath, () => {}); // xóa file hỏng nếu có
        reject(err);
      });
    });
  } catch (error) {
    return false;
  }
}

async function syncCardData(options = { downloadImages: false, imageLimit: 100 }) {
  await connectDB();
  console.log('[Sync] Đang tải danh sách thẻ từ YGOPRODeck API v7...');

  try {
    const res = await axios.get('https://db.ygoprodeck.com/api/v7/cardinfo.php', {
      timeout: 60000
    });

    const cardsData = res.data.data;
    console.log(`[Sync] Đã nhận ${cardsData.length} thẻ từ YGOPRODeck. Đang xử lý vào MongoDB...`);

    const bulkOps = [];
    const now = new Date();

    for (const card of cardsData) {
      const priceObj = card.card_prices && card.card_prices[0] ? {
        cardmarket_price: parseFloat(card.card_prices[0].cardmarket_price) || 0,
        tcgplayer_price: parseFloat(card.card_prices[0].tcgplayer_price) || 0,
        ebay_price: parseFloat(card.card_prices[0].ebay_price) || 0,
        amazon_price: parseFloat(card.card_prices[0].amazon_price) || 0,
        coolstuffinc_price: parseFloat(card.card_prices[0].coolstuffinc_price) || 0
      } : {
        cardmarket_price: 0,
        tcgplayer_price: 0,
        ebay_price: 0,
        amazon_price: 0,
        coolstuffinc_price: 0
      };

      const minPrice = calculateMinPrice(priceObj);

      const processedImages = (card.card_images || []).map(img => ({
        id: img.id,
        image_url: img.image_url,
        image_url_small: img.image_url_small,
        image_url_cropped: img.image_url_cropped,
        local_image: `/images/cards/${img.id}.jpg`,
        local_image_small: `/images/cards/${img.id}_small.jpg`
      }));

      const processedSets = (card.card_sets || []).map(s => ({
        set_name: s.set_name,
        set_code: s.set_code,
        set_rarity: s.set_rarity,
        set_rarity_code: s.set_rarity_code,
        set_price: parseFloat(s.set_price) || 0
      }));

      const cardDoc = {
        id: card.id,
        name: card.name,
        type: card.type,
        frameType: card.frameType,
        desc: card.desc,
        race: card.race,
        attribute: card.attribute,
        archetype: card.archetype,
        atk: card.atk,
        def: card.def,
        level: card.level,
        scale: card.scale,
        linkval: card.linkval,
        linkmarkers: card.linkmarkers,
        card_images: processedImages,
        card_sets: processedSets,
        card_prices: priceObj,
        min_price: minPrice,
        banlist_info: card.banlist_info || {
          ban_tcg: 'Unlimited',
          ban_ocg: 'Unlimited',
          ban_goat: 'Unlimited'
        },
        price_updated_at: now
      };

      bulkOps.push({
        updateOne: {
          filter: { id: card.id },
          update: { $set: cardDoc },
          upsert: true
        }
      });
    }

    // Chia thành các đợt 1000 cards để bulkWrite hiệu quả
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < bulkOps.length; i += CHUNK_SIZE) {
      const chunk = bulkOps.slice(i, i + CHUNK_SIZE);
      await Card.bulkWrite(chunk);
      console.log(`[Sync] Đã lưu ${Math.min(i + CHUNK_SIZE, bulkOps.length)} / ${bulkOps.length} thẻ...`);
    }

    console.log('[Sync] Hoàn tất đồng bộ dữ liệu thẻ vào MongoDB thành công!');

    if (options.downloadImages) {
      console.log(`[Sync] Bắt đầu tải ảnh cho ${options.imageLimit || 'tất cả'} thẻ...`);
      let count = 0;
      for (const card of cardsData) {
        if (options.imageLimit && count >= options.imageLimit) break;
        if (card.card_images && card.card_images[0]) {
          const img = card.card_images[0];
          const smallDest = path.join(IMAGES_DIR, `${img.id}_small.jpg`);
          const fullDest = path.join(IMAGES_DIR, `${img.id}.jpg`);

          await downloadImage(img.image_url_small, smallDest);
          await downloadImage(img.image_url, fullDest);
          count++;
          if (count % 20 === 0) {
            console.log(`[Images] Đã tải ảnh cho ${count} thẻ...`);
            // Sleep 500ms để tuân thủ rate limit API
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }
      console.log(`[Sync] Đã tải xong ảnh mẫu cho ${count} thẻ!`);
    }

  } catch (error) {
    console.error('[Sync Error]', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('[Sync] Đóng kết nối MongoDB.');
  }
}

// Nếu gọi trực tiếp từ dòng lệnh
if (require.main === module) {
  // Mặc định tải metadata và tải mẫu trước 150 ảnh thẻ đầu tiên để test mượt mà
  syncCardData({ downloadImages: true, imageLimit: 150 });
}

module.exports = { syncCardData, downloadImage };
