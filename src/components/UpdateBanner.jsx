import { useState, useEffect } from 'react';

export default function UpdateBanner() {
  const [waiting, setWaiting] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkWaiting = (reg) => {
      if (reg.waiting) setWaiting(reg.waiting);
    };

    const watchRegistration = (reg) => {
      checkWaiting(reg);
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed') checkWaiting(reg);
        });
      });
    };

    navigator.serviceWorker.ready.then(watchRegistration);

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  const reload = () => {
    if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!waiting) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <p className="text-sm font-semibold">Nueva versión disponible</p>
      <button
        onClick={reload}
        className="bg-white text-green-700 text-sm font-bold px-4 py-1.5 rounded-lg press-effect"
      >
        Actualizar
      </button>
    </div>
  );
}
