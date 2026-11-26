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
  '/notifications',
  '/community',
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

  // Quản lý Chế độ tối (Dark Mode):
  // Chỉ kích hoạt chế độ tối bên trong không gian học viên (User).
  // Các trang Quản trị (Admin), Đăng nhập, Đăng ký, Trang chủ (Landing page) luôn ở chế độ sáng chuẩn.
  useEffect(() => {
    const applyDarkMode = () => {
      if (requiresStudent) {
        try {
          const isDark = localStorage.getItem('toeic_pref_dark_mode') === 'true';
          document.documentElement.classList.toggle('dark', isDark);
        } catch {
          // ignore
        }
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyDarkMode();

    const handleDarkChange = (event: Event) => {
      const custom = event as CustomEvent<{ isDark?: boolean }>;
      if (requiresStudent && typeof custom.detail?.isDark === 'boolean') {
        document.documentElement.classList.toggle('dark', custom.detail.isDark);
      } else {
        applyDarkMode();
      }
    };

    window.addEventListener('toeic:dark-mode-changed', handleDarkChange);
    window.addEventListener('storage', applyDarkMode);
    return () => {
      window.removeEventListener('toeic:dark-mode-changed', handleDarkChange);
      window.removeEventListener('storage', applyDarkMode);
    };
  }, [pathname, requiresStudent]);

  useEffect(() => {
    if (!requiresStudent) return;

    let active = true;
    async function authorizeStudentRoute() {
      try {
        const user = await getCurrentUser();
        if (!active) return;
        // Cho phép ADMIN và TEACHER truy cập và trải nghiệm tất cả các trang học tập của học viên
        if (user.role === 'STUDENT') {
          try {
            const onboarding = await getLearningOnboardingStatus();
            if (!active) return;
            const isEditingOnboarding = typeof window !== 'undefined' && window.location.search.includes('mode=edit');
            if (onboarding?.state?.completed && pathname === '/onboarding' && !isEditingOnboarding) {
              router.replace('/dashboard');
              return;
            }
          } catch {
            // Ignore onboarding status fetch error so learning routes remain accessible
          }
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
