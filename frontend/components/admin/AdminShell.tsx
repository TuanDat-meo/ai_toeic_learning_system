"use client";

import { useState, type ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-76px)]">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 p-4 md:ml-80 md:p-6 xl:p-10">{children}</main>
      </div>
    </div>
  );
}
