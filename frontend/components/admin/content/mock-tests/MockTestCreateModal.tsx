"use client";

import React, { useState } from "react";
import { TestItem } from "@/app/admin/content/mock-tests/types";
import { X, ClipboardCheck, Clock, HelpCircle, AlertCircle, Sparkles } from "lucide-react";

interface MockTestCreateModalProps {
  editingTest: TestItem | null;
  testFormTitle: string;
  setTestFormTitle: (val: string) => void;
  testFormVolId: "vol1" | "vol2" | "vol3";
  setTestFormVolId: (val: "vol1" | "vol2" | "vol3") => void;
  testFormDifficulty: "Khó" | "Trung bình" | "Vừa sức";
  setTestFormDifficulty: (val: "Khó" | "Trung bình" | "Vừa sức") => void;
  testFormDescription: string;
  setTestFormDescription: (val: string) => void;
  testFormYear: number;
  setTestFormYear: (val: number) => void;
  testFormDuration: number;
  setTestFormDuration: (val: number) => void;
  testFormTotalQuestions: number;
  setTestFormTotalQuestions: (val: number) => void;
  testFormStatus?: string;
  setTestFormStatus?: (val: string) => void;
  onSaveTest: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const MockTestCreateModal: React.FC<MockTestCreateModalProps> = ({
  editingTest,
  testFormTitle,
  setTestFormTitle,
  testFormVolId,
  setTestFormVolId,
  testFormDifficulty,
  setTestFormDifficulty,
  testFormDescription,
  setTestFormDescription,
  testFormYear,
  setTestFormYear,
  testFormDuration,
  setTestFormDuration,
  testFormTotalQuestions,
  setTestFormTotalQuestions,
  testFormStatus = "PUBLISHED",
  setTestFormStatus,
  onSaveTest,
  onClose,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFormTitle.trim()) {
      setErrorMessage("Vui lòng nhập tên đề thi thử (không được để trống).");
      return;
    }
    if (testFormTitle.trim().length < 3) {
      setErrorMessage("Tên đề thi phải có ít nhất 3 ký tự rõ ràng.");
      return;
    }
    if (!testFormDescription.trim()) {
      setErrorMessage("Vui lòng nhập mô tả / hướng dẫn cho đề thi này.");
      return;
    }
    setErrorMessage(null);
    onSaveTest(e);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                Quản lý đề thi thử
              </span>
              <span className="text-[11px] font-bold text-slate-400">ETS Format</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 mt-1">
              {editingTest ? "Chỉnh sửa thông tin đề thi thử" : "Tạo mới đề thi thử TOEIC chuẩn"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Phần 1: Tên đề thi & Bộ đề */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>1. Thông tin định danh đề thi</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tên đề thi thử <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: ETS 2024 Test 5 – Đề thi Full 7 Parts"
                value={testFormTitle}
                onChange={(e) => {
                  setTestFormTitle(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden transition bg-white ${
                  !testFormTitle.trim() && errorMessage
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Nhập tên rõ ràng để học viên dễ nhận biết (gồm tên kỳ thi, năm và số thứ tự test).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Bộ đề (Volume)</label>
                <select
                  value={testFormVolId}
                  onChange={(e) => setTestFormVolId(e.target.value as "vol1" | "vol2" | "vol3")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="vol1">Crack TOEIC Vol 1 (ETS 2024)</option>
                  <option value="vol2">Crack TOEIC Vol 2 (ETS 2023)</option>
                  <option value="vol3">Crack TOEIC Vol 3 (ETS 2022)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Năm đề thi</label>
                <select
                  value={testFormYear}
                  onChange={(e) => setTestFormYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value={2026}>Năm 2026 (Mới nhất)</option>
                  <option value={2024}>Năm 2024</option>
                  <option value={2023}>Năm 2023</option>
                  <option value={2022}>Năm 2022</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mức độ khó</label>
                <select
                  value={testFormDifficulty}
                  onChange={(e) => setTestFormDifficulty(e.target.value as "Khó" | "Trung bình" | "Vừa sức")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="Vừa sức">Vừa sức (Mục tiêu 450 - 600)</option>
                  <option value="Trung bình">Trung bình (Mục tiêu 600 - 750)</option>
                  <option value="Khó">Khó (Mục tiêu 750 - 990)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <label className="block text-slate-700 font-bold mb-1.5">Trạng thái phát hành</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestFormStatus?.("PUBLISHED")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    (testFormStatus || "PUBLISHED") === "PUBLISHED"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-100"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>✓ Xuất bản ngay (Học viên thấy)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestFormStatus?.("DRAFT")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    testFormStatus === "DRAFT"
                      ? "bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-100"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>⏱️ Bản nháp (Chỉ Admin)</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {(testFormStatus || "PUBLISHED") === "PUBLISHED"
                  ? "Học viên sẽ nhìn thấy và làm bài thi này ngay trên trang Luyện thi thử."
                  : "Chỉ Admin nhìn thấy đề thi này. Học viên sẽ không thấy cho đến khi Admin xuất bản."}
              </p>
            </div>
          </div>

          {/* Phần 2: Cấu trúc & Quy mô */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>2. Thời gian &amp; Quy mô câu hỏi</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Thời gian làm bài (Phút) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={testFormDuration}
                  onChange={(e) => setTestFormDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                />
                <span className="text-[10px] text-slate-400">Chuẩn thi TOEIC quốc tế: 120 phút</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tổng số câu hỏi <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={testFormTotalQuestions}
                  onChange={(e) => setTestFormTotalQuestions(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                />
                <span className="text-[10px] text-slate-400">Đầy đủ 7 Part: 200 câu hỏi</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mô tả đề thi &amp; Hướng dẫn thí sinh <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Đề thi thử đầy đủ 200 câu hỏi gồm 100 câu Listening (Part 1-4: 45 phút) và 100 câu Reading (Part 5-7: 75 phút). Thí sinh không được tạm dừng khi vào phòng thi."
                value={testFormDescription}
                onChange={(e) => {
                  setTestFormDescription(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden transition bg-white resize-none ${
                  !testFormDescription.trim() && errorMessage
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>
          </div>

          {/* Nút hành động */}
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
                <span>{editingTest ? "Lưu thay đổi" : "Tạo đề thi"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
