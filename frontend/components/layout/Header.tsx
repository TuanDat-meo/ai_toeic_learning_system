'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  BookA,
  BookMarked,
  BookOpen,
  Brain,
  Bell,
  ClipboardCheck,
  Clock3,
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
import { getStudentAnnouncements } from '@/lib/api/support';

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const navigationItems: NavigationItem[] = [
  { label: 'Tổng quan', href: '/dashboard', icon: House, color: 'text-sky-400' },
  { label: 'Nghe', href: '/listening', icon: Headphones, color: 'text-violet-400' },
  { label: 'Đọc', href: '/reading', icon: BookOpen, color: 'text-cyan-400' },
  { label: 'Ngữ pháp', href: '/grammar', icon: Brain, color: 'text-teal-400' },
  { label: 'Từ vựng', href: '/vocabulary', icon: BookA, color: 'text-emerald-400' },
  { label: 'Thi thử', href: '/mock-tests', icon: ClipboardCheck, color: 'text-orange-400' },
  { label: 'Cộng đồng', href: '/community?feed=all', icon: MessagesSquare, color: 'text-indigo-400' },
];

const DEFAULT_STUDY_STATS_SNAPSHOT = JSON.stringify([null, null]);

function subscribeStudyStats(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getStudyStatsSnapshot() {
  try {
    return JSON.stringify([
      localStorage.getItem('toeic_dashboard_latest_score'),
      localStorage.getItem('toeic_study_tracker_data'),
    ]);
  } catch {
    return 'unavailable';
  }
}

function getServerStudyStatsSnapshot() {
  return DEFAULT_STUDY_STATS_SNAPSHOT;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [unreadAnnouncementCount, setUnreadAnnouncementCount] = useState(0);
  const [logoutError, setLogoutError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDoubleTapLookup, setIsDoubleTapLookup] = useState(true);
  const studyStatsSnapshot = useSyncExternalStore(
    subscribeStudyStats,
    getStudyStatsSnapshot,
    getServerStudyStatsSnapshot,
  );
  const studyStats = useMemo(() => {
    try {
      const [rawScore, rawTracker] = JSON.parse(studyStatsSnapshot) as [string | null, string | null];
      const scoreObj = rawScore ? JSON.parse(rawScore) : null;
      const trackerObj = rawTracker ? JSON.parse(rawTracker) : null;
      return {
        streak: trackerObj?.currentStreak || 3,
        minutes: trackerObj?.todayMinutes || 35,
        score: scoreObj?.total || 685,
      };
    } catch {
      return { streak: 1, minutes: 25, score: 685 };
    }
  }, [studyStatsSnapshot]);
  const profileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {

    getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Fallback demo user so frontend student pages preview cleanly even when backend is offline
        setUser({
          id: 'demo-student',
          email: 'hocvien@toeic.ai',
          fullName: 'Vũ Trương Phi',
          role: 'STUDENT',
        });
      });
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      return;
    }

    let active = true;
    const refreshUnreadCount = async () => {
      try {
        const announcements = await getStudentAnnouncements();
        if (active) setUnreadAnnouncementCount(announcements.filter((item) => !item.isRead).length);
      } catch {
        if (active) setUnreadAnnouncementCount(0);
      }
    };

    void refreshUnreadCount();
    const interval = window.setInterval(() => void refreshUnreadCount(), 30_000);
    window.addEventListener('focus', refreshUnreadCount);
    window.addEventListener('announcement-read-updated', refreshUnreadCount);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshUnreadCount);
      window.removeEventListener('announcement-read-updated', refreshUnreadCount);
    };
  }, [user, pathname]);



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
            const routePath = href.split('?')[0];
            const active = pathname === routePath || (routePath !== '/dashboard' && pathname.startsWith(`${routePath}/`));
            const className = `inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold transition sm:px-3.5 sm:text-sm ${
              active
                ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/10'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`;

            return (
              <Link key={label} href={href} aria-current={active ? 'page' : undefined} className={className}>
                <Icon className={`size-[17px] shrink-0 ${color}`} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
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
            className="relative flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary transition hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden"
          >
            {user?.fullName.split(/\s+/).slice(-1)[0]?.slice(0, 1).toUpperCase() ?? <UserRound className="size-5" aria-hidden="true" />}
            {unreadAnnouncementCount > 0 && <span aria-label={`${unreadAnnouncementCount} thông báo chưa đọc`} className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[9px] font-extrabold leading-none text-white shadow-sm">{unreadAnnouncementCount > 9 ? '9+' : unreadAnnouncementCount}</span>}
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
              <ProfileStat icon={Flame} value={studyStats.streak.toString()} label="ngày học" iconClassName="text-orange-500" />
              <ProfileStat icon={Clock3} value={studyStats.minutes.toString()} label="phút hôm nay" iconClassName="text-blue-500" />
              <ProfileStat icon={Snowflake} value={studyStats.score.toString()} label="điểm" iconClassName="text-cyan-600" />
            </div>

            <Link href="/notifications" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface">
              <Bell className="size-4 text-primary" aria-hidden="true" />
              <span className="flex-1">Thông báo</span>
              {unreadAnnouncementCount > 0 && <span aria-label={`${unreadAnnouncementCount} chưa đọc`} className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">{unreadAnnouncementCount > 99 ? '99+' : unreadAnnouncementCount}</span>}
            </Link>
            <Link href="/onboarding" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface">
              <UserRound className="size-4 text-primary" aria-hidden="true" />
              <span className="flex-1">Thông tin cá nhân &amp; Mục tiêu</span>
            </Link>

            <div className="my-1 border-t border-outline-variant/40" />
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Moon className="size-[18px] text-indigo-500" />
                Chế độ tối
              </span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'left-4.5' : 'left-0.5'}`} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsDoubleTapLookup(!isDoubleTapLookup)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <BookMarked className="size-[18px] text-teal-600" />
                Tra từ khi bấm đúp
              </span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${isDoubleTapLookup ? 'bg-teal-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${isDoubleTapLookup ? 'left-4.5' : 'left-0.5'}`} />
              </span>
            </button>

            <div className="my-1 border-t border-outline-variant/40" />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toeic:open-chat'))}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
            >
              <Phone className="size-4 text-emerald-600" aria-hidden="true" />
              <span>Liên hệ hỗ trợ</span>
            </button>
            <Link href="/community" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface">
              <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
              <span>Đề xuất tính năng</span>
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toeic:open-chat'))}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
            >
              <MessageSquareText className="size-4 text-blue-500" aria-hidden="true" />
              <span>Gửi phản hồi (Feedback)</span>
            </button>

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

