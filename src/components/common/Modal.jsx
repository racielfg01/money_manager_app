import React, { useEffect } from 'react';
import Icon from './Icon';

const Modal = ({ isOpen, onClose, title, children, showDragHandle = true }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="bottom-sheet relative bg-white dark:bg-carddark w-full sm:w-[440px] shadow-2xl flex flex-col animate-slide-up" role="dialog" aria-modal="true">
        {showDragHandle && (
          <div className="sm:hidden pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div className="drag-handle"></div>
          </div>
        )}

        <div className="sticky top-0 z-10 bg-white dark:bg-carddark px-5 pt-2 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 press-effect transition-colors flex-shrink-0"
          >
            <Icon name="X" size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
