import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function SystemSetupPage() {
  return (
    <AdminPageFrame
      title="Trạng thái & Cài đặt hệ thống"
      subtitle="Monitoring hạ tầng, backup, restore và kiểm tra sức khỏe hệ thống."
      metrics={[
        { label: "CPU", value: "48%", trend: "-6%", tone: "primary" },
        { label: "Memory", value: "62%", trend: "+3%", tone: "secondary" },
        { label: "Latency", value: "184ms", trend: "-22ms", tone: "tertiary" },
        { label: "Uptime", value: "99.8%", trend: "+0.2%", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Các mảng vận hành</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Monitoring & Health checks",
            "Backup & Restore",
            "Cấu hình môi trường",
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
