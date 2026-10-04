"use client";

import React from "react";
import { ExerciseCardData } from "../types";
import { Trash2, RotateCcw } from "lucide-react";

interface ReadingDeleteCardModalProps {
  card: ExerciseCardData;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const ReadingDeleteCardModal: React.FC<ReadingDeleteCardModalProps> = ({
  card,
  onClose,
  onConfirmDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Xóa chủ điểm này?</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn chủ điểm đọc <strong className="text-slate-900">&quot;{card.title}&quot;</strong>? Toàn bộ bài tập và dữ liệu ôn luyện của thẻ này sẽ bị xóa.
          </p>
        </div>
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Xóa ngay
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReadingResetModalProps {
  card: ExerciseCardData;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ReadingResetModal: React.FC<ReadingResetModalProps> = ({
  card,
  onClose,
  onConfirmReset,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
          <RotateCcw className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Đặt lại tiến độ học?</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Đặt lại số câu đã làm, số câu đúng/sai của chủ điểm <strong className="text-slate-900">&quot;{card.title}&quot;</strong> về 0?
          </p>
        </div>
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};
