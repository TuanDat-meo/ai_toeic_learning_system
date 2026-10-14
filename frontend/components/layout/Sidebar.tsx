'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Brain, ClipboardCheck, CreditCard, Headphones, House, ListChecks } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isDashboard = pathname === '/dashboard' || pathname === '/';
  const isBilling = pathname === '/billing' || pathname.startsWith('/billing/');

  const modules = [
    { label: 'Từ vựng', icon: BookOpen, href: '/vocabulary', available: true },
    { label: 'Ngữ pháp', icon: Brain, href: '/grammar', available: true },
    { label: 'Listening', icon: Headphones, href: '/listening', available: true },
    { label: 'Reading', icon: ListChecks, href: '/reading', available: true },
    { label: 'Thi thử', icon: ClipboardCheck, href: '/mock-tests', available: true },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-outline-variant/40 bg-surface-container-lowest lg:flex">
      <Link href="/dashboard" className="flex h-16 items-center gap-3 border-b border-outline-variant/40 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#123c43] text-white">
          <BookOpen size={19} aria-hidden="true" />
        </span>
        <span>
          <span className="block font-semibold text-on-surface">TOEIC AI</span>
          <span className="block text-xs text-on-surface-variant">Không gian học viên</span>
        </span>
      </Link>

      <nav aria-label="Điều hướng học tập" className="flex-1 space-y-6 px-4 py-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase text-on-surface-variant">Cá nhân</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link
                href="/dashboard"
                aria-current={isDashboard ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isDashboard
                    ? 'bg-[#123c43] text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <House size={18} aria-hidden="true" />
                <span>Tổng quan</span>
              </Link>
            </li>
            <li>
              <Link
                href="/billing"
                aria-current={isBilling ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isBilling
                    ? 'bg-[#123c43] text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <CreditCard size={18} aria-hidden="true" />
                <span>Gói học &amp; thanh toán</span>
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="px-3 text-xs font-semibold uppercase text-on-surface-variant">Lộ trình TOEIC</p>
          <ul className="mt-2 space-y-1">
            {modules.map(({ label, icon: Icon, href, available }) => {
              const active = href ? (pathname === href || pathname.startsWith(`${href}/`)) : false;
              if (available && href) {
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#123c43] text-white font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} aria-hidden="true" />
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={label} className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm text-on-surface-variant/80">
                  <span className="flex items-center gap-3"><Icon size={18} aria-hidden="true" />{label}</span>
                  <span className="text-[10px]">Sắp có</span>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-outline-variant/40 px-6 py-4 text-xs leading-5 text-on-surface-variant">
        Hệ thống học tập TOEIC AI đã sẵn sàng. Chúc bạn đạt mục tiêu điểm số!
      </div>
    </aside>
  );
}
