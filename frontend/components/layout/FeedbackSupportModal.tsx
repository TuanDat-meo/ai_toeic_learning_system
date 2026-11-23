'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  createSupportReport,
  deleteSupportReport,
  getMySupportReports,
  type SupportReport,
  type SupportReportCategory,
} from '@/lib/api/support';

export const OPEN_FEEDBACK_MODAL_EVENT = 'toeic:open-feedback';

type FeedbackMode = 'feature' | 'feedback';
type ModalTab = 'compose' | 'history';

const CATEGORY_OPTIONS: Array<{ value: SupportReportCategory; label: string }> = [
  { value: 'UI_FEEDBACK', label: 'Góp ý giao diện & trải nghiệm' },
  { value: 'SYSTEM_BUG', label: 'Báo lỗi hệ thống / tính năng' },
  { value: 'QUESTION_ERROR', label: 'Lỗi câu hỏi / đáp án' },
  { value: 'ACCOUNT_ISSUE', label: 'Vấn đề tài khoản / gói học' },
  { value: 'OTHER', label: 'Phản hồi khác' },
];

const STATUS_META: Record<
  SupportReport['status'],
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  RESOLVED: {
    label: 'Đã giải quyết',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Từ chối',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FeedbackSupportModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<FeedbackMode>('feedback');
  const [activeTab, setActiveTab] = useState<ModalTab>('compose');
  const [supportEmail, setSupportEmail] = useState('support@example.com');

  const [category, setCategory] = useState<SupportReportCategory>('UI_FEEDBACK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportReport | null>(null);

  const [history, setHistory] = useState<SupportReport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedBranding = localStorage.getItem('toeic_system_branding');
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding);
        if (parsed?.supportEmail) setSupportEmail(parsed.supportEmail);
      }
    } catch {
      // Ignore storage read error
    }

    const handleBrandingChange = (event: Event) => {
      const custom = event as CustomEvent<{ supportEmail?: string }>;
      if (custom.detail?.supportEmail) {
        setSupportEmail(custom.detail.supportEmail);
      }
    };
    window.addEventListener('toeic:system-settings-changed', handleBrandingChange);
    return () => window.removeEventListener('toeic:system-settings-changed', handleBrandingChange);
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await getMySupportReports();
      setHistory(list);
    } catch {
      // Keep quiet if user is not logged in or network hiccups
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const custom = event as CustomEvent<{ mode?: FeedbackMode }>;
      const nextMode: FeedbackMode = custom.detail?.mode === 'feature' ? 'feature' : 'feedback';
      setMode(nextMode);
      setCategory('UI_FEEDBACK');
      setActiveTab('compose');
      setError('');
      setSubmittedTicket(null);
      setTitle('');
      setDescription('');
      setOpen(true);
      void loadHistory();
    };

    window.addEventListener(OPEN_FEEDBACK_MODAL_EVENT, handleOpen);
    const handleReportsUpdated = () => void loadHistory();
    window.addEventListener('support-reports-updated', handleReportsUpdated);
    return () => {
      window.removeEventListener(OPEN_FEEDBACK_MODAL_EVENT, handleOpen);
      window.removeEventListener('support-reports-updated', handleReportsUpdated);
    };
  }, [loadHistory]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (cleanTitle.length < 4) {
      setError('Vui lòng nhập tiêu đề tối thiểu 4 ký tự.');
      return;
    }
    if (cleanDesc.length < 10) {
      setError('Vui lòng mô tả chi tiết hơn (tối thiểu 10 ký tự) để đội ngũ dễ hỗ trợ.');
      return;
    }

    setSubmitting(true);
    setError('');

    const finalTitle =
      mode === 'feature' && !cleanTitle.toLowerCase().startsWith('[đề xuất')
        ? `[Đề xuất tính năng] ${cleanTitle}`
        : cleanTitle;

    try {
      const created = await createSupportReport({
        category: mode === 'feature' ? 'UI_FEEDBACK' : category,
        title: finalTitle,
        description: cleanDesc,
        source: 'OTHER',
        relatedContent: `Trang hiện tại: ${pathname || '/dashboard'}`,
      });
      setSubmittedTicket(created);
      setTitle('');
      setDescription('');
      setHistory((prev) => [created, ...prev]);
      window.dispatchEvent(new Event('support-reports-updated'));
      window.dispatchEvent(new Event('notification-updated'));
      window.dispatchEvent(new Event('support-report-created'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi phản hồi lúc này. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSupportReport(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      window.dispatchEvent(new Event('support-reports-updated'));
      window.dispatchEvent(new Event('notification-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa phiếu phản hồi này.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  const isFeature = mode === 'feature';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isFeature ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-950/80 text-[#1b41ae] dark:text-blue-400'
              }`}
            >
              {isFeature ? (
                <Lightbulb className="h-5 w-5" />
              ) : (
                <MessageSquareText className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFeature ? 'Đề xuất tính năng mới' : 'Gửi phản hồi & Báo lỗi'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gửi trực tiếp đến Admin hoặc email:{' '}
                <a href={`mailto:${supportEmail}`} className="font-semibold text-[#1b41ae] dark:text-blue-400 hover:underline">
                  {supportEmail}
                </a>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`border-b-2 px-3 pb-2.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'compose'
                ? 'border-[#1b41ae] dark:border-blue-400 text-[#1b41ae] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isFeature ? 'Viết đề xuất' : 'Gửi phản hồi mới'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              void loadHistory();
            }}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#1b41ae] dark:border-blue-400 text-[#1b41ae] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Lịch sử đã gửi</span>
            {history.length > 0 && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'compose' ? (
            submittedTicket ? (
              <div className="space-y-4 py-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Đã gửi thành công!</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Mã phiếu của bạn là{' '}
                    <strong className="font-semibold text-slate-800">
                      {submittedTicket.ticketCode || submittedTicket.id.slice(0, 8)}
                    </strong>
                    . Quản trị viên sẽ xem xét và phản hồi trực tiếp trong mục Lịch sử đã gửi.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setActiveTab('history');
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Xem lịch sử đã gửi
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="rounded-xl bg-[#1b41ae] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] cursor-pointer"
                  >
                    Gửi thêm góp ý khác
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isFeature && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Danh mục phản hồi
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SupportReportCategory)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 focus:border-[#1b41ae] focus:outline-none"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isFeature ? 'Tên tính năng bạn muốn đề xuất' : 'Tiêu đề ngắn gọn'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      isFeature
                        ? 'Ví dụ: Thêm chế độ luyện nghe tốc độ 1.25x cho Part 3 & 4'
                        : 'Ví dụ: Góp ý về cách hiển thị giải thích câu hỏi Part 6'
                    }
                    maxLength={140}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#1b41ae] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isFeature ? 'Mô tả chi tiết lợi ích & cách hoạt động mong muốn' : 'Nội dung chi tiết'}
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      isFeature
                        ? 'Mô tả rõ tính năng này giúp ích gì khi bạn ôn thi TOEIC...'
                        : 'Mô tả vấn đề hoặc góp ý cụ thể để chúng tôi cải thiện nhanh nhất...'
                    }
                    maxLength={1200}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#1b41ae] focus:outline-none"
                    required
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Đính kèm ngữ cảnh: {pathname || '/dashboard'}</span>
                    <span className="tabular-nums">{description.length}/1200</span>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2 text-xs font-medium text-rose-700 dark:text-rose-300"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      window.dispatchEvent(new CustomEvent('toeic:open-chat', { detail: { tab: 'support' } }));
                    }}
                    className="text-[11px] font-semibold text-[#1b41ae] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Cần hỗ trợ nhanh? Nhắn tin 1-1 với Admin
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>{isFeature ? 'Gửi đề xuất' : 'Gửi phản hồi'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-3">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1b41ae]" />
                  <span>Đang tải lịch sử phản hồi...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 py-8 text-center">
                  <Clock className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Bạn chưa gửi phản hồi hoặc đề xuất nào
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Các phiếu bạn gửi sẽ hiển thị tại đây cùng phản hồi từ quản trị viên.
                  </p>
                </div>
              ) : (
                history.map((item) => {
                  const statusInfo = STATUS_META[item.status] || STATUS_META.PENDING;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/60 p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                              #{item.ticketCode || item.id.slice(0, 8)}
                            </span>
                            <span
                              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${statusInfo.badgeClass}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                        </div>
                        {item.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 disabled:opacity-50 cursor-pointer"
                            title="Thu hồi phiếu này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>

                      {item.adminReply && (
                        <div className="rounded-lg border border-blue-200/70 dark:border-blue-800/70 bg-blue-50/60 dark:bg-blue-950/40 px-3 py-2 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#1b41ae] dark:text-blue-400">
                            Phản hồi từ Quản trị viên
                          </span>
                          <p className="mt-0.5 whitespace-pre-line text-slate-800 dark:text-slate-100">{item.adminReply}</p>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Gửi lúc {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
