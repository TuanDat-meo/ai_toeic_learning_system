'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { getHomePathForRole, login, startGoogleLogin } from '@/lib/api/auth';
import { useEnterToSubmitAuthForm } from './useEnterToSubmitAuthForm';
import { GoogleIcon } from './GoogleIcon';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginCredentialsForm({
  compact = false,
  onAuthenticated,
  onForgotPassword,
}: {
  compact?: boolean;
  onAuthenticated?: () => void;
  onForgotPassword?: () => void;
}) {
  const router = useRouter();
  useEnterToSubmitAuthForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const prefix = compact ? 'login-page' : 'login-modal';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError('');

    const errors: typeof fieldErrors = {};
    const normalizedEmail = email.trim();
    if (!normalizedEmail) errors.email = 'Vui lòng nhập địa chỉ email.';
    else if (normalizedEmail.length > 255 || !EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = 'Email không hợp lệ (ví dụ: name@example.com).';
    }
    if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length > 72) errors.password = 'Mật khẩu không được vượt quá 72 ký tự.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(normalizedEmail, password);
      onAuthenticated?.();
      router.replace(getHomePathForRole(user.role));
      router.refresh();
    } catch (requestError) {
      setServerError(requestError instanceof Error
        ? requestError.message
        : 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  }

  function clearError(field: keyof typeof fieldErrors) {
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setServerError('');
  }

  const inputClass = compact
    ? 'h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-9 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2'
    : 'h-10 w-full rounded-lg border bg-surface-container-lowest pl-10 pr-10 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2';
  const iconClass = `pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${compact ? 'left-3' : 'left-3.5'}`;
  const errorClass = 'border-error focus:border-error focus:ring-error/15';
  const normalClass = 'border-outline-variant/60 focus:border-primary focus:ring-primary/10';

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div>
          <label htmlFor={`${prefix}-email`} className="mb-1 block text-xs font-semibold text-on-surface">
            Email tài khoản <span className="text-error">*</span>
          </label>
          <div className="relative">
            <Mail className={iconClass} />
            <input
              id={`${prefix}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              placeholder="name@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); clearError('email'); }}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? `${prefix}-email-error` : undefined}
              className={`${inputClass} ${fieldErrors.email ? errorClass : normalClass} pr-3`}
            />
          </div>
          {fieldErrors.email && (
            <p id={`${prefix}-email-error`} className="mt-1 flex items-center gap-1 text-[11px] font-medium text-error">
              <AlertCircle className="h-3 w-3 shrink-0" />{fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor={`${prefix}-password`} className="text-xs font-semibold text-on-surface">
              Mật khẩu <span className="text-error">*</span>
            </label>
            <Link href="/forgot-password" onClick={onForgotPassword} className="text-xs font-medium text-primary transition hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className={iconClass} />
            <input
              id={`${prefix}-password`}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={72}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(event) => { setPassword(event.target.value); clearError('password'); }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? `${prefix}-password-error` : undefined}
              className={`${inputClass} ${fieldErrors.password ? errorClass : normalClass}`}
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p id={`${prefix}-password-error`} className="mt-1 flex items-center gap-1 text-[11px] font-medium text-error">
              <AlertCircle className="h-3 w-3 shrink-0" />{fieldErrors.password}
            </p>
          )}
        </div>

        {serverError && (
          <div role="alert" className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{serverError}
          </div>
        )}

        <button type="submit" disabled={submitting}
          className={`${compact ? 'h-9' : 'h-10'} flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60`}>
          {submitting ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Đang đăng nhập...</> : <>Đăng nhập ngay<ArrowRight className="h-3.5 w-3.5" /></>}
        </button>
      </form>

      <div className="mt-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <span className="relative bg-white px-2.5 text-[11px] text-slate-400">hoặc</span>
        </div>
        <button type="button" onClick={() => startGoogleLogin('login')}
          className="relative mt-2.5 flex h-9 w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <GoogleIcon /> <span>Tiếp tục với Google</span>
        </button>
      </div>
    </>
  );
}
