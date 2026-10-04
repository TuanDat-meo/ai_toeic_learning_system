"use client";

import React from "react";
import { TestItem, PracticeQuestion } from "../types";
import {
  ArrowLeft,
  Bell,
  BellOff,
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
} from "lucide-react";

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
  onStartExamNow: () => void;
  onSubmitExam: () => void;
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
              Thi thử TOEIC: {test.title}
            </span>
          </div>

          {examStarted && !examSubmitted && (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* SFX Bell toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !isSfxEnabled;
                  setIsSfxEnabled(next);
                  setIsPlayingAudio(next);
                  if (next) playSfx("correct");
                  else playSfx("click");
                  triggerToast(next ? "🔊 Đã bật âm thanh SFX 👑" : "⏸ Đã tắt âm thanh SFX");
                }}
                className={`p-2 rounded-full text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isSfxEnabled
                    ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50 animate-pulse"
                    : "bg-white/15 hover:bg-white/25 text-white/70"
                }`}
                title={isSfxEnabled ? "Tắt hiệu ứng âm thanh" : "Bật hiệu ứng âm thanh"}
              >
                {isSfxEnabled ? <Bell className="w-4 h-4 fill-slate-950" /> : <BellOff className="w-4 h-4" />}
              </button>

              {/* Timer button */}
              <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 text-white border border-white/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(examTimeRemaining)}</span>
              </div>

              {/* Answered Counter */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-2xs">
                ✓ {Object.keys(examAnswers).length}/{activeExamQuestions.length}
              </div>

              {/* Question Grid Toggle */}
              <button
                type="button"
                onClick={onOpenQuestionGrid}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-700/90 hover:bg-blue-800 border border-blue-400/40 text-white text-xs font-extrabold transition cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Câu {examCurrentQIndex + 1}/{activeExamQuestions.length}</span>
              </button>

              {/* Submit button */}
              <button
                type="button"
                onClick={onSubmitExam}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 fill-slate-950" />
                <span>Nộp bài thi</span>
              </button>
            </div>
          )}
        </header>

        {/* Body Modal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Màn hình chuẩn bị */}
          {!examStarted && !examSubmitted && (
            <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
              <div className="max-w-2xl w-full py-4 space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
                  <Play className="w-8 h-8 ml-1" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Sẵn sàng thi thử {test.title}?
                  </h2>
                  <p className="text-sm text-slate-600">
                    {activeExamParts.length > 0
                      ? `Bài thi tập trung cho phần: ${activeExamParts.join(", ")} (${activeExamQuestions.length} câu)`
                      : "Đề thi bao gồm 2 phần Listening & Reading với hệ thống câu hỏi chuẩn format ETS."}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase block">
                    Chọn thời gian làm bài:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "120", label: "Chuẩn 120 phút", desc: "Full Test (200 câu)" },
                      { val: "60", label: "Rút gọn 60 phút", desc: "Mini Test (100 câu)" },
                      { val: "30", label: "Tập trung 30 phút", desc: "Speed Test (50 câu)" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setExamDurationType(item.val as any)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                          examDurationType === item.val
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <p className="font-bold text-xs">{item.label}</p>
                        <p className={`text-[10px] mt-0.5 ${examDurationType === item.val ? "text-blue-100" : "text-slate-400"}`}>
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStartExamNow}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer active:scale-98"
                >
                  Bắt đầu làm bài thi ngay
                </button>
              </div>
            </div>
          )}

          {/* Đang làm bài thi thử */}
          {examStarted && !examSubmitted && (() => {
            const currentQ = activeExamQuestions[examCurrentQIndex];
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
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsPlayingAudio(!isPlayingAudio);
                                triggerToast(isPlayingAudio ? "⏸ Đã tạm dừng âm thanh bài nghe" : "🔊 Đã phát âm thanh bài nghe");
                              }}
                              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-md shrink-0 cursor-pointer"
                            >
                              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>

                            <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                              {[40, 65, 30, 85, 95, 40, 60, 30, 75, 90, 50, 35, 70, 80, 45, 90, 60, 40, 80, 50].map((h, i) => (
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
                              00:24
                            </span>
                          </div>
                        </div>
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

                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                            {currentQ.part}
                          </span>
                        </div>

                        <div className="text-base font-extrabold text-slate-900 leading-relaxed">
                          {currentQ.part === "Part 2" ? `${examCurrentQIndex + 1}. Mark your answer on your answer sheet.` : `${examCurrentQIndex + 1}. ${currentQ.questionText}`}
                        </div>

                        {/* OPTIONS LIST */}
                        <div className="space-y-3">
                          {Object.entries(currentQ.options).map(([optKey, optVal]) => {
                            if (currentQ.part === "Part 2" && optKey === "D") return null;

                            const isChosen = examAnswers[currentQ.id] === optKey;

                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => {
                                  if (isSfxEnabled) playSfx("click");
                                  setExamAnswers((prev) => ({ ...prev, [currentQ.id]: optKey }));
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
                                  ({optKey}) {optVal}
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
                <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
                  <button
                    type="button"
                    disabled={examCurrentQIndex === 0}
                    onClick={() => setExamCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs font-mono">
                      {examCurrentQIndex + 1}/{activeExamQuestions.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={examCurrentQIndex === activeExamQuestions.length - 1}
                    onClick={() => setExamCurrentQIndex((prev) => Math.min(activeExamQuestions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                  >
                    <span>Câu tiếp</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </footer>
              </div>
            );
          })()}

          {/* Màn hình kết quả sau khi nộp bài */}
          {examSubmitted && examResultScore && (
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

                  <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl">
                      <p className="text-xs uppercase text-blue-200 font-bold">Listening</p>
                      <p className="text-2xl font-black">{examResultScore.listening} / 495</p>
                    </div>

                    <div className="bg-white/25 backdrop-blur-xs px-6 py-4 rounded-2xl ring-2 ring-white/30">
                      <p className="text-xs uppercase text-amber-200 font-bold">Tổng điểm TOEIC</p>
                      <p className="text-3xl sm:text-4xl font-black text-amber-300">
                        {examResultScore.total} / 990
                      </p>
                    </div>

                    <div className="bg-white/15 backdrop-blur-xs px-5 py-3 rounded-2xl">
                      <p className="text-xs uppercase text-blue-200 font-bold">Reading</p>
                      <p className="text-2xl font-black">{examResultScore.reading} / 495</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    Chi tiết đáp án & Giải thích AI từng câu:
                  </h3>

                  <div className="space-y-4">
                    {activeExamQuestions.map((q) => {
                      const userAns = examAnswers[q.id];
                      const isCorrect = userAns === q.correctAnswer;

                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-2xl border transition ${
                            isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-slate-800">
                              Câu {q.id} ({q.part})
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
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
          )}
        </div>
      </div>
    </div>
  );
};
