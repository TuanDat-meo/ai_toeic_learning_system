import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function DataImportAdminPage() {
  return (
    <AdminPageFrame
      title="Lô nhập & Xử lý dữ liệu"
      subtitle="Import Excel, Word, PDF, CSV và quy trình chuẩn hóa dữ liệu."
      metrics={[
        { label: "Đang xử lý", value: "14", trend: "-8", tone: "primary" },
        { label: "Số file đã import", value: "1.248", trend: "+96", tone: "secondary" },
        { label: "Tỷ lệ trùng lặp", value: "1.8%", trend: "-0.7%", tone: "tertiary" },
        { label: "Bản ghi hợp lệ", value: "98.2%", trend: "+1.3%", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Dòng xử lý dữ liệu</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Import Excel / Word / PDF / CSV",
            "Chuẩn hóa dữ liệu",
            "Loại bỏ trùng lặp & kiểm tra chất lượng",
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
