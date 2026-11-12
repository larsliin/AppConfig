# Config Copier - Chrome Extension

A lightweight Chrome extension that copies configuration data from downloaded config files to your clipboard when clicking the extension button in the toolbar.

## 🎯 Features

- **Vue 3 Popup UI** - Modern, reactive interface built with Vue 3 Composition API
- **Config Editor** - CodeMirror-based JSON editor with syntax highlighting
- **Config Controls** - Load, save, and manage configuration files
- **Background Service Worker** - Manages config retrieval and clipboard operations
- **Content Script** - Monitors webpage activity
- **Chrome Storage API** - Persists configuration data locally
- **Clipboard Integration** - One-click copy to clipboard with feedback
- **Theme Support** - Dark/light theme toggle with persistent storage
- **Localhost Injection** - Automatic configuration injection into localhost environments
- **TypeScript Support** - Full type safety with TypeScript
- **Vite Build System** - Fast development and production builds with icon and favicon generation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
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
AppConfig/
├── src/
│   ├── Popup.vue                    # Main Vue popup component
│   ├── components/
│   │   ├── ConfigControls.vue       # Localhost and copy controls
│   │   ├── PopupHeader.vue          # Header with refresh control
│   │   └── bascomponents/           # Reusable base components
│   ├── composables/
│   │   ├── useConfigManager.ts      # Config state management
│   │   ├── useFeedback.ts           # Toast feedback messages
│   │   ├── useLocalhostInjection.ts # Config injection for localhost
│   │   └── useTheme.ts              # Theme management
│   ├── utils/
│   │   └── constants.ts             # App constants
│   ├── assets/                      # Static assets
│   ├── popup.js                     # Popup entry point
│   ├── background.js                # Service Worker
│   ├── content.js                   # Content script
│   ├── main.js                      # Vue app initialization
│   ├── style.css                    # Global styles
│   └── env.d.ts                     # TypeScript environment definitions
├── public/
│   ├── manifest.json                # Extension configuration (Manifest v3)
│   ├── popup.html                   # Popup HTML
│   ├── popup-init.js                # Popup initialization
│   ├── icons/                       # Extension icons (16, 48, 128px)
│   ├── icons.svg                    # SVG icon source
│   ├── favicon.png                  # Favicon
│   └── favicon.svg                  # Favicon SVG
├── scripts/
│   ├── prepare-extension.js         # Post-build extension setup
│   ├── convert-icons.js             # SVG to PNG icon conversion
│   └── generate-favicon.js          # Favicon generation
├── dist-extension/                  # Build output (ready to load in Chrome)
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint configuration
├── stylelint.config.js              # Stylelint configuration
└── package.json                     # Project dependencies and scripts
```

## 📜 npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server (http://localhost:9001) |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint on all source files |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run build:icons` | Convert SVG icons to PNG (16, 48, 128px) |
| `npm run build:favicon` | Generate favicon files from SVG |
| `npm run build:extension` | Complete build: type-check → lint-check → build icons/favicon → bundle with Vite → prepare extension |
| `npm run preview` | Preview production build locally |

## 🔧 How It Works

1. **Download Config File** - Config file is downloaded on a webpage
2. **Click Extension** - User clicks the Config Copier icon in the Chrome toolbar
3. **Edit & Manage** - Popup opens with config editor and controls:
   - View/edit JSON with syntax highlighting
   - Load config from file
   - Save current config
   - Copy to clipboard
4. **Feedback** - Success/error messages provide immediate feedback
5. **Persistent Storage** - Configs are saved in Chrome storage API for offline access

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Latest with Composition API and `<script setup>` syntax
- **TypeScript** - Full type safety across the codebase
- **CodeMirror 6** - Advanced JSON editor with syntax highlighting and one-dark theme
- **Bootstrap Icons** - Icon library for UI elements

### Build & Tooling
- **Vite 8** - Lightning-fast bundling with optimized output
- **ESLint** - Code quality with Vue 3, TypeScript, and stylistic rules
- **Stylelint** - CSS linting for style consistency
- **Vue TSC** - TypeScript type checking for Vue components
- **Sharp** - Image processing for icon and favicon generation

## Shared components

This app uses shared UI components from the [Chrome Extension Component Library](https://github.com/larsliin/ChromeExtensionComponentLibrary/blob/main/docs/components/index.md).

### Extension APIs
- **Manifest v3** - Latest Chrome extension platform
- **Chrome Storage API** - Local persistence
- **Clipboard API** - Clipboard write access
- **Scripting API** - Content script management
- **Active Tab API** - Current tab access

## 📝 Development Guide

### Making Changes

1. Edit files in `src/`
2. TypeScript types are checked automatically during build
3. Rebuild extension: `npm run build:extension`
4. Reload extension in Chrome (or enable auto-reload in developer mode)
5. Test the updated extension

### Code Quality

Run linting before committing:
```bash
npm run lint:fix        # Auto-fix issues
npm run type-check      # Verify TypeScript
npm run build:extension # Full validation before build
```

### Adding Dependencies

- Only add packages to `package.json` when genuinely necessary
- Run `npm install` after modifying `package.json`
- Verify build completes successfully

## 🔐 Security & Privacy

- ✅ No external data transmission - all operations are local
- ✅ Chrome Storage API only - data never leaves the browser
- ✅ Offline capable - works without internet once config is loaded
- ✅ No analytics or tracking - complete privacy

## 📄 License

This project is open source and available under the MIT License.
