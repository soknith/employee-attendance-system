import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, X, Check, FileText, Clock } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api, type LeaveRequest } from '@/lib/apiClient';

export function LeaveRequestsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { toasts, notify, dismiss } = useToasts();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ leave_type: 'personal', start_date: '', end_date: '', reason: '' });
  const [actionTarget, setActionTarget] = useState<{ type: 'approve' | 'reject' | 'delete'; id: string; name?: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getLeaveRequests({ page: 1 });
      setLeaves(res.data ?? []);
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុកទិន្នន័យ' : 'Failed to load data');
    }
    setLoading(false);
  }, [notify, lang]);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async () => {
    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      notify('error', lang === 'km' ? 'បំពេញទិន្នន័យ' : 'Please fill all fields');
      return;
    }
    if (form.end_date < form.start_date) {
      notify('error', lang === 'km' ? 'ថ្ងៃបញ្ចប់ត្រូវក្រោយថ្ងៃចាប់ផ្តើម' : 'End date must be after start date');
      return;
    }
    if (form.reason.trim().length < 5) {
      notify('error', lang === 'km' ? 'ហេតុផលត្រូវការ 5 តួឡើង' : 'Reason must be at least 5 characters');
      return;
    }
    setSaving(true);
    try {
      await api.createLeaveRequest({ leave_type: form.leave_type, start_date: form.start_date, end_date: form.end_date, reason: form.reason.trim() });
      notify('success', lang === 'km' ? 'បានស្នើ' : 'Request submitted');
      setShowForm(false);
      setForm({ leave_type: 'personal', start_date: '', end_date: '', reason: '' });
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed';
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed', message);
    }
    setSaving(false);
  }, [form, notify, lang, load]);

  const executeAction = useCallback(async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.type === 'approve') {
        await api.approveLeave(actionTarget.id);
        notify('success', lang === 'km' ? 'បានអនុម័ត' : 'Approved');
      } else if (actionTarget.type === 'reject') {
        await api.rejectLeave(actionTarget.id);
        notify('info', lang === 'km' ? 'បានបដិសេធ' : 'Rejected');
      } else {
        await api.deleteLeaveRequest(actionTarget.id);
        notify('info', lang === 'km' ? 'បានលុប' : 'Deleted');
      }
      setActionTarget(null);
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed';
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed', message);
    }
    setActionLoading(false);
  }, [actionTarget, notify, lang, load]);

  const canApprove = user?.role?.name === 'admin' || user?.role?.name === 'principal' || user?.role?.name === 'super_admin';

  const statusColor = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (status === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  };

  const actionLabels = {
    approve: { title: lang === 'km' ? 'អនុម័តសំណើ' : 'Approve Request', msg: lang === 'km' ? 'តើអ្នកពិតជាចង់អនុម័តសំណើនេះមែនទេ?' : 'Are you sure you want to approve this request?', label: lang === 'km' ? 'អនុម័ត' : 'Approve' },
    reject: { title: lang === 'km' ? 'បដិសេធសំណើ' : 'Reject Request', msg: lang === 'km' ? 'តើអ្នកពិតជាចង់បដិសេធសំណើនេះមែនទេ?' : 'Are you sure you want to reject this request?', label: lang === 'km' ? 'បដិសេធ' : 'Reject' },
    delete: { title: lang === 'km' ? 'លុបសំណើ' : 'Delete Request', msg: lang === 'km' ? 'តើអ្នកពិតជាចង់លុបសំណើនេះមែនទេ?' : 'Are you sure you want to delete this request?', label: lang === 'km' ? 'លុប' : 'Delete' },
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="mb-4 flex items-center justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 active:scale-95">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : leaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <FileText className="mb-2 h-10 w-10" />
          <p className="text-sm">{lang === 'km' ? 'មិនមានសំណើទេ' : 'No leave requests'}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {leaves.map((l) => (
            <li key={l.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{l.leave_type}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(l.status)}`}>
                      {l.status === 'pending' ? t('leave.status.pending') : l.status === 'approved' ? t('leave.status.approved') : t('leave.status.rejected')}
                    </span>
                  </div>
                  <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
                    {l.start_date} → {l.end_date} ({l.days} {lang === 'km' ? 'ថ្ងៃ' : 'days'})
                  </p>
                  {l.reason && <p className="mt-1 ml-6 text-xs text-gray-400 dark:text-gray-500">{l.reason}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {canApprove && l.status === 'pending' && (
                    <>
                      <button onClick={() => setActionTarget({ type: 'approve', id: l.id })} className="rounded-lg p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20" aria-label={lang === 'km' ? 'អនុម័ត' : 'Approve'} title={lang === 'km' ? 'អនុម័ត' : 'Approve'}>
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setActionTarget({ type: 'reject', id: l.id })} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={lang === 'km' ? 'បដិសេធ' : 'Reject'} title={lang === 'km' ? 'បដិសេធ' : 'Reject'}>
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {l.status === 'pending' && (
                    <button onClick={() => setActionTarget({ type: 'delete', id: l.id })} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" aria-label={lang === 'km' ? 'លុប' : 'Delete'} title={lang === 'km' ? 'លុប' : 'Delete'}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" onClick={() => !saving && setShowForm(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-800 sm:rounded-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('leave.title')}</h2>
              <button onClick={() => !saving && setShowForm(false)} disabled={saving} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                <option value="sick">{lang === 'km' ? 'អ្នកជំងឺ' : 'Sick'}</option>
                <option value="personal">{lang === 'km' ? 'ផ្ទាល់ខ្លួន' : 'Personal'}</option>
                <option value="annual">{lang === 'km' ? 'ប្រចាំឆ្នាំ' : 'Annual'}</option>
                <option value="maternity">{lang === 'km' ? 'មាតាធិបតេយ្យ' : 'Maternity'}</option>
                <option value="other">{lang === 'km' ? 'ផ្សេងទៀត' : 'Other'}</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">{t('leave.start')}</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">{t('leave.end')}</label>
                  <input type="date" value={form.end_date} min={form.start_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
              </div>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={t('leave.reason')} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              <button onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t('leave.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!actionTarget}
        title={actionTarget ? actionLabels[actionTarget.type].title : ''}
        message={actionTarget ? actionLabels[actionTarget.type].msg : ''}
        confirmLabel={actionTarget ? actionLabels[actionTarget.type].label : ''}
        cancelLabel={lang === 'km' ? 'បោះបង់' : 'Cancel'}
        variant={actionTarget?.type === 'approve' ? 'info' : actionTarget?.type === 'reject' ? 'warning' : 'danger'}
        loading={actionLoading}
        onConfirm={executeAction}
        onCancel={() => !actionLoading && setActionTarget(null)}
      />
    </div>
  );
}
