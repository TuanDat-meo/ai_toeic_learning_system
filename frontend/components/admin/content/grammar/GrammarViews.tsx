"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Save,
  Eye,
  Sliders,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Download,
  RotateCcw,
  Info,
  Check,
  Sparkles,
  Shuffle,
  Clock,
  Target,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";
import { GrammarTopicItem, GrammarQuestionItem } from "@/app/admin/content/grammar/types";

// ==========================================
// 1. NGÂN HÀNG TOÀN BỘ CÂU HỎI NGỮ PHÁP
// ==========================================
interface QuestionBankViewProps {
  topics: GrammarTopicItem[];
  recentQuestion?: { topicId: string; questionId: string };
  onAddQuestion: () => void;
  onEditQuestion: (topic: GrammarTopicItem, question: GrammarQuestionItem) => void;
  onDeleteQuestion: (topic: GrammarTopicItem, question: GrammarQuestionItem) => void;
}

function getQuestionDifficulty(value?: string): "EASY" | "MEDIUM" | "HARD" {
  const normalized = value?.toUpperCase().replace("_", "-");
  if (normalized === "EASY" || normalized === "350-500") return "EASY";
  if (normalized === "HARD" || normalized === "750+") return "HARD";
  return "MEDIUM";
}

export const GrammarQuestionBankView: React.FC<QuestionBankViewProps> = ({
  topics,
  recentQuestion,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const [search, setSearch] = useState("");
  const [selectedPart, setSelectedPart] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("ALL");
  const [previewQ, setPreviewQ] = useState<{ q: GrammarQuestionItem; topicTitle: string } | null>(null);
  const questionListRef = React.useRef<HTMLDivElement>(null);
  const recentQuestionKey = recentQuestion
    ? `${recentQuestion.topicId}:${recentQuestion.questionId}`
    : null;

  useEffect(() => {
    if (!recentQuestionKey) return;
    if (questionListRef.current) questionListRef.current.scrollTop = 0;
  }, [recentQuestionKey]);

  // Flatten all questions with topic context
  const allQuestions = useMemo(() => {
    const list: { q: GrammarQuestionItem; topic: GrammarTopicItem }[] = [];
    topics.forEach((t) => {
      t.questions.forEach((q) => {
        list.push({ q, topic: t });
      });
    });
    return list;
  }, [topics]);
  const linkedQuestionTopics = topics.filter((topic) => (topic.linkedToeicQuestionCount ?? 0) > 0);
  const linkedQuestionCount = linkedQuestionTopics.reduce(
    (total, topic) => total + (topic.linkedToeicQuestionCount ?? 0),
    0,
  );

  const filtered = useMemo(() => {
    const result = allQuestions.filter(({ q, topic }) => {
      const matchSearch =
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.explanation.toLowerCase().includes(search.toLowerCase()) ||
        (q.trapNote && q.trapNote.toLowerCase().includes(search.toLowerCase())) ||
        (topic.title || topic.titleVi || "").toLowerCase().includes(search.toLowerCase()) ||
        topic.code.toLowerCase().includes(search.toLowerCase());

      const questionPart = q.part.toUpperCase().replace("_", " ");
      const matchPart = selectedPart === "ALL" || questionPart === selectedPart.toUpperCase();
      const matchDiff = selectedDifficulty === "ALL" || getQuestionDifficulty(q.difficulty) === selectedDifficulty;
      const matchTopic = selectedTopicId === "ALL" || topic.id === selectedTopicId;

      return matchSearch && matchPart && matchDiff && matchTopic;
    });
    if (recentQuestion) {
      result.sort((left, right) => {
        const leftIsRecent = left.topic.id === recentQuestion.topicId
          && String(left.q.id) === recentQuestion.questionId;
        const rightIsRecent = right.topic.id === recentQuestion.topicId
          && String(right.q.id) === recentQuestion.questionId;
        return Number(rightIsRecent) - Number(leftIsRecent);
      });
    }
    return result;
  }, [allQuestions, search, selectedPart, selectedDifficulty, selectedTopicId, recentQuestion]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi, mã đề, bẫy..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="max-w-56 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
            aria-label="Lọc theo chuyên đề"
          >
            <option value="ALL">Tất cả chuyên đề</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.titleVi || topic.title}</option>
            ))}
          </select>
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả phần thi</option>
            <option value="PART 5">Part 5 (Incomplete Sentences)</option>
            <option value="PART 6">Part 6 (Text Completion)</option>
            <option value="PART 7">Part 7 (Reading Comprehension)</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả độ khó</option>
            <option value="EASY">Cơ bản</option>
            <option value="MEDIUM">Trung cấp</option>
            <option value="HARD">Nâng cao</option>
          </select>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 px-2">
              Hiển thị: <strong>{filtered.length}</strong> / {allQuestions.length} câu
            </span>
            <button
              type="button"
              onClick={onAddQuestion}
              disabled={topics.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm câu hỏi
            </button>
          </div>
        </div>
      </div>
      {linkedQuestionCount > 0 ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900">
          <p>
            Backend đang ghi nhận {linkedQuestionCount} câu TOEIC liên kết với {linkedQuestionTopics.length} chủ điểm.
            Các câu này thuộc ngân hàng TOEIC, không nằm trong danh sách câu hỏi ngữ pháp nhúng ở màn hình này.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-blue-800">
            {linkedQuestionTopics.map((topic) => (
              <li key={topic.id}>
                {topic.titleVi || topic.code}: {topic.linkedToeicQuestionCount} câu
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Questions Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div ref={questionListRef} className="grammar-list-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[110px]">Mã / Part</th>
                <th className="py-3.5 px-4 min-w-[300px]">Nội dung câu hỏi TOEIC</th>
                <th className="py-3.5 px-4 min-w-[180px]">Chuyên đề liên kết</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Đáp án đúng</th>
                <th className="py-3.5 px-4 min-w-[120px]">Độ khó</th>
                <th className="py-3.5 px-4 min-w-[220px]">Bẫy thí sinh (Trap Note)</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy câu hỏi ngữ pháp nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map(({ q, topic }) => (
                  <tr
                    key={`${topic.id}:${q.id}`}
                    className={`odd:bg-slate-50/50 hover:bg-blue-50/50 transition-colors ${
                      recentQuestion?.topicId === topic.id && String(q.id) === recentQuestion.questionId
                        ? "bg-emerald-50 ring-2 ring-inset ring-emerald-400"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900">{q.id}</span>
                        <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-0.5 whitespace-nowrap inline-flex items-center">
                          {q.part}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 leading-snug line-clamp-2">
                        {q.questionText}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-1">
                        <span>A: {q.options.A}</span>
                        <span>•</span>
                        <span>B: {q.options.B}</span>
                        <span>•</span>
                        <span>C: {q.options.C}</span>
                        <span>•</span>
                        <span>D: {q.options.D}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{topic.titleVi || topic.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{topic.code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap inline-flex items-center ${
                          getQuestionDifficulty(q.difficulty) === "HARD"
                            ? "bg-purple-100 text-purple-800"
                            : getQuestionDifficulty(q.difficulty) === "MEDIUM"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {getQuestionDifficulty(q.difficulty) === "EASY"
                          ? "Cơ bản"
                          : getQuestionDifficulty(q.difficulty) === "HARD"
                            ? "Nâng cao"
                            : "Trung cấp"}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      {q.trapNote ? (
                        <div className="flex items-start gap-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 line-clamp-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{q.trapNote}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Không gắn bẫy</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewQ({ q, topicTitle: topic.title || topic.titleVi || "" })}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                        title="Xem chi tiết & giải thích"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditQuestion(topic, q)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-700 transition"
                        title="Chỉnh sửa câu hỏi"
                        aria-label={`Chỉnh sửa câu hỏi ${q.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteQuestion(topic, q)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition"
                        title="Xóa câu hỏi"
                        aria-label={`Xóa câu hỏi ${q.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Question */}
      {previewQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {previewQ.q.part} • {getQuestionDifficulty(previewQ.q.difficulty) === "EASY"
                    ? "Cơ bản"
                    : getQuestionDifficulty(previewQ.q.difficulty) === "HARD" ? "Nâng cao" : "Trung cấp"}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  Thuộc chuyên đề: {previewQ.topicTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQ(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 leading-relaxed">
              {previewQ.q.questionText}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <div
                  key={opt}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    previewQ.q.correctAnswer === opt
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="font-mono font-bold w-4">{opt}.</span>
                  <span>{previewQ.q.options[opt]}</span>
                  {previewQ.q.correctAnswer === opt && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5 text-xs">
              <span className="font-bold text-blue-900 block">💡 Giải thích chi tiết:</span>
              <p className="text-slate-700 leading-relaxed">{previewQ.q.explanation}</p>
              {previewQ.q.translation && (
                <p className="text-slate-500 italic text-[11px] pt-1">
                  Dịch nghĩa: &quot;{previewQ.q.translation}&quot;
                </p>
              )}
            </div>

            {previewQ.q.trapNote && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Bẫy đề TOEIC cần lưu ý:
                </span>
                <p className="text-amber-800 leading-relaxed text-[11px]">{previewQ.q.trapNote}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewQ(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MA TRẬN BẪY ĐỀ & PHÂN TÍCH LỖI SAI HỌC VIÊN
// ==========================================
interface TrapsMatrixViewProps {
  topics: GrammarTopicItem[];
}

export const GrammarTrapsMatrixView: React.FC<TrapsMatrixViewProps> = ({ topics }) => {
  const LOCAL_STORAGE_KEY = "toeic_grammar_curriculum_config";
  const [configError, setConfigError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    minAccuracyPass: 80,
    srsGrammarInterval: 3,
    shuffleQuestions: true,
    showExplanationImmediately: true,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      setConfigError("Không thể đọc cấu hình đã lưu trên trình duyệt; đang dùng giá trị xem trước mặc định.");
    }

    const handleConfigUpdated = (event: Event) => {
      const detail = (event as CustomEvent<Partial<typeof config>>).detail;
      if (detail) setConfig((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("toeic-grammar-config-updated", handleConfigUpdated);
    return () => window.removeEventListener("toeic-grammar-config-updated", handleConfigUpdated);
  }, []);

  // Aggregate traps across all topics
  const allTraps = useMemo(() => {
    const list: {
      id: string;
      topicCode: string;
      topicTitle: string;
      trapTitle: string;
      questionsWithTrapNotes: number;
      formula: string;
    }[] = [];

    topics.forEach((t) => {
      t.traps.forEach((trap, trapIdx) => {
        list.push({
          id: `trap-${t.id}-${trapIdx}`,
          topicCode: t.code,
          topicTitle: t.title || t.titleVi || "",
          trapTitle: trap,
          questionsWithTrapNotes: t.questions.filter((question) => question.trapNote?.trim()).length,
          formula: t.formula,
        });
      });
    });

    return list;
  }, [topics]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {configError ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{configError}</p> : null}
      <div className="p-3.5 bg-amber-50 text-amber-950 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <Sliders className="w-4 h-4" />
          </span>
          <div>
            <span className="font-bold">Cấu hình xem trước trong trình duyệt:</span>{" "}
            <span className="text-amber-900 font-mono">
              Chuẩn đầu ra: ≥{config.minAccuracyPass}% đúng • Lặp lại ngắt quãng (SRS): {config.srsGrammarInterval} ngày • Xáo trộn câu hỏi: {config.shuffleQuestions ? "Bật" : "Tắt"}
            </span>
          </div>
        </div>
        <span className="max-w-sm text-[11px] font-medium">Chưa đồng bộ backend; chỉ áp dụng trong trình duyệt hiện tại.</span>
      </div>

      {/* Traps Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Ma trận bẫy ngữ pháp từ nội dung chủ điểm
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Nội dung lấy từ backend; chưa có dữ liệu phân tích tỷ lệ sai của học viên
          </span>
        </div>

        <div className="grammar-list-scroll">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[170px]">Chuyên đề</th>
                <th className="py-3.5 px-4 min-w-[280px]">Bẫy đề thi TOEIC</th>
                <th className="py-3.5 px-4 min-w-[180px]">Câu hỏi có ghi chú bẫy</th>
                <th className="py-3.5 px-4 min-w-[160px]">Tỷ lệ học viên sai</th>
                <th className="py-3.5 px-4 min-w-[260px]">Công thức liên quan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {allTraps.map((trap) => (
                <tr key={trap.id} className="odd:bg-slate-50/50 hover:bg-amber-50/60 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit whitespace-nowrap">
                      {trap.topicCode}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold mt-0.5 block whitespace-nowrap">
                      {trap.topicTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 min-w-[280px]">
                    <p className="font-bold text-slate-900">{trap.trapTitle}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{trap.questionsWithTrapNotes}</td>
                  <td className="py-3.5 px-4 text-slate-500">Chưa có dữ liệu</td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    <span className="font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 block text-slate-700">
                      {trap.formula || "Chưa có công thức"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. CẤU HÌNH LỘ TRÌNH & XUẤT BẢN NGỮ PHÁP
// ==========================================
interface CurriculumConfigViewProps {
  topicsCount: number;
  topics?: GrammarTopicItem[];
}

export const GrammarCurriculumConfigView: React.FC<CurriculumConfigViewProps> = ({
  topicsCount,
  topics = [],
}) => {
  const LOCAL_STORAGE_KEY = "toeic_grammar_curriculum_config";

  const [minAccuracyPass, setMinAccuracyPass] = useState(80);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [srsGrammarInterval, setSrsGrammarInterval] = useState(3);
  const [showExplanationImmediately, setShowExplanationImmediately] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load cấu hình đã lưu
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.minAccuracyPass === "number") setMinAccuracyPass(parsed.minAccuracyPass);
        if (typeof parsed.srsGrammarInterval === "number") setSrsGrammarInterval(parsed.srsGrammarInterval);
        if (typeof parsed.shuffleQuestions === "boolean") setShuffleQuestions(parsed.shuffleQuestions);
        if (typeof parsed.showExplanationImmediately === "boolean")
          setShowExplanationImmediately(parsed.showExplanationImmediately);
      }
    } catch {
      setConfigError("Không thể đọc cấu hình đã lưu trên trình duyệt.");
    }
  }, []);

  // Áp dụng bộ Preset chiến lược sư phạm 1-click
  const applyPreset = (preset: "academy" | "crash_course" | "advanced") => {
    if (preset === "academy") {
      setMinAccuracyPass(80);
      setSrsGrammarInterval(3);
      setShuffleQuestions(true);
      setShowExplanationImmediately(true);
    } else if (preset === "crash_course") {
      setMinAccuracyPass(70);
      setSrsGrammarInterval(2);
      setShuffleQuestions(true);
      setShowExplanationImmediately(true);
    } else {
      setMinAccuracyPass(90);
      setSrsGrammarInterval(5);
      setShuffleQuestions(true);
      setShowExplanationImmediately(false);
    }
  };

  const handleSave = () => {
    try {
      const config = {
        minAccuracyPass,
        srsGrammarInterval,
        shuffleQuestions,
        showExplanationImmediately,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent("toeic-grammar-config-updated", { detail: config }));
      setConfigError(null);
    } catch {
      setSavedSuccess(false);
      setConfigError("Không thể lưu cấu hình vào trình duyệt.");
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        title: "TOEIC Grammar Curriculum Data",
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        config: {
          minAccuracyPass,
          srsGrammarInterval,
          shuffleQuestions,
          showExplanationImmediately,
        },
        topicsCount: topics.length || topicsCount,
        topics: topics.map((t) => ({
          code: t.code,
          titleVi: t.titleVi || t.title,
          titleEn: t.titleEn || t.englishTitle,
          part: t.part,
          targetScore: t.targetScore,
          formula: t.formula,
          summary: t.summary,
          trapsCount: t.traps?.length || 0,
          questionsCount: t.questions?.length || 0,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toeic_grammar_curriculum_lms_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadMsg("Đã xuất file LMS (JSON) thành công!");
      setTimeout(() => setDownloadMsg(null), 3000);
    } catch {
      alert("Xuất file thất bại.");
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = "Mã chủ điểm,Tên chủ điểm,Phần thi,Mục tiêu điểm,Số câu hỏi,Bẫy đề thi\n";
      topics.forEach((t) => {
        const title = `"${(t.titleVi || t.title || "").replace(/"/g, '""')}"`;
        const traps = `"${(t.traps || []).join("; ").replace(/"/g, '""')}"`;
        csvContent += `${t.code},${title},${t.part},${t.targetScore},${t.questions?.length || 0},${traps}\n`;
      });

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `toeic_grammar_topics_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadMsg("Đã xuất file CSV thành công!");
      setTimeout(() => setDownloadMsg(null), 3000);
    } catch {
      alert("Xuất file CSV thất bại.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
      {/* Toast thông báo tải file */}
      {downloadMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* 1. KHỐI CHÍNH: QUY CHUẨN ĐẠT & ĐỒNG BỘ GIÁO TRÌNH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CỘT TRÁI: QUY CHUẨN ĐẠT CHUYÊN ĐỀ & KIỂM TRA */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quy Chuẩn Đạt Chuyên Đề &amp; Kiểm Tra
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập mốc phần trăm tối thiểu và cơ chế lặp lại ngắt quãng (SRS)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold font-mono">
              Chuẩn: {minAccuracyPass}%
            </span>
          </div>

          <div className="space-y-4 text-xs font-medium text-slate-700">
            {/* Slider 1: Tỷ lệ làm đúng tối thiểu */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Tỷ lệ làm đúng tối thiểu để mở khóa:</span>
                <span className="font-bold text-blue-600 font-mono text-sm">{minAccuracyPass}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={minAccuracyPass}
                onChange={(e) => setMinAccuracyPass(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>50% (Cơ bản)</span>
                <span className="text-slate-600 font-medium">Khuyên dùng: 80%</span>
                <span>100% (Tuyệt đối)</span>
              </div>
            </div>

            {/* Slider 2: Chu kỳ SRS */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Chu kỳ lặp lại ngắt quãng (SRS) cho câu sai:</span>
                <span className="font-bold text-blue-600 font-mono text-sm">{srsGrammarInterval} ngày</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={srsGrammarInterval}
                onChange={(e) => setSrsGrammarInterval(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1 ngày (Ôn gấp)</span>
                <span className="text-slate-600 font-medium">Chuẩn Ebbinghaus: 3 ngày</span>
                <span>7 ngày (1 tuần)</span>
              </div>
            </div>

            {/* Checkbox 1: Xáo trộn câu hỏi */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl cursor-pointer border border-slate-200/70 transition">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-400 mt-0.5"
              />
              <div>
                <span className="block font-semibold text-slate-900">
                  Xáo trộn thứ tự câu hỏi và phương án A-B-C-D
                </span>
                <span className="text-[11px] text-slate-500">
                  Chống học vẹt vị trí đáp án; mỗi lần làm bài câu hỏi sẽ được sắp xếp ngẫu nhiên.
                </span>
              </div>
            </label>

            {/* Checkbox 2: Hiển thị giải thích ngay */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl cursor-pointer border border-slate-200/70 transition">
              <input
                type="checkbox"
                checked={showExplanationImmediately}
                onChange={(e) => setShowExplanationImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-400 mt-0.5"
              />
              <div>
                <span className="block font-semibold text-slate-900">
                  Hiển thị giải thích chi tiết &amp; bẫy đề ngay sau khi trả lời
                </span>
                <span className="text-[11px] text-slate-500">
                  {showExplanationImmediately
                    ? "Đang bật: Học viên thấy ngay giải thích và bẫy đề để sửa sai tức thì."
                    : "Đang tắt: Chế độ thi thử nghiêm túc (làm xong toàn bộ mới xem đáp án)."}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* CỘT PHẢI: ĐỒNG BỘ GIÁO TRÌNH & XUẤT DỮ LIỆU */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Đồng Bộ Giáo Trình &amp; Xuất Dữ Liệu
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phát hành dữ liệu chuyên đề và ngân hàng bẫy đề thi ra file chuẩn LMS
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Dữ liệu backend
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Đang hiển thị <strong className="text-slate-900">{topicsCount} chuyên đề ngữ pháp</strong> đã tải từ backend. Có thể xuất dữ liệu hiện có; việc phát hành được quản lý trong mục Rà soát nội dung.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Thông số hệ thống:</span>
              <div className="flex justify-between text-slate-600">
                <span>Nguồn dữ liệu:</span>
                <strong className="font-mono text-slate-900">Backend · grammar_topics</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tổng số chuyên đề:</span>
                <strong className="font-mono text-slate-900">{topicsCount} chủ điểm cốt lõi</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Chu kỳ ôn tập SRS:</span>
                <strong className="font-mono text-slate-900">{srsGrammarInterval} ngày sau câu sai</strong>
              </div>
            </div>

            {/* Các nút tải file thực tế */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">Xuất dữ liệu giáo trình:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xuất file LMS (JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất bảng câu hỏi (CSV)</span>
                </button>
              </div>
            </div>
          </div>

          {configError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{configError}</p> : null}
          <p className="text-[11px] text-slate-500">Cấu hình được lưu trong trình duyệt hiện tại; chưa đồng bộ với backend hoặc thiết bị khác.</p>
          {/* Nút lưu cấu hình */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? "Đã lưu trên trình duyệt" : "Lưu cấu hình trình duyệt"}</span>
            </button>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Đã đồng bộ vào hệ thống phòng thi!</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. CHỌN NHANH CHIẾN LƯỢC SƯ PHẠM (3 PRESETS 1-CLICK) */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-800 block">
          Chọn nhanh chế độ lộ trình (1-Click Presets):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => applyPreset("academy")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              minAccuracyPass === 80 && srsGrammarInterval === 3 && showExplanationImmediately
                ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Chuẩn Academy (Khuyên dùng)</span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                Cân bằng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đạt chuẩn: 80% • SRS: 3 ngày • Bật xáo trộn • Xem giải thích ngay sau mỗi câu.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("crash_course")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              minAccuracyPass === 70 && srsGrammarInterval === 2 && showExplanationImmediately
                ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Luyện thi cấp tốc</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Tốc độ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đạt chuẩn: 70% • SRS: 2 ngày • Đẩy nhanh tiến độ hoàn thành các chuyên đề.
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyPreset("advanced")}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
              minAccuracyPass === 90 && srsGrammarInterval === 5 && !showExplanationImmediately
                ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Chinh phục 850+ (Kỷ luật)</span>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                Nâng cao
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Đạt chuẩn: 90% • SRS: 5 ngày • Tắt xem giải thích giữa chừng (chế độ thi thật).
            </p>
          </button>
        </div>
      </div>

      {/* 3. TÁC ĐỘNG THỰC TẾ LÊN HỆ THỐNG */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          Tác động thực tế của cấu hình này lên toàn bộ hệ thống:
        </span>
        <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 pl-1 leading-relaxed">
          <li>
            <strong>Ngưỡng mở khóa bài học:</strong> Học viên phải làm đúng tối thiểu <strong>{minAccuracyPass}%</strong> số câu hỏi thì chuyên đề đó mới được đánh dấu là <em>&quot;Đạt chuẩn&quot;</em> và mở khóa bài tiếp theo.
          </li>
          <li>
            <strong>Chu kỳ ôn tập ngắt quãng (SRS):</strong> Khi học viên làm sai câu hỏi, hệ thống sẽ tự động lên lịch nhắc nhở làm lại câu sai sau đúng <strong>{srsGrammarInterval} ngày</strong>.
          </li>
          <li>
            <strong>Trải nghiệm phòng thi:</strong> {shuffleQuestions ? "Đang bật xáo trộn câu hỏi và đáp án A-B-C-D" : "Đang giữ nguyên thứ tự cố định"}. {showExplanationImmediately ? "Hiển thị giải thích & bẫy đề ngay sau mỗi câu" : "Chế độ thi thử (chỉ xem giải thích khi làm xong toàn bộ)"}.
          </li>
        </ul>
      </div>
    </div>
  );
};
