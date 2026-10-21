"use client";

import React from "react";
import {
  TestItem,
  PracticeQuestion,
  normalizeToeicPart,
  extractQuestionDetails,
  extractOptionTranslations,
  VocabListItem,
} from "@/app/admin/content/mock-tests/types";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";
import { saveItemProgress } from "@/lib/practiceProgress";
import {
  ArrowLeft,
  Languages,
  Sparkles,
  FileText,
  Pencil,
  Volume2,
  Grid,
  HelpCircle,
  Star,
  BookOpen,
  Eye,
  Plus,
  Bookmark,
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Send,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Headphones,
  Target,
  Check,
  Clock,
  Layers,
} from "lucide-react";
import { AudioWaveformPlayer } from "@/components/common/AudioWaveformPlayer";

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
  // Chế độ cấu hình chọn Part luyện tập trước khi bắt đầu
  const [practiceStarted, setPracticeStarted] = React.useState(false);
  const [selectedModeTab, setSelectedModeTab] = React.useState<"practice" | "part">("practice");
  const [selectedPracticeParts, setSelectedPracticeParts] = React.useState<string[]>([
    "Part 1"
  ]);
  const [internalQuestions, setInternalQuestions] = React.useState<PracticeQuestion[]>(filteredPracticeQuestions);

  React.useEffect(() => {
    if (filteredPracticeQuestions && filteredPracticeQuestions.length > 0) {
      setInternalQuestions(filteredPracticeQuestions);
    }
  }, [filteredPracticeQuestions]);

  const startFullPractice = () => {
    setInternalQuestions(filteredPracticeQuestions);
    setSelectedPracticeParts(["Part 1", "Part 2", "Part 3", "Part 4", "Part 5", "Part 6", "Part 7"]);
    setPracticeCurrentQIndex(0);
    setPracticeAnswers({});
    setPracticeChecked({});
    setPracticeStarted(true);
  };

  const startListeningPractice = () => {
    const parts = ["Part 1", "Part 2", "Part 3", "Part 4"];
    const filtered = filteredPracticeQuestions.filter((q) => parts.includes(normalizeToeicPart(q.part)));
    setInternalQuestions(filtered.length > 0 ? filtered : filteredPracticeQuestions);
    setSelectedPracticeParts(parts);
    setPracticeCurrentQIndex(0);
    setPracticeAnswers({});
    setPracticeChecked({});
    setPracticeStarted(true);
  };

  const startReadingPractice = () => {
    const parts = ["Part 5", "Part 6", "Part 7"];
    const filtered = filteredPracticeQuestions.filter((q) => parts.includes(normalizeToeicPart(q.part)));
    setInternalQuestions(filtered.length > 0 ? filtered : filteredPracticeQuestions);
    setSelectedPracticeParts(parts);
    setPracticeCurrentQIndex(0);
    setPracticeAnswers({});
    setPracticeChecked({});
    setPracticeStarted(true);
  };

  const startCustomPartsPractice = () => {
    if (selectedPracticeParts.length === 0) {
      triggerToast("Vui lòng chọn ít nhất một Part để bắt đầu!");
      return;
    }
    const normSelected = selectedPracticeParts.map((p) => normalizeToeicPart(p));
    const filtered = filteredPracticeQuestions.filter((q) => normSelected.includes(normalizeToeicPart(q.part)));
    if (filtered.length === 0) {
      triggerToast("Chưa có câu hỏi cho các Part đã chọn!");
      return;
    }
    setInternalQuestions(filtered);
    setPracticeCurrentQIndex(0);
    setPracticeAnswers({});
    setPracticeChecked({});
    setPracticeStarted(true);
  };

  const baseQuestion = internalQuestions[practiceCurrentQIndex] || internalQuestions[0];
  const questionRef = baseQuestion ? `MOCK-${test.id}-${baseQuestion.id}` : "";
  const [questionCorrectionState, setQuestionCorrectionState] = React.useState<{ ref: string; value: QuestionCorrection | null } | null>(null);

  React.useEffect(() => {
    let active = true;
    if (!questionRef) return () => { active = false; };
    getQuestionCorrection(questionRef)
      .then((correction) => {
        if (active) setQuestionCorrectionState({ ref: questionRef, value: correction });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [questionRef]);

  const questionCorrection = questionCorrectionState?.ref === questionRef ? questionCorrectionState.value : null;
  const currentQ = baseQuestion && questionCorrection ? {
    ...baseQuestion,
    questionText: questionCorrection.questionText || baseQuestion.questionText,
    options: Array.isArray(questionCorrection.options)
      ? Object.fromEntries(questionCorrection.options.map((option, index) => [String.fromCharCode(65 + index), option]))
      : questionCorrection.options || baseQuestion.options,
    correctAnswer: questionCorrection.correctAnswer || baseQuestion.correctAnswer,
    explanation: questionCorrection.explanation || baseQuestion.explanation,
    passage: questionCorrection.passage || baseQuestion.passage,
  } : baseQuestion;

  const qPart = currentQ ? normalizeToeicPart(currentQ.part) : "Part 1";
  const chosenOpt = currentQ ? practiceAnswers[currentQ.id] : undefined;
  const isChecked = currentQ ? !!practiceChecked[currentQ.id] : false;
  const [expandedWords, setExpandedWords] = React.useState<Record<string, boolean>>({});

  // Các state xác nhận nộp bài & hoàn thành buổi luyện tập
  const [showPracticeSubmitConfirm, setShowPracticeSubmitConfirm] = React.useState(false);
  const [isPracticeCompleted, setIsPracticeCompleted] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);

  React.useEffect(() => {
    setIsPlayingAudio(false);
    setShowTranscript(false);
  }, [practiceCurrentQIndex, setIsPlayingAudio]);

  const details = currentQ
    ? extractQuestionDetails(currentQ)
    : { questionEn: "", questionVi: "", optionTranslations: {} as Record<string, string>, vocabList: [] as VocabListItem[], trapNote: "", explanation: "" };

  const isListeningPart = qPart === "Part 1" || qPart === "Part 2" || qPart === "Part 3" || qPart === "Part 4";

  // Thống kê kết quả
  const totalQuestions = internalQuestions.length;
  const answeredCount = Object.keys(practiceAnswers).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const correctCount = Object.entries(practiceAnswers).filter(([qId, ans]) => {
    const q = internalQuestions.find((item) => item.id === Number(qId));
    return q && ans === q.correctAnswer;
  }).length;
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    {/* Màn hình Chọn Chế Độ Luyện Tập (Practice Mode Setup Modal) - Khớp 100% Ảnh 1 */}
  if (!practiceStarted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
          {/* Header Modal */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Chọn chế độ luyện tập</h2>
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


            {/* CONTENT FOR PRACTICE TAB */}
            {selectedModeTab === "practice" && (
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
                        onClick={startFullPractice}
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

                  {/* Luyện Listening */}
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
                        onClick={startListeningPractice}
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

                  {/* Luyện Reading */}
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
                        onClick={startReadingPractice}
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

                {/* BOTTOM CARD: Thi theo Part cụ thể (khớp 100% Ảnh 1) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-blue-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Thi theo Part cụ thể</h3>
                        <p className="text-xs text-slate-500">Chọn Part bạn muốn luyện tập</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={startCustomPartsPractice}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Bắt đầu luyện Part đã chọn</span>
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
                          const isSelected = selectedPracticeParts.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPracticeParts(selectedPracticeParts.filter((item) => item !== p.id));
                                } else {
                                  setSelectedPracticeParts([...selectedPracticeParts, p.id]);
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
                          const isSelected = selectedPracticeParts.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPracticeParts(selectedPracticeParts.filter((item) => item !== p.id));
                                } else {
                                  setSelectedPracticeParts([...selectedPracticeParts, p.id]);
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

            {/* CONTENT FOR PART TAB */}
            {selectedModeTab === "part" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chọn Part để bắt đầu luyện tập
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "ALL", title: "Tất cả các Part", count: "Đầy đủ 7 Part" },
                    { id: "Part 1", title: "Part 1: Photographs", count: "Mô tả hình ảnh (6 câu)" },
                    { id: "Part 2", title: "Part 2: Question-Response", count: "Hỏi & Đáp ngắn (25 câu)" },
                    { id: "Part 3", title: "Part 3: Conversations", count: "Hội thoại ngắn (39 câu)" },
                    { id: "Part 4", title: "Part 4: Short Talks", count: "Bài nói ngắn (30 câu)" },
                    { id: "Part 5", title: "Part 5: Incomplete Sentences", count: "Điền câu (30 câu)" },
                    { id: "Part 6", title: "Part 6: Text Completion", count: "Điền đoạn văn (16 câu)" },
                    { id: "Part 7", title: "Part 7: Reading Comprehension", count: "Đọc hiểu đoạn văn (54 câu)" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === "ALL") {
                          startFullPractice();
                        } else {
                          const normSelected = normalizeToeicPart(item.id);
                          const filtered = filteredPracticeQuestions.filter((q) => normalizeToeicPart(q.part) === normSelected);
                          setInternalQuestions(filtered.length > 0 ? filtered : filteredPracticeQuestions);
                          setSelectedPracticeParts([item.id]);
                          setPracticeCurrentQIndex(0);
                          setPracticeAnswers({});
                          setPracticeChecked({});
                          setPracticeStarted(true);
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
              Luyện tập: {test.title}
            </span>

            {/* Nút đổi Part / Chế độ */}
            <button
              type="button"
              onClick={() => setPracticeStarted(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition cursor-pointer"
              title="Đổi Part hoặc cấu hình lại chế độ luyện tập"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đổi Part / Chế độ</span>
            </button>
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
            {currentQ && (qPart === "Part 6" || qPart === "Part 7") && (
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
            {isListeningPart && (
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
                triggerToast(`Tiến độ: Đã làm ${answeredCount}/${totalQuestions} câu • Đúng ${correctCount} câu (${accuracyPercent}%) 🎯`);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-2xs transition cursor-pointer"
            >
              ✓ {correctCount}/{totalQuestions}
            </button>

            {/* Question Matrix */}
            <button
              type="button"
              onClick={() => setIsQuestionGridOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 border border-blue-400/40 text-white text-xs font-extrabold shadow-2xs font-mono transition cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Câu {practiceCurrentQIndex + 1}/{totalQuestions}</span>
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
                    <p className="text-xs text-slate-500">Câu {currentQ.questionNum || practiceCurrentQIndex + 1} • {currentQ.part}</p>
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
                      Đã làm {answeredCount}/{totalQuestions} câu • Đúng {correctCount} câu ({accuracyPercent}%)
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
                {internalQuestions.map((q, idx) => {
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

        {/* MÀN HÌNH TỔNG KẾT BUỔI LUYỆN TẬP KHI BẤM NỘP BÀI */}
        {isPracticeCompleted ? (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex items-center justify-center font-sans">
            <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                  <Trophy className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Tổng kết buổi luyện tập</h2>
                <p className="text-sm text-slate-500 font-medium">Đề thi: {test.title}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">{correctCount}</div>
                  <div className="text-xs font-bold text-emerald-800 uppercase mt-1">Câu đúng ✓</div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-rose-600">{answeredCount - correctCount}</div>
                  <div className="text-xs font-bold text-rose-800 uppercase mt-1">Câu sai ✗</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-slate-700">{unansweredCount}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase mt-1">Chưa làm</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-blue-700 font-bold uppercase">Độ chính xác:</span>
                  <div className="text-2xl font-black text-blue-900">{accuracyPercent}%</div>
                </div>
                <div className="text-right text-xs text-blue-800 font-medium">
                  Đã làm {answeredCount}/{totalQuestions} câu hỏi
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPracticeCompleted(false)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md"
                >
                  🔍 Xem lại đề & Chữa bài
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Hoàn thành & Thoát
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN DUAL PANE PRACTICE AREA */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
            
            {/* LEFT PANE */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Yêu cầu bài tập (Instruction)
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

                {/* PASSAGE RENDERING */}
                {/* Đối với Part 6 & 7: Luôn hiển thị đoạn văn để đọc làm bài */}
                {(qPart === "Part 6" || qPart === "Part 7") && currentQ && currentQ.passage && (
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

                {/* Đối với Part 1: Hiển thị hình ảnh */}
                {currentQ && qPart === "Part 1" && currentQ.imageUrl && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-center overflow-hidden">
                    <img
                      src={currentQ.imageUrl}
                      alt="Photograph"
                      className="max-h-[380px] w-auto max-w-full rounded-xl object-contain"
                    />
                  </div>
                )}

                {/* Âm thanh bài nghe */}
                {currentQ && currentQ.audioUrl && (
                  <AudioWaveformPlayer
                    audioUrl={currentQ.audioUrl}
                    isPlaying={isPlayingAudio}
                    onPlayPauseChange={(playing) => setIsPlayingAudio(playing)}
                    showSpeedControl={true}
                    showReplayButton={true}
                    title={`Audio ${currentQ.part || "Listening"} • Câu ${practiceCurrentQIndex + 1}`}
                  />
                )}

                {/* Đối với bài nghe (Part 1, 2, 3, 4): CHỈ HIỂN THỊ TRANSCRIPT KHI ĐÃ TRẢ LỜI/KIỂM TRA */}
                {isListeningPart && isChecked && (currentQ.passage || currentQ.transcript) && (
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTranscript((prev) => !prev)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        <span>Transcript & Lời thoại bài nghe</span>
                      </span>
                      <span className="text-blue-600 font-semibold">{showTranscript ? "▲ Thu gọn" : "▼ Xem lời thoại"}</span>
                    </button>

                    {showTranscript && (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs font-mono whitespace-pre-line text-slate-800 leading-relaxed shadow-xs">
                          <p className="font-sans font-bold text-slate-700 mb-1">Lời thoại tiếng Anh:</p>
                          {currentQ.passage || currentQ.transcript}
                        </div>

                        {(currentQ.bilingualPassage || currentQ.translation) && (
                          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 whitespace-pre-line leading-relaxed shadow-xs">
                            <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                              <Languages className="w-3.5 h-3.5" /> Bản dịch song ngữ tiếng Việt:
                            </p>
                            {currentQ.bilingualPassage || currentQ.translation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANE */}
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

                  {/* TIÊU ĐỀ CÂU HỎI */}
                  {qPart === "Part 2" ? (
                    !isChecked ? (
                      <div className="space-y-1">
                        <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                          Câu {currentQ.questionNum || practiceCurrentQIndex + 1}. Mark your answer on your answer sheet.
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          Lắng nghe câu hỏi trong audio và chọn câu trả lời phù hợp (A), (B) hoặc (C).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                          Câu {currentQ.questionNum || practiceCurrentQIndex + 1}. {details.questionEn || currentQ.questionText}
                        </div>
                        {details.questionVi && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs sm:text-sm font-semibold leading-relaxed shadow-xs space-y-1 animate-in fade-in duration-200">
                            <div className="font-bold text-blue-700 flex items-center gap-1.5">
                              <Languages className="w-4 h-4 text-blue-600" />
                              <span>Dịch câu hỏi:</span>
                            </div>
                            <p className="text-blue-950 font-medium">{details.questionVi}</p>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                        Câu {currentQ.questionNum || practiceCurrentQIndex + 1}. {currentQ.questionText}
                      </div>
                      {isChecked && (details.questionVi || currentQ.translation) && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs sm:text-sm font-semibold leading-relaxed shadow-xs space-y-1 animate-in fade-in duration-200">
                          <div className="font-bold text-blue-700 flex items-center gap-1.5">
                            <Languages className="w-4 h-4 text-blue-600" />
                            <span>Bản dịch tiếng Việt:</span>
                          </div>
                          <p className="text-blue-950 font-medium">{details.questionVi || currentQ.translation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DANH SÁCH LỰA CHỌN ĐÁP ÁN */}
                  <div className="space-y-3">
                    {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                      if (qPart === "Part 2" && optKey === "D") return null;

                      const isChosen = chosenOpt === optKey;
                      const isRight = optKey === currentQ.correctAnswer;
                      const isPart1or2 = qPart === "Part 1" || qPart === "Part 2";

                      let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                      let iconNode: React.ReactNode = (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                          {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                      );
                      let textColor = "text-slate-900";

                      if (isChecked) {
                        if (isRight) {
                          cardStyle = "bg-emerald-50/70 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400/40";
                          textColor = "text-emerald-800 font-semibold";
                          iconNode = (
                            <div className="w-5 h-5 rounded-full border border-emerald-600 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-black bg-emerald-50">
                              ✓
                            </div>
                          );
                        } else if (isChosen) {
                          cardStyle = "bg-rose-50/70 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-400/40";
                          textColor = "text-rose-800 font-semibold";
                          iconNode = (
                            <div className="w-5 h-5 rounded-full border border-rose-600 text-rose-600 flex items-center justify-center shrink-0 text-xs font-black bg-rose-50">
                              ✕
                            </div>
                          );
                        } else {
                          cardStyle = "bg-white border-slate-200 text-slate-800";
                          textColor = "text-slate-800 font-medium";
                          iconNode = (
                            <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                          );
                        }
                      }

                      // Nếu là Part 1 hoặc Part 2 khi CHƯA chọn: chỉ hiện (A), (B), (C)
                      const labelText = isPart1or2 && !isChecked ? `(${optKey})` : `(${optKey}) ${optVal}`;
                      const optTranslation = details.optionTranslations[optKey];

                      return (
                        <div
                          key={optKey}
                          onClick={() => {
                            if (isChecked) return;
                            if (isSfxEnabled) {
                              if (optKey === currentQ.correctAnswer) playSfx("correct");
                              else playSfx("wrong");
                            }
                            const nextAnswers = { ...practiceAnswers, [currentQ.id]: optKey };
                            setPracticeAnswers(nextAnswers);
                            setPracticeChecked({ ...practiceChecked, [currentQ.id]: true });
                            saveItemProgress(`mock-test-${test.id}`, Object.keys(nextAnswers).length, totalQuestions || 200);
                          }}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${cardStyle}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="pt-0.5">{iconNode}</div>
                            <div className="flex-1">
                              <span className={`text-sm ${textColor}`}>
                                {labelText}
                              </span>
                              {/* Hiển thị bản dịch tiếng Việt của từng đáp án sau khi đã kiểm tra */}
                              {isChecked && optTranslation && (
                                <div className="mt-1 text-xs text-slate-600 font-medium italic flex items-center gap-1.5">
                                  <span className="text-slate-400 font-semibold">↳ Dịch:</span>
                                  <span>{optTranslation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GIẢI THÍCH CHI TIẾT & BẪY TRONG CÂU (TỰ ĐỘNG HIỂN THỊ KHI ĐÃ TRẢ LỜI) */}
                {isChecked && (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-3xl border border-blue-200/90 bg-blue-50/40 p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>Giải thích chi tiết & Bẫy trong câu</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                          Đáp án đúng: ({currentQ.correctAnswer})
                        </span>
                      </div>

                      <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pt-1 border-t border-blue-100">
                        {currentQ.explanation ? (
                          <p className="text-slate-800 font-medium whitespace-pre-line">{currentQ.explanation}</p>
                        ) : (
                          <>
                            <div>
                              <p className="font-bold text-slate-900 mb-0.5">Bước 1: Xác định dạng câu hỏi</p>
                              <p className="text-slate-700">
                                {currentQ.step1 || 'Phân tích ngữ nghĩa và từ loại của các lựa chọn A, B, C, D.'}
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 mb-0.5">Bước 2: Phân tích ngữ cảnh câu hỏi</p>
                              <p className="text-slate-700">
                                {currentQ.step2 || 'Xét ngữ cảnh và vị trí chỗ trống trong bài thi thử.'}
                              </p>
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 mb-0.5">Bước 3: Chọn đáp án chính xác</p>
                              <p className="text-slate-700">
                                {currentQ.step3 || `Đáp án đúng là (${currentQ.correctAnswer}).`}
                              </p>
                            </div>
                          </>
                        )}

                        {(details.trapNote || currentQ.note || currentQ.trapNote) && (
                          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                            ⚠️ <strong>Mẹo & Bẫy thường gặp:</strong> {details.trapNote || currentQ.trapNote || currentQ.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TỪ VỰNG TRỌNG TÂM CẦN HỌC */}
                    {(() => {
                      const vocabList = (details.vocabList && details.vocabList.length > 0 ? details.vocabList : currentQ.vocabList) || (test.keyVocab ? test.keyVocab.map((k: any) => ({
                        word: k.word,
                        pos: k.pos,
                        level: "TOEIC",
                        ipa: k.ipa,
                        meaning: k.meaning,
                        example: { en: k.example, vi: "Ví dụ trong ngữ cảnh bài thi." },
                        collocations: undefined as { en: string; vi: string }[] | undefined,
                      })) : []);

                      if (vocabList.length === 0) return null;

                      return (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 space-y-4 shadow-2xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                              <BookOpen className="w-4 h-4 text-amber-600" />
                              <span>Từ vựng trọng tâm cần học ({vocabList.length} từ)</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const nextState = !isVocabExpanded;
                                setIsVocabExpanded(nextState);
                                const newMap: Record<string, boolean> = {};
                                vocabList.forEach((v: any) => {
                                  newMap[v.word] = nextState;
                                });
                                setExpandedWords(newMap);
                              }}
                              className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-amber-300"
                            >
                              {isVocabExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              <span>{isVocabExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}</span>
                            </button>
                          </div>

                          <div className="space-y-3 pt-1 border-t border-amber-100">
                            {vocabList.map((v: any, idx: number) => {
                              const isExpanded = !!expandedWords[v.word] || isVocabExpanded;

                              return (
                                <div key={idx} className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                                      {v.level && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{v.level}</span>}
                                      {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setExpandedWords((prev) => ({ ...prev, [v.word]: !prev[v.word] }))}
                                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                                    >
                                      <Search className="w-3 h-3" />
                                      <span>{isExpanded ? "Thu gọn" : "🔍 Xem chi tiết"}</span>
                                    </button>
                                  </div>

                                  <p className="font-bold text-slate-800">{v.meaning}</p>

                                  {isExpanded && (
                                    <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                                      {v.example && (
                                        <div className="space-y-1">
                                          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Ví dụ câu:</div>
                                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
                                            <p className="font-semibold text-slate-900">
                                              &quot;{typeof v.example === "string" ? v.example : v.example.en}&quot;
                                            </p>
                                            {typeof v.example === "object" && v.example.vi && (
                                              <p className="text-slate-600 italic">{v.example.vi}</p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {v.collocations && v.collocations.length > 0 && (
                                        <div className="space-y-1">
                                          <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Cụm từ hay gặp:</div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {v.collocations.map((col: any, cIdx: number) => (
                                              <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                                <strong>{col.en}</strong>: {col.vi}
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
        )}

        {/* BOTTOM NAV FOOTER */}
        {!isPracticeCompleted && (
          <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {currentQ && (
                <QuestionErrorReportButton
                  source="MOCK_TEST"
                  questionRef={`MOCK-${test.id}-${currentQ.id}`}
                  relatedContent={`${test.title} · ${currentQ.part} · Câu ${practiceCurrentQIndex + 1}`}
                  questionSnapshot={{
                    questionText: currentQ.questionText,
                    options: currentQ.options,
                    correctAnswer: currentQ.correctAnswer,
                    explanation: currentQ.explanation,
                    passage: currentQ.passage,
                    imageUrl: currentQ.imageUrl,
                    audioUrl: currentQ.audioUrl,
                    part: currentQ.part,
                  }}
                  compact
                  onSubmitted={(ticket) => triggerToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)}
                />
              )}

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
                title="Câu trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold transition shadow-xs cursor-pointer font-mono"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{practiceCurrentQIndex + 1}/{totalQuestions}</span>
              </button>

              <button
                type="button"
                disabled={practiceCurrentQIndex === totalQuestions - 1}
                onClick={() => setPracticeCurrentQIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Câu tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* NÚT NỘP BÀI LUYỆN TẬP */}
              <button
                type="button"
                onClick={() => setShowPracticeSubmitConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md transition cursor-pointer active:scale-95"
                title="Nộp bài luyện tập"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp bài</span>
              </button>
            </div>
          </footer>
        )}

        {/* MODAL XÁC NHẬN NỘP BÀI LUYỆN TẬP */}
        {showPracticeSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header xác nhận */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Xác nhận nộp bài luyện tập</h3>
                    <p className="text-xs text-slate-500">
                      Đã làm {answeredCount}/{totalQuestions} câu hỏi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPracticeSubmitConfirm(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thông báo tình trạng câu chưa làm */}
              {unansweredCount > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Bạn còn {unansweredCount} câu hỏi chưa làm!</p>
                    <p className="text-xs text-amber-700 font-normal mt-0.5">
                      Bạn có chắc chắn muốn nộp bài bây giờ không, hay muốn quay lại làm tiếp?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Tuyệt vời! Bạn đã làm xong tất cả {totalQuestions} câu hỏi.</p>
                    <p className="text-xs text-emerald-700 font-normal mt-0.5">
                      Bạn có chắc chắn muốn nộp bài để xem tổng kết điểm không?
                    </p>
                  </div>
                </div>
              )}

              {/* Lưới danh sách câu hỏi để xem hoặc chọn câu chưa làm */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 overflow-y-auto max-h-[45vh]">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                  {internalQuestions.map((q, idx) => {
                    const hasAnswered = !!practiceAnswers[q.id];
                    const isCurrent = idx === practiceCurrentQIndex;

                    let qStyle = "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100";
                    if (hasAnswered) {
                      qStyle = "bg-emerald-500 border-emerald-600 text-white font-bold";
                    }
                    if (isCurrent) {
                      qStyle += " ring-2 ring-blue-600 font-black";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setPracticeCurrentQIndex(idx);
                          setShowPracticeSubmitConfirm(false);
                        }}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer ${qStyle}`}
                        title={hasAnswered ? `Câu ${idx + 1}: Đã làm (${practiceAnswers[q.id]})` : `Câu ${idx + 1}: Chưa làm - Bấm để làm`}
                      >
                        <span className="font-extrabold">{idx + 1}</span>
                        <span className="text-[9px] opacity-80">{q.part}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  Bấm vào số câu trên lưới để quay lại làm câu đó.
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPracticeSubmitConfirm(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                  >
                    Tiếp tục làm bài
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPracticeSubmitConfirm(false);
                      setIsPracticeCompleted(true);
                      triggerToast("Đã nộp bài luyện tập thành công! 🎉");
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
