const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function generateAssets() {
  const sourceImage = path.join(__dirname, 'assets', 'logo.png');
  const buildDir = path.join(__dirname, 'build');
  
  if (!fs.existsSync(sourceImage)) {
    console.warn(`Source image ${sourceImage} not found. Skipping icon generation.`);
    return;
  }

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // 1. icon.png (512x512 with transparency)
  const iconPngPath = path.join(buildDir, 'icon.png');
  await sharp(sourceImage)
    .resize(512, 512)
    .toFile(iconPngPath);
  console.log('Created icon.png');

  // 2. icon.ico, installerIcon.ico, uninstallerIcon.ico
  const buf = await pngToIco(iconPngPath);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), buf);
  fs.writeFileSync(path.join(buildDir, 'installerIcon.ico'), buf);
  fs.writeFileSync(path.join(buildDir, 'uninstallerIcon.ico'), buf);
  console.log('Created .ico files');

  // 3. installerSidebar.bmp (164x314)
  // For the sidebar, we'll resize it to fit into 164x314 and fill the rest with white or a dark color
  await sharp(sourceImage)
    .resize({
      width: 164,
      height: 314,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFormat('bmp')
    .toFile(path.join(buildDir, 'installerSidebar.bmp'));
  console.log('Created installerSidebar.bmp');

  // 4. installerHeader.bmp (150x57)
  await sharp(sourceImage)
    .resize({
      width: 150,
      height: 57,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toFormat('bmp')
    .toFile(path.join(buildDir, 'installerHeader.bmp'));
  console.log('Created installerHeader.bmp');
}

generateAssets().catch(console.error);
