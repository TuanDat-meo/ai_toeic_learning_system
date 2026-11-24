"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BookOpen, Target, BrainCircuit, CalendarClock, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { VocabularyTestSet, WordItem } from "@/app/admin/content/vocabulary/types";
import { getDueVocabularyWords, getStudentVocabularyDashboard, getStudentVocabularyGoals, getVocabularyDailyStats, getVocabularySets, getWeakVocabularyWords, updateStudentVocabularyGoals, type StudentVocabularyDashboard, type StudentVocabularyGoal, type VocabularyDailyStat, type WeakVocabularyWord } from "@/lib/api/vocabulary";
import { updateStudyPlan } from "@/lib/api/study-plan";
import { StudentVocabularyGrid } from "@/components/vocabulary/StudentVocabularyGrid";
import { StudentVocabularyModals } from "@/components/vocabulary/StudentVocabularyModals";
import { LearningQuotaBadge } from "@/components/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { getItemProgress } from "@/lib/practiceProgress";
import { subscribeToVocabularyContentChanges } from "@/lib/vocabulary-content-sync";

export default function StudentVocabularyPage() {
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>([]);
  const [dashboard, setDashboard] = useState<StudentVocabularyDashboard | null>(null);
  const [dailyGoal, setDailyGoal] = useState<StudentVocabularyGoal | null>(null);
  const [weakWords, setWeakWords] = useState<WeakVocabularyWord[]>([]);
  const [dueWords, setDueWords] = useState<WordItem[]>([]);
  const [weakWordsExpanded, setWeakWordsExpanded] = useState(false);
  const [dueWordsExpanded, setDueWordsExpanded] = useState(false);
  const weakWordsListRef = useRef<HTMLUListElement>(null);
  const dueWordsListRef = useRef<HTMLUListElement>(null);
  const weakWordsScrollTop = useRef(0);
  const dueWordsScrollTop = useRef(0);
  const [dailyStats, setDailyStats] = useState<VocabularyDailyStat[]>([]);
  const [goalForm, setGoalForm] = useState({ newWordsGoal: 10, reviewGoal: 20 });
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal State
  const [wordListModalTest, setWordListModalTest] = useState<VocabularyTestSet | null>(null);
  const [flashcardModalTest, setFlashcardModalTest] = useState<VocabularyTestSet | null>(null);
  const [flashcardStartIndex, setFlashcardStartIndex] = useState<number>(0);
  const [gameModalTest, setGameModalTest] = useState<VocabularyTestSet | null>(null);

  async function startVocabularyActivity(featureKey: string, open: () => void) {
    setQuotaMessage(null);
    try {
      await consumeLearningFeature(featureKey);
    } catch (error) {
      setQuotaMessage(error instanceof Error ? error.message : "Không thể xác minh quyền truy cập học tập.");
      return;
    }
    open();
  }

  const loadSets = useCallback(async () => {
    try {
      const [setList, dashboardStats, goals, weakWordList, dueWordList, recentStats] = await Promise.all([
        getVocabularySets(),
        getStudentVocabularyDashboard(),
        getStudentVocabularyGoals(),
        getWeakVocabularyWords(500),
        getDueVocabularyWords(undefined, 500),
        getVocabularyDailyStats(),
      ]);
      setLoadError(null);
      setTests(setList);
      setDashboard(dashboardStats);
      setDailyGoal(goals);
      setWeakWords(weakWordList);
      setDueWords(dueWordList);
      setDailyStats(recentStats);
      setGoalForm({ newWordsGoal: goals.newWordsGoal, reviewGoal: goals.reviewGoal });
    } catch (err) {
      setTests([]);
      setDashboard(null);
      setDailyGoal(null);
      setWeakWords([]);
      setDueWords([]);
      setDailyStats([]);
      setLoadError(err instanceof Error ? err.message : "Không thể tải bộ từ vựng từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSets();
    const unsubscribe = subscribeToVocabularyContentChanges(() => {
      void loadSets();
    });
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadSets();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadSets]);

  useEffect(() => {
    if (weakWordsExpanded && weakWordsListRef.current) {
      weakWordsListRef.current.scrollTop = weakWordsScrollTop.current;
    }
  }, [weakWordsExpanded]);

  useEffect(() => {
    if (dueWordsExpanded && dueWordsListRef.current) {
      dueWordsListRef.current.scrollTop = dueWordsScrollTop.current;
    }
  }, [dueWordsExpanded]);

  // Audio synthesis phát âm tiếng Anh chuẩn MP3 hoặc fallback
  const playAudio = (textOrUrl: string) => {
    if (!textOrUrl?.trim()) return;
    if (textOrUrl.startsWith("/") || textOrUrl.startsWith("http://") || textOrUrl.startsWith("https://")) {
      const audio = new Audio(textOrUrl);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textOrUrl);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tính tổng số từ trong kho
  const totalWordsCount = React.useMemo(() => {
    return tests.reduce((acc, curr) => acc + (curr.words ? curr.words.length : (curr.wordCount ?? 0)), 0);
  }, [tests]);

  const handleSaveGoal = async () => {
    try {
      setSavingGoal(true);
      setGoalFeedback(null);
      const nextGoal = await updateStudentVocabularyGoals({
        newWordsGoal: Math.max(0, Number(goalForm.newWordsGoal) || 0),
        reviewGoal: Math.max(0, Number(goalForm.reviewGoal) || 0),
      });
      setDailyGoal(nextGoal);
      setGoalForm({ newWordsGoal: nextGoal.newWordsGoal, reviewGoal: nextGoal.reviewGoal });
      setGoalFeedback("Đã lưu mục tiêu học tập.");

      // Đồng bộ ngược lên Study Plan để giữ nhất quán
      try {
        await updateStudyPlan({
          newWordsPerDay: nextGoal.newWordsGoal,
          reviewPerDay: nextGoal.reviewGoal,
        });
      } catch {
        // Không để lỗi sync plan làm hỏng luồng lưu mục tiêu từ vựng
      }
    } catch (err) {
      setGoalFeedback(err instanceof Error ? err.message : "Không thể lưu mục tiêu học tập.");
    } finally {
      setSavingGoal(false);
    }
  };

  const startDueReview = async () => {
    try {
      setReviewLoading(true);
      const dueWords = await getDueVocabularyWords(undefined, 500);
      if (dueWords.length === 0) {
        setGoalFeedback("Hiện chưa có từ nào đến hạn ôn tập.");
        return;
      }
      await startVocabularyActivity("VOCABULARY_FLASHCARDS", () => {
        setFlashcardStartIndex(0);
        setFlashcardModalTest({
          id: "due-review",
          title: "Ôn tập từ đến hạn",
          wordCount: dueWords.length,
          words: dueWords,
        });
      });
    } catch (error) {
      setGoalFeedback(error instanceof Error ? error.message : "Không thể tải danh sách từ đến hạn.");
    } finally {
      setReviewLoading(false);
    }
  };

  const summaryCards = [
    { label: "Tổng từ truy cập", value: dashboard?.totalWords ?? totalWordsCount, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: "Đã học", value: dashboard?.learnedWords ?? 0, icon: BrainCircuit, color: "text-violet-600 bg-violet-50" },
    { label: "Đã ghi nhớ", value: dashboard?.masteredWords ?? 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Cần ôn tập", value: dashboard?.dueForReview ?? 0, icon: CalendarClock, color: "text-amber-600 bg-amber-50" },
  ];
  const newGoalPercent = dailyGoal
    ? dailyGoal.newWordsGoal ? Math.min(100, Math.round((dailyGoal.completedNewWords / dailyGoal.newWordsGoal) * 100)) : 100
    : 0;
  const reviewGoalPercent = dailyGoal
    ? dailyGoal.reviewGoal ? Math.min(100, Math.round((dailyGoal.completedReview / dailyGoal.reviewGoal) * 100)) : 100
    : 0;
  const maxDailyAnswers = Math.max(1, ...dailyStats.map((stat) => stat.answerCount));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {quotaMessage ? (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{quotaMessage}</span>
          <button type="button" onClick={() => setQuotaMessage(null)} className="font-bold" aria-label="Đóng thông báo">×</button>
        </div>
      ) : null}
      {/* Header phong cách tinh tế, đơn giản, sạch sẽ giống Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700 dark:text-blue-400">Luyện từ vựng</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-[28px]">
            Kho Từ Vựng TOEIC Trọng Tâm
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
            Các bộ từ vựng đã được phát hành.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link href="/vocabulary/games" className="rounded-xl border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/60 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition">
            Game Center
          </Link>
          <Link href="/vocabulary/history" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Lịch sử học
          </Link>
          <LearningQuotaBadge featureKey="VOCABULARY" />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <span className={`rounded-xl p-2 ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold">Mục tiêu học tập hằng ngày</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
              Lộ trình cá nhân hóa
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tự động đồng bộ từ khảo sát mục tiêu (Onboarding) và lịch học của bạn. Bạn có thể tùy chỉnh lại bất kỳ lúc nào.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Từ mới mỗi ngày
              <input
                type="number"
                min={0}
                max={500}
                value={goalForm.newWordsGoal}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, newWordsGoal: Number(e.target.value) || 0 }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Ôn tập mỗi ngày
              <input
                type="number"
                min={0}
                max={500}
                value={goalForm.reviewGoal}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, reviewGoal: Number(e.target.value) || 0 }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <span>Tiến độ hôm nay</span>
            <span className="font-semibold text-slate-900">
              {(dailyGoal?.completedNewWords ?? 0)}/{(dailyGoal?.newWordsGoal ?? goalForm.newWordsGoal)} từ mới · {(dailyGoal?.completedReview ?? 0)}/{(dailyGoal?.reviewGoal ?? goalForm.reviewGoal)} ôn tập
            </span>
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Từ mới</span><span>{newGoalPercent}%</span></div>
              <div role="progressbar" aria-label="Tiến độ mục tiêu từ mới" aria-valuenow={newGoalPercent} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${newGoalPercent}%` }} />
              </div>
            </div>
            {dailyGoal && dailyGoal.reachedNewGoal && dailyGoal.reachedReviewGoal ? (
              <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                Hoàn thành cả mục tiêu từ mới và ôn tập hôm nay. Tuyệt vời!
              </p>
            ) : null}
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Ôn tập</span><span>{reviewGoalPercent}%</span></div>
              <div role="progressbar" aria-label="Tiến độ mục tiêu ôn tập" aria-valuenow={reviewGoalPercent} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${reviewGoalPercent}%` }} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveGoal}
            disabled={savingGoal}
            className="mt-4 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingGoal ? "Đang lưu..." : "Lưu mục tiêu"}
          </button>
          {goalFeedback ? (
            <p role="status" className={`mt-3 text-xs ${goalFeedback.startsWith("Không thể") ? "text-red-700" : "text-emerald-700"}`}>
              {goalFeedback}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Thống kê nhanh</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"> <span>Tỷ lệ ghi nhớ</span> <span className="font-bold text-slate-900">{dashboard?.memoryRate ?? 0}%</span> </div>
            <div className="flex items-center justify-between"> <span>Thời gian phản hồi đã ghi</span> <span className="font-bold text-slate-900">{dashboard?.studyMinutes ?? 0} phút</span> </div>
            <div className="flex items-center justify-between"> <span>Chuỗi ngày học</span> <span className="font-bold text-slate-900">{dashboard?.streakDays ?? 0} ngày</span> </div>
            <div className="flex items-center justify-between"> <span>Đang học</span> <span className="font-bold text-slate-900">{dashboard?.learningWords ?? 0}</span> </div>
            <div className="flex items-center justify-between"> <span>Lượt trả lời / chính xác</span> <span className="font-bold text-slate-900">{dashboard?.totalAnswers ?? 0} / {dashboard?.correctAnswers ?? 0}</span> </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hoạt động 7 ngày qua</h2>
              <p className="mt-1 text-xs text-slate-500">Số câu trả lời đã được ghi nhận mỗi ngày.</p>
            </div>
            <Link href="/vocabulary/history" className="text-xs font-semibold text-blue-700 hover:underline">Xem lịch sử</Link>
          </div>
          {dailyStats.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có hoạt động học trong 7 ngày qua.</p> : (
            <ul className="mt-4 space-y-3">
              {dailyStats.map((stat) => {
                const percent = Math.round(stat.answerCount * 100 / maxDailyAnswers);
                return (
                  <li key={stat.date}>
                    <div className="mb-1 flex justify-between gap-3 text-xs">
                      <span className="font-medium text-slate-600">{new Date(`${stat.date}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" })}</span>
                      <span className="font-semibold text-slate-800">{stat.correctCount}/{stat.answerCount} đúng</span>
                    </div>
                    <div role="progressbar" aria-label={`Số câu trả lời ngày ${stat.date}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Từ cần củng cố</h2>
              <p className="mt-1 text-xs text-slate-500">Từ sai xuất hiện ở đây ngay; ôn tập SRS sẽ đưa từ vào lượt ôn khi đến lịch.</p>
            </div>
            {weakWords.length > 0 ? (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Link
                  href={`/vocabulary/${encodeURIComponent(weakWords[0].setId)}/practice?source=weak`}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Chọn đáp án
                </Link>
                <Link
                  href={`/vocabulary/${encodeURIComponent(weakWords[0].setId)}/review?source=weak`}
                  className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
                >
                  Flashcard
                </Link>
                <Link
                  href={`/vocabulary/games/matching?setId=${encodeURIComponent(weakWords[0].setId)}&source=weak`}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
                >
                  Ghép cặp
                </Link>
              </div>
            ) : null}
          </div>
          {weakWords.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có từ nào cần củng cố. Hãy tiếp tục luyện tập!</p> : (
            <ul
              ref={weakWordsListRef}
              onScroll={(event) => { weakWordsScrollTop.current = event.currentTarget.scrollTop; }}
              className={`mt-4 divide-y divide-slate-100 ${weakWordsExpanded ? "max-h-80 overflow-y-auto overscroll-contain pr-2" : ""}`}
              style={weakWordsExpanded ? { scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #f1f5f9" } : undefined}
            >
              {(weakWordsExpanded ? weakWords : weakWords.slice(0, 5)).map((word) => (
                <li key={word.wordId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{word.word}<span className="ml-2 text-sm font-normal text-slate-500">{word.meaning}</span></p>
                    <p className="mt-1 truncate text-xs text-slate-500">{word.setTitle} · Sai {word.incorrectCount} lần</p>
                    <p className="mt-1 text-xs font-medium text-indigo-600">
                      {word.nextReviewAt
                        ? `Lịch ôn SRS: ${new Date(word.nextReviewAt).toLocaleString("vi-VN")}`
                        : "Chưa có lịch ôn SRS"}
                    </p>
                  </div>
                  <Link href={`/vocabulary/${encodeURIComponent(word.setId)}/practice?wordId=${encodeURIComponent(word.wordId)}`} className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">Luyện từ này</Link>
                </li>
              ))}
            </ul>
          )}
          {weakWords.length > 5 ? (
            <button
              type="button"
              onClick={() => {
                weakWordsScrollTop.current = weakWordsListRef.current?.scrollTop ?? weakWordsScrollTop.current;
                setWeakWordsExpanded((expanded) => !expanded);
              }}
              className="mt-3 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
            >
              {weakWordsExpanded ? "Thu gọn" : `Xem tất cả (${weakWords.length})`}
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ôn tập từ đến hạn</h2>
            <p className="mt-1 text-xs text-slate-500">Các từ đã đến lịch ôn lặp lại ({dashboard?.dueForReview ?? dueWords.length} từ).</p>
          </div>
          <button
            type="button"
            onClick={() => void startDueReview()}
            disabled={reviewLoading || dueWords.length === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CalendarClock className="h-4 w-4" />
            {reviewLoading ? "Đang tải từ cần ôn..." : `Ôn cả nhóm (${dashboard?.dueForReview ?? dueWords.length})`}
          </button>
        </div>
        {dueWords.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Hiện chưa có từ nào đến hạn ôn.</p>
        ) : (
          <>
            <ul
              ref={dueWordsListRef}
              onScroll={(event) => { dueWordsScrollTop.current = event.currentTarget.scrollTop; }}
              className={`mt-4 divide-y divide-slate-100 ${dueWordsExpanded ? "max-h-80 overflow-y-auto overscroll-contain pr-2" : ""}`}
              style={dueWordsExpanded ? { scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #f1f5f9" } : undefined}
            >
              {(dueWordsExpanded ? dueWords : dueWords.slice(0, 5)).map((word) => (
                <li key={word.id} className="flex min-w-0 items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {word.word}<span className="ml-2 text-sm font-normal text-slate-500">{word.meaning}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {dueWords.length > 5 ? (
              <button
                type="button"
                onClick={() => {
                  dueWordsScrollTop.current = dueWordsListRef.current?.scrollTop ?? dueWordsScrollTop.current;
                  setDueWordsExpanded((expanded) => !expanded);
                }}
                className="mt-3 rounded-lg px-2 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50"
              >
                {dueWordsExpanded ? "Thu gọn" : `Xem tất cả (${dashboard?.dueForReview ?? dueWords.length})`}
              </button>
            ) : null}
          </>
        )}
      </section>

      {/* Grid danh sách bộ từ cho học viên */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải bộ từ vựng từ backend: {loadError}
        </div>
      ) : null}
      {!loading && !loadError && tests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Chưa có bộ từ vựng được phát hành.
        </div>
      ) : null}
      <StudentVocabularyGrid
        tests={tests}
        activeSubCategory={activeSubCategory}
        setActiveSubCategory={setActiveSubCategory}
        onOpenWordList={(test) => setWordListModalTest(test)}
        onOpenFlashcards={(test, isRedo = false, startIndex = 0) => {
          setFlashcardStartIndex(isRedo ? 0 : startIndex);
          let testToUse = test;
          if (isRedo) {
            const prog = getItemProgress(`vocab-${test.id}`, test.words ? test.words.length : 25);
            const wrongList = prog.wrongQuestionIds || [];
            const wrongIds = wrongList.map(String);
            const allWords = test.words || [];
            let filtered = allWords.filter((w, idx) => {
              const wId = String(w.id || idx + 1);
              return wrongIds.includes(wId) || wrongIds.includes(String(idx + 1));
            });
            if (filtered.length === 0) {
              filtered = allWords.slice(0, Math.max(1, prog.wrongAnswers || 2));
            }
            testToUse = { ...test, words: filtered };
          }
          void startVocabularyActivity("VOCABULARY_FLASHCARDS", () => setFlashcardModalTest(testToUse));
        }}
        onOpenGame={(test, isRedo = false) => {
          let testToUse = test;
          if (isRedo) {
            const prog = getItemProgress(`vocab-${test.id}`, test.words ? test.words.length : 25);
            const wrongList = prog.wrongQuestionIds || [];
            const wrongIds = wrongList.map(String);
            const allWords = test.words || [];
            let filtered = allWords.filter((w, idx) => {
              const wId = String(w.id || "");
              const wWord = String(w.word || "");
              const idx1 = String(idx + 1);
              const idx0 = String(idx);
              return wrongIds.some(
                (wid) =>
                  wid === wId ||
                  wid === wWord ||
                  wid === idx1 ||
                  wid === idx0 ||
                  (wId && wId.endsWith(`-${wid}`)) ||
                  (wId && wId.endsWith(`_${wid}`))
              );
            });
            if (filtered.length === 0) {
              filtered = allWords.slice(0, Math.max(1, prog.wrongAnswers || 2));
            }
            testToUse = {
              ...test,
              words: filtered,
              isRedoMode: true,
              allWords: test.words,
              originalTotalWords: test.words?.length || test.wordCount || 0,
            };
          } else {
            testToUse = {
              ...test,
              allWords: test.words,
              originalTotalWords: test.words?.length || test.wordCount || 0,
            };
          }
          void startVocabularyActivity("VOCABULARY_GAME", () => setGameModalTest(testToUse));
        }}
      />

      {/* Các Modals học tập */}
      <StudentVocabularyModals
        wordListModalTest={wordListModalTest}
        onCloseWordList={() => setWordListModalTest(null)}
        playAudio={playAudio}
        onStartFlashcardsFromList={(test) => { void startVocabularyActivity("VOCABULARY_FLASHCARDS", () => {
          setWordListModalTest(null);
          setFlashcardModalTest(test);
        }); }}
        onStartGameFromList={(test) => { void startVocabularyActivity("VOCABULARY_GAME", () => {
          setWordListModalTest(null);
          setGameModalTest(test);
        }); }}
        flashcardModalTest={flashcardModalTest}
        onCloseFlashcards={() => {
          setFlashcardModalTest(null);
          void loadSets();
        }}
        initialFlashcardIndex={flashcardStartIndex}
        gameModalTest={gameModalTest}
        onCloseGame={() => {
          setGameModalTest(null);
          void loadSets();
        }}
      />
    </div>
  );
}
