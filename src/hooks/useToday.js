import { useEffect, useState } from 'react';
import { todayKey } from '../domain/dates.js';

const CHECK_INTERVAL_MS = 30_000;

// Fecha local de hoy. Se recalcula periódicamente y al volver a la pestaña,
// para que "hoy" no quede desactualizado si la app sigue abierta tras la medianoche.
export function useToday() {
  const [today, setToday] = useState(() => todayKey());

  useEffect(() => {
    const refresh = () => setToday(todayKey());
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    const intervalId = setInterval(refresh, CHECK_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return today;
}
