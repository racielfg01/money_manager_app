import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import Icon from '../common/Icon';

const CalendarView = () => {
  const { transactions, wallets, settings } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const getTxForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const selectedData = useMemo(() => {
    if (!selectedDay) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const txs = transactions.filter(t => t.date === dateStr);
    const income = txs.filter(t => t.type === 'income');
    const expense = txs.filter(t => t.type === 'expense');
    const totalIncome = income.reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = expense.reduce((s, t) => s + parseFloat(t.amount), 0);
    const findCurrency = (tx) => wallets.find(w => w.id === tx.walletId)?.currency;
    const primaryCurrency = income[0] ? findCurrency(income[0]) : expense[0] ? findCurrency(expense[0]) : settings.currency;
    return { income, expense, totalIncome, totalExpense, currency: primaryCurrency };
  }, [selectedDay, transactions, wallets, settings, year, month]);

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
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const txs = getTxForDay(day);
            const hasIncome = txs.some(t => t.type === 'income');
            const hasExpense = txs.some(t => t.type === 'expense');
            return (
              <button key={day} onClick={() => txs.length > 0 && setSelectedDay(selectedDay === day ? null : day)} className={`aspect-square rounded-xl flex flex-col items-center justify-center relative press-effect ${selectedDay === day ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                <span className="text-sm font-medium">{day}</span>
                {(hasIncome || hasExpense) && (
                  <div className="flex gap-0.5 mt-1">
                    {hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && selectedData && (
        <div className="mt-4 bg-white dark:bg-carddark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{selectedDay} de {currentDate.toLocaleString('es-ES', { month: 'long' })}</h3>
            <button onClick={() => setSelectedDay(null)} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800"><Icon name="X" size={14} /></button>
          </div>
          {selectedData.income.length + selectedData.expense.length === 0 ? (
            <p className="text-center text-gray-400 py-4">Sin movimientos este día</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center">
                <Icon name="TrendingUp" size={20} className="text-green-500 mx-auto mb-1" />
                <p className="text-xs text-green-600 font-semibold mb-1">Ingresos</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(selectedData.totalIncome, selectedData.currency)}</p>
                <p className="text-xs text-green-500">{selectedData.income.length} transacción{selectedData.income.length !== 1 ? 'es' : ''}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center">
                <Icon name="TrendingDown" size={20} className="text-red-500 mx-auto mb-1" />
                <p className="text-xs text-red-600 font-semibold mb-1">Gastos</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(selectedData.totalExpense, selectedData.currency)}</p>
                <p className="text-xs text-red-500">{selectedData.expense.length} transacción{selectedData.expense.length !== 1 ? 'es' : ''}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
