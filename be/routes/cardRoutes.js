const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Lấy danh sách thẻ bài (tìm kiếm, lọc, phân trang, sắp xếp)
router.get('/', cardController.getCards);

// Lấy danh sách 40 lá mẫu đặc trưng thuộc Banlist (Forbidden, Limited, Semi-Limited)
router.get('/sample/banned', cardController.getSampleBannedCards);

// Lấy danh sách các giá trị để hiển thị bộ lọc (types, attributes, races)
router.get('/meta/filters', cardController.getFilterOptions);

// Lấy danh sách thẻ theo bộ thẻ (set)
router.get('/set/:setCode', cardController.getCardsBySet);

// Lấy chi tiết một thẻ bài theo ID
router.get('/:id', cardController.getCardById);

module.exports = router;
