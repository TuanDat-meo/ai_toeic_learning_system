'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Pin, RefreshCw } from 'lucide-react';
import { getStudentAnnouncements, markAnnouncementRead, type Announcement } from '@/lib/api/support';

const typeLabels = {
  SYSTEM: 'Hệ thống / Bảo trì',
  FEATURE_UPDATE: 'Cập nhật bài học',
  PROMOTION: 'Khuyến mãi / Ưu đãi',
  EVENT: 'Sự kiện TOEIC',
} as const;

export default function NotificationsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try { setItems(await getStudentAnnouncements()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải thông báo.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function markRead(id: string) {
    setMarkingId(id);
    try {
      await markAnnouncementRead(id);
      setItems((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
      window.dispatchEvent(new Event('announcement-read-updated'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật trạng thái đã đọc.');
    } finally { setMarkingId(null); }
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Trung tâm thông báo</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="mt-1 text-sm text-slate-600">Tin tức, cập nhật và thông tin dành cho tài khoản của bạn.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Đang tải thông báo…</div>}
      {!loading && !error && items.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Bell className="mx-auto size-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-800">Chưa có thông báo</p><p className="mt-1 text-sm text-slate-500">Thông báo đang hiển thị hoặc phù hợp với gói học của bạn sẽ xuất hiện ở đây.</p></div>}

      <div className="space-y-3">
        {items.map((item) => <article key={item.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${item.isRead ? 'border-slate-200' : 'border-blue-200 ring-1 ring-blue-100'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{typeLabels[item.type]}</span>
            {item.isPinned && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800"><Pin className="size-3" /> Nổi bật</span>}
            {!item.isRead && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">Mới</span>}
            <time className="ml-auto text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900">{item.title}</h2>
          {item.summary && <p className="mt-1 text-sm font-medium text-slate-600">{item.summary}</p>}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.content}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-400">Gửi bởi {item.createdBy}</span>
            <div className="flex items-center gap-2">
              {item.actionUrl && <Link href={item.actionUrl} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Xem thêm <ExternalLink className="size-3.5" /></Link>}
              {!item.isRead && <button type="button" disabled={markingId === item.id} onClick={() => void markRead(item.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Check className="size-3.5" /> Đánh dấu đã đọc</button>}
            </div>
          </div>
        </article>)}
      </div>
    </main>
  );
}
