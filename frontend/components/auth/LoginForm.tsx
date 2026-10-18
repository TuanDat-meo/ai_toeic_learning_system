'use client';

import Link from 'next/link';
import { LoginCredentialsForm } from './LoginCredentialsForm';

export function LoginForm() {
  return (
    <div className="w-full">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <span className="material-symbols-outlined text-[22px]">school</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Đăng nhập tài khoản</h2>
        <p className="mt-1 text-xs text-on-surface-variant">Nhập thông tin tài khoản để tiếp tục học TOEIC</p>
      </div>

      <LoginCredentialsForm compact />

      <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs text-on-surface-variant">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary transition hover:underline">
          Đăng ký tài khoản mới
        </Link>
      </div>
    </div>
  );
}
