/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import toast from 'react-hot-toast';
import './styles/index.css';
import './i18n';

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  toast.error(event.reason?.message || 'An unexpected error occurred.', { id: 'unhandled-error' });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
