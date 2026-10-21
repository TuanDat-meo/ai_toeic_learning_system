"use client";

import React from "react";
import { Check, X, ShoppingBag, FileText, RotateCcw, Trash2 } from "lucide-react";
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
  actionLabel = "Học ngay",
  className = "",
  savedCount: initialSavedCount,
  secondaryAction,
}) => {
  const progress: ItemProgress = useItemProgress(progressKey, totalQuestions);

  const total = totalQuestions || progress.totalQuestions || 10;
  const wrong = progress.wrongAnswers || 0;
  let correct = progress.correctAnswers !== undefined ? progress.correctAnswers : 0;
  let completed = progress.completedQuestions || 0;

  if (completed > 0 && correct === 0 && wrong === 0) {
    correct = completed;
  } else if (completed > correct + wrong) {
    correct = completed - wrong;
  } else {
    completed = correct + wrong;
  }
  completed = Math.min(total, completed);
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
      alert("Bạn hiện chưa có câu sai nào trong bài này! Bạn có thể bấm 'Học ngay' để tiếp tục làm bài.");
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
      {/* Hàng 1: Thống kê số câu đã làm / tổng, số câu đúng, số câu sai (Cỡ chữ ĐỒNG ĐỀU NHAU hoàn toàn theo Ảnh 2) */}
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
          {/* Khung viên thuốc tròn (Ảnh người dùng) */}
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

              {/* 2. Tài liệu / Lý thuyết */}
              <button
                type="button"
                onClick={handleTheory}
                className="text-slate-300 hover:text-slate-600 transition cursor-pointer p-0.5 active:scale-90"
                title="Lý thuyết / Tài liệu"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* 3. Redo câu sai (Mũi tên quay ngược màu đỏ có badge đỏ) */}
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

              {/* 4. Thùng rác xóa / đặt lại tiến độ */}
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

          {/* Hai nút Luyện tập và Thi thử nằm ở DƯỚI khung viên thuốc */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-2 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              {actionLabel}
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
      ) : (
        /* Khi chỉ có 1 nút duy nhất: cùng hàng với khung viên thuốc */
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

            {/* 2. Tài liệu / Lý thuyết */}
            <button
              type="button"
              onClick={handleTheory}
              className="text-slate-300 hover:text-slate-600 transition cursor-pointer p-0.5 active:scale-90"
              title="Lý thuyết / Tài liệu"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* 3. Redo câu sai (Mũi tên quay ngược màu đỏ có badge đỏ) */}
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

            {/* 4. Thùng rác xóa / đặt lại tiến độ */}
            <button
              type="button"
              onClick={handleReset}
              className="text-red-500 hover:text-red-600 transition cursor-pointer p-0.5 active:scale-90"
              title="Đặt lại tiến độ bài này về 0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Nút hành động đơn */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center shrink-0"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
