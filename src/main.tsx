import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

let isAdminMounted = false;

function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  if (window.location.hash.startsWith('#/admin') || window.location.pathname.startsWith('/admin')) {
    isAdminMounted = true;
    // Hide static content
    document.body.style.backgroundColor = '#020617'; // slate-950
    Array.from(document.body.children).forEach((child) => {
      if (child.id !== 'root' && child.tagName !== 'SCRIPT') {
        (child as HTMLElement).style.display = 'none';
      }
    });

    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    // Also load dynamic content for public site from Firebase
    import('./public-site.ts').then(m => m.initPublicSite());
  }
}

renderApp();

window.addEventListener('hashchange', () => {
  if (window.location.hash.startsWith('#/admin') && !isAdminMounted) {
    window.location.reload();
  }
});
