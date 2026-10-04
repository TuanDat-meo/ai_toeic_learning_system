"use client";

import React from "react";
import { ExerciseCardData } from "../types";
import { X } from "lucide-react";

interface ReadingCreateCardModalProps {
  editingCard: ExerciseCardData | null;
  cardFormTitle: string;
  setCardFormTitle: (val: string) => void;
  cardFormCategory: "grammar" | "part5" | "part6" | "part7";
  setCardFormCategory: (val: "grammar" | "part5" | "part6" | "part7") => void;
  cardFormSubCategory: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types";
  setCardFormSubCategory: (val: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types") => void;
  cardFormTag: string;
  setCardFormTag: (val: string) => void;
  cardFormTotalQuestions: number;
  setCardFormTotalQuestions: (val: number) => void;
  cardFormTheorySummary: string;
  setCardFormTheorySummary: (val: string) => void;
  cardFormTheoryRules: string;
  setCardFormTheoryRules: (val: string) => void;
  cardFormTheoryExample: string;
  setCardFormTheoryExample: (val: string) => void;
  onSaveCard: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ReadingCreateCardModal: React.FC<ReadingCreateCardModalProps> = ({
  editingCard,
  cardFormTitle,
  setCardFormTitle,
  cardFormCategory,
  setCardFormCategory,
  cardFormSubCategory,
  setCardFormSubCategory,
  cardFormTag,
  setCardFormTag,
  cardFormTotalQuestions,
  setCardFormTotalQuestions,
  cardFormTheorySummary,
  setCardFormTheorySummary,
  cardFormTheoryRules,
  setCardFormTheoryRules,
  cardFormTheoryExample,
  setCardFormTheoryExample,
  onSaveCard,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reading Content</span>
            <h3 className="text-lg font-bold text-slate-900">
              {editingCard ? "Chỉnh sửa chủ điểm đọc" : "Thêm chủ điểm đọc mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSaveCard} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ điểm đọc *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Đại từ & Tính từ sở hữu"
              value={cardFormTitle}
              onChange={(e) => setCardFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi (Phân loại)</label>
              <select
                value={cardFormCategory}
                onChange={(e) => setCardFormCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="grammar">Ngữ pháp</option>
                <option value="part5">Part 5</option>
                <option value="part6">Part 6</option>
                <option value="part7">Part 7</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số câu hỏi</label>
              <input
                type="number"
                min={1}
                value={cardFormTotalQuestions}
                onChange={(e) => setCardFormTotalQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhóm con</label>
              <select
                value={cardFormSubCategory}
                onChange={(e) => setCardFormSubCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="word_types">Từ loại</option>
                <option value="verbs">Động từ</option>
                <option value="other_grammar">Ngữ pháp khác</option>
                <option value="levels">Theo cấp độ</option>
                <option value="by_topic">Theo chủ điểm</option>
                <option value="text_types">Theo dạng văn bản</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thẻ ghi chú (Tag)</label>
              <input
                type="text"
                placeholder="Ví dụ: Cùng gốc, khác hậu tố"
                value={cardFormTag}
                onChange={(e) => setCardFormTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt lý thuyết</label>
            <textarea
              rows={2}
              placeholder="Kiến thức nền tảng cần ghi nhớ..."
              value={cardFormTheorySummary}
              onChange={(e) => setCardFormTheorySummary(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quy tắc & Dấu hiệu (Mỗi dòng 1 quy tắc)</label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Adj + Noun&#10;To be + Adj"
              value={cardFormTheoryRules}
              onChange={(e) => setCardFormTheoryRules(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ví dụ minh họa</label>
            <input
              type="text"
              placeholder="Ví dụ: Production of the garments will begin soon."
              value={cardFormTheoryExample}
              onChange={(e) => setCardFormTheoryExample(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {editingCard ? "Lưu thay đổi" : "Tạo chủ điểm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
