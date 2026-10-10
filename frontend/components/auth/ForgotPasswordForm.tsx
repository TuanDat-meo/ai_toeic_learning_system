'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { requestPasswordReset } from '@/lib/api/auth';
import { AuthHeading, AuthSubmitButton } from './AuthFormParts';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Chưa thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Quên mật khẩu?" description="Nhập email đã đăng ký. Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến bạn." />
      {submitted ? (
        <div role="status" aria-live="polite" className="space-y-4 rounded-md border border-tertiary/30 bg-tertiary/10 p-4 text-sm text-on-surface">
          <p>Nếu email này có tài khoản, bạn sẽ nhận được liên kết đặt lại mật khẩu. Hãy kiểm tra cả thư mục spam.</p>
          <Link href="/login" className="inline-flex font-semibold text-primary underline underline-offset-4">Quay lại đăng nhập</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label htmlFor="reset-email" className="block">
            <span className="mb-2 block font-label-md text-label-md font-semibold text-on-surface">Email</span>
            <span className="relative block"><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">mail</span><input id="reset-email" name="email" type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="auth-input h-12 w-full rounded-md border border-outline-variant/70 bg-surface-container-lowest pl-11 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /></span>
          </label>
          {error ? <p role="alert" aria-live="polite" className="text-sm font-medium text-error">{error}</p> : null}
          <AuthSubmitButton disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}</AuthSubmitButton>
          <p className="text-center text-sm"><Link href="/login" className="font-semibold text-primary hover:underline">Quay lại đăng nhập</Link></p>
        </form>
      )}
    </div>
  );
}