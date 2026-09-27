import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getTemaApp, applyTemaToDOM } from './lib/storage';

// Aplicar tema guardado al cargar la app
applyTemaToDOM(getTemaApp());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
