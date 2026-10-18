'use client';

import { useEffect } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser, getHomePathForRole } from '@/lib/api/auth';

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

  useEffect(() => {
    if (errorCode) {
      router.replace(`/?authError=${encodeURIComponent(errorCode)}`);
      return;
    }

    getCurrentUser()
      .then((user) => router.replace(getHomePathForRole(user.role)))
      .catch(() => router.replace('/?authError=callback_failed'));
  }, [errorCode, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-on-surface-variant">Đang hoàn tất đăng nhập Google…</p>
      </div>
    </main>
  );
}

function GoogleCallbackLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-on-surface-variant">Đang hoàn tất đăng nhập Google…</p>
      </div>
    </main>
  );
}
