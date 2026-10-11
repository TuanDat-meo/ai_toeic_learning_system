'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { registerStudent } from '@/lib/api/auth';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmation?: string;
    agreed?: string;
  }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', text: '' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Yếu', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score: 2, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Khá', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score: 4, label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { score: 0, label: 'Quá ngắn', color: 'bg-slate-300', text: 'text-slate-400' };
    }
  }, [password]);

  const passwordsMatch = confirmation ? password === confirmation : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setGoogleNotice(false);

    const errors: typeof fieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) errors.name = 'Vui lòng nhập họ và tên.';
    else if (trimmedName.length < 2) errors.name = 'Họ và tên cần có ít nhất 2 ký tự.';
    else if (trimmedName.length > 255) errors.name = 'Họ và tên không được vượt quá 255 ký tự.';

    if (!trimmedEmail) errors.email = 'Vui lòng nhập địa chỉ email.';
    else if (trimmedEmail.length > 255) errors.email = 'Email không được vượt quá 255 ký tự.';
    else if (!EMAIL_REGEX.test(trimmedEmail)) errors.email = 'Email không hợp lệ (ví dụ: name@example.com).';

    if (!password) errors.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length < 8) errors.password = 'Mật khẩu cần tối thiểu 8 ký tự.';
    else if (password.length > 72) errors.password = 'Mật khẩu không được vượt quá 72 ký tự.';

    if (!confirmation) errors.confirmation = 'Vui lòng nhập lại mật khẩu.';
    else if (password !== confirmation) errors.confirmation = 'Mật khẩu xác nhận chưa trùng khớp.';

    if (!agreed) errors.agreed = 'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerStudent(trimmedName, trimmedEmail, password);
      setSuccess(result.message || 'Tài khoản học viên đã được tạo thành công!');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tạo tài khoản. Vui lòng thử lại.');
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
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold tracking-tight text-on-surface sm:text-xl">
          Tạo tài khoản học tập
        </h1>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          Nhận ngay bài test năng lực đầu vào và lộ trình TOEIC cá nhân hóa.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 text-center shadow-sm">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-emerald-950 sm:text-base">Đăng ký thành công!</h3>
          <p className="mt-1 text-xs text-emerald-800">{success}</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push('/?login=true')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-container"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="mb-1 block text-xs font-semibold text-on-surface">
              Họ và tên <span className="text-error">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={255}
                placeholder="Ví dụ: Nguyễn Văn An"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  setError('');
                }}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
                className={`h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-3 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.name ? 'border-error focus:border-error focus:ring-error/10' : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'}`}
              />
            </div>
            {fieldErrors.name && <p id="reg-name-error" className="mt-1 text-[11px] font-medium text-error">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-xs font-semibold text-on-surface">
              Địa chỉ Email <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  setError('');
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                className={`h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-3 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.email ? 'border-error focus:border-error focus:ring-error/10' : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'}`}
              />
            </div>
            {fieldErrors.email && <p id="reg-email-error" className="mt-1 text-[11px] font-medium text-error">{fieldErrors.email}</p>}
          </div>

          {/* Password & Confirm Password in 2-cols */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-password" className="mb-1 block text-xs font-semibold text-on-surface">
                Mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="≥ 8 ký tự"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    setError('');
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
                  className={`h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-8 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-error focus:border-error focus:ring-error/10' : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'}`}
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
              {fieldErrors.password && <p id="reg-password-error" className="mt-1 text-[11px] font-medium text-error">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="mb-1 block text-xs font-semibold text-on-surface">
                Xác nhận mật khẩu <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirmation ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="Nhập lại"
                  value={confirmation}
                  onChange={(e) => {
                    setConfirmation(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, confirmation: undefined }));
                    setError('');
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmation)}
                  aria-describedby={fieldErrors.confirmation ? 'reg-confirm-error' : undefined}
                  className={`h-9 w-full rounded-lg border bg-surface-container-lowest pl-9 pr-8 text-xs sm:text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    fieldErrors.confirmation || passwordsMatch === false
                      ? 'border-error focus:border-error focus:ring-error/10'
                      : passwordsMatch === true
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                      : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  aria-label={showConfirmation ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmation ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {fieldErrors.confirmation && <p id="reg-confirm-error" className="mt-1 text-[11px] font-medium text-error">{fieldErrors.confirmation}</p>}
            </div>
          </div>

          {/* Compact Password Strength Indicator */}
          {password && (
            <div className="space-y-1 rounded-md bg-slate-50 p-2 border border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Độ mạnh:</span>
                <span className={`font-semibold ${passwordStrength.text}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all ${
                      passwordStrength.score >= step
                        ? passwordStrength.color
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              {passwordsMatch === false && (
                <p className="text-[10px] font-medium text-error flex items-center gap-1 pt-0.5">
                  <X className="h-2.5 w-2.5" /> Mật khẩu nhập lại chưa trùng khớp
                </p>
              )}
            </div>
          )}

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-2 pt-0.5">
            <input
              id="reg-agreed"
              type="checkbox"
              checked={agreed}
              required
              aria-invalid={Boolean(fieldErrors.agreed)}
              aria-describedby={fieldErrors.agreed ? 'reg-agreed-error' : undefined}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setFieldErrors((prev) => ({ ...prev, agreed: undefined }));
              }}
              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="reg-agreed" className="text-[11px] text-on-surface-variant leading-tight">
              Tôi đồng ý với <span className="text-error">*</span>{' '}
              <a href="#" className="font-medium text-primary hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="font-medium text-primary hover:underline">
                Chính sách bảo mật
              </a>
              .
            </label>
          </div>
          {fieldErrors.agreed && <p id="reg-agreed-error" className="text-[11px] font-medium text-error">{fieldErrors.agreed}</p>}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-medium text-error">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <>
                <span>Tạo tài khoản & Bắt đầu học</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Social / Google Auth Section */}
      <div className="mt-3.5">
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
          <span>Đăng ký với Google</span>
          <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-semibold text-amber-800">
            Sắp ra mắt
          </span>
        </button>

        {googleNotice && (
          <p className="mt-1.5 text-center text-[11px] text-amber-700 animate-in fade-in">
            ⚡ Tính năng Google sẽ sớm được cập nhật!
          </p>
        )}
      </div>

      {/* Switch to login */}
      <div className="mt-3.5 border-t border-slate-100 pt-3 text-center text-xs text-on-surface-variant">
        Đã có tài khoản?{' '}
        <Link
          href="/?login=true"
          className="font-semibold text-primary transition hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
