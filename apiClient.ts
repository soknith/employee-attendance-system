import supabase from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'teacher';

export type Role = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
};

export type Department = {
  id: string;
  name: string;
  name_kh: string;
  name_en: string;
  description: string | null;
  status: boolean;
  teachers_count?: number;
};

export type Teacher = {
  id: string;
  department_id: string | null;
  department?: Department | null;
  teacher_code: string;
  first_name_kh: string;
  last_name_kh: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  full_name_en: string;
  full_name_kh: string;
  gender: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  photo: string | null;
  position: string | null;
  teaching_class: string | null;
  join_date: string | null;
  employment_status: string;
  gps_enabled: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
  id: string;
  teacher_id: string;
  teacher?: Teacher | null;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'late' | 'absent' | 'leave' | 'holiday';
  working_hours: number;
  late_minutes: number;
  remark: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  distance: number | null;
  device_name: string | null;
  browser: string | null;
  operating_system: string | null;
  internet_status: string;
};

export type LeaveRequest = {
  id: string;
  teacher_id: string;
  teacher?: Teacher | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  attachment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type TeachingSchedule = {
  id: string;
  teacher_id: string;
  teacher?: Teacher | null;
  subject: string;
  grade: string | null;
  classroom: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  academic_year_id: string | null;
  semester: string | null;
  status: boolean;
};

export type Notification = {
  id: string;
  user_id: string | null;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type SchoolSettings = {
  id: string;
  school_name_kh: string;
  school_name_en: string;
  school_logo: string | null;
  school_address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  attendance_radius: number;
  morning_checkin_start: string;
  morning_checkin_end: string;
  afternoon_checkin_start: string;
  afternoon_checkin_end: string;
  language: string;
  theme: string;
  timezone: string;
};

export type User = {
  id: string;
  teacher_id: string | null;
  role: Role | null;
  username: string;
  email: string;
  phone: string | null;
  status: string;
  last_login: string | null;
  last_login_ip: string | null;
  teacher?: Teacher | null;
};

export type DashboardData = {
  type: 'teacher' | 'admin';
  today_attendance?: AttendanceRecord | null;
  is_checked_in?: boolean;
  is_checked_out?: boolean;
  total_teachers?: number;
  present?: number;
  late?: number;
  absent?: number;
  leave?: number;
  qr_scans_today?: number;
};

export type DayStat = {
  date: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
};

export type CalendarDay = {
  date: string;
  status: 'present' | 'late' | 'absent' | 'leave' | 'holiday' | 'none';
};

export type GpsVerification = {
  valid: boolean;
  inside_radius: boolean;
  accuracy_valid: boolean;
  distance: number;
  radius: number;
  message: string;
};

export type IdCard = {
  id: string;
  teacher_id: string;
  employee_id: string | null;
  card_number: string | null;
  photo_url: string | null;
  qr_code: string | null;
  barcode: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  signature: string | null;
  status: 'active' | 'inactive' | 'expired' | 'lost' | 'replaced';
  printed_at: string | null;
  printed_by: string | null;
  created_at: string;
  updated_at: string;
  teacher?: Teacher | null;
};

export type IdCardPrintHistory = {
  id: string;
  card_id: string;
  printed_by: string | null;
  print_type: string;
  copies: number;
  layout: string;
  printed_at: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return localDateStr(new Date());
}

async function logActivity(userId: string, action: string, description?: string): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      description: description ?? null,
      user_agent: navigator.userAgent,
    });
  } catch {
    // non-blocking — logging failures should never break the main operation
  }
}

async function logAudit(tableName: string, recordId: string | null, action: string, oldValue: Record<string, unknown> | null, newValue: Record<string, unknown> | null, changedBy: string): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action,
      old_value: oldValue,
      new_value: newValue,
      changed_by: changedBy,
      user_agent: navigator.userAgent,
    });
  } catch {
    // non-blocking
  }
}

function validateGps(latitude: number, longitude: number): string | null {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return 'Invalid GPS coordinates';
  }
  if (latitude < -90 || latitude > 90) {
    return 'Latitude must be between -90 and 90';
  }
  if (longitude < -180 || longitude > 180) {
    return 'Longitude must be between -180 and 180';
  }
  return null;
}

function mapProfileToUser(profile: Record<string, unknown>, email: string, teacher?: Record<string, unknown> | null): User {
  const role = profile.role as string;
  const teacherData = teacher as Record<string, unknown> | null;
  const dept = teacherData?.departments as Record<string, unknown> | null;
  const mappedTeacher: Teacher | null = teacherData
    ? {
        id: teacherData.id as string,
        department_id: (teacherData.department_id as string) ?? null,
        department: dept
          ? {
              id: dept.id as string,
              name: (dept.name as string) ?? '',
              name_en: (dept.name as string) ?? '',
              name_kh: (dept.name_km as string) ?? '',
              description: null,
              status: true,
            }
          : null,
        teacher_code: (teacherData.employee_code as string) ?? '',
        first_name_kh: (teacherData.full_name_km as string) ?? '',
        last_name_kh: null,
        first_name_en: (teacherData.name as string) ?? '',
        last_name_en: null,
        full_name_en: (teacherData.name as string) ?? '',
        full_name_kh: (teacherData.full_name_km as string) ?? '',
        gender: (teacherData.gender as string) ?? 'male',
        date_of_birth: (teacherData.date_of_birth as string) ?? null,
        phone: (teacherData.phone as string) ?? null,
        email: (teacherData.email as string) ?? null,
        address: (teacherData.address as string) ?? null,
        photo: (profile.avatar_url as string) ?? null,
        position: (teacherData.position as string) ?? null,
        teaching_class: (teacherData.teaching_class as string) ?? null,
        join_date: (teacherData.hire_date as string) ?? null,
        employment_status: (teacherData.status as string) ?? 'active',
        gps_enabled: true,
        status: (teacherData.status as string) === 'active',
        created_at: (teacherData.created_at as string) ?? '',
        updated_at: (teacherData.updated_at as string) ?? '',
      }
    : null;
  return {
    id: profile.user_id as string,
    teacher_id: (teacherData?.id as string) ?? null,
    role: { id: role, name: role, display_name: role, description: null },
    username: email,
    email,
    phone: (profile.phone as string) ?? null,
    status: profile.is_active ? 'active' : 'inactive',
    last_login: null,
    last_login_ip: null,
    teacher: mappedTeacher,
  };
}

export const api = {
  // ─── Auth ───
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session || !data.user) throw new Error('Login failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    const { data: teacher } = await supabase
      .from('teachers')
      .select('*, departments(*)')
      .eq('user_id', data.user.id)
      .maybeSingle();

    const user = mapProfileToUser(profile ?? {}, data.user.email ?? email, teacher);
    await logActivity(data.user.id, 'login', `User ${email} logged in`);
    return { token: data.session.access_token, user };
  },

  async logout(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await logActivity(session.user.id, 'logout', `User logged out`);
    }
    await supabase.auth.signOut();
  },

  async getProfile(): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    const { data: teacher } = await supabase
      .from('teachers')
      .select('*, departments(*)')
      .eq('user_id', session.user.id)
      .maybeSingle();

    return mapProfileToUser(profile ?? {}, session.user.email ?? '', teacher);
  },

  async updateProfile(payload: { phone?: string; email?: string; full_name?: string; full_name_km?: string }): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const profUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const teacherUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (payload.phone !== undefined) {
      profUpdate.phone = payload.phone;
      teacherUpdate.phone = payload.phone;
    }

    if (payload.full_name !== undefined) {
      profUpdate.full_name = payload.full_name;
      teacherUpdate.name = payload.full_name;
    }

    if (payload.full_name_km !== undefined) {
      profUpdate.full_name_km = payload.full_name_km || null;
      teacherUpdate.full_name_km = payload.full_name_km || null;
    }

    if (Object.keys(profUpdate).length > 1) {
      const { error: profErr } = await supabase
        .from('profiles')
        .update(profUpdate)
        .eq('user_id', session.user.id);
      if (profErr) throw profErr;
    }

    if (Object.keys(teacherUpdate).length > 1) {
      const { error: teacherErr } = await supabase
        .from('teachers')
        .update(teacherUpdate)
        .eq('user_id', session.user.id);
      if (teacherErr && teacherErr.code !== 'PGRNT116') throw teacherErr;
    }

    if (payload.email && payload.email !== session.user.email) {
      const { error } = await supabase.auth.updateUser({ email: payload.email });
      if (error) throw error;
      await supabase
        .from('profiles')
        .update({ email: payload.email, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
      await supabase
        .from('teachers')
        .update({ email: payload.email, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    }

    return this.getProfile();
  },

  async changePassword(currentPassword: string, password: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email ?? '',
      password: currentPassword,
    });
    if (signInError) throw new Error('Current password is incorrect');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async uploadProfilePhoto(file: File): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const ext = file.name.split('.').pop();
    const path = `${session.user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(path);

    await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id);

    return this.getProfile();
  },

  async deleteProfilePhoto(): Promise<User> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    await supabase
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id);

    return this.getProfile();
  },

  // ─── Dashboard ───
  async getDashboard(): Promise<DashboardData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    const role = profile?.role ?? 'teacher';

    if (role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const today = todayStr();
      const { data: todayRecords } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('teacher_id', teacher?.id ?? '')
        .gte('scanned_at', `${today}T00:00:00`)
        .lte('scanned_at', `${today}T23:59:59`)
        .order('scanned_at', { ascending: false });

      const records = todayRecords ?? [];
      const checkInRec = records.find((r: { check_type: string }) => r.check_type === 'check_in');
      const checkOutRec = records.find((r: { check_type: string }) => r.check_type === 'check_out');
      const latestRec = (records[0] as Record<string, unknown>) ?? null;

      const todayAttendance: AttendanceRecord | null = latestRec
        ? {
            id: latestRec.id as string,
            teacher_id: latestRec.teacher_id as string,
            teacher: null,
            attendance_date: (latestRec.scanned_at as string)?.slice(0, 10) ?? today,
            check_in: checkInRec ? (checkInRec as Record<string, unknown>).scanned_at as string : null,
            check_out: checkOutRec ? (checkOutRec as Record<string, unknown>).scanned_at as string : null,
            status: ((latestRec.attendance_status as string) ?? (latestRec.status as string) ?? 'present') as AttendanceRecord['status'],
            working_hours: 0,
            late_minutes: 0,
            remark: (latestRec.note as string) ?? null,
            latitude: (latestRec.latitude as number) ?? null,
            longitude: (latestRec.longitude as number) ?? null,
            accuracy: (latestRec.accuracy_meters as number) ?? null,
            distance: (latestRec.distance_meters as number) ?? null,
            device_name: (latestRec.device_info as string) ?? null,
            browser: (latestRec.browser_info as string) ?? null,
            operating_system: null,
            internet_status: 'online',
          }
        : null;

      return {
        type: 'teacher',
        today_attendance: todayAttendance,
        is_checked_in: !!checkInRec,
        is_checked_out: !!checkOutRec,
      };
    }

    const { count: total } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const today = todayStr();

    // Get today's check-in records only (not check-out)
    const { data: todayCheckIns } = await supabase
      .from('attendance_records')
      .select('teacher_id, status')
      .eq('check_type', 'check_in')
      .gte('scanned_at', `${today}T00:00:00`)
      .lte('scanned_at', `${today}T23:59:59`);

    // Count unique teachers who checked in
    const checkInRecords = todayCheckIns ?? [];
    const presentCount = checkInRecords.filter((r: { status: string }) => r.status === 'present').length;
    const lateCount = checkInRecords.filter((r: { status: string }) => r.status === 'late').length;

    // Count teachers on approved leave today
    const { count: leaveCount } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today);

    const checkedInTotal = presentCount + lateCount;
    const absentCount = Math.max(0, (total ?? 0) - checkedInTotal - (leaveCount ?? 0));

    const { count: qrScans } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('check_type', 'check_in')
      .gte('scanned_at', `${today}T00:00:00`)
      .lte('scanned_at', `${today}T23:59:59`);

    return {
      type: 'admin',
      total_teachers: total ?? 0,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      leave: leaveCount ?? 0,
      qr_scans_today: qrScans ?? 0,
    };
  },

  async getWeeklyTrend(): Promise<DayStat[]> {
    const days: DayStat[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const { data: recs } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('check_type', 'check_in')
        .gte('scanned_at', `${dateStr}T00:00:00`)
        .lte('scanned_at', `${dateStr}T23:59:59`);
      const records = recs ?? [];
      const present = records.filter((r: { status: string }) => r.status === 'present').length;
      const late = records.filter((r: { status: string }) => r.status === 'late').length;
      const { count: leave } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .lte('start_date', dateStr)
        .gte('end_date', dateStr);
      const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      const absent = Math.max(0, (totalTeachers ?? 0) - present - late - (leave ?? 0));
      days.push({ date: dateStr, present, late, absent, leave: leave ?? 0 });
    }
    return days;
  },

  async getMonthlyTrend(): Promise<DayStat[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDate = localDateStr(new Date(year, month, 1));
    const endDate = localDateStr(new Date(year, month, daysInMonth));

    const { count: totalTeachers } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: allRecs } = await supabase
      .from('attendance_records')
      .select('scanned_at, status')
      .eq('check_type', 'check_in')
      .gte('scanned_at', `${startDate}T00:00:00`)
      .lte('scanned_at', `${endDate}T23:59:59`);

    const { data: allLeaves } = await supabase
      .from('leave_requests')
      .select('start_date, end_date')
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    const leaveDates = new Set<string>();
    for (const l of allLeaves ?? []) {
      const lr = l as Record<string, unknown>;
      const s = lr.start_date as string;
      const e = lr.end_date as string;
      const [sy, sm, sd] = s.split('-').map(Number);
      const [ey, em, ed] = e.split('-').map(Number);
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        leaveDates.add(d.toISOString().slice(0, 10));
      }
    }

    const recMap = new Map<string, { present: number; late: number }>();
    for (const r of allRecs ?? []) {
      const rr = r as Record<string, unknown>;
      const day = (rr.scanned_at as string).slice(0, 10);
      if (!recMap.has(day)) recMap.set(day, { present: 0, late: 0 });
      const entry = recMap.get(day)!;
      if (rr.status === 'late') entry.late++;
      else entry.present++;
    }

    const days: DayStat[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().slice(0, 10);
      const rec = recMap.get(dateStr) ?? { present: 0, late: 0 };
      const leave = leaveDates.has(dateStr) ? 1 : 0;
      const absent = Math.max(0, (totalTeachers ?? 0) - rec.present - rec.late - leave);
      days.push({ date: dateStr, present: rec.present, late: rec.late, absent, leave });
    }
    return days;
  },

  async getAttendanceCalendar(teacherId: string, year: number, month: number): Promise<CalendarDay[]> {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDate = localDateStr(new Date(year, month, 1));
    const endDate = localDateStr(new Date(year, month, daysInMonth));

    const { data: records } = await supabase
      .from('attendance_records')
      .select('scanned_at, status')
      .eq('teacher_id', teacherId)
      .eq('check_type', 'check_in')
      .gte('scanned_at', `${startDate}T00:00:00`)
      .lte('scanned_at', `${endDate}T23:59:59`);

    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('start_date, end_date')
      .eq('teacher_id', teacherId)
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    const { data: holidays } = await supabase
      .from('holidays')
      .select('date, is_recurring')
      .lte('date', endDate)
      .gte('date', startDate);

    const statusMap = new Map<string, 'present' | 'late' | 'absent' | 'leave' | 'holiday'>();
    for (const r of records ?? []) {
      const dateStr = (r as Record<string, unknown>).scanned_at as string;
      const day = dateStr.slice(0, 10);
      const status = (r as Record<string, unknown>).status as string;
      if (!statusMap.has(day)) {
        statusMap.set(day, status === 'late' ? 'late' : 'present');
      }
    }
    for (const l of leaves ?? []) {
      const lr = l as Record<string, unknown>;
      const s = lr.start_date as string;
      const e = lr.end_date as string;
      for (let day = 1; day <= daysInMonth; day++) {
        const ds = localDateStr(new Date(year, month, day));
        if (ds >= s && ds <= e) statusMap.set(ds, 'leave');
      }
    }
    for (const h of holidays ?? []) {
      const hr = h as Record<string, unknown>;
      const hd = hr.date as string;
      if (hd >= startDate && hd <= endDate) statusMap.set(hd, 'holiday');
    }

    const result: CalendarDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = localDateStr(new Date(year, month, day));
      result.push({ date: ds, status: statusMap.get(ds) ?? 'none' });
    }
    return result;
  },

  // ─── Attendance ───
  async getTodayAttendance(): Promise<AttendanceRecord | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!teacher) return null;

    const today = todayStr();
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('teacher_id', teacher.id)
      .gte('scanned_at', `${today}T00:00:00`)
      .lte('scanned_at', `${today}T23:59:59`)
      .order('scanned_at', { ascending: false });

    const records = data ?? [];
    if (records.length === 0) return null;

    const checkInRec = records.find((r: Record<string, unknown>) => r.check_type === 'check_in');
    const checkOutRec = records.find((r: Record<string, unknown>) => r.check_type === 'check_out');
    const latest = (records[0] as Record<string, unknown>) ?? {};

    return {
      id: latest.id as string,
      teacher_id: latest.teacher_id as string,
      teacher: null,
      attendance_date: (latest.scanned_at as string)?.slice(0, 10) ?? today,
      check_in: checkInRec ? (checkInRec as Record<string, unknown>).scanned_at as string : null,
      check_out: checkOutRec ? (checkOutRec as Record<string, unknown>).scanned_at as string : null,
      status: ((latest.attendance_status as string) ?? (latest.status as string) ?? 'present') as AttendanceRecord['status'],
      working_hours: 0,
      late_minutes: 0,
      remark: (latest.note as string) ?? null,
      latitude: (latest.latitude as number) ?? null,
      longitude: (latest.longitude as number) ?? null,
      accuracy: (latest.accuracy_meters as number) ?? null,
      distance: (latest.distance_meters as number) ?? null,
      device_name: (latest.device_info as string) ?? null,
      browser: (latest.browser_info as string) ?? null,
      operating_system: null,
      internet_status: 'online',
    } as AttendanceRecord;
  },

  async getAttendanceHistory(page = 1, perPage = 20): Promise<PaginatedResponse<AttendanceRecord>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    let query = supabase
      .from('attendance_records')
      .select('*, teachers(*)', { count: 'exact' })
      .order('scanned_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (profile?.role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (teacher) {
        query = query.eq('teacher_id', teacher.id);
      }
    }

    const { data, count } = await query;

    const records = (data ?? []).map((r: Record<string, unknown>) => {
      const teacher = r.teachers as Teacher | null;
      return {
        ...r,
        teacher,
        attendance_date: r.scanned_at ? (r.scanned_at as string).slice(0, 10) : todayStr(),
        check_in: r.check_type === 'check_in' ? r.scanned_at : null,
        check_out: r.check_type === 'check_out' ? r.scanned_at : null,
        working_hours: 0,
        late_minutes: 0,
        accuracy: r.accuracy_meters,
        distance: r.distance_meters,
        device_name: r.device_info,
        browser: r.browser_info,
        operating_system: null,
        internet_status: 'online',
      } as unknown as AttendanceRecord;
    });

    return {
      success: true,
      message: 'OK',
      data: records,
      meta: {
        current_page: page,
        last_page: Math.ceil((count ?? 0) / perPage),
        per_page: perPage,
        total: count ?? 0,
      },
    };
  },

  async checkIn(payload: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    device_name?: string;
    browser?: string;
    operating_system?: string;
    internet_status?: string;
  }): Promise<AttendanceRecord> {
    const gpsError = validateGps(payload.latitude, payload.longitude);
    if (gpsError) throw new Error(gpsError);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!teacher) throw new Error('Teacher profile not found');

    const { data: settings } = await supabase
      .from('school_settings')
      .select('*')
      .maybeSingle();

    const distance = settings
      ? haversineDistance(payload.latitude, payload.longitude, settings.latitude, settings.longitude)
      : 0;

    const now = new Date();
    const nowStr = now.toISOString();
    const today = nowStr.slice(0, 10);

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('teacher_id', teacher.id)
      .gte('scanned_at', `${today}T00:00:00`)
      .lte('scanned_at', `${today}T23:59:59`)
      .eq('check_type', 'check_in')
      .maybeSingle();

    if (existing) {
      throw new Error('You have already checked in today.');
    }

    await logActivity(session.user.id, 'qr_scan', `Check-in at ${nowStr}`);

    const morningStart = settings?.morning_start ?? '07:00:00';
    const morningLateAfter = settings?.morning_late_after ?? '07:15:00';
    const morningEnd = settings?.morning_end ?? '11:00:00';
    const afternoonStart = settings?.afternoon_start ?? '13:00:00';
    const afternoonLateAfter = settings?.afternoon_late_after ?? '13:15:00';
    const afternoonEnd = settings?.afternoon_end ?? '15:20:00';

    const morningStartDate = new Date(`${today}T${morningStart}`);
    const morningEndDate = new Date(`${today}T${morningEnd}`);
    const afternoonStartDate = new Date(`${today}T${afternoonStart}`);
    const afternoonEndDate = new Date(`${today}T${afternoonEnd}`);

    let status: 'present' | 'late';
    let shift: string;

    if (now >= morningStartDate && now <= morningEndDate) {
      shift = 'morning';
      status = now > new Date(`${today}T${morningLateAfter}`) ? 'late' : 'present';
    } else if (now >= afternoonStartDate && now <= afternoonEndDate) {
      shift = 'afternoon';
      status = now > new Date(`${today}T${afternoonLateAfter}`) ? 'late' : 'present';
    } else {
      throw new Error('The afternoon attendance period has ended. School hours finish at 3:20 PM.');
    }

    const { data: record, error } = await supabase
      .from('attendance_records')
      .insert({
        teacher_id: teacher.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy_meters: payload.accuracy ?? null,
        status: status,
        scanned_at: nowStr,
        check_type: 'check_in',
        distance_meters: Math.round(distance),
        device_info: payload.device_name ?? null,
        browser_info: payload.browser ?? null,
        attendance_status: status,
        shift: shift,
      })
      .select('*')
      .single();

    if (error) throw error;
    const r = record as Record<string, unknown>;
    return {
      id: r.id as string,
      teacher_id: r.teacher_id as string,
      teacher: null,
      attendance_date: (r.scanned_at as string)?.slice(0, 10) ?? todayStr(),
      check_in: r.scanned_at as string,
      check_out: null,
      status: ((r.attendance_status as string) ?? (r.status as string) ?? 'present') as AttendanceRecord['status'],
      working_hours: 0,
      late_minutes: 0,
      remark: null,
      latitude: (r.latitude as number) ?? null,
      longitude: (r.longitude as number) ?? null,
      accuracy: (r.accuracy_meters as number) ?? null,
      distance: (r.distance_meters as number) ?? null,
      device_name: (r.device_info as string) ?? null,
      browser: (r.browser_info as string) ?? null,
      operating_system: null,
      internet_status: 'online',
    } as AttendanceRecord;
  },

  async checkOut(payload: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    device_name?: string;
    browser?: string;
    operating_system?: string;
    internet_status?: string;
  }): Promise<AttendanceRecord> {
    const gpsError = validateGps(payload.latitude, payload.longitude);
    if (gpsError) throw new Error(gpsError);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!teacher) throw new Error('Teacher profile not found');

    const { data: settings } = await supabase
      .from('school_settings')
      .select('*')
      .maybeSingle();

    const distance = settings
      ? haversineDistance(payload.latitude, payload.longitude, settings.latitude, settings.longitude)
      : 0;

    const now = new Date();
    const nowStr = now.toISOString();
    const today = nowStr.slice(0, 10);

    const morningEnd = settings?.morning_end ?? '11:00:00';
    const afternoonEnd = settings?.afternoon_end ?? '15:20:00';
    const afternoonEndDate = new Date(`${today}T${afternoonEnd}`);

    if (now > afternoonEndDate) {
      throw new Error('The afternoon attendance period has ended. School hours finish at 3:20 PM.');
    }

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('teacher_id', teacher.id)
      .gte('scanned_at', `${today}T00:00:00`)
      .lte('scanned_at', `${today}T23:59:59`)
      .eq('check_type', 'check_out')
      .maybeSingle();

    if (existing) {
      throw new Error('You have already checked out today.');
    }

    await logActivity(session.user.id, 'qr_scan', `Check-out at ${nowStr}`);

    const { data: record, error } = await supabase
      .from('attendance_records')
      .insert({
        teacher_id: teacher.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy_meters: payload.accuracy ?? null,
        status: 'present',
        scanned_at: nowStr,
        check_type: 'check_out',
        distance_meters: Math.round(distance),
        device_info: payload.device_name ?? null,
        browser_info: payload.browser ?? null,
        attendance_status: 'present',
      })
      .select('*')
      .single();

    if (error) throw error;
    const r = record as Record<string, unknown>;
    return {
      id: r.id as string,
      teacher_id: r.teacher_id as string,
      teacher: null,
      attendance_date: (r.scanned_at as string)?.slice(0, 10) ?? todayStr(),
      check_in: null,
      check_out: r.scanned_at as string,
      status: ((r.attendance_status as string) ?? (r.status as string) ?? 'present') as AttendanceRecord['status'],
      working_hours: 0,
      late_minutes: 0,
      remark: null,
      latitude: (r.latitude as number) ?? null,
      longitude: (r.longitude as number) ?? null,
      accuracy: (r.accuracy_meters as number) ?? null,
      distance: (r.distance_meters as number) ?? null,
      device_name: (r.device_info as string) ?? null,
      browser: (r.browser_info as string) ?? null,
      operating_system: null,
      internet_status: 'online',
    } as AttendanceRecord;
  },

  async verifyGps(latitude: number, longitude: number, accuracy?: number): Promise<GpsVerification> {
    const { data: settings } = await supabase
      .from('school_settings')
      .select('*')
      .maybeSingle();

    if (!settings) {
      return { valid: false, inside_radius: false, accuracy_valid: false, distance: 0, radius: 0, message: 'Settings not found' };
    }

    const distance = haversineDistance(latitude, longitude, settings.latitude, settings.longitude);
    const insideRadius = distance <= settings.radius_meters;
    const accuracyValid = !accuracy || accuracy <= 50;

    return {
      valid: insideRadius && accuracyValid,
      inside_radius: insideRadius,
      accuracy_valid: accuracyValid,
      distance: Math.round(distance),
      radius: settings.radius_meters,
      message: insideRadius ? 'You are within school area.' : 'You are outside school area.',
    };
  },

  // ─── Teachers ───
  async getTeachers(params?: { page?: number; search?: string }): Promise<PaginatedResponse<Teacher>> {
    const page = params?.page ?? 1;
    const perPage = 20;
    let query = supabase
      .from('teachers')
      .select('*, departments(*)', { count: 'exact' })
      .order('name', { ascending: true })
      .range((page - 1) * perPage, page * perPage - 1);

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,employee_code.ilike.%${params.search}%`);
    }

    const { data, count } = await query;

    const teachers = (data ?? []).map((t: Record<string, unknown>) => {
      const dept = t.departments as Department | null;
      const nameParts = (t.name as string ?? '').split(' ');
      return {
        ...t,
        department: dept,
        teacher_code: t.employee_code as string,
        first_name_kh: t.full_name_km as string,
        first_name_en: nameParts[0] ?? '',
        last_name_en: nameParts.slice(1).join(' ') || null,
        full_name_en: t.name as string,
        full_name_kh: t.full_name_km as string,
        employment_status: t.status as string,
        gps_enabled: true,
      } as unknown as Teacher;
    });

    return {
      success: true,
      message: 'OK',
      data: teachers,
      meta: { current_page: page, last_page: Math.ceil((count ?? 0) / perPage), per_page: perPage, total: count ?? 0 },
    };
  },

  async createTeacher(payload: Partial<Teacher>): Promise<Teacher> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('teachers')
      .insert({
        name: payload.full_name_en ?? `${payload.first_name_en ?? ''} ${payload.last_name_en ?? ''}`.trim(),
        full_name_km: payload.first_name_kh,
        email: payload.email,
        phone: payload.phone,
        employee_code: payload.teacher_code,
        gender: payload.gender ?? 'male',
        department_id: payload.department_id,
        status: 'active',
      })
      .select('*')
      .single();

    if (error) throw error;
    if (session?.user?.id) {
      await logActivity(session.user.id, 'create_teacher', `Created teacher: ${payload.full_name_en ?? payload.first_name_en ?? ''}`);
      await logAudit('teachers', (data as Record<string, unknown>).id as string, 'INSERT', null, data as Record<string, unknown>, session.user.id);
    }
    return data as unknown as Teacher;
  },

  async updateTeacher(id: string, payload: Partial<Teacher>): Promise<Teacher> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: oldRow } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.full_name_en) {
      update.name = payload.full_name_en;
    } else if (payload.first_name_en !== undefined || payload.last_name_en !== undefined) {
      const enName = `${payload.first_name_en ?? ''} ${payload.last_name_en ?? ''}`.trim();
      if (enName) update.name = enName;
    }
    if (payload.first_name_kh !== undefined) update.full_name_km = payload.first_name_kh || null;
    if (payload.email !== undefined) update.email = payload.email || null;
    if (payload.phone !== undefined) update.phone = payload.phone || null;
    if (payload.teacher_code !== undefined) update.employee_code = payload.teacher_code || null;
    if (payload.gender !== undefined) update.gender = payload.gender;
    if (payload.department_id !== undefined) update.department_id = payload.department_id || null;
    if (payload.position !== undefined) update.position = payload.position || null;
    if (payload.teaching_class !== undefined) update.teaching_class = payload.teaching_class || null;

    const { data, error } = await supabase
      .from('teachers')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Sync name changes to profiles table
    if (data && (data as Record<string, unknown>).user_id) {
      const profSync: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (update.name !== undefined) profSync.full_name = update.name;
      if (update.full_name_km !== undefined) profSync.full_name_km = update.full_name_km ?? null;
      if (Object.keys(profSync).length > 1) {
        await supabase
          .from('profiles')
          .update(profSync)
          .eq('user_id', (data as Record<string, unknown>).user_id as string);
      }
    }

    if (session?.user?.id) {
      await logActivity(session.user.id, 'update_teacher', `Updated teacher: ${payload.full_name_en ?? id}`);
      await logAudit('teachers', id, 'UPDATE', oldRow as Record<string, unknown> ?? null, data as Record<string, unknown>, session.user.id);
    }
    return data as unknown as Teacher;
  },

  async deleteTeacher(id: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: oldRow } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw error;
    if (session?.user?.id) {
      await logActivity(session.user.id, 'delete_teacher', `Deleted teacher: ${id}`);
      await logAudit('teachers', id, 'DELETE', oldRow as Record<string, unknown> ?? null, null, session.user.id);
    }
  },

  // ─── Departments ───
  async getDepartments(): Promise<PaginatedResponse<Department>> {
    const { data, count } = await supabase
      .from('departments')
      .select('*', { count: 'exact' });

    const depts = (data ?? []).map((d: Record<string, unknown>) => ({
      ...d,
      name_en: d.name as string,
      name_kh: d.name_km as string,
      status: true,
    } as unknown as Department));

    return {
      success: true,
      message: 'OK',
      data: depts,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: count ?? 0 },
    };
  },

  async createDepartment(payload: { name_en: string; name_km?: string | null; code?: string | null }): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name: payload.name_en, name_km: payload.name_km, code: payload.code })
      .select('*')
      .single();
    if (error) throw error;
    return { ...data, name_en: data.name, name_kh: data.name_km, status: true } as unknown as Department;
  },

  async updateDepartment(id: string, payload: { name_en?: string; name_km?: string | null; code?: string | null }): Promise<Department> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.name_en) update.name = payload.name_en;
    if (payload.name_km !== undefined) update.name_km = payload.name_km;
    if (payload.code !== undefined) update.code = payload.code;
    const { data, error } = await supabase
      .from('departments')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return { ...data, name_en: data.name, name_kh: data.name_km, status: true } as unknown as Department;
  },

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Leave Requests ───
  async getLeaveRequests(params?: { page?: number; status?: string }): Promise<PaginatedResponse<LeaveRequest>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    const page = params?.page ?? 1;
    const perPage = 20;
    let query = supabase
      .from('leave_requests')
      .select('*, teachers(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    if (profile?.role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (teacher) {
        query = query.eq('teacher_id', teacher.id);
      }
    }

    const { data, count } = await query;

    const leaves = (data ?? []).map((r: Record<string, unknown>) => {
      const teacher = r.teachers as Teacher | null;
      const start = new Date(r.start_date as string);
      const end = new Date(r.end_date as string);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return { ...r, teacher, days } as unknown as LeaveRequest;
    });

    return {
      success: true,
      message: 'OK',
      data: leaves,
      meta: { current_page: page, last_page: Math.ceil((count ?? 0) / perPage), per_page: perPage, total: count ?? 0 },
    };
  },

  async createLeaveRequest(payload: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!teacher) throw new Error('Teacher profile not found');

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        teacher_id: teacher.id,
        leave_type: payload.leave_type,
        start_date: payload.start_date,
        end_date: payload.end_date,
        reason: payload.reason,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as LeaveRequest;
  },

  async approveLeave(id: string): Promise<LeaveRequest> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status: 'approved', approved_by: session.user.id, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as LeaveRequest;
  },

  async rejectLeave(id: string): Promise<LeaveRequest> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status: 'rejected', approved_by: session.user.id, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as LeaveRequest;
  },

  async deleteLeaveRequest(id: string): Promise<void> {
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── Notifications ───
  async getNotifications(page = 1): Promise<PaginatedResponse<Notification>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const perPage = 20;
    const { data, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    const notifs = (data ?? []).map((n: Record<string, unknown>) => ({
      ...n,
      message: n.body as string,
    }) as unknown as Notification);

    return {
      success: true,
      message: 'OK',
      data: notifs,
      meta: { current_page: page, last_page: Math.ceil((count ?? 0) / perPage), per_page: perPage, total: count ?? 0 },
    };
  },

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllNotificationsRead(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    if (error) throw error;
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  },

  async getUnreadNotificationCount(): Promise<number> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 0;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    return count ?? 0;
  },

  // ─── Settings ───
  async getSettings(): Promise<SchoolSettings> {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single();

    if (error) throw error;

    return {
      ...data,
      school_name_kh: data.school_name_km,
      school_name_en: data.school_name,
      attendance_radius: data.radius_meters,
      morning_checkin_start: data.morning_start,
      morning_checkin_end: data.morning_end,
      afternoon_checkin_start: data.afternoon_start,
      afternoon_checkin_end: data.afternoon_end,
      school_logo: null,
      school_address: null,
      language: 'en',
      theme: 'light',
      timezone: 'Asia/Phnom_Penh',
    } as unknown as SchoolSettings;
  },

  async updateSettings(payload: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.school_name_en) update.school_name = payload.school_name_en;
    if (payload.school_name_kh) update.school_name_km = payload.school_name_kh;
    if (payload.latitude !== undefined) update.latitude = payload.latitude;
    if (payload.longitude !== undefined) update.longitude = payload.longitude;
    if (payload.attendance_radius !== undefined) update.radius_meters = payload.attendance_radius;
    if (payload.morning_checkin_start) update.morning_start = payload.morning_checkin_start;
    if (payload.morning_checkin_end) update.morning_end = payload.morning_checkin_end;
    if (payload.afternoon_checkin_start) update.afternoon_start = payload.afternoon_checkin_start;
    if (payload.afternoon_checkin_end) update.afternoon_end = payload.afternoon_checkin_end;

    const { data: settingsRow } = await supabase
      .from('school_settings')
      .select('id')
      .maybeSingle();
    if (!settingsRow) throw new Error('School settings not found');
    const { data, error } = await supabase
      .from('school_settings')
      .update(update)
      .eq('id', (settingsRow as Record<string, unknown>).id as string)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return this.getSettings();
  },

  // ─── Schedules ───
  async getSchedules(): Promise<PaginatedResponse<TeachingSchedule>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    let query = supabase
      .from('teaching_schedules')
      .select('*, teachers(*)', { count: 'exact' })
      .order('day_of_week', { ascending: true });

    if (profile?.role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (teacher) {
        query = query.eq('teacher_id', teacher.id);
      }
    }

    const { data, count } = await query;

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const schedules = (data ?? []).map((s: Record<string, unknown>) => ({
      ...s,
      classroom: s.room as string,
      day_of_week: dayNames[s.day_of_week as number] ?? 'monday',
      academic_year_id: null,
      semester: null,
      status: true,
    }) as unknown as TeachingSchedule);

    return {
      success: true,
      message: 'OK',
      data: schedules,
      meta: { current_page: 1, last_page: 1, per_page: 50, total: count ?? 0 },
    };
  },

  async createSchedule(payload: Partial<TeachingSchedule>): Promise<TeachingSchedule> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNum = dayNames.indexOf(payload.day_of_week ?? 'monday');

    const { data, error } = await supabase
      .from('teaching_schedules')
      .insert({
        teacher_id: teacher?.id,
        subject: payload.subject,
        grade: payload.grade,
        day_of_week: dayNum >= 0 ? dayNum : 1,
        start_time: payload.start_time,
        end_time: payload.end_time,
        room: payload.classroom,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as TeachingSchedule;
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase.from('teaching_schedules').delete().eq('id', id);
    if (error) throw error;
  },

  async updateSchedule(id: string, payload: Partial<TeachingSchedule>): Promise<TeachingSchedule> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.subject) update.subject = payload.subject;
    if (payload.grade !== undefined) update.grade = payload.grade;
    if (payload.classroom !== undefined) update.room = payload.classroom;
    if (payload.day_of_week) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayNum = dayNames.indexOf(payload.day_of_week);
      update.day_of_week = dayNum >= 0 ? dayNum : 1;
    }
    if (payload.start_time) update.start_time = payload.start_time;
    if (payload.end_time) update.end_time = payload.end_time;
    const { data, error } = await supabase
      .from('teaching_schedules')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as TeachingSchedule;
  },

  // ─── Reports (stub) ───
  async getDailyReport(date?: string): Promise<unknown> {
    return this.getAttendanceHistory(1);
  },

  async getMonthlyReport(month?: number, year?: number): Promise<unknown> {
    return this.getAttendanceHistory(1);
  },

  async getYearlyReport(year?: number): Promise<unknown> {
    return this.getAttendanceHistory(1);
  },

  async getTeacherReport(teacherId: string, month?: number, year?: number): Promise<unknown> {
    return this.getAttendanceHistory(1);
  },

  // ==================== ID CARDS ====================

  async getIdCards(): Promise<IdCard[]> {
    const { data, error } = await supabase
      .from('id_cards')
      .select(`
        *,
        teacher:teachers (
          id, name, full_name_km, email, phone, employee_code,
          gender, department_id, user_id, position, teaching_class,
          department:departments ( id, name, name_km )
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const cards = (data ?? []) as Record<string, unknown>[];
    return cards.map((c) => {
      const teacher = c.teacher as Record<string, unknown> | null;
      const dept = teacher?.department as Record<string, unknown> | null;
      return {
        ...c,
        teacher: teacher ? {
          ...teacher,
          teacher_code: teacher.employee_code ?? '',
          department: dept ? { ...dept, name_en: dept.name ?? '', name_kh: dept.name_km ?? '' } : null,
        } : null,
      } as unknown as IdCard;
    });
  },

  async getMyIdCard(): Promise<IdCard | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!teacher) throw new Error('Teacher profile not found');

    const { data, error } = await supabase
      .from('id_cards')
      .select(`
        *,
        teacher:teachers (
          id, name, full_name_km, email, phone, employee_code,
          gender, department_id, user_id, position, teaching_class,
          department:departments ( id, name, name_km )
        )
      `)
      .eq('teacher_id', teacher.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const c = data as Record<string, unknown>;
    const teacherData = c.teacher as Record<string, unknown> | null;
    const dept = teacherData?.department as Record<string, unknown> | null;
    return {
      ...c,
      teacher: teacherData ? {
        ...teacherData,
        teacher_code: teacherData.employee_code ?? '',
        department: dept ? { ...dept, name_en: dept.name ?? '', name_kh: dept.name_km ?? '' } : null,
      } : null,
    } as unknown as IdCard;
  },

  async generateIdCard(teacherId: string): Promise<IdCard> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, employee_code')
      .eq('id', teacherId)
      .maybeSingle();
    if (!teacher) throw new Error('Teacher not found');

    const qrToken = crypto.randomUUID();
    const cardNumber = `SK-ID-${Date.now().toString().slice(-6)}`;
    const employeeId = (teacher as Record<string, unknown>).employee_code as string ?? `EMP-${teacherId.toString().slice(-6).toUpperCase()}`;
    const barcode = cardNumber;

    const { data, error } = await supabase
      .from('id_cards')
      .insert({
        teacher_id: teacherId,
        employee_id: employeeId,
        card_number: cardNumber,
        qr_code: qrToken,
        barcode,
        issue_date: todayStr(),
        status: 'active',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as unknown as IdCard;
  },

  async generateAllIdCards(): Promise<number> {
    const { data: existingCards } = await supabase
      .from('id_cards')
      .select('teacher_id');
    const existingIds = new Set((existingCards ?? []).map((c: Record<string, unknown>) => c.teacher_id as string));

    const { data: teachers } = await supabase
      .from('teachers')
      .select('id')
      .eq('status', 'active');

    if (!teachers || teachers.length === 0) return 0;

    let count = 0;
    for (const t of teachers) {
      if (existingIds.has(t.id)) continue;
      try {
        await this.generateIdCard(t.id);
        count++;
      } catch { /* skip duplicates */ }
    }
    return count;
  },

  async updateIdCardPhoto(cardId: string, photoUrl: string): Promise<void> {
    const { error } = await supabase
      .from('id_cards')
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
      .eq('id', cardId);
    if (error) throw error;
  },

  async updateIdCardStatus(cardId: string, status: IdCard['status']): Promise<void> {
    const { error } = await supabase
      .from('id_cards')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', cardId);
    if (error) throw error;
  },

  async regenerateQrCode(cardId: string): Promise<string> {
    const qrToken = crypto.randomUUID();
    const { error } = await supabase
      .from('id_cards')
      .update({ qr_code: qrToken, updated_at: new Date().toISOString() })
      .eq('id', cardId);
    if (error) throw error;
    return qrToken;
  },

  async recordPrintHistory(cardId: string, printType: string, copies: number, layout: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('id_card_print_history')
      .insert({
        card_id: cardId,
        printed_by: session?.user.id ?? null,
        print_type: printType,
        copies,
        layout,
      });
    if (error) throw error;

    await supabase
      .from('id_cards')
      .update({
        printed_at: new Date().toISOString(),
        printed_by: session?.user.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId);
  },

  async getPrintHistory(cardId: string): Promise<IdCardPrintHistory[]> {
    const { data, error } = await supabase
      .from('id_card_print_history')
      .select('*')
      .eq('card_id', cardId)
      .order('printed_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as IdCardPrintHistory[];
  },

  async uploadIdCardPhoto(file: File, userId: string): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('id-card-photos')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('id-card-photos')
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  },

  async verifyQrCode(qrToken: string): Promise<IdCard | null> {
    const { data, error } = await supabase
      .from('id_cards')
      .select(`
        *,
        teacher:teachers (
          id, name, full_name_km, email, phone, employee_code,
          gender, department_id, position, teaching_class,
          department:departments ( id, name, name_km )
        )
      `)
      .eq('qr_code', qrToken)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const c = data as Record<string, unknown>;
    const teacherData = c.teacher as Record<string, unknown> | null;
    const dept = teacherData?.department as Record<string, unknown> | null;
    return {
      ...c,
      teacher: teacherData ? {
        ...teacherData,
        teacher_code: teacherData.employee_code ?? '',
        department: dept ? { ...dept, name_en: dept.name ?? '', name_kh: dept.name_km ?? '' } : null,
      } : null,
    } as unknown as IdCard;
  },

  // ─── Online Presence ───
  async setOnlineStatus(isOnline: boolean): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('profiles')
      .update({ is_online: isOnline, last_seen: new Date().toISOString() })
      .eq('user_id', session.user.id);
  },

  async getOnlineUsers(): Promise<{ user_id: string; is_online: boolean; last_seen: string }[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, is_online, last_seen');
    if (error) return [];
    return (data ?? []) as { user_id: string; is_online: boolean; last_seen: string }[];
  },

  // ─── Direct Messages (1-on-1 chat) ───
  async getDirectMessages(otherUserId: string): Promise<{ id: string; sender_id: string; receiver_id: string; message: string | null; is_read: boolean; is_deleted: boolean; created_at: string }[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${session.user.id})`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) return [];
    return (data ?? []) as { id: string; sender_id: string; receiver_id: string; message: string | null; is_read: boolean; is_deleted: boolean; created_at: string }[];
  },

  async sendDirectMessage(receiverId: string, message: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');
    const { error } = await supabase
      .from('direct_messages')
      .insert({ sender_id: session.user.id, receiver_id: receiverId, message });
    if (error) throw error;
  },

  async deleteDirectMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('direct_messages')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markDirectMessagesRead(otherUserId: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('receiver_id', session.user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);
  },

  // ─── Group Chat ───
  async getGroupMessages(): Promise<{ id: string; user_id: string; message: string | null; image_url: string | null; is_edited: boolean; is_deleted: boolean; created_at: string }[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', '00000000-0000-0000-0000-000000000001')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) return [];
    return (data ?? []) as { id: string; user_id: string; message: string | null; image_url: string | null; is_edited: boolean; is_deleted: boolean; created_at: string }[];
  },

  async sendGroupMessage(message: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');
    const { error } = await supabase
      .from('chat_messages')
      .insert({ room_id: '00000000-0000-0000-0000-000000000001', user_id: session.user.id, message });
    if (error) throw error;
  },

  async deleteGroupMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  },

  // ─── All Users (for chat contact list) ───
  async getAllUsers(): Promise<{ id: string; username: string; email: string; role: string; teacher_id: string | null; teacher_name: string | null; teacher_photo: string | null }[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, role, is_online, last_seen, teachers(id, name, full_name_km, photo)')
      .neq('user_id', session.user.id)
      .order('role', { ascending: true });

    if (error || !data) return [];

    return (data ?? []).map((p: Record<string, unknown>) => {
      const teacher = p.teachers as Record<string, unknown> | null;
      return {
        id: p.user_id as string,
        username: (p.user_id as string).slice(0, 8),
        email: '',
        role: (p.role as string) ?? 'teacher',
        teacher_id: (teacher?.id as string) ?? null,
        teacher_name: (teacher?.name as string) ?? (teacher?.full_name_km as string) ?? null,
        teacher_photo: (teacher?.photo as string) ?? null,
      };
    });
  },
};

export function getSession(): Session | null {
  return supabase.auth.getSession() as unknown as Session | null;
}
