'use client';

import { FormEvent, useState } from 'react';
import { AuthFooter, AuthHeading, AuthSubmitButton, AuthUnavailableNotice, PasswordField } from './AuthFormParts';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <AuthHeading title="Đăng nhập" description="Sử dụng email và mật khẩu đã đăng ký để tiếp tục học TOEIC." />
      {submitted ? <AuthUnavailableNotice onRetry={() => setSubmitted(false)} /> : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label htmlFor="email" className="block">
            <span className="mb-2 block font-label-md text-label-md font-semibold text-on-surface">Email</span>
            <span className="relative block"><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">mail</span><input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="auth-input h-12 w-full rounded-lg border border-outline-variant/70 bg-surface-container-lowest pl-11 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /></span>
          </label>
          <PasswordField id="password" label="Mật khẩu bảo mật" value={password} onChange={setPassword} />
          <AuthSubmitButton>Đăng Nhập Ngay</AuthSubmitButton>
        </form>
      )}
      <AuthFooter kind="login" />
    </div>
  );
}