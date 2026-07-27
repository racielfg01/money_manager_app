import React from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import InstallPrompt from './components/InstallPrompt';
import UpdateBanner from './components/UpdateBanner';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <UpdateBanner />
        <MainLayout />
        <InstallPrompt />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
