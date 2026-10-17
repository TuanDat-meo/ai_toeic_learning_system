import { SystemSettings } from "@/components/admin/SystemSettings";
import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function SystemSetupPage() {
  return (
    <AdminPageFrame
      title="Cài đặt hệ thống"
      subtitle="Quản lý thông tin hệ thống, mục tiêu học tập mặc định và các tùy chọn vận hành, bao gồm kiểm duyệt AI."
    >
      <SystemSettings />
    </AdminPageFrame>
  );
}
