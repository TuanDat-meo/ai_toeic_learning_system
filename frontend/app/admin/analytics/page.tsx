import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function LearningAnalysisPage() {
  return (
    <AdminPageFrame
      title="Phân tích & Tiến độ học tập"
      subtitle="Phân tích điểm yếu, tiến độ học tập và dự đoán kết quả học viên."
      metrics={[
        { label: "Weakness clusters", value: "12", trend: "-3", tone: "primary" },
        { label: "Gần đạt mục tiêu", value: "81%", trend: "+5%", tone: "secondary" },
        { label: "BKT accuracy", value: "89.4%", trend: "+2.1%", tone: "tertiary" },
        { label: "Cần can thiệp", value: "214", trend: "-17", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Phân tích tiến độ</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Weakness analysis",
            "Learning path tracking",
            "Recommendation engine",
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
