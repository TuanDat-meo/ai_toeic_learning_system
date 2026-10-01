import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function VocabularyAdminPage() {
  return (
    <AdminPageFrame
      title="Từ vựng"
      subtitle="Ngân hàng từ vựng, lặp lại ngắt quãng và bộ từ mới theo phân tích học tập."
      metrics={[
        { label: "Tổng từ vựng", value: "8.240", trend: "+312", tone: "primary" },
        { label: "Đã lặp lại", value: "74.1%", trend: "+2.8%", tone: "secondary" },
        { label: "Cần cập nhật", value: "18", trend: "-4", tone: "tertiary" },
        { label: "Độ phủ tài liệu", value: "96%", trend: "+1.1%", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Danh sách quản lý</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Word bank theo cấp độ",
            "Spaced repetition queue",
            "Khóa học theo chuyên đề",
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
