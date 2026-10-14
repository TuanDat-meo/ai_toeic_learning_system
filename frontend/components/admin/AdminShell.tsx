"use client";

import { useState, type ReactNode } from "react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StudentChatBubble } from "@/components/layout/StudentChatBubble";

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-76px)]">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 p-4 md:ml-80 md:p-6 lg:p-8 xl:p-8">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <StudentChatBubble />
    </div>
  );
}
