"use client";

import React from "react";
import { Plus, Pencil, Trash2, Eye, Book, Gamepad2 } from "lucide-react";
import { TestItem } from "@/app/admin/content/vocabulary/types";

interface VocabularyTestGridProps {
  tests: TestItem[];
  activeSubCategory: "2026" | "600_essential" | "2023";
  setActiveSubCategory: (cat: "2026" | "600_essential" | "2023") => void;
  onOpenCreateTest: () => void;
  onOpenEditTest: (test: TestItem, e?: React.MouseEvent) => void;
  onOpenDeleteTest: (test: TestItem, e?: React.MouseEvent) => void;
  onOpenWordList: (test: TestItem) => void;
  onOpenFlashcards: (test: TestItem) => void;
  onOpenGame: (test: TestItem) => void;
}

export const VocabularyTestGrid: React.FC<VocabularyTestGridProps> = ({
  tests,
  activeSubCategory,
  setActiveSubCategory,
  onOpenCreateTest,
  onOpenEditTest,
  onOpenDeleteTest,
  onOpenWordList,
  onOpenFlashcards,
  onOpenGame,
}) => {
  const currentTests = tests.filter((t) => t.category === activeSubCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Sub-filter tabs & Add Test button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveSubCategory("2026")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubCategory === "2026"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            2026 ({tests.filter((t) => t.category === "2026").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubCategory("600_essential")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubCategory === "600_essential"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            600 Essential Words ({tests.filter((t) => t.category === "600_essential").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubCategory("2023")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubCategory === "2023"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            2023 ({tests.filter((t) => t.category === "2023").length})
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenCreateTest}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm bộ từ vựng
        </button>
      </div>

      {/* Grid các thẻ Test */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {currentTests.map((t) => (
          <div
            key={t.id}
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between min-h-[155px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600">
                  {t.year}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-blue-700 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {t.wordCount} từ vựng
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => onOpenEditTest(t, e)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Sửa bộ từ vựng"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => onOpenDeleteTest(t, e)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Xóa bộ từ vựng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3 Nút thao tác: Xem từ | Học | Chơi */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => onOpenWordList(t)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Xem toàn bộ danh sách từ"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                Xem từ
              </button>

              <button
                type="button"
                onClick={() => onOpenFlashcards(t)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Học Flashcard lặp lại ngắt quãng"
              >
                <Book className="w-3.5 h-3.5 text-slate-600" />
                Học
              </button>

              <button
                type="button"
                onClick={() => onOpenGame(t)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Mini-game trắc nghiệm ôn từ"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-slate-600" />
                Chơi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
