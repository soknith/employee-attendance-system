import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, type User } from '@/lib/apiClient';
import supabase from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type UserRole = 'admin' | 'teacher';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!data.session) {
        setLoading(false);
        return;
      }
      api
        .getProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          // ignore
        })
        .finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        api
          .getProfile()
          .then((profile) => setUser(profile))
          .catch(() => {
            // ignore
          });
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Set online on mount, offline on unload
  useEffect(() => {
    if (!user) return;
    api.setOnlineStatus(true).catch(() => {});
    const handleUnload = () => {
      api.setOnlineStatus(false).catch(() => {});
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        api.setOnlineStatus(false).catch(() => {});
      } else {
        api.setOnlineStatus(true).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      api.setOnlineStatus(false).catch(() => {});
    };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await api.login(email, password);
      localStorage.setItem('auth_token', token);
      setUser(userData);
      api.setOnlineStatus(true).catch(() => {});
      return { error: null };
    } catch (err: unknown) {
      const message =
        err instanceof Error && 'message' in err
          ? err.message
          : 'Login failed';
      return { error: message };
    }
  };

  const signOut = async () => {
    try {
      await api.setOnlineStatus(false);
    } catch {
      // ignore
    }
    try {
      await api.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useRole(): UserRole | null {
  const { user } = useAuth();
  return (user?.role?.name as UserRole) ?? null;
}
