"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Clock,
  Eye,
  BookOpen,
  Filter,
  Layers,
  Save,
  Zap,
  Gauge,
  AlertTriangle,
  Target,
  Sparkles,
  BarChart3,
  Timer,
  Check,
  RotateCcw,
  Info,
  ShieldCheck,
  Flame,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  TrendingDown,
  HelpCircle,
  Award,
  Play,
  Edit3,
  Trash2,
  Plus,
  Languages,
} from "lucide-react";
import { ExerciseCardData, VocabItem } from "@/app/admin/content/reading/types";
import { extractCardPassageBlocks } from "@/lib/readingPassageUtils";

export interface ReadingPassageBankViewProps {
  cards?: ExerciseCardData[];
  onStartPractice?: (card: ExerciseCardData) => void;
  onOpenEditCard?: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm?: (card: ExerciseCardData) => void;
  onEnsureCardDetails?: (card: ExerciseCardData) => Promise<ExerciseCardData>;
  onOpenCreatePassage?: () => void;
}

interface PassageItem {
  id: string;
  title: string;
  type: string;
  format: string;
  wordCount: number;
  questionsCount: number;
  vocabCount: number;
  topic: string;
  text: string;
  translation: string;
  hasBilingual: boolean;
  card: ExerciseCardData;
}

// ==========================================
// 1. KHO ĐOẠN VĂN READING PART 6 & 7 (PASSAGE BANK)
// ==========================================
export const ReadingPassageBankView: React.FC<ReadingPassageBankViewProps> = ({
  cards = [],
  onStartPractice,
  onOpenEditCard,
  onOpenDeleteConfirm,
  onEnsureCardDetails,
  onOpenCreatePassage,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [bilingualFilter, setBilingualFilter] = useState<"ALL" | "BILINGUAL" | "UNTRANSLATED">("ALL");
  const [previewPassage, setPreviewPassage] = useState<PassageItem | null>(null);

  // Unified list of passages derived from real cards + built-in examples
  const passageItems: PassageItem[] = useMemo(() => {
    // 1. Built-in fallback passages
    // 2. Real cards from user & database that have genuine Part 6 or Part 7 passages
    const realCardWithBlocks = (cards || [])
      .filter((c) => c.category === "part6" || c.category === "part7")
      .map((c) => ({ card: c, blocks: extractCardPassageBlocks(c) }))
      .filter(({ blocks }) => blocks.length > 0);

    if (realCardWithBlocks.length === 0) return [];

    const convertedRealCards: PassageItem[] = realCardWithBlocks.map(({ card: c, blocks }) => {
      const text =
        blocks.length > 1
          ? blocks.map((b) => `[${b.label}]\n${b.text}`).join("\n\n---\n\n")
          : blocks[0].text;
      const viParts = blocks
        .map((b) => (b.textVi ? (blocks.length > 1 ? `[${b.label}]\n${b.textVi}` : b.textVi) : ""))
        .filter(Boolean);
      const translation = viParts.join("\n\n---\n\n");
      const wordCount = blocks.reduce(
        (sum, b) => sum + b.text.trim().split(/\s+/).filter(Boolean).length,
        0
      );
      const questionsCount = c.sampleQuestions?.length || c.totalQuestions || 0;
      const seenVocab = new Set<string>();
      (c.vocabList || []).forEach((v) => {
        if (v.word?.trim()) seenVocab.add(v.word.trim().toLowerCase());
      });
      (c.sampleQuestions || []).forEach((q) => {
        (q.vocabList || []).forEach((v) => {
          if (v.word?.trim()) seenVocab.add(v.word.trim().toLowerCase());
        });
      });
      const vocabCount = seenVocab.size;

      // Determine Type (Part 6 / Part 7 Single / Double / Triple)
      let type = "Part 7 Single";
      if (c.category === "part6") {
        type = "Part 6";
      } else if (c.category === "part7") {
        const lowerTitle = c.title.toLowerCase();
        const lowerTag = (c.tag || "").toLowerCase();
        const hasTriple =
          lowerTitle.includes("triple") ||
          lowerTag.includes("triple") ||
          lowerTitle.includes("đoạn ba") ||
          (c.sampleQuestions || []).some((q) => (q.passages?.length || 0) >= 3);
        const hasDouble =
          lowerTitle.includes("double") ||
          lowerTag.includes("double") ||
          lowerTitle.includes("đoạn đôi") ||
          (c.sampleQuestions || []).some((q) => (q.passages?.length || 0) === 2);
        if (hasTriple) {
          type = "Part 7 Triple";
        } else if (hasDouble) {
          type = "Part 7 Double";
        } else if (blocks.length > 1) {
          type = "Part 7 Full";
        } else {
          type = "Part 7 Single";
        }
      }

      // Determine Format
      let format = c.tag?.split("·")[0]?.trim() || "";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("to:") && lowerText.includes("from:") && lowerText.includes("subject:")) {
        format = "Email / Thư điện tử";
      } else if (lowerText.includes("memo") || lowerText.includes("memorandum")) {
        format = "Memo / Thông báo nội bộ";
      } else if (lowerText.includes("dear") && lowerText.includes("sincerely")) {
        format = "Letter / Thư tín thương mại";
      } else if (lowerText.includes("order") || lowerText.includes("invoice") || lowerText.includes("receipt")) {
        format = "Order / Hóa đơn & Đơn hàng";
      } else if (lowerText.includes("notice") || lowerText.includes("attention")) {
        format = "Notice / Thông báo chung";
      } else if (c.category === "part6") {
        format = "Text Completion / Điền đoạn văn";
      }

      // Determine Topic
      const topic = c.subtitle || "";

      const displayId = c.id;

      return {
        id: displayId,
        title: c.title,
        type,
        format,
        wordCount,
        questionsCount,
        vocabCount,
        topic,
        text,
        translation,
        hasBilingual: Boolean(translation.trim()),
        card: c,
      };
    });

    return convertedRealCards;
  }, [cards]);

  const filtered = useMemo(() => {
    return passageItems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.topic.toLowerCase().includes(search.toLowerCase()) ||
        p.format.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === "ALL" || p.type.startsWith(filterType);

      const matchBilingual =
        bilingualFilter === "ALL"
          ? true
          : bilingualFilter === "BILINGUAL"
          ? p.hasBilingual
          : !p.hasBilingual;

      return matchSearch && matchType && matchBilingual;
    });
  }, [passageItems, search, filterType, bilingualFilter]);

  return (
    <div className="@container w-full space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col @4xl:flex-row @4xl:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full @4xl:w-72 @5xl:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, thể loại, chủ đề, mã..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filter Selects & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full @4xl:w-auto justify-start @4xl:justify-end">
          {/* Format / Part filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả định dạng đoạn văn</option>
            <option value="Part 6">Part 6 (Điền đoạn văn)</option>
            <option value="Part 7 Single">Part 7 (Đoạn đơn - Single)</option>
            <option value="Part 7 Double">Part 7 (Đoạn đôi - Double)</option>
            <option value="Part 7 Triple">Part 7 (Đoạn ba - Triple)</option>
          </select>

          {/* Bilingual Filter */}
          <select
            value={bilingualFilter}
            onChange={(e) => setBilingualFilter(e.target.value as "ALL" | "BILINGUAL" | "UNTRANSLATED")}
            className="w-full sm:w-auto px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái dịch</option>
            <option value="BILINGUAL">Đã có dịch song ngữ (EN-VI)</option>
            <option value="UNTRANSLATED">Chưa có bản dịch tiếng Việt</option>
          </select>

          {/* Create Button */}
          {onOpenCreatePassage && (
            <button
              type="button"
              onClick={onOpenCreatePassage}
              className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm đoạn văn mới</span>
            </button>
          )}

          <span className="text-xs font-bold text-slate-500 whitespace-nowrap pl-1 ml-auto sm:ml-0">
            Tổng: <strong className="text-blue-700">{filtered.length}</strong> bài đọc
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 w-20">Mã</th>
                <th className="py-3.5 px-4 min-w-[280px]">Tiêu đề bài đọc TOEIC</th>
                <th className="py-3.5 px-4 min-w-[140px]">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[160px]">Chủ đề bài đọc</th>
                <th className="py-3.5 px-4 text-center min-w-[80px]">Độ dài</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Số câu &amp; Từ</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Bản dịch song ngữ</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">Không tìm thấy đoạn văn nào phù hợp</p>
                    <p className="text-xs mt-1">Thử đổi từ khóa tìm kiếm hoặc lọc theo định dạng khác.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isPart6 = p.type === "Part 6";
                  const isPart7Double = p.type === "Part 7 Double";
                  const isPart7Triple = p.type === "Part 7 Triple";

                  const badgeColor = isPart6
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : isPart7Triple
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isPart7Double
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* 1. MÃ */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {p.id}
                      </td>

                      {/* 2. TIÊU ĐỀ & PART BADGE */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-snug">{p.title}</p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold inline-block mt-1 whitespace-nowrap border ${badgeColor}`}
                        >
                          {p.type}
                        </span>
                      </td>

                      {/* 3. ĐỊNH DẠNG */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                        {p.format}
                      </td>

                      {/* 4. CHỦ ĐỀ */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap inline-flex items-center">
                          {p.topic}
                        </span>
                      </td>

                      {/* 5. ĐỘ DÀI */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-800 whitespace-nowrap">
                        {p.wordCount > 0 ? `${p.wordCount} từ` : "—"}
                      </td>

                      {/* 6. SỐ CÂU & TỪ VỰNG */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{p.questionsCount} câu</span>
                        {p.vocabCount > 0 && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold border border-amber-200 inline-block mt-0.5">
                            {p.vocabCount} từ vựng
                          </span>
                        )}
                      </td>

                      {/* 7. BẢN DỊCH SONG NGỮ */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {p.hasBilingual ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Song ngữ EN-VI</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Chưa có bản dịch
                          </span>
                        )}
                      </td>

                      {/* 8. THAO TÁC (XEM TRƯỚC, LUYỆN TẬP, SỬA, XÓA) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. XEM TRƯỚC (PREVIEW) */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewPassage(p);
                              if (
                                onEnsureCardDetails &&
                                !p.card.detailsLoaded &&
                                (!p.card.sampleQuestions || p.card.sampleQuestions.length === 0)
                              ) {
                                void onEnsureCardDetails(p.card).then((hydrated) => {
                                  const hydratedSeen = new Set<string>();
                                  (hydrated.vocabList || []).forEach((v) => {
                                    if (v.word?.trim()) hydratedSeen.add(v.word.trim().toLowerCase());
                                  });
                                  (hydrated.sampleQuestions || []).forEach((q) => {
                                    (q.vocabList || []).forEach((v) => {
                                      if (v.word?.trim()) hydratedSeen.add(v.word.trim().toLowerCase());
                                    });
                                  });
                                  setPreviewPassage((curr) =>
                                    curr && curr.card.id === hydrated.id
                                      ? {
                                          ...curr,
                                          card: hydrated,
                                          vocabCount: hydratedSeen.size || curr.vocabCount,
                                          questionsCount: hydrated.sampleQuestions?.length || curr.questionsCount,
                                        }
                                      : curr
                                  );
                                });
                              }
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-blue-600 transition cursor-pointer shadow-2xs"
                            title="Xem trước bài đọc song ngữ & câu hỏi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. VÀO LUYỆN TẬP / LÀM THỬ (PRACTICE) */}
                          {onStartPractice && (
                            <button
                              type="button"
                              onClick={() => onStartPractice(p.card)}
                              className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer shadow-2xs"
                              title="Kiểm duyệt & xem chi tiết đề thi"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          {/* 3. CHỈNH SỬA (EDIT) */}
                          {onOpenEditCard && (
                            <button
                              type="button"
                              onClick={(e) => onOpenEditCard(p.card, e)}
                              className="p-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer shadow-2xs"
                              title="Chỉnh sửa bài đọc, câu hỏi & từ vựng"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 4. XÓA (DELETE) */}
                          {onOpenDeleteConfirm && (
                            <button
                              type="button"
                              onClick={() => onOpenDeleteConfirm(p.card)}
                              className="p-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer shadow-2xs"
                              title="Xóa bài đọc này khỏi hệ thống"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Passage & Bilingual & Questions */}
      {previewPassage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 whitespace-nowrap">
                    {previewPassage.type}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {previewPassage.format} • {previewPassage.topic}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 leading-snug">
                  {previewPassage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              {/* Stats pill bar */}
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                <span>📏 Độ dài: <strong>{previewPassage.wordCount} từ</strong></span>
                <span>•</span>
                <span>❓ Bộ câu hỏi: <strong>{previewPassage.questionsCount} câu</strong></span>
                <span>•</span>
                <span>📚 Từ vựng trọng tâm: <strong>{previewPassage.vocabCount} từ</strong></span>
                <span>•</span>
                <span>
                  Trạng thái dịch:{" "}
                  <strong className={previewPassage.hasBilingual ? "text-emerald-700" : "text-slate-500"}>
                    {previewPassage.hasBilingual ? "Đã có dịch song ngữ ✓" : "Chưa có bản dịch"}
                  </strong>
                </span>
              </div>

              {/* Passage Texts (English & Vietnamese) */}
              <div className="space-y-3">
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                    Đoạn văn gốc tiếng Anh (Reading Passage - English):
                  </span>
                  <p className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                    {previewPassage.text || "Chưa có nội dung bài đọc tiếng Anh."}
                  </p>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider block flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bản dịch đối chiếu tiếng Việt (Vietnamese Translation):</span>
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {previewPassage.translation || "Chưa có bản dịch tiếng Việt cho đoạn văn này."}
                  </p>
                </div>
              </div>

              {/* Attached Questions Preview */}
              {previewPassage.card.sampleQuestions && previewPassage.card.sampleQuestions.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Danh sách câu hỏi trắc nghiệm ({previewPassage.card.sampleQuestions.length} câu):
                  </span>
                  <div className="space-y-2.5">
                    {previewPassage.card.sampleQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 min-w-0 flex-1">
                            Câu {qIdx + 1} {q.questionNum ? `(#${q.questionNum})` : ""}: {q.question}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] whitespace-nowrap shrink-0">
                            Đáp án: {["A", "B", "C", "D"][q.correctIndex] || "A"}
                          </span>
                        </div>
                        {q.bilingual && (
                          <p className="text-[11px] text-slate-500 italic">{q.bilingual}</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`px-2 py-1 rounded ${
                                optIdx === q.correctIndex
                                  ? "bg-emerald-100/70 text-emerald-900 font-bold border border-emerald-200"
                                  : "text-slate-600"
                              }`}
                            >
                              ({["A", "B", "C", "D"][optIdx]}) {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card & Question Vocabulary Preview */}
              {(() => {
                const vocabMap = new Map<string, VocabItem>();
                (previewPassage.card.vocabList || []).forEach((v) => {
                  const key = v.word?.trim().toLowerCase();
                  if (key && !vocabMap.has(key)) vocabMap.set(key, v);
                });
                (previewPassage.card.sampleQuestions || []).forEach((q) => {
                  (q.vocabList || []).forEach((v) => {
                    const key = v.word?.trim().toLowerCase();
                    if (key && !vocabMap.has(key)) vocabMap.set(key, v);
                  });
                });
                const combinedVocab = Array.from(vocabMap.values());
                if (combinedVocab.length === 0) return null;
                return (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                    <span className="text-xs font-bold text-amber-900 block">
                      Từ vựng trọng tâm của bài đọc ({combinedVocab.length} từ):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {combinedVocab.map((v, vIdx) => (
                        <div
                          key={`${v.word}-${vIdx}`}
                          className="p-2.5 rounded-xl bg-white border border-amber-200/70 text-[11px]"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-900">{v.word}</span>
                            {v.ipa && <span className="font-mono text-slate-500">{v.ipa}</span>}
                            {v.pos && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                {v.pos}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-0.5">{v.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer with quick action buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {onStartPractice && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = previewPassage.card;
                      setPreviewPassage(null);
                      onStartPractice(c);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Luyện tập bài này ngay</span>
                  </button>
                )}

                {onOpenEditCard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      const c = previewPassage.card;
                      setPreviewPassage(null);
                      onOpenEditCard(c, e);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa bài này</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. PHÂN TÍCH TỐC ĐỘ ĐỌC & ĐỘ CHÍNH XÁC (READING SPEED & ACCURACY ANALYTICS)
// ==========================================
export const ReadingAnalyticsView: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
    <h3 className="text-base font-semibold text-slate-900">Chưa có dữ liệu phân tích</h3>
    <p className="mt-2 text-sm text-slate-500">
      Báo cáo sẽ hiển thị khi hệ thống có dữ liệu kết quả học tập được lưu trên máy chủ.
    </p>
  </div>
);

export const ReadingCurriculumView: React.FC = () => {
  const LOCAL_CONFIG_KEY = "toeic_reading_time_config";

  const [part5Minutes, setPart5Minutes] = useState(12);
  const [part6Minutes, setPart6Minutes] = useState(10);
  const [part7SingleMinutes, setPart7SingleMinutes] = useState(27);
  const [part7MultiMinutes, setPart7MultiMinutes] = useState(26);
  const [targetWpm, setTargetWpm] = useState(160);

  // Cấu hình thời gian tối đa cho phép / ngưỡng cảnh báo từng câu hỏi
  const [part5TimeoutSeconds, setPart5TimeoutSeconds] = useState(40);
  const [part6TimeoutSeconds, setPart6TimeoutSeconds] = useState(60);
  const [part7TimeoutSeconds, setPart7TimeoutSeconds] = useState(90);

  // Phân loại lộ trình mục tiêu điểm
  const [targetScoreBand, setTargetScoreBand] = useState<"500-650" | "650-750" | "750-850" | "850-990">("650-750");

  const [enableBilingualByDefault, setEnableBilingualByDefault] = useState(true);
  const [enablePacingTimer, setEnablePacingTimer] = useState(true);
  const [enableTimeoutAlert, setEnableTimeoutAlert] = useState(true);
  const [speedDrillMode, setSpeedDrillMode] = useState(false);
  const [showTargetPaceBadge, setShowTargetPaceBadge] = useState(true);

  const [saved, setSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cấu hình từ localStorage nếu đã từng lưu
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.part5Minutes) setPart5Minutes(parsed.part5Minutes);
        if (parsed.part6Minutes) setPart6Minutes(parsed.part6Minutes);
        if (parsed.part7SingleMinutes) setPart7SingleMinutes(parsed.part7SingleMinutes);
        if (parsed.part7MultiMinutes) setPart7MultiMinutes(parsed.part7MultiMinutes);
        if (parsed.targetWpm) setTargetWpm(parsed.targetWpm);
        if (parsed.part5TimeoutSeconds) setPart5TimeoutSeconds(parsed.part5TimeoutSeconds);
        if (parsed.part6TimeoutSeconds) setPart6TimeoutSeconds(parsed.part6TimeoutSeconds);
        if (parsed.part7TimeoutSeconds) setPart7TimeoutSeconds(parsed.part7TimeoutSeconds);
        if (parsed.targetScoreBand) setTargetScoreBand(parsed.targetScoreBand);
        if (typeof parsed.enableBilingualByDefault === "boolean")
          setEnableBilingualByDefault(parsed.enableBilingualByDefault);
        if (typeof parsed.enablePacingTimer === "boolean")
          setEnablePacingTimer(parsed.enablePacingTimer);
        if (typeof parsed.enableTimeoutAlert === "boolean")
          setEnableTimeoutAlert(parsed.enableTimeoutAlert);
        if (typeof parsed.speedDrillMode === "boolean")
          setSpeedDrillMode(parsed.speedDrillMode);
        if (typeof parsed.showTargetPaceBadge === "boolean")
          setShowTargetPaceBadge(parsed.showTargetPaceBadge);
      }
    } catch {} finally {
      setIsLoaded(true);
    }
  }, []);

  // Tự động đồng bộ ngay lập tức sang hệ thống khi người dùng kéo sliders hoặc chọn Presets
  useEffect(() => {
    if (!isLoaded) return;
    const currentConfig = {
      part5Minutes,
      part6Minutes,
      part7SingleMinutes,
      part7MultiMinutes,
      targetWpm,
      part5TimeoutSeconds,
      part6TimeoutSeconds,
      part7TimeoutSeconds,
      targetScoreBand,
      enableBilingualByDefault,
      enablePacingTimer,
      enableTimeoutAlert,
      speedDrillMode,
      showTargetPaceBadge,
    };
    try {
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(currentConfig));
      window.dispatchEvent(
        new CustomEvent("toeic-reading-config-updated", { detail: currentConfig })
      );
    } catch {}
  }, [
    isLoaded,
    part5Minutes,
    part6Minutes,
    part7SingleMinutes,
    part7MultiMinutes,
    targetWpm,
    part5TimeoutSeconds,
    part6TimeoutSeconds,
    part7TimeoutSeconds,
    targetScoreBand,
    enableBilingualByDefault,
    enablePacingTimer,
    enableTimeoutAlert,
    speedDrillMode,
    showTargetPaceBadge,
  ]);

  const totalMinutes = part5Minutes + part6Minutes + part7SingleMinutes + part7MultiMinutes;
  const part7TotalMinutes = part7SingleMinutes + part7MultiMinutes;

  // Tự động cân bằng thời gian về đúng chuẩn 75 phút
  const handleAutoBalance = () => {
    const current = part5Minutes + part6Minutes + part7SingleMinutes + part7MultiMinutes;
    const diff = 75 - current;
    if (diff === 0) return;

    let rem = diff;
    let newP7Multi = part7MultiMinutes;
    let newP7Single = part7SingleMinutes;
    let newP6 = part6Minutes;

    // Phân bổ phần chênh lệch đều cho Part 7 đoạn đơn & kép/ba
    const half1 = Math.round(rem / 2);
    const half2 = rem - half1;

    newP7Multi = Math.min(35, Math.max(20, newP7Multi + half1));
    rem -= (newP7Multi - part7MultiMinutes);

    newP7Single = Math.min(35, Math.max(20, newP7Single + rem));
    rem -= (newP7Single - part7SingleMinutes);

    if (rem !== 0) {
      newP6 = Math.min(15, Math.max(6, newP6 + rem));
    }

    setPart7MultiMinutes(newP7Multi);
    setPart7SingleMinutes(newP7Single);
    setPart6Minutes(newP6);
  };

  // Áp dụng bộ Preset chiến lược phân bổ nhanh
  const applyPreset = (type: "balanced" | "part7_focus" | "grammar_focus" | "speed_master") => {
    if (type === "balanced") {
      setPart5Minutes(12);
      setPart6Minutes(10);
      setPart7SingleMinutes(27);
      setPart7MultiMinutes(26);
      setTargetWpm(160);
      setPart5TimeoutSeconds(40);
      setPart6TimeoutSeconds(60);
      setPart7TimeoutSeconds(90);
      setTargetScoreBand("650-750");
    } else if (type === "part7_focus") {
      setPart5Minutes(10);
      setPart6Minutes(8);
      setPart7SingleMinutes(29);
      setPart7MultiMinutes(28);
      setTargetWpm(175);
      setPart5TimeoutSeconds(30);
      setPart6TimeoutSeconds(45);
      setPart7TimeoutSeconds(80);
      setTargetScoreBand("750-850");
    } else if (type === "grammar_focus") {
      setPart5Minutes(15);
      setPart6Minutes(10);
      setPart7SingleMinutes(27);
      setPart7MultiMinutes(23);
      setTargetWpm(145);
      setPart5TimeoutSeconds(45);
      setPart6TimeoutSeconds(70);
      setPart7TimeoutSeconds(100);
      setTargetScoreBand("500-650");
    } else {
      // speed_master
      setPart5Minutes(8);
      setPart6Minutes(7);
      setPart7SingleMinutes(30);
      setPart7MultiMinutes(30);
      setTargetWpm(190);
      setPart5TimeoutSeconds(25);
      setPart6TimeoutSeconds(40);
      setPart7TimeoutSeconds(75);
      setTargetScoreBand("850-990");
    }
  };

  const handleSave = () => {
    try {
      const config = {
        part5Minutes,
        part6Minutes,
        part7SingleMinutes,
        part7MultiMinutes,
        targetWpm,
        part5TimeoutSeconds,
        part6TimeoutSeconds,
        part7TimeoutSeconds,
        targetScoreBand,
        enableBilingualByDefault,
        enablePacingTimer,
        enableTimeoutAlert,
        speedDrillMode,
        showTargetPaceBadge,
      };
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
      window.dispatchEvent(
        new CustomEvent("toeic-reading-config-updated", { detail: config })
      );
    } catch {}

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDefault = () => {
    applyPreset("balanced");
  };

  return (
    <div className="@container w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. KHUNG TỔNG THỜI GIAN 75 PHÚT & ĐÁNH GIÁ PHÂN BỔ */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col @2xl:flex-row @2xl:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <span className="p-2 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Sliders className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                Chiến Lược Phân Bổ Thời Gian Chuẩn 75 Phút TOEIC Reading
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Cấu hình thời gian tối đa và tốc độ đọc mục tiêu cho 100 câu hỏi (Part 5: 30 câu, Part 6: 16 câu, Part 7: 54 câu).
              </p>
            </div>
          </div>

          {/* Badge tổng thời gian & Nút tự động cân bằng */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start @2xl:self-auto">
            {totalMinutes !== 75 && (
              <button
                type="button"
                onClick={handleAutoBalance}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                title="Tự động cân bằng thời gian các phần về đúng chuẩn 75 phút"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động cân bằng 75 phút</span>
              </button>
            )}
            <span
              className={`px-4 py-2 rounded-2xl font-black text-xs font-mono inline-flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 ${
                totalMinutes === 75
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : totalMinutes > 75
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : "bg-blue-100 text-blue-900 border border-blue-300"
              }`}
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span>Tổng: {totalMinutes} / 75 phút</span>
            </span>
          </div>
        </div>

        {/* Thanh trực quan hóa tỷ lệ phần trăm phân bổ 75 phút (Stacked Progress Bar) */}
        <div className="space-y-1.5 pt-1 pb-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Tỷ lệ phân bổ thời gian thực tế giữa các phần thi:</span>
            <span className="font-mono text-slate-700">
              {totalMinutes} phút ({Math.round((totalMinutes / 75) * 100)}% chuẩn thi)
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${(part5Minutes / totalMinutes) * 100}%` }}
              className="bg-blue-600 transition-all duration-300"
              title={`Part 5: ${part5Minutes}p (~${Math.round((part5Minutes / totalMinutes) * 100)}%)`}
            />
            <div
              style={{ width: `${(part6Minutes / totalMinutes) * 100}%` }}
              className="bg-purple-600 transition-all duration-300"
              title={`Part 6: ${part6Minutes}p (~${Math.round((part6Minutes / totalMinutes) * 100)}%)`}
            />
            <div
              style={{ width: `${(part7SingleMinutes / totalMinutes) * 100}%` }}
              className="bg-indigo-600 transition-all duration-300"
              title={`Part 7 Đoạn đơn: ${part7SingleMinutes}p (~${Math.round((part7SingleMinutes / totalMinutes) * 100)}%)`}
            />
            <div
              style={{ width: `${(part7MultiMinutes / totalMinutes) * 100}%` }}
              className="bg-emerald-600 transition-all duration-300"
              title={`Part 7 Đoạn kép/ba: ${part7MultiMinutes}p (~${Math.round((part7MultiMinutes / totalMinutes) * 100)}%)`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-0.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Part 5: {part5Minutes}p ({Math.round((part5Minutes / totalMinutes) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Part 6: {part6Minutes}p ({Math.round((part6Minutes / totalMinutes) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Part 7 Đoạn đơn: {part7SingleMinutes}p ({Math.round((part7SingleMinutes / totalMinutes) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Part 7 Kép/Ba: {part7MultiMinutes}p ({Math.round((part7MultiMinutes / totalMinutes) * 100)}%)
            </span>
          </div>
        </div>

        {/* 4 PRESETS CHIẾN LƯỢC 1-CLICK */}
        <div className="space-y-2.5 pt-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Chọn nhanh chiến lược phân bổ thời gian:
          </span>
          <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => applyPreset("balanced")}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer group flex flex-col justify-between gap-2 ${
                part5Minutes === 12 && part6Minutes === 10 && part7SingleMinutes === 27 && part7MultiMinutes === 26
                  ? "border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-500"
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 leading-snug">
                  🌟 Chuẩn ETS (Cân bằng)
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                P5: 12p • P6: 10p • P7: 53p (27p đơn + 26p kép/ba). Tốc độ 160 WPM.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("part7_focus")}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer group flex flex-col justify-between gap-2 ${
                part5Minutes === 10 && part6Minutes === 8 && part7SingleMinutes === 29 && part7MultiMinutes === 28
                  ? "border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 leading-snug">
                  ⚡ Bứt phá Part 7 (750+)
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                  Target cao
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                P5: 10p • P6: 8p • P7: 57p (Dồn tối đa thời gian cho đoạn văn dài).
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("grammar_focus")}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer group flex flex-col justify-between gap-2 ${
                part5Minutes === 15 && part6Minutes === 10 && part7SingleMinutes === 27 && part7MultiMinutes === 23
                  ? "border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500"
                  : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 leading-snug">
                  🛡️ Vững ngữ pháp (500-650)
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                  Cơ bản
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                P5: 15p • P6: 10p • P7: 50p (Làm chắc chắn điểm ngữ pháp Part 5-6).
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset("speed_master")}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition cursor-pointer group flex flex-col justify-between gap-2 ${
                part5Minutes === 8 && part6Minutes === 7 && part7SingleMinutes === 30 && part7MultiMinutes === 30
                  ? "border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500"
                  : "border-slate-200 hover:border-amber-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 group-hover:text-amber-700 leading-snug">
                  🚀 Thần tốc 900+ (Tốc độ đỉnh)
                </span>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                  Cao cấp
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                P5: 8p • P6: 7p • P7: 60p (Tối ưu 16s/câu Part 5, 190 WPM Part 7).
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THANH TRƯỢT CHI TIẾT TỪNG PHẦN THI (SLIDERS CHUẨN TỪNG GIÂY) */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-5 sm:space-y-6">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Tùy Chỉnh Thời Gian Chi Tiết Cho Từng Phần Thi (Sliders)</span>
        </h4>

        <div className="space-y-4 sm:space-y-5 text-xs font-semibold text-slate-700">
          {/* Part 5 Slider */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-1.5 @xl:gap-3">
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm">Part 5 - Điền câu ngữ pháp &amp; từ vựng</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">30 câu hỏi đơn (Câu 101 - 130)</span>
              </div>
              <div className="flex items-baseline @xl:flex-col @xl:items-end justify-between @xl:justify-center gap-2 @xl:gap-0 shrink-0 @xl:text-right">
                <span className="font-black text-blue-700 font-mono text-base whitespace-nowrap">{part5Minutes} phút</span>
                <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  ~{Math.round((part5Minutes * 60) / 30)} giây / câu
                </span>
              </div>
            </div>
            <input
              type="range"
              min="8"
              max="18"
              step="1"
              value={part5Minutes}
              onChange={(e) => setPart5Minutes(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <span className="whitespace-nowrap">8 phút (Siêu tốc: 16s/câu)</span>
              <span className="text-blue-600 font-bold whitespace-nowrap">Khuyến nghị: 10 - 12 phút</span>
              <span className="whitespace-nowrap">18 phút (Tối đa)</span>
            </div>
          </div>

          {/* Part 6 Slider */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-1.5 @xl:gap-3">
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm">Part 6 - Hoàn thành đoạn văn</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">16 câu hỏi trong 4 đoạn văn (Câu 131 - 146)</span>
              </div>
              <div className="flex items-baseline @xl:flex-col @xl:items-end justify-between @xl:justify-center gap-2 @xl:gap-0 shrink-0 @xl:text-right">
                <span className="font-black text-blue-700 font-mono text-base whitespace-nowrap">{part6Minutes} phút</span>
                <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  ~{Math.round((part6Minutes * 60) / 16)} giây / câu (~{(part6Minutes / 4).toFixed(1)}p / đoạn)
                </span>
              </div>
            </div>
            <input
              type="range"
              min="6"
              max="15"
              step="1"
              value={part6Minutes}
              onChange={(e) => setPart6Minutes(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <span className="whitespace-nowrap">6 phút (Nhanh)</span>
              <span className="text-blue-600 font-bold whitespace-nowrap">Khuyến nghị: 8 - 10 phút</span>
              <span className="whitespace-nowrap">15 phút (Chậm)</span>
            </div>
          </div>

          {/* Part 7 Single Slider */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-1.5 @xl:gap-3">
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm">Part 7 - Đoạn đơn (Single Passages)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">29 câu hỏi (Câu 147 - 175)</span>
              </div>
              <div className="flex items-baseline @xl:flex-col @xl:items-end justify-between @xl:justify-center gap-2 @xl:gap-0 shrink-0 @xl:text-right">
                <span className="font-black text-indigo-700 font-mono text-base whitespace-nowrap">{part7SingleMinutes} phút</span>
                <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  ~{Math.round((part7SingleMinutes * 60) / 29)} giây / câu
                </span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="35"
              step="1"
              value={part7SingleMinutes}
              onChange={(e) => setPart7SingleMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <span className="whitespace-nowrap">20 phút</span>
              <span className="text-indigo-600 font-bold whitespace-nowrap">Khuyến nghị: 26 - 28 phút (~55s/câu)</span>
              <span className="whitespace-nowrap">35 phút</span>
            </div>
          </div>

          {/* Part 7 Multiple (Double & Triple) Slider */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-1.5 @xl:gap-3">
              <div className="min-w-0">
                <span className="font-bold text-slate-900 text-sm">Part 7 - Đoạn đôi &amp; Đoạn ba (Double &amp; Triple)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">25 câu hỏi tổng hợp chéo (Câu 176 - 200)</span>
              </div>
              <div className="flex items-baseline @xl:flex-col @xl:items-end justify-between @xl:justify-center gap-2 @xl:gap-0 shrink-0 @xl:text-right">
                <span className="font-black text-indigo-700 font-mono text-base whitespace-nowrap">{part7MultiMinutes} phút</span>
                <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                  ~{Math.round((part7MultiMinutes * 60) / 25)} giây / câu (~5p / bài đọc)
                </span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="35"
              step="1"
              value={part7MultiMinutes}
              onChange={(e) => setPart7MultiMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <span className="whitespace-nowrap">20 phút</span>
              <span className="text-indigo-600 font-bold whitespace-nowrap">Khuyến nghị: 25 - 28 phút (~60s/câu)</span>
              <span className="whitespace-nowrap">35 phút</span>
            </div>
          </div>

          {/* Tổng Part 7 Review Info */}
          <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
            <span className="font-bold text-indigo-900">
              Tổng thời gian dành cho toàn bộ Part 7 (54 câu):
            </span>
            <span className="font-black text-indigo-700 text-sm font-mono whitespace-nowrap shrink-0">
              {part7TotalMinutes} phút / 75 phút
            </span>
          </div>
        </div>
      </div>

      {/* 3. MỤC TIÊU TỐC ĐỘ ĐỌC (TARGET WPM) */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Mục Tiêu Tốc Độ Đọc (Target WPM - Words Per Minute)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Tốc độ đọc lướt và quét thông tin khuyến nghị cho học viên trong khi đọc bài văn dài Part 7.
            </p>
          </div>
          <div className="flex items-baseline @xl:flex-col @xl:items-end justify-between @xl:justify-center gap-2 @xl:gap-0 shrink-0 @xl:text-right">
            <span className="font-black text-blue-700 text-lg font-mono whitespace-nowrap">{targetWpm} WPM</span>
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              {targetWpm >= 180 ? "Band 850 - 990" : targetWpm >= 150 ? "Band 650 - 800" : "Band 450 - 600"}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="110"
          max="220"
          step="5"
          value={targetWpm}
          onChange={(e) => setTargetWpm(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-slate-400 font-mono">
          <span className="whitespace-nowrap">110 WPM (Cơ bản)</span>
          <span className="text-blue-600 font-bold whitespace-nowrap">160 WPM (Chuẩn quốc tế TOEIC)</span>
          <span className="whitespace-nowrap">220 WPM (Bậc thầy)</span>
        </div>
      </div>

      {/* 4. CẤU HÌNH NGƯỠNG CẢNH BÁO TỪNG CÂU (PER-QUESTION TIMEOUT THRESHOLDS) */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 leading-snug">
              Cấu Hình Ngưỡng Cảnh Báo Từng Câu (Per-Question Pace Limits)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Thiết lập thời gian tối đa học viên được phép dừng ở một câu hỏi trước khi hệ thống cảnh báo chuyển câu để tránh sa lầy vào câu hỏi bẫy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-3.5 pt-1 text-xs">
          {/* Part 5 threshold */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Part 5 (Câu đơn)</span>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {part5TimeoutSeconds}s / câu
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              value={part5TimeoutSeconds}
              onChange={(e) => setPart5TimeoutSeconds(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>20s</span>
              <span className="text-amber-700 font-semibold">Chuẩn: 40s</span>
              <span>60s</span>
            </div>
          </div>

          {/* Part 6 threshold */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Part 6 (Điền đoạn)</span>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {part6TimeoutSeconds}s / câu
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={part6TimeoutSeconds}
              onChange={(e) => setPart6TimeoutSeconds(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>30s</span>
              <span className="text-amber-700 font-semibold">Chuẩn: 60s</span>
              <span>90s</span>
            </div>
          </div>

          {/* Part 7 threshold */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Part 7 (Đọc hiểu)</span>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {part7TimeoutSeconds}s / câu
              </span>
            </div>
            <input
              type="range"
              min="45"
              max="150"
              step="5"
              value={part7TimeoutSeconds}
              onChange={(e) => setPart7TimeoutSeconds(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>45s</span>
              <span className="text-amber-700 font-semibold">Chuẩn: 90s</span>
              <span>150s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MA TRẬN PHÂN BỔ ĐIỂM & LỘ TRÌNH MỤC TIÊU (SCORE TARGET ROADMAP) */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-start sm:items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <Target className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 leading-snug">
              Ma Trận Phân Bổ Điểm &amp; Lộ Trình Mục Tiêu (Target Score Strategy Matrix)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Khuyến nghị số câu đúng và trọng tâm học tập cho từng band điểm mục tiêu TOEIC Reading (thang điểm 495).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-4 gap-3 text-xs">
          {/* Band 500-650 */}
          <div
            onClick={() => {
              applyPreset("grammar_focus");
              setTargetScoreBand("500-650");
            }}
            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
              targetScoreBand === "500-650"
                ? "bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                : "bg-slate-50/70 border-slate-200 hover:border-emerald-300"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-900">Band 500 - 650</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Cơ bản
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Mục tiêu: đúng ≥ 65/100 câu</p>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <p>• P5: 22/30 câu (15 phút)</p>
              <p>• P6: 10/16 câu (10 phút)</p>
              <p>• P7: 33/54 câu (50 phút, ưu tiên đoạn đơn)</p>
            </div>
            <button
              type="button"
              className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition ${
                targetScoreBand === "500-650"
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50"
              }`}
            >
              {targetScoreBand === "500-650" ? "Đang áp dụng ✓" : "Áp dụng lộ trình"}
            </button>
          </div>

          {/* Band 650-750 */}
          <div
            onClick={() => {
              applyPreset("balanced");
              setTargetScoreBand("650-750");
            }}
            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
              targetScoreBand === "650-750"
                ? "bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500"
                : "bg-slate-50/70 border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-blue-900">Band 650 - 750</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Chuẩn ETS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Mục tiêu: đúng ≥ 78/100 câu</p>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <p>• P5: 25/30 câu (12 phút)</p>
              <p>• P6: 12/16 câu (10 phút)</p>
              <p>• P7: 41/54 câu (53 phút, hoàn thành đủ)</p>
            </div>
            <button
              type="button"
              className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition ${
                targetScoreBand === "650-750"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-blue-50"
              }`}
            >
              {targetScoreBand === "650-750" ? "Đang áp dụng ✓" : "Áp dụng lộ trình"}
            </button>
          </div>

          {/* Band 750-850 */}
          <div
            onClick={() => {
              applyPreset("part7_focus");
              setTargetScoreBand("750-850");
            }}
            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
              targetScoreBand === "750-850"
                ? "bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500"
                : "bg-slate-50/70 border-slate-200 hover:border-indigo-300"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-indigo-900">Band 750 - 850</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Nâng cao
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Mục tiêu: đúng ≥ 88/100 câu</p>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <p>• P5: 27/30 câu (10 phút)</p>
              <p>• P6: 14/16 câu (8 phút)</p>
              <p>• P7: 47/54 câu (57 phút, quét nhanh)</p>
            </div>
            <button
              type="button"
              className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition ${
                targetScoreBand === "750-850"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50"
              }`}
            >
              {targetScoreBand === "750-850" ? "Đang áp dụng ✓" : "Áp dụng lộ trình"}
            </button>
          </div>

          {/* Band 850-990 */}
          <div
            onClick={() => {
              applyPreset("speed_master");
              setTargetScoreBand("850-990");
            }}
            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
              targetScoreBand === "850-990"
                ? "bg-amber-50/70 border-amber-500 shadow-xs ring-1 ring-amber-500"
                : "bg-slate-50/70 border-slate-200 hover:border-amber-300"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-amber-900">Band 850 - 990</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Xuất sắc
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Mục tiêu: đúng ≥ 95/100 câu</p>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <p>• P5: 29/30 câu (8 phút, 16s/câu)</p>
              <p>• P6: 15/16 câu (7 phút)</p>
              <p>• P7: 51+/54 câu (60 phút, vét cạn)</p>
            </div>
            <button
              type="button"
              className={`w-full py-1.5 rounded-xl font-bold text-[11px] transition ${
                targetScoreBand === "850-990"
                  ? "bg-amber-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-amber-50"
              }`}
            >
              {targetScoreBand === "850-990" ? "Đang áp dụng ✓" : "Áp dụng lộ trình"}
            </button>
          </div>
        </div>
      </div>

      {/* 6. CHẾ ĐỘ HỖ TRỢ & CẢNH BÁO TIẾN ĐỘ THỜI GIAN THỰC */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Tùy Chọn Chế Độ Hỗ Trợ Đọc Hiểu &amp; Cảnh Báo Phòng Thi</span>
        </h4>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={enableBilingualByDefault}
              onChange={(e) => setEnableBilingualByDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-bold">Mặc định mở chế độ song ngữ</span>
              <span className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Tự động hiển thị song ngữ Anh - Việt đối chiếu khi học viên bắt đầu luyện tập.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={enablePacingTimer}
              onChange={(e) => setEnablePacingTimer(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-bold">Đồng hồ tiến độ từng phần (Pacing Timer)</span>
              <span className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Hiển thị nhãn mục tiêu giây/câu và thời gian thực tế trong workspace làm bài.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={enableTimeoutAlert}
              onChange={(e) => setEnableTimeoutAlert(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-bold">Cảnh báo dừng quá lâu ở 1 câu hỏi</span>
              <span className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Nhắc nhở học viên khi vượt quá thời gian tối đa ({part5TimeoutSeconds}s P5 / {part6TimeoutSeconds}s P6 / {part7TimeoutSeconds}s P7).
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={speedDrillMode}
              onChange={(e) => setSpeedDrillMode(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-bold">Chế độ Luyện tốc độ cao (Speed Drill)</span>
              <span className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Bấm giờ áp lực cao cho từng đoạn đơn lẻ để rèn luyện tốc độ đọc lướt.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer border border-slate-200 transition">
            <input
              type="checkbox"
              checked={showTargetPaceBadge}
              onChange={(e) => setShowTargetPaceBadge(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <span className="block font-bold">Hiển thị nhãn mục tiêu nhịp độ (Pace Badge)</span>
              <span className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Hiển thị mục tiêu ~X giây/câu và thời gian đọc ước tính theo WPM trên đoạn văn.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 7. THANH THAO TÁC NÚT LƯU & RESET */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleResetDefault}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>Khôi phục chuẩn 75 phút</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Đã lưu cấu hình phân bổ thời gian thành công!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{saved ? "Đã lưu!" : "Lưu cấu hình"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
