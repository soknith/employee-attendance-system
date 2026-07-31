import { useCallback, useState } from 'react';
import type { ToastData, ToastType } from '@/components/Toast';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, title, message }]);
    },
    []
  );

  return { toasts, notify, dismiss };
}
