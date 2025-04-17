require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const shoeRoutes = require('./routes/shoeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/shoes', shoeRoutes);
app.use('/users', userRoutes); 

// Serve file ảnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Khởi chạy server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
