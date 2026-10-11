'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/auth';

const errorMessages: Record<string, string> = {
  unverified_email: 'Google chưa xác minh địa chỉ email này. Hãy chọn tài khoản Google có email đã xác minh.',
  account_unavailable: 'Tài khoản đang bị khóa hoặc không thể đăng nhập. Vui lòng liên hệ quản trị viên.',
  google_login_failed: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
};

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackLoading />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const providerError = errorCode
    ? errorMessages[errorCode] ?? 'Đăng nhập Google không thành công. Vui lòng thử lại.'
    : '';
  const [callbackError, setCallbackError] = useState('');

  useEffect(() => {
    if (errorCode) return;

    getCurrentUser()
      .then((user) => router.replace(user.role === 'ADMIN' ? '/admin/overview' : '/dashboard'))
      .catch(() => setCallbackError('Không thể tạo phiên đăng nhập. Vui lòng thử đăng nhập lại.'));
  }, [errorCode, router]);

  const error = providerError || callbackError;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-on-surface">Đăng nhập chưa thành công</h1>
            <p role="alert" className="mt-3 text-sm text-error">{error}</p>
            <Link href="/?login=true" className="mt-6 inline-flex font-semibold text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </>
        ) : <GoogleCallbackProgress />}
      </div>
    </main>
  );
}

function GoogleCallbackLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <GoogleCallbackProgress />
    </main>
  );
}

function GoogleCallbackProgress() {
  return (
    <div>
      <span className="block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm text-on-surface-variant">Đang hoàn tất đăng nhập Google…</p>
    </div>
  );
}
