import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

const CalendarView = () => {
  const { transactions } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const getTxForDay = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  return (
    <div className="p-4 sm:p-6 pb-28 view-enter">
      <header className="mb-5"><h1 className="text-2xl font-bold">Calendario</h1></header>
      <div className="bg-white dark:bg-carddark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"><Icon name="ChevronLeft" size={18} /></button>
          <h2 className="text-lg font-bold capitalize">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"><Icon name="ChevronRight" size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['D','L','M','X','J','V','S'].map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const txs = getTxForDay(day);
            return (
              <div key={day} className="aspect-square rounded-xl flex flex-col items-center justify-center relative bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm font-medium">{day}</span>
                {txs.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
