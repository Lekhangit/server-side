// filepath: e:\Chuyên đề lập trình web\tuan10\tuan100\server-side\models\User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokens: [{ token: { type: String, required: true } }], // Lưu danh sách token
});

const User = mongoose.model('User', userSchema);

module.exports = User;