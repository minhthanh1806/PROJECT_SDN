const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy thông tin cá nhân (Profile) kèm bộ sưu tập
router.get('/profile/:userId', authController.getProfile);

// Đổi mật khẩu
router.put('/change-password/:userId', authController.changePassword);

// Thêm / Bỏ yêu thích một lá bài
router.post('/favorite/:userId', authController.toggleFavorite);

module.exports = router;
