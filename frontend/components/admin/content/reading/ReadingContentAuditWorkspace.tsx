"use client";

import React, { useState, useMemo } from "react";
import { ExerciseCardData, SampleQuestion } from "@/app/admin/content/reading/types";
import { extractCardPassageBlocks } from "@/lib/readingPassageUtils";
import {
  ArrowLeft,
  Pencil,
  BookOpen,
  CheckCircle2,
  FileText,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

export interface ReadingContentAuditWorkspaceProps {
  card: ExerciseCardData;
  onClose: () => void;
  onOpenEditCard: (card: ExerciseCardData) => void;
  onSwitchToStudentView: (card: ExerciseCardData) => void;
  showToast: (msg: string) => void;
}

export const ReadingContentAuditWorkspace: React.FC<ReadingContentAuditWorkspaceProps> = ({
  card,
  onClose,
  onOpenEditCard,
  onSwitchToStudentView,
  showToast,
}) => {
  const [bilingualMode, setBilingualMode] = useState<"both" | "en" | "vi">("both");
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const questions: SampleQuestion[] = card.sampleQuestions && card.sampleQuestions.length > 0
    ? card.sampleQuestions
    : [
        {
          questionNum: "101",
          question: "Nội dung câu hỏi mẫu chưa được cập nhật.",
          bilingual: "Chưa có bản dịch",
          options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
          optionMeanings: ["", "", "", ""],
          correctIndex: 0,
          explanation: "Lời giải chi tiết đang được cập nhật.",
          steps: [],
          vocabList: [],
        },
      ];

  const currentQ = questions[selectedQuestionIndex] || questions[0];

  const handleCopyQuestion = (q: SampleQuestion, idx: number) => {
    const letters = ["A", "B", "C", "D"];
    const text = `Câu ${q.questionNum}: ${q.question}\n` +
      q.options.map((opt, i) => `(${letters[i]}) ${opt}`).join("\n") +
      `\nĐáp án: ${letters[q.correctIndex]}\nLời giải: ${q.explanation || "N/A"}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast(`Đã sao chép nội dung Câu ${q.questionNum}! 📋`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const passageBlocks = useMemo(() => extractCardPassageBlocks(card), [card]);
  const hasPassage = passageBlocks.length > 0;
  const hasAnyPassageVi = passageBlocks.some((b) => Boolean(b.textVi));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Quay lại</span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wider whitespace-nowrap">
                  Chế độ kiểm duyệt đề thi
                </span>
                <span className="text-xs font-medium text-slate-400">/</span>
                <span className="text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">
                  {card.category}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-950 truncate">
                {card.title}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenEditCard(card)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Chỉnh sửa đề này</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchToStudentView(card)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer shadow-xs whitespace-nowrap"
              title="Chuyển sang giao diện mô phỏng làm bài của học sinh để thử tính giờ và bấm nộp bài"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Trải nghiệm góc nhìn học viên</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Danh sách ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Từng câu chi tiết
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Meta Infobar */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trạng thái: Đã phát hành</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Quy mô: {questions.length} câu hỏi</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Quy chuẩn: 5 điểm / câu đúng (TOEIC Scale)</span>
            </div>
            {card.tag && (
              <span className="text-slate-500">
                Chủ đề: <strong>{card.tag}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Chế độ kiểm duyệt dành cho Quản trị viên: Hiển thị sẵn đáp án đúng, giải thích và từ vựng.</span>
          </div>
        </div>

        {/* CARD-LEVEL VOCABULARY SECTION */}
        {card.vocabList && card.vocabList.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Từ vựng trọng tâm chung của bài đọc ({card.vocabList.length} từ)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {card.vocabList.map((v, vIdx) => (
                <div
                  key={vIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  <span className="font-bold text-blue-700">{v.word}</span>
                  {v.pos && <span className="text-slate-500 text-[10px]">({v.pos})</span>}
                  {v.ipa && <span className="text-slate-400 font-mono text-[10px]">{v.ipa}</span>}
                  {v.meaning && (
                    <span className="text-slate-600 text-[11px] border-l border-slate-300 pl-1.5">
                      {v.meaning}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSAGE SECTION (If Part 6 or 7) */}
        {hasPassage && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <h2 className="text-sm font-bold text-slate-900">
                  Đoạn văn đọc hiểu đính kèm ({card.category.toUpperCase()}) · {passageBlocks.length} đoạn
                </h2>
              </div>

              {hasAnyPassageVi && (
                <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBilingualMode("both")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      bilingualMode === "both" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Song ngữ song song
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilingualMode("en")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      bilingualMode === "en" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Chỉ tiếng Anh
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilingualMode("vi")}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      bilingualMode === "vi" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Chỉ tiếng Việt
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 space-y-5">
              {passageBlocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className={bIdx > 0 ? "pt-5 border-t border-slate-200 space-y-2.5" : "space-y-2.5"}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                      {block.label}
                    </span>
                    {block.questionNums.length > 0 && (
                      <span className="text-[11px] font-mono text-slate-500">
                        Câu {block.questionNums.map((n) => `#${n}`).join(", ")}
                      </span>
                    )}
                  </div>

                  {bilingualMode === "both" && block.textVi ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                          Văn bản gốc (English)
                        </span>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-sans text-slate-800 leading-relaxed whitespace-pre-line">
                          {block.text}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Bản dịch chuẩn (Tiếng Việt)
                        </span>
                        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 text-sm font-sans text-slate-800 leading-relaxed whitespace-pre-line">
                          {block.textVi}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-sans text-slate-800 leading-relaxed whitespace-pre-line">
                      {bilingualMode === "vi" && block.textVi ? block.textVi : block.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 1: AUDIT LIST VIEW (TẤT CẢ CÂU HỎI TRÊN MỘT TRANG) */}
        {viewMode === "list" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>Danh sách câu hỏi &amp; Đáp án đối soát</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {questions.length} câu
                </span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Click vào nút sao chép để copy câu hỏi gửi vào tài liệu giảng dạy
              </span>
            </div>

            {questions.map((q, idx) => {
              const letters = ["A", "B", "C", "D"];
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition hover:border-slate-300"
                >
                  {/* Question Title Bar */}
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-extrabold">
                        Câu {q.questionNum || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Đáp án đúng: ({letters[q.correctIndex]})
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        +5 điểm
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(q, idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        title="Sao chép câu hỏi và đáp án"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {q.question}
                      </p>
                      {q.bilingual && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          Dịch: {q.bilingual}
                        </p>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctIndex;
                        const meaning = q.optionMeanings?.[oIdx];

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                              isCorrect
                                ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 shadow-2xs font-bold"
                                : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {letters[oIdx]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold leading-relaxed">
                                {opt}
                              </p>
                              {meaning && (
                                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                                  {meaning}
                                </p>
                              )}
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                        <p className="font-bold text-amber-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Giải thích chi tiết &amp; Phương pháp làm bài:</span>
                        </p>
                        <p className="leading-relaxed whitespace-pre-line text-slate-800">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    {/* Vocabulary List */}
                    {q.vocabList && q.vocabList.length > 0 && (
                      <div className="pt-1">
                        <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Từ vựng trọng tâm trong câu ({q.vocabList.length} từ):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {q.vocabList.map((v, vIdx) => (
                            <div
                              key={vIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                            >
                              <span className="font-bold text-blue-700">{v.word}</span>
                              {v.pos && <span className="text-slate-500 text-[10px]">{v.pos}</span>}
                              {v.meaning && (
                                <span className="text-slate-600 text-[11px] border-l border-slate-300 pl-1.5">
                                  {v.meaning}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODE 2: CARD-BY-CARD VIEW (XEM TỪNG CÂU VỚI THANH ĐIỀU HƯỚNG) */}
        {viewMode === "card" && (
          <div className="space-y-4">
            {/* Question Quick Jump Pills */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-slate-600 mb-2">
                Chọn nhanh câu hỏi cần xem ({questions.length} câu):
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedQuestionIndex(idx)}
                    className={`w-9 h-8 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center ${
                      selectedQuestionIndex === idx
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {q.questionNum || idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Single Question Inspector Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono text-sm font-extrabold">
                    Câu {currentQ.questionNum || selectedQuestionIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    Đáp án đúng: ({["A", "B", "C", "D"][currentQ.correctIndex]})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={selectedQuestionIndex === 0}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600">
                    {selectedQuestionIndex + 1} / {questions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    disabled={selectedQuestionIndex === questions.length - 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>
                  {currentQ.bilingual && (
                    <p className="mt-1.5 text-xs text-slate-500 italic">
                      Dịch: {currentQ.bilingual}
                    </p>
                  )}
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQ.options.map((opt, oIdx) => {
                    const letters = ["A", "B", "C", "D"];
                    const isCorrect = oIdx === currentQ.correctIndex;
                    const meaning = currentQ.optionMeanings?.[oIdx];

                    return (
                      <div
                        key={oIdx}
                        className={`p-4 rounded-xl border flex items-start gap-3 ${
                          isCorrect
                            ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {letters[oIdx]}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{opt}</p>
                          {meaning && (
                            <p className="text-xs text-slate-500 font-normal mt-0.5">{meaning}</p>
                          )}
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                            Đáp án đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {currentQ.explanation && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-800 space-y-1.5">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Giải thích chi tiết &amp; Phương pháp làm bài:</span>
                    </p>
                    <p className="leading-relaxed whitespace-pre-line">{currentQ.explanation}</p>
                  </div>
                )}

                {/* Vocabulary List in Card View */}
                {currentQ.vocabList && currentQ.vocabList.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Từ vựng trọng tâm trong câu ({currentQ.vocabList.length} từ):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentQ.vocabList.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                        >
                          <span className="font-bold text-blue-700">{v.word}</span>
                          {v.pos && <span className="text-slate-500 text-[10px]">({v.pos})</span>}
                          {v.ipa && <span className="text-slate-400 font-mono text-[10px]">{v.ipa}</span>}
                          {v.meaning && (
                            <span className="text-slate-600 text-[11px] border-l border-slate-300 pl-1.5">
                              {v.meaning}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
