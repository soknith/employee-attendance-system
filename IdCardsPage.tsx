import { useCallback, useEffect, useState } from 'react';
import {
  CreditCard, Loader2, Search, Eye, Printer, Download, RefreshCw,
  Power, History, X, Check, Filter, Plus, Zap, Edit3, Trash2, Save, Mail, Briefcase, BookOpen,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { IdCardDisplay } from '@/components/idcard/IdCardDisplay';
import { api, type IdCard, type IdCardPrintHistory, type Department } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  lost: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  replaced: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

export function IdCardsPage() {
  const { lang } = useI18n();
  const { toasts, notify, dismiss } = useToasts();
  const [cards, setCards] = useState<IdCard[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [previewCard, setPreviewCard] = useState<IdCard | null>(null);
  const [historyCard, setHistoryCard] = useState<IdCard | null>(null);
  const [history, setHistory] = useState<IdCardPrintHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<IdCard | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editCard, setEditCard] = useState<IdCard | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteCard, setDeleteCard] = useState<IdCard | null>(null);
  const [deletingCard, setDeletingCard] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', position: '', teaching_class: '', email: '', employee_id: '', status: 'active' });
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role?.name === 'admin' || authUser?.role?.name === 'super_admin';

  const t = (en: string, km: string) => lang === 'km' ? km : en;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cardsRes, deptsRes] = await Promise.all([
        api.getIdCards(),
        api.getDepartments(),
      ]);
      setCards(cardsRes);
      setDepartments(deptsRes.data ?? []);
    } catch {
      notify('error', t('Failed to load', 'បរាជ័យក្នុងការផ្ទុក'));
    }
    setLoading(false);
  }, [notify, lang]);

  useEffect(() => { load(); }, [load]);

  const filtered = cards.filter((c) => {
    const q = query.toLowerCase();
    const teacher = c.teacher;
    const matchesQuery =
      (teacher?.full_name_en ?? '').toLowerCase().includes(q) ||
      (teacher?.full_name_kh ?? '').toLowerCase().includes(q) ||
      (teacher?.teacher_code ?? '').toLowerCase().includes(q) ||
      (c.employee_id ?? '').toLowerCase().includes(q) ||
      (c.card_number ?? '').toLowerCase().includes(q);
    const matchesDept = !deptFilter || teacher?.department_id === deptFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesQuery && matchesDept && matchesStatus;
  });

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      const count = await api.generateAllIdCards();
      notify('success', t(`Generated ${count} cards`, `បានបង្កើត ${count} កាត`));
      load();
    } catch {
      notify('error', t('Generation failed', 'បរាជ័យ'));
    }
    setGenerating(false);
  };

  const handlePrint = async (card: IdCard, type: 'front' | 'back' | 'both') => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const cardHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ID Card - ${card.teacher?.full_name_en ?? ''}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Sans Khmer', sans-serif; display: flex; gap: 20px; padding: 20px; justify-content: center; }
          .card { width: 336px; height: 212px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: white; }
          @media print { body { padding: 0; } .card { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="card" id="card-container"></div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(cardHtml);
    printWindow.document.close();

    try {
      await api.recordPrintHistory(card.id, type, 1, 'pvc');
    } catch { /* non-critical */ }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      const newStatus = deactivateTarget.status === 'active' ? 'inactive' : 'active';
      await api.updateIdCardStatus(deactivateTarget.id, newStatus);
      notify('success', t(newStatus === 'active' ? 'Card activated' : 'Card deactivated',
        newStatus === 'active' ? 'បានបើកកាត' : 'បានបិទកាត'));
      setDeactivateTarget(null);
      load();
    } catch {
      notify('error', t('Failed', 'បរាជ័យ'));
    }
    setDeactivating(false);
  };

  const handleRegenerateQr = async (card: IdCard) => {
    try {
      await api.regenerateQrCode(card.id);
      notify('success', t('QR code regenerated', 'បានបង្កើត QR ថ្មី'));
      load();
    } catch {
      notify('error', t('Failed', 'បរាជ័យ'));
    }
  };

  const openEdit = (card: IdCard) => {
    setEditForm({
      name: card.teacher?.full_name_kh ?? card.teacher?.full_name_en ?? '',
      position: card.teacher?.position ?? '',
      teaching_class: card.teacher?.teaching_class ?? '',
      email: card.teacher?.email ?? '',
      employee_id: card.employee_id ?? '',
      status: card.status ?? 'active',
    });
    setEditCard(card);
  };

  const saveEdit = async () => {
    if (!editCard?.teacher?.id) return;
    setSavingEdit(true);
    try {
      const isKm = lang === 'km';
      const teacherPayload: Record<string, string | null> = {};
      if (isKm) teacherPayload.full_name_km = editForm.name.trim() || null;
      else teacherPayload.full_name_en = editForm.name.trim() || null;
      teacherPayload.position = editForm.position.trim() || null;
      teacherPayload.teaching_class = editForm.teaching_class || null;
      teacherPayload.email = editForm.email.trim() || null;
      await api.updateTeacher(editCard.teacher.id, teacherPayload);
      await supabase.from('id_cards').update({
        employee_id: editForm.employee_id.trim() || null,
        status: editForm.status,
      }).eq('id', editCard.id);
      notify('success', t('Card updated', 'បានកែសម្រួលកាត'));
      setEditCard(null);
      load();
    } catch {
      notify('error', t('Failed to save', 'បរាជ័យ'));
    }
    setSavingEdit(false);
  };

  const handleDeleteCard = async () => {
    if (!deleteCard) return;
    setDeletingCard(true);
    try {
      await supabase.from('id_cards').delete().eq('id', deleteCard.id);
      notify('info', t('Card deleted', 'បានលុបកាត'));
      setDeleteCard(null);
      load();
    } catch {
      notify('error', t('Failed to delete', 'បរាជ័យ'));
    }
    setDeletingCard(false);
  };

  const openHistory = async (card: IdCard) => {
    setHistoryCard(card);
    setHistoryLoading(true);
    try {
      const h = await api.getPrintHistory(card.id);
      setHistory(h);
    } catch {
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      {/* Action bar */}
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 active:scale-95 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {t('Generate All', 'បង្កើតទាំងអស់')}
        </button>
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search by name, code, ID...', 'ស្វែងរកតាមឈ្មោះ, កូដ, លេខ...')}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">{t('All Departments', 'នាយកដ្ឋានទាំងអស់')}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name_en}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">{t('All Status', 'ស្ថានភាពទាំងអស់')}</option>
          <option value="active">{t('Active', 'សកម្ម')}</option>
          <option value="inactive">{t('Inactive', 'មិនសកម្ម')}</option>
          <option value="expired">{t('Expired', 'ផុតកំណត់')}</option>
          <option value="lost">{t('Lost', 'បាត់')}</option>
          <option value="replaced">{t('Replaced', 'បានជំនួស')}</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <CreditCard className="mb-2 h-10 w-10" />
          <p className="text-sm">{t('No ID cards found', 'មិនមានប័ណ្ណ')}</p>
          <button onClick={handleGenerateAll} className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            {t('Generate Cards', 'បង្កើតកាត')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                <th className="px-3 py-2">{t('Photo', 'រូប')}</th>
                <th className="px-3 py-2">{t('Name', 'ឈ្មោះ')}</th>
                <th className="px-3 py-2">{t('Employee ID', 'លេខបុគ្គលិក')}</th>
                <th className="px-3 py-2">{t('Code', 'កូដ')}</th>
                <th className="px-3 py-2">{t('Department', 'នាយកដ្ឋាន')}</th>
                <th className="px-3 py-2">{t('Status', 'ស្ថានភាព')}</th>
                <th className="px-3 py-2">{t('Issued', 'ចេញថ្ងៃ')}</th>
                <th className="px-3 py-2 text-right">{t('Actions', 'សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((c) => (
                <tr key={c.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-3 py-2">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">
                          {c.teacher?.full_name_en?.charAt(0) ?? '?'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                    {c.teacher?.full_name_kh ?? c.teacher?.full_name_en ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{c.employee_id ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{c.teacher?.teacher_code ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {(c.teacher?.department as { name_en?: string })?.name_en ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[c.status] ?? ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{c.issue_date ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setPreviewCard(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-gray-700" title={t('Preview', 'មើល')}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handlePrint(c, 'both')} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-gray-700" title={t('Print', 'បោះពុម្ព')}>
                        <Printer className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleRegenerateQr(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-gray-700" title={t('Regenerate QR', 'QR ថ្មី')}>
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button onClick={() => openHistory(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" title={t('History', 'ប្រវត្តិ')}>
                        <History className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-gray-700" title={t('Edit', 'កែសម្រួល')}>
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => setDeleteCard(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700" title={t('Delete', 'លុប')}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => setDeactivateTarget(c)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700" title={t('Toggle Status', 'បិទ/បើក')}>
                        <Power className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setPreviewCard(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('ID Card Preview', 'មើលប័ណ្ណ')}</h3>
              <button onClick={() => setPreviewCard(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <IdCardDisplay card={previewCard} lang={lang} side="both" />
              <div className="flex gap-2">
                <button onClick={() => handlePrint(previewCard, 'front')} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Printer className="h-4 w-4" /> {t('Front', 'មុខ')}
                </button>
                <button onClick={() => handlePrint(previewCard, 'back')} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Printer className="h-4 w-4" /> {t('Back', 'ខាងក្រោយ')}
                </button>
                <button onClick={() => handlePrint(previewCard, 'both')} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  <Printer className="h-4 w-4" /> {t('Print Both', 'បោះទាំងពីរ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setHistoryCard(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Print History', 'ប្រវត្តិបោះពុម្ព')}</h3>
              <button onClick={() => setHistoryCard(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-gray-500">{historyCard.teacher?.full_name_kh ?? historyCard.teacher?.full_name_en}</p>
            {historyLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : history.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">{t('No print history', 'មិនមានប្រវត្តិ')}</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{h.print_type} × {h.copies}</p>
                      <p className="text-xs text-gray-500">{h.layout.toUpperCase()}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(h.printed_at).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCard && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" onClick={() => !savingEdit && setEditCard(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-800 sm:rounded-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('Edit ID Card', 'កែសម្រួលកាត')}</h2>
              <button onClick={() => !savingEdit && setEditCard(null)} disabled={savingEdit} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500"><CreditCard className="h-3 w-3" /> {t('Full Name', 'ឈ្មោះពេញ')}</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500"><Mail className="h-3 w-3" /> {t('Email', 'អ៊ីមែល')}</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="name@sovannkiri.edu.kh" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500"><Briefcase className="h-3 w-3" /> {t('Position', 'តួនាទី')}</label>
                <input value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500"><BookOpen className="h-3 w-3" /> {t('Teaching Class', 'ថ្នាក់')}</label>
                <select value={editForm.teaching_class} onChange={(e) => setEditForm({ ...editForm, teaching_class: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                  <option value="">{t('Not Assigned', 'មិនទាន់បំពេញ')}</option>
                  <option value="ថ្នាក់ទី១">ថ្នាក់ទី១</option>
                  <option value="ថ្នាក់ទី២">ថ្នាក់ទី២</option>
                  <option value="ថ្នាក់ទី៣">ថ្នាក់ទី៣</option>
                  <option value="ថ្នាក់ទី៤">ថ្នាក់ទី៤</option>
                  <option value="ថ្នាក់ទី៥">ថ្នាក់ទី៥</option>
                  <option value="ថ្នាក់ទី៦">ថ្នាក់ទី៦</option>
                </select>
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500"><CreditCard className="h-3 w-3" /> {t('Employee ID', 'លេខបុគ្គលិក')}</label>
                <input value={editForm.employee_id} onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">{t('Status', 'ស្ថានភាព')}</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                  <option value="active">{t('Active', 'សកម្ម')}</option>
                  <option value="inactive">{t('Inactive', 'មិនសកម្ម')}</option>
                  <option value="expired">{t('Expired', 'ផុតកំណត់')}</option>
                  <option value="lost">{t('Lost', 'បាត់')}</option>
                  <option value="replaced">{t('Replaced', 'បានជំនួស')}</option>
                </select>
              </div>
              <button onClick={saveEdit} disabled={savingEdit} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50">
                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('Save', 'រក្សាទុក')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteCard}
        title={t('Delete ID Card', 'លុបកាត')}
        message={t('Are you sure? This will permanently remove the card.', 'តើអ្នកពិតជាចង់លុបមែនទេ? កាតនឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍។')}
        confirmLabel={t('Delete', 'លុប')}
        cancelLabel={t('Cancel', 'បោះបង់')}
        variant="danger"
        loading={deletingCard}
        onConfirm={handleDeleteCard}
        onCancel={() => !deletingCard && setDeleteCard(null)}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title={deactivateTarget?.status === 'active'
          ? t('Deactivate Card', 'បិទកាត')
          : t('Activate Card', 'បើកកាត')}
        message={deactivateTarget?.status === 'active'
          ? t('This card will be deactivated.', 'កាតនេះនឹងត្រូវបានបិទ។')
          : t('This card will be activated.', 'កាតនេះនឹងត្រូវបានបើក។')}
        confirmLabel={t('Confirm', 'បញ្ជាក់')}
        cancelLabel={t('Cancel', 'បោះបង់')}
        loading={deactivating}
        onConfirm={handleDeactivate}
        onCancel={() => !deactivating && setDeactivateTarget(null)}
      />
    </div>
  );
}
