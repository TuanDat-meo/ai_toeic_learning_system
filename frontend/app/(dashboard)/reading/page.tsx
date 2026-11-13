"use client";

import React, { useState } from "react";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { Sparkles, Layers } from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  fetchReadingCardDetails,
  fetchReadingCards,
} from "@/lib/api/reading";
import { StudentReadingCardGrid } from "@/components/student/reading/StudentReadingCardGrid";
import { ReadingTheoryModal } from "@/components/admin/content/reading/ReadingTheoryModal";
import { ReadingPracticeWorkspace } from "@/components/admin/content/reading/ReadingPracticeWorkspace";
import { LearningQuotaBadge } from "@/components/student/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";

export default function StudentReadingPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [readingStartIndex, setReadingStartIndex] = useState<number>(0);
  const [isReadingRedoWrong, setIsReadingRedoWrong] = useState<boolean>(false);
  const [theoryCard, setTheoryCard] = useState<ExerciseCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cardsRef = React.useRef<ExerciseCardData[]>(cards);
  React.useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  React.useEffect(() => {
    let active = true;

    const loadCards = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const backendCards = await fetchReadingCards();
        if (!active) return;
        cardsRef.current = backendCards;
        setCards(backendCards);
      } catch (error) {
        if (!active) return;
        cardsRef.current = [];
        setCards([]);
        setLoadError(error instanceof Error ? error.message : "Không thể tải nội dung Reading từ máy chủ.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCards();
    const handleUpdated = () => { void loadCards(); };

    window.addEventListener("toeic-reading-cards-updated", handleUpdated);
    return () => {
      active = false;
      window.removeEventListener("toeic-reading-cards-updated", handleUpdated);
    };
  }, []);

  const ensureCardDetails = async (card: ExerciseCardData): Promise<ExerciseCardData> => {
    if (card.detailsLoaded || (card.sampleQuestions && card.sampleQuestions.length > 0)) {
      return card;
    }
    const detailed = await fetchReadingCardDetails(card.id);
    if (!detailed) return card;
    const mergedCard: ExerciseCardData = { ...card, ...detailed, detailsLoaded: true };
    const next = cardsRef.current.map((c) => (c.id === mergedCard.id ? mergedCard : c));
    cardsRef.current = next;
    setCards(next);
    return mergedCard;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  async function startReadingPractice(card: ExerciseCardData, startIndex = 0, isRedo = false): Promise<boolean> {
    try {
      await consumeLearningFeature("READING_PRACTICE");
      const hydrated = await ensureCardDetails(card);
      setReadingStartIndex(startIndex);
      setIsReadingRedoWrong(isRedo);
      setActivePracticeCard(hydrated);
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <LearningQuotaBadge featureKey="READING_PRACTICE" />
        </div>
      </header>

      {/* Grid danh sách bài đọc cho học viên */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải nội dung Reading từ backend: {loadError}
        </div>
      ) : null}
      {!loading && !loadError && cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Chưa có nội dung Reading được phát hành.
        </div>
      ) : null}
      <StudentReadingCardGrid
        cards={cards}
        onStartPractice={(card, sIdx, isRedo) => { void startReadingPractice(card, sIdx, isRedo); }}
        onOpenTheory={(card) => {
          void ensureCardDetails(card).then((hydrated) => setTheoryCard(hydrated));
        }}
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
