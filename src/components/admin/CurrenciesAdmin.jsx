import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import CrudItem from '../common/CrudItem';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const CurrenciesAdmin = () => {
  const { currencies, setCurrencies, wallets, settings, setSettings } = useApp();
  const { show } = useToast();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', symbol: '', decimals: 2 });

  const openEdit = (c) => {
    setEditing(c ? c.code : 'new');
    setFormData(c ? { ...c } : { code: '', name: '', symbol: '', decimals: 2 });
  };

  const save = () => {
    const code = formData.code.trim().toUpperCase();
    if (!code || !formData.name.trim()) return show('Código y nombre requeridos', 'error');
    if (!/^[A-Z]{3}$/.test(code)) return show('El código debe tener 3 letras', 'error');
    const exists = currencies.some(c => c.code === code && c.code !== editing);
    if (exists) return show('Esa moneda ya existe', 'error');
    const decimals = Math.max(0, Math.min(10, parseInt(formData.decimals) || 2));
    const data = { code, name: formData.name.trim(), symbol: formData.symbol.trim() || code, decimals };
    if (editing === 'new') {
      setCurrencies([...currencies, data]);
      show('Moneda creada', 'success');
    } else {
      setCurrencies(currencies.map(c => c.code === editing ? data : c));
      if (settings.currency === editing) setSettings({ ...settings, currency: code });
      show('Moneda actualizada', 'success');
    }
    setEditing(null);
  };

  const remove = (code) => {
    if (currencies.length <= 1) return show('Debe haber al menos una moneda', 'error');
    if (settings.currency === code) return show('No puedes eliminar la moneda predeterminada', 'error');
    if (wallets.some(w => w.currency === code)) return show('Moneda en uso por una billetera', 'error');
    setCurrencies(currencies.filter(c => c.code !== code));
    show('Moneda eliminada', 'success');
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-2">Moneda predeterminada de la app</p>
        <select
          value={settings.currency}
          onChange={e => setSettings({ ...settings, currency: e.target.value })}
          className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500"
        >
          {currencies.map(c => (
            <option key={c.code} value={c.code}>{c.code} ({c.symbol}) — {c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Monedas disponibles</p>
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nueva
        </button>
      </div>

      <div className="space-y-2">
        {currencies.map(c => (
          <CrudItem
            key={c.code}
            item={{ ...c, name: `${c.code} (${c.symbol})` }}
            onEdit={openEdit}
            onDelete={remove}
            icon="Coins"
            colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            subtext={c.name}
          />
        ))}
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva Moneda' : 'Editar Moneda'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Código (3 letras, ej: USD)</label>
            <input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} maxLength={3} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 uppercase" placeholder="USD" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" placeholder="Dólar estadounidense" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Símbolo</label>
            <input value={formData.symbol} onChange={e => setFormData({ ...formData, symbol: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" placeholder="$" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Decimales (0-10)</label>
            <input type="number" min={0} max={10} value={formData.decimals} onChange={e => setFormData({ ...formData, decimals: parseInt(e.target.value) || 0 })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" />
          </div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default CurrenciesAdmin;
