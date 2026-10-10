"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MessageSquare,
  MessageSquareWarning,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { AdminPageFrame, type AdminMetric } from "@/components/admin/AdminPageFrame";
import {
  getReports,
  saveReports,
  type SupportReport,
  type SupportReportCategory,
  type SupportReportPriority,
  type SupportReportStatus,
} from "@/lib/api/support";

const categoryLabels: Record<SupportReportCategory, { label: string; bg: string }> = {
  QUESTION_ERROR: { label: "Lỗi câu hỏi/đáp án", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  SYSTEM_BUG: { label: "Lỗi hệ thống/Audio", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  UI_FEEDBACK: { label: "Góp ý giao diện", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  ACCOUNT_ISSUE: { label: "Sự cố tài khoản", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  OTHER: { label: "Vấn đề khác", bg: "bg-slate-100 text-slate-700 border-slate-200" },
};

const statusBadges: Record<SupportReportStatus, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 border-amber-200" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-50 text-blue-700 border-blue-200" },
  RESOLVED: { label: "Đã giải quyết", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const priorityBadges: Record<SupportReportPriority, { label: string; className: string }> = {
  URGENT: { label: "Khẩn cấp", className: "bg-rose-600 text-white font-bold" },
  HIGH: { label: "Cao", className: "bg-rose-100 text-rose-800 font-semibold" },
  MEDIUM: { label: "Trung bình", className: "bg-slate-100 text-slate-700" },
  LOW: { label: "Thấp", className: "bg-slate-50 text-slate-500 border border-slate-200" },
};

export function AdminSupportReportsView() {
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | SupportReportCategory>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SupportReportStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | SupportReportPriority>("ALL");

  const [activeReport, setActiveReport] = useState<SupportReport | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<SupportReportStatus>("RESOLVED");
  const [deletingReport, setDeletingReport] = useState<SupportReport | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(data);
    } catch {
      showFeedback("Không thể tải danh sách phản hồi", true);
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(msg: string, isErr = false) {
    setFeedbackMsg(msg);
    setFeedbackIsError(isErr);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  const filtered = reports.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.ticketCode.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.relatedContent && r.relatedContent.toLowerCase().includes(q));

    const matchesCat = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || r.priority === priorityFilter;

    return matchesSearch && matchesCat && matchesStatus && matchesPriority;
  });

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const inProgressCount = reports.filter((r) => r.status === "IN_PROGRESS").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;

  const metrics: AdminMetric[] = [
    {
      label: "Tổng phản hồi",
      value: reports.length.toString(),
      trend: "Tất cả yêu cầu",
      tone: "neutral",
      icon: <MessageSquareWarning className="h-5 w-5 text-slate-600" />,
    },
    {
      label: "Chờ xử lý",
      value: pendingCount.toString(),
      trend: pendingCount > 0 ? "Cần hỗ trợ" : "Đã hoàn tất",
      tone: pendingCount > 0 ? "primary" : "neutral",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
    },
    {
      label: "Đang xử lý",
      value: inProgressCount.toString(),
      trend: "Đang kiểm tra",
      tone: "secondary",
      icon: <RefreshCw className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Đã giải quyết",
      value: resolvedCount.toString(),
      trend: `${Math.round((resolvedCount / (reports.length || 1)) * 100)}% tỷ lệ`,
      tone: "tertiary",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    },
  ];

  function openReplyModal(report: SupportReport) {
    setActiveReport(report);
    setReplyText(report.adminReply || "");
    setReplyStatus(report.status === "PENDING" ? "RESOLVED" : report.status);
  }

  async function handleSendReply() {
    if (!activeReport) return;
    const updated = reports.map((r) => {
      if (r.id === activeReport.id) {
        return {
          ...r,
          adminReply: replyText.trim(),
          status: replyStatus,
          repliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    setReports(updated);
    await saveReports(updated);
    setActiveReport(null);
    showFeedback(`Đã phản hồi Ticket ${activeReport.ticketCode} thành công!`);
  }

  async function handleDeleteConfirm() {
    if (!deletingReport) return;
    const updated = reports.filter((r) => r.id !== deletingReport.id);
    setReports(updated);
    await saveReports(updated);
    setDeletingReport(null);
    showFeedback(`Đã xóa Ticket ${deletingReport.ticketCode}`);
  }

  function exportCsv() {
    const escapeCsv = (val: string) => `"${val.replaceAll('"', '""')}"`;
    const rows = [
      ["Mã Ticket", "Người gửi", "Email", "Loại phản hồi", "Tiêu đề", "Mức ưu tiên", "Trạng thái", "Ngày gửi", "Phản hồi Admin"],
      ...filtered.map((r) => [
        r.ticketCode,
        r.userName,
        r.userEmail,
        categoryLabels[r.category]?.label || r.category,
        r.title,
        priorityBadges[r.priority]?.label || r.priority,
        statusBadges[r.status]?.label || r.status,
        new Date(r.createdAt).toLocaleString("vi-VN"),
        r.adminReply || "",
      ]),
    ];

    const csvContent = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-loi-phan-hoi-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminPageFrame
      title="Phản hồi & Báo lỗi từ Học viên"
      subtitle="Quản lý ticket báo lỗi câu hỏi, sự cố kỹ thuật và các góp ý từ người học TOEIC."
      metrics={metrics}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách Ticket Hỗ trợ</h2>
            <p className="text-xs text-slate-500">Hiển thị {filtered.length} trên tổng số {reports.length} phản hồi</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 shadow-xs"
            >
              <Download className="h-4 w-4" /> Xuất CSV
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} /> Làm mới
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã ticket, tên, email..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Tất cả phân loại</option>
            <option value="QUESTION_ERROR">Lỗi câu hỏi/đáp án</option>
            <option value="SYSTEM_BUG">Lỗi hệ thống/Audio</option>
            <option value="UI_FEEDBACK">Góp ý giao diện</option>
            <option value="ACCOUNT_ISSUE">Sự cố tài khoản</option>
            <option value="OTHER">Vấn đề khác</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="REJECTED">Từ chối</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Tất cả mức ưu tiên</option>
            <option value="URGENT">Khẩn cấp</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>
        </div>

        {feedbackMsg && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
              feedbackIsError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {feedbackMsg}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3.5">Mã Ticket & Người gửi</th>
                <th className="px-4 py-3.5">Phân loại</th>
                <th className="px-4 py-3.5">Tiêu đề & Nội dung</th>
                <th className="px-4 py-3.5">Độ ưu tiên</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Ngày tạo</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const cat = categoryLabels[r.category] || categoryLabels.OTHER;
                const st = statusBadges[r.status] || statusBadges.PENDING;
                const pr = priorityBadges[r.priority] || priorityBadges.MEDIUM;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-blue-700 block">{r.ticketCode}</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{r.userName}</p>
                      <p className="text-[11px] text-slate-400">{r.userEmail}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cat.bg}`}>
                        {cat.label}
                      </span>
                      {r.relatedContent && (
                        <span className="block mt-1 text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={r.relatedContent}>
                          {r.relatedContent}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="font-bold text-slate-800 line-clamp-1">{r.title}</p>
                      <p className="text-slate-500 line-clamp-1 mt-0.5 text-[11px]">{r.description}</p>
                      {r.adminReply && (
                        <p className="text-emerald-700 mt-1 text-[10px] font-medium flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 shrink-0" /> Đã trả lời
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${pr.className}`}>
                        {pr.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReplyModal(r)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Xử lý
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingReport(r)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Xóa ticket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-xs">
                    Không tìm thấy ticket phản hồi phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveReport(null);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-mono font-bold text-xs">
                  {activeReport.ticketCode}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chi tiết & Phản hồi Ticket</h3>
                  <p className="text-xs text-slate-500">Từ học viên: {activeReport.userName} ({activeReport.userEmail})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6 max-h-[70vh] overflow-y-auto">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{activeReport.title}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${categoryLabels[activeReport.category]?.bg}`}>
                    {categoryLabels[activeReport.category]?.label}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeReport.description}</p>
                {activeReport.relatedContent && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Nội dung liên quan:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{activeReport.relatedContent}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Nội dung phản hồi cho học viên
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung giải đáp, câu trả lời hoặc hướng dẫn khắc phục..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Cập nhật trạng thái</label>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value as SupportReportStatus)}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="RESOLVED">Đã giải quyết (Resolved)</option>
                      <option value="IN_PROGRESS">Đang xử lý (In Progress)</option>
                      <option value="REJECTED">Từ chối / Đã trùng lặp</option>
                      <option value="PENDING">Chờ xử lý</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReport(null)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSendReply()}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      <Send className="h-3.5 w-3.5" /> Gửi phản hồi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Xóa ticket phản hồi?</h3>
            <p className="mt-2 text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa Ticket <span className="font-mono font-bold text-blue-600">{deletingReport.ticketCode}</span> từ học viên {deletingReport.userName}?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingReport(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageFrame>
  );
}
