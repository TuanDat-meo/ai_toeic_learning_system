"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, X } from "lucide-react";
import { GrammarTopicItem } from "../types";

interface GrammarTopicEditModalProps {
  isOpen: boolean;
  editTopic: GrammarTopicItem | null;
  onClose: () => void;
  onSave: (topicData: Partial<GrammarTopicItem>) => void;
}

export const GrammarTopicEditModal: React.FC<GrammarTopicEditModalProps> = ({
  isOpen,
  editTopic,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [englishTitle, setEnglishTitle] = useState("");
  const [code, setCode] = useState("");
  const [part, setPart] = useState<"Part 5" | "Part 6" | "Part 5 & 6">("Part 5");
  const [targetScore, setTargetScore] = useState<"350-500" | "500-750" | "750+">("500-750");
  const [formula, setFormula] = useState("");
  const [summary, setSummary] = useState("");
  const [signals, setSignals] = useState("");
  const [traps, setTraps] = useState("");

  useEffect(() => {
    if (editTopic) {
      setTitle(editTopic.title || "");
      setEnglishTitle(editTopic.englishTitle || "");
      setCode(editTopic.code || "");
      setPart(editTopic.part || "Part 5");
      setTargetScore(editTopic.targetScore || "500-750");
      setFormula(editTopic.formula || "");
      setSummary(editTopic.summary || "");
      setSignals(editTopic.signalWords ? editTopic.signalWords.join(", ") : "");
      setTraps(editTopic.traps ? editTopic.traps.join("\n") : "");
    } else {
      setTitle("");
      setEnglishTitle("");
      setCode("");
      setPart("Part 5");
      setTargetScore("500-750");
      setFormula("");
      setSummary("");
      setSignals("");
      setTraps("");
    }
  }, [editTopic, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const signalArray = signals
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const trapArray = traps
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      title,
      englishTitle,
      code: code || `TOPIC-${Math.floor(10 + Math.random() * 90)}`,
      part,
      targetScore,
      formula,
      summary,
      signalWords: signalArray,
      traps: trapArray,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {editTopic ? "Chỉnh Sửa Chủ Điểm Ngữ Pháp" : "Tạo Chủ Điểm Ngữ Pháp Mới"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Tên chủ điểm tiếng Việt *</label>
              <input
                type="text"
                required
                placeholder="ví dụ: Thì Hiện Tại Hoàn Thành"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Tên tiếng Anh</label>
              <input
                type="text"
                placeholder="ví dụ: Present Perfect Tense"
                value={englishTitle}
                onChange={(e) => setEnglishTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Mã chuyên đề</label>
              <input
                type="text"
                placeholder="PPT-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phần thi (Part)</label>
              <select
                value={part}
                onChange={(e) => setPart(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="Part 5">Part 5 (Câu đơn)</option>
                <option value="Part 6">Part 6 (Điền đoạn)</option>
                <option value="Part 5 & 6">Part 5 & 6 (Cả hai)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Mục tiêu điểm</label>
              <select
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="350-500">350 - 500</option>
                <option value="500-750">500 - 750</option>
                <option value="750+">750+</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Công thức chính *</label>
            <input
              type="text"
              required
              placeholder="S + have/has + V3/ed + O"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Tóm tắt lý thuyết</label>
            <textarea
              rows={2}
              placeholder="Diễn tả hành động kéo dài từ quá khứ đến hiện tại..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Dấu hiệu nhận biết (phân cách bởi dấu phẩy)</label>
            <input
              type="text"
              placeholder="since, for, already, yet, recently"
              value={signals}
              onChange={(e) => setSignals(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Bẫy TOEIC (mỗi bẫy một dòng)</label>
            <textarea
              rows={2}
              placeholder="Bẫy nhầm lẫn 'since' và 'for'..."
              value={traps}
              onChange={(e) => setTraps(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Footer */}
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
              {editTopic ? "Cập nhật chủ điểm" : "Lưu chủ điểm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
