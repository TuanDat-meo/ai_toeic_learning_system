"use client";

import React, { useState } from "react";
import {
  X,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Volume2,
} from "lucide-react";
import { QuestionItem, VocabItem } from "@/app/admin/content/questions/types";
import { AudioWaveformPlayer } from "@/components/common/AudioWaveformPlayer";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";
import { getEnrichedVocabDetail } from "@/lib/toeicVocabDetailEnricher";
import { API_BASE_URL } from "@/lib/api/client";

function toDisplayText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toDisplayText).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferred = record.meaning ?? record.text ?? record.word ?? record.pos;
    if (preferred !== undefined && preferred !== value) return toDisplayText(preferred);
    return JSON.stringify(value);
  }
  return "";
}

function toDisplayList(value: unknown, keys: string[] = ["word", "meaning", "text", "pos"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      for (const key of keys) {
        if (record[key] !== undefined && record[key] !== null) return toDisplayText(record[key]);
      }
    }
    return toDisplayText(item);
  }).filter(Boolean);
}

function questionMediaUrl(sourcePath?: string): string | undefined {
  if (!sourcePath?.trim()) return undefined;
  const encodedPath = sourcePath.replace(/\\/g, "/").split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return `/api/question-media/${encodedPath}`;
}

function backendMediaUrl(url?: string, sourcePath?: string): string | undefined {
  const value = url || questionMediaUrl(sourcePath);
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

interface QuestionPreviewModalProps {
  question: QuestionItem | null;
  questions?: QuestionItem[];
  onClose: () => void;
  playSfx?: (sound: string) => void;
  playAudio?: (url: string) => void;
  showToast?: (msg: string) => void;
}

const GroupedReadingQuestions: React.FC<{
  questions: QuestionItem[];
  onClose: () => void;
  playSfx: (sound: string) => void;
}> = ({ questions, onClose, playSfx }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const passage = questions[0]?.passage || "";
  const answeredCount = questions.filter((item) => answers[item.id]).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
      <section className="flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-7">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">{questions[0]?.part}</span>
              <span className="text-sm font-bold text-slate-900">Bài đọc gồm {questions.length} câu hỏi</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Chọn một đáp án cho từng câu, sau đó kiểm tra cả bài.</p>
          </div>
          <button type="button" onClick={() => { playSfx("click"); onClose(); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Đóng xem trước">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-7">
          {passage && (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs md:p-6">
              <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-blue-700">Bài đọc</h2>
              <div className="whitespace-pre-line font-serif text-sm leading-7 text-slate-800">{passage}</div>
            </article>
          )}

          {questions.map((item, index) => {
            const selected = answers[item.id];
            const isCorrect = selected === item.correctAnswer;
            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs md:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                    Câu {item.code?.split("-").at(-1)?.replace(/^Q/i, "") || index + 1}
                  </span>
                  {checked && (
                    <span className={`text-xs font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {isCorrect ? "Chính xác" : `Đáp án đúng: ${item.correctAnswer}`}
                    </span>
                  )}
                </div>
                <p className="mb-4 whitespace-pre-line text-sm font-semibold leading-6 text-slate-900">{toDisplayText(item.questionText)}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {item.options.map((option) => {
                    const active = selected === option.id;
                    const correctOption = checked && option.id === item.correctAnswer;
                    const wrongOption = checked && active && !isCorrect;
                    const style = correctOption
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                      : wrongOption
                        ? "border-rose-400 bg-rose-50 text-rose-950"
                        : active
                          ? "border-blue-500 bg-blue-50 text-blue-950"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50";
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={checked}
                        onClick={() => { playSfx("click"); setAnswers((current) => ({ ...current, [item.id]: option.id })); }}
                        className={`rounded-xl border p-3 text-left text-sm transition ${style} disabled:cursor-default`}
                      >
                        <span className="mr-2 font-extrabold">{option.id}.</span>{toDisplayText(option.text)}
                        {checked && item.optionTranslations?.[option.id] && (
                          <span className="mt-1 block text-xs text-slate-500">{toDisplayText(item.optionTranslations[option.id])}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {checked && item.questionTranslation && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">{toDisplayText(item.questionTranslation)}</p>}
                {checked && item.explanation && <p className="mt-3 border-l-2 border-emerald-300 pl-3 text-xs leading-5 text-slate-700">{toDisplayText(item.explanation)}</p>}
              </article>
            );
          })}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
          <span className="text-xs font-semibold text-slate-500">Đã chọn {answeredCount}/{questions.length} câu</span>
          {!checked ? (
            <button type="button" disabled={answeredCount !== questions.length} onClick={() => { playSfx("click"); setChecked(true); }} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
              Kiểm tra cả bài
            </button>
          ) : (
            <button type="button" onClick={() => { playSfx("click"); setAnswers({}); setChecked(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-200">
              <RotateCcw className="h-4 w-4" /> Làm lại bài đọc
            </button>
          )}
        </footer>
      </section>
    </div>
  );
};

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  question: initialQuestion,
  questions: relatedQuestions = [],
  onClose,
  playSfx = () => {},
  playAudio = () => {},
  showToast = () => {},
}) => {
  const groupQuestions = relatedQuestions.length > 0 ? relatedQuestions : initialQuestion ? [initialQuestion] : [];
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(() => {
    const index = groupQuestions.findIndex((item) => item.id === initialQuestion?.id);
    return index >= 0 ? index : 0;
  });
  React.useEffect(() => {
    const index = groupQuestions.findIndex((item) => item.id === initialQuestion?.id);
    setActiveQuestionIndex(index >= 0 ? index : 0);
  }, [initialQuestion?.id, groupQuestions]);
  const baseQuestion = groupQuestions[activeQuestionIndex] ?? initialQuestion;
  const [questionCorrectionState, setQuestionCorrectionState] = useState<{ ref: string; value: QuestionCorrection | null } | null>(null);
  React.useEffect(() => {
    let active = true;
    if (!baseQuestion) return () => { active = false; };
    const questionRef = `QUESTION_BANK-${baseQuestion.id}`;
    getQuestionCorrection(questionRef).then((correction) => { if (active) setQuestionCorrectionState({ ref: questionRef, value: correction }); }).catch(() => undefined);
    return () => { active = false; };
  }, [baseQuestion]);
  const questionCorrection = questionCorrectionState?.ref === `QUESTION_BANK-${baseQuestion?.id}` ? questionCorrectionState.value : null;
  const correctionOptions = questionCorrection?.options;
  const question = baseQuestion && questionCorrection ? {
    ...baseQuestion,
    questionText: questionCorrection.questionText || baseQuestion.questionText,
    options: correctionOptions && !Array.isArray(correctionOptions)
      ? Object.entries(correctionOptions).map(([id, text]) => ({ id, text: toDisplayText(text), isCorrect: id === (questionCorrection.correctAnswer || baseQuestion.correctAnswer) }))
      : baseQuestion.options,
    correctAnswer: questionCorrection.correctAnswer || baseQuestion.correctAnswer,
    explanation: questionCorrection.explanation || baseQuestion.explanation,
    passage: questionCorrection.passage || baseQuestion.passage,
  } : baseQuestion;
  const [userSelectedOption, setUserSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showExplanationDetails, setShowExplanationDetails] = useState(true);
  const [showVocabSection, setShowVocabSection] = useState(true);
  const [isVocabExpanded, setIsVocabExpanded] = useState(true);
  const [localIsPlayingAudio, setLocalIsPlayingAudio] = useState(false);

  React.useEffect(() => {
    setUserSelectedOption(null);
    setShowExplanation(false);
    setShowExplanationDetails(true);
    setShowVocabSection(true);
    setIsVocabExpanded(true);
    setLocalIsPlayingAudio(false);
  }, [baseQuestion?.id]);

  const [prevQuestionId, setPrevQuestionId] = React.useState(question?.id);
  if (question?.id !== prevQuestionId) {
    setPrevQuestionId(question?.id);
    setLocalIsPlayingAudio(false);
  }

  if (!question) return null;

  if (groupQuestions.length > 1 && (question.part === "Part 6" || question.part === "Part 7")) {
    return <GroupedReadingQuestions questions={groupQuestions} onClose={onClose} playSfx={playSfx} />;
  }

  const goToQuestion = (index: number) => {
    setActiveQuestionIndex(Math.max(0, Math.min(groupQuestions.length - 1, index)));
  };

  const cleanQuestionText = question.questionText.replace(/^[0-9]+\.\s*/, "");
  const audioUrl = backendMediaUrl(question.audioUrl, question.sourceAudioPath);
  const imageUrl = backendMediaUrl(question.imageUrl, question.sourceImagePath);

  const vocabList = (Array.isArray(question.vocabList) ? question.vocabList : []).map((item) => {
    const raw = item && typeof item === "object" ? item as unknown as Record<string, unknown> : { word: item };
    return {
      ...raw,
      word: toDisplayText(raw.word),
      pos: toDisplayText(raw.pos ?? raw.partOfSpeech),
      level: toDisplayText(raw.level),
      ipa: toDisplayText(raw.ipa),
      meaning: toDisplayText(raw.meaning),
      synonyms: toDisplayList(raw.synonyms) as unknown as string[],
      antonyms: toDisplayList(raw.antonyms) as unknown as string[],
      wordFamily: toDisplayList(raw.wordFamily) as unknown as string[],
      collocations: toDisplayList(raw.collocations, ["en", "word", "meaning", "text"]) as unknown as string[],
    } as VocabItem;
  });
  const steps = question.steps ?? [];
  const questionTranslation = toDisplayText(question.questionTranslation || question.translation);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-700 text-xs font-extrabold border border-blue-200">
              {question.part}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">
                {question.code || question.id}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs font-bold text-slate-500">{question.skill}</span>
            </div>
          </div>

          {groupQuestions.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-slate-500">Câu {activeQuestionIndex + 1}/{groupQuestions.length}</span>
              {groupQuestions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  aria-label={`Mở câu hỏi ${index + 1}`}
                  aria-current={index === activeQuestionIndex ? "step" : undefined}
                  className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-bold transition ${index === activeQuestionIndex ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {item.code?.split("-").at(-1)?.replace(/^Q/i, "") || index + 1}
                </button>
              ))}
              <button type="button" onClick={() => goToQuestion(activeQuestionIndex - 1)} disabled={activeQuestionIndex === 0} className="ml-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-40">Trước</button>
              <button type="button" onClick={() => goToQuestion(activeQuestionIndex + 1)} disabled={activeQuestionIndex === groupQuestions.length - 1} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-40">Tiếp</button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onClose();
            }}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* CỘT TRÁI (LEFT PANE): ẢNH, ĐOẠN VĂN, AUDIO */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 space-y-6">
            {/* Ảnh minh họa nếu là Part 1 */}
            {imageUrl && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Hình ảnh câu hỏi (Part 1):
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100/70 p-2 shadow-xs flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Question visual"
                    className="w-auto max-w-full max-h-80 rounded-xl object-contain"
                  />
                </div>
              </div>
            )}

            {/* Đoạn văn nếu là Part 3, Part 4, Part 6, Part 7 */}
            {question.passage && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {question.part === "Part 3" || question.part === "Part 4"
                    ? "Kịch bản bài nghe (Script):"
                    : "Đoạn văn đọc hiểu (Passage):"}
                </span>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line shadow-xs">
                  {question.passage}
                </div>
              </div>
            )}

            {/* Trình phát Audio nếu có (Part 1 - Part 4) */}
            {audioUrl && (
              <AudioWaveformPlayer
                audioUrl={audioUrl}
                isPlaying={localIsPlayingAudio}
                onPlayPauseChange={(playing) => setLocalIsPlayingAudio(playing)}
                showSpeedControl={true}
                showReplayButton={true}
                title={`Audio bài thi • ${question.part}`}
              />
            )}
          </div>

          {/* CỘT PHẢI (RIGHT PANE): CÂU HỎI, CÁC ĐÁP ÁN & GIẢI THÍCH */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Khung nội dung câu hỏi & Dịch câu hỏi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-2xs">
                    {question.difficulty}
                  </span>
                </div>
                {question.sourceDifficulty && (
                  <p className="text-[11px] text-slate-500">Phân loại gốc trong ETS: {question.sourceDifficulty}</p>
                )}
                {(question.sourceAudioPath || question.sourceImagePath) && (
                  <p className="text-[11px] text-amber-700">
                    Media nguồn: {[question.sourceAudioPath, question.sourceImagePath].filter(Boolean).join(" · ")}
                  </p>
                )}

                {question.part === "Part 2" ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                      Câu hỏi (Part 2):
                    </span>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {cleanQuestionText}
                    </p>
                  </div>
                ) : question.part !== "Part 1" ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {cleanQuestionText}
                    </p>
                  </div>
                ) : null}

                {/* Dịch nghĩa câu hỏi tiếng Việt */}
                {showExplanation && questionTranslation && (
                  <div className="border-l-3 border-blue-500 pl-3 py-2.5 text-xs font-semibold text-blue-800 bg-blue-50/80 rounded-r-xl animate-in fade-in duration-200 leading-relaxed">
                    {questionTranslation}
                  </div>
                )}
              </div>

              {/* Các phương án đáp án */}
              <div className="space-y-3">
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Chọn phương án đúng:
                </p>

                <div className="space-y-3">
                  {question.options
                    .filter((opt) => question.part !== "Part 2" || opt.id !== "D")
                    .map((opt) => {
                      const isSelected = userSelectedOption === opt.id;
                      const isCorrect = opt.id === question.correctAnswer;
                      const isPart1Or2 =
                        question.part === "Part 1" || question.part === "Part 2";
                      const hideScriptBeforeCheck = isPart1Or2 && !showExplanation;

                      const cleanOptText = opt.text
                        ? opt.text.replace(/^[A-D][\.\:\)]\s*/i, "").trim()
                        : "";
                      const mainText = hideScriptBeforeCheck
                        ? ""
                        : cleanOptText || opt.text || "";

                      let cardStyle = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";
                      let iconNode = (
                        <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 transition">
                          {opt.id}
                        </span>
                      );

                      if (showExplanation) {
                        if (isCorrect) {
                          cardStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                          iconNode = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
                        } else if (isSelected) {
                          cardStyle = "border-rose-400 bg-rose-50/90 text-rose-950 font-bold ring-2 ring-rose-400/20";
                          iconNode = <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
                        } else {
                          cardStyle = "border-slate-200 bg-white text-slate-700 opacity-75";
                        }
                      } else if (isSelected) {
                        cardStyle = "border-2 border-blue-600 bg-blue-50/90 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs";
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (showExplanation) return;
                            playSfx("click");
                            setUserSelectedOption(opt.id);
                          }}
                          className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${cardStyle}`}
                        >
                          {iconNode}

                          <div className="flex-1 space-y-1">
                            <span className="text-sm font-semibold">
                              ({opt.id}){mainText ? ` ${mainText}` : ""}
                            </span>
                            {showExplanation && question.optionTranslations?.[opt.id] && (
                              <span className="block text-xs font-normal text-slate-500">
                            {toDisplayText(question.optionTranslations[opt.id])}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Nút kiểm tra / làm lại */}
              {!showExplanation ? (
                <button
                  type="button"
                  disabled={!userSelectedOption}
                  onClick={() => {
                    playSfx("click");
                    setShowExplanation(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-sm font-extrabold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playSfx("click");
                    setUserSelectedOption(null);
                    setShowExplanation(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Làm lại câu hỏi này
                </button>
              )}

              {/* Giải thích chi tiết & Từ vựng khi kiểm tra */}
              {showExplanation && (
                <div className="space-y-4 animate-in fade-in">
                  {/* TOGGLE 1: GIẢI THÍCH CHI TIẾT */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between py-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Giải thích chi tiết</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setShowExplanationDetails(!showExplanationDetails);
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          showExplanationDetails ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            showExplanationDetails ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {showExplanationDetails && (
                      <div className="mt-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 space-y-2.5 animate-in fade-in duration-150 shadow-2xs">
                        {question.explanation && (
                          <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
                        )}
                        {steps.map((st, i) => (
                          <div key={i} className="space-y-0.5">
                            <p className="font-bold text-blue-900">{st.title}</p>
                            <p className="text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-300">
                              {st.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TOGGLE 2: TỪ VỰNG NÊN HỌC */}
                  {vocabList.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
                        <BookOpen className="w-4.5 h-4.5 text-amber-600" />
                        <span>Từ vựng nên học</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSfx("click");
                          setShowVocabSection(!showVocabSection);
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          showVocabSection ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            showVocabSection ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {showVocabSection && (
                      <div className="space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between pt-1 pb-1 border-t border-amber-200/50">
                          <span className="text-xs font-semibold text-slate-600">
                            {vocabList.length} từ
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                playSfx("click");
                                setIsVocabExpanded(!isVocabExpanded);
                              }}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-amber-100/70 transition cursor-pointer flex items-center gap-1.5"
                            >
                              {isVocabExpanded ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Thu gọn</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Xem chi tiết</span>
                                </>
                              )}
                            </button>

                          </div>
                        </div>

                        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                          {vocabList.map((v: VocabItem, idx: number) => {
                            if (isVocabExpanded) {
                              return (
                                <div
                                  key={idx}
                                  className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 transition"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-slate-900 text-base">{toDisplayText(v.word)}</span>
                                        <span className="italic font-serif text-slate-500 text-xs">{toDisplayText(v.pos)}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                          {toDisplayText(v.level)}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                                        <span>{toDisplayText(v.ipa)}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            playSfx("click");
                                            playAudio(v.word);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 p-0.5 rounded transition cursor-pointer"
                                          title="Nghe phát âm"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 inline" />
                                        </button>
                                      </div>
                                    </div>

                                  </div>

                                  <p className="text-sm font-bold text-slate-800 leading-snug">{toDisplayText(v.meaning)}</p>

                                  {(() => {
                                    const detail = getEnrichedVocabDetail(v, question?.questionText || question?.explanation || "");
                                    return (
                                      <>
                                        {/* 💡 Lời giải thích chi tiết & ngữ cảnh */}
                                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 leading-relaxed text-xs space-y-1">
                                          <div className="font-bold text-amber-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                                            <span>💡 Giải thích &amp; Ngữ cảnh:</span>
                                          </div>
                                          <p>{detail.explanation}</p>
                                        </div>

                                        {/* 📝 Ví dụ câu thực tế */}
                                        {detail.example && (
                                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-150/80 text-xs space-y-1">
                                            <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Ví dụ câu:</div>
                                            <p className="text-slate-800 font-medium">&quot;{typeof detail.example === "string" ? detail.example : detail.example.en}&quot;</p>
                                            {typeof detail.example === "object" && detail.example.vi && (
                                              <p className="text-slate-500 italic">👉 {detail.example.vi}</p>
                                            )}
                                          </div>
                                        )}

                                        {/* 🔗 Cụm từ hay gặp */}
                                        {detail.collocations && detail.collocations.length > 0 && (
                                          <div className="space-y-1 text-xs pt-1">
                                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Cụm từ hay gặp</span>
                                            <div className="flex flex-wrap gap-1">
                                              {detail.collocations.map((c: any, cIdx: number) => (
                                                <span key={cIdx} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px]">
                                                  {typeof c === "string" ? c : `${c.en}: ${c.vi}`}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}

                                  {((v.synonyms && v.synonyms.length > 0) || (v.antonyms && v.antonyms.length > 0)) && (
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                                      {v.synonyms && v.synonyms.length > 0 && (
                                        <div>
                                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Đồng nghĩa</span>
                                          <p className="text-slate-700 text-[11px] font-medium">{v.synonyms.join(", ")}</p>
                                        </div>
                                      )}
                                      {v.antonyms && v.antonyms.length > 0 && (
                                        <div>
                                          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider">Trái nghĩa</span>
                                          <p className="text-slate-700 text-[11px] font-medium">{v.antonyms.join(", ")}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {v.wordFamily && v.wordFamily.length > 0 && (
                                    <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Họ từ</span>
                                      <div className="space-y-0.5 text-slate-700 text-[11px]">
                                        {v.wordFamily.map((wf: string, wfIdx: number) => (
                                          <p key={wfIdx}>• {wf}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-amber-200/80 bg-white flex items-center justify-between gap-3 text-xs shadow-2xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-sm">{toDisplayText(v.word)}</span>
                                    <span className="italic text-slate-500 font-semibold">{toDisplayText(v.pos)}</span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                      {toDisplayText(v.level)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                                    <span className="font-mono text-slate-500">{toDisplayText(v.ipa)}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        playSfx("click");
                                        playAudio(v.word);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-0.5 rounded hover:bg-blue-50 transition"
                                      title="Phát âm từ này"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-medium text-slate-800">{toDisplayText(v.meaning)}</span>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
          {question && <QuestionErrorReportButton source="QUESTION_BANK"
            questionRef={`QUESTION_BANK-${question.id}`}
            relatedContent={`${question.part} · ${question.code || question.id}`}
            questionSnapshot={{ questionText: question.questionText, options: Object.fromEntries(question.options.map((option) => [option.id, option.text])), correctAnswer: question.correctAnswer, explanation: question.explanation, passage: question.passage, imageUrl, audioUrl, part: question.part }}
            onSubmitted={(ticket) => showToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)} />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
            >
              Đóng cửa sổ
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
