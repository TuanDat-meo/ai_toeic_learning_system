"use client";

import React from "react";
import { ExerciseCardData } from "@/app/admin/content/reading-content/types";
import { Pencil, Trash2, Bookmark, FileText, RotateCcw } from "lucide-react";

interface ReadingCardGridProps {
  cards: ExerciseCardData[];
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenReviewWrong: (card: ExerciseCardData) => void;
  onOpenResetConfirm: (card: ExerciseCardData) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
  showToast: (msg: string) => void;
}

export const ReadingCardGrid: React.FC<ReadingCardGridProps> = ({
  cards,
  onStartPractice,
  onOpenTheory,
  onOpenReviewWrong,
  onOpenResetConfirm,
  onToggleBookmark,
  onOpenEditCard,
  onOpenDeleteConfirm,
  showToast,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {cards.map((card) => {
        const isUnstudied = card.studiedQuestions === 0;

        return (
          <div
            key={card.id}
            className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-400/80 transition-all duration-200 flex flex-col justify-between min-h-[145px]"
          >
            <div className="absolute top-0 left-6 right-6 h-0.5 bg-blue-500 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                  {card.title}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  {card.bookmarked && (
                    <span className="text-amber-500 text-xs flex items-center gap-0.5 font-semibold mr-1">
                      ★ Đã lưu
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => onOpenEditCard(card, e)}
                    className="w-6 h-6 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Sửa chủ điểm đọc"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDeleteConfirm(card);
                    }}
                    className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Xóa chủ điểm đọc"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {card.tag && (
                <div className="mt-1">
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md inline-block">
                    {card.tag}
                  </span>
                </div>
              )}

              <div className="mt-2 text-xs">
                {isUnstudied ? (
                  <span className="font-medium text-slate-500">
                    Chưa luyện tập · {card.totalQuestions} câu
                  </span>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-emerald-600 text-sm">
                      {card.studiedQuestions} / {card.totalQuestions}
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                      ✓ {card.correctAnswers}
                    </span>
                    <span className="font-semibold text-rose-500 flex items-center gap-0.5">
                      ✕ {card.wrongAnswers}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => onToggleBookmark(card.id, e)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    card.bookmarked
                      ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                  title={card.bookmarked ? "Bỏ lưu chủ điểm" : "Lưu chủ điểm này"}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${card.bookmarked ? "fill-amber-500" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTheory(card);
                  }}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Xem tóm tắt lý thuyết & mẹo thi"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.wrongAnswers > 0) {
                        onOpenReviewWrong(card);
                      } else {
                        showToast(`Chủ điểm "${card.title}" chưa có câu sai nào cần ôn lại! 👍`);
                      }
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      card.wrongAnswers > 0
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Luyện tập lại các câu sai"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  {card.wrongAnswers > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs pointer-events-none">
                      {card.wrongAnswers}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenResetConfirm(card);
                  }}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Đặt lại tiến độ chủ điểm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onStartPractice(card)}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Học ngay
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
