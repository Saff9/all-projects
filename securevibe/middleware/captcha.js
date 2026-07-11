const svgCaptcha = require('svg-captcha');

const generateCaptcha = (req, res) => {
  const captcha = svgCaptcha.create({
    size: 6,
    ignoreChars: '0o1iIl',
    noise: 3,
    color: true,
    background: '#f0f0f0'
  });

  // Store captcha text in session or temporary store
  // For simplicity, we'll use a Map (in production, use Redis or database)
  if (!global.captchaStore) {
    global.captchaStore = new Map();
  }

  const captchaId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  global.captchaStore.set(captchaId, captcha.text.toLowerCase());

  // Clean up old captchas (older than 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of global.captchaStore.entries()) {
      if (typeof timestamp === 'number' && now - timestamp > 5 * 60 * 1000) {
        global.captchaStore.delete(key);
      }
    }
  }, 60 * 1000);

  res.type('svg');
  res.status(200).json({
    success: true,
    captchaId,
    captcha: captcha.data,
    poweredBy: 'SecureVibe'
  });
};

const verifyCaptcha = (captchaId, userInput) => {
  if (!global.captchaStore || !global.captchaStore.has(captchaId)) {
    return false;
  }

  const storedText = global.captchaStore.get(captchaId);
  global.captchaStore.delete(captchaId); // One-time use

  return storedText === userInput.toLowerCase();
};

module.exports = { generateCaptcha, verifyCaptcha };
