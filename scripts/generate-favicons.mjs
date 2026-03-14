/**
 * Generate favicon PNG files from SVG
 * 
 * Usage:
 * 1. Install dependencies: npm install --save-dev sharp
 * 2. Run: node scripts/generate-favicons.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const sizes = [
  { size: 32, name: 'icon-light-32x32.png' },
  { size: 32, name: 'icon-dark-32x32.png', dark: true },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-icon.png' },
];

// SVG content with light/dark mode variants
const svgLight = readFileSync(join(process.cwd(), 'public/icon.svg'), 'utf-8');
const svgDark = svgLight.replace(
  /@media \(prefers-color-scheme: light\) \{[\s\S]*?\}/,
  ''
).replace(
  /@media \(prefers-color-scheme: dark\) \{[\s\S]*?\}/,
  (match) => match.replace('dark', 'light')
);

async function generateFavicons() {
  console.log('Generating favicon files...');
  
  for (const { size, name, dark } of sizes) {
    try {
      const svg = dark ? svgDark : svgLight;
      const buffer = await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toBuffer();
      
      const outputPath = join(process.cwd(), 'public', name);
      writeFileSync(outputPath, buffer);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }
  
  // Generate favicon.ico (16x16 and 32x32)
  try {
    const favicon16 = await sharp(Buffer.from(svgLight))
      .resize(16, 16)
      .png()
      .toBuffer();
    
    const favicon32 = await sharp(Buffer.from(svgLight))
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // For .ico, we'll just use the 32x32 PNG
    const outputPath = join(process.cwd(), 'app', 'favicon.ico');
    writeFileSync(outputPath, favicon32);
    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('✗ Failed to generate favicon.ico:', error.message);
  }
  
  console.log('\n✅ Favicon generation complete!');
}

generateFavicons().catch(console.error);
