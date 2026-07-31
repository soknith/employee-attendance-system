import { Menu, Bell, Sun, Moon, Monitor, Globe, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n, type Theme } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import type { TabId } from '@/components/Sidebar';

type AppTopBarProps = {
  title: string;
  onMenuToggle: () => void;
  onNavigate: (id: TabId) => void;
  unreadCount?: number;
};

export function AppTopBar({ title, onMenuToggle, onNavigate, unreadCount = 0 }: AppTopBarProps) {
  const { lang, setLang, theme, setTheme } = useI18n();
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const themeIcons: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, auto: Monitor };
  const nextTheme: Record<Theme, Theme> = { light: 'dark', dark: 'auto', auto: 'light' };
  const ThemeIcon = themeIcons[theme];

  const avatarSrc = user?.teacher?.photo ?? null;
  const displayName = user?.teacher?.full_name_en ?? user?.teacher?.full_name_kh ?? user?.username ?? 'User';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
      {/* Hamburger (mobile + tablet) */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 truncate text-base font-semibold text-gray-900 dark:text-white">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <button
          type="button"
          onClick={() => setLang(lang === 'km' ? 'en' : 'km')}
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-dusk-rose dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-dusk-rose"
        >
          <Globe className="h-4 w-4" />
          <span>{lang === 'km' ? 'EN' : 'ខ្មែរ'}</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(nextTheme[theme])}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-dusk-rose dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-dusk-rose"
          aria-label="Toggle theme"
        >
          <ThemeIcon className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => onNavigate('notifications')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-dusk-rose dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-dusk-rose"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex h-9 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={displayName} className="h-7 w-7 rounded-full object-cover ring-1 ring-dusk-rose/30" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(135deg, #935073, #502D55)' }}
              >
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {profileOpen && (
            <div role="menu" className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-scale-in">
              <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => { onNavigate('profile'); setProfileOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <UserIcon className="h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  if (confirm(lang === 'km' ? 'តើអ្នកពិតជាចង់ចេញមែនទេ?' : 'Are you sure you want to log out?')) {
                    signOut();
                    setProfileOpen(false);
                  }
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                {lang === 'km' ? 'ចេញ' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
