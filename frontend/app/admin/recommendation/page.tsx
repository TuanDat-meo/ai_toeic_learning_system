"use client";

import React, { useEffect, useState } from "react";
import { AdminPageFrame } from "@/components/admin/AdminPageFrame";
import { fetchAdminListeningAnalytics, type AdminListeningAnalyticsSummary } from "@/lib/api/listening";

export default function BktRecommendationPage() {
  const [summary, setSummary] = useState<AdminListeningAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAdminListeningAnalytics()
      .then((res) => {
        if (active) setSummary(res);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const metrics = summary
    ? [
        { label: "Học viên đang theo dõi BKT", value: String(summary.activeListeningStudents), trend: `${summary.totalAttempts} lượt nộp`, tone: "primary" as const },
        { label: "Đề xuất Lộ trình BKT", value: String(summary.bktRecommendations.length), trend: "Adaptive", tone: "secondary" as const },
        { label: "Tỷ lệ chính xác trung bình", value: `${summary.overallAccuracyPercent}%`, trend: `~${summary.averageEstimatedListeningScore}/495`, tone: "tertiary" as const },
        { label: "Lượt Thi thật (Real Exam)", value: String(summary.realExamAttempts), trend: `${summary.dictationAttempts} chép chính tả`, tone: "neutral" as const },
      ]
    : undefined;

  return (
    <AdminPageFrame
      title="BKT & Đề xuất"
      subtitle="Model Bayesian Knowledge Tracing (BKT), phân tích độ thông thạo từng Part và khuyến nghị lộ trình cá nhân hóa từ kết quả làm bài & thi thật."
      metrics={metrics}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Bayesian Knowledge Tracing (BKT) — Trạng thái Mastery theo Part</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mô hình BKT cập nhật xác suất nắm vững kiến thức $P(L_t)$ sau mỗi câu trả lời đúng/sai ở cả Chế độ Luyện tập, Chép chính tả và Chế độ Thi thật.
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Đang tính toán mô hình BKT từ dữ liệu học viên...</div>
          ) : summary ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <div key={pm.part} className="rounded-2xl border border-slate-200 p-4 bg-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{pm.part}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                        BKT {bkt}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${Math.max(6, bkt)}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span>Mức độ: <strong>{levelLabel}</strong></span>
                      <span>Đúng {pm.correctCount}/{pm.answeredCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[rgba(116,118,132,0.15)] bg-surface-container-lowest p-space-lg shadow-[0_1px_6px_rgba(0,0,0,0.04)] space-y-4">
          <h2 className="text-lg font-semibold text-on-surface">Khuyến nghị điều phối &amp; Lộ trình học tập (Recommendation Engine)</h2>
          {summary && summary.bktRecommendations.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {summary.bktRecommendations.map((rec) => (
                <div key={rec.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-extrabold">
                      {rec.part} • {rec.recommendedMode}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Ưu tiên: {rec.priority}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Chưa có khuyến nghị nào.</p>
          )}
        </div>
      </div>
    </AdminPageFrame>
  );
}
