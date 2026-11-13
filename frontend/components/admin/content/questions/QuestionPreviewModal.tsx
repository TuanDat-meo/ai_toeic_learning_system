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

interface QuestionPreviewModalProps {
  question: QuestionItem | null;
  onClose: () => void;
  playSfx?: (sound: string) => void;
  playAudio?: (url: string) => void;
  showToast?: (msg: string) => void;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  question: baseQuestion,
  onClose,
  playSfx = () => {},
  playAudio = () => {},
  showToast = () => {},
}) => {
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
      ? Object.entries(correctionOptions).map(([id, text]) => ({ id, text, isCorrect: id === (questionCorrection.correctAnswer || baseQuestion.correctAnswer) }))
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

  const [prevQuestionId, setPrevQuestionId] = React.useState(question?.id);
  if (question?.id !== prevQuestionId) {
    setPrevQuestionId(question?.id);
    setLocalIsPlayingAudio(false);
  }

  if (!question) return null;

  const cleanQuestionText = question.questionText.replace(/^[0-9]+\.\s*/, "");

  const vocabList = question.vocabList ?? [];
  const steps = question.steps ?? [];
  const questionTranslation = question.questionTranslation || question.translation;

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
            {question.imageUrl && (
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Hình ảnh câu hỏi (Part 1):
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100/70 p-2 shadow-xs flex items-center justify-center">
                  <img
                    src={question.imageUrl}
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
            {question.audioUrl && (
              <AudioWaveformPlayer
                audioUrl={question.audioUrl}
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
                    {question.difficulty === "Easy"
                      ? "Lv.1"
                      : question.difficulty === "Hard"
                      ? "Lv.3"
                      : "Lv.2"}
                  </span>
                </div>

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
                                        <span className="font-extrabold text-slate-900 text-base">{v.word}</span>
                                        <span className="italic font-serif text-slate-500 text-xs">{v.pos}</span>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                          {v.level}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                                        <span>{v.ipa}</span>
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

                                  <p className="text-sm font-bold text-slate-800 leading-snug">{v.meaning}</p>

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
                                    <span className="font-extrabold text-slate-900 text-sm">{v.word}</span>
                                    <span className="italic text-slate-500 font-semibold">{v.pos}</span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800">
                                      {v.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                                    <span className="font-mono text-slate-500">{v.ipa}</span>
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
                                    <span className="font-medium text-slate-800">{v.meaning}</span>
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
            questionSnapshot={{ questionText: question.questionText, options: Object.fromEntries(question.options.map((option) => [option.id, option.text])), correctAnswer: question.correctAnswer, explanation: question.explanation, passage: question.passage, imageUrl: question.imageUrl, audioUrl: question.audioUrl, part: question.part }}
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
