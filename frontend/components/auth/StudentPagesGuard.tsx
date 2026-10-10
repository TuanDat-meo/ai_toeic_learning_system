'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/auth';

const studentRoutes = [
  '/dashboard',
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
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!requiresStudent) return;

    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (user.role === 'ADMIN') {
          router.replace('/admin/overview');
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (active) router.replace('/login');
      });

    return () => {
      active = false;
    };
  }, [requiresStudent, router]);

  if (!requiresStudent) return children;
  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <p role="status" className="text-sm text-on-surface-variant">Đang xác thực tài khoản...</p>
      </main>
    );
  }

  return children;
}
