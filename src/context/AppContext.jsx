import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { generateId } from '../utils/helpers';

const AppContext = createContext();

const defaultAccounts = [
  { id: 'a1', name: 'Personal', icon: 'User' }
];

const defaultWallets = [
  { id: 'w1', name: 'Efectivo', balance: 500, currency: 'USD', icon: 'banknote', accountId: 'a1' },
  { id: 'w2', name: 'Banco', balance: 2500, currency: 'USD', icon: 'credit-card', accountId: 'a1' }
];

const defaultCategories = [
  { id: 'c1', name: 'Salario', type: 'income', color: '#10b981', icon: 'briefcase', subcategories: [] },
  { id: 'c2', name: 'Freelance', type: 'income', color: '#06b6d4', icon: 'laptop', subcategories: [] },
  { id: 'c3', name: 'Comida', type: 'expense', color: '#ef4444', icon: 'utensils', subcategories: [] },
  { id: 'c4', name: 'Transporte', type: 'expense', color: '#f59e0b', icon: 'car', subcategories: [] },
  { id: 'c5', name: 'Ocio', type: 'expense', color: '#8b5cf6', icon: 'gamepad-2', subcategories: [] },
  { id: 'c6', name: 'Servicios', type: 'expense', color: '#3b82f6', icon: 'zap', subcategories: [] }
];

const defaultSettings = {
  theme: 'light',
  firstDayWeek: 1,
  zerosMode: 2,
  homeScreen: 'wallet',
  currency: 'CUP'
};

const defaultCurrencies = [
  { code: 'CUP', name: 'Peso cubano', symbol: '$', decimals: 2 },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$', decimals: 2 },
  { code: 'COP', name: 'Peso colombiano', symbol: '$', decimals: 2 }
];

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => StorageService.get('transactions') || []);
  const [wallets, setWallets] = useState(() => StorageService.get('wallets') || defaultWallets);
  const [accounts, setAccounts] = useState(() => StorageService.get('accounts') || defaultAccounts);
  const [categories, setCategories] = useState(() => StorageService.get('categories') || defaultCategories);
  const [settings, setSettings] = useState(() => StorageService.get('settings') || defaultSettings);
  const [currencies, setCurrencies] = useState(() => StorageService.get('currencies') || defaultCurrencies);
  const [view, setView] = useState(() => (StorageService.get('settings')?.homeScreen) || 'wallet');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [budgets, setBudgets] = useState(() => StorageService.get('budgets') || []);
  const [goals, setGoals] = useState(() => StorageService.get('goals') || []);
  const [debts, setDebts] = useState(() => StorageService.get('debts') || []);
  const [recurring, setRecurring] = useState(() => StorageService.get('recurring') || []);

  // Persistencia
  useEffect(() => { StorageService.set('transactions', transactions); }, [transactions]);
  useEffect(() => { StorageService.set('wallets', wallets); }, [wallets]);
  useEffect(() => { StorageService.set('accounts', accounts); }, [accounts]);
  useEffect(() => { StorageService.set('categories', categories); }, [categories]);
  useEffect(() => { StorageService.set('settings', settings); }, [settings]);
  useEffect(() => { StorageService.set('currencies', currencies); }, [currencies]);
  useEffect(() => { StorageService.set('budgets', budgets); }, [budgets]);
  useEffect(() => { StorageService.set('goals', goals); }, [goals]);
  useEffect(() => { StorageService.set('debts', debts); }, [debts]);
  useEffect(() => { StorageService.set('recurring', recurring); }, [recurring]);

  // Tema oscuro
  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  const addTransaction = (tx) => {
    const newTx = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
    if (tx.type === 'income') {
      setWallets(prev => prev.map(w => w.id === tx.walletId ? { ...w, balance: parseFloat(w.balance) + parseFloat(tx.amount) } : w));
    } else if (tx.type === 'expense') {
      setWallets(prev => prev.map(w => w.id === tx.walletId ? { ...w, balance: parseFloat(w.balance) - parseFloat(tx.amount) } : w));
    } else if (tx.type === 'transfer') {
      setWallets(prev => prev.map(w => {
        if (w.id === tx.fromWalletId) return { ...w, balance: parseFloat(w.balance) - parseFloat(tx.amount) };
        if (w.id === tx.toWalletId) return { ...w, balance: parseFloat(w.balance) + parseFloat(tx.amount) };
        return w;
      }));
    }
    setTransactions(prev => [newTx, ...prev]);
    setIsModalOpen(false);
    return newTx;
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    if (tx.type === 'income') {
      setWallets(prev => prev.map(w => w.id === tx.walletId ? { ...w, balance: parseFloat(w.balance) - parseFloat(tx.amount) } : w));
    } else if (tx.type === 'expense') {
      setWallets(prev => prev.map(w => w.id === tx.walletId ? { ...w, balance: parseFloat(w.balance) + parseFloat(tx.amount) } : w));
    } else if (tx.type === 'transfer') {
      setWallets(prev => prev.map(w => {
        if (w.id === tx.fromWalletId) return { ...w, balance: parseFloat(w.balance) + parseFloat(tx.amount) };
        if (w.id === tx.toWalletId) return { ...w, balance: parseFloat(w.balance) - parseFloat(tx.amount) };
        return w;
      }));
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id, tx) => {
    const old = transactions.find(t => t.id === id);
    if (!old) return;
    const apply = (t, sign) => {
      if (t.type === 'income') {
        setWallets(prev => prev.map(w => w.id === t.walletId ? { ...w, balance: parseFloat(w.balance) + sign * parseFloat(t.amount) } : w));
      } else if (t.type === 'expense') {
        setWallets(prev => prev.map(w => w.id === t.walletId ? { ...w, balance: parseFloat(w.balance) - sign * parseFloat(t.amount) } : w));
      } else if (t.type === 'transfer') {
        setWallets(prev => prev.map(w => {
          if (w.id === t.fromWalletId) return { ...w, balance: parseFloat(w.balance) - sign * parseFloat(t.amount) };
          if (w.id === t.toWalletId) return { ...w, balance: parseFloat(w.balance) + sign * parseFloat(t.amount) };
          return w;
        }));
      }
    };
    apply(old, -1);
    apply(tx, 1);
    setTransactions(prev => prev.map(t => t.id === id ? { ...tx, id } : t));
  };

  const value = {
    transactions, wallets, accounts, setAccounts, categories, currencies, setCurrencies, settings, setSettings, view, setView, isModalOpen, setIsModalOpen, editingTx, setEditingTx,
    addTransaction, deleteTransaction, updateTransaction, setWallets, setCategories,
    budgets, setBudgets, goals, setGoals, debts, setDebts, recurring, setRecurring
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
