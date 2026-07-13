const STORAGE_PREFIX = 'mm_';

export const StorageService = {
  get: (key) => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) { return null; }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {}
  },
  exportData: () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions: StorageService.get('transactions') || [],
      wallets: StorageService.get('wallets') || [],
      categories: StorageService.get('categories') || [],
      settings: StorageService.get('settings') || {},
      budgets: StorageService.get('budgets') || [],
      goals: StorageService.get('goals') || [],
      debts: StorageService.get('debts') || [],
      recurring: StorageService.get('recurring') || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `money-manager-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  importData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.transactions) StorageService.set('transactions', data.transactions);
          if (data.wallets) StorageService.set('wallets', data.wallets);
          if (data.categories) StorageService.set('categories', data.categories);
          if (data.settings) StorageService.set('settings', data.settings);
          if (data.budgets) StorageService.set('budgets', data.budgets);
          if (data.goals) StorageService.set('goals', data.goals);
          if (data.debts) StorageService.set('debts', data.debts);
          if (data.recurring) StorageService.set('recurring', data.recurring);
          resolve(true);
        } catch (e) { reject(e); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};
