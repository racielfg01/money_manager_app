export const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const resolveCategory = (tx, categories) => {
  const cat = categories.find(c => c.id === tx.categoryId);
  const sub = cat?.subcategories?.find(s => s.id === tx.subcategoryId);
  return { cat, sub };
};

export const formatCurrency = (amount, currency = 'USD', decimals) => {
  const code = typeof currency === 'string' ? currency : currency?.code || 'USD';
  const dec = decimals ?? (typeof currency === 'object' ? currency?.decimals ?? 2 : 2);
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: code, minimumFractionDigits: dec, maximumFractionDigits: dec }).format(amount || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};
