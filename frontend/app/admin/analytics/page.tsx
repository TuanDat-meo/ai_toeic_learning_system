"use client";

import React, { useEffect, useState } from "react";
import { AdminPageFrame } from "@/components/admin/AdminPageFrame";
import { fetchAdminListeningAnalytics, type AdminListeningAnalyticsSummary } from "@/lib/api/listening";

export default function LearningAnalysisPage() {
  const [summary, setSummary] = useState<AdminListeningAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAdminListeningAnalytics()
      .then((res) => {
        if (active) {
          setSummary(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Không thể tải số liệu phân tích.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const metrics = summary
    ? [
        { label: "Học viên hoạt động", value: String(summary.activeListeningStudents), trend: `${summary.totalAttempts} lượt`, tone: "primary" as const },
        { label: "Lượt Thi thật (Real Exam)", value: String(summary.realExamAttempts), trend: `${summary.dictationAttempts} chép chính tả`, tone: "secondary" as const },
        { label: "Độ chính xác toàn hệ thống", value: `${summary.overallAccuracyPercent}%`, trend: `${summary.totalQuestionsAnswered} câu`, tone: "tertiary" as const },
        { label: "Điểm LC ước tính TB", value: `${summary.averageEstimatedListeningScore}/495`, trend: "Chuẩn ETS", tone: "neutral" as const },
      ]
    : undefined;

  return (
    <AdminPageFrame
      title="Phân tích & Tiến độ học tập"
      subtitle="Số liệu phân tích tiến độ, kết quả Chế độ Thi thật và độ thông thạo theo từng Part từ PostgreSQL."
      metrics={metrics}
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Phân tích Độ chính xác &amp; BKT Mastery theo từng Part</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng hợp trực tiếp từ bảng <code>user_listening_attempts</code>, <code>user_listening_progress</code> và <code>user_listening_unit_progress</code>.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu phân tích từ máy chủ...</div>
          ) : summary ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summary.partBreakdown.map((pm) => {
                const bkt = Math.round(pm.bktMasteryProbability);
                const levelLabel =
                  pm.proficiencyLevel === "MASTERED"
                    ? "Thành thạo"
                    : pm.proficiencyLevel === "DEVELOPING"
                    ? "Đang phát triển"
                    : pm.proficiencyLevel === "WEAK"
                    ? "Cần cải thiện"
                    : "Chưa bắt đầu";
                return (
                  <div key={pm.part} className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">{pm.part}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                        {levelLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-slate-500">Chính xác</div>
                        <div className="text-base font-black text-emerald-700 mt-0.5">{pm.accuracyPercent}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-slate-500">BKT Mastery</div>
                        <div className="text-base font-black text-blue-700 mt-0.5">{bkt}%</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                      <span>Đã trả lời: <strong>{pm.answeredCount}</strong></span>
                      <span className="text-emerald-700">Đúng: <strong>{pm.correctCount}</strong></span>
                      <span className="text-rose-600">Sai: <strong>{pm.wrongCount}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </AdminPageFrame>
  );
}
