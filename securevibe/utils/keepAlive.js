const axios = require('axios');
const cron = require('node-cron');

// Keep-alive mechanism for Render free tier
const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

  // Ping every 5 minutes to prevent sleeping
  cron.schedule('*/5 * * * *', async () => {
    try {
      const response = await axios.get(`${url}/api/health`);
      console.log(`🔄 Keep-alive ping successful: ${response.status}`);
    } catch (error) {
      console.error('❌ Keep-alive ping failed:', error.message);
    }
  });

  // Also ping every 10 minutes to /api/auth/status
  cron.schedule('*/10 * * * *', async () => {
    try {
      const response = await axios.get(`${url}/api/auth/status`);
      console.log(`🔄 Auth status ping successful: ${response.status}`);
    } catch (error) {
      console.error('❌ Auth status ping failed:', error.message);
    }
  });

  console.log('🚀 Keep-alive mechanism activated for Render free tier');
};

module.exports = keepAlive;
