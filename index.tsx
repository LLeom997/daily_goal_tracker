
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeDB } from './db';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Global error handler for non-Error objects (like Dexie errors or network objects)
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  console.error("Global Promise Rejection:", message, error);
});

window.onerror = (message, source, lineno, colno, error) => {
  const errorDetails = error instanceof Error ? error.message : JSON.stringify(error || message);
  console.error("Global Error:", errorDetails);
};

async function start() {
  try {
    await initializeDB();
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Critical Initialization Failure:", error);

    root.render(
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white p-10">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">System Halted</h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              Discipline database failed to initialize. Check if storage is restricted.
            </p>
          </div>
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 text-left">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Error Signature</p>
            <code className="text-[11px] text-red-400 break-all">{errorMessage}</code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
}

start();
