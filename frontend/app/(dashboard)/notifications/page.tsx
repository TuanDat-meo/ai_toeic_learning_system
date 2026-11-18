'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  ExternalLink,
  MessageSquareText,
  Pin,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  getMySupportReports,
  getStudentAnnouncements,
  markAnnouncementRead,
  type Announcement,
  type SupportReport,
} from '@/lib/api/support';
import { OPEN_FEEDBACK_MODAL_EVENT } from '@/components/layout/FeedbackSupportModal';

const typeLabels = {
  SYSTEM: 'Hệ thống / Bảo trì',
  FEATURE_UPDATE: 'Cập nhật bài học',
  PROMOTION: 'Khuyến mãi / Ưu đãi',
  EVENT: 'Sự kiện TOEIC',
} as const;

const statusLabels: Record<SupportReport['status'], { label: string; className: string }> = {
  PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESOLVED: { label: 'Đã giải quyết', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Từ chối', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'reports'>('announcements');
  const [items, setItems] = useState<Announcement[]>([]);
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

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
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
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

  const unreadCount = items.filter((item) => !item.isRead).length;
  const repliedReportsCount = reports.filter((r) => Boolean(r.adminReply)).length;

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent(OPEN_FEEDBACK_MODAL_EVENT, { detail: { mode: 'feedback' } }),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] cursor-pointer"
          >
            <Plus className="size-3.5" /> Gửi phản hồi
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Bell className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">Chưa có thông báo hệ thống</p>
              <p className="mt-1 text-sm text-slate-500">
                Khi quản trị viên đăng cập nhật bài học, sự kiện TOEIC hoặc thông báo bảo trì, nội dung sẽ xuất hiện tại đây.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  item.isRead ? 'border-slate-200' : 'border-blue-200 ring-1 ring-blue-100'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    {typeLabels[item.type]}
                  </span>
                  {item.isPinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                      <Pin className="size-3" /> Nổi bật
                    </span>
                  )}
                  {!item.isRead && (
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                      Mới
                    </span>
                  )}
                  <time className="ml-auto text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </time>
                </div>
                <h2 className="mt-3 text-base font-bold text-slate-900">{item.title}</h2>
                {item.summary && <p className="mt-1 text-sm font-medium text-slate-600">{item.summary}</p>}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.content}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">Gửi bởi {item.createdBy}</span>
                  <div className="flex items-center gap-2">
                    {item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Xem thêm <ExternalLink className="size-3.5" />
                      </Link>
                    )}
                    {!item.isRead && (
                      <button
                        type="button"
                        disabled={markingId === item.id}
                        onClick={() => void markRead(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
                      >
                        <Check className="size-3.5" /> Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {!loading && activeTab === 'reports' && (
        <>
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <MessageSquareText className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">Bạn chưa gửi phản hồi hoặc đề xuất nào</p>
              <p className="mt-1 text-sm text-slate-500">
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
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 tabular-nums">
                        #{report.ticketCode || report.id.slice(0, 8)}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                      <time className="ml-auto text-xs text-slate-500">
                        {new Date(report.createdAt).toLocaleString('vi-VN')}
                      </time>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">{report.title}</h2>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{report.description}</p>
                    {report.adminReply ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#1b41ae]">
                          Phản hồi từ Quản trị viên
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                          {report.adminReply}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Đang chờ quản trị viên phản hồi.</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
