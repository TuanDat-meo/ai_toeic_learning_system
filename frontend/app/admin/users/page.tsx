import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function UserManagementPage() {
  return (
    <AdminPageFrame
      title="Tài khoản người dùng"
      subtitle="Quản lý hồ sơ học viên, phân quyền và truy cập theo vai trò."
      metrics={[
        { label: "Học viên", value: "12.480", trend: "+346", tone: "primary" },
        { label: "Quản trị viên", value: "18", trend: "+2", tone: "secondary" },
        { label: "Đang hoạt động", value: "92.3%", trend: "+1.5%", tone: "tertiary" },
        { label: "Bị khóa", value: "41", trend: "-6", tone: "neutral" },
      ]}
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <h2 className="text-lg font-semibold text-on-surface">Phân quyền và hồ sơ</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            "Vai trò Admin / Student",
            "Phân nhóm học viên",
            "Theo dõi trạng thái tài khoản",
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
