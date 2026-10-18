"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { LevelCategoryCardData, DictationQuestion } from "@/app/admin/content/listening/types";
import { AudioWaveformPlayer } from "@/components/common/AudioWaveformPlayer";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";
import { saveItemProgress } from "@/lib/practiceProgress";

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
  const [addedVocabItems, setAddedVocabItems] = useState<string[]>([]);

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
  const resolvedAudioUrl = currentQ.audioUrl || "/ets_2024_lc/audio/part1_test1.mp3";

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
  const currentGroupQuestions = isGroupMode
    ? quizModalCard.questions.filter((q) => q.audioUrl === (quizModalCard.questions[activeQuizQIndex]?.audioUrl || quizModalCard.questions[0]?.audioUrl))
    : [quizModalCard.questions[activeQuizQIndex] || quizModalCard.questions[0]];
  const isGroupChecked = isGroupMode
    ? currentGroupQuestions.length > 0 && currentGroupQuestions.every((q) => !!quizAnswerChecked[q.id])
    : !!quizAnswerChecked[quizModalCard.questions[activeQuizQIndex]?.id];
  const isAllGroupAnswered = isGroupMode && currentGroupQuestions.length > 0 && currentGroupQuestions.every((q) => !!quizSelectedOption[q.id]);

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
      const list = q.vocabList || [
        {
          word: "pottery",
          pos: "n",
          level: "B2",
          ipa: "/ˈpɑːtəri/",
          meaning: "xưởng gốm",
          example: { en: "They visited a traditional pottery studio.", vi: "Họ đã ghé thăm một xưởng gốm truyền thống." },
          collocations: [{ en: "pottery class", vi: "lớp học làm gốm" }],
        },
        {
          word: "demonstrate",
          pos: "v",
          level: "B2",
          ipa: "/ˈdemənstreɪt/",
          meaning: "trình diễn, hướng dẫn",
          example: { en: "The instructor will demonstrate the procedure.", vi: "Người hướng dẫn sẽ trình diễn quy trình." },
        },
      ];
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

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
              01:30
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
              +50 XP
            </span>
            <button
              type="button"
              onClick={() => setIsQuestionGridOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-2xs font-mono transition cursor-pointer"
            >
              Câu {activeQuizQIndex + 1}/{quizModalCard.questions.length}
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
              Công cụ Bút vẽ Highlighting:
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
              onClick={() => triggerToast("Đã xóa tất cả nét vẽ")}
              className="px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition cursor-pointer"
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
                } else if (userAns) {
                  qBtnStyle = "bg-blue-100 border-blue-300 text-blue-800 font-semibold";
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
                    <span className="font-extrabold">{q.id >= 100 ? (q.id % 100) : (idx + 1)}</span>
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

                  {/* Audio Player Box (Interactive Waveform, Rewind, Forward & Click-to-Seek) */}
                  <AudioWaveformPlayer
                    audioUrl={resolvedAudioUrl}
                    isPlaying={isPlayingAudio}
                    onPlayPauseChange={(playing) => setIsPlayingAudio(playing)}
                    showSpeedControl={true}
                    showReplayButton={true}
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
                      <p className="text-base sm:text-lg font-medium text-slate-900 whitespace-pre-line leading-relaxed sm:leading-loose select-text">
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
                        onClick={() => triggerToast("Trợ lý AI đang sẵn sàng giải đáp!")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hỏi bài</span>
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
                                        playSfx("click");
                                        if (isChecked) return;
                                        const nextSelected = { ...quizSelectedOption, [qItem.id]: optKey };
                                        setQuizSelectedOption(nextSelected);

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

                                        const totalQ = quizModalCard.questions?.length || quizModalCard.totalQuestions || 10;
                                        saveItemProgress(`listening-quiz-${quizModalCard.id}`, Object.keys(nextSelected).length, totalQ);
                                      }}
                                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {iconNode}
                                        <span className={`text-sm ${textColor}`}>
                                          ({optKey}) {optVal}
                                        </span>
                                      </div>
                                      {isChecked && (
                                        <div className="flex items-center gap-2 pl-7 pt-0.5">
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
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
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
                                        <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Cụm từ hay gặp:</div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {v.collocations.map((col, cIdx) => (
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
                          <div className="text-base font-extrabold text-slate-900">
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
                                    playSfx("click");
                                    if (isChecked) return;
                                    const nextSelected = { ...quizSelectedOption, [q.id]: optKey };
                                    setQuizSelectedOption(nextSelected);
                                    setQuizAnswerChecked({ ...quizAnswerChecked, [q.id]: true });
                                    updateCardStats(q, optKey);
                                    const totalQ = quizModalCard.questions?.length || quizModalCard.totalQuestions || 10;
                                    saveItemProgress(`listening-quiz-${quizModalCard.id}`, Object.keys(nextSelected).length, totalQ);
                                  }}
                                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {iconNode}
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
                            {q.explanation || "Phân tích câu hỏi và đối chiếu nội dung bài nghe."}
                          </p>
                          {q.trapNote && (
                            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                              ⚠️ <strong>Bẫy cần tránh:</strong> {q.trapNote}
                            </div>
                          )}
                        </div>

                        {/* VOCABULARY SECTION */}
                        {(() => {
                          const singleVocabList = (q.vocabList && q.vocabList.length > 0)
                            ? q.vocabList
                            : (q.options ? Object.entries(q.options).map(([optKey, optVal]) => {
                                const clean = optVal.replace(/^[A-D]\.\s*/, "").replace(/[.,!?;:]/g, "").trim();
                                return {
                                  word: clean || `Option (${optKey})`,
                                  pos: "từ vựng",
                                  level: "TOEIC",
                                  ipa: `/${(clean || "option").toLowerCase()}/`,
                                  meaning: (q.optionTranslations && q.optionTranslations[optKey]) || `Đáp án lựa chọn (${optKey})`,
                                  example: {
                                    en: `Listen carefully to "${clean || optVal}" in TOEIC audio.`,
                                    vi: `Luyện nghe kỹ cụm từ "${clean || optVal}" trong bài nghe TOEIC.`,
                                  },
                                  collocations: undefined as { en: string; vi: string }[] | undefined,
                                };
                              }) : []);

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
                                          >
                                            <Volume2 className="w-3.5 h-3.5" />
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

                                      {isExpanded && (
                                        <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                                          {v.example && (
                                            <div className="space-y-1">
                                              <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Ví dụ câu:</div>
                                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
                                                <p className="font-semibold text-slate-900">&quot;{typeof v.example === "string" ? v.example : v.example.en}&quot;</p>
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
                                                {v.collocations.map((col, cIdx) => (
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
                : `${activeQuizQIndex + 1}/${quizModalCard.questions.length}`}
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
    </div>
  );
};
