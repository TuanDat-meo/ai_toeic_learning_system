"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests-content/types";
import { X } from "lucide-react";

interface MockTestCreateModalProps {
  editingTest: TestItem | null;
  testFormTitle: string;
  setTestFormTitle: (val: string) => void;
  testFormVolId: "vol1" | "vol2";
  setTestFormVolId: (val: "vol1" | "vol2") => void;
  testFormDifficulty: "Khó" | "Trung bình" | "Vừa sức";
  setTestFormDifficulty: (val: "Khó" | "Trung bình" | "Vừa sức") => void;
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
  onSaveTest,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quản lý đề thi</span>
            <h3 className="text-lg font-bold text-slate-900">
              {editingTest ? "Chỉnh sửa thông tin đề thi" : "Thêm đề thi thử mới"}
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

        <form onSubmit={onSaveTest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên đề thi *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Test 11"
              value={testFormTitle}
              onChange={(e) => setTestFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bộ đề (Volume)</label>
              <select
                value={testFormVolId}
                onChange={(e) => setTestFormVolId(e.target.value as "vol1" | "vol2")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="vol1">Crack TOEIC Vol 1</option>
                <option value="vol2">Crack TOEIC Vol 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ khó</label>
              <select
                value={testFormDifficulty}
                onChange={(e) => setTestFormDifficulty(e.target.value as "Khó" | "Trung bình" | "Vừa sức")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="Vừa sức">Vừa sức</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Khó">Khó</option>
              </select>
            </div>
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
              {editingTest ? "Lưu thay đổi" : "Tạo đề thi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
