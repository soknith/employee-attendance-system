import { useCallback, useEffect, useState } from 'react';
import { Bell, Loader2, Check, Trash2, BellOff } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api, type Notification } from '@/lib/apiClient';

export function NotificationsPage() {
  const { t, lang } = useI18n();
  const { toasts, notify, dismiss } = useToasts();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications(1);
      setNotifications(res.data ?? []);
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុក' : 'Failed to load');
    }
    setLoading(false);
  }, [notify, lang]);

  useEffect(() => { load(); }, [load]);

  const markRead = useCallback(async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed');
    }
    setActionLoadingId(null);
  }, [notify, lang]);

  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      notify('success', lang === 'km' ? 'បានអានទាំងអស់' : 'All marked as read');
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed');
    }
  }, [notify, lang]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteNotification(deleteTarget.id);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed');
    }
    setDeleting(false);
  }, [deleteTarget, notify, lang]);

  const typeIcon = (type: string) => {
    if (type?.includes('attendance')) return '📊';
    if (type?.includes('leave')) return '📝';
    if (type?.includes('announcement')) return '📢';
    return '🔔';
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="mb-4 flex items-center justify-end">
        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
            <Check className="h-3.5 w-3.5" />
            {lang === 'km' ? 'អានទាំងអស់' : 'Mark all read'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <BellOff className="mb-2 h-10 w-10" />
          <p className="text-sm">{t('notify.empty')}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className={`flex items-start gap-3 rounded-xl border p-3 shadow-sm transition-colors ${n.is_read ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800' : 'border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/20'}`}>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg dark:bg-gray-700">{typeIcon(n.type ?? '')}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                  {!n.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />}
                </div>
                {n.message && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{n.message}</p>}
                <p className="mt-1 text-xs text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleString(lang === 'km' ? 'km-KH' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : ''}</p>
              </div>
              <div className="flex items-center gap-1">
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} disabled={actionLoadingId === n.id} className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-50 dark:hover:bg-gray-700" title={t('notify.mark_read')} aria-label={t('notify.mark_read')}>
                    {actionLoadingId === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                )}
                <button onClick={() => setDeleteTarget(n)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" aria-label={lang === 'km' ? 'លុប' : 'Delete'} title={lang === 'km' ? 'លុប' : 'Delete'}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={lang === 'km' ? 'លុបសេចក្តីជូនដំណឹង' : 'Delete Notification'}
        message={lang === 'km' ? 'តើអ្នកពិតជាចង់លុបមែនទេ?' : 'Are you sure you want to delete this notification?'}
        confirmLabel={lang === 'km' ? 'លុប' : 'Delete'}
        cancelLabel={lang === 'km' ? 'បោះបង់' : 'Cancel'}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
