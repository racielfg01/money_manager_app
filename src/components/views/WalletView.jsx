import React, { useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import Icon from '../common/Icon';

const WalletView = () => {
  const { wallets, accounts, currencies, settings } = useApp();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);

  const groupedByAccount = useMemo(() => {
    return accounts.map(a => ({
      ...a,
      wallets: wallets.filter(w => w.accountId === a.id)
    })).filter(a => a.wallets.length > 0);
  }, [accounts, wallets]);

  const byCurrency = useMemo(() => {
    const map = {};
    wallets.forEach(w => {
      const code = w.currency || 'USD';
      map[code] = (map[code] || 0) + parseFloat(w.balance);
    });
    return Object.entries(map).map(([code, total]) => ({ code, total, currency: getCurrency(code) }));
  }, [wallets, getCurrency]);

  const totalAll = useMemo(() => {
    return wallets.reduce((acc, w) => acc + parseFloat(w.balance), 0);
  }, [wallets]);

  return (
    <div className="p-4 sm:p-6 pb-28 space-y-5 view-enter">
      <header>
        <p className="text-sm text-gray-500 dark:text-gray-400">Buen día 👋</p>
        <h1 className="text-2xl font-bold">Mi Billetera</h1>
      </header>

      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium flex items-center gap-2"><Icon name="Wallet" size={16} /> Saldo Total</p>
          <h2 className="text-4xl font-bold mt-2 tracking-tight">{formatCurrency(totalAll, getCurrency(settings.currency))}</h2>
        </div>
      </div>

      {byCurrency.length > 1 && (
        <section>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Por Moneda</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {byCurrency.map(({ code, total, currency }) => (
              <div key={code} className="flex-shrink-0 bg-white dark:bg-carddark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 min-w-[130px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{code}</p>
                <p className="font-bold text-sm mt-0.5">{formatCurrency(total, currency)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {groupedByAccount.map(account => (
        <section key={account.id}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icon name={account.icon || 'User'} size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="font-bold text-sm">{account.name}</h3>
          </div>
          <div className="space-y-2">
            {account.wallets.map(w => (
              <div key={w.id} className="bg-white dark:bg-carddark border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Icon name={w.icon || 'CreditCard'} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{w.name}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{w.currency}</p>
                </div>
                <p className="font-bold text-sm flex-shrink-0">{formatCurrency(w.balance, getCurrency(w.currency))}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {groupedByAccount.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Icon name="Wallet" size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Sin billeteras</p>
        </div>
      )}
    </div>
  );
};

export default WalletView;
