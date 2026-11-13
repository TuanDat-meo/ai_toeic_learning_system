"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Eye,
  BookOpen,
  Layers,
  Check,
  RotateCcw,
  Play,
  Edit3,
  Trash2,
  Plus,
  Languages,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";

export interface ReadingPassageBankViewProps {
  cards?: ExerciseCardData[];
  onStartPractice?: (card: ExerciseCardData) => void;
  onOpenEditCard?: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm?: (card: ExerciseCardData) => void;
  onOpenCreatePassage?: () => void;
}

export interface PassageItem {
  id: string;
  title: string;
  type: "Part 6" | "Part 7 Single" | "Part 7 Double" | "Part 7 Triple" | "Part 7 Full";
  typeLabel: string;
  format: string;
  wordCount: number;
  displayWordCount: string;
  questionsCount: number;
  vocabCount: number;
  topic: string;
  text: string;
  translation: string;
  subPassages: { label: string; text: string; textVi?: string }[];
  hasBilingual: boolean;
  card: ExerciseCardData;
}

export const ReadingPassageBankView: React.FC<ReadingPassageBankViewProps> = ({
  cards = [],
  onStartPractice,
  onOpenEditCard,
  onOpenDeleteConfirm,
  onOpenCreatePassage,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [bilingualFilter, setBilingualFilter] = useState<"ALL" | "BILINGUAL" | "UNTRANSLATED">("ALL");
  const [previewPassage, setPreviewPassage] = useState<PassageItem | null>(null);
  const [previewTab, setPreviewTab] = useState<"passage" | "questions">("passage");
  const [copiedText, setCopiedText] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const passageItems: PassageItem[] = useMemo(() => {
    const realPartCards = (cards || []).filter(
      (c) =>
        c.category === "part6" ||
        c.category === "part7" ||
        Boolean(c.passageText?.trim()) ||
        Boolean(c.passages && c.passages.length > 0) ||
        Boolean(c.sampleQuestions?.some((q) => q.passageText?.trim() || (q.passages && q.passages.length > 0)))
    );

    const convertedRealCards: PassageItem[] = realPartCards.map((c) => {
      let text = c.passageText?.trim() || "";
      let translation = c.passageTextVi?.trim() || "";
      const subPassages: { label: string; text: string; textVi?: string }[] = [];

      // Extract explicit subpassages
      if (c.passages && c.passages.length > 0) {
        c.passages.forEach((p, pIdx) => {
          if (p.text?.trim()) {
            subPassages.push({
              label: p.label || `Đoạn văn ${pIdx + 1}`,
              text: p.text.trim(),
              textVi: p.textVi?.trim(),
            });
          }
        });
      }

      // Check sampleQuestions for passages
      if (c.sampleQuestions && c.sampleQuestions.length > 0) {
        c.sampleQuestions.forEach((q, qIdx) => {
          if (q.passages && q.passages.length > 0) {
            q.passages.forEach((qp) => {
              if (qp.text?.trim() && !subPassages.some((sp) => sp.text === qp.text.trim())) {
                subPassages.push({
                  label: qp.label || `Đoạn văn ${subPassages.length + 1}`,
                  text: qp.text.trim(),
                  textVi: qp.textVi?.trim(),
                });
              }
            });
          }
          const qText = q.passageText?.trim();
          const qTextVi = q.passageTextVi?.trim();
          if (
            qText &&
            qText.length > 30 &&
            !/^(questions?\s*\d|reading\s+passage)/i.test(qText) &&
            !subPassages.some((sp) => sp.text === qText)
          ) {
            subPassages.push({
              label: q.passageTitle || `Đoạn văn #${q.questionNum || qIdx + 1}`,
              text: qText,
              textVi: qTextVi,
            });
          }
        });
      }

      // Build consolidated text and translation
      if (subPassages.length > 0) {
        text = subPassages.map((p) => `[${p.label}]\n${p.text}`).join("\n\n");
        translation = subPassages
          .filter((p) => Boolean(p.textVi?.trim()))
          .map((p) => `[${p.label} - Bản dịch]\n${p.textVi}`)
          .join("\n\n");
      } else if (!text && c.sampleQuestions?.[0]?.passageText) {
        text = c.sampleQuestions[0].passageText.trim();
        translation = c.sampleQuestions[0].passageTextVi?.trim() || "";
      }

      const isPlaceholder = !text || /^(questions?\s*\d|reading\s+passage)/i.test(text.trim());
      const actualWords = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      const questionsCount = c.sampleQuestions?.length ?? c.totalQuestions ?? 0;
      const vocabCount = c.sampleQuestions?.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0) || 0;

      const wordCount = actualWords;
      const displayWordCount = actualWords > 0 ? `${actualWords.toLocaleString()} từ` : "—";
      const isPart6Card = c.category === "part6" || c.title.toLowerCase().includes("part 6");

      // Determine Type (Part 6 / Part 7 Single / Double / Triple / Full Test)
      let type: "Part 6" | "Part 7 Single" | "Part 7 Double" | "Part 7 Triple" | "Part 7 Full" = "Part 7 Single";
      let typeLabel = "Part 7 · Đoạn đơn (Single)";
      const lowerTitle = c.title.toLowerCase();
      const lowerTag = (c.tag || "").toLowerCase();

      if (isPart6Card) {
        type = "Part 6";
        typeLabel = "Part 6 · Điền đoạn văn";
      } else if (c.category === "part7" || lowerTitle.includes("part 7") || lowerTag.includes("part 7")) {
        if (questionsCount >= 54) {
          type = "Part 7 Full";
          typeLabel = `Part 7 · Đề thi hoàn chỉnh (${questionsCount} câu)`;
        } else if (lowerTitle.includes("triple") || lowerTag.includes("triple") || subPassages.length >= 3) {
          type = "Part 7 Triple";
          typeLabel = "Part 7 · Đoạn ba (Triple)";
        } else if (lowerTitle.includes("double") || lowerTag.includes("double") || subPassages.length === 2) {
          type = "Part 7 Double";
          typeLabel = "Part 7 · Đoạn đôi (Double)";
        } else {
          type = "Part 7 Single";
          typeLabel = "Part 7 · Đoạn đơn (Single)";
        }
      }

      // Determine Format
      let format = c.tag?.split("·")[0]?.trim() || "Chưa phân loại";
      const lowerText = (text + " " + c.title).toLowerCase();
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
      } else if (lowerText.includes("article") || lowerText.includes("report")) {
        format = "Article / Bài báo & Báo cáo";
      } else if (isPart6Card) {
        format = "Text Completion / Điền đoạn văn";
      }

      // Determine Topic
      let topic = c.tag?.trim() || "Chưa phân loại";
      if (lowerText.includes("server") || lowerText.includes("software") || lowerText.includes("cloud") || lowerText.includes("network")) {
        topic = "Công nghệ thông tin";
      } else if (lowerText.includes("shipment") || lowerText.includes("courier") || lowerText.includes("delivery") || lowerText.includes("package")) {
        topic = "Bán lẻ & Hậu cần";
      } else if (lowerText.includes("summit") || lowerText.includes("conference") || lowerText.includes("meeting") || lowerText.includes("hotel")) {
        topic = "Sự kiện & Hội nghị";
      } else if (lowerText.includes("revenue") || lowerText.includes("quarterly") || lowerText.includes("financial") || lowerText.includes("dividend")) {
        topic = "Tài chính doanh nghiệp";
      } else if (lowerText.includes("plumbing") || lowerText.includes("maintenance") || lowerText.includes("repair") || lowerText.includes("water")) {
        topic = "Bảo trì & Tòa nhà";
      }

      const displayId = c.id;
      const hasBilingual =
        Boolean(translation.trim()) ||
        Boolean(c.passageTextVi?.trim()) ||
        Boolean(c.sampleQuestions?.some((q) => Boolean(q.passageTextVi?.trim()) || Boolean(q.bilingual?.trim())));

      return {
        id: displayId,
        title: c.title,
        type,
        typeLabel,
        format,
        wordCount,
        displayWordCount,
        questionsCount,
        vocabCount,
        topic,
        text,
        translation,
        subPassages,
        hasBilingual,
        card: c,
      };
    });

    return convertedRealCards;
  }, [cards]);

  // Counts for filters and statistics cards
  const statsCounts = useMemo(() => {
    let p6 = 0;
    let p7Single = 0;
    let p7Multi = 0;
    let p7Full = 0;
    let bilingual = 0;
    let totalWords = 0;

    passageItems.forEach((p) => {
      if (p.type === "Part 6") p6++;
      else if (p.type === "Part 7 Single") p7Single++;
      else if (p.type === "Part 7 Double" || p.type === "Part 7 Triple") p7Multi++;
      else if (p.type === "Part 7 Full") p7Full++;

      if (p.hasBilingual) bilingual++;
      totalWords += p.wordCount;
    });

    const bilingualPercent = passageItems.length > 0 ? Math.round((bilingual / passageItems.length) * 100) : 0;

    return {
      total: passageItems.length,
      p6,
      p7Single,
      p7Multi,
      p7Full,
      bilingual,
      untranslated: passageItems.length - bilingual,
      bilingualPercent,
      totalWords,
    };
  }, [passageItems]);

  // Filtered Passages
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return passageItems.filter((p) => {
      // 1. Search Query
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.format.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q) ||
        p.translation.toLowerCase().includes(q) ||
        (p.card.sampleQuestions && p.card.sampleQuestions.some((sq) => sq.question.toLowerCase().includes(q)));

      // 2. Format / Part Filter
      let matchType = true;
      if (filterType === "Part 6") matchType = p.type === "Part 6";
      else if (filterType === "Part 7 Single") matchType = p.type === "Part 7 Single";
      else if (filterType === "Part 7 Double") matchType = p.type === "Part 7 Double";
      else if (filterType === "Part 7 Triple") matchType = p.type === "Part 7 Triple";
      else if (filterType === "Part 7 Full") matchType = p.type === "Part 7 Full";
      else if (filterType === "Part 7 All") matchType = p.type !== "Part 6";

      // 3. Bilingual Filter
      const matchBilingual =
        bilingualFilter === "ALL"
          ? true
          : bilingualFilter === "BILINGUAL"
          ? p.hasBilingual
          : !p.hasBilingual;

      return matchSearch && matchType && matchBilingual;
    });
  }, [passageItems, search, filterType, bilingualFilter]);

  // Pagination logic
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return filtered;
    const start = (validCurrentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, validCurrentPage, pageSize]);



  const handleCopyText = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isFiltered = search.trim() !== "" || filterType !== "ALL" || bilingualFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setFilterType("ALL");
    setBilingualFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP STATS CARDS & QUICK FILTER PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Passages Card */}
        <button
          type="button"
          onClick={handleResetFilters}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            filterType === "ALL" && bilingualFilter === "ALL" && !search
              ? "bg-blue-50/70 border-blue-200 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng kho bài đọc</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">{statsCounts.total}</span>
            <span className="text-[11px] font-medium text-slate-500">đoạn văn</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Ước tính ~{statsCounts.totalWords.toLocaleString()} từ</p>
        </button>

        {/* Part 6 Card */}
        <button
          type="button"
          onClick={() => {
            setFilterType(filterType === "Part 6" ? "ALL" : "Part 6");
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            filterType === "Part 6"
              ? "bg-purple-50 border-purple-200 ring-2 ring-purple-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Part 6 (Điền đoạn)</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-purple-900">{statsCounts.p6}</span>
            <span className="text-[11px] font-medium text-purple-600">bài thi</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Text Completion chuẩn ETS</p>
        </button>

        {/* Part 7 Card */}
        <button
          type="button"
          onClick={() => {
            setFilterType(filterType === "Part 7 All" ? "ALL" : "Part 7 All");
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            filterType === "Part 7 All"
              ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Part 7 (Đọc hiểu)</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-indigo-900">{statsCounts.p7Single + statsCounts.p7Multi + statsCounts.p7Full}</span>
            <span className="text-[11px] font-medium text-indigo-600">bài đọc</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Đoạn đơn, đôi, ba &amp; đề 54 câu</p>
        </button>

        {/* Bilingual Coverage Card */}
        <button
          type="button"
          onClick={() => {
            setBilingualFilter(bilingualFilter === "BILINGUAL" ? "ALL" : "BILINGUAL");
          }}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            bilingualFilter === "BILINGUAL"
              ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Độ phủ Song ngữ EN-VI</span>
            <Languages className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-emerald-900">{statsCounts.bilingual}</span>
            <span className="text-[11px] font-bold text-emerald-600">({statsCounts.bilingualPercent}%)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{statsCounts.untranslated} bài chưa có bản dịch</p>
        </button>
      </div>

      {/* 2. FILTER & ACTION BAR */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, bài đọc, câu hỏi, mã..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Selects & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Format / Part filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer hover:border-slate-300 transition"
          >
            <option value="ALL">Tất cả định dạng đoạn văn ({statsCounts.total})</option>
            <option value="Part 6">Part 6 - Hoàn thành đoạn văn ({statsCounts.p6})</option>
            <option value="Part 7 Single">Part 7 - Đoạn đơn (Single) ({statsCounts.p7Single})</option>
            <option value="Part 7 Double">Part 7 - Đoạn đôi (Double) ({passageItems.filter(p => p.type === "Part 7 Double").length})</option>
            <option value="Part 7 Triple">Part 7 - Đoạn ba (Triple) ({passageItems.filter(p => p.type === "Part 7 Triple").length})</option>
            <option value="Part 7 Full">Part 7 - Đề thi hoàn chỉnh 54 câu ({statsCounts.p7Full})</option>
          </select>

          {/* Bilingual Filter */}
          <select
            value={bilingualFilter}
            onChange={(e) => setBilingualFilter(e.target.value as "ALL" | "BILINGUAL" | "UNTRANSLATED")}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer hover:border-slate-300 transition"
          >
            <option value="ALL">Tất cả trạng thái dịch ({statsCounts.total})</option>
            <option value="BILINGUAL">✓ Đã có dịch song ngữ EN-VI ({statsCounts.bilingual})</option>
            <option value="UNTRANSLATED">○ Chưa có bản dịch ({statsCounts.untranslated})</option>
          </select>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}

          {/* Create Button */}
          {onOpenCreatePassage && (
            <button
              type="button"
              onClick={onOpenCreatePassage}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm đoạn văn mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Info / Status Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Tìm thấy <strong className="text-blue-700 font-bold">{filtered.length}</strong> bài đọc
            {isFiltered && ` (lọc từ tổng ${statsCounts.total} bài)`}
          </span>
          {isFiltered && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              Đang áp dụng bộ lọc
            </span>
          )}
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 bg-white outline-none cursor-pointer"
          >
            <option value={10}>10 bài / trang</option>
            <option value={15}>15 bài / trang</option>
            <option value={25}>25 bài / trang</option>
            <option value={50}>50 bài / trang</option>
            <option value={-1}>Tất cả ({filtered.length})</option>
          </select>
        </div>
      </div>

      {/* 3. MAIN TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[980px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th className="py-3.5 px-4 w-24">Mã</th>
                <th className="py-3.5 px-4 min-w-[260px]">Tiêu đề bài đọc TOEIC</th>
                <th className="py-3.5 px-4 min-w-[150px]">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[150px]">Chủ đề bài đọc</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Độ dài</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Số câu &amp; Từ</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Bản dịch song ngữ</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700 text-sm">Không tìm thấy đoạn văn nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Thử đổi từ khóa tìm kiếm hoặc chọn &quot;Tất cả định dạng đoạn văn&quot; để hiển thị toàn bộ kho bài đọc.
                    </p>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition cursor-pointer"
                      >
                        Đặt lại bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((p) => {
                  const isPart6 = p.type === "Part 6";
                  const isPart7Double = p.type === "Part 7 Double";
                  const isPart7Triple = p.type === "Part 7 Triple";
                  const isPart7Full = p.type === "Part 7 Full";

                  const badgeColor = isPart6
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : isPart7Full
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : isPart7Triple
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isPart7Double
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* 1. MÃ BÀI */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap text-[11px]">
                        {p.id}
                      </td>

                      {/* 2. TIÊU ĐỀ & PART BADGE */}
                      <td className="py-3.5 px-4">
                        <p
                          className="font-bold text-slate-900 leading-snug hover:text-blue-600 transition cursor-pointer"
                          onClick={() => {
                            setPreviewPassage(p);
                            setPreviewTab("passage");
                          }}
                        >
                          {p.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap border ${badgeColor}`}
                          >
                            {p.typeLabel}
                          </span>
                        </div>
                      </td>

                      {/* 3. ĐỊNH DẠNG */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium text-xs">
                        {p.format}
                      </td>

                      {/* 4. CHỦ ĐỀ */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap inline-flex items-center">
                          {p.topic}
                        </span>
                      </td>

                      {/* 5. ĐỘ DÀI */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-800 whitespace-nowrap text-xs">
                        <span className="font-bold text-slate-800">{p.displayWordCount}</span>
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
                            <Check className="w-3 h-3 text-emerald-600" />
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
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. XEM TRƯỚC (PREVIEW) */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewPassage(p);
                              setPreviewTab("passage");
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition cursor-pointer shadow-2xs"
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

        {/* Pagination Bar */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Hiển thị từ{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(filtered.length, (validCurrentPage - 1) * pageSize + 1)}
              </strong>{" "}
              đến{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(filtered.length, validCurrentPage * pageSize)}
              </strong>{" "}
              trên tổng số <strong className="text-slate-900 font-bold">{filtered.length}</strong> bài
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 2)
                .map((pageNum, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const hasGap = prevPage && pageNum - prevPage > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {hasGap && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-xl font-bold text-xs transition cursor-pointer ${
                          validCurrentPage === pageNum
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL PREVIEW PASSAGE & BILINGUAL & QUESTIONS */}
      {previewPassage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {previewPassage.typeLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {previewPassage.format} • {previewPassage.topic}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {previewPassage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200/80 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTab("passage")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    previewTab === "passage"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đoạn văn &amp; Dịch song ngữ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab("questions")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    previewTab === "questions"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    Câu hỏi trắc nghiệm ({previewPassage.card.sampleQuestions?.length || previewPassage.questionsCount})
                  </span>
                </button>
              </div>

              {/* Stats pill */}
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span>📏 Độ dài: <strong className="text-slate-800">{previewPassage.displayWordCount}</strong></span>
                <span>•</span>
                <span className={previewPassage.hasBilingual ? "text-emerald-700 font-bold" : "text-slate-500"}>
                  {previewPassage.hasBilingual ? "✓ Đã có song ngữ" : "Chưa có dịch"}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              {previewTab === "passage" ? (
                /* Tab 1: Passage & Translation */
                <div className="space-y-4">
                  {/* Action row above passage */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Nội dung văn bản (Reading Text):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(previewPassage.text)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Sao chép văn bản</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Multi-passage or Single Passage Display */}
                  {previewPassage.subPassages && previewPassage.subPassages.length > 0 ? (
                    <div className="space-y-4">
                      {previewPassage.subPassages.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              {sub.label}
                            </span>
                          </div>

                          {/* English Text */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <p className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                              {sub.text}
                            </p>
                          </div>

                          {/* Vietnamese Translation */}
                          {sub.textVi ? (
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                                Bản dịch đối chiếu:
                              </span>
                              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                                {sub.textVi}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">Đoạn này chưa có bản dịch tiếng Việt.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Single passage standard layout */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* English Passage */}
                      <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-1.5">
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                          Đoạn văn gốc tiếng Anh (English):
                        </span>
                        <p className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-line">
                          {previewPassage.text || "Chưa có nội dung đoạn văn."}
                        </p>
                      </div>

                      {/* Vietnamese Translation */}
                      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-1.5">
                        <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider block flex items-center gap-1.5">
                          <Languages className="w-3.5 h-3.5 text-blue-600" />
                          <span>Bản dịch đối chiếu tiếng Việt (Vietnamese):</span>
                        </span>
                        {previewPassage.translation ? (
                          <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                            {previewPassage.translation}
                          </p>
                        ) : (
                          <div className="py-6 text-center text-slate-400 space-y-2">
                            <Languages className="w-8 h-8 mx-auto text-slate-300" />
                            <p className="font-semibold text-slate-600">Chưa có bản dịch tiếng Việt</p>
                            <p className="text-[11px]">Bạn có thể nhấn &quot;Chỉnh sửa bài này&quot; để bổ sung bản dịch song ngữ.</p>
                            {onOpenEditCard && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  const c = previewPassage.card;
                                  setPreviewPassage(null);
                                  onOpenEditCard(c, e);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
                              >
                                Bổ sung bản dịch ngay
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Attached Questions Preview */
                <div className="space-y-3">
                  {previewPassage.card.sampleQuestions && previewPassage.card.sampleQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {previewPassage.card.sampleQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-extrabold text-slate-900 block text-xs leading-snug">
                                Câu {qIdx + 1} {q.questionNum ? `(#${q.questionNum})` : ""}: {q.question}
                              </span>
                              {q.bilingual && (
                                <p className="text-[11px] text-slate-500 italic mt-0.5">{q.bilingual}</p>
                              )}
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] shrink-0">
                              Đáp án: {["A", "B", "C", "D"][q.correctIndex] || "A"}
                            </span>
                          </div>

                          {/* Options grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] ${
                                  optIdx === q.correctIndex
                                    ? "bg-emerald-100/70 border-emerald-300 text-emerald-900 font-bold"
                                    : "bg-white border-slate-200 text-slate-700"
                                }`}
                              >
                                ({["A", "B", "C", "D"][optIdx]}) {opt}
                                {q.optionMeanings && q.optionMeanings[optIdx] && (
                                  <span className="block text-[10px] text-slate-500 font-normal">
                                    {q.optionMeanings[optIdx]}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                              <strong>Giải thích:</strong> {q.explanation}
                            </div>
                          )}

                          {/* Key Vocab */}
                          {q.vocabList && q.vocabList.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Từ vựng:</span>
                              {q.vocabList.map((v, vIdx) => (
                                <span
                                  key={vIdx}
                                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold"
                                >
                                  {v.word} ({v.pos}): {v.meaning}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Bài đọc chưa có danh sách câu hỏi mẫu</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer with quick action buttons */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                {onStartPractice && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = previewPassage.card;
                      setPreviewPassage(null);
                      onStartPractice(c);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
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
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa bài này</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewPassage(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition"
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
