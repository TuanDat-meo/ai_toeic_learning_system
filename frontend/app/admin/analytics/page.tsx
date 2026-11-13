import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

export default function LearningAnalysisPage() {
  return (
    <AdminPageFrame
      title="Phân tích & Tiến độ học tập"
      subtitle="Số liệu phân tích học tập sẽ hiển thị khi được cung cấp từ backend."
    >
      <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Chưa có dữ liệu phân tích</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Backend hiện chưa cung cấp số liệu phân tích tiến độ, điểm yếu hoặc dự đoán kết quả. Không có chỉ số nào được tạo mẫu trên trang này.
          </p>
        </div>
      </div>
    </AdminPageFrame>
  );
}
