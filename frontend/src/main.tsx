import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadRuntimeConfig } from './lib/config.ts';

// Suppress unhandled promise rejections from SDK initialization
window.addEventListener('unhandledrejection', (event) => {
  // Prevent the error overlay from showing for non-critical SDK errors
  if (
    event.reason?.message?.includes('getToken') ||
    event.reason?.message?.includes('auth') ||
    event.reason?.message?.includes('fetch') ||
    event.reason?.message?.includes('network') ||
    event.reason?.message?.includes('Failed to fetch') ||
    event.reason?.message?.includes('NetworkError') ||
    event.reason?.name === 'TypeError'
  ) {
    event.preventDefault();
    console.warn('Suppressed non-critical error:', event.reason?.message);
  }
});

// Also catch regular errors
window.addEventListener('error', (event) => {
  if (
    event.message?.includes('getToken') ||
    event.message?.includes('auth') ||
    event.message?.includes('Failed to fetch')
  ) {
    event.preventDefault();
    console.warn('Suppressed non-critical error:', event.message);
  }
});

// Render the app immediately without waiting for runtime config
createRoot(document.getElementById('root')!).render(<App />);

// Load runtime configuration in the background (non-blocking)
loadRuntimeConfig().catch(() => {
  // Silently ignore - defaults will be used
});