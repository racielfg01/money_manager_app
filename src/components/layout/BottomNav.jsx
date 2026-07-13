import React from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

const BottomNav = () => {
  const { view, setView } = useApp();
  const navItems = [
    { id: 'transactions', icon: 'List', label: 'Movimientos' },
    { id: 'calendar', icon: 'Calendar', label: 'Calendario' },
    { id: 'statistics', icon: 'PieChart', label: 'Estadísticas' },
    { id: 'wallet', icon: 'Wallet', label: 'Billetera' },
    { id: 'settings', icon: 'Settings', label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-panel pb-safe z-30" aria-label="Navegación principal">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 press-effect transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {active && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
              )}
              <Icon name={item.icon} size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
