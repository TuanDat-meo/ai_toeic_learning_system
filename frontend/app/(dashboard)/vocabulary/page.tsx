"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layers } from "lucide-react";
import { VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import { INITIAL_TESTS } from "@/app/admin/content/vocabulary/mockData";
import { getVocabularySets } from "@/lib/api/vocabulary";
import { StudentVocabularyGrid } from "@/components/student/vocabulary/StudentVocabularyGrid";
import { StudentVocabularyModals } from "@/components/student/vocabulary/StudentVocabularyModals";
import { consumeLearningFeature } from "@/lib/api/billing";
import { getItemProgress } from "@/lib/practiceProgress";

export default function StudentVocabularyPage() {
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>(INITIAL_TESTS);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [wordListModalTest, setWordListModalTest] = useState<VocabularyTestSet | null>(null);
  const [flashcardModalTest, setFlashcardModalTest] = useState<VocabularyTestSet | null>(null);
  const [flashcardStartIndex, setFlashcardStartIndex] = useState<number>(0);
  const [gameModalTest, setGameModalTest] = useState<VocabularyTestSet | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

  async function startVocabularyActivity(featureKey: string, open: () => void) {
    try {
      await consumeLearningFeature(featureKey);
    } catch (error) {
      console.warn("Vocabulary quota warning:", error);
    }
    open();
  }

  const loadSets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVocabularySets();
      if (data && data.length > 0) {
        setTests(data);
      } else {
        setTests(INITIAL_TESTS);
      }
    } catch (err) {
      console.warn("Could not load vocabulary sets from server, using fallback:", err);
      setTests(INITIAL_TESTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  // Audio synthesis phát âm tiếng Anh
  const playAudio = (text: string) => {
    if (!text.trim()) return;
    if (text.startsWith("http://") || text.startsWith("https://")) {
      const audio = new Audio(text);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tính tổng số từ trong kho
  const totalWordsCount = React.useMemo(() => {
    return tests.reduce((acc, curr) => acc + (curr.words ? curr.words.length : (curr.wordCount ?? 0)), 0);
  }, [tests]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {quotaMessage ? <div role="alert" className="fixed right-5 top-5 z-[70] max-w-sm rounded-xl bg-red-700 px-4 py-3 text-xs font-semibold text-white shadow-xl">{quotaMessage}</div> : null}
      {/* Header phong cách tinh tế, đơn giản, sạch sẽ giống Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Luyện từ vựng</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Kho Từ Vựng TOEIC Trọng Tâm
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 md:text-sm">
            Hệ thống 20 bộ từ vựng TOEIC trọng tâm (4.000 từ cốt lõi phân theo chủ đề doanh nghiệp, tài chính, sản xuất...) kèm Flashcard phản xạ &amp; Mini-game.
          </p>
        </div>

        
      </header>

      {/* Grid danh sách bộ từ cho học viên */}
      <StudentVocabularyGrid
        tests={tests}
        activeSubCategory={activeSubCategory}
        setActiveSubCategory={setActiveSubCategory}
        onOpenWordList={(test) => setWordListModalTest(test)}
        onOpenFlashcards={(test, isRedo = false, startIndex = 0) => {
          setFlashcardStartIndex(isRedo ? 0 : startIndex);
          let testToUse = test;
          if (isRedo) {
            const prog = getItemProgress(`vocab-${test.id}`, test.words ? test.words.length : 25);
            const wrongList = prog.wrongQuestionIds || [];
            const wrongIds = wrongList.map(String);
            const allWords = test.words || [];
            let filtered = allWords.filter((w, idx) => {
              const wId = String(w.id || idx + 1);
              return wrongIds.includes(wId) || wrongIds.includes(String(idx + 1));
            });
            if (filtered.length === 0) {
              filtered = allWords.slice(0, Math.max(1, prog.wrongAnswers || 2));
            }
            testToUse = { ...test, words: filtered };
          }
          void startVocabularyActivity("VOCABULARY_FLASHCARDS", () => setFlashcardModalTest(testToUse));
        }}
        onOpenGame={(test) => { void startVocabularyActivity("VOCABULARY_GAME", () => setGameModalTest(test)); }}
      />

      {/* Các Modals học tập */}
      <StudentVocabularyModals
        wordListModalTest={wordListModalTest}
        onCloseWordList={() => setWordListModalTest(null)}
        playAudio={playAudio}
        onStartFlashcardsFromList={(test) => { void startVocabularyActivity("VOCABULARY_FLASHCARDS", () => {
          setWordListModalTest(null);
          setFlashcardModalTest(test);
        }); }}
        onStartGameFromList={(test) => { void startVocabularyActivity("VOCABULARY_GAME", () => {
          setWordListModalTest(null);
          setGameModalTest(test);
        }); }}
        flashcardModalTest={flashcardModalTest}
        onCloseFlashcards={() => setFlashcardModalTest(null)}
        initialFlashcardIndex={flashcardStartIndex}
        gameModalTest={gameModalTest}
        onCloseGame={() => setGameModalTest(null)}
      />
    </div>
  );
}
