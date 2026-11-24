"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  MessageSquare,
  MessageSquareWarning,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { AdminPageFrame, type AdminMetric } from "@/components/admin/AdminPageFrame";
import { exportToExcel } from "@/lib/exportExcel";
import {
  getReports,
  updateSupportReport,
  deleteSupportReport,
  batchUpdateSupportReports,
  batchDeleteSupportReports,
  markAllNotificationsRead,
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

const sourceLabels: Record<NonNullable<SupportReport["source"]>, { label: string; bg: string }> = {
  GRAMMAR: { label: "Ngữ pháp", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  READING: { label: "Reading (Part 5-7)", bg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  LISTENING: { label: "Listening (Part 1-4)", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  MOCK_TEST: { label: "Đề thi thử (Mock)", bg: "bg-orange-50 text-orange-700 border-orange-200" },
  QUESTION_BANK: { label: "Ngân hàng câu hỏi", bg: "bg-violet-50 text-violet-700 border-violet-200" },
  OTHER: { label: "Nguồn khác", bg: "bg-slate-50 text-slate-600 border-slate-200" },
};

const statusBadges: Record<SupportReportStatus, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-700 border-amber-200" },
  IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-50 text-blue-700 border-blue-200" },
  RESOLVED: { label: "Đã giải quyết", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const priorityBadges: Record<SupportReportPriority, { label: string; className: string }> = {
  URGENT: { label: "Khẩn cấp", className: "bg-rose-600 text-white font-bold" },
  HIGH: { label: "Cao", className: "bg-rose-100 text-rose-800 font-semibold border-rose-200" },
  MEDIUM: { label: "Trung bình", className: "bg-slate-100 text-slate-700 border-slate-200" },
  LOW: { label: "Thấp", className: "bg-slate-50 text-slate-500 border border-slate-200" },
};

const quickReplyTemplates = [
  {
    title: "🎯 Sửa đáp án",
    label: "Đã sửa đáp án câu hỏi",
    text: "Chào bạn, ban quản trị đã kiểm tra và đính chính đáp án chính xác cho câu hỏi này. Cảm ơn bạn rất nhiều vì đã đóng góp giúp bài học hoàn thiện hơn!",
    status: "RESOLVED" as const,
  },
  {
    title: "📝 Bổ sung giải thích",
    label: "Đã cập nhật giải thích chi tiết",
    text: "Chào bạn, hệ thống đã cập nhật giải thích ngữ pháp và từ vựng chi tiết hơn cho câu hỏi này. Chúc bạn ôn luyện đạt điểm TOEIC mục tiêu!",
    status: "RESOLVED" as const,
  },
  {
    title: "🔊 Sửa lỗi âm thanh / Audio",
    label: "Đã khắc phục sự cố âm thanh",
    text: "Chào bạn, sự cố kỹ thuật về âm thanh / phát âm đã được kiểm tra và xử lý xong. Bạn vui lòng tải lại trang để làm bài mượt mà nhé.",
    status: "RESOLVED" as const,
  },
  {
    title: "ℹ️ Đáp án chuẩn ETS",
    label: "Đáp án chính xác chuẩn ETS",
    text: "Chào bạn, sau khi rà soát theo tiêu chuẩn đề thi ETS TOEIC, nội dung câu hỏi và đáp án hiện tại là hoàn toàn chính xác. Bạn có thể xem phần giải thích câu hỏi để nắm rõ ngữ cảnh nhé.",
    status: "RESOLVED" as const,
  },
  {
    title: "🛠️ Đang chuyển kỹ thuật",
    label: "Đang chuyển đội ngũ kỹ thuật",
    text: "Chào bạn, hệ thống đã tiếp nhận phản hồi của bạn và đang chuyển sang đội ngũ kỹ thuật xử lý. Chúng tôi sẽ cập nhật ngay khi hoàn tất.",
    status: "IN_PROGRESS" as const,
  },
];

function snapshotString(snapshot: Record<string, unknown>, key: string) {
  const value = snapshot[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function snapshotOptions(snapshot: Record<string, unknown>): [string, string][] {
  const options = snapshot.options;
  if (Array.isArray(options)) {
    return options.map((value, index) => [String.fromCharCode(65 + index), String(value ?? "")]);
  }
  if (options && typeof options === "object") {
    return Object.entries(options as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")]);
  }
  return [];
}

function QuestionSnapshotCard({ title, snapshot }: { title: string; snapshot: Record<string, unknown> }) {
  const question = snapshotString(snapshot, "questionText") || snapshotString(snapshot, "question") || snapshotString(snapshot, "text");
  const answer = snapshotString(snapshot, "correctAnswer").toUpperCase();
  const options = snapshotOptions(snapshot);
  const explanation = snapshotString(snapshot, "explanation");
  const passage = snapshotString(snapshot, "passage");
  const transcript = snapshotString(snapshot, "transcript");
  const part = snapshotString(snapshot, "part");
  const audioUrl = snapshotString(snapshot, "audioUrl");

  return (
    <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold text-slate-900">{title}</h4>
        <div className="flex items-center gap-2">
          {part && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">{part}</span>}
          {snapshotString(snapshot, "questionRef") && <span className="font-mono text-[10px] text-slate-500">{snapshotString(snapshot, "questionRef")}</span>}
        </div>
      </div>
      {passage && (
        <div className="mb-3 rounded-lg bg-slate-50 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Đoạn văn / ngữ cảnh</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{passage}</p>
        </div>
      )}
      {question ? (
        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-900">{question}</p>
      ) : (
        <p className="text-xs italic text-slate-500">Ticket không lưu nội dung câu hỏi.</p>
      )}
      {options.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map(([key, value]) => {
            const isAnswer = key.toUpperCase() === answer;
            return (
              <div
                key={key}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  isAnswer ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <span className="mr-2 font-bold">{key}.</span>{value}
                {isAnswer && <span className="ml-2 text-[10px] font-bold text-emerald-700">ĐÁP ÁN ĐANG LƯU</span>}
              </div>
            );
          })}
        </div>
      )}
      {answer && options.length === 0 && <p className="mt-3 text-xs font-semibold text-emerald-700">Đáp án đang lưu: {answer}</p>}
      {explanation && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">Giải thích hiện tại</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{explanation}</p>
        </div>
      )}
      {transcript && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Transcript</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{transcript}</p>
        </div>
      )}
      {audioUrl && (
        <a href={audioUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline">
          Mở audio đính kèm <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </section>
  );
}

export function AdminSupportReportsView() {
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | SupportReportCategory>("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | NonNullable<SupportReport["source"]>>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SupportReportStatus>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | SupportReportPriority>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7_DAYS" | "30_DAYS">("ALL");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Active reply/detail modal
  const [activeReport, setActiveReport] = useState<SupportReport | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<SupportReportStatus>("RESOLVED");
  const [replyPriority, setReplyPriority] = useState<SupportReportPriority>("MEDIUM");
  const [deletingReport, setDeletingReport] = useState<SupportReport | null>(null);
  const [applyCorrection, setApplyCorrection] = useState(false);
  const [correctionQuestionText, setCorrectionQuestionText] = useState("");
  const [correctionOptionsText, setCorrectionOptionsText] = useState("{}");
  const [correctionAnswer, setCorrectionAnswer] = useState("");
  const [correctionExplanation, setCorrectionExplanation] = useState("");
  const [correctionPassage, setCorrectionPassage] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  const showFeedback = useCallback((msg: string, isErr = false) => {
    setFeedbackMsg(msg);
    setFeedbackIsError(isErr);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }, []);

  const loadDataRef = useRef<(isRetry?: boolean) => Promise<void>>(null);

  const loadData = useCallback(async (isRetry = false) => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(data);
    } catch {
      showFeedback("Không thể tải danh sách phản hồi. Đang thử kết nối lại...", true);
      if (!isRetry) {
        window.setTimeout(() => {
          void loadDataRef.current?.(true);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    void loadData();

    const handleUpdated = () => void loadData();
    window.addEventListener("support-reports-updated", handleUpdated);
    window.addEventListener("support-report-created", handleUpdated);
    return () => {
      window.removeEventListener("support-reports-updated", handleUpdated);
      window.removeEventListener("support-report-created", handleUpdated);
    };
  }, [loadData]);

  // Date threshold helper
  const now = new Date().getTime();
  const isWithinDays = (dateStr: string, days: number) => {
    const diff = now - new Date(dateStr).getTime();
    return diff <= days * 24 * 60 * 60 * 1000;
  };
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const filtered = reports.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.ticketCode.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.relatedContent && r.relatedContent.toLowerCase().includes(q)) ||
      (r.questionRef && r.questionRef.toLowerCase().includes(q));

    const matchesCat = categoryFilter === "ALL" || r.category === categoryFilter;
    const matchesSource = sourceFilter === "ALL" || (r.source && r.source === sourceFilter);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || r.priority === priorityFilter;

    let matchesDate = true;
    if (dateFilter === "TODAY") matchesDate = isToday(r.createdAt);
    else if (dateFilter === "7_DAYS") matchesDate = isWithinDays(r.createdAt, 7);
    else if (dateFilter === "30_DAYS") matchesDate = isWithinDays(r.createdAt, 30);

    return matchesSearch && matchesCat && matchesSource && matchesStatus && matchesPriority && matchesDate;
  });

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const inProgressCount = reports.filter((r) => r.status === "IN_PROGRESS").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;

  const metrics: AdminMetric[] = [
    {
      label: "Tổng phản hồi",
      value: reports.length.toString(),
      trend: "Tất cả yêu cầu gửi về",
      tone: "neutral",
      icon: <MessageSquareWarning className="h-5 w-5 text-slate-600" />,
    },
    {
      label: "Chờ xử lý",
      value: pendingCount.toString(),
      trend: pendingCount > 0 ? `${pendingCount} ticket cần xử lý ngay` : "Không có tồn đọng",
      tone: pendingCount > 0 ? "primary" : "neutral",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
    },
    {
      label: "Đang xử lý",
      value: inProgressCount.toString(),
      trend: inProgressCount > 0 ? `${inProgressCount} yêu cầu đang kiểm tra` : "Không có ticket",
      tone: "secondary",
      icon: <RefreshCw className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Đã giải quyết",
      value: resolvedCount.toString(),
      trend: `${Math.round((resolvedCount / (reports.length || 1)) * 100)}% tỷ lệ hoàn thành`,
      tone: "tertiary",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    },
  ];

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = async (status: SupportReportStatus) => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      await batchUpdateSupportReports(ids, status);
      setReports((current) =>
        current.map((r) => (selectedIds.has(r.id) ? { ...r, status, updatedAt: new Date().toISOString() } : r))
      );
      showFeedback(`Đã chuyển ${ids.length} ticket sang trạng thái ${statusBadges[status].label}.`);
      setSelectedIds(new Set());
      window.dispatchEvent(new Event("support-reports-updated"));
      window.dispatchEvent(new Event("notification-updated"));
    } catch {
      showFeedback("Không thể cập nhật hàng loạt.", true);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} ticket đã chọn?`)) return;
    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      await batchDeleteSupportReports(ids);
      setReports((current) => current.filter((r) => !selectedIds.has(r.id)));
      showFeedback(`Đã xóa thành công ${ids.length} ticket.`);
      setSelectedIds(new Set());
      window.dispatchEvent(new Event("support-reports-updated"));
      window.dispatchEvent(new Event("notification-updated"));
    } catch {
      showFeedback("Không thể xóa hàng loạt.", true);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Quick inline status toggle
  const handleQuickStatusChange = async (report: SupportReport, newStatus: SupportReportStatus) => {
    try {
      const updated = await updateSupportReport(report.id, {
        status: newStatus,
        priority: report.priority,
      });
      setReports((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      showFeedback(`Đã đổi trạng thái ticket ${report.ticketCode} sang ${statusBadges[newStatus].label}.`);
      window.dispatchEvent(new Event("support-reports-updated"));
      window.dispatchEvent(new Event("notification-updated"));
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.", true);
    }
  };

  async function openReplyModal(report: SupportReport) {
    setActiveReport(report);
    setReplyText(report.adminReply || "");
    setReplyStatus(report.status === "PENDING" ? "RESOLVED" : report.status);
    setReplyPriority(report.priority);
    setApplyCorrection(false);
    setCopiedRef(false);
    const snapshot = report.correction || report.questionSnapshot || {};
    setCorrectionQuestionText(String(snapshot.questionText || ""));
    setCorrectionOptionsText(JSON.stringify(snapshot.options || {}, null, 2));
    setCorrectionAnswer(String(snapshot.correctAnswer || ""));
    setCorrectionExplanation(String(snapshot.explanation || ""));
    setCorrectionPassage(String(snapshot.passage || ""));

    // Tự động chuyển PENDING -> IN_PROGRESS khi Admin vào xem để số thông báo tự động giảm dần
    if (report.status === "PENDING") {
      try {
        const updated = await updateSupportReport(report.id, {
          status: "IN_PROGRESS",
          priority: report.priority,
        });
        setReports((current) => current.map((r) => (r.id === updated.id ? updated : r)));
        setActiveReport((prev) => (prev && prev.id === updated.id ? { ...prev, status: "IN_PROGRESS" } : prev));
        window.dispatchEvent(new Event("support-reports-updated"));
        window.dispatchEvent(new Event("notification-updated"));
      } catch (err) {
        console.warn("Không thể tự động cập nhật trạng thái sang IN_PROGRESS:", err);
      }
    }
  }

  const lastOpenedTicketRef = useRef<string | null>(null);
  useEffect(() => {
    if (loading || reports.length === 0) return;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ticketParam = params.get("ticket") || params.get("id");
      if (ticketParam && ticketParam !== lastOpenedTicketRef.current) {
        const target = reports.find(
          (r) => r.ticketCode.toLowerCase() === ticketParam.toLowerCase() || r.id === ticketParam
        );
        if (target) {
          lastOpenedTicketRef.current = ticketParam;
          void openReplyModal(target);
        }
      }
    }
  }, [loading, reports]);

  function applyQuickTemplate(template: (typeof quickReplyTemplates)[0]) {
    setReplyText(template.text);
    setReplyStatus(template.status);
  }

  function copyQuestionRef(ref: string) {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  }

  async function handleSendReply() {
    if (!activeReport) return;
    setSaving(true);
    try {
      let correction: Record<string, unknown> | undefined;
      if (applyCorrection) {
        let options: unknown;
        try {
          options = JSON.parse(correctionOptionsText);
        } catch {
          throw new Error('Phương án phải là JSON hợp lệ, ví dụ {"A":"...","B":"..."}.');
        }
        if (!correctionQuestionText.trim() || !correctionAnswer.trim()) {
          throw new Error("Nội dung câu hỏi và đáp án đúng là bắt buộc để cập nhật bộ câu hỏi.");
        }
        if (!options || typeof options !== "object") {
          throw new Error("Danh sách phương án phải là JSON dạng object hoặc array.");
        }
        correction = {
          questionText: correctionQuestionText.trim(),
          options,
          correctAnswer: correctionAnswer.trim(),
          explanation: correctionExplanation.trim(),
          passage: correctionPassage.trim(),
        };
      }
      const updatedReport = await updateSupportReport(activeReport.id, {
        status: replyStatus,
        priority: activeReport.priority,
        adminReply: replyText.trim(),
        ...(correction ? { correction } : {}),
      });
      setReports((current) => current.map((report) => (report.id === updatedReport.id ? updatedReport : report)));
      setActiveReport(null);
      showFeedback(`Đã cập nhật & gửi thông báo cho Ticket ${updatedReport.ticketCode}.`);
      window.dispatchEvent(new Event("support-reports-updated"));
      window.dispatchEvent(new Event("notification-updated"));
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể cập nhật ticket.", true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingReport) return;
    try {
      await deleteSupportReport(deletingReport.id);
      setReports((current) => current.filter((report) => report.id !== deletingReport.id));
      setDeletingReport(null);
      showFeedback(`Đã xóa Ticket ${deletingReport.ticketCode}`);
      window.dispatchEvent(new Event("support-reports-updated"));
      window.dispatchEvent(new Event("notification-updated"));
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể xóa ticket.", true);
    }
  }

  function handleExportExcel() {
    if (filtered.length === 0) return;

    exportToExcel({
      filename: `danh_sach_ticket_ho_tro_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Ticket Hỗ trợ",
      title: "HỆ THỐNG QUẢN LÝ TICKET PHẢN HỒI & BÁO LỖI HỌC VIÊN TOEIC",
      metadata: [
        { label: "Ngày xuất báo cáo", value: new Date().toLocaleString("vi-VN") },
        { label: "Tổng số phản hồi", value: `${filtered.length} ticket` },
        {
          label: "Bộ lọc trạng thái",
          value: statusFilter === "ALL" ? "Tất cả trạng thái" : statusBadges[statusFilter]?.label || statusFilter,
        },
        {
          label: "Bộ lọc phân loại",
          value: categoryFilter === "ALL" ? "Tất cả phân loại" : categoryLabels[categoryFilter]?.label || categoryFilter,
        },
        {
          label: "Bộ lọc nguồn",
          value: sourceFilter === "ALL" ? "Tất cả nguồn" : sourceLabels[sourceFilter]?.label || sourceFilter,
        },
      ],
      columns: [
        { header: "STT", key: "stt", width: 50, align: "center" },
        { header: "Mã Ticket", key: "ticketCode", width: 110, align: "center" },
        { header: "Người gửi", key: "userName", width: 140, align: "left" },
        { header: "Email học viên", key: "userEmail", width: 220, align: "left" },
        { header: "Phân loại lỗi", key: "category", width: 160, align: "center" },
        { header: "Nguồn bài học", key: "source", width: 150, align: "center" },
        { header: "Tiêu đề phản hồi", key: "title", width: 260, align: "left" },
        { header: "Nội dung phản hồi chi tiết", key: "content", width: 340, align: "left" },
        { header: "Mã câu hỏi liên quan", key: "questionRef", width: 150, align: "center" },
        { header: "Mức độ ưu tiên", key: "priority", width: 110, align: "center" },
        { header: "Trạng thái", key: "status", width: 130, align: "center" },
        { header: "Ngày gửi", key: "createdAt", width: 150, align: "center" },
        { header: "Phản hồi từ Admin", key: "adminReply", width: 300, align: "left" },
      ],
      data: filtered.map((r, index) => ({
        stt: index + 1,
        ticketCode: r.ticketCode,
        userName: r.userName || "Học viên",
        userEmail: r.userEmail,
        category: categoryLabels[r.category]?.label || r.category,
        source: r.source ? sourceLabels[r.source]?.label || r.source : "Hệ thống chung",
        title: r.title,
        content: r.description || r.title,
        questionRef: r.questionRef || r.relatedContent || "—",
        priority: priorityBadges[r.priority]?.label || r.priority,
        status: statusBadges[r.status]?.label || r.status,
        createdAt: new Date(r.createdAt).toLocaleString("vi-VN"),
        adminReply: r.adminReply || "Chưa phản hồi",
      })),
    });
    showFeedback(`Đã xuất file Excel thành công (${filtered.length} ticket)! 📊`);
  }

  return (
    <AdminPageFrame
      title="Phản hồi & Báo lỗi từ Học viên"
      subtitle="Quản lý ticket báo lỗi câu hỏi, sự cố kỹ thuật và các góp ý từ người học TOEIC. Tự động thông báo 2 chiều giữa Admin và Học viên."
      metrics={metrics}
    >
      <div className="space-y-4">
        {/* Header & Main Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Danh sách Ticket Hỗ trợ
              {filtered.length > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {filtered.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Hiển thị {filtered.length} trên tổng số {reports.length} phản hồi
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={filtered.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 sm:px-3.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/90 disabled:opacity-50 shadow-xs cursor-pointer transition active:scale-95"
              title="Xuất danh sách ticket ra file Excel có hàng cột rõ ràng"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Xuất file Excel</span>
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shadow-xs cursor-pointer transition active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-12 gap-2 sm:gap-2.5">
          <div className="relative sm:col-span-2 md:col-span-3 xl:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã ticket, tên, email, câu hỏi..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-3 transition cursor-pointer"
          >
            <option value="ALL">Tất cả phân loại</option>
            <option value="QUESTION_ERROR">Lỗi câu hỏi/đáp án</option>
            <option value="SYSTEM_BUG">Lỗi hệ thống/Audio</option>
            <option value="UI_FEEDBACK">Góp ý giao diện</option>
            <option value="ACCOUNT_ISSUE">Sự cố tài khoản</option>
            <option value="OTHER">Vấn đề khác</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-3 transition cursor-pointer"
          >
            <option value="ALL">Tất cả nguồn bài học</option>
            <option value="READING">Reading (Part 5-7)</option>
            <option value="LISTENING">Listening (Part 1-4)</option>
            <option value="MOCK_TEST">Đề thi thử (Mock Test)</option>
            <option value="QUESTION_BANK">Ngân hàng câu hỏi</option>
            <option value="OTHER">Khác</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:col-span-2 md:col-span-1 xl:col-span-2 transition cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>

        {/* Date Filter Chips & Bulk Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Thời gian:
            </span>
            {(
              [
                { id: "ALL", label: "Tất cả" },
                { id: "TODAY", label: "Hôm nay" },
                { id: "7_DAYS", label: "7 ngày qua" },
                { id: "30_DAYS", label: "30 ngày qua" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDateFilter(item.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  dateFilter === item.id
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs text-blue-900 animate-in fade-in">
              <span className="font-bold">Đã chọn {selectedIds.size} ticket</span>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => void handleBulkStatus("RESOLVED")}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                ✓ Đã giải quyết
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => void handleBulkStatus("IN_PROGRESS")}
                className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                Đang xử lý
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => void handleBulkDelete()}
                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Xóa
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-500 hover:underline cursor-pointer ml-1"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>

        {/* Date Filter Chips & Bulk Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Thời gian:
            </span>
            {(
              [
                { id: "ALL", label: "Tất cả" },
                { id: "TODAY", label: "Hôm nay" },
                { id: "7_DAYS", label: "7 ngày qua" },
                { id: "30_DAYS", label: "30 ngày qua" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDateFilter(item.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  dateFilter === item.id
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs text-blue-900 animate-in fade-in">
              <span className="font-bold">Đã chọn {selectedIds.size} ticket</span>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => void handleBulkStatus("RESOLVED")}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                ✓ Đã giải quyết
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => void handleBulkStatus("IN_PROGRESS")}
                className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                Đang xử lý
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => void handleBulkDelete()}
                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                Xóa
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-500 hover:underline cursor-pointer ml-1"
              >
                Bỏ chọn
              </button>
            </div>
          )}
        </div>

        {feedbackMsg && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-xs font-semibold flex items-center justify-between ${
              feedbackIsError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <span>{feedbackMsg}</span>
            <button type="button" onClick={() => setFeedbackMsg("")} className="text-slate-400 hover:text-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full min-w-[760px] lg:min-w-full text-left border-collapse">
            <thead className="bg-slate-50/90 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200/80">
              <tr>
                <th className="w-10 sm:w-12 px-2.5 sm:px-3 py-3 sm:py-3.5 text-center shrink-0">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={handleToggleSelectAll}
                    aria-label="Chọn tất cả"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="w-[18%] min-w-[130px] px-3 sm:px-4 py-3 sm:py-3.5 whitespace-nowrap">Mã Ticket & Người gửi</th>
                <th className="w-[16%] min-w-[125px] px-2 sm:px-3 py-3 sm:py-3.5 text-center whitespace-nowrap">Phân loại & Nguồn</th>
                <th className="w-[30%] min-w-[180px] px-3 sm:px-4 py-3 sm:py-3.5 text-center">Tiêu đề & Nội dung</th>
                <th className="w-[13%] min-w-[110px] px-2 sm:px-3 py-3 sm:py-3.5 text-center whitespace-nowrap">Trạng thái</th>
                <th className="w-[11%] min-w-[85px] px-2 sm:px-3 py-3 sm:py-3.5 text-center whitespace-nowrap">Ngày tạo</th>
                <th className="w-[11%] min-w-[80px] px-2 sm:px-3 py-3 sm:py-3.5 text-center whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => {
                const cat = categoryLabels[r.category] || categoryLabels.OTHER;
                const src = r.source ? sourceLabels[r.source] : null;
                const st = statusBadges[r.status] || statusBadges.PENDING;
                const isSelected = selectedIds.has(r.id);

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/80"}`}
                  >
                    <td className="px-2.5 sm:px-3 py-3 sm:py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(r.id)}
                        aria-label={`Chọn ticket ${r.ticketCode}`}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                      <span className="font-mono font-bold text-xs text-blue-700 tracking-wide block">{r.ticketCode}</span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 truncate max-w-[150px] lg:max-w-none">{r.userName}</p>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-normal truncate max-w-[150px] lg:max-w-none">{r.userEmail}</p>
                    </td>

                    <td className="px-2 sm:px-3 py-3 sm:py-3.5 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] sm:text-xs font-semibold ${cat.bg}`}>
                          {cat.label}
                        </span>
                        {src && (
                          <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] sm:text-xs font-semibold ${src.bg}`}>
                            {src.label}
                          </span>
                        )}
                      </div>
                      {r.relatedContent && (
                        <span className="block mt-1 text-[11px] text-slate-600 font-medium truncate max-w-[150px] mx-auto text-center" title={r.relatedContent}>
                          {r.relatedContent}
                        </span>
                      )}
                    </td>

                    <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{r.title}</p>
                      <p className="text-slate-600 line-clamp-1 mt-0.5 text-[11px] sm:text-xs leading-relaxed">{r.description}</p>
                      {r.adminReply && (
                        <div className="text-emerald-800 mt-1.5 text-[11px] font-medium inline-flex items-center gap-1 bg-emerald-50/90 px-2 py-0.5 rounded-lg border border-emerald-200/70 max-w-full">
                          <MessageSquare className="h-3 w-3 shrink-0 text-emerald-600" />
                          <span className="truncate max-w-[180px] sm:max-w-xs" title={r.adminReply}>Đã trả lời: {r.adminReply}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-2 sm:px-3 py-3 sm:py-3.5 text-center whitespace-nowrap">
                      <select
                        aria-label="Thay đổi trạng thái nhanh"
                        value={r.status}
                        onChange={(e) => void handleQuickStatusChange(r, e.target.value as SupportReportStatus)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer shadow-2xs transition-colors ${st.className}`}
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="RESOLVED">Đã giải quyết</option>
                        <option value="REJECTED">Từ chối</option>
                      </select>
                    </td>

                    <td className="px-2 sm:px-3 py-3 sm:py-3.5 text-center text-[11px] sm:text-xs font-medium text-slate-600 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-2 sm:px-3 py-3 sm:py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReplyModal(r)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200/80 px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition whitespace-nowrap cursor-pointer shadow-2xs"
                          title="Xem chi tiết & phản hồi"
                        >
                          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                          <span>Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingReport(r)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          title="Xóa ticket"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    Không tìm thấy ticket phản hồi phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply & Details Modal */}
      {activeReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveReport(null);
          }}
        >
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">Chi tiết & Phản hồi Học viên</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-100/80 text-blue-800 font-mono font-bold text-[11px] sm:text-xs border border-blue-200/60 whitespace-nowrap">
                      {activeReport.ticketCode}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    Người gửi: <span className="font-semibold text-slate-700">{activeReport.userName}</span> ({activeReport.userEmail}) • {new Date(activeReport.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Report content overview */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{activeReport.title}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${categoryLabels[activeReport.category]?.bg}`}>
                      {categoryLabels[activeReport.category]?.label}
                    </span>
                    {activeReport.source && (
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${sourceLabels[activeReport.source]?.bg}`}>
                        {sourceLabels[activeReport.source]?.label}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{activeReport.description}</p>
                
                {/* Related links & questionRef */}
                <div className="mt-3 pt-2.5 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeReport.relatedContent && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">Nội dung:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{activeReport.relatedContent}</span>
                      </div>
                    )}
                    {activeReport.questionRef && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">Mã câu hỏi:</span>
                        <button
                          type="button"
                          onClick={() => copyQuestionRef(activeReport.questionRef!)}
                          className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600 hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                          title="Bấm để sao chép"
                        >
                          {activeReport.questionRef}
                          {copiedRef ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Direct Jump Buttons */}
                  <div className="flex items-center gap-2">
                    {activeReport.source === "MOCK_TEST" && (
                      <a href="/admin/content/mock-tests" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline">
                        Đến Quản lý Đề thi <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {activeReport.source === "READING" && (
                      <a href="/admin/content/reading" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline">
                        Đến Quản lý Reading <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {activeReport.source === "LISTENING" && (
                      <a href="/admin/content/listening" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline">
                        Đến Quản lý Listening <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {activeReport.source === "QUESTION_BANK" && (
                      <a
                        href={activeReport.questionRef ? `/admin/content/questions?q=${encodeURIComponent(activeReport.questionRef)}` : "/admin/content/questions"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        Đến Ngân hàng câu hỏi <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Snapshot */}
              {activeReport.questionSnapshot ? (
                <QuestionSnapshotCard title="Nội dung câu hỏi lúc học viên báo cáo" snapshot={activeReport.questionSnapshot} />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                  Ticket không đính kèm ảnh chụp câu hỏi. Mã tham chiếu: <span className="font-mono font-semibold">{activeReport.questionRef || "Không có"}</span>
                </div>
              )}

              {activeReport.correction && (
                <QuestionSnapshotCard title="Nội dung sửa đã lưu trước đó" snapshot={activeReport.correction} />
              )}

              {/* Quick-reply templates chips */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Mẫu phản hồi nhanh (1-Click điền sẵn):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplyTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyQuickTemplate(template)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Textarea */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Nội dung phản hồi cho học viên <span className="text-red-500">*</span>
                  <span className="text-[11px] font-normal text-slate-500 ml-2">
                    (Hệ thống sẽ gửi thông báo tự động đến tài khoản học viên)
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung giải đáp, câu trả lời hoặc hướng dẫn khắc phục..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {/* Direct question correction tool */}
                {activeReport.category === "QUESTION_ERROR" && activeReport.questionRef && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={applyCorrection}
                        onChange={(event) => setApplyCorrection(event.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      Lưu nội dung sửa vào bộ câu hỏi dùng chung (Question Corrections)
                    </label>
                    {applyCorrection && (
                      <div className="space-y-2 pt-1">
                        <textarea
                          aria-label="Nội dung câu hỏi đã sửa"
                          rows={2}
                          value={correctionQuestionText}
                          onChange={(event) => setCorrectionQuestionText(event.target.value)}
                          placeholder="Nội dung câu hỏi sau khi sửa"
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                        />
                        <textarea
                          aria-label="Các phương án sau khi sửa (JSON)"
                          rows={4}
                          value={correctionOptionsText}
                          onChange={(event) => setCorrectionOptionsText(event.target.value)}
                          placeholder={'{"A":"...","B":"..."}'}
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 font-mono text-xs"
                        />
                        <input
                          aria-label="Đáp án đúng sau khi sửa"
                          value={correctionAnswer}
                          onChange={(event) => setCorrectionAnswer(event.target.value)}
                          placeholder="Đáp án đúng (A/B/C/D)"
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                        />
                        <textarea
                          aria-label="Giải thích sau khi sửa"
                          rows={2}
                          value={correctionExplanation}
                          onChange={(event) => setCorrectionExplanation(event.target.value)}
                          placeholder="Giải thích sau khi sửa"
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                        />
                        <textarea
                          aria-label="Đoạn văn sau khi sửa"
                          rows={3}
                          value={correctionPassage}
                          onChange={(event) => setCorrectionPassage(event.target.value)}
                          placeholder="Đoạn văn liên quan (nếu có)"
                          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls: Status, Submit */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-full sm:w-auto">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Trạng thái ticket</label>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value as SupportReportStatus)}
                        className="h-9 w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="RESOLVED">Đã giải quyết (Resolved)</option>
                        <option value="IN_PROGRESS">Đang xử lý (In Progress)</option>
                        <option value="REJECTED">Từ chối / Đã giải quyết trước</option>
                        <option value="PENDING">Chờ xử lý</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => setActiveReport(null)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSendReply()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" /> {saving ? "Đang gửi..." : "Gửi phản hồi cho Học viên"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Xóa ticket phản hồi?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa Ticket <span className="font-mono font-bold text-blue-600">{deletingReport.ticketCode}</span> từ học viên <span className="font-semibold text-slate-800">{deletingReport.userName}</span>? Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingReport(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
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
