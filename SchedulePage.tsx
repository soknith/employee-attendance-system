import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, X, Check, Trash2, Clock, Edit3 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api, type TeachingSchedule } from '@/lib/apiClient';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function SchedulePage() {
  const { t, lang } = useI18n();
  const { toasts, notify, dismiss } = useToasts();
  const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeachingSchedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: '', grade: '', classroom: '', day_of_week: 'monday', start_time: '07:00', end_time: '08:00' });
  const [deleteTarget, setDeleteTarget] = useState<TeachingSchedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSchedules();
      setSchedules(res.data ?? []);
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុក' : 'Failed to load');
    }
    setLoading(false);
  }, [notify, lang]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ subject: '', grade: '', classroom: '', day_of_week: 'monday', start_time: '07:00', end_time: '08:00' });
    setShowForm(true);
  };

  const openEdit = (s: TeachingSchedule) => {
    setEditing(s);
    setForm({ subject: s.subject, grade: s.grade ?? '', classroom: s.classroom ?? '', day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time });
    setShowForm(true);
  };

  const submit = useCallback(async () => {
    if (!form.subject.trim()) { notify('error', lang === 'km' ? 'ត្រូវការមុខវិជ្ជា' : 'Subject required'); return; }
    if (form.end_time <= form.start_time) { notify('error', lang === 'km' ? 'ម៉ោងបញ្ចប់ត្រូវក្រោយម៉ោងចាប់ផ្តើម' : 'End time must be after start time'); return; }
    setSaving(true);
    try {
      const payload = { subject: form.subject.trim(), grade: form.grade || null, classroom: form.classroom || null, day_of_week: form.day_of_week, start_time: form.start_time, end_time: form.end_time };
      if (editing) {
        await api.updateSchedule(editing.id, payload);
        notify('success', lang === 'km' ? 'បានកែសម្រួល' : 'Updated');
      } else {
        await api.createSchedule(payload);
        notify('success', lang === 'km' ? 'បានបន្ថែម' : 'Added');
      }
      setShowForm(false);
      setForm({ subject: '', grade: '', classroom: '', day_of_week: 'monday', start_time: '07:00', end_time: '08:00' });
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed';
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed', message);
    }
    setSaving(false);
  }, [form, editing, notify, lang, load]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteSchedule(deleteTarget.id);
      notify('info', lang === 'km' ? 'បានលុប' : 'Deleted');
      setSchedules((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      notify('error', lang === 'km' ? 'មិនអាចលុប' : 'Cannot delete');
    }
    setDeleting(false);
  }, [deleteTarget, notify, lang]);

  const dayLabel = (day: string) => {
    const labels: Record<string, string> = lang === 'km'
      ? { monday: 'ច័ន្ទ', tuesday: 'អង្គារ', wednesday: 'ពុធ', thursday: 'ព្រហ', friday: 'សុក្រ', saturday: 'សៅរ៍', sunday: 'អាទិត្យ' }
      : { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
    return labels[day] ?? day;
  };

  const sorted = [...schedules].sort((a, b) => {
    const dayA = DAYS.indexOf(a.day_of_week as typeof DAYS[number]);
    const dayB = DAYS.indexOf(b.day_of_week as typeof DAYS[number]);
    if (dayA !== dayB) return dayA - dayB;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="mb-4 flex items-center justify-end">
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 active:scale-95">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <CalendarDays className="mb-2 h-10 w-10" />
          <p className="text-sm">{lang === 'km' ? 'មិនមានតារាងទេ' : 'No schedules'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const daySchedules = sorted.filter((s) => s.day_of_week === day);
            if (daySchedules.length === 0) return null;
            return (
              <div key={day}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{dayLabel(day)}</h2>
                <ul className="space-y-2">
                  {daySchedules.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.subject}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.start_time} - {s.end_time}{s.grade && ` • ${s.grade}`}{s.classroom && ` • ${s.classroom}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700" aria-label={t('common.edit')} title={t('common.edit')}>
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" aria-label={lang === 'km' ? 'លុប' : 'Delete'} title={lang === 'km' ? 'លុប' : 'Delete'}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" onClick={() => !saving && setShowForm(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-800 sm:rounded-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? t('common.edit') : t('schedule.title')}</h2>
              <button onClick={() => !saving && setShowForm(false)} disabled={saving} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t('schedule.subject')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder={t('schedule.grade')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                <input value={form.classroom} onChange={(e) => setForm({ ...form, classroom: e.target.value })} placeholder={lang === 'km' ? 'បន្ទប់' : 'Room'} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {DAYS.map((d) => <option key={d} value={d}>{dayLabel(d)}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">{lang === 'km' ? 'ចាប់ផ្តើម' : 'Start'}</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">{lang === 'km' ? 'បញ្ចប់' : 'End'}</label>
                  <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
              </div>
              <button onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={lang === 'km' ? 'លុបតារាង' : 'Delete Schedule'}
        message={lang === 'km' ? `តើអ្នកពិតជាចង់លុប "${deleteTarget?.subject ?? ''}" មែនទេ?` : `Are you sure you want to delete "${deleteTarget?.subject ?? ''}"?`}
        confirmLabel={lang === 'km' ? 'លុប' : 'Delete'}
        cancelLabel={lang === 'km' ? 'បោះបង់' : 'Cancel'}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
