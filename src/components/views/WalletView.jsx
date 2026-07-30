import React, { useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import Icon from '../common/Icon';

const WalletView = () => {
  const { wallets, currencies, selectedAccountId } = useApp();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);

  const byCurrency = useMemo(() => {
    const map = {};
    wallets
      .filter(w => w.accountId === selectedAccountId)
      .forEach(w => {
        const code = w.currency || 'USD';
        map[code] = (map[code] || 0) + parseFloat(w.balance);
      });
    return Object.entries(map).map(([code, total]) => ({ code, total, currency: getCurrency(code) }));
  }, [wallets, selectedAccountId, getCurrency]);

  const currentWallets = useMemo(() => {
    return wallets.filter(w => w.accountId === selectedAccountId);
  }, [wallets, selectedAccountId]);

  return (
    <div className="p-4 sm:p-6 pb-28 space-y-5 view-enter">
      <header>
        <p className="text-sm text-gray-500 dark:text-gray-400">Buen día 👋</p>
        <h1 className="text-2xl font-bold">Mi Billetera</h1>
      </header>

      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium flex items-center gap-2 mb-3"><Icon name="Wallet" size={16} /> Saldo Total</p>
          <div className="space-y-1.5">
            {byCurrency.map(({ code, total, currency }) => (
              <div key={code} className="flex items-center justify-between text-white/90">
                <span className="text-sm font-medium">{code}</span>
                <span className="text-lg font-bold tracking-tight">{formatCurrency(total, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentWallets.map(w => (
          <div key={w.id} className="bg-white dark:bg-carddark border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md mb-2">
              <Icon name={w.icon || 'CreditCard'} size={20} />
            </div>
            <p className="font-semibold text-sm truncate w-full">{w.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{w.currency}</p>
            <p className="font-bold text-sm mt-1.5">{formatCurrency(w.balance, getCurrency(w.currency))}</p>
          </div>
        ))}
      </div>

      {currentWallets.length === 0 && (
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
