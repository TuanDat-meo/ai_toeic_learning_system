"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { QuestionItem } from "@/app/admin/content/questions/types";

interface QuestionDeleteModalProps {
  deleteConfirmQuestion: QuestionItem | null;
  bulkDeleteConfirm: boolean;
  selectedCount: number;
  onCloseSingle: () => void;
  onConfirmSingle: () => void;
  onCloseBulk: () => void;
  onConfirmBulk: () => void;
}

export const QuestionDeleteModal: React.FC<QuestionDeleteModalProps> = ({
  deleteConfirmQuestion,
  bulkDeleteConfirm,
  selectedCount,
  onCloseSingle,
  onConfirmSingle,
  onCloseBulk,
  onConfirmBulk,
}) => {
  return (
    <>
      {/* ================= MODAL XÁC NHẬN XÓA 1 CÂU HỎI ================= */}
      {deleteConfirmQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa câu hỏi?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc muốn xóa câu hỏi{" "}
                <strong className="text-slate-900 font-bold">
                  {deleteConfirmQuestion.code || deleteConfirmQuestion.id}
                </strong>{" "}
                khỏi ngân hàng không? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onCloseSingle}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmSingle}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XÁC NHẬN XÓA HÀNG LOẠT ================= */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Xóa các câu hỏi đã chọn?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn xóa{" "}
                <strong className="text-slate-900 font-bold">{selectedCount}</strong> câu hỏi đã chọn
                khỏi hệ thống?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onCloseBulk}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmBulk}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Xóa tất cả đã chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
