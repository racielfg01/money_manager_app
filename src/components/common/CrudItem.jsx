import React from 'react';
import Icon from './Icon';

const CrudItem = ({ item, onEdit, onDelete, icon, colorClass, subtext }) => (
  <div className="group bg-white dark:bg-carddark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center press-effect hover:shadow-md transition-all">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
        <Icon name={icon} size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">{item.name}</p>
        {subtext && <p className="text-xs text-gray-500 truncate">{subtext}</p>}
      </div>
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

export default CrudItem;
