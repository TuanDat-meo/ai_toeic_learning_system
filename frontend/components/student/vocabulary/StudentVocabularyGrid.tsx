"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  RotateCcw,
  Gamepad2,
  Sparkles,
  Layers,
} from "lucide-react";
import { TestItem } from "@/app/admin/content/vocabulary/types";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentVocabularyGridProps {
  tests: TestItem[];
  activeSubCategory: "all" | "2024" | "2026" | "600_essential" | "2023";
  setActiveSubCategory: (cat: "all" | "2024" | "2026" | "600_essential" | "2023") => void;
  onOpenWordList: (test: TestItem) => void;
  onOpenFlashcards: (test: TestItem) => void;
  onOpenGame: (test: TestItem) => void;
}

function StudentVocabCardItem({
  test,
  onOpenWordList,
  onOpenFlashcards,
  onOpenGame,
}: {
  test: TestItem;
  onOpenWordList: (test: TestItem) => void;
  onOpenFlashcards: (test: TestItem) => void;
  onOpenGame: (test: TestItem) => void;
}) {
  const totalWords = test.words?.length || test.wordCount || 30;
  const progress = useItemProgress(`vocab-${test.id}`, totalWords);

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {test.year}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Sẵn sàng học
          </span>
        </div>

        {/* Title & Stats */}
        <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors line-clamp-1">
          {test.title}
        </h3>
        <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Quy mô bộ từ:</span>
            <span className="text-blue-600 font-extrabold">{test.wordCount} từ vựng</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Layers className="w-3.5 h-3.5" />
            Gồm phiên âm IPA, câu ví dụ & phát âm
          </div>
        </div>

        {/* Tiến độ đã học */}
        <div className="mt-3.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
          <PracticeProgressBar
            completed={progress.completedQuestions}
            total={totalWords}
            unit="từ"
          />
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Đã học: <strong className="text-slate-800 font-mono">{progress.completedQuestions}</strong> từ
            </span>
            <span className="font-mono text-slate-400">
              Còn lại: <strong className="text-slate-600 font-mono">{Math.max(0, totalWords - progress.completedQuestions)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Các nút hành động dành riêng cho học viên */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => onOpenWordList(test)}
          className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Xem danh sách từ ({totalWords})
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenFlashcards(test)}
            className="py-2 px-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Lật thẻ Flashcard ghi nhớ"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            Flashcard
          </button>
          <button
            type="button"
            onClick={() => onOpenGame(test)}
            className="py-2 px-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Chơi mini-game trắc nghiệm"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-600" />
            Mini-game
          </button>
        </div>
      </div>
    </div>
  );
}

export const StudentVocabularyGrid: React.FC<StudentVocabularyGridProps> = ({
  tests,
  activeSubCategory,
  setActiveSubCategory,
  onOpenWordList,
  onOpenFlashcards,
  onOpenGame,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchCat =
        activeSubCategory === "all" ? true : t.category === activeSubCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.year.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tests, activeSubCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm & Bộ lọc danh mục */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tìm kiếm */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ vựng, năm phát hành..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Danh mục bộ từ */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubCategory === "all"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({tests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubCategory("2024")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubCategory === "2024"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ETS 2024 ({tests.filter((t) => t.category === "2024").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubCategory("2026")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubCategory === "2026"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ETS 2026 ({tests.filter((t) => t.category === "2026").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubCategory("600_essential")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              activeSubCategory === "600_essential"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            600 Từ thiết yếu ({tests.filter((t) => t.category === "600_essential").length})
          </button>
        </div>
      </div>

      {/* Grid danh sách các bộ từ vựng cho học viên */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTests.map((t) => (
          <StudentVocabCardItem
            key={t.id}
            test={t}
            onOpenWordList={onOpenWordList}
            onOpenFlashcards={onOpenFlashcards}
            onOpenGame={onOpenGame}
          />
        ))}
      </div>
    </div>
  );
};
