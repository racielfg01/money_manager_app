import { useState, useEffect } from 'react';

export default function UpdateBanner() {
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker?.ready.then((reg) => {
      if (!reg.waiting) return;
      setRegistration(reg);
      reg.waiting.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') window.location.reload();
      });
    });
  }, []);

  if (!registration) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <p className="text-sm font-semibold">Nueva versión disponible</p>
      <button
        onClick={() => registration.waiting?.postMessage({ type: 'SKIP_WAITING' })}
        className="bg-white text-blue-600 text-sm font-bold px-4 py-1.5 rounded-lg press-effect"
      >
        Actualizar
      </button>
    </div>
  );
}
