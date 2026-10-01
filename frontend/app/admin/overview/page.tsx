import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function AdminOverviewPage() {
  return (
    <AdminPageFrame
      title="Bảng điều khiển & Số liệu"
      subtitle="Tổng quan hoạt động học tập, nội dung, AI và hiệu suất hệ thống."
      metrics={[
        { label: "Tổng học viên", value: "12.480", trend: "+8.2%", tone: "primary" },
        { label: "Hoàn thành khóa học", value: "76.4%", trend: "+4.1%", tone: "secondary" },
        { label: "AI cần kiểm định", value: "27", trend: "-6" , tone: "tertiary" },
        { label: "Độ tin cậy hệ thống", value: "99.2%", trend: "+0.3%", tone: "neutral" },
      ]}
      actions={
        <>
          <button type="button" className="rounded-lg bg-primary-container px-3 py-2 text-sm font-medium text-on-primary-container">Xuất báo cáo</button>
          <button type="button" className="rounded-lg border border-[rgba(116,118,132,0.2)] bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface">Cập nhật dữ liệu</button>
        </>
      }
    >
      <div className="grid gap-space-lg xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold text-on-surface">Tăng trưởng học tập theo tháng</h2>
          <div className="mt-6 flex h-52 items-end gap-3">
            {[42, 58, 66, 78, 82, 95, 88].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-t-xl bg-primary-container/80" style={{ height: `${height}%` }} />
                <span className="text-[11px] text-on-surface-variant">{["T1","T2","T3","T4","T5","T6","T7"][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-semibold text-on-surface">Chỉ số cốt lõi</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Điểm trung bình bài thi", "710"],
              ["Tỷ lệ hoàn thành nội dung", "81%"],
              ["Năng suất AI làm đề", "94%"],
              ["Học viên có hành vi rủi ro", "14"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-surface-container px-3 py-2.5">
                <span className="text-sm text-on-surface-variant">{label}</span>
                <span className="text-sm font-semibold text-on-surface">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageFrame>
  );
}
