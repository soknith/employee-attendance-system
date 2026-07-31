import { useCallback, useEffect, useState } from 'react';
import { Calendar, Download, Loader2, MapPin, Clock, ClipboardList, LogIn, LogOut, Printer } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useToasts } from '@/hooks/useToasts';
import { ToastContainer } from '@/components/Toast';
import { api, type AttendanceRecord } from '@/lib/apiClient';

type ReportTab = 'daily' | 'weekly' | 'monthly';

function formatDate(d: string, lang: string) {
  return new Date(d).toLocaleString(lang === 'km' ? 'km-KH' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ReportsPage() {
  const { t, lang } = useI18n();
  const { toasts, notify, dismiss } = useToasts();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReportTab>('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAttendanceHistory(1, 1000);
      const all: AttendanceRecord[] = res.data ?? [];

      let filtered = all;
      if (tab === 'daily') {
        filtered = all.filter((r) => r.attendance_date === date);
      } else if (tab === 'weekly') {
        const d = new Date(date);
        d.setDate(d.getDate() - 6);
        const startStr = d.toISOString().slice(0, 10);
        filtered = all.filter((r) => r.attendance_date >= startStr && r.attendance_date <= date);
      } else {
        const d = new Date(date);
        d.setDate(d.getDate() - 29);
        const startStr = d.toISOString().slice(0, 10);
        filtered = all.filter((r) => r.attendance_date >= startStr && r.attendance_date <= date);
      }
      setRecords(filtered);
    } catch {
      setRecords([]);
      notify('error', lang === 'km' ? 'បរាជ័យក្នុងការផ្ទុក' : 'Failed to load');
    }
    setLoading(false);
  }, [tab, date]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = useCallback(() => {
    if (records.length === 0) {
      notify('info', lang === 'km' ? 'មិនមានទិន្នន័យ' : 'No data to export');
      return;
    }
    const rows = [
      [lang === 'km' ? 'ឈ្មោះគ្រូ' : 'Teacher', lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date', lang === 'km' ? 'ចូល' : 'Check In', lang === 'km' ? 'ចេញ' : 'Check Out', lang === 'km' ? 'ស្ថានភាព' : 'Status', lang === 'km' ? 'ម៉ោងធ្វើការ' : 'Working Hours', 'GPS'],
      ...records.map((r) => [
        r.teacher?.full_name_en ?? '',
        r.attendance_date,
        r.check_in ?? '',
        r.check_out ?? '',
        r.status,
        r.working_hours,
        r.latitude !== null ? `${r.latitude.toFixed(5)},${r.longitude?.toFixed(5)}` : '',
      ]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${tab}-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', lang === 'km' ? 'បាននាំចេញ CSV' : 'CSV exported');
  }, [records, tab, date, notify, lang]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const withGps = records.filter((r) => r.latitude !== null).length;

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'daily', label: t('report.daily') },
    { id: 'weekly', label: t('report.weekly') },
    { id: 'monthly', label: t('report.monthly') },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        >
          <Download className="h-3.5 w-3.5" />
          CSV
        </button>
        <button
          onClick={printReport}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        >
          <Printer className="h-3.5 w-3.5" />
          {t('report.print')}
        </button>
      </div>

      <div className="mb-4 flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === tb.id
                ? 'bg-white text-brand-700 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Calendar className="h-5 w-5 text-gray-400" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-center dark:border-brand-700 dark:bg-brand-900/20">
          <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{present}</p>
          <p className="text-xs text-brand-700 dark:text-brand-400">{t('checkin.present')}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center dark:border-amber-700 dark:bg-amber-900/20">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{late}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">{t('checkin.late')}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-700 dark:bg-blue-900/20">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{withGps}</p>
          <p className="text-xs text-blue-700 dark:text-blue-400">GPS</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <ClipboardList className="mb-2 h-10 w-10" />
          <p className="text-sm">{lang === 'km' ? 'មិនមានទិន្នន័យ' : 'No records found'}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!r.check_out ? (
                      <LogIn className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    ) : (
                      <LogOut className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {r.check_out ? (lang === 'km' ? 'ចេញ' : 'Check Out') : (lang === 'km' ? 'ចូល' : 'Check In')}
                    </p>
                  </div>
                  {r.teacher && (
                    <p className="mt-0.5 ml-6 text-xs text-gray-600 dark:text-gray-400">
                      {r.teacher.full_name_en} - {r.teacher.teacher_code}
                    </p>
                  )}
                  <div className="mt-1.5 ml-6 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                      r.status === 'present'
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {r.status === 'present' ? t('checkin.present') : t('checkin.late')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {r.check_in ? formatDate(r.check_in, lang) : r.attendance_date}
                    </span>
                    {r.working_hours !== null && r.working_hours !== undefined && (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <Clock className="h-3 w-3" />
                        {r.working_hours}h
                      </span>
                    )}
                    {r.latitude !== null && (
                      <span className="inline-flex items-center gap-1 text-brand-600">
                        <MapPin className="h-3 w-3" />
                        GPS
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
