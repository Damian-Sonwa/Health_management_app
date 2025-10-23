import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { queryClient } from './lib/queryClient';
import './i18n/config'; // Initialize i18n

// Add global error handler for mobile
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Root element not found</h1><p>Please refresh the page.</p></div>';
} else {
  try {
    createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error loading app</h1><p>' + error + '</p><button onclick="window.location.reload()">Reload</button></div>';
  }
}
