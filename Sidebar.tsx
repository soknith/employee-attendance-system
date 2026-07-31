import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Fingerprint,
  Users,
  Building2,
  CalendarDays,
  FileText,
  History,
  BarChart3,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  GraduationCap,
  Wifi,
  CreditCard as IdCardIcon,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/apiClient';
import { useI18n } from '@/contexts/I18nContext';

export type TabId =
  | 'dashboard'
  | 'attendance'
  | 'teachers'
  | 'departments'
  | 'schedule'
  | 'leave'
  | 'history'
  | 'reports'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'idcards'
  | 'myid'
  | 'chat';

type NavItem = {
  id: TabId;
  label: string;
  labelKm: string;
  icon: typeof LayoutDashboard;
  roles: string[];
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',          labelKm: 'ផ្ទាំងគ្រប់គ្រង',       icon: LayoutDashboard, roles: ['super_admin','admin','principal','teacher'] },
  { id: 'attendance',    label: 'GPS Attendance',      labelKm: 'វត្តមាន GPS',            icon: Fingerprint,     roles: ['super_admin','admin','principal','teacher'] },
  { id: 'teachers',      label: 'Teacher Management',  labelKm: 'គ្រប់គ្រងគ្រូ',         icon: Users,           roles: ['super_admin','admin','principal'] },
  { id: 'departments',   label: 'Departments',         labelKm: 'នាយកដ្ឋាន',             icon: Building2,       roles: ['super_admin','admin','principal'] },
  { id: 'schedule',      label: 'Teaching Schedule',   labelKm: 'តារាងបង្រៀន',           icon: CalendarDays,    roles: ['super_admin','admin','principal','teacher'] },
  { id: 'leave',         label: 'Leave Requests',      labelKm: 'សុំច្បាប់',              icon: FileText,        roles: ['super_admin','admin','principal','teacher'] },
  { id: 'history',       label: 'Attendance History',  labelKm: 'ប្រវត្តិវត្តមាន',       icon: History,         roles: ['super_admin','admin','principal','teacher'] },
  { id: 'reports',       label: 'Reports',             labelKm: 'របាយការ',               icon: BarChart3,       roles: ['super_admin','admin','principal'] },
  { id: 'idcards',        label: 'School ID Cards',     labelKm: 'ប័ណ្ណសម្គាល់សាលា',     icon: IdCardIcon,      roles: ['super_admin','admin','principal'] },
  { id: 'myid',           label: 'My ID Card',          labelKm: 'ប័ណ្ណសម្គាល់របស់ខ្ញុំ',  icon: IdCardIcon,      roles: ['teacher'] },
  { id: 'chat',           label: 'Chat',               labelKm: 'ឆាត',                icon: MessageCircle,   roles: ['super_admin','admin','principal','teacher'] },
  { id: 'notifications', label: 'Notifications',       labelKm: 'សេចក្តីជូនដំណឹង',      icon: Bell,            roles: ['super_admin','admin','principal','teacher'] },
  { id: 'profile',       label: 'My Profile',          labelKm: 'ប្រវត្តិរូប',            icon: UserIcon,        roles: ['super_admin','admin','principal','teacher'] },
  { id: 'settings',      label: 'Settings',            labelKm: 'ការកំណត់',              icon: Settings,        roles: ['super_admin','admin'] },
];

type SidebarProps = {
  active: TabId;
  onChange: (id: TabId) => void;
  onSignOut: () => void;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ active, onChange, onSignOut, open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const role = user?.role?.name ?? 'teacher';
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleNav = (id: TabId) => {
    onChange(id);
    onClose();
  };

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getOnlineUsers().then((users) => {
      const me = users.find((u: { user_id: string; is_online: boolean }) => u.user_id === user.id);
      setIsOnline(me?.is_online ?? true);
    }).catch(() => {});
    const interval = setInterval(() => {
      api.getOnlineUsers().then((users: { user_id: string; is_online: boolean }[]) => {
        const me = users.find((u: { user_id: string; is_online: boolean }) => u.user_id === user.id);
        setIsOnline(me?.is_online ?? true);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const avatarSrc = user?.teacher?.photo ?? null;
  const displayName = user?.teacher?.full_name_en ?? user?.teacher?.full_name_kh ?? user?.username ?? 'User';
  const roleName = user?.role?.display_name ?? user?.role?.name ?? 'Teacher';
  const department = user?.teacher?.department?.name ?? '';

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-gray-900 shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 lg:dark:border-gray-800
          ${open ? 'translate-x-0' : '-translate-x-full'}
          xl:w-64 md:w-56
        `}
      >
        {/* Logo / School Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #935073, #502D55)' }}
          >
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-white leading-tight">SovannKiri</p>
            <p className="truncate text-xs text-brand-600 dark:text-brand-400 font-medium">Attendance System</p>
          </div>
        </div>

        {/* User info */}
        <div className="mx-3 my-3 rounded-xl p-3 border border-dusk-rose/20"
          style={{ background: 'linear-gradient(135deg, rgba(147,80,115,0.08), rgba(80,45,85,0.06))' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-300" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-800 ring-2 ring-brand-300">
                  <UserIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
              )}
              <span className={`absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white dark:bg-gray-900 ring-1 ring-white dark:ring-gray-900`}>
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white leading-tight">{displayName}</p>
              <p className="truncate text-xs text-brand-600 dark:text-brand-400 font-medium">{roleName}</p>
              {department && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{department}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nav menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const label = lang === 'km' ? item.labelKm : item.label;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
                style={isActive ? { background: 'linear-gradient(to right, #935073, #502D55)' } : undefined}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-150 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-dusk-rose'} ${isActive ? 'scale-110' : ''}`} />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              if (confirm(lang === 'km' ? 'តើអ្នកពិតជាចង់ចេញមែនទេ?' : 'Are you sure you want to log out?')) {
                onSignOut();
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-150"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>{lang === 'km' ? 'ចេញ' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
