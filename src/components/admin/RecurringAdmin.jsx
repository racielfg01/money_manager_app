import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, generateId } from '../../utils/helpers';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const RecurringAdmin = () => {
  const { recurring, setRecurring, wallets, settings, currencies } = useApp();
  const { show } = useToast();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ description: '', amount: 0, frequency: 'monthly', categoryId: '', walletId: wallets[0]?.id || '', type: 'expense' });

  const openEdit = (r) => {
    setEditing(r ? r.id : 'new');
    setFormData(r || { description: '', amount: 0, frequency: 'monthly', categoryId: '', walletId: wallets[0]?.id || '', type: 'expense' });
  };

  const save = () => {
    if (!formData.description) return show('Descripción requerida', 'error');
    if (editing === 'new') {
      setRecurring([...recurring, { ...formData, id: generateId() }]);
      show('Transacción recurrente creada', 'success');
    } else {
      setRecurring(recurring.map(r => r.id === editing ? { ...r, ...formData } : r));
      show('Actualizada', 'success');
    }
    setEditing(null);
  };

  const freqLabels = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nueva Regla
        </button>
      </div>
      <div className="space-y-2">
        {recurring.length === 0 && <p className="text-center text-gray-400 py-4">Sin transacciones recurrentes</p>}
        {recurring.map(r => (
          <div key={r.id} className="bg-white dark:bg-carddark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p className="font-bold text-sm">{r.description}</p>
              <p className="text-xs text-gray-500">{freqLabels[r.frequency]} • {formatCurrency(r.amount, getCurrency(settings.currency))}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600"><Icon name="Pencil" size={14}/></button>
              <button onClick={() => { setRecurring(recurring.filter(x=>x.id!==r.id)); show('Eliminado','success'); }} className="p-1.5 text-red-600"><Icon name="Trash2" size={14}/></button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Transacción Recurrente">
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Descripción</label><input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Monto</label><input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Frecuencia</label>
            <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default RecurringAdmin;
