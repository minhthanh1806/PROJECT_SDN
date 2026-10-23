const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const cardRoutes = require('./routes/cardRoutes');
const { serveCardImage } = require('./controllers/cardController');
const { syncCardData } = require('./scripts/syncCards');

const app = express();

// 1. Kết nối MongoDB
connectDB();

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Phục vụ ảnh thẻ tự host (có fallback on-demand tự động tải và cache nếu chưa có)
app.use('/images/cards', express.static(path.join(__dirname, 'public/images/cards')));
app.get('/images/cards/:filename', serveCardImage);

// 4. API Routes
app.use('/api/cards', cardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Yu-Gi-Oh Card Market API is running',
    timestamp: new Date()
  });
});

// 5. Lịch cập nhật dữ liệu tự động hằng ngày lúc 00:00 (nửa đêm)
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron Job] Bắt đầu tự động cập nhật giá thẻ hàng ngày từ YGOPRODeck...');
  try {
    await syncCardData({ downloadImages: false });
    console.log('[Cron Job] Hoàn tất cập nhật giá thẻ!');
  } catch (err) {
    console.error('[Cron Job Error]', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Đang chạy tại http://localhost:${PORT}`);
});
