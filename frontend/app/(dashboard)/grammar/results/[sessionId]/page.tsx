"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Milestone,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { GrammarSubpageShell } from "@/components/grammar/GrammarSubpageShell";
import { getGrammarExam, type GrammarExamSession } from "@/lib/api/grammar";

export default function GrammarResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = React.use(params);
  const [session, setSession] = useState<GrammarExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSession(await getGrammarExam(sessionId));
    } catch (cause) {
      setSession(null);
      setError(cause instanceof Error ? cause.message : "Không thể tải kết quả phiên thi.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    let active = true;
    void getGrammarExam(sessionId)
      .then((result) => {
        if (!active) return;
        setSession(result);
        setError(null);
      })
      .catch((cause) => {
        if (!active) return;
        setSession(null);
        setError(cause instanceof Error ? cause.message : "Không thể tải kết quả phiên thi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  const isSubmitted = session?.status === "SUBMITTED";
  const title = loading
    ? "Đang tải kết quả phiên học"
    : isSubmitted
      ? "Kết quả phiên thi ngữ pháp"
      : "Trạng thái phiên thi ngữ pháp";

  return (
    <GrammarSubpageShell
      title={title}
      description="Thông tin dưới đây được tải từ phiên thi đã lưu trong tài khoản của bạn."
      icon={<Trophy className="h-6 w-6" />}
    >
      {loading ? (
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
      ) : error ? (
        <div
          role="alert"
          className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
        >
          <p>Không tải được kết quả phiên thi: {error}</p>
          <button type="button" onClick={() => void loadSession()} className="mt-3 font-bold underline">
            Thử lại
          </button>
        </div>
      ) : session ? (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isSubmitted
                ? "bg-emerald-100 text-emerald-700"
                : session.status === "EXPIRED"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
            }`}>
              {isSubmitted ? (
                <CheckCircle2 className="h-9 w-9" />
              ) : session.status === "EXPIRED" ? (
                <AlertTriangle className="h-9 w-9" />
              ) : (
                <Clock3 className="h-9 w-9" />
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isSubmitted
                ? "Phiên thi đã hoàn thành"
                : session.status === "EXPIRED"
                  ? "Phiên thi đã hết hạn"
                  : "Phiên thi chưa hoàn thành"}
            </h2>
            {session.score !== null && session.score !== undefined && (
              <p className="mt-3 text-sm text-slate-700">
                Điểm được lưu: <strong>{session.score}</strong>
              </p>
            )}
            <dl className="mx-auto mt-5 grid max-w-md gap-2 text-left text-xs sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Mã phiên thi</dt>
                <dd className="mt-1 break-all font-mono font-semibold text-slate-800">{session.id}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Chủ điểm</dt>
                <dd className="mt-1 break-all font-semibold text-slate-800">{session.topicId}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Bắt đầu</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {new Date(session.startedAt).toLocaleString("vi-VN")}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Trạng thái</dt>
                <dd className="mt-1 font-semibold text-slate-800">{session.status}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Hành động tiếp theo</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link
                href="/grammar/mistakes"
                className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800 hover:bg-rose-100"
              >
                <RotateCcw className="h-4 w-4" />
                Xem câu sai
              </Link>
              <Link
                href="/grammar/path"
                className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs font-bold text-violet-800 hover:bg-violet-100"
              >
                <Milestone className="h-4 w-4" />
                Xem lộ trình
              </Link>
              <Link
                href="/grammar"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                <BookOpen className="h-4 w-4" />
                Chọn chủ điểm
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </GrammarSubpageShell>
  );
}
