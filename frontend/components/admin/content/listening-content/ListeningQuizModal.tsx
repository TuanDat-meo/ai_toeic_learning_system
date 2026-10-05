"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Languages,
  FileText,
  Pencil,
  Bell,
  BellOff,
  Clock,
  Zap,
  Sparkles,
  Pause,
  Play,
  Volume2,
  Star,
  BookOpen,
  HelpCircle,
  Flag,
  ShoppingBag,
  Search,
  ChevronLeft,
  Grid,
  ChevronRight,
  X,
} from "lucide-react";
import { LevelCategoryCardData, DictationQuestion } from "@/app/admin/content/listening-content/types";

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
}) => {
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qId: number]: string }>({});
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [addedVocabItems] = useState<string[]>([]);

  const currentQ = quizModalCard.questions[activeQuizQIndex] || quizModalCard.questions[0];

  const updateCardStats = (q: DictationQuestion, chosen: string) => {
    const isCorrect = chosen === q.correctAnswer;
    const updateCard = (c: LevelCategoryCardData): LevelCategoryCardData => {
      if (c.id === quizModalCard.id) {
        return {
          ...c,
          completedQuestions: c.completedQuestions + 1,
          correctCount: c.correctCount + (isCorrect ? 1 : 0),
          wrongCount: c.wrongCount + (isCorrect ? 0 : 1),
          status: "Đang học",
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

  const isGroupMode = quizModalCard.part === "Part 3" || quizModalCard.part === "Part 4";
  const isAllGroupAnswered = isGroupMode && quizModalCard.questions.every((q) => !!quizSelectedOption[q.id]);

  const combinedVocabItems = (() => {
    const map = new Map<string, { word: string; pos: string; level: string; ipa: string; meaning: string }>();
    quizModalCard.questions.forEach((q) => {
      const list = q.vocabList || [
        { word: "pottery", pos: "n", level: "B2", ipa: "/ˈpɑːtəri/", meaning: "xưởng gốm" },
        { word: "demonstrate", pos: "v", level: "B2", ipa: "/ˈdemənstreɪt/", meaning: "trình diễn" },
      ];
      list.forEach((item) => map.set(item.word, item));
    });
    return Array.from(map.values());
  })();

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

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {quizModalCard.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
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

          <button
            type="button"
            onClick={() => {
              const next = !isSfxEnabled;
              setIsSfxEnabled(next);
              if (!next) {
                setIsPlayingAudio(false);
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              } else {
                playSfx("correct");
              }
              triggerToast(next ? "🔊 Đã bật âm thanh 🔔" : "🔕 Đã tắt toàn bộ âm thanh (Im lặng)");
            }}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isSfxEnabled
                ? "bg-amber-400 text-amber-950 shadow-xs"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
            title={isSfxEnabled ? "Đang bật âm thanh - Bấm để tắt" : "Đang tắt âm thanh - Bấm để bật"}
          >
            {isSfxEnabled ? <Bell className="w-4 h-4 text-amber-950" /> : <BellOff className="w-4 h-4 text-white" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
              00:02
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
              0
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
              ✓ {quizModalCard.correctCount}/{quizModalCard.totalQuestions}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-2xs font-mono">
              Câu {activeQuizQIndex + 1}/{quizModalCard.questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* ANNOTATOR TOOLBAR */}
      {isAnnotatorActive && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center justify-between shadow-xs select-none text-xs">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-amber-700" />
              Công cụ Annotator (Đánh dấu & Tô màu bài viết):
            </span>
            <div className="flex items-center gap-1.5">
              {(["yellow", "green", "pink", "blue"] as const).map((color) => {
                const colorMap = {
                  yellow: "bg-yellow-400 border-yellow-500",
                  green: "bg-emerald-400 border-emerald-500",
                  pink: "bg-pink-400 border-pink-500",
                  blue: "bg-sky-400 border-sky-500",
                };
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setAnnotatorColor(color);
                      triggerToast(`Đã chọn bút tô màu ${color}`);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${colorMap[color]} ${
                      annotatorColor === color ? "scale-110 ring-2 ring-slate-800" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerToast("Đã tẩy toàn bộ nét vẽ / đánh dấu")}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-50 transition cursor-pointer"
            >
              🧹 Xóa đánh dấu
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
              value={practiceUserNotes[currentQ.id] || ""}
              onChange={(e) => setPracticeUserNotes({ ...practiceUserNotes, [currentQ.id]: e.target.value })}
              placeholder="Nhập ghi chú hoặc kiến thức cần nhớ..."
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...practiceUserNotes };
                  delete updated[currentQ.id];
                  setPracticeUserNotes(updated);
                  triggerToast("Đã xóa ghi chú của câu hỏi này!");
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
                    triggerToast("Đã lưu ghi chú cá nhân thành công! 💾");
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
                    Đã làm {Object.keys(quizAnswerChecked).length}/{quizModalCard.questions.length} câu
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

            <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              {quizModalCard.questions.map((q, idx) => {
                const isCurrent = idx === activeQuizQIndex;
                const isCheckedQ = !!quizAnswerChecked[q.id];
                const userAns = quizSelectedOption[q.id];
                const isRight = userAns === q.correctAnswer;

                let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                if (isCurrent) {
                  qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300";
                } else if (isCheckedQ) {
                  if (isRight) qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500";
                  else qBtnStyle = "bg-rose-500 text-white font-bold border-rose-500";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setActiveQuizQIndex(idx);
                      setIsQuestionGridOpen(false);
                    }}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer ${qBtnStyle}`}
                  >
                    <span className="font-extrabold">{idx + 1}</span>
                    <span className="text-[9px] opacity-80">{q.part}</span>
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

                  {/* Audio Player Box */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shrink-0 cursor-pointer"
                      >
                        {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                      </button>
                      
                      <div className="flex-1 flex items-center gap-1 h-9 px-3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        {[40, 65, 30, 85, 95, 40, 60, 30, 75, 90, 50, 35, 70, 80, 45, 90, 60, 40, 80, 50, 30, 70, 85, 40].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              isPlayingAudio ? "bg-blue-600 animate-pulse" : "bg-slate-300"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photograph for Part 1 */}
                  {q.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs max-h-72">
                      <img src={q.imageUrl} alt="Part 1 Photograph" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Script & Translation when checked or Bilingual */}
                  {(showBilingualQuiz || quizAnswerChecked[q.id]) && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Audio Script & Dịch tiếng Việt</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{q.fullTranscript}</p>
                      <p className="text-xs text-slate-600 italic">{q.vietnameseTranslation}</p>
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
                        onClick={() => triggerToast("Trợ lý AI đang sẵn sàng giải đáp!")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hỏi bài</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {quizModalCard.questions.map((qItem, idx) => {
                        const chosenOpt = quizSelectedOption[qItem.id];
                        const isChecked = isAllGroupAnswered || !!quizAnswerChecked[qItem.id];
                        const qNumDisplay = idx + 1;

                        return (
                          <div key={qItem.id} className="p-5 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-extrabold text-slate-900 leading-snug">
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

                                  if (isChosen && !isChecked) {
                                    cardStyle = "bg-blue-50/70 border-blue-500 text-blue-950 font-semibold ring-1 ring-blue-400/30";
                                  }

                                  if (isChecked) {
                                    if (isRight) {
                                      cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                                      textColor = "text-emerald-700 font-bold";
                                    } else if (isChosen) {
                                      cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                                      textColor = "text-rose-700 font-bold";
                                    }
                                  }

                                  return (
                                    <div
                                      key={optKey}
                                      onClick={() => {
                                        playSfx("click");
                                        if (isChecked) return;
                                        const nextSelected = { ...quizSelectedOption, [qItem.id]: optKey };
                                        setQuizSelectedOption(nextSelected);

                                        const allDone = quizModalCard.questions.every((q) => !!nextSelected[q.id]);
                                        if (allDone) {
                                          const nextChecked = { ...quizAnswerChecked };
                                          quizModalCard.questions.forEach((q) => {
                                            nextChecked[q.id] = true;
                                          });
                                          setQuizAnswerChecked(nextChecked);
                                          updateCardStats(qItem, optKey);
                                        }
                                      }}
                                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`text-sm ${textColor}`}>
                                          ({optKey}) {optVal}
                                        </span>
                                      </div>
                                      {isChecked && (
                                        <div className="flex items-center gap-2 pl-4 pt-0.5">
                                          <span className="text-blue-500 font-bold text-xs">|</span>
                                          <span className="text-xs font-semibold text-blue-700">
                                            {optTrans || "Dịch nghĩa đáp án."}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {isAllGroupAnswered && combinedVocabItems.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3 mt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                            <span>Từ vựng nên học ({combinedVocabItems.length} từ)</span>
                          </div>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {combinedVocabItems.map((v, vIdx) => (
                            <div key={vIdx} className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">{v.word}</span> - <span className="text-slate-600">{v.meaning}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => playAudio(v.word)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
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
                            onClick={() => triggerToast("Trợ lý AI đang sẵn sàng giải đáp!")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Hỏi bài</span>
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

                      <div className="text-base font-extrabold text-slate-900">
                        {activeQuizQIndex + 1}.
                      </div>

                      {q.options && (() => {
                        const currentPart = q.part || quizModalCard.part;
                        const isPart1 = currentPart === "Part 1";
                        const isPart2 = currentPart === "Part 2";
                        const hideTextBeforeCheck = isPart1 || isPart2;

                        let entries = Object.entries(q.options);
                        if (isPart2) {
                          entries = entries.filter(([optKey]) => optKey !== "D");
                        }

                        return (
                          <div className="space-y-3">
                            {entries.map(([optKey, optVal]) => {
                              const isChosen = quizSelectedOption[q.id] === optKey;
                              const isChecked = !!quizAnswerChecked[q.id];
                              const isRight = optKey === q.correctAnswer;
                              const optTrans = q.optionTranslations ? q.optionTranslations[optKey] : "";

                              let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                              let textColor = "text-slate-900";

                              if (isChecked) {
                                if (isRight) {
                                  cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                                  textColor = "text-emerald-700 font-bold";
                                } else if (isChosen) {
                                  cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                                  textColor = "text-rose-700 font-bold";
                                }
                              }

                              const labelText = (!isChecked && hideTextBeforeCheck) ? `(${optKey})` : `(${optKey}) ${optVal}`;

                              return (
                                <div
                                  key={optKey}
                                  onClick={() => {
                                    playSfx("click");
                                    if (isChecked) return;
                                    setQuizSelectedOption({ ...quizSelectedOption, [q.id]: optKey });
                                    setQuizAnswerChecked({ ...quizAnswerChecked, [q.id]: true });
                                    updateCardStats(q, optKey);
                                  }}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`text-sm ${textColor}`}>{labelText}</span>
                                  </div>

                                  {isChecked && (
                                    <div className="flex items-center gap-2 pl-4 pt-0.5">
                                      <span className="text-blue-500 font-bold text-xs">|</span>
                                      <span className="text-xs font-semibold text-blue-700">
                                        {optTrans || "Dịch nghĩa đáp án theo ngữ cảnh."}
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
          <button
            type="button"
            onClick={() => triggerToast("Đã nhận phản hồi báo lỗi từ bạn!")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Báo lỗi</span>
          </button>

          <button
            type="button"
            onClick={() => triggerToast("Mở giỏ từ vựng cá nhân!")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Giỏ từ ({addedVocabItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => triggerToast("Mở công cụ tra từ nhanh!")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Tra từ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeQuizQIndex === 0}
            onClick={() => setActiveQuizQIndex((prev) => Math.max(0, prev - 1))}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Câu trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionGridOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>{activeQuizQIndex + 1}/{quizModalCard.questions.length}</span>
          </button>

          <button
            type="button"
            disabled={activeQuizQIndex === quizModalCard.questions.length - 1}
            onClick={() => setActiveQuizQIndex((prev) => Math.min(quizModalCard.questions.length - 1, prev + 1))}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Câu tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
