'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { getCurrentUser, logout, type AuthUser } from '@/lib/api/auth';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => router.replace('/login'));
  }, [router]);

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      router.replace('/login');
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Không thể đăng xuất.');
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant/40 bg-surface/95 px-4 backdrop-blur-xl lg:left-72 lg:px-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-on-surface lg:hidden">
        <BookOpen size={19} aria-hidden="true" /> TOEIC AI
      </div>
      <div className="hidden text-sm text-on-surface-variant lg:block">Không gian học tập</div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123c43] text-sm font-semibold text-white" aria-hidden="true">
          {user?.fullName.split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase() ?? 'HV'}
        </div>
        <div className="hidden min-w-0 sm:block">
          <span className="block max-w-48 truncate text-sm font-semibold text-on-surface">{user?.fullName ?? 'Học viên'}</span>
          <span className="block text-xs text-on-surface-variant">Học viên</span>
        </div>
        <button type="button" onClick={handleLogout} aria-label="Đăng xuất" title="Đăng xuất" className="flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-error">
          <LogOut aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {logoutError ? <p role="alert" className="absolute right-4 top-full mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{logoutError}</p> : null}
    </header>
  );
}
