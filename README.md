# Config Copier - Chrome Extension

A lightweight Chrome extension that copies configuration data from downloaded config files to your clipboard when clicking the extension button in the toolbar.

## 🎯 Features

- **Vue 3 Popup UI** - Modern, reactive interface built with Vue 3 and Composition API
- **Background Service Worker** - Manages config retrieval and clipboard operations
- **Content Script** - Monitors webpage activity
- **Chrome Storage API** - Persists configuration data locally
- **Clipboard Integration** - One-click copy to clipboard
- **Vite Build System** - Fast development and production builds

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Chrome browser
- npm

### Installation & Build

```bash
# Install dependencies
npm install

# Build the extension
npm run build:extension
```

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `dist-extension` folder from the project directory
5. The extension is now installed and ready to use!

## 📁 Project Structure

```
vue3-app/
├── src/
│   ├── Popup.vue           # Vue 3 popup component (UI)
│   ├── popup.js            # Popup entry point
│   ├── background.js       # Service Worker (config management)
│   ├── content.js          # Content script
│   └── style.css           # Popup styles
├── public/
│   ├── manifest.json       # Extension configuration
│   ├── popup.html          # Popup HTML
│   └── icons/              # Extension icons
├── scripts/
│   └── prepare-extension.js # Build helper
├── dist-extension/         # Build output (ready to load in Chrome)
└── vite.config.js          # Vite configuration
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build:extension` - Build the Chrome extension
- `npm run preview` - Preview production build

## 🔧 How It Works

1. **Download Config File** - When a config file is downloaded on a webpage
2. **Click Extension** - User clicks the extension icon in Chrome toolbar
3. **Load & Copy** - Config data is loaded from storage and copied to clipboard
4. **Feedback** - User sees a success message confirming the copy

## 📖 Documentation

For detailed documentation, see:
- [Setup Guide](./SETUP_GUIDE.md) - Detailed installation and setup instructions
- [Config Loading Guide](./CONFIG_LOADING_GUIDE.md) - How to load and manage configs
- [Extension README](./EXTENSION_README.md) - Full technical documentation
- [Quick Summary](./QUICK_SUMMARY.md) - Quick reference guide
- [Checklist](./CHECKLIST.md) - Implementation checklist

## 🛠️ Development

### Stack
- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite
- **Extension APIs**: Chrome Storage, Clipboard API, Downloads API

### Making Changes

1. Edit files in `src/`
2. Rebuild with `npm run build:extension`
3. Chrome will auto-reload the extension if you have it loaded in developer mode
4. Test the updated extension

## 📝 Notes

- Config files are stored locally using Chrome's storage API
- No data is sent to external servers
- The extension works offline once a config has been loaded
- All files are bundled by Vite for optimal performance

## 📄 License

This project is open source and available under the MIT License.
