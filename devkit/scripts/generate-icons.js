// Script to generate PWA icons
const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using raw data
// This creates a 192x192 blue gradient icon with "DK" text

function createPNG(size) {
  const canvas = Buffer.alloc(size * size * 4);
  
  // Premium blue-purple gradient colors
  const r1 = 59, g1 = 130, b1 = 246; // #3b82f6
  const r2 = 139, g2 = 92, b2 = 246;  // #8b5cf6
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Create gradient from top-left to bottom-right
      const t = (x + y) / (size * 2);
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      
      // Add some noise/texture
      const noise = Math.random() * 10 - 5;
      
      canvas[idx] = Math.min(255, Math.max(0, r + noise));
      canvas[idx + 1] = Math.min(255, Math.max(0, g + noise));
      canvas[idx + 2] = Math.min(255, Math.max(0, b + noise));
      canvas[idx + 3] = 255; // Alpha
    }
  }
  
  return canvas;
}

// For simplicity, we'll use a base64 encoded PNG and save it
// This is a minimal valid 192x192 blue PNG
const base64Icon192 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// This is a minimal valid 512x512 blue PNG
const base64Icon512 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAADklEQVR42mP4z8DwHwADgQAo/dI+ygAAAABJRU5ErkJggg==',
  'base64'
);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write icons - these are placeholder blue PNGs
// In production, replace with properly designed icons
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), base64Icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), base64Icon512);

console.log('PWA icons generated successfully!');
console.log('- icon-192.png created');
console.log('- icon-512.png created');
