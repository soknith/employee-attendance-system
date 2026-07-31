import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Loader2, X, Check, Edit3 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api, type Department } from '@/lib/apiClient';

export function DepartmentsPage() {
  const { t, lang } = useI18n();
  const { toasts, notify, dismiss } = useToasts();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name_en: '', name_kh: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      setDepartments(res.data ?? []);
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុកទិន្នន័យ' : 'Failed to load data');
    }
    setLoading(false);
  }, [notify, lang]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name_en: '', name_kh: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name_en: dept.name_en ?? '', name_kh: dept.name_kh ?? '', description: dept.description ?? '' });
    setShowForm(true);
  };

  const save = useCallback(async () => {
    if (!form.name_en.trim() && !form.name_kh.trim()) {
      notify('error', lang === 'km' ? 'ត្រូវការឈ្មោះ' : 'Name required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name_en: form.name_en.trim(),
        name_kh: form.name_kh.trim() || null,
        description: form.description.trim() || null,
      };
      if (editing) {
        await api.updateDepartment(editing.id, payload);
        notify('success', lang === 'km' ? 'បានកែសម្រួល' : 'Updated');
      } else {
        await api.createDepartment(payload);
        notify('success', lang === 'km' ? 'បានបន្ថែម' : 'Added');
      }
      setShowForm(false);
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
      await api.deleteDepartment(deleteTarget.id);
      notify('info', lang === 'km' ? 'បានលុប' : 'Deleted');
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed';
      notify('error', lang === 'km' ? 'មិនអាចលុប' : 'Cannot delete', message);
    }
    setDeleting(false);
  }, [deleteTarget, notify, lang]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />


      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Building2 className="mb-2 h-10 w-10" />
          <p className="text-sm">{lang === 'km' ? 'មិនមាននាយកដ្ឋាន' : 'No departments'}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {departments.map((dept) => (
            <li key={dept.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{dept.name_en}</p>
                  {dept.name_kh && <p className="text-xs text-gray-500 dark:text-gray-400">{dept.name_kh}</p>}
                  {dept.description && <p className="text-xs text-gray-400">{dept.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(dept)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700"
                  aria-label={t('common.edit')}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(dept)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" onClick={() => !saving && setShowForm(false)}>
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-800 sm:rounded-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? t('common.edit') : t('common.add')}
              </h2>
              <button onClick={() => !saving && setShowForm(false)} disabled={saving} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                placeholder={lang === 'km' ? 'ឈ្មោះ (អង់គ្លេស)' : 'Name (English)'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                value={form.name_kh}
                onChange={(e) => setForm({ ...form, name_kh: e.target.value })}
                placeholder={lang === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={lang === 'km' ? 'ការពិពណ៌នា' : 'Description'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button
                onClick={save}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={lang === 'km' ? 'លុបនាយកដ្ឋាន' : 'Delete Department'}
        message={lang === 'km'
          ? `តើអ្នកពិតជាចង់លុប "${deleteTarget?.name_en ?? ''}" មែនទេ?`
          : `Are you sure you want to delete "${deleteTarget?.name_en ?? ''}"?`}
        confirmLabel={lang === 'km' ? 'លុប' : 'Delete'}
        cancelLabel={lang === 'km' ? 'បោះបង់' : 'Cancel'}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
