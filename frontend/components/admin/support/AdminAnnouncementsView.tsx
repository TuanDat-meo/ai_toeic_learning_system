"use client";

import { useEffect, useState } from "react";
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
  Tag,
  Trash2,
  Users,
  X,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { AdminPageFrame, type AdminMetric } from "@/components/admin/AdminPageFrame";
import {
  getAnnouncements,
  saveAnnouncements,
  type Announcement,
  type AnnouncementStatus,
  type AnnouncementTarget,
  type AnnouncementType,
} from "@/lib/api/support";

const typeBadges: Record<AnnouncementType, { label: string; bg: string }> = {
  SYSTEM: { label: "Hệ thống / Bảo trì", bg: "bg-slate-100 text-slate-800 border-slate-300" },
  FEATURE_UPDATE: { label: "Cập nhật bài học", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  PROMOTION: { label: "Khuyến mãi / Ưu đãi", bg: "bg-amber-50 text-amber-800 border-amber-200" },
  EVENT: { label: "Sự kiện TOEIC", bg: "bg-purple-50 text-purple-700 border-purple-200" },
};

const targetLabels: Record<AnnouncementTarget, string> = {
  ALL: "Tất cả học viên",
  FREE_USERS: "Học viên Free",
  VIP_USERS: "Học viên VIP Premium",
};

export function AdminAnnouncementsView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | AnnouncementType>("ALL");
  const [targetFilter, setTargetFilter] = useState<"ALL" | AnnouncementTarget>("ALL");

  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null);
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      setAnnouncements(await getAnnouncements());
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(msg: string) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  const filtered = announcements.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    const matchesType = typeFilter === "ALL" || a.type === typeFilter;
    const matchesTarget = targetFilter === "ALL" || a.target === targetFilter;
    return matchesSearch && matchesType && matchesTarget;
  });

  const activeCount = announcements.filter((a) => a.status === "ACTIVE").length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;
  const totalReads = announcements.reduce((acc, a) => acc + a.readCount, 0);

  const metrics: AdminMetric[] = [
    {
      label: "Tổng thông báo",
      value: announcements.length.toString(),
      trend: "Tất cả tin nhắn",
      tone: "neutral",
      icon: <Megaphone className="h-5 w-5 text-slate-600" />,
    },
    {
      label: "Đang hiển thị",
      value: activeCount.toString(),
      trend: "Đang phát sóng",
      tone: "primary",
      icon: <Bell className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Ghim nổi bật",
      value: pinnedCount.toString(),
      trend: "Ưu tiên đầu trang",
      tone: "secondary",
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

  async function handleSaveForm() {
    if (!editingItem || !editingItem.title?.trim() || !editingItem.content?.trim()) {
      alert("Vui lòng nhập đầy đủ Tiêu đề và Nội dung thông báo!");
      return;
    }

    let nextList: Announcement[];
    if (editingItem.id) {
      nextList = announcements.map((a) =>
        a.id === editingItem.id
          ? ({ ...a, ...editingItem, updatedAt: new Date().toISOString() } as Announcement)
          : a
      );
      showFeedback(`Đã cập nhật thông báo "${editingItem.title}"`);
    } else {
      const newItem: Announcement = {
        id: `anc-${Date.now()}`,
        title: editingItem.title || "",
        summary: editingItem.summary || "",
        content: editingItem.content || "",
        type: editingItem.type || "FEATURE_UPDATE",
        target: editingItem.target || "ALL",
        status: editingItem.status || "ACTIVE",
        isPinned: Boolean(editingItem.isPinned),
        actionUrl: editingItem.actionUrl || "",
        readCount: 0,
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "Admin TOEIC",
      };
      nextList = [newItem, ...announcements];
      showFeedback(`Đã tạo thông báo mới "${newItem.title}"`);
    }

    setAnnouncements(nextList);
    await saveAnnouncements(nextList);
    setEditingItem(null);
  }

  async function togglePin(announcement: Announcement) {
    const updated = announcements.map((a) => (a.id === announcement.id ? { ...a, isPinned: !a.isPinned } : a));
    setAnnouncements(updated);
    await saveAnnouncements(updated);
    showFeedback(announcement.isPinned ? "Đã gỡ ghim thông báo" : "Đã ghim thông báo lên đầu trang");
  }

  async function toggleStatus(announcement: Announcement) {
    const nextStatus: AnnouncementStatus = announcement.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    const updated = announcements.map((a) => (a.id === announcement.id ? { ...a, status: nextStatus } : a));
    setAnnouncements(updated);
    await saveAnnouncements(updated);
    showFeedback(nextStatus === "ACTIVE" ? "Đã kích hoạt hiển thị thông báo" : "Đã chuyển thông báo sang bản nháp");
  }

  async function handleDeleteConfirm() {
    if (!deletingItem) return;
    const updated = announcements.filter((a) => a.id !== deletingItem.id);
    setAnnouncements(updated);
    await saveAnnouncements(updated);
    setDeletingItem(null);
    showFeedback(`Đã xóa thông báo "${deletingItem.title}"`);
  }

  return (
    <AdminPageFrame
      title="Quản lý Thông báo Systems & Marketing"
      subtitle="Tạo tin nhắn hệ thống, cập nhật kho bài học và chương trình ưu đãi hiển thị trên trang Học viên."
      metrics={metrics}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách Thông báo</h2>
            <p className="text-xs text-slate-500">Hiển thị {filtered.length} trên tổng số {announcements.length} thông báo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" /> Tạo thông báo mới
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
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
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
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả đối tượng nhận</option>
            <option value="FREE_USERS">Chỉ học viên Free</option>
            <option value="VIP_USERS">Chỉ học viên VIP</option>
          </select>
        </div>

        {feedbackMsg && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            {feedbackMsg}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => {
          const badge = typeBadges[item.type] || typeBadges.FEATURE_UPDATE;
          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                item.isPinned ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200/80"
              }`}
            >
              {item.isPinned && (
                <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Pin className="h-3 w-3 fill-amber-500" /> Đã ghim
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  • {targetLabels[item.target]}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.summary || item.content}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="h-3.5 w-3.5 text-slate-400" /> {item.readCount} lượt đọc
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    title="Xem trước giao diện Học viên"
                  >
                    <Eye className="h-3.5 w-3.5" /> Demo
                  </button>

                  <button
                    type="button"
                    onClick={() => void togglePin(item)}
                    className={`rounded-lg p-1.5 transition ${
                      item.isPinned ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                    title={item.isPinned ? "Gỡ ghim" : "Ghim lên đầu"}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleStatus(item)}
                    className={`rounded-lg px-2 py-1 font-semibold transition ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.status === "ACTIVE" ? "Hiển thị" : "Bản nháp"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingItem(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
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
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
            Chưa có thông báo nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem.id ? "Chỉnh sửa Thông báo" : "Tạo Thông báo mới"}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Tiêu đề thông báo *</label>
                <input
                  type="text"
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="Ví dụ: Cập nhật bộ đề thi ETS 2026..."
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Tóm tắt ngắn (vài câu)</label>
                <input
                  type="text"
                  value={editingItem.summary || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  placeholder="Mô tả ngắn xuất hiện ở danh sách..."
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Phân loại thông báo</label>
                  <select
                    value={editingItem.type || "FEATURE_UPDATE"}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as AnnouncementType })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
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
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tất cả học viên</option>
                    <option value="FREE_USERS">Chỉ học viên Free</option>
                    <option value="VIP_USERS">Chỉ học viên VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={5}
                  value={editingItem.content || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  placeholder="Nội dung chi tiết của thông báo..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Đường dẫn liên kết (tùy chọn)</label>
                <input
                  type="text"
                  value={editingItem.actionUrl || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, actionUrl: e.target.value })}
                  placeholder="Ví dụ: /mock-tests hoặc /billing/subscriptions"
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.isPinned)}
                    onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Ghim lên đầu trang tin tức học viên
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.status === "ACTIVE"}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.checked ? "ACTIVE" : "DRAFT" })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Kích hoạt ngay (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setEditingItem(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                  Hủy
                </button>
                <button type="button" onClick={() => void handleSaveForm()} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  {editingItem.id ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl border border-slate-700 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
                Demo Student Notification Modal
              </span>
              <button type="button" onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${typeBadges[previewItem.type]?.bg}`}>
                  {typeBadges[previewItem.type]?.label}
                </span>
                {previewItem.isPinned && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                    <Pin className="h-3 w-3 fill-amber-400" /> Tin Nổi Bật
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-white leading-snug">{previewItem.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{previewItem.content}</p>

              {previewItem.actionUrl && (
                <div className="pt-2">
                  <a
                    href={previewItem.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                  >
                    <span>Khám phá ngay</span> <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-3 text-right">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Xóa thông báo?</h3>
            <p className="mt-2 text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa thông báo <span className="font-bold text-slate-900">&quot;{deletingItem.title}&quot;</span>?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingItem(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Hủy
              </button>
              <button type="button" onClick={() => void handleDeleteConfirm()} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageFrame>
  );
}
