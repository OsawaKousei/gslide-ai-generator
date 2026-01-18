import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App'; // 修正: src/app/App を参照
import './index.css';

// BasicGuidelineに従い、nullチェックを行う
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
