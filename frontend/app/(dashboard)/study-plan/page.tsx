"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  Target,
  BookOpen,
  BrainCircuit,
  Headphones,
  BookMarked,
  FileText,
  ChevronDown,
  ChevronUp,
  Save,
  Info,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  getStudyPlan,
  generateStudyPlan,
  updateStudyPlan,
  type StudyPlanResponse,
  type WeeklyTarget,
  type UpdateStudyPlanRequest,
} from "@/lib/api/study-plan";

// ─── helpers ───────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
  MOCK_TEST: {
    label: "Từ bài thi thử",
    color: "bg-emerald-100 text-emerald-700",
  },
  SELF_REPORTED: {
    label: "Tự khai báo",
    color: "bg-amber-100 text-amber-700",
  },
  DIAGNOSTIC_TEST: {
    label: "Bài kiểm tra chẩn đoán",
    color: "bg-blue-100 text-blue-700",
  },
  SYSTEM_ESTIMATED: {
    label: "Hệ thống ước tính",
    color: "bg-slate-100 text-slate-500",
  },
};

const FOCUS_LABEL: Record<
  WeeklyTarget["focusSkill"],
  { label: string; icon: React.ElementType; color: string }
> = {
  VOCABULARY: { label: "Từ vựng", icon: BookOpen, color: "text-blue-600" },
  GRAMMAR: { label: "Ngữ pháp", icon: BrainCircuit, color: "text-amber-600" },
  LISTENING: { label: "Nghe", icon: Headphones, color: "text-purple-600" },
  READING: { label: "Đọc", icon: BookMarked, color: "text-teal-600" },
  MOCK_TEST: { label: "Thi thử", icon: FileText, color: "text-rose-600" },
  GENERAL_REVIEW: { label: "Ôn tổng hợp", icon: RefreshCw, color: "text-slate-600" },
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [showWeekly, setShowWeekly] = useState(false);

  // Form state cho chỉnh sửa thủ công
  const [form, setForm] = useState<UpdateStudyPlanRequest>({});

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudyPlan();
      setPlan(data);
      setForm({
        newWordsPerDay: data.recommendedNewWords,
        reviewPerDay: data.recommendedReview,
        grammarPerDay: data.recommendedGrammar,
        listeningMinutes: data.recommendedListeningMinutes,
        readingMinutes: data.recommendedReadingMinutes,
        mockTestsPerWeek: data.recommendedMockTestsPerWeek,
      });
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("404")
          ? "Bạn chưa có lộ trình học tập. Hãy hoàn thành khảo sát mục tiêu trước."
          : (err instanceof Error ? err.message : "Không thể tải lộ trình học tập.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setSaveFeedback(null);
      const refreshed = await generateStudyPlan();
      setPlan(refreshed);
      setForm({
        newWordsPerDay: refreshed.recommendedNewWords,
        reviewPerDay: refreshed.recommendedReview,
        grammarPerDay: refreshed.recommendedGrammar,
        listeningMinutes: refreshed.recommendedListeningMinutes,
        readingMinutes: refreshed.recommendedReadingMinutes,
        mockTestsPerWeek: refreshed.recommendedMockTestsPerWeek,
      });
      setSaveFeedback("Đã tính toán lại lộ trình thành công.");
    } catch (err) {
      setSaveFeedback(
        err instanceof Error ? err.message : "Không thể cập nhật lộ trình."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveFeedback(null);
      const updated = await updateStudyPlan(form);
      setPlan(updated);
      setSaveFeedback("Đã lưu điều chỉnh lộ trình.");
    } catch (err) {
      setSaveFeedback(
        err instanceof Error ? err.message : "Không thể lưu thay đổi."
      );
    } finally {
      setSaving(false);
    }
  };

  const sourceInfo = plan?.baselineSource
    ? SOURCE_LABEL[plan.baselineSource]
    : null;

  // ── render: loading / error ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded-xl bg-slate-200" />
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1">Chưa có lộ trình học tập</p>
            <p>{error}</p>
            <Link
              href="/onboarding"
              className="mt-3 inline-block rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              Hoàn thành khảo sát mục tiêu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Lộ Trình Học Tập Cá Nhân Hóa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật lần cuối:{" "}
              {plan.updatedAt
                ? new Date(plan.updatedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition shadow-xs disabled:opacity-60 disabled:cursor-wait"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Đang tính toán..." : "Tính lại lộ trình"}
        </button>
      </div>

      {/* Feedback message */}
      {saveFeedback && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm flex items-center gap-2 ${
            saveFeedback.includes("thành công") || saveFeedback.includes("Đã lưu")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {saveFeedback}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <Target className="mx-auto w-5 h-5 text-indigo-500 mb-1" />
          <div className="text-2xl font-black text-slate-900 font-mono">
            {plan.targetScore}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Điểm mục tiêu</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <TrendingUp className="mx-auto w-5 h-5 text-emerald-500 mb-1" />
          <div className="text-2xl font-black text-slate-900 font-mono">
            {plan.baselineScore ?? "—"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Điểm xuất phát
            {sourceInfo && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${sourceInfo.color}`}
              >
                {sourceInfo.label}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <CalendarDays className="mx-auto w-5 h-5 text-blue-500 mb-1" />
          <div className="text-2xl font-black text-slate-900 font-mono">
            {plan.daysRemaining ?? "∞"}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ngày còn lại</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <BookOpen className="mx-auto w-5 h-5 text-amber-500 mb-1" />
          <div className="text-2xl font-black text-slate-900 font-mono">
            {plan.dailyStudyMinutes}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Phút/ngày học</div>
        </div>
      </div>

      {/* Plan explanation */}
      {plan.planExplanation && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-slate-700 leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-indigo-900">
              Căn cứ tính toán:{" "}
            </strong>
            {plan.planExplanation}
          </div>
        </div>
      )}

      {/* Focus areas */}
      {plan.focusAreas && plan.focusAreas.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-3">
            Kỹ năng ưu tiên
          </h2>
          <div className="flex flex-wrap gap-2">
            {plan.focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Adjustable daily/weekly targets */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-500" />
          Điều chỉnh chỉ tiêu hàng ngày
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Từ mới */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-blue-700">
              Từ mới / ngày
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.newWordsPerDay ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  newWordsPerDay: Number(e.target.value),
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          {/* Ôn tập SRS */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-emerald-700">
              Ôn tập SRS / ngày
            </span>
            <input
              type="number"
              min={0}
              max={200}
              value={form.reviewPerDay ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  reviewPerDay: Number(e.target.value),
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          {/* Ngữ pháp */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-amber-700">
              Ngữ pháp / ngày
            </span>
            <input
              type="number"
              min={0}
              max={50}
              value={form.grammarPerDay ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  grammarPerDay: Number(e.target.value),
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          {/* Nghe */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-purple-700">
              Nghe (phút / ngày)
            </span>
            <input
              type="number"
              min={0}
              max={120}
              value={form.listeningMinutes ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  listeningMinutes: Number(e.target.value),
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          {/* Đọc */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-teal-700">
              Đọc (phút / ngày)
            </span>
            <input
              type="number"
              min={0}
              max={120}
              value={form.readingMinutes ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  readingMinutes: Number(e.target.value),
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>

          {/* Thi thử */}
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-rose-700">
              Thi thử / tuần
            </span>
            <input
              type="number"
              min={0}
              max={7}
              value={form.mockTestsPerWeek ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  mockTestsPerWeek: Number(e.target.value),
                }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-xs disabled:opacity-60 disabled:cursor-wait"
        >
          <Save className="w-4 h-4" />
          {saving ? "Đang lưu..." : "Lưu điều chỉnh"}
        </button>
      </div>

      {/* Weekly targets accordion */}
      {plan.weeklyTargets && plan.weeklyTargets.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowWeekly((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Kế hoạch chi tiết theo tuần ({plan.weeklyTargets.length} tuần)
            </span>
            {showWeekly ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showWeekly && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {plan.weeklyTargets.map((wt) => {
                const focus = FOCUS_LABEL[wt.focusSkill] ?? {
                  label: wt.focusSkill,
                  icon: BookOpen,
                  color: "text-slate-600",
                };
                const FocusIcon = focus.icon;
                const pct =
                  wt.targetItems > 0
                    ? Math.round((wt.completedItems / wt.targetItems) * 100)
                    : 0;

                return (
                  <div key={wt.weekNumber} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 w-14">
                          Tuần {wt.weekNumber}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-semibold ${focus.color}`}
                        >
                          <FocusIcon className="w-3.5 h-3.5" />
                          {focus.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {wt.completedItems}/{wt.targetItems}
                        {" "}
                        <span className="text-slate-300">({pct}%)</span>
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                    {wt.notes && (
                      <p className="mt-1.5 text-[11px] text-slate-400 italic">
                        {wt.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
