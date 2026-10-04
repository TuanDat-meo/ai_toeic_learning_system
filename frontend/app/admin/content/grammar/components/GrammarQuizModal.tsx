"use client";

import React, { useState, useEffect } from "react";
import { SpellCheck, Clock, X, Check, AlertTriangle, Award, RotateCcw, ArrowRight } from "lucide-react";
import { GrammarQuestionItem, GrammarTopicItem } from "../types";

interface GrammarQuizModalProps {
  isOpen: boolean;
  title: string;
  questions: GrammarQuestionItem[];
  onClose: () => void;
  activeTopic: GrammarTopicItem | null;
  onRecordResult?: (topicId: string, isCorrect: boolean) => void;
}

export const GrammarQuizModal: React.FC<GrammarQuizModalProps> = ({
  isOpen,
  title,
  questions,
  onClose,
  activeTopic,
  onRecordResult,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setScore(0);
      setQuizFinished(false);
      setTimerSeconds(0);
      setIsTimerRunning(true);
    }
  }, [isOpen, questions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && !quizFinished && isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, quizFinished, isTimerRunning]);

  if (!isOpen || questions.length === 0) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    const currentQ = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    setIsAnswerChecked(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (activeTopic && onRecordResult) {
      onRecordResult(activeTopic.id, isCorrect);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      setIsTimerRunning(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header Quiz */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <SpellCheck className="w-4 h-4" />
              {title}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Câu hỏi {currentIndex + 1} / {questions.length}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-mono font-bold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thanh tiến độ */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Thân câu hỏi */}
        {!quizFinished ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {currentQ?.part}
                </span>
                {currentQ?.difficulty && (
                  <span className="text-[11px] font-bold text-slate-500">
                    Target: {currentQ.difficulty}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            {/* 4 Phương án A, B, C, D */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {(["A", "B", "C", "D"] as const).map((optKey) => {
                const optText = currentQ.options[optKey];
                const isChosen = selectedAnswer === optKey;
                const isCorrectAnswer = isAnswerChecked && optKey === currentQ.correctAnswer;
                const isWrongChosen = isAnswerChecked && isChosen && optKey !== currentQ.correctAnswer;

                return (
                  <button
                    key={optKey}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedAnswer(optKey)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isCorrectAnswer
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : isWrongChosen
                        ? "bg-rose-50 border-rose-500 text-rose-900"
                        : isChosen
                        ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrectAnswer
                            ? "bg-emerald-600 text-white"
                            : isWrongChosen
                            ? "bg-rose-600 text-white"
                            : isChosen
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {optKey}
                      </span>
                      <span className="leading-snug">{optText}</span>
                    </div>

                    {isCorrectAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isWrongChosen && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Giải thích chi tiết khi đã bấm kiểm tra */}
            {isAnswerChecked && (
              <div className="space-y-3 pt-2">
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    selectedAnswer === currentQ.correctAnswer
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {selectedAnswer === currentQ.correctAnswer ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Đáp án đúng là {currentQ.correctAnswer}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-rose-600" />
                        <span>
                          Chưa chính xác! Đáp án đúng là <strong>{currentQ.correctAnswer}</strong>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    <strong>Giải thích:</strong> {currentQ.explanation}
                  </p>
                </div>

                {currentQ.trapNote && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-800 mb-0.5">Lưu ý bẫy đề thi TOEIC:</strong>
                      <p className="text-slate-700 leading-relaxed">{currentQ.trapNote}</p>
                    </div>
                  </div>
                )}

                {currentQ.translation && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                    <strong>Dịch nghĩa:</strong> &quot;{currentQ.translation}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* MÀN HÌNH TỔNG KẾT KẾT QUẢ QUIZ */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Tập!</h2>
              <p className="text-xs text-slate-500">
                Thời gian hoàn thành: <strong className="text-blue-600">{formatTimer(timerSeconds)}</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-6 px-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Số câu đúng</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {score} / {questions.length}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Tỷ lệ chính xác</p>
                <p className="text-2xl font-extrabold text-blue-600">
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm lại bài
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Chân trang Quiz */}
        {!quizFinished && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {selectedAnswer ? `Đã chọn đáp án ${selectedAnswer}` : "Vui lòng chọn 1 phương án"}
            </span>

            <div className="flex items-center gap-2.5">
              {!isAnswerChecked ? (
                <button
                  type="button"
                  disabled={!selectedAnswer}
                  onClick={handleCheckAnswer}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuizQuestion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? "Câu tiếp theo" : "Xem kết quả"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
