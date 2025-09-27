import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG ikonok létrehozása a favicon.svg alapján
const createSVGIcons = () => {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // 192x192 SVG ikon
  const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#41d1ff"/>
      <stop offset="1" stop-color="#bd34fe"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="45" fill="#0f172a"/>
  <path d="M96 30l59 132H37z" fill="url(#g)"/>
</svg>`;
  
  // 512x512 SVG ikon
  const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#41d1ff"/>
      <stop offset="1" stop-color="#bd34fe"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="#0f172a"/>
  <path d="M256 80l156 352H100z" fill="url(#g)"/>
</svg>`;
  
  // 512x512 maskable SVG ikon (teljes háttér)
  const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#41d1ff"/>
      <stop offset="1" stop-color="#bd34fe"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="#0f172a"/>
  <path d="M256 80l156 352H100z" fill="url(#g)"/>
</svg>`;
  
  // SVG fájlok mentése
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.svg'), svg192);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.svg'), svg512);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable.svg'), svgMaskable);
  
  console.log('✅ SVG ikonok létrehozva');
  
  // PNG ikonok is létrehozása (egyszerű base64 PNG)
  const createSimplePNG = (size) => {
    // Minimális PNG header (1x1 fehér pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // color type, compression, filter, interlace
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // image data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);
    return pngData;
  };
  
  // PNG ikonok létrehozása
  const icon192 = createSimplePNG(192);
  const icon512 = createSimplePNG(512);
  const iconMaskable = createSimplePNG(512);
  
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable.png'), iconMaskable);
  
  console.log('✅ PNG ikonok létrehozva');
  console.log('🎉 Minden PWA ikon létrehozva!');
};

// Futtatás
createSVGIcons();

