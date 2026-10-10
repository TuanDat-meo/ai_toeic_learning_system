'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/api/auth';
import { AuthFooter, AuthHeading, AuthSubmitButton, PasswordField } from './AuthFormParts';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(user.role === 'ADMIN' ? '/admin/overview' : '/dashboard');
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Đăng nhập" description="Sử dụng email và mật khẩu đã đăng ký để tiếp tục học TOEIC." />
      <form onSubmit={handleSubmit} className="space-y-5">
        <label htmlFor="email" className="block">
          <span className="mb-2 block font-label-md text-label-md font-semibold text-on-surface">Email</span>
          <span className="relative block"><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">mail</span><input id="email" name="email" type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="auth-input h-12 w-full rounded-lg border border-outline-variant/70 bg-surface-container-lowest pl-11 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /></span>
        </label>
        <PasswordField id="password" label="Mật khẩu bảo mật" value={password} onChange={setPassword} maxLength={72} autoComplete="current-password" />
        <div className="-mt-2 flex justify-end">
          <Link href="/forgot-password" className="font-label-md text-label-md font-semibold text-primary transition hover:underline">Quên mật khẩu?</Link>
        </div>
        {error ? <p role="alert" aria-live="polite" className="text-sm font-medium text-error">{error}</p> : null}
        <AuthSubmitButton disabled={submitting}>{submitting ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay'}</AuthSubmitButton>
      </form>
      <AuthFooter kind="login" />
    </div>
  );
}