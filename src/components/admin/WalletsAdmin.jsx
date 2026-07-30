import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, generateId } from '../../utils/helpers';
import CrudItem from '../common/CrudItem';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const WalletsAdmin = () => {
  const { wallets, setWallets, accounts, currencies, settings, selectedAccountId } = useApp();
  const { show } = useToast();
  const [editing, setEditing] = useState(null);
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [formData, setFormData] = useState({ name: '', balance: 0, currency: settings.currency, icon: 'wallet', accountId: accounts[0]?.id });

  const openEdit = (w) => {
    setEditing(w ? w.id : 'new');
    setFormData(w || { name: '', balance: 0, currency: settings.currency, icon: 'wallet', accountId: accounts[0]?.id });
  };

  const save = () => {
    if (!formData.name) return show('Nombre requerido', 'error');
    if (editing === 'new') {
      setWallets([...wallets, { ...formData, id: generateId() }]);
      show('Billetera creada', 'success');
    } else {
      setWallets(wallets.map(w => w.id === editing ? { ...w, ...formData } : w));
      show('Billetera actualizada', 'success');
    }
    setEditing(null);
  };

  const remove = (id) => {
    if (wallets.length <= 1) return show('Debe haber al menos una billetera', 'error');
    setWallets(wallets.filter(w => w.id !== id));
    show('Billetera eliminada', 'success');
  };

  const filteredWallets = wallets.filter(w => (w.accountId || accounts[0]?.id) === selectedAccountId);
  const currentAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Billeteras</p>
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nueva
        </button>
      </div>

      <div className="space-y-2">
        {currentAccount && (
          <div className="flex items-center gap-2 px-1 text-indigo-600 dark:text-indigo-400 mb-2">
            <Icon name={currentAccount.icon} size={14} />
            <h4 className="text-xs font-bold uppercase tracking-wider">{currentAccount.name}</h4>
          </div>
        )}
        {filteredWallets.length === 0 && <p className="text-xs text-gray-400 pl-2">Sin billeteras</p>}
        {filteredWallets.map(w => (
            <CrudItem
              key={w.id}
              item={w}
              onEdit={openEdit}
              onDelete={remove}
              icon={w.icon || 'Wallet'}
              colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              subtext={`${formatCurrency(w.balance, getCurrency(w.currency))} • ${w.currency}`}
            />
          ))}
        </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva Billetera' : 'Editar Billetera'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" placeholder="Ej: Ahorros" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Cuenta</label>
            <select value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Saldo Inicial</label>
            <input type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Moneda</label>
            <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol}) — {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default WalletsAdmin;
