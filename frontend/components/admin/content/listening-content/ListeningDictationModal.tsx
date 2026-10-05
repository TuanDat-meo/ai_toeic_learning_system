"use client";

import React from "react";
import { ArrowLeft, Clock, Zap, Pause, Play, Bookmark, FileText, Lock, BookOpen, Volume2, Flag, ShoppingBag, Grid } from "lucide-react";
import { DictationCardData } from "@/app/admin/content/listening-content/types";

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
  dictationUserInputs,
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
  const q = dictationModalCard.questions[activeDictationQIndex];
  if (!q) return null;

  const isChecked = !!dictationChecked[q.id];
  const isFlagged = flaggedReviewIds.includes(q.id);
  const words = q.fullTranscript.split(" ");
  const totalWords = words.length;

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
              {/* THẺ 1: SÓNG ÂM & BỘ ĐIỀU KHIỂN AUDIO */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <div className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between px-6 relative overflow-hidden">
                  <div className="flex items-center justify-between w-full h-10 gap-1.5">
                    {Array.from({ length: 42 }).map((_, idx) => {
                      const heights = [20, 35, 60, 40, 85, 50, 30, 95, 45, 25, 75, 90, 35, 65, 40];
                      const h = heights[idx % heights.length];
                      const isPlayed = idx < 12;
                      return (
                        <span
                          key={idx}
                          style={{ height: `${h}%` }}
                          className={`w-1.5 rounded-full transition-all ${
                            isPlayed ? "bg-blue-500" : "bg-slate-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute left-[28%] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx("click");
                      setReplayCount((r) => r + 1);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    <span>Phát lại</span>
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono">
                      {replayCount}
                    </span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        triggerToast("Đã lùi 2 giây");
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200/90 hover:bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                    >
                      &lt;
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        setIsPlayingAudio(!isPlayingAudio);
                      }}
                      className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition cursor-pointer active:scale-95"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        triggerToast("Đã tới 2 giây");
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200/90 hover:bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                    >
                      &gt;
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        const nextSpeed = audioSpeed === "1.0" ? "0.8" : audioSpeed === "0.8" ? "1.2" : "1.0";
                        setAudioSpeed(nextSpeed);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      {audioSpeed}x
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        triggerToast("Đã kích hoạt chế độ Tự lập");
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      Tự lập
                    </button>
                  </div>
                </div>
              </div>

              {/* THẺ 2: KHUNG ĐỤC LỖ TỪ VỰNG & NÚT LẬT TỪ */}
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
                        setIsNotesModalOpen(true);
                      }}
                      title="Ghi chú"
                      className="p-2 rounded-xl border border-slate-200/90 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("click");
                        triggerToast("Đã gửi yêu cầu hỗ trợ giải đáp!");
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      Hỏi bài
                    </button>
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

                      if (!shouldHide || isChecked) {
                        return (
                          <span key={idx} className="font-bold text-slate-900 border-b-2 border-slate-300 px-1">
                            {w}
                          </span>
                        );
                      }

                      return (
                        <input
                          key={idx}
                          type="text"
                          placeholder=""
                          className="w-16 h-9 rounded-xl border-2 border-slate-200 bg-white text-center font-bold text-sm text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs transition"
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    LẬT TỪ
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
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
                </div>
              </div>
            </div>

            {/* KHỐI BÊN PHẢI (COL 5): TỪ VỰNG NÊN HỌC */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Từ vựng nên học</h3>
                </div>

                {!isChecked && revealedWordCount < totalWords ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 my-auto">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
                      <Lock className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Chép xong câu để xem 1 từ nên học</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                      Từ vựng nằm ngay trong câu, hiện sớm sẽ lộ đáp án.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 flex-1">
                    <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base text-blue-950">photograph</span>
                        <button
                          type="button"
                          onClick={() => playAudio("photograph")}
                          className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-mono font-medium text-slate-500">/ˈfəʊtəɡrɑːf/</p>
                      <p className="text-xs font-bold text-slate-700">n. bức ảnh, bức hình</p>
                      <p className="text-xs text-slate-500 italic pt-1">Ví dụ: A man is holding a photograph.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. FOOTER THANH ĐIỀU HƯỚNG BÊN DƯỚI */}
        <footer className="h-14 bg-white border-t border-slate-200/90 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-lg select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerToast("Đã nhận phản hồi báo lỗi từ bạn!")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-slate-500" />
              <span>Báo lỗi</span>
            </button>

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

          <button
            type="button"
            onClick={() => setIsQuestionGridOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Grid className="w-4 h-4" />
            <span>{activeDictationQIndex + 1}/{dictationModalCard.questions.length}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};
