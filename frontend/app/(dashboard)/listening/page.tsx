"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Sparkles, Volume2, History, BarChart3, Clock, Target, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { DictationCardData, LevelCategoryCardData } from "@/app/admin/content/listening/types";
import { fetchListeningCards, fetchListeningUnits, fetchListeningAnalytics, type ListeningAnalyticsSummary, type ListeningRecommendationItem } from "@/lib/api/listening";
import { StudentListeningDictationTab } from "@/components/student/listening/StudentListeningDictationTab";
import { StudentListeningPartTab } from "@/components/student/listening/StudentListeningPartTab";
import { ListeningDictationModal } from "@/components/admin/content/listening/ListeningDictationModal";
import { ListeningQuizModal } from "@/components/admin/content/listening/ListeningQuizModal";
import { ListeningAttemptHistoryModal } from "@/components/admin/content/listening/ListeningStudyToolsModals";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { VocabBagModal, TheoryModal } from "@/components/admin/content/listening/ListeningModals";
import { LearningQuotaBadge } from "@/components/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { getItemProgress, getRedoWrongQuestions, saveItemProgress } from "@/lib/practiceProgress";

export default function StudentListeningPage() {
  const [activeTab, setActiveTab] = useState<"dictation" | "part1" | "part2" | "part3" | "part4">("dictation");
  const [selectedYear, setSelectedYear] = useState<"2024" | "2023" | "2022">("2024");
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [unlockedActivityKeys, setUnlockedActivityKeys] = useState<Set<string>>(() => new Set());
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState<ListeningAnalyticsSummary | null>(null);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true);
  const [quizInitialRealExamMode, setQuizInitialRealExamMode] = useState(false);

  const refreshAnalytics = useCallback(() => {
    fetchListeningAnalytics()
      .then((res) => setAnalyticsSummary(res))
      .catch(() => {});
  }, []);

  async function startActivity(
    featureKey: string,
    activityKey: string,
    skipConsume: boolean,
    open: () => void
  ) {
    if (skipConsume || unlockedActivityKeys.has(activityKey)) {
      open();
      return;
    }
    try {
      await consumeLearningFeature(featureKey);
      setUnlockedActivityKeys((prev) => {
        const next = new Set(prev);
        next.add(activityKey);
        return next;
      });
      open();
    } catch (error) {
      setQuotaMessage(error instanceof Error ? error.message : "Không thể bắt đầu hoạt động học.");
    }
  }

  const openListeningQuiz = (card: LevelCategoryCardData, startIndex = 0, isRedo = false, realExamMode = false) => {
    if (!card.questions?.length) {
      setQuotaMessage("Chủ điểm này chưa có câu hỏi để luyện tập.");
      return;
    }
    const skipQuota = isRedo || (card.completedQuestions || 0) > 0;
    void startActivity("LISTENING_PART_PRACTICE", `quiz-${card.id}`, skipQuota, () => {
      let cardToUse = card;
      if (isRedo) {
        const filtered = getRedoWrongQuestions(
          card.questions || [],
          `listening-quiz-${card.id}`,
          card.questions?.length || card.totalQuestions || 0
        );
        cardToUse = {
          ...card,
          title: `${card.title} · Làm lại ${filtered.length} câu sai`,
          questions: filtered,
          totalQuestions: filtered.length,
          originalTotalQuestions: card.questions?.length || card.totalQuestions || 0,
        };
      }
      setQuizInitialRealExamMode(realExamMode);
      setQuizModalCard(cardToUse);
      setActiveQuizQIndex(isRedo ? 0 : startIndex);
      setQuizSelectedOption({});
      setQuizAnswerChecked({});
    });
  };

  // Dữ liệu Cards
  const [dictationCards, setDictationCards] = useState<DictationCardData[]>([]);
  const [part1Levels, setPart1Levels] = useState<LevelCategoryCardData[]>([]);
  const [part1Categories, setPart1Categories] = useState<LevelCategoryCardData[]>([]);
  const [part2Levels, setPart2Levels] = useState<LevelCategoryCardData[]>([]);
  const [part2Categories, setPart2Categories] = useState<LevelCategoryCardData[]>([]);
  const [part3Levels, setPart3Levels] = useState<LevelCategoryCardData[]>([]);
  const [part3Categories, setPart3Categories] = useState<LevelCategoryCardData[]>([]);
  const [part4Levels, setPart4Levels] = useState<LevelCategoryCardData[]>([]);
  const [part4Categories, setPart4Categories] = useState<LevelCategoryCardData[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([fetchListeningCards(), fetchListeningUnits()])
      .then(([cards, units]) => {
        if (!active) return;
        const dbFlaggedSet = new Set<number>();

        cards.forEach((card) => {
          const key = `listening-dictation-${card.id}`;
          const local = getItemProgress(key, card.totalQuestions);
          if (
            card.completedQuestions > local.completedQuestions ||
            (card.answeredQuestionIds && card.answeredQuestionIds.length > (local.answeredQuestionIds?.length || 0))
          ) {
            saveItemProgress(
              key,
              Math.max(card.completedQuestions, local.completedQuestions),
              card.totalQuestions,
              undefined,
              card.correctCount ?? local.correctAnswers,
              card.wrongCount ?? local.wrongAnswers,
              card.wrongQuestionIds ?? local.wrongQuestionIds,
              undefined,
              card.answeredQuestionIds ?? local.answeredQuestionIds
            );
          }
          if (Array.isArray(card.flaggedQuestionIds)) {
            card.flaggedQuestionIds.forEach((id) => {
              const num = Number(id);
              if (Number.isFinite(num)) dbFlaggedSet.add(num);
            });
          }
          if (card.userNotes && Object.keys(card.userNotes).length > 0 && typeof window !== "undefined") {
            try {
              const noteKey = `toeic_listening_dictation_notes_${card.id}`;
              const existingRaw = localStorage.getItem(noteKey);
              const existing = existingRaw ? JSON.parse(existingRaw) : {};
              localStorage.setItem(noteKey, JSON.stringify({ ...existing, ...card.userNotes }));
            } catch {}
          }
          if (card.selfAssessments && Object.keys(card.selfAssessments).length > 0 && typeof window !== "undefined") {
            try {
              const selfKey = `toeic_listening_dictation_self_${card.id}`;
              const existingRaw = localStorage.getItem(selfKey);
              const existing = existingRaw ? JSON.parse(existingRaw) : {};
              localStorage.setItem(selfKey, JSON.stringify({ ...existing, ...card.selfAssessments }));
            } catch {}
          }
        });

        units.forEach((unit) => {
          const key = `listening-quiz-${unit.id}`;
          const totalQ = unit.questions?.length || unit.totalQuestions || 0;
          const local = getItemProgress(key, totalQ);
          if (
            unit.completedQuestions > local.completedQuestions ||
            (unit.answeredQuestionIds && unit.answeredQuestionIds.length > (local.answeredQuestionIds?.length || 0))
          ) {
            saveItemProgress(
              key,
              Math.max(unit.completedQuestions, local.completedQuestions),
              totalQ,
              undefined,
              unit.correctCount || local.correctAnswers || 0,
              unit.wrongCount || local.wrongAnswers || 0,
              unit.wrongQuestionIds ?? local.wrongQuestionIds,
              undefined,
              unit.answeredQuestionIds ?? local.answeredQuestionIds
            );
          }
          if (Array.isArray(unit.flaggedQuestionIds)) {
            unit.flaggedQuestionIds.forEach((id) => {
              const num = Number(id);
              if (Number.isFinite(num)) dbFlaggedSet.add(num);
            });
          }
          if (unit.userNotes && Object.keys(unit.userNotes).length > 0 && typeof window !== "undefined") {
            try {
              const noteKey = `toeic_listening_quiz_notes_${unit.id}`;
              const existingRaw = localStorage.getItem(noteKey);
              const existing = existingRaw ? JSON.parse(existingRaw) : {};
              localStorage.setItem(noteKey, JSON.stringify({ ...existing, ...unit.userNotes }));
            } catch {}
          }
        });

        if (dbFlaggedSet.size > 0) {
          setFlaggedReviewIds((prev) => Array.from(new Set([...prev, ...Array.from(dbFlaggedSet)])));
        }

        setDictationCards(cards);
        const byPart = (part: LevelCategoryCardData["part"], type: "level" | "category") =>
          units.filter((unit) => unit.part === part && unit.type === type);
        setPart1Levels(byPart("Part 1", "level"));
        setPart1Categories(byPart("Part 1", "category"));
        setPart2Levels(byPart("Part 2", "level"));
        setPart2Categories(byPart("Part 2", "category"));
        setPart3Levels(byPart("Part 3", "level"));
        setPart3Categories(byPart("Part 3", "category"));
        setPart4Levels(byPart("Part 4", "level"));
        setPart4Categories(byPart("Part 4", "category"));
        setDataLoadError(null);
        refreshAnalytics();
      })
      .catch((error: unknown) => {
        if (active) setDataLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu nghe.");
      });
    return () => { active = false; };
  }, [refreshAnalytics]);

  // Modal 1: Dictation Studio
  const [dictationModalCard, setDictationModalCard] = useState<DictationCardData | null>(null);
  const [activeDictationQIndex, setActiveDictationQIndex] = useState(0);
  const [dictationUserInputs, setDictationUserInputs] = useState<{ [qId: number]: string }>({});
  const [dictationChecked, setDictationChecked] = useState<{ [qId: number]: boolean }>({});
  const [dictationSubTab, setDictationSubTab] = useState<"chep" | "check" | "full">("chep");
  const [fillPercentage, setFillPercentage] = useState<30 | 50 | 100>(50);
  const [revealedWordCount, setRevealedWordCount] = useState<number>(0);
  const [replayCount, setReplayCount] = useState<number>(1);
  const [audioSpeed, setAudioSpeed] = useState<"0.8" | "1.0" | "1.2">("1.0");

  // Modal 2: Quiz Practice
  const [quizModalCard, setQuizModalCard] = useState<LevelCategoryCardData | null>(null);
  const [activeQuizQIndex, setActiveQuizQIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<{ [qId: number]: string }>({});
  const [quizAnswerChecked, setQuizAnswerChecked] = useState<{ [qId: number]: boolean }>({});
  const [showBilingualQuiz, setShowBilingualQuiz] = useState(false);

  // Modal phụ
  const [vocabBagModalData, setVocabBagModalData] = useState<{
    title: string;
    items: { word: string; ipa: string; meaning: string; example?: string }[];
  } | null>(null);
  const [theoryModalData, setTheoryModalData] = useState<{
    title: string;
    summary: string;
    rules: string[];
  } | null>(null);
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("toeic_listening_saved_vocab");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [flaggedReviewIds, setFlaggedReviewIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("toeic_listening_flagged_questions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("toeic_listening_saved_vocab", JSON.stringify(savedVocabBag));
    } catch {}
  }, [savedVocabBag]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("toeic_listening_flagged_questions", JSON.stringify(flaggedReviewIds));
    } catch {}
  }, [flaggedReviewIds]);

  // ✅ FIX 1: Ghi chú & Lưới câu hỏi — có state thật, không còn hàm rỗng
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);

  // ✅ FIX 2: Toast thông báo — có state thật, hiển thị được
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Audio synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const playAudio = (text: string) => {
    if (!text.trim()) return;
    if (text.startsWith("http://") || text.startsWith("https://")) {
      const audio = new Audio(text);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSfx = (_type?: string) => {
    playUnifiedAnswerSound();
  };

  const handleToggleFlagReview = (qId: number) => {
    setFlaggedReviewIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Gom nhóm Dictation theo Test
  const testsGrouped = useMemo(() => {
    const filtered = dictationCards.filter((c) => c.year === selectedYear);
    const groups: { [testNum: number]: DictationCardData[] } = {};
    filtered.forEach((card) => {
      const tNum = card.testNumber || 1;
      if (!groups[tNum]) groups[tNum] = [];
      groups[tNum].push(card);
    });
    return groups;
  }, [dictationCards, selectedYear]);

  const allPartUnits = useMemo(
    () => [
      ...part1Levels,
      ...part1Categories,
      ...part2Levels,
      ...part2Categories,
      ...part3Levels,
      ...part3Categories,
      ...part4Levels,
      ...part4Categories,
    ],
    [
      part1Levels,
      part1Categories,
      part2Levels,
      part2Categories,
      part3Levels,
      part3Categories,
      part4Levels,
      part4Categories,
    ]
  );

  const handleTriggerRecommendation = (rec: ListeningRecommendationItem) => {
    const switchPartTab = (partName: string) => {
      if (partName === "Part 1") setActiveTab("part1");
      else if (partName === "Part 2") setActiveTab("part2");
      else if (partName === "Part 3") setActiveTab("part3");
      else if (partName === "Part 4") setActiveTab("part4");
      else setActiveTab("dictation");
    };

    if (rec.targetType === "UNIT" && rec.targetId) {
      const foundUnit = allPartUnits.find((u) => u.id === rec.targetId);
      if (foundUnit) {
        switchPartTab(foundUnit.part);
        openListeningQuiz(foundUnit, 0, rec.recommendedMode === "REDO_WRONG", rec.recommendedMode === "REAL_EXAM");
        return;
      }
    }

    if (rec.targetType === "DICTATION" && rec.targetId) {
      const foundCard = dictationCards.find((c) => c.id === rec.targetId);
      if (foundCard) {
        setActiveTab("dictation");
        const isRedo = rec.recommendedMode === "REDO_WRONG";
        const skipQuota = isRedo || (foundCard.completedQuestions || 0) > 0;
        void startActivity("LISTENING_DICTATION", `dictation-${foundCard.id}`, skipQuota, () => {
          let cardToUse = foundCard;
          if (isRedo) {
            const filtered = getRedoWrongQuestions(
              foundCard.questions || [],
              `listening-dictation-${foundCard.id}`,
              foundCard.questions?.length || foundCard.totalQuestions || 0
            );
            cardToUse = {
              ...foundCard,
              questions: filtered,
              totalQuestions: filtered.length,
              originalTotalQuestions: foundCard.questions?.length || foundCard.totalQuestions || 0,
            };
          }
          setDictationModalCard(cardToUse);
          setActiveDictationQIndex(0);
          setDictationSubTab("chep");
          setDictationUserInputs({});
          setDictationChecked({});
        });
        return;
      }
    }

    // Fallback: open first available unit of that part or switch tab
    const candidateUnit = allPartUnits.find((u) => u.part === rec.part && (u.questions?.length || 0) > 0);
    if (candidateUnit && rec.recommendedMode === "REAL_EXAM") {
      switchPartTab(rec.part);
      openListeningQuiz(candidateUnit, 0, false, true);
      return;
    }
    switchPartTab(rec.part);
    triggerToast(`Đã chuyển đến ${rec.part} theo đề xuất lộ trình BKT!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {quotaMessage ? <div role="alert" className="fixed right-5 top-5 z-[70] max-w-sm rounded-xl bg-red-700 px-4 py-3 text-xs font-semibold text-white shadow-xl">{quotaMessage}</div> : null}
      {/* ✅ Toast thông báo — hiển thị đúng */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}
      {dataLoadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dataLoadError}
        </div>
      ) : null}

      {/* Header chuẩn tối giản, thanh lịch như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700 dark:text-blue-400">Luyện nghe Listening</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-[28px]">
            Luyện Thi TOEIC Listening Trọng Tâm
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {allPartUnits.some((u) => (u.questions?.length || 0) > 0) && (
            <button
              type="button"
              onClick={() => {
                const activePartName =
                  activeTab === "part1"
                    ? "Part 1"
                    : activeTab === "part2"
                    ? "Part 2"
                    : activeTab === "part3"
                    ? "Part 3"
                    : activeTab === "part4"
                    ? "Part 4"
                    : null;
                const unit =
                  (activePartName && allPartUnits.find((u) => u.part === activePartName && (u.questions?.length || 0) > 0)) ||
                  allPartUnits.find((u) => (u.questions?.length || 0) > 0);
                if (unit) {
                  openListeningQuiz(unit, 0, false, true);
                } else {
                  triggerToast("Chưa có bộ đề Part 1–4 nào có câu hỏi để thi thật.");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-xs transition cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>⏱ Thi thật nhanh</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>Lịch sử làm bài</span>
          </button>
          <LearningQuotaBadge featureKey="LISTENING" />
        </div>
      </header>

      {/* BẢNG PHÂN TÍCH NĂNG LỰC BKT & ĐỀ XUẤT LỘ TRÌNH CÁ NHÂN HÓA */}
      {analyticsSummary && (
        <section className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Phân tích Năng lực BKT &amp; Đề xuất Lộ trình AI
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                    Adaptive BKT
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Cập nhật tự động từ kết quả Luyện tập, Chép chính tả và Chế độ Thi thật của bạn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                  Điểm LC ước tính: <strong className="text-blue-700">{analyticsSummary.estimatedListeningScore}/495</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                  Chính xác: <strong className="text-emerald-700">{analyticsSummary.overallAccuracyPercent}%</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                  Thi thật: <strong className="text-rose-600">{analyticsSummary.realExamAttempts} lượt</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAnalyticsExpanded((prev) => !prev)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                title={isAnalyticsExpanded ? "Thu gọn bảng phân tích" : "Mở rộng bảng phân tích"}
              >
                {isAnalyticsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isAnalyticsExpanded && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
              {/* Cột trái: BKT Mastery theo Part 1..4 */}
              <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Độ thông thạo BKT theo từng Part
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {analyticsSummary.totalQuestionsAnswered} câu đã làm
                  </span>
                </div>
                <div className="space-y-2.5">
                  {analyticsSummary.partMastery.map((pm) => {
                    const bktPercent = Math.round(pm.bktMasteryProbability);
                    const levelLabel =
                      pm.proficiencyLevel === "MASTERED"
                        ? "Thành thạo"
                        : pm.proficiencyLevel === "DEVELOPING"
                        ? "Đang phát triển"
                        : pm.proficiencyLevel === "WEAK"
                        ? "Cần cải thiện"
                        : "Chưa bắt đầu";
                    return (
                      <div key={pm.part} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{pm.part}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-[11px]">
                              Đúng {pm.correctCount}/{pm.answeredCount}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                bktPercent >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : bktPercent >= 55
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              BKT {bktPercent}% • {levelLabel}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              bktPercent >= 80
                                ? "bg-emerald-500"
                                : bktPercent >= 55
                                ? "bg-blue-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.max(6, bktPercent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cột phải: Danh sách Đề xuất Lộ trình Cá nhân hóa */}
              <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đề xuất hành động tiếp theo (Recommendation Engine)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700">
                    {analyticsSummary.recommendations.length} gợi ý
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analyticsSummary.recommendations.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-slate-50/60 hover:bg-blue-50/30 transition flex flex-col justify-between gap-2.5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              rec.priority === "HIGH"
                                ? "bg-rose-100 text-rose-700"
                                : rec.priority === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {rec.priority === "HIGH" ? "Ưu tiên cao" : rec.priority === "MEDIUM" ? "Nên luyện" : "Nâng cao"}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">{rec.part}</span>
                        </div>
                        <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">{rec.title}</h3>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{rec.reason}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerRecommendation(rec)}
                        className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <span>
                          {rec.recommendedMode === "REAL_EXAM"
                            ? "⏱ Vào Thi thật ngay"
                            : rec.recommendedMode === "REDO_WRONG"
                            ? "🔁 Làm lại câu sai"
                            : "🎯 Luyện ngay"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Thanh tab chuyển đổi 5 dạng bài luyện nghe */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar border border-transparent dark:border-slate-700">
        {[
          { id: "dictation", label: "Chép chính tả" },
          { id: "part1", label: "Part 1 - Hình ảnh" },
          { id: "part2", label: "Part 2 - Hỏi & Đáp" },
          { id: "part3", label: "Part 3 - Hội thoại" },
          { id: "part4", label: "Part 4 - Bài nói ngắn" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-white dark:!bg-blue-600 text-blue-600 dark:!text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nội dung từng tab */}
      {activeTab === "dictation" && (
        <StudentListeningDictationTab
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          testsGrouped={testsGrouped}
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenDictationPractice={(card, startIndex = 0, isRedo = false) => {
            const skipQuota = isRedo || (card.completedQuestions || 0) > 0;
            void startActivity("LISTENING_DICTATION", `dictation-${card.id}`, skipQuota, () => {
              let cardToUse = card;
              if (isRedo) {
                const filtered = getRedoWrongQuestions(
                  card.questions || [],
                  `listening-dictation-${card.id}`,
                  card.questions?.length || card.totalQuestions || 0
                );
                cardToUse = {
                  ...card,
                  questions: filtered,
                  totalQuestions: filtered.length,
                  originalTotalQuestions: card.questions?.length || card.totalQuestions || 0,
                };
              }
              setDictationModalCard(cardToUse);
              setActiveDictationQIndex(isRedo ? 0 : startIndex);
              setDictationSubTab("chep");
              setDictationUserInputs({});
              setDictationChecked({});
            });
          }}
        />
      )}

      {activeTab === "part1" && (
        <StudentListeningPartTab
          part="Part 1"
          levels={part1Levels}
          categories={part1Categories}
          categorySectionTitle="Theo Chủ đề Hình ảnh thực tế"
          categorySectionSubtitle="Luyện nghe tranh theo ngữ cảnh người thao tác, đồ vật tĩnh và quang cảnh."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {activeTab === "part2" && (
        <StudentListeningPartTab
          part="Part 2"
          levels={part2Levels}
          categories={part2Categories}
          categorySectionTitle="Theo Loại câu hỏi Part 2"
          categorySectionSubtitle="Luyện phản xạ câu hỏi Wh-, Yes/No, câu hỏi lựa chọn và câu hỏi đuôi."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {activeTab === "part3" && (
        <StudentListeningPartTab
          part="Part 3"
          levels={part3Levels}
          categories={part3Categories}
          categorySectionTitle="Theo Tình huống Hội thoại Part 3"
          categorySectionSubtitle="Luyện nghe hội thoại nơi công sở, đặt hàng, đàm phán và giao tiếp hàng ngày."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {activeTab === "part4" && (
        <StudentListeningPartTab
          part="Part 4"
          levels={part4Levels}
          categories={part4Categories}
          categorySectionTitle="Theo Dạng bài nói Part 4"
          categorySectionSubtitle="Luyện nghe thông báo phát thanh, tin nhắn thoại, bản tin giao thông và bài diễn thuyết."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {/* Modal 1: Dictation Studio */}
      {dictationModalCard && (
        <ListeningDictationModal
          dictationModalCard={dictationModalCard}
          setDictationModalCard={(card) => {
            setDictationModalCard(card);
            if (!card) refreshAnalytics();
          }}
          activeDictationQIndex={activeDictationQIndex}
          setActiveDictationQIndex={setActiveDictationQIndex}
          dictationUserInputs={dictationUserInputs}
          dictationChecked={dictationChecked}
          dictationSubTab={dictationSubTab}
          setDictationSubTab={setDictationSubTab}
          fillPercentage={fillPercentage}
          setFillPercentage={setFillPercentage}
          revealedWordCount={revealedWordCount}
          setRevealedWordCount={setRevealedWordCount}
          replayCount={replayCount}
          setReplayCount={setReplayCount}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          audioSpeed={audioSpeed}
          setAudioSpeed={setAudioSpeed}
          flaggedReviewIds={flaggedReviewIds}
          handleToggleFlagReview={handleToggleFlagReview}
          setIsNotesModalOpen={setIsNotesModalOpen}
          setIsQuestionGridOpen={setIsQuestionGridOpen}
          playSfx={playSfx}
          playAudio={playAudio}
          triggerToast={triggerToast}
        />
      )}

      {/* Modal 2: Quiz Practice */}
      {quizModalCard && (
        <ListeningQuizModal
          quizModalCard={quizModalCard}
          setQuizModalCard={(card) => {
            setQuizModalCard(card);
            if (!card) refreshAnalytics();
          }}
          activeQuizQIndex={activeQuizQIndex}
          setActiveQuizQIndex={setActiveQuizQIndex}
          quizSelectedOption={quizSelectedOption}
          setQuizSelectedOption={setQuizSelectedOption}
          quizAnswerChecked={quizAnswerChecked}
          setQuizAnswerChecked={setQuizAnswerChecked}
          showBilingualQuiz={showBilingualQuiz}
          setShowBilingualQuiz={setShowBilingualQuiz}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          isSfxEnabled={isSfxEnabled}
          setIsSfxEnabled={setIsSfxEnabled}
          flaggedReviewIds={flaggedReviewIds}
          handleToggleFlagReview={handleToggleFlagReview}
          playSfx={playSfx}
          playAudio={playAudio}
          triggerToast={triggerToast}
          setPart1Levels={setPart1Levels}
          setPart1Categories={setPart1Categories}
          setPart2Levels={setPart2Levels}
          setPart2Categories={setPart2Categories}
          setPart3Levels={setPart3Levels}
          setPart3Categories={setPart3Categories}
          setPart4Levels={setPart4Levels}
          setPart4Categories={setPart4Categories}
          initialRealExamMode={quizInitialRealExamMode}
          onCompletedAttempt={refreshAnalytics}
        />
      )}

      {/* Modal Túi từ vựng & Lý thuyết */}
      <VocabBagModal
        vocabBagModalData={vocabBagModalData}
        setVocabBagModalData={setVocabBagModalData}
        savedVocabBag={savedVocabBag}
        handleToggleSaveWord={(w) => {
          setSavedVocabBag((prev) =>
            prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
          );
        }}
      />
      <TheoryModal
        theoryModalData={theoryModalData}
        setTheoryModalData={setTheoryModalData}
      />
      <ListeningAttemptHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Lịch sử luyện nghe & Chép chính tả của bạn"
      />
    </div>
  );
}
