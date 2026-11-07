const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Lưu dạng đã mã hoá: salt:hash
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: Number }] // Danh sách các card id được lưu vào bộ sưu tập
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
