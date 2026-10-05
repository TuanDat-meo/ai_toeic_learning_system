"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests-content/types";
import { X, History, Trash2, AlertCircle } from "lucide-react";

interface MockTestHistoryModalProps {
  test: TestItem;
  onClose: () => void;
  onClearHistory: (testId: number) => void;
}

export const MockTestHistoryModal: React.FC<MockTestHistoryModalProps> = ({
  test,
  onClose,
  onClearHistory,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Lịch sử làm bài</h3>
              <p className="text-xs font-semibold text-slate-500">{test.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {test.historyAttempts.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-500">Chưa có lượt thi nào cho đề này.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {test.historyAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-slate-400 font-bold">{attempt.date}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    Thời lượng: <span className="text-blue-600">{attempt.duration}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Đúng {attempt.correctCount}/{attempt.totalCount} câu (Listening: {attempt.listening}, Reading: {attempt.reading})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-amber-600">{attempt.score}</span>
                  <span className="text-xs font-bold text-slate-400">/990</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {test.historyAttempts.length > 0 && (
            <button
              type="button"
              onClick={() => onClearHistory(test.id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Xóa lịch sử bài này
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
