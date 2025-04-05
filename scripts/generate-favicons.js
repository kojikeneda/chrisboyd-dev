#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

// Create the static directory if it doesn't exist
const staticDir = path.join(__dirname, '../static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Function to generate a favicon of a specific size
function generateFavicon(size, outputPath) {
  // Create canvas with the specified size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#2c3e50'; // Dark blue background
  ctx.fillRect(0, 0, size, size);
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Scale font size based on canvas size
  const fontSize = Math.floor(size * 0.5);
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Draw text in center
  ctx.fillText('CB', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated: ${outputPath}`);
}

// Generate all favicon sizes
console.log('Generating favicons...');
sizes.forEach(({ name, size }) => {
  const outputPath = path.join(staticDir, name);
  generateFavicon(size, outputPath);
});

// Also create a simple favicon.ico (just a copy of the 32x32 version)
const faviconPath = path.join(staticDir, 'favicon.ico');
fs.copyFileSync(path.join(staticDir, 'favicon-32x32.png'), faviconPath);
console.log(`Generated: ${faviconPath} (copy of favicon-32x32.png)`);

console.log('Favicon generation complete!'); 