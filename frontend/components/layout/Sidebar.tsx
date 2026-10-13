"use client";

import Link from 'next/link';
import { BookOpen, Brain, ClipboardCheck, CreditCard, Headphones, House, ListChecks } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { LEARNING_CAPABILITIES } from '@/lib/learning-capabilities';

export function Sidebar() {
  const pathname = usePathname();
  const moduleIcons = { VOCABULARY: BookOpen, GRAMMAR: Brain, LISTENING: Headphones, READING: ListChecks, MOCK_TEST: ClipboardCheck };

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
              <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${pathname === "/dashboard" ? "bg-[#123c43] text-white" : "text-on-surface-variant hover:bg-surface-container"}`}>
                <House size={18} aria-hidden="true" /> Tổng quan
              </Link>
            </li>
            <li>
              <Link href="/billing" aria-current={pathname === "/billing" ? "page" : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${pathname === "/billing" ? "bg-[#123c43] text-white" : "text-on-surface-variant hover:bg-surface-container"}`}>
                <CreditCard size={18} aria-hidden="true" /> Gói học &amp; thanh toán
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="px-3 text-xs font-semibold uppercase text-on-surface-variant">Lộ trình TOEIC</p>
          <ul className="mt-2 space-y-1">
            {LEARNING_CAPABILITIES.map(({ key, label }) => {
              const Icon = moduleIcons[key as keyof typeof moduleIcons];
              return <li key={key} className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm text-on-surface-variant/80">
                <span className="flex items-center gap-3"><Icon size={18} aria-hidden="true" />{label}</span>
                <span className="text-[10px]">Đang phát triển</span>
              </li>;
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-outline-variant/40 px-6 py-4 text-xs leading-5 text-on-surface-variant">
        Bài học và theo dõi tiến độ sẽ được mở khi các tính năng hoàn tất.
      </div>
    </aside>
  );
}
