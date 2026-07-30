import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateId } from '../../utils/helpers';
import Modal from '../common/Modal';
import Icon from '../common/Icon';

const ICONS = [
  'Tag', 'Home', 'Car', 'Utensils', 'ShoppingCart', 'Coffee', 'Gift', 'Wallet',
  'Briefcase', 'Laptop', 'Gamepad2', 'Zap', 'Heart', 'Music', 'Book', 'Plane',
  'Train', 'Smartphone', 'Wifi', 'Film', 'Dumbbell', 'ShoppingBag', 'Pizza', 'Apple',
  'Baby', 'Banknote', 'CreditCard', 'PiggyBank', 'Receipt', 'TrendingUp', 'Star',
  'Award', 'Camera', 'Shirt', 'Pill', 'GraduationCap', 'Fuel', 'Lightbulb', 'TreePine',
  'Cat', 'Dog', 'Smile', 'DollarSign', 'Euro', 'Bitcoin', 'Building', 'MapPin', 'Cookie', 'Store'
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

const TABS = [
  { id: 'expense', label: 'Gastos', icon: 'ArrowDownRight', active: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  { id: 'income', label: 'Ingresos', icon: 'ArrowUpLeft', active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' }
];

const Row = ({ item, color, onEdit, onDelete }) => (
  <div className="group bg-white dark:bg-carddark p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center press-effect hover:shadow-md transition-all">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '22', color }}>
        <Icon name={item.icon || 'Tag'} size={16} />
      </div>
      <p className="font-semibold text-sm truncate">{item.name}</p>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center press-effect">
        <Icon name="Pencil" size={14} />
      </button>
      <button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center press-effect">
        <Icon name="Trash2" size={14} />
      </button>
    </div>
  </div>
);

const CategoriesAdmin = () => {
  const { categories, setCategories, selectedAccountId } = useApp();
  const { show } = useToast();
  const [tab, setTab] = useState('expense');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0], icon: 'Tag' });

  const filtered = categories.filter(c => c.accountId === selectedAccountId);

  const blankCat = { name: '', type: tab, color: COLORS[0], icon: 'Tag', subcategories: [], accountId: selectedAccountId };
  const blankSub = (parent) => ({ name: '', color: parent.color, icon: 'Tag' });

  const openCat = (c) => {
    setEditing({ kind: 'cat', id: c ? c.id : 'new' });
    setFormData(c ? { name: c.name, color: c.color, icon: c.icon } : blankCat);
  };

  const openSub = (parent, s) => {
    setEditing({ kind: 'sub', parentId: parent.id, id: s ? s.id : 'new', parentName: parent.name });
    setFormData(s ? { name: s.name, color: s.color, icon: s.icon } : blankSub(parent));
  };

  const save = () => {
    if (!formData.name.trim()) return show('Nombre requerido', 'error');
    if (editing.kind === 'cat') {
      if (editing.id === 'new') {
        setCategories([...categories, { ...formData, type: tab, id: generateId(), subcategories: [] }]);
        show('Categoría creada', 'success');
      } else {
        setCategories(categories.map(c => c.id === editing.id ? { ...c, ...formData } : c));
        show('Categoría actualizada', 'success');
      }
    } else {
      setCategories(categories.map(c => {
        if (c.id !== editing.parentId) return c;
        const subs = c.subcategories ? [...c.subcategories] : [];
        if (editing.id === 'new') subs.push({ ...formData, id: generateId() });
        else {
          const i = subs.findIndex(s => s.id === editing.id);
          if (i > -1) subs[i] = { ...subs[i], ...formData };
        }
        return { ...c, subcategories: subs };
      }));
      show('Subcategoría guardada', 'success');
    }
    setEditing(null);
  };

  const removeCat = (id) => setCategories(categories.filter(c => c.id !== id));
  const removeSub = (parentId, subId) => setCategories(categories.map(c =>
    c.id === parentId ? { ...c, subcategories: (c.subcategories || []).filter(s => s.id !== subId) } : c
  ));

  const list = filtered.filter(c => c.type === tab);

  return (
    <div className="space-y-5">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              tab === t.id ? t.active : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => openCat(null)} className="text-sm font-bold text-blue-600 flex items-center gap-1 press-effect">
          <Icon name="PlusCircle" size={16} /> Nueva Categoría
        </button>
      </div>

      <div className="space-y-4">
        {list.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin categorías</p>}
        {list.map(c => (
          <div key={c.id} className="space-y-2">
            <Row item={c} color={c.color} onEdit={openCat} onDelete={removeCat} />
            {(c.subcategories || []).length > 0 && (
              <div className="pl-4 space-y-2 border-l-2 border-gray-100 dark:border-gray-800 ml-4">
                {(c.subcategories || []).map(s => (
                  <Row key={s.id} item={s} color={s.color} onEdit={(it) => openSub(c, it)} onDelete={() => removeSub(c.id, s.id)} />
                ))}
              </div>
            )}
            <button onClick={() => openSub(c, null)} className="ml-4 text-xs font-semibold text-gray-400 flex items-center gap-1 press-effect hover:text-blue-600">
              <Icon name="Plus" size={12} /> Subcategoría
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={
        !editing ? '' :
        editing.kind === 'cat'
          ? (editing.id === 'new' ? 'Nueva Categoría' : 'Editar Categoría')
          : (editing.id === 'new' ? 'Nueva Subcategoría' : 'Editar Subcategoría')
      }>
        {editing && (
          <div className="space-y-4">
            {editing.kind === 'sub' && (
              <p className="text-xs text-gray-500">De: <span className="font-semibold">{editing.parentName}</span></p>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500" placeholder="Nombre" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button key={color} onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-gray-400' : ''}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Icono</label>
              <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto p-1">
                {ICONS.map(name => (
                  <button
                    key={name}
                    onClick={() => setFormData({ ...formData, icon: name })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      formData.icon === name ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon name={name} size={16} />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold press-effect">Guardar</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoriesAdmin;
