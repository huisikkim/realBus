import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const svgBuffer = readFileSync(join(process.cwd(), 'public', 'icon.svg'));

// 192x192 아이콘 생성
await sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile(join(process.cwd(), 'public', 'icon-192x192.png'));

console.log('✅ icon-192x192.png 생성 완료');

// 512x512 아이콘 생성
await sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile(join(process.cwd(), 'public', 'icon-512x512.png'));

console.log('✅ icon-512x512.png 생성 완료');

// Apple Touch Icon (180x180)
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(join(process.cwd(), 'public', 'apple-touch-icon.png'));

console.log('✅ apple-touch-icon.png 생성 완료');

console.log('\n🎉 모든 아이콘이 생성되었습니다!');
