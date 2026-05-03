const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Import middleware
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');
const { apiRateLimiter } = require('./middleware/rateLimiter');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.WEBAPP_URL, 'https://t.me'].filter(Boolean)
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data']
}));

app.use(express.json());
app.use(requestLogger);
app.use(apiRateLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clicker', require('./routes/clicker'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/pvp', require('./routes/pvp'));

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     THE GLITCH HACKER - BACKEND        ║
╠════════════════════════════════════════╣
║  Status: ONLINE                        ║
║  Port: ${PORT}                             ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)} ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
