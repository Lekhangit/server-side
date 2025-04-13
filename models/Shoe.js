const mongoose = require('mongoose');

// Schema giày
const shoeSchema = new mongoose.Schema({
  name: String,
  type: String,
  sizes: [Number],
  color: String,
  price: Number,
  stock: Number,
  image: String, // Lưu tên file, không phải đường dẫn tuyệt đối
});

const Shoe = mongoose.model('Shoe', shoeSchema);

module.exports = Shoe;