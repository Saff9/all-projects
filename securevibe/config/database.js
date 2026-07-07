const mongoose = require('mongoose');

/**
 * Secure database connection with optimized settings
 * Implements connection pooling, security, and monitoring
 */
const connectDB = async () => {
  try {
    // Validate MongoDB URI before connection
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }

    // Parse and validate connection string
    const mongoUri = new URL(process.env.MONGO_URI);
    if (mongoUri.protocol !== 'mongodb:' && mongoUri.protocol !== 'mongodb+srv:') {
      throw new Error('Invalid MongoDB connection string protocol');
    }

    // Connection options optimized for security and performance
    const options = {
      // Connection settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity

      // Security settings
      ssl: true,
      sslValidate: true,
      tls: true,
      tlsInsecure: false, // Enforce certificate validation

      // Authentication
      authSource: 'admin',
      retryWrites: true,
      retryReads: true,

      // Monitoring and logging
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    // Additional options for production
    if (process.env.NODE_ENV === 'production') {
      options.minPoolSize = 2; // Maintain minimum 2 connections
      options.heartbeatFrequencyMS = 10000; // Check server every 10 seconds
    }

    // Establish connection with monitoring
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });

    console.log(`🔗 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool: max ${options.maxPoolSize} connections`);

    return conn;
  } catch (error) {
    console.error('💥 Database connection failed:', error.message);

    // Don't expose sensitive connection details in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Please check your MongoDB Atlas configuration');
    } else {
      console.error('Connection string:', process.env.MONGO_URI.substring(0, 20) + '...');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
