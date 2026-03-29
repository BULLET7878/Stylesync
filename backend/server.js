require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(express.json());
app.use(cors());

// Database connection with exponential backoff
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    reconnectAttempts = 0;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    if (reconnectAttempts === 0) {
      // First connection failure — exit and let process manager restart
      process.exit(1);
    }
  }
};

connectDB();

mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    console.log(`MongoDB disconnected. Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts})...`);
    setTimeout(connectDB, delay);
  } else {
    console.error('Max reconnection attempts reached. Please check MongoDB Atlas connectivity.');
  }
});

// Basic Route
app.get('/', (req, res) => {
  res.send('StyleSync API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('--- GLOBAL ERROR ---');
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
