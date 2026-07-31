import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export type ToastType = 'success' | 'error' | 'info';

export type ToastData = {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastProps = {
  toast: ToastData;
  onClose: (id: number) => void;
};

const config = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
    msgColor: 'text-emerald-700',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    msgColor: 'text-red-700',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    msgColor: 'text-blue-700',
  },
};

export function Toast({ toast, onClose }: ToastProps) {
  const { lang } = useI18n();
  const c = config[toast.type];
  const Icon = c.icon;

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const role = toast.type === 'error' ? 'alert' : 'status';
  const closeLabel = lang === 'km' ? 'បិទសារ' : 'Close message';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${c.bg} ${c.border} p-4 shadow-lg animate-slide-in`}
      role={role}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${c.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${c.titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className={`mt-1 text-sm ${c.msgColor} break-words`}>{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 rounded-lg p-1 ${c.msgColor} hover:bg-black/5 transition-colors`}
        aria-label={closeLabel}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastData[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:top-6">
      {toasts.map((t) => (
        <div key={t.id} className="w-full max-w-sm">
          <Toast toast={t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
