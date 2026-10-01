import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f5fa]">
      <AdminSidebar />
      <div className="ml-72 min-h-screen">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[rgba(116,118,132,0.08)] bg-[#f3f5fa]/90 px-space-lg backdrop-blur-xl">
          <div className="flex w-full max-w-xl items-center gap-space-md">
            <div className="relative w-full">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant">⌕</div>
              <input
                type="text"
                placeholder="Tìm kiếm hệ thống..."
                className="h-11 w-full rounded-xl border border-[rgba(116,118,132,0.08)] bg-white pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="ml-space-lg flex items-center gap-space-md">
            <div className="flex items-center gap-2 rounded-full border border-[rgba(116,118,132,0.08)] bg-white px-3 py-1.5 text-[11px] font-semibold text-on-surface">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              pgvector • hoạt động
            </div>

            <button
              type="button"
              className="rounded-xl border border-[rgba(116,118,132,0.08)] bg-white px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
            >
              Xuất báo cáo
            </button>

            <div className="flex items-center gap-space-sm rounded-xl border border-[rgba(116,118,132,0.08)] bg-white px-2 py-1.5">
              <img
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WnotwTUWmXJkvYMeUByQzYEvEVK9u5KzSNLsmieB4DtBI8kK29ojaK-VmOib3K2BuGE6pfmT9D6gYSKjcko_kFlWt9F-j0G1Vz9jW0F0iG4uInqcdDcV0yNkBC2crP4L1PMVqFQMA6UR-a6GDNTtTszCKeOvrUhlf8G3ITVZvup_VIWV90TU3Cmhu3cOfI-TVNJMHJDvlhkPMRbvHCFO1TkqpU-8FAxVdJgxgukRQ-"
              />
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-on-surface">Nguyễn Quốc Bảo</span>
                <span className="text-[10px] text-on-surface-variant">Quản trị viên</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-space-xl">{children}</main>
      </div>
    </div>
  );
}
