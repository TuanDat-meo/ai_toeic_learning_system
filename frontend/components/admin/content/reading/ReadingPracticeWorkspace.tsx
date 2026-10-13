"use client";

import React, { useState } from "react";
import { ExerciseCardData, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import {
  ArrowLeft,
  Languages,
  FileText,
  Pencil,
  Clock,
  Zap,
  Sparkles,
  HelpCircle,
  Star,
  BookOpen,
  Plus,
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";

interface ReadingPracticeWorkspaceProps {
  card: ExerciseCardData;
  onClose: () => void;
  playSfx: (type?: "correct" | "wrong" | "click") => void;
  showToast: (msg: string) => void;
}

export const ReadingPracticeWorkspace: React.FC<ReadingPracticeWorkspaceProps> = ({
  card,
  onClose,
  playSfx,
  showToast,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionWrongCount, setSessionWrongCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [energyScore, setEnergyScore] = useState(0);

  // Default isBilingual = false to prevent answer/translation leakage before selection
  const [isBilingual, setIsBilingual] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);

  // Vocabulary Expansion States
  const [isVocabExpanded, setIsVocabExpanded] = useState(false);
  const [expandedWords, setExpandedWords] = useState<Record<number, boolean>>({});

  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showWordBasketModal, setShowWordBasketModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictQuery, setDictQuery] = useState("");
  const [dictResult, setDictResult] = useState<{ word: string; meaning: string; ipa: string; pos: string } | null>(null);

  // Track answer state for each question in grid
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, { selected: number; isCorrect: boolean }>>({});

  // Timer effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const baseQuestion: SampleQuestion = card.sampleQuestions[currentQuestionIndex] || card.sampleQuestions[0];
  const questionRef = `READING-${card.id}-${baseQuestion.questionNum || currentQuestionIndex + 1}`;
  const [questionCorrectionState, setQuestionCorrectionState] = useState<{ ref: string; value: QuestionCorrection | null } | null>(null);
  React.useEffect(() => {
    let active = true;
    getQuestionCorrection(questionRef).then((correction) => { if (active) setQuestionCorrectionState({ ref: questionRef, value: correction }); }).catch(() => undefined);
    return () => { active = false; };
  }, [questionRef]);
  const questionCorrection = questionCorrectionState?.ref === questionRef ? questionCorrectionState.value : null;
  const correctedOptions = Array.isArray(questionCorrection?.options)
    ? questionCorrection.options
    : questionCorrection?.options ? Object.values(questionCorrection.options) : baseQuestion.options;
  const correctedAnswer = questionCorrection?.correctAnswer ? questionCorrection.correctAnswer.toUpperCase().charCodeAt(0) - 65 : baseQuestion.correctIndex;
  const q: SampleQuestion = questionCorrection ? {
    ...baseQuestion,
    question: questionCorrection.questionText || baseQuestion.question,
    options: correctedOptions,
    correctIndex: correctedAnswer >= 0 && correctedAnswer < correctedOptions.length ? correctedAnswer : baseQuestion.correctIndex,
    explanation: questionCorrection.explanation || baseQuestion.explanation,
  } : baseQuestion;
  const totalQ = card.sampleQuestions.length;
  const isQuestionBookmarked = !!bookmarkedQuestions[`${card.id}-${currentQuestionIndex}`];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSelectOption = (idx: number) => {
    if (isChecked) return;
    setSelectedOption(idx);
    setIsChecked(true);

    const correct = idx === q.correctIndex;
    setQuestionAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: { selected: idx, isCorrect: correct },
    }));

    if (correct) {
      if (isSfxEnabled) playSfx("correct");
      setSessionCorrectCount((prev) => prev + 1);
      setEnergyScore((prev) => prev + 10);
      showToast("Chính xác! +10 Năng lượng ⚡");
    } else {
      if (isSfxEnabled) playSfx("wrong");
      setSessionWrongCount((prev) => prev + 1);
      showToast("Chưa đúng rồi! Hãy xem giải thích chi tiết ở dưới.");
    }
  };

  const jumpToQuestion = (targetIndex: number) => {
    setCurrentQuestionIndex(targetIndex);
    const existing = questionAnswers[targetIndex];
    if (existing !== undefined) {
      setSelectedOption(existing.selected);
      setIsChecked(true);
    } else {
      setSelectedOption(null);
      setIsChecked(false);
    }
    setExpandedWords({});
    setIsVocabExpanded(false);
    setIsQuestionGridOpen(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQ - 1) {
      jumpToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      jumpToQuestion(currentQuestionIndex - 1);
    }
  };

  const toggleExpandSingleWord = (idx: number) => {
    setExpandedWords((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSearchDict = () => {
    if (!dictQuery.trim()) return;
    setDictResult({
      word: dictQuery.trim(),
      meaning: `Nghĩa tiếng Việt của "${dictQuery.trim()}": Từ vựng quan trọng TOEIC.`,
      ipa: `/${dictQuery.trim().toLowerCase()}/`,
      pos: "từ vựng",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150">
      {/* HEADER */}
      <header className="h-14 bg-[#1e60f0] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (isSfxEnabled) playSfx("click");
              onClose();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
            {card.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsBilingual(!isBilingual);
              if (isSfxEnabled) playSfx("click");
              showToast(isBilingual ? "Đã tắt hiển thị song ngữ" : "Đã bật dịch song ngữ Tiếng Việt 👑");
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isBilingual
                ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Song ngữ 👑</span>
          </button>

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
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isAnnotatorActive ? "bg-amber-400 text-slate-950 font-bold" : "bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Annotator</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
              {formatTimer(timerSeconds)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
              {energyScore}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
              ✓ {sessionCorrectCount}/{totalQ}
            </span>
            <button
              type="button"
              onClick={() => setIsQuestionGridOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-2xs font-mono transition cursor-pointer"
            >
              Câu {currentQuestionIndex + 1}/{totalQ}
            </button>
          </div>
        </div>
      </header>

      {/* ANNOTATOR BAR */}
      {isAnnotatorActive && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center justify-between shadow-xs select-none text-xs">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-amber-700" />
              Công cụ Annotator:
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
          <button
            type="button"
            onClick={() => setIsAnnotatorActive(false)}
            className="p-1 rounded-full text-amber-900 hover:bg-amber-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN DUAL PANE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
        {/* LEFT PANE */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Yêu cầu bài tập (Instruction)
            </div>

            <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
              Read the passage or sentence and select the best option.
            </h2>

            {card.passageText && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                {card.passageText}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                  Câu {q.questionNum || currentQuestionIndex + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Hỏi bài</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const key = `${card.id}-${currentQuestionIndex}`;
                      setBookmarkedQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
                      showToast(isQuestionBookmarked ? "Đã bỏ bookmark câu này" : "Đã bookmark câu này ⭐");
                    }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                      isQuestionBookmarked
                        ? "border-amber-300 bg-amber-50 text-amber-500"
                        : "border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isQuestionBookmarked ? "fill-amber-400" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                {q.question}
              </div>

              {(isChecked || isBilingual) && q.bilingual && (
                <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs sm:text-sm font-semibold leading-relaxed shadow-xs space-y-1">
                  <div className="font-bold text-blue-700 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-blue-600" />
                    <span>Bản dịch song ngữ:</span>
                  </div>
                  <p className="text-blue-950 font-medium">{q.bilingual}</p>
                </div>
              )}

              {/* OPTIONS LIST */}
              <div className="space-y-3">
                {q.options.map((optVal, optIdx) => {
                  const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isChosen = selectedOption === optIdx;
                  const isRight = optIdx === q.correctIndex;

                  let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                  let iconNode = (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                      {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                  );

                  if (isChecked) {
                    if (isRight) {
                      cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                      iconNode = (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                          ✓
                        </div>
                      );
                    } else if (isChosen) {
                      cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                      iconNode = (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                          ✕
                        </div>
                      );
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        {iconNode}
                        <span className="text-sm font-semibold">
                          ({optLetter}) {optVal}
                        </span>
                      </div>
                      {(isChecked || isBilingual) && q.optionMeanings && q.optionMeanings[optIdx] && (
                        <p className="text-xs text-slate-500 font-normal pl-8">
                          {q.optionMeanings[optIdx]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DETAILED EXPLANATION */}
            {isChecked && (
              <div className="space-y-4 pt-2">
                <div className="rounded-3xl border border-blue-200/90 bg-blue-50/40 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Giải thích chi tiết</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showDetailedExplanation}
                        onChange={(e) => setShowDetailedExplanation(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {showDetailedExplanation && (
                    <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pt-1 border-t border-blue-100">
                      {q.steps && q.steps.length > 0 ? (
                        q.steps.map((step, idx) => (
                          <div key={idx}>
                            <p className="font-bold text-slate-900 mb-0.5">{step.title}</p>
                            <p className="text-slate-700">{step.desc}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-700">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* VOCABULARY SECTION */}
                {(() => {
                  const effectiveVocabList: VocabItem[] = (q.vocabList && q.vocabList.length > 0)
                    ? q.vocabList
                    : (q.options ? q.options.map((opt, idx) => {
                        const clean = opt.replace(/^[A-D]\.\s*/, "").replace(/[.,!?;:]/g, "").trim();
                        return {
                          word: clean || `Option ${String.fromCharCode(65 + idx)}`,
                          pos: "từ vựng",
                          level: "TOEIC",
                          ipa: `/${(clean || "option").toLowerCase()}/`,
                          meaning: (q.optionMeanings && q.optionMeanings[idx]) || `Phương án chọn (${String.fromCharCode(65 + idx)})`,
                          example: {
                            en: `Review the usage of "${clean || opt}" in English tests.`,
                            vi: `Ôn tập cách dùng của "${clean || opt}" trong các bài thi TOEIC.`,
                          },
                        };
                      }) : [
                        {
                          word: "requirement",
                          pos: "n",
                          level: "B2",
                          ipa: "/rɪˈkwaɪərmənt/",
                          meaning: "yêu cầu, điều kiện",
                          example: { en: "All candidates must fulfill the requirements.", vi: "Tất cả ứng viên phải đáp ứng các yêu cầu." },
                        }
                      ]);

                  return (
                    <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 space-y-4 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          <span>Từ vựng trọng tâm ({effectiveVocabList.length} từ)</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const nextState = !isVocabExpanded;
                              setIsVocabExpanded(nextState);
                              const newExpanded: Record<number, boolean> = {};
                              effectiveVocabList.forEach((_, idx) => {
                                newExpanded[idx] = nextState;
                              });
                              setExpandedWords(newExpanded);
                            }}
                            className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-amber-300"
                          >
                            {isVocabExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>{isVocabExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const allWords = effectiveVocabList.map((v) => v.word);
                              setSavedWords((prev) => Array.from(new Set([...prev, ...allWords])));
                              showToast(`Đã lưu tất cả ${allWords.length} từ vào giỏ từ vựng! 🛍️`);
                            }}
                            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Lưu tất cả vào giỏ</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 pt-1 border-t border-amber-100">
                        {effectiveVocabList.map((v, idx) => {
                          const isSaved = savedWords.includes(v.word);
                          const isExpanded = !!expandedWords[idx] || isVocabExpanded;

                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 text-xs"
                            >
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
                                    onClick={() => toggleExpandSingleWord(idx)}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                                  >
                                    <Search className="w-3 h-3" />
                                    <span>{isExpanded ? "Thu gọn" : "🔍 Xem chi tiết"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isSaved) {
                                        setSavedWords((prev) => prev.filter((w) => w !== v.word));
                                        showToast(`Đã xóa "${v.word}" khỏi giỏ từ`);
                                      } else {
                                        setSavedWords((prev) => [...prev, v.word]);
                                        showToast(`Đã lưu "${v.word}" vào giỏ từ! 🛍️`);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                      isSaved
                                        ? "bg-amber-500 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    {isSaved ? "Đã lưu ✓" : "+ Lưu từ"}
                                  </button>
                                </div>
                              </div>

                              <p className="font-bold text-slate-800 text-xs sm:text-sm">{v.meaning}</p>

                              {/* EXPANDED DETAILS */}
                              {isExpanded && (
                                <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                                  {v.example && (
                                    <div className="space-y-1">
                                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Ví dụ câu:</div>
                                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
                                        <p className="font-semibold text-slate-900">&quot;{v.example.en}&quot;</p>
                                        <p className="text-slate-600 italic">{v.example.vi}</p>
                                      </div>
                                    </div>
                                  )}

                                  {v.collocations && v.collocations.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Cụm từ hay gặp (Collocations):</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {v.collocations.map((col, cIdx) => (
                                          <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                            <strong>{col.en}</strong>: {col.vi}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {v.synonyms && v.synonyms.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider">Từ đồng nghĩa (Synonyms):</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {v.synonyms.map((syn, sIdx) => (
                                          <span key={sIdx} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                                            <strong>{syn.en}</strong>: {syn.vi}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {v.antonyms && v.antonyms.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="font-bold text-rose-800 text-[11px] uppercase tracking-wider">Từ trái nghĩa (Antonyms):</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {v.antonyms.map((ant, aIdx) => (
                                          <span key={aIdx} className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                                            <strong>{ant.en}</strong>: {ant.vi}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {v.wordFamily && v.wordFamily.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="font-bold text-purple-800 text-[11px] uppercase tracking-wider">Họ từ (Word Family):</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {v.wordFamily.map((wf, wIdx) => (
                                          <span key={wIdx} className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                                            <strong>{wf.word}</strong> <span className="text-purple-600 font-semibold">({wf.pos})</span>: {wf.meaning}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
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
        </div>
      </div>

      {/* BOTTOM NAV */}
      <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <QuestionErrorReportButton source="READING"
            questionRef={questionRef}
            relatedContent={`${card.title} · Câu ${q.questionNum || currentQuestionIndex + 1}`}
            questionSnapshot={{ questionText: q.question, options: q.options, correctAnswer: String.fromCharCode(65 + q.correctIndex), explanation: q.explanation, passage: card.passageText || card.title, part: card.category }}
            compact onSubmitted={(ticket) => showToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)} />

          <button
            type="button"
            onClick={() => setShowWordBasketModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Giỏ từ ({savedWords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDictionaryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Tra từ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={handlePrevQuestion}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionGridOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>{currentQuestionIndex + 1}/{totalQ}</span>
          </button>

          <button
            type="button"
            disabled={currentQuestionIndex === totalQ - 1}
            onClick={handleNextQuestion}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* NOTES MODAL */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ghi chú cá nhân</h3>
                  <p className="text-xs text-slate-500">Câu {currentQuestionIndex + 1} • {card.title}</p>
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
              value={practiceUserNotes[currentQuestionIndex] || ""}
              onChange={(e) => setPracticeUserNotes({ ...practiceUserNotes, [currentQuestionIndex]: e.target.value })}
              placeholder="Nhập ghi chú hoặc kiến thức cần nhớ cho câu hỏi này..."
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...practiceUserNotes };
                  delete updated[currentQuestionIndex];
                  setPracticeUserNotes(updated);
                  showToast("Đã xóa ghi chú của câu hỏi này!");
                }}
                className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa ghi chú</span>
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
                    showToast("Đã lưu ghi chú cá nhân thành công! 💾");
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  Lưu ghi chú
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION GRID MODAL */}
      {isQuestionGridOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Danh sách toàn bộ câu hỏi</h3>
                  <p className="text-xs text-slate-500">
                    Đã làm {Object.keys(questionAnswers).length}/{totalQ} câu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              {card.sampleQuestions.map((_, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const ansInfo = questionAnswers[idx];

                let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                if (isCurrent) {
                  qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300";
                } else if (ansInfo !== undefined) {
                  if (ansInfo.isCorrect) qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500";
                  else qBtnStyle = "bg-rose-500 text-white font-bold border-rose-500";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer ${qBtnStyle}`}
                  >
                    <span className="font-extrabold">{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                Đóng danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Trợ lý AI - Hỏi bài</h3>
                  <p className="text-xs text-slate-500">Giải đáp thắc mắc câu {currentQuestionIndex + 1}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-800">Nội dung câu hỏi:</p>
              <p className="text-slate-600 italic">&quot;{q.question}&quot;</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800">Gợi ý từ Trợ lý AI:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Hãy kiểm tra từ loại của vị trí cần điền.</li>
                <li>Quan sát các từ đứng ngay trước và ngay sau khoảng trống.</li>
                <li>Xem lại phần giải thích chi tiết khi đã chọn đáp án.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORD BASKET MODAL */}
      {showWordBasketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Giỏ từ vựng cá nhân</h3>
                  <p className="text-xs text-slate-500">Đã lưu {savedWords.length} từ vựng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWordBasketModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedWords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs font-semibold">Giỏ từ vựng của bạn đang trống.</p>
                <p className="text-[11px] text-slate-400">Hãy nhấn &quot;+ Lưu từ&quot; ở các câu hỏi để ôn tập lại sau.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 p-1">
                {savedWords.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-bold text-slate-800 text-sm">{w}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedWords((prev) => prev.filter((item) => item !== w));
                        showToast(`Đã xóa "${w}" khỏi giỏ từ`);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {savedWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSavedWords([]);
                    showToast("Đã Xóa tất cả từ vựng trong giỏ!");
                  }}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowWordBasketModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DICTIONARY MODAL */}
      {showDictionaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tra từ điển nhanh</h3>
                  <p className="text-xs text-slate-500">Tra cứu từ vựng Tiếng Anh - Tiếng Việt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDictionaryModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dictQuery}
                onChange={(e) => setDictQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchDict()}
                placeholder="Nhập từ cần tra (ví dụ: applicant, schedule...)"
                className="flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchDict}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Tra từ
              </button>
            </div>

            {dictResult && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-blue-950">{dictResult.word}</span>
                  <span className="text-slate-500 font-mono">{dictResult.ipa}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">{dictResult.pos}</span>
                </div>
                <p className="font-semibold text-slate-800">{dictResult.meaning}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDictionaryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
