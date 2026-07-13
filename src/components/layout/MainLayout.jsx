import React from 'react';
import { useApp } from '../../context/AppContext';
import Fab from './Fab';
import BottomNav from './BottomNav';
import TransactionModal from '../modals/TransactionModal';
import WalletView from '../views/WalletView';
import TransactionsView from '../views/TransactionsView';
import StatisticsView from '../views/StatisticsView';
import CalendarView from '../views/CalendarView';
import SettingsView from '../views/SettingsView';

const MainLayout = () => {
  const { view, isModalOpen } = useApp();

  const renderView = () => {
    switch(view) {
      case 'wallet': return <WalletView />;
      case 'transactions': return <TransactionsView />;
      case 'statistics': return <StatisticsView />;
      case 'calendar': return <CalendarView />;
      case 'settings': return <SettingsView />;
      default: return <WalletView />;
    }
  };

  return (
    <div className="min-h-[100dvh] flex justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-darkbg dark:to-gray-900">
      <div className="w-full max-w-md h-[100dvh] bg-gray-50 dark:bg-darkbg relative flex flex-col">
        <main className="flex-1 overflow-y-auto custom-scroll pb-16">
          {renderView()}
        </main>
        {!isModalOpen && view !== 'settings' && <Fab />}
        <BottomNav />
        <TransactionModal />
      </div>
    </div>
  );
};

export default MainLayout;
