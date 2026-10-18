import { AdminPageFrame } from "@/components/admin/AdminPageFrame";
import { AiReviewManagement } from "@/components/admin/AiReviewManagement";

export default function AiReviewAdminPage() {
  return (
    <AdminPageFrame
      title="Kiểm duyệt & Đánh giá AI"
      subtitle="Xem xét, chấp nhận hoặc từ chối nội dung được tạo bởi AI."
    >
      <AiReviewManagement />
    </AdminPageFrame>
  );
}
