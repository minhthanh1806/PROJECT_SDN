const crypto = require('crypto');
const User = require('../models/User');
const Card = require('../models/Card');

// Mã hoá mật khẩu bằng scrypt (có sẵn trong Node, không cần cài thêm)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashToCheck = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToCheck, 'hex'));
}

// Đăng ký
exports.register = async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const existed = await User.findOne({ username });
    if (existed) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
    }

    const user = await User.create({ username, password: hashPassword(password), role: 'user', favorites: [] });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { id: user._id, username: user.username, role: user.role, createdAt: user.createdAt, favorites: [] }
    });
  } catch (error) {
    console.error('[register error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }

    const user = await User.findOne({ username });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        id: user._id,
        username: user.username,
        role: user.role || 'user',
        createdAt: user.createdAt,
        favorites: user.favorites || []
      }
    });
  } catch (error) {
    console.error('[login error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thông tin cá nhân (Profile) kèm chi tiết các lá bài yêu thích
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    // Lấy chi tiết danh sách card theo mảng id trong favorites
    const favoriteCards = await Card.find({ id: { $in: user.favorites || [] } }).lean();

    // Tính tổng giá trị bộ sưu tập theo min_price
    const totalCollectionValue = favoriteCards.reduce((sum, card) => sum + (card.min_price || 0), 0);

    return res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        role: user.role || 'user',
        createdAt: user.createdAt,
        favorites: user.favorites || [],
        favoriteCards,
        stats: {
          totalCards: favoriteCards.length,
          totalValue: Number(totalCollectionValue.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('[getProfile error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (!verifyPassword(oldPassword, user.password)) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    user.password = hashPassword(newPassword);
    await user.save();

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('[changePassword error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm / Bỏ yêu thích một lá bài (Toggle favorite)
exports.toggleFavorite = async (req, res) => {
  try {
    const { userId } = req.params;
    const cardId = Number(req.body.cardId);

    if (!cardId || isNaN(cardId) || cardId <= 0) {
      return res.status(400).json({ success: false, message: 'Thiếu cardId hợp lệ' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const index = (user.favorites || []).indexOf(cardId);
    let isFavorited = false;

    if (index > -1) {
      // Đã có -> Xóa khỏi danh sách yêu thích
      user.favorites.splice(index, 1);
      isFavorited = false;
    } else {
      // Chưa có -> Thêm vào danh sách yêu thích
      user.favorites.push(cardId);
      isFavorited = true;
    }

    await user.save();

    return res.json({
      success: true,
      isFavorited,
      favorites: user.favorites,
      message: isFavorited ? 'Đã thêm vào bộ sưu tập' : 'Đã xóa khỏi bộ sưu tập'
    });
  } catch (error) {
    console.error('[toggleFavorite error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
