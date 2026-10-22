"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  RotateCcw,
  Gamepad2,
  Sparkles,
  Layers,
  Check,
  X,
} from "lucide-react";
import { TestItem, getTestCategoryKey, getCategoryLabel } from "@/app/admin/content/vocabulary/types";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentVocabularyGridProps {
  tests: TestItem[];
  activeSubCategory: string;
  setActiveSubCategory: (cat: string) => void;
  onOpenWordList: (test: TestItem) => void;
  onOpenFlashcards: (test: TestItem, isRedo?: boolean, startIndex?: number) => void;
  onOpenGame: (test: TestItem, isRedo?: boolean) => void;
}

function VocabCardItem({
  t,
  onOpenWordList,
  onOpenFlashcards,
  onOpenGame,
}: {
  t: TestItem;
  onOpenWordList: (test: TestItem) => void;
  onOpenFlashcards: (test: TestItem, isRedo?: boolean, startIndex?: number) => void;
  onOpenGame: (test: TestItem, isRedo?: boolean) => void;
}) {
  const wordCount = t.words?.length || t.wordCount || 200;
  const progressKey = `vocab-${t.id}`;
  const progress = useItemProgress(progressKey, wordCount || 25);
  const completed = progress.completedQuestions || 0;
  const total = wordCount || progress.totalQuestions || 25;
  const wrong = progress.wrongAnswers || 0;
  const correct = progress.correctAnswers !== undefined ? progress.correctAnswers : Math.max(0, completed - wrong);

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {t.year}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Sẵn sàng học
          </span>
        </div>

        {/* Title & Stats */}
        <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors line-clamp-1" title={t.title}>
          {t.title}
        </h3>
        <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Quy mô bộ từ:</span>
            <span className="text-blue-600 font-extrabold">{wordCount} từ vựng</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Layers className="w-3.5 h-3.5" />
            Gồm phiên âm IPA, câu ví dụ & phát âm
          </div>
        </div>
      </div>

      {/* Thống kê tiến độ & Cụm nút hành động */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
        {/* Hàng tiến độ học tập */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <span className="text-slate-600">Tiến độ:</span>
            <span className="text-emerald-700 font-extrabold">{completed}/{total}</span>
            <span className="text-emerald-600 inline-flex items-center gap-0.5 text-[11px]">
              <Check className="w-3 h-3 stroke-[2.5]" />
              {correct}
            </span>
            <span className="text-red-500 inline-flex items-center gap-0.5 text-[11px]">
              <X className="w-3 h-3 stroke-[2.5]" />
              {wrong}
            </span>
          </div>
          {wrong > 0 && (
            <button
              type="button"
              onClick={() => onOpenGame(t, true)}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-lg inline-flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
              title={`Làm lại ${wrong} câu sai trong Mini-game`}
            >
              <RotateCcw className="w-3 h-3 text-red-500 stroke-[2.5]" />
              Làm lại {wrong} câu sai
            </button>
          )}
        </div>

        {/* Nút Xem danh sách từ */}
        <button
          type="button"
          onClick={() => onOpenWordList(t)}
          className="w-full py-2 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Xem danh sách từ ({wordCount})
        </button>

        {/* Hàng 2 nút: Flashcard phản xạ & Mini-game */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenFlashcards(t, false, completed < total ? completed : 0)}
            disabled={wordCount === 0}
            className="py-2.5 px-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
            title={wordCount === 0 ? "Bộ từ chưa có từ vựng" : "Lật thẻ Flashcard ghi nhớ phản xạ"}
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Flashcard phản xạ</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenGame(t, false)}
            disabled={wordCount === 0}
            className="py-2.5 px-2 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 disabled:opacity-40 disabled:cursor-not-allowed text-amber-900 text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
            title={wordCount === 0 ? "Bộ từ chưa có từ vựng" : "Chơi mini-game trắc nghiệm phản xạ"}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Mini-game</span>
            {wrong > 0 && (
              <span
                className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs"
                title={`${wrong} câu sai cần làm lại`}
              >
                {wrong}
              </span>
            )}
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

  const isAll = !activeSubCategory || activeSubCategory.toLowerCase() === "all";

  // Tự động gom nhóm các phân loại thực tế đang có trong danh sách tests
  const dynamicCategories = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    tests.forEach((t) => {
      const key = getTestCategoryKey(t);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { key, label: getCategoryLabel(key), count: 1 });
      }
    });
    return Array.from(map.values());
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchCat = isAll || getTestCategoryKey(t) === activeSubCategory;
      const titleStr = t.title || t.nameVi || t.nameEn || "";
      const yearStr = t.year ? String(t.year) : "";
      const matchSearch =
        searchQuery.trim() === "" ||
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        yearStr.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tests, activeSubCategory, isAll, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm & Bộ lọc danh mục */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tìm kiếm */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ vựng, năm phát hành..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Danh mục bộ từ tự động hiển thị theo dữ liệu thực tế */}
        <div className="flex-1 min-w-0 max-w-full flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              isAll
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ({tests.length})
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveSubCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                activeSubCategory === cat.key
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid danh sách các bộ từ vựng cho học viên */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTests.map((t) => (
          <VocabCardItem
            key={t.id}
            t={t}
            onOpenWordList={onOpenWordList}
            onOpenFlashcards={onOpenFlashcards}
            onOpenGame={onOpenGame}
          />
        ))}
      </div>
    </div>
  );
};
