const express = require('express');
const multer = require('multer');
const path = require('path');
const Shoe = require('../models/Shoe');

const router = express.Router();

// Cấu hình multer để lưu ảnh vào thư mục uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Lưu vào thư mục uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newShoe = new Shoe({
      name: req.body.name,
      type: req.body.type,
      sizes: req.body.sizes ? req.body.sizes.split(',').map(Number) : [], // Kiểm tra chuỗi sizes
      color: req.body.color,
      price: parseFloat(req.body.price.replace(/\./g, '')), // Xóa dấu chấm ngăn cách hàng nghìn
      stock: parseInt(req.body.stock, 10), // Chuyển stock thành số nguyên
      image: req.file ? req.file.filename : null, // Kiểm tra file ảnh
    });

    await newShoe.save();
    res.status(201).json({ message: 'Shoe added successfully!', shoe: newShoe });
  } catch (error) {
    console.error('Error adding shoe:', error);
    res.status(500).json({ message: 'Failed to add shoe.' });
  }
});

// API lấy danh sách giày
router.get('/', async (req, res) => {
  try {
    const shoes = await Shoe.find();
    res.json(shoes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shoes.' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const shoeId = req.params.id;
    const deletedShoe = await Shoe.findByIdAndDelete(shoeId);

    if (!deletedShoe) {
      return res.status(404).json({ message: 'Shoe not found.' });
    }

    res.json({ message: 'Shoe deleted successfully!', shoe: deletedShoe });
  } catch (error) {
    console.error('Error deleting shoe:', error);
    res.status(500).json({ message: 'Failed to delete shoe.' });
  }
});

module.exports = router;