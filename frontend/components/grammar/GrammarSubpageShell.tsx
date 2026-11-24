"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Milestone,
  RotateCcw,
  AlertTriangle,
  BookMarked,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { getDueGrammarReviews, getGrammarAnalytics } from "@/lib/api/grammar";

interface GrammarSubpageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

export function GrammarSubpageShell({
  title,
  description,
  children,
  icon,
  action,
  badge,
}: GrammarSubpageShellProps) {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [mistakeCount, setMistakeCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void getDueGrammarReviews()
      .then((items) => {
        if (active && Array.isArray(items)) setDueCount(items.length);
      })
      .catch(() => {});

    void getGrammarAnalytics()
      .then((data) => {
        if (active && data?.repeatedErrorCount !== undefined) {
          setMistakeCount(data.repeatedErrorCount);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { label: "Chuyên đề", href: "/grammar", icon: Brain },
    { label: "Lộ trình", href: "/grammar/path", icon: Milestone },
    {
      label: "Ôn tập SRS",
      href: "/grammar/review",
      icon: RotateCcw,
      badge: dueCount && dueCount > 0 ? dueCount : undefined,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      label: "Lỗi của tôi",
      href: "/grammar/mistakes",
      icon: AlertTriangle,
      badge: mistakeCount && mistakeCount > 0 ? mistakeCount : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    { label: "Sổ tay", href: "/grammar/notebook", icon: BookMarked },
    { label: "Cài đặt", href: "/grammar/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/grammar" className="font-semibold text-blue-700 hover:underline">
            Ngữ pháp TOEIC
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">{title}</span>
        </nav>

        <Link
          href="/grammar"
          className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
          Về danh sách chuyên đề
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-r from-white via-slate-50/50 to-blue-50/30 p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              {icon || <Brain className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  {title}
                </h1>
                {badge}
              </div>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {action && <div className="shrink-0 self-start md:self-center">{action}</div>}
        </div>
      </div>

      {/* Subpage Tabs Navigation Bar */}
      <nav
        aria-label="Điều hướng phân hệ Ngữ pháp"
        className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs scrollbar-none"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComp = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <IconComp className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold leading-tight ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor || "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Page Content */}
      <main className="space-y-6">{children}</main>
    </div>
  );
}
