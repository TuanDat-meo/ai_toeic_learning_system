"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Target, BrainCircuit, CalendarClock, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import { getDueVocabularyWords, getStudentVocabularyDashboard, getStudentVocabularyGoals, getVocabularyDailyStats, getVocabularySets, getWeakVocabularyWords, updateStudentVocabularyGoals, type StudentVocabularyDashboard, type StudentVocabularyGoal, type VocabularyDailyStat, type WeakVocabularyWord } from "@/lib/api/vocabulary";
import { StudentVocabularyGrid } from "@/components/vocabulary/StudentVocabularyGrid";
import { StudentVocabularyModals } from "@/components/vocabulary/StudentVocabularyModals";
import { LearningQuotaBadge } from "@/components/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { getItemProgress } from "@/lib/practiceProgress";

export default function StudentVocabularyPage() {
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>([]);
  const [dashboard, setDashboard] = useState<StudentVocabularyDashboard | null>(null);
  const [dailyGoal, setDailyGoal] = useState<StudentVocabularyGoal | null>(null);
  const [weakWords, setWeakWords] = useState<WeakVocabularyWord[]>([]);
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
      const [setList, dashboardStats, goals, weakWordList, recentStats] = await Promise.all([
        getVocabularySets(),
        getStudentVocabularyDashboard(),
        getStudentVocabularyGoals(),
        getWeakVocabularyWords(8),
        getVocabularyDailyStats(),
      ]);
      setLoadError(null);
      setTests(setList);
      setDashboard(dashboardStats);
      setDailyGoal(goals);
      setWeakWords(weakWordList);
      setDailyStats(recentStats);
      setGoalForm({ newWordsGoal: goals.newWordsGoal, reviewGoal: goals.reviewGoal });
    } catch (err) {
      setTests([]);
      setDashboard(null);
      setDailyGoal(null);
      setWeakWords([]);
      setDailyStats([]);
      setLoadError(err instanceof Error ? err.message : "Không thể tải bộ từ vựng từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSets();
    const handleSync = () => { void loadSets(); };
    window.addEventListener("toeic-vocab-tests-updated", handleSync);
    return () => {
      window.removeEventListener("toeic-vocab-tests-updated", handleSync);
    };
  }, [loadSets]);

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
    } catch (err) {
      setGoalFeedback(err instanceof Error ? err.message : "Không thể lưu mục tiêu học tập.");
    } finally {
      setSavingGoal(false);
    }
  };

  const startDueReview = async () => {
    try {
      setReviewLoading(true);
      const dueWords = await getDueVocabularyWords();
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Luyện từ vựng</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Kho Từ Vựng TOEIC Trọng Tâm
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 md:text-sm">
            Các bộ từ vựng đã được phát hành.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link href="/vocabulary/games" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100">
            Game Center
          </Link>
          <Link href="/vocabulary/history" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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
          <div className="flex items-center gap-2 text-slate-900">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold">Mục tiêu học tập hằng ngày</h2>
          </div>
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
          <div className="flex items-center justify-between gap-3">
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Từ cần củng cố</h2>
              <p className="mt-1 text-xs text-slate-500">Dựa trên các câu trả lời sai đã lưu.</p>
            </div>
          </div>
          {weakWords.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có từ nào cần củng cố. Hãy tiếp tục luyện tập!</p> : (
            <ul className="mt-4 divide-y divide-slate-100">
              {weakWords.map((word) => (
                <li key={word.wordId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{word.word}<span className="ml-2 text-sm font-normal text-slate-500">{word.meaning}</span></p>
                    <p className="mt-1 truncate text-xs text-slate-500">{word.setTitle} · Sai {word.incorrectCount} lần</p>
                  </div>
                  <Link href={`/vocabulary/${encodeURIComponent(word.setId)}/practice?wordId=${encodeURIComponent(word.wordId)}`} className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">Luyện từ này</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={() => void startDueReview()}
        disabled={reviewLoading || (dashboard?.dueForReview ?? 0) === 0}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CalendarClock className="h-4 w-4" />
        {reviewLoading ? "Đang tải từ cần ôn..." : `Ôn tập từ đến hạn (${dashboard?.dueForReview ?? 0})`}
      </button>

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
