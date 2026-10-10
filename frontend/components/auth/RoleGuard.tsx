'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type AuthUser } from '@/lib/api/auth';

export function RoleGuard({
  role,
  children,
}: {
  role: AuthUser['role'];
  children: ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (user.role !== role) {
          router.replace(user.role === 'ADMIN' ? '/admin/overview' : '/dashboard');
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
  }, [role, router]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <p role="status" className="text-sm text-on-surface-variant">Đang xác thực tài khoản...</p>
      </main>
    );
  }

  return children;
}