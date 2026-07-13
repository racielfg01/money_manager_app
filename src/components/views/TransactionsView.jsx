import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatShortDate } from '../../utils/helpers';
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
  const { transactions, deleteTransaction, categories, wallets } = useApp();
  const { show } = useToast();
  const [type, setType] = useState('all');
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [open, setOpen] = useState(false);

  const hasFilters = type !== 'all' || period !== 'all' || !!search || !!customFrom || !!customTo;

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bounds = period === 'all' ? null : getBounds(period);
    return transactions.filter(t => {
      if (type !== 'all' && t.type !== type) return false;
      if (bounds) {
        const d = new Date(t.date + 'T00:00:00');
        if (period === 'custom') {
          if (customFrom && d < new Date(customFrom + 'T00:00:00')) return false;
          if (customTo && d > new Date(customTo + 'T23:59:59')) return false;
        } else if (d < bounds.start || d > bounds.end) return false;
      }
      if (q) {
        const cat = categories.find(c => c.id === t.categoryId);
        const wallet = wallets.find(w => w.id === t.walletId);
        const hay = [t.description, cat?.name, wallet?.name, t.date].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, type, period, search, customFrom, customTo, categories, wallets]);

  const clearFilters = () => {
    setType('all'); setPeriod('all'); setSearch(''); setCustomFrom(''); setCustomTo('');
  };

  return (
    <div className="flex flex-col h-full view-enter">
      <div className="p-4 sm:p-6 pb-2 space-y-3">
        <header className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">Movimientos</h1>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold press-effect">
            <Icon name="Search" size={16} /> Buscar
          </button>
        </header>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 flex items-center gap-1 press-effect">
            <Icon name="FilterX" size={14} /> Filtros activos · Limpiar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll px-4 sm:px-6 pb-28 space-y-2">
        {filteredTx.length === 0 && <p className="text-center text-gray-400 py-8">Sin movimientos</p>}
        {filteredTx.map(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          const cfg = tx.type === 'income' ? {bg:'bg-green-100', text:'text-green-600', icon:'ArrowDownLeft'} : tx.type === 'expense' ? {bg:'bg-red-100', text:'text-red-600', icon:'ArrowUpRight'} : {bg:'bg-blue-100', text:'text-blue-600', icon:'ArrowLeftRight'};
          return (
            <div key={tx.id} className="bg-white dark:bg-carddark p-3.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center`}><Icon name={cat?.icon || cfg.icon} size={18} /></div>
                <div><p className="font-semibold text-sm">{tx.description || cat?.name}</p><p className="text-xs text-gray-500">{formatShortDate(tx.date)}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`font-bold ${cfg.text}`}>{tx.type==='expense'?'-':'+'}{formatCurrency(tx.amount)}</p>
                <button onClick={() => { deleteTransaction(tx.id); show('Eliminado', 'success'); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-500"><Icon name="Trash2" size={14}/></button>
              </div>
            </div>
          )
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
                <button key={f} onClick={() => setType(f)} className={`flex-1 py-2 rounded-lg text-sm font-semibold press-effect ${type === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Rango de tiempo</p>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map(p => (
                <button key={p.id} onClick={() => setPeriod(p.id)} className={`py-2 rounded-lg text-sm font-semibold press-effect ${period === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
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
            <button onClick={clearFilters} className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 press-effect">Limpiar</button>
            <button onClick={() => setOpen(false)} className="flex-[2] py-3 rounded-xl font-semibold bg-blue-600 text-white press-effect">Ver resultados ({filteredTx.length})</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionsView;
