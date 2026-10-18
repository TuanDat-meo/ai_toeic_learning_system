"use client";

import { useState } from "react";
import { Flag, LoaderCircle, Send, X } from "lucide-react";
import { createSupportReport, type SupportReportCategory } from "@/lib/api/support";
import { createCommunityPost } from '@/lib/api/community';

type Props = {
  source: "READING" | "LISTENING" | "MOCK_TEST" | "QUESTION_BANK" | "OTHER";
  questionRef: string;
  relatedContent: string;
  questionSnapshot: Record<string, unknown>;
  onSubmitted?: (ticketCode: string) => void;
  compact?: boolean;
};

export function QuestionErrorReportButton({ source, questionRef, relatedContent, questionSnapshot, onSubmitted, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<SupportReportCategory>("QUESTION_ERROR");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [communityOpen, setCommunityOpen] = useState(false);
  const [communityTitle, setCommunityTitle] = useState('');
  const [communityDetails, setCommunityDetails] = useState('');
  const [communityBusy, setCommunityBusy] = useState(false);
  const [createdCommunityPostUrl, setCreatedCommunityPostUrl] = useState('');

  async function submit() {
    if (details.trim().length < 5) {
      setError("Vui lòng mô tả lỗi ít nhất 5 ký tự.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const report = await createSupportReport({
        category,
        title: (category === "QUESTION_ERROR" ? `Báo lỗi câu hỏi: ${relatedContent}` : `Phản hồi: ${relatedContent}`).slice(0, 200),
        description: details.trim(),
        source,
        questionRef,
        questionSnapshot,
        relatedContent,
      });
      setDetails("");
      setOpen(false);
      onSubmitted?.(report.ticketCode);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gửi được báo cáo. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  async function askCommunity() {
    if (communityTitle.trim().length < 3) {
      setError('Tiêu đề cần có ít nhất 3 ký tự.');
      return;
    }
    if (communityDetails.trim().length < 5) {
      setError('Hãy mô tả điều bạn muốn hỏi (ít nhất 5 ký tự).');
      return;
    }
    setCommunityBusy(true);
    setError('');
    try {
      const rawAudioUrl = questionSnapshot.audioUrl;
      let communityAudioUrl = rawAudioUrl;
      if (typeof rawAudioUrl === 'string' && rawAudioUrl.trim()) {
        try {
          // Store the URL the browser resolves on this practice page. Relative media
          // URLs otherwise resolve against /community and can point at another file.
          communityAudioUrl = new URL(rawAudioUrl, document.baseURI).href;
        } catch {
          communityAudioUrl = rawAudioUrl.trim();
        }
      }
      const post = await createCommunityPost({
        title: communityTitle.trim().slice(0, 180),
        content: communityDetails.trim(),
        postType: 'QUESTION',
        questionSnapshot: { ...questionSnapshot, audioUrl: communityAudioUrl, source, questionRef },
      });
      setCommunityTitle('');
      setCommunityDetails('');
      setCommunityOpen(false);
      setCreatedCommunityPostUrl(`/community?post=${post.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể gửi câu hỏi đến cộng đồng.');
    } finally {
      setCommunityBusy(false);
    }
  }

  return <>
    <button type="button" onClick={() => { setError(''); setCommunityOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold transition cursor-pointer">
      <Send className="w-3.5 h-3.5" /><span>Hỏi cộng đồng</span>
    </button>
    {createdCommunityPostUrl && <a href={createdCommunityPostUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold transition hover:bg-emerald-100">Đã đăng câu hỏi · Xem bài viết ↗</a>}
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 text-xs font-semibold transition cursor-pointer">
      <Flag className="w-3.5 h-3.5 text-rose-500" /><span>{compact ? "Báo lỗi" : "Báo lỗi câu hỏi"}</span>
    </button>
    {communityOpen && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="ask-community-title">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-3"><div><h2 id="ask-community-title" className="font-bold text-slate-900">Hỏi cộng đồng</h2><p className="mt-1 text-xs text-slate-500">Câu hỏi, lựa chọn và đáp án tham khảo sẽ được đính kèm bài viết.</p></div><button type="button" onClick={() => setCommunityOpen(false)} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="mb-4 max-h-32 overflow-auto rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700"><span className="mb-1 block font-semibold text-slate-500">Câu hỏi được đính kèm</span>{String(questionSnapshot.questionText ?? questionSnapshot.question ?? relatedContent)}</div>
        <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="community-question-title">Tiêu đề thảo luận</label>
        <input id="community-question-title" required minLength={3} maxLength={180} value={communityTitle} onChange={(event) => setCommunityTitle(event.target.value)} placeholder="Ví dụ: Câu này sao nhỉ, em chưa hiểu" className="mb-4 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="community-question-details">Bạn đang vướng ở đâu?</label>
        <textarea id="community-question-details" rows={4} maxLength={10000} value={communityDetails} onChange={(event) => setCommunityDetails(event.target.value)} placeholder="Ví dụ: Vì sao đáp án B đúng mà đáp án C không phù hợp?" className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm" />
        {error && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{error}</p>}
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setCommunityOpen(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Hủy</button><button type="button" disabled={communityBusy} onClick={() => void askCommunity()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{communityBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Đăng câu hỏi</button></div>
      </div>
    </div>}
    {open && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="report-question-title">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-3">
          <div><h2 id="report-question-title" className="font-bold text-slate-900">Báo lỗi câu hỏi</h2><p className="mt-1 text-xs text-slate-500">{relatedContent}</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="report-category">Loại phản hồi</label>
        <select id="report-category" value={category} onChange={(event) => setCategory(event.target.value as SupportReportCategory)} className="mb-4 w-full rounded-xl border border-slate-200 p-3 text-sm">
          <option value="QUESTION_ERROR">Lỗi câu hỏi / đáp án</option><option value="SYSTEM_BUG">Lỗi hệ thống / âm thanh</option><option value="UI_FEEDBACK">Góp ý giao diện</option><option value="OTHER">Khác</option>
        </select>
        <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="report-details">Mô tả chi tiết</label>
        <textarea id="report-details" rows={5} value={details} onChange={(event) => setDetails(event.target.value)} maxLength={5000} placeholder="Nêu câu/đáp án có vấn đề và lý do bạn cho là sai..." className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm" />
        {error && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{error}</p>}
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Hủy</button><button type="button" disabled={busy} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Gửi báo cáo</button></div>
      </div>
    </div>}
  </>;
}
