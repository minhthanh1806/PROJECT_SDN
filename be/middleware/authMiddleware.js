const User = require('../models/User');

// Middleware xác thực người dùng đã đăng nhập (bất kể role là user hay admin)
exports.requireAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.headers['x-admin-id'] || req.query.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập tài khoản để thực hiện tính năng này' });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị xóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[requireAuth error]', error);
    return res.status(500).json({ success: false, message: 'Lỗi xác thực người dùng' });
  }
};

// Middleware kiểm tra quyền Quản trị viên (Admin)
exports.requireAdmin = async (req, res, next) => {
  try {
    const adminId = req.headers['x-admin-id'] || req.headers['x-user-id'] || req.query.adminId;
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập tài khoản Quản trị viên' });
    }

    const user = await User.findById(adminId).lean();
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Truy cập bị từ chối: Bạn không có quyền Quản trị viên' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error('[requireAdmin error]', error);
    return res.status(500).json({ success: false, message: 'Lỗi xác thực quyền Quản trị' });
  }
};
