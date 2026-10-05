"use client";

import React from "react";
import { TestItem, PracticeQuestion } from "@/app/admin/content/mock-tests/types";
import {
  ArrowLeft,
  Languages,
  Sparkles,
  FileText,
  Pencil,
  Volume2,
  Bell,
  BellOff,
  Grid,
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
  Pause,
  Play,
} from "lucide-react";

interface MockTestPracticeModalProps {
  test: TestItem;
  filteredPracticeQuestions: PracticeQuestion[];
  practiceCurrentQIndex: number;
  setPracticeCurrentQIndex: React.Dispatch<React.SetStateAction<number>>;
  practiceAnswers: { [qId: number]: string };
  setPracticeAnswers: React.Dispatch<React.SetStateAction<{ [qId: number]: string }>>;
  practiceChecked: { [qId: number]: boolean };
  setPracticeChecked: React.Dispatch<React.SetStateAction<{ [qId: number]: boolean }>>;
  showBilingualPassage: boolean;
  setShowBilingualPassage: (val: boolean) => void;
  showEvidence: boolean;
  setShowEvidence: (val: boolean) => void;
  isNotesModalOpen: boolean;
  setIsNotesModalOpen: (val: boolean) => void;
  practiceUserNotes: { [qId: number]: string };
  setPracticeUserNotes: React.Dispatch<React.SetStateAction<{ [qId: number]: string }>>;
  isAnnotatorActive: boolean;
  setIsAnnotatorActive: (val: boolean) => void;
  annotatorColor: "yellow" | "green" | "pink" | "blue";
  setAnnotatorColor: (val: "yellow" | "green" | "pink" | "blue") => void;
  isDictationMode: boolean;
  setIsDictationMode: (val: boolean) => void;
  isFlipCardMode: boolean;
  setIsFlipCardMode: (val: boolean) => void;
  isAutoPlayNext: boolean;
  setIsAutoPlayNext: (val: boolean) => void;
  isSfxEnabled: boolean;
  setIsSfxEnabled: (val: boolean) => void;
  isTimerPaused: boolean;
  setIsTimerPaused: (val: boolean) => void;
  practiceTimerSeconds: number;
  isQuestionGridOpen: boolean;
  setIsQuestionGridOpen: (val: boolean) => void;
  showDetailedExplanation: boolean;
  setShowDetailedExplanation: (val: boolean) => void;
  showVocabSection: boolean;
  setShowVocabSection: (val: boolean) => void;
  isVocabExpanded: boolean;
  setIsVocabExpanded: (val: boolean) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (val: boolean) => void;
  playSfx: (type: "correct" | "wrong" | "click") => void;
  triggerToast: (msg: string) => void;
  onClose: () => void;
}

export const MockTestPracticeModal: React.FC<MockTestPracticeModalProps> = ({
  test,
  filteredPracticeQuestions,
  practiceCurrentQIndex,
  setPracticeCurrentQIndex,
  practiceAnswers,
  setPracticeAnswers,
  practiceChecked,
  setPracticeChecked,
  showBilingualPassage,
  setShowBilingualPassage,
  showEvidence,
  setShowEvidence,
  isNotesModalOpen,
  setIsNotesModalOpen,
  practiceUserNotes,
  setPracticeUserNotes,
  isAnnotatorActive,
  setIsAnnotatorActive,
  annotatorColor,
  setAnnotatorColor,
  isDictationMode,
  setIsDictationMode,
  isFlipCardMode,
  setIsFlipCardMode,
  isAutoPlayNext,
  setIsAutoPlayNext,
  isSfxEnabled,
  setIsSfxEnabled,
  isTimerPaused,
  setIsTimerPaused,
  practiceTimerSeconds,
  isQuestionGridOpen,
  setIsQuestionGridOpen,
  showDetailedExplanation,
  setShowDetailedExplanation,
  showVocabSection,
  setShowVocabSection,
  isVocabExpanded,
  setIsVocabExpanded,
  isPlayingAudio,
  setIsPlayingAudio,
  playSfx,
  triggerToast,
  onClose,
}) => {
  const currentQ = filteredPracticeQuestions[practiceCurrentQIndex] || filteredPracticeQuestions[0];
  const qPart = currentQ ? currentQ.part : "Part 1";
  const chosenOpt = currentQ ? practiceAnswers[currentQ.id] : undefined;
  const isChecked = currentQ ? !!practiceChecked[currentQ.id] : false;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden font-sans">
        
        {/* --- TOP HEADER BAR --- */}
        <header className="h-16 bg-blue-600 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Thoát</span>
            </button>

            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-700/90 border border-blue-400/40 text-white text-xs font-extrabold tracking-wide">
              {test.title}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Song ngữ */}
            <button
              type="button"
              onClick={() => {
                setShowBilingualPassage(!showBilingualPassage);
                triggerToast(!showBilingualPassage ? "Bật bản dịch song ngữ tiếng Việt 🌐" : "Tắt bản dịch song ngữ");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                showBilingualPassage
                  ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Song ngữ</span>
            </button>

            {/* Dẫn chứng */}
            {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
              <button
                type="button"
                onClick={() => {
                  setShowEvidence(!showEvidence);
                  triggerToast(!showEvidence ? "Bật hiển thị Dẫn chứng bài đọc màu vàng 💡" : "Tắt Dẫn chứng bài đọc");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  showEvidence
                    ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                    : "bg-white/15 hover:bg-white/25 text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Dẫn chứng 👑</span>
              </button>
            )}

            {/* Ghi chú */}
            <button
              type="button"
              onClick={() => setIsNotesModalOpen(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentQ && practiceUserNotes[currentQ.id]
                  ? "bg-emerald-400 text-slate-950 font-black shadow-md"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ghi chú {currentQ && practiceUserNotes[currentQ.id] ? "✓" : ""}</span>
            </button>

            {/* Annotator */}
            <button
              type="button"
              onClick={() => {
                setIsAnnotatorActive(!isAnnotatorActive);
                triggerToast(!isAnnotatorActive ? "Đã bật công cụ vẽ / đánh dấu Annotator ✏️" : "Tắt công cụ Annotator");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isAnnotatorActive
                  ? "bg-amber-400 text-slate-950 font-black shadow-md"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Annotator</span>
            </button>

            {/* Listening Options */}
            {currentQ && (currentQ.part === "Part 1" || currentQ.part === "Part 2" || currentQ.part === "Part 3" || currentQ.part === "Part 4") && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsDictationMode(!isDictationMode);
                    triggerToast(!isDictationMode ? "Bật chế độ Điền Từ (Dictation) ✏️" : "Tắt chế độ Điền Từ");
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isDictationMode
                      ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Điền Từ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsFlipCardMode(!isFlipCardMode);
                    triggerToast(!isFlipCardMode ? "Bật chế độ Lật Từ (Flashcard) ❇️" : "Tắt chế độ Lật Từ");
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isFlipCardMode
                      ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lật Từ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoPlayNext(!isAutoPlayNext);
                    triggerToast(!isAutoPlayNext ? "Bật Tự động phát câu tiếp (Auto) 🔊" : "Tắt Tự động phát");
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isAutoPlayNext
                      ? "bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300/50"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </>
            )}

            {/* SFX Bell */}
            <button
              type="button"
              onClick={() => {
                const nextSfx = !isSfxEnabled;
                setIsSfxEnabled(nextSfx);
                if (nextSfx) playSfx("correct");
                triggerToast(nextSfx ? "Âm thanh hiệu ứng: BẬT 🔔" : "Âm thanh hiệu ứng: TẮT 🔕");
              }}
              className={`p-2 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                isSfxEnabled
                  ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50 animate-pulse"
                  : "bg-white/15 hover:bg-white/25 text-white/70"
              }`}
              title={isSfxEnabled ? "Tắt hiệu ứng âm thanh (Đúng/Sai)" : "Bật hiệu ứng âm thanh (Đúng/Sai)"}
            >
              {isSfxEnabled ? <Bell className="w-4 h-4 fill-slate-950" /> : <BellOff className="w-4 h-4" />}
            </button>

            {/* Timer */}
            <button
              type="button"
              onClick={() => {
                setIsTimerPaused(!isTimerPaused);
                triggerToast(!isTimerPaused ? "Đã tạm dừng thời gian làm bài ⏱" : "Đã tiếp tục đếm thời gian ⏱");
              }}
              className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                isTimerPaused
                  ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                  : "bg-white/15 hover:bg-white/25 text-white border-white/20"
              }`}
              title="Bấm để Tạm dừng / Tiếp tục đếm thời gian"
            >
              <span>{isTimerPaused ? "⏸" : "⏱"}</span>
              <span>
                {String(Math.floor(practiceTimerSeconds / 60)).padStart(2, "0")}:
                {String(practiceTimerSeconds % 60).padStart(2, "0")}
              </span>
            </button>

            {/* Counter */}
            <button
              type="button"
              onClick={() => {
                const total = filteredPracticeQuestions.length;
                const checked = Object.keys(practiceChecked).length;
                const correct = Object.entries(practiceChecked).filter(
                  ([qId]) => practiceAnswers[Number(qId)] === filteredPracticeQuestions.find((q) => q.id === Number(qId))?.correctAnswer
                ).length;
                const percent = checked > 0 ? Math.round((correct / checked) * 100) : 0;
                triggerToast(`Tiến độ: Đã làm ${checked}/${total} câu • Tỷ lệ đúng ${percent}% (Đúng ${correct}/${checked} câu) 🎯`);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-2xs transition cursor-pointer"
            >
              ✓ {
                Object.entries(practiceChecked).filter(
                  ([qId]) => practiceAnswers[Number(qId)] === filteredPracticeQuestions.find((q) => q.id === Number(qId))?.correctAnswer
                ).length
              }/{filteredPracticeQuestions.length}
            </button>

            {/* Question Matrix */}
            <button
              type="button"
              onClick={() => setIsQuestionGridOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 border border-blue-400/40 text-white text-xs font-extrabold shadow-2xs font-mono transition cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Câu {practiceCurrentQIndex + 1}/{filteredPracticeQuestions.length}</span>
            </button>
          </div>
        </header>

        {/* ANNOTATOR BAR */}
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
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                rows={5}
                value={practiceUserNotes[currentQ.id] || ""}
                onChange={(e) => setPracticeUserNotes({ ...practiceUserNotes, [currentQ.id]: e.target.value })}
                placeholder="Nhập ghi chú hoặc kiến thức cần nhớ cho câu hỏi này tại đây..."
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
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Danh sách toàn bộ câu hỏi</h3>
                    <p className="text-xs text-slate-500">
                      Đã làm {Object.keys(practiceAnswers).length}/{filteredPracticeQuestions.length} câu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuestionGridOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 py-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Đang xem
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Đã làm
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Chưa làm
                </span>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                {filteredPracticeQuestions.map((q, idx) => {
                  const isCurrent = idx === practiceCurrentQIndex;
                  const hasAnswered = !!practiceAnswers[q.id];

                  let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                  if (isCurrent) {
                    qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300";
                  } else if (hasAnswered) {
                    qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setPracticeCurrentQIndex(idx);
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

        {/* MAIN DUAL PANE PRACTICE AREA */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          
          {/* LEFT PANE */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Yêu cầu bài tập (Instruction)
              </div>

              {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug pb-1">
                  {currentQ.groupTitle || (currentQ.part === "Part 6" ? "Questions 131–134 refer to the following article." : "Questions 147–148 refer to the following notice.")}
                </div>
              )}

              <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
                {(() => {
                  if (qPart === "Part 1") return "Listen to the audio and select the best statement describing the photograph.";
                  if (qPart === "Part 2") return "Listen to the question and select the best response.";
                  if (qPart === "Part 3") return "Listen to the conversation and answer the questions below.";
                  if (qPart === "Part 4") return "Listen to the talk and answer the questions below.";
                  if (qPart === "Part 5") return "Select the best answer to complete the sentence.";
                  if (qPart === "Part 6" || qPart === "Part 7") return "Read the passage and answer the questions.";
                  return "Select the best answer to complete the question.";
                })()}
              </h2>

              {currentQ && currentQ.passage && (
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                    {currentQ.passage}
                  </div>

                  {showBilingualPassage && currentQ.bilingualPassage && (
                    <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 whitespace-pre-line leading-relaxed shadow-xs">
                      <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5" /> Bản dịch song ngữ tiếng Việt:
                      </p>
                      {currentQ.bilingualPassage}
                    </div>
                  )}
                </div>
              )}

              {currentQ && currentQ.part === "Part 1" && currentQ.imageUrl && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                  <img
                    src={currentQ.imageUrl}
                    alt="Photograph"
                    className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                  />
                </div>
              )}

              {currentQ && currentQ.audioUrl && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                      {[40, 65, 30, 85, 95, 40, 60, 30, 75, 90, 50, 35, 70, 80, 45, 90, 60, 40, 80, 50, 30, 70, 85, 40].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            isPlayingAudio ? "bg-blue-600 animate-pulse" : "bg-slate-300"
                          }`}
                          style={{ height: `${isPlayingAudio ? Math.max(20, (h * (i % 3 + 1)) % 100) : h}%` }}
                        />
                      ))}
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-600 shrink-0">
                      00:01 / 00:24
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="p-6 rounded-3xl border-2 border-blue-200/90 bg-white shadow-xs relative space-y-5">
                {currentQ && (currentQ.part === "Part 6" || currentQ.part === "Part 7") && (
                  <div className="flex items-center gap-2 pb-1">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                      Nhóm câu {currentQ.groupId || (currentQ.part === "Part 6" ? "131–134" : "147–148")}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      ({currentQ.groupTotal || (currentQ.part === "Part 6" ? "4" : "2")} câu hỏi)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                    {currentQ.part}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerToast("Trợ lý AI đang sẵn sàng giải đáp câu hỏi của bạn!")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Hỏi bài</span>
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition cursor-pointer"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                  {currentQ.id}. {currentQ.questionText}
                </div>

                {(isChecked || showBilingualPassage) && currentQ.translation && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs sm:text-sm font-semibold leading-relaxed shadow-xs space-y-1">
                    <div className="font-bold text-blue-700 flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-blue-600" />
                      <span>Bản dịch tiếng Việt:</span>
                    </div>
                    <p className="text-blue-950 font-medium">{currentQ.translation}</p>
                  </div>
                )}

                {/* OPTIONS LIST */}
                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                    const isChosen = chosenOpt === optKey;
                    const isRight = optKey === currentQ.correctAnswer;
                    const isPart1or2 = currentQ.part === "Part 1" || currentQ.part === "Part 2";

                    if ((currentQ.part === "Part 2" || qPart === "Part 2") && optKey === "D") return null;

                    let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                    let iconNode = (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                        {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                    );
                    let textColor = "text-slate-900";

                    if (isChecked) {
                      if (isRight) {
                        cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                        textColor = "text-emerald-700 font-bold";
                        iconNode = (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                            ✓
                          </div>
                        );
                      } else if (isChosen) {
                        cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                        textColor = "text-rose-700 font-bold";
                        iconNode = (
                          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                            ✕
                          </div>
                        );
                      }
                    }

                    return (
                      <div
                        key={optKey}
                        onClick={() => {
                          if (isChecked) return;
                          if (isSfxEnabled) {
                            if (optKey === currentQ.correctAnswer) playSfx("correct");
                            else playSfx("wrong");
                          }
                          setPracticeAnswers({ ...practiceAnswers, [currentQ.id]: optKey });
                          setPracticeChecked({ ...practiceChecked, [currentQ.id]: true });
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          {iconNode}
                          <span className={`text-sm ${textColor}`}>
                            {isPart1or2 ? `(${optKey})` : `(${optKey}) ${optVal}`}
                          </span>
                        </div>
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
                      <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pt-1 border-t border-blue-100">
                        <div>
                          <p className="font-bold text-slate-900 mb-0.5">Bước 1: Xác định dạng câu hỏi</p>
                          <p className="text-slate-700">
                            {currentQ.step1 || 'Bốn đáp án là các dạng khác nhau của đại từ "they" nên đây là câu đại từ, cần xét vị trí chỗ trống.'}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 mb-0.5">Bước 2: Phân tích câu để biết chỗ trống cần gì</p>
                          <p className="text-slate-700">
                            {currentQ.step2 || 'Xét vị trí: chỗ trống đứng ngay trước cụm danh từ "earliest projects", cần tính từ sở hữu.'}
                          </p>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 mb-0.5">Bước 3: Chọn đáp án</p>
                          <p className="text-slate-700">
                            {currentQ.step3 || 'Chọn tính từ sở hữu "their" (của họ).'}
                          </p>
                        </div>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-rose-500" />
              <span>Báo lỗi</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Giỏ từ (0)</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Tra từ</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={practiceCurrentQIndex === 0}
              onClick={() => setPracticeCurrentQIndex((prev) => Math.max(0, prev - 1))}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer"
            >
              <Grid className="w-4 h-4" />
              <span>{practiceCurrentQIndex + 1}/{filteredPracticeQuestions.length}</span>
            </button>

            <button
              type="button"
              disabled={practiceCurrentQIndex === filteredPracticeQuestions.length - 1}
              onClick={() => setPracticeCurrentQIndex((prev) => Math.min(filteredPracticeQuestions.length - 1, prev + 1))}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
