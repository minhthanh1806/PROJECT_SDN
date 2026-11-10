const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Áp dụng middleware kiểm tra quyền Admin cho toàn bộ các route quản trị
router.use(requireAdmin);

// 1. Thống kê tổng quan Dashboard
router.get('/stats', adminController.getOverviewStats);

// 2. Quản lý Decks (CRUD)
router.get('/decks', adminController.getAdminDecks);
router.post('/decks', adminController.createAdminDeck);
router.put('/decks/:id', adminController.updateAdminDeck);
router.delete('/decks/:id', adminController.deleteAdminDeck);

// 3. Quản lý Thẻ bài & Giá (CRUD)
router.get('/cards', adminController.getAdminCards);
router.post('/cards', adminController.createAdminCard);
router.put('/cards/:id', adminController.updateAdminCard);
router.put('/cards/:id/price', adminController.updateCardPrice);
router.delete('/cards/:id', adminController.deleteAdminCard);

// 4. Quản lý Người dùng
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
