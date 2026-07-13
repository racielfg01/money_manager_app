import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storage';
import Icon from '../common/Icon';
import WalletsAdmin from '../admin/WalletsAdmin';
import CategoriesAdmin from '../admin/CategoriesAdmin';
import CurrenciesAdmin from '../admin/CurrenciesAdmin';
import AccountsAdmin from '../admin/AccountsAdmin';
import BudgetsAdmin from '../admin/BudgetsAdmin';
import GoalsAdmin from '../admin/GoalsAdmin';
import DebtsAdmin from '../admin/DebtsAdmin';
import RecurringAdmin from '../admin/RecurringAdmin';
import Modal from '../common/Modal';

const SettingsView = () => {
  const { settings, setSettings } = useApp();
  const { show } = useToast();
  const fileInputRef = useRef(null);
  const [confirmImport, setConfirmImport] = useState(null);
  const [adminSection, setAdminSection] = useState(null);

  const toggleTheme = () => {
    setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
    show(`Modo ${settings.theme === 'light' ? 'oscuro' : 'claro'} activado`, 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) setConfirmImport(file);
  };

  const confirmImportData = async () => {
    try {
      await StorageService.importData(confirmImport);
      show('Datos importados correctamente', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      show('Error al importar datos', 'error');
    }
    setConfirmImport(null);
  };

  const adminSections = [
    { id: 'accounts', label: 'Cuentas', icon: 'Landmark', desc: 'Agrupan billeteras' },
    { id: 'wallets', label: 'Billeteras', icon: 'Wallet', desc: 'Gestión de billeteras' },
    { id: 'categories', label: 'Categorías', icon: 'Tags', desc: 'Ingresos y gastos' },
    { id: 'currencies', label: 'Monedas', icon: 'Coins', desc: 'Divisas de la app' },
    { id: 'budgets', label: 'Presupuestos', icon: 'PieChart', desc: 'Límites mensuales' },
    { id: 'goals', label: 'Objetivos', icon: 'Target', desc: 'Metas de ahorro' },
    { id: 'debts', label: 'Deudas', icon: 'Receipt', desc: 'Préstamos y cobros' },
    { id: 'recurring', label: 'Recurrentes', icon: 'RefreshCw', desc: 'Transacciones periódicas' },
  ];

  const renderAdminContent = () => {
    switch(adminSection) {
      case 'accounts': return <AccountsAdmin />;
      case 'wallets': return <WalletsAdmin />;
      case 'categories': return <CategoriesAdmin />;
      case 'currencies': return <CurrenciesAdmin />;
      case 'budgets': return <BudgetsAdmin />;
      case 'goals': return <GoalsAdmin />;
      case 'debts': return <DebtsAdmin />;
      case 'recurring': return <RecurringAdmin />;
      default: return null;
    }
  };

  if (adminSection) {
    const sectionInfo = adminSections.find(s => s.id === adminSection);
    return (
      <div className="p-4 sm:p-6 pb-28 view-enter">
        <button onClick={() => setAdminSection(null)} className="flex items-center gap-2 text-gray-500 mb-4 press-effect">
          <Icon name="ArrowLeft" size={20} /> Volver a Ajustes
        </button>
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon name={sectionInfo.icon} size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{sectionInfo.label}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{sectionInfo.desc}</p>
            </div>
          </div>
        </header>
        {renderAdminContent()}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-28 view-enter">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Administración y configuración</p>
      </header>

      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">Administración</h3>
          <div className="bg-white dark:bg-carddark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {adminSections.map(section => (
              <button
                key={section.id}
                onClick={() => setAdminSection(section.id)}
                className="w-full p-4 flex items-center gap-3 press-effect hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icon name={section.icon} size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{section.label}</p>
                  <p className="text-xs text-gray-500">{section.desc}</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">Preferencias</h3>
          <div className="bg-white dark:bg-carddark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon name={settings.theme === 'dark' ? 'Moon' : 'Sun'} size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Modo Oscuro</p>
                  <p className="text-xs text-gray-500">{settings.theme === 'dark' ? 'Activado' : 'Desactivado'}</p>
                </div>
              </div>
              <button onClick={toggleTheme} className={`relative w-12 h-7 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`} aria-label="Cambiar tema">
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform flex items-center justify-center ${settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`}>
                  <Icon name={settings.theme === 'dark' ? 'Moon' : 'Sun'} size={12} className={settings.theme === 'dark' ? 'text-blue-600' : 'text-orange-500'} />
                </div>
              </button>
            </div>

            <div className="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Icon name="Keyboard" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Ceros Rápidos</p>
                  <p className="text-xs text-gray-500">Al tocar +00</p>
                </div>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                {[2, 3].map(n => (
                  <button key={n} onClick={() => setSettings({...settings, zerosMode: n})} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${settings.zerosMode === n ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}>
                    {'0'.repeat(n)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Icon name="Home" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm">Pantalla de Inicio</p>
                </div>
              </div>
              <select value={settings.homeScreen} onChange={(e) => setSettings({...settings, homeScreen: e.target.value})} className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none">
                <option value="wallet">Billetera</option>
                <option value="transactions">Movimientos</option>
                <option value="statistics">Estadísticas</option>
                <option value="calendar">Calendario</option>
                <option value="settings">Ajustes</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">Datos</h3>
          <div className="bg-white dark:bg-carddark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            <button onClick={StorageService.exportData} className="w-full p-4 flex items-center gap-3 press-effect hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Icon name="Download" size={18} />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Exportar Datos</p>
                <p className="text-xs text-gray-500">Descargar copia de seguridad</p>
              </div>
              <Icon name="ChevronRight" size={18} className="text-gray-400" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 flex items-center gap-3 press-effect hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Icon name="Upload" size={18} />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">Importar Datos</p>
                <p className="text-xs text-gray-500">Cargar desde archivo JSON</p>
              </div>
              <Icon name="ChevronRight" size={18} className="text-gray-400" />
              <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
            </button>
          </div>
        </section>
      </div>

      <Modal isOpen={!!confirmImport} onClose={() => setConfirmImport(null)} title="Importar datos">
        <div className="py-2">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4 text-orange-600 dark:text-orange-400">
            <Icon name="AlertTriangle" size={28} />
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-2">¿Estás seguro de importar estos datos?</p>
          <p className="text-center text-sm text-gray-500 mb-6">Los datos actuales serán reemplazados por los del archivo.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmImport(null)} className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 press-effect">Cancelar</button>
            <button onClick={confirmImportData} className="flex-1 py-3 rounded-xl font-semibold bg-orange-600 text-white press-effect">Importar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsView;
