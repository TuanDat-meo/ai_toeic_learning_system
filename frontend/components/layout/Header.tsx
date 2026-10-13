'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookA,
  BookMarked,
  BookOpen,
  Brain,
  Bell,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Ellipsis,
  Flame,
  Headphones,
  House,
  Lightbulb,
  LogOut,
  MessagesSquare,
  MessageSquareText,
  Moon,
  Phone,
  Snowflake,
  Target,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { getCurrentUser, logout, type AuthUser } from '@/lib/api/auth';

const navigationItems = [
  { label: 'Tổng quan', href: '/dashboard', icon: House, color: 'text-sky-400' },
  { label: 'Nghe', href: null, icon: Headphones, color: 'text-violet-400' },
  { label: 'Đọc', href: null, icon: BookOpen, color: 'text-cyan-400' },
  { label: 'Ngữ pháp', href: null, icon: Brain, color: 'text-teal-400' },
  { label: 'Từ vựng', href: null, icon: BookA, color: 'text-emerald-400' },
  { label: 'Thi thử', href: null, icon: ClipboardCheck, color: 'text-orange-400' },
  { label: 'Cộng đồng', href: '/dashboard#community', icon: MessagesSquare, color: 'text-indigo-400' },
] as const;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [logoutError, setLogoutError] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const profileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash.slice(1));
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  useEffect(() => {
    function closeProfileMenu(event: PointerEvent) {
      const menu = profileMenuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    }

    document.addEventListener('pointerdown', closeProfileMenu);
    return () => document.removeEventListener('pointerdown', closeProfileMenu);
  }, []);

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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-outline-variant/50 bg-surface-container-lowest/95 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          aria-label="TOEIC AI - Trang tổng quan"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/20">
            <BookOpen className="size-[18px]" aria-hidden="true" />
          </span>
          <span className="hidden text-[15px] font-bold tracking-tight text-on-surface lg:inline">TOEIC AI</span>
        </Link>

        <nav aria-label="Điều hướng học tập" className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigationItems.map(({ label, href, icon: Icon, color }) => {
            const [route, anchor] = href?.split('#') ?? [];
            const active = route
              ? pathname === route && (anchor ? currentHash === anchor : currentHash !== 'community')
              : false;
            const className = `inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold transition sm:px-3.5 sm:text-sm ${
              active
                ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/10'
                : href
                  ? 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  : 'cursor-not-allowed text-on-surface-variant/80'
            }`;

            return href ? (
              <Link key={label} href={href} aria-current={active ? 'page' : undefined} className={className}>
                <Icon className={`size-[17px] shrink-0 ${color}`} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ) : (
              <span key={label} aria-disabled="true" title="Tính năng đang được phát triển" className={className}>
                <Icon className={`size-[17px] shrink-0 ${color}`} aria-hidden="true" />
                <span>{label}</span>
              </span>
            );
          })}
          <details className="group relative shrink-0">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface transition hover:border-primary/30 hover:bg-surface-container-low [&::-webkit-details-marker]:hidden">
              <Ellipsis className="size-[18px] text-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Thêm</span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-1.5 text-on-surface shadow-xl shadow-slate-900/10">
              <div className="border-b border-outline-variant/40 px-3 py-3">
                <p className="text-sm font-semibold text-on-surface">Tiện ích học tập</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">Quản lý lộ trình TOEIC</p>
              </div>
              <Link href="/billing" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface">
                <CreditCard className="size-4 text-primary" aria-hidden="true" />
                Gói học &amp; thanh toán
              </Link>
              <Link href="/onboarding" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface">
                <Target className="size-4 text-tertiary" aria-hidden="true" />
                Mục tiêu học tập
              </Link>
              <div className="my-1 border-t border-outline-variant/40" />
              <p className="flex items-start gap-3 px-3 py-2 text-xs leading-5 text-on-surface-variant">
                <Flame className="mt-0.5 size-4 shrink-0 text-orange-500" aria-hidden="true" />
                Các tính năng luyện tập đang được phát triển
              </p>
            </div>
          </details>
        </nav>

        <Link
          href="/billing"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <Target className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Nâng cấp</span>
        </Link>

        <details ref={profileMenuRef} className="group relative shrink-0">
          <summary
            aria-label="Mở menu tài khoản"
            title={user?.fullName ?? 'Tài khoản'}
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary transition hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden"
          >
            {user?.fullName.split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase() ?? <UserRound className="size-5" aria-hidden="true" />}
          </summary>
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 max-h-[min(78vh,42rem)] w-[min(21rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-1.5 text-on-surface shadow-xl shadow-slate-900/10">
            <div className="border-b border-outline-variant/40 px-3 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {user?.fullName.split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase() ?? 'HV'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">{user?.fullName ?? 'Học viên'}</p>
                  <p className="truncate text-xs text-on-surface-variant">{user?.email ?? 'Tài khoản học viên'}</p>
                </div>
              </div>
            </div>
            <div className="my-2 grid grid-cols-3 divide-x divide-outline-variant/50 rounded-xl bg-surface-container-low px-1 py-3 text-center">
              <ProfileStat icon={Flame} value="—" label="ngày học" iconClassName="text-orange-500" />
              <ProfileStat icon={Clock3} value="—" label="phút hôm nay" iconClassName="text-blue-500" />
              <ProfileStat icon={Snowflake} value="—" label="điểm" iconClassName="text-cyan-600" />
            </div>

            <MenuItem icon={Bell} label="Thông báo" trailing="Chưa có" disabled />
            <MenuItem icon={UserRound} label="Thông tin cá nhân" disabled />

            <div className="my-1 border-t border-outline-variant/40" />
            <PreferenceItem icon={Moon} label="Chế độ tối" />
            <PreferenceItem icon={BookMarked} label="Tra từ khi bấm đúp" />

            <div className="my-1 border-t border-outline-variant/40" />
            <MenuItem icon={Phone} label="Liên hệ" disabled />
            <MenuItem icon={Lightbulb} label="Đề xuất" disabled />
            <MenuItem icon={MessageSquareText} label="Feedback" disabled />

            <div className="my-1 border-t border-outline-variant/40" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-on-surface-variant transition hover:bg-error-container/60 hover:text-error"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        </details>
      </div>

      {logoutError ? (
        <p role="alert" className="absolute right-4 top-full mt-2 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-xs text-on-error-container shadow-lg">
          {logoutError}
        </p>
      ) : null}
    </header>
  );
}

function ProfileStat({
  icon: Icon,
  value,
  label,
  iconClassName,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  iconClassName: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 px-1">
      <span className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
        <Icon className={`size-4 ${iconClassName}`} aria-hidden="true" />
        {value}
      </span>
      <span className="text-[10px] leading-4 text-on-surface-variant">{label}</span>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  trailing,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  trailing?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? 'Tính năng đang được phát triển' : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        disabled
          ? 'cursor-not-allowed text-on-surface-variant/70'
          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      }`}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{label}</span>
      {trailing ? <span className="text-xs text-on-surface-variant">{trailing}</span> : null}
      {disabled ? <span className="text-[10px] text-on-surface-variant/70">Sắp có</span> : null}
    </button>
  );
}

function PreferenceItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div
      aria-disabled="true"
      title="Tùy chọn đang được phát triển"
      className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant/70"
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{label}</span>
      <span className="relative h-5 w-9 rounded-full bg-outline-variant/70">
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-surface-container-lowest shadow-sm" />
      </span>
    </div>
  );
}
