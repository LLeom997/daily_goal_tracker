
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeDB } from './db';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

async function start() {
  try {
    await initializeDB();
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Initialization error:", error);
    root.render(
      <div className="flex items-center justify-center min-h-screen text-red-500 p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm opacity-80">Failed to load the local database. Please refresh or check your browser settings.</p>
        </div>
      </div>
    );
  }
}

start();
