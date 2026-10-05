"use client";

import React, { useState } from "react";
import { ExerciseCardData, SampleQuestion } from "@/app/admin/content/reading-content/types";
import {
  ArrowLeft,
  Languages,
  FileText,
  Pencil,
  Bell,
  BellOff,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Star,
  BookOpen,
  Eye,
  Plus,
  Bookmark,
  Flag,
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
} from "lucide-react";

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

  const [isBilingual, setIsBilingual] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("Sai đáp án");
  const [reportText, setReportText] = useState("");
  const [showWordBasketModal, setShowWordBasketModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictQuery, setDictQuery] = useState("");
  const [dictResult, setDictResult] = useState<{ word: string; meaning: string; ipa: string } | null>(null);

  const q: SampleQuestion = card.sampleQuestions[currentQuestionIndex] || card.sampleQuestions[0];
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
    if (correct) {
      playSfx("correct");
      setSessionCorrectCount((prev) => prev + 1);
      setEnergyScore((prev) => prev + 10);
      showToast("Chính xác! +10 Năng lượng ⚡");
    } else {
      playSfx("wrong");
      setSessionWrongCount((prev) => prev + 1);
      showToast("Chưa đúng rồi! Hãy xem giải thích chi tiết ở dưới.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQ - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedOption(null);
      setIsChecked(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150">
      {/* HEADER */}
      <header className="h-14 bg-[#1e60f0] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {card.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsBilingual(!isBilingual);
              playSfx("click");
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

          <button
            type="button"
            onClick={() => {
              setIsSfxEnabled(!isSfxEnabled);
              showToast(isSfxEnabled ? "Đã tắt âm thanh" : "Đã bật âm thanh hiệu ứng SFX 🔊");
            }}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isSfxEnabled ? "bg-amber-400 text-amber-950" : "bg-white/20 text-white"
            }`}
          >
            {isSfxEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
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

              {isBilingual && q.bilingual && (
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
                      {q.optionMeanings && q.optionMeanings[optIdx] && (
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Báo lỗi</span>
          </button>

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
    </div>
  );
};
