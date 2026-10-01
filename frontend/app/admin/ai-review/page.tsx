import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function AiReviewAdminPage() {
  return (
    <AdminPageFrame
      title="Kiểm duyệt & Đánh giá AI"
      subtitle="Đánh giá chất lượng câu hỏi, bài đọc và quy trình sinh nội dung AI."
      metrics={[
        { label: "Nội dung chờ duyệt", value: "43", trend: "-9", tone: "primary" },
        { label: "Tỷ lệ đạt chuẩn", value: "92.6%", trend: "+3.1%", tone: "secondary" },
        { label: "Đánh giá người dùng", value: "1.284", trend: "+17%", tone: "tertiary" },
        { label: "Cảnh báo lỗi", value: "6", trend: "-2", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Queue kiểm duyệt</h2>
        <div className="mt-5 space-y-3">
          {[
            "AI question generation review",
            "AI reading generation validation",
            "Human approval workflow",
          ].map((item) => (
            <div key={item} className="rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
              {item}
            </div>
          ))}
        </div>
      </div>
    </AdminPageFrame>
  );
}
