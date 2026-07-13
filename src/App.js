import React from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
