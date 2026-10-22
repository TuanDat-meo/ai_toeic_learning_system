"use client";

import React, { useState } from "react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import { X, BookOpen, AlertCircle, Sparkles } from "lucide-react";

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) {
      setErrorMsg("Vui lòng nhập tên chủ điểm đọc (không được để trống).");
      return;
    }
    if (cardFormTitle.trim().length < 3) {
      setErrorMsg("Tên chủ điểm đọc phải có ít nhất 3 ký tự.");
      return;
    }
    if (!cardFormTheorySummary.trim()) {
      setErrorMsg("Vui lòng nhập tóm tắt lý thuyết để hướng dẫn học viên khi làm bài.");
      return;
    }
    setErrorMsg(null);
    onSaveCard(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                Reading Master
              </span>
              <span className="text-[11px] font-bold text-slate-400">Part 5, 6, 7</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {editingCard ? "Chỉnh sửa chủ điểm đọc" : "Thêm chủ điểm đọc hiểu mới"}
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

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Thông tin chủ điểm */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>1. Thông tin chủ điểm</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tên chủ điểm đọc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Đại từ & Tính từ sở hữu nâng cao"
                value={cardFormTitle}
                onChange={(e) => {
                  setCardFormTitle(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden transition bg-white ${
                  !cardFormTitle.trim() && errorMsg
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Phần thi (Phân loại)</label>
                <select
                  value={cardFormCategory}
                  onChange={(e) => setCardFormCategory(e.target.value as "grammar" | "part5" | "part6" | "part7")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="grammar">Ngữ pháp đọc (Grammar)</option>
                  <option value="part5">Part 5 (Điền câu đơn)</option>
                  <option value="part6">Part 6 (Điền đoạn văn)</option>
                  <option value="part7">Part 7 (Đọc hiểu văn bản)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nhóm con</label>
                <select
                  value={cardFormSubCategory}
                  onChange={(e) => setCardFormSubCategory(e.target.value as "word_types" | "verbs" | "other_grammar" | "levels" | "by_topic" | "text_types")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="word_types">Từ loại (Word Types)</option>
                  <option value="verbs">Thì &amp; Động từ (Verbs)</option>
                  <option value="other_grammar">Ngữ pháp khác</option>
                  <option value="levels">Theo cấp độ (Levels)</option>
                  <option value="by_topic">Theo chủ đề thực tế</option>
                  <option value="text_types">Theo dạng văn bản TOEIC</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Số câu bài tập</label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={cardFormTotalQuestions}
                  onChange={(e) => setCardFormTotalQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Thẻ ghi chú (Tag nhận diện)</label>
              <input
                type="text"
                placeholder="Ví dụ: Cùng gốc, khác hậu tố | Bẫy thường gặp"
                value={cardFormTag}
                onChange={(e) => setCardFormTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Lý thuyết & Mẹo làm bài */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>2. Lý thuyết kỹ năng &amp; Mẹo thi</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tóm tắt lý thuyết cốt lõi <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Tính từ sở hữu luôn đứng trước danh từ để bổ nghĩa..."
                value={cardFormTheorySummary}
                onChange={(e) => {
                  setCardFormTheorySummary(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-hidden transition bg-white resize-none ${
                  !cardFormTheorySummary.trim() && errorMsg
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quy tắc &amp; Dấu hiệu nhận biết (Mỗi dòng 1 quy tắc)</label>
              <textarea
                rows={3}
                placeholder="Ví dụ:&#10;Quy tắc 1: Sau mạo từ (a/an/the) nếu có khoảng trống trước Noun thì điền Adj.&#10;Quy tắc 2: Không nhầm lẫn giữa Tính từ đuôi -ive và Danh từ đuôi -ive."
                value={cardFormTheoryRules}
                onChange={(e) => setCardFormTheoryRules(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Ví dụ minh họa thực tế trong bài thi</label>
              <input
                type="text"
                placeholder="Ví dụ: Mr. Park submitted his comprehensive report on time."
                value={cardFormTheoryExample}
                onChange={(e) => setCardFormTheoryExample(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              <span className="text-red-500 font-bold">*</span> Bắt buộc nhập đầy đủ dữ liệu
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{editingCard ? "Lưu thay đổi" : "Tạo chuyên đề"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
