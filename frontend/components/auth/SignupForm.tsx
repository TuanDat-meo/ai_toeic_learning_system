'use client';

import { FormEvent, useState } from 'react';
import { AuthFooter, AuthHeading, AuthSubmitButton, AuthUnavailableNotice, PasswordField } from './AuthFormParts';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Mật khẩu xác nhận chưa trùng khớp.');
      return;
    }
    setError('');
    setSubmitted(true);
  }

  return (
    <div>
      <AuthHeading eyebrow="Bắt đầu hành trình" title="Tạo tài khoản mới" description="Bắt đầu trải nghiệm học tập được cá nhân hóa hoàn toàn miễn phí." />
      {submitted ? <AuthUnavailableNotice title="Chưa thể tạo tài khoản" description="API đăng ký chưa được triển khai. Thông tin bạn vừa nhập chưa được gửi hoặc lưu." onRetry={() => setSubmitted(false)} /> : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="full_name" className="block min-w-0"><span className="mb-1.5 block text-[13px] font-semibold text-on-surface">Họ và tên <b className="text-error">*</b></span><span className="relative block"><input id="full_name" name="full_name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" required className="auth-input h-9 w-full rounded-md border border-outline-variant/60 bg-white px-2.5 pr-9 text-[13px] text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-4 focus:ring-primary/10" /><span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">person</span></span></label>
            <label htmlFor="email" className="block min-w-0"><span className="mb-1.5 block text-[13px] font-semibold text-on-surface">Địa chỉ Email <b className="text-error">*</b></span><span className="relative block"><input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.com" autoComplete="email" required className="auth-input h-9 w-full rounded-md border border-outline-variant/60 bg-white px-2.5 pr-9 text-[13px] text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-4 focus:ring-primary/10" /><span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">mail</span></span></label>
          </div>
          <div className="grid grid-cols-2 gap-3"><PasswordField id="password" label="Mật khẩu" value={password} onChange={(value) => { setPassword(value); setError(''); }} compact /><PasswordField id="confirmation" label="Nhập lại mật khẩu" value={confirmation} onChange={(value) => { setConfirmation(value); setError(''); }} compact /></div>
          {error && <p role="alert" className="text-[12px] font-medium text-error">{error}</p>}
          <AuthSubmitButton>Tạo Tài Khoản &amp; Bắt Đầu Học</AuthSubmitButton>
        </form>
      )}
      <AuthFooter kind="signup" />
    </div>
  );
}