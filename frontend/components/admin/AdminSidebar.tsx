"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  LineChart, 
  Sparkles,
  BookA,
  SpellCheck,
  Headphones,
  BookOpen,
  FileQuestion,
  FileBadge,
  MessageSquareWarning,
  Megaphone,
  CreditCard,
  Receipt,
  Bot,
  Database,
  Settings,
  Users
} from "lucide-react";

const navGroups = [
  {
    title: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/admin/overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { label: "Từ vựng", href: "/admin/content/vocabulary", icon: BookA },
      { label: "Ngữ pháp", href: "/admin/content/grammar", icon: SpellCheck },
      { label: "Listening", href: "/admin/content/listening", icon: Headphones },
      { label: "Reading", href: "/admin/content/reading", icon: BookOpen },
      { label: "Ngân hàng câu hỏi", href: "/admin/content/questions", icon: FileQuestion },
      { label: "Đề thi thử", href: "/admin/content/mock-tests", icon: FileBadge },
    ],
  },
  {
    title: "Chăm sóc",
    items: [
      { label: "Phản hồi & Báo lỗi", href: "/admin/support/reports", icon: MessageSquareWarning },
      { label: "Thông báo", href: "/admin/support/announcements", icon: Megaphone },
    ],
  },
  {
    title: "Doanh thu",
    items: [
      { label: "Gói cước", href: "/admin/billing/subscriptions", icon: CreditCard },
      { label: "Giao dịch", href: "/admin/billing/transactions", icon: Receipt },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { label: "Kiểm duyệt AI", href: "/admin/ai-review", icon: Bot },
      { label: "Dữ liệu", href: "/admin/data/import", icon: Database },
      { label: "Người dùng", href: "/admin/users", icon: Users },
      { label: "Cài đặt", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white text-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
          AI
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-900">TOEIC MASTER</span>
          <span className="text-[10px] font-medium text-slate-500">Admin Workspace</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <nav className="space-y-8">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")}
                    >
                      <Icon
                        className={[
                          "h-4 w-4 transition-colors",
                          active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600",
                        ].join(" ")}
                      />
                      <span>{item.label}</span>
                      {active && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-700">System Online</span>
              <span className="text-[10px] text-slate-500">Latency: 32ms</span>
            </div>
          </div>
          <div className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
            v2.1.0
          </div>
        </div>
      </div>
    </aside>
  );
}
