"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock3,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { getGrammarToday, type GrammarTodayData } from "@/lib/api/grammar";

export function GrammarTodayStrip() {
  const [data, setData] = useState<GrammarTodayData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getGrammarToday()
      .then((live) => {
        if (!active) return;
        setData(live);
        setError(null);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu hôm nay.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (data.newLearner) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Chào mừng bạn bắt đầu học Ngữ pháp TOEIC!</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Hãy chọn chủ điểm đầu tiên hoặc xem bản đồ lộ trình để khởi đầu quá trình chinh phục mục tiêu.
              </p>
            </div>
          </div>
          <Link
            href="/grammar/path"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Khám phá lộ trình
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const hasDue = (data.due.count ?? 0) > 0;
  const hasResume = Boolean(data.resume.topicId);
  const hasSuggestion = Boolean(data.suggestion.topicId && data.suggestion.reason?.trim());

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {hasDue && (
        <div className="flex flex-col justify-between rounded-2xl border border-amber-200/90 bg-linear-to-br from-amber-50/70 to-white p-4 shadow-2xs hover:shadow-xs transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <RotateCcw className="h-4 w-4 text-amber-600" />
                Ôn tập đến hạn
              </span>
              <span className="inline-flex rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                {data.due.count} câu cần ôn
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-600">
              Các câu hỏi đến lịch ôn tập lặp lại ngắt quãng (SRS) để chống quên.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-100">
            <Link
              href="/grammar/review"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
            >
              Ôn ngay
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {hasResume && (
        <div className="flex flex-col justify-between rounded-2xl border border-blue-200/90 bg-linear-to-br from-blue-50/70 to-white p-4 shadow-2xs hover:shadow-xs transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <Clock3 className="h-4 w-4 text-blue-600" />
                Tiếp tục bài học
              </span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700">
                Đang học
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-800">
              {data.resume.title}
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-blue-100">
            <Link
              href={`/grammar?highlight=${encodeURIComponent(data.resume.topicId || "")}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition"
            >
              Học tiếp chuyên đề
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {hasSuggestion && (
        <div className="flex flex-col justify-between rounded-2xl border border-violet-200/90 bg-linear-to-br from-violet-50/70 to-white p-4 shadow-2xs hover:shadow-xs transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Gợi ý hôm nay
              </span>
              <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-extrabold text-violet-700">
                Khuyên học
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-600">
              {data.suggestion.reason}
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-violet-100">
            <Link
              href="/grammar/path"
              className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-800 transition"
            >
              Xem bản đồ lộ trình
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
