"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  FileText,
  Play,
  Trash2,
  Check,
  Award,
  RotateCcw,
  ArrowRight,
  Clock,
} from "lucide-react";
import { GrammarTopicItem, GrammarQuestionItem } from "../types";

// ==========================================
// 1. MODAL XEM CHI TIẾT CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
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

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed">
          <strong className="font-bold text-blue-900">Tóm tắt ngắn: </strong>
          {topic.summary}
        </div>

        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("formula")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "formula" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Công thức chính</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("signals")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "signals" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dấu hiệu nhận biết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("traps")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "traps" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bẫy TOEIC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("examples")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "examples" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ví dụ minh họa</span>
          </button>
        </div>

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

// ==========================================
// 2. MODAL THÊM / CHỈNH SỬA CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarTopicEditModalProps {
  isOpen: boolean;
  editTopic?: GrammarTopicItem | null;
  topic?: GrammarTopicItem | null;
  onClose: () => void;
  onSave: (topicData: Partial<GrammarTopicItem>) => void;
}

export const GrammarTopicEditModal: React.FC<GrammarTopicEditModalProps> = ({
  isOpen,
  editTopic,
  topic: topicProp,
  onClose,
  onSave,
}) => {
  const currentTopic = editTopic || topicProp || null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {currentTopic ? `Chỉnh sửa: ${currentTopic.title}` : "Thêm chủ điểm ngữ pháp mới"}
            </h2>
            <p className="text-xs text-slate-500">Cập nhật thông tin lý thuyết & mẹo bẫy chuẩn ETS</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            onSave({
              title: formData.get("title") as string,
              englishTitle: formData.get("englishTitle") as string,
              part: formData.get("part") as any,
              targetScore: formData.get("targetScore") as any,
              formula: formData.get("formula") as string,
              summary: formData.get("summary") as string,
            });
            onClose();
          }}
          className="space-y-4 text-xs font-medium"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên chủ điểm (Tiếng Việt)</label>
              <input
                type="text"
                name="title"
                defaultValue={currentTopic?.title || ""}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên tiếng Anh (English Title)</label>
              <input
                type="text"
                name="englishTitle"
                defaultValue={currentTopic?.englishTitle || ""}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phần thi áp dụng (Part)</label>
              <select
                name="part"
                defaultValue={currentTopic?.part || "Part 5"}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Part 5">Part 5</option>
                <option value="Part 6">Part 6</option>
                <option value="Part 5 & 6">Part 5 & 6</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Target Score mục tiêu</label>
              <select
                name="targetScore"
                defaultValue={currentTopic?.targetScore || "500-750"}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="350-500">Lv.1 350 - 500 (Nền tảng)</option>
                <option value="500-750">Lv.2 500 - 750 (Trung cấp)</option>
                <option value="750+">Lv.3 750+ (Nâng cao)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Công thức đóng khung chính</label>
            <input
              type="text"
              name="formula"
              defaultValue={currentTopic?.formula || ""}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-emerald-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tóm tắt ngắn gọn kỹ năng</label>
            <textarea
              name="summary"
              rows={3}
              defaultValue={currentTopic?.summary || ""}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. MODAL XÁC NHẬN XÓA CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarDeleteModalProps {
  deleteConfirmTopic?: GrammarTopicItem | null;
  topic?: GrammarTopicItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const GrammarDeleteModal: React.FC<GrammarDeleteModalProps> = ({
  deleteConfirmTopic,
  topic: topicProp,
  onClose,
  onConfirm,
}) => {
  const currentTopic = deleteConfirmTopic || topicProp || null;
  if (!currentTopic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Xóa chủ điểm ngữ pháp?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Bạn có chắc chắn muốn xóa &quot;{currentTopic.title}&quot;? Dữ liệu câu hỏi luyện tập liên quan sẽ bị loại bỏ.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MODAL THÊM CÂU HỎI TRẮC NGHIỆM VÀO CHỦ ĐIỂM
// ==========================================
interface GrammarAddQuestionModalProps {
  topic: GrammarTopicItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (topicId: string, q: GrammarQuestionItem) => void;
}

export const GrammarAddQuestionModal: React.FC<GrammarAddQuestionModalProps> = ({
  topic,
  isOpen,
  onClose,
  onAddQuestion,
}) => {
  if (!isOpen || !topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Thêm câu hỏi trắc nghiệm mới</h3>
            <p className="text-xs text-slate-500">Thêm câu hỏi vào chủ điểm &quot;{topic.title}&quot;</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const newQ: GrammarQuestionItem = {
              id: `q-${Date.now()}`,
              part: topic.part.includes("6") ? "Part 6" : "Part 5",
              questionText: formData.get("questionText") as string,
              options: {
                A: formData.get("optA") as string,
                B: formData.get("optB") as string,
                C: formData.get("optC") as string,
                D: formData.get("optD") as string,
              },
              correctAnswer: formData.get("correctAnswer") as "A" | "B" | "C" | "D",
              explanation: formData.get("explanation") as string,
            };
            onAddQuestion(topic.id, newQ);
            onClose();
          }}
          className="space-y-3.5 text-xs font-medium"
        >
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nội dung câu hỏi (chứa chỗ trống _____)</label>
            <input
              type="text"
              name="questionText"
              required
              placeholder="Ví dụ: Mr. Kim _____ the quarterly sales report yesterday."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án A</label>
              <input
                type="text"
                name="optA"
                required
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án B</label>
              <input
                type="text"
                name="optB"
                required
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án C</label>
              <input
                type="text"
                name="optC"
                required
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Đáp án D</label>
              <input
                type="text"
                name="optD"
                required
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Đáp án đúng</label>
            <select
              name="correctAnswer"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-blue-700"
            >
              <option value="A">Đáp án A</option>
              <option value="B">Đáp án B</option>
              <option value="C">Đáp án C</option>
              <option value="D">Đáp án D</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Giải thích chi tiết</label>
            <textarea
              name="explanation"
              rows={3}
              required
              placeholder="Giải thích lý do chọn đáp án đúng..."
              className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
            >
              Thêm câu hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. MODAL LUYỆN TẬP QUIZ NGỮ PHÁP FULLSCREEN
// ==========================================
interface GrammarQuizModalProps {
  isOpen: boolean;
  title: string;
  questions: GrammarQuestionItem[];
  onClose: () => void;
  activeTopic: GrammarTopicItem | null;
  onRecordResult?: (topicId: string, isCorrect: boolean) => void;
}

export const GrammarQuizModal: React.FC<GrammarQuizModalProps> = ({
  isOpen,
  title,
  questions,
  onClose,
  activeTopic,
  onRecordResult,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setScore(0);
      setQuizFinished(false);
      setTimerSeconds(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && !quizFinished) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, quizFinished]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (!selectedAnswer || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (activeTopic && onRecordResult) {
      onRecordResult(activeTopic.id, isCorrect);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
    setTimerSeconds(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header Quiz */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {!quizFinished ? `Câu ${currentIndex + 1} / ${questions.length}` : "Kết quả luyện tập"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!quizFinished && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thân bài Quiz */}
        {!quizFinished ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold mb-2">
                {currentQ.part}
              </span>
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(["A", "B", "C", "D"] as const).map((optKey) => {
                const optText = currentQ.options[optKey];
                const isChosen = selectedAnswer === optKey;
                const isCorrectAnswer = isAnswerChecked && optKey === currentQ.correctAnswer;
                const isWrongChosen = isAnswerChecked && isChosen && optKey !== currentQ.correctAnswer;

                return (
                  <button
                    key={optKey}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedAnswer(optKey)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isCorrectAnswer
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : isWrongChosen
                        ? "bg-rose-50 border-rose-500 text-rose-900"
                        : isChosen
                        ? "bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20"
                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrectAnswer
                            ? "bg-emerald-600 text-white"
                            : isWrongChosen
                            ? "bg-rose-600 text-white"
                            : isChosen
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {optKey}
                      </span>
                      <span className="leading-snug">{optText}</span>
                    </div>

                    {isCorrectAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isWrongChosen && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {isAnswerChecked && (
              <div className="space-y-3 pt-2">
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    selectedAnswer === currentQ.correctAnswer
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {selectedAnswer === currentQ.correctAnswer ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Đáp án đúng là {currentQ.correctAnswer}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-rose-600" />
                        <span>
                          Chưa chính xác! Đáp án đúng là <strong>{currentQ.correctAnswer}</strong>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    <strong>Giải thích:</strong> {currentQ.explanation}
                  </p>
                </div>

                {currentQ.trapNote && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-800 mb-0.5">Lưu ý bẫy đề thi TOEIC:</strong>
                      <p className="text-slate-700 leading-relaxed">{currentQ.trapNote}</p>
                    </div>
                  </div>
                )}

                {currentQ.translation && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                    <strong>Dịch nghĩa:</strong> &quot;{currentQ.translation}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Hoàn Thành Bài Luyện Tập!</h2>
              <p className="text-xs text-slate-500">
                Thời gian hoàn thành: <strong className="text-blue-600">{formatTimer(timerSeconds)}</strong>
              </p>
            </div>

            <div className="inline-flex items-center gap-6 px-8 py-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Số câu đúng</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {score} / {questions.length}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Tỷ lệ chính xác</p>
                <p className="text-2xl font-extrabold text-blue-600">
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Làm lại bài
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {!quizFinished && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {selectedAnswer ? `Đã chọn đáp án ${selectedAnswer}` : "Vui lòng chọn 1 phương án"}
            </span>

            <div className="flex items-center gap-2.5">
              {!isAnswerChecked ? (
                <button
                  type="button"
                  disabled={!selectedAnswer}
                  onClick={handleCheckAnswer}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuizQuestion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? "Câu tiếp theo" : "Xem kết quả"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
