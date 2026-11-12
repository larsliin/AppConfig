import { createApp } from 'vue';
import Popup from './Popup.vue';
import 'chrome-extension-component-library/style.css';
import './style.css';

const app = createApp(Popup);

app.mount('#app');

