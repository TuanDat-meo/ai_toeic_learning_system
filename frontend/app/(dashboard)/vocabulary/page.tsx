"use client";

import React, { useState } from "react";
import { BookOpen, Layers } from "lucide-react";
import { TestItem } from "@/app/admin/content/vocabulary/types";
import { INITIAL_TESTS } from "@/app/admin/content/vocabulary/mockData";
import { StudentVocabularyGrid } from "@/components/student/vocabulary/StudentVocabularyGrid";
import { StudentVocabularyModals } from "@/components/student/vocabulary/StudentVocabularyModals";

export default function StudentVocabularyPage() {
  const [activeSubCategory, setActiveSubCategory] = useState<
    "all" | "2024" | "2026" | "600_essential" | "2023"
  >("all");
  const [tests] = useState<TestItem[]>(INITIAL_TESTS);

  // Modal State
  const [wordListModalTest, setWordListModalTest] = useState<TestItem | null>(null);
  const [flashcardModalTest, setFlashcardModalTest] = useState<TestItem | null>(null);
  const [gameModalTest, setGameModalTest] = useState<TestItem | null>(null);

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
    return tests.reduce((acc, curr) => acc + (curr.words?.length || curr.wordCount), 0);
  }, [tests]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
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
            Luyện từ vựng theo từng bộ đề ETS 2024 Test 1 – 10 và 600 từ thiết yếu với Flashcard &amp; Mini-game.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs">
            <BookOpen className="w-4 h-4 text-blue-600" />
            {tests.length} bộ đề ({totalWordsCount.toLocaleString("vi-VN")} từ vựng)
          </span>
        </div>
      </header>

      {/* Grid danh sách bộ từ cho học viên */}
      <StudentVocabularyGrid
        tests={tests}
        activeSubCategory={activeSubCategory}
        setActiveSubCategory={setActiveSubCategory}
        onOpenWordList={(test) => setWordListModalTest(test)}
        onOpenFlashcards={(test) => setFlashcardModalTest(test)}
        onOpenGame={(test) => setGameModalTest(test)}
      />

      {/* Các Modals học tập */}
      <StudentVocabularyModals
        wordListModalTest={wordListModalTest}
        onCloseWordList={() => setWordListModalTest(null)}
        playAudio={playAudio}
        onStartFlashcardsFromList={(test) => {
          setWordListModalTest(null);
          setFlashcardModalTest(test);
        }}
        onStartGameFromList={(test) => {
          setWordListModalTest(null);
          setGameModalTest(test);
        }}
        flashcardModalTest={flashcardModalTest}
        onCloseFlashcards={() => setFlashcardModalTest(null)}
        gameModalTest={gameModalTest}
        onCloseGame={() => setGameModalTest(null)}
      />
    </div>
  );
}
