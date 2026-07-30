import React, { useMemo, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, resolveCategory } from '../../utils/helpers';
import Icon from '../common/Icon';

const PIE_COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#a1a1aa'];

const StatisticsView = () => {
  const { transactions, categories, settings, currencies, wallets, selectedAccountId } = useApp();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [showAll, setShowAll] = useState(false);

  const accountWalletIds = useMemo(() => wallets.filter(w => w.accountId === selectedAccountId).map(w => w.id), [wallets, selectedAccountId]);
  const filteredTx = useMemo(() => transactions.filter(t => accountWalletIds.includes(t.walletId)), [transactions, accountWalletIds]);

  const stats = useMemo(() => {
    let income = 0, expense = 0;
    const byCategory = {};
    filteredTx.forEach(t => {
      if (t.type === 'income') income += parseFloat(t.amount);
      else if (t.type === 'expense') {
        expense += parseFloat(t.amount);
        const { cat, sub } = resolveCategory(t, categories);
        const key = sub ? `${cat?.id}:${sub.id}` : (cat?.id || 'other');
        byCategory[key] = (byCategory[key] || 0) + parseFloat(t.amount);
      }
    });
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    return { income, expense, net: income - expense, sortedCats: sorted, totalExp: expense || 1 };
  }, [filteredTx, categories]);

  const visibleCats = useMemo(() => {
    if (!stats.sortedCats.length) return [];
    return showAll ? stats.sortedCats : stats.sortedCats.slice(0, 10);
  }, [stats.sortedCats, showAll]);

  return (
    <div className="p-4 sm:p-6 pb-28 space-y-5 view-enter">
      <header><h1 className="text-2xl font-bold">Estadísticas</h1></header>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl"><p className="text-xs text-green-600 font-bold">Ingresos</p><p className="font-bold text-green-700 dark:text-green-300 mt-1 text-sm">{formatCurrency(stats.income, getCurrency(settings.currency))}</p></div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl"><p className="text-xs text-red-600 font-bold">Gastos</p><p className="font-bold text-red-700 dark:text-red-300 mt-1 text-sm">{formatCurrency(stats.expense, getCurrency(settings.currency))}</p></div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl"><p className="text-xs text-blue-600 font-bold">Neto</p><p className="font-bold text-blue-700 dark:text-blue-300 mt-1 text-sm">{formatCurrency(stats.net, getCurrency(settings.currency))}</p></div>
      </div>

      <div className="bg-white dark:bg-carddark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold mb-4">Distribución de Gastos</h3>

        {stats.sortedCats.length === 0 ? (
          <p className="text-gray-400 text-center">Sin datos</p>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg viewBox="0 0 36 36" className="w-40 h-40">
                {stats.sortedCats.map(([key, amount], i) => {
                  const pct = amount / stats.totalExp;
                  const prevTotal = stats.sortedCats.slice(0, i).reduce((s, [,a]) => s + a, 0);
                  const prevPct = prevTotal / stats.totalExp;
                  const offset = prevPct * 360;
                  const length = pct * 360;
                  const color = PIE_COLORS[i % PIE_COLORS.length];
                  return (
                    <circle key={key} cx="18" cy="18" r="15.915" fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={`${length} ${360 - length}`} strokeDashoffset={-offset} transform="rotate(-90 18 18)" strokeLinecap="butt" />
                  );
                })}
              </svg>
            </div>

            <div className="space-y-3">
              {visibleCats.map(([key, amount], i) => {
                const [catId, subId] = key.split(':');
                const cat = categories.find(c => c.id === catId) || { name: 'Otros', color: '#6b7280' };
                const sub = cat.subcategories?.find(s => s.id === subId);
                const label = sub ? `${cat.name} · ${sub.name}` : cat.name;
                const color = sub?.color || PIE_COLORS[i % PIE_COLORS.length];
                const percent = ((amount / stats.totalExp) * 100).toFixed(1);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="truncate">{label}</span>
                      </div>
                      <span className="font-semibold text-gray-500 ml-2">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.sortedCats.length > 10 && (
              <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 press-effect transition-colors mx-auto hover:text-blue-700 dark:hover:text-blue-300">
                {showAll ? 'Mostrar menos' : `Ver más (${stats.sortedCats.length - 10} restantes)`}
                <Icon name={showAll ? 'ChevronUp' : 'ChevronDown'} size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
