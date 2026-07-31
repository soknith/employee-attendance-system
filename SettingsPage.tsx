import { useCallback, useEffect, useState } from 'react';
import { Save, Loader2, MapPin, Building2, Clock, Palette, Globe } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { api, type SchoolSettings } from '@/lib/apiClient';

export function SettingsPage() {
  const { t, lang, setLang, theme, setTheme } = useI18n();
  const { toasts, notify, dismiss } = useToasts();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    school_name_en: '',
    school_name_kh: '',
    latitude: '',
    longitude: '',
    attendance_radius: '150',
    morning_checkin_start: '07:00',
    morning_checkin_end: '11:00',
    afternoon_checkin_start: '13:00',
    afternoon_checkin_end: '15:20',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await api.getSettings();
      setSettings(s);
      setForm({
        school_name_en: s.school_name_en ?? '',
        school_name_kh: s.school_name_kh ?? '',
        latitude: s.latitude ? String(s.latitude) : '',
        longitude: s.longitude ? String(s.longitude) : '',
        attendance_radius: String(s.attendance_radius ?? 150),
        morning_checkin_start: s.morning_checkin_start ?? '07:00',
        morning_checkin_end: s.morning_checkin_end ?? '11:00',
        afternoon_checkin_start: s.afternoon_checkin_start ?? '13:00',
        afternoon_checkin_end: s.afternoon_checkin_end ?? '15:20',
      });
    } catch {
      notify('error', lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុកការកំណត់' : 'Failed to load settings');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      notify('error', lang === 'km' ? 'Latitude ត្រូវក្នុងចន្លោះ -90 ដល់ 90' : 'Latitude must be between -90 and 90');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      notify('error', lang === 'km' ? 'Longitude ត្រូវក្នុងចន្លោះ -180 ដល់ 180' : 'Longitude must be between -180 and 180');
      return;
    }
    const radius = parseInt(form.attendance_radius);
    if (isNaN(radius) || radius < 10 || radius > 5000) {
      notify('error', lang === 'km' ? 'រ៉ាឌ្យុស 10-5000m' : 'Radius must be 10-5000m');
      return;
    }
    if (form.morning_checkin_end <= form.morning_checkin_start) {
      notify('error', lang === 'km' ? 'ម៉ោងបញ្ចប់ពេលព្រឹកត្រូវក្រោយម៉ោងចាប់ផ្តើម' : 'Morning end must be after start');
      return;
    }
    if (form.afternoon_checkin_end <= form.afternoon_checkin_start) {
      notify('error', lang === 'km' ? 'ម៉ោងបញ្ចប់ពេលរសៀលត្រូវក្រោយម៉ោងចាប់ផ្តើម' : 'Afternoon end must be after start');
      return;
    }
    setSaving(true);
    try {
      await api.updateSettings({
        school_name_en: form.school_name_en,
        school_name_kh: form.school_name_kh,
        latitude: lat,
        longitude: lon,
        attendance_radius: radius,
        morning_checkin_start: form.morning_checkin_start,
        morning_checkin_end: form.morning_checkin_end,
        afternoon_checkin_start: form.afternoon_checkin_start,
        afternoon_checkin_end: form.afternoon_checkin_end,
      });
      notify('success', lang === 'km' ? 'បានរក្សាទុក' : 'Saved');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed';
      notify('error', lang === 'km' ? 'បរាជ័យ' : 'Failed', message);
    }
    setSaving(false);
  }, [form, notify, lang]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Building2 className="h-4 w-4 text-brand-600" />
          {t('settings.school')}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t('settings.school')} (EN)</label>
            <input
              value={form.school_name_en}
              onChange={(e) => setForm({ ...form, school_name_en: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t('settings.school')} (KH)</label>
            <input
              value={form.school_name_kh}
              onChange={(e) => setForm({ ...form, school_name_kh: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Latitude</label>
              <input
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Longitude</label>
              <input
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{t('settings.radius')}</label>
            <input
              value={form.attendance_radius}
              onChange={(e) => setForm({ ...form, attendance_radius: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Clock className="h-4 w-4 text-brand-600" />
          {lang === 'km' ? 'ម៉ោងការ' : 'Time Rules'}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-brand-700 dark:text-brand-300">{t('checkin.morning')}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Start</label>
                <input type="time" value={form.morning_checkin_start} onChange={(e) => setForm({ ...form, morning_checkin_start: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">End</label>
                <input type="time" value={form.morning_checkin_end} onChange={(e) => setForm({ ...form, morning_checkin_end: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-brand-700 dark:text-brand-300">{t('checkin.afternoon')}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Start</label>
                <input type="time" value={form.afternoon_checkin_start} onChange={(e) => setForm({ ...form, afternoon_checkin_start: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">End</label>
                <input type="time" value={form.afternoon_checkin_end} onChange={(e) => setForm({ ...form, afternoon_checkin_end: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Palette className="h-4 w-4 text-brand-600" />
          {t('settings.theme')}
        </h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'auto'] as const).map((th) => (
            <button
              key={th}
              onClick={() => setTheme(th)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                theme === th
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                  : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              {th === 'light' ? t('settings.light') : th === 'dark' ? t('settings.dark') : t('settings.auto')}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Globe className="h-4 w-4 text-brand-600" />
          {t('settings.language')}
        </h2>
        <div className="flex gap-2">
          {(['km', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                lang === l
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                  : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              {l === 'km' ? 'ខ្មែរ' : 'English'}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t('common.save')}
      </button>
    </div>
  );
}
