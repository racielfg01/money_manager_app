import React from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import InstallPrompt from './components/InstallPrompt';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <MainLayout />
        <InstallPrompt />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
