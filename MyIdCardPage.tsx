import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2, Printer, Download, Upload, RefreshCw, X, ShieldCheck, Edit3, Trash2, Save, Mail, Briefcase, BookOpen } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { IdCardDisplay } from '@/components/idcard/IdCardDisplay';
import { PhotoUpload } from '@/components/idcard/PhotoUpload';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api, type IdCard } from '@/lib/apiClient';
import { supabase } from '@/lib/supabase';

const CLASS_OPTIONS = [
  { value: '', label_en: 'Not Assigned', label_km: 'មិនទាន់បំពេញ' },
  { value: 'ថ្នាក់ទី១', label_en: 'Grade 1', label_km: 'ថ្នាក់ទី១' },
  { value: 'ថ្នាក់ទី២', label_en: 'Grade 2', label_km: 'ថ្នាក់ទី២' },
  { value: 'ថ្នាក់ទី៣', label_en: 'Grade 3', label_km: 'ថ្នាក់ទី៣' },
  { value: 'ថ្នាក់ទី៤', label_en: 'Grade 4', label_km: 'ថ្នាក់ទី៤' },
  { value: 'ថ្នាក់ទី៥', label_en: 'Grade 5', label_km: 'ថ្នាក់ទី៥' },
  { value: 'ថ្នាក់ទី៦', label_en: 'Grade 6', label_km: 'ថ្នាក់ទី៦' },
];

export function MyIdCardPage() {
  const { lang } = useI18n();
  const { user, refreshUser } = useAuth();
  const { toasts, notify, dismiss } = useToasts();
  const [card, setCard] = useState<IdCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', position: '', teaching_class: '', email: '', employee_id: '' });

  const t = (en: string, km: string) => lang === 'km' ? km : en;
  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await api.getMyIdCard();
      if (!c) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (teacher) {
          const newCard = await api.generateIdCard(teacher.id);
          setCard(newCard);
        }
      } else {
        setCard(c);
      }
    } catch {
      notify('error', t('Failed to load card', 'បរាជ័យក្នុងការផ្ទុកកាត'));
    }
    setLoading(false);
  }, [notify, lang]);

  useEffect(() => { load(); }, [load]);

  const handlePhotoUpload = async (file: File) => {
    if (!card || !user) return;
    const url = await api.uploadIdCardPhoto(file, user.id);
    await api.updateIdCardPhoto(card.id, url);
    notify('success', t('Photo updated', 'បានកែសម្រួលរូបថត'));
    load();
  };

  const openEdit = () => {
    const teacherName = card?.teacher?.full_name_kh ?? card?.teacher?.full_name_en ?? '';
    setEditForm({
      name: teacherName,
      position: card?.teacher?.position ?? '',
      teaching_class: card?.teacher?.teaching_class ?? '',
      email: card?.teacher?.email ?? '',
      employee_id: card?.employee_id ?? '',
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!card?.teacher?.id) return;
    setSavingInfo(true);
    try {
      const isKm = lang === 'km';
      const teacherPayload: Record<string, string | null> = {};
      if (isKm) teacherPayload.full_name_km = editForm.name.trim() || null;
      else teacherPayload.full_name_en = editForm.name.trim() || null;
      teacherPayload.position = editForm.position.trim() || null;
      teacherPayload.teaching_class = editForm.teaching_class || null;
      teacherPayload.email = editForm.email.trim() || null;
      await api.updateTeacher(card.teacher.id, teacherPayload);

      if (editForm.employee_id !== (card.employee_id ?? '')) {
        await supabase.from('id_cards').update({ employee_id: editForm.employee_id.trim() || null }).eq('id', card.id);
      }

      notify('success', t('Info saved', 'បានរក្សាទុកព័ត៌មាន'));
      setShowEdit(false);
      refreshUser();
      load();
    } catch {
      notify('error', t('Failed to save', 'បរាជ័យក្នុងការរក្សាទុក'));
    }
    setSavingInfo(false);
  };

  const handleDelete = async () => {
    if (!card) return;
    setDeleting(true);
    try {
      await supabase.from('id_cards').delete().eq('id', card.id);
      notify('info', t('Card deleted', 'បានលុបកាត'));
      setCard(null);
      setShowDelete(false);
      load();
    } catch {
      notify('error', t('Failed to delete', 'បរាជ័យក្នុងការលុប'));
    }
    setDeleting(false);
  };

  const handlePrint = async () => {
    if (!card) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>My ID Card</title>
      <style>
        body { font-family: sans-serif; display:flex; gap:20px; padding:20px; justify-content:center; }
        .card { width:336px; height:212px; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.15); background:white; }
        @media print { body{padding:0;} .card{box-shadow:none;} }
      </style></head><body>
      <div class="card"></div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    printWindow.document.close();
    try { await api.recordPrintHistory(card.id, 'both', 1, 'pvc'); } catch { /* non-critical */ }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-gray-400">
        <CreditCard className="mb-3 h-12 w-12" />
        <p className="text-sm">{t('No ID card found', 'មិនមានប័ណ្ណ')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            {t('Edit', 'កែសម្រួល')}
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 active:scale-95 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            {t('Delete', 'លុប')}
          </button>
        </div>
      </div>

      {/* Card display */}
      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-brand-50/30 p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <IdCardDisplay card={card} lang={lang} side="both" />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button onClick={() => setShowUpload(true)} className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <Upload className="h-5 w-5 text-brand-600" />
          {t('Upload Photo', 'បង្ហោះរូប')}
        </button>
        <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <Printer className="h-5 w-5 text-blue-600" />
          {t('Print', 'បោះពុម្ព')}
        </button>
        <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 transition-all hover:border-green-300 hover:bg-green-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <Download className="h-5 w-5 text-green-600" />
          {t('Download', 'ទាញយក')}
        </button>
        <button onClick={load} className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <RefreshCw className="h-5 w-5 text-amber-600" />
          {t('Refresh', 'ផ្ទុកឡើងវិញ')}
        </button>
      </div>

      {/* QR verification info */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/20">
        <ShieldCheck className="h-5 w-5 flex-shrink-0 text-brand-600" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-white">{t('QR Verification', 'ផ្ទៀងផ្ទាត់ QR')}</p>
          <p className="text-xs">{t('Scan the QR code on the card to verify identity.', 'ស្កេន QR នៅលើកាតដើម្បីផ្ទៀងផ្ទាត់អត្តសញ្ញាណ។')}</p>
        </div>
      </div>

      {/* Edit Info Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" onClick={() => !savingInfo && setShowEdit(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-800 sm:rounded-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('Edit Information', 'កែសម្រួលព័ត៌មាន')}</h2>
              <button onClick={() => !savingInfo && setShowEdit(false)} disabled={savingInfo} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <CreditCard className="h-3 w-3" /> {t('Full Name', 'ឈ្មោះពេញ')}
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              {/* Email */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail className="h-3 w-3" /> {t('Official School Email', 'អ៊ីមែលសាលាផុកនី')}
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="name@sovannkiri.edu.kh"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              {/* Position */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <Briefcase className="h-3 w-3" /> {t('Position', 'តួនាទី')}
                </label>
                <input
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder={t('e.g. គ្រូបង្រៀន / ថ្នាក់ទី៦', 'e.g. គ្រូបង្រៀន / ថ្នាក់ទី៦')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              {/* Teaching Class */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <BookOpen className="h-3 w-3" /> {t('Teaching Class', 'ថ្នាក់ដែលបង្រៀន')}
                </label>
                <select
                  value={editForm.teaching_class}
                  onChange={(e) => setEditForm({ ...editForm, teaching_class: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {CLASS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'km' ? opt.label_km : opt.label_en}
                    </option>
                  ))}
                </select>
              </div>
              {/* Employee ID */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                  <CreditCard className="h-3 w-3" /> {t('Employee ID', 'លេខបុគ្គលិក')}
                </label>
                <input
                  value={editForm.employee_id}
                  onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={saveEdit}
                disabled={savingInfo}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('Save', 'រក្សាទុក')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDelete}
        title={t('Delete ID Card', 'លុបប័ណ្ណសម្គាល់')}
        message={t('Are you sure you want to delete your ID card? You can regenerate it later.', 'តើអ្នកពិតជាចង់លុបប័ណ្ណសម្គាល់មែនទេ? អ្នកអាចបង្កើតវាឡើងវិញបាន។')}
        confirmLabel={t('Delete', 'លុប')}
        cancelLabel={t('Cancel', 'បោះបង់')}
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setShowDelete(false)}
      />

      {showUpload && (
        <PhotoUpload
          currentPhoto={card.photo_url}
          onUpload={handlePhotoUpload}
          onClose={() => setShowUpload(false)}
          lang={lang}
        />
      )}
    </div>
  );
}
