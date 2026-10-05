"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests-content/types";
import { Trash2 } from "lucide-react";

interface MockTestDeleteModalProps {
  test: TestItem;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const MockTestDeleteModal: React.FC<MockTestDeleteModalProps> = ({
  test,
  onClose,
  onConfirmDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Xóa đề thi này?</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn đề <strong className="text-slate-900">&quot;{test.title}&quot;</strong> khỏi {test.volId === "vol1" ? "Crack TOEIC Vol 1" : "Crack TOEIC Vol 2"}? Toàn bộ lịch sử làm bài và câu hỏi của đề này sẽ bị xóa.
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
