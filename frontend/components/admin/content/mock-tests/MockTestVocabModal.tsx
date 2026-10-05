"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests/types";
import { X, Languages, Bookmark } from "lucide-react";

interface MockTestVocabModalProps {
  test: TestItem;
  savedVocabBag: string[];
  onToggleSaveVocab: (word: string) => void;
  onClose: () => void;
}

export const MockTestVocabModal: React.FC<MockTestVocabModalProps> = ({
  test,
  savedVocabBag,
  onToggleSaveVocab,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Sổ từ vựng trọng tâm: {test.title}
              </h3>
              <p className="text-xs text-indigo-100">Các từ vựng cốt lõi thường xuất hiện trong đề này</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {test.keyVocab.map((item, idx) => {
            const isSaved = savedVocabBag.includes(item.word);

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{item.word}</span>
                    <span className="text-xs font-mono text-indigo-600 font-semibold">{item.ipa}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                      {item.pos}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{item.meaning}</p>
                  <p className="text-xs italic text-slate-500 font-sans">Ví dụ: &quot;{item.example}&quot;</p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSaveVocab(item.word)}
                  title="Lưu vào giỏ từ vựng"
                  className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                    isSaved
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-600" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
