"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Zap,
  Bookmark,
  FileText,
  Lock,
  BookOpen,
  Volume2,
  ShoppingBag,
  Grid,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  RotateCcw,
  Check,
  Languages,
  Headphones,
} from "lucide-react";
import { DictationCardData } from "@/app/admin/content/listening/types";
import { AudioWaveformPlayer } from "@/components/common/AudioWaveformPlayer";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";
import { saveItemProgress } from "@/lib/practiceProgress";
import { saveListeningProgress } from "@/lib/api/listening";
import { getEnrichedVocabDetail } from "@/lib/toeicVocabDetailEnricher";

interface ListeningDictationModalProps {
  dictationModalCard: DictationCardData;
  setDictationModalCard: (card: DictationCardData | null) => void;
  activeDictationQIndex: number;
  setActiveDictationQIndex: (idx: number) => void;
  dictationUserInputs: { [qId: number]: string };
  dictationChecked: { [qId: number]: boolean };
  dictationSubTab: "chep" | "check" | "full";
  setDictationSubTab: (tab: "chep" | "check" | "full") => void;
  fillPercentage: 30 | 50 | 100;
  setFillPercentage: (pct: 30 | 50 | 100) => void;
  revealedWordCount: number;
  setRevealedWordCount: React.Dispatch<React.SetStateAction<number>>;
  replayCount: number;
  setReplayCount: React.Dispatch<React.SetStateAction<number>>;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
  audioSpeed: "0.8" | "1.0" | "1.2";
  setAudioSpeed: (speed: "0.8" | "1.0" | "1.2") => void;
  flaggedReviewIds: number[];
  handleToggleFlagReview: (qId: number) => void;
  setIsNotesModalOpen: (open: boolean) => void;
  setIsQuestionGridOpen: (open: boolean) => void;
  playSfx: (type?: "correct" | "wrong" | "click") => void;
  playAudio: (text: string) => void;
  triggerToast: (msg: string) => void;
}

export const ListeningDictationModal: React.FC<ListeningDictationModalProps> = ({
  dictationModalCard,
  setDictationModalCard,
  activeDictationQIndex,
  setActiveDictationQIndex,
  dictationChecked,
  dictationSubTab,
  setDictationSubTab,
  fillPercentage,
  setFillPercentage,
  revealedWordCount,
  setRevealedWordCount,
  replayCount,
  setReplayCount,
  isPlayingAudio,
  setIsPlayingAudio,
  audioSpeed,
  setAudioSpeed,
  flaggedReviewIds,
  handleToggleFlagReview,
  setIsNotesModalOpen,
  setIsQuestionGridOpen,
  playSfx,
  playAudio,
  triggerToast,
}) => {
  const [expandedVocab, setExpandedVocab] = useState<Record<string, boolean>>({});
  const [isLocalQuestionGridOpen, setIsLocalQuestionGridOpen] = useState(false);
  const [isLocalNotesModalOpen, setIsLocalNotesModalOpen] = useState(false);
  const [userNotes, setUserNotes] = useState<{ [qId: number]: string }>({});
  const [selfAssessment, setSelfAssessment] = useState<{ [qId: number]: "clear" | "partial" | "hard" }>({});

  const baseQuestion = dictationModalCard.questions[activeDictationQIndex];
  const questionRef = baseQuestion ? `DICTATION-${dictationModalCard.id}-${baseQuestion.id}` : "";
  const [questionCorrectionState, setQuestionCorrectionState] = useState<{ ref: string; value: QuestionCorrection | null } | null>(null);
  React.useEffect(() => {
    let active = true;
    if (!questionRef) return () => { active = false; };
    getQuestionCorrection(questionRef).then((correction) => { if (active) setQuestionCorrectionState({ ref: questionRef, value: correction }); }).catch(() => undefined);
    return () => { active = false; };
  }, [questionRef]);
  const questionCorrection = questionCorrectionState?.ref === questionRef ? questionCorrectionState.value : null;
  const correctionOptions = Array.isArray(questionCorrection?.options)
    ? Object.fromEntries(questionCorrection.options.map((option, index) => [String.fromCharCode(65 + index), option]))
    : questionCorrection?.options || baseQuestion?.options;
  const q = baseQuestion && questionCorrection ? {
    ...baseQuestion,
    question: questionCorrection.questionText || baseQuestion.question,
    fullTranscript: questionCorrection.questionText || baseQuestion.fullTranscript,
    options: correctionOptions,
    correctAnswer: questionCorrection.correctAnswer || baseQuestion.correctAnswer,
    explanation: questionCorrection.explanation || baseQuestion.explanation,
  } : baseQuestion;
  const resolvedAudioUrl = q?.audioUrl || "/ets_2024_lc/audio/part1_test1.mp3";

  React.useEffect(() => {
    setIsPlayingAudio(false);
  }, [activeDictationQIndex, setIsPlayingAudio]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        setActiveDictationQIndex(Math.max(0, activeDictationQIndex - 1));
      } else if (e.key === "ArrowRight") {
        setActiveDictationQIndex(Math.min(dictationModalCard.questions.length - 1, activeDictationQIndex + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDictationQIndex, dictationModalCard.questions.length, setActiveDictationQIndex]);

  const [localChecked, setLocalChecked] = useState<{ [qId: number]: boolean }>({});
  const [inputsByQuestion, setInputsByQuestion] = useState<{ [qId: number]: { [wordIdx: number]: string } }>({});

  if (!q) return null;

  const isChecked = !!dictationChecked[q.id] || !!localChecked[q.id];
  const isFlagged = flaggedReviewIds.includes(q.id);
  const words = q.fullTranscript.split(" ");
  const totalWords = words.length;
  const isVocabLocked = dictationSubTab === "chep" && !isChecked && revealedWordCount < totalWords;

  const currentQInputs = inputsByQuestion[q.id] || {};

  const handleInputChange = (wordIdx: number, val: string) => {
    setInputsByQuestion((prev) => ({
      ...prev,
      [q.id]: {
        ...(prev[q.id] || {}),
        [wordIdx]: val,
      },
    }));
  };

  const handleSubmitQuestion = () => {
    playSfx("click");
    setLocalChecked((prev) => ({ ...prev, [q.id]: true }));
    saveItemProgress(`listening-dictation-${dictationModalCard.id}`, activeDictationQIndex + 1, dictationModalCard.totalQuestions);
    saveListeningProgress({
      cardId: dictationModalCard.id,
      completedQuestions: activeDictationQIndex + 1,
      totalQuestions: dictationModalCard.totalQuestions,
      lastQuestionIndex: activeDictationQIndex,
      status: activeDictationQIndex + 1 >= dictationModalCard.totalQuestions ? "Đã hoàn thành" : "Đang luyện tập",
    });

    let correctCount = 0;
    let blankCount = 0;

    words.forEach((w, idx) => {
      const shouldHide =
        idx < revealedWordCount
          ? false
          : fillPercentage === 100
          ? true
          : fillPercentage === 50
          ? idx % 2 === 1
          : idx % 3 === 2;

      if (shouldHide) {
        blankCount++;
        const userVal = (currentQInputs[idx] || "").trim().toLowerCase().replace(/[^a-z0-9']/g, "");
        const targetVal = w.trim().toLowerCase().replace(/[^a-z0-9']/g, "");
        if (userVal && userVal === targetVal) {
          correctCount++;
        }
      }
    });

    if (blankCount === 0 || correctCount === blankCount) {
      playSfx("correct");
      triggerToast("🎉 Xuất sắc! Bạn đã điền chính xác toàn bộ câu này (+10 XP)!");
    } else {
      playSfx("wrong");
      triggerToast(`Đã nộp bài! Bạn điền đúng ${correctCount}/${blankCount} từ. Xem đáp án chi tiết bên dưới nhé!`);
    }
  };

  const handleResetQuestion = () => {
    playSfx("click");
    setLocalChecked((prev) => ({ ...prev, [q.id]: false }));
    setInputsByQuestion((prev) => ({ ...prev, [q.id]: {} }));
    setRevealedWordCount(0);
    triggerToast("Đã đặt lại để bạn luyện tập chép lại từ đầu!");
  };

  const vocabItems = q.vocabList || [
    {
      word: "climb",
      pos: "v",
      level: "B1",
      ipa: "/klaɪm/",
      meaning: "leo, trèo",
      example: { en: "He's climbing a ladder.", vi: "Anh ấy đang leo lên một chiếc thang." },
    },
    {
      word: "ladder",
      pos: "n",
      level: "B1",
      ipa: "/ˈlædər/",
      meaning: "chiếc thang",
      example: { en: "The ladder is leaning against the wall.", vi: "Chiếc thang đang tựa vào tường." },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 font-sans text-slate-800">
      <div className="bg-[#f8fafc] w-full h-full flex flex-col overflow-hidden">
        {/* 1. HEADER MODAL */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs select-none">
          <button
            type="button"
            onClick={() => setDictationModalCard(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-sm font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Thoát</span>
          </button>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setDictationSubTab("chep");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dictationSubTab === "chep"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nghe chép
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setDictationSubTab("check");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dictationSubTab === "check"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nghe check
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                setDictationSubTab("full");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                dictationSubTab === "full"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nghe full
            </button>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>2s</span>
            <span className="text-amber-300 font-bold">•</span>
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>+0 XP</span>
          </div>
        </header>

        {/* 2. NỘI DUNG CHÍNH (LEFT & RIGHT PANELS) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-7xl mx-auto w-full gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* KHỐI BÊN TRÁI (COL 7): AUDIO WAVEFORM & KHUNG ĐỤC LỖ */}
            <div className="lg:col-span-7 space-y-5">
              {/* THẺ 1: SÓNG ÂM & BỘ ĐIỀU KHIỂN AUDIO (CLICK-TO-SEEK, REWIND, FAST FORWARD) */}
              <AudioWaveformPlayer
                audioUrl={resolvedAudioUrl}
                isPlaying={isPlayingAudio}
                onPlayPauseChange={(playing) => setIsPlayingAudio(playing)}
                showSpeedControl={true}
                showReplayButton={false}
                title={`Bài chép chính tả • Câu ${activeDictationQIndex + 1}`}
              />

              {/* CHẾ ĐỘ 1: NGHE CHÉP (DICTATION / ĐỤC LỖ) */}
              {dictationSubTab === "chep" && (
                <>
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
                        {([30, 50, 100] as const).map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              playSfx("click");
                              setFillPercentage(pct);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              fillPercentage === pct
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            handleToggleFlagReview(q.id);
                          }}
                          title="Lưu câu hỏi"
                          className={`p-2 rounded-xl border border-slate-200/90 transition cursor-pointer ${
                            isFlagged ? "bg-amber-100 text-amber-700 border-amber-300" : "hover:bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isFlagged ? "fill-amber-600" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setIsLocalNotesModalOpen(true);
                            setIsNotesModalOpen(true);
                          }}
                          title="Ghi chú"
                          className="p-2 rounded-xl border border-slate-200/90 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <QuestionErrorReportButton
                          source="LISTENING"
                          questionRef={`DICTATION-${q.id}`}
                          relatedContent={`${dictationModalCard.part} • Test ${dictationModalCard.testNumber} (${dictationModalCard.year}) • Câu ${activeDictationQIndex + 1}`}
                          questionSnapshot={{
                            questionText: q.fullTranscript,
                            part: dictationModalCard.part,
                            audioUrl: q.audioUrl,
                            translation: q.vietnameseTranslation,
                          }}
                          compact
                          onSubmitted={(ticket) => triggerToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-6 min-h-[110px] flex items-center justify-center">
                      <div className="flex flex-wrap items-center justify-center gap-2 text-base font-semibold leading-loose text-slate-800">
                        {words.map((w, idx) => {
                          const shouldHide =
                            idx < revealedWordCount
                              ? false
                              : fillPercentage === 100
                              ? true
                              : fillPercentage === 50
                              ? idx % 2 === 1
                              : idx % 3 === 2;

                          if (!shouldHide) {
                            return (
                              <span key={idx} className="font-bold text-slate-900 border-b-2 border-slate-300 px-1">
                                {w}
                              </span>
                            );
                          }

                          if (isChecked) {
                            const userVal = (currentQInputs[idx] || "").trim();
                            const isCorrect = userVal.toLowerCase().replace(/[^a-z0-9']/g, "") === w.toLowerCase().replace(/[^a-z0-9']/g, "");

                            if (isCorrect) {
                              return (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-extrabold text-sm inline-flex items-center gap-1 shadow-2xs animate-in zoom-in-95 duration-150"
                                  title="Chính xác!"
                                >
                                  <span>{w}</span>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                </span>
                              );
                            }

                            return (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 font-medium text-sm inline-flex items-center gap-1.5 shadow-2xs animate-in zoom-in-95 duration-150"
                                title={userVal ? `Bạn điền: "${userVal}"` : "Chưa điền"}
                              >
                                {userVal && (
                                  <span className="line-through text-rose-500 font-normal text-xs">{userVal}</span>
                                )}
                                <span className="font-extrabold text-emerald-700 underline decoration-emerald-500 underline-offset-2">
                                  {w}
                                </span>
                              </span>
                            );
                          }

                          return (
                            <input
                              key={idx}
                              type="text"
                              placeholder=""
                              value={currentQInputs[idx] || ""}
                              onChange={(e) => handleInputChange(idx, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSubmitQuestion();
                                }
                              }}
                              className="w-20 h-9 rounded-xl border-2 border-slate-200 bg-white text-center font-bold text-sm text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition"
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-1">
                          LẬT TỪ
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setRevealedWordCount((r) => Math.min(totalWords, r + 1));
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                          1 từ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setRevealedWordCount((r) => Math.min(totalWords, r + 2));
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                          2 từ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setRevealedWordCount((r) => Math.min(totalWords, r + 3));
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                          3 từ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setRevealedWordCount(totalWords);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                          Tất cả
                        </button>
                      </div>

                      {/* NÚT NỘP BÀI / KIỂM TRA ĐÁP ÁN */}
                      <div className="flex items-center gap-2">
                        {!isChecked ? (
                          <button
                            type="button"
                            onClick={handleSubmitQuestion}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 active:scale-95 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Nộp bài</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã nộp bài
                            </span>
                            <button
                              type="button"
                              onClick={handleResetQuestion}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer"
                              title="Làm lại câu này"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Làm lại</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GIẢI THÍCH CHI TIẾT */}
                  {(isChecked || revealedWordCount >= totalWords) && (q.explanation || q.trapNote) && (
                    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Giải thích chi tiết bài nghe</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {q.explanation}
                      </p>
                      {q.trapNote && (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                          ⚠️ <strong>Bẫy cần tránh:</strong> {q.trapNote}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* CHẾ ĐỘ 2: NGHE CHECK (ĐỐI CHIẾU SONG NGỮ & PHÁT ÂM) */}
              {dictationSubTab === "check" && (
                <div className="space-y-5">
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          <Languages className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Đối chiếu & Kiểm tra câu nghe
                          </h3>
                          <p className="text-xs text-slate-500">
                            Nhấn vào từng từ để nghe phát âm riêng lẻ hoặc đối chiếu câu song ngữ Anh - Việt
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80">
                        Song ngữ Anh - Việt
                      </span>
                    </div>

                    {/* CÂU TIẾNG ANH (INTERACTIVE TỪNG TỪ) */}
                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          TRANSCRIPT GỐC (BẤM TỪNG TỪ ĐỂ PHÁT ÂM)
                        </span>
                        <button
                          type="button"
                          onClick={() => playAudio(q.fullTranscript)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition cursor-pointer shadow-2xs"
                          title="Nghe toàn bộ câu"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Phát âm cả câu</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold leading-relaxed text-slate-900">
                        {words.map((w, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => playAudio(w)}
                            className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-800 transition cursor-pointer active:scale-95 shadow-2xs"
                            title={`Bấm để nghe phát âm "${w}"`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DỊCH NGHĨA TIẾNG VIỆT */}
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>DỊCH NGHĨA TIẾNG VIỆT</span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
                        {q.vietnameseTranslation || "Anh ấy đang leo lên một chiếc thang."}
                      </p>
                    </div>

                    {/* KHUNG TỰ ĐÁNH GIÁ MỨC ĐỘ TỰ TIN (SELF-ASSESSMENT) */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-600 uppercase tracking-wider">
                          TỰ ĐÁNH GIÁ MỨC ĐỘ NGHE HIỂU
                        </span>
                        <span className="text-slate-400">Chọn cảm nhận của bạn sau khi nghe</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setSelfAssessment((prev) => ({ ...prev, [q.id]: "clear" }));
                            triggerToast("Tuyệt vời! Bạn đã nắm chắc câu này.");
                          }}
                          className={`py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            selfAssessment[q.id] === "clear"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          <span>🟢 Nghe rõ 100%</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setSelfAssessment((prev) => ({ ...prev, [q.id]: "partial" }));
                            triggerToast("Ghi nhận! Cần chú ý thêm một số từ vựng nối âm.");
                          }}
                          className={`py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            selfAssessment[q.id] === "partial"
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-amber-50/60 border-amber-200 text-amber-800 hover:bg-amber-100"
                          }`}
                        >
                          <span>🟡 Nghe bập bõm</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            setSelfAssessment((prev) => ({ ...prev, [q.id]: "hard" }));
                            triggerToast("Đã lưu lại! Hãy luyện chép lại ở tab Nghe chép nhé.");
                          }}
                          className={`py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            selfAssessment[q.id] === "hard"
                              ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                              : "bg-rose-50/60 border-rose-200 text-rose-800 hover:bg-rose-100"
                          }`}
                        >
                          <span>🔴 Chưa nghe kịp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GIẢI THÍCH CHI TIẾT & BẪY */}
                  {(q.explanation || q.trapNote) && (
                    <div className="bg-white rounded-3xl border border-blue-200/90 p-6 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Lưu ý & Điểm ngữ pháp câu</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {q.explanation}
                      </p>
                      {q.trapNote && (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                          ⚠️ <strong>Bẫy cần tránh:</strong> {q.trapNote}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CHẾ ĐỘ 3: NGHE FULL (NGHE TRỌN VẸN & PHÂN TÍCH TOÀN DIỆN) */}
              {dictationSubTab === "full" && (
                <div className="space-y-5">
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          <Headphones className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                            Nghe trọn vẹn & Phân tích toàn diện
                          </h3>
                          <p className="text-xs text-slate-500">
                            Luyện nghe hiểu tổng thể kết hợp phân tích đáp án và bẫy đề thi
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/80">
                        Chế độ Full
                      </span>
                    </div>

                    {/* HÌNH MINH HỌA (NẾU CÓ - PART 1) */}
                    {q.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200/90 max-h-60 sm:max-h-72 flex items-center justify-center bg-slate-50">
                        <img
                          src={q.imageUrl}
                          alt="Minh họa bài nghe"
                          className="w-full h-full object-contain max-h-60 sm:max-h-72"
                        />
                      </div>
                    )}

                    {/* TRANSCRIPT ĐẦY ĐỦ + DỊCH NGHĨA */}
                    <div className="space-y-3">
                      <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            TRANSCRIPT HOÀN CHỈNH
                          </span>
                          <button
                            type="button"
                            onClick={() => playAudio(q.fullTranscript)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Phát âm</span>
                          </button>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                          {q.fullTranscript}
                        </p>
                        <div className="pt-2 border-t border-slate-200/70">
                          <p className="text-xs sm:text-sm font-semibold text-emerald-800 leading-relaxed">
                            👉 {q.vietnameseTranslation || "Anh ấy đang leo lên một chiếc thang."}
                          </p>
                        </div>
                      </div>

                      {/* CÁC PHƯƠNG ÁN LỰA CHỌN (A, B, C, D) */}
                      {q.options && Object.keys(q.options).length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                            CÁC PHƯƠNG ÁN LỰA CHỌN
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {Object.entries(q.options).map(([key, optText]) => {
                              const isCorrect = key === q.correctAnswer;
                              const optVi = q.optionTranslations?.[key];

                              return (
                                <div
                                  key={key}
                                  className={`p-3 rounded-2xl border transition ${
                                    isCorrect
                                      ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200/60"
                                      : "bg-slate-50/60 border-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                        isCorrect
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {key}
                                    </span>
                                    {isCorrect && (
                                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <Check className="w-3 h-3 stroke-[3]" /> Đáp án đúng
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs sm:text-sm font-bold ${isCorrect ? "text-emerald-950" : "text-slate-800"}`}>
                                    {optText}
                                  </p>
                                  {optVi && (
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                      {optVi}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PHÂN TÍCH ĐÁP ÁN & BẪY ĐỀ THI */}
                  {(q.explanation || q.trapNote) && (
                    <div className="bg-white rounded-3xl border border-indigo-200/90 p-6 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Phân tích đáp án & Bẫy đề thi</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {q.explanation}
                      </p>
                      {q.trapNote && (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                          ⚠️ <strong>Bẫy cần chú ý:</strong> {q.trapNote}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* KHỐI BÊN PHẢI (COL 5): TỪ VỰNG NÊN HỌC */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">Từ vựng nên học ({vocabItems.length} từ)</h3>
                  </div>
                </div>

                {isVocabLocked ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 my-auto">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
                      <Lock className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Chép xong câu để xem từ vựng nên học</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                      Từ vựng nằm ngay trong câu, hiện sớm sẽ lộ đáp án.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 flex-1">
                    {vocabItems.map((v, idx) => {
                      const isExpanded = !!expandedVocab[v.word];

                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-base text-blue-950">{v.word}</span>
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                              {v.level && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{v.level}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => playAudio(v.word)}
                                className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedVocab((prev) => ({ ...prev, [v.word]: !prev[v.word] }))}
                                className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <Search className="w-3 h-3" />
                                <span>{isExpanded ? "Thu gọn" : "🔍 Xem chi tiết"}</span>
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-mono font-medium text-slate-500">{v.ipa}</p>
                          <p className="text-xs font-bold text-slate-800">{v.meaning}</p>

                          {isExpanded && (() => {
                            const detail = getEnrichedVocabDetail(v, q.fullTranscript || q.question || "");
                            return (
                              <div className="pt-3 border-t border-blue-200/60 space-y-3 animate-in fade-in duration-150">
                                {/* 1. Lời giải thích chi tiết & ngữ cảnh */}
                                <div className="space-y-1">
                                  <div className="font-bold text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <span>💡 Giải thích chi tiết &amp; Ngữ cảnh bài thi:</span>
                                  </div>
                                  <div className="p-3 rounded-xl bg-white border border-blue-200 text-slate-800 leading-relaxed text-xs">
                                    {detail.explanation}
                                  </div>
                                </div>

                                {/* 2. Ví dụ câu thực tế */}
                                {detail.example && (
                                  <div className="space-y-1">
                                    <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                      <span>📝 Ví dụ câu trong đề thi:</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 space-y-1 text-xs">
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
                                        <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs">
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. FOOTER THANH ĐIỀU HƯỚNG BÊN DƯỚI */}
        <footer className="h-14 bg-white border-t border-slate-200/90 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-lg select-none">
          <div className="flex items-center gap-2">
            <QuestionErrorReportButton source="LISTENING"
              questionRef={questionRef}
              relatedContent={`${q.part} · Test ${dictationModalCard.testNumber} · Câu ${activeDictationQIndex + 1}`}
              questionSnapshot={{ questionText: q.question || q.fullTranscript, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, transcript: q.fullTranscript, imageUrl: q.imageUrl, audioUrl: resolvedAudioUrl, part: q.part }}
              compact onSubmitted={(ticket) => triggerToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)} />

            <button
              type="button"
              onClick={() => triggerToast("Đã mở giỏ từ vựng cá nhân")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              <span>Giỏ từ</span>
            </button>
          </div>

          <div className="hidden md:block text-xs font-semibold text-slate-400 tracking-wide">
            Ctrl: phát lại · Tab: lật từ · Enter: câu tiếp theo · ←/→: chuyển câu
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeDictationQIndex === 0}
              onClick={() => {
                playSfx?.("click");
                setActiveDictationQIndex(Math.max(0, activeDictationQIndex - 1));
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs active:scale-95"
              title="Câu trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsQuestionGridOpen(true);
                setIsLocalQuestionGridOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition cursor-pointer shadow-xs active:scale-95"
              title="Danh sách toàn bộ câu hỏi"
            >
              <Grid className="w-4 h-4" />
              <span>{activeDictationQIndex + 1}/{dictationModalCard.questions.length}</span>
            </button>

            <button
              type="button"
              disabled={activeDictationQIndex >= dictationModalCard.questions.length - 1}
              onClick={() => {
                playSfx?.("click");
                const nextIdx = Math.min(dictationModalCard.questions.length - 1, activeDictationQIndex + 1);
                setActiveDictationQIndex(nextIdx);
                saveItemProgress(`listening-dictation-${dictationModalCard.id}`, nextIdx + 1, dictationModalCard.totalQuestions);
                saveListeningProgress({
                  cardId: dictationModalCard.id,
                  completedQuestions: nextIdx + 1,
                  totalQuestions: dictationModalCard.totalQuestions,
                  lastQuestionIndex: nextIdx,
                  status: nextIdx + 1 >= dictationModalCard.totalQuestions ? "Đã hoàn thành" : "Đang luyện tập",
                });
              }}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs active:scale-95"
              title="Câu tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>

        {/* MODAL DANH SÁCH TOÀN BỘ CÂU HỎI DICTATION */}
        {isLocalQuestionGridOpen && (
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
                      Tổng số {dictationModalCard.questions.length} câu chép chính tả
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocalQuestionGridOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                {dictationModalCard.questions.map((item, idx) => {
                  const isCurrent = idx === activeDictationQIndex;
                  const isCheckedQ = !!dictationChecked[item.id];

                  let qBtnStyle = "bg-white border-slate-200 text-slate-700 hover:border-blue-400";
                  if (isCurrent) {
                    qBtnStyle = "bg-blue-600 text-white font-extrabold border-blue-600 ring-2 ring-blue-300";
                  } else if (isCheckedQ) {
                    qBtnStyle = "bg-emerald-500 text-white font-bold border-emerald-500";
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveDictationQIndex(idx);
                        setIsLocalQuestionGridOpen(false);
                      }}
                      className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition cursor-pointer ${qBtnStyle}`}
                    >
                      <span className="font-extrabold">{idx + 1}</span>
                      <span className="text-[9px] opacity-80">{item.part || "Part 1"}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsLocalQuestionGridOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
                >
                  Đóng danh sách
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL GHI CHÚ CÁ NHÂN */}
        {isLocalNotesModalOpen && q && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Ghi chú cá nhân</h3>
                    <p className="text-xs text-slate-500">Câu {q.id} • {dictationModalCard.part}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocalNotesModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                rows={5}
                value={userNotes[q.id] || ""}
                onChange={(e) => setUserNotes({ ...userNotes, [q.id]: e.target.value })}
                placeholder="Nhập ghi chú hoặc kiến thức cần nhớ cho câu này..."
                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 outline-none resize-none"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...userNotes };
                    delete updated[q.id];
                    setUserNotes(updated);
                    triggerToast("Đã xóa ghi chú của câu hỏi này!");
                  }}
                  className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                >
                  🗑 Xóa ghi chú
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLocalNotesModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocalNotesModalOpen(false);
                      triggerToast("Đã lưu ghi chú cá nhân thành công! 💾");
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
      </div>
    </div>
  );
};
