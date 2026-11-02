import { createApp } from 'vue';
import Popup from './Popup.vue';
import './style.css';

console.log('[Popup.js] Starting popup initialization');
console.log('[Popup.js] Creating Vue app with Popup component');

const app = createApp(Popup);
console.log('[Popup.js] App created, mounting to #app');

app.mount('#app');

console.log('[Popup.js] App mounted successfully');
