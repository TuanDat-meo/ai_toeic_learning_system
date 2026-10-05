"use client";

import React, { useState } from "react";
import { TestItem, PracticeQuestion } from "@/app/admin/content/mock-tests-content/types";
import { X, FileText, Search } from "lucide-react";

interface MockTestTranscriptModalProps {
  test: TestItem;
  questions: PracticeQuestion[];
  onClose: () => void;
}

export const MockTestTranscriptModal: React.FC<MockTestTranscriptModalProps> = ({
  test,
  questions,
  onClose,
}) => {
  const [transcriptSearch, setTranscriptSearch] = useState("");

  const filteredQuestions = questions.filter((q) => {
    if (!transcriptSearch.trim()) return true;
    const query = transcriptSearch.toLowerCase();
    return (
      q.questionText.toLowerCase().includes(query) ||
      (q.transcript && q.transcript.toLowerCase().includes(query)) ||
      (q.translation && q.translation.toLowerCase().includes(query)) ||
      (q.explanation && q.explanation.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Đáp án & Lời thoại (Transcript): {test.title}
              </h3>
              <p className="text-xs text-slate-400">Tra cứu nhanh đáp án và dịch nghĩa chi tiết</p>
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

        {/* Ô tìm kiếm transcript */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo nội dung câu hỏi, từ khóa transcript, đáp án..."
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Câu {q.id} ({q.part})
                </span>
                <span className="font-black text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Đáp án đúng: {q.correctAnswer}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-900">{q.questionText}</p>

              {q.transcript && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <p className="font-bold text-slate-800">Transcript:</p>
                  <p className="italic text-slate-700">{q.transcript}</p>
                  <p className="text-slate-500 pt-1 border-t border-slate-100">{q.translation}</p>
                </div>
              )}

              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800">Giải thích AI:</span> {q.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
