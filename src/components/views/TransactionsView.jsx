import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatShortDate, resolveCategory, generateId } from '../../utils/helpers';
import Icon from '../common/Icon';
import Modal from '../common/Modal';

const PERIODS = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Año' },
  { id: 'all', label: 'Todo' },
  { id: 'custom', label: 'Personalizado' }
];

const getBounds = (p) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  if (p === 'day') return { start: startOfDay, end: endOfDay };
  if (p === 'week') {
    const dow = (now.getDay() + 6) % 7;
    const start = new Date(startOfDay); start.setDate(start.getDate() - dow);
    return { start, end: endOfDay };
  }
  if (p === 'month') return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
  if (p === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    return { start: new Date(now.getFullYear(), q * 3, 1), end: new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59) };
  }
  if (p === 'year') return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59) };
  return { start: new Date(0), end: new Date(8640000000000000) };
};

const TransactionsView = () => {
  const { transactions, deleteTransaction, categories, wallets, accounts, setAccounts, currencies, setIsModalOpen, setEditingTx, selectedAccountId, setSelectedAccountId } = useApp();
  const { show } = useToast();
  const [type, setType] = useState('all');
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [accountDrawer, setAccountDrawer] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);

  const currentAccount = accounts.find(a => a.id === selectedAccountId);

  const hasFilters = type !== 'all' || period !== 'all' || !!search || !!customFrom || !!customTo;

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bounds = period === 'all' ? null : getBounds(period);
    const accountWalletIds = wallets.filter(w => w.accountId === selectedAccountId).map(w => w.id);
    return transactions.filter(t => {
      if (accountWalletIds.length && !accountWalletIds.includes(t.walletId)) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (bounds) {
        const d = new Date(t.date + 'T00:00:00');
        if (period === 'custom') {
          if (customFrom && d < new Date(customFrom + 'T00:00:00')) return false;
          if (customTo && d > new Date(customTo + 'T23:59:59')) return false;
        } else if (d < bounds.start || d > bounds.end) return false;
      }
      if (q) {
        const { cat, sub } = resolveCategory(t, categories);
        const wallet = wallets.find(w => w.id === t.walletId);
        const hay = [t.description, cat?.name, sub?.name, wallet?.name, t.date].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, type, period, search, customFrom, customTo, categories, wallets, selectedAccountId]);

  const summary = useMemo(() => {
    let inc = 0, exp = 0;
    filteredTx.forEach(t => {
      if (t.type === 'income') inc += parseFloat(t.amount);
      else if (t.type === 'expense') exp += parseFloat(t.amount);
    });
    const curr = wallets.find(w => w.accountId === selectedAccountId)?.currency || 'USD';
    return { income: inc, expense: exp, total: inc - exp, currency: getCurrency(curr) };
  }, [filteredTx, wallets, selectedAccountId, getCurrency]);

  const groupedTx = useMemo(() => {
    const groups = {};
    filteredTx.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a)).map(([date, txs]) => {
      let inc = 0, exp = 0;
      const curr = getCurrency(wallets.find(w => w.id === txs[0].walletId)?.currency);
      txs.forEach(t => { if (t.type === 'income') inc += parseFloat(t.amount); else if (t.type === 'expense') exp += parseFloat(t.amount); });
      return { date, txs, income: inc, expense: exp, currency: curr };
    });
  }, [filteredTx, wallets, getCurrency]);

  const clearFilters = () => {
    setType('all'); setPeriod('all'); setSearch(''); setCustomFrom(''); setCustomTo('');
  };

  const createAccount = () => {
    const name = newAccountName.trim();
    if (!name) return;
    const newAcc = { id: generateId(), name, icon: 'User' };
    setAccounts(prev => [...prev, newAcc]);
    setSelectedAccountId(newAcc.id);
    setNewAccountName('');
    setAccountDrawer(false);
    show('Cuenta creada', 'success');
  };

  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('es-ES', { month: 'short' });
    const isToday = new Date().toISOString().slice(0, 10) === dateStr;
    const isYesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10) === dateStr;
    let label = dayName;
    if (isToday) label = 'Hoy';
    else if (isYesterday) label = 'Ayer';
    return { label, dayNum, month, isToday };
  };

  return (
    <div className="flex flex-col h-full view-enter">
      <div className="p-4 sm:p-6 pb-2 space-y-3">
        <header className="flex items-center justify-between mb-1">
          <button onClick={() => setAccountDrawer(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold press-effect transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
            <Icon name="Building2" size={16} /> {currentAccount?.name || 'Cuenta'}
          </button>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-carddark border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold press-effect transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600">
            <Icon name="Search" size={16} /> Buscar
          </button>
        </header>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-2xl p-3.5 text-center transition-all duration-200">
            <p className="text-[10px] uppercase tracking-wider text-green-600 font-bold mb-1">Ingresos</p>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(summary.income, summary.currency)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-2xl p-3.5 text-center transition-all duration-200">
            <p className="text-[10px] uppercase tracking-wider text-red-600 font-bold mb-1">Gastos</p>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">{formatCurrency(summary.expense, summary.currency)}</p>
          </div>
          <div className={`border rounded-2xl p-3.5 text-center transition-all duration-200 ${summary.total >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200/50 dark:border-orange-800/30'}`}>
            <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${summary.total >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Total</p>
            <p className={`text-sm font-bold ${summary.total >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>{formatCurrency(summary.total, summary.currency)}</p>
          </div>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 press-effect transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300">
            <Icon name="FilterX" size={14} /> Filtros activos · Limpiar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll px-4 sm:px-6 pb-28 space-y-5">
        {groupedTx.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Icon name="ArrowLeftRight" size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Sin movimientos</p>
          </div>
        )}
        {groupedTx.map(({ date, txs, income, expense, currency }) => {
          const { label, dayNum, month, isToday } = formatDateHeader(date);
          return (
            <div key={date} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                    {dayNum}
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">{label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{month}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-bold">
                  {expense > 0 && <span className="text-red-500 dark:text-red-400">-{formatCurrency(expense, currency)}</span>}
                  {income > 0 && <span className="text-green-500 dark:text-green-400">+{formatCurrency(income, currency)}</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                {txs.map(tx => {
                  const { cat, sub } = resolveCategory(tx, categories);
                  const w = wallets.find(w => w.id === tx.walletId);
                  const cfg = tx.type === 'income'
                    ? { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: 'ArrowUpRight' }
                    : tx.type === 'expense'
                      ? { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: 'ArrowDownLeft' }
                      : { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'ArrowLeftRight' };
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setDetail(tx)}
                      className="bg-white dark:bg-carddark border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 active:scale-[0.98]"
                    >
                      <div className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0 transition-transform duration-200`}>
                        <Icon name={cat?.icon || cfg.icon} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{tx.description || cat?.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{sub ? `${sub.name} · ` : ''}{w?.name}</p>
                      </div>
                      <p className={`font-bold text-sm flex-shrink-0 ${cfg.text}`}>
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount, getCurrency(w?.currency))}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Buscar y filtrar">
        <div className="space-y-5">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nombre, fecha, categoría o billetera"
              className="w-full pl-9 pr-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tipo</p>
            <div className="flex gap-2">
              {['all', 'income', 'expense'].map(f => (
                <button key={f} onClick={() => setType(f)} className={`flex-1 py-2 rounded-lg text-sm font-semibold press-effect transition-all duration-200 ${type === f ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Rango de tiempo</p>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map(p => (
                <button key={p.id} onClick={() => setPeriod(p.id)} className={`py-2 rounded-lg text-sm font-semibold press-effect transition-all duration-200 ${period === p.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <div className="flex gap-2 mt-3">
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="flex-1 p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-blue-500" />
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="flex-1 p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={clearFilters} className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 press-effect transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">Limpiar</button>
            <button onClick={() => setOpen(false)} className="flex-[2] py-3 rounded-xl font-semibold bg-blue-600 text-white press-effect transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40">Ver resultados ({filteredTx.length})</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detalle de movimiento">
        {detail && (() => {
          const { cat, sub } = resolveCategory(detail, categories);
          const wallet = wallets.find(w => w.id === detail.walletId);
          const cfg = detail.type === 'income' ? { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Ingreso' } : detail.type === 'expense' ? { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Gasto' } : { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Transferencia' };
          return (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-2">
                <div className={`w-16 h-16 rounded-2xl ${cfg.bg} ${cfg.text} flex items-center justify-center mb-3`}><Icon name={cat?.icon || 'Wallet'} size={30} /></div>
                <p className={`text-3xl font-bold ${cfg.text}`}>{detail.type === 'expense' ? '-' : '+'}{formatCurrency(detail.amount, getCurrency(wallet?.currency))}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cfg.label}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800"><span className="text-gray-500 dark:text-gray-400">Descripción</span><span className="font-semibold text-right text-gray-800 dark:text-gray-200">{detail.description || cat?.name || '—'}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800"><span className="text-gray-500 dark:text-gray-400">Categoría</span><span className="font-semibold text-right text-gray-800 dark:text-gray-200">{cat?.name || '—'}{sub ? ` · ${sub.name}` : ''}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800"><span className="text-gray-500 dark:text-gray-400">Billetera</span><span className="font-semibold text-right text-gray-800 dark:text-gray-200">{wallet?.name || '—'}</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-500 dark:text-gray-400">Fecha</span><span className="font-semibold text-gray-800 dark:text-gray-200">{formatShortDate(detail.date)}</span></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setDetail(null); setEditingTx(detail); setIsModalOpen(true); }} className="flex-1 py-3 rounded-xl font-semibold bg-blue-600 text-white press-effect flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg">
                  <Icon name="Pencil" size={16} /> Editar
                </button>
                <button onClick={() => { deleteTransaction(detail.id); setDetail(null); show('Eliminado', 'success'); }} className="flex-1 py-3 rounded-xl font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 press-effect flex items-center justify-center gap-2 transition-all duration-200 border border-red-200/50 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40">
                  <Icon name="Trash2" size={16} /> Eliminar
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={accountDrawer} onClose={() => setAccountDrawer(false)} title="Cuentas">
        <div className="space-y-4">
          <div className="space-y-2">
            {accounts.map(a => (
              <button key={a.id} onClick={() => { setSelectedAccountId(a.id); setAccountDrawer(false); }} className={`w-full text-left p-3.5 rounded-2xl border press-effect flex items-center gap-3 transition-all duration-200 ${selectedAccountId === a.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-md shadow-blue-500/10' : 'bg-white dark:bg-carddark border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md'}`}>
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"><Icon name={a.icon || 'User'} size={18} /></div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{a.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{wallets.filter(w => w.accountId === a.id).length} billetera{wallets.filter(w => w.accountId === a.id).length !== 1 ? 's' : ''}</p>
                </div>
                {selectedAccountId === a.id && <Icon name="Check" size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newAccountName} onChange={e => setNewAccountName(e.target.value)} placeholder="Nueva cuenta..." className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-blue-500" onKeyDown={e => e.key === 'Enter' && createAccount()} />
            <button onClick={createAccount} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold press-effect text-sm transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg">Crear</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionsView;
