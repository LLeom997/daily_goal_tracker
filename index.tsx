
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { seedDatabase } from './db';

/**
 * Safely clears any existing service workers.
 * This is wrapped in a try-catch to handle environments where Service Workers 
 * might be disabled or restricted, preventing "document is in an invalid state" errors.
 */
const clearServiceWorkers = async () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    } catch (error) {
      // Fail silently or log for debugging. In some sandboxed environments, 
      // accessing serviceWorker throws a DOMException.
      console.debug('Service worker cleanup skipped or not supported in this environment.', error);
    }
  }
};

const init = async () => {
  // Run cleanup before mounting the app
  await clearServiceWorkers();
  await seedDatabase();
  
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

init();
