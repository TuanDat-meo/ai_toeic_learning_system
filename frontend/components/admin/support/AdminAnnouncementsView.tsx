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
  Copy,
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
    name: "Cập nhật bài học",
    icon: "📚",
    type: "FEATURE_UPDATE",
    target: "ALL",
    title: "Cập nhật kho đề thi & chuyên đề TOEIC mới nhất",
    summary: "Hệ thống đã cập nhật thêm các bài luyện đọc hiểu và đề thi thử mới bám sát cấu trúc đề thi thật ETS kèm giải thích song ngữ.",
    content: "Chào các bạn học viên,\n\nHệ thống vừa hoàn tất cập nhật các bài tập đọc hiểu Reading và đề thi thử mới nhất với đầy đủ bản dịch song ngữ, phân tích từ vựng quan trọng và bẫy đề thi.\n\nCác bạn hãy vào mục Đề thi thử hoặc Luyện đọc để trải nghiệm ngay nhé!",
    actionUrl: "/mock-tests",
    isPinned: true,
  },
  {
    name: "Ưu đãi gói VIP",
    icon: "🎁",
    type: "PROMOTION",
    target: "FREE_USERS",
    title: "Ưu đãi đặc biệt: Nâng cấp tài khoản VIP TOEIC Master",
    summary: "Nhận ưu đãi lên đến 40% cho các gói học PRO & PREMIUM để mở khóa toàn bộ kho tàng câu hỏi và gia sư AI.",
    content: "Chào bạn,\n\nĐể hỗ trợ bạn bứt phá band điểm mục tiêu trong kỳ thi sắp tới, hệ thống đang áp dụng chương trình ưu đãi đặc biệt dành cho học viên nâng cấp gói học.\n\nQuyền lợi VIP bao gồm:\n- Mở khóa trọn bộ ngân hàng câu hỏi Part 1-7\n- Gia sư AI giải đáp thắc mắc 24/7\n- Phân tích chi tiết lộ trình và dự đoán điểm thi chính xác\n\nNhanh tay nâng cấp ngay để không bỏ lỡ!",
    actionUrl: "/billing/subscriptions",
    isPinned: true,
  },
  {
    name: "Bảo trì máy chủ",
    icon: "⚙️",
    type: "SYSTEM",
    target: "ALL",
    title: "Thông báo bảo trì và nâng cấp hạ tầng máy chủ",
    summary: "Hệ thống sẽ tiến hành bảo trì định kỳ từ 00:00 đến 02:00 nhằm tối ưu hóa tốc độ tải và nâng cấp gia sư AI.",
    content: "Kính gửi quý học viên,\n\nNhằm nâng cao chất lượng dịch vụ và tốc độ xử lý các bài tập, đội ngũ kỹ thuật sẽ tiến hành bảo trì hệ thống định kỳ vào đêm nay.\n\nTrong thời gian bảo trì, một số tính năng có thể bị gián đoạn tạm thời. Các bạn vui lòng lưu lại tiến độ bài làm trước thời gian trên.\n\nXin cảm ơn sự thông cảm và đồng hành của các bạn!",
    actionUrl: "/",
    isPinned: false,
  },
  {
    name: "Thử thách thi thử",
    icon: "🏆",
    type: "EVENT",
    target: "ALL",
    title: "Sự kiện Thử thách TOEIC Master Tuần này",
    summary: "Tham gia giải đề thi thử cuối tuần để nhận ngay huy hiệu danh dự và điểm thưởng vinh danh trên bảng xếp hạng.",
    content: "Cơ hội cọ xát thực tế dành cho toàn thể học viên TOEIC AI!\n\nCuối tuần này, sự kiện thi thử online sẽ chính thức diễn ra với format đề thi 200 câu chuẩn ETS. Kết quả sẽ được hệ thống chấm tự động và xếp hạng ngay sau khi nộp bài.\n\nHãy chuẩn bị tinh thần và tham gia cùng cộng đồng học viên nhé!",
    actionUrl: "/mock-tests",
    isPinned: true,
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
    return () => window.clearTimeout(timer);
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
      title: tpl.title,
      summary: tpl.summary,
      content: tpl.content,
      actionUrl: tpl.actionUrl,
      isPinned: tpl.isPinned,
      status: "ACTIVE",
    }));
    setFormErrors({});
    showFeedback(`Đã áp dụng mẫu "${tpl.name}"`);
  }

  function handleDuplicate(item: Announcement) {
    setFormErrors({});
    setEditingItem({
      title: `[Bản sao] ${item.title}`,
      summary: item.summary,
      content: item.content,
      type: item.type,
      target: item.target,
      status: "DRAFT",
      isPinned: false,
      actionUrl: item.actionUrl || "",
    });
    showFeedback(`Đã nhân bản thông báo thành bản nháp mới`);
  }

  async function handleSaveForm() {
    if (!editingItem) return;
    const title = editingItem.title?.trim() || "";
    const summary = editingItem.summary?.trim() || "";
    const content = editingItem.content?.trim() || "";
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách Thông báo</h2>
            <p className="text-xs text-slate-500">
              Hiển thị {filtered.length} trên tổng số {announcements.length} thông báo
              {draftCount > 0 && ` (${draftCount} bản nháp)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tạo thông báo mới
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} /> Làm mới
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Bộ lọc nhanh:</span>
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
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter inputs */}
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tiêu đề, tóm tắt..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả loại thông báo</option>
            <option value="SYSTEM">Hệ thống / Bảo trì</option>
            <option value="FEATURE_UPDATE">Cập nhật bài học</option>
            <option value="PROMOTION">Khuyến mãi / Ưu đãi</option>
            <option value="EVENT">Sự kiện TOEIC</option>
          </select>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value as typeof targetFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả đối tượng nhận</option>
            <option value="FREE_USERS">Chỉ học viên Free</option>
            <option value="VIP_USERS">Chỉ học viên VIP</option>
          </select>
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

      {/* Announcements Grid */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {filtered.map((item) => {
          const badge = typeBadges[item.type] || typeBadges.FEATURE_UPDATE;
          return (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                item.isPinned ? "border-amber-300 ring-1 ring-amber-200 bg-gradient-to-br from-amber-50/20 to-white" : "border-slate-200/80"
              }`}
            >
              {item.isPinned && (
                <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Pin className="h-3 w-3 fill-amber-500" /> Đã ghim
                </span>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.border} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    • {targetLabels[item.target]}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.summary || item.content}
                </p>

                {item.actionUrl && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600">
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate max-w-[280px]">{item.actionUrl}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono font-semibold text-slate-600" title="Số lượng học viên đã bấm xem">
                    <Eye className="h-3.5 w-3.5 text-emerald-600" /> {item.readCount || 0} lượt đọc
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewItem(item);
                      setPreviewTab("modal");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                    title="Xem trước giao diện Học viên"
                  >
                    <Eye className="h-3.5 w-3.5" /> Xem trước
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                    title="Nhân bản thông báo này"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void togglePin(item)}
                    className={`rounded-lg p-1.5 transition cursor-pointer ${
                      item.isPinned ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                    title={item.isPinned ? "Gỡ ghim" : "Ghim lên đầu trang học viên"}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleStatus(item)}
                    className={`rounded-lg px-2 py-1 font-semibold text-[10px] transition cursor-pointer ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
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
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                    title="Chỉnh sửa nội dung"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem.id ? "Chỉnh sửa Thông báo" : "Tạo Thông báo mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setFormErrors({});
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Presets Bar */}
              {!editingItem.id && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <LayoutTemplate className="h-3.5 w-3.5 text-blue-600" /> Mẫu thông báo gợi ý nhanh:
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
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none focus:border-blue-500 ${
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
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none focus:border-blue-500 ${
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

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Phân loại thông báo</label>
                  <select
                    value={editingItem.type || "FEATURE_UPDATE"}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as AnnouncementType })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
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
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
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
                  className={`w-full rounded-xl border p-3 text-xs text-slate-800 outline-none focus:border-blue-500 leading-relaxed ${
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
                <label className="block text-xs font-bold text-slate-800 mb-1">Đường dẫn liên kết (Action URL - Tùy chọn)</label>
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
                  placeholder="Ví dụ: /mock-tests hoặc /billing/subscriptions"
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono ${
                    formErrors.actionUrl ? "border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-100" : "border-slate-200"
                  }`}
                />
                {formErrors.actionUrl && (
                  <p id="announcement-action-url-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {formErrors.actionUrl}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
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

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setFormErrors({});
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveForm()}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  {editingItem.id ? "Lưu thay đổi" : "Tạo & Phát sóng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem trước giao diện học viên (Demo Dual Preview) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 p-6 text-white shadow-2xl border border-slate-700 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Xem trước hiển thị phía Học viên</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toggle Preview Mode */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setPreviewTab("modal")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  previewTab === "modal" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Xem chi tiết thông báo
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("banner")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  previewTab === "banner" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Banner Dashboard học viên
              </button>
            </div>

            {previewTab === "modal" ? (
              <div className="mt-4 space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${typeBadges[previewItem.type]?.bg} ${typeBadges[previewItem.type]?.border} ${typeBadges[previewItem.type]?.text}`}>
                    {typeBadges[previewItem.type]?.label}
                  </span>
                  {previewItem.isPinned && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                      <Pin className="h-3 w-3 fill-amber-400" /> Tin Nổi Bật
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(previewItem.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white leading-snug">{previewItem.title}</h4>
                {previewItem.summary && (
                  <p className="text-xs font-medium text-slate-300 italic">{previewItem.summary}</p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{previewItem.content}</p>

                {previewItem.actionUrl && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                      <span>Khám phá ngay</span> <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 text-white shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    {typeBadges[previewItem.type]?.label}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                    <Pin className="h-3 w-3 fill-amber-300" /> Tin nổi bật trên trang chủ
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{previewItem.title}</h4>
                <p className="text-xs text-slate-300">{previewItem.summary || previewItem.content.slice(0, 120)}</p>
                {previewItem.actionUrl && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 underline">
                      Xem chi tiết <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-slate-800 pt-3 text-right">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Xóa thông báo?</h3>
            <p className="mt-2 text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa thông báo <span className="font-bold text-slate-900">&quot;{deletingItem.title}&quot;</span>?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
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
