import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';

const StatisticsView = () => {
  const { transactions, categories, settings } = useApp();
  const stats = useMemo(() => {
    let income = 0, expense = 0;
    const byCategory = {};
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') {
        expense += t.amount;
        byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount;
      }
    });
    return { income, expense, net: income - expense, sortedCats: Object.entries(byCategory).sort((a,b) => b[1]-a[1]), totalExp: expense || 1 };
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 pb-28 space-y-5 view-enter">
      <header><h1 className="text-2xl font-bold">Estadísticas</h1></header>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl"><p className="text-xs text-green-600 font-bold">Ingresos</p><p className="font-bold text-green-700 dark:text-green-300 mt-1 text-sm">{formatCurrency(stats.income, settings.currency)}</p></div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl"><p className="text-xs text-red-600 font-bold">Gastos</p><p className="font-bold text-red-700 dark:text-red-300 mt-1 text-sm">{formatCurrency(stats.expense, settings.currency)}</p></div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl"><p className="text-xs text-blue-600 font-bold">Neto</p><p className="font-bold text-blue-700 dark:text-blue-300 mt-1 text-sm">{formatCurrency(stats.net, settings.currency)}</p></div>
      </div>
      <div className="bg-white dark:bg-carddark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold mb-4">Distribución de Gastos</h3>
        {stats.sortedCats.length === 0 ? <p className="text-gray-400 text-center">Sin datos</p> : (
          <div className="space-y-3">
            {stats.sortedCats.map(([catId, amount]) => {
              const cat = categories.find(c => c.id === catId) || {name: 'Otros', color: '#6b7280'};
              const percent = ((amount / stats.totalExp) * 100).toFixed(1);
              return (
                <div key={catId}>
                  <div className="flex justify-between text-sm mb-1"><span>{cat.name}</span><span>{percent}%</span></div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2"><div className="h-2 rounded-full transition-all" style={{width: `${percent}%`, backgroundColor: cat.color}}></div></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
