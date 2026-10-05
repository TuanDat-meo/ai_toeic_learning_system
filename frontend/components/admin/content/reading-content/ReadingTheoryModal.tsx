"use client";

import React from "react";
import { ExerciseCardData } from "@/app/admin/content/reading-content/types";
import { X } from "lucide-react";

interface ReadingTheoryModalProps {
  card: ExerciseCardData;
  onClose: () => void;
  onStartPractice: (card: ExerciseCardData) => void;
}

export const ReadingTheoryModal: React.FC<ReadingTheoryModalProps> = ({
  card,
  onClose,
  onStartPractice,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150 font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Lý thuyết cốt lõi TOEIC
          </span>
          <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
        </div>

        {card.theory ? (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-blue-900 font-medium">
              {card.theory.summary}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quy tắc & Dấu hiệu nhận biết:
              </h4>
              <ul className="space-y-1.5">
                {card.theory.rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Ví dụ minh họa:
              </span>
              <p className="font-mono text-xs text-slate-800 italic">
                &quot;{card.theory.example}&quot;
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Chủ điểm này đang tổng hợp thêm tài liệu ngữ pháp mở rộng.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartPractice(card);
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Vào học ngay
          </button>
        </div>
      </div>
    </div>
  );
};
