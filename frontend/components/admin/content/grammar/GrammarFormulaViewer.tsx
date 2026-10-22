"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  Lightbulb,
  FileText,
  ListChecks,
} from "lucide-react";

// ==========================================
// 1. FORMATTED TEXT COMPONENT (INLINE MARKDOWN)
// ==========================================
export const FormattedText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  if (!text) return null;

  // Tách text thành các token: bold (**...**), italic (*...*), code/formula (`...`)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Code / Formula block `...`
        if (part.startsWith("`") && part.endsWith("`")) {
          const codeContent = part.slice(1, -1);
          return (
            <code
              key={idx}
              className="inline-block px-2 py-0.5 mx-0.5 my-0.5 text-xs font-mono font-bold rounded-lg bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs"
            >
              {codeContent}
            </code>
          );
        }

        // Bold text **...**
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldContent = part.slice(2, -2);
          return (
            <strong key={idx} className="font-extrabold text-slate-900">
              {boldContent}
            </strong>
          );
        }

        // Italic text *...*
        if (part.startsWith("*") && part.endsWith("*")) {
          const italicContent = part.slice(1, -1);
          return (
            <em key={idx} className="font-semibold text-blue-700 not-italic px-0.5">
              {italicContent}
            </em>
          );
        }

        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};

// ==========================================
// 2. TYPES VÀ INTERFACES
// ==========================================
export interface ParsedRuleItem {
  id: string;
  raw: string;
  type:
    | "key_rule"
    | "transformation"
    | "danger"
    | "mandatory"
    | "mnemonic"
    | "note"
    | "example"
    | "subheading"
    | "plain";
  key?: string;
  badge?: string;
  formula?: string;
  description?: string;
  originalText?: string;
  shortenedText?: string;
}

export interface ParsedSubSection {
  title: string;
  items: ParsedRuleItem[];
}

export interface ParsedSection {
  id: string;
  number: string;
  title: string;
  subsections: ParsedSubSection[];
  items: ParsedRuleItem[];
}

// ==========================================
// 3. HÀM PHÂN TÍCH FORMULA THÀNH STRUCTURED AST
// ==========================================
export function parseFormulaText(text: string): ParsedSection[] {
  if (!text) return [];

  const rawLines = text.split("\n");
  const sections: ParsedSection[] = [];

  let currentSection: ParsedSection = {
    id: "sec-0",
    number: "",
    title: "Công thức & Quy tắc cốt lõi",
    subsections: [],
    items: [],
  };

  let currentSubSection: ParsedSubSection | null = null;
  let secIdx = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // H3 Section Header: `### 1. Title` hoặc `### Title`
    if (line.startsWith("### ")) {
      if (currentSubSection) {
        currentSection.subsections.push(currentSubSection);
        currentSubSection = null;
      }
      if (
        currentSection.items.length > 0 ||
        currentSection.subsections.length > 0 ||
        currentSection.number !== ""
      ) {
        sections.push(currentSection);
      }

      const headerText = line.replace(/^###\s+/, "").trim();
      const numMatch = headerText.match(/^(\d+)[\.\)]\s*(.*)/);
      const secNum = numMatch ? numMatch[1] : String(secIdx);
      const secTitle = numMatch ? numMatch[2] : headerText;

      currentSection = {
        id: `sec-${secNum}`,
        number: secNum,
        title: secTitle,
        subsections: [],
        items: [],
      };
      secIdx++;
      continue;
    }

    // H4 SubSection Header: `#### A. Title` hoặc `#### Title`
    if (line.startsWith("#### ")) {
      if (currentSubSection) {
        currentSection.subsections.push(currentSubSection);
      }
      const subTitle = line.replace(/^####\s+/, "").trim();
      currentSubSection = {
        title: subTitle,
        items: [],
      };
      continue;
    }

    const targetItems = currentSubSection
      ? currentSubSection.items
      : currentSection.items;

    // 1) Transformation dạng Gốc vs Rút gọn
    const isGoc = line.match(/^\*?\s*\*?Gốc:\*?\s*(.*)/i);
    if (isGoc) {
      const gocStr = isGoc[1].trim();
      let rutgonStr = "";
      if (i + 1 < rawLines.length) {
        const nextLine = rawLines[i + 1].trim();
        const isRutgon = nextLine.match(/^\*?\s*\*?Rút gọn:\*?\s*(.*)/i);
        if (isRutgon) {
          rutgonStr = isRutgon[1].trim();
          i++;
        }
      }
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "transformation",
        originalText: gocStr,
        shortenedText: rutgonStr,
      });
      continue;
    }

    // 2) Bắt buộc / Tuyệt đối không / Cấm kỵ (Danger Alert)
    const upperLine = line.toUpperCase();
    if (
      upperLine.includes("TUYỆT ĐỐI KHÔNG") ||
      upperLine.includes("KHÔNG ĐƯỢC") ||
      upperLine.includes("CẤM") ||
      upperLine.includes("LỖI SAI:") ||
      upperLine.includes("BẪY CẦN TRÁNH")
    ) {
      let badge = "Lưu ý cấm kỵ";
      let desc = line.replace(/^[-*]\s*/, "");
      const dangerMatch = desc.match(/^\*?\*?([^:*]+)\*?\*?:\s*(.*)/);
      if (dangerMatch) {
        badge = dangerMatch[1].replace(/\*/g, "").trim();
        desc = dangerMatch[2].trim();
      }
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "danger",
        badge,
        description: desc,
      });
      continue;
    }

    // 3) Bắt buộc dùng / Quy tắc bắt buộc (Mandatory Tip)
    if (
      upperLine.includes("BẮT BUỘC DÙNG") ||
      upperLine.includes("BẮT BUỘC") ||
      upperLine.includes("QUY TẮC BẮT BUỘC")
    ) {
      let badge = "Bắt buộc dùng";
      let desc = line.replace(/^[-*]\s*/, "");
      const mandMatch = desc.match(/^\*?\*?([^:*]+)\*?\*?:\s*(.*)/);
      if (mandMatch) {
        badge = mandMatch[1].replace(/\*/g, "").trim();
        desc = mandMatch[2].trim();
      }
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "mandatory",
        badge,
        description: desc,
      });
      continue;
    }

    // 4) Mẹo nhớ / Thần chú (Mnemonic)
    if (upperLine.includes("MẸO NHỚ") || upperLine.includes("THẦN CHÚ")) {
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "mnemonic",
        badge: "Thần chú nhớ nhanh",
        description: line.replace(/^[-*]\s*/, ""),
      });
      continue;
    }

    // 5) Lưu ý / Chú ý (Note)
    if (line.match(/^\*?\s*\*?Lưu ý:\*?\s*/i) || line.match(/^\*?\s*\*?Chú ý:\*?\s*/i)) {
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "note",
        badge: "Lưu ý đặc biệt",
        description: line.replace(/^[-*]\s*\**Lưu ý:\**\s*/i, "").replace(/^\*Lưu ý:\*\s*/i, ""),
      });
      continue;
    }

    // 6) Ví dụ minh họa inline (`*Ví dụ:* ...`)
    if (line.match(/^\*?\s*\*?Ví dụ:\*?\s*/i)) {
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "example",
        badge: "Ví dụ câu",
        description: line.replace(/^[-*]\s*\**Ví dụ:\**\s*/i, "").replace(/^\*Ví dụ:\*\s*/i, ""),
      });
      continue;
    }

    // 7) Subheading số thứ tự: `1. **Rút gọn thành V-ING...**` hoặc `1. Title:`
    const subNumMatch = line.match(/^(\d+)[\.\)]\s*\*\*([^*]+)\*\*:?\s*(.*)/);
    if (subNumMatch) {
      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "subheading",
        key: subNumMatch[1],
        badge: subNumMatch[2].trim(),
        description: subNumMatch[3].trim(),
      });
      continue;
    }

    // 8) Rule có từ khóa in đậm: `- **WHO:** Thay thế cho...`
    const bulletBoldMatch = line.match(/^[-*]\s*\*\*([^*]+)\*\*:?\s*(.*)/);
    if (bulletBoldMatch) {
      const keyName = bulletBoldMatch[1].replace(/:$/, "").trim();
      const rest = bulletBoldMatch[2].trim();
      const codeMatch = rest.match(/`([^`]+)`/);
      const formulaSnippet = codeMatch ? codeMatch[1] : undefined;

      targetItems.push({
        id: `item-${targetItems.length}`,
        raw: line,
        type: "key_rule",
        key: keyName,
        formula: formulaSnippet,
        description: rest,
      });
      continue;
    }

    // 9) Dòng thông thường
    targetItems.push({
      id: `item-${targetItems.length}`,
      raw: line,
      type: "plain",
      description: line.replace(/^[-*]\s*/, ""),
    });
  }

  if (currentSubSection) {
    currentSection.subsections.push(currentSubSection);
  }
  if (
    currentSection.items.length > 0 ||
    currentSection.subsections.length > 0 ||
    currentSection.number !== ""
  ) {
    sections.push(currentSection);
  }

  return sections;
}

// ==========================================
// 4. RENDER TỪNG ITEM QUY TẮC
// ==========================================
export const GrammarItemCard: React.FC<{ item: ParsedRuleItem }> = ({ item }) => {
  // 1) Dạng biến đổi: Gốc -> Rút gọn
  if (item.type === "transformation") {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-3.5 space-y-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider shrink-0 w-fit">
            Câu gốc đầy đủ
          </span>
          <div className="text-xs text-slate-700 font-medium italic">
            <FormattedText text={item.originalText || ""} />
          </div>
        </div>

        {item.shortenedText && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-slate-200/70">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 shadow-2xs w-fit">
              <ArrowRight className="w-3 h-3" />
              Rút gọn chuẩn TOEIC
            </span>
            <div className="text-xs font-bold text-emerald-950 bg-emerald-50/90 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <FormattedText text={item.shortenedText} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2) Dạng cảnh báo nguy hiểm / Cấm kỵ
  if (item.type === "danger") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 flex items-start gap-3 text-xs text-rose-950 shadow-2xs">
        <div className="w-7 h-7 rounded-xl bg-rose-200/80 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-rose-800 text-[11px] uppercase tracking-wide bg-rose-200/80 px-2.5 py-0.5 rounded-md border border-rose-300">
              {item.badge || "Cảnh báo cấm kỵ"}
            </span>
          </div>
          <div className="text-xs leading-relaxed text-rose-900 font-medium">
            <FormattedText text={item.description || ""} />
          </div>
        </div>
      </div>
    );
  }

  // 3) Dạng quy tắc bắt buộc
  if (item.type === "mandatory") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 flex items-start gap-3 text-xs text-emerald-950 shadow-2xs">
        <div className="w-7 h-7 rounded-xl bg-emerald-200/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-emerald-800 text-[11px] uppercase tracking-wide bg-emerald-200/80 px-2.5 py-0.5 rounded-md border border-emerald-300">
              {item.badge || "Quy tắc bắt buộc"}
            </span>
          </div>
          <div className="text-xs leading-relaxed text-emerald-900 font-medium">
            <FormattedText text={item.description || ""} />
          </div>
        </div>
      </div>
    );
  }

  // 4) Dạng mẹo nhớ / Thần chú
  if (item.type === "mnemonic") {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50/90 p-3.5 flex items-start gap-3 text-xs text-purple-950 shadow-2xs">
        <div className="w-7 h-7 rounded-xl bg-purple-200/80 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-black text-purple-800 text-[11px] uppercase tracking-wide bg-purple-200/80 px-2.5 py-0.5 rounded-md border border-purple-300">
              {item.badge || "Thần chú TOEIC"}
            </span>
          </div>
          <div className="text-xs leading-relaxed text-purple-900 font-medium">
            <FormattedText text={item.description || ""} />
          </div>
        </div>
      </div>
    );
  }

  // 5) Dạng lưu ý
  if (item.type === "note") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 flex items-start gap-3 text-xs text-amber-950 shadow-2xs">
        <div className="w-7 h-7 rounded-xl bg-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="font-black text-amber-800 text-[11px] uppercase tracking-wide bg-amber-200/80 px-2.5 py-0.5 rounded-md border border-amber-300">
            {item.badge || "Lưu ý đề thi"}
          </span>
          <div className="text-xs leading-relaxed text-amber-900 font-medium">
            <FormattedText text={item.description || ""} />
          </div>
        </div>
      </div>
    );
  }

  // 6) Dạng ví dụ inline
  if (item.type === "example") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 flex items-start gap-2.5 text-xs text-slate-800">
        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
          Ví dụ
        </span>
        <div className="text-xs italic font-medium">
          <FormattedText text={item.description || ""} />
        </div>
      </div>
    );
  }

  // 7) Dạng tiêu đề phụ (Subheading dạng 1. Rút gọn thành V-ing...)
  if (item.type === "subheading") {
    return (
      <div className="pt-3 pb-1.5 flex items-center gap-2 border-b border-slate-100">
        {item.key && (
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
            {item.key}
          </span>
        )}
        <h4 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight">
          {item.badge}
        </h4>
        {item.description && (
          <span className="text-xs text-slate-500 font-medium">
            <FormattedText text={item.description} />
          </span>
        )}
      </div>
    );
  }

  // 8) Dạng rule có từ khóa in đậm (vd: WHO, WHOM, THAT...)
  if (item.type === "key_rule") {
    return (
      <div className="group rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2 hover:border-blue-300 hover:shadow-xs transition-all">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-black text-xs px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {item.key}
          </span>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed font-normal">
          <FormattedText text={item.description || ""} />
        </div>
      </div>
    );
  }

  // 9) Dạng plain thông thường
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs text-slate-700 leading-relaxed">
      <FormattedText text={item.description || item.raw} />
    </div>
  );
};

// ==========================================
// 5. MAIN FORMULA VIEWER COMPONENT
// ==========================================
export interface GrammarFormulaViewerProps {
  formulaText: string;
  topicTitle?: string;
  topicCode?: string;
}

export const GrammarFormulaViewer: React.FC<GrammarFormulaViewerProps> = ({
  formulaText,
  topicTitle = "Ngữ pháp TOEIC",
  topicCode = "",
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedSecId, setSelectedSecId] = useState<string>("ALL");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Parse toàn bộ formula
  const sections = useMemo(() => {
    return parseFormulaText(formulaText);
  }, [formulaText]);

  // Xử lý copy
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(formulaText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Could not copy:", e);
    }
  };

  // Toggle thu gọn từng section
  const toggleCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  // Mở tất cả / Thu gọn tất cả
  const toggleAll = (collapse: boolean) => {
    const newState: Record<string, boolean> = {};
    sections.forEach((s) => {
      newState[s.id] = collapse;
    });
    setCollapsedSections(newState);
  };

  // Lọc theo Section và Từ khóa tìm kiếm
  const filteredSections = useMemo(() => {
    return sections
      .filter((sec) => selectedSecId === "ALL" || sec.id === selectedSecId)
      .map((sec) => {
        if (!searchFilter.trim()) return sec;
        const q = searchFilter.toLowerCase().trim();

        const matchTitle = sec.title.toLowerCase().includes(q);
        const filteredItems = sec.items.filter(
          (it) =>
            it.raw.toLowerCase().includes(q) ||
            (it.key && it.key.toLowerCase().includes(q)) ||
            (it.description && it.description.toLowerCase().includes(q)) ||
            (it.originalText && it.originalText.toLowerCase().includes(q))
        );

        const filteredSubs = sec.subsections
          .map((sub) => {
            const subMatch = sub.title.toLowerCase().includes(q);
            const subItems = sub.items.filter(
              (it) =>
                it.raw.toLowerCase().includes(q) ||
                (it.key && it.key.toLowerCase().includes(q)) ||
                (it.description && it.description.toLowerCase().includes(q))
            );
            return {
              ...sub,
              items: subMatch ? sub.items : subItems,
            };
          })
          .filter((sub) => sub.items.length > 0);

        if (matchTitle) return sec;

        return {
          ...sec,
          items: filteredItems,
          subsections: filteredSubs,
        };
      })
      .filter((sec) => sec.items.length > 0 || sec.subsections.length > 0);
  }, [sections, selectedSecId, searchFilter]);

  if (!formulaText) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Chưa có dữ liệu công thức cho chuyên đề này.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-200">
      {/* 1. Header Toolbar trực quan */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-100 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black text-[11px] tracking-wide uppercase shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
                Công thức TOEIC đóng khung
              </span>
              {topicCode && (
                <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {topicCode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium pt-1">
              Hệ thống <strong className="text-slate-900">{sections.length} phần cốt lõi</strong> được phân tách rõ ràng, kèm ví dụ và bẫy thi thực chiến.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                copied
                  ? "bg-emerald-600 text-white border border-emerald-600"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
              title="Sao chép toàn bộ công thức"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const isAnyCollapsed = Object.values(collapsedSections).some(Boolean);
                toggleAll(!isAnyCollapsed);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Mở/Gọn</span>
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm & Lọc phần nhanh */}
        <div className="mt-3.5 pt-3 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Ô tìm kiếm nhanh */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đại từ, quy tắc, công thức..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Quick filter pills */}
          {sections.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSecId("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedSecId === "ALL"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                }`}
              >
                Tất cả ({sections.length})
              </button>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSecId(sec.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer max-w-[140px] truncate ${
                    selectedSecId === sec.id
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white/80 text-slate-600 hover:bg-white border border-slate-200"
                  }`}
                  title={sec.title}
                >
                  {sec.number ? `P.${sec.number}` : ""} {sec.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Danh sách các Section Cards rõ ràng */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Không tìm thấy quy tắc nào khớp với từ khóa: <strong>&quot;{searchFilter}&quot;</strong>
          </div>
        ) : (
          filteredSections.map((sec) => {
            const isCollapsed = !!collapsedSections[sec.id];
            const totalItems =
              sec.items.length +
              sec.subsections.reduce((acc, sub) => acc + sub.items.length, 0);

            return (
              <div
                key={sec.id}
                className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200 hover:border-blue-200"
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleCollapse(sec.id)}
                  className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-white px-5 py-3.5 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {sec.number ? (
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {sec.number.padStart(2, "0")}
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                    )}
                    <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                      {sec.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/70">
                      {totalItems} quy tắc
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Section Body */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
                    {/* Items trực tiếp của Section */}
                    {sec.items.length > 0 && (
                      <div className="space-y-2.5">
                        {sec.items.map((item) => (
                          <GrammarItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}

                    {/* Subsections nếu có */}
                    {sec.subsections.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="mt-3 pt-3 border-t border-slate-100 space-y-2.5"
                      >
                        <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3 py-0.5">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {sub.title}
                          </h4>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            {sub.items.length} cấu trúc
                          </span>
                        </div>

                        <div className="space-y-2.5 pl-1 sm:pl-3">
                          {sub.items.map((item) => (
                            <GrammarItemCard key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. SIGNALS VIEWER (DẤU HIỆU NHẬN BIẾT)
// ==========================================
export const GrammarSignalsViewer: React.FC<{ signalWords: string[] }> = ({
  signalWords,
}) => {
  if (!signalWords || signalWords.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        Chưa có dấu hiệu nhận biết được thiết lập.
      </div>
    );
  }

  // Tách xem có chứa markdown checklist / multi-line không
  const isMultiLineStrategy = signalWords.some(
    (w) => w.includes("\n") || w.trim().startsWith("-")
  );

  if (isMultiLineStrategy) {
    return (
      <div className="space-y-3 font-sans">
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold">
            Chiến thuật nhận diện đáp án siêu nhanh trong phòng thi TOEIC:
          </span>
        </div>

        <div className="space-y-3">
          {signalWords.map((rawBlock, bIdx) => {
            const lines = rawBlock.split("\n").filter((l) => l.trim());
            return (
              <div
                key={bIdx}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-2.5"
              >
                {lines.map((line, lIdx) => {
                  const s = line.trim();
                  const isMainStep = s.startsWith("- ");
                  const isSubStep = s.startsWith("* ") || s.startsWith("-> ");

                  if (isMainStep) {
                    return (
                      <div
                        key={lIdx}
                        className="flex items-start gap-2 pt-1 font-bold text-slate-900 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div className="flex-1">
                          <FormattedText text={s.replace(/^-\s*/, "")} />
                        </div>
                      </div>
                    );
                  }

                  if (isSubStep) {
                    const isDangerAlert = s.includes("GẠCH NGAY") || s.includes("KHÔNG");
                    return (
                      <div
                        key={lIdx}
                        className={`ml-7 pl-3 py-1 text-xs border-l-2 ${
                          isDangerAlert
                            ? "border-rose-400 bg-rose-50/60 text-rose-900 rounded-r-lg font-semibold"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        <FormattedText text={s.replace(/^\*\s*/, "").replace(/^->\s*/, "➔ ")} />
                      </div>
                    );
                  }

                  return (
                    <div key={lIdx} className="text-xs text-slate-600 pl-7">
                      <FormattedText text={s} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Nếu là mảng các từ đơn (VD: yesterday, ago, last week...)
  return (
    <div className="space-y-3 font-sans">
      <p className="text-xs font-bold text-slate-700">
        Các từ / cụm từ dấu hiệu nhận biết nhanh trong bài thi:
      </p>
      <div className="flex flex-wrap gap-2">
        {signalWords.map((word, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs shadow-2xs hover:bg-amber-100 transition-colors"
          >
            ✨ {word}
          </span>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 7. TRAPS VIEWER (BẪY TOEIC)
// ==========================================
export const GrammarTrapsViewer: React.FC<{ traps: string[] }> = ({ traps }) => {
  if (!traps || traps.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        Chưa có ghi chú bẫy cho chủ điểm này.
      </div>
    );
  }

  // Tách traps nếu mỗi string có nhiều dòng bắt đầu bằng `- `
  const flattenedTraps: string[] = [];
  traps.forEach((t) => {
    if (t.includes("\n- ")) {
      const parts = t.split("\n- ").filter(Boolean);
      parts.forEach((p, idx) => {
        flattenedTraps.push(idx === 0 ? p : `- ${p}`);
      });
    } else {
      flattenedTraps.push(t);
    }
  });

  return (
    <div className="space-y-3 font-sans">
      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span className="font-bold">
          Cảnh báo các bẫy ngữ pháp thường xuất hiện nhiều nhất trong đề thi TOEIC:
        </span>
      </div>

      <div className="space-y-2.5">
        {flattenedTraps.map((trap, idx) => {
          const cleanText = trap.replace(/^[-*]\s*/, "");
          const matchTrapTitle = cleanText.match(/^\*\*([^*]+)\*\*:\s*(.*)/);

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-2xs space-y-1.5 hover:border-rose-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  !
                </span>
                {matchTrapTitle ? (
                  <span className="font-extrabold text-rose-900 text-xs sm:text-sm">
                    {matchTrapTitle[1]}
                  </span>
                ) : (
                  <span className="font-extrabold text-rose-900 text-xs">
                    Bẫy ngữ pháp #{idx + 1}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-700 leading-relaxed pl-7">
                <FormattedText
                  text={matchTrapTitle ? matchTrapTitle[2] : cleanText}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 8. EXAMPLES VIEWER (VÍ DỤ MINH HỌA)
// ==========================================
export interface SampleQuestionItem {
  id?: string | number;
  part?: string;
  questionText: string;
  options?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    [key: string]: string | undefined;
  };
  correctAnswer: string;
  explanation: string;
  trapNote?: string;
  translation?: string;
  difficulty?: string;
}

export const GrammarExamplesViewer: React.FC<{
  examples: Array<{ sentence: string; translation?: string; analysis?: string }>;
  topicCode?: string;
  sampleQuestions?: Array<SampleQuestionItem>;
}> = ({ examples, topicCode, sampleQuestions }) => {
  const validExamples = (examples || []).filter((ex) => ex && ex.sentence && ex.sentence.trim().length > 0);
  const sampleList = (sampleQuestions || []).slice(0, 2);

  if (validExamples.length === 0 && sampleList.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-1">
        <p className="font-bold text-slate-700">Đang cập nhật ví dụ minh họa cho chủ điểm này.</p>
        <p className="text-slate-400">Bạn có thể bấm &quot;Luyện tập ngay&quot; ở góc dưới để làm 10 câu bài tập trắc nghiệm kèm giải thích chi tiết từng câu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Phần Ví dụ câu minh họa & Mẹo phân tích */}
      {validExamples.length > 0 && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-950 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold">
                Câu ví dụ minh họa chuẩn định dạng ETS & Phân tích cấu trúc:
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
              {validExamples.length} ví dụ
            </span>
          </div>

          <div className="space-y-3">
            {validExamples.map((ex, idx) => {
              const isMultiLineTips = ex.sentence.includes("\n") || ex.sentence.includes("Thần chú") || ex.sentence.includes("Mẹo");

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-white border shadow-2xs space-y-2.5 transition-all ${
                    isMultiLineTips
                      ? "border-amber-200/80 bg-linear-to-b from-amber-50/20 to-white hover:border-amber-300"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {isMultiLineTips ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs pb-2 mb-2 border-b border-amber-100">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Mẹo ghi nhớ & Thần chú phản xạ nhanh:</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {ex.sentence.split("\n").map((line, lIdx) => {
                          const s = line.trim();
                          if (!s) return null;
                          const isNum = s.match(/^\d+[\.\)]/);
                          return (
                            <div
                              key={lIdx}
                              className={
                                isNum
                                  ? "font-bold text-slate-900 pt-1"
                                  : "pl-4 text-slate-700 font-medium"
                              }
                            >
                              <FormattedText text={s} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs pb-1.5 mb-1.5 border-b border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>Mẫu câu thực hành #{idx + 1}:</span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
                        <FormattedText text={ex.sentence} />
                      </p>
                    </div>
                  )}

                  {ex.translation && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong className="font-semibold text-slate-700 not-italic">Dịch nghĩa: </strong>
                      {ex.translation}
                    </p>
                  )}

                  {ex.analysis && (
                    <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed flex items-start gap-2">
                      <span className="font-black text-blue-700 shrink-0">💡 Phân tích ETS:</span>
                      <div>
                        <FormattedText text={ex.analysis} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Phần Câu hỏi mẫu trích xuất từ đề thi ETS */}
      {sampleList.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-emerald-950 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">
                Câu hỏi thi mẫu minh họa (Kèm đáp án & phân tích chi tiết):
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              {sampleList.length} câu mẫu
            </span>
          </div>

          <div className="space-y-3">
            {sampleList.map((q, qIdx) => {
              // Lấy câu hỏi sạch nếu questionText gộp cả options
              const rawText = q.questionText || "";
              const cleanQuestion = rawText
                .split("\nA.")[0]
                .split("\n(A)")[0]
                .trim();

              return (
                <div
                  key={q.id || qIdx}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black">
                        ĐỀ THI MẪU #{qIdx + 1}
                      </span>
                      {q.difficulty && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          Độ khó: {q.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      Đáp án đúng: {q.correctAnswer}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
                    <FormattedText text={cleanQuestion || rawText} />
                  </p>

                  {/* 4 phương án lựa chọn */}
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {Object.entries(q.options).map(([optKey, optVal]) => {
                        const isCorrect =
                          optKey.toUpperCase() === (q.correctAnswer || "").trim().toUpperCase();
                        return (
                          <div
                            key={optKey}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold shadow-2xs"
                                : "bg-slate-50/70 text-slate-700 border-slate-200/80 font-medium"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="truncate">{optVal}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dịch câu hỏi */}
                  {q.translation && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong className="font-semibold text-slate-700 not-italic">Dịch đề: </strong>
                      {q.translation}
                    </p>
                  )}

                  {/* Giải thích chi tiết */}
                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-100 text-xs text-blue-950 font-medium leading-relaxed flex items-start gap-2">
                      <span className="font-black text-blue-700 shrink-0">💡 Phân tích giải thích:</span>
                      <div>
                        <FormattedText text={q.explanation} />
                      </div>
                    </div>
                  )}

                  {/* Cảnh báo bẫy thi */}
                  {q.trapNote && (
                    <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-amber-800">Bẫy ETS cần chú ý: </strong>
                        <FormattedText text={q.trapNote} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
