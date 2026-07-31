import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateId } from '../../utils/helpers';
import { ACCOUNT_ICONS } from '../../utils/icons';
import CrudItem from '../common/CrudItem';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const AccountsAdmin = () => {
  const { accounts, setAccounts, wallets } = useApp();
  const { show } = useToast();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'User' });

  const openEdit = (a) => {
    setEditing(a ? a.id : 'new');
    setFormData(a || { name: '', icon: 'User' });
  };

  const save = () => {
    if (!formData.name.trim()) return show('Nombre requerido', 'error');
    if (editing === 'new') {
      setAccounts([...accounts, { ...formData, id: generateId() }]);
      show('Cuenta creada', 'success');
    } else {
      setAccounts(accounts.map(a => a.id === editing ? { ...a, ...formData } : a));
      show('Cuenta actualizada', 'success');
    }
    setEditing(null);
  };

  const remove = (id) => {
    if (accounts.length <= 1) return show('Debe haber al menos una cuenta', 'error');
    if (wallets.some(w => (w.accountId || accounts[0].id) === id)) return show('La cuenta tiene billeteras asociadas', 'error');
    setAccounts(accounts.filter(a => a.id !== id));
    show('Cuenta eliminada', 'success');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Agrupa tus billeteras por cuenta</p>
      <div className="flex justify-end">
        <button onClick={() => openEdit(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nueva Cuenta
        </button>
      </div>
      <div className="space-y-2">
        {accounts.map(a => (
          <CrudItem key={a.id} item={a} onEdit={openEdit} onDelete={remove} icon={a.icon} colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        ))}
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nueva Cuenta' : 'Editar Cuenta'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700" placeholder="Ej: Personal" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Icono</label>
            <div className="grid grid-cols-6 gap-1.5">
              {ACCOUNT_ICONS.map(name => (
                <button
                  key={name}
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    formData.icon === name ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon name={name} size={18} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsAdmin;
