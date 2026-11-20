'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  MessageSquareText,
  Pin,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import {
  getMySupportReports,
  getStudentAnnouncements,
  markAnnouncementRead,
  markAllAnnouncementsRead,
  markAllNotificationsRead,
  deleteSupportReport,
  resolveStudentActionUrl,
  getActionUrlLabel,
  normalizeLineBreaks,
  type Announcement,
  type SupportReport,
  type AnnouncementType,
} from '@/lib/api/support';
import { OPEN_FEEDBACK_MODAL_EVENT } from '@/components/layout/FeedbackSupportModal';

const typeLabels: Record<AnnouncementType, { label: string; badgeClass: string }> = {
  SYSTEM: { label: 'Hệ thống / Bảo trì', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
  FEATURE_UPDATE: { label: 'Cập nhật bài học', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  PROMOTION: { label: 'Khuyến mãi / Ưu đãi', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  EVENT: { label: 'Sự kiện TOEIC', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const statusLabels: Record<SupportReport['status'], { label: string; className: string }> = {
  PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESOLVED: { label: 'Đã giải quyết', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Từ chối', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

type StudentAnnouncementFilter = 'ALL' | 'UNREAD' | 'PINNED' | 'FEATURE_UPDATE' | 'PROMOTION_EVENT' | 'SYSTEM';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'reports'>('announcements');
  const [announcementFilter, setAnnouncementFilter] = useState<StudentAnnouncementFilter>('ALL');
  const [items, setItems] = useState<Announcement[]>([]);
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [activeDetailItem, setActiveDetailItem] = useState<Announcement | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [annRes, repRes] = await Promise.allSettled([
        getStudentAnnouncements(),
        getMySupportReports(),
      ]);
      if (annRes.status === 'fulfilled') {
        setItems(annRes.value);
      } else {
        setError(annRes.reason instanceof Error ? annRes.reason.message : 'Không thể tải thông báo.');
      }
      if (repRes.status === 'fulfilled') {
        setReports(repRes.value);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'Thông Báo & Phản Hồi - TOEIC AI';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'reports') {
        setActiveTab('reports');
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      void markAllNotificationsRead().then(() => {
        window.dispatchEvent(new Event('notification-updated'));
      }).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    const handleUpdated = () => void load();
    window.addEventListener('announcement-updated', handleUpdated);
    window.addEventListener('announcement-read-updated', handleUpdated);
    window.addEventListener('support-reports-updated', handleUpdated);
    window.addEventListener('support-report-created', handleUpdated);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('announcement-updated', handleUpdated);
      window.removeEventListener('announcement-read-updated', handleUpdated);
      window.removeEventListener('support-reports-updated', handleUpdated);
      window.removeEventListener('support-report-created', handleUpdated);
    };
  }, []);

  async function markRead(id: string) {
    setMarkingId(id);
    try {
      await markAnnouncementRead(id);
      setItems((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
      window.dispatchEvent(new Event('announcement-read-updated'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật trạng thái đã đọc.');
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await markAllAnnouncementsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      window.dispatchEvent(new Event('announcement-read-updated'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật tất cả thông báo.');
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleDeleteReport(id: string) {
    if (!window.confirm('Bạn có chắc chắn muốn hủy phiếu báo cáo này không?')) return;
    setDeletingReportId(id);
    try {
      await deleteSupportReport(id);
      setReports((current) => current.filter((r) => r.id !== id));
      window.dispatchEvent(new Event('support-reports-updated'));
      window.dispatchEvent(new Event('notification-updated'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể hủy báo cáo này.');
    } finally {
      setDeletingReportId(null);
    }
  }

  function handleOpenDetail(item: Announcement) {
    setActiveDetailItem({ ...item, isRead: true });
    if (!item.isRead) {
      void markRead(item.id);
    }
  }

  const unreadCount = items.filter((item) => !item.isRead).length;
  const pinnedCount = items.filter((item) => item.isPinned).length;
  const repliedReportsCount = reports.filter((r) => Boolean(r.adminReply)).length;

  const filteredItems = items
    .filter((item) => {
      if (announcementFilter === 'UNREAD') return !item.isRead;
      if (announcementFilter === 'PINNED') return item.isPinned;
      if (announcementFilter === 'FEATURE_UPDATE') return item.type === 'FEATURE_UPDATE';
      if (announcementFilter === 'PROMOTION_EVENT') return item.type === 'PROMOTION' || item.type === 'EVENT';
      if (announcementFilter === 'SYSTEM') return item.type === 'SYSTEM';
      return true;
    })
    .sort((a, b) => {
      // Ưu tiên tin ghim nổi bật lên trên cùng
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Trung tâm thông báo</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Thông báo &amp; Phản hồi</h1>
          <p className="mt-1 text-sm text-slate-600">
            Thông báo từ hệ thống và tiến độ xử lý các phản hồi, đề xuất bạn đã gửi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'announcements' && unreadCount > 0 && (
            <button
              type="button"
              disabled={markingAll}
              onClick={() => void handleMarkAllRead()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 transition cursor-pointer"
            >
              <CheckCheck className={`size-3.5 ${markingAll ? 'animate-pulse' : ''}`} />
              <span>Đánh dấu tất cả đã đọc ({unreadCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(OPEN_FEEDBACK_MODAL_EVENT, { detail: { mode: 'feedback' } }),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" /> Gửi phản hồi
          </button>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-[#1b41ae] text-[#1b41ae]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="size-3.5" />
          <span>Thông báo hệ thống</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'reports'
              ? 'border-[#1b41ae] text-[#1b41ae]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquareText className="size-3.5" />
          <span>Phản hồi &amp; Đề xuất của tôi</span>
          {reports.length > 0 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 tabular-nums">
              {repliedReportsCount > 0 ? `${repliedReportsCount}/${reports.length} đã trả lời` : reports.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter pills for announcements */}
      {activeTab === 'announcements' && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'ALL', label: `Tất cả (${items.length})` },
            { id: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
            { id: 'PINNED', label: `Nổi bật (${pinnedCount})` },
            { id: 'FEATURE_UPDATE', label: 'Cập nhật bài học' },
            { id: 'PROMOTION_EVENT', label: 'Ưu đãi & Sự kiện' },
            { id: 'SYSTEM', label: 'Hệ thống' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setAnnouncementFilter(pill.id as StudentAnnouncementFilter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                announcementFilter === pill.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Đang tải dữ liệu…
        </div>
      )}

      {!loading && activeTab === 'announcements' && (
        <>
          {!error && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-2">
              <Bell className="mx-auto size-8 text-slate-300" />
              <p className="font-semibold text-slate-800">Chưa có thông báo hệ thống</p>
              <p className="text-sm text-slate-500">
                Khi quản trị viên đăng cập nhật bài học, sự kiện TOEIC hoặc thông báo bảo trì, nội dung sẽ xuất hiện tại đây.
              </p>
            </div>
          )}

          {!error && items.length > 0 && filteredItems.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              Không có thông báo nào trong bộ lọc này.
            </div>
          )}

          <div className="space-y-3">
            {filteredItems.map((item) => {
              const typeMeta = typeLabels[item.type] || typeLabels.FEATURE_UPDATE;
              return (
                <article
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className={`group relative rounded-2xl border bg-white p-5 shadow-2xs transition-all hover:shadow-md cursor-pointer ${
                    item.isPinned
                      ? 'border-amber-300/90 ring-1 ring-amber-200/60 bg-gradient-to-r from-amber-50/20 via-white to-white'
                      : item.isRead
                        ? 'border-slate-200'
                        : 'border-blue-300 ring-2 ring-blue-100/70 bg-gradient-to-r from-blue-50/20 to-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${typeMeta.badgeClass}`}>
                      {typeMeta.label}
                    </span>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                        <Pin className="size-3 fill-amber-500" /> Nổi bật
                      </span>
                    )}
                    {!item.isRead && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Mới
                      </span>
                    )}
                    <time className="ml-auto text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </time>
                  </div>

                  <h2 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {normalizeLineBreaks(item.title)}
                  </h2>
                  {item.summary && (
                    <p className="mt-1 text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed">
                      {normalizeLineBreaks(item.summary)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {normalizeLineBreaks(item.content)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400">Gửi bởi {item.createdBy || 'Ban Quản Trị'}</span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition">
                        <span>Xem chi tiết</span> &rarr;
                      </span>
                      {item.actionUrl && item.actionUrl.trim() !== '' && item.actionUrl.trim() !== '/' && (
                        <Link
                          href={resolveStudentActionUrl(item.actionUrl)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!item.isRead) {
                              void markRead(item.id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-2xs"
                        >
                          <span>{getActionUrlLabel(item.actionUrl)}</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {!loading && activeTab === 'reports' && (
        <>
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-2">
              <MessageSquareText className="mx-auto size-8 text-slate-300" />
              <p className="font-semibold text-slate-800">Bạn chưa gửi phản hồi hoặc đề xuất nào</p>
              <p className="text-sm text-slate-500">
                Gửi góp ý, báo lỗi bài tập hoặc đề xuất tính năng — câu trả lời của quản trị viên sẽ hiển thị ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const statusInfo = statusLabels[report.status] || statusLabels.PENDING;
                return (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        #{report.ticketCode || report.id.slice(0, 8)}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                      {report.adminReply && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✓ Đã phản hồi
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-3">
                        <time className="text-xs text-slate-400">
                          Gửi lúc: {new Date(report.createdAt).toLocaleString('vi-VN')}
                        </time>
                        {report.status === 'PENDING' && (
                          <button
                            type="button"
                            disabled={deletingReportId === report.id}
                            onClick={() => void handleDeleteReport(report.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50 cursor-pointer"
                            title="Hủy phản hồi này"
                          >
                            <Trash2 className="size-3" />
                            <span>Hủy</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{report.title}</h2>
                      {report.relatedContent && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Nội dung liên quan: <span className="font-mono font-medium text-slate-700">{report.relatedContent}</span>
                        </p>
                      )}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {report.description}
                    </p>

                    {report.adminReply ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1b41ae] flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-amber-500" /> Phản hồi từ Ban Quản Trị
                          </p>
                          {report.repliedAt && (
                            <time className="text-[11px] text-slate-400">
                              {new Date(report.repliedAt).toLocaleString('vi-VN')}
                            </time>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-normal">
                          {report.adminReply}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400 italic pt-1">
                        <Clock className="size-3.5 text-amber-500 animate-pulse" />
                        Đang chờ quản trị viên xử lý và phản hồi.
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal xem chi tiết thông báo */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700/80 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${typeLabels[activeDetailItem.type]?.badgeClass}`}>
                  {typeLabels[activeDetailItem.type]?.label}
                </span>
                {activeDetailItem.isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                    <Pin className="size-3 fill-amber-500" /> Nổi bật
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{normalizeLineBreaks(activeDetailItem.title)}</h3>
                <time className="mt-1 block text-xs text-slate-400 dark:text-slate-400">
                  Đăng lúc {new Date(activeDetailItem.createdAt).toLocaleString('vi-VN')} • Gửi bởi {activeDetailItem.createdBy || 'Ban Quản Trị'}
                </time>
              </div>

              {activeDetailItem.summary && (
                <div className="rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/40 p-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {normalizeLineBreaks(activeDetailItem.summary)}
                </div>
              )}

              <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                {normalizeLineBreaks(activeDetailItem.content)}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-400">Đã cập nhật trạng thái đã đọc</span>
              <div className="flex items-center gap-2">
                {activeDetailItem.actionUrl && activeDetailItem.actionUrl.trim() !== '' && activeDetailItem.actionUrl.trim() !== '/' && (
                  <Link
                    href={resolveStudentActionUrl(activeDetailItem.actionUrl)}
                    onClick={() => setActiveDetailItem(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition"
                  >
                    <span>{getActionUrlLabel(activeDetailItem.actionUrl)}</span> <ExternalLink className="size-3.5" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setActiveDetailItem(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
