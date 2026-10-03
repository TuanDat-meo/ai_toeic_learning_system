"use client";

import { useState, type ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f5fa]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen min-w-0 md:ml-72">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-space-xl">{children}</main>
      </div>
    </div>
  );
}
