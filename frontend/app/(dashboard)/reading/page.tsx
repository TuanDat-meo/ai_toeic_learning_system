"use client";

import React, { useState } from "react";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { Sparkles, Layers } from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  fetchReadingCardDetails,
  fetchReadingCards,
} from "@/lib/api/reading";
import { StudentReadingCardGrid } from "@/components/reading/StudentReadingCardGrid";
import { StudentReadingVocabCartModal } from "@/components/reading/StudentReadingVocabCartModal";
import { ReadingTheoryModal } from "@/components/admin/content/reading/ReadingTheoryModal";
import { ReadingPracticeWorkspace } from "@/components/admin/content/reading/ReadingPracticeWorkspace";
import { LearningQuotaBadge } from "@/components/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";

export default function StudentReadingPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [readingStartIndex, setReadingStartIndex] = useState<number>(0);
  const [isReadingRedoWrong, setIsReadingRedoWrong] = useState<boolean>(false);
  const [theoryCard, setTheoryCard] = useState<ExerciseCardData | null>(null);
  const [vocabCartCard, setVocabCartCard] = useState<ExerciseCardData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cardsRef = React.useRef<ExerciseCardData[]>(cards);
  React.useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  React.useEffect(() => {
    document.title = "Luyện Thi TOEIC Reading - TOEIC AI";
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
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "toeic_reading_last_updated") {
        void loadCards();
      }
    };

    window.addEventListener("toeic-reading-cards-updated", handleUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("toeic-reading-cards-updated", handleUpdated);
      window.removeEventListener("storage", handleStorage);
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

  const publishedCards = React.useMemo(() => {
    return cards.filter((c) => c.status !== "draft");
  }, [cards]);

  const autoOpenedCardRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (loading || publishedCards.length === 0 || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const openCardId = params.get("openCard");
    if (!openCardId || autoOpenedCardRef.current === openCardId) return;
    const match = publishedCards.find((c) => c.id === openCardId);
    if (!match) return;
    autoOpenedCardRef.current = openCardId;
    const redoWrong = params.get("redoWrong") === "1";
    void startReadingPractice(match, 0, redoWrong);
  }, [loading, publishedCards]);

  const totalQuestionsCount = React.useMemo(() => {
    return publishedCards.reduce((acc, c) => acc + c.totalQuestions, 0);
  }, [publishedCards]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Header chuẩn phong cách tối giản, sạch sẽ như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700 dark:text-blue-400">Luyện đọc Reading</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-[28px]">
            Luyện Thi TOEIC Reading Trọng Tâm
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <LearningQuotaBadge featureKey="READING_PRACTICE" />
        </div>
      </header>

      {/* Grid danh sách bài đọc cho học viên */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          Không thể tải nội dung Reading từ backend: {loadError}
        </div>
      ) : null}
      {!loading && !loadError && cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có nội dung Reading được phát hành.
        </div>
      ) : null}
      <StudentReadingCardGrid
        cards={publishedCards}
        onStartPractice={(card, sIdx, isRedo) => { void startReadingPractice(card, sIdx, isRedo); }}
        onOpenTheory={(card) => {
          void ensureCardDetails(card).then((hydrated) => setTheoryCard(hydrated));
        }}
        onOpenSaved={(card) => {
          void ensureCardDetails(card).then((hydrated) => setVocabCartCard(hydrated));
        }}
      />

      {/* Modal Giỏ từ vựng cá nhân */}
      {vocabCartCard && (
        <StudentReadingVocabCartModal
          card={vocabCartCard}
          onClose={() => setVocabCartCard(null)}
        />
      )}

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
          showTimer={true}
        />
      )}
    </div>
  );
}
