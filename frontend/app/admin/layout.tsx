import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const metadata: Metadata = {
  title: "TOEIC AI - Quản Trị Hệ Thống",
  description: "Bảng điều khiển quản trị và quản lý nội dung TOEIC AI",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role={["ADMIN", "TEACHER"]}>
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
