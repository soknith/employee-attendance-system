import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  BookOpen,
  LogIn,
  LogOut,
  QrCode,
  CalendarDays,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { api, type DashboardData, type AttendanceRecord, type DayStat, type CalendarDay, type Teacher } from '@/lib/apiClient';
import type { TabId } from '@/components/Sidebar';

type Stats = {
  total: number;
  present: number;
  late: number;
  absent: number;
  leave: number;
  qrScans: number;
};

const STATUS_COLORS: Record<CalendarDay['status'], string> = {
  present: 'bg-brand-500',
  late: 'bg-amber-500',
  absent: 'bg-red-500',
  leave: 'bg-blue-500',
  holiday: 'bg-gray-400',
  none: 'bg-gray-100 dark:bg-gray-700',
};

const STATUS_RING: Record<CalendarDay['status'], string> = {
  present: 'ring-brand-400',
  late: 'ring-amber-400',
  absent: 'ring-red-400',
  leave: 'ring-blue-400',
  holiday: 'ring-gray-300',
  none: 'ring-transparent',
};

function WeeklyBarChart({ data, lang }: { data: DayStat[]; lang: string }) {
  const maxVal = Math.max(...data.map((d) => d.present + d.late + d.absent + d.leave), 1);
  const dayLabels = lang === 'km'
    ? ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex h-48 items-end justify-between gap-2">
      {data.map((d, i) => {
        const day = new Date(d.date);
        const label = dayLabels[day.getDay()];
        const total = d.present + d.late + d.absent + d.leave;
        const heightPct = (total / maxVal) * 100;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full max-w-[2.5rem] flex-col-reverse" style={{ height: '160px' }}>
              <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${heightPct}%` }}>
                {d.present > 0 && <div className="bg-brand-500" style={{ height: `${(d.present / total) * 100}%` }} />}
                {d.late > 0 && <div className="bg-amber-500" style={{ height: `${(d.late / total) * 100}%` }} />}
                {d.leave > 0 && <div className="bg-blue-500" style={{ height: `${(d.leave / total) * 100}%` }} />}
                {d.absent > 0 && <div className="bg-red-500" style={{ height: `${(d.absent / total) * 100}%` }} />}
              </div>
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyLineChart({ data }: { data: DayStat[] }) {
  const maxVal = Math.max(...data.map((d) => d.present + d.late), 1);
  const w = 100;
  const h = 40;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.present + d.late) / maxVal) * h;
    return `${x},${y}`;
  });
  const path = `M ${points.join(' L ')}`;
  const areaPath = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(14 165 233)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(14 165 233)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#monthlyGrad)" />
      <path d={path} fill="none" stroke="rgb(14 165 233)" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((d.present + d.late) / maxVal) * h;
        return <circle key={d.date} cx={x} cy={y} r="0.8" fill="rgb(14 165 233)" />;
      })}
    </svg>
  );
}

function AttendanceCalendar({ calendarData, year, month, lang }: { calendarData: CalendarDay[]; year: number; month: number; lang: string }) {
  const firstDay = new Date(year, month, 1).getDay();
  const dayLabels = lang === 'km'
    ? ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = lang === 'km'
    ? ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const cells: (CalendarDay | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (const d of calendarData) cells.push(d);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {monthNames[month]} {year}
        </h3>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="aspect-square" />;
          const dayNum = new Date(cell.date).getDate();
          const isToday = cell.date === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
          return (
            <div
              key={cell.date}
              className={`relative flex aspect-square items-center justify-center rounded-lg text-[10px] font-medium ring-1 ${STATUS_COLORS[cell.status]} ${STATUS_RING[cell.status]} ${isToday ? 'ring-2 ring-offset-1 ring-brand-500 dark:ring-offset-gray-800' : ''} ${cell.status === 'none' ? 'text-gray-400 dark:text-gray-500' : 'text-white'}`}
              title={`${cell.date}: ${cell.status}`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {(['present', 'late', 'absent', 'leave', 'holiday'] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ${STATUS_COLORS[s]}`} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {lang === 'km'
                ? { present: 'វត្តមាន', late: 'មកយឺត', absent: 'អវត្តមាន', leave: 'សុំច្បាប់', holiday: 'ថ្ងៃឈប់' }[s]
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage({ onNavigate }: { onNavigate?: (tab: TabId) => void }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, present: 0, late: 0, absent: 0, leave: 0, qrScans: 0 });
  const [recent, setRecent] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [weekly, setWeekly] = useState<DayStat[]>([]);
  const [monthly, setMonthly] = useState<DayStat[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data: DashboardData = await api.getDashboard();

      if (data.type === 'teacher') {
        setTodayAttendance(data.today_attendance ?? null);
        setStats({ total: 1, present: data.is_checked_in ? 1 : 0, late: 0, absent: data.is_checked_in ? 0 : 1, leave: 0, qrScans: 0 });
      } else {
        setStats({
          total: data.total_teachers ?? 0,
          present: data.present ?? 0,
          late: data.late ?? 0,
          absent: data.absent ?? 0,
          leave: data.leave ?? 0,
          qrScans: data.qr_scans_today ?? 0,
        });
        try {
          const [history, weeklyData, monthlyData, teachersRes] = await Promise.all([
            api.getAttendanceHistory(1),
            api.getWeeklyTrend(),
            api.getMonthlyTrend(),
            api.getTeachers({ page: 1 }),
          ]);
          setRecent(history.data ?? []);
          setWeekly(weeklyData);
          setMonthly(monthlyData);
          setTeachers(teachersRes.data ?? []);
        } catch {
          setRecent([]);
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedTeacherId) return;
    setCalLoading(true);
    api.getAttendanceCalendar(selectedTeacherId, calYear, calMonth)
      .then((d) => setCalendar(d))
      .catch(() => setCalendar([]))
      .finally(() => setCalLoading(false));
  }, [selectedTeacherId, calYear, calMonth]);

  const attendanceRate = stats.total > 0
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0;

  const cards = [
    { label: t('dash.total_teachers'), value: stats.total, icon: Users, color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', target: 'teachers' as TabId },
    { label: t('dash.present_today'), value: stats.present, icon: CheckCircle2, color: 'bg-brand-500', textColor: 'text-brand-600', bgColor: 'bg-brand-50 dark:bg-brand-900/20', target: 'reports' as TabId },
    { label: t('dash.late_today'), value: stats.late, icon: AlertTriangle, color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20', target: 'reports' as TabId },
    { label: t('dash.absent_today'), value: stats.absent, icon: XCircle, color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', target: 'reports' as TabId },
    { label: t('dash.leave_today'), value: stats.leave, icon: Clock, color: 'bg-purple-500', textColor: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20', target: 'leave' as TabId },
    { label: t('dash.qr_scans_today'), value: stats.qrScans, icon: QrCode, color: 'bg-cyan-500', textColor: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', target: 'attendance' as TabId },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6">


      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Teacher view: show today's attendance status */}
          {user?.role?.name === 'teacher' && todayAttendance && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {lang === 'km' ? 'វត្តមានថ្ងៃនេះ' : "Today's Attendance"}
              </h2>
              <div className="flex items-center gap-3">
                {todayAttendance.check_in && <LogIn className="h-5 w-5 text-brand-600" />}
                {todayAttendance.check_out && <LogOut className="h-5 w-5 text-gray-400" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {todayAttendance.check_in
                      ? new Date(todayAttendance.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                    {todayAttendance.check_out && ' → '}
                    {todayAttendance.check_out
                      ? new Date(todayAttendance.check_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    todayAttendance.status === 'present'
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {todayAttendance.status === 'present' ? t('checkin.present') : t('checkin.late')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {cards.map((card) => {
              const Icon = card.icon;
              const clickable = !!onNavigate;
              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => onNavigate?.(card.target)}
                  disabled={!clickable}
                  className={`rounded-2xl border border-gray-200 ${card.bgColor} p-4 text-left transition-transform dark:border-gray-700 ${clickable ? 'cursor-pointer hover:scale-[1.03] hover:shadow-md active:scale-95' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className={`mt-2 text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                </button>
              );
            })}
          </div>

          {/* Attendance Rate + QR Scans summary */}
          {user?.role?.name !== 'teacher' && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <TrendingUp className="h-4 w-4 text-brand-600" />
                  {t('dash.attendance_rate')}
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-600">{attendanceRate}%</span>
                  <span className="mb-1 text-xs text-gray-400">
                    {stats.present + stats.late}/{stats.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${attendanceRate}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {user?.role?.name !== 'teacher' && weekly.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Weekly Bar Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <BarChart3 className="h-4 w-4 text-brand-600" />
                  {t('dash.weekly_chart')}
                </h2>
                <WeeklyBarChart data={weekly} lang={lang} />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {(['present', 'late', 'leave', 'absent'] as const).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded ${STATUS_COLORS[s]}`} />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {lang === 'km'
                          ? { present: 'វត្តមាន', late: 'មកយឺត', leave: 'សុំច្បាប់', absent: 'អវត្តមាន' }[s]
                          : s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Line Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <TrendingUp className="h-4 w-4 text-brand-600" />
                  {t('dash.monthly_chart')}
                </h2>
                <MonthlyLineChart data={monthly} />
                <p className="mt-2 text-[10px] text-gray-400">
                  {lang === 'km' ? 'វត្តមានក្នុងខែនេះ' : 'Present + Late this month'}
                </p>
              </div>
            </div>
          )}

          {/* Attendance Calendar */}
          {user?.role?.name !== 'teacher' && (
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <CalendarDays className="h-4 w-4 text-brand-600" />
                {t('dash.attendance_calendar')}
              </h2>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:max-w-xs"
                >
                  <option value="">{t('dash.select_teacher')}</option>
                  {teachers.map((tch) => (
                    <option key={tch.id} value={tch.id}>
                      {tch.full_name_en} {tch.full_name_kh ? `(${tch.full_name_kh})` : ''}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
                      else setCalMonth(calMonth - 1);
                    }}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
                      else setCalMonth(calMonth + 1);
                    }}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    →
                  </button>
                </div>
              </div>
              {calLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : selectedTeacherId ? (
                <AttendanceCalendar calendarData={calendar} year={calYear} month={calMonth} lang={lang} />
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">
                  {t('dash.no_calendar_data')}
                </p>
              )}
            </div>
          )}

          {/* Recent activities */}
          {recent.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <BookOpen className="h-4 w-4 text-brand-600" />
                {t('dash.recent')}
              </h2>
              <ul className="space-y-2">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-750">
                    <div className="flex items-center gap-2">
                      {r.check_in && !r.check_out ? (
                        <LogIn className="h-4 w-4 text-brand-600" />
                      ) : (
                        <LogOut className="h-4 w-4 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {r.teacher?.full_name_en ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.check_in && !r.check_out ? 'Check In' : 'Check Out'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === 'present'
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {r.status === 'present' ? t('checkin.present') : t('checkin.late')}
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {r.check_in
                          ? new Date(r.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
