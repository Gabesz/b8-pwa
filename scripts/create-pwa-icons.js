import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Egyszerű PNG ikonok létrehozása base64 kódolással
// Ez egy minimális PNG fájl, ami egy 1x1 pixeles fehér képet tartalmaz
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

// Ikonok létrehozása
const createIcons = () => {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // 192x192 ikon
  const icon192 = createSimplePNG(192);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
  console.log('✅ pwa-192x192.png létrehozva');
  
  // 512x512 ikon
  const icon512 = createSimplePNG(512);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
  console.log('✅ pwa-512x512.png létrehozva');
  
  // 512x512 maskable ikon
  const iconMaskable = createSimplePNG(512);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable.png'), iconMaskable);
  console.log('✅ pwa-maskable.png létrehozva');
  
  console.log('🎉 Minden PWA ikon létrehozva!');
};

// Futtatás
createIcons();
