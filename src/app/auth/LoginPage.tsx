import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod/v4';
import { User, Lock, Eye, EyeOff, Truck, Mail, BadgeCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';
import { ROLE_REDIRECT } from '../../lib/constants';
import { cn } from '../../lib/utils/cn';
import type { RegisterRequest, UserRole } from '../../types';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Dispatcher', 'Driver', 'Viewer']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

type AuthMode = 'login' | 'signup';

const roleOptions: UserRole[] = ['Viewer', 'Dispatcher', 'Driver', 'Admin'];
const demoCredentials = [
  { label: 'Admin demo', account: 'admin', password: 'admin123' },
  { label: 'Dispathcer demo', account: 'dispatcher', password: 'passwd123' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading } = useAuthStore();

  const routeMode: AuthMode = useMemo(
    () => (location.pathname.includes('/signup') ? 'signup' : 'login'),
    [location.pathname]
  );

  const [mode, setMode] = useState<AuthMode>(routeMode);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const [loginForm, setLoginForm] = useState<LoginFormData>({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState<SignupFormData>({
    username: '',
    displayName: '',
    email: '',
    password: '',
    role: 'Viewer',
  });

  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  useEffect(() => {
    setMode(routeMode);
  }, [routeMode]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    navigate(next === 'signup' ? '/auth/signup' : '/auth/login', { replace: true });
  };

  const onLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    if (loginErrors[name as keyof LoginFormData]) {
      setLoginErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const onSignupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
    if (signupErrors[name as keyof SignupFormData]) {
      setSignupErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(loginForm);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setLoginErrors(fieldErrors);
      triggerShake();
      return;
    }

    setLoginErrors({});

    try {
      await login(loginForm.username, loginForm.password);
      const user = useAuthStore.getState().user;
      if (user) {
        toast.success(`Welcome back, ${user.displayName}!`);
        navigate(ROLE_REDIRECT[user.role] || '/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      toast.error(message);
      triggerShake();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(signupForm);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setSignupErrors(fieldErrors);
      triggerShake();
      return;
    }

    setSignupErrors({});

    try {
      const payload: RegisterRequest = {
        username: signupForm.username,
        displayName: signupForm.displayName,
        email: signupForm.email,
        password: signupForm.password,
        role: signupForm.role,
      };

      await register(payload);
      const user = useAuthStore.getState().user;
      toast.success(`Account created. Welcome, ${user?.displayName || signupForm.displayName}!`);
      if (user) {
        navigate(ROLE_REDIRECT[user.role] || '/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign up failed. Please try again.';
      toast.error(message);
      triggerShake();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div
        className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-800 via-blue-900 to-orange-900"
      >
        <div className="min-h-[calc(100vh-4rem)] bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div
              className={cn(
                'bg-white/95 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden',
                shake && 'animate-shake'
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">DTEx</h1>
                      <p className="text-xs text-slate-500">Smart Logistics Solutions</p>
                    </div>
                  </div>

                  <div className="relative bg-slate-100 rounded-xl p-1 mb-6">
                    <div
                      className={cn(
                        'absolute top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg bg-white shadow transition-transform duration-300',
                        mode === 'signup' && 'translate-x-full'
                      )}
                    />
                    <div className="relative grid grid-cols-2">
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className={cn(
                          'py-2.5 text-sm font-semibold rounded-lg transition-colors',
                          mode === 'login' ? 'text-slate-900' : 'text-slate-500'
                        )}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className={cn(
                          'py-2.5 text-sm font-semibold rounded-lg transition-colors',
                          mode === 'signup' ? 'text-slate-900' : 'text-slate-500'
                        )}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  {mode === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900">Sign in to your account</h2>

                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="username"
                            name="username"
                            type="text"
                            value={loginForm.username}
                            onChange={onLoginChange}
                            autoComplete="username"
                            className={cn(
                              'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
                              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
                              loginErrors.username ? 'border-red-500' : 'border-slate-300'
                            )}
                            placeholder="Enter your username"
                          />
                        </div>
                        {loginErrors.username && <p className="mt-1 text-sm text-red-600">{loginErrors.username}</p>}
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={loginForm.password}
                            onChange={onLoginChange}
                            autoComplete="current-password"
                            className={cn(
                              'w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
                              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
                              loginErrors.password ? 'border-red-500' : 'border-slate-300'
                            )}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {loginErrors.password && <p className="mt-1 text-sm text-red-600">{loginErrors.password}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>

                      <div>
                        <label htmlFor="signup-username" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="signup-username"
                            name="username"
                            type="text"
                            value={signupForm.username}
                            onChange={onSignupChange}
                            className={cn(
                              'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              signupErrors.username ? 'border-red-500' : 'border-slate-300'
                            )}
                            placeholder="Choose a username"
                          />
                        </div>
                        {signupErrors.username && <p className="mt-1 text-sm text-red-600">{signupErrors.username}</p>}
                      </div>

                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Display Name
                        </label>
                        <div className="relative">
                          <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            value={signupForm.displayName}
                            onChange={onSignupChange}
                            className={cn(
                              'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              signupErrors.displayName ? 'border-red-500' : 'border-slate-300'
                            )}
                            placeholder="How your name appears"
                          />
                        </div>
                        {signupErrors.displayName && <p className="mt-1 text-sm text-red-600">{signupErrors.displayName}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={signupForm.email}
                            onChange={onSignupChange}
                            className={cn(
                              'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              signupErrors.email ? 'border-red-500' : 'border-slate-300'
                            )}
                            placeholder="you@example.com"
                          />
                        </div>
                        {signupErrors.email && <p className="mt-1 text-sm text-red-600">{signupErrors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            id="signup-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={signupForm.password}
                            onChange={onSignupChange}
                            className={cn(
                              'w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                              signupErrors.password ? 'border-red-500' : 'border-slate-300'
                            )}
                            placeholder="Create a password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {signupErrors.password && <p className="mt-1 text-sm text-red-600">{signupErrors.password}</p>}
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={signupForm.role}
                          onChange={onSignupChange}
                          className={cn(
                            'w-full px-3 py-2.5 rounded-lg border bg-white text-slate-900',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                            signupErrors.role ? 'border-red-500' : 'border-slate-300'
                          )}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        {signupErrors.role && <p className="mt-1 text-sm text-red-600">{signupErrors.role}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </form>
                  )}

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                      Demo accounts
                    </p>
                    <div className="space-y-2">
                      {demoCredentials.map((entry) => (
                        <div key={entry.account} className="flex items-center justify-between rounded-lg bg-white/60 p-3 shadow-sm">
                          <div>
                            <p className="font-medium text-slate-900">{entry.label}</p>
                            <p className="text-xs text-slate-500">Username: {entry.account}</p>
                          </div>
                          <span className="rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-700">
                            {entry.password}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex relative bg-gradient-to-br from-blue-600 to-orange-500 text-white p-10 items-center justify-center">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative text-center max-w-xs">
                    <h3 className="text-3xl font-bold mb-4">
                      {mode === 'login' ? 'Welcome Back' : 'Join DTEx'}
                    </h3>
                    <p className="text-blue-50 leading-relaxed">
                      {mode === 'login'
                        ? 'Sign in to manage orders, tracking, and dashboard insights in one place.'
                        : 'Create your account and start using our logistics workflow immediately with mock API support.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                      className="mt-8 px-5 py-2.5 rounded-lg border border-white/70 hover:bg-white/15 transition-colors"
                    >
                      {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
