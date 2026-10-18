"use client";

import React from "react";
import { TestItem, PracticeQuestion } from "@/app/admin/content/mock-tests/types";
import { saveItemProgress } from "@/lib/practiceProgress";
import {
  ArrowLeft,
  Clock,
  Grid,
  Send,
  Play,
  Sparkles,
  Pause,
  ChevronLeft,
  ChevronRight,
  Trophy,
  FileCheck,
  Bookmark,
  Flag,
  AlertCircle,
  X,
  CheckCircle2,
  Check,
  Target,
  Headphones,
  BookOpen,
  FileText,
} from "lucide-react";
import { AudioWaveformPlayer } from "@/components/common/AudioWaveformPlayer";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";

interface MockTestExamModalProps {
  test: TestItem;
  activeExamQuestions: PracticeQuestion[];
  activeExamParts: string[];
  examDurationType: "120" | "60" | "30";
  setExamDurationType: (val: "120" | "60" | "30") => void;
  examStarted: boolean;
  examTimeRemaining: number;
  examAnswers: { [qId: number]: string };
  setExamAnswers: React.Dispatch<React.SetStateAction<{ [qId: number]: string }>>;
  examCurrentQIndex: number;
  setExamCurrentQIndex: React.Dispatch<React.SetStateAction<number>>;
  examSubmitted: boolean;
  examResultScore: { total: number; listening: number; reading: number; correctCount: number } | null;
  isSfxEnabled: boolean;
  setIsSfxEnabled: (val: boolean) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (val: boolean) => void;
  playSfx: (type: "correct" | "wrong" | "incorrect" | "click") => void;
  triggerToast: (msg: string) => void;
  formatTime: (sec: number) => string;
  onClose: () => void;
  onStartExamNow: (customParts?: string[], customMinutes?: number) => void;
  onSubmitExam: (effectiveQuestions?: PracticeQuestion[]) => void;
  onOpenQuestionGrid: () => void;
}

export const MockTestExamModal: React.FC<MockTestExamModalProps> = ({
  test,
  activeExamQuestions,
  activeExamParts,
  examDurationType,
  setExamDurationType,
  examStarted,
  examTimeRemaining,
  examAnswers,
  setExamAnswers,
  examCurrentQIndex,
  setExamCurrentQIndex,
  examSubmitted,
  examResultScore,
  isSfxEnabled,
  setIsSfxEnabled,
  isPlayingAudio,
  setIsPlayingAudio,
  playSfx,
  triggerToast,
  formatTime,
  onClose,
  onStartExamNow,
  onSubmitExam,
  onOpenQuestionGrid,
}) => {
  const [isLocalQuestionGridOpen, setIsLocalQuestionGridOpen] = React.useState(false);
  const [flaggedQIds, setFlaggedQIds] = React.useState<number[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const [selectedGridFilter, setSelectedGridFilter] = React.useState<string>("ALL");

  const [examQuestions, setExamQuestions] = React.useState<PracticeQuestion[]>(activeExamQuestions);
  const [currentExamParts, setCurrentExamParts] = React.useState<string[]>(activeExamParts);
  const [selectedParts, setSelectedParts] = React.useState<string[]>([]);
  const [selectedModeTab, setSelectedModeTab] = React.useState<"exam" | "practice">("exam");

  React.useEffect(() => {
    setIsPlayingAudio(false);
  }, [examCurrentQIndex, setIsPlayingAudio]);

  React.useEffect(() => {
    if (!examStarted && !examSubmitted) {
      const timer = setTimeout(() => {
        setExamQuestions(activeExamQuestions);
        setCurrentExamParts(activeExamParts);
        setSelectedParts([]);
        setFlaggedQIds([]);
        setShowSubmitConfirm(false);
        setIsLocalQuestionGridOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [examStarted, examSubmitted, activeExamQuestions, activeExamParts]);

  const handleToggleFlag = (qId: number) => {
    setFlaggedQIds((prev) => {
      const next = prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId];
      triggerToast(prev.includes(qId) ? "Đã bỏ đánh dấu câu hỏi" : "🚩 Đã đánh dấu câu hỏi để xem lại");
      return next;
    });
    if (isSfxEnabled) playSfx("click");
  };

  const handleOpenGrid = () => {
    setShowSubmitConfirm(true);
    onOpenQuestionGrid?.();
  };

  const handleRequestSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const PART_DURATIONS: Record<string, number> = {
    "Part 1": 6,
    "Part 2": 15,
    "Part 3": 15,
    "Part 4": 12,
    "Part 5": 15,
    "Part 6": 15,
    "Part 7": 45,
  };

  const startFullTest = () => {
    setExamQuestions(activeExamQuestions);
    setCurrentExamParts(["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"]);
    setExamDurationType("120");
    onStartExamNow(["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"], 120);
  };

  const startListeningTest = () => {
    const parts = ["Part 1", "Part 2", "Part 3", "Part 4"];
    const filtered = activeExamQuestions.filter((q) => parts.includes(q.part));
    setExamQuestions(filtered.length > 0 ? filtered : activeExamQuestions);
    setCurrentExamParts(parts);
    setExamDurationType("60");
    onStartExamNow(parts, 45);
  };

  const startReadingTest = () => {
    const parts = ["Part 5", "Part 6", "Part 7"];
    const filtered = activeExamQuestions.filter((q) => parts.includes(q.part));
    setExamQuestions(filtered.length > 0 ? filtered : activeExamQuestions);
    setCurrentExamParts(parts);
    setExamDurationType("60");
    onStartExamNow(parts, 75);
  };

  const startPartTest = () => {
    if (selectedParts.length === 0) {
      triggerToast("Vui lòng chọn ít nhất một Part để bắt đầu!");
      return;
    }
    const filtered = activeExamQuestions.filter((q) => selectedParts.includes(q.part));
    if (filtered.length === 0) {
      triggerToast("Chưa có câu hỏi cho các Part đã chọn!");
      return;
    }
    setExamQuestions(filtered);
    setCurrentExamParts(selectedParts);
    const totalMins = selectedParts.reduce((acc, p) => acc + (PART_DURATIONS[p] || 15), 0);
    onStartExamNow(selectedParts, totalMins);
  };

  {/* Màn hình Chọn Chế Độ (Ảnh 3, 4, 5) trước khi bắt đầu thi */ }
  if (!examStarted && !examSubmitted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
          {/* Header Modal */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Chọn chế độ</h2>
              <p className="text-sm font-bold text-slate-500 mt-0.5">{test.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto bg-slate-50/50 flex-1">
            {/* Mode Switcher Tabs */}
            <div className="p-1.5 bg-slate-200/70 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedModeTab("exam")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${selectedModeTab === "exam"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Luyện thi</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModeTab("practice")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${selectedModeTab === "practice"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Target className="w-4 h-4 text-blue-600" />
                <span>Luyện tập</span>
              </button>
            </div>

            {/* CONTENT FOR EXAM TAB */}
            {selectedModeTab === "exam" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Full Test */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">Full Test</h3>
                          <p className="text-xs text-slate-500 font-medium">Làm như thi thật</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={startFullTest}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                        <span>Bắt đầu</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        <Clock className="w-3.5 h-3.5" /> 120 phút
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        <FileText className="w-3.5 h-3.5" /> 200 câu
                      </span>
                    </div>
                  </div>

                  {/* Thi Listening */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">Thi Listening</h3>
                          <p className="text-xs text-slate-500 font-medium">Thi riêng phần nghe</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={startListeningTest}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                        <span>Bắt đầu</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        <Clock className="w-3.5 h-3.5" /> 45 phút
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        <FileText className="w-3.5 h-3.5" /> 100 câu
                      </span>
                    </div>
                  </div>

                  {/* Thi Reading */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">Thi Reading</h3>
                          <p className="text-xs text-slate-500 font-medium">Thi riêng phần đọc</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={startReadingTest}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                        <span>Bắt đầu</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        <Clock className="w-3.5 h-3.5" /> 75 phút
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                        <FileText className="w-3.5 h-3.5" /> 100 câu
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM CARD: Thi theo Part (Ảnh 3, 4, 5) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-blue-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Thi theo Part</h3>
                        <p className="text-xs text-slate-500">Chọn Part cụ thể để thi thử</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={startPartTest}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Bắt đầu</span>
                    </button>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* LISTENING SECTION */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Listening</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: "Part 1", count: "6 câu" },
                          { id: "Part 2", count: "25 câu" },
                          { id: "Part 3", count: "39 câu" },
                          { id: "Part 4", count: "30 câu" },
                        ].map((p) => {
                          const isSelected = selectedParts.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedParts(selectedParts.filter((item) => item !== p.id));
                                } else {
                                  setSelectedParts([...selectedParts, p.id]);
                                }
                              }}
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${isSelected
                                  ? "border-blue-500 bg-white ring-1 ring-blue-500 text-slate-900 font-bold shadow-2xs"
                                  : "border-slate-200 hover:border-blue-300 bg-white text-slate-800"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-blue-400/60 bg-white shrink-0" />
                                )}
                                <span className={`text-sm ${isSelected ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                                  {p.id}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* READING SECTION */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Reading</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: "Part 5", count: "30 câu" },
                          { id: "Part 6", count: "16 câu" },
                          { id: "Part 7", count: "54 câu" },
                        ].map((p) => {
                          const isSelected = selectedParts.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedParts(selectedParts.filter((item) => item !== p.id));
                                } else {
                                  setSelectedParts([...selectedParts, p.id]);
                                }
                              }}
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${isSelected
                                  ? "border-blue-500 bg-white ring-1 ring-blue-500 text-slate-900 font-bold shadow-2xs"
                                  : "border-slate-200 hover:border-blue-300 bg-white text-slate-800"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-blue-400/60 bg-white shrink-0" />
                                )}
                                <span className={`text-sm ${isSelected ? "font-bold text-slate-900" : "font-medium text-slate-800"}`}>
                                  {p.id}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT FOR PRACTICE TAB */}
            {selectedModeTab === "practice" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chọn Part để bắt đầu luyện tập
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "ALL", title: "Tất cả các Part", count: "Đầy đủ 7 Part" },
                    { id: "Part 1", title: "Part 1: Photographs", count: "Mô tả hình ảnh" },
                    { id: "Part 2", title: "Part 2: Question-Response", count: "Hỏi & Đáp ngắn" },
                    { id: "Part 3", title: "Part 3: Conversations", count: "Hội thoại ngắn" },
                    { id: "Part 4", title: "Part 4: Short Talks", count: "Bài nói ngắn" },
                    { id: "Part 5", title: "Part 5: Incomplete Sentences", count: "Điền câu" },
                    { id: "Part 6", title: "Part 6: Text Completion", count: "Điền đoạn văn" },
                    { id: "Part 7", title: "Part 7: Reading Comprehension", count: "Đọc hiểu đoạn văn" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === "ALL") {
                          startFullTest();
                        } else {
                          const filtered = activeExamQuestions.filter((q) => q.part === item.id);
                          setExamQuestions(filtered.length > 0 ? filtered : activeExamQuestions);
                          setCurrentExamParts([item.id]);
                          setExamDurationType("30");
                          onStartExamNow([item.id], 30);
                        }
                      }}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 text-left transition shadow-2xs group cursor-pointer"
                    >
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.count}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 font-sans">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        {/* Header Modal */}
        <header className="h-16 bg-blue-600 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md select-none">
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
              Thi thử TOEIC: {test.title} {currentExamParts.length > 0 && currentExamParts.length < 7 ? `(${currentExamParts.join(", ")})` : ""}
            </span>
          </div>

          {examStarted && !examSubmitted && (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Timer button */}
              <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white border border-white/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(examTimeRemaining)}</span>
              </div>

              {/* Answered Counter */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-2xs">
                ✓ {Object.keys(examAnswers).length}/{examQuestions.length}
              </div>

              {/* Question Grid Toggle */}
              <button
                type="button"
                onClick={handleOpenGrid}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-700/90 hover:bg-blue-800 border border-blue-400/40 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
                title="Mở danh sách toàn bộ câu hỏi (Đèn xanh đèn đỏ)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Danh sách ({Object.keys(examAnswers).length}/{examQuestions.length})</span>
              </button>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleRequestSubmit}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5 ring-2 ring-amber-300/60"
              >
                <Send className="w-3.5 h-3.5 fill-slate-950" />
                <span>Nộp bài thi</span>
              </button>
            </div>
          )}
        </header>

        {/* Body Modal */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Đang làm bài thi thử */}
          {examStarted && !examSubmitted && (() => {
            const currentQ = examQuestions[examCurrentQIndex];
            if (!currentQ) return null;

            return (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
                  {/* LEFT PANE: Instruction & Content */}
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
                          if (currentQ.part === "Part 1") return "Listen to the audio and select the best statement describing the photograph.";
                          if (currentQ.part === "Part 2") return "Listen to the question and select the best response.";
                          if (currentQ.part === "Part 3") return "Listen to the conversation and answer the questions below.";
                          if (currentQ.part === "Part 4") return "Listen to the talk and answer the questions below.";
                          if (currentQ.part === "Part 5") return "Select the best answer to complete the sentence.";
                          if (currentQ.part === "Part 6" || currentQ.part === "Part 7") return "Read the passage and answer the questions.";
                          return "Select the best answer to complete the question.";
                        })()}
                      </h2>

                      {currentQ && currentQ.passage && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                          {currentQ.passage}
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
                        <AudioWaveformPlayer
                          audioUrl={currentQ.audioUrl}
                          isPlaying={isPlayingAudio}
                          onPlayPauseChange={(playing) => {
                            setIsPlayingAudio(playing);
                            triggerToast(playing ? "🔊 Đã phát âm thanh bài nghe" : "⏸ Đã tạm dừng âm thanh bài nghe");
                          }}
                          showSpeedControl={true}
                          showReplayButton={true}
                          title={`Audio ${currentQ.part || "Listening"} • Câu ${examCurrentQIndex + 1}`}
                        />
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANE: QUESTION & OPTIONS */}
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

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                              {currentQ.part}
                            </span>
                            {examAnswers[currentQ.id] ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Đã trả lời ({examAnswers[currentQ.id]})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Chưa làm
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleFlag(currentQ.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${flaggedQIds.includes(currentQ.id)
                                ? "bg-amber-100 border-amber-300 text-amber-900 shadow-xs"
                                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                              }`}
                            title="Đánh dấu câu hỏi này để kiểm tra lại trước khi nộp bài"
                          >
                            <Flag className={`w-3.5 h-3.5 ${flaggedQIds.includes(currentQ.id) ? "fill-amber-600 text-amber-600" : ""}`} />
                            <span>{flaggedQIds.includes(currentQ.id) ? "Đã đánh dấu" : "Đánh dấu xem lại"}</span>
                          </button>
                        </div>

                        <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                          {currentQ.part === "Part 2" ? `${examCurrentQIndex + 1}. Mark your answer on your answer sheet.` : `${examCurrentQIndex + 1}. ${currentQ.questionText}`}
                        </div>

                        {/* OPTIONS LIST */}
                        <div className="space-y-3">
                          {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                            if (currentQ.part === "Part 2" && optKey === "D") return null;

                            const isChosen = examAnswers[currentQ.id] === optKey;
                            const isPart1or2 = currentQ.part === "Part 1" || currentQ.part === "Part 2";
                            const hasAnswered = !!examAnswers[currentQ.id];
                            const labelText = isPart1or2 && !hasAnswered ? `(${optKey})` : `(${optKey}) ${optVal}`;

                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => {
                                  if (isSfxEnabled) playSfx("click");
                                  setExamAnswers((prev) => {
                                    const next = { ...prev, [currentQ.id]: optKey };
                                    saveItemProgress(`mock-test-${test.id}`, Object.keys(next).length, examQuestions.length || 200);
                                    return next;
                                  });
                                }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${isChosen
                                    ? "bg-blue-50/80 border-blue-500 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs"
                                    : "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-800"
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isChosen ? "border-blue-600 bg-white" : "border-slate-300"
                                  }`}>
                                  {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                </div>
                                <span className="text-sm font-semibold">
                                  ({optKey}) {String(optVal)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Footer */}
                <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={examCurrentQIndex === 0}
                      onClick={() => setExamCurrentQIndex((prev) => Math.max(0, prev - 1))}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Câu trước</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenGrid}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                      title="Mở danh sách toàn bộ câu hỏi (Đèn xanh đèn đỏ)"
                    >
                      <Grid className="w-3.5 h-3.5 text-blue-600" />
                      <span>Danh sách</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs font-mono">
                      {examCurrentQIndex + 1}/{examQuestions.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(currentQ.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${flaggedQIds.includes(currentQ.id)
                          ? "bg-amber-100 border-amber-300 text-amber-900"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      title="Đánh dấu câu hỏi này"
                    >
                      <Flag className={`w-3.5 h-3.5 ${flaggedQIds.includes(currentQ.id) ? "fill-amber-600 text-amber-600" : ""}`} />
                      <span className="hidden md:inline">{flaggedQIds.includes(currentQ.id) ? "Đã đánh dấu" : "Đánh dấu"}</span>
                    </button>

                    {examQuestions[examCurrentQIndex] && (
                      <QuestionErrorReportButton
                        source="MOCK_TEST"
                        questionRef={`exam-${test.id}-${examQuestions[examCurrentQIndex].id}`}
                        relatedContent={`Đề thi: ${test.title} · Câu ${examQuestions[examCurrentQIndex].id} (${examQuestions[examCurrentQIndex].part})`}
                        questionSnapshot={{
                          questionText: examQuestions[examCurrentQIndex].questionText,
                          options: examQuestions[examCurrentQIndex].options,
                          correctAnswer: examQuestions[examCurrentQIndex].correctAnswer,
                          explanation: examQuestions[examCurrentQIndex].explanation,
                          part: examQuestions[examCurrentQIndex].part,
                          testTitle: test.title,
                        }}
                        compact
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={examCurrentQIndex === examQuestions.length - 1}
                      onClick={() => setExamCurrentQIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                    >
                      <span className="hidden sm:inline">Câu tiếp</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestSubmit}
                      className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md transition cursor-pointer active:scale-95"
                      title="Nộp bài thi"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Nộp bài</span>
                    </button>
                  </div>
                </footer>
              </div>
            );
          })()}

          {/* Màn hình kết quả sau khi nộp bài */}
          {examSubmitted && examResultScore && (() => {
            const lcQuestionsCount = examQuestions.filter((q) =>
              ["Part 1", "Part 2", "Part 3", "Part 4"].includes(q.part)
            ).length;
            const rcQuestionsCount = examQuestions.filter((q) =>
              ["Part 5", "Part 6", "Part 7"].includes(q.part)
            ).length;

            const isFullScale = examQuestions.length >= 200;
            const maxLC = isFullScale ? 495 : lcQuestionsCount * 5;
            const maxRC = isFullScale ? 495 : rcQuestionsCount * 5;
            const maxTotal = isFullScale ? 990 : examQuestions.length * 5;

            return (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xl">
                    <Trophy className="w-14 h-14 text-amber-300 mx-auto drop-shadow-md animate-bounce" />
                    <h2 className="text-2xl sm:text-3xl font-black">
                      Chúc mừng bạn đã hoàn thành bài thi!
                    </h2>
                    <p className="text-sm text-blue-100">
                      Điểm thi đã được lưu tự động vào bảng tiến độ và thẻ đề thi {test.title}.
                    </p>

                    <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 flex-wrap">
                      {lcQuestionsCount > 0 && (
                        <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl">
                          <p className="text-xs uppercase text-blue-200 font-bold">Listening</p>
                          <p className="text-2xl font-black">{examResultScore.listening} / {maxLC}</p>
                        </div>
                      )}

                      <div className="bg-white/25 backdrop-blur-xs px-6 py-4 rounded-2xl ring-2 ring-white/30">
                        <p className="text-xs uppercase text-amber-200 font-bold">
                          {isFullScale ? "Tổng điểm TOEIC" : "Tổng điểm"}
                        </p>
                        <p className="text-3xl sm:text-4xl font-black text-amber-300">
                          {examResultScore.total} {maxTotal > 0 ? `/ ${maxTotal}` : ""}
                        </p>
                        <p className="text-xs font-semibold text-blue-100 mt-1">
                          Đúng {examResultScore.correctCount} / {examQuestions.length} câu (5 điểm/câu)
                        </p>
                      </div>

                      {rcQuestionsCount > 0 && (
                        <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl">
                          <p className="text-xs uppercase text-blue-200 font-bold">Reading</p>
                          <p className="text-2xl font-black">{examResultScore.reading} / {maxRC}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                      Chi tiết đáp án & Giải thích AI từng câu:
                    </h3>

                    <div className="space-y-4">
                      {examQuestions.map((q) => {
                        const userAns = examAnswers[q.id];
                        const isCorrect = userAns === q.correctAnswer;

                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-2xl border transition ${isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-slate-800">
                                Câu {q.id} ({q.part})
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                  }`}
                              >
                                {isCorrect ? "Chính xác ✓" : `Sai ✗ (Bạn chọn: ${userAns || "Bỏ qua"})`}
                              </span>
                            </div>

                            <p className="text-xs text-slate-800 font-medium mb-2">{q.questionText}</p>

                            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                              <p className="font-semibold text-blue-700">
                                Đáp án đúng: <span className="font-bold">{q.correctAnswer}</span> - {q.options[q.correctAnswer]}
                              </p>
                              <p className="text-slate-600">
                                <span className="font-bold text-slate-700">Giải thích:</span> {q.explanation}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                              <span className="text-[11px] text-slate-500 font-medium">Phát hiện câu hỏi có vấn đề?</span>
                              <QuestionErrorReportButton
                                source="MOCK_TEST"
                                questionRef={`exam-${test.id}-${q.id}`}
                                relatedContent={`Đề thi: ${test.title} · Câu ${q.id} (${q.part})`}
                                questionSnapshot={{
                                  questionText: q.questionText,
                                  options: q.options,
                                  correctAnswer: q.correctAnswer,
                                  explanation: q.explanation,
                                  part: q.part,
                                  testTitle: test.title,
                                }}
                                compact
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                    >
                      Đóng và quay về danh sách đề
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* MODAL: DANH SÁCH TOÀN BỘ CÂU HỎI VỚI HỆ THỐNG ĐÈN XANH ĐÈN ĐỎ & ĐÁNH DẤU */}
        {isLocalQuestionGridOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header Grid */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Danh sách câu hỏi thi thử</h3>
                    <p className="text-xs text-slate-500">
                      Tổng số {examQuestions.length} câu • Nhấn vào câu để chuyển nhanh
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocalQuestionGridOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bảng chú thích ĐÈN XANH - ĐÈN ĐỎ */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold py-2.5 px-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 inline-block shadow-2xs" />
                  🟢 Đèn xanh: Đã làm ({Object.keys(examAnswers).length})
                </span>
                <span className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-600 inline-block shadow-2xs" />
                  🔴 Đèn đỏ: Chưa làm ({examQuestions.length - Object.keys(examAnswers).length})
                </span>
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center shadow-2xs">
                    <Flag className="w-2 h-2 fill-slate-950" />
                  </span>
                  🟡 Đã đánh dấu ({flaggedQIds.length})
                </span>
                <span className="flex items-center gap-1.5 text-blue-800">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 bg-white inline-block shadow-2xs" />
                  🔵 Đang chọn (Câu {examCurrentQIndex + 1})
                </span>
              </div>

              {/* Bộ lọc theo trạng thái / Part */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { key: "ALL", label: `Tất cả (${examQuestions.length})` },
                  { key: "ANSWERED", label: `🟢 Đã làm (${Object.keys(examAnswers).length})` },
                  { key: "UNANSWERED", label: `🔴 Chưa làm (${examQuestions.length - Object.keys(examAnswers).length})` },
                  { key: "FLAGGED", label: `🟡 Đánh dấu (${flaggedQIds.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedGridFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${selectedGridFilter === tab.key
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Lưới danh sách câu hỏi */}
              <div className="flex-1 overflow-y-auto max-h-[46vh] grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                {examQuestions
                  .map((q, idx) => ({ q, idx }))
                  .filter(({ q }) => {
                    const isAnswered = !!examAnswers[q.id];
                    const isFlagged = flaggedQIds.includes(q.id);
                    if (selectedGridFilter === "ANSWERED") return isAnswered;
                    if (selectedGridFilter === "UNANSWERED") return !isAnswered;
                    if (selectedGridFilter === "FLAGGED") return isFlagged;
                    return true;
                  })
                  .map(({ q, idx }) => {
                    const isCurrent = idx === examCurrentQIndex;
                    const isAnswered = !!examAnswers[q.id];
                    const isFlagged = flaggedQIds.includes(q.id);

                    // ĐÈN XANH vs ĐÈN ĐỎ
                    let btnStyle = "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300"; // ĐÈN ĐỎ
                    if (isAnswered) {
                      btnStyle = "bg-emerald-500 border-emerald-600 text-white font-bold shadow-xs hover:bg-emerald-600"; // ĐÈN XANH
                    }
                    if (isCurrent) {
                      btnStyle += " ring-2 ring-blue-600 ring-offset-1 font-black";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setExamCurrentQIndex(idx);
                          setIsLocalQuestionGridOpen(false);
                        }}
                        className={`relative h-12 rounded-xl border flex flex-col items-center justify-center text-xs transition-all cursor-pointer ${btnStyle}`}
                      >
                        {isFlagged && (
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs ring-1 ring-white"
                            title="Đã đánh dấu xem lại"
                          >
                            <Flag className="w-2.5 h-2.5 fill-slate-950" />
                          </span>
                        )}
                        <span className="font-extrabold text-[13px]">{idx + 1}</span>
                        <span className={`text-[9px] font-semibold ${isAnswered ? "text-emerald-100" : "text-rose-500"}`}>
                          {isAnswered ? `(${examAnswers[q.id]})` : q.part}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Footer Grid: Nút Nộp Bài & Đóng */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600 font-medium">
                  Đã hoàn thành <strong className="text-emerald-600 font-bold">{Object.keys(examAnswers).length}</strong> / {examQuestions.length} câu
                  {examQuestions.length - Object.keys(examAnswers).length > 0 && (
                    <span className="text-rose-600 font-bold ml-1">
                      (Còn {examQuestions.length - Object.keys(examAnswers).length} câu chưa làm)
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsLocalQuestionGridOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    Tiếp tục làm bài
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocalQuestionGridOpen(false);
                      handleRequestSubmit();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Nộp bài thi ngay</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DANH SÁCH TOÀN BỘ CÂU HỎI (CHUẨN ẢNH 2 THAY CHO ẢNH 1) */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header chuẩn Ảnh 2 */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Danh sách toàn bộ câu hỏi</h3>
                    <p className="text-xs text-slate-500">
                      Đã làm {Object.keys(examAnswers).length}/{examQuestions.length} câu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lưới danh sách câu hỏi bao quanh bởi khung bo góc chuẩn Ảnh 2 */}
              <div className="p-3 sm:p-4 bg-slate-50/70 rounded-2xl border border-slate-200/90 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5">
                  {examQuestions.map((q, idx) => {
                    const isCurrent = idx === examCurrentQIndex;
                    const hasAnswered = !!examAnswers[q.id];
                    const isFlagged = flaggedQIds.includes(q.id);

                    let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/30";
                    if (isCurrent) {
                      qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300 shadow-xs";
                    } else if (hasAnswered) {
                      qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500 shadow-2xs";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setExamCurrentQIndex(idx);
                          setShowSubmitConfirm(false);
                        }}
                        className={`relative h-12 rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer ${qBtnStyle}`}
                      >
                        {isFlagged && (
                          <span
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs ring-1 ring-white"
                            title="Đã đánh dấu"
                          >
                            <Flag className="w-2 h-2 fill-slate-950" />
                          </span>
                        )}
                        <span className="font-extrabold text-[13px]">{idx + 1}</span>
                        <span className={`text-[9px] font-semibold ${isCurrent || hasAnswered ? "opacity-90" : "text-slate-400"}`}>
                          {q.part}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer hành động chuẩn Ảnh 2: Nút Đóng danh sách & Nút Xác nhận nộp bài */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <div>
                  {examQuestions.length - Object.keys(examAnswers).length > 0 ? (
                    <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                      Còn {examQuestions.length - Object.keys(examAnswers).length} câu chưa làm
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Đã hoàn thành tất cả {examQuestions.length} câu
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Đóng danh sách
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirm(false);
                      onSubmitExam?.(examQuestions);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác nhận nộp bài</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
