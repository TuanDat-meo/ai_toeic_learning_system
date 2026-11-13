"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ExerciseCardData, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import {
  ReadingVocabExtractorPanel,
  type AppliedVocabEntry,
} from "./ReadingVocabExtractorPanel";
import {
  enrichInlineParsedVocab,
  toModalPosSelectValue,
} from "@/lib/readingVocabExtractor";
import {
  lookupEnglishDictionary,
  type EnglishDictionarySuggestion,
} from "@/lib/api/english-dictionary";
import {
  parseAdminReadingFile,
  normalizeSampleQuestion,
  normalizeVocabArray,
} from "@/lib/api/reading";
import {
  X,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  Scissors,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
  Layers,
  Plus,
  Trash2,
  Check,
  ListOrdered,
  BookMarked,
  Info,
  Volume2,
  Loader2,
  Upload,
} from "lucide-react";

export interface ReadingCreateCardModalProps {
  editingCard: ExerciseCardData | null;
  cardFormTitle: string;
  setCardFormTitle: (val: string) => void;
  cardFormCategory: "grammar" | "part5" | "part6" | "part7";
  setCardFormCategory: (val: "grammar" | "part5" | "part6" | "part7") => void;
  cardFormSubCategory: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types";
  setCardFormSubCategory: (val: "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types") => void;
  cardFormTag: string;
  setCardFormTag: (val: string) => void;
  cardFormTheorySummary: string;
  setCardFormTheorySummary: (val: string) => void;
  cardFormTheoryRules: string;
  setCardFormTheoryRules: (val: string) => void;
  cardFormTheoryExample: string;
  setCardFormTheoryExample: (val: string) => void;
  cardFormPassageText: string;
  setCardFormPassageText: (val: string) => void;
  cardFormPassageTextVi: string;
  setCardFormPassageTextVi: (val: string) => void;
  cardFormTotalQuestions: number;
  setCardFormTotalQuestions: React.Dispatch<React.SetStateAction<number>>;
  cardFormSampleQuestions: SampleQuestion[];
  setCardFormSampleQuestions: React.Dispatch<React.SetStateAction<SampleQuestion[]>>;
  cardFormVocabList?: VocabItem[];
  setCardFormVocabList?: React.Dispatch<React.SetStateAction<VocabItem[]>>;
  existingCards?: ExerciseCardData[];
  onSaveCard: (e: React.FormEvent, overwriteTargetId?: string) => void;
  onClose: () => void;
  externalToast?: string | null;
  onClearToast?: () => void;
}

interface PartPreset {
  category: "part5" | "part6" | "part7";
  subCategory: "word_types" | "text_types" | "levels";
  tag: string;
  defaultQuestions: number;
  startQuestionNum: string;
  titleSuggestion: string;
  directionsVi: string;
  rules: string[];
  example: string;
  defaultPassage?: string;
  defaultPassageVi?: string;
}

const PART_PRESETS: Record<"part5" | "part6" | "part7", PartPreset> = {
  part5: {
    category: "part5",
    subCategory: "word_types",
    tag: "Part 5 - Điền câu đơn",
    defaultQuestions: 30,
    startQuestionNum: "101",
    titleSuggestion: "ETS TOEIC Reading - Part 5 (Câu 101 - 130)",
    directionsVi: "Chọn từ hoặc cụm từ thích hợp nhất để hoàn thành mỗi câu.",
    rules: ["Xác định cấu trúc câu và từ loại cần điền.", "Phân biệt câu hỏi từ vựng và ngữ pháp."],
    example: "Ms. Reynolds requested that all department managers submit their quarterly budget estimates by Friday.",
  },
  part6: {
    category: "part6",
    subCategory: "text_types",
    tag: "Part 6 - Điền đoạn văn",
    defaultQuestions: 4,
    startQuestionNum: "131",
    titleSuggestion: "ETS TOEIC Reading - Part 6 (Điền đoạn 131 - 134)",
    directionsVi: "Đọc đoạn văn và chọn phương án thích hợp để hoàn thành các chỗ trống.",
    rules: ["Đọc ngữ cảnh trước và sau mỗi chỗ trống.", "Chú ý mạch logic và thì của toàn đoạn."],
    example: "The technicians will need to enter each bathroom to inspect the water pipes.",
    defaultPassage: "To: All Residents\nSubject: Scheduled Maintenance\n\nWater service will be temporarily [131] suspended throughout the building. Please contact the front desk if you have any urgent questions.",
    defaultPassageVi: "Gửi: Toàn thể cư dân\nTiêu đề: Bảo trì theo lịch\n\nDịch vụ cấp nước sẽ tạm thời bị gián đoạn trên toàn bộ tòa nhà. Vui lòng liên hệ quầy lễ tân nếu quý cư dân có thắc mắc khẩn cấp.",
  },
  part7: {
    category: "part7",
    subCategory: "levels",
    tag: "Part 7 - Đọc hiểu văn bản",
    defaultQuestions: 2,
    startQuestionNum: "147",
    titleSuggestion: "ETS TOEIC Reading - Part 7 (Đọc hiểu 147 - 148)",
    directionsVi: "Đọc văn bản và chọn đáp án chính xác nhất cho mỗi câu hỏi.",
    rules: ["Đọc lướt tiêu đề và mục đích văn bản.", "Dò tìm từ khóa và đối chiếu thông tin."],
    example: "According to the email, what discount will customers receive if they book before June 1st?",
    defaultPassage: "To: All Staff\nFrom: Human Resources\nSubject: Office Relocation\n\nThe office will relocate to the new building on November 15. Please label personal items before the move.",
    defaultPassageVi: "Gửi: Toàn thể nhân viên\nTừ: Phòng Nhân sự\nTiêu đề: Di dời văn phòng\n\nVăn phòng sẽ chuyển đến tòa nhà mới vào ngày 15 tháng 11. Vui lòng dán nhãn đồ dùng cá nhân trước khi chuyển.",
  },
};

const COMMON_TOEIC_OPTION_TRANSLATIONS: Record<string, string> = {
  "to confirm an order": "Xác nhận một đơn hàng",
  "to confirm a reservation": "Xác nhận đặt chỗ",
  "to confirm an appointment": "Xác nhận một cuộc hẹn",
  "to request a refund": "Yêu cầu hoàn tiền",
  "to request additional information": "Yêu cầu thêm thông tin",
  "to request an estimate": "Yêu cầu bảng báo giá",
  "to announce a policy change": "Thông báo thay đổi chính sách",
  "to introduce a new employee": "Giới thiệu nhân viên mới",
  "to schedule an interview": "Lên lịch phỏng vấn",
  "to schedule a meeting": "Lên lịch cuộc họp",
  "to submit an application": "Nộp đơn ứng tuyển",
  "to submit a proposal": "Nộp đề xuất dự án",
  "to invite attendees to an event": "Mời người tham dự sự kiện",
  "to report a technical issue": "Báo cáo sự cố kỹ thuật",
  "to report maintenance progress": "Báo cáo tiến độ bảo trì",
  "to inquire about product availability": "Hỏi về tình trạng còn hàng",
  "to inquire about opening hours": "Hỏi về giờ mở cửa",
  "to offer a special discount": "Cung cấp mức giảm giá đặc biệt",
  "to complain about poor service": "Khiếu nại về chất lượng dịch vụ",
  "to complain about damaged goods": "Khiếu nại về hàng hóa bị hỏng",
  "to thank customers for their patronage": "Cảm ơn khách hàng đã ủng hộ",
  "to thank clients for their business": "Cảm ơn đối tác đã hợp tác",
  "to verify customer information": "Xác minh thông tin khách hàng",
  "to cancel a reservation": "Hủy đặt chỗ",
  "to cancel an order": "Hủy đơn hàng",
  "to extend a contract deadline": "Gia hạn thời hạn hợp đồng",
  "to promote a seasonal sale": "Quảng bá chương trình giảm giá theo mùa",
  "to renew an agreement": "Gia hạn thỏa thuận",
};

const resolveOptionMeaning = (text: string): string => {
  if (!text) return "";
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Direct dictionary match
  if (COMMON_TOEIC_OPTION_TRANSLATIONS[lower]) {
    return COMMON_TOEIC_OPTION_TRANSLATIONS[lower];
  }

  // 2. Direct dictionary match without leading "to "
  const withoutTo = lower.replace(/^to\s+/, "");
  if (COMMON_TOEIC_OPTION_TRANSLATIONS[withoutTo]) {
    return `Để ${COMMON_TOEIC_OPTION_TRANSLATIONS[withoutTo].toLowerCase()}`;
  }

  // 3. Pattern-based heuristic translation for TOEIC purpose infinitives
  if (lower.startsWith("to confirm")) return clean.replace(/^to confirm/i, "Để xác nhận");
  if (lower.startsWith("to request")) return clean.replace(/^to request/i, "Để yêu cầu");
  if (lower.startsWith("to announce")) return clean.replace(/^to announce/i, "Để thông báo");
  if (lower.startsWith("to notify")) return clean.replace(/^to notify/i, "Để thông báo");
  if (lower.startsWith("to apologize")) return clean.replace(/^to apologize/i, "Để xin lỗi");
  if (lower.startsWith("to invite")) return clean.replace(/^to invite/i, "Để mời");
  if (lower.startsWith("to introduce")) return clean.replace(/^to introduce/i, "Để giới thiệu");
  if (lower.startsWith("to report")) return clean.replace(/^to report/i, "Để báo cáo");
  if (lower.startsWith("to inquire")) return clean.replace(/^to inquire/i, "Để tìm hiểu / hỏi về");
  if (lower.startsWith("to advertise")) return clean.replace(/^to advertise/i, "Để quảng cáo");
  if (lower.startsWith("to provide")) return clean.replace(/^to provide/i, "Để cung cấp");
  if (lower.startsWith("to remind")) return clean.replace(/^to remind/i, "Để nhắc nhở");
  if (lower.startsWith("to cancel")) return clean.replace(/^to cancel/i, "Để hủy");
  if (lower.startsWith("to schedule")) return clean.replace(/^to schedule/i, "Để lên lịch");
  if (lower.startsWith("to offer")) return clean.replace(/^to offer/i, "Để cung cấp / tặng");
  if (lower.startsWith("to thank")) return clean.replace(/^to thank/i, "Để cảm ơn");

  return "";
};

type ModalTab = "info" | "passage" | "questions" | "vocab" | "quick_paste";

// Helper trích xuất chữ ký đặc trưng của bộ đề (dùng nhận diện trùng lặp thông minh)
export function extractReadingTestSignature(title: string, category: string): string {
  if (!title) return "";
  const clean = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Nhận diện ETS + Năm + Số Test: ví dụ "etstoeic2024test07..." -> "ets_2024_test_7"
  const m = clean.match(/ets.*?(\d{4}).*?test.*?(\d{1,2})/);
  if (m) {
    return `ets_${m[1]}_test_${parseInt(m[2], 10)}_${category}`;
  }
  // Nhận diện tiêu đề loại bỏ các hậu tố phụ như "200 câu", "Part 5 (101-130)", v.v.
  const stripped = title
    .toLowerCase()
    .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
    .replace(/\s*-\s*part\s*\d+\s*\([^\)]*\)/gi, "")
    .replace(/\s*\([^\)]*\)/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  return `${stripped}_${category}`;
}

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
  cardFormTheorySummary,
  setCardFormTheorySummary,
  cardFormTheoryRules,
  setCardFormTheoryRules,
  cardFormTheoryExample,
  setCardFormTheoryExample,
  cardFormPassageText,
  setCardFormPassageText,
  cardFormPassageTextVi,
  setCardFormPassageTextVi,
  cardFormTotalQuestions,
  setCardFormTotalQuestions,
  cardFormSampleQuestions,
  setCardFormSampleQuestions,
  cardFormVocabList = [],
  setCardFormVocabList,
  existingCards = [],
  onSaveCard,
  onClose,
  externalToast,
  onClearToast,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>("info");
  const [overwriteTargetId, setOverwriteTargetId] = useState<string | null>(null);

  // Phát hiện bài đọc trùng lặp thông minh (cùng mã đề ETS hoặc cùng tiêu đề & part)
  const existingDuplicate = useMemo(() => {
    if (!cardFormTitle.trim() || !existingCards || existingCards.length === 0) return null;
    const currentSig = extractReadingTestSignature(cardFormTitle, cardFormCategory);
    return (
      existingCards.find((c) => {
        if (editingCard && c.id === editingCard.id) return false;
        const otherSig = extractReadingTestSignature(c.title, c.category);
        return otherSig === currentSig;
      }) || null
    );
  }, [cardFormTitle, cardFormCategory, existingCards, editingCard]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [internalToast, setInternalToast] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [passageError, setPassageError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [bilingualError, setBilingualError] = useState<string | null>(null);
  const titleInputRef = React.useRef<HTMLInputElement | null>(null);
  const passageTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const questionInputRef = React.useRef<HTMLInputElement | null>(null);
  const bilingualInputRef = React.useRef<HTMLInputElement | null>(null);
  const firstOptionInputRef = React.useRef<HTMLInputElement | null>(null);
  const vocabWordInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileImportInputRef = React.useRef<HTMLInputElement | null>(null);
  const activeToast = externalToast || internalToast;

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setInternalToast(null);
      if (onClearToast) onClearToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast, onClearToast]);

  const handleCloseToast = () => {
    setInternalToast(null);
    if (onClearToast) onClearToast();
  };

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [partTransitionNotice, setPartTransitionNotice] = useState<{
    fromPart: string;
    toPart: string;
    count: number;
  } | null>(null);
  const [partSwitchConfirm, setPartSwitchConfirm] = useState<{
    targetPart: "grammar" | "part5" | "part6" | "part7";
    prevPart: string;
    qCount: number;
  } | null>(null);

  // Form State for "Thêm từ vựng mới" (Identical to VocabularyModals layout)
  const [vocabInputWord, setVocabInputWord] = useState("");
  const [vocabInputIpa, setVocabInputIpa] = useState("");
  const [vocabInputPos, setVocabInputPos] = useState("Verb");
  const [vocabInputSubCategory, setVocabInputSubCategory] = useState("");
  const [vocabInputMeaning, setVocabInputMeaning] = useState("");
  const [vocabInputExample, setVocabInputExample] = useState("");
  const [vocabInputSynonyms, setVocabInputSynonyms] = useState("");
  const [vocabInputAntonyms, setVocabInputAntonyms] = useState("");
  const [vocabFormError, setVocabFormError] = useState<string | null>(null);
  const [playingRegion, setPlayingRegion] = useState<"UK" | "US" | null>(null);

  // Scope filter for Tab 4 Vocab list ("all", "card", or question index)
  const [vocabFilterScope, setVocabFilterScope] = useState<number | "all" | "card">("all");
  const [vocabTargetQuestionIdx, setVocabTargetQuestionIdx] = useState<number>(0);

  // Live dictionary lookup state inside Tab 4 manual form
  const [dictSuggestion, setDictSuggestion] = useState<EnglishDictionarySuggestion | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "vocab") return;
    const trimmed = vocabInputWord.trim();
    if (
      !trimmed ||
      trimmed.length < 2 ||
      trimmed.length > 60 ||
      !/^[a-zA-Z][a-zA-Z' -]*$/.test(trimmed)
    ) {
      setDictSuggestion(null);
      setDictError(null);
      setDictLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setDictLoading(true);
      setDictError(null);
      try {
        const res = await lookupEnglishDictionary(trimmed, controller.signal);
        if (!controller.signal.aborted) {
          setDictSuggestion(res);
          setDictError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setDictSuggestion(null);
          setDictError(err instanceof Error ? err.message : null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDictLoading(false);
        }
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [activeTab, vocabInputWord]);

  const handleApplyDictSuggestion = (meaningIdx = 0) => {
    if (!dictSuggestion) return;
    const picked =
      dictSuggestion.meanings[meaningIdx] ||
      dictSuggestion.meanings.find((m) => m.meaningLanguage === "vi") ||
      dictSuggestion.meanings[0];
    if (!picked) return;
    if (dictSuggestion.phonetic && !vocabInputIpa.trim()) {
      setVocabInputIpa(dictSuggestion.phonetic);
    }
    if (picked.partOfSpeech) {
      setVocabInputPos(toModalPosSelectValue(picked.partOfSpeech));
    }
    setVocabInputMeaning(picked.definition);
    if (picked.example && !vocabInputExample.trim()) {
      setVocabInputExample(picked.example);
    }
  };

  // Quick Paste raw text
  const [rawPasteText, setRawPasteText] = useState("");
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Smart Auto-Detection State
  const [detectorInput, setDetectorInput] = useState("");
  const [showAutoDetector, setShowAutoDetector] = useState(false);

  const detectedInfo = useMemo(() => {
    if (!detectorInput.trim()) return null;
    const text = detectorInput;
    const lower = text.toLowerCase();
    const hasGapTokens =
      lower.includes("[131]") ||
      lower.includes("[132]") ||
      lower.includes("[133]") ||
      lower.includes("[134]");
    const hasMultiQuestions =
      /questions?\s*\d+\s*[-–to]+\s*\d+/i.test(text) ||
      /câu\s*\d+\s*[-–đến]+\s*\d+/i.test(text);

    if (hasGapTokens) {
      return { part: "part6" as const, title: "Part 6: Text Completion (Điền đoạn văn)" };
    }
    if (hasMultiQuestions || lower.includes("dear ") || lower.includes("subject:") || text.split("\n").length > 6) {
      return { part: "part7" as const, title: "Part 7: Reading Comprehension (Đọc hiểu văn bản)" };
    }
    return { part: "part5" as const, title: "Part 5: Incomplete Sentences (Điền câu đơn)" };
  }, [detectorInput]);

  // Audio Pronunciation Synth for UK / US
  const playRegionalPronunciation = (region: "UK" | "US", wordOverride?: string) => {
    const word = (wordOverride ?? vocabInputWord).trim();
    if (!word) {
      setVocabFormError("Vui lòng nhập từ tiếng Anh trước khi nghe phát âm.");
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setVocabFormError(null);
    setPlayingRegion(region);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = region === "UK" ? "en-GB" : "en-US";
    utterance.rate = 0.88;
    utterance.onend = () => setPlayingRegion(null);
    utterance.onerror = () => setPlayingRegion(null);
    window.speechSynthesis.speak(utterance);
  };

  // Ensure there is at least one question
  const questions = useMemo(() => {
    if (!cardFormSampleQuestions || cardFormSampleQuestions.length === 0) {
      return [
        {
          questionNum: "101",
          question: "",
          bilingual: "",
          options: ["", "", "", ""],
          optionMeanings: ["", "", "", ""],
          correctIndex: -1,
          explanation: "",
          steps: [],
          vocabList: [],
        },
      ];
    }
    return cardFormSampleQuestions;
  }, [cardFormSampleQuestions]);

  const activeQuestion = questions[selectedQuestionIndex] || questions[0];
  const hasPassageTab = cardFormCategory !== "part5" && cardFormCategory !== "grammar";

  // Lấy đoạn văn tiếng Anh sẵn có từ bộ câu hỏi (nếu có)
  const availableEnglishPassage = useMemo(() => {
    return questions.find((q) => q.passageText?.trim())?.passageText?.trim() || "";
  }, [questions]);

  // Tự động đồng bộ đoạn văn tiếng Anh nếu ô tiếng Anh bị trống nhưng bộ câu hỏi đã có sẵn
  useEffect(() => {
    if (!cardFormPassageText.trim() && availableEnglishPassage) {
      setCardFormPassageText(availableEnglishPassage);
    }
  }, [availableEnglishPassage, cardFormPassageText, setCardFormPassageText]);

  // Tự động chuẩn hóa tiêu đề nếu chứa cụm '200 câu' hoặc 'bản chi tiết đầy đủ'
  useEffect(() => {
    if (cardFormTitle && (/200\s*câu|bản chi tiết đầy đủ|full\s*reading/i.test(cardFormTitle))) {
      const cleanBase = cardFormTitle
        .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
        .replace(/\s*-\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
        .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
        .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
        .replace(/\s*-\s*Part\s*[567]\s*(?:\([^\)]*\))?/gi, "")
        .replace(/[\s\-_]+$/, "")
        .trim();
      const basePrefix = cleanBase || "ETS TOEIC Reading";
      const cat = cardFormCategory.toLowerCase();
      let newTitle = basePrefix;
      if (cat === "part5" || cat === "grammar") {
        const qCount = cardFormTotalQuestions && cardFormTotalQuestions !== 30 ? `${cardFormTotalQuestions} câu` : "Câu 101 - 130";
        newTitle = `${basePrefix} - Part 5 (${qCount})`;
      } else if (cat === "part6") {
        const qCount = cardFormTotalQuestions && cardFormTotalQuestions !== 16 && cardFormTotalQuestions !== 4 ? `${cardFormTotalQuestions} câu` : "Câu 131 - 146";
        newTitle = `${basePrefix} - Part 6 (${qCount})`;
      } else if (cat === "part7") {
        const qCount = cardFormTotalQuestions && cardFormTotalQuestions !== 54 && cardFormTotalQuestions !== 2 ? `${cardFormTotalQuestions} câu` : "Câu 147 - 200";
        newTitle = `${basePrefix} - Part 7 (${qCount})`;
      }
      if (newTitle !== cardFormTitle) {
        setCardFormTitle(newTitle);
      }
    }
  }, [cardFormTitle, cardFormCategory, cardFormTotalQuestions, setCardFormTitle]);

  // Total vocab count (card-level + all questions)
  const totalVocabCount = useMemo(() => {
    return cardFormVocabList.length + questions.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0);
  }, [cardFormVocabList, questions]);

  const existingVocabWords = useMemo(() => {
    const words: string[] = [];
    cardFormVocabList.forEach((v) => {
      if (v.word?.trim()) words.push(v.word.trim().toLowerCase());
    });
    questions.forEach((q) => {
      (q.vocabList || []).forEach((v) => {
        if (v.word?.trim()) words.push(v.word.trim().toLowerCase());
      });
    });
    return words;
  }, [cardFormVocabList, questions]);

  // Vocab list displayed according to vocabFilterScope
  const displayedVocabList = useMemo(() => {
    const list: { item: VocabItem; qIdx: number; qNum: string; itemIdx: number }[] = [];
    if (vocabFilterScope === "card" || vocabFilterScope === "all") {
      cardFormVocabList.forEach((item, itemIdx) => {
        list.push({
          item,
          qIdx: -1,
          qNum: "Bài đọc",
          itemIdx,
        });
      });
    }
    if (vocabFilterScope === "all") {
      questions.forEach((q, qIdx) => {
        (q.vocabList || []).forEach((item, itemIdx) => {
          list.push({
            item,
            qIdx,
            qNum: q.questionNum || String(100 + qIdx + 1),
            itemIdx,
          });
        });
      });
    } else if (typeof vocabFilterScope === "number") {
      const targetIdx = Math.min(Math.max(0, vocabFilterScope), questions.length - 1);
      const q = questions[targetIdx] || questions[0];
      (q.vocabList || []).forEach((item, itemIdx) => {
        list.push({
          item,
          qIdx: targetIdx,
          qNum: q.questionNum || String(100 + targetIdx + 1),
          itemIdx,
        });
      });
    }
    return list;
  }, [vocabFilterScope, cardFormVocabList, questions]);

  const handleDeleteVocabGlobal = (qIdx: number, itemIdx: number) => {
    if (qIdx === -1 && setCardFormVocabList) {
      setCardFormVocabList((prev) => prev.filter((_, i) => i !== itemIdx));
      return;
    }
    setCardFormSampleQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIdx]) {
        const q = { ...copy[qIdx] };
        q.vocabList = (q.vocabList || []).filter((_, i) => i !== itemIdx);
        copy[qIdx] = q;
      }
      return copy;
    });
  };

  // Áp dụng cắt gọn về đúng chuẩn 30 câu Part 5 (Câu 101 - 130)
  const handleTrimToPart5Standard = () => {
    const trimmed = questions.slice(0, 30).map((q, idx) => ({
      ...q,
      questionNum: String(101 + idx),
    }));
    setCardFormSampleQuestions(trimmed);
    setCardFormTotalQuestions(30);
    setSelectedQuestionIndex((prev) => Math.min(prev, 29));
    setCardFormTitle("ETS TOEIC Reading - Part 5 (Câu 101 - 130)");
    setCardFormPassageText("");
    setCardFormPassageTextVi("");
    setPartTransitionNotice(null);
    setInternalToast("Đã cắt gọn về chuẩn 30 câu Part 5 (#101 - #130) và đồng bộ tiêu đề! ✨");
  };

  // Giữ nguyên toàn bộ câu hỏi làm bộ luyện tập mở rộng Part 5
  const handleKeepExtendedPart5 = () => {
    const count = questions.length;
    const renumbered = questions.map((q, idx) => ({
      ...q,
      questionNum: String(101 + idx),
    }));
    setCardFormSampleQuestions(renumbered);
    setCardFormTotalQuestions(count);
    setCardFormTitle(`ETS TOEIC Reading - Part 5 (${count} câu luyện tập)`);
    setCardFormPassageText("");
    setCardFormPassageTextVi("");
    setPartTransitionNotice(null);
    setInternalToast(`Đã đánh số lại ${count} câu (#101 - #${100 + count}) và cập nhật tiêu đề phù hợp! ✨`);
  };

  // Helper trích xuất danh sách câu hỏi theo từng Part chuẩn TOEIC
  const extractQuestionsForPart = (
    source: SampleQuestion[],
    p: "part5" | "part6" | "part7"
  ): SampleQuestion[] => {
    let range: [number, number] = [101, 130];
    let relRange: [number, number] = [1, 30];
    let sliceRange: [number, number] = [0, 30];
    let startNum = 101;

    if (p === "part6") {
      range = [131, 146];
      relRange = [31, 46];
      sliceRange = [30, 46];
      startNum = 131;
    } else if (p === "part7") {
      range = [147, 200];
      relRange = [47, 100];
      sliceRange = [46, 100];
      startNum = 147;
    }

    // 1. Tìm theo số câu chuẩn ETS (101-130, 131-146, 147-200)
    let qs = source.filter((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= range[0] && n <= range[1];
    });

    // 2. Nếu không tìm thấy, thử tìm theo số câu tương đối 1..30, 31..46, 47..100
    if (qs.length === 0) {
      qs = source.filter((q) => {
        const n = parseInt(q.questionNum || "0", 10);
        return !isNaN(n) && n >= relRange[0] && n <= relRange[1];
      });
    }

    // 3. Fallback vị trí (slice)
    if (qs.length === 0) {
      if (source.length >= 200) {
        const offset = 100;
        qs = source.slice(offset + sliceRange[0], offset + sliceRange[1]);
      } else {
        qs = source.slice(sliceRange[0], Math.min(sliceRange[1], source.length));
      }
    }

    return qs.map((q, idx) => ({
      ...q,
      questionNum: q.questionNum || String(startNum + idx),
    }));
  };

  // Import tệp đề thi từ bên ngoài (.json, .xlsx, .xls, .txt, .csv)
  const handleImportFileFromLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    setErrorMsg(null);

    const targetPart: "part5" | "part6" | "part7" =
      cardFormCategory === "grammar" ? "part5" : cardFormCategory;

    try {
      if (lowerName.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text);

        // 1. Tìm danh sách câu hỏi thô từ mọi cấu trúc JSON khả dĩ
        let rawCandidates: any[] = [];

        // A. Cấu trúc Full Test ETS: parsed.reading = { part5: [...], part6: [...], part7: [...] }
        if (parsed.reading && typeof parsed.reading === "object") {
          const r = parsed.reading;
          if (targetPart === "part5" && Array.isArray(r.part5)) {
            rawCandidates = r.part5;
          } else if (targetPart === "part6" && Array.isArray(r.part6)) {
            rawCandidates = r.part6;
          } else if (targetPart === "part7" && Array.isArray(r.part7)) {
            rawCandidates = r.part7;
          } else if (Array.isArray(r.questions)) {
            rawCandidates = r.questions;
          } else if (Array.isArray(r.sampleQuestions)) {
            rawCandidates = r.sampleQuestions;
          }
        }

        // B. Cấu trúc có keys ở root: parsed.part5 / part6 / part7
        if (rawCandidates.length === 0) {
          if (targetPart === "part5" && Array.isArray(parsed.part5)) {
            rawCandidates = parsed.part5;
          } else if (targetPart === "part6" && Array.isArray(parsed.part6)) {
            rawCandidates = parsed.part6;
          } else if (targetPart === "part7" && Array.isArray(parsed.part7)) {
            rawCandidates = parsed.part7;
          }
        }

        // C. Cấu trúc sampleQuestions, questions, items, data.questions, root array
        if (rawCandidates.length === 0) {
          if (Array.isArray(parsed.sampleQuestions)) {
            rawCandidates = parsed.sampleQuestions;
          } else if (Array.isArray(parsed.questions)) {
            rawCandidates = parsed.questions;
          } else if (Array.isArray(parsed.items)) {
            rawCandidates = parsed.items;
          } else if (Array.isArray(parsed.data?.questions)) {
            rawCandidates = parsed.data.questions;
          } else if (Array.isArray(parsed.data?.sampleQuestions)) {
            rawCandidates = parsed.data.sampleQuestions;
          } else if (Array.isArray(parsed.data)) {
            rawCandidates = parsed.data;
          } else if (Array.isArray(parsed)) {
            rawCandidates = parsed;
          }
        }

        // 2. Chuẩn hóa tất cả câu hỏi về dạng SampleQuestion
        const normalizedList: SampleQuestion[] = rawCandidates.map((q, idx) =>
          normalizeSampleQuestion(q, idx)
        );

        // 3. Nếu danh sách chứa nhiều Part (đề full 200 câu hoặc 100 câu reading) -> Trích xuất đúng Part hiện tại
        let qs: SampleQuestion[] = [];
        if (normalizedList.length > 0) {
          const hasMultiParts =
            normalizedList.length > 30 ||
            normalizedList.some((q) => {
              const n = parseInt(q.questionNum || "0", 10);
              return targetPart === "part5"
                ? n < 101 || n > 130
                : targetPart === "part6"
                ? n < 131 || n > 146
                : n < 147;
            });

          if (hasMultiParts) {
            qs = extractQuestionsForPart(normalizedList, targetPart);
          } else {
            qs = normalizedList;
          }
        }

        // 4. Trích xuất đoạn văn (Passage) cho Part 6 / 7
        let extractedPassage = parsed.passageText || "";
        let extractedPassageVi = parsed.passageTextVi || "";

        if (!extractedPassage) {
          const firstWithPassage = rawCandidates.find(
            (q) => q && (q.passageTextEn || q.passageText || q.passages)
          );
          if (firstWithPassage) {
            extractedPassage =
              firstWithPassage.passageTextEn ||
              firstWithPassage.passageText ||
              (Array.isArray(firstWithPassage.passages)
                ? firstWithPassage.passages.map((p: any) => p.text || "").join("\n\n")
                : "");
            extractedPassageVi =
              firstWithPassage.passageTextVi ||
              (Array.isArray(firstWithPassage.passages)
                ? firstWithPassage.passages.map((p: any) => p.textVi || "").join("\n\n")
                : "");
          }
        }

        if (targetPart !== "part5") {
          if (extractedPassage) setCardFormPassageText(extractedPassage);
          if (extractedPassageVi) setCardFormPassageTextVi(extractedPassageVi);
        } else {
          setCardFormPassageText("");
          setCardFormPassageTextVi("");
        }

        // 5. Trích xuất từ vựng (Vocabulary)
        const extractedVocabs: VocabItem[] = [];
        const seenWords = new Set<string>();
        const addVocabs = (list: VocabItem[]) => {
          list.forEach((v) => {
            const k = v.word.trim().toLowerCase();
            if (k && !seenWords.has(k)) {
              seenWords.add(k);
              extractedVocabs.push(v);
            }
          });
        };

        if (Array.isArray(parsed.vocabList)) {
          addVocabs(normalizeVocabArray(parsed.vocabList));
        }
        if (Array.isArray(parsed.vocabulary)) {
          addVocabs(normalizeVocabArray(parsed.vocabulary));
        }
        qs.forEach((q) => {
          if (q.vocabList && q.vocabList.length > 0) addVocabs(q.vocabList);
        });

        if (extractedVocabs.length > 0 && setCardFormVocabList) {
          setCardFormVocabList(extractedVocabs);
        }

        // 6. Tiêu đề (Title) & Thẻ (Tag)
        if (parsed.tag) setCardFormTag(parsed.tag);
        if (parsed.title) {
          let finalTitle = parsed.title;
          if (/200\s*câu|full/i.test(finalTitle) && !finalTitle.toLowerCase().includes(targetPart)) {
            const partLabel =
              targetPart === "part5"
                ? "Part 5 (Câu 101 - 130)"
                : targetPart === "part6"
                ? "Part 6 (Câu 131 - 146)"
                : "Part 7 (Câu 147 - 200)";
            finalTitle = `${finalTitle.replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/i, "").trim()} - ${partLabel}`;
          }
          setCardFormTitle(finalTitle);
        }

        // 7. Cập nhật câu hỏi và đồng bộ số câu
        if (qs.length > 0) {
          setCardFormSampleQuestions(qs);
          setCardFormTotalQuestions(qs.length);
          setSelectedQuestionIndex(0);
          setInternalToast(
            `Đã import thành công ${qs.length} câu hỏi ${targetPart.toUpperCase()} từ file "${file.name}"! 🎉`
          );
        } else {
          setErrorMsg(
            `Không tìm thấy câu hỏi phù hợp cho ${targetPart.toUpperCase()} trong file "${file.name}". Vui lòng kiểm tra lại cấu trúc file!`
          );
        }
      } else if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        try {
          const parsedCard = await parseAdminReadingFile(file);
          if (parsedCard.title) setCardFormTitle(parsedCard.title);
          if (parsedCard.tag) setCardFormTag(parsedCard.tag);
          if (parsedCard.passageText && targetPart !== "part5") setCardFormPassageText(parsedCard.passageText);
          if (parsedCard.passageTextVi && targetPart !== "part5") setCardFormPassageTextVi(parsedCard.passageTextVi);
          if (parsedCard.vocabList && setCardFormVocabList) {
            setCardFormVocabList(parsedCard.vocabList);
          }
          if (parsedCard.sampleQuestions && parsedCard.sampleQuestions.length > 0) {
            const qs =
              parsedCard.sampleQuestions.length > 30 ||
              parsedCard.sampleQuestions.some((q) => {
                const n = parseInt(q.questionNum || "0", 10);
                return targetPart === "part5"
                  ? n < 101 || n > 130
                  : targetPart === "part6"
                  ? n < 131 || n > 146
                  : n < 147;
              })
                ? extractQuestionsForPart(parsedCard.sampleQuestions, targetPart)
                : parsedCard.sampleQuestions;

            setCardFormSampleQuestions(qs);
            setCardFormTotalQuestions(qs.length);
            setSelectedQuestionIndex(0);
            setInternalToast(
              `Đã import thành công file Excel "${file.name}" (${qs.length} câu ${targetPart.toUpperCase()})! 🎉`
            );
          }
        } catch {
          setErrorMsg(
            "Không thể phân tích file Excel qua máy chủ. Bạn có thể mở file copy nội dung dán vào tab '⚡ Dán nhanh tự động'!"
          );
        }
      } else {
        // .txt hoặc .csv thô
        const text = await file.text();
        handleParseRawText(text);
        setInternalToast(`Đã import & bóc tách thành công tệp đề thi "${file.name}"! 🎉`);
      }
    } catch (err: any) {
      setErrorMsg(`Lỗi khi đọc file "${file.name}": ${err?.message || "File không hợp lệ"}`);
    } finally {
      if (fileImportInputRef.current) fileImportInputRef.current.value = "";
    }
  };

  // Yêu cầu chuyển đổi Part: nếu đang có dữ liệu thì cảnh báo xác nhận làm mới
  const handleRequestPartChange = (targetPart: "grammar" | "part5" | "part6" | "part7") => {
    if (targetPart === cardFormCategory) return;

    const hasExistingData =
      questions.some((q) => q.question.trim().length > 0) ||
      cardFormPassageText.trim().length > 0;

    if (hasExistingData) {
      setPartSwitchConfirm({
        targetPart,
        prevPart: cardFormCategory,
        qCount: questions.filter((q) => q.question.trim().length > 0).length,
      });
    } else {
      handleExecutePartSwitchWithReset(targetPart);
    }
  };

  // Xác nhận đổi Part & Làm mới sạch dữ liệu theo chuẩn Part mới
  const handleExecutePartSwitchWithReset = (targetPart: "grammar" | "part5" | "part6" | "part7") => {
    const presetKey = (targetPart === "grammar" ? "part5" : targetPart) as "part5" | "part6" | "part7";
    const preset = PART_PRESETS[presetKey];

    setCardFormCategory(targetPart);
    setCardFormSubCategory(preset.subCategory);
    setCardFormTag(preset.tag);
    setCardFormTotalQuestions(preset.defaultQuestions);

    const cleanBase = cardFormTitle
      .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
      .replace(/\s*-\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
      .replace(/\s*-\s*Part\s*[567]\s*(?:\([^\)]*\))?/gi, "")
      .replace(/[\s\-_]+$/, "")
      .trim();
    if (cleanBase && !cleanBase.toLowerCase().startsWith("ets toeic reading")) {
      const qRange = presetKey === "part5" ? "Câu 101 - 130" : presetKey === "part6" ? "Câu 131 - 146" : "Câu 147 - 200";
      setCardFormTitle(`${cleanBase} - ${presetKey === "part5" ? "Part 5" : presetKey === "part6" ? "Part 6" : "Part 7"} (${qRange})`);
    } else {
      setCardFormTitle(preset.titleSuggestion);
    }
    setTitleError(null);
    setPassageError(null);
    setQuestionError(null);
    setOptionsError(null);
    setBilingualError(null);
    setVocabFormError(null);
    setErrorMsg(null);

    // Xóa sạch bài đọc cũ (đoạn văn)
    setCardFormPassageText("");
    setCardFormPassageTextVi("");

    // Reset câu hỏi về 1 câu hỏi mẫu trắng bắt đầu đúng số chuẩn của Part đó
    const startNum = preset.startQuestionNum;
    setCardFormSampleQuestions([
      {
        questionNum: startNum,
        question: "",
        bilingual: "",
        options: ["", "", "", ""],
        optionMeanings: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
        steps: [
          { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
          { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
        ],
        vocabList: [],
      },
    ]);
    setSelectedQuestionIndex(0);

    // Xóa từ vựng cũ nếu có
    if (setCardFormVocabList) {
      setCardFormVocabList([]);
    }

    setCardFormTheorySummary(preset.directionsVi);
    setCardFormTheoryRules(preset.rules.join("\n"));
    setCardFormTheoryExample(preset.example);

    // Tắt confirm dialog và notice
    setPartSwitchConfirm(null);
    setPartTransitionNotice(null);

    // Nếu chuyển sang Part 5 mà đang ở tab passage thì chuyển sang questions
    if (targetPart === "part5" && activeTab === "passage") {
      setActiveTab("questions");
    }

    const partName =
      targetPart === "part5"
        ? "Part 5 (Điền câu đơn)"
        : targetPart === "part6"
        ? "Part 6 (Điền đoạn văn)"
        : targetPart === "part7"
        ? "Part 7 (Đọc hiểu văn bản)"
        : "Ngữ pháp";
    setInternalToast(
      `Đã chuyển sang ${partName}! Dữ liệu cũ đã được làm mới, sẵn sàng để bạn dán hoặc nhập đề thi cho ${targetPart.toUpperCase()}. ✨`
    );
  };

  // Apply a Preset
  const handleApplyPreset = (presetKey: "part5" | "part6" | "part7") => {
    const prevCategory = cardFormCategory;
    const preset = PART_PRESETS[presetKey];
    setCardFormCategory(preset.category);
    setCardFormSubCategory(preset.subCategory);
    setCardFormTag(preset.tag);

    const filledCount = questions.filter((q) => q.question.trim().length > 0).length || questions.length;

    // Chuẩn hóa và cập nhật tiêu đề thông minh theo Part mới
    const updatedTitle = cardFormTitle.trim();
    const cleanBase = updatedTitle
      .replace(/\s*\((?:bản chi tiết đầy đủ\s*)?200\s*câu\)/gi, "")
      .replace(/\s*-\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
      .replace(/\s*-\s*Part\s*[567]\s*(?:\([^\)]*\))?/gi, "")
      .replace(/[\s\-_]+$/, "")
      .trim();

    const basePrefix = cleanBase || "ETS TOEIC Reading";

    if (presetKey === "part5") {
      const qCount = filledCount && filledCount !== 30 ? `${filledCount} câu luyện tập` : "Câu 101 - 130";
      setCardFormTotalQuestions(filledCount > 30 ? filledCount : preset.defaultQuestions);
      setCardFormTitle(`${basePrefix} - Part 5 (${qCount})`);
      setTitleError(null);
      // Part 5 là câu đơn độc lập -> Xóa bài đọc cũ để tránh rác
      setCardFormPassageText("");
      setCardFormPassageTextVi("");
    } else if (presetKey === "part6") {
      const qCount = filledCount && filledCount !== 16 && filledCount !== 4 ? `${filledCount} câu` : "Câu 131 - 146";
      setCardFormTotalQuestions(Math.max(preset.defaultQuestions, filledCount));
      setCardFormTitle(`${basePrefix} - Part 6 (${qCount})`);
      setTitleError(null);
    } else if (presetKey === "part7") {
      const qCount = filledCount && filledCount !== 54 && filledCount !== 2 ? `${filledCount} câu` : "Câu 147 - 200";
      setCardFormTotalQuestions(Math.max(preset.defaultQuestions, filledCount));
      setCardFormTitle(`${basePrefix} - Part 7 (${qCount})`);
      setTitleError(null);
    }

    setCardFormTheorySummary(preset.directionsVi);
    setCardFormTheoryRules(preset.rules.join("\n"));
    setCardFormTheoryExample(preset.example);

    // Nếu đổi sang Part 5 mà đang đứng ở tab đoạn văn thì chuyển ngay về tab câu hỏi
    if (presetKey === "part5" && activeTab === "passage") {
      setActiveTab("questions");
    }

    if (prevCategory !== presetKey && questions.some((q) => q.question.trim().length > 0)) {
      setPartTransitionNotice({
        fromPart: prevCategory,
        toPart: presetKey,
        count: questions.filter((q) => q.question.trim().length > 0).length,
      });

      // Tự động đánh số lại câu hỏi theo chuẩn Part mới
      const startNum = presetKey === "part5" ? 101 : presetKey === "part6" ? 131 : 147;
      setCardFormSampleQuestions((prev) =>
        prev.map((q, idx) => ({
          ...q,
          questionNum: String(startNum + idx),
        }))
      );
    }
    setErrorMsg(null);
  };

  // Tự động đánh số lại câu hỏi theo chuẩn Part (101+, 131+, 147+)
  const handleRenumberQuestions = () => {
    const startNum =
      cardFormCategory === "part5" ? 101 : cardFormCategory === "part6" ? 131 : 147;
    setCardFormSampleQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        questionNum: String(startNum + idx),
      }))
    );
    setInternalToast(`Đã đánh số lại toàn bộ câu hỏi theo chuẩn ${cardFormCategory.toUpperCase()} (#${startNum}+)! ✨`);
  };

  // Gộp các câu hỏi Part 5 thành đoạn văn Part 6 có mã chỗ trống [131]-[134]
  const handleMergeQuestionsToPart6Passage = () => {
    const filledQuestions = questions.filter((q) => q.question.trim().length > 0);
    if (filledQuestions.length === 0) {
      setErrorMsg("Chưa có nội dung câu hỏi nào để gộp thành đoạn văn!");
      return;
    }

    const sentences = filledQuestions.map((q, idx) => {
      const qNum = 131 + idx;
      let s = q.question.trim();
      if (s.includes("______") || /_{2,}/.test(s)) {
        s = s.replace(/_{2,}/g, `[${qNum}]------`);
      } else if (/\[\d+\]/.test(s)) {
        s = s.replace(/\[\d+\]/g, `[${qNum}]`);
      } else {
        s = `${s} [${qNum}]------.`;
      }
      return s;
    });

    const mergedPassage = sentences.join(" ");
    setCardFormPassageText(mergedPassage);

    // Đánh số lại câu hỏi thành 131, 132...
    setCardFormSampleQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        questionNum: String(131 + idx),
      }))
    );

    setActiveTab("passage");
    setPartTransitionNotice(null);
    setErrorMsg(null);
    setInternalToast("Đã tự động tạo đoạn văn Part 6 từ các câu hỏi! Bạn có thể nhấn 'Lưu thay đổi' ngay bây giờ. 🎉");
  };

  // Question editing helpers
  const handleUpdateCurrentQuestion = (updater: (q: SampleQuestion) => SampleQuestion) => {
    setCardFormSampleQuestions((prev) => {
      const copy = prev.length > 0 ? [...prev] : [{ ...questions[0] }];
      const idx = Math.min(selectedQuestionIndex, copy.length - 1);
      copy[idx] = updater({ ...copy[idx] });
      return copy;
    });
  };

  const handleAddQuestion = () => {
    const nextNum = String(100 + questions.length + 1);
    const newQ: SampleQuestion = {
      questionNum: nextNum,
      question: "",
      bilingual: "",
      options: ["", "", "", ""],
      optionMeanings: ["", "", "", ""],
      correctIndex: -1,
      explanation: "",
      steps: [],
      vocabList: [],
    };
    setCardFormSampleQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionIndex(questions.length);
    setCardFormTotalQuestions((prev) => Math.max(prev, questions.length + 1));
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setErrorMsg("Phải giữ lại ít nhất 1 câu hỏi!");
      return;
    }
    setCardFormSampleQuestions((prev) => prev.filter((_, i) => i !== idx));
    setSelectedQuestionIndex((prev) => Math.max(0, Math.min(prev, questions.length - 2)));
    setCardFormTotalQuestions((prev) => Math.min(prev, questions.length - 1));
  };

  // Add Vocabulary Item into active question (Matching "Thêm từ vựng mới" form)
  const handleAddVocabFromForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!vocabInputWord.trim()) {
      setVocabFormError("Vui lòng nhập từ tiếng Anh.");
      return;
    }
    if (!vocabInputMeaning.trim()) {
      setVocabFormError("Vui lòng nhập nghĩa tiếng Việt cho từ.");
      return;
    }

    const newItem: VocabItem = {
      word: vocabInputWord.trim(),
      pos: vocabInputPos.toLowerCase(),
      level: "B1",
      ipa: vocabInputIpa.trim(),
      meaning: vocabInputMeaning.trim(),
      example: vocabInputExample.trim() ? { en: vocabInputExample.trim(), vi: "" } : undefined,
      synonyms: vocabInputSynonyms.trim()
        ? vocabInputSynonyms.split(",").map((s) => ({ en: s.trim(), vi: "" }))
        : undefined,
      antonyms: vocabInputAntonyms.trim()
        ? vocabInputAntonyms.split(",").map((a) => ({ en: a.trim(), vi: "" }))
        : undefined,
    };

    if (vocabTargetQuestionIdx === -1 && setCardFormVocabList) {
      setCardFormVocabList((prev) => [...prev, newItem]);
    } else {
      setCardFormSampleQuestions((prev) => {
        const copy = prev.length > 0 ? [...prev] : [{ ...questions[0] }];
        const fallbackIdx = vocabTargetQuestionIdx >= 0 ? vocabTargetQuestionIdx : 0;
        const targetIdx = Math.min(Math.max(0, fallbackIdx), copy.length - 1);
        const targetQ = { ...copy[targetIdx] };
        targetQ.vocabList = [...(targetQ.vocabList || []), newItem];
        copy[targetIdx] = targetQ;
        return copy;
      });
    }

    // Reset vocab inputs
    setVocabInputWord("");
    setVocabInputIpa("");
    setVocabInputMeaning("");
    setVocabInputExample("");
    setVocabInputSynonyms("");
    setVocabInputAntonyms("");
    setVocabFormError(null);
    setDictSuggestion(null);
    setDictError(null);
  };

  const handleApplyExtractedVocab = (entries: AppliedVocabEntry[]) => {
    if (entries.length === 0) return;

    const cardLevelEntries = entries.filter(
      (entry) => (entry.targetQuestionIndex === null || entry.targetQuestionIndex < 0) && Boolean(setCardFormVocabList)
    );
    const questionEntries = entries.filter(
      (entry) => !((entry.targetQuestionIndex === null || entry.targetQuestionIndex < 0) && Boolean(setCardFormVocabList))
    );

    if (cardLevelEntries.length > 0 && setCardFormVocabList) {
      setCardFormVocabList((prev) => {
        const existingKeys = new Set(prev.map((v) => v.word.trim().toLowerCase()));
        const next = [...prev];
        cardLevelEntries.forEach(({ item }) => {
          const key = item.word.trim().toLowerCase();
          if (key && !existingKeys.has(key)) {
            existingKeys.add(key);
            next.push(item);
          }
        });
        return next;
      });
    }

    if (questionEntries.length > 0) {
      setCardFormSampleQuestions((prev) => {
        const copy = prev.length > 0 ? prev.map((q) => ({ ...q, vocabList: [...(q.vocabList || [])] })) : [{ ...questions[0], vocabList: [...(questions[0].vocabList || [])] }];
        const fallbackIdx = vocabTargetQuestionIdx >= 0 ? vocabTargetQuestionIdx : 0;
        questionEntries.forEach(({ item, targetQuestionIndex }) => {
          const desired = targetQuestionIndex !== null && targetQuestionIndex >= 0 ? targetQuestionIndex : fallbackIdx;
          const targetIdx = Math.min(Math.max(0, desired), copy.length - 1);
          const existingKeys = new Set((copy[targetIdx].vocabList || []).map((v) => v.word.trim().toLowerCase()));
          const key = item.word.trim().toLowerCase();
          if (key && !existingKeys.has(key)) {
            copy[targetIdx].vocabList = [...(copy[targetIdx].vocabList || []), item];
          }
        });
        return copy;
      });
    }
  };

  const handleDeleteVocabItem = (vIdx: number) => {
    handleUpdateCurrentQuestion((q) => ({
      ...q,
      vocabList: (q.vocabList || []).filter((_, i) => i !== vIdx),
    }));
  };

  // Step handlers
  const handleAddStep = () => {
    handleUpdateCurrentQuestion((q) => ({
      ...q,
      steps: [
        ...(q.steps || []),
        { title: `Bước ${(q.steps || []).length + 1}: `, desc: "" },
      ],
    }));
  };

  const handleUpdateStep = (sIdx: number, field: "title" | "desc", val: string) => {
    handleUpdateCurrentQuestion((q) => {
      const steps = [...(q.steps || [])];
      if (steps[sIdx]) {
        steps[sIdx] = { ...steps[sIdx], [field]: val };
      }
      return { ...q, steps };
    });
  };

  const handleDeleteStep = (sIdx: number) => {
    handleUpdateCurrentQuestion((q) => ({
      ...q,
      steps: (q.steps || []).filter((_, i) => i !== sIdx),
    }));
  };

  // Smart Parser for Quick Paste (Supports text from either Tab 1 detector or Tab 5 raw paste)
  const handleParseRawText = (
    textOverride?: string,
    onDetectedCategory?: (cat: "part5" | "part6" | "part7") => void
  ) => {
    const textToParse = (typeof textOverride === "string" ? textOverride : (rawPasteText || detectorInput)).trim();
    if (!textToParse) {
      setErrorMsg("Vui lòng dán văn bản bài đọc và câu hỏi vào ô trước khi bóc tách!");
      return;
    }

    const lines = textToParse.split(/\r?\n/).map((l) => l.trim());
    let extractedPassage = "";
    let extractedPassageVi = "";
    let customTitle = "";
    let customTag = "";
    let customDirections = "";
    let readingMode: "none" | "passage" | "passageVi" | "question" = "none";

    const parsedQuestions: SampleQuestion[] = [];
    let currentQ: Partial<SampleQuestion> | null = null;
    let currentVocab: VocabItem[] = [];
    const globalVocab: VocabItem[] = [];
    let currentSteps: { title: string; desc: string }[] = [];

    const commitCurrentQ = () => {
      if (currentQ && (currentQ.question || (currentQ.options && currentQ.options.some((o) => !!o.trim())))) {
        const rawOpts = [
          currentQ.options?.[0] || "",
          currentQ.options?.[1] || "",
          currentQ.options?.[2] || "",
          currentQ.options?.[3] || "",
        ];
        const rawMeanings = [
          currentQ.optionMeanings?.[0] || "",
          currentQ.optionMeanings?.[1] || "",
          currentQ.optionMeanings?.[2] || "",
          currentQ.optionMeanings?.[3] || "",
        ];

        // Auto-resolve option meanings if not provided in raw text
        for (let oIdx = 0; oIdx < 4; oIdx++) {
          if (!rawMeanings[oIdx].trim() && rawOpts[oIdx].trim()) {
            const autoMeaning = resolveOptionMeaning(rawOpts[oIdx]);
            if (autoMeaning) rawMeanings[oIdx] = autoMeaning;
          }
        }

        parsedQuestions.push({
          questionNum: currentQ.questionNum || String(100 + parsedQuestions.length + 1),
          question: currentQ.question || "",
          bilingual: currentQ.bilingual || "",
          options: rawOpts,
          optionMeanings: rawMeanings,
          correctIndex: currentQ.correctIndex !== undefined ? currentQ.correctIndex : 0,
          explanation: currentQ.explanation || "",
          steps: currentSteps.length > 0 ? currentSteps : [
            { title: "Bước 1: Phân tích ngữ cảnh", desc: "Đọc kỹ câu hỏi và các manh mối." },
            { title: "Bước 2: Chọn đáp án chính xác", desc: "So sánh với bài đọc để chốt đáp án." },
          ],
          vocabList: [...currentVocab],
        });
      }
      currentQ = null;
      currentVocab = [];
      currentSteps = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const lower = line.toLowerCase();

      // Custom metadata triggers
      if (lower.startsWith("[tiêu đề]") || lower.startsWith("tiêu đề:") || lower.startsWith("[title]")) {
        customTitle = line.replace(/^(\[tiêu đề\]|tiêu đề\:|\[title\])\s*/i, "").trim();
        continue;
      }
      if (lower.startsWith("[thẻ]") || lower.startsWith("thẻ:") || lower.startsWith("[tag]")) {
        customTag = line.replace(/^(\[thẻ\]|thẻ\:|\[tag\])\s*/i, "").trim();
        continue;
      }
      if (lower.startsWith("[hướng dẫn]") || lower.startsWith("hướng dẫn:") || lower.startsWith("[directions]")) {
        customDirections = line.replace(/^(\[hướng dẫn\]|hướng dẫn\:|\[directions\])\s*/i, "").trim();
        continue;
      }

      // Section triggers
      if (lower.startsWith("[đoạn văn]") || lower.startsWith("đoạn văn:") || lower.startsWith("[passage]")) {
        readingMode = "passage";
        continue;
      }
      if (lower.startsWith("[dịch đoạn văn]") || lower.startsWith("bản dịch đoạn văn:") || lower.startsWith("[passage vi]")) {
        readingMode = "passageVi";
        continue;
      }

      // Check for Question start: e.g. "101. What..." or "Question 1: ..." or "Câu 1: ..."
      const qMatch = line.match(/^(?:question\s*|câu\s*)?(\d{1,3})[\.\:\)]\s*(.*)$/i);
      if (qMatch && !lower.startsWith("(a)") && !lower.startsWith("(b)") && !lower.startsWith("(c)") && !lower.startsWith("(d)")) {
        commitCurrentQ();
        readingMode = "question";
        currentQ = {
          questionNum: qMatch[1],
          question: qMatch[2].trim(),
          options: ["", "", "", ""],
          optionMeanings: ["", "", "", ""],
          correctIndex: -1,
        };
        continue;
      }

      if (readingMode === "passage") {
        extractedPassage += (extractedPassage ? "\n" : "") + line;
        continue;
      }
      if (readingMode === "passageVi") {
        extractedPassageVi += (extractedPassageVi ? "\n" : "") + line;
        continue;
      }

      // Inside question block
      if (currentQ) {
        // Dedicated option translation lines: e.g. "Dịch A: ..." or "Dịch đáp án A: ..." or "A. Dịch: ..."
        const optViMatch = line.match(/^(?:dịch\s*(?:đáp án|phương án)?\s*([A-Da-d])|([A-Da-d])\s*(?:\.|\))\s*dịch)[\s\:\-]+(.*)$/i);
        if (optViMatch) {
          const optLetter = (optViMatch[1] || optViMatch[2]).toUpperCase();
          const optIdx = optLetter.charCodeAt(0) - 65;
          if (optIdx >= 0 && optIdx < 4) {
            currentQ.optionMeanings = currentQ.optionMeanings || ["", "", "", ""];
            currentQ.optionMeanings[optIdx] = (optViMatch[3] || "").trim();
          }
          continue;
        }

        // Options A, B, C, D (supports "(A) text", "A. text", "A) text")
        const optMatch = line.match(/^[\(\[\{]?([A-Da-d])[\)\]\}\.\:]\s*(.*)$/);
        if (optMatch) {
          const optLetter = optMatch[1].toUpperCase();
          const optContent = optMatch[2].trim();
          const optIdx = optLetter.charCodeAt(0) - 65;
          if (optIdx >= 0 && optIdx < 4) {
            currentQ.options = currentQ.options || ["", "", "", ""];
            currentQ.optionMeanings = currentQ.optionMeanings || ["", "", "", ""];

            // Check if there is Vietnamese meaning in parentheses or after colon/dash
            const meaningMatch = optContent.match(/^([^\(]+?)(?:\s*\((.*?)\)|\s*[\-–]\s*(.*?))$/);
            if (meaningMatch && (meaningMatch[2] || meaningMatch[3])) {
              currentQ.options[optIdx] = meaningMatch[1].trim();
              currentQ.optionMeanings[optIdx] = (meaningMatch[2] || meaningMatch[3]).trim();
            } else {
              currentQ.options[optIdx] = optContent;
            }
          }
          continue;
        }

        // Key / Correct Answer
        const keyMatch = line.match(/^(?:đáp án|key|answer|đa)[\s\:\-]+([A-Da-d])/i);
        if (keyMatch) {
          const correctLetter = keyMatch[1].toUpperCase();
          currentQ.correctIndex = correctLetter.charCodeAt(0) - 65;
          continue;
        }

        // Bilingual question
        const viMatch = line.match(/^(?:dịch|dịch câu|bilingual)[\s\:\-]+(.*)$/i);
        if (viMatch) {
          currentQ.bilingual = viMatch[1].trim();
          continue;
        }

        // Explanation
        const expMatch = line.match(/^(?:giải thích|explanation|phân tích)[\s\:\-]+(.*)$/i);
        if (expMatch) {
          currentQ.explanation = expMatch[1].trim();
          continue;
        }

        // Steps
        const stepMatch = line.match(/^(?:bước|step)\s*(\d+)[\s\:\-]+(.*)$/i);
        if (stepMatch) {
          currentSteps.push({
            title: `Bước ${stepMatch[1]}`,
            desc: stepMatch[2].trim(),
          });
          continue;
        }
      }

      // Vocab item (inline comma-separated or bullet list)
      const inlineVocabHeader = line.match(/^(?:từ vựng|vocab|vocabulary)\s*\:?\s*(.*)$/i);
      if (inlineVocabHeader && (lower.startsWith("từ vựng:") || lower.startsWith("vocab:") || lower.startsWith("vocabulary:"))) {
        const rest = inlineVocabHeader[1].trim();
        if (rest) {
          rest.split(/[,;]/).forEach((seg) => {
            const trimmed = seg.trim();
            if (!trimmed) return;
            const parts = trimmed.match(/^([a-zA-Z\s\-']+?)(?:\s*\/([^\/]+)\/)?(?:\s*\(([a-z]+)\))?(?:\s*[\:\-\=]\s*(.+))?$/i);
            if (parts && parts[1]?.trim()) {
              const item = enrichInlineParsedVocab({
                word: parts[1].trim(),
                ipa: parts[2] ? `/${parts[2].trim()}/` : "",
                pos: parts[3] ? parts[3].toLowerCase() : "n",
                meaning: parts[4]?.trim() || "",
                level: "B1",
              });
              if (currentQ) currentVocab.push(item);
              else globalVocab.push(item);
            }
          });
        }
        continue;
      }

      if (line.startsWith("-") || line.startsWith("•")) {
        const cleanLine = line.replace(/^[\-\•\*\d\.]\s*/, "").trim();
        let word = "";
        let pos = "n";
        let ipa = "";
        let meaning = "";

        const ipaMatch = cleanLine.match(/\/([^\/]+)\//);
        if (ipaMatch) {
          ipa = `/${ipaMatch[1].trim()}/`;
        }

        const posMatch = cleanLine.match(/\((n|v|adj|adv|prep|conj)[^\)]*\)/i);
        if (posMatch) {
          pos = posMatch[1].toLowerCase();
        }

        const noIpaNoPos = cleanLine
          .replace(/\(\s*\/[^\/]+\/\s*\)/g, "")
          .replace(/\/([^\/]+)\//g, "")
          .replace(/\((?:n|v|adj|adv|prep|conj)[^\)]*\)/gi, "")
          .replace(/\(\s*\)/g, "")
          .replace(/\[\s*\]/g, "")
          .trim();

        const splitColon = noIpaNoPos.split(/[\:\-–]\s*(.+)/);
        if (splitColon.length >= 2) {
          word = splitColon[0].trim();
          meaning = splitColon[1].trim();
        } else {
          word = noIpaNoPos;
        }

        word = word.replace(/[\(\)\[\]]/g, "").trim();

        if (word && /^[a-zA-Z][a-zA-Z\s'\-]*$/.test(word)) {
          const item = enrichInlineParsedVocab({
            word,
            pos,
            ipa,
            meaning,
            level: "B1",
          });
          if (currentQ) {
            currentVocab.push(item);
          } else {
            globalVocab.push(item);
          }
        }
        continue;
      }
    }

    commitCurrentQ();

    if (parsedQuestions.length === 0 && !extractedPassage.trim()) {
      setErrorMsg("Không tìm thấy nội dung câu hỏi hoặc bài đọc nào hợp lệ từ văn bản dán!");
      return;
    }

    // Determine Part Category from pasted text
    const hasGapTokens =
      extractedPassage.includes("[131]") ||
      extractedPassage.includes("[132]") ||
      extractedPassage.includes("[133]") ||
      extractedPassage.includes("[134]");

    const firstQNum = Number(parsedQuestions[0]?.questionNum || 0);
    const qNums = parsedQuestions.map((q) => Number(q.questionNum)).filter((n) => !isNaN(n) && n > 0);
    const minQ = qNums.length > 0 ? Math.min(...qNums) : 0;
    const maxQ = qNums.length > 0 ? Math.max(...qNums) : 0;

    const detectedCategory: "part5" | "part6" | "part7" =
      hasGapTokens
        ? "part6"
        : extractedPassage.trim() || parsedQuestions.length >= 2 || firstQNum >= 147
        ? "part7"
        : "part5";

    // RÀNG BUỘC THEO TỪNG PART: Dữ liệu của Part nào chỉ cho phép dán đúng vào Part đó!
    const activePart = cardFormCategory === "grammar" ? "part5" : cardFormCategory;

    if (activePart === "part5") {
      // Nếu có sẵn dải câu hỏi Part 5 (101 - 130) từ bộ đề lớn: Tự động trích xuất đúng Part 5 và bỏ qua đoạn văn!
      const p5Qs = extractQuestionsForPart(parsedQuestions, "part5");
      if (p5Qs.length > 0 && (extractedPassage.trim().length > 0 || parsedQuestions.length > 30)) {
        setCardFormSampleQuestions(p5Qs);
        setCardFormTotalQuestions(p5Qs.length);
        setCardFormPassageText("");
        setCardFormPassageTextVi("");
        setSelectedQuestionIndex(0);
        setCardFormTitle(customTitle || `ETS TOEIC Reading - Part 5 (Câu 101 - ${100 + p5Qs.length})`);
        setCardFormTag(customTag || "Part 5 - Câu đơn · Ngữ pháp & Từ vựng");
        if (globalVocab.length > 0 && setCardFormVocabList) setCardFormVocabList(globalVocab);
        setInternalToast(`Đã tự động trích xuất đúng ${p5Qs.length} câu Part 5 (Câu 101 - ${100 + p5Qs.length}) từ nội dung đề thi! ✨`);
        return;
      }

      if (extractedPassage.trim().length > 0) {
        setErrorMsg(
          "❌ Dữ liệu không đúng định dạng Part 5! Bạn đang ở chế độ Part 5 (Điền câu đơn độc lập), nhưng văn bản vừa dán lại chứa Đoạn văn đọc (Passage). Part 5 không chứa đoạn văn. Vui lòng chuyển sang Part 6 hoặc Part 7 nếu bạn muốn dán bài đọc này!"
        );
        return;
      }
      if (hasGapTokens || (firstQNum >= 131 && firstQNum <= 146)) {
        setErrorMsg(
          `❌ Dữ liệu không đúng định dạng Part 5! Dữ liệu bạn vừa dán thuộc Part 6 (Điền đoạn văn - có chỗ khuyết [131]-[134] hoặc câu #${firstQNum}). Bạn không thể dán đề thi Part 6 vào Part 5. Vui lòng chuyển sang Part 6!`
        );
        return;
      }
      if (firstQNum >= 147) {
        setErrorMsg(
          `❌ Dữ liệu không đúng định dạng Part 5! Dữ liệu bạn vừa dán thuộc Part 7 (Đọc hiểu văn bản - Câu #${firstQNum}). Bạn không thể dán câu hỏi Part 7 vào Part 5. Vui lòng chuyển sang Part 7!`
        );
        return;
      }
    } else if (activePart === "part6") {
      const p6Qs = extractQuestionsForPart(parsedQuestions, "part6");
      if (p6Qs.length > 0 && parsedQuestions.length > 16) {
        setCardFormSampleQuestions(p6Qs);
        setCardFormTotalQuestions(p6Qs.length);
        if (extractedPassage.trim()) setCardFormPassageText(extractedPassage.trim());
        if (extractedPassageVi.trim()) setCardFormPassageTextVi(extractedPassageVi.trim());
        setSelectedQuestionIndex(0);
        setCardFormTitle(customTitle || `ETS TOEIC Reading - Part 6 (Điền đoạn 131 - ${130 + p6Qs.length})`);
        setCardFormTag(customTag || "Part 6 - Thông báo nội bộ · Điền đoạn");
        if (globalVocab.length > 0 && setCardFormVocabList) setCardFormVocabList(globalVocab);
        setInternalToast(`Đã tự động trích xuất đúng ${p6Qs.length} câu Part 6 (Câu 131 - ${130 + p6Qs.length}) từ nội dung đề thi! ✨`);
        return;
      }

      if (!extractedPassage.trim()) {
        setErrorMsg(
          "❌ Dữ liệu không đúng định dạng Part 6! Bạn đang ở chế độ Part 6 (Điền đoạn văn), nhưng dữ liệu vừa dán không có Đoạn văn đọc! Đề thi Part 6 bắt buộc phải có đoạn văn chứa các vị trí khuyết ([131]-[134]). Vui lòng bổ sung đoạn văn hoặc chuyển sang Part 5 nếu đây là câu đơn!"
        );
        return;
      }
      if (firstQNum >= 147) {
        setErrorMsg(
          `❌ Dữ liệu không đúng định dạng Part 6! Dữ liệu bạn vừa dán thuộc Part 7 (Đọc hiểu văn bản - Câu #${firstQNum}). Vui lòng chuyển sang Part 7!`
        );
        return;
      }
    } else if (activePart === "part7") {
      const p7Qs = extractQuestionsForPart(parsedQuestions, "part7");
      if (p7Qs.length > 0 && parsedQuestions.length > 54) {
        setCardFormSampleQuestions(p7Qs);
        setCardFormTotalQuestions(p7Qs.length);
        if (extractedPassage.trim()) setCardFormPassageText(extractedPassage.trim());
        if (extractedPassageVi.trim()) setCardFormPassageTextVi(extractedPassageVi.trim());
        setSelectedQuestionIndex(0);
        setCardFormTitle(customTitle || `ETS TOEIC Reading - Part 7 (Đọc hiểu 147 - ${146 + p7Qs.length})`);
        setCardFormTag(customTag || "Part 7 - Email doanh nghiệp · Đọc hiểu");
        if (globalVocab.length > 0 && setCardFormVocabList) setCardFormVocabList(globalVocab);
        setInternalToast(`Đã tự động trích xuất đúng ${p7Qs.length} câu Part 7 (Câu 147 - ${146 + p7Qs.length}) từ nội dung đề thi! ✨`);
        return;
      }

      if (!extractedPassage.trim()) {
        setErrorMsg(
          "❌ Dữ liệu không đúng định dạng Part 7! Bạn đang ở chế độ Part 7 (Đọc hiểu văn bản), nhưng dữ liệu vừa dán chỉ là các câu đơn mà không có Đoạn văn đọc (Passage)! Part 7 bắt buộc phải có bài đọc. Bạn không thể dán câu đơn Part 5 vào Part 7. Vui lòng bổ sung bài đọc hoặc chuyển sang Part 5!"
        );
        return;
      }
      if (hasGapTokens) {
        setErrorMsg(
          "❌ Dữ liệu không đúng định dạng Part 7! Đoạn văn vừa dán có chứa mã chỗ trống [131]-[134] của Part 6 (Điền đoạn văn). Vui lòng chuyển sang Part 6 để tạo bài đọc điền từ!"
        );
        return;
      }
    }

    // NẾU HỢP LỆ VỚI ACTIVE PART -> CẬP NHẬT DỮ LIỆU VÀO STATE
    if (setCardFormVocabList) {
      setCardFormVocabList(globalVocab);
    } else if (globalVocab.length > 0 && parsedQuestions.length > 0) {
      parsedQuestions[0].vocabList = [...(parsedQuestions[0].vocabList || []), ...globalVocab];
    }

    if (extractedPassage.trim()) {
      setCardFormPassageText(extractedPassage.trim());
    }
    if (extractedPassageVi.trim()) {
      setCardFormPassageTextVi(extractedPassageVi.trim());
    }
    if (parsedQuestions.length > 0) {
      setCardFormSampleQuestions(parsedQuestions);
      setSelectedQuestionIndex(0);
    }

    const preset = PART_PRESETS[detectedCategory];
    setCardFormCategory(detectedCategory);
    onDetectedCategory?.(detectedCategory);
    setCardFormSubCategory(preset.subCategory);

    const finalMinQ = qNums.length > 0 ? minQ : (detectedCategory === "part7" ? 147 : detectedCategory === "part6" ? 131 : 101);
    const finalMaxQ = qNums.length > 0 ? maxQ : (finalMinQ + Math.max(1, parsedQuestions.length) - 1);
    const titleRange = finalMinQ === finalMaxQ ? `Câu ${finalMinQ}` : `${finalMinQ} - ${finalMaxQ}`;

    // 1. Tên chủ điểm / Bài đọc
    let passageHeader = "";
    if (extractedPassage.trim()) {
      const pLines = extractedPassage.trim().split("\n");
      const firstLine = pLines[0].trim();
      if (firstLine.length < 45 && !firstLine.startsWith("[") && !firstLine.includes("@") && !firstLine.includes(":")) {
        passageHeader = firstLine;
      }
    }

    const partNumber = detectedCategory.slice(-1);
    const generatedTitle = passageHeader
      ? `${passageHeader} - Part ${partNumber} (${titleRange})`
      : detectedCategory === "part7"
      ? `ETS TOEIC Reading - Part 7 (Đọc hiểu ${titleRange})`
      : detectedCategory === "part6"
      ? `ETS TOEIC Reading - Part 6 (Điền đoạn ${titleRange})`
      : `ETS TOEIC Reading - Part 5 (${titleRange})`;

    setCardFormTitle(customTitle || generatedTitle);
    setTitleError(null);

    const generatedTag =
      detectedCategory === "part7"
        ? `Part 7 - Email doanh nghiệp · Đọc hiểu ${titleRange}`
        : detectedCategory === "part6"
        ? `Part 6 - Thông báo nội bộ · Điền đoạn ${titleRange}`
        : `Part 5 - Câu đơn · Ngữ pháp & Từ vựng`;
    setCardFormTag(customTag || generatedTag);

    // 3. Hướng dẫn làm bài chuẩn ETS (Directions)
    setCardFormTheorySummary(customDirections);
    setCardFormTheoryRules("");
    setCardFormTheoryExample("");

    // Reset vocab filter to "all" so user sees all extracted words immediately
    setVocabFilterScope("all");

    const totalParsedVocab = (setCardFormVocabList ? globalVocab.length : 0) + parsedQuestions.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0);
    setParseSuccessMsg(
      `Đã bóc tách thành công: ${parsedQuestions.length} câu hỏi trắc nghiệm, ${totalParsedVocab} từ vựng trọng tâm${
        extractedPassage ? " & đoạn văn đọc" : ""
      }! ${detectedCategory === "part5" ? "Toàn bộ Thông tin (Tab 1), Đáp án & Dịch (Tab 2), Từ vựng (Tab 3)" : "Toàn bộ Thông tin (Tab 1), Đoạn văn (Tab 2), Đáp án & Dịch (Tab 3), Từ vựng (Tab 4)"} đã được tự động điền đầy đủ 100%.`
    );
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. KIỂM TRA KHUNG 1: THÔNG TIN BÀI ĐỌC (TAB 1)
    if (!cardFormTitle.trim()) {
      const msg = "Vui lòng nhập tên bài đọc / chuyên đề TOEIC ở tab '1. Thông tin bài đọc' trước khi lưu!";
      setErrorMsg(msg);
      setTitleError("Vui lòng nhập tên chủ điểm đọc (không được để trống).");
      setPassageError(null);
      setQuestionError(null);
      setOptionsError(null);
      setBilingualError(null);
      setVocabFormError(null);
      setActiveTab("info");
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    if (cardFormTitle.trim().length < 3) {
      const msg = "Tên bài đọc / chuyên đề TOEIC phải có ít nhất 3 ký tự!";
      setErrorMsg(msg);
      setTitleError("Tên chủ điểm đọc phải có ít nhất 3 ký tự.");
      setPassageError(null);
      setQuestionError(null);
      setOptionsError(null);
      setBilingualError(null);
      setVocabFormError(null);
      setActiveTab("info");
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    // 2. KIỂM TRA ĐOẠN VĂN ĐỌC (NẾU PART 6 HOẶC PART 7)
    const hasAnyPassage = !!cardFormPassageText.trim() || questions.some((q) => !!q.passageText?.trim());

    if (cardFormCategory === "part6" || cardFormCategory === "part7") {
      if (!hasAnyPassage) {
        const partLabel = cardFormCategory === "part6" ? "Part 6 (Điền đoạn văn)" : "Part 7 (Đọc hiểu văn bản)";
        const msg = `Bài đọc ${partLabel} bắt buộc phải có nội dung Đoạn văn đọc (Passage) ở tab '2. Đoạn văn đọc'!`;
        setErrorMsg(msg);
        setPassageError(msg);
        setTitleError(null);
        setQuestionError(null);
        setOptionsError(null);
        setBilingualError(null);
        setVocabFormError(null);
        setActiveTab("passage");
        setTimeout(() => {
          passageTextareaRef.current?.focus();
          passageTextareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return;
      }
    }

    if (cardFormCategory === "part5") {
      // Part 5 là câu đơn độc lập -> Tự động xóa sạch đoạn văn cũ (nếu có sót từ Part 6/7)
      if (cardFormPassageText.trim()) setCardFormPassageText("");
      if (cardFormPassageTextVi.trim()) setCardFormPassageTextVi("");

      // Nếu tiêu đề ghi (Câu 101 - 130) mà số câu khác 30 thì tự động điều chỉnh tiêu đề cho khớp số lượng thực tế
      if (questions.length !== 30 && (cardFormTitle.includes("101 - 130") || cardFormTitle.includes("101-130"))) {
        const adjustedTitle = cardFormTitle
          .replace(/\(Câu 101\s*-\s*130\)/gi, `(${questions.length} câu luyện tập)`)
          .replace(/101\s*-\s*130/gi, `${questions.length} câu`);
        setCardFormTitle(adjustedTitle);
      }
      setCardFormTotalQuestions(questions.length);

      // Đảm bảo số câu hỏi Part 5 bắt đầu từ #101+ nếu câu đầu tiên mang số của Part 7 (>130)
      if (questions.length > 0 && Number(questions[0].questionNum) > 130) {
        setCardFormSampleQuestions((prev) =>
          prev.map((q, idx) => ({
            ...q,
            questionNum: String(101 + idx),
          }))
        );
      }
    }

    // 3. KIỂM TRA KHUNG 2: BỘ CÂU HỎI & ĐÁP ÁN (TAB QUESTIONS)
    if (questions.length === 0) {
      const msg = "Vui lòng nhập ít nhất 1 câu hỏi ở tab 'Bộ câu hỏi & Đáp án' trước khi lưu!";
      setErrorMsg(msg);
      setTitleError(null);
      setPassageError(null);
      setOptionsError(null);
      setBilingualError(null);
      setVocabFormError(null);
      setActiveTab("questions");
      return;
    }

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const qNumStr = q.questionNum ? ` (#${q.questionNum})` : "";
      const qDisplay = `Câu ${idx + 1}${qNumStr}`;

      // a) Nội dung câu hỏi tiếng Anh
      if (!q.question.trim()) {
        const msg = `Vui lòng nhập nội dung câu hỏi tiếng Anh cho ${qDisplay} ở tab 'Bộ câu hỏi & Đáp án'!`;
        setErrorMsg(msg);
        setQuestionError(`Vui lòng nhập nội dung câu hỏi tiếng Anh cho ${qDisplay}.`);
        setTitleError(null);
        setPassageError(null);
        setOptionsError(null);
        setBilingualError(null);
        setVocabFormError(null);
        setSelectedQuestionIndex(idx);
        setActiveTab("questions");
        setTimeout(() => {
          questionInputRef.current?.focus();
          questionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return;
      }

      // b) Dịch câu hỏi tiếng Việt
      if (!q.bilingual?.trim()) {
        const msg = `Vui lòng nhập bản dịch tiếng Việt (Bilingual) cho ${qDisplay} ở tab 'Bộ câu hỏi & Đáp án'!`;
        setErrorMsg(msg);
        setBilingualError(`Vui lòng nhập bản dịch tiếng Việt cho ${qDisplay}.`);
        setTitleError(null);
        setPassageError(null);
        setQuestionError(null);
        setOptionsError(null);
        setVocabFormError(null);
        setSelectedQuestionIndex(idx);
        setActiveTab("questions");
        setTimeout(() => {
          bilingualInputRef.current?.focus();
          bilingualInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return;
      }

      // c) BẮT BUỘC ĐỦ CẢ 4 PHƯƠNG ÁN A, B, C, D (Tiếng Anh)
      const missingOptIndices = [0, 1, 2, 3].filter(
        (optI) => !(q.options?.[optI] || "").trim()
      );
      if (missingOptIndices.length > 0) {
        const missingLetters = missingOptIndices.map((i) => ["A", "B", "C", "D"][i]).join(", ");
        const msg = `${qDisplay} chưa điền đủ 4 đáp án! Vui lòng nhập nội dung cho phương án (${missingLetters}) ở tab 'Bộ câu hỏi & Đáp án' trước khi lưu.`;
        setErrorMsg(msg);
        setOptionsError(`Vui lòng điền đủ cả 4 phương án A, B, C, D cho ${qDisplay} (đang thiếu: ${missingLetters}).`);
        setTitleError(null);
        setPassageError(null);
        setQuestionError(null);
        setBilingualError(null);
        setVocabFormError(null);
        setSelectedQuestionIndex(idx);
        setActiveTab("questions");
        setTimeout(() => {
          firstOptionInputRef.current?.focus();
          firstOptionInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return;
      }

      // d) Nghĩa tiếng Việt của 4 phương án
      const missingMeaningIndices = [0, 1, 2, 3].filter(
        (optI) => !(q.optionMeanings?.[optI] || "").trim()
      );
      if (missingMeaningIndices.length > 0) {
        const missingLetters = missingMeaningIndices.map((i) => ["A", "B", "C", "D"][i]).join(", ");
        const msg = `${qDisplay} chưa nhập nghĩa tiếng Việt cho các phương án (${missingLetters})! Vui lòng điền đầy đủ trước khi lưu.`;
        setErrorMsg(msg);
        setOptionsError(`Vui lòng nhập nghĩa tiếng Việt cho phương án (${missingLetters}) của ${qDisplay}.`);
        setTitleError(null);
        setPassageError(null);
        setQuestionError(null);
        setBilingualError(null);
        setVocabFormError(null);
        setSelectedQuestionIndex(idx);
        setActiveTab("questions");
        return;
      }
    }

    // 4. KIỂM TRA KHUNG 3: TỪ VỰNG CẦN HỌC (TAB VOCAB)
    if (totalVocabCount === 0) {
      const msg = "Bài đọc chưa có từ vựng! Vui lòng thêm ít nhất 1 từ vựng trọng tâm ở tab 'Từ vựng cần học' trước khi lưu.";
      setErrorMsg(msg);
      setVocabFormError("Bài đọc cần có ít nhất 1 từ vựng trọng tâm kèm nghĩa tiếng Việt.");
      setTitleError(null);
      setPassageError(null);
      setQuestionError(null);
      setOptionsError(null);
      setBilingualError(null);
      setActiveTab("vocab");
      setTimeout(() => {
        vocabWordInputRef.current?.focus();
        vocabWordInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    // TẤT CẢ HỢP LỆ -> RESET LỖI VÀ LƯU
    setTitleError(null);
    setPassageError(null);
    setQuestionError(null);
    setOptionsError(null);
    setBilingualError(null);
    setVocabFormError(null);
    setErrorMsg(null);
    setInternalToast(null);
    onSaveCard(e, overwriteTargetId || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 md:p-6 animate-in fade-in duration-150 font-sans">
      <div className="relative flex max-h-[94vh] w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* HEADER (Styling matching VocabularyModals) */}
        <div className="flex shrink-0 items-start sm:items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
              READING
            </span>
            <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {editingCard ? "Chỉnh sửa bài đọc / chuyên đề TOEIC" : "Thêm bài đọc Reading mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TAB NAVIGATION (Full-width segmented bar, cân đối 100% chiều ngang, không bị lệch dồn sang trái) */}
        <div className="shrink-0 border-b border-slate-200/80 bg-slate-100/70 p-2 sm:px-6 sm:py-2.5">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full">
            {/* 1. THÔNG TIN BÀI ĐỌC */}
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-center select-none shadow-2xs ${
                activeTab === "info"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/80"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>1. Thông tin bài đọc</span>
            </button>

            {/* 2. ĐOẠN VĂN ĐỌC (CHO PART 6 VÀ PART 7) */}
            {hasPassageTab && (
              <button
                type="button"
                onClick={() => setActiveTab("passage")}
                className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-center select-none shadow-2xs ${
                  activeTab === "passage"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/80"
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>2. Đoạn văn đọc (Passage)</span>
                {cardFormPassageText.trim() ? (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTab === "passage" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    Đã có
                  </span>
                ) : (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTab === "passage" ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    Bắt buộc
                  </span>
                )}
              </button>
            )}

            {/* 2 / 3. BỘ CÂU HỎI & ĐÁP ÁN */}
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-center select-none shadow-2xs ${
                activeTab === "questions"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/80"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 shrink-0" />
              <span>{hasPassageTab ? "3. Bộ câu hỏi & Đáp án" : "2. Bộ câu hỏi & Đáp án"}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === "questions" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"
                }`}
              >
                {questions.length} câu
              </span>
            </button>

            {/* 3 / 4. TỪ VỰNG CẦN HỌC */}
            <button
              type="button"
              onClick={() => setActiveTab("vocab")}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-center select-none shadow-2xs ${
                activeTab === "vocab"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white/80 hover:bg-white text-slate-700 hover:text-blue-700 border border-slate-200/80"
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 shrink-0" />
              <span>{hasPassageTab ? "4. Từ vựng cần học" : "3. Từ vựng cần học"}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === "vocab" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
                }`}
              >
                {totalVocabCount} từ
              </span>
            </button>

            {/* 4 / 5. DÁN NHANH TỰ ĐỘNG */}
            <button
              type="button"
              onClick={() => setActiveTab("quick_paste")}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-center select-none shadow-2xs ${
                activeTab === "quick_paste"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-extrabold"
                  : "bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80"
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Dán nhanh tự động</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === "quick_paste" ? "bg-white/20 text-white" : "bg-amber-200/80 text-amber-900"
                }`}
              >
                Auto
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-3 flex items-start sm:items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-2xl animate-in fade-in shrink-0">
            <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5 sm:mt-0" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {cardFormCategory === "part6" && !cardFormPassageText.trim() && (
                <button
                  type="button"
                  onClick={handleMergeQuestionsToPart6Passage}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gộp câu thành đoạn văn Part 6</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="p-1 rounded-lg hover:bg-red-100 text-red-600 transition cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCROLLABLE CONTENT BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-xs custom-scrollbar md:p-6 space-y-4">
          {/* TAB 1: THÔNG TIN BÀI ĐỌC */}
          {activeTab === "info" && (
            <div className="space-y-4">
              {/* THÔNG BÁO CHUYỂN ĐỔI PART */}
              {partTransitionNotice && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>
                        Chuyển đổi phần thi ({partTransitionNotice.fromPart.toUpperCase()} ➔ {partTransitionNotice.toPart.toUpperCase()}):
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPartTransitionNotice(null)}
                      className="text-[10px] text-amber-700 hover:underline cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    Hệ thống đã <strong>bảo toàn nguyên vẹn toàn bộ {partTransitionNotice.count} câu hỏi</strong> và phương án của bạn mà không bị mất.
                    {partTransitionNotice.toPart === "part6" && (
                      <span className="block mt-1 text-amber-900 font-semibold">
                        ⚠️ <strong>Lưu ý quan trọng:</strong> Đề thi Part 6 bắt buộc phải có đoạn văn đọc (Passage). Vui lòng bấm nút <strong>&quot;Gộp các câu thành đoạn văn Part 6&quot;</strong> bên dưới hoặc nhập bài đọc ở Tab 2 trước khi lưu!
                      </span>
                    )}
                    {partTransitionNotice.toPart === "part7" && (
                      <span className="block mt-1 text-amber-900 font-semibold">
                        ⚠️ <strong>Lưu ý quan trọng:</strong> Đề thi Part 7 bắt buộc phải có đoạn văn đọc (Passage). Vui lòng chuyển sang <strong>Tab 2 (Đoạn văn đọc)</strong> để nhập nội dung bài đọc trước khi lưu!
                      </span>
                    )}
                  </p>

                  {/* CẢNH BÁO PART 5 CÓ NHIỀU HƠN 30 CÂU */}
                  {partTransitionNotice.toPart === "part5" && partTransitionNotice.count > 30 ? (
                    <div className="mt-2 p-3 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 space-y-2">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Số lượng câu hỏi ({partTransitionNotice.count} câu) vượt chuẩn TOEIC Part 5 (30 câu: 101 - 130)</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Đề thi TOEIC Part 5 chuẩn chỉ gồm 30 câu điền câu đơn (từ câu 101 đến 130). Bộ đề hiện tại có <strong>{partTransitionNotice.count} câu</strong> (chuyển từ {partTransitionNotice.fromPart.toUpperCase()} sang). Bạn có thể chọn cắt gọn về đúng chuẩn 30 câu hoặc giữ nguyên làm bộ đề luyện tập mở rộng:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <button
                          type="button"
                          onClick={handleTrimToPart5Standard}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Cắt về chuẩn 30 câu đầu (#101 - #130)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleKeepExtendedPart5}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                          <span>Giữ nguyên {partTransitionNotice.count} câu luyện tập &amp; Đánh số (#101 - #{100 + partTransitionNotice.count})</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={handleRenumberQuestions}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 transition cursor-pointer flex items-center gap-1"
                      >
                        <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          Đánh số lại theo chuẩn {partTransitionNotice.toPart.toUpperCase()} ({partTransitionNotice.toPart === "part5" ? "#101+" : partTransitionNotice.toPart === "part6" ? "#131+" : "#147+"})
                        </span>
                      </button>

                      {partTransitionNotice.toPart === "part6" && (
                        <button
                          type="button"
                          onClick={handleMergeQuestionsToPart6Passage}
                          className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Gộp các câu thành đoạn văn Part 6 ([131]-[134])</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* THÔNG BÁO PART 5 ẨN ĐOẠN VĂN */}
              {!hasPassageTab && (
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {cardFormCategory === "grammar" ? (
                      <>
                        <strong>Chế độ Ngữ pháp đọc (Grammar / Câu đơn):</strong> Vì dạng câu đơn không có đoạn văn dài nên hệ thống tự động ẩn tab Đoạn văn đọc (thứ tự tab là 1 → 2 → 3). Nếu bạn muốn thêm bài đọc Part 6 hoặc Part 7 có đoạn văn, hãy chọn <strong>Part 6</strong> hoặc <strong>Part 7</strong> ở bên dưới!
                      </>
                    ) : (
                      <>
                        <strong>Chế độ Part 5 (Incomplete Sentences):</strong> Vì Part 5 chỉ bao gồm các câu đơn riêng biệt nên hệ thống đã tự động ẩn tab nhập đoạn văn đọc (thứ tự tab là 1 → 2 → 3). Bạn chỉ cần nhập các câu hỏi trắc nghiệm ở tab kế tiếp!
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* KHUÔN MẪU PART CHUẨN TOEIC */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/30 border border-blue-100/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Khuôn mẫu Part chuẩn TOEIC (1-Click áp dụng)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAutoDetector(!showAutoDetector)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showAutoDetector ? "Ẩn tự động nhận diện" : "Tự động nhận diện câu hỏi"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRequestPartChange("part5")}
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
                    <span className="text-[10px] mt-1.5 opacity-90 block">30 câu (101-130) • Điền câu đơn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestPartChange("part6")}
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
                    onClick={() => handleRequestPartChange("part7")}
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
                    <span className="text-[10px] mt-1.5 opacity-90 block">54 câu (147-200) • Đoạn đơn &amp; đa</span>
                  </button>
                </div>
              </div>

              {/* AUTO-DETECTION ACCORDION */}
              {showAutoDetector && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Nhận diện tự động Part dựa trên nội dung nhập</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Dán câu hỏi hoặc bài đọc vào ô bên dưới
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Dán câu hỏi trắc nghiệm hoặc bài đọc vào đây để hệ thống tự nhận diện Part 5, 6 hay 7..."
                    value={detectorInput}
                    onChange={(e) => setDetectorInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-200"
                  />

                  {detectorInput.trim() && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/80">
                      <span className="text-[11px] text-amber-900 font-semibold">
                        {detectedInfo ? detectedInfo.title : "Đã nhận văn bản đề thi"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleParseRawText(detectorInput, (cat) =>
                            setActiveTab(cat === "part5" ? "questions" : "passage")
                          );

                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Zap className="w-4 h-4" />
                        <span>⚡ Bóc tách toàn bộ bài đọc &amp; câu hỏi vào form ngay</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* THANH CÔNG CỤ NẠP ĐỀ THI CHO PART HIỆN TẠI (IMPORT TỆP HOẶC TỰ ĐIỀN) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/90 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Cách nạp nội dung cho {cardFormCategory.toUpperCase()}:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-2xs">
                    {cardFormCategory === "part5" ? "Điền câu đơn" : cardFormCategory === "part6" ? "Điền đoạn văn" : "Đọc hiểu văn bản"}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileImportInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    title="Nạp tệp đề thi từ máy tính (.json, .xlsx, .txt)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>📥 Import đề từ file</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("quick_paste")}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    title="Chuyển sang tab dán văn bản thô để tự bóc tách"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Dán nhanh tự động</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(cardFormCategory === "part5" ? "questions" : "passage");
                      setInternalToast(`Chế độ tự điền thủ công: Mời bạn nhập nội dung vào các trường bên dưới hoặc tab kế tiếp! ✍️`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    title="Tự gõ tiêu đề, bài đọc và từng câu hỏi trắc nghiệm"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>✍️ Tự điền thủ công</span>
                  </button>
                </div>
              </div>

              <input
                ref={fileImportInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json,.txt"
                onChange={handleImportFileFromLocal}
                className="hidden"
              />

              {/* 1. TÊN BÀI ĐỌC (FULL WIDTH WITH HELPER TEXT & INLINE VALIDATION) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên chủ điểm / Bài đọc *
                </label>
                <div className="relative">
                  <input
                    ref={titleInputRef}
                    type="text"
                    placeholder="Ví dụ: allocate / ETS TOEIC Reading - Part 7 (Đọc hiểu 147 - 148)"
                    value={cardFormTitle}
                    onChange={(e) => {
                      setCardFormTitle(e.target.value);
                      if (titleError) setTitleError(null);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all focus:outline-hidden focus:ring-2 bg-white ${
                      titleError
                        ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-rose-200 pr-10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  {titleError && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                  )}
                </div>
                {titleError ? (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{titleError}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Tên bài đọc hiển thị cho học viên trong danh mục chuyên đề luyện thi TOEIC.
                  </p>
                )}

                {/* CẢNH BÁO PHÁT HIỆN BÀI ĐỌC TRÙNG LẶP & TÙY CHỌN GHI ĐÈ */}
                {existingDuplicate && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-2xs animate-in fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-950 leading-snug">
                          Phát hiện bài đọc tương tự đã có sẵn:{" "}
                          <span className="font-extrabold text-blue-800 underline">
                            &quot;{existingDuplicate.title}&quot;
                          </span>{" "}
                          ({existingDuplicate.category.toUpperCase()} • {existingDuplicate.totalQuestions} câu)
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                          {overwriteTargetId === existingDuplicate.id
                            ? "✅ Đang chọn chế độ GHI ĐÈ: Khi bạn bấm 'Lưu', bài đọc cũ trên sẽ được cập nhật thay thế bằng dữ liệu mới này (tránh sinh thêm dòng trùng lặp)."
                            : "Bộ đề này đã có trong danh sách. Bạn có thể chọn ghi đè để cập nhật bài cũ thay vì tạo bài mới!"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {overwriteTargetId === existingDuplicate.id ? (
                        <button
                          type="button"
                          onClick={() => setOverwriteTargetId(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition shadow-2xs"
                        >
                          Hủy ghi đè (Tạo bài mới)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOverwriteTargetId(existingDuplicate.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ghi đè lên bài cũ này</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3 COLUMNS PERFECT HORIZONTAL ALIGNMENT (h-6 LABEL, h-10 INPUT) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
                <div>
                  <label className="h-6 flex items-center text-xs font-bold text-slate-700 mb-1">
                    Phần thi (Part)
                  </label>
                  <select
                    value={cardFormCategory}
                    onChange={(e) => {
                      const cat = e.target.value as "grammar" | "part5" | "part6" | "part7";
                      handleRequestPartChange(cat);
                    }}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="part5">Part 5 (Điền câu đơn)</option>
                    <option value="part6">Part 6 (Điền đoạn văn)</option>
                    <option value="part7">Part 7 (Đọc hiểu văn bản)</option>
                    <option value="grammar">Ngữ pháp đọc (Grammar)</option>
                  </select>
                </div>

                <div>
                  <label className="h-6 flex items-center text-xs font-bold text-slate-700 mb-1">
                    Nhóm con
                  </label>
                  <select
                    value={cardFormSubCategory}
                    onChange={(e) =>
                      setCardFormSubCategory(
                        e.target.value as "word_types" | "verbs" | "other_grammar" | "levels" | "by_topic" | "text_types"
                      )
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
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
                  <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 flex items-center text-xs text-slate-600">
                    {questions.filter((question) => question.question.trim()).length} câu có nội dung
                  </div>
                </div>
              </div>

              {/* Tag & Directions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thẻ ghi chú (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Part 7 - Email doanh nghiệp | Bẫy paraphrasing"
                  value={cardFormTag}
                  onChange={(e) => setCardFormTag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hướng dẫn làm bài chuẩn ETS (Directions)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời..."
                  value={cardFormTheorySummary}
                  onChange={(e) => setCardFormTheorySummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ĐOẠN VĂN ĐỌC (PASSAGE) & BẢN DỊCH SONG NGỮ */}
          {activeTab === "passage" && hasPassageTab && (
            <div className="space-y-4">
              {/* CẢNH BÁO: CÓ BẢN DỊCH TIẾNG VIỆT NHƯNG ĐANG KHUYẾT ĐOẠN VĂN TIẾNG ANH GỐC */}
              {!cardFormPassageText.trim() && cardFormPassageTextVi.trim() && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold">Đang có bản dịch tiếng Việt nhưng chưa có đoạn văn tiếng Anh gốc!</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Đề thi TOEIC bắt buộc phải có bài đọc tiếng Anh để học viên làm bài.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {availableEnglishPassage && (
                      <button
                        type="button"
                        onClick={() => setCardFormPassageText(availableEnglishPassage)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Khôi phục bài đọc tiếng Anh gốc</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCardFormPassageTextVi("")}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition cursor-pointer"
                    >
                      Xóa bản dịch này
                    </button>
                  </div>
                </div>
              )}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/90 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Đoạn văn đọc dùng cho Part 6 &amp; Part 7 (hoặc Part 5 nâng cao)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Khi học viên bắt đầu luyện tập, đoạn văn đọc sẽ hiển thị ở <strong>khung bên trái</strong>. Học viên có thể tra cứu nhanh từ điển hoặc bật nút <strong>&quot;Dịch song ngữ&quot;</strong> để xem bản dịch tiếng Việt tương ứng.
                </p>
                {cardFormCategory === "part6" && questions.length > 0 && questions.some((q) => q.question.trim().length > 0) && (
                <button
                  type="button"
                  onClick={handleMergeQuestionsToPart6Passage}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-900 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Nhét {questions.filter((q) => q.question.trim().length > 0).length} câu hỏi hiện có vào đoạn văn Part 6 (tự động tạo [131]-[134])</span>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-950 px-2.5 py-1 rounded-lg">1-Click gộp</span>
                </button>
              )}

              {cardFormCategory === "part6" && (
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-medium">
                    📌 <strong>Mẹo Part 6:</strong> Hãy chèn các mã <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[131]</code>, <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[132]</code>, <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[133]</code>, <code className="bg-purple-200 px-1 py-0.5 rounded font-bold">[134]</code> vào các vị trí cần điền trong đoạn văn để giao diện tự đánh dấu chỗ trống chuẩn ETS!
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {cardFormPassageText.trim() ? "Đã có nội dung bài đọc" : "Chưa có bài đọc (hãy dán bài đọc của bạn vào bên dưới)"}
                </span>
                <div className="flex items-center gap-2">
                  {cardFormPassageText.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setCardFormPassageText("");
                        setCardFormPassageTextVi("");
                      }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa trắng bài đọc</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Nội dung đoạn văn tiếng Anh (Passage - English) *</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {cardFormPassageText.trim() ? `${cardFormPassageText.split(/\s+/).filter(Boolean).length} từ` : "Chưa nhập"}
                    </span>
                  </label>
                  <textarea
                    ref={passageTextareaRef}
                    rows={9}
                    placeholder={`Dán nội dung bài đọc tiếng Anh vào đây...\nVí dụ:\nSILVERLINE LOGISTICS\nClient Update - Policy Changes\nEffective: October 1...`}
                    value={cardFormPassageText}
                    onChange={(e) => {
                      setCardFormPassageText(e.target.value);
                      if (passageError) setPassageError(null);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`w-full flex-1 min-h-[200px] rounded-xl border px-3.5 py-2.5 text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-2 bg-white resize-y transition-all ${
                      passageError
                        ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-rose-200"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  {passageError && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{passageError}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Bản dịch tiếng Việt (Vietnamese Translation)</span>
                    <span className="text-[10px] text-emerald-600 font-normal">Hiển thị khi học viên bật Dịch song ngữ</span>
                  </label>
                  <textarea
                    rows={9}
                    placeholder={`Dán bản dịch tiếng Việt của bài đọc vào đây...\nVí dụ:\nHÃNG VẬN TẢI SILVERLINE\nThông báo cập nhật khách hàng - Thay đổi chính sách...`}
                    value={cardFormPassageTextVi}
                    onChange={(e) => setCardFormPassageTextVi(e.target.value)}
                    className="w-full flex-1 min-h-[200px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs leading-relaxed focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 bg-white resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BỘ CÂU HỎI TRẮC NGHIỆM & ĐÁP ÁN */}
          {activeTab === "questions" && (
            <div className="space-y-4">
              {/* Question selector pill bar */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {questions.map((q, idx) => {
                    const isSelected = idx === selectedQuestionIndex;
                    const hasData = q.question.trim().length > 0;
                    const hasOpts = (q.options || []).filter((o) => o.trim().length > 0).length >= 2;
                    const hasError = (questionError || optionsError) && (!hasData || !hasOpts);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedQuestionIndex(idx);
                          setQuestionError(null);
                          setOptionsError(null);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : hasError
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300"
                            : "bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span>Câu {idx + 1}</span>
                        {q.questionNum && (
                          <span className={`text-[10px] px-1 rounded ${isSelected ? "bg-blue-700 text-blue-100" : hasError ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"}`}>
                            #{q.questionNum}
                          </span>
                        )}
                        {hasData && hasOpts && (
                          <Check className={`w-3 h-3 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                        )}
                        {hasError && (
                          <AlertCircle className={`w-3 h-3 ${isSelected ? "text-white" : "text-rose-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRenumberQuestions}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Tự động đánh số lại câu hỏi theo chuẩn Part hiện tại"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đánh số ({!hasPassageTab ? "#101+" : cardFormCategory === "part6" ? "#131+" : "#147+"})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu</span>
                  </button>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(selectedQuestionIndex)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Xóa câu hỏi hiện tại"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Question Fields */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Nội dung câu hỏi {selectedQuestionIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 font-medium">Mã số câu:</label>
                    <input
                      type="text"
                      placeholder="101"
                      value={activeQuestion.questionNum || ""}
                      onChange={(e) =>
                        handleUpdateCurrentQuestion((q) => ({ ...q, questionNum: e.target.value }))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-center bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Câu hỏi tiếng Anh *
                  </label>
                  <div className="relative">
                    <input
                      ref={questionInputRef}
                      type="text"
                      placeholder="Ví dụ: According to the email, what discount will customers receive?"
                      value={activeQuestion.question}
                      onChange={(e) => {
                        handleUpdateCurrentQuestion((q) => ({ ...q, question: e.target.value }));
                        if (questionError) setQuestionError(null);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium focus:outline-hidden focus:ring-2 bg-white transition-all ${
                        questionError
                          ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-rose-200 pr-10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    {questionError && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      </div>
                    )}
                  </div>
                  {questionError && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{questionError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Dịch câu hỏi tiếng Việt (Bilingual) *</span>
                    {bilingualError && (
                      <span className="text-[11px] text-rose-600 font-semibold">{bilingualError}</span>
                    )}
                  </label>
                  <input
                    ref={bilingualInputRef}
                    type="text"
                    placeholder="Ví dụ: Theo email, khách hàng sẽ nhận được mức giảm giá nào?"
                    value={activeQuestion.bilingual || ""}
                    onChange={(e) => {
                      handleUpdateCurrentQuestion((q) => ({ ...q, bilingual: e.target.value }));
                      if (bilingualError) setBilingualError(null);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium focus:outline-hidden bg-white transition-all ${
                      bilingualError
                        ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    }`}
                  />
                </div>

                {/* 4 Options A, B, C, D */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      4 Phương án trả lời (A, B, C, D) &amp; Chọn đáp án đúng:
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      Bấm vào nút tròn để chọn đáp án đúng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {["A", "B", "C", "D"].map((letter, optIdx) => {
                      const isCorrect = (activeQuestion.correctIndex ?? 0) === optIdx;
                      const isOptionEmpty = !activeQuestion.options?.[optIdx]?.trim();
                      const isMeaningEmpty = !activeQuestion.optionMeanings?.[optIdx]?.trim();
                      const highlightError = optionsError && isOptionEmpty;
                      const highlightMeaningError = optionsError && isMeaningEmpty;
                      return (
                        <div
                          key={letter}
                          className={`p-2 rounded-xl border transition flex items-center gap-2.5 ${
                            highlightError
                              ? "bg-rose-50/20 border-rose-300 ring-1 ring-rose-200"
                              : isCorrect
                              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                              : "bg-slate-50/50 border-slate-200"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCurrentQuestion((q) => ({ ...q, correctIndex: optIdx }))
                            }
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition cursor-pointer shrink-0 ${
                              isCorrect
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white border-2 border-slate-300 text-slate-600 hover:border-emerald-500"
                            }`}
                          >
                            {letter}
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              ref={optIdx === 0 ? firstOptionInputRef : undefined}
                              type="text"
                              placeholder={`Nội dung (${letter}) tiếng Anh...`}
                              value={activeQuestion.options?.[optIdx] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateCurrentQuestion((q) => {
                                  const opts = [...(q.options || ["", "", "", ""])];
                                  opts[optIdx] = val;
                                  return { ...q, options: opts };
                                });
                                if (optionsError) setOptionsError(null);
                                if (errorMsg) setErrorMsg(null);
                              }}
                              className={`w-full px-3 py-1.5 rounded-lg border text-xs font-medium bg-white focus:outline-hidden focus:ring-2 transition-all ${
                                highlightError
                                  ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                            />

                            <input
                              type="text"
                              placeholder={`Nghĩa tiếng Việt (${letter}) *...`}
                              value={activeQuestion.optionMeanings?.[optIdx] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleUpdateCurrentQuestion((q) => {
                                  const meanings = [...(q.optionMeanings || ["", "", "", ""])];
                                  meanings[optIdx] = val;
                                  return { ...q, optionMeanings: meanings };
                                });
                                if (optionsError) setOptionsError(null);
                                if (errorMsg) setErrorMsg(null);
                              }}
                              className={`w-full px-3 py-1.5 rounded-lg border text-xs bg-white focus:outline-hidden focus:ring-2 transition-all ${
                                highlightMeaningError
                                  ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-200 ring-1 ring-rose-200"
                                  : "border-slate-200 text-slate-600 focus:border-emerald-500 focus:ring-emerald-100"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {optionsError && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{optionsError}</span>
                    </p>
                  )}
                </div>

                {/* Explanation & Steps */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Giải thích chi tiết (Tại sao đáp án này đúng)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Đoạn 2 nêu rõ '...reduced to just 24 hours', đồng nghĩa với việc rút ngắn thời gian giao hàng."
                      value={activeQuestion.explanation || ""}
                      onChange={(e) =>
                        handleUpdateCurrentQuestion((q) => ({ ...q, explanation: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white resize-none"
                    />
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Các bước làm bài (Steps to solve)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm bước</span>
                      </button>
                    </div>

                    {(activeQuestion.steps || []).map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Bước 1: Quét từ khóa"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(sIdx, "title", e.target.value)}
                          className="w-1/3 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50"
                        />
                        <input
                          type="text"
                          placeholder="Mô tả hành động giải..."
                          value={step.desc}
                          onChange={(e) => handleUpdateStep(sIdx, "desc", e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(sIdx)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TỪ VỰNG CẦN HỌC */}
          {activeTab === "vocab" && (
            <div className="space-y-5">
              <ReadingVocabExtractorPanel
                passageText={cardFormPassageText}
                questions={questions}
                existingWords={existingVocabWords}
                allowCardLevelTarget={Boolean(setCardFormVocabList)}
                defaultTargetQuestionIndex={vocabTargetQuestionIdx >= 0 ? vocabTargetQuestionIdx : null}
                applyButtonLabel="Thêm từ đã chọn vào bản preview"
                onApplyVocab={handleApplyExtractedVocab}
              />

              {/* FORM THÊM TỪ VỰNG MỚI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      TỪ VỰNG
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-slate-900">
                      Thêm từ vựng mới vào bài đọc
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">Gắn vào câu:</label>
                    <select
                      value={vocabTargetQuestionIdx}
                      onChange={(e) => setVocabTargetQuestionIdx(Number(e.target.value))}
                      className="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-800 focus:outline-hidden focus:ring-2 focus:ring-blue-100"
                    >
                      {Boolean(setCardFormVocabList) && (
                        <option value={-1}>Chung toàn bài đọc</option>
                      )}
                      {questions.map((q, qIdx) => (
                        <option key={qIdx} value={qIdx}>
                          Câu {qIdx + 1} {q.questionNum ? `(#${q.questionNum})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {vocabFormError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-2.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{vocabFormError}</span>
                  </div>
                )}

                {/* 1. TỪ TIẾNG ANH * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Từ tiếng Anh *</span>
                    {vocabFormError && (
                      <span className="text-[11px] text-rose-600 font-semibold">{vocabFormError}</span>
                    )}
                  </label>
                  <input
                    ref={vocabWordInputRef}
                    type="text"
                    placeholder="Ví dụ: allocate"
                    value={vocabInputWord}
                    onChange={(e) => {
                      setVocabInputWord(e.target.value);
                      if (vocabFormError) setVocabFormError(null);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all focus:outline-hidden focus:ring-2 bg-white ${
                      vocabFormError
                        ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Gợi ý từ điển là dữ liệu tham khảo riêng; chỉ nội dung bạn áp dụng hoặc thêm thành nghĩa riêng mới được lưu.
                  </p>
                  {(dictLoading || dictSuggestion || dictError) && (
                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] space-y-1.5">
                      {dictLoading && (
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tra gợi ý từ điển cho &ldquo;{vocabInputWord.trim()}&rdquo;...</span>
                        </div>
                      )}
                      {!dictLoading && dictSuggestion && (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-blue-900">{dictSuggestion.word}</span>
                              {dictSuggestion.phonetic && (
                                <span className="font-mono text-slate-600">{dictSuggestion.phonetic}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyDictSuggestion(0)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition cursor-pointer"
                            >
                              Áp dụng gợi ý này
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {dictSuggestion.meanings.slice(0, 4).map((m, idx) => (
                              <button
                                key={m.id || idx}
                                type="button"
                                onClick={() => handleApplyDictSuggestion(idx)}
                                className="px-2 py-0.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-slate-700 text-[10px] text-left cursor-pointer transition"
                              >
                                {m.partOfSpeech ? `(${m.partOfSpeech}) ` : ""}{m.definition}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!dictLoading && !dictSuggestion && dictError && (
                        <span className="text-slate-500">{dictError}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 2 COLUMNS: PHIÊN ÂM IPA vs TỪ LOẠI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Phiên âm IPA + nút nghe UK / US */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phiên âm IPA
                    </label>
                    <input
                      type="text"
                      placeholder="/ˈæləkeɪt/"
                      value={vocabInputIpa}
                      onChange={(e) => setVocabInputIpa(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono font-medium focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 bg-white"
                    />
                    <div className="mt-1.5 flex items-center gap-4 text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <span>UK</span>
                        <button
                          type="button"
                          onClick={() => playRegionalPronunciation("UK")}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                          title="Nghe phát âm UK"
                        >
                          <Volume2 className={`h-3.5 w-3.5 ${playingRegion === "UK" ? "text-blue-600 animate-pulse" : ""}`} />
                        </button>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <span>US</span>
                        <button
                          type="button"
                          onClick={() => playRegionalPronunciation("US")}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                          title="Nghe phát âm US"
                        >
                          <Volume2 className={`h-3.5 w-3.5 ${playingRegion === "US" ? "text-blue-600 animate-pulse" : ""}`} />
                        </button>
                      </span>
                    </div>
                  </div>

                  {/* Right: Từ loại & Nhóm nhỏ */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Từ loại
                    </label>
                    <p className="mb-1 text-[10px] text-slate-400">Chọn độc lập với từ loại trong gợi ý.</p>
                    <select
                      value={vocabInputPos}
                      onChange={(e) => setVocabInputPos(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="Verb">Verb — Động từ (V)</option>
                      <option value="Noun">Noun — Danh từ (N)</option>
                      <option value="Adjective">Adjective — Tính từ (Adj)</option>
                      <option value="Adverb">Adverb — Trạng từ (Adv)</option>
                      <option value="Preposition">Preposition — Giới từ (Prep)</option>
                      <option value="Conjunction">Conjunction — Liên từ (Conj)</option>
                    </select>

                    <label className="mt-2 block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Nhóm nhỏ (tùy chọn)
                    </label>
                    <select
                      value={vocabInputSubCategory}
                      onChange={(e) => setVocabInputSubCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="">Không chọn nhóm nhỏ</option>
                      <option value="business">Kinh doanh &amp; Tài chính</option>
                      <option value="office">Văn phòng &amp; Nhân sự</option>
                      <option value="logistics">Vận tải &amp; Hậu cần</option>
                      <option value="marketing">Tiếp thị &amp; Bán hàng</option>
                    </select>
                  </div>
                </div>

                {/* 2 COLUMNS: NGHĨA TIẾNG VIỆT * vs VÍ DỤ NGỮ CẢNH TOEIC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nghĩa tiếng Việt *
                    </label>
                    <input
                      type="text"
                      placeholder="Phân bổ, chỉ định ngân sách hoặc nguồn lực"
                      value={vocabInputMeaning}
                      onChange={(e) => setVocabInputMeaning(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ví dụ ngữ cảnh TOEIC
                    </label>
                    <input
                      type="text"
                      placeholder="The committee allocated funds for the new research laboratory."
                      value={vocabInputExample}
                      onChange={(e) => setVocabInputExample(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* 2 COLUMNS: TỪ ĐỒNG NGHĨA vs TỪ TRÁI NGHĨA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Từ đồng nghĩa (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: area, district, assign"
                      value={vocabInputSynonyms}
                      onChange={(e) => setVocabInputSynonyms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Từ trái nghĩa (tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: withhold, keep"
                      value={vocabInputAntonyms}
                      onChange={(e) => setVocabInputAntonyms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                {/* NÚT THÊM NGHĨA / THÊM TỪ */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">
                    Mỗi từ vựng lưu riêng từ loại, phiên âm, ví dụ ngữ cảnh, từ đồng nghĩa và trái nghĩa.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddVocabFromForm}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm vào danh sách từ vựng</span>
                  </button>
                </div>
              </div>

              {/* DANH SÁCH TỪ VỰNG ĐÃ THÊM (CÓ BỘ LỌC TẤT CẢ / THEO CÂU) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {vocabFilterScope === "all"
                        ? `Danh sách từ vựng toàn bài đọc (${totalVocabCount} từ):`
                        : `Danh sách từ vựng của Câu ${(typeof vocabFilterScope === "number" ? vocabFilterScope : 0) + 1} (${
                            questions[typeof vocabFilterScope === "number" ? vocabFilterScope : 0]?.vocabList?.length || 0
                          } từ):`}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Tổng cộng toàn bài đọc: {totalVocabCount} từ vựng trọng tâm
                    </span>
                  </div>

                  {/* SCOPE FILTER PILLS */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    <button
                      type="button"
                      onClick={() => setVocabFilterScope("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        vocabFilterScope === "all"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>Tất cả bài đọc</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        vocabFilterScope === "all" ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {totalVocabCount}
                      </span>
                    </button>

                    {(Boolean(setCardFormVocabList) || cardFormVocabList.length > 0) && (
                      <button
                        type="button"
                        onClick={() => setVocabFilterScope("card")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          vocabFilterScope === "card"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>Chung bài đọc</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          vocabFilterScope === "card" ? "bg-purple-700 text-white" : "bg-slate-200 text-slate-700"
                        }`}>
                          {cardFormVocabList.length}
                        </span>
                      </button>
                    )}

                    {questions.map((q, qIdx) => {
                      const count = q.vocabList?.length || 0;
                      const isSelected = vocabFilterScope === qIdx;
                      return (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => setVocabFilterScope(qIdx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>Câu {qIdx + 1}</span>
                          {q.questionNum && <span className="opacity-80 text-[10px]">#{q.questionNum}</span>}
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {displayedVocabList.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Chưa có từ vựng nào trong mục này. Hãy nhập thông tin ở biểu mẫu phía trên và bấm <strong>&quot;Thêm vào danh sách từ vựng&quot;</strong> hoặc dùng công cụ <strong>&quot;⚡ Dán nhanh tự động&quot;</strong>.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {displayedVocabList.map(({ item: v, qIdx, qNum, itemIdx }) => (
                      <div
                        key={`${qIdx}-${itemIdx}`}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-200 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase border border-blue-200">
                              {v.pos}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border ${
                              qIdx === -1
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {qIdx === -1 ? "Chung bài đọc" : `Câu ${qIdx + 1} (#${qNum})`}
                            </span>
                            {v.ipa && (
                              <span className="font-mono text-slate-500 text-[11px]">
                                {v.ipa}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => playRegionalPronunciation("US", v.word)}
                              className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                              title="Nghe phát âm US"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-slate-700 font-semibold">
                            {v.meaning}
                          </p>

                          {v.example && (
                            <p className="text-[11px] text-slate-500 italic">
                              &quot;{v.example.en}&quot;
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVocabGlobal(qIdx, itemIdx)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="Xóa từ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DÁN NHANH TOÀN BỘ ĐỀ THI & BÓC TÁCH TỰ ĐỘNG */}
          {activeTab === "quick_paste" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Công cụ Dán nhanh &amp; Tự động bóc tách (Quick Paste &amp; Auto-Parse)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/90 text-amber-950 border border-amber-300">
                    Đang dán cho: {cardFormCategory.toUpperCase()} ({cardFormCategory === "part5" ? "Điền câu đơn" : cardFormCategory === "part6" ? "Điền đoạn văn" : "Đọc hiểu văn bản"})
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Bạn có thể copy toàn bộ đề thi chuẩn <strong>{cardFormCategory.toUpperCase()}</strong> dán vào ô bên dưới. Hệ thống sẽ <strong>tự động nhận diện và điền vào các trường</strong> tương ứng.
                  <span className="block mt-1 font-semibold text-amber-900">
                    {cardFormCategory === "part5" && "⚠️ Quy tắc Part 5: Chỉ chấp nhận câu đơn riêng biệt (101-130), KHÔNG chứa đoạn văn đọc dài."}
                    {cardFormCategory === "part6" && "⚠️ Quy tắc Part 6: Bắt buộc phải có đoạn văn chứa vị trí khuyết ([131]-[134])."}
                    {cardFormCategory === "part7" && "⚠️ Quy tắc Part 7: Bắt buộc phải có đoạn văn đọc (Passage) và bộ câu hỏi đọc hiểu kèm theo."}
                  </span>
                </p>
              </div>

              {parseSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex flex-wrap items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="flex-1">{parseSuccessMsg}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("vocab")}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer shrink-0"
                  >
                    Xem &amp; Gợi ý từ vựng →
                  </button>
                </div>
              )}

              <div>
                <label className="block text-slate-800 font-bold text-xs mb-1.5">
                  Dán nội dung đề thi chuẩn {cardFormCategory.toUpperCase()} vào đây:
                </label>
                <textarea
                  rows={10}
                  placeholder={
                    cardFormCategory === "part5"
                      ? `101. The committee decided to ______ the proposal after a thorough discussion.\n(A) accept (chấp nhận)\n(B) accepting (việc chấp nhận)\n(C) acceptance (sự chấp nhận)\n(D) accepted (đã chấp nhận)\nĐáp án: A\nDịch: Ủy ban đã quyết định chấp nhận đề xuất sau một cuộc thảo luận kỹ lưỡng.\nGiải thích: Cần động từ nguyên mẫu sau to.\nTừ vựng:\n- committee (/kəˈmɪti/) (n): ủy ban\n- proposal (/prəˈpəʊzl/) (n): đề xuất`
                      : cardFormCategory === "part6"
                      ? `[Đoạn văn]\nTo: All Residents <residents@parkview.com>\nFrom: Building Management\nSubject: Scheduled Plumbing Maintenance\n\nDuring this period, water service will be temporarily [131]------ throughout the building. We recommend storing sufficient water for your morning needs. In addition, technicians [132]------ access to utility closets located on each floor.\n\n[Dịch đoạn văn]\nGửi: Toàn thể cư dân\nTừ: Ban quản lý tòa nhà...\n\n131. (A) suspended (bị tạm ngừng) (B) improved (C) replaced (D) cleaned\nĐáp án: A\nDịch: Trong thời gian này, dịch vụ cấp nước sẽ tạm thời bị gián đoạn...`
                      : `[Đoạn văn]\nSILVERLINE LOGISTICS\nClient Update - Policy Changes\nEffective: October 1\n\nSilverline Logistics is pleased to announce the opening of our new distribution center in Chicago. With this expansion, standard ground delivery times will be reduced from three business days to just 24 hours.\n\n[Dịch đoạn văn]\nHÃNG VẬN TẢI SILVERLINE\nThông báo cập nhật khách hàng - Thay đổi chính sách...\n\n147. What is indicated about the package delivery?\n(A) It requires an extra fee (Yêu cầu trả thêm phụ phí)\n(B) It will be completed within 24 hours (Sẽ hoàn tất trong vòng 24 giờ)\n(C) It is available only on weekends (Chỉ có vào cuối tuần)\n(D) It must be booked two weeks in advance (Phải đặt trước hai tuần)\nĐáp án: B\nDịch: Điều gì được chỉ ra về việc giao kiện hàng?\nGiải thích: Trong bài có nêu rõ 'reduced to just 24 hours'.\nTừ vựng:\n- logistics (/ləˈdʒɪstɪks/) (n): hậu cần`
                  }
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Hỗ trợ định dạng chuẩn ETS TOEIC
                </span>
                <button
                  type="button"
                  onClick={() => handleParseRawText()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ Phân tích &amp; Điền tự động vào form</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER (Matching VocabularyModals layout: Helper text on left, Hủy & Submit on right) */}
        <div className="flex shrink-0 flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 px-4 sm:px-6 py-3.5 bg-slate-50/50">
          <p className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-xl">
            {totalVocabCount > 0
              ? `Đã liên kết ${totalVocabCount} từ vựng và ${questions.length} câu hỏi vào bài đọc.`
              : "Chưa có từ vựng riêng. Khi các dạng liên quan được thêm vào, hệ thống sẽ tự phát hiện và liên kết."}
          </p>

          <div className="flex items-center gap-2.5 shrink-0 justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingCard ? "Lưu thay đổi" : "Thêm vào danh sách"}</span>
            </button>
          </div>
        </div>

        {/* MODAL XÁC NHẬN CHUYỂN ĐỔI PART */}
        {partSwitchConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Xác nhận chuyển đổi phần thi ({partSwitchConfirm.prevPart.toUpperCase()} ➔ {partSwitchConfirm.targetPart.toUpperCase()})
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Cấu trúc đề thi của <strong>{partSwitchConfirm.targetPart.toUpperCase()}</strong> ({partSwitchConfirm.targetPart === "part5" ? "Điền câu đơn" : partSwitchConfirm.targetPart === "part6" ? "Điền đoạn văn" : "Đọc hiểu văn bản"}) hoàn toàn khác với <strong>{partSwitchConfirm.prevPart.toUpperCase()}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <span>⚠️ Lưu ý quan trọng khi chuyển đổi:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-amber-900 text-[11px] leading-relaxed">
                  <li>
                    Toàn bộ dữ liệu hiện tại của <strong>{partSwitchConfirm.prevPart.toUpperCase()}</strong> ({partSwitchConfirm.qCount} câu hỏi, bài đọc, từ vựng) sẽ được <strong>làm mới (xóa sạch dữ liệu cũ)</strong>.
                  </li>
                  <li>
                    Hệ thống sẽ chuẩn bị form trắng chuẩn theo định dạng của <strong>{partSwitchConfirm.targetPart.toUpperCase()}</strong> để bạn nhập hoặc dán nhanh đề thi mới phù hợp.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Chọn phương thức nạp đề thi cho {partSwitchConfirm.targetPart.toUpperCase()}:
                </span>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = partSwitchConfirm.targetPart;
                      handleExecutePartSwitchWithReset(target);
                      setTimeout(() => {
                        fileImportInputRef.current?.click();
                      }, 100);
                    }}
                    className="p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 text-left transition cursor-pointer flex items-center justify-between group active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 group-hover:scale-105 transition">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-950 block">
                          1. Import đề từ file bên ngoài
                        </span>
                        <span className="text-[11px] text-blue-800 block">
                          Tải file .json, .xlsx, .txt từ máy tính để hệ thống tự động nạp.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 shrink-0 ml-2">Chọn file →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = partSwitchConfirm.targetPart;
                      handleExecutePartSwitchWithReset(target);
                      setActiveTab("quick_paste");
                    }}
                    className="p-3 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-left transition cursor-pointer flex items-center justify-between group active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 group-hover:scale-105 transition">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">
                          2. Dán nhanh toàn bộ đề thi (Quick Paste)
                        </span>
                        <span className="text-[11px] text-amber-800 block">
                          Dán văn bản thô gồm bài đọc và câu hỏi để tự động bóc tách.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-600 shrink-0 ml-2">Mở dán nhanh →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = partSwitchConfirm.targetPart;
                      handleExecutePartSwitchWithReset(target);
                      setActiveTab(target === "part5" ? "questions" : "passage");
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer flex items-center justify-between group active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-700 text-white shrink-0 group-hover:scale-105 transition">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          3. Tự điền nội dung thủ công (Form trắng)
                        </span>
                        <span className="text-[11px] text-slate-600 block">
                          Làm mới form trắng để tự tay gõ tiêu đề, bài đọc và từng câu hỏi.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 shrink-0 ml-2">Tự gõ →</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPartSwitchConfirm(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy / Giữ nguyên {partSwitchConfirm.prevPart.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* THÔNG BÁO TOAST NỔI TRỰC TIẾP TRONG MODAL (KHUNG ẢNH 2) */}
        {activeToast && (
          <div className="absolute bottom-16 sm:bottom-18 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-blue-600 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 animate-in slide-in-from-bottom-2 duration-150 max-w-md sm:max-w-lg">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm leading-snug flex-1">
              {activeToast}
            </span>
            <button
              type="button"
              onClick={handleCloseToast}
              className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer text-white/80 hover:text-white shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
