"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Layers } from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import { INITIAL_CARDS } from "@/app/admin/content/reading/mockData";
import { StudentReadingCardGrid } from "@/components/student/reading/StudentReadingCardGrid";
import { ReadingTheoryModal } from "@/components/admin/content/reading/ReadingTheoryModal";
import { ReadingPracticeWorkspace } from "@/components/admin/content/reading/ReadingPracticeWorkspace";

export default function StudentReadingPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>(INITIAL_CARDS);
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [theoryCard, setTheoryCard] = useState<ExerciseCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Web Audio SFX Synthesizer
  const playSfx = (type?: "correct" | "wrong" | "click") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  const totalQuestionsCount = React.useMemo(() => {
    return cards.reduce((acc, c) => acc + c.totalQuestions, 0);
  }, [cards]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Header chuẩn phong cách tối giản, sạch sẽ như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Luyện đọc Reading</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Luyện Thi TOEIC Reading Trọng Tâm
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 md:text-sm">
            Rèn luyện kỹ năng đọc hiểu Part 5, 6, 7 với bộ đề ETS 2024 và tính năng tra từ điển trực tiếp trên bài đọc.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs">
            <BookOpen className="w-4 h-4 text-blue-600" />
            {cards.length} chuyên đề ({totalQuestionsCount.toLocaleString("vi-VN")} câu hỏi)
          </span>
        </div>
      </header>

      {/* Grid danh sách bài đọc cho học viên */}
      <StudentReadingCardGrid
        cards={cards}
        onStartPractice={(card) => setActivePracticeCard(card)}
        onOpenTheory={(card) => setTheoryCard(card)}
      />

      {/* Modal Xem Lý Thuyết */}
      {theoryCard && (
        <ReadingTheoryModal
          card={theoryCard}
          onClose={() => setTheoryCard(null)}
          onStartPractice={() => {
            const cardToStart = theoryCard;
            setTheoryCard(null);
            setActivePracticeCard(cardToStart);
          }}
        />
      )}

      {/* Không gian luyện tập Reading chuyên sâu với popup Tra từ điển */}
      {activePracticeCard && (
        <ReadingPracticeWorkspace
          card={activePracticeCard}
          onClose={() => setActivePracticeCard(null)}
          playSfx={playSfx}
          showToast={showToast}
        />
      )}
    </div>
  );
}
