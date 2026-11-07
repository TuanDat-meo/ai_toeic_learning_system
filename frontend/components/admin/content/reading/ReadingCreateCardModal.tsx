"use client";

import React, { useState, useMemo } from "react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  X,
  BookOpen,
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";

interface ReadingCreateCardModalProps {
  editingCard: ExerciseCardData | null;
  cardFormTitle: string;
  setCardFormTitle: (val: string) => void;
  cardFormCategory: "grammar" | "part5" | "part6" | "part7";
  setCardFormCategory: (val: "grammar" | "part5" | "part6" | "part7") => void;
  cardFormSubCategory: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types";
  setCardFormSubCategory: (val: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types") => void;
  cardFormTag: string;
  setCardFormTag: (val: string) => void;
  cardFormTotalQuestions: number;
  setCardFormTotalQuestions: (val: number) => void;
  cardFormTheorySummary: string;
  setCardFormTheorySummary: (val: string) => void;
  cardFormTheoryRules: string;
  setCardFormTheoryRules: (val: string) => void;
  cardFormTheoryExample: string;
  setCardFormTheoryExample: (val: string) => void;
  onSaveCard: (e: React.FormEvent) => void;
  onClose: () => void;
}

interface PartPreset {
  category: "part5" | "part6" | "part7";
  label: string;
  subCategory: "word_types" | "text_types" | "levels";
  tag: string;
  defaultQuestions: number;
  titleSuggestion: string;
  directionsEn: string;
  directionsVi: string;
  rules: string[];
  example: string;
  badgeBg: string;
  badgeText: string;
}

const PART_PRESETS: Record<"part5" | "part6" | "part7", PartPreset> = {
  part5: {
    category: "part5",
    label: "Part 5: Incomplete Sentences",
    subCategory: "word_types",
    tag: "Part 5 - Điền câu đơn",
    defaultQuestions: 30,
    titleSuggestion: "ETS TOEIC Reading - Part 5 (Câu 101 - 130)",
    directionsEn:
      "Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.",
    directionsVi:
      "Hướng dẫn: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời được cung cấp bên dưới mỗi câu. Chọn đáp án thích hợp nhất để hoàn thành câu và đánh dấu vào phiếu trả lời.",
    rules: [
      "Quy tắc 1: Xác định cấu trúc câu S + V + O trước khi chọn từ loại.",
      "Quy tắc 2: Phân biệt nhanh dạng câu từ vựng (dịch nghĩa) và dạng câu ngữ pháp (nhìn trước sau chỗ trống).",
      "Quy tắc 3: Tốc độ chuẩn ETS là tối đa 30 giây/câu để dành thời gian cho Part 7.",
    ],
    example: "Ms. Reynolds requested that all department managers submit their quarterly budget estimates by Friday.",
    badgeBg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    badgeText: "text-emerald-800",
  },
  part6: {
    category: "part6",
    label: "Part 6: Text Completion",
    subCategory: "text_types",
    tag: "Part 6 - Điền đoạn văn",
    defaultQuestions: 16,
    titleSuggestion: "ETS TOEIC Reading - Part 6 (Điền đoạn 131 - 146)",
    directionsEn:
      "Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text. Then mark the letter (A), (B), (C), or (D) on your answer sheet.",
    directionsVi:
      "Hướng dẫn: Đọc các đoạn văn sau. Một số vị trí trong đoạn văn bị khuyết từ, cụm từ hoặc câu. Chọn phương án trả lời thích hợp nhất để điền vào chỗ trống.",
    rules: [
      "Quy tắc 1: Đoạn văn gồm 4 câu khuyết ([131]-[134]). Luôn đọc câu trước và câu sau chỗ trống.",
      "Quy tắc 2: Đối với câu điền nguyên câu văn (Sentence insertion), đọc lướt cả đoạn để nắm mạch logic.",
      "Quy tắc 3: Chú ý liên từ chuyển ý (However, Therefore, In addition) và thì của toàn đoạn văn.",
    ],
    example: "The technicians will need to enter each bathroom to inspect the water pipes.",
    badgeBg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    badgeText: "text-purple-800",
  },
  part7: {
    category: "part7",
    label: "Part 7: Reading Comprehension",
    subCategory: "levels",
    tag: "Part 7 - Đọc hiểu văn bản",
    defaultQuestions: 54,
    titleSuggestion: "ETS TOEIC Reading - Part 7 (Đọc hiểu 147 - 200)",
    directionsEn:
      "Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, letters, and advertisements. Each text is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D) on your answer sheet.",
    directionsVi:
      "Hướng dẫn: Trong phần này bạn sẽ đọc tuyển tập các văn bản (bài báo, thư từ, quảng cáo, email, tin nhắn). Mỗi bài đọc có một số câu hỏi đi kèm. Chọn phương án trả lời chính xác nhất.",
    rules: [
      "Quy tắc 1: Đọc lướt tiêu đề văn bản, người gửi/người nhận và mục đích trước khi đọc chi tiết.",
      "Quy tắc 2: Với bài đọc đôi/ba (Double & Triple Passages), câu hỏi số 4 & 5 thường yêu cầu liên kết thông tin giữa 2 văn bản.",
      "Quy tắc 3: Cảnh giác bẫy từ đồng nghĩa (paraphrasing) - từ trong đáp án đúng thường diễn đạt lại từ trong bài.",
    ],
    example: "According to the email, what discount will customers receive if they book before June 1st?",
    badgeBg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    badgeText: "text-blue-800",
  },
};

export const ReadingCreateCardModal: React.FC<ReadingCreateCardModalProps> = ({
  editingCard,
  cardFormTitle,
  setCardFormTitle,
  cardFormCategory,
  setCardFormCategory,
  cardFormSubCategory,
  setCardFormSubCategory,
  cardFormTag,
  setCardFormTag,
  cardFormTotalQuestions,
  setCardFormTotalQuestions,
  cardFormTheorySummary,
  setCardFormTheorySummary,
  cardFormTheoryRules,
  setCardFormTheoryRules,
  cardFormTheoryExample,
  setCardFormTheoryExample,
  onSaveCard,
  onClose,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Smart Auto-Detection State
  const [detectorInput, setDetectorInput] = useState("");
  const [showAutoDetector, setShowAutoDetector] = useState(false);

  // Auto-detection logic based on user input
  const detectedInfo = useMemo(() => {
    if (!detectorInput.trim()) return null;
    const text = detectorInput;
    const lower = text.toLowerCase();

    // Check for blank gaps tokens (Part 6)
    const hasGapTokens =
      lower.includes("[131]") ||
      lower.includes("[132]") ||
      lower.includes("[133]") ||
      lower.includes("[134]") ||
      lower.includes("[1]") ||
      lower.includes("[2]") ||
      lower.includes("[3]") ||
      lower.includes("[4]") ||
      lower.includes("___") ||
      lower.includes("______") ||
      lower.includes("[...]");

    // Check for email / notice / letter headers (Part 7)
    const hasPassageHeader =
      lower.includes("from:") ||
      lower.includes("to:") ||
      lower.includes("subject:") ||
      lower.includes("date:") ||
      lower.includes("dear ") ||
      lower.includes("questions 147") ||
      lower.includes("questions 150") ||
      lower.includes("questions 160") ||
      lower.includes("questions 170") ||
      lower.includes("questions 180") ||
      lower.includes("questions 190") ||
      lower.includes("memo") ||
      lower.includes("press release") ||
      lower.includes("notice to all");

    const lineCount = text.split("\n").filter((l) => l.trim().length > 0).length;
    const hasLongParagraph = text.split("\n").some((l) => l.trim().length > 180);

    if (hasGapTokens) {
      return {
        part: "part6" as const,
        confidence: "Cao (98%)",
        reason: "Phát hiện đoạn văn có lỗ khuyết điền từ ([131], [132], [1], [___]).",
        title: "Part 6: Text Completion (Điền đoạn văn)",
        color: "text-purple-700 bg-purple-50 border-purple-200",
      };
    }

    if (hasPassageHeader || (hasLongParagraph && lineCount > 4)) {
      return {
        part: "part7" as const,
        confidence: "Cao (95%)",
        reason: "Phát hiện đoạn văn đọc hiểu dài (Email, Notice, Article) kèm câu hỏi suy luận.",
        title: "Part 7: Reading Comprehension (Đọc hiểu văn bản)",
        color: "text-blue-700 bg-blue-50 border-blue-200",
      };
    }

    return {
      part: "part5" as const,
      confidence: "Cao (99%)",
      reason: "Không có đoạn văn đọc dài, chỉ gồm các câu văn khuyết ngắn kèm đáp án A/B/C/D.",
      title: "Part 5: Incomplete Sentences (Câu đơn)",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  }, [detectorInput]);

  // Apply a Preset
  const handleApplyPreset = (presetKey: "part5" | "part6" | "part7") => {
    const preset = PART_PRESETS[presetKey];
    setCardFormCategory(preset.category);
    setCardFormSubCategory(preset.subCategory);
    setCardFormTag(preset.tag);
    setCardFormTotalQuestions(preset.defaultQuestions);
    if (!cardFormTitle.trim() || cardFormTitle.includes("Part")) {
      setCardFormTitle(preset.titleSuggestion);
    }
    setCardFormTheorySummary(preset.directionsVi);
    setCardFormTheoryRules(preset.rules.join("\n"));
    setCardFormTheoryExample(preset.example);
    setErrorMsg(null);
  };

  // Apply Auto-Detection
  const handleApplyDetected = () => {
    if (!detectedInfo) return;
    handleApplyPreset(detectedInfo.part);
    setShowAutoDetector(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) {
      setErrorMsg("Vui lòng nhập tên chủ điểm đọc (không được để trống).");
      return;
    }
    if (cardFormTitle.trim().length < 3) {
      setErrorMsg("Tên chủ điểm đọc phải có ít nhất 3 ký tự.");
      return;
    }
    if (!cardFormTheorySummary.trim()) {
      setErrorMsg("Vui lòng nhập tóm tắt lý thuyết để hướng dẫn học viên khi làm bài.");
      return;
    }
    setErrorMsg(null);
    onSaveCard(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                Reading Framework
              </span>
              <span className="text-[11px] font-bold text-slate-400">ETS Part 5, 6, 7</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {editingCard ? "Chỉnh sửa chuyên đề đọc" : "Tạo chuyên đề Reading theo khuôn chuẩn TOEIC"}
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

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. KHUÔN MẪU PART CHUẨN TOEIC (PRESET TEMPLATES) */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/30 border border-blue-100/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Khuôn mẫu Part chuẩn TOEIC (1-Click áp dụng)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAutoDetector(!showAutoDetector)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{showAutoDetector ? "Ẩn tự động nhận diện" : "Tự động nhận diện câu hỏi"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleApplyPreset("part5")}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                cardFormCategory === "part5"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white hover:bg-emerald-50/60 border-slate-200 text-slate-800"
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                  Part 5
                </span>
                <span className="text-xs font-bold block mt-0.5">Incomplete Sentences</span>
              </div>
              <span className="text-[10px] mt-1.5 opacity-90 block">30 câu (101-130) • Câu đơn</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("part6")}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                cardFormCategory === "part6"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-white hover:bg-purple-50/60 border-slate-200 text-slate-800"
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                  Part 6
                </span>
                <span className="text-xs font-bold block mt-0.5">Text Completion</span>
              </div>
              <span className="text-[10px] mt-1.5 opacity-90 block">16 câu (131-146) • 4 đoạn khuyết</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("part7")}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                cardFormCategory === "part7"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white hover:bg-blue-50/60 border-slate-200 text-slate-800"
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                  Part 7
                </span>
                <span className="text-xs font-bold block mt-0.5">Reading Comprehension</span>
              </div>
              <span className="text-[10px] mt-1.5 opacity-90 block">54 câu (147-200) • Đoạn đơn & đa</span>
            </button>
          </div>
        </div>

        {/* 2. CÔNG CỤ TỰ ĐỘNG NHẬN DIỆN CÂU HỎI (SMART AUTO-DETECTION) */}
        {showAutoDetector && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Nhận diện tự động Part dựa trên nội dung nhập</span>
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                Dán câu hỏi hoặc đoạn văn vào ô bên dưới
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Dán câu hỏi trắc nghiệm hoặc bài đọc vào đây để hệ thống tự nhận diện Part 5, 6 hay 7..."
              value={detectorInput}
              onChange={(e) => setDetectorInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-200"
            />

            {detectedInfo && (
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${detectedInfo.color}`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">{detectedInfo.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 font-semibold">
                      Độ tin cậy: {detectedInfo.confidence}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 pl-6">{detectedInfo.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyDetected}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Áp dụng khuôn này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. FORM NHẬP THÔNG TIN CHI TIẾT */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Thông tin chủ điểm */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>1. Thông tin chuyên đề</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Tên chủ điểm / Bài đọc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: ETS TOEIC Reading - Part 5 (Câu 101 - 130)"
                value={cardFormTitle}
                onChange={(e) => {
                  setCardFormTitle(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-hidden transition bg-white ${
                  !cardFormTitle.trim() && errorMsg
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Phần thi (Part)</label>
                <select
                  value={cardFormCategory}
                  onChange={(e) => {
                    const cat = e.target.value as "grammar" | "part5" | "part6" | "part7";
                    setCardFormCategory(cat);
                    if (cat === "part5" || cat === "part6" || cat === "part7") {
                      handleApplyPreset(cat);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="part5">Part 5 (Điền câu đơn - 30 câu)</option>
                  <option value="part6">Part 6 (Điền đoạn văn - 16 câu)</option>
                  <option value="part7">Part 7 (Đọc hiểu văn bản - 54 câu)</option>
                  <option value="grammar">Ngữ pháp đọc (Grammar)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nhóm con</label>
                <select
                  value={cardFormSubCategory}
                  onChange={(e) =>
                    setCardFormSubCategory(
                      e.target.value as "word_types" | "verbs" | "other_grammar" | "levels" | "by_topic" | "text_types"
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="word_types">Từ loại (Word Types)</option>
                  <option value="verbs">Thì &amp; Động từ (Verbs)</option>
                  <option value="other_grammar">Ngữ pháp khác</option>
                  <option value="text_types">Theo dạng văn bản TOEIC</option>
                  <option value="levels">Theo cấp độ (Levels)</option>
                  <option value="by_topic">Theo chủ đề thực tế</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Số câu bài tập</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={cardFormTotalQuestions}
                  onChange={(e) => setCardFormTotalQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Thẻ ghi chú (Tag nhận diện)</label>
              <input
                type="text"
                placeholder="Ví dụ: Part 5 - Câu đơn | Bẫy thường gặp"
                value={cardFormTag}
                onChange={(e) => setCardFormTag(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Lý thuyết & Mẹo làm bài chuẩn TOEIC */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>2. Hướng dẫn thi TOEIC (Directions) &amp; Chiến thuật</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Hướng dẫn làm bài chuẩn ETS (Directions) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời..."
                value={cardFormTheorySummary}
                onChange={(e) => {
                  setCardFormTheorySummary(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-hidden transition bg-white resize-none ${
                  !cardFormTheorySummary.trim() && errorMsg
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Quy tắc &amp; Dấu hiệu nhận biết (Mỗi dòng 1 quy tắc)
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ:&#10;Quy tắc 1: Xác định cấu trúc câu S + V + O trước khi chọn từ loại.&#10;Quy tắc 2: Tốc độ chuẩn ETS là tối đa 30 giây/câu."
                value={cardFormTheoryRules}
                onChange={(e) => setCardFormTheoryRules(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Ví dụ minh họa thực tế trong đề thi</label>
              <input
                type="text"
                placeholder="Ví dụ: Ms. Reynolds requested that all department managers submit their estimates."
                value={cardFormTheoryExample}
                onChange={(e) => setCardFormTheoryExample(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              <span className="text-red-500 font-bold">*</span> Bắt buộc nhập đầy đủ dữ liệu
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{editingCard ? "Lưu thay đổi" : "Tạo chuyên đề"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
