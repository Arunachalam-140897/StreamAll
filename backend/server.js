const mongoose = require('mongoose');
const app = require('./app');
const systemMonitor = require('./utils/systemMonitor');
const initializeMongoDB = require('./config/mongo-init');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB and initialize
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    // Initialize MongoDB with admin user and indexes
    await initializeMongoDB();
  } catch (err) {
    console.error('MongoDB connection/initialization error:', err);
    process.exit(1);
  }
};

// Initialize database connection and start server
const port = process.env.PORT || 5000;
connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    
    // Start system monitoring
    systemMonitor.start();
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      systemMonitor.stop();
      mongoose.connection.close(false, () => {
        console.log('💫 Process terminated!');
        process.exit(0);
      });
    });
  });
});
