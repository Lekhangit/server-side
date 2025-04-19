const express = require('express');
require('dotenv').config(); // Tải các biến môi trường từ file .env
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// API đăng ký
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Failed to register user. Please try again later.' });
  }
});

// API đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Tạo Access Token và Refresh Token
    const accessToken = jwt.sign({ id: user._id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m', // Access Token hết hạn sau 15 phút
    });

    const refreshToken = jwt.sign({ id: user._id, username: user.username }, process.env.REFRESH_TOKEN_SECRET);

    // Lưu Refresh Token vào cơ sở dữ liệu
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to log in. Please try again later.' });
  }
});

// API làm mới Access Token
router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
      }

      const accessToken = jwt.sign({ id: decoded.id, username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m', // Tạo Access Token mới
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error('Error during token refresh:', error);
    res.status(500).json({ message: 'Failed to refresh token.' });
  }
});

// API đăng xuất
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    // Xóa Refresh Token khỏi cơ sở dữ liệu
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
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