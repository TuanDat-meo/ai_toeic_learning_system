"use client";

import { useState } from "react";
import { Flag, LoaderCircle, Send, X } from "lucide-react";
import { createSupportReport, type SupportReportCategory } from "@/lib/api/support";

type Props = {
  source: "READING" | "LISTENING" | "MOCK_TEST" | "QUESTION_BANK";
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

  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 text-xs font-semibold transition cursor-pointer">
      <Flag className="w-3.5 h-3.5 text-rose-500" /><span>{compact ? "Báo lỗi" : "Báo lỗi câu hỏi"}</span>
    </button>
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
