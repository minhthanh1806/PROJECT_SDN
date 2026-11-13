const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');
const { requireAuth } = require('../middleware/authMiddleware');

// Lấy danh sách metadata cho trang Decks (categories, formats, archetypes)
router.get('/meta', deckController.getDeckMeta);

// Lấy danh sách Decks của người dùng đang đăng nhập
router.get('/my-decks', requireAuth, deckController.getUserDecks);

// Người dùng tạo mới bộ bài cá nhân (Deck Builder)
router.post('/', requireAuth, deckController.createUserDeck);

// Người dùng cập nhật bộ bài cá nhân
router.put('/:id', requireAuth, deckController.updateUserDeck);

// Người dùng xóa bộ bài cá nhân
router.delete('/:id', requireAuth, deckController.deleteUserDeck);

// Lấy danh sách Decks chung (tìm kiếm, lọc category, format, khoảng giá, phân trang)
router.get('/', deckController.getDecks);

// Lấy chi tiết một Deck theo ID hoặc Slug
router.get('/:id', deckController.getDeckById);

// Thả tim/Like cho deck
router.post('/:id/like', deckController.likeDeck);

module.exports = router;
