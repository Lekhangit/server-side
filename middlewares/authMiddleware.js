const jwt = require('jsonwebtoken');

// Middleware xác thực Access Token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing or invalid.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Sử dụng ACCESS_TOKEN_SECRET
    req.user = decoded; // Lưu thông tin người dùng vào request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired access token.' });
  }
};

module.exports = authenticateToken;