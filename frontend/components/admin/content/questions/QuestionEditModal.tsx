"use client";

import React, { useState, useEffect } from "react";
import { FileQuestion, X, Sparkles } from "lucide-react";
import { QuestionItem, QuestionPart, QuestionDifficulty } from "@/app/admin/content/questions/types";
import { DEFAULT_SKILLS } from "@/app/admin/content/questions/mockData";

interface QuestionEditModalProps {
  isOpen: boolean;
  editingQuestion: QuestionItem | null;
  onClose: () => void;
  onSave: (formData: {
    part: QuestionPart;
    skill: string;
    difficulty: QuestionDifficulty;
    questionText: string;
    passage: string;
    imageUrl: string;
    audioUrl: string;
    optA: string;
    optB: string;
    optC: string;
    optD: string;
    correctAnswer: string;
    explanation: string;
    status: "PUBLISHED" | "DRAFT";
  }) => void;
  aiGenerating: boolean;
  onGenerateAiHelp: () => void;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  editingQuestion,
  onClose,
  onSave,
  aiGenerating,
  onGenerateAiHelp,
}) => {
  const [formPart, setFormPart] = useState<QuestionPart>("Part 5");
  const [formSkill, setFormSkill] = useState<string>(DEFAULT_SKILLS[0]);
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>("Medium");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formPassage, setFormPassage] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");
  const [formOptA, setFormOptA] = useState("");
  const [formOptB, setFormOptB] = useState("");
  const [formOptC, setFormOptC] = useState("");
  const [formOptD, setFormOptD] = useState("");
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>("A");
  const [formExplanation, setFormExplanation] = useState("");
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");

  useEffect(() => {
    if (editingQuestion) {
      setFormPart(editingQuestion.part);
      setFormSkill(editingQuestion.skill || DEFAULT_SKILLS[0]);
      setFormDifficulty(editingQuestion.difficulty || "Medium");
      setFormQuestionText(editingQuestion.questionText || "");
      setFormPassage(editingQuestion.passage || "");
      setFormImageUrl(editingQuestion.imageUrl || "");
      setFormAudioUrl(editingQuestion.audioUrl || "");
      setFormOptA(editingQuestion.options?.[0]?.text || "");
      setFormOptB(editingQuestion.options?.[1]?.text || "");
      setFormOptC(editingQuestion.options?.[2]?.text || "");
      setFormOptD(editingQuestion.options?.[3]?.text || "");
      setFormCorrectAnswer(editingQuestion.correctAnswer || "A");
      setFormExplanation(editingQuestion.explanation || "");
      setFormStatus(editingQuestion.status || "PUBLISHED");
    } else {
      setFormPart("Part 5");
      setFormSkill(DEFAULT_SKILLS[0]);
      setFormDifficulty("Medium");
      setFormQuestionText("");
      setFormPassage("");
      setFormImageUrl("");
      setFormAudioUrl("");
      setFormOptA("");
      setFormOptB("");
      setFormOptC("");
      setFormOptD("");
      setFormCorrectAnswer("A");
      setFormExplanation("");
      setFormStatus("PUBLISHED");
    }
  }, [editingQuestion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      part: formPart,
      skill: formSkill,
      difficulty: formDifficulty,
      questionText: formQuestionText,
      passage: formPassage,
      imageUrl: formImageUrl,
      audioUrl: formAudioUrl,
      optA: formOptA,
      optB: formOptB,
      optC: formOptC,
      optD: formOptD,
      correctAnswer: formCorrectAnswer,
      explanation: formExplanation,
      status: formStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {editingQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới Vào Ngân Hàng"}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phần thi (Part) *</label>
              <select
                value={formPart}
                onChange={(e) => setFormPart(e.target.value as QuestionPart)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="Part 1">Part 1 (Hình ảnh)</option>
                <option value="Part 2">Part 2 (Hỏi đáp)</option>
                <option value="Part 3">Part 3 (Hội thoại)</option>
                <option value="Part 4">Part 4 (Bài nói)</option>
                <option value="Part 5">Part 5 (Câu đơn)</option>
                <option value="Part 6">Part 6 (Điền đoạn)</option>
                <option value="Part 7">Part 7 (Đoạn văn)</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Kỹ năng đánh giá</label>
              <select
                value={formSkill}
                onChange={(e) => setFormSkill(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                {DEFAULT_SKILLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Độ khó</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>
          </div>

          {/* Ngữ cảnh hoặc đoạn văn (nếu là Part 3, 4, 6, 7) */}
          {(formPart === "Part 3" || formPart === "Part 4" || formPart === "Part 6" || formPart === "Part 7") && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Đoạn văn / Bài đọc / Lời thoại (Passage)</label>
              <textarea
                rows={3}
                placeholder="Nhập nội dung đoạn văn hoặc bối cảnh trích dẫn..."
                value={formPassage}
                onChange={(e) => setFormPassage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          )}

          {/* URL ảnh & URL audio nếu có (Part 1, 2, 3, 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Liên kết Ảnh (Image URL - Part 1)</label>
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Liên kết Âm thanh (Audio URL - Part 1-4)</label>
              <input
                type="text"
                placeholder="https://example.com/audio.mp3"
                value={formAudioUrl}
                onChange={(e) => setFormAudioUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Nội dung câu hỏi *</label>
            <textarea
              required
              rows={2}
              placeholder="ví dụ: Look at the photograph and choose the statement... hoặc All members must submit..."
              value={formQuestionText}
              onChange={(e) => setFormQuestionText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* 4 Phương án A, B, C, D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án A *</label>
              <input
                type="text"
                required
                value={formOptA}
                onChange={(e) => setFormOptA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án B *</label>
              <input
                type="text"
                required
                value={formOptB}
                onChange={(e) => setFormOptB(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án C</label>
              <input
                type="text"
                value={formOptC}
                onChange={(e) => setFormOptC(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án D</label>
              <input
                type="text"
                value={formOptD}
                onChange={(e) => setFormOptD(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          {/* Lựa chọn đáp án đúng */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Đáp án chính xác *</label>
            <div className="flex gap-3">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formCorrectAnswer === opt
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="formCorrectAnswer"
                    value={opt}
                    checked={formCorrectAnswer === opt}
                    onChange={() => setFormCorrectAnswer(opt)}
                    className="hidden"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Lời giải thích & Nút AI Generate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Lời giải thích chi tiết</label>
              <button
                type="button"
                disabled={aiGenerating}
                onClick={onGenerateAiHelp}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiGenerating ? "AI đang phân tích..." : "AI Gợi ý giải thích"}
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Giải thích ngữ pháp, từ vựng và lý do chọn đáp án..."
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Trạng thái xuất bản */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Trạng thái câu hỏi</label>
            <div className="flex gap-3">
              <label
                className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                  formStatus === "PUBLISHED"
                    ? "bg-blue-50 border-blue-500 text-blue-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="formStatus"
                  value="PUBLISHED"
                  checked={formStatus === "PUBLISHED"}
                  onChange={() => setFormStatus("PUBLISHED")}
                  className="hidden"
                />
                Xuất bản ngay
              </label>
              <label
                className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                  formStatus === "DRAFT"
                    ? "bg-amber-50 border-amber-500 text-amber-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="formStatus"
                  value="DRAFT"
                  checked={formStatus === "DRAFT"}
                  onChange={() => setFormStatus("DRAFT")}
                  className="hidden"
                />
                Lưu bản nháp
              </label>
            </div>
          </div>

          {/* Form Footer */}
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
              {editingQuestion ? "Cập nhật câu hỏi" : "Lưu vào ngân hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
