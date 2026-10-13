'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';

const errors: Record<string, { title: string; message: string }> = {
  unverified_email: {
    title: 'Đăng nhập chưa thành công',
    message: 'Google chưa xác minh địa chỉ email này. Hãy chọn tài khoản Google có email đã xác minh.',
  },
  email_already_registered: {
    title: 'Đăng ký chưa thành công',
    message: 'Email này đã có tài khoản. Vui lòng quay lại đăng nhập.',
  },
  account_unavailable: {
    title: 'Đăng nhập chưa thành công',
    message: 'Tài khoản đang bị khóa hoặc không thể đăng nhập. Vui lòng liên hệ quản trị viên.',
  },
  google_login_failed: {
    title: 'Đăng nhập chưa thành công',
    message: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
  },
  callback_failed: {
    title: 'Đăng nhập chưa thành công',
    message: 'Không thể tạo phiên đăng nhập. Vui lòng thử đăng nhập lại.',
  },
};

export function GoogleAuthErrorModal({
  errorCode,
  onClose,
}: {
  errorCode: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const error = errorCode ? errors[errorCode] : undefined;

  useEffect(() => {
    if (!error) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [error, onClose]);

  if (!error) return null;

  function returnToLogin() {
    onClose();
    router.push('/?login=true');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-auth-error-title"
      aria-describedby="google-auth-error-message"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-error">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 id="google-auth-error-title" className="mt-4 text-lg font-bold text-on-surface">
          {error.title}
        </h1>
        <p id="google-auth-error-message" role="alert" className="mt-2 text-sm text-on-surface-variant">
          {error.message}
        </p>
        <button
          type="button"
          onClick={returnToLogin}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container"
        >
          Quay lại đăng nhập
        </button>
      </section>
    </div>
  );
}
