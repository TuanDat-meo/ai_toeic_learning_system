'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, getHomePathForRole, type AuthUser } from '@/lib/api/auth';

const teacherAdminRoutes = ['/admin/content', '/admin/support', '/admin/community', '/admin/settings'];

function canAccessAdminPath(user: AuthUser, pathname: string) {
  if (user.role === 'ADMIN') return true;
  return user.role === 'TEACHER' && teacherAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function RoleGuard({
  role,
  children,
}: {
  role: AuthUser['role'] | AuthUser['role'][];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const allowedRoles = useMemo(() => Array.isArray(role) ? role : [role], [role]);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((user) => {
        if (!active) return;
        setUser(user);
        setChecking(false);
      })
      .catch(() => {
        if (active) router.replace('/?login=true');
      });

    return () => {
      active = false;
    };
  }, [router]);

  const authorized = user !== null
    && allowedRoles.includes(user.role)
    && canAccessAdminPath(user, pathname);

  useEffect(() => {
    if (!checking && user && !authorized) {
      router.replace(getHomePathForRole(user.role));
    }
  }, [authorized, checking, router, user]);

  if (checking || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4">
        <p role="status" className="text-sm text-on-surface-variant">Đang xác thực tài khoản...</p>
      </main>
    );
  }

  return children;
}
