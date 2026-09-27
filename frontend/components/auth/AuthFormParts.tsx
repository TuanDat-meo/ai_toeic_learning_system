'use client';

import Link from 'next/link';
import { useState } from 'react';

export function PasswordField({
  id,
  label,
  value,
  onChange,
  compact = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label htmlFor={id} className="block">
      <span className={`block font-label-md text-label-md font-semibold text-on-surface ${compact ? 'mb-1.5 text-[13px]' : 'mb-2'}`}>{label}</span>
      <span className="relative block">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">lock</span>
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          className={`auth-input w-full rounded-md border border-outline-variant/70 bg-surface-container-lowest pl-10 pr-10 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 ${compact ? 'h-9 text-[13px]' : 'h-12'}`}
        />
        <button
          type="button"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span className="material-symbols-outlined text-[18px]">{visible ? 'visibility_off' : 'visibility'}</span>
        </button>
      </span>
    </label>
  );
}

export function AuthUnavailableNotice({
  title = 'Chưa thể đăng nhập',
  description = 'API xác thực chưa được triển khai. Chưa có dữ liệu nào được gửi hoặc lưu.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div role="status" className="rounded-lg border border-tertiary/25 bg-tertiary/10 p-4 text-body-md text-on-tertiary-fixed">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[22px]">check_circle</span>
        <div><p className="font-semibold">{title}</p><p className="mt-1 text-sm opacity-80">{description}</p></div>
      </div>
      <button type="button" onClick={onRetry} className="auth-text-button mt-4 font-label-md font-semibold text-tertiary underline underline-offset-4">Thực hiện lại</button>
    </div>
  );
}

export function AuthFooter({ kind }: { kind: 'login' | 'signup' }) {
  return (
    <div className={`${kind === 'signup' ? 'mt-4 pt-3' : 'mt-8 border-t border-outline-variant/30 pt-6'} text-center font-body-sm text-body-sm text-on-surface-variant`}>
      {kind === 'login' && <>Chưa có tài khoản? <Link href="/register" className="auth-text-button font-semibold text-primary hover:underline">Đăng ký miễn phí</Link></>}
      {kind === 'signup' && <>Đã có tài khoản? <Link href="/login" className="auth-text-button font-semibold text-primary hover:underline">Đăng nhập</Link></>}
    </div>
  );
}

export function AuthHeading({ title, description, eyebrow }: { title: string; description: string; eyebrow?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <span className="mb-3 inline-flex items-center gap-2 font-label-sm text-label-sm font-semibold uppercase tracking-[0.12em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-tertiary" />{eyebrow}</span>}
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">{title}</h1>
      <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">{description}</p>
    </div>
  );
}

export function AuthSubmitButton({ children }: { children: string }) {
  return (
    <button type="submit" className="auth-button flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 font-label-md text-label-md font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-container">
      {children}<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
    </button>
  );
}