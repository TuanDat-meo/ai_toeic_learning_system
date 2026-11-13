"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Layers } from "lucide-react";
import { VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import { getVocabularySets } from "@/lib/api/vocabulary";
import { StudentVocabularyGrid } from "@/components/student/vocabulary/StudentVocabularyGrid";
import { StudentVocabularyModals } from "@/components/student/vocabulary/StudentVocabularyModals";
import { LearningQuotaBadge } from "@/components/student/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { getItemProgress } from "@/lib/practiceProgress";

export default function StudentVocabularyPage() {
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      setLoadError(null);
      setTests(await getVocabularySets());
    } catch (err) {
      setTests([]);
      setLoadError(err instanceof Error ? err.message : "Không thể tải bộ từ vựng từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
    const handleSync = () => { loadSets(); };
    window.addEventListener("toeic-vocab-tests-updated", handleSync);
    return () => {
      window.removeEventListener("toeic-vocab-tests-updated", handleSync);
    };
  }, [loadSets]);

  // Audio synthesis phát âm tiếng Anh chuẩn MP3 hoặc fallback
  const playAudio = (textOrUrl: string) => {
    if (!textOrUrl?.trim()) return;
    if (textOrUrl.startsWith("/") || textOrUrl.startsWith("http://") || textOrUrl.startsWith("https://")) {
      const audio = new Audio(textOrUrl);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textOrUrl);
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
            Các bộ từ vựng đã được phát hành.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <LearningQuotaBadge featureKey="VOCABULARY" />
        </div>
      </header>

      {/* Grid danh sách bộ từ cho học viên */}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải bộ từ vựng từ backend: {loadError}
        </div>
      ) : null}
      {!loading && !loadError && tests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Chưa có bộ từ vựng được phát hành.
        </div>
      ) : null}
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
        onOpenGame={(test, isRedo = false) => {
          let testToUse = test;
          if (isRedo) {
            const prog = getItemProgress(`vocab-${test.id}`, test.words ? test.words.length : 25);
            const wrongList = prog.wrongQuestionIds || [];
            const wrongIds = wrongList.map(String);
            const allWords = test.words || [];
            let filtered = allWords.filter((w, idx) => {
              const wId = String((w as any)?.id || "");
              const wWord = String(w.word || "");
              const idx1 = String(idx + 1);
              const idx0 = String(idx);
              return wrongIds.some(
                (wid) =>
                  wid === wId ||
                  wid === wWord ||
                  wid === idx1 ||
                  wid === idx0 ||
                  (wId && wId.endsWith(`-${wid}`)) ||
                  (wId && wId.endsWith(`_${wid}`))
              );
            });
            if (filtered.length === 0) {
              filtered = allWords.slice(0, Math.max(1, prog.wrongAnswers || 2));
            }
            testToUse = {
              ...test,
              words: filtered,
              isRedoMode: true,
              allWords: test.words,
              originalTotalWords: test.words?.length || test.wordCount || 0,
            } as any;
          } else {
            testToUse = {
              ...test,
              allWords: test.words,
              originalTotalWords: test.words?.length || test.wordCount || 0,
            } as any;
          }
          void startVocabularyActivity("VOCABULARY_GAME", () => setGameModalTest(testToUse));
        }}
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
