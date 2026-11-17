"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, XCircle } from "lucide-react";
import Link from "next/link";
import {
  getVocabularyHistory,
  type VocabularyActivityType,
  type VocabularyHistoryItem,
} from "@/lib/api/vocabulary";

const activities: Array<{ value: VocabularyActivityType | ""; label: string }> = [
  { value: "", label: "Tất cả hoạt động" },
  { value: "LEARN", label: "Học từ mới" },
  { value: "FLASHCARD", label: "Flashcard" },
  { value: "PRACTICE", label: "Luyện tập" },
  { value: "REVIEW", label: "Ôn tập" },
  { value: "GAME", label: "Trò chơi" },
];

export default function VocabularyHistoryPage() {
  const [activity, setActivity] = useState<VocabularyActivityType | "">("");
  const [history, setHistory] = useState<VocabularyHistoryItem[]>([]);
  const [loadedActivity, setLoadedActivity] = useState<VocabularyActivityType | "" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = loadedActivity !== activity;

  useEffect(() => {
    let active = true;
    void getVocabularyHistory({ limit: 100, activity: activity || undefined })
      .then((items) => {
        if (active) {
          setHistory(items);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải lịch sử học.");
      })
      .finally(() => {
        if (active) setLoadedActivity(activity);
      });
    return () => {
      active = false;
    };
  }, [activity]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/vocabulary" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900">
            <ArrowLeft className="h-4 w-4" /> Kho từ vựng
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Lịch sử học từ vựng</h1>
          <p className="mt-1 text-sm text-slate-500">Các câu trả lời và đánh giá SRS đã được lưu vào tài khoản của bạn.</p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Lọc hoạt động
          <select
            value={activity}
            onChange={(event) => setActivity(activities.find((item) => item.value === event.target.value)?.value ?? "")}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 sm:min-w-48"
          >
            {activities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </header>

      {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <div className="space-y-3" aria-label="Đang tải lịch sử">
          {[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : null}
      {!loading && !error && history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-800">Chưa có hoạt động học nào được ghi nhận.</p>
          <p className="mt-1 text-sm text-slate-500">Hãy học hoặc ôn từ vựng để lịch sử xuất hiện tại đây.</p>
        </div>
      ) : null}
      {!loading && !error && history.length > 0 ? (
        <ol className="space-y-3">
          {history.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{item.word}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.setTitle} · {item.activityType} · {item.questionType}</p>
                  <p className="mt-3 text-sm text-slate-700">Câu trả lời: <span className="font-medium">{item.studentAnswer || "—"}</span></p>
                  <p className="mt-1 text-sm text-slate-600">Đáp án: {item.correctAnswer}{item.rating ? ` · Đánh giá ${item.rating}` : ""}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                  <span className={`inline-flex items-center gap-1 font-semibold ${item.correct ? "text-emerald-700" : "text-rose-700"}`}>
                    {item.rating ? (
                      <>{item.rating === "AGAIN" ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}Đánh giá {item.rating}</>
                    ) : (
                      <>{item.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{item.correct ? "Đúng" : "Cần ôn"}</>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{Math.ceil(item.responseTimeMs / 1000)} giây</span>
                  <time dateTime={item.attemptedAt}>{new Date(item.attemptedAt).toLocaleString("vi-VN")}</time>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </main>
  );
}
