import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, generateId } from '../../utils/helpers';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const GoalsAdmin = () => {
  const { goals, setGoals, settings, currencies } = useApp();
  const { show } = useToast();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', targetAmount: 0, currentAmount: 0, deadline: '' });

  const openEdit = (g) => {
    setEditing(g ? g.id : 'new');
    setFormData(g || { name: '', targetAmount: 0, currentAmount: 0, deadline: '' });
  };

  const save = () => {
    if (!formData.name) return show('Nombre requerido', 'error');
    if (editing === 'new') {
      setGoals([...goals, { ...formData, id: generateId() }]);
      show('Objetivo creado', 'success');
    } else {
      setGoals(goals.map(g => g.id === editing ? { ...g, ...formData } : g));
      show('Objetivo actualizado', 'success');
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nuevo Objetivo
        </button>
      </div>
      <div className="space-y-2">
        {goals.length === 0 && <p className="text-center text-gray-400 py-4">Sin objetivos de ahorro</p>}
        {goals.map(g => {
          const percent = Math.min(100, (g.currentAmount / g.targetAmount) * 100).toFixed(0);
          return (
            <div key={g.id} className="bg-white dark:bg-carddark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{g.name}</p>
                  <p className="text-xs text-gray-500">Meta: {formatDate(g.deadline)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Icon name="Pencil" size={14}/></button>
                  <button onClick={() => { setGoals(goals.filter(x=>x.id!==g.id)); show('Eliminado','success'); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Icon name="Trash2" size={14}/></button>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{formatCurrency(g.currentAmount, getCurrency(settings.currency))}</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all" style={{width: `${percent}%`}}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Objetivo de Ahorro">
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Meta ($)</label><input type="number" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Actual ($)</label><input type="number" value={formData.currentAmount} onChange={e => setFormData({...formData, currentAmount: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Límite</label><input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" /></div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsAdmin;
