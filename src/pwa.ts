// Vite PWA registration helper
import { registerSW } from 'virtual:pwa-register';

export const setupPWA = () => {
  registerSW({ immediate: true });
};




