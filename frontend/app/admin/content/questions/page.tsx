import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function QuestionAdminPage() {
  return (
    <AdminPageFrame
      title="Câu hỏi & Đề thi"
      subtitle="Quản lý ngân hàng câu hỏi, đề thi và các quy trình đánh giá AI."
      metrics={[
        { label: "Câu hỏi", value: "14.620", trend: "+1.8%", tone: "primary" },
        { label: "Đề mock", value: "326", trend: "+18", tone: "secondary" },
        { label: "Cần kiểm định", value: "12", trend: "-5", tone: "tertiary" },
        { label: "Tỷ lệ hợp lệ", value: "97.5%", trend: "+0.7%", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Quản lý câu hỏi</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Diagnostic test",
            "Mock test",
            "Full test library",
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
