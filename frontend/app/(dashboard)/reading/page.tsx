"use client";

import React, { useState } from "react";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { Sparkles, Layers } from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import { INITIAL_CARDS } from "@/app/admin/content/reading/mockData";
import { StudentReadingCardGrid } from "@/components/student/reading/StudentReadingCardGrid";
import { ReadingTheoryModal } from "@/components/admin/content/reading/ReadingTheoryModal";
import { ReadingPracticeWorkspace } from "@/components/admin/content/reading/ReadingPracticeWorkspace";
import { consumeLearningFeature } from "@/lib/api/billing";

export default function StudentReadingPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>(INITIAL_CARDS);
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [readingStartIndex, setReadingStartIndex] = useState<number>(0);
  const [isReadingRedoWrong, setIsReadingRedoWrong] = useState<boolean>(false);
  const [theoryCard, setTheoryCard] = useState<ExerciseCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const loadCards = () => {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("toeic_reading_cards");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCards(parsed);
              return;
            }
          }
        } catch {}
      }
      setCards(INITIAL_CARDS);
    };
    loadCards();
    window.addEventListener("toeic-reading-cards-updated", loadCards);
    window.addEventListener("storage", loadCards);
    return () => {
      window.removeEventListener("toeic-reading-cards-updated", loadCards);
      window.removeEventListener("storage", loadCards);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  async function startReadingPractice(card: ExerciseCardData, startIndex = 0, isRedo = false): Promise<boolean> {
    try {
      await consumeLearningFeature("READING_PRACTICE");
      setReadingStartIndex(startIndex);
      setIsReadingRedoWrong(isRedo);
      setActivePracticeCard(card);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể bắt đầu lượt luyện Reading.");
      return false;
    }
  }

  // Web Audio SFX Synthesizer
  const playSfx = (_type?: string) => {
    playUnifiedAnswerSound();
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
        </div>

        
      </header>

      {/* Grid danh sách bài đọc cho học viên */}
      <StudentReadingCardGrid
        cards={cards}
        onStartPractice={(card, sIdx, isRedo) => { void startReadingPractice(card, sIdx, isRedo); }}
        onOpenTheory={(card) => setTheoryCard(card)}
      />

      {/* Modal Xem Lý Thuyết */}
      {theoryCard && (
        <ReadingTheoryModal
          card={theoryCard}
          onClose={() => setTheoryCard(null)}
          onStartPractice={() => {
            if (theoryCard) {
              void startReadingPractice(theoryCard).then((started) => {
                if (started) setTheoryCard(null);
              });
            }
          }}
        />
      )}

      {/* Không gian luyện tập Reading chuyên sâu với popup Tra từ điển */}
      {activePracticeCard && (
        <ReadingPracticeWorkspace
          card={activePracticeCard}
          initialQuestionIndex={readingStartIndex}
          isRedoWrongOnly={isReadingRedoWrong}
          onClose={() => {
            setActivePracticeCard(null);
            setIsReadingRedoWrong(false);
          }}
          playSfx={playSfx}
          showToast={showToast}
        />
      )}
    </div>
  );
}

