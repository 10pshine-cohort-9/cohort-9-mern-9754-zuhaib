import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

/**
 * Mounts the React application into the DOM root element.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
