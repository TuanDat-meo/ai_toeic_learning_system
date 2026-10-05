"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests-content/types";
import {
  Pencil,
  Trash2,
  History,
  RotateCcw,
  FileText,
  Languages,
  Signal,
  Trophy,
  Play,
  BookOpen,
} from "lucide-react";

interface MockTestCardGridProps {
  tests: TestItem[];
  onEditTest: (test: TestItem, e?: React.MouseEvent) => void;
  onConfirmDeleteTest: (test: TestItem) => void;
  onOpenHistory: (test: TestItem) => void;
  onOpenRedo: (test: TestItem) => void;
  onOpenTranscript: (test: TestItem) => void;
  onOpenVocab: (test: TestItem) => void;
  onSelectMode: (test: TestItem, mode: "exam" | "practice") => void;
}

export const MockTestCardGrid: React.FC<MockTestCardGridProps> = ({
  tests,
  onEditTest,
  onConfirmDeleteTest,
  onOpenHistory,
  onOpenRedo,
  onOpenTranscript,
  onOpenVocab,
  onSelectMode,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {tests.map((test) => (
        <div
          key={test.id}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
        >
          <div>
            {/* Dòng 1: Tiêu đề Test & Cụm icon thao tác */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {test.title}
              </h3>

              {/* Các icon thao tác */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => onEditTest(test, e)}
                  title="Sửa thông tin đề thi"
                  className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onConfirmDeleteTest(test)}
                  title="Xóa đề thi này"
                  className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenHistory(test)}
                  title="Xem lịch sử thi"
                  className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenRedo(test)}
                  title="Làm lại đề từ đầu"
                  className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTranscript(test)}
                  title="Xem đáp án & Transcript chi tiết"
                  className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenVocab(test)}
                  title="Xem từ vựng trọng tâm của đề"
                  className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dòng 2: Huy hiệu Độ khó & Điểm số */}
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                <Signal className="w-3.5 h-3.5" />
                {test.difficulty}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                <Trophy className="w-3 h-3 text-amber-500" />
                {test.score ? `${test.score} / 990` : "Điểm số"}
              </span>
            </div>

            {/* Dòng 3: Trạng thái bài làm */}
            <p className="text-xs text-slate-500 font-medium mb-4">
              {test.status}
            </p>
          </div>

          {/* Dòng 4: Hai nút hành động: "Thi thử" và "Luyện tập" */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onSelectMode(test, "exam")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-slate-600" />
              Thi thử
            </button>

            <button
              type="button"
              onClick={() => onSelectMode(test, "practice")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Luyện tập
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
