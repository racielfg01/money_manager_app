import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatShortDate } from '../../utils/helpers';
import Icon from '../common/Icon';

const WalletView = () => {
  const { wallets, transactions, categories, settings } = useApp();
  const totalBalance = wallets.reduce((acc, w) => acc + parseFloat(w.balance), 0);
  const recentTx = useMemo(() => [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5), [transactions]);

  return (
    <div className="p-4 sm:p-6 pb-28 space-y-6 view-enter">
      <header className="flex justify-between items-center">
        <div><p className="text-sm text-gray-500 dark:text-gray-400">Buen día 👋</p><h1 className="text-2xl font-bold">Mi Billetera</h1></div>
      </header>
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium flex items-center gap-2"><Icon name="Wallet" size={16} /> Saldo Total</p>
          <h2 className="text-4xl font-bold mt-2 tracking-tight">{formatCurrency(totalBalance, settings.currency)}</h2>
        </div>
      </div>
      <section>
        <h3 className="text-lg font-bold mb-3">Mis Billeteras</h3>
        <div className="space-y-2">
          {wallets.map(w => (
            <div key={w.id} className="bg-white dark:bg-carddark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md"><Icon name={w.icon || 'CreditCard'} size={20} /></div>
                <div className="text-left"><p className="font-semibold">{w.name}</p><p className="text-xs text-gray-500">{w.currency}</p></div>
              </div>
              <span className="font-bold text-lg">{formatCurrency(w.balance, w.currency)}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-lg font-bold mb-3">Recientes</h3>
        {recentTx.length === 0 ? <p className="text-gray-400 text-center py-4">Sin movimientos</p> : (
          <div className="space-y-2">
            {recentTx.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const cfg = tx.type === 'income' ? {bg:'bg-green-100', text:'text-green-600', icon:'ArrowDownLeft'} : {bg:'bg-red-100', text:'text-red-600', icon:'ArrowUpRight'};
              return (
                <div key={tx.id} className="bg-white dark:bg-carddark p-3.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center`}><Icon name={cat?.icon || cfg.icon} size={18} /></div>
                    <div><p className="font-semibold text-sm">{tx.description || cat?.name}</p><p className="text-xs text-gray-500">{formatShortDate(tx.date)}</p></div>
                  </div>
                  <p className={`font-bold ${cfg.text}`}>{tx.type==='expense'?'-':'+'}{formatCurrency(tx.amount)}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default WalletView;
