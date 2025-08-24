const crypto = require('crypto');

function verifyTelegramAuth(token) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    const isDev = process.env.NODE_ENV === 'development';
    
    // Critical Security Guard: If in production and token is missing, fail closed.
    if (!isDev && !token) {
      console.error('CRITICAL: TELEGRAM_BOT_TOKEN is missing in production!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Check if we are running in development and want to bypass verification
    if (isDev) {
      const mockInitData = req.headers['x-mock-init-data'];
      if (mockInitData) {
        try {
          const params = new URLSearchParams(mockInitData);
          const userStr = params.get('user');
          if (userStr) {
            req.user = JSON.parse(userStr);
            return next();
          }
        } catch (err) {
          console.error("Failed to parse mock user:", err);
        }
      }
      
      // Default fallback mock user if no x-mock-init-data header is provided in development
      req.user = {
        id: '12345678',
        username: 'mock_degen_king',
        first_name: 'Mock Degen King'
      };
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }

    const initData = authHeader.split(' ')[1];
    
    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      
      if (!hash) {
        return res.status(401).json({ message: 'Unauthorized: Missing hash signature' });
      }

      // Extract all parameters, sort them, and prepare data-check-string
      const keys = Array.from(params.keys()).filter(key => key !== 'hash').sort();
      const dataCheckString = keys.map(key => `${key}=${params.get(key)}`).join('\n');

      // Calculate HMAC secret key
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
      const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (computedHash !== hash) {
        return res.status(401).json({ message: 'Unauthorized: Invalid signature verification failed' });
      }

      // Extract user info
      const userStr = params.get('user');
      if (userStr) {
        req.user = JSON.parse(userStr);
      } else {
        return res.status(401).json({ message: 'Unauthorized: No user data in initData' });
      }

      next();
    } catch (err) {
      console.error('Error verifying Telegram signature:', err);
      return res.status(500).json({ message: 'Internal Server Error during auth verification' });
    }
  };
}

module.exports = verifyTelegramAuth;
