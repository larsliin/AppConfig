#!/usr/bin/env node

/**
 * Post-build script to prepare extension distribution
 * Copies manifest.json, icons, and other static files to dist-extension
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist-extension');

// Ensure dist-extension exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
const manifestSrc = path.join(sourceDir, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');

if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, manifestDest);
    console.log('✓ Copied manifest.json');
} else {
    console.warn('⚠ manifest.json not found in public folder');
}

// Copy icons directory
const iconsSrc = path.join(sourceDir, 'icons');
const iconsDest = path.join(distDir, 'icons');

if (fs.existsSync(iconsSrc)) {
    if (!fs.existsSync(iconsDest)) {
        fs.mkdirSync(iconsDest, { recursive: true });
    }

    const files = fs.readdirSync(iconsSrc);
    files.forEach((file) => {
        fs.copyFileSync(
            path.join(iconsSrc, file),
            path.join(iconsDest, file),
        );
    });
    console.log(`✓ Copied ${files.length} icon(s)`);
} else {
    console.warn('⚠ icons directory not found in public folder');
}

// Copy static files that should be in dist (not built by Vite)
const staticFiles = ['popup-init.js'];
staticFiles.forEach((file) => {
    const src = path.join(sourceDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file}`);
    }
});

console.log('Extension build preparation complete!');
console.log(`Output directory: ${distDir}`);
