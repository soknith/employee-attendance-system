import { useCallback, useEffect, useState } from 'react';
import { User as UserIcon, Mail, Phone, Save, Loader2, Camera, Lock, Trash2 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { api, type User } from '@/lib/apiClient';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfilePage() {
  const { t, lang } = useI18n();
  const { user, refreshUser } = useAuth();
  const { toasts, notify, dismiss } = useToasts();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [form, setForm] = useState({ phone: '', email: '' });
  const [savingPhone, setSavingPhone] = useState(false);
  const [nameForm, setNameForm] = useState({ full_name: '', full_name_km: '' });
  const [savingName, setSavingName] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [uploading, setUploading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.getProfile();
      setProfile(p);
      setForm({ phone: p.phone ?? '', email: p.email ?? '' });
      setNameForm({ full_name: p.teacher?.full_name_en ?? '', full_name_km: p.teacher?.full_name_kh ?? '' });
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = useCallback(async () => {
    if (form.email && !EMAIL_RE.test(form.email)) {
      notify('error', lang === 'km' ? 'អ៊ីមែលមិនត្រឹមត្រូវ' : 'Invalid email format');
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile({ phone: form.phone, email: form.email });
      notify('success', lang === 'km' ? 'បានរក្សាទុក' : 'Profile saved');
      refreshUser();
    } catch (err: unknown) {
      const message =
        err instanceof Error && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed')
          : 'Failed';
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed', message);
    }
    setSaving(false);
  }, [form, notify, lang, refreshUser]);

  const changePassword = useCallback(async () => {
    if (!passwordForm.current_password) {
      notify('error', lang === 'km' ? 'ត្រូវការពាក្យសម្ងាត់បច្ចុប្បន្ន' : 'Current password required');
      return;
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      notify('error', lang === 'km' ? 'ពាក្យសម្ងាត់មិនត្រូវគ្នា' : 'Passwords do not match');
      return;
    }
    if (passwordForm.password.length < 8) {
      notify('error', lang === 'km' ? 'ត្រូវការ 8 តួ' : 'Minimum 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword(passwordForm.current_password, passwordForm.password);
      notify('success', lang === 'km' ? 'បានផ្លាស់ប្តូរ' : 'Password changed');
      setShowPassword(false);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: unknown) {
      const message =
        err instanceof Error && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed')
          : 'Failed';
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed', message);
    }
    setSavingPassword(false);
  }, [passwordForm, notify, lang]);

  const uploadPhoto = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notify('error', lang === 'km' ? 'រូបភាពធំពេក (2MB)' : 'Image too large (max 2MB)');
      return;
    }
    setUploading(true);
    try {
      await api.uploadProfilePhoto(file);
      notify('success', lang === 'km' ? 'បានបង្ហោះ' : 'Photo uploaded');
      refreshUser();
      load();
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Upload failed');
    }
    setUploading(false);
  }, [notify, lang, refreshUser, load]);

  const removePhoto = useCallback(async () => {
    try {
      await api.deleteProfilePhoto();
      notify('info', lang === 'km' ? 'បានលុបរូប' : 'Photo removed');
      refreshUser();
      load();
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed');
    }
    setRemoveTarget(false);
  }, [notify, lang, refreshUser, load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const teacher = profile?.teacher;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      {/* Profile header card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-100 dark:bg-brand-800">
              {teacher?.photo ? (
                <img src={teacher.photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-brand-700 dark:text-brand-200">
                  {(teacher?.full_name_en ?? profile?.username ?? '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-transform hover:scale-110">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={uploadPhoto} />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {teacher?.full_name_en ?? profile?.username ?? 'Unknown'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teacher?.teacher_code ?? ''} • {profile?.role?.display_name ?? ''}
            </p>
            {teacher?.department && (
              <p className="text-xs text-gray-400">{teacher.department.name_en}</p>
            )}
          </div>
          {teacher?.photo && (
            <button onClick={() => setRemoveTarget(true)} disabled={uploading} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Edit name section */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {lang === 'km' ? 'កែឈ្មោះ' : 'Edit Name'}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-900/50 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
            <UserIcon className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <input
              value={nameForm.full_name}
              onChange={(e) => setNameForm({ ...nameForm, full_name: e.target.value })}
              placeholder={lang === 'km' ? 'ឈ្មោះ (អង់គ្លេស)' : 'Name (English)'}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-900/50 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
            <UserIcon className="h-4 w-4 flex-shrink-0 text-brand-500" />
            <input
              value={nameForm.full_name_km}
              onChange={(e) => setNameForm({ ...nameForm, full_name_km: e.target.value })}
              placeholder={lang === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={async () => {
            if (!nameForm.full_name.trim()) {
              notify('error', lang === 'km' ? 'ត្រូវការឈ្មោះ' : 'Name is required');
              return;
            }
            setSavingName(true);
            try {
              await api.updateProfile({ full_name: nameForm.full_name.trim(), full_name_km: nameForm.full_name_km.trim() });
              notify('success', lang === 'km' ? 'បានកែឈ្មោះ' : 'Name updated');
              refreshUser();
              load();
            } catch {
              notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed');
            }
            setSavingName(false);
          }}
          disabled={savingName}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {lang === 'km' ? 'រក្សាទុកឈ្មោះ' : 'Save Name'}
        </button>
      </section>

      {/* Profile info */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {lang === 'km' ? 'ព័ត៌មាន' : 'Information'}
        </h2>
        <div className="space-y-3">
          {teacher && (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">{lang === 'km' ? 'ឈ្មោះ' : 'Name'}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{teacher.full_name_kh || teacher.full_name_en}</p>
                </div>
              </div>
              {teacher.position && (
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">{lang === 'km' ? 'តួនាទី' : 'Position'}</p>
                    <p className="text-sm text-gray-900 dark:text-white">{teacher.position}</p>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/50">
            <Mail className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">{t('auth.email')}</p>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent text-sm text-gray-900 focus:outline-none dark:text-white"
              />
            </div>
          </div>

        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t('common.save')}
        </button>
      </section>

      {/* Phone number section */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
        </h2>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-900/50 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
          <Phone className="h-4 w-4 flex-shrink-0 text-brand-500" />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder={lang === 'km' ? 'បញ្ចូលលេខទូរស័ព្ទ...' : 'Enter phone number...'}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
          />
        </div>
        <button
          onClick={async () => {
            setSavingPhone(true);
            try {
              await api.updateProfile({ phone: form.phone });
              notify('success', lang === 'km' ? 'បានរក្សាទុកលេខទូរស័ព្ទ' : 'Phone number saved');
              refreshUser();
            } catch {
              notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed');
            }
            setSavingPhone(false);
          }}
          disabled={savingPhone}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {savingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {lang === 'km' ? 'រក្សាទុកលេខទូរស័ព្ទ' : 'Save Phone Number'}
        </button>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => setShowPassword(!showPassword)}
          aria-expanded={showPassword}
          className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-600" />
            {lang === 'km' ? 'ផ្លាស់ប្តូរពាក្យសម្ងាត់' : 'Change Password'}
          </span>
        </button>

        {showPassword && (
          <div className="mt-4 space-y-3">
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              placeholder={lang === 'km' ? 'ពាក្យសម្ងាត់បច្ចុប្បន្ន' : 'Current Password'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              type="password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
              placeholder={lang === 'km' ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
              placeholder={lang === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <button
              onClick={changePassword}
              disabled={savingPassword}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {lang === 'km' ? 'ផ្លាស់ប្តូរ' : 'Change'}
            </button>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={removeTarget}
        title={lang === 'km' ? 'លុបរូបភាព' : 'Remove Photo'}
        message={lang === 'km' ? 'តើអ្នកពិតជាចង់លុបរូបភាពប្រវត្តិរូបមែនទេ?' : 'Are you sure you want to remove your profile photo?'}
        confirmLabel={lang === 'km' ? 'លុប' : 'Remove'}
        cancelLabel={lang === 'km' ? 'បោះបង់' : 'Cancel'}
        onConfirm={removePhoto}
        onCancel={() => setRemoveTarget(false)}
      />
    </div>
  );
}
