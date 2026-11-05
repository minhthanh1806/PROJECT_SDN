const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

// Lấy danh sách metadata cho trang Decks (categories, formats, archetypes)
router.get('/meta', deckController.getDeckMeta);

// Lấy danh sách Decks (tìm kiếm, lọc category, format, khoảng giá, phân trang)
router.get('/', deckController.getDecks);

// Lấy chi tiết một Deck theo ID hoặc Slug
router.get('/:id', deckController.getDeckById);

// Thả tim/Like cho deck
router.post('/:id/like', deckController.likeDeck);

module.exports = router;
