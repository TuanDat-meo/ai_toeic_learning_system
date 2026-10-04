"use client";

import React, { useState } from "react";
import { X, BookOpen, Lightbulb, AlertTriangle, FileText, Play, Sparkles } from "lucide-react";
import { GrammarTopicItem } from "../types";

interface GrammarTopicDetailModalProps {
  topic: GrammarTopicItem | null;
  onClose: () => void;
  onStartQuiz: (topic: GrammarTopicItem) => void;
}

export const GrammarTopicDetailModal: React.FC<GrammarTopicDetailModalProps> = ({
  topic,
  onClose,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<"formula" | "signals" | "traps" | "examples">("formula");

  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                {topic.code}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-100 text-blue-800">
                {topic.part}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800">
                Target {topic.targetScore}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{topic.title}</h2>
            <p className="text-xs text-slate-500 font-medium italic">{topic.englishTitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed">
          <strong className="font-bold text-blue-900">Tóm tắt ngắn: </strong>
          {topic.summary}
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("formula")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "formula"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Công thức chính</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("signals")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "signals"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dấu hiệu nhận biết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("traps")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "traps"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bẫy TOEIC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("examples")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "examples"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ví dụ minh họa</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[160px] text-xs space-y-3">
          {activeTab === "formula" && (
            <div className="space-y-3 animate-in fade-in">
              <p className="font-bold text-slate-700">Công thức đóng khung chuẩn TOEIC:</p>
              <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-sm font-bold shadow-inner">
                {topic.formula}
              </div>
            </div>
          )}

          {activeTab === "signals" && (
            <div className="space-y-3 animate-in fade-in">
              <p className="font-bold text-slate-700">Các từ/cụm từ dấu hiệu nhận biết nhanh trong bài thi:</p>
              <div className="flex flex-wrap gap-2">
                {topic.signalWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs"
                  >
                    ✨ {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "traps" && (
            <div className="space-y-2.5 animate-in fade-in">
              <p className="font-bold text-slate-700">Cảnh báo bẫy ngữ pháp thường gặp:</p>
              {topic.traps.map((trap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-950 font-medium leading-relaxed flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{trap}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "examples" && (
            <div className="space-y-3 animate-in fade-in">
              <p className="font-bold text-slate-700">Ví dụ câu chuẩn định dạng TOEIC:</p>
              {topic.examples.map((ex, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <p className="font-bold text-slate-900">{ex.sentence}</p>
                  <p className="text-slate-600 italic">Dịch: {ex.translation}</p>
                  {ex.analysis && (
                    <p className="text-[11px] text-blue-700 font-semibold pt-1 border-t border-slate-200">
                      💡 Phân tích: {ex.analysis}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-bold">
            Số câu hỏi trắc nghiệm: <strong className="text-slate-900">{topic.questions.length} câu</strong>
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartQuiz(topic);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Luyện tập ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
