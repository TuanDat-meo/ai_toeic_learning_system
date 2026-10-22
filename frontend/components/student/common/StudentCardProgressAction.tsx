"use client";

import React from "react";
import { Check, X, ShoppingBag, FileText, RotateCcw, Trash2, BookOpen, Play } from "lucide-react";
import { useItemProgress, resetItemProgress, ItemProgress } from "@/lib/practiceProgress";

export interface StudentCardProgressActionProps {
  progressKey: string;
  totalQuestions: number;
  onStart: (startIndex?: number) => void;
  onRedoWrong?: () => void;
  onOpenTheory?: () => void;
  onOpenSaved?: () => void;
  actionLabel?: string;
  className?: string;
  savedCount?: number;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
  };
}

export const StudentCardProgressAction: React.FC<StudentCardProgressActionProps> = ({
  progressKey,
  totalQuestions,
  onStart,
  onRedoWrong,
  onOpenTheory,
  onOpenSaved,
  actionLabel = "Luyện tập",
  className = "",
  savedCount: initialSavedCount,
  secondaryAction,
}) => {
  const progress: ItemProgress = useItemProgress(progressKey, totalQuestions);

  const total = totalQuestions || progress.totalQuestions || 10;
  const wrong = progress.wrongAnswers !== undefined ? progress.wrongAnswers : (progress.wrongQuestionIds?.length || 0);
  const correct = progress.correctAnswers !== undefined ? progress.correctAnswers : 0;
  let completed = progress.completedQuestions || 0;
  completed = Math.min(total, Math.max(completed, correct + wrong));
  const savedCount = initialSavedCount !== undefined ? initialSavedCount : progress.savedCount || 0;

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Bắt đầu từ câu tiếp theo (nếu làm được 5/30 thì mở câu số 6 (index 5))
    const nextQuestionIndex = completed < total ? completed : 0;
    onStart(nextQuestionIndex);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn đặt lại tiến độ của bài học này về 0?")) {
      resetItemProgress(progressKey, total);
    }
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wrong === 0) {
      alert("Bạn hiện chưa có câu sai nào trong bài này! Bạn có thể bấm nút Luyện tập để tiếp tục làm bài.");
      return;
    }
    if (onRedoWrong) {
      onRedoWrong();
    } else {
      onStart(0);
    }
  };

  const handleTheory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenTheory) onOpenTheory();
  };

  const handleSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSaved) onOpenSaved();
    else alert(`Đã lưu ${savedCount} mục vào giỏ từ vựng/câu hỏi cá nhân.`);
  };

  return (
    <div className={`space-y-2.5 pt-2 ${className}`}>
      {/* Hàng 1: Thống kê số câu đã làm / tổng, số câu đúng (xanh lá), số câu sai (đỏ) */}
      <div className="flex items-center gap-3 select-none text-sm font-extrabold leading-none">
        <span className="text-emerald-700">
          {completed}/{total}
        </span>
        <span className="text-emerald-600 inline-flex items-center gap-1">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{correct}</span>
        </span>
        <span className="text-red-500 inline-flex items-center gap-1">
          <X className="w-3.5 h-3.5 stroke-[3]" />
          <span>{wrong}</span>
        </span>
      </div>

      {/* Khung điều khiển & nút hành động */}
      {secondaryAction ? (
        <div className="space-y-2">
          {/* Khung viên thuốc tròn */}
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs">
              {/* 1. Giỏ hàng / Đã lưu có badge tròn màu cam */}
              <button
                type="button"
                onClick={handleSaved}
                className="relative text-blue-600 hover:text-blue-700 transition cursor-pointer p-0.5 active:scale-90"
                title="Mục đã lưu / Giỏ từ vựng"
              >
                <ShoppingBag className="w-4 h-4" />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {savedCount}
                  </span>
                )}
              </button>

              {/* 2. Redo câu sai (Mũi tên quay ngược màu đỏ có badge đỏ) */}
              <button
                type="button"
                onClick={handleRedo}
                className={`relative transition cursor-pointer p-0.5 active:scale-90 ${
                  wrong > 0 ? "text-red-500 hover:text-red-600" : "text-slate-300 hover:text-slate-400"
                }`}
                title={wrong > 0 ? `Làm lại ${wrong} câu đã sai (Làm đúng sẽ giảm dần)` : "Chưa có câu sai"}
              >
                <RotateCcw className="w-4 h-4" />
                {wrong > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
                    {wrong}
                  </span>
                )}
              </button>

              {/* 3. Thùng rác xóa / đặt lại tiến độ */}
              <button
                type="button"
                onClick={handleReset}
                className="text-red-500 hover:text-red-600 transition cursor-pointer p-0.5 active:scale-90"
                title="Đặt lại tiến độ bài này về 0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hai nút hành động ở dưới căn đều 2 bên */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-2 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{actionLabel}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                secondaryAction.onClick();
              }}
              className="w-full py-2 px-3 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          </div>
        </div>
      ) : onOpenTheory ? (
        <div className="space-y-2">
          {/* Khung viên thuốc tròn */}
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs">
              {/* 1. Giỏ hàng / Đã lưu có badge tròn màu cam */}
              <button
                type="button"
                onClick={handleSaved}
                className="relative text-blue-600 hover:text-blue-700 transition cursor-pointer p-0.5 active:scale-90"
                title="Mục đã lưu / Giỏ từ vựng"
              >
                <ShoppingBag className="w-4 h-4" />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {savedCount}
                  </span>
                )}
              </button>

              {/* 2. Redo câu sai (Mũi tên quay ngược màu đỏ có badge đỏ) */}
              <button
                type="button"
                onClick={handleRedo}
                className={`relative transition cursor-pointer p-0.5 active:scale-90 ${
                  wrong > 0 ? "text-red-500 hover:text-red-600" : "text-slate-300 hover:text-slate-400"
                }`}
                title={wrong > 0 ? `Làm lại ${wrong} câu đã sai (Làm đúng sẽ giảm dần)` : "Chưa có câu sai"}
              >
                <RotateCcw className="w-4 h-4" />
                {wrong > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
                    {wrong}
                  </span>
                )}
              </button>

              {/* 3. Thùng rác xóa / đặt lại tiến độ */}
              <button
                type="button"
                onClick={handleReset}
                className="text-red-500 hover:text-red-600 transition cursor-pointer p-0.5 active:scale-90"
                title="Đặt lại tiến độ bài này về 0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cụm 2 nút: Lý thuyết (trái) & Luyện tập/Luyện nghe (phải) căn đều ra hai bên */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            <button
              type="button"
              onClick={handleTheory}
              className="w-full py-2 px-3 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              title="Xem lý thuyết chuyên đề"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Lý thuyết</span>
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="w-full py-2 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              title="Bắt đầu luyện tập"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{actionLabel}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Chỉ có 1 nút: Khung viên thuốc tròn bên trái + Nút hành động bên phải */
        <div className="flex items-center justify-between gap-2">
          {/* Khung viên thuốc tròn (Pill Container) */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 shadow-2xs">
            {/* 1. Giỏ hàng / Đã lưu có badge tròn màu cam */}
            <button
              type="button"
              onClick={handleSaved}
              className="relative text-blue-600 hover:text-blue-700 transition cursor-pointer p-0.5 active:scale-90"
              title="Mục đã lưu / Giỏ từ vựng"
            >
              <ShoppingBag className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* 2. Redo câu sai (Mũi tên quay ngược màu đỏ có badge đỏ) */}
            <button
              type="button"
              onClick={handleRedo}
              className={`relative transition cursor-pointer p-0.5 active:scale-90 ${
                wrong > 0 ? "text-red-500 hover:text-red-600" : "text-slate-300 hover:text-slate-400"
              }`}
              title={wrong > 0 ? `Làm lại ${wrong} câu đã sai (Làm đúng sẽ giảm dần)` : "Chưa có câu sai"}
            >
              <RotateCcw className="w-4 h-4" />
              {wrong > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
                  {wrong}
                </span>
              )}
            </button>

            {/* 3. Thùng rác xóa / đặt lại tiến độ */}
            <button
              type="button"
              onClick={handleReset}
              className="text-red-500 hover:text-red-600 transition cursor-pointer p-0.5 active:scale-90"
              title="Đặt lại tiến độ bài này về 0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            title="Bắt đầu luyện tập"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
