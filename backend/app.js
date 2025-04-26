require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { 
  handleMongooseValidationError,
  handleMongooseDuplicateKeyError,
  handleMongooseCastError,
  handleJWTError,
  handleJWTExpiredError 
} = require('./utils/errorHandler');
const { logRequest, logErrorMiddleware } = require('./utils/logger');
const morgan = require('morgan');
const { createRotatingLogStream } = require('./utils/logger');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
const { setupSecurity } = require('./middlewares/securityMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const rssRoutes = require('./routes/rssRoutes');
const requestRoutes = require('./routes/requestRoutes');
const backupRoutes = require('./routes/backupRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const personalVaultRoutes = require('./routes/personalVaultRoutes');
const configRoutes = require('./routes/configRoutes');
const userPreferencesRoutes = require('./routes/userPreferencesRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();

// Configure CORS first, before any other middleware
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? 
  process.env.CORS_ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:5173']; // Added Vite's default port

app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Initialize security middleware
setupSecurity(app).catch(console.error);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logRequest);
app.use(morgan('combined', { stream: createRotatingLogStream() }));

// Apply global rate limiting to all routes
app.use(apiLimiter);

// Static file serving with proper caching
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('uploads', {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));
} else {
  app.use('/uploads', express.static('uploads'));
}

// Mount routes with explicit string paths
app.use('/auth', authRoutes);
app.use('/media', mediaRoutes);
app.use('/notifications', notificationRoutes);
app.use('/rss', rssRoutes);
app.use('/requests', requestRoutes);
app.use('/backup', backupRoutes);
app.use('/downloads', downloadRoutes);
app.use('/vault', personalVaultRoutes);
app.use('/config', configRoutes);
app.use('/preferences', userPreferencesRoutes);
app.use('/system', systemRoutes);

// Error handling for multer file uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
  next(err);
});

// 404 handler - moved before global error handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found'
  });
});

// Error logging middleware
app.use(logErrorMiddleware);

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific errors
  if (err instanceof mongoose.Error.ValidationError) {
    err = handleMongooseValidationError(err);
  } else if (err.code === 11000) {
    err = handleMongooseDuplicateKeyError(err);
  } else if (err instanceof mongoose.Error.CastError) {
    err = handleMongooseCastError(err);
  } else if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
