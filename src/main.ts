import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { setupPWA } from './pwa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { router } from './router';

setupPWA();

createApp(App).use(router).mount('#app');


