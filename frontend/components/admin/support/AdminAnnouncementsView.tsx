"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Eye,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Monitor,
} from "lucide-react";
import { AdminPageFrame, type AdminMetric } from "@/components/admin/AdminPageFrame";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  PRESET_ACTION_DESTINATIONS,
  resolveStudentActionUrl,
  getActionUrlLabel,
  normalizeLineBreaks,
  type Announcement,
  type AnnouncementStatus,
  type AnnouncementTarget,
  type AnnouncementType,
} from "@/lib/api/support";

const typeBadges: Record<AnnouncementType, { label: string; bg: string; border: string; text: string }> = {
  SYSTEM: { label: "Hệ thống / Bảo trì", bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-800" },
  FEATURE_UPDATE: { label: "Cập nhật bài học", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  PROMOTION: { label: "Khuyến mãi / Ưu đãi", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
  EVENT: { label: "Sự kiện TOEIC", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
};

const targetLabels: Record<AnnouncementTarget, string> = {
  ALL: "Tất cả học viên",
  FREE_USERS: "Học viên Free",
  VIP_USERS: "Học viên VIP Premium",
};

interface QuickTemplate {
  name: string;
  icon: string;
  type: AnnouncementType;
  target: AnnouncementTarget;
  title: string;
  summary: string;
  content: string;
  actionUrl: string;
  isPinned: boolean;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    name: "Luyện đọc Reading",
    icon: "📖",
    type: "FEATURE_UPDATE",
    target: "ALL",
    title: "Cập nhật chuyên đề Luyện đọc Reading Part 5-7 mới nhất",
    summary: "Bổ sung 50 bài đọc hiểu mới chuẩn cấu trúc ETS 2026 kèm giải thích chi tiết và phân tích bẫy đề thi.",
    content: "Chào các bạn học viên,\n\nHệ thống vừa hoàn tất cập nhật các bài tập đọc hiểu Reading mới nhất với đầy đủ bản dịch song ngữ, phân tích từ vựng quan trọng và bẫy đề thi Part 5, 6, 7.\n\nCác bạn hãy vào mục Luyện đọc để trải nghiệm ngay nhé!",
    actionUrl: "/reading",
    isPinned: true,
  },
  {
    name: "Từ vựng Flashcard",
    icon: "📚",
    type: "FEATURE_UPDATE",
    target: "ALL",
    title: "Ra mắt bộ Từ vựng 3000 từ TOEIC điểm cao kèm Minigame",
    summary: "Học từ vựng nhanh qua flashcards thông minh và thử thách minigame ghép từ, nối nghĩa cực vui nhộn.",
    content: "Chào các bạn,\n\nKho từ vựng đã được nâng cấp toàn diện với 3000 từ vựng cốt lõi thường gặp nhất trong đề thi TOEIC. Mỗi từ đều có phiên âm, audio phát âm và minigame ôn tập phản xạ.\n\nHãy vào học ngay để làm giàu vốn từ của mình!",
    actionUrl: "/vocabulary",
    isPinned: true,
  },
  {
    name: "Ưu đãi gói VIP",
    icon: "🎁",
    type: "PROMOTION",
    target: "FREE_USERS",
    title: "Ưu đãi đặc biệt: Giảm 40% Gói VIP Trọn đời TOEIC Master",
    summary: "Nhận ưu đãi lên đến 40% cho các gói học PRO & PREMIUM để mở khóa toàn bộ kho tàng câu hỏi và gia sư AI.",
    content: "Chào bạn,\n\nĐể hỗ trợ bạn bứt phá band điểm mục tiêu trong kỳ thi sắp tới, hệ thống đang áp dụng chương trình ưu đãi đặc biệt dành cho học viên nâng cấp gói học.\n\nQuyền lợi VIP bao gồm:\n- Mở khóa trọn bộ ngân hàng câu hỏi Part 1-7\n- Gia sư AI giải đáp thắc mắc 24/7\n- Phân tích chi tiết lộ trình và dự đoán điểm thi chính xác\n\nNhanh tay nâng cấp ngay để không bỏ lỡ!",
    actionUrl: "/billing/subscriptions",
    isPinned: true,
  },
  {
    name: "Sự kiện Thi thử",
    icon: "🏆",
    type: "EVENT",
    target: "ALL",
    title: "Sự kiện Đua Top Điểm Cao TOEIC Full Test ETS 2026",
    summary: "Tham gia thi thử Full Test 200 câu cuối tuần để nhận ngay học bổng VIP 100% và vinh danh Bảng vàng.",
    content: "Cơ hội cọ xát thực tế dành cho toàn thể học viên TOEIC AI!\n\nCuối tuần này, sự kiện thi thử online sẽ chính thức diễn ra với format đề thi 200 câu chuẩn ETS. Kết quả sẽ được hệ thống chấm tự động và xếp hạng ngay sau khi nộp bài.\n\nHãy chuẩn bị tinh thần và tham gia cùng cộng đồng học viên nhé!",
    actionUrl: "/mock-tests",
    isPinned: true,
  },
  {
    name: "Luyện nghe Audio",
    icon: "🎧",
    type: "FEATURE_UPDATE",
    target: "ALL",
    title: "Nâng cấp kho Audio Luyện nghe chuẩn giọng thi ETS",
    summary: "Toàn bộ bài nghe Part 1-4 được nâng cấp âm thanh đa giọng đọc Mỹ, Anh, Úc, Canada sắc nét.",
    content: "Chào các bạn học viên,\n\nHệ thống vừa hoàn tất nâng cấp chất lượng âm thanh toàn bộ phần Listening Part 1 đến Part 4. Tốc độ phát và chất lượng âm thanh đạt chuẩn phòng thi thực tế.\n\nCác bạn vào luyện nghe ngay để tăng cường phản xạ nhé!",
    actionUrl: "/listening",
    isPinned: false,
  },
  {
    name: "Bảo trì hệ thống",
    icon: "⚙️",
    type: "SYSTEM",
    target: "ALL",
    title: "Thông báo bảo trì và nâng cấp hạ tầng máy chủ",
    summary: "Hệ thống sẽ tiến hành bảo trì định kỳ từ 00:00 đến 02:00 nhằm tối ưu hóa tốc độ tải và nâng cấp gia sư AI.",
    content: "Kính gửi quý học viên,\n\nNhằm nâng cao chất lượng dịch vụ và tốc độ xử lý các bài tập, đội ngũ kỹ thuật sẽ tiến hành bảo trì hệ thống định kỳ vào đêm nay.\n\nTrong thời gian bảo trì, một số tính năng có thể bị gián đoạn tạm thời. Các bạn vui lòng lưu lại tiến độ bài làm trước thời gian trên.\n\nXin cảm ơn sự thông cảm và đồng hành của các bạn!",
    actionUrl: "",
    isPinned: false,
  },
];

export function AdminAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AnnouncementType>("ALL");
  const [targetFilter, setTargetFilter] = useState<"ALL" | AnnouncementTarget>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "PINNED" | "ARCHIVED">("ALL");

  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null);
  const [previewTab, setPreviewTab] = useState<"modal" | "banner">("modal");
  const [simulatedNav, setSimulatedNav] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  const notifyChange = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("announcement-updated"));
      window.dispatchEvent(new Event("announcement-read-updated"));
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể tải danh sách thông báo.", true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    const handleUpdate = () => void loadData();
    window.addEventListener("announcement-updated", handleUpdate);
    window.addEventListener("announcement-read-updated", handleUpdate);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("announcement-updated", handleUpdate);
      window.removeEventListener("announcement-read-updated", handleUpdate);
    };
  }, [loadData]);

  function showFeedback(msg: string, isError = false) {
    setFeedbackMsg(msg);
    setFeedbackIsError(isError);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  const filtered = announcements.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    const matchesType = typeFilter === "ALL" || a.type === typeFilter;
    const matchesTarget = targetFilter === "ALL" || a.target === targetFilter;
    let matchesStatus = true;
    if (statusFilter === "ACTIVE") matchesStatus = a.status === "ACTIVE";
    else if (statusFilter === "DRAFT") matchesStatus = a.status === "DRAFT";
    else if (statusFilter === "PINNED") matchesStatus = Boolean(a.isPinned);
    else if (statusFilter === "ARCHIVED") matchesStatus = a.status === "ARCHIVED";

    return matchesSearch && matchesType && matchesTarget && matchesStatus;
  });

  const activeCount = announcements.filter((a) => a.status === "ACTIVE").length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;
  const draftCount = announcements.filter((a) => a.status === "DRAFT").length;
  const totalReads = announcements.reduce((acc, a) => acc + (a.readCount || 0), 0);

  const metrics: AdminMetric[] = [
    {
      label: "Tổng thông báo",
      value: announcements.length.toString(),
      trend: "Tất cả tin nhắn",
      tone: statusFilter === "ALL" ? "primary" : "neutral",
      icon: <Megaphone className="h-5 w-5 text-slate-600" />,
    },
    {
      label: "Đang hiển thị",
      value: activeCount.toString(),
      trend: "Đang phát sóng",
      tone: statusFilter === "ACTIVE" ? "primary" : "neutral",
      icon: <Bell className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Ghim nổi bật",
      value: pinnedCount.toString(),
      trend: "Ưu tiên đầu trang",
      tone: statusFilter === "PINNED" ? "secondary" : "neutral",
      icon: <Pin className="h-5 w-5 text-amber-600" />,
    },
    {
      label: "Lượt xem / Đọc",
      value: totalReads.toLocaleString("vi-VN"),
      trend: "Lượt tương tác học viên",
      tone: "tertiary",
      icon: <Eye className="h-5 w-5 text-emerald-600" />,
    },
  ];

  function openCreateModal() {
    setFormErrors({});
    setEditingItem({
      title: "",
      summary: "",
      content: "",
      type: "FEATURE_UPDATE",
      target: "ALL",
      status: "ACTIVE",
      isPinned: false,
      actionUrl: "",
    });
  }

  function applyTemplate(tpl: QuickTemplate) {
    setEditingItem((prev) => ({
      ...prev,
      type: tpl.type,
      target: tpl.target,
      title: normalizeLineBreaks(tpl.title),
      summary: normalizeLineBreaks(tpl.summary),
      content: normalizeLineBreaks(tpl.content),
      actionUrl: tpl.actionUrl,
      isPinned: tpl.isPinned,
      status: "ACTIVE",
    }));
    setFormErrors({});
    showFeedback(`Đã áp dụng mẫu "${tpl.name}"`);
  }

  async function handleSaveForm() {
    if (!editingItem) return;
    const title = normalizeLineBreaks(editingItem.title).trim();
    const summary = normalizeLineBreaks(editingItem.summary).trim();
    const content = normalizeLineBreaks(editingItem.content).trim();
    const actionUrl = editingItem.actionUrl?.trim() || "";
    const errors: Record<string, string> = {};
    if (!title) errors.title = "Vui lòng nhập tiêu đề thông báo.";
    else if (title.length > 200) errors.title = "Tiêu đề không được vượt quá 200 ký tự.";
    if (summary.length > 500) errors.summary = "Tóm tắt không được vượt quá 500 ký tự.";
    if (!content) errors.content = "Vui lòng nhập nội dung chi tiết.";
    else if (content.length > 10000) errors.content = "Nội dung không được vượt quá 10.000 ký tự.";
    if (actionUrl.length > 500) errors.actionUrl = "Đường dẫn không được vượt quá 500 ký tự.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      const payload = {
        title,
        summary,
        content,
        type: editingItem.type || "FEATURE_UPDATE",
        target: editingItem.target || "ALL",
        status: editingItem.status || "ACTIVE",
        isPinned: Boolean(editingItem.isPinned),
        actionUrl,
      };
      const saved = editingItem.id
        ? await updateAnnouncement(editingItem.id, payload)
        : await createAnnouncement(payload);
      setAnnouncements((current) =>
        editingItem.id
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current]
      );
      notifyChange();
      showFeedback(editingItem.id ? `Đã cập nhật thông báo "${saved.title}"` : `Đã tạo thông báo mới "${saved.title}"`);
      setEditingItem(null);
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể lưu thông báo.", true);
    }
  }

  async function togglePin(announcement: Announcement) {
    try {
      const updated = await updateAnnouncement(announcement.id, {
        ...announcement,
        isPinned: !announcement.isPinned,
      });
      setAnnouncements((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      notifyChange();
      showFeedback(announcement.isPinned ? "Đã gỡ ghim thông báo" : "Đã ghim thông báo lên đầu trang học viên");
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể cập nhật thông báo.", true);
    }
  }

  async function toggleStatus(announcement: Announcement) {
    const nextStatus: AnnouncementStatus = announcement.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    try {
      const updated = await updateAnnouncement(announcement.id, {
        ...announcement,
        status: nextStatus,
      });
      setAnnouncements((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      notifyChange();
      showFeedback(nextStatus === "ACTIVE" ? "Đã kích hoạt hiển thị thông báo tới học viên" : "Đã chuyển thông báo sang bản nháp ẩn");
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể cập nhật thông báo.", true);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    try {
      await deleteAnnouncement(deletingItem.id);
      setAnnouncements((current) => current.filter((item) => item.id !== deletingItem.id));
      notifyChange();
      setDeletingItem(null);
      showFeedback(`Đã xóa thông báo "${deletingItem.title}"`);
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "Không thể xóa thông báo.", true);
    }
  }

  return (
    <AdminPageFrame
      title="Quản lý Thông báo Systems & Marketing"
      subtitle="Tạo tin nhắn hệ thống, cập nhật kho bài học và chương trình ưu đãi hiển thị trên trang Học viên."
      metrics={metrics}
    >
      <div className="space-y-4">
        {/* Header action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Danh sách Thông báo</h2>
            <p className="text-xs text-slate-500">
              Hiển thị {filtered.length} trên tổng số {announcements.length} thông báo
              {draftCount > 0 && ` (${draftCount} bản nháp)`}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex flex-1 sm:flex-initial h-9 sm:h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Tạo thông báo mới</span>
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shadow-2xs cursor-pointer shrink-0"
              title="Tải lại dữ liệu mới nhất"
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${loading ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden xs:inline sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Bộ lọc nhanh:</span>
          <div className="flex items-center gap-2 shrink-0 flex-nowrap sm:flex-wrap">
            {[
              { id: "ALL", label: `Tất cả (${announcements.length})` },
              { id: "ACTIVE", label: `Đang phát sóng (${activeCount})` },
              { id: "PINNED", label: `Ghim nổi bật (${pinnedCount})` },
              { id: "DRAFT", label: `Bản nháp (${draftCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative sm:col-span-2 lg:col-span-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tiêu đề, tóm tắt..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition truncate"
            >
              <option value="ALL">Tất cả loại thông báo</option>
              <option value="SYSTEM">Hệ thống / Bảo trì</option>
              <option value="FEATURE_UPDATE">Cập nhật bài học</option>
              <option value="PROMOTION">Khuyến mãi / Ưu đãi</option>
              <option value="EVENT">Sự kiện TOEIC</option>
            </select>
          </div>

          <div className="sm:col-span-1 lg:col-span-3">
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value as typeof targetFilter)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition truncate"
            >
              <option value="ALL">Tất cả đối tượng nhận</option>
              <option value="FREE_USERS">Chỉ học viên Free</option>
              <option value="VIP_USERS">Chỉ học viên VIP</option>
            </select>
          </div>
        </div>

        {feedbackMsg && (
          <div
            role={feedbackIsError ? "alert" : "status"}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
              feedbackIsError
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {feedbackIsError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Announcements Grid - Responsive 1 col (<1024px), 2 cols (1024px-1535px), 3 cols (>=1536px) */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 mt-4">
        {filtered.map((item) => {
          const badge = typeBadges[item.type] || typeBadges.FEATURE_UPDATE;
          return (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md ${
                item.isPinned ? "border-amber-300/90 ring-1 ring-amber-200/70 bg-gradient-to-br from-amber-50/20 via-white to-white" : "border-slate-200/80"
              }`}
            >
              <div>
                {/* Card Header: Type badge, target, and Pin badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      • {targetLabels[item.target]}
                    </span>
                  </div>

                  {item.isPinned && (
                    <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <Pin className="h-3 w-3 fill-amber-500" /> Đã ghim
                    </span>
                  )}
                </div>

                <h3 className="mt-2.5 text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
                  {normalizeLineBreaks(item.title)}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {normalizeLineBreaks(item.summary || item.content)}
                </p>

                {item.actionUrl && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-blue-600 max-w-full">
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono">{item.actionUrl}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: View stats + Action buttons */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <span className="flex items-center gap-1 font-mono font-semibold text-slate-700" title="Số lượng học viên đã bấm xem">
                    <Eye className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {item.readCount || 0} lượt đọc
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewItem(item);
                      setPreviewTab("modal");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-blue-50 px-2 sm:px-2.5 py-1 text-slate-700 hover:text-blue-700 transition cursor-pointer font-medium text-[11px]"
                    title="Xem trước giao diện hiển thị phía Học viên"
                  >
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden xs:inline sm:inline">Xem trước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void togglePin(item)}
                    className={`rounded-lg p-1.5 transition cursor-pointer shrink-0 ${
                      item.isPinned ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300/60" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                    title={item.isPinned ? "Gỡ ghim" : "Ghim lên đầu trang học viên"}
                  >
                    <Pin className="h-3.5 w-3.5 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleStatus(item)}
                    className={`rounded-lg px-2 py-1 font-semibold text-[10px] transition cursor-pointer shrink-0 ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80"
                        : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/80"
                    }`}
                    title={item.status === "ACTIVE" ? "Bấm để chuyển về Bản nháp ẩn" : "Bấm để Phát sóng ngay"}
                  >
                    {item.status === "ACTIVE" ? "Đang phát sóng" : "Bản nháp"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormErrors({});
                      setEditingItem(item);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer shrink-0"
                    title="Chỉnh sửa nội dung"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer shrink-0"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Megaphone className="mx-auto h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-700">Chưa có thông báo nào phù hợp với bộ lọc.</p>
            <p className="text-slate-400">Bạn có thể tạo thông báo mới hoặc chọn mẫu thông báo có sẵn bên dưới.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tạo thông báo đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Modal Tạo/Chỉnh sửa thông báo */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl 2xl:max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {editingItem.id ? "Chỉnh sửa Thông báo" : "Tạo Thông báo mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setFormErrors({});
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
              {/* Presets Bar */}
              {!editingItem.id && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <LayoutTemplate className="h-3.5 w-3.5 text-blue-600 shrink-0" /> Mẫu thông báo gợi ý nhanh:
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {QUICK_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="flex flex-col items-start gap-1 rounded-lg border border-white bg-white p-2.5 text-left shadow-2xs hover:border-blue-300 hover:bg-blue-50/80 transition cursor-pointer"
                      >
                        <span className="text-base">{tpl.icon}</span>
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tiêu đề thông báo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={200}
                  aria-invalid={Boolean(formErrors.title)}
                  aria-describedby={formErrors.title ? "announcement-title-error" : undefined}
                  value={editingItem.title || ""}
                  onChange={(e) => {
                    setEditingItem({ ...editingItem, title: e.target.value });
                    setFormErrors((current) => ({ ...current, title: "" }));
                  }}
                  placeholder="Ví dụ: Cập nhật bộ đề thi ETS 2026..."
                  className={`h-10 w-full rounded-xl border px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 transition ${
                    formErrors.title ? "border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-100" : "border-slate-200"
                  }`}
                />
                {formErrors.title && (
                  <p id="announcement-title-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Tóm tắt ngắn (1-2 câu hiển thị ở danh sách & banner)</label>
                <input
                  type="text"
                  maxLength={500}
                  aria-invalid={Boolean(formErrors.summary)}
                  aria-describedby={formErrors.summary ? "announcement-summary-error" : undefined}
                  value={editingItem.summary || ""}
                  onChange={(e) => {
                    setEditingItem({ ...editingItem, summary: e.target.value });
                    setFormErrors((current) => ({ ...current, summary: "" }));
                  }}
                  placeholder="Mô tả ngắn xuất hiện ở danh sách và banner..."
                  className={`h-10 w-full rounded-xl border px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 transition ${
                    formErrors.summary ? "border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-100" : "border-slate-200"
                  }`}
                />
                {formErrors.summary && (
                  <p id="announcement-summary-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {formErrors.summary}
                  </p>
                )}
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Phân loại thông báo</label>
                  <select
                    value={editingItem.type || "FEATURE_UPDATE"}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as AnnouncementType })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition truncate"
                  >
                    <option value="FEATURE_UPDATE">Cập nhật bài học</option>
                    <option value="PROMOTION">Khuyến mãi / Ưu đãi</option>
                    <option value="SYSTEM">Hệ thống / Bảo trì</option>
                    <option value="EVENT">Sự kiện TOEIC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Đối tượng áp dụng</label>
                  <select
                    value={editingItem.target || "ALL"}
                    onChange={(e) => setEditingItem({ ...editingItem, target: e.target.value as AnnouncementTarget })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer transition truncate"
                  >
                    <option value="ALL">Tất cả học viên</option>
                    <option value="FREE_USERS">Chỉ học viên Free</option>
                    <option value="VIP_USERS">Chỉ học viên VIP Premium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  maxLength={10000}
                  aria-invalid={Boolean(formErrors.content)}
                  aria-describedby={formErrors.content ? "announcement-content-error" : undefined}
                  value={editingItem.content || ""}
                  onChange={(e) => {
                    setEditingItem({ ...editingItem, content: e.target.value });
                    setFormErrors((current) => ({ ...current, content: "" }));
                  }}
                  placeholder="Nội dung chi tiết của thông báo..."
                  className={`w-full rounded-xl border p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 leading-relaxed transition ${
                    formErrors.content ? "border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-100" : "border-slate-200"
                  }`}
                />
                {formErrors.content && (
                  <p id="announcement-content-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {formErrors.content}
                  </p>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Đích đến khi học viên bấm nút &quot;Khám phá / Hành động&quot;
                  </label>
                  <span className="text-[11px] font-medium text-slate-400">
                    Chọn trang đích phù hợp với thông báo
                  </span>
                </div>

                <div className="space-y-2">
                  <select
                    value={
                      !editingItem.actionUrl || editingItem.actionUrl.trim() === "" || editingItem.actionUrl === "/"
                        ? "NONE"
                        : PRESET_ACTION_DESTINATIONS.some((d) => d.url === editingItem.actionUrl)
                        ? editingItem.actionUrl
                        : "CUSTOM"
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "NONE") {
                        setEditingItem({ ...editingItem, actionUrl: "" });
                      } else if (val === "CUSTOM") {
                        if (!editingItem.actionUrl || PRESET_ACTION_DESTINATIONS.some((d) => d.url === editingItem.actionUrl)) {
                          setEditingItem({ ...editingItem, actionUrl: "/mock-tests" });
                        }
                      } else {
                        setEditingItem({ ...editingItem, actionUrl: val });
                      }
                      setFormErrors((current) => ({ ...current, actionUrl: "" }));
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="NONE">🔕 Không gắn nút chuyển hướng (Chỉ là thông báo để học viên đọc)</option>
                    <optgroup label="Các phân hệ học tập của học viên">
                      {PRESET_ACTION_DESTINATIONS.map((dest) => (
                        <option key={dest.url} value={dest.url}>
                          {dest.label}
                        </option>
                      ))}
                    </optgroup>
                    <option value="CUSTOM">🔗 Đường link tùy chỉnh khác (Tự nhập liên kết)...</option>
                  </select>

                  {/* Nhập link tùy chỉnh khi chọn CUSTOM */}
                  {Boolean(
                    editingItem.actionUrl &&
                    editingItem.actionUrl.trim() !== "" &&
                    editingItem.actionUrl !== "/" &&
                    !PRESET_ACTION_DESTINATIONS.some((d) => d.url === editingItem.actionUrl)
                  ) && (
                    <div className="pt-1">
                      <input
                        type="text"
                        maxLength={500}
                        aria-invalid={Boolean(formErrors.actionUrl)}
                        aria-describedby={formErrors.actionUrl ? "announcement-action-url-error" : undefined}
                        value={editingItem.actionUrl || ""}
                        onChange={(e) => {
                          setEditingItem({ ...editingItem, actionUrl: e.target.value });
                          setFormErrors((current) => ({ ...current, actionUrl: "" }));
                        }}
                        placeholder="Nhập đường dẫn nội bộ (ví dụ: /reading) hoặc link ngoài (https://...)"
                        className={`h-10 w-full rounded-xl border px-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-500 font-mono transition ${
                          formErrors.actionUrl ? "border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-100" : "border-slate-200"
                        }`}
                      />
                    </div>
                  )}

                  {/* Thông tin mô tả nút bấm & đường dẫn thực tế */}
                  {editingItem.actionUrl && editingItem.actionUrl.trim() !== "" && editingItem.actionUrl !== "/" ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-slate-600">Nút bên học viên:</span>
                        <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                          &quot;{getActionUrlLabel(editingItem.actionUrl)} ↗&quot;
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-blue-600">
                        Đích đến: {resolveStudentActionUrl(editingItem.actionUrl)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      ℹ️ Thông báo này sẽ chỉ hiển thị để học viên đọc thông tin, không có nút chuyển hướng.
                    </p>
                  )}

                  {formErrors.actionUrl && (
                    <p id="announcement-action-url-error" role="alert" className="mt-1 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {formErrors.actionUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isPinned)}
                    onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Ghim lên đầu trang &amp; hiện Banner Bảng điều khiển học viên
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.status === "ACTIVE"}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.checked ? "ACTIVE" : "DRAFT" })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Kích hoạt phát sóng ngay (Active)
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setFormErrors({});
                  }}
                  className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveForm()}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 shadow-xs transition cursor-pointer text-center"
                >
                  {editingItem.id ? "Lưu thay đổi" : "Tạo & Phát sóng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem trước giao diện học viên (Demo 100% chuẩn giao diện Học viên - Nền trắng sạch) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl lg:max-w-2xl 2xl:max-w-3xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 text-slate-900 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header: Title + Close */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs shrink-0">
                  <Monitor className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Mô phỏng Giao diện Học viên
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Xem trước cách thông báo hiển thị trên ứng dụng thực tế của học viên
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                aria-label="Đóng xem trước"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toggle Preview Mode Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3.5">
              <div className="inline-flex rounded-xl p-1 bg-slate-100/90 border border-slate-200/80 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewTab("modal")}
                  className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer text-center ${
                    previewTab === "modal"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pop-up chi tiết thông báo
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("banner")}
                  className={`flex-1 sm:flex-initial rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer text-center ${
                    previewTab === "banner"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Banner Dashboard học viên
                </button>
              </div>

              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                Chế độ: Giao diện chuẩn phía Học viên
              </span>
            </div>

            {/* Content Display */}
            {previewTab === "modal" ? (
              <div className="mt-4 space-y-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 sm:p-5 shadow-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      typeBadges[previewItem.type]?.bg
                    } ${typeBadges[previewItem.type]?.border} ${typeBadges[previewItem.type]?.text}`}
                  >
                    {typeBadges[previewItem.type]?.label}
                  </span>
                  {previewItem.isPinned && (
                    <span className="text-[10px] text-amber-600 flex items-center gap-1 font-bold">
                      <Pin className="h-3 w-3 fill-amber-500 text-amber-500" /> Tin Nổi Bật
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto font-medium">
                    {new Date(previewItem.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {normalizeLineBreaks(previewItem.title)}
                </h4>

                {previewItem.summary && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-3.5 py-2 text-xs font-medium text-blue-900 italic">
                    {normalizeLineBreaks(previewItem.summary)}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {normalizeLineBreaks(previewItem.content)}
                </p>

                {previewItem.actionUrl && previewItem.actionUrl.trim() !== "" && previewItem.actionUrl !== "/" ? (
                  <div className="pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSimulatedNav(
                          `Học viên bấm "${getActionUrlLabel(previewItem.actionUrl)}" sẽ được chuyển hướng tức thì đến: "${resolveStudentActionUrl(previewItem.actionUrl)}"`
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition cursor-pointer active:scale-98"
                      title="Bấm để thử nghiệm thao tác của học viên"
                    >
                      <span>{getActionUrlLabel(previewItem.actionUrl)}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      Đích đến: {resolveStudentActionUrl(previewItem.actionUrl)}
                    </span>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-400 italic">
                    ℹ️ Thông báo này không gắn link hành động (Học viên chỉ đọc nội dung).
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-3.5 sm:p-4 shadow-xs text-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                      <Megaphone className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-600/10 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {typeBadges[previewItem.type]?.label || "Tin nổi bật"}
                        </span>
                        {previewItem.isPinned && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            <Pin className="h-3 w-3 fill-amber-500 text-amber-500" /> Tin nổi bật trên trang chủ
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1 text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {normalizeLineBreaks(previewItem.title)}
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {normalizeLineBreaks(previewItem.summary || previewItem.content.slice(0, 140))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0 flex-wrap sm:flex-nowrap">
                    {previewItem.actionUrl && previewItem.actionUrl.trim() !== "" && previewItem.actionUrl !== "/" && (
                      <button
                        type="button"
                        onClick={() =>
                          setSimulatedNav(
                            `Học viên bấm "${getActionUrlLabel(previewItem.actionUrl)}" trên Dashboard sẽ mở: "${resolveStudentActionUrl(previewItem.actionUrl)}"`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer active:scale-98"
                      >
                        <span>{getActionUrlLabel(previewItem.actionUrl)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.open("/notifications", "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      title="Mở trang thông báo học viên trong tab mới"
                    >
                      <span>Xem tất cả</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewItem(null);
                        setSimulatedNav(null);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition cursor-pointer"
                      title="Đóng xem trước"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Thông báo kết quả mô phỏng khi Admin click vào nút */}
            {simulatedNav && (
              <div className="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium leading-relaxed">{simulatedNav}</span>
                </div>
                {previewItem.actionUrl && previewItem.actionUrl.trim() !== "" && (
                  <a
                    href={resolveStudentActionUrl(previewItem.actionUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 text-[11px]"
                    title="Mở thử link đích trong tab trình duyệt mới"
                  >
                    Mở tab mới <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 pt-3.5">
              <span className="text-[11px] text-slate-400">
                💡 Xem trước giao diện thực tế của học viên trên hệ thống
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer text-center"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Xóa thông báo?</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa thông báo <span className="font-bold text-slate-900">&quot;{deletingItem.title}&quot;</span>?
            </p>
            <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer text-center"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-red-700 transition cursor-pointer text-center"
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
