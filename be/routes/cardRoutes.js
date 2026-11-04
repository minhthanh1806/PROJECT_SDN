const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Lấy danh sách thẻ bài (tìm kiếm, lọc, phân trang, sắp xếp)
router.get('/', cardController.getCards);

// Lấy danh sách thẻ bài thuộc Banlist (Forbidden, Limited, Semi-Limited)
router.get('/sample/banned', cardController.getSampleBannedCards);

// Lấy chi tiết một thẻ bài theo ID
router.get('/:id', cardController.getCardById);

module.exports = router;
