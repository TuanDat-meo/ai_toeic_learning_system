"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { GrammarQuestionItem, GrammarTopicItem } from "../types";

interface GrammarAddQuestionModalProps {
  isOpen: boolean;
  topic: GrammarTopicItem | null;
  onClose: () => void;
  onAddQuestion: (topicId: string, question: GrammarQuestionItem) => void;
}

export const GrammarAddQuestionModal: React.FC<GrammarAddQuestionModalProps> = ({
  isOpen,
  topic,
  onClose,
  onAddQuestion,
}) => {
  const [qText, setQText] = useState("");
  const [qPart, setQPart] = useState("Part 5");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qCorrect, setQCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [qExplanation, setQExplanation] = useState("");
  const [qTrap, setQTrap] = useState("");
  const [qTranslation, setQTranslation] = useState("");

  if (!isOpen || !topic) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion: GrammarQuestionItem = {
      id: `q-${Date.now()}`,
      part: qPart,
      questionText: qText,
      options: {
        A: qOptA,
        B: qOptB,
        C: qOptC,
        D: qOptD,
      },
      correctAnswer: qCorrect,
      explanation: qExplanation,
      trapNote: qTrap || undefined,
      translation: qTranslation || undefined,
      difficulty: topic.targetScore,
    };

    onAddQuestion(topic.id, newQuestion);
    setQText("");
    setQOptA("");
    setQOptB("");
    setQOptC("");
    setQOptD("");
    setQExplanation("");
    setQTrap("");
    setQTranslation("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Thêm Câu Hỏi Cho: <span className="text-blue-600">{topic.title}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Nội dung câu hỏi (chỗ trống _______) *</label>
            <textarea
              required
              rows={2}
              placeholder="Ms. Emily _______ this regional branch..."
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án A *</label>
              <input
                type="text"
                required
                value={qOptA}
                onChange={(e) => setQOptA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án B *</label>
              <input
                type="text"
                required
                value={qOptB}
                onChange={(e) => setQOptB(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án C *</label>
              <input
                type="text"
                required
                value={qOptC}
                onChange={(e) => setQOptC(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án D *</label>
              <input
                type="text"
                required
                value={qOptD}
                onChange={(e) => setQOptD(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Đáp án chính xác *</label>
            <div className="flex gap-3">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    qCorrect === opt
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="qCorrect"
                    value={opt}
                    checked={qCorrect === opt}
                    onChange={() => setQCorrect(opt)}
                    className="hidden"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Lời giải thích chi tiết *</label>
            <textarea
              required
              rows={2}
              placeholder="Dấu hiệu nhận biết 'for over five years'..."
              value={qExplanation}
              onChange={(e) => setQExplanation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Lưu ý bẫy đề thi TOEIC</label>
            <input
              type="text"
              placeholder="Bẫy nhầm lẫn với Hiện Tại Đơn..."
              value={qTrap}
              onChange={(e) => setQTrap(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Dịch nghĩa câu hỏi tiếng Việt</label>
            <input
              type="text"
              placeholder="Cô Emily đã quản lý chi nhánh khu vực này..."
              value={qTranslation}
              onChange={(e) => setQTranslation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
            >
              Thêm câu hỏi vào chủ điểm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
