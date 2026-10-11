'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/api/auth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  function validate() {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (trimmedEmail.length > 255 || !EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Email không hợp lệ (ví dụ: name@example.com).';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length > 72) {
      errors.password = 'Mật khẩu không được vượt quá 72 ký tự.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError('');
    setGoogleNotice(false);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(user.role === 'ADMIN' ? '/admin/overview' : '/dashboard');
      router.refresh();
    } catch (requestError) {
      setServerError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleClick() {
    setGoogleNotice(true);
    setTimeout(() => setGoogleNotice(false), 4000);
  }

  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <span className="material-symbols-outlined text-[22px]">school</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-on-surface">
          Đăng nhập tài khoản
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Nhập thông tin tài khoản để tiếp tục học TOEIC
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-on-surface">
            Email tài khoản <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
                if (serverError) setServerError('');
              }}
              className={`h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-3 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? 'border-error focus:border-error focus:ring-error/15'
                  : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-error animate-in fade-in">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold text-on-surface">
              Mật khẩu <span className="text-error">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary transition hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={72}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
                if (serverError) setServerError('');
              }}
              className={`h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-9 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'border-error focus:border-error focus:ring-error/15'
                  : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-error animate-in fade-in">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-medium text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Social / Google Auth Section */}
      <div className="mt-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-2.5 text-[11px] text-slate-400">hoặc</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          className="mt-2.5 relative flex h-9 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
        >
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Tiếp tục với Google</span>
          <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-semibold text-amber-800">
            Sắp ra mắt
          </span>
        </button>

        {googleNotice && (
          <p className="mt-1.5 text-center text-[11px] text-amber-700 animate-in fade-in">
            ⚡ Đăng nhập bằng Google đang được tích hợp và sẽ khả dụng sớm!
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs text-on-surface-variant">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary transition hover:underline">
          Đăng ký tài khoản mới
        </Link>
      </div>
    </div>
  );
}
