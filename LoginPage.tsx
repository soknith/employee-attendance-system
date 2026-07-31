import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Loader2,
  Lock,
  Mail,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  CalendarDays,
  BookOpen,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

const WELCOME_LINES_KM = ['សូមស្វាគមន៍', 'ទៅកាន់', 'ប្រព័ន្ធគ្រប់គ្រងវត្តមានគ្រូ', 'សាលាបឋមសិក្សាសុវណ្ណគីរី', 'ខេត្តបាត់ដំបង'];
const WELCOME_LINES_EN = ['Welcome', 'to', 'Teacher Attendance System', 'SovannKiri Primary School', 'Battambang Province'];

const FLOATING_ICONS = [
  { Icon: GraduationCap, delay: '0s', duration: '7s', top: '12%', left: '15%', size: 32 },
  { Icon: BookOpen, delay: '1.5s', duration: '8s', top: '65%', left: '8%', size: 28 },
  { Icon: QrCode, delay: '0.8s', duration: '9s', top: '25%', left: '75%', size: 30 },
  { Icon: CalendarDays, delay: '2s', duration: '7.5s', top: '70%', left: '80%', size: 26 },
  { Icon: Fingerprint, delay: '1s', duration: '8.5s', top: '45%', left: '50%', size: 34 },
  { Icon: Sparkles, delay: '2.5s', duration: '6s', top: '15%', left: '45%', size: 22 },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${8 + Math.random() * 6}s`,
  size: 3 + Math.random() * 5,
}));

function useTypewriter(lines: string[], speed = 400, lineDelay = 200) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (currentLine >= lines.length) return;
    const line = lines[currentLine];
    if (currentText.length < line.length) {
      const timer = setTimeout(() => {
        setCurrentText(line.slice(0, currentText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, line]);
        setCurrentText('');
        setCurrentLine((n) => n + 1);
      }, lineDelay);
      return () => clearTimeout(timer);
    }
  }, [currentText, currentLine, lines, speed, lineDelay]);

  return { displayedLines, currentLine, currentText, isDone: currentLine >= lines.length };
}

export function LoginPage() {
  const { signIn } = useAuth();
  const { lang } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const welcomeLines = lang === 'km' ? WELCOME_LINES_KM : WELCOME_LINES_EN;
  const { displayedLines, currentText, currentLine } = useTypewriter(welcomeLines);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setShakeKey((k) => k + 1);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }, [signIn, email, password]);

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #2a1430 0%, #3a1f3e 25%, #502D55 60%, #7a3f61 100%)',
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 animate-gradient-shift opacity-30"
        style={{
          background: 'linear-gradient(45deg, #502D55, #935073, #7a3f61, #3a1f3e, #502D55)',
        }}
      />

      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 blur-xl animate-float"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 18}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${7 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Floating school icons */}
      <div className="absolute inset-0 overflow-hidden">
        {FLOATING_ICONS.map((item, i) => {
          const Icon = item.Icon;
          return (
            <div
              key={i}
              className="absolute text-white/10 animate-float"
              style={{
                top: item.top,
                left: item.left,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              <Icon style={{ width: item.size, height: item.size }} />
            </div>
          );
        })}
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 rounded-full bg-white/30 animate-particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Light glow */}
      <div
        className="absolute animate-pulse-glow rounded-full"
        style={{
          width: 400,
          height: 400,
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(147,80,115,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Main card — rotating 7-color RGB gradient border */}
      <div
        className="relative z-10 w-full max-w-4xl animate-rgb-border-fade"
        style={{ borderRadius: 28, padding: 3 }}
      >
        {/* Rotating gradient ring */}
        <div
          className="absolute -inset-[3px] animate-rgb-border-rotate"
          style={{
            borderRadius: 30,
            background:
              'conic-gradient(from 0deg, #8b5cf6, #ec4899, #3b82f6, #06b6d4, #10b981, #f59e0b, #eab308, #8b5cf6)',
            filter: 'blur(2px)',
            opacity: 0.85,
            zIndex: 0,
          }}
        />
        {/* Inner card content */}
        <div
          className="relative z-10 w-full overflow-hidden rounded-3xl shadow-2xl animate-scale-fade"
          style={{ minHeight: 480, background: 'rgba(255,255,255,0.92)' }}
        >
        {/* Left — Sign In form */}
        <div className="glass-premium flex flex-col justify-center px-8 py-10 md:absolute md:inset-y-0 md:left-0 md:w-[55%]">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl animate-logo-float"
              style={{
                background: 'linear-gradient(135deg, #935073, #502D55)',
                boxShadow: '0 8px 24px rgba(80, 45, 85, 0.3)',
              }}
            >
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {lang === 'km' ? 'ចូលប្រើប្រព័ន្ធ' : 'Sign In'}
              </h1>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                {lang === 'km'
                  ? 'ប្រព័ន្ធគ្រប់គ្រងវត្តមានគ្រូ'
                  : 'Teacher Attendance Management'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {lang === 'km' ? 'អ៊ីមែល' : 'Email'}
              </label>
              <div className="group relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-dusk-rose" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder={lang === 'km' ? 'បញ្ចូលអ៊ីមែល' : 'Enter your email'}
                  className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-300 transition-all duration-200 focus:border-dusk-rose focus:bg-white focus:outline-none focus:ring-2 focus:ring-dusk-rose/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {lang === 'km' ? 'លេខសម្ងាត់' : 'Password'}
              </label>
              <div className="group relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-dusk-rose" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  placeholder={lang === 'km' ? 'បញ្ចូលលេខសម្ងាត់' : 'Enter your password'}
                  className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-11 pr-11 text-sm text-gray-800 placeholder-gray-300 transition-all duration-200 focus:border-dusk-rose focus:bg-white focus:outline-none focus:ring-2 focus:ring-dusk-rose/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 transition-colors hover:text-dusk-rose"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                key={shakeKey}
                className="animate-shake flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600 border border-green-100 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 animate-scale-in" />
                {lang === 'km' ? 'ចូលបានជោគជ័យ! កំពុងផ្ទុក…' : 'Login successful! Loading…'}
              </div>
            )}

            {/* Submit button */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <button
                ref={buttonRef}
                type="submit"
                disabled={loading || success}
                onClick={handleRipple}
                className="relative relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:brightness-110 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #935073, #502D55)',
                  boxShadow: '0 4px 16px rgba(80, 45, 85, 0.3)',
                }}
              >
                {ripple && (
                  <span
                    key={ripple.id}
                    className="animate-ripple absolute rounded-full bg-white/30"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: 10,
                      height: 10,
                      marginLeft: -5,
                      marginTop: -5,
                    }}
                  />
                )}
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {lang === 'km' ? 'កំពុងចូល…' : 'Signing in…'}
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 animate-scale-in" />
                    {lang === 'km' ? 'បានចូល!' : 'Success!'}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {lang === 'km' ? 'ចូលប្រើ' : 'SIGN IN'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {lang === 'km'
              ? 'សាលាបឋមសិក្សាសុវណ្ណគីរី ខេត្តបាត់ដំបង'
              : 'SovannKiri Primary School, Battambang'}
          </p>
        </div>

        {/* Right — Branding panel */}
        <div
          className="hidden md:flex md:absolute md:inset-y-0 md:right-0 md:w-[45%] flex-col items-center justify-center px-8 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #935073 0%, #502D55 50%, #3a1f3e 100%)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            }}
          />

          {/* Floating icons inside right panel */}
          <div className="absolute inset-0 overflow-hidden">
            {FLOATING_ICONS.slice(0, 4).map((item, i) => {
              const Icon = item.Icon;
              return (
                <div
                  key={i}
                  className="absolute text-white/10 animate-float"
                  style={{
                    top: item.top,
                    left: item.left,
                    animationDelay: item.delay,
                    animationDuration: item.duration,
                  }}
                >
                  <Icon style={{ width: item.size, height: item.size }} />
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm animate-logo-float"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <GraduationCap className="h-10 w-10 text-white" />
            </div>

            {/* Typing welcome text */}
            <div className="space-y-1.5">
              {displayedLines.map((line, i) => (
                <p
                  key={i}
                  className="text-2xl font-bold text-white animate-fade-in"
                  style={{
                    animation: 'fade-in 0.3s ease-out',
                    textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {line}
                </p>
              ))}
              {currentLine < welcomeLines.length && (
                <p className="text-2xl font-bold text-white">
                  {currentText}
                  <span className="inline-block w-0.5 h-6 bg-white ml-0.5 animate-pulse" />
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="mt-8 h-px w-20 bg-white/30" />

            {/* Province */}
            <p className="mt-4 text-xs text-white/60">
              {lang === 'km' ? 'ខេត្តបាត់ដំបង · ប្រទេសកម្ពុជា' : 'Battambang Province · Cambodia'}
            </p>
          </div>
        </div>

        {/* Mobile branding */}
        <div
          className="flex flex-col items-center py-6 text-center md:hidden"
          style={{ background: 'linear-gradient(135deg, #935073, #502D55)' }}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-white">
            {lang === 'km' ? 'សាលាបឋមសិក្សាសុវណ្ណគីរី' : 'SovannKiri Primary School'}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {lang === 'km' ? 'ខេត្តបាត់ដំបង · ប្រទេសកម្ពុជា' : 'Battambang · Cambodia'}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
