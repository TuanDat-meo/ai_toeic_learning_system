"use client";

import React from "react";
import {
  TestItem,
  PracticeQuestion,
  normalizeToeicPart,
  extractQuestionDetails,
  extractOptionTranslations,
} from "@/app/admin/content/mock-tests/types";
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
  Languages,
  Search,
  ChevronDown,
  ChevronUp,
  Volume2,
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
  const [flaggedQIds, setFlaggedQIds] = React.useState<number[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);

  const [examQuestions, setExamQuestions] = React.useState<PracticeQuestion[]>(activeExamQuestions);
  const [currentExamParts, setCurrentExamParts] = React.useState<string[]>(activeExamParts);
  const [selectedParts, setSelectedParts] = React.useState<string[]>([]);
  const [selectedModeTab, setSelectedModeTab] = React.useState<"exam" | "practice">("exam");

  // Review mode states
  const [reviewFilter, setReviewFilter] = React.useState<"ALL" | "CORRECT" | "WRONG" | "UNANSWERED">("ALL");
  const [expandedReviewQuestions, setExpandedReviewQuestions] = React.useState<Record<number, boolean>>({});
  const [expandedVocabReview, setExpandedVocabReview] = React.useState<Record<string, boolean>>({});

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
    const filtered = activeExamQuestions.filter((q) => parts.includes(normalizeToeicPart(q.part)));
    setExamQuestions(filtered.length > 0 ? filtered : activeExamQuestions);
    setCurrentExamParts(parts);
    setExamDurationType("60");
    onStartExamNow(parts, 45);
  };

  const startReadingTest = () => {
    const parts = ["Part 5", "Part 6", "Part 7"];
    const filtered = activeExamQuestions.filter((q) => parts.includes(normalizeToeicPart(q.part)));
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
    const normSelected = selectedParts.map((p) => normalizeToeicPart(p));
    const filtered = activeExamQuestions.filter((q) => normSelected.includes(normalizeToeicPart(q.part)));
    if (filtered.length === 0) {
      triggerToast("Chưa có câu hỏi cho các Part đã chọn!");
      return;
    }
    setExamQuestions(filtered);
    setCurrentExamParts(selectedParts);
    const totalMins = selectedParts.reduce((acc, p) => acc + (PART_DURATIONS[p] || 15), 0);
    onStartExamNow(selectedParts, totalMins);
  };

  {/* Màn hình Chọn Chế Độ trước khi bắt đầu thi */}
  if (!examStarted && !examSubmitted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
          {/* Header Modal */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Chọn chế độ thi thử</h2>
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
                          <p className="text-xs text-slate-500 font-medium">Làm trọn vẹn 200 câu</p>
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
                          <p className="text-xs text-slate-500 font-medium">Part 1 - Part 4</p>
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
                          <p className="text-xs text-slate-500 font-medium">Part 5 - Part 7</p>
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

                {/* BOTTOM CARD: Thi theo Part */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-blue-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Thi theo Part cụ thể</h3>
                        <p className="text-xs text-slate-500">Chọn Part bạn muốn thi thử</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={startPartTest}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Bắt đầu thi Part đã chọn</span>
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
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                                isSelected
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
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                                isSelected
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
                          const filtered = activeExamQuestions.filter((q) => normalizeToeicPart(q.part) === item.id);
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

  const answeredCount = Object.keys(examAnswers).length;
  const unansweredCount = Math.max(0, examQuestions.length - answeredCount);

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
                ✓ {answeredCount}/{examQuestions.length}
              </div>

              {/* Question Grid Toggle */}
              <button
                type="button"
                onClick={handleOpenGrid}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-700/90 hover:bg-blue-800 border border-blue-400/40 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
                title="Mở danh sách toàn bộ câu hỏi"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Danh sách ({answeredCount}/{examQuestions.length})</span>
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
            const qPart = normalizeToeicPart(currentQ.part);
            const isListeningPart = qPart === "Part 1" || qPart === "Part 2" || qPart === "Part 3" || qPart === "Part 4";

            return (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
                  {/* LEFT PANE: Instruction & Content */}
                  <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Yêu cầu bài thi (Instruction)
                      </div>

                      {currentQ && (qPart === "Part 6" || qPart === "Part 7") && (
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug pb-1">
                          {currentQ.groupTitle || (qPart === "Part 6" ? "Questions 131–134 refer to the following article." : "Questions 147–148 refer to the following notice.")}
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

                      {/* Tuyệt đối KHÔNG hiện passage cho Listening parts trong lúc thi */}
                      {(qPart === "Part 6" || qPart === "Part 7") && currentQ.passage && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                          {currentQ.passage}
                        </div>
                      )}

                      {/* Đối với Part 1: Hiển thị ảnh chụp */}
                      {qPart === "Part 1" && currentQ.imageUrl && (
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                          <img
                            src={currentQ.imageUrl}
                            alt="Photograph"
                            className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                          />
                        </div>
                      )}

                      {/* Audio cho Listening */}
                      {currentQ.audioUrl && (
                        <AudioWaveformPlayer
                          audioUrl={currentQ.audioUrl}
                          isPlaying={isPlayingAudio}
                          onPlayPauseChange={(playing) => {
                            setIsPlayingAudio(playing);
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
                        {currentQ && (qPart === "Part 6" || qPart === "Part 7") && (
                          <div className="flex items-center gap-2 pb-1">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                              Nhóm câu {currentQ.groupId || (qPart === "Part 6" ? "131–134" : "147–148")}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">
                              ({currentQ.groupTotal || (qPart === "Part 6" ? "4" : "2")} câu hỏi)
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
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Đã chọn ({examAnswers[currentQ.id]})
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                              flaggedQIds.includes(currentQ.id)
                                ? "bg-amber-100 border-amber-300 text-amber-900 shadow-xs"
                                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                            }`}
                            title="Đánh dấu câu hỏi này để kiểm tra lại trước khi nộp bài"
                          >
                            <Flag className={`w-3.5 h-3.5 ${flaggedQIds.includes(currentQ.id) ? "fill-amber-600 text-amber-600" : ""}`} />
                            <span>{flaggedQIds.includes(currentQ.id) ? "Đã đánh dấu" : "Đánh dấu xem lại"}</span>
                          </button>
                        </div>

                        {/* Tiêu đề câu hỏi trong lúc thi */}
                        {qPart === "Part 2" ? (
                          <div className="space-y-1">
                            <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                              {examCurrentQIndex + 1}. Mark your answer on your answer sheet.
                            </div>
                            <p className="text-xs text-slate-500 italic">
                              Lắng nghe câu hỏi trong audio và chọn câu trả lời phù hợp (A), (B) hoặc (C).
                            </p>
                          </div>
                        ) : (
                          <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                            {examCurrentQIndex + 1}. {currentQ.questionText}
                          </div>
                        )}

                        {/* OPTIONS LIST */}
                        <div className="space-y-3">
                          {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                            if (qPart === "Part 2" && optKey === "D") return null;

                            const isChosen = examAnswers[currentQ.id] === optKey;
                            const isPart1or2 = qPart === "Part 1" || qPart === "Part 2";
                            // Trong lúc thi: Part 1 & 2 chỉ hiện (A), (B), (C), (D)
                            const labelText = isPart1or2 ? `(${optKey})` : `(${optKey}) ${optVal}`;

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
                                  // Tự động chuyển sang câu tiếp theo ngay sau khi chọn đáp án
                                  if (examCurrentQIndex < examQuestions.length - 1) {
                                    setTimeout(() => {
                                      setExamCurrentQIndex((prev) => Math.min(examQuestions.length - 1, prev + 1));
                                    }, 250);
                                  }
                                }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                                  isChosen
                                    ? "bg-blue-50/80 border-blue-500 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs"
                                    : "bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isChosen ? "border-blue-600 bg-white" : "border-slate-300"
                                }`}>
                                  {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                </div>
                                <span className="text-sm font-semibold">
                                  {labelText}
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
                      title="Mở danh sách câu hỏi"
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
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        flaggedQIds.includes(currentQ.id)
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

                    {/* NÚT NỘP BÀI THI */}
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

          {/* MÀN HÌNH KẾT QUẢ & CHỮA ĐỀ SAU KHI NỘP BÀI THI */}
          {examSubmitted && examResultScore && (() => {
            const lcQuestionsCount = examQuestions.filter((q) =>
              ["Part 1", "Part 2", "Part 3", "Part 4"].includes(normalizeToeicPart(q.part))
            ).length;
            const rcQuestionsCount = examQuestions.filter((q) =>
              ["Part 5", "Part 6", "Part 7"].includes(normalizeToeicPart(q.part))
            ).length;

            const isFullScale = examQuestions.length >= 200;
            const maxLC = isFullScale ? 495 : lcQuestionsCount * 5;
            const maxRC = isFullScale ? 495 : rcQuestionsCount * 5;
            const maxTotal = isFullScale ? 990 : examQuestions.length * 5;

            const totalQ = examQuestions.length;
            const correctQ = examResultScore.correctCount;
            const answeredQ = Object.keys(examAnswers).length;
            const wrongQ = answeredQ - correctQ;
            const unansweredQ = Math.max(0, totalQ - answeredQ);

            // Lọc danh sách câu hỏi xem lại
            const filteredQuestions = examQuestions
              .map((q, idx) => ({ q, idx }))
              .filter(({ q }) => {
                const userAns = examAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                if (reviewFilter === "CORRECT") return isCorrect;
                if (reviewFilter === "WRONG") return userAns && !isCorrect;
                if (reviewFilter === "UNANSWERED") return !userAns;
                return true;
              });

            return (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 font-sans">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* BẢNG TỔNG KẾT ĐIỂM SỐ */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
                    <Trophy className="w-14 h-14 text-amber-300 mx-auto drop-shadow-md" />
                    <h2 className="text-2xl sm:text-3xl font-black">
                      Chúc mừng bạn đã hoàn thành bài thi!
                    </h2>
                    <p className="text-sm text-blue-100 font-medium">
                      Đề thi: {test.title} • Điểm đã được lưu tự động vào hệ thống.
                    </p>

                    <div className="flex items-center justify-center gap-3 sm:gap-6 pt-2 flex-wrap">
                      {lcQuestionsCount > 0 && (
                        <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/20">
                          <p className="text-xs uppercase text-blue-200 font-bold">Listening</p>
                          <p className="text-2xl font-black">{examResultScore.listening} / {maxLC}</p>
                        </div>
                      )}

                      <div className="bg-white/25 backdrop-blur-xs px-6 py-4 rounded-2xl ring-2 ring-white/30 border border-white/30">
                        <p className="text-xs uppercase text-amber-200 font-bold">
                          {isFullScale ? "Tổng điểm TOEIC" : "Tổng điểm"}
                        </p>
                        <p className="text-3xl sm:text-4xl font-black text-amber-300">
                          {examResultScore.total} {maxTotal > 0 ? `/ ${maxTotal}` : ""}
                        </p>
                        <p className="text-xs font-semibold text-blue-100 mt-1">
                          Đúng {correctQ}/{totalQ} câu ({Math.round((correctQ / totalQ) * 100)}%)
                        </p>
                      </div>

                      {rcQuestionsCount > 0 && (
                        <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/20">
                          <p className="text-xs uppercase text-blue-200 font-bold">Reading</p>
                          <p className="text-2xl font-black">{examResultScore.reading} / {maxRC}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BỘ LỌC CHỮA ĐỀ THEO TRẠNG THÁI */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-blue-600" />
                          <span>Chi tiết đáp án, dịch nghĩa & Giải thích từng câu:</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Bấm vào từng câu để xem dịch câu hỏi, dịch đáp án, giải thích chi tiết và từ vựng cần học.
                        </p>
                      </div>

                      {/* Bộ lọc tab */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setReviewFilter("ALL")}
                          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                            reviewFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Tất cả ({totalQ})
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewFilter("CORRECT")}
                          className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                            reviewFilter === "CORRECT" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          <span>✓ Đúng ({correctQ})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewFilter("WRONG")}
                          className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                            reviewFilter === "WRONG" ? "bg-rose-600 text-white shadow-xs" : "text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          <span>✕ Sai ({wrongQ})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewFilter("UNANSWERED")}
                          className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                            reviewFilter === "UNANSWERED" ? "bg-slate-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Chưa làm ({unansweredQ})
                        </button>
                      </div>
                    </div>

                    {/* DANH SÁCH CÂU HỎI CHỮA ĐỀ */}
                    <div className="space-y-4">
                      {filteredQuestions.map(({ q, idx }) => {
                        const userAns = examAnswers[q.id];
                        const isCorrect = userAns === q.correctAnswer;
                        const isExpanded = expandedReviewQuestions[q.id] !== false; // mặc định mở
                        const details = extractQuestionDetails(q);
                        const qPart = normalizeToeicPart(q.part);

                        return (
                          <div
                            key={q.id}
                            className={`rounded-3xl border transition overflow-hidden shadow-xs ${
                              !userAns
                                ? "bg-slate-50 border-slate-300"
                                : isCorrect
                                ? "bg-emerald-50/40 border-emerald-300"
                                : "bg-rose-50/40 border-rose-300"
                            }`}
                          >
                            {/* Card Header */}
                            <div
                              onClick={() => {
                                setExpandedReviewQuestions((prev) => ({
                                  ...prev,
                                  [q.id]: !isExpanded,
                                }));
                              }}
                              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white border-b border-slate-100 hover:bg-slate-50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                  !userAns
                                    ? "bg-slate-100 text-slate-700"
                                    : isCorrect
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}>
                                  {q.questionNum || idx + 1}
                                </span>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-slate-900">
                                      Câu {q.questionNum || idx + 1}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                                      {q.part}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                                    {qPart === "Part 2" ? details.questionEn || "Part 2 Question" : q.questionText}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!userAns ? (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                    Chưa làm
                                  </span>
                                ) : isCorrect ? (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Chính xác ✓</span>
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                    <X className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Sai (Bạn chọn: {userAns})</span>
                                  </span>
                                )}

                                <div className="p-1 text-slate-400">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Card Body khi mở rộng */}
                            {isExpanded && (
                              <div className="p-5 sm:p-6 space-y-5 bg-white">
                                {/* Audio & Transcript nếu có */}
                                {q.audioUrl && (
                                  <div className="space-y-3">
                                    <AudioWaveformPlayer
                                      audioUrl={q.audioUrl}
                                      showSpeedControl={true}
                                      showReplayButton={true}
                                      title={`Audio ${q.part} • Câu ${q.questionNum || idx + 1}`}
                                    />

                                    {(q.passage || q.transcript) && (
                                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                                        <p className="font-bold text-slate-700 flex items-center gap-1.5">
                                          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                          <span>Transcript & Lời thoại bài nghe:</span>
                                        </p>
                                        <p className="font-mono text-slate-800 whitespace-pre-line leading-relaxed">
                                          {q.passage || q.transcript}
                                        </p>
                                        {(q.bilingualPassage || q.translation) && (
                                          <div className="pt-2 border-t border-slate-200 text-indigo-950">
                                            <p className="font-bold text-indigo-700 mb-0.5">Bản dịch tiếng Việt:</p>
                                            <p className="whitespace-pre-line leading-relaxed">{q.bilingualPassage || q.translation}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Hình ảnh Part 1 */}
                                {qPart === "Part 1" && q.imageUrl && (
                                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                                    <img
                                      src={q.imageUrl}
                                      alt="Part 1 Photograph"
                                      className="max-h-60 w-auto rounded-xl object-contain"
                                    />
                                  </div>
                                )}

                                {/* Nội dung câu hỏi & Bản dịch */}
                                <div className="space-y-2">
                                  <div className="text-sm font-extrabold text-slate-900 leading-relaxed">
                                    Câu {q.questionNum || idx + 1}. {qPart === "Part 2" ? details.questionEn : q.questionText}
                                  </div>
                                  {details.questionVi && (
                                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-medium flex items-start gap-2">
                                      <Languages className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold text-blue-800">Dịch câu hỏi: </span>
                                        <span>{details.questionVi}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* DANH SÁCH ĐÁP ÁN KÈM BẢN DỊCH TỪNG ĐÁP ÁN */}
                                <div className="space-y-2.5">
                                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Các lựa chọn đáp án:
                                  </span>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {Object.entries(q.options).map(([optKey, optVal]) => {
                                      if (qPart === "Part 2" && optKey === "D") return null;

                                      const isCorrectOpt = optKey === q.correctAnswer;
                                      const isUserChosen = userAns === optKey;
                                      const optTrans = details.optionTranslations[optKey];

                                      let optStyle = "bg-white border-slate-200 text-slate-800";
                                      if (isCorrectOpt) {
                                        optStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400";
                                      } else if (isUserChosen) {
                                        optStyle = "bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300";
                                      }

                                      return (
                                        <div
                                          key={optKey}
                                          className={`p-3.5 rounded-2xl border transition text-xs space-y-1 ${optStyle}`}
                                        >
                                          <div className="flex items-center justify-between gap-1">
                                            <span className="font-bold text-sm">
                                              ({optKey}) {optVal}
                                            </span>
                                            {isCorrectOpt && (
                                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                                Đáp án đúng ✓
                                              </span>
                                            )}
                                            {isUserChosen && !isCorrectOpt && (
                                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                                                Bạn đã chọn ✗
                                              </span>
                                            )}
                                          </div>

                                          {optTrans && (
                                            <p className="text-slate-600 font-medium italic text-[11px] pt-0.5">
                                              ↳ Dịch: {optTrans}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* GIẢI THÍCH CHI TIẾT & BẪY */}
                                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/90 text-xs sm:text-sm text-slate-800 space-y-2.5">
                                  <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs sm:text-sm">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    <span>Giải thích chi tiết & Bẫy trong câu:</span>
                                  </div>

                                  <p className="whitespace-pre-line leading-relaxed text-slate-700 font-medium">
                                    {details.explanation || q.explanation}
                                  </p>

                                  {(details.trapNote || q.trapNote || q.note) && (
                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                                      ⚠️ <strong>Mẹo làm bài / Bẫy cần tránh:</strong> {details.trapNote || q.trapNote || q.note}
                                    </div>
                                  )}
                                </div>

                                {/* TỪ VỰNG TRỌNG TÂM CẦN HỌC */}
                                {(() => {
                                  const vocabList = (details.vocabList && details.vocabList.length > 0 ? details.vocabList : q.vocabList) || (test.keyVocab ? test.keyVocab.slice(0, 3).map((k: any) => ({
                                    word: k.word,
                                    pos: k.pos,
                                    level: "TOEIC",
                                    ipa: k.ipa,
                                    meaning: k.meaning,
                                    example: { en: k.example, vi: "Ví dụ trong ngữ cảnh bài thi." },
                                    collocations: undefined,
                                  })) : []);

                                  if (vocabList.length === 0) return null;

                                  return (
                                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                                      <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                                        <BookOpen className="w-4 h-4 text-amber-600" />
                                        <span>Từ vựng trọng tâm cần học trong câu ({vocabList.length} từ):</span>
                                      </div>

                                      <div className="space-y-2">
                                        {vocabList.map((v: any, vIdx: number) => {
                                          const isVocabOpen = !!expandedVocabReview[`${q.id}-${v.word}`];
                                          return (
                                            <div key={vIdx} className="p-3 rounded-xl bg-white border border-amber-200/70 text-xs space-y-2">
                                              <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-extrabold text-slate-900">{v.word}</span>
                                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                                                  {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={() => setExpandedVocabReview((prev) => ({
                                                    ...prev,
                                                    [`${q.id}-${v.word}`]: !isVocabOpen,
                                                  }))}
                                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                                                >
                                                  <Search className="w-3 h-3" />
                                                  <span>{isVocabOpen ? "Thu gọn" : "🔍 Xem chi tiết"}</span>
                                                </button>
                                              </div>

                                              <p className="font-bold text-slate-800">{v.meaning}</p>

                                              {isVocabOpen && v.example && (
                                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
                                                  <p className="font-semibold text-slate-900">
                                                    &quot;{typeof v.example === "string" ? v.example : v.example.en}&quot;
                                                  </p>
                                                  {typeof v.example === "object" && v.example.vi && (
                                                    <p className="text-slate-600 italic">{v.example.vi}</p>
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

                                {/* Nút báo cáo lỗi câu hỏi */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                                  <span>Phát hiện câu hỏi có vấn đề?</span>
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
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nút thoát */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
                    >
                      Đóng và quay về danh sách đề
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* MODAL: XÁC NHẬN NỘP BÀI THI & DANH SÁCH CÂU HỎI */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Xác nhận nộp bài thi</h3>
                    <p className="text-xs text-slate-500">
                      Đã làm {answeredCount}/{examQuestions.length} câu hỏi
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

              {/* Thông báo tình trạng câu chưa làm */}
              {unansweredCount > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Bạn còn {unansweredCount} câu hỏi chưa làm!</p>
                    <p className="text-xs text-amber-700 font-normal mt-0.5">
                      Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Tuyệt vời! Bạn đã làm xong tất cả {examQuestions.length} câu hỏi.</p>
                    <p className="text-xs text-emerald-700 font-normal mt-0.5">
                      Bạn có chắc chắn muốn nộp bài thi để xem điểm không?
                    </p>
                  </div>
                </div>
              )}

              {/* Lưới danh sách câu hỏi */}
              <div className="p-3 sm:p-4 bg-slate-50/70 rounded-2xl border border-slate-200/90 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5">
                  {examQuestions.map((q, idx) => {
                    const isCurrent = idx === examCurrentQIndex;
                    const hasAnswered = !!examAnswers[q.id];
                    const isFlagged = flaggedQIds.includes(q.id);

                    let qBtnStyle = "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100";
                    if (hasAnswered) {
                      qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500 shadow-2xs";
                    }
                    if (isCurrent) {
                      qBtnStyle += " ring-2 ring-blue-600 font-black";
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
                        title={hasAnswered ? `Câu ${idx + 1}: Đã làm (${examAnswers[q.id]})` : `Câu ${idx + 1}: Chưa làm - Bấm để làm`}
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
                        <span className={`text-[9px] font-semibold ${hasAnswered ? "text-emerald-100" : "text-rose-500"}`}>
                          {hasAnswered ? `(${examAnswers[q.id]})` : q.part}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer hành động: Nút Tiếp tục làm bài & Nút Xác nhận nộp bài */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  Bấm vào số câu trên lưới để quay lại làm câu đó.
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    Tiếp tục làm bài
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitConfirm(false);
                      onSubmitExam?.(examQuestions);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
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
