import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, generateId } from '../../utils/helpers';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const DebtsAdmin = () => {
  const { debts, setDebts, settings, currencies, selectedAccountId } = useApp();
  const { show } = useToast();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', amount: 0, type: 'owed_to_me', date: '' });

  const filteredDebts = debts.filter(d => d.accountId === selectedAccountId);

  const openEdit = (d) => {
    setEditing(d ? d.id : 'new');
    setFormData(d || { name: '', amount: 0, type: 'owed_to_me', date: '' });
  };

  const save = () => {
    if (!formData.name) return show('Nombre requerido', 'error');
    if (editing === 'new') {
      setDebts([...debts, { ...formData, id: generateId(), accountId: selectedAccountId }]);
      show('Deuda registrada', 'success');
    } else {
      setDebts(debts.map(d => d.id === editing ? { ...d, ...formData } : d));
      show('Deuda actualizada', 'success');
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Registrar Deuda
        </button>
      </div>
      <div className="space-y-2">
        {filteredDebts.length === 0 && <p className="text-center text-gray-400 py-4">Sin deudas registradas</p>}
        {filteredDebts.map(d => (
          <div key={d.id} className="bg-white dark:bg-carddark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p className="font-bold text-sm">{d.name}</p>
              <p className={`text-xs font-semibold ${d.type === 'owed_to_me' ? 'text-green-600' : 'text-red-600'}`}>
                {d.type === 'owed_to_me' ? 'Me deben' : 'Debo'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{formatCurrency(d.amount, getCurrency(settings.currency))}</span>
              <button onClick={() => openEdit(d)} className="p-1.5 text-blue-600"><Icon name="Pencil" size={14}/></button>
              <button onClick={() => { setDebts(debts.filter(x=>x.id!==d.id)); show('Eliminado','success'); }} className="p-1.5 text-red-600"><Icon name="Trash2" size={14}/></button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Registro de Deuda">
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Nombre / Persona</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Monto</label><input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
            <div className="flex gap-2">
              <button onClick={() => setFormData({...formData, type: 'owed_to_me'})} className={`flex-1 py-2 rounded-lg text-sm font-bold ${formData.type === 'owed_to_me' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800'}`}>Me deben</button>
              <button onClick={() => setFormData({...formData, type: 'i_owe'})} className={`flex-1 py-2 rounded-lg text-sm font-bold ${formData.type === 'i_owe' ? 'bg-red-100 text-red-700' : 'bg-gray-100 dark:bg-gray-800'}`}>Yo debo</button>
            </div>
          </div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default DebtsAdmin;
