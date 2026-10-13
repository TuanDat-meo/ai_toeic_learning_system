'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordReset, resetPassword } from '@/lib/api/auth';
import { useEnterToSubmitAuthForm } from './useEnterToSubmitAuthForm';
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_SECONDS = 2 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 30;

export function ForgotPasswordForm() {
  const router = useRouter();
  useEnterToSubmitAuthForm();

  // Wizard Step: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [resendSuccess, setResendSuccess] = useState('');

  // OTP Countdown Timer (matches the backend's 2-minute default)
  const [countdown, setCountdown] = useState(OTP_TTL_SECONDS);

  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [step, countdown]);

  // Format seconds to mm:ss
  function formatTime(sec: number) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '', text: '' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

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
  }, [newPassword]);

  const passwordsMatch = confirmPassword ? newPassword === confirmPassword : null;

  // Step 1: Request OTP via Email
  async function handleSendEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    const emailError = !trimmedEmail
      ? 'Vui lòng nhập địa chỉ email.'
      : !EMAIL_REGEX.test(trimmedEmail)
      ? 'Email không hợp lệ (ví dụ: name@example.com).'
      : trimmedEmail.length > 255
      ? 'Email không được vượt quá 255 ký tự.'
      : undefined;
    setFieldErrors((prev) => ({ ...prev, email: emailError }));
    if (emailError) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(trimmedEmail);
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      setStep(2);
      setCountdown(OTP_TTL_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chưa thể gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (countdown > OTP_TTL_SECONDS - OTP_RESEND_COOLDOWN_SECONDS) return;
    setError('');
    setResendSuccess('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setCountdown(OTP_TTL_SECONDS);
      setResendSuccess('Đã gửi lại mã xác thực mới vào email của bạn!');
      setTimeout(() => setResendSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chưa thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: Validate OTP Code entered
  function handleConfirmOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setFieldErrors((prev) => ({ ...prev, otp: 'Vui lòng nhập mã OTP gồm 6 chữ số.' }));
      return;
    }
    if (countdown === 0) {
      setFieldErrors((prev) => ({ ...prev, otp: 'Mã OTP đã hết hiệu lực. Vui lòng gửi lại mã mới.' }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
    setStep(3);
  }

  // Step 3: Reset Password
  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const errors: typeof fieldErrors = {};
    if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    else if (newPassword.length < 8) errors.newPassword = 'Mật khẩu cần tối thiểu 8 ký tự.';
    else if (newPassword.length > 72) errors.newPassword = 'Mật khẩu không được vượt quá 72 ký tự.';

    if (!confirmPassword) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới.';
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận chưa trùng khớp.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(otpCode.trim(), newPassword);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  }

  // Stepper config
  const steps = [
    { num: 1, title: 'Nhập Email', icon: Mail },
    { num: 2, title: 'Nhập mã OTP', icon: KeyRound },
    { num: 3, title: 'Mật khẩu mới', icon: Lock },
  ];

  return (
    <div className="w-full">
      {/* Stepper Progress Bar (Only show during steps 1, 2, 3) */}
      {step < 4 && (
        <div className="mb-8">
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                }}
              />
            </div>

            {/* Step badges */}
            {steps.map((s) => {
              const Icon = s.icon;
              const isCompleted = step > s.num;
              const isActive = step === s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200 shadow-sm ${
                      isCompleted
                        ? 'border-primary bg-primary text-white'
                        : isActive
                        ? 'border-primary bg-white text-primary ring-4 ring-primary/15'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-on-surface'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 1: ENTER EMAIL ================= */}
      {step === 1 && (
        <div>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
              Quên mật khẩu?
            </h2>
            <p className="mt-1.5 text-xs text-on-surface-variant sm:text-sm">
              Nhập địa chỉ email tài khoản của bạn để nhận mã OTP xác thực khôi phục mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSendEmail} noValidate className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface">
                Email tài khoản <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-email"
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
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'reset-email-error' : undefined}
                  className={`h-11 w-full rounded-lg border bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-4 ${fieldErrors.email ? 'border-error focus:border-error focus:ring-error/10' : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'}`}
                />
              </div>
              {fieldErrors.email && <p id="reset-email-error" className="mt-1 text-xs font-medium text-error">{fieldErrors.email}</p>}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                <>
                  <span>Gửi mã xác thực OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <Link href="/?login=true" className="font-semibold text-primary transition hover:underline">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}

      {/* ================= STEP 2: ENTER OTP & COUNTDOWN ================= */}
      {step === 2 && (
        <div>
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
              Nhập mã xác thực OTP
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
              Nếu email đã đăng ký, mã xác thực sẽ được gửi tới: <strong className="text-on-surface">{email}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Thay đổi email khác
            </button>
          </div>

          {/* OTP Countdown Widget */}
          <div
            className={`mb-5 flex items-center justify-between rounded-xl border p-3.5 transition-colors ${
              countdown === 0
                ? 'border-red-200 bg-red-50 text-red-800'
                : countdown < 30
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-primary/20 bg-primary/5 text-primary'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  countdown === 0 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                }`}
              >
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">
                  {countdown === 0 ? 'Mã OTP đã hết hiệu lực' : 'Thời gian nhập mã OTP còn lại:'}
                </p>
                <p className="text-[11px] opacity-80">
                  {countdown === 0
                    ? 'Vui lòng nhấn "Gửi lại mã" bên cạnh để nhận mã mới'
                    : 'Mã xác thực có giới hạn thời gian'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-bold tracking-wider">
                {formatTime(countdown)}
              </span>
            </div>
          </div>

          <form onSubmit={handleConfirmOtp} noValidate className="space-y-4">
            <div>
              <label htmlFor="otp-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface">
                Mã xác thực OTP (6 chữ số) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="otp-input"
                  name="otp"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  placeholder="Nhập mã 6 chữ số trong email"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                    setError('');
                  }}
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? 'otp-input-error' : undefined}
                  className={`h-11 w-full rounded-lg border bg-surface-container-lowest pl-10 pr-3 font-mono text-sm tracking-widest text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-4 ${fieldErrors.otp ? 'border-error focus:border-error focus:ring-error/10' : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'}`}
                />
              </div>
              {fieldErrors.otp && <p id="otp-input-error" className="mt-1 text-xs font-medium text-error">{fieldErrors.otp}</p>}
              <p className="mt-1 text-[11px] text-slate-500">
                Kiểm tra cả thư mục Spam/Rác nếu chưa thấy email sau 1 phút.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
                {resendSuccess}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={submitting || countdown > OTP_TTL_SECONDS - OTP_RESEND_COOLDOWN_SECONDS}
                className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>
                  {countdown > OTP_TTL_SECONDS - OTP_RESEND_COOLDOWN_SECONDS
                    ? `Gửi lại sau (${countdown - (OTP_TTL_SECONDS - OTP_RESEND_COOLDOWN_SECONDS)}s)`
                    : 'Gửi lại mã OTP'}
                </span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>Xác nhận & Tiếp tục</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại bước trước
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: NEW PASSWORD ================= */}
      {step === 3 && (
        <div>
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
              Đặt lại mật khẩu mới
            </h2>
            <p className="mt-1.5 text-xs text-on-surface-variant sm:text-sm">
              Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn.
            </p>
          </div>

          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <div>
              <label htmlFor="new-pass" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface">
                Mật khẩu mới <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="new-pass"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  minLength={8}
                  maxLength={72}
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                    setError('');
                  }}
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  aria-describedby={fieldErrors.newPassword ? 'new-pass-error' : undefined}
                  className={`h-11 w-full rounded-lg border bg-surface-container-lowest pl-10 pr-10 text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-4 ${fieldErrors.newPassword ? 'border-error focus:border-error focus:ring-error/10' : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.newPassword && <p id="new-pass-error" className="mt-1 text-xs font-medium text-error">{fieldErrors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirm-pass" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface">
                Nhập lại mật khẩu mới <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm-pass"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={72}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    setError('');
                  }}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-pass-error' : undefined}
                  className={`h-11 w-full rounded-lg border bg-surface-container-lowest pl-10 pr-10 text-sm text-on-surface transition placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                    passwordsMatch === false
                      ? 'border-error focus:border-error focus:ring-error/10'
                      : passwordsMatch === true
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                      : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p id="confirm-pass-error" className="mt-1 text-xs font-medium text-error">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1.5 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                  <span className={`font-semibold ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-full rounded-full transition-all ${
                        passwordStrength.score >= s
                          ? passwordStrength.color
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                {passwordsMatch === false && (
                  <p className="text-[11px] font-medium text-error flex items-center gap-1 pt-0.5">
                    <X className="h-3 w-3" /> Mật khẩu nhập lại chưa khớp
                  </p>
                )}
                {passwordsMatch === true && (
                  <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 pt-0.5">
                    <Check className="h-3 w-3" /> Mật khẩu trùng khớp
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error">
                {error}
              </div>
            )}

              <button
                type="submit"
                disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang cập nhật mật khẩu...</span>
                </>
              ) : (
                <>
                  <span>Cập nhật mật khẩu mới</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= STEP 4: SUCCESS ================= */}
      {step === 4 && (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
            Cập nhật mật khẩu thành công!
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant sm:text-sm">
            Mật khẩu mới của bạn đã được lưu an toàn. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push('/?login=true')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-container"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
