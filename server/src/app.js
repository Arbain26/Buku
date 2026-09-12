const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const prisma = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimitMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeRoutes = require('./routes/storeRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const communityRoutes = require('./routes/communityRoutes');
const eventRoutes = require('./routes/eventRoutes');
const articleRoutes = require('./routes/articleRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const locationRoutes = require('./routes/locationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const mitraRoutes = require('./routes/mitraRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Keamanan HTTP Headers dengan Helmet (mengizinkan cross-origin image sharing untuk uploads)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Rate Limiter umum
app.use('/api', generalLimiter);

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint dengan verifikasi database MySQL
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: 'MABBACA API is running',
      status: 'ok',
      database: 'connected (MySQL)',
      app: 'MABBACA - Ekosistem Literasi Masyarakat Sidrap',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MABBACA API is running but database connection failed',
      status: 'degraded',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // Alias untuk kompatibilitas frontend Prompt 1
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/libraries', libraryRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/mitra', mitraRoutes);
app.use('/api/admin', adminRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start server jika bukan dalam mode test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` MABBACA Backend API running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Base URL: http://localhost:${PORT}/api`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
}

module.exports = app;
