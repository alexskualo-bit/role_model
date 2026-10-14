import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './page';
import './globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Не найден контейнер прототипа');
createRoot(root).render(<React.StrictMode><Home /></React.StrictMode>);

