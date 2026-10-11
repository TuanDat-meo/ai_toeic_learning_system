'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { LoginCredentialsForm } from './LoginCredentialsForm';

export function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-outline-variant/40 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-tertiary" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ đăng nhập"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <h2 id="login-modal-title" className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
              Đăng nhập tài khoản
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">Chào mừng bạn trở lại với hệ thống TOEIC AI</p>
          </div>

          <LoginCredentialsForm onAuthenticated={onClose} onForgotPassword={onClose} />

          <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs text-on-surface-variant">
            Chưa có tài khoản?{' '}
            <Link href="/register" onClick={onClose} className="font-semibold text-primary transition hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
