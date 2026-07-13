import React from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

const Fab = () => {
  const { setIsModalOpen } = useApp();
  return (
    <button
      onClick={() => setIsModalOpen(true)}
      aria-label="Nueva transacción"
      className="fixed bottom-24 right-4 sm:right-8 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white w-14 h-14 rounded-full shadow-xl shadow-blue-500/30 z-40 press-effect flex items-center justify-center transition-all hover:scale-105"
    >
      <Icon name="Plus" size={26} strokeWidth={2.5} />
    </button>
  );
};

export default Fab;
