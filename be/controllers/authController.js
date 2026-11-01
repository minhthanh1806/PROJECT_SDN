const crypto = require('crypto');
const User = require('../models/User');

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

    const user = await User.create({ username, password: hashPassword(password) });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { id: user._id, username: user.username }
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
      data: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('[login error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
