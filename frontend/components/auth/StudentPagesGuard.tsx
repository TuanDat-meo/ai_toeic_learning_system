'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, getHomePathForRole, getLearningOnboardingStatus } from '@/lib/api/auth';

const studentRoutes = [
  '/dashboard',
  '/billing',
  '/onboarding',
  '/vocabulary',
  '/reading',
  '/grammar',
  '/listening',
  '/questions',
  '/mock-tests',
  '/practice',
  '/progress',
  '/profile',
  '/recommendation',
  '/result',
];

export function StudentPagesGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const requiresStudent = studentRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const [authorizedPath, setAuthorizedPath] = useState('');
  const [authorizationError, setAuthorizationError] = useState<{ path: string; message: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!requiresStudent) return;

    let active = true;
    async function authorizeStudentRoute() {
      try {
        const user = await getCurrentUser();
        if (!active) return;
        if (user.role !== 'STUDENT') {
          router.replace(getHomePathForRole(user.role));
          return;
        }
        try {
          const onboarding = await getLearningOnboardingStatus();
          if (!active) return;
          if (onboarding?.state?.completed && pathname === '/onboarding') {
            router.replace('/dashboard');
            return;
          }
        } catch {
          // Ignore onboarding status fetch error so learning routes remain accessible
        }
        setAuthorizationError(null);
        setAuthorizedPath(pathname);
      } catch (error) {
        if (!active) return;
        if (
          error instanceof Error &&
          (error.message === 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' ||
            error.message.includes('quyền') ||
            error.message.includes('hết hạn') ||
            error.message.includes('xử lý'))
        ) {
          router.replace('/?login=true');
          return;
        }
        setAuthorizationError({
          path: pathname,
          message: error instanceof Error ? error.message : 'Không thể xác minh hồ sơ học tập.',
        });
      }
    }

    void authorizeStudentRoute();

    return () => {
      active = false;
    };
  }, [pathname, requiresStudent, retryCount, router]);

  if (!requiresStudent) return children;
  if (authorizationError?.path === pathname) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4">
        <p role="alert" className="max-w-md text-center text-sm text-on-surface-variant">{authorizationError.message}</p>
        <button
          type="button"
          onClick={() => {
            setAuthorizationError(null);
            setRetryCount((count) => count + 1);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
          Thử lại
        </button>
      </main>
    );
  }
  if (requiresStudent && authorizedPath !== pathname) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <p role="status" className="text-sm text-on-surface-variant">Đang xác thực tài khoản...</p>
      </main>
    );
  }

  return children;
}
