import { SystemSettings } from "@/components/admin/SystemSettings";
import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function SystemSetupPage() {
  return (
    <AdminPageFrame
      title="Cài đặt hệ thống"
      subtitle="Quản lý thông tin hiển thị, mục tiêu học tập mặc định và tùy chọn thông báo."
    >
      <SystemSettings />
    </AdminPageFrame>
  );
}
