"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Languages,
  FileText,
  Pencil,
  Clock,
  Zap,
  Sparkles,
  Pause,
  Play,
  Volume2,
  Star,
  BookOpen,
  HelpCircle,
  ShoppingBag,
  Search,
  ChevronLeft,
  Grid,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  History,
} from "lucide-react";
import { LevelCategoryCardData, DictationQuestion } from "@/app/admin/content/listening/types";
import { AudioWaveformPlayer } from "@/components/common/AudioWaveformPlayer";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";
import { getItemProgress, saveItemProgress, recordQuestionAnswer } from "@/lib/practiceProgress";
import { saveListeningUnitProgress, recordListeningAttempt } from "@/lib/api/listening";
import { getEnrichedVocabDetail } from "@/lib/toeicVocabDetailEnricher";
import {
  ListeningDictionaryModal,
  ListeningPersonalVocabBagModal,
  ListeningAiTutorModal,
  ListeningAttemptHistoryModal,
  loadSavedListeningVocabItems,
  saveListeningVocabItemsToStorage,
  type SavedListeningVocabItem,
} from "./ListeningStudyToolsModals";

interface ListeningQuizModalProps {
  quizModalCard: LevelCategoryCardData;
  setQuizModalCard: (card: LevelCategoryCardData | null) => void;
  activeQuizQIndex: number;
  setActiveQuizQIndex: React.Dispatch<React.SetStateAction<number>>;
  quizSelectedOption: { [qId: number]: string };
  setQuizSelectedOption: React.Dispatch<React.SetStateAction<{ [qId: number]: string }>>;
  quizAnswerChecked: { [qId: number]: boolean };
  setQuizAnswerChecked: React.Dispatch<React.SetStateAction<{ [qId: number]: boolean }>>;
  showBilingualQuiz: boolean;
  setShowBilingualQuiz: (show: boolean) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
  isSfxEnabled: boolean;
  setIsSfxEnabled: (enabled: boolean) => void;
  flaggedReviewIds: number[];
  handleToggleFlagReview: (qId: number) => void;
  playSfx: (type?: "correct" | "wrong" | "click") => void;
  playAudio: (text: string) => void;
  triggerToast: (msg: string) => void;
  setPart1Levels: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart1Categories: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart2Levels: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart2Categories: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart3Levels: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart3Categories: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart4Levels: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  setPart4Categories: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>;
  initialRealExamMode?: boolean;
  onCompletedAttempt?: () => void;
}

export const ListeningQuizModal: React.FC<ListeningQuizModalProps> = ({
  quizModalCard,
  setQuizModalCard,
  activeQuizQIndex,
  setActiveQuizQIndex,
  quizSelectedOption,
  setQuizSelectedOption,
  quizAnswerChecked,
  setQuizAnswerChecked,
  showBilingualQuiz,
  setShowBilingualQuiz,
  isPlayingAudio,
  setIsPlayingAudio,
  isSfxEnabled,
  setIsSfxEnabled,
  flaggedReviewIds,
  handleToggleFlagReview,
  playSfx,
  playAudio,
  triggerToast,
  setPart1Levels,
  setPart1Categories,
  setPart2Levels,
  setPart2Categories,
  setPart3Levels,
  setPart3Categories,
  setPart4Levels,
  setPart4Categories,
  initialRealExamMode = false,
  onCompletedAttempt,
}) => {
  const [isRealExamMode, setIsRealExamMode] = useState<boolean>(Boolean(initialRealExamMode));
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [showExamResultModal, setShowExamResultModal] = useState<boolean>(false);
  const examTimeLimitSeconds = Math.max(120, quizModalCard.questions.length * 45);
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const quizNotesKey = `toeic_listening_quiz_notes_${quizModalCard.id}`;
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: string]: string }>(() => {
    const dbNotes = quizModalCard.userNotes || {};
    if (typeof window === "undefined") return { ...dbNotes };
    try {
      const raw = localStorage.getItem(quizNotesKey);
      const local = raw ? JSON.parse(raw) : {};
      return { ...local, ...dbNotes };
    } catch {
      return { ...dbNotes };
    }
  });
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(quizNotesKey, JSON.stringify(practiceUserNotes));
    } catch {}
  }, [quizNotesKey, practiceUserNotes]);

  const syncUnitMetadataToDb = (nextNotes: { [qId: string]: string }, nextFlagged?: number[]) => {
    const totalQ = quizModalCard.originalTotalQuestions || quizModalCard.totalQuestions || quizModalCard.questions?.length || 0;
    const progress = getItemProgress(`listening-quiz-${quizModalCard.id}`, totalQ);
    void saveListeningUnitProgress({
      unitId: quizModalCard.id,
      completedQuestions: progress.completedQuestions,
      totalQuestions: totalQ,
      correctCount: progress.correctAnswers || 0,
      wrongCount: progress.wrongAnswers || 0,
      wrongQuestionIds: progress.wrongQuestionIds || [],
      answeredQuestionIds: progress.answeredQuestionIds || [],
      flaggedQuestionIds: nextFlagged ?? flaggedReviewIds,
      userNotes: nextNotes,
      status: progress.status === "completed" ? "COMPLETED" : progress.completedQuestions > 0 ? "IN_PROGRESS" : "NOT_STARTED",
      lastQuestionIndex: activeQuizQIndex,
    });
  };
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [savedVocabItems, setSavedVocabItems] = useState<SavedListeningVocabItem[]>(() => loadSavedListeningVocabItems());
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [dictionaryInitialWord, setDictionaryInitialWord] = useState("");
  const [isVocabBagModalOpen, setIsVocabBagModalOpen] = useState(false);
  const [isAiTutorModalOpen, setIsAiTutorModalOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Record<string, "yellow" | "green" | "pink" | "blue">>({});
  const [quizTimerSeconds, setQuizTimerSeconds] = useState(0);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem < 10 ? `0${rem}` : rem}s`;
  };

  const handleSaveWordToBag = (item: SavedListeningVocabItem) => {
    setSavedVocabItems((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === item.word.toLowerCase());
      if (exists) {
        triggerToast(`Từ "${item.word}" đã có trong Giỏ từ cá nhân!`);
        return prev;
      }
      const next = [item, ...prev];
      saveListeningVocabItemsToStorage(next);
      triggerToast(`Đã lưu "${item.word}" vào Giỏ từ cá nhân!`);
      return next;
    });
  };

  const handleRemoveWordFromBag = (word: string) => {
    setSavedVocabItems((prev) => {
      const next = prev.filter((w) => w.word.toLowerCase() !== word.toLowerCase());
      saveListeningVocabItemsToStorage(next);
      triggerToast(`Đã xóa "${word}" khỏi Giỏ từ!`);
      return next;
    });
  };

  const toggleAnnotationKey = (key: string) => {
    if (!isAnnotatorActive) return false;
    setAnnotations((prev) => {
      const next = { ...prev };
      if (next[key] === annotatorColor) {
        delete next[key];
      } else {
        next[key] = annotatorColor;
      }
      return next;
    });
    return true;
  };

  const getAnnotationHighlightClass = (key: string) => {
    const color = annotations[key];
    if (!color) return "";
    if (color === "yellow") return "bg-yellow-200/80 ring-1 ring-yellow-400 rounded px-1";
    if (color === "green") return "bg-emerald-200/80 ring-1 ring-emerald-400 rounded px-1";
    if (color === "pink") return "bg-pink-200/80 ring-1 ring-pink-400 rounded px-1";
    return "bg-sky-200/80 ring-1 ring-sky-400 rounded px-1";
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setQuizTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [expandedVocabWords, setExpandedVocabWords] = useState<Record<string, boolean>>({});
  const [isAllVocabExpanded, setIsAllVocabExpanded] = useState(false);

  React.useEffect(() => {
    setIsPlayingAudio(false);
  }, [activeQuizQIndex, setIsPlayingAudio]);

  const baseQuestion = quizModalCard.questions[activeQuizQIndex] || quizModalCard.questions[0];
  const questionRef = `LISTENING-${quizModalCard.id}-${baseQuestion.id}`;
  const [questionCorrectionState, setQuestionCorrectionState] = useState<{ ref: string; value: QuestionCorrection | null } | null>(null);
  React.useEffect(() => {
    let active = true;
    getQuestionCorrection(questionRef).then((correction) => { if (active) setQuestionCorrectionState({ ref: questionRef, value: correction }); }).catch(() => undefined);
    return () => { active = false; };
  }, [questionRef]);
  const questionCorrection = questionCorrectionState?.ref === questionRef ? questionCorrectionState.value : null;
  const correctionOptions = Array.isArray(questionCorrection?.options)
    ? Object.fromEntries(questionCorrection.options.map((option, index) => [String.fromCharCode(65 + index), option]))
    : questionCorrection?.options || baseQuestion.options;
  const currentQ: DictationQuestion = questionCorrection ? {
    ...baseQuestion,
    question: questionCorrection.questionText || baseQuestion.question,
    options: correctionOptions,
    correctAnswer: questionCorrection.correctAnswer || baseQuestion.correctAnswer,
    explanation: questionCorrection.explanation || baseQuestion.explanation,
  } : baseQuestion;
  const resolvedAudioUrl = currentQ.audioUrl || "";

  const updateCardStats = (q: DictationQuestion, chosen: string) => {
    const isCorrect = chosen === q.correctAnswer;
    const totalQ = quizModalCard.originalTotalQuestions || quizModalCard.totalQuestions || quizModalCard.questions?.length || 0;
    const progress = recordQuestionAnswer(`listening-quiz-${quizModalCard.id}`, q.id, isCorrect, totalQ);
    void saveListeningUnitProgress({
      unitId: quizModalCard.id,
      completedQuestions: progress.completedQuestions,
      totalQuestions: totalQ,
      correctCount: progress.correctAnswers || 0,
      wrongCount: progress.wrongAnswers || 0,
      wrongQuestionIds: progress.wrongQuestionIds || [],
      answeredQuestionIds: progress.answeredQuestionIds || [],
      flaggedQuestionIds: flaggedReviewIds,
      userNotes: practiceUserNotes,
      status: progress.status === "completed" ? "COMPLETED" : "IN_PROGRESS",
      lastQuestionIndex: activeQuizQIndex,
    });
    void recordListeningAttempt({
      targetType: "UNIT",
      targetId: quizModalCard.id,
      targetTitle: quizModalCard.title,
      part: quizModalCard.part,
      mode: "PART_PRACTICE",
      totalQuestions: 1,
      completedQuestions: 1,
      correctCount: isCorrect ? 1 : 0,
      wrongCount: isCorrect ? 0 : 1,
      durationSeconds: quizTimerSeconds,
      xpEarned: isCorrect ? 10 : 0,
      details: { questionId: q.id, chosenOption: chosen, correctAnswer: q.correctAnswer },
    }).then(() => {
      onCompletedAttempt?.();
    });
    const updateCard = (c: LevelCategoryCardData): LevelCategoryCardData => {
      if (c.id === quizModalCard.id) {
        return {
          ...c,
          completedQuestions: progress.completedQuestions,
          correctCount: progress.correctAnswers || 0,
          wrongCount: progress.wrongAnswers || 0,
          status: progress.status === "completed" ? "Đã hoàn thành" : "Đang học",
        };
      }
      return c;
    };
    setPart1Levels((prev) => prev.map(updateCard));
    setPart1Categories((prev) => prev.map(updateCard));
    setPart2Levels((prev) => prev.map(updateCard));
    setPart2Categories((prev) => prev.map(updateCard));
    setPart3Levels((prev) => prev.map(updateCard));
    setPart3Categories((prev) => prev.map(updateCard));
    setPart4Levels((prev) => prev.map(updateCard));
    setPart4Categories((prev) => prev.map(updateCard));
  };

  const handleSubmitRealExam = () => {
    if (isExamSubmitted) return;
    const totalQ = quizModalCard.originalTotalQuestions || quizModalCard.totalQuestions || quizModalCard.questions?.length || 0;
    const nextChecked: { [qId: number]: boolean } = { ...quizAnswerChecked };
    let correctCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;
    let latestProgress = getItemProgress(`listening-quiz-${quizModalCard.id}`, totalQ);

    quizModalCard.questions.forEach((q) => {
      nextChecked[q.id] = true;
      const chosen = quizSelectedOption[q.id];
      const isCorrect = chosen !== undefined && chosen === q.correctAnswer;
      if (chosen !== undefined) {
        answeredCount += 1;
      }
      if (isCorrect) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
      latestProgress = recordQuestionAnswer(`listening-quiz-${quizModalCard.id}`, q.id, isCorrect, totalQ);
    });

    setQuizAnswerChecked(nextChecked);
    setIsExamSubmitted(true);
    setShowExamResultModal(true);
    playSfx(correctCount >= Math.ceil(quizModalCard.questions.length * 0.6) ? "correct" : "wrong");

    void saveListeningUnitProgress({
      unitId: quizModalCard.id,
      completedQuestions: latestProgress.completedQuestions,
      totalQuestions: totalQ,
      correctCount: latestProgress.correctAnswers || correctCount,
      wrongCount: latestProgress.wrongAnswers || wrongCount,
      wrongQuestionIds: latestProgress.wrongQuestionIds || [],
      answeredQuestionIds: latestProgress.answeredQuestionIds || [],
      flaggedQuestionIds: flaggedReviewIds,
      userNotes: practiceUserNotes,
      status: latestProgress.status === "completed" ? "COMPLETED" : "IN_PROGRESS",
      lastQuestionIndex: activeQuizQIndex,
    });

    void recordListeningAttempt({
      targetType: "UNIT",
      targetId: quizModalCard.id,
      targetTitle: `${quizModalCard.title} (Chế độ Thi thật)`,
      part: quizModalCard.part,
      mode: "REAL_EXAM",
      totalQuestions: quizModalCard.questions.length,
      completedQuestions: answeredCount,
      correctCount,
      wrongCount,
      durationSeconds: quizTimerSeconds,
      xpEarned: correctCount * 15,
      details: {
        examMode: true,
        answers: quizSelectedOption,
      },
    }).then(() => {
      onCompletedAttempt?.();
    });

    const updateCard = (c: LevelCategoryCardData): LevelCategoryCardData => {
      if (c.id === quizModalCard.id) {
        return {
          ...c,
          completedQuestions: latestProgress.completedQuestions,
          correctCount: latestProgress.correctAnswers || correctCount,
          wrongCount: latestProgress.wrongAnswers || wrongCount,
          status: latestProgress.status === "completed" ? "Đã hoàn thành" : "Đang học",
        };
      }
      return c;
    };
    setPart1Levels((prev) => prev.map(updateCard));
    setPart1Categories((prev) => prev.map(updateCard));
    setPart2Levels((prev) => prev.map(updateCard));
    setPart2Categories((prev) => prev.map(updateCard));
    setPart3Levels((prev) => prev.map(updateCard));
    setPart3Categories((prev) => prev.map(updateCard));
    setPart4Levels((prev) => prev.map(updateCard));
    setPart4Categories((prev) => prev.map(updateCard));
    triggerToast(`Đã nộp bài Thi thật! Kết quả: ${correctCount}/${quizModalCard.questions.length} câu đúng.`);
  };

  React.useEffect(() => {
    if (isRealExamMode && !isExamSubmitted && quizTimerSeconds >= examTimeLimitSeconds) {
      handleSubmitRealExam();
    }
  }, [isRealExamMode, isExamSubmitted, quizTimerSeconds, examTimeLimitSeconds]);

  const isGroupMode = quizModalCard.part === "Part 3" || quizModalCard.part === "Part 4";
  const currentGroupQuestions = useMemo(() => {
    const activeQ = quizModalCard.questions[activeQuizQIndex] || quizModalCard.questions[0];
    if (!activeQ) return [];
    if (!isGroupMode) return [activeQ];
    const targetAudio = activeQ.audioUrl || "";
    const targetTranscript = activeQ.fullTranscript || "";
    const matching = quizModalCard.questions.filter(
      (item) => item.audioUrl === targetAudio && (targetTranscript ? item.fullTranscript === targetTranscript : true)
    );
    if (matching.length > 0 && matching.length <= 4) {
      return matching;
    }
    const groupStart = Math.floor(activeQuizQIndex / 3) * 3;
    return quizModalCard.questions.slice(groupStart, groupStart + 3);
  }, [isGroupMode, quizModalCard.questions, activeQuizQIndex]);
  const isGroupChecked = isGroupMode
    ? currentGroupQuestions.length > 0 && currentGroupQuestions.every((q) => !!quizAnswerChecked[q.id])
    : !!quizAnswerChecked[quizModalCard.questions[activeQuizQIndex]?.id];
  const isAllGroupAnswered = isGroupMode && currentGroupQuestions.length > 0 && currentGroupQuestions.every((q) => !!quizSelectedOption[q.id]);

  const sessionCorrectCount = useMemo(() => {
    return quizModalCard.questions.filter((q) => {
      const selected = quizSelectedOption[q.id];
      const isChecked = quizAnswerChecked[q.id];
      return isChecked && selected !== undefined && selected === q.correctAnswer;
    }).length;
  }, [quizModalCard.questions, quizSelectedOption, quizAnswerChecked]);

  const combinedVocabItems = (() => {
    const map = new Map<
      string,
      {
        word: string;
        pos: string;
        level: string;
        ipa: string;
        meaning: string;
        example?: { en: string; vi: string };
        collocations?: { en: string; vi: string }[];
        synonyms?: { en: string; vi: string }[];
        antonyms?: { en: string; vi: string }[];
        wordFamily?: { word: string; pos: string; meaning: string }[];
      }
    >();
    currentGroupQuestions.forEach((q) => {
      const list = q.vocabList || [];
      list.forEach((item) => map.set(item.word, item));
    });
    return Array.from(map.values());
  })();

  const toggleExpandSingleWord = (word: string) => {
    setExpandedVocabWords((prev) => ({ ...prev, [word]: !prev[word] }));
  };

  const toggleExpandAllVocab = () => {
    const nextState = !isAllVocabExpanded;
    setIsAllVocabExpanded(nextState);
    const newMap: Record<string, boolean> = {};
    combinedVocabItems.forEach((v) => {
      newMap[v.word] = nextState;
    });
    setExpandedVocabWords(newMap);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150">
      {/* TOP HEADER BAR */}
      <header className="h-14 bg-[#1e60f0] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setQuizModalCard(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
            {quizModalCard.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Toggle Practice Mode vs Real Exam Mode */}
          <div className="inline-flex items-center rounded-xl bg-white/15 p-0.5 border border-white/25">
            <button
              type="button"
              onClick={() => {
                if (isRealExamMode) {
                  setIsRealExamMode(false);
                  triggerToast("Đã chuyển sang Chế độ Luyện tập 🎯");
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                !isRealExamMode ? "bg-white text-blue-700 shadow-xs" : "text-white/90 hover:text-white"
              }`}
            >
              🎯 Luyện tập
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isRealExamMode) {
                  setIsRealExamMode(true);
                  setIsExamSubmitted(false);
                  setShowExamResultModal(false);
                  setShowBilingualQuiz(false);
                  setQuizAnswerChecked({});
                  setQuizSelectedOption({});
                  setQuizTimerSeconds(0);
                  setActiveQuizQIndex(0);
                  triggerToast("Đã bật Chế độ Thi thật ⏱: Audio nghe 1 lần, chấm điểm khi Nộp bài!");
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                isRealExamMode ? "bg-rose-600 text-white shadow-xs" : "text-white/90 hover:text-white"
              }`}
            >
              ⏱ Thi thật
            </button>
          </div>

          {(!isRealExamMode || isExamSubmitted) && (
            <button
              type="button"
              onClick={() => {
                const next = !showBilingualQuiz;
                setShowBilingualQuiz(next);
                triggerToast(next ? "Đã bật dịch song ngữ Tiếng Việt 👑" : "Đã tắt hiển thị song ngữ");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 ring-2 ring-amber-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Song ngữ 👑</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsNotesModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Ghi chú</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAnnotatorActive(!isAnnotatorActive)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Annotator</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-white text-xs font-bold shadow-2xs ${
                isRealExamMode && !isExamSubmitted ? "bg-rose-600 ring-2 ring-rose-300" : "bg-white/15"
              }`}
              title={isRealExamMode && !isExamSubmitted ? "Thời gian đếm ngược Chế độ Thi thật" : "Thời gian làm bài"}
            >
              <Clock className="w-3.5 h-3.5" />
              {isRealExamMode && !isExamSubmitted
                ? `Còn ${formatTimer(Math.max(0, examTimeLimitSeconds - quizTimerSeconds))}`
                : formatTimer(quizTimerSeconds)}
            </span>
            {(!isRealExamMode || isExamSubmitted) ? (
              <>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  +{sessionCorrectCount * (isRealExamMode ? 15 : 10)} XP
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
                  ✓ {sessionCorrectCount}/{quizModalCard.questions.length}
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSubmitRealExam}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md ring-2 ring-white/40 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🏁 Nộp bài thi ({Object.keys(quizSelectedOption).length}/{quizModalCard.questions.length})</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ANNOTATOR BAR */}
      {isAnnotatorActive && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center justify-between shadow-xs select-none text-xs">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-amber-700" />
              Công cụ Bút vẽ Highlighting (Nhấn vào câu hỏi, đáp án hoặc lời thoại để tô màu):
            </span>
            <div className="flex items-center gap-1.5">
              {(["yellow", "green", "pink", "blue"] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAnnotatorColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                    color === "yellow"
                      ? "bg-yellow-400 border-yellow-500"
                      : color === "green"
                      ? "bg-emerald-400 border-emerald-500"
                      : color === "pink"
                      ? "bg-pink-400 border-pink-500"
                      : "bg-sky-400 border-sky-500"
                  } ${annotatorColor === color ? "scale-110 ring-2 ring-slate-800" : "opacity-70"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAnnotations({});
                triggerToast("Đã xóa tất cả đánh dấu highlight!");
              }}
              className="px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition cursor-pointer"
            >
              🧹 Xóa đánh dấu ({Object.keys(annotations).length})
            </button>
            <button
              type="button"
              onClick={() => setIsAnnotatorActive(false)}
              className="p-1 rounded-full text-amber-900 hover:bg-amber-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NOTES MODAL */}
      {isNotesModalOpen && currentQ && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ghi chú cá nhân</h3>
                  <p className="text-xs text-slate-500">Câu {currentQ.id} • {currentQ.part}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={5}
              value={practiceUserNotes[String(currentQ.id)] || ""}
              onChange={(e) => setPracticeUserNotes({ ...practiceUserNotes, [String(currentQ.id)]: e.target.value })}
              placeholder="Nhập ghi chú hoặc kiến thức cần nhớ..."
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...practiceUserNotes };
                  delete updated[String(currentQ.id)];
                  setPracticeUserNotes(updated);
                  syncUnitMetadataToDb(updated);
                  triggerToast("Đã xóa ghi chú của câu hỏi này trên hệ thống!");
                }}
                className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
              >
                🗑 Xóa ghi chú
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotesModalOpen(false);
                    syncUnitMetadataToDb(practiceUserNotes);
                    triggerToast("Đã đồng bộ ghi chú cá nhân lên cơ sở dữ liệu! 💾");
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  💾 Lưu ghi chú
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION GRID MODAL (Thiết kế tinh gọn theo Part và hình tròn: Đỏ sai, Xanh đúng, Vàng cần check lại) */}
      {isQuestionGridOpen && (() => {
        const questions = quizModalCard.questions;
        let correctCount = 0;
        let wrongCount = 0;
        let flaggedCount = 0;
        let answeredCount = 0;

        questions.forEach((q) => {
          const isFlagged = flaggedReviewIds.includes(q.id);
          if (isFlagged) flaggedCount++;

          const isChecked = !!quizAnswerChecked[q.id];
          const userAns = quizSelectedOption[q.id];
          if (userAns !== undefined) {
            answeredCount++;
            if (isChecked) {
              if (userAns === q.correctAnswer) correctCount++;
              else wrongCount++;
            }
          }
        });

        // Group questions by Part
        interface PartGroupItem {
          partName: string;
          items: typeof questions;
        }
        const partGroupsMap = new Map<string, typeof questions>();
        questions.forEach((q) => {
          const pName = q.part || "Phần thi";
          if (!partGroupsMap.has(pName)) {
            partGroupsMap.set(pName, []);
          }
          partGroupsMap.get(pName)!.push(q);
        });
        const partGroups = Array.from(partGroupsMap.entries()).map(([partName, items]) => ({ partName, items }));

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full max-h-[88vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Bảng danh sách câu hỏi</h3>
                    <p className="text-xs text-slate-500">
                      Tổng số <strong className="text-slate-800 font-bold">{questions.length} câu</strong> • Đã làm <strong className="text-blue-600 font-bold">{answeredCount}/{questions.length}</strong> câu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuestionGridOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Đóng bảng câu hỏi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Legend Bar (Chuẩn màu: Đỏ là sai, Xanh là đúng, Vàng là cần check lại) */}
              <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs font-semibold">
                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 sm:gap-x-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 inline-block shadow-2xs" />
                    <span className="text-slate-800">Xanh: Đúng <strong className="text-emerald-700 font-extrabold">({correctCount})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-600 inline-block shadow-2xs" />
                    <span className="text-slate-800">Đỏ: Sai <strong className="text-rose-700 font-extrabold">({wrongCount})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 inline-block shadow-2xs" />
                    <span className="text-slate-800">Vàng: Cần check lại <strong className="text-amber-800 font-extrabold">({flaggedCount})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-400 inline-block shadow-2xs" />
                    <span className="text-slate-700">Đã chọn ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 inline-block shadow-2xs" />
                    <span className="text-slate-500">Chưa làm ({questions.length - answeredCount})</span>
                  </div>
                </div>
              </div>

              {/* Circular Question Grid Grouped by Part */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 max-h-[55vh]">
                {partGroups.map((group) => (
                  <div key={group.partName} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <h4 className="text-sm font-bold text-slate-900">{group.partName}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                          {group.items.length} câu
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {group.items[0].id >= 100 ? `Câu ${group.items[0].id}` : `Câu 1 - ${group.items.length}`}
                      </div>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2.5 sm:gap-3 py-1 justify-items-center">
                      {group.items.map((q) => {
                        const idx = questions.findIndex((item) => item.id === q.id);
                        const isCurrent = idx === activeQuizQIndex;
                        const isFlagged = flaggedReviewIds.includes(q.id);
                        const isCheckedQ = !!quizAnswerChecked[q.id];
                        const userAns = quizSelectedOption[q.id];
                        const isRight = userAns === q.correctAnswer;
                        const numDisplay = q.id >= 100 ? String(q.id % 100 || q.id) : String(idx + 1);

                        let btnStyle = "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200";
                        let statusText = "Chưa làm";

                        if (isFlagged) {
                          btnStyle = "bg-amber-400 text-amber-950 border-2 border-amber-500 font-black shadow-xs hover:bg-amber-300";
                          statusText = "Cần check lại";
                        } else if (isCheckedQ) {
                          if (isRight) {
                            btnStyle = "bg-emerald-500 text-white border-2 border-emerald-600 font-extrabold shadow-xs hover:bg-emerald-600";
                            statusText = "Đúng";
                          } else {
                            btnStyle = "bg-rose-500 text-white border-2 border-rose-600 font-extrabold shadow-xs hover:bg-rose-600";
                            statusText = "Sai";
                          }
                        } else if (userAns !== undefined) {
                          btnStyle = "bg-blue-100 text-blue-900 border-2 border-blue-400 font-bold hover:bg-blue-200";
                          statusText = "Đã chọn";
                        }

                        return (
                          <button
                            key={q.id}
                            type="button"
                            title={`Câu ${numDisplay}: ${statusText}${isFlagged ? " (Đã đánh dấu cần check lại)" : ""}`}
                            onClick={() => {
                              setActiveQuizQIndex(idx);
                              setIsQuestionGridOpen(false);
                            }}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer relative active:scale-95 ${
                              isCurrent ? "ring-3 ring-blue-600 ring-offset-2 scale-110 z-10 font-black" : ""
                            } ${btnStyle}`}
                          >
                            <span>{numDisplay}</span>

                            {/* Corner indicator when flagged & checked */}
                            {isFlagged && isCheckedQ && (
                              <span
                                className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white shadow-xs ${
                                  isRight ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                                title={isRight ? "Đã kiểm tra: Đúng" : "Đã kiểm tra: Sai"}
                              />
                            )}
                            {/* Star icon when flagged and not checked */}
                            {isFlagged && !isCheckedQ && (
                              <span className="absolute -top-1 -right-1 text-amber-800 text-[10px] leading-none select-none">
                                ⭐
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  {flaggedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetIdx = questions.findIndex((q) => flaggedReviewIds.includes(q.id));
                        if (targetIdx !== -1) {
                          setActiveQuizQIndex(targetIdx);
                          setIsQuestionGridOpen(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>⭐</span>
                      <span>Đến câu cần check ({flaggedCount})</span>
                    </button>
                  )}
                  {wrongCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetIdx = questions.findIndex(
                          (q) => quizAnswerChecked[q.id] && quizSelectedOption[q.id] !== q.correctAnswer
                        );
                        if (targetIdx !== -1) {
                          setActiveQuizQIndex(targetIdx);
                          setIsQuestionGridOpen(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>🔴</span>
                      <span>Đến câu sai ({wrongCount})</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuestionGridOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer ml-auto"
                >
                  Đóng danh sách
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* DUAL PANE AREA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
        {quizModalCard.questions[activeQuizQIndex] && (() => {
          const q = quizModalCard.questions[activeQuizQIndex];

          return (
            <React.Fragment>
              {/* LEFT PANE */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Yêu cầu bài tập (Instruction)
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                    {(() => {
                      const p = q.part || quizModalCard.part;
                      if (p === "Part 1") return "Listen to the audio and select the best statement describing the photograph.";
                      if (p === "Part 2") return "Listen to the question and select the best response.";
                      if (p === "Part 3") return "Listen to the conversation and answer the questions below.";
                      if (p === "Part 4") return "Listen to the talk and answer the questions below.";
                      return "Listen to the audio and answer the questions.";
                    })()}
                  </h2>

                  {/* Audio Player Box (Interactive Waveform, Rewind, Forward & Click-to-Seek) */}
                  <AudioWaveformPlayer
                    audioUrl={resolvedAudioUrl}
                    isPlaying={isPlayingAudio}
                    onPlayPauseChange={(playing) => setIsPlayingAudio(playing)}
                    showSpeedControl={!isRealExamMode || isExamSubmitted}
                    showReplayButton={!isRealExamMode || isExamSubmitted}
                    examMode={isRealExamMode && !isExamSubmitted}
                    title={`Audio ${quizModalCard.part || "Part 1"} • Câu ${activeQuizQIndex + 1}`}
                  />

                  {/* Photograph for Part 1 */}
                  {q.imageUrl && (
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-100/80 p-2.5 shadow-xs flex items-center justify-center overflow-hidden">
                      <img
                        src={q.imageUrl}
                        alt="Part 1 Photograph"
                        className="max-h-[380px] sm:max-h-[440px] w-auto max-w-full rounded-xl object-contain shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Script & Translation ONLY when checked */}
                  {isGroupChecked && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4 shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
                        <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-blue-900">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Audio Script (Lời thoại tiếng Anh)</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          English
                        </span>
                      </div>
                      <p
                        onClick={() => toggleAnnotationKey(`transcript-${q.id}`)}
                        className={`text-base sm:text-lg font-medium text-slate-900 whitespace-pre-line leading-relaxed sm:leading-loose select-text ${
                          isAnnotatorActive ? "cursor-pointer hover:bg-amber-100/50 rounded-lg p-1 transition" : ""
                        } ${getAnnotationHighlightClass(`transcript-${q.id}`)}`}
                      >
                        {q.fullTranscript}
                      </p>

                      {q.vietnameseTranslation && (
                        <div className="pt-3 border-t border-blue-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-blue-900">
                              <Languages className="w-4 h-4 text-blue-600" />
                              <span>Bản dịch tiếng Việt</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                              Tiếng Việt
                            </span>
                          </div>
                          <p className="text-base sm:text-lg text-slate-800 italic whitespace-pre-line leading-relaxed sm:leading-loose select-text">
                            {q.vietnameseTranslation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANE: QUESTIONS & OPTIONS */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
                {isGroupMode ? (
                  /* GROUP MODE (PART 3 & 4) */
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-2 shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                          {quizModalCard.targetLevel || "Lv.2"}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                          {quizModalCard.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAiTutorModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hỏi bài AI</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {currentGroupQuestions.map((qItem, idx) => {
                        const chosenOpt = quizSelectedOption[qItem.id];
                        const isChecked = isGroupChecked;
                        const qNumDisplay = qItem.id >= 100 ? (qItem.id % 100) : (idx + 1);

                        return (
                          <div key={qItem.id} className="p-5 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div
                                onClick={() => toggleAnnotationKey(`stem-${qItem.id}`)}
                                className={`text-sm font-extrabold text-slate-900 leading-snug ${
                                  isAnnotatorActive ? "cursor-pointer hover:bg-amber-100/60 rounded px-1 transition" : ""
                                } ${getAnnotationHighlightClass(`stem-${qItem.id}`)}`}
                              >
                                {qNumDisplay}. {qItem.question || qItem.fullTranscript}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleFlagReview(qItem.id)}
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  flaggedReviewIds.includes(qItem.id)
                                    ? "border-amber-300 bg-amber-50 text-amber-500"
                                    : "border-slate-200 text-slate-400 hover:text-slate-600"
                                }`}
                              >
                                <Star className={`w-4 h-4 ${flaggedReviewIds.includes(qItem.id) ? "fill-amber-400 text-amber-500" : ""}`} />
                              </button>
                            </div>

                            {qItem.options && (
                              <div className="space-y-2.5">
                                {Object.entries(qItem.options).map(([optKey, optVal]) => {
                                  const isChosen = chosenOpt === optKey;
                                  const isRight = optKey === qItem.correctAnswer;
                                  const optTrans = qItem.optionTranslations ? qItem.optionTranslations[optKey] : "";

                                  let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                                  let textColor = "text-slate-900";
                                  let iconNode: React.ReactNode = (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                                      {isChosen && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                    </div>
                                  );

                                  if (isChosen && !isChecked) {
                                    cardStyle = "bg-blue-50/80 border-blue-500 text-blue-950 font-semibold ring-2 ring-blue-400/20";
                                    textColor = "text-blue-900 font-bold";
                                  }

                                  if (isChecked) {
                                    if (isRight) {
                                      cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                                      textColor = "text-emerald-700 font-bold";
                                      iconNode = (
                                        <div className="w-4 h-4 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-black bg-emerald-50">
                                          ✓
                                        </div>
                                      );
                                    } else if (isChosen) {
                                      cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                                      textColor = "text-rose-700 font-bold";
                                      iconNode = (
                                        <div className="w-4 h-4 rounded-full border border-rose-600 text-rose-600 flex items-center justify-center shrink-0 text-[10px] font-black bg-rose-50">
                                          ✕
                                        </div>
                                      );
                                    } else {
                                      cardStyle = "bg-white border-slate-200 text-slate-800";
                                      textColor = "text-slate-800 font-medium";
                                      iconNode = (
                                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                                      );
                                    }
                                  }

                                  return (
                                    <div
                                      key={optKey}
                                      onClick={() => {
                                        if (isAnnotatorActive) {
                                          toggleAnnotationKey(`opt-${qItem.id}-${optKey}`);
                                          return;
                                        }
                                        playSfx("click");
                                        if (isChecked) return;
                                        const nextSelected = { ...quizSelectedOption, [qItem.id]: optKey };
                                        setQuizSelectedOption(nextSelected);
                                        if (isRealExamMode && !isExamSubmitted) {
                                          return;
                                        }

                                        // Auto-check only when all questions in group are answered
                                        const allGroupDone = currentGroupQuestions.length > 0 && currentGroupQuestions.every((item) => !!nextSelected[item.id]);

                                        if (allGroupDone) {
                                          const nextChecked = { ...quizAnswerChecked };
                                          currentGroupQuestions.forEach((item) => {
                                            nextChecked[item.id] = true;
                                            updateCardStats(item, nextSelected[item.id]);
                                          });
                                          setQuizAnswerChecked(nextChecked);
                                          playSfx("correct");
                                        }


                                      }}
                                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {iconNode}
                                        <span className={`text-sm ${textColor} ${getAnnotationHighlightClass(`opt-${qItem.id}-${optKey}`)}`}>
                                          ({optKey}) {optVal}
                                        </span>
                                      </div>
                                      {(isChecked || showBilingualQuiz) && optTrans && (
                                        <div className="flex items-center gap-2 pl-7 pt-0.5">
                                          <span className="text-blue-500 font-bold text-xs">|</span>
                                          <span className="text-xs font-semibold text-blue-700">
                                            {optTrans}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* EXPLANATION BOX FOR GROUP MODE */}
                            {isChecked && (qItem.explanation || qItem.trapNote) && (
                              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                                <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-blue-600" />
                                  <span>Giải thích chi tiết câu {idx + 1}:</span>
                                </div>
                                <p className="text-slate-800 font-medium leading-relaxed">{qItem.explanation}</p>
                                {qItem.trapNote && (
                                  <p className="text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-semibold">
                                    ⚠️ <strong>Bẫy cần tránh:</strong> {qItem.trapNote}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* GROUP ACTION BUTTONS */}
                    {!isGroupChecked && (
                      <div className="pt-2">
                        {isRealExamMode && !isExamSubmitted ? (
                          <button
                            type="button"
                            onClick={handleSubmitRealExam}
                            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              🏁 Nộp bài thi & Chấm toàn bộ ({Object.keys(quizSelectedOption).length}/{quizModalCard.questions.length} câu đã chọn)
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const answeredCount = currentGroupQuestions.filter((item) => !!quizSelectedOption[item.id]).length;
                              if (answeredCount === 0) {
                                triggerToast("Vui lòng chọn đáp án trước khi kiểm tra!");
                                return;
                              }
                              const nextChecked = { ...quizAnswerChecked };
                              currentGroupQuestions.forEach((item) => {
                                nextChecked[item.id] = true;
                                if (quizSelectedOption[item.id]) {
                                  updateCardStats(item, quizSelectedOption[item.id]);
                                }
                              });
                              setQuizAnswerChecked(nextChecked);
                              playSfx("correct");
                              triggerToast("Đã kiểm tra đáp án toàn bộ nhóm câu!");
                            }}
                            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Kiểm tra đáp án nhóm ({currentGroupQuestions.filter((item) => !!quizSelectedOption[item.id]).length}/{currentGroupQuestions.length} câu đã chọn)
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* VOCABULARY SECTION FOR GROUP MODE */}
                    {isGroupChecked && combinedVocabItems.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-5 space-y-4 mt-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                            <span>Từ vựng trọng tâm bài nghe ({combinedVocabItems.length} từ)</span>
                          </div>

                          <button
                            type="button"
                            onClick={toggleExpandAllVocab}
                            className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-amber-300"
                          >
                            {isAllVocabExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>{isAllVocabExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {combinedVocabItems.map((v, vIdx) => {
                            const isExpanded = !!expandedVocabWords[v.word] || isAllVocabExpanded;

                            return (
                              <div key={vIdx} className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                                    {v.level && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{v.level}</span>}
                                    {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => playAudio(v.word)}
                                      className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                                      title="Nghe phát âm"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveWordToBag({
                                          word: v.word,
                                          pos: v.pos,
                                          ipa: v.ipa,
                                          meaning: v.meaning,
                                        })
                                      }
                                      className={`p-1 rounded-lg border transition cursor-pointer ${
                                        savedVocabItems.some((item) => item.word.toLowerCase() === v.word.toLowerCase())
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                      }`}
                                      title="Lưu vào Giỏ từ"
                                    >
                                      <Bookmark className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleExpandSingleWord(v.word)}
                                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                                    >
                                      <Search className="w-3 h-3" />
                                      <span>{isExpanded ? "Thu gọn" : "🔍 Xem chi tiết"}</span>
                                    </button>
                                  </div>

                                </div>

                                <p className="font-bold text-slate-800">{v.meaning}</p>

                                {isExpanded && (() => {
                                  const detail = getEnrichedVocabDetail(v, currentGroupQuestions[0]?.fullTranscript || currentGroupQuestions[0]?.question || "");
                                  return (
                                    <div className="pt-3 border-t border-amber-200/70 space-y-3 animate-in fade-in duration-150">
                                      {/* 1. Lời giải thích chi tiết & ngữ cảnh */}
                                      <div className="space-y-1">
                                        <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                          <span>💡 Giải thích chi tiết &amp; Ngữ cảnh bài thi:</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 leading-relaxed text-xs">
                                          {detail.explanation}
                                        </div>
                                      </div>

                                      {/* 2. Ví dụ câu thực tế */}
                                      {detail.example && (
                                        <div className="space-y-1">
                                          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                            <span>📝 Ví dụ câu trong đề thi:</span>
                                          </div>
                                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1 text-xs">
                                            <p className="font-semibold text-slate-900">&quot;{typeof detail.example === "string" ? detail.example : detail.example.en}&quot;</p>
                                            {typeof detail.example === "object" && detail.example.vi && (
                                              <p className="text-slate-600 italic">👉 {detail.example.vi}</p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* 3. Cụm từ hay gặp */}
                                      {detail.collocations && detail.collocations.length > 0 && (
                                        <div className="space-y-1">
                                          <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                            <span>🔗 Cụm từ hay gặp (Collocations):</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {detail.collocations.map((col: any, cIdx: number) => (
                                              <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                                <strong>{col.en}</strong>: {col.vi}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* SINGLE QUESTION MODE (PART 1 & 2) */
                  <div className="space-y-5">
                    <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                          {quizModalCard.targetLevel || "Lv.1"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAiTutorModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Hỏi bài AI</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFlagReview(q.id)}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                              flaggedReviewIds.includes(q.id)
                                ? "border-amber-300 bg-amber-50 text-amber-500"
                                : "border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <Star className={`w-4 h-4 ${flaggedReviewIds.includes(q.id) ? "fill-amber-400 text-amber-500" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {(() => {
                        const currentPart = q.part || quizModalCard.part;
                        const isPart2 = currentPart === "Part 2";
                        const isPart1 = currentPart === "Part 1";
                        const isChecked = !!quizAnswerChecked[q.id];

                        let promptText = q.question;
                        if (isPart2) {
                          promptText = isChecked ? q.question : "";
                        } else if (isPart1) {
                          promptText = isChecked ? (q.question || q.fullTranscript) : "";
                        }

                        return (
                          <div
                            onClick={() => toggleAnnotationKey(`stem-${q.id}`)}
                            className={`text-base font-extrabold text-slate-900 ${
                              isAnnotatorActive ? "cursor-pointer hover:bg-amber-100/60 rounded px-1 transition" : ""
                            } ${getAnnotationHighlightClass(`stem-${q.id}`)}`}
                          >
                            {activeQuizQIndex + 1}.{promptText ? ` ${promptText}` : ""}
                          </div>
                        );
                      })()}

                      {q.options && (() => {
                        const currentPart = q.part || quizModalCard.part;
                        const isPart1 = currentPart === "Part 1";
                        const isPart2 = currentPart === "Part 2";
                        const hideTextBeforeCheck = isPart1 || isPart2;

                        let entries = Object.entries(q.options);
                        if (isPart2) {
                          entries = entries.filter(([optKey]) => optKey !== "D");
                        }

                        const isChecked = !!quizAnswerChecked[q.id];

                        return (
                          <div className="space-y-3">
                            {entries.map(([optKey, optVal]) => {
                              const isChosen = quizSelectedOption[q.id] === optKey;
                              const isRight = optKey === q.correctAnswer;
                              const optTrans = q.optionTranslations ? q.optionTranslations[optKey] : "";

                              let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                              let textColor = "text-slate-900";
                              let iconNode: React.ReactNode = (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                                  {isChosen && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                </div>
                              );

                              if (isChecked) {
                                if (isRight) {
                                  cardStyle = "bg-emerald-50/70 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400/40";
                                  textColor = "text-emerald-800 font-semibold";
                                  iconNode = (
                                    <div className="w-4 h-4 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-black bg-emerald-50">
                                      ✓
                                    </div>
                                  );
                                } else if (isChosen) {
                                  cardStyle = "bg-rose-50/70 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-400/40";
                                  textColor = "text-rose-800 font-semibold";
                                  iconNode = (
                                    <div className="w-4 h-4 rounded-full border border-rose-600 text-rose-600 flex items-center justify-center shrink-0 text-[10px] font-black bg-rose-50">
                                      ✕
                                    </div>
                                  );
                                } else {
                                  cardStyle = "bg-white border-slate-200 text-slate-800";
                                  textColor = "text-slate-800 font-medium";
                                  iconNode = hideTextBeforeCheck ? null : (
                                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                                  );
                                }
                              }

                              const labelText = (!isChecked && hideTextBeforeCheck) ? `(${optKey})` : `(${optKey}) ${optVal}`;

                              return (
                                <div
                                  key={optKey}
                                  onClick={() => {
                                    if (isAnnotatorActive) {
                                      toggleAnnotationKey(`opt-${q.id}-${optKey}`);
                                      return;
                                    }
                                    playSfx("click");
                                    if (isChecked) return;
                                    const nextSelected = { ...quizSelectedOption, [q.id]: optKey };
                                    setQuizSelectedOption(nextSelected);
                                    if (isRealExamMode && !isExamSubmitted) {
                                      return;
                                    }
                                    setQuizAnswerChecked({ ...quizAnswerChecked, [q.id]: true });
                                    updateCardStats(q, optKey);

                                  }}
                                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {iconNode}
                                    <span className={`text-sm ${textColor} ${getAnnotationHighlightClass(`opt-${q.id}-${optKey}`)}`}>{labelText}</span>
                                  </div>

                                  {isChecked && optTrans && (
                                    <div className="flex items-center gap-2 pl-4 pt-0.5">
                                      <span className="text-blue-500 font-bold text-xs">|</span>
                                      <span className="text-xs font-semibold text-blue-700">
                                        {optTrans}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* DETAILED EXPLANATION & VOCAB SECTION FOR SINGLE QUESTION MODE (PART 1 & 2) */}
                    {quizAnswerChecked[q.id] && (
                      <div className="space-y-4 pt-2">
                        {/* EXPLANATION BOX */}
                        <div className="rounded-3xl border border-blue-200/90 bg-blue-50/40 p-5 space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span>Giải thích chi tiết & Bẫy cần tránh</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                            {q.explanation || "Chưa có nội dung giải thích."}
                          </p>
                          {q.trapNote && (
                            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                              ⚠️ <strong>Bẫy cần tránh:</strong> {q.trapNote}
                            </div>
                          )}
                        </div>

                        {/* VOCABULARY SECTION */}
                        {(() => {
                          const singleVocabList = q.vocabList || [];

                          if (singleVocabList.length === 0) return null;

                          return (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 space-y-4 shadow-2xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                                  <BookOpen className="w-4 h-4 text-amber-600" />
                                  <span>Từ vựng trọng tâm bài nghe ({singleVocabList.length} từ)</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextState = !isAllVocabExpanded;
                                    setIsAllVocabExpanded(nextState);
                                    const newMap: Record<string, boolean> = {};
                                    singleVocabList.forEach((v) => {
                                      newMap[v.word] = nextState;
                                    });
                                    setExpandedVocabWords(newMap);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-amber-300"
                                >
                                  {isAllVocabExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  <span>{isAllVocabExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}</span>
                                </button>
                              </div>

                              <div className="space-y-3">
                                {singleVocabList.map((v, idx) => {
                                  const isExpanded = !!expandedVocabWords[v.word] || isAllVocabExpanded;

                                  return (
                                    <div key={idx} className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 text-xs">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                                          {v.level && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{v.level}</span>}
                                          {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => playAudio(v.word)}
                                            className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                                            title="Nghe phát âm"
                                          >
                                            <Volume2 className="w-3.5 h-3.5" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSaveWordToBag({
                                                word: v.word,
                                                pos: v.pos,
                                                ipa: v.ipa,
                                                meaning: v.meaning,
                                              })
                                            }
                                            className={`p-1 rounded-lg border transition cursor-pointer ${
                                              savedVocabItems.some((item) => item.word.toLowerCase() === v.word.toLowerCase())
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                            }`}
                                            title="Lưu vào Giỏ từ"
                                          >
                                            <Bookmark className="w-3.5 h-3.5" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => toggleExpandSingleWord(v.word)}
                                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                                          >
                                            <Search className="w-3 h-3" />
                                            <span>{isExpanded ? "Thu gọn" : "🔍 Xem chi tiết"}</span>
                                          </button>
                                        </div>
                                      </div>

                                      <p className="font-bold text-slate-800">{v.meaning}</p>

                                      {isExpanded && (() => {
                                        const detail = getEnrichedVocabDetail(v, q.fullTranscript || q.question || "");
                                        return (
                                          <div className="pt-3 border-t border-amber-200/70 space-y-3 animate-in fade-in duration-150">
                                            {/* 1. Lời giải thích chi tiết & ngữ cảnh */}
                                            <div className="space-y-1">
                                              <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                                <span>💡 Giải thích chi tiết &amp; Ngữ cảnh bài thi:</span>
                                              </div>
                                              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 leading-relaxed text-xs">
                                                {detail.explanation}
                                              </div>
                                            </div>

                                            {/* 2. Ví dụ câu thực tế */}
                                            {detail.example && (
                                              <div className="space-y-1">
                                                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                                  <span>📝 Ví dụ câu trong đề thi:</span>
                                                </div>
                                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1 text-xs">
                                                  <p className="font-semibold text-slate-900">&quot;{typeof detail.example === "string" ? detail.example : detail.example.en}&quot;</p>
                                                  {typeof detail.example === "object" && detail.example.vi && (
                                                    <p className="text-slate-600 italic">👉 {detail.example.vi}</p>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* 3. Cụm từ hay gặp */}
                                            {detail.collocations && detail.collocations.length > 0 && (
                                              <div className="space-y-1">
                                                <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                                  <span>🔗 Cụm từ hay gặp (Collocations):</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {detail.collocations.map((col: any, cIdx: number) => (
                                                    <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                                      <strong>{col.en}</strong>: {col.vi}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })()}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <QuestionErrorReportButton source="LISTENING"
            questionRef={questionRef}
            relatedContent={`${quizModalCard.part} · ${quizModalCard.title} · Câu ${activeQuizQIndex + 1}`}
            questionSnapshot={{ questionText: currentQ.question || currentQ.fullTranscript, options: currentQ.options, correctAnswer: currentQ.correctAnswer, explanation: currentQ.explanation, imageUrl: currentQ.imageUrl, audioUrl: resolvedAudioUrl, part: currentQ.part }}
            compact onSubmitted={(ticket) => triggerToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)} />

          <button
            type="button"
            onClick={() => setIsVocabBagModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Giỏ từ ({savedVocabItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDictionaryInitialWord("");
              setIsDictionaryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Tra từ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lịch sử</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeQuizQIndex === 0}
            onClick={() => {
              if (!isGroupMode) {
                setActiveQuizQIndex((prev) => Math.max(0, prev - 1));
              } else {
                const prevCandidates = quizModalCard.questions.filter((q, idx) => idx < activeQuizQIndex && q.audioUrl !== currentQ?.audioUrl);
                if (prevCandidates.length > 0) {
                  const targetAudio = prevCandidates[prevCandidates.length - 1].audioUrl;
                  const targetIdx = quizModalCard.questions.findIndex((q) => q.audioUrl === targetAudio);
                  if (targetIdx !== -1) setActiveQuizQIndex(targetIdx);
                } else {
                  setActiveQuizQIndex(0);
                }
              }
            }}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title={isGroupMode ? "Đoạn hội thoại trước" : "Câu trước"}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionGridOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>
              {isGroupMode && currentGroupQuestions.length > 0
                ? `Câu ${currentGroupQuestions[0].id >= 100 ? currentGroupQuestions[0].id % 100 : 1}-${currentGroupQuestions[currentGroupQuestions.length - 1].id >= 100 ? currentGroupQuestions[currentGroupQuestions.length - 1].id % 100 : currentGroupQuestions.length} / ${quizModalCard.questions.length}`
                : `Câu ${activeQuizQIndex + 1}/${quizModalCard.questions.length}`}
            </span>
          </button>

          <button
            type="button"
            disabled={activeQuizQIndex >= quizModalCard.questions.length - 1}
            onClick={() => {
              if (!isGroupMode) {
                setActiveQuizQIndex((prev) => Math.min(quizModalCard.questions.length - 1, prev + 1));
              } else {
                const nextIdx = quizModalCard.questions.findIndex((q, idx) => idx > activeQuizQIndex && q.audioUrl !== currentQ?.audioUrl);
                if (nextIdx !== -1) {
                  setActiveQuizQIndex(nextIdx);
                } else {
                  setActiveQuizQIndex(quizModalCard.questions.length - 1);
                }
              }
            }}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title={isGroupMode ? "Đoạn hội thoại tiếp theo" : "Câu tiếp theo"}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      <ListeningDictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
        savedWords={savedVocabItems}
        onSaveWord={handleSaveWordToBag}
        playAudio={playAudio}
      />

      <ListeningPersonalVocabBagModal
        isOpen={isVocabBagModalOpen}
        onClose={() => setIsVocabBagModalOpen(false)}
        savedWords={savedVocabItems}
        lessonVocab={combinedVocabItems.map((v) => ({
          word: v.word,
          ipa: v.ipa,
          pos: v.pos,
          meaning: v.meaning,
          example: typeof v.example === "object" ? v.example?.en : v.example,
        }))}
        onToggleSaveWord={(item) => {
          const exists = savedVocabItems.some((w) => w.word.toLowerCase() === item.word.toLowerCase());
          if (exists) {
            handleRemoveWordFromBag(item.word);
          } else {
            handleSaveWordToBag(item);
          }
        }}
        playAudio={playAudio}
        isLocked={!isGroupChecked}
      />

      <ListeningAiTutorModal
        isOpen={isAiTutorModalOpen}
        onClose={() => setIsAiTutorModalOpen(false)}
        part={currentQ?.part || quizModalCard.part}
        questionText={currentQ?.question}
        transcript={currentQ?.fullTranscript}
        options={currentQ?.options}
        correctAnswer={currentQ?.correctAnswer}
        explanation={currentQ?.explanation}
        trapNote={currentQ?.trapNote}
        isAnswerUnlocked={isGroupChecked}
      />

      <ListeningAttemptHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        targetId={quizModalCard.id}
        title={`Lịch sử làm bài • ${quizModalCard.part} · ${quizModalCard.title}`}
      />

      {/* REAL EXAM RESULT SUMMARY MODAL */}
      {showExamResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black shadow-xs">
                🏁
              </div>
              <h3 className="text-lg font-black text-slate-900">Kết quả Chế độ Thi thật</h3>
              <p className="text-xs text-slate-500">
                {quizModalCard.part} • {quizModalCard.title}
              </p>
            </div>

            {(() => {
              const total = quizModalCard.questions.length;
              const correct = sessionCorrectCount;
              const accuracy = total > 0 ? Math.round((correct * 100) / total) : 0;
              const estListeningScore = Math.min(495, Math.max(5, Math.round((5 + (accuracy / 100) * 490) / 5) * 5));
              return (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase">Số câu đúng</div>
                    <div className="text-xl font-black text-emerald-700 mt-1">
                      {correct}/{total} ({accuracy}%)
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                    <div className="text-[11px] font-bold text-blue-800 uppercase">Điểm LC quy đổi</div>
                    <div className="text-xl font-black text-blue-700 mt-1">
                      ~{estListeningScore}/495
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                    <div className="text-[11px] font-bold text-amber-800 uppercase">Thời gian làm</div>
                    <div className="text-base font-black text-amber-700 mt-1">
                      {formatTimer(quizTimerSeconds)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                    <div className="text-[11px] font-bold text-indigo-800 uppercase">Điểm thưởng XP</div>
                    <div className="text-base font-black text-indigo-700 mt-1">
                      +{correct * 15} XP
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              💡 Kết quả bài thi thật đã được đồng bộ vào hệ thống <strong>Analytics &amp; BKT Recommendation</strong> để cập nhật lộ trình ôn tập cá nhân hóa của bạn.
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowExamResultModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                📖 Xem giải thích &amp; Transcript
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExamResultModal(false);
                  setQuizModalCard(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
