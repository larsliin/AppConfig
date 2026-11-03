import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Icon sizes
const sizes = [
    { name: 'icon-16.svg', size: 16 },
    { name: 'icon-48.svg', size: 48 },
    { name: 'icon-128.svg', size: 128 },
    { name: 'icon-disabled.svg', size: 16, output: 'icon-disabled-16.png' },
    { name: 'icon-disabled.svg', size: 48, output: 'icon-disabled-48.png' },
    { name: 'icon-disabled.svg', size: 128, output: 'icon-disabled-128.png' },
];

async function convertSvgToPng() {
    console.log('Converting SVG icons to PNG...');

    for (const { name, size, output } of sizes) {
        const svgPath = path.join(iconsDir, name);
        const pngPath = path.join(iconsDir, output || name.replace('.svg', '.png'));

        if (!fs.existsSync(svgPath)) {
            console.warn(`⚠ ${name} not found`);
            continue;
        }

        try {
            await sharp(svgPath)
                .resize(size, size)
                .png()
                .toFile(pngPath);

            console.log(`✓ Converted ${name} → ${path.basename(pngPath)}`);
        } catch (error) {
            console.error(`✗ Failed to convert ${name}:`, error.message);
        }
    }

    console.log('Conversion complete!');
}

convertSvgToPng();
