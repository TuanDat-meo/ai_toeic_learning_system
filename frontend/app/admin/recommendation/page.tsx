import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function BktRecommendationPage() {
  return (
    <AdminPageFrame
      title="BKT & Đề xuất"
      subtitle="Model BKT, learning path và khuyến nghị cá nhân hóa cho học viên."
      metrics={[
        { label: "Learning paths", value: "264", trend: "+18", tone: "primary" },
        { label: "Đề xuất cá nhân", value: "7.4K", trend: "+12%", tone: "secondary" },
        { label: "Tỷ lệ thỏa mãn", value: "88.7%", trend: "+2.4%", tone: "tertiary" },
        { label: "Cần tối ưu", value: "31", trend: "-5", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Recommendation engine</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Knowledge tracing model",
            "Learning path suggestions",
            "Adaptive recommendations",
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
