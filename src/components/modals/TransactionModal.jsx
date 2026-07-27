import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/helpers';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const evalExpr = (expr) => {
  const tokens = String(expr).match(/(\d+\.?\d*|\.\d+|[+\-*/])/g);
  if (!tokens || /[+\-*/]$/.test(String(expr))) return NaN;
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const out = [], ops = [];
  for (const t of tokens) {
    if (/[0-9.]/.test(t)) out.push(parseFloat(t));
    else {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop());
      ops.push(t);
    }
  }
  while (ops.length) out.push(ops.pop());
  const st = [];
  for (const t of out) {
    if (typeof t === 'number') st.push(t);
    else {
      const b = st.pop(), a = st.pop();
      if (t === '+') st.push(a + b);
      else if (t === '-') st.push(a - b);
      else if (t === '*') st.push(a * b);
      else if (t === '/') st.push(a / b);
    }
  }
  const r = st[0];
  return typeof r === 'number' && isFinite(r) ? r : NaN;
};

const typeLabels = {
  income: { label: 'Ingreso', icon: 'ArrowDownLeft', color: 'green' },
  expense: { label: 'Gasto', icon: 'ArrowUpRight', color: 'red' },
  transfer: { label: 'Transfer.', icon: 'ArrowLeftRight', color: 'blue' }
};

const TransactionModal = ({ editing = null }) => {
  const { isModalOpen, setIsModalOpen, setEditingTx, addTransaction, updateTransaction, deleteTransaction, wallets, categories, settings, currencies } = useApp();
  const { show } = useToast();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [catId, setCatId] = useState('');
  const [subId, setSubId] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalc, setShowCalc] = useState(false);
  const [calcFresh, setCalcFresh] = useState(false);
  const skipFocus = useRef(false);

  const filteredCats = categories.filter(c => c.type === type);

  useEffect(() => {
    if (!isModalOpen) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setDesc(editing.description || '');
      setCatId(editing.categoryId || '');
      setSubId(editing.subcategoryId || '');
      setWalletId(editing.walletId || wallets[0]?.id || '');
      setToWalletId(editing.toWalletId || wallets[1]?.id || wallets[0]?.id || '');
      setDate(editing.date || new Date().toISOString().split('T')[0]);
    } else {
      setType('expense');
      setAmount('');
      setDesc('');
      setCatId('');
      setSubId('');
      setWalletId(wallets[0]?.id || '');
      setToWalletId(wallets[1]?.id || wallets[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setShowCalc(false);
    setCalcFresh(false);
  }, [isModalOpen, editing, wallets]);

  const appendZeros = () => {
    const zeros = '0'.repeat(settings.zerosMode);
    setAmount(prev => {
      if (prev === '' || prev === '0') return zeros;
      return prev + zeros;
    });
  };

  const handleSave = () => {
    const finalAmount = isNaN(evalExpr(amount)) ? amount : String(evalExpr(amount));
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      show('Ingresa un importe válido', 'error');
      return;
    }
    if (type !== 'transfer' && !walletId) {
      show('Selecciona una billetera', 'error');
      return;
    }
    if (type === 'transfer' && walletId === toWalletId) {
      show('Las billeteras deben ser diferentes', 'error');
      return;
    }

    const txData = {
      type,
      amount: parseFloat(finalAmount),
      description: desc,
      categoryId: type !== 'transfer' ? catId : null,
      subcategoryId: type !== 'transfer' && catId ? subId || null : null,
      walletId: type === 'transfer' ? walletId : walletId,
      fromWalletId: type === 'transfer' ? walletId : undefined,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      date
    };
    if (editing) {
      updateTransaction(editing.id, txData);
      show('Transacción actualizada', 'success');
    } else {
      addTransaction(txData);
      show('Transacción guardada', 'success');
    }
    setIsModalOpen(false);
    if (setEditingTx) setEditingTx(null);
  };

  const handleCalcInput = (val) => {
    if (calcFresh) {
      setCalcFresh(false);
      setAmount(val === '.' ? '0.' : val);
      return;
    }
    setAmount(prev => {
      if (val === '.') {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      }
      return prev + val;
    });
  };

  const handleOperator = (op) => {
    setCalcFresh(false);
    setAmount(prev => {
      if (prev === '') return prev;
      if (/[+\-*/]$/.test(prev)) return prev.slice(0, -1) + op;
      return prev + op;
    });
  };

  const handleEquals = () => {
    setAmount(prev => {
      const r = evalExpr(prev);
      if (isNaN(r)) return prev;
      setCalcFresh(true);
      return String(Number(r.toFixed(6)));
    });
  };

  const openCalcFromFocus = () => {
    if (skipFocus.current) { skipFocus.current = false; return; }
    setShowCalc(true);
  };

  const closeCalc = (cancel) => {
    if (cancel) setAmount('');
    skipFocus.current = true;
    setShowCalc(false);
  };

  if (showCalc) {
    return (
      <Modal isOpen={isModalOpen} onClose={() => closeCalc(false)} title="Importe" showDragHandle={false}>
        <div className="flex flex-col min-h-[70dvh]">
          <div className="flex flex-col flex-1 justify-center px-2 py-8">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide text-center">Importe</p>
            <p className="text-5xl font-bold text-center break-all">{amount || '0.00'}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800/70 p-3 rounded-2xl">
            <div className="grid grid-cols-4 gap-2">
              {[7,8,9].map(n => (
                <button key={n} onClick={() => handleCalcInput(String(n))} className="h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xl font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{n}</button>
              ))}
              <button onClick={() => handleOperator('/')} className="h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl shadow-sm text-xl font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">÷</button>
              {[4,5,6].map(n => (
                <button key={n} onClick={() => handleCalcInput(String(n))} className="h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xl font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{n}</button>
              ))}
              <button onClick={() => handleOperator('*')} className="h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl shadow-sm text-xl font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">×</button>
              {[1,2,3].map(n => (
                <button key={n} onClick={() => handleCalcInput(String(n))} className="h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xl font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{n}</button>
              ))}
              <button onClick={() => handleOperator('-')} className="h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl shadow-sm text-xl font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">−</button>
              <button onClick={() => handleCalcInput('.')} className="h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xl font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">.</button>
              <button onClick={() => handleCalcInput('0')} className="h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xl font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">0</button>
              <button onClick={() => handleCalcInput('0'.repeat(settings.zerosMode))} className="h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xl font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{'0'.repeat(settings.zerosMode)}</button>
              <button onClick={() => handleOperator('+')} className="h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl shadow-sm text-xl font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">+</button>
              <button onClick={() => setAmount('')} className="h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl shadow-sm text-sm font-bold press-effect">C</button>
              <button onClick={() => setAmount(prev => prev.slice(0, -1))} className="h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl shadow-sm font-bold press-effect flex items-center justify-center">
                <Icon name="Delete" size={20} />
              </button>
              <button onClick={handleEquals} className="h-14 bg-green-600 text-white rounded-xl shadow-sm font-bold press-effect hover:bg-green-700 transition-colors">=</button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => closeCalc(false)} className="flex-1 py-3.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 press-effect">Cancelar</button>
            <button onClick={() => closeCalc(false)} className="flex-[2] py-3.5 rounded-xl font-semibold bg-blue-600 text-white press-effect">OK</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Editar transacción' : 'Nueva transacción'}>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {Object.entries(typeLabels).map(([key, val]) => {
          const active = type === key;
          return (
            <button
              key={key}
              onClick={() => { setType(key); setCatId(''); }}
              className={`py-3 px-2 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 transition-all press-effect ${
                active
                  ? `bg-${val.color}-50 dark:bg-${val.color}-950/40 text-${val.color}-600 dark:text-${val.color}-400 ring-2 ring-${val.color}-500/30`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon name={val.icon} size={18} />
              <span>{val.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Importe</label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            onFocus={openCalcFromFocus}
            className="w-full text-3xl font-bold p-4 pr-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="0.00"
            aria-label="Importe"
          />
          <button
            onClick={appendZeros}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold press-effect hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
          >
            +{'0'.repeat(settings.zerosMode)}
          </button>
        </div>

        {showCalc && (
          <div className="mt-3 bg-gray-100 dark:bg-gray-800/70 p-3 rounded-xl animate-scale-in">
            <div className="grid grid-cols-4 gap-2">
              {[7,8,9].map(n => (
                <button key={n} onClick={() => handleCalcInput(String(n))} className="h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-lg font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{n}</button>
              ))}
              <button onClick={() => handleOperator('/')} className="h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg shadow-sm text-lg font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">÷</button>
              {[4,5,6].map(n => (
                <button key={n} onClick={() => handleCalcInput(String(n))} className="h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-lg font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{n}</button>
              ))}
              <button onClick={() => handleOperator('*')} className="h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg shadow-sm text-lg font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">×</button>
              {[1,2,3].map(n => (
                <button key={n} onClick={() => handleCalcInput(String(n))} className="h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-lg font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{n}</button>
              ))}
              <button onClick={() => handleOperator('-')} className="h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg shadow-sm text-lg font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">−</button>
              <button onClick={() => handleCalcInput('.')} className="h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-lg font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">.</button>
              <button onClick={() => handleCalcInput('0')} className="h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-lg font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">0</button>
              <button onClick={() => handleCalcInput('0'.repeat(settings.zerosMode))} className="h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-lg font-semibold press-effect hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">{'0'.repeat(settings.zerosMode)}</button>
              <button onClick={() => handleOperator('+')} className="h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg shadow-sm text-lg font-bold press-effect hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">+</button>
              <button onClick={() => setAmount('')} className="h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg shadow-sm text-sm font-bold press-effect">C</button>
              <button onClick={() => setAmount(prev => prev.slice(0, -1))} className="h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg shadow-sm font-bold press-effect flex items-center justify-center">
                <Icon name="Delete" size={18} />
              </button>
              <button onClick={handleEquals} className="h-12 bg-green-600 text-white rounded-lg shadow-sm font-bold press-effect hover:bg-green-700 transition-colors">=</button>
              <button onClick={() => setShowCalc(false)} className="h-12 bg-blue-600 text-white rounded-lg shadow-sm font-bold press-effect hover:bg-blue-700 transition-colors">OK</button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Descripción</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ej: Supermercado" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors" />
        </div>

        {type !== 'transfer' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Categoría</label>
              <select
                value={catId}
                onChange={e => { setCatId(e.target.value); setSubId(''); }}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="">Selecciona una categoría</option>
                {filteredCats.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {catId && (categories.find(c => c.id === catId)?.subcategories || []).length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Subcategoría</label>
                <select
                  value={subId}
                  onChange={e => setSubId(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors text-sm text-gray-700 dark:text-gray-200"
                >
                  <option value="">Sin subcategoría</option>
                  {categories.find(c => c.id === catId).subcategories.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Billetera</label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors text-sm text-gray-700 dark:text-gray-200"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} — {formatCurrency(w.balance, getCurrency(w.currency))}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">De</label>
              <select
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors text-sm text-gray-700 dark:text-gray-200"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} — {formatCurrency(w.balance, getCurrency(w.currency))}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">A</label>
              <select
                value={toWalletId}
                onChange={e => setToWalletId(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-500 focus:outline-none transition-colors text-sm text-gray-700 dark:text-gray-200"
              >
                {wallets.filter(w => w.id !== walletId).map(w => (
                  <option key={w.id} value={w.id}>{w.name} — {formatCurrency(w.balance, getCurrency(w.currency))}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {editing && (
          <button onClick={() => { deleteTransaction(editing.id); setIsModalOpen(false); show('Eliminado', 'success'); }} className="w-full py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 press-effect">Eliminar transacción</button>
        )}
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-carddark pt-4 pb-2 -mx-5 px-5 border-t border-gray-100 dark:border-gray-800 mt-6 flex gap-3">
        <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 press-effect hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
        <button onClick={handleSave} className="flex-[2] py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 press-effect hover:shadow-xl hover:shadow-blue-500/40 transition-all">Guardar</button>
      </div>
    </Modal>
  );
};

export default TransactionModal;
