import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, generateId } from '../../utils/helpers';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const BudgetsAdmin = () => {
  const { budgets, setBudgets, categories, settings, currencies } = useApp();
  const { show } = useToast();
  const getCurrency = useCallback((code) => currencies.find(c => c.code === code) || { code, decimals: 2 }, [currencies]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ categoryId: '', limit: 0 });

  const openEdit = (b) => {
    setEditing(b ? b.id : 'new');
    setFormData(b || { categoryId: '', limit: 0 });
  };

  const save = () => {
    if (!formData.categoryId || formData.limit <= 0) return show('Datos inválidos', 'error');
    if (editing === 'new') {
      setBudgets([...budgets, { ...formData, id: generateId() }]);
      show('Presupuesto creado', 'success');
    } else {
      setBudgets(budgets.map(b => b.id === editing ? { ...b, ...formData } : b));
      show('Presupuesto actualizado', 'success');
    }
    setEditing(null);
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Desconocida';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nuevo Presupuesto
        </button>
      </div>
      <div className="space-y-2">
        {budgets.length === 0 && <p className="text-center text-gray-400 py-4">Sin presupuestos definidos</p>}
        {budgets.map(b => {
          const cat = categories.find(c => c.id === b.categoryId);
          return (
            <div key={b.id} className="bg-white dark:bg-carddark p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: cat?.color + '22'}}>
                    <Icon name={cat?.icon || 'Tag'} size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{getCategoryName(b.categoryId)}</p>
                    <p className="text-xs text-gray-500">Límite mensual</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Icon name="Pencil" size={14}/></button>
                  <button onClick={() => { setBudgets(budgets.filter(x=>x.id!==b.id)); show('Eliminado','success'); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Icon name="Trash2" size={14}/></button>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">{formatCurrency(b.limit, getCurrency(settings.currency))}</span>
                <span className="text-xs text-gray-400">0% gastado</span>
              </div>
            </div>
          );
        })}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Configurar Presupuesto">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Categoría</label>
            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <option value="">Seleccionar...</option>
              {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Límite Mensual</label>
            <input type="number" value={formData.limit} onChange={e => setFormData({...formData, limit: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" />
          </div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetsAdmin;
