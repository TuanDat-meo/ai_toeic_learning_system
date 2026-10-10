'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { registerStudent } from '@/lib/api/auth';
import { AuthFooter, AuthHeading, AuthSubmitButton, PasswordField } from './AuthFormParts';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Mật khẩu xác nhận chưa trùng khớp.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const result = await registerStudent(name.trim(), email.trim(), password);
      setSuccess(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AuthHeading eyebrow="Bắt đầu hành trình" title="Tạo tài khoản mới" description="Bắt đầu trải nghiệm học tập được cá nhân hóa hoàn toàn miễn phí." />
      {success ? (
        <div role="status" className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>{success}</p>
          <Link href="/login" className="inline-flex font-semibold text-primary underline underline-offset-4">Đi tới đăng nhập</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label htmlFor="full_name" className="block min-w-0"><span className="mb-1.5 block text-[13px] font-semibold text-on-surface">Họ và tên <b className="text-error">*</b></span><span className="relative block"><input id="full_name" name="full_name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" minLength={2} maxLength={255} pattern=".*\S.*" title="Họ tên không được để trống." required className="auth-input h-9 w-full rounded-md border border-outline-variant/60 bg-white px-2.5 pr-9 text-[13px] text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-4 focus:ring-primary/10" /><span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">person</span></span></label>
            <label htmlFor="email" className="block min-w-0"><span className="mb-1.5 block text-[13px] font-semibold text-on-surface">Địa chỉ Email <b className="text-error">*</b></span><span className="relative block"><input id="email" name="email" type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.com" autoComplete="email" required className="auth-input h-9 w-full rounded-md border border-outline-variant/60 bg-white px-2.5 pr-9 text-[13px] text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-4 focus:ring-primary/10" /><span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">mail</span></span></label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><PasswordField id="password" label="Mật khẩu" value={password} onChange={(value) => { setPassword(value); setError(''); }} minLength={8} maxLength={72} autoComplete="new-password" compact /><PasswordField id="confirmation" label="Nhập lại mật khẩu" value={confirmation} onChange={(value) => { setConfirmation(value); setError(''); }} minLength={8} maxLength={72} autoComplete="new-password" compact /></div>
          <p className="text-[12px] text-on-surface-variant">Mật khẩu cần từ 8 đến 72 ký tự.</p>
          {error && <p role="alert" aria-live="polite" className="text-[12px] font-medium text-error">{error}</p>}
          <AuthSubmitButton disabled={submitting}>{submitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Bắt Đầu Học'}</AuthSubmitButton>
        </form>
      )}
      <AuthFooter kind="signup" />
    </div>
  );
}