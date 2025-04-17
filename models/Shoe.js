const mongoose = require('mongoose');

// Schema giày
const shoeSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Tự động tạo id
  name: String,
  type: String,
  sizes: [Number],
  color: String,
  price: Number,
  stock: Number,
  image: String, // Lưu tên file, không phải đường dẫn tuyệt đối
});

// Middleware để tự động tạo id trước khi lưu
shoeSchema.pre('save', async function (next) {
  if (!this.id) {
    const brandCode = this.type === "Puma" ? "PM" : this.type === "Nike" ? "NK" : this.type === "Adidas" ? "AD" : "XX"; // Lấy brandCode từ type
    const count = await mongoose.model('Shoe').countDocuments(); // Đếm số lượng document trong collection
    const sequence = String(count + 1).padStart(4, '0'); // Tạo số thứ tự tăng dần, đủ 4 chữ số
    this.id = `SHOE${brandCode}${sequence}`; // Tạo id theo định dạng
  }
  next();
});

const Shoe = mongoose.model('Shoe', shoeSchema);

module.exports = Shoe;