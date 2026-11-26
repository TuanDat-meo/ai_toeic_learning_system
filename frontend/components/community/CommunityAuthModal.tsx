'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LoginCredentialsForm } from '@/components/auth/LoginCredentialsForm';
import { SignupForm } from '@/components/auth/SignupForm';

export function CommunityAuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setMode('login');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-auth-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" />
        </button>

        <div className="mb-5 pr-8">
          <h2 id="community-auth-title" className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Đăng nhập để tham gia cộng đồng' : 'Tạo tài khoản để tham gia cộng đồng'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">Đăng nhập hoặc tạo tài khoản để đăng bài và bình luận.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            aria-pressed={mode === 'login'}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            aria-pressed={mode === 'register'}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đăng ký
          </button>
        </div>

        {mode === 'login' ? (
          <LoginCredentialsForm
            redirectAfterLogin={false}
            onAuthenticated={onAuthenticated}
            onForgotPassword={onClose}
          />
        ) : (
          <SignupForm onLoginClick={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}
