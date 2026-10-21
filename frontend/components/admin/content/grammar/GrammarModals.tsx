"use client";

import { expandGrammarQuestions } from "@/lib/toeicQuestionExpander";
import { recordQuestionAnswer, getItemProgress } from "@/lib/practiceProgress";

import React, { useState, useEffect, useMemo } from "react";
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

} from "lucide-react";
import { GrammarTopicItem, GrammarQuestionItem } from "@/app/admin/content/grammar/types";

import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import {
  GrammarFormulaViewer,
  GrammarSignalsViewer,
  GrammarTrapsViewer,
  GrammarExamplesViewer,
} from "./GrammarFormulaViewer";
import { INITIAL_GRAMMAR_TOPICS } from "@/app/admin/content/grammar/mockData";
import { getGrammarTopic } from "@/lib/api/grammar";

// ==========================================
// 1. MODAL XEM CHI TIẾT CHỦ ĐIỂM NGỮ PHÁP
// ==========================================
interface GrammarTopicDetailModalProps {
  topic: GrammarTopicItem | null;
  onClose: () => void;
  onStartQuiz: (topic: GrammarTopicItem) => void;
}

export const GrammarTopicDetailModal: React.FC<GrammarTopicDetailModalProps> = ({
  topic: topicProp,
  onClose,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<"formula" | "signals" | "traps" | "examples">("formula");
  const [detailTopic, setDetailTopic] = useState<GrammarTopicItem | null>(topicProp);

  useEffect(() => {
    if (!topicProp) {
      setDetailTopic(null);
      return;
    }

    const mock = INITIAL_GRAMMAR_TOPICS.find(
      (m) =>
        m.id === topicProp.id ||
        m.code === topicProp.code ||
        (m.titleVi && topicProp.titleVi && m.titleVi.toLowerCase().includes(topicProp.titleVi.toLowerCase())) ||
        (m.title && topicProp.title && m.title.toLowerCase().includes(topicProp.title.toLowerCase()))
    );

    const merged: GrammarTopicItem = {
      ...topicProp,
      examples:
        topicProp.examples && topicProp.examples.length > 0 && topicProp.examples.some((e) => e.sentence)
          ? topicProp.examples
          : mock?.examples || [],
      questions:
        topicProp.questions && topicProp.questions.length > 0
          ? topicProp.questions
          : mock?.questions || [],
      signalWords:
        topicProp.signalWords && topicProp.signalWords.length > 0
          ? topicProp.signalWords
          : mock?.signalWords || [],
      traps:
        topicProp.traps && topicProp.traps.length > 0
          ? topicProp.traps
          : mock?.traps || [],
      formula: topicProp.formula || mock?.formula || "",
    };

    setDetailTopic(merged);

    if (topicProp.id) {
      getGrammarTopic(topicProp.id)
        .then((fetched) => {
          if (fetched) {
            setDetailTopic((prev) => ({
              ...prev,
              ...fetched,
              examples:
                fetched.examples && fetched.examples.length > 0 && fetched.examples.some((e) => e.sentence)
                  ? fetched.examples
                  : merged.examples,
              questions:
                fetched.questions && fetched.questions.length > 0
                  ? fetched.questions
                  : merged.questions,
            }));
          }
        })
        .catch(() => {});
    }
  }, [topicProp]);

  const topic = detailTopic || topicProp;
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                {topic.code}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-100 text-blue-800">
                {topic.part}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{topic.titleVi || topic.title}</h2>
            <p className="text-xs text-slate-500 font-medium italic">{topic.titleEn || topic.englishTitle}</p>
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
            <div className="animate-in fade-in">
              <GrammarFormulaViewer
                formulaText={topic.formula}
                topicTitle={topic.titleVi || topic.title}
                topicCode={topic.code}
              />
            </div>
          )}

          {activeTab === "signals" && (
            <div className="animate-in fade-in">
              <GrammarSignalsViewer signalWords={topic.signalWords} />
            </div>
          )}

          {activeTab === "traps" && (
            <div className="animate-in fade-in">
              <GrammarTrapsViewer traps={topic.traps} />
            </div>
          )}

          {activeTab === "examples" && (
            <div className="animate-in fade-in">
              <GrammarExamplesViewer examples={topic.examples} topicCode={topic.code} />
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
              {currentTopic ? `Chỉnh sửa: ${currentTopic.titleVi || currentTopic.title}` : "Thêm chủ điểm ngữ pháp mới"}
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
            const titleViVal = (formData.get("title") as string || "").trim();
            const titleEnVal = (formData.get("englishTitle") as string || "").trim();
            const formulaVal = (formData.get("formula") as string || "").trim();
            const summaryVal = (formData.get("summary") as string || "").trim();

            if (!titleViVal) {
              alert("Vui lòng nhập tên chủ điểm ngữ pháp Tiếng Việt!");
              return;
            }
            if (!titleEnVal) {
              alert("Vui lòng nhập tên chủ điểm Tiếng Anh!");
              return;
            }
            if (!formulaVal) {
              alert("Vui lòng nhập công thức / cấu trúc cốt lõi!");
              return;
            }
            if (!summaryVal) {
              alert("Vui lòng nhập tóm tắt ngắn gọn kỹ năng!");
              return;
            }

            onSave({
              titleVi: titleViVal,
              titleEn: titleEnVal,
              title: titleViVal,
              englishTitle: titleEnVal,
              part: (formData.get("part") as string || "Part 5") as unknown as never,
              targetScore: (formData.get("targetScore") as string || "All") as unknown as never,
              formula: formulaVal,
              summary: summaryVal,
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
                defaultValue={currentTopic?.titleVi || currentTopic?.title || ""}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên tiếng Anh (English Title)</label>
              <input
                type="text"
                name="englishTitle"
                defaultValue={currentTopic?.titleEn || currentTopic?.englishTitle || ""}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phần thi áp dụng (Part)</label>
              <select
                name="part"
                defaultValue={currentTopic?.part || "Part 5"}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Part 5">Part 5</option>
                <option value="Part 6">Part 6</option>
                <option value="Part 7">Part 7</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Công thức đóng khung chính (Hỗ trợ Markdown: ### Tiêu đề, - **TỪ KHÓA:** Giải thích)</label>
            <textarea
              name="formula"
              rows={6}
              defaultValue={currentTopic?.formula || ""}
              required
              className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs font-semibold text-slate-800 leading-relaxed focus:outline-hidden focus:border-blue-500"
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
            Bạn có chắc chắn muốn xóa &quot;{currentTopic.titleVi || currentTopic.title}&quot;? Dữ liệu câu hỏi luyện tập liên quan sẽ bị loại bỏ.
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
            <p className="text-xs text-slate-500">Thêm câu hỏi vào chủ điểm &quot;{topic.titleVi || topic.title}&quot;</p>
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
            const qText = (formData.get("questionText") as string || "").trim();
            const optA = (formData.get("optA") as string || "").trim();
            const optB = (formData.get("optB") as string || "").trim();
            const optC = (formData.get("optC") as string || "").trim();
            const optD = (formData.get("optD") as string || "").trim();
            const expl = (formData.get("explanation") as string || "").trim();

            if (!qText) {
              alert("Vui lòng nhập nội dung câu hỏi!");
              return;
            }
            if (!optA || !optB || !optC || !optD) {
              alert("Vui lòng nhập đầy đủ cả 4 phương án A, B, C, D!");
              return;
            }
            if (!expl) {
              alert("Vui lòng nhập lời giải thích chi tiết cho câu hỏi!");
              return;
            }

            const newQ: GrammarQuestionItem = {
              id: `q-${Date.now()}`,
              part: topic.part.includes("6") ? "Part 6" : "Part 5",
              questionText: qText,
              options: { A: optA, B: optB, C: optC, D: optD },
              correctAnswer: formData.get("correctAnswer") as "A" | "B" | "C" | "D",
              explanation: expl,
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
  initialIndex?: number;
  isRedoWrongOnly?: boolean;
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
  questions: rawQuestions,
  onClose,
  activeTopic,
  onRecordResult,
  initialIndex = 0,
  isRedoWrongOnly = false,
}) => {
  // Đảm bảo bài luôn có đủ 30 câu hỏi thực tế chuẩn TOEIC Part 5
  const fullQuestions = useMemo(() => {
    const topicTitle = activeTopic?.titleVi || activeTopic?.title || "Ngữ pháp";
    return expandGrammarQuestions(rawQuestions, topicTitle, 30);
  }, [rawQuestions, activeTopic]);

  // Nếu là chế độ redo câu sai, lọc các câu bị sai
  const questions = useMemo(() => {
    if (!isRedoWrongOnly || !activeTopic) return fullQuestions;
    const prog = getItemProgress(`grammar-${activeTopic.id}`, fullQuestions.length);
    const wrongList = prog.wrongQuestionIds || [];
    const wrongIds = wrongList.map((id) => String(id));
    if (wrongIds.length === 0) {
      const fallbackCount = Math.max(1, prog.wrongAnswers || 2);
      return fullQuestions.slice(0, fallbackCount);
    }
    const filtered = fullQuestions.filter((q, idx) => {
      const qIdStr = String(q.id || "");
      const idxStr = String(idx + 1);
      const idx0Str = String(idx);
      return wrongIds.some(
        (wid) => wid === qIdStr || wid === idxStr || wid === idx0Str || qIdStr.endsWith(`-${wid}`) || qIdStr.endsWith(`_${wid}`)
      );
    });
    return filtered.length > 0 ? filtered : fullQuestions.slice(0, Math.max(1, prog.wrongAnswers || 2));
  }, [fullQuestions, isRedoWrongOnly, activeTopic]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);


  useEffect(() => {
    if (isOpen) {
      // Tiếp tục làm từ câu tiếp theo (nếu làm 5 câu thì mở câu 6)
      const targetStart = isRedoWrongOnly ? 0 : Math.min(initialIndex, Math.max(0, questions.length - 1));
      setCurrentIndex(targetStart);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setScore(0);
      setQuizFinished(false);
    }
  }, [isOpen, initialIndex, isRedoWrongOnly, questions.length]);
  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (optKey: "A" | "B" | "C" | "D") => {
    if (isAnswerChecked) return;
    setSelectedAnswer(optKey);
    setIsAnswerChecked(true);

    const isCorrect = optKey === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (activeTopic) {
      // Ghi nhận kết quả: Nếu câu này vốn sai mà nay làm đúng thì số câu sai TỰ ĐỘNG GIẢM DẦN!
      recordQuestionAnswer(`grammar-${activeTopic.id}`, currentQ.id, isCorrect, questions.length);
      if (onRecordResult) {
        onRecordResult(activeTopic.id, isCorrect);
      }
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
                    onClick={() => handleSelectAnswer(optKey)}
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

            {/* HIỂN THỊ DỊCH NGHĨA, MẸO BẪY, VÀ TỪ CẦN HỌC SAU KHI CHỌN ĐÁP ÁN */}
            {isAnswerChecked && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
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
                    <strong>Giải thích chi tiết:</strong> {currentQ.explanation}
                  </p>
                </div>

                {currentQ.trapNote && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-800 mb-0.5">Mẹo làm bài &amp; Bẫy đề thi TOEIC:</strong>
                      <p className="text-slate-700 leading-relaxed">{currentQ.trapNote}</p>
                    </div>
                  </div>
                )}

                {currentQ.translation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                    <strong className="text-slate-900 block font-bold">Dịch nghĩa câu hỏi:</strong>
                    <p className="italic leading-relaxed text-slate-800">&quot;{currentQ.translation}&quot;</p>
                  </div>
                )}

                {activeTopic?.signalWords && activeTopic.signalWords.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5 shadow-2xs">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="block text-blue-900">Từ vựng &amp; Dấu hiệu nhận biết (Từ cần học):</strong>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {activeTopic.signalWords.map((word, wIdx) => (
                          <span key={wIdx} className="px-2.5 py-0.5 rounded-lg bg-white border border-blue-200 text-blue-800 font-mono font-bold text-[11px] shadow-2xs">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {isAnswerChecked
                  ? `Đã hoàn thành câu ${currentIndex + 1}/${questions.length}`
                  : "Chọn 1 đáp án để kiểm tra ngay"}
              </span>
              <QuestionErrorReportButton
                source="QUESTION_BANK"
                questionRef={String(currentQ.id || `grammar-${activeTopic?.id || 'quiz'}-${currentIndex + 1}`)}
                relatedContent={`Ngữ pháp: ${activeTopic?.title || title || 'Quiz'} - Câu ${currentIndex + 1}`}
                questionSnapshot={{
                  questionText: currentQ.questionText,
                  options: currentQ.options,
                  correctAnswer: currentQ.correctAnswer,
                  explanation: currentQ.explanation,
                  topicTitle: activeTopic?.title || title,
                }}
                compact
              />
            </div>

            <div className="flex items-center gap-2.5">
              {isAnswerChecked && (
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
