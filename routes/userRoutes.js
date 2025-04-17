const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middlewares/authMiddleware'); // Import middleware

const router = express.Router();

// API đăng ký
router.post('/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Kiểm tra nếu username hoặc password bị thiếu
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }
  
      // Kiểm tra nếu username đã tồn tại
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists.' });
      }
  
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Tạo người dùng mới
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error('Error during signup:', error);
  
      // Xử lý lỗi nếu có vấn đề với cơ sở dữ liệu hoặc các lỗi khác
      res.status(500).json({ message: 'Failed to register user. Please try again later.' });
    }
  });

// API đăng nhập
// API đăng nhập
router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Kiểm tra nếu username hoặc password bị thiếu
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
      }
  
      // Tìm người dùng theo username
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }
  
      // So sánh mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }
  
      // Tạo JWT token
      const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token hết hạn sau 1 giờ
      });
  
      // Trả về token và thông tin người dùng
      res.json({ token, username: user.username });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Failed to log in. Please try again later.' });
    }
  });
// API đăng xuất
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token is missing.' });

    const user = await User.findOne({ 'tokens.token': token });
    if (!user) return res.status(401).json({ message: 'Invalid token.' });

    // Xóa token khỏi cơ sở dữ liệu
    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();

    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Failed to log out.' });
  }
});

// API cần bảo vệ
router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json({ username: user.username });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile.' });
    }
  });

module.exports = router;