import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'copy-popup-html',
            closeBundle() {
                const source = path.resolve(__dirname, 'popup.html');
                const dest = path.resolve(__dirname, 'dist-extension', 'popup.html');
                fs.copyFileSync(source, dest);
            },
        },
    ],
    server: {
        port: 9001,
    },
    build: {
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, 'src/popup.js'),
                background: path.resolve(__dirname, 'src/background.js'),
                content: path.resolve(__dirname, 'src/content.js'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: 'dist-extension',
        emptyOutDir: true,
    },
});
