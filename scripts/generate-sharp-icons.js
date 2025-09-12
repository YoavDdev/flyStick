const fs = require('fs');
const path = require('path');

// Create sharp favicon SVG
const faviconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D5C4B7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B8A99C;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="256" fill="url(#bgGradient)"/>
  
  <!-- Logo Background Circle -->
  <circle cx="256" cy="256" r="180" fill="white" opacity="0.95"/>
  
  <!-- Studio Boaz Logo -->
  <g transform="translate(256, 256) scale(1.5) translate(-45, -88)">
    <path d="M79.5 170 c-3.3 -2.2 -7.6 -4.5 -9.5 -5.1 -1.9 -0.7 -4.1 -2.0 -5.0 -3.0 -2.2 -2.6 -42.7 -26.9 -44.8 -26.9 -1.0 0 -2.8 -1.1 -3.9 -2.3 -1.1 -1.3 -4.9 -4.1 -8.3 -6.2 -3.5 -2.1 -5.8 -4.1 -5.2 -4.3 0.7 -0.2 4.0 1.2 7.4 3.2 l6.0 3.7 4.5 -3.8 c2.4 -2.1 7.1 -5.4 10.4 -7.4 3.2 -1.9 7.1 -4.7 8.6 -6.1 1.6 -1.4 4.1 -3.3 5.6 -4.3 3.5 -2.3 8.0 -10.8 8.0 -15.5 0 -3.4 -3.7 -10.5 -9.5 -18.3 -1.4 -1.7 -3.9 -5.9 -5.6 -9.2 -1.8 -3.3 -5.9 -9.4 -9.2 -13.5 -3.3 -4.1 -8.1 -11.2 -10.6 -15.8 -2.6 -4.5 -7.1 -11.0 -10.0 -14.3 -4.0 -4.4 -5.4 -6.8 -5.4 -8.9 0 -3.7 1.4 -3.8 3.7 -0.3 1.0 1.4 3.2 4.1 5.0 6.0 1.7 1.8 3.7 4.8 4.2 6.6 0.6 1.8 3.6 5.7 6.7 8.7 3.1 3.0 7.1 7.8 8.9 10.5 3.9 5.9 17.9 19.7 21.6 21.2 2.4 1.0 2.8 0.9 3.8 -1.5 1.5 -3.2 0.5 -23.9 -1.4 -29.7 -0.8 -2.2 -1.6 -6.6 -2.0 -9.9 -0.3 -3.2 -1.5 -8.0 -2.6 -10.6 -2.7 -6.3 -2.3 -11.4 1.0 -11.8 3.2 -0.5 4.8 1.2 3.1 3.3 -1.9 2.3 -0.7 8.8 3.6 18.6 2.4 5.7 4.0 11.5 5.0 18.1 0.7 5.3 2.5 12.7 3.9 16.5 1.6 4.2 2.9 10.8 3.6 17.3 0.5 5.8 1.8 13.9 2.7 18.0 0.9 4.1 1.6 10.2 1.5 13.5 -0.4 13.4 -2.2 53.1 -2.5 54.9 -0.2 1.4 1.4 2.9 6.4 6.0 7.8 4.7 10.0 6.6 7.8 6.5 -0.8 0 -4.2 -1.8 -7.5 -3.9z" 
          fill="#2D3142"/>
  </g>
</svg>`;

// Write favicon SVG
fs.writeFileSync(path.join(__dirname, '../public/favicon-new.svg'), faviconSVG);

console.log('✅ Sharp favicon created: /public/favicon-new.svg');
console.log('📝 Next steps:');
console.log('1. Replace current favicon.ico with favicon-new.svg');
console.log('2. Update meta tags in layout.tsx');
console.log('3. Add Open Graph image meta tags');
