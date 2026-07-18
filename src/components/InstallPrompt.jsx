import { useEffect, useState } from 'react';

const SEEN_KEY = 'pwa_install_prompt_seen';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      if (!localStorage.getItem(SEEN_KEY)) setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    localStorage.setItem(SEEN_KEY, '1');
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Instala la app</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Añádela a tu teléfono para usarla como app.</p>
      </div>
      <button onClick={dismiss} className="text-gray-400 text-xs px-2">Ahora no</button>
      <button onClick={install} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl press-effect">Instalar</button>
    </div>
  );
}
