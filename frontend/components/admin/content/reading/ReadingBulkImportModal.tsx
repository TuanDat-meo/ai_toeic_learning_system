"use client";

import React, { useMemo, useState, useRef } from "react";
import { ExerciseCardData, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import {
  ReadingVocabExtractorPanel,
  type AppliedVocabEntry,
} from "./ReadingVocabExtractorPanel";
import {
  enrichInlineParsedVocab,
  normalizeVocabItem,
  autoExtractVocabListForReading,
} from "@/lib/readingVocabExtractor";
import { parseAdminReadingFile, normalizeSampleQuestion, normalizeOptions } from "@/lib/api/reading";
import { normalizeReadingCardTitle } from "@/app/admin/content/reading/readingTitleUtils";
import {
  X,
  Upload,
  ClipboardPaste,
  FileSpreadsheet,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Download,
  Check,
  Trash2,
  Volume2,
  Loader2,
  Maximize2,
  Minimize2,
  Pencil,
  Plus,
  Filter,
  Search,
  RotateCcw,
  FileEdit,
  CheckSquare,
} from "lucide-react";

function normalizeCsvHeader(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseCsvRows(text: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    if (inQuotes) {
      if (ch === '"') {
        if (cleanText[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && cleanText[i + 1] === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += ch;
    }
  }
  currentRow.push(currentField.trim());
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }
  return rows;
}

function parseBulkVocabToken(raw: string): VocabItem | null {
  const clean = raw.replace(/^[\-\•\*\d\.]+\s*/, "").trim();
  if (!clean) return null;
  let word = "";
  let pos = "n";
  let ipa = "";
  let meaning = "";

  const ipaMatch = clean.match(/\/([^\/]+)\//);
  if (ipaMatch) ipa = `/${ipaMatch[1].trim()}/`;
  const posMatch = clean.match(/\((n|v|adj|adv|prep|conj)[^\)]*\)/i);
  if (posMatch) pos = posMatch[1].toLowerCase();

  const stripped = clean
    .replace(/\(\s*\/[^\/]+\/\s*\)/g, "")
    .replace(/\/([^\/]+)\//g, "")
    .replace(/\((?:n|v|adj|adv|prep|conj)[^\)]*\)/gi, "")
    .replace(/\(\s*\)/g, "")
    .trim();
  const split = stripped.split(/[\:\-\=]\s*(.+)/);
  if (split.length >= 2) {
    word = split[0].trim();
    meaning = split[1].trim();
  } else {
    word = stripped;
  }
  word = word.replace(/[\(\)\[\]]/g, "").trim();
  if (!word || !/^[a-zA-Z][a-zA-Z\s'\-]*$/.test(word)) return null;
  return enrichInlineParsedVocab({ word, ipa, pos, meaning, level: "B1" });
}

function parseBulkVocabList(raw: string): VocabItem[] {
  return raw
    .split(/[,;]/)
    .map((part) => parseBulkVocabToken(part))
    .filter((item): item is VocabItem => item !== null);
}

export interface ReadingBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newCard: ExerciseCardData | ExerciseCardData[]) => void;
  existingCards?: ExerciseCardData[];
}

export const ReadingBulkImportModal: React.FC<ReadingBulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingCards = [],
}) => {
  const [activeTab, setActiveTab] = useState<"paste" | "file">("paste");
  const [isMaximized, setIsMaximized] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Form Metadata
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"part5" | "part6" | "part7" | "grammar">("part5");
  const [subCategory] = useState<
    "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types"
  >("word_types");
  const [tag, setTag] = useState("");
  const [importStatus, setImportStatus] = useState<"draft" | "published">("draft");
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  // Phát hiện bài đọc trùng lặp trong hệ thống theo tiêu đề và part
  const existingDuplicate = useMemo(() => {
    if (!title.trim() || !existingCards || existingCards.length === 0) return null;
    const cleanTitle = title.trim().toLowerCase();
    return existingCards.find(
      (c) => c.title.trim().toLowerCase() === cleanTitle && c.category === category
    );
  }, [title, category, existingCards]);

  // Passage Data (optional for Part 6/7)
  const [passageText, setPassageText] = useState("");
  const [passageTextVi, setPassageTextVi] = useState("");

  // Raw Paste Text
  const [rawText, setRawText] = useState("");

  // Parsed Output
  const [parsedQuestions, setParsedQuestions] = useState<SampleQuestion[]>([]);
  // Master pool of all imported questions before filtering by part
  const [allLoadedQuestions, setAllLoadedQuestions] = useState<SampleQuestion[]>([]);
  const [cardVocabList, setCardVocabList] = useState<VocabItem[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Question editing / adding states
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState<SampleQuestion>({
    questionNum: "101",
    question: "",
    bilingual: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  });

  // Filter & search in question preview
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewPartFilter, setPreviewPartFilter] = useState<
    "all" | "part5" | "part6" | "part7" | "listening"
  >("all");

  const parsedVocabCount = useMemo(
    () => cardVocabList.length + parsedQuestions.reduce((sum, q) => sum + (q.vocabList?.length || 0), 0),
    [cardVocabList, parsedQuestions]
  );

  const existingVocabWords = useMemo(() => {
    const words: string[] = [];
    cardVocabList.forEach((v) => {
      if (v.word?.trim()) words.push(v.word.trim().toLowerCase());
    });
    parsedQuestions.forEach((q) => {
      (q.vocabList || []).forEach((v) => {
        if (v.word?.trim()) words.push(v.word.trim().toLowerCase());
      });
    });
    return words;
  }, [cardVocabList, parsedQuestions]);

  // Phân tích câu hỏi theo các Part của TOEIC
  const listeningQuestions = useMemo(() => {
    return parsedQuestions.filter((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 1 && n <= 100;
    });
  }, [parsedQuestions]);

  const part5Questions = useMemo(() => {
    return parsedQuestions.filter((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 101 && n <= 130;
    });
  }, [parsedQuestions]);

  const part6Questions = useMemo(() => {
    return parsedQuestions.filter((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 131 && n <= 146;
    });
  }, [parsedQuestions]);

  const part7Questions = useMemo(() => {
    return parsedQuestions.filter((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 147 && n <= 200;
    });
  }, [parsedQuestions]);

  const hasListeningQuestions = listeningQuestions.length > 0;
  const isOver100Questions = parsedQuestions.length > 100;
  const isPart5Exceeding = category === "part5" && parsedQuestions.length > 30;

  // Lọc chỉ giữ lại phần Reading (101 - 200)
  const handleFilterOnlyReading = () => {
    let readingQs = parsedQuestions.filter((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 101 && n <= 200;
    });

    // Nếu các câu chưa đánh số 101..200 nhưng tổng câu >= 101 (ví dụ đề 200 câu đánh số 1-200)
    if (readingQs.length === 0 && parsedQuestions.length >= 101) {
      readingQs = parsedQuestions.slice(100).map((q, idx) => ({
        ...q,
        questionNum: String(101 + idx),
      }));
    }

    if (readingQs.length === 0) {
      readingQs = parsedQuestions.filter((q) => {
        const n = parseInt(q.questionNum || "0", 10);
        return !isNaN(n) && n > 100;
      });
    }

    if (readingQs.length > 0) {
      setParsedQuestions(readingQs);

      // Đồng bộ từ vựng cho các câu hỏi Reading vừa lọc
      const seenW = new Set<string>();
      let filteredVocabs: VocabItem[] = [];
      readingQs.forEach((q) => {
        (q.vocabList || []).forEach((v) => {
          const k = v.word.trim().toLowerCase();
          if (!seenW.has(k)) {
            seenW.add(k);
            filteredVocabs.push(v);
          }
        });
      });
      if (filteredVocabs.length === 0 && readingQs.length > 0) {
        filteredVocabs = autoExtractVocabListForReading({
          passageText,
          questions: readingQs,
          maxCandidates: 40,
        });
      }
      setCardVocabList(filteredVocabs);

      // Tự động suy luận Part thích hợp
      const nums = readingQs.map((q) => parseInt(q.questionNum || "0", 10)).filter((n) => !isNaN(n));
      const minNum = Math.min(...nums);
      const maxNum = Math.max(...nums);
      if (minNum >= 101 && maxNum <= 130) {
        setCategory("part5");
      } else if (minNum >= 131 && maxNum <= 146) {
        setCategory("part6");
      } else if (minNum >= 147 && maxNum <= 200) {
        setCategory("part7");
      }
      if (readingQs.length > 30) {
        setSuccessMsg(
          `Đã loại bỏ Listening (1-100), giữ lại ${readingQs.length} câu Reading (101 - 200) và ${filteredVocabs.length} từ vựng trọng tâm. 💡 Lưu ý: Đề Reading gồm Part 5 (30 câu), Part 6 (16 câu) và Part 7 (54 câu). Hãy bấm 'Lấy Part 5 (101-130)' bên dưới nếu bạn muốn lưu riêng Part 5 chuẩn! ✨`
        );
      } else {
        setSuccessMsg(`Đã loại bỏ Listening (1-100), chỉ giữ lại ${readingQs.length} câu Reading chuẩn (Câu 101 - 200) và ${filteredVocabs.length} từ vựng trọng tâm! ✨`);
      }
      setErrorMsg(null);
    } else {
      setErrorMsg("Không tìm thấy câu hỏi nào thuộc dải Reading (101 - 200)!");
    }
  };

  // Helper show error and smooth scroll to top
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper trích xuất questions theo part chuẩn xác từ pool
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

    // 2. Nếu không tìm thấy, thử tìm theo số câu tương ứng 1..30, 31..46, 47..100
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
      questionNum: String(startNum + idx),
    }));
  };

  // Helper trích xuất hoặc tự động sinh bộ từ vựng cho một nhóm câu hỏi
  const extractVocabsForQuestionSet = (
    qs: SampleQuestion[],
    pText?: string
  ): VocabItem[] => {
    const seen = new Set<string>();
    const list: VocabItem[] = [];
    qs.forEach((q) => {
      (q.vocabList || []).forEach((v) => {
        const k = v.word.trim().toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          list.push(v);
        }
      });
    });
    if (list.length === 0 && qs.length > 0) {
      return autoExtractVocabListForReading({
        passageText: pText,
        questions: qs,
        maxCandidates: 30,
      });
    }
    return list;
  };

  // Lọc giữ riêng từng Part
  const handleFilterPart = (part: "part5" | "part6" | "part7") => {
    const source = allLoadedQuestions.length > 0 ? allLoadedQuestions : parsedQuestions;
    if (allLoadedQuestions.length === 0 && parsedQuestions.length > 0) {
      setAllLoadedQuestions(parsedQuestions);
    }

    const filtered = extractQuestionsForPart(source, part);

    if (filtered.length > 0) {
      setParsedQuestions(filtered);
      setCategory(part);

      const partVocabs = extractVocabsForQuestionSet(filtered, passageText);
      setCardVocabList(partVocabs);

      const startNum = part === "part5" ? 101 : part === "part6" ? 131 : 147;
      setSuccessMsg(
        `Đã lọc và giữ lại ${filtered.length} câu hỏi chuẩn của ${part.toUpperCase()} (Câu #${startNum} - #${startNum + filtered.length - 1}) cùng ${partVocabs.length} từ vựng! ✨`
      );
      setErrorMsg(null);
    } else {
      triggerError(`Không tìm thấy câu hỏi phù hợp cho ${part.toUpperCase()} trong dữ liệu vừa nạp!`);
    }
  };

  // Tính năng 1-Click: Tự động bóc tách & Lưu cả 3 Part (Part 5, Part 6, Part 7) vào kho
  const handleSaveAllThreeParts = () => {
    const source = allLoadedQuestions.length > 0 ? allLoadedQuestions : parsedQuestions;
    if (source.length === 0) {
      triggerError("Chưa có câu hỏi nào để phân tách!");
      return;
    }

    const p5Qs = extractQuestionsForPart(source, "part5");
    const p6Qs = extractQuestionsForPart(source, "part6");
    const p7Qs = extractQuestionsForPart(source, "part7");

    if (p5Qs.length === 0 && p6Qs.length === 0 && p7Qs.length === 0) {
      triggerError("Không thể phân tách câu hỏi theo 3 Part!");
      return;
    }

    const cleanBaseTitle = title
      .replace(/\s*-\s*Part\s*[567].*$/i, "")
      .replace(/\s*\(BẢN CHI TIẾT.*\)$/i, "")
      .replace(/\s*-\s*Full Reading.*$/i, "")
      .replace(/\s*full\s*reading\s*(?:\([^\)]*\))?/gi, "")
      .replace(/\s*\(\s*200\s*câu\s*\)/gi, "")
      .replace(/[\s\-_]+$/, "")
      .trim() || "ETS TOEIC";

    const cardsToSave: ExerciseCardData[] = [];

    // 1. Tạo Card Part 5
    if (p5Qs.length > 0) {
      const p5Title = `${cleanBaseTitle} - Part 5 (Câu 101 - 130)`;
      const dupP5 = existingCards.find(
        (c) => c.title.trim().toLowerCase() === p5Title.toLowerCase() && c.category === "part5"
      );
      const isOverwritingP5 = overwriteExisting && !!dupP5;
      const p5Vocabs = extractVocabsForQuestionSet(p5Qs);

      cardsToSave.push({
        id: isOverwritingP5 ? dupP5.id : `reading-import-${Date.now()}-part5`,
        title: p5Title,
        category: "part5",
        subCategory: "word_types",
        tag: tag.trim() || "Thương mại & Hợp đồng",
        status: importStatus,
        createdAt: isOverwritingP5 ? (dupP5.createdAt || new Date().toISOString()) : new Date().toISOString(),
        totalQuestions: p5Qs.length,
        studiedQuestions: isOverwritingP5 ? (dupP5.studiedQuestions || 0) : 0,
        correctAnswers: isOverwritingP5 ? (dupP5.correctAnswers || 0) : 0,
        wrongAnswers: isOverwritingP5 ? (dupP5.wrongAnswers || 0) : 0,
        vocabList: p5Vocabs.length > 0 ? p5Vocabs : undefined,
        theory: {
          summary: `Chuyên đề Part 5 gồm ${p5Qs.length} câu hoàn thành câu đơn (Incomplete Sentences) chuẩn cấu trúc TOEIC ETS.`,
          rules: [
            "Xác định từ loại xung quanh chỗ trống (danh từ, động từ, tính từ, trạng từ).",
            "Phân biệt câu hỏi ngữ pháp (nhìn dấu hiệu nhận biết) và câu hỏi từ vựng (cần dịch nghĩa).",
          ],
          example: p5Qs[0]?.question || "When she held her last meeting, Ms. Toba encouraged her sales staff.",
        },
        sampleQuestions: p5Qs,
      });
    }

    // 2. Tạo Card Part 6
    if (p6Qs.length > 0) {
      const p6Title = `${cleanBaseTitle} - Part 6 (Câu 131 - 146)`;
      const dupP6 = existingCards.find(
        (c) => c.title.trim().toLowerCase() === p6Title.toLowerCase() && c.category === "part6"
      );
      const isOverwritingP6 = overwriteExisting && !!dupP6;
      const p6Vocabs = extractVocabsForQuestionSet(p6Qs, passageText);

      cardsToSave.push({
        id: isOverwritingP6 ? dupP6.id : `reading-import-${Date.now()}-part6`,
        title: p6Title,
        category: "part6",
        subCategory: "text_types",
        tag: tag.trim() || "Thương mại & Doanh nghiệp",
        status: importStatus,
        createdAt: isOverwritingP6 ? (dupP6.createdAt || new Date().toISOString()) : new Date().toISOString(),
        totalQuestions: p6Qs.length,
        studiedQuestions: isOverwritingP6 ? (dupP6.studiedQuestions || 0) : 0,
        correctAnswers: isOverwritingP6 ? (dupP6.correctAnswers || 0) : 0,
        wrongAnswers: isOverwritingP6 ? (dupP6.wrongAnswers || 0) : 0,
        passageText: passageText.trim() || undefined,
        passageTextVi: passageTextVi.trim() || undefined,
        vocabList: p6Vocabs.length > 0 ? p6Vocabs : undefined,
        theory: {
          summary: `Chuyên đề Part 6 gồm ${p6Qs.length} câu điền đoạn văn (Text Completion) gồm 4 bài đọc ngắn.`,
          rules: [
            "Đọc ngữ cảnh toàn câu và câu đứng trước/sau để chọn liên từ hoặc điền câu phù hợp.",
            "Chú ý thì của động từ và tính nhất quán của văn phong trong đoạn.",
          ],
          example: p6Qs[0]?.question || "The company has announced plans to expand operations.",
        },
        sampleQuestions: p6Qs,
      });
    }

    // 3. Tạo Card Part 7
    if (p7Qs.length > 0) {
      const p7Title = `${cleanBaseTitle} - Part 7 (Câu 147 - 200)`;
      const dupP7 = existingCards.find(
        (c) => c.title.trim().toLowerCase() === p7Title.toLowerCase() && c.category === "part7"
      );
      const isOverwritingP7 = overwriteExisting && !!dupP7;
      const p7Vocabs = extractVocabsForQuestionSet(p7Qs, passageText);

      cardsToSave.push({
        id: isOverwritingP7 ? dupP7.id : `reading-import-${Date.now()}-part7`,
        title: p7Title,
        category: "part7",
        subCategory: "text_types",
        tag: tag.trim() || "Đọc hiểu văn bản",
        status: importStatus,
        createdAt: isOverwritingP7 ? (dupP7.createdAt || new Date().toISOString()) : new Date().toISOString(),
        totalQuestions: p7Qs.length,
        studiedQuestions: isOverwritingP7 ? (dupP7.studiedQuestions || 0) : 0,
        correctAnswers: isOverwritingP7 ? (dupP7.correctAnswers || 0) : 0,
        wrongAnswers: isOverwritingP7 ? (dupP7.wrongAnswers || 0) : 0,
        passageText: passageText.trim() || undefined,
        passageTextVi: passageTextVi.trim() || undefined,
        vocabList: p7Vocabs.length > 0 ? p7Vocabs : undefined,
        theory: {
          summary: `Chuyên đề Part 7 gồm ${p7Qs.length} câu đọc hiểu văn bản (Reading Comprehension) đơn và đa đoạn văn.`,
          rules: [
            "Đọc lướt (skimming) nắm chủ đề bài đọc và câu hỏi trước khi tìm chi tiết.",
            "Dò tìm từ khóa (scanning) và đối chiếu thông tin đối với bài đọc đôi/ba.",
          ],
          example: p7Qs[0]?.question || "What is indicated about the upcoming conference?",
        },
        sampleQuestions: p7Qs,
      });
    }

    onImportSuccess(cardsToSave);
    onClose();
  };


  // Xử lý khi người dùng đổi dropdown Phần thi (Part) để đảm bảo đồng bộ với câu hỏi
  const handleCategoryChange = (newCategory: "part5" | "part6" | "part7" | "grammar") => {
    if (newCategory === "grammar") {
      setCategory("grammar");
      setErrorMsg(null);
      return;
    }

    const source = allLoadedQuestions.length > 0 ? allLoadedQuestions : parsedQuestions;
    if (allLoadedQuestions.length === 0 && parsedQuestions.length > 0) {
      setAllLoadedQuestions(parsedQuestions);
    }

    const matchingQs = extractQuestionsForPart(source, newCategory);

    if (matchingQs.length > 0) {
      setParsedQuestions(matchingQs);
      setCategory(newCategory);

      const partVocabs = extractVocabsForQuestionSet(matchingQs, passageText);
      setCardVocabList(partVocabs);

      const startNum = newCategory === "part5" ? 101 : newCategory === "part6" ? 131 : 147;
      setSuccessMsg(
        `Đã tự động chuyển và hiển thị ${matchingQs.length} câu hỏi chuẩn của ${newCategory.toUpperCase()} (Câu #${startNum} - #${startNum + matchingQs.length - 1})! ✨`
      );
      setErrorMsg(null);
    } else {
      triggerError(
        `❌ Dữ liệu bài đọc hiện tại không có câu hỏi phù hợp cho ${newCategory.toUpperCase()}. Vui lòng chọn lại đúng phần thi!`
      );
    }
  };

  // Xóa toàn bộ câu hỏi Listening (1 - 100)
  const handleDeleteAllListening = () => {
    setParsedQuestions((prev) =>
      prev.filter((q) => {
        const n = parseInt(q.questionNum || "0", 10);
        return isNaN(n) || n > 100 || n < 1;
      })
    );
    setSuccessMsg("Đã xóa toàn bộ câu hỏi Listening (Câu 1 - 100)! ✨");
  };

  // Đánh lại số thứ tự tự động
  const handleRenumberQuestions = (startNum = 101) => {
    setParsedQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        questionNum: String(startNum + idx),
      }))
    );
    setSuccessMsg(`Đã đánh lại số thứ tự từ Câu ${startNum} đến Câu ${startNum + parsedQuestions.length - 1}! ✨`);
  };

  // Xóa câu hỏi đơn lẻ
  const handleDeleteQuestion = (originalIdx: number) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== originalIdx));
  };

  // Mở form sửa câu hỏi
  const handleOpenEditQuestion = (originalIdx: number) => {
    const targetQ = parsedQuestions[originalIdx];
    if (!targetQ) return;
    setEditingQuestionIndex(originalIdx);
    setIsAddingQuestion(false);
    setQuestionForm({
      ...targetQ,
      options: [...(targetQ.options || ["", "", "", ""])],
    });
  };

  // Mở form thêm câu hỏi mới
  const handleOpenAddQuestion = () => {
    setIsAddingQuestion(true);
    setEditingQuestionIndex(null);
    const lastQ = parsedQuestions[parsedQuestions.length - 1];
    const nextNum = lastQ ? String((parseInt(lastQ.questionNum || "100", 10) || 100) + 1) : "101";
    setQuestionForm({
      questionNum: nextNum,
      question: "",
      bilingual: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    });
  };

  // Lưu form sửa / thêm câu hỏi
  const handleSaveQuestionForm = () => {
    if (!questionForm.question.trim()) {
      setErrorMsg("Vui lòng nhập nội dung đề bài câu hỏi!");
      return;
    }
    if (isAddingQuestion) {
      setParsedQuestions((prev) => [...prev, questionForm]);
      setIsAddingQuestion(false);
      setSuccessMsg(`Đã thêm Câu ${questionForm.questionNum} vào danh sách! ✨`);
    } else if (editingQuestionIndex !== null) {
      setParsedQuestions((prev) =>
        prev.map((q, idx) => (idx === editingQuestionIndex ? questionForm : q))
      );
      setEditingQuestionIndex(null);
      setSuccessMsg(`Đã cập nhật Câu ${questionForm.questionNum}! ✨`);
    }
    setErrorMsg(null);
  };

  // Lọc câu hỏi hiển thị trong bảng xem trước
  const filteredParsedQuestions = useMemo(() => {
    return parsedQuestions
      .map((q, originalIndex) => ({ q, originalIndex }))
      .filter(({ q }) => {
        const num = parseInt(q.questionNum || "0", 10);
        if (previewPartFilter === "listening" && !(num >= 1 && num <= 100)) return false;
        if (previewPartFilter === "part5" && !(num >= 101 && num <= 130)) return false;
        if (previewPartFilter === "part6" && !(num >= 131 && num <= 146)) return false;
        if (previewPartFilter === "part7" && !(num >= 147 && num <= 200)) return false;

        if (previewSearch.trim()) {
          const term = previewSearch.trim().toLowerCase();
          const matchNum = q.questionNum?.toLowerCase().includes(term);
          const matchText = q.question.toLowerCase().includes(term);
          const matchOpts = q.options?.some((opt) => opt.toLowerCase().includes(term));
          const matchExp = q.explanation?.toLowerCase().includes(term);
          const matchBi = q.bilingual?.toLowerCase().includes(term);
          if (!matchNum && !matchText && !matchOpts && !matchExp && !matchBi) return false;
        }
        return true;
      });
  }, [parsedQuestions, previewPartFilter, previewSearch]);

  const playPreviewWord = (word: string) => {
    if (!word || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const handleApplyExtractedVocab = (entries: AppliedVocabEntry[]) => {
    if (entries.length === 0) return;
    const cardEntries = entries.filter((e) => e.targetQuestionIndex === null || parsedQuestions.length === 0);
    const qEntries = entries.filter((e) => e.targetQuestionIndex !== null && parsedQuestions.length > 0);

    if (cardEntries.length > 0) {
      setCardVocabList((prev) => {
        const seen = new Set(prev.map((v) => v.word.trim().toLowerCase()));
        const next = [...prev];
        cardEntries.forEach(({ item }) => {
          const k = item.word.trim().toLowerCase();
          if (k && !seen.has(k)) {
            seen.add(k);
            next.push(item);
          }
        });
        return next;
      });
    }

    if (qEntries.length > 0) {
      setParsedQuestions((prev) => {
        const copy = prev.map((q) => ({ ...q, vocabList: [...(q.vocabList || [])] }));
        qEntries.forEach(({ item, targetQuestionIndex }) => {
          const idx = Math.min(Math.max(0, targetQuestionIndex ?? 0), copy.length - 1);
          const seen = new Set((copy[idx].vocabList || []).map((v) => v.word.trim().toLowerCase()));
          const k = item.word.trim().toLowerCase();
          if (k && !seen.has(k)) {
            copy[idx].vocabList = [...(copy[idx].vocabList || []), item];
          }
        });
        return copy;
      });
    }
  };

  const handleRemoveCardVocab = (idx: number) => {
    setCardVocabList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveQuestionVocab = (qIdx: number, vIdx: number) => {
    setParsedQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIdx ? { ...q, vocabList: (q.vocabList || []).filter((_, i) => i !== vIdx) } : q
      )
    );
  };

  if (!isOpen) return null;

  // Mẫu template có sẵn để admin click test ngay
  const SAMPLE_PART5 = `[Tiêu đề] ETS 2024 Test 5 - Part 5 Cấu trúc Từ loại
[Phần thi] Part 5
[Thẻ] Từ loại & Ngữ pháp trọng tâm

101. When she held her last meeting, Ms. Toba ------- her sales staff to perform even better next quarter.
(A) encourage
(B) is encouraging
(C) encouraged
(D) was encouraged
Đáp án: C
Dịch: Khi cô ấy tổ chức cuộc họp trước, bà Toba đã khuyến khích đội ngũ bán hàng của mình làm việc tốt hơn nữa trong quý tới.
Giải thích: Cần động từ chia ở thì quá khứ đơn vì mệnh đề trước có "held" (quá khứ của hold) và diễn tả một sự việc đã xảy ra trong quá khứ.
Từ vựng: encourage (v): khuyến khích, quarterly (adv): hàng quý, staff (n): đội ngũ nhân viên

102. All visitors are required to show photo identification ------- entering the research laboratory.
(A) before
(B) while
(C) during
(D) until
Đáp án: A
Dịch: Tất cả khách tham quan được yêu cầu xuất trình giấy tờ tùy thân có ảnh trước khi vào phòng thí nghiệm nghiên cứu.
Giải thích: "Before + V-ing" diễn tả hành động xảy ra trước một hành động khác. "During" chỉ đi với danh từ, không đi với V-ing.
Từ vựng: laboratory (n): phòng thí nghiệm, identification (n): giấy tờ tùy thân

103. The marketing team proposed an ------- strategy that significantly boosted our online customer retention rate.
(A) innovate
(B) innovative
(C) innovation
(D) innovatively
Đáp án: B
Dịch: Nhóm tiếp thị đã đề xuất một chiến lược đổi mới giúp nâng cao đáng kể tỷ lệ giữ chân khách hàng trực tuyến của chúng tôi.
Giải thích: Cần tính từ đứng trước danh từ "strategy" để bổ nghĩa. "Innovative" (adj) mang nghĩa đổi mới, sáng tạo.
Từ vựng: innovative (adj): có tính sáng tạo, retention (n): sự giữ chân duy trì`;

  const SAMPLE_PART6 = `[Tiêu đề] ETS TOEIC Reading - Part 6 (Điền đoạn 131 - 134)
[Phần thi] Part 6
[Thẻ] Thông báo bảo trì & Quản lý tòa nhà

[Đoạn văn]
To: All Residents <residents@parkview.com>
From: Building Management
Date: March 15
Subject: Scheduled Plumbing Maintenance

Please be advised that our maintenance team will conduct routine inspections of the water heating system on Thursday, March 18. Work will begin promptly at 9:00 A.M. and is expected to finish by 3:00 P.M.

During this period, water service will be temporarily [131]------ throughout the building. We recommend storing sufficient water for your morning needs. In addition, technicians [132]------ access to utility closets located on each floor. [133]------. We apologize for any inconvenience this essential maintenance work may cause. Please contact the front desk if you have any urgent [134]------.

[Bản dịch đoạn văn]
Gửi: Toàn thể cư dân <residents@parkview.com>
Từ: Ban quản lý tòa nhà
Ngày: 15 tháng 3
Tiêu đề: Bảo trì hệ thống ống nước theo lịch

Xin lưu ý rằng đội bảo trì của chúng tôi sẽ tiến hành kiểm tra định kỳ hệ thống đun nước nóng vào thứ Năm, ngày 18 tháng 3. Công việc sẽ bắt đầu đúng 9:00 sáng và dự kiến hoàn tất trước 3:00 chiều.

Trong thời gian này, dịch vụ cấp nước sẽ tạm thời bị [131] gián đoạn trên toàn bộ tòa nhà. Chúng tôi khuyến nghị quý cư dân dự trữ đủ nước cho nhu cầu buổi sáng. Ngoài ra, kỹ thuật viên sẽ [132] yêu cầu quyền tiếp cận các tủ kỹ thuật ở mỗi tầng. [133] Chúng tôi rất tiếc vì sự bất tiện mà công việc bảo trì thiết yếu này có thể gây ra. Vui lòng liên hệ quầy lễ tân nếu bạn có bất kỳ [134] thắc mắc khẩn cấp nào.

131. [131]
(A) suspended
(B) suspends
(C) suspending
(D) suspense
Đáp án: A
Dịch: Trong thời gian này, dịch vụ cấp nước sẽ tạm thời bị gián đoạn trên toàn bộ tòa nhà.
Giải thích: Cần quá khứ phân từ (V3/ed) sau "will be temporarily" để tạo thành thể bị động "will be + V3" (sẽ bị tạm ngưng/gián đoạn).
Từ vựng: suspend (v): tạm ngưng đình chỉ, temporarily (adv): tạm thời

132. [132]
(A) will require
(B) require
(C) required
(D) has required
Đáp án: A
Dịch: Ngoài ra, các kỹ thuật viên sẽ yêu cầu quyền tiếp cận các tủ kỹ thuật ở mỗi tầng.
Giải thích: Hành động kiểm tra bảo trì sẽ diễn ra vào thứ Năm tới (tương lai), do đó động từ chính cần chia ở thì tương lai đơn "will require".
Từ vựng: require (v): yêu cầu đòi hỏi, utility (n): tiện ích kỹ thuật

133. [133]
(A) Water bottles are available at the lobby desk.
(B) Please keep hallway areas clear of personal items during these hours.
(C) The swimming pool will remain open all day.
(D) Payment for maintenance must be submitted online.
Đáp án: B
Dịch: Vui lòng giữ cho khu vực hành lang thông thoáng, không để đồ đạc cá nhân trong những giờ này.
Giải thích: Câu điền vào cần liên kết logic với việc kỹ thuật viên cần tiếp cận các tủ kỹ thuật đặt ở hành lang mỗi tầng. Phương án (B) là phù hợp nhất.
Từ vựng: hallway (n): hành lang lối đi, personal (adj): cá nhân

134. [134]
(A) inquiries
(B) deliveries
(C) agreements
(D) complaints
Đáp án: A
Dịch: Vui lòng liên hệ quầy lễ tân nếu bạn có bất kỳ thắc mắc khẩn cấp nào.
Giải thích: Cụm từ "urgent inquiries" mang nghĩa "các thắc mắc/câu hỏi khẩn cấp", hoàn toàn phù hợp với ngữ cảnh liên hệ quầy lễ tân khi cần hỗ trợ.
Từ vựng: inquiry (n): câu hỏi thắc mắc, urgent (adj): khẩn cấp`;

  const SAMPLE_PART7 = `[Tiêu đề] ETS 2024 Test 5 - Part 7 Double Passage
[Phần thi] Part 7
[Thẻ] Email & Thông báo nội bộ

[Đoạn văn]
From: Elena Rostova <e.rostova@nexusgroup.com>
To: All Department Heads
Date: October 14, 2024
Subject: Office Relocation Schedule and Preparation Guidelines

Dear Colleagues,
As discussed during last month's board meeting, Nexus Group will officially relocate its regional headquarters to the newly completed Apex Tower on November 15. The new facility offers modern ergonomic workstations, collaborative meeting pods, and energy-efficient environmental systems.

To ensure minimal disruption to our daily operations, the transition will be conducted in three distinct phases over two consecutive weekends.

Phase 1 (Nov 8-9): IT infrastructure, server migrations, and financial accounting archives.
Phase 2 (Nov 15-16): Marketing, Human Resources, and Executive suites.
Phase 3 (Nov 22-23): Customer Support teams and central warehouse logistics.

Please distribute color-coded labeling stickers to your team members by this Friday. All personal desktop items and sensitive project binders must be sealed in the provided reusable plastic crates by 5:00 PM on the day preceding your scheduled move phase.

Sincerely,
Elena Rostova
Director of Corporate Facilities

[Bản dịch đoạn văn]
Từ: Elena Rostova <e.rostova@nexusgroup.com>
Đến: Toàn thể Trưởng phòng ban
Ngày: 14 tháng 10 năm 2024
Tiêu đề: Lịch trình di dời văn phòng và hướng dẫn chuẩn bị

Thưa các đồng nghiệp,
Như đã thảo luận trong cuộc họp hội đồng quản trị tháng trước, Tập đoàn Nexus sẽ chính thức chuyển trụ sở chính khu vực sang tòa tháp Apex Tower mới hoàn thành vào ngày 15 tháng 11. Cơ sở mới trang bị các bàn làm việc công thái học hiện đại, các khoang họp cộng tác và hệ thống môi trường tiết kiệm năng lượng.

Để đảm bảo hạn chế tối đa sự gián đoạn đối với hoạt động hàng ngày, quá trình chuyển đổi sẽ được tiến hành theo ba giai đoạn riêng biệt trong hai ngày cuối tuần liên tiếp.

Giai đoạn 1 (8-9/11): Cơ sở hạ tầng CNTT, chuyển đổi máy chủ và lưu trữ hồ sơ tài chính kế toán.
Giai đoạn 2 (15-16/11): Bộ phận Tiếp thị, Nhân sự và Ban điều hành.
Giai đoạn 3 (22-23/11): Đội ngũ Chăm sóc khách hàng và hậu cần kho trung tâm.

Vui lòng phân phát nhãn dán mã màu cho các thành viên trong nhóm trước thứ Sáu tuần này. Toàn bộ đồ dùng cá nhân để bàn và sổ theo dõi dự án nhạy cảm phải được niêm phong trong thùng nhựa tái sử dụng được cấp trước 17:00 ngày liền kề trước ngày dọn của phòng ban mình.

Trân trọng,
Elena Rostova
Giám đốc Cơ sở vật chất doanh nghiệp

147. What is the primary purpose of the email?
(A) To announce new executive promotions
(B) To outline the schedule for moving offices
(C) To request budget approvals for furniture
(D) To evaluate employee remote work performance
Đáp án: B
Dịch: Mục đích chính của bức thư điện tử là gì?
Giải thích: Bức thư nêu rõ lịch trình và hướng dẫn chi tiết cho việc di dời trụ sở văn phòng Nexus Group sang Apex Tower.
Từ vựng: relocation (n): sự di dời chuyển địa điểm, disruption (n): sự gián đoạn, ergonomic (adj): công thái học

148. According to the email, when will the Human Resources department move?
(A) On October 14
(B) On November 8-9
(C) On November 15-16
(D) On November 22-23
Đáp án: C
Dịch: Theo bức thư, phòng Nhân sự sẽ chuyển đi khi nào?
Giải thích: Thư ghi rõ: "Phase 2 (Nov 15-16): Marketing, Human Resources, and Executive suites."
Từ vựng: consecutive (adj): liên tiếp, infrastructure (n): cơ sở hạ tầng`;

  // Parser phân tích văn bản thô
  const handleParseText = (textToParse: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const text = textToParse.trim();
    if (!text) {
      setErrorMsg("Vui lòng dán văn bản đề thi vào ô bên dưới!");
      return;
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim());
    let extTitle = "";
    let extTag = "";
    let extPassage = "";
    let extPassageVi = "";

    const questions: SampleQuestion[] = [];
    let currentQ: SampleQuestion | null = null;
    let currentVocabs: VocabItem[] = [];
    const globalVocabs: VocabItem[] = [];
    let totalVocabCount = 0;

    let readingMode: "none" | "passage" | "passageVi" | "question" = "none";

    const commitCurrentQ = () => {
      if (currentQ && currentQ.question) {
        if (currentVocabs.length > 0) {
          currentQ.vocabList = [...currentVocabs];
          totalVocabCount += currentVocabs.length;
          currentVocabs = [];
        }
        questions.push(currentQ);
        currentQ = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const lower = line.toLowerCase();

      // Metadata headers
      if (lower.startsWith("[tiêu đề]") || lower.startsWith("[title]")) {
        extTitle = line.replace(/^\[(?:tiêu đề|title)\]/i, "").trim();
        continue;
      }
      if (lower.startsWith("[phần thi]") || lower.startsWith("[part]")) {
        const val = line.replace(/^\[(?:phần thi|part)\]/i, "").trim().toLowerCase();
        if (val.includes("5")) setCategory("part5");
        else if (val.includes("6")) setCategory("part6");
        else if (val.includes("7")) setCategory("part7");
        else if (val.includes("ngữ pháp") || val.includes("grammar")) setCategory("grammar");
        continue;
      }
      if (lower.startsWith("[thẻ]") || lower.startsWith("[tag]")) {
        extTag = line.replace(/^\[(?:thẻ|tag)\]/i, "").trim();
        continue;
      }

      // Passage blocks
      if (lower.startsWith("[đoạn văn]") || lower.startsWith("[passage]") || lower === "passage:") {
        readingMode = "passage";
        continue;
      }
      if (
        lower.startsWith("[bản dịch đoạn văn]") ||
        lower.startsWith("[bản dịch]") ||
        lower.startsWith("[passage vi]") ||
        lower === "bản dịch:"
      ) {
        readingMode = "passageVi";
        continue;
      }

      // Detect Question Start: e.g. "101.", "Câu 101:", "101)"
      const qMatch = line.match(/^(?:câu\s*|question\s*)?(\d{1,3})[\.\:\)\s]+(.+)/i);
      if (qMatch) {
        commitCurrentQ();
        readingMode = "question";
        currentQ = {
          questionNum: qMatch[1],
          question: qMatch[2].trim(),
          options: ["", "", "", ""],
          optionMeanings: ["", "", "", ""],
          correctIndex: 0,
          explanation: "",
        };
        continue;
      }

      // Inside Question Mode
      if (currentQ) {
        // Detect Options: (A), (B), (C), (D) or A., B., C., D.
        const optMatch = line.match(/^\(?([A-Da-d])[\.\)\:\s]+(.+)/);
        if (optMatch) {
          const letter = optMatch[1].toUpperCase();
          const optContent = optMatch[2].trim();
          const optIdx = letter.charCodeAt(0) - 65;
          if (optIdx >= 0 && optIdx <= 3) {
            currentQ.options = currentQ.options || ["", "", "", ""];
            currentQ.options[optIdx] = optContent;
            continue;
          }
        }

        // Inline multiple options: (A) ... (B) ... (C) ... (D) ...
        const inlineOpts = line.match(/\(?([A-Da-d])[\.\)]\s*([^\(]+)/g);
        if (inlineOpts && inlineOpts.length >= 2) {
          currentQ.options = currentQ.options || ["", "", "", ""];
          inlineOpts.forEach((seg) => {
            const m = seg.match(/\(?([A-Da-d])[\.\)]\s*(.+)/);
            if (m) {
              const idx = m[1].toUpperCase().charCodeAt(0) - 65;
              if (idx >= 0 && idx <= 3) currentQ!.options![idx] = m[2].trim();
            }
          });
          continue;
        }

        // Correct Answer Key
        const ansMatch = line.match(/^(?:đáp án|answer|key|chọn)[\:\s]+(?:\()?([A-Da-d])(?:\))?/i);
        if (ansMatch) {
          const ansLetter = ansMatch[1].toUpperCase();
          currentQ.correctIndex = ansLetter.charCodeAt(0) - 65;
          continue;
        }

        // Explanation
        const expMatch = line.match(/^(?:giải thích|lời giải|explanation|hướng dẫn giải)[\:\s]+(.+)/i);
        if (expMatch) {
          currentQ.explanation = expMatch[1].trim();
          continue;
        }

        // Translation
        const viMatch = line.match(/^(?:dịch|bản dịch|translation|dịch câu)[\:\s]+(.+)/i);
        if (viMatch) {
          currentQ.bilingual = viMatch[1].trim();
          continue;
        }

        // Vocabulary inline
        const vocabMatch = line.match(/^(?:từ vựng|vocab|vocabulary)\s*\:?\s*(.*)$/i);
        if (vocabMatch && (lower.startsWith("từ vựng:") || lower.startsWith("vocab:") || lower.startsWith("vocabulary:"))) {
          const payload = vocabMatch[1].trim();
          if (payload) {
            currentVocabs.push(...parseBulkVocabList(payload));
          }
          continue;
        }
      }

      // Vocabulary bullet lines (outside passage sections)
      if (readingMode !== "passage" && readingMode !== "passageVi" && (line.startsWith("-") || line.startsWith("•"))) {
        const parsedItem = parseBulkVocabToken(line);
        if (parsedItem) {
          if (currentQ) currentVocabs.push(parsedItem);
          else {
            globalVocabs.push(parsedItem);
            totalVocabCount++;
          }
          continue;
        }
      }
      if (lower === "[từ vựng]" || lower === "từ vựng:" || lower === "[vocabulary]") {
        readingMode = "none";
        continue;
      }

      // Appending to passage
      if (readingMode === "passage") {
        extPassage += (extPassage ? "\n" : "") + line;
      } else if (readingMode === "passageVi") {
        extPassageVi += (extPassageVi ? "\n" : "") + line;
      }
    }

    commitCurrentQ();

    if (extTitle) setTitle(extTitle);
    if (extTag) setTag(extTag);
    if (extPassage) setPassageText(extPassage.trim());
    if (extPassageVi) setPassageTextVi(extPassageVi.trim());

    if (questions.length === 0) {
      setErrorMsg("Không tìm thấy câu hỏi hợp lệ trong văn bản. Vui lòng kiểm tra định dạng câu hỏi (Ví dụ: 101. ... (A) ... (B) ...)");
      return;
    }

    let initialVocabs = globalVocabs;
    if (initialVocabs.length === 0) {
      const seen = new Set<string>();
      questions.forEach((q) => {
        (q.vocabList || []).forEach((v) => {
          const k = v.word.trim().toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            initialVocabs.push(v);
          }
        });
      });
    }
    if (initialVocabs.length === 0 && questions.length > 0) {
      initialVocabs = autoExtractVocabListForReading({
        passageText: extPassage.trim() || undefined,
        questions,
        maxCandidates: 40,
      });
    }

    setCardVocabList(initialVocabs);
    setAllLoadedQuestions(questions);
    setParsedQuestions(questions);

    const effectiveVocabCount = Math.max(totalVocabCount, initialVocabs.length);
    const hasExtPassage = !!extPassage || !!passageText.trim();
    if ((category === "part6" || category === "part7") && !hasExtPassage) {
      setErrorMsg(`⚠️ Cảnh báo sai định dạng: Bạn đang chọn chuyên đề ${category.toUpperCase()}, nhưng nội dung dán vào không có Đoạn văn/Bài đọc (Passage). Bài đọc ${category.toUpperCase()} bắt buộc phải có đoạn văn/bài đọc đi kèm!`);
    } else {
      setSuccessMsg(`Bóc tách thành công ${questions.length} câu hỏi và ${effectiveVocabCount} từ vựng! ✨`);
    }
  };

  // Import từ file (XLSX / CSV / JSON / TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploadingFile(true);

    try {
      if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
        const parsedCard = await parseAdminReadingFile(file);
        setTitle(parsedCard.title);
        setCategory(parsedCard.category);
        if (parsedCard.tag) setTag(parsedCard.tag);
        setPassageText(parsedCard.passageText || "");
        setPassageTextVi(parsedCard.passageTextVi || "");
        setCardVocabList(parsedCard.vocabList || []);
        const loadedQs = parsedCard.sampleQuestions || [];
        setAllLoadedQuestions(loadedQs);
        setParsedQuestions(loadedQs);
        setSuccessMsg(`Đã nạp file Excel "${file.name}" gồm ${loadedQs.length} câu hỏi! ✨`);
        return;
      }

      const content = await file.text();
      if (!content.trim()) {
        setErrorMsg("File tải lên không có nội dung.");
        return;
      }

      if (lowerName.endsWith(".json")) {
        try {
          const rawJson = JSON.parse(content);
          const root = Array.isArray(rawJson?.items) ? rawJson.items[0] : rawJson;

          let cardTitle = "";
          let cardCategory: "part5" | "part6" | "part7" | "grammar" = "part5";
          let cardTag = "";
          let cardPassage = "";
          let cardPassageVi = "";
          let cardVocabs: VocabItem[] = [];
          let rawQs: any[] = [];

          if (Array.isArray(root)) {
            const firstObj = root[0] as Record<string, unknown> | undefined;
            if (firstObj && (Array.isArray(firstObj.sampleQuestions) || Array.isArray(firstObj.questions))) {
              const cardObj = firstObj as Record<string, unknown>;
              cardTitle = String(cardObj.title || file.name);
              if (cardObj.category) cardCategory = cardObj.category as any;
              if (cardObj.tag) cardTag = String(cardObj.tag);
              cardPassage = String(cardObj.passageText || cardObj.content || "");
              cardPassageVi = String(cardObj.passageTextVi || "");
              if (Array.isArray(cardObj.vocabList)) cardVocabs = cardObj.vocabList as any[];
              else if (Array.isArray(cardObj.vocabulary)) cardVocabs = cardObj.vocabulary as any[];
              rawQs = (cardObj.sampleQuestions || cardObj.questions) as any[];
            } else {
              rawQs = root;
            }
          } else if (root && typeof root === "object") {
            const cardObj = root as Record<string, unknown>;
            cardTitle = String(cardObj.title || file.name);
            if (cardObj.category) cardCategory = cardObj.category as any;
            if (cardObj.tag) cardTag = String(cardObj.tag);
            cardPassage = String(cardObj.passageText || cardObj.content || "");
            cardPassageVi = String(cardObj.passageTextVi || "");
            if (Array.isArray(cardObj.vocabList)) {
              cardVocabs = cardObj.vocabList as any[];
            } else if (Array.isArray(cardObj.vocabulary)) {
              cardVocabs = cardObj.vocabulary as any[];
            }

            if (cardObj.reading && typeof cardObj.reading === "object") {
              const r = cardObj.reading as Record<string, any>;
              const p5 = Array.isArray(r.part5) ? r.part5 : [];
              const p6 = Array.isArray(r.part6) ? r.part6 : [];
              const p7 = Array.isArray(r.part7) ? r.part7 : [];
              rawQs = [...p5, ...p6, ...p7];
            } else if (Array.isArray(cardObj.sampleQuestions)) {
              rawQs = cardObj.sampleQuestions as any[];
            } else if (Array.isArray(cardObj.questions)) {
              const allQs = cardObj.questions as any[];
              const readingOnly = allQs.filter((q) => {
                const num = Number(q.questionNumber || q.questionNum || q.id);
                const partStr = String(q.part || "").toLowerCase();
                if (partStr.includes("part 1") || partStr.includes("part 2") || partStr.includes("part 3") || partStr.includes("part 4")) {
                  return false;
                }
                return isNaN(num) || num >= 101;
              });
              rawQs = readingOnly.length > 0 ? readingOnly : allQs;
            }
          }

          const cleanInitialTitle = normalizeReadingCardTitle(cardTitle, cardCategory, rawQs.length);
          if (cleanInitialTitle) setTitle(cleanInitialTitle);
          if (cardCategory) setCategory(cardCategory);
          if (cardTag) setTag(cardTag);
          if (cardPassage) setPassageText(cardPassage);
          if (cardPassageVi) setPassageTextVi(cardPassageVi);
          const mappedQs: SampleQuestion[] = rawQs.map((q, idx) =>
            normalizeSampleQuestion(q, idx, cardPassage, cardPassageVi)
          );

          // Xử lý từ vựng cấp bài đọc:
          // 1. Dùng cardVocabs nếu file có sẵn
          // 2. Nếu file không có từ vựng ở cấp bài, tổng hợp từ tất cả câu hỏi mappedQs
          // 3. Nếu vẫn không có, tự động bóc tách 40 từ vựng cốt lõi TOEIC
          let finalCardVocabs: VocabItem[] = [];
          if (cardVocabs.length > 0) {
            finalCardVocabs = cardVocabs.map(normalizeVocabItem).filter(Boolean) as VocabItem[];
          }

          if (finalCardVocabs.length === 0) {
            const seen = new Set<string>();
            mappedQs.forEach((q) => {
              (q.vocabList || []).forEach((v) => {
                const k = v.word.trim().toLowerCase();
                if (!seen.has(k)) {
                  seen.add(k);
                  finalCardVocabs.push(v);
                }
              });
            });
          }

          if (finalCardVocabs.length === 0 && mappedQs.length > 0) {
            finalCardVocabs = autoExtractVocabListForReading({
              passageText: cardPassage,
              questions: mappedQs,
              maxCandidates: 40,
            });
          }

          setCardVocabList(finalCardVocabs);
          setAllLoadedQuestions(mappedQs);
          setParsedQuestions(mappedQs);
          setSuccessMsg(`Đã nạp chuyên đề "${cardTitle || file.name}" với ${mappedQs.length} câu hỏi và ${finalCardVocabs.length} từ vựng trọng tâm! 🎉`);
        } catch {
          setErrorMsg("File JSON không hợp lệ hoặc sai cấu trúc!");
        }
        return;
      }

      if (lowerName.endsWith(".csv")) {
        const csvRows = parseCsvRows(content);
        if (csvRows.length >= 2) {
          const headers = csvRows[0].map(normalizeCsvHeader);
          const colIdx = (aliases: string[]) => {
            const exact = headers.findIndex((h) => aliases.some((a) => h === a));
            return exact !== -1 ? exact : headers.findIndex((h) => aliases.some((a) => a.length >= 4 && h.includes(a)));
          };
          const idxQText = colIdx(["debaitienganh", "questiontext", "question", "debai"]);
          if (idxQText >= 0) {
            const idxNum = colIdx(["causo", "questionnum", "stt", "no"]);
            const idxVi = colIdx(["bandichtiengviet", "bilingual", "translation", "dichcau", "dich"]);
            const idxA = colIdx(["dapana", "optiona", "a"]);
            const idxB = colIdx(["dapanb", "optionb", "b"]);
            const idxC = colIdx(["dapanc", "optionc", "c"]);
            const idxD = colIdx(["dapand", "optiond", "d"]);
            const idxAns = colIdx(["dapandung", "correctanswer", "answer", "key"]);
            const idxExp = colIdx(["giaithichchitiet", "giaithich", "explanation", "loigiai"]);
            const idxVocab = colIdx(["tuvung", "vocab", "vocabulary"]);
            const idxPassage = colIdx(["doanvan", "passagetext", "passage", "content"]);
            const idxPassageVi = colIdx(["bandichdoanvan", "passagetextvi"]);

            const csvQuestions: SampleQuestion[] = [];
            let csvPassage = "";
            let csvPassageVi = "";
            csvRows.slice(1).forEach((cells, rIdx) => {
              const qText = cells[idxQText] || "";
              if (!qText) return;
              if (idxPassage >= 0 && !csvPassage && cells[idxPassage]?.trim()) csvPassage = cells[idxPassage].trim();
              if (idxPassageVi >= 0 && !csvPassageVi && cells[idxPassageVi]?.trim()) csvPassageVi = cells[idxPassageVi].trim();
              const ansChar = (idxAns >= 0 ? cells[idxAns] || "A" : "A").trim().toUpperCase().slice(0, 1);
              const ansIdx = Math.max(0, ["A", "B", "C", "D"].indexOf(ansChar));
              const vocabRaw = idxVocab >= 0 ? cells[idxVocab] || "" : "";
              csvQuestions.push({
                questionNum: (idxNum >= 0 && cells[idxNum]) || String(101 + rIdx),
                question: qText,
                bilingual: idxVi >= 0 ? cells[idxVi] || "" : "",
                options: [
                  idxA >= 0 ? cells[idxA] || "" : "",
                  idxB >= 0 ? cells[idxB] || "" : "",
                  idxC >= 0 ? cells[idxC] || "" : "",
                  idxD >= 0 ? cells[idxD] || "" : "",
                ],
                correctIndex: ansIdx,
                explanation: idxExp >= 0 ? cells[idxExp] || "" : "",
                vocabList: vocabRaw ? parseBulkVocabList(vocabRaw) : [],
              });
            });

            if (csvQuestions.length > 0) {
              if (csvPassage) setPassageText(csvPassage);
              if (csvPassageVi) setPassageTextVi(csvPassageVi);
              setCardVocabList([]);
              setAllLoadedQuestions(csvQuestions);
              setParsedQuestions(csvQuestions);
              setSuccessMsg(`Đã nạp ${csvQuestions.length} câu hỏi từ file CSV "${file.name}"! 🎉`);
              return;
            }
          }
        }
      }

      setRawText(content);
      handleParseText(content);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể đọc file vừa chọn!");
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  // Tải file mẫu CSV
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "Câu số,Đề bài tiếng Anh,Bản dịch tiếng Việt,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng (A/B/C/D),Giải thích chi tiết,Từ vựng\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau_nhap_de_thi_toeic_reading.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Lưu chuyên đề vào kho
  const handleSaveToBank = () => {
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tên bài đọc hoặc chuyên đề.");
      return;
    }

    if (parsedQuestions.length === 0) {
      triggerError("Chưa có câu hỏi nào được bóc tách! Vui lòng bấm 'Phân tích nội dung bài đọc' trước.");
      return;
    }

    // Nếu bộ câu hỏi gồm nhiều part (hoặc > 54 câu): Tự động tách và lưu cả 3 Part riêng biệt!
    const hasPart5 = parsedQuestions.some((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 101 && n <= 130;
    });
    const hasPart6Or7 = parsedQuestions.some((q) => {
      const n = parseInt(q.questionNum || "0", 10);
      return !isNaN(n) && n >= 131;
    });

    if (parsedQuestions.length > 54 || (hasPart5 && hasPart6Or7)) {
      handleSaveAllThreeParts();
      return;
    }

    const hasAnyPassage = !!passageText.trim() || parsedQuestions.some((q) => !!q.passageText?.trim());

    // 1. Kiểm tra định dạng nếu chọn Part 5:
    if (category === "part5") {
      // a) Không được chứa đoạn văn bài đọc
      if (hasAnyPassage) {
        triggerError("❌ Sai định dạng: Part 5 là phần thi câu đơn độc lập (Incomplete Sentences), không chứa đoạn văn bài đọc. Vui lòng chuyển Phần thi sang Part 6 hoặc Part 7!");
        return;
      }

      // b) Không được chứa câu hỏi thuộc dải Part 6 (131 - 146) hoặc Part 7 (147 - 200)
      const hasPart6Or7Nums = parsedQuestions.some((q) => {
        const n = parseInt(q.questionNum || "0", 10);
        return !isNaN(n) && n >= 131;
      });
      const hasPart6Blanks = parsedQuestions.some((q) => /\[1[3-4]\d\]/.test(q.question));

      if (hasPart6Or7Nums || hasPart6Blanks) {
        triggerError(
          `❌ Sai cấu trúc TOEIC: Danh sách hiện tại gồm các câu hỏi thuộc Part 6/Part 7 (Câu #131 - #200). Bạn không thể lưu câu hỏi Part 6 vào Part 5 (Câu đơn)! Vui lòng bấm '⚡ Tự động tách & Lưu cả 3 Part' hoặc 'Lấy Part 5 (101-130)' ngay bên dưới.`
        );
        return;
      }

      // c) Cảnh báo nếu Part 5 có hơn 30 câu
      if (parsedQuestions.length > 30) {
        triggerError(
          `❌ Sai cấu trúc TOEIC: Part 5 chuẩn ETS chỉ gồm tối đa 30 câu điền câu đơn (101 - 130). Danh sách hiện tại đang có ${parsedQuestions.length} câu. Vui lòng bấm '⚡ Tự động tách & Lưu cả 3 Part' hoặc 'Chỉ lấy Part 5 (30 câu)' ngay bên dưới để lưu!`
        );
        return;
      }
    }

    // 2. Kiểm tra định dạng nếu chọn Part 6 hoặc Part 7:
    if (category === "part6" || category === "part7") {
      if (!hasAnyPassage) {
        const partLabel = category === "part6" ? "Part 6 (Điền đoạn văn)" : "Part 7 (Đọc hiểu văn bản)";
        triggerError(`❌ Sai định dạng: Bài đọc ${partLabel} bắt buộc phải có Đoạn văn/Bài đọc (Passage). Bạn không thể nhập các câu đơn của Part 5 vào ${partLabel}!`);
        return;
      }

      // Nếu là Part 6 mà toàn bộ câu hỏi lại là câu 101-130 (Part 5)
      if (category === "part6") {
        const isPart5Questions = parsedQuestions.every((q) => {
          const n = parseInt(q.questionNum || "0", 10);
          return !isNaN(n) && n >= 101 && n <= 130;
        });
        if (isPart5Questions && parsedQuestions.length > 0) {
          triggerError(
            "❌ Sai phần thi: Đây là các câu hỏi thuộc dải Part 5 (Câu 101 - 130). Vui lòng chọn Phần thi là Part 5 hoặc bấm nút 'Lấy Part 6 (131-146)'!"
          );
          return;
        }
      }
    }

    let finalVocabs = [...cardVocabList];
    if (finalVocabs.length === 0) {
      const seen = new Set<string>();
      parsedQuestions.forEach((q) => {
        (q.vocabList || []).forEach((v) => {
          const k = v.word.trim().toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            finalVocabs.push(v);
          }
        });
      });
      if (finalVocabs.length === 0 && parsedQuestions.length > 0) {
        finalVocabs = autoExtractVocabListForReading({
          passageText: passageText.trim() || undefined,
          questions: parsedQuestions,
          maxCandidates: 40,
        });
      }
    }

    const isOverwriting = overwriteExisting && !!existingDuplicate;
    const finalId = isOverwriting
      ? existingDuplicate.id
      : `reading-import-${Date.now().toString().slice(-6)}`;

    const rawTitle = (existingDuplicate && !overwriteExisting)
      ? `${title.trim()} (Bản sao ${Date.now().toString().slice(-4)})`
      : title.trim() || `Chuyên đề Reading TOEIC ${parsedQuestions.length} câu`;
    const finalTitle = normalizeReadingCardTitle(rawTitle, category, parsedQuestions.length);

    const finalCard: ExerciseCardData = {
      id: finalId,
      title: finalTitle,
      category,
      subCategory,
      tag: tag.trim() || "Chuyên đề tổng hợp",
      status: importStatus,
      createdAt: isOverwriting
        ? (existingDuplicate?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      totalQuestions: parsedQuestions.length,
      studiedQuestions: isOverwriting ? (existingDuplicate.studiedQuestions || 0) : 0,
      correctAnswers: isOverwriting ? (existingDuplicate.correctAnswers || 0) : 0,
      wrongAnswers: isOverwriting ? (existingDuplicate.wrongAnswers || 0) : 0,
      passageText: passageText.trim() || undefined,
      passageTextVi: passageTextVi.trim() || undefined,
      vocabList: finalVocabs.length > 0 ? finalVocabs : undefined,
      theory: {
        summary: `Chuyên đề ${category.toUpperCase()} gồm ${parsedQuestions.length} câu hỏi chọn lọc có đáp án và giải thích chi tiết.`,
        rules: ["Nắm chắc dấu hiệu nhận biết ngữ pháp và từ vựng trọng tâm.", "Đọc kỹ đề và loại trừ phương án sai."],
        example: parsedQuestions[0]?.question || "Example sentence for reading practice.",
      },
      sampleQuestions: parsedQuestions,
    };

    onImportSuccess(finalCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized
            ? "fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none z-50"
            : "w-full max-w-7xl max-h-[96vh] rounded-3xl"
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Import Bài Đọc &amp; Quản Lý Câu Hỏi Reading
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  TOEIC Reading
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bóc tách bài đọc &amp; câu hỏi thông minh, tự động phân loại Part 5, 6, 7 và xem trước trực quan trước khi lưu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              title={isMaximized ? "Thu nhỏ cửa sổ" : "Phóng to toàn màn hình xem cho rộng"}
            >
              {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên bài đọc / Chuyên đề <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: ETS 2024 Test 5 - Part 5"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phần thi (Part)</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as "part5" | "part6" | "part7" | "grammar")}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="part5">Part 5 - Câu đơn (Incomplete Sentences)</option>
                <option value="part6">Part 6 - Điền đoạn văn (Text Completion)</option>
                <option value="part7">Part 7 - Đọc hiểu đoạn văn (Reading Comprehension)</option>
                <option value="grammar">Chuyên đề Ngữ pháp &amp; Từ vựng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề / Nhãn (Tag)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="VD: Hợp đồng &amp; Doanh nghiệp"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trạng thái sau khi import
              </label>
              <div className="flex items-center gap-1.5 h-10">
                <button
                  type="button"
                  onClick={() => setImportStatus("draft")}
                  className={`flex-1 h-full px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    importStatus === "draft"
                      ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Lưu dưới dạng bản nháp để admin kiểm duyệt trước"
                >
                  <FileEdit className="w-3.5 h-3.5 shrink-0" />
                  <span>Bản nháp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportStatus("published")}
                  className={`flex-1 h-full px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    importStatus === "published"
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Phát hành ngay cho học viên làm bài"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Phát hành</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cảnh báo đề thi trùng lặp & tùy chọn ghi đè */}
          {existingDuplicate && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">
                    Phát hiện bài đọc đã tồn tại: &quot;{existingDuplicate.title}&quot; ({existingDuplicate.totalQuestions} câu, {existingDuplicate.category.toUpperCase()})
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Hệ thống sẽ <strong>ghi đè &amp; cập nhật</strong> bài đọc này để không tạo thêm bài trùng lặp ngoài ý muốn.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 font-bold cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-amber-300 shadow-2xs self-start sm:self-auto hover:bg-amber-100/50 transition">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span>Ghi đè bài cũ (Khuyên dùng)</span>
              </label>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-left ${
                  activeTab === "paste"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Dán văn bản bài đọc thô</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer text-left ${
                  activeTab === "file"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Nạp từ File (Excel / CSV / JSON)</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_PART5);
                  setCategory("part5");
                  setTitle("ETS 2024 Test 5 - Part 5 Cấu trúc Từ loại");
                  handleParseText(SAMPLE_PART5);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
              >
                Mẫu Part 5
              </button>
              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_PART6);
                  setCategory("part6");
                  setTitle("ETS TOEIC Reading - Part 6 (Điền đoạn 131 - 134)");
                  handleParseText(SAMPLE_PART6);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
              >
                Mẫu Part 6
              </button>
              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_PART7);
                  setCategory("part7");
                  setTitle("ETS 2024 Test 5 - Part 7 Double Passage");
                  handleParseText(SAMPLE_PART7);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
              >
                Mẫu Part 7
              </button>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải mẫu CSV</span>
              </button>
            </div>
          </div>

          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Paste Text */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Nội dung bài đọc &amp; câu hỏi thô (hỗ trợ bóc tách đoạn văn, câu hỏi A/B/C/D, lời giải và từ vựng):
                </label>
                <span className="text-[11px] text-slate-400">
                  {rawText.length > 0 ? `${rawText.length} ký tự` : "Chưa có nội dung"}
                </span>
              </div>
              <textarea
                rows={isMaximized ? 8 : 6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán nội dung bài đọc hoặc câu hỏi vào đây... Ví dụ:&#10;101. The committee will review the proposal ------- next Monday.&#10;(A) on&#10;(B) in&#10;(C) at&#10;(D) by&#10;Đáp án: A&#10;Giải thích: Dùng giới từ 'on' trước thứ trong tuần."
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRawText("")}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Xóa trắng
                </button>
                <button
                  type="button"
                  onClick={() => handleParseText(rawText)}
                  disabled={!rawText.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Phân tích nội dung bài đọc</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Upload File */}
          {activeTab === "file" && (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/60 text-center space-y-4 hover:border-blue-400 transition">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                {isUploadingFile ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Kéo thả file bài đọc / Excel vào đây hoặc bấm để chọn file
                </p>
                <p className="text-xs text-slate-500">
                  Hỗ trợ định dạng Excel (.xlsx, .xls), CSV UTF-8 (.csv), JSON bài đọc (.json) hoặc Text (.txt)
                </p>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Chọn file từ máy tính</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SMART ALERT: CẢNH BÁO ĐỀ 200 CÂU HOẶC CHỨA LISTENING (1 - 100) HOẶC PART 5 VƯỢT QUÁ 30 CÂU */}
          {(hasListeningQuestions || isOver100Questions || isPart5Exceeding) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/40 border border-amber-200/90 shadow-sm space-y-4">
              {/* Header Info Row (Full Width) */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 ring-4 ring-amber-100/70">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                      {isPart5Exceeding && !hasListeningQuestions && !isOver100Questions
                        ? `Phát hiện chuyên đề Part 5 có tới ${parsedQuestions.length} câu (vượt chuẩn 30 câu)!`
                        : `Phát hiện đề có ${parsedQuestions.length} câu (chứa câu hỏi Listening 1-100 hoặc vượt chuẩn Reading)!`}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300/80 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      {isPart5Exceeding && !hasListeningQuestions && !isOver100Questions
                        ? "Part 5 chuẩn: 30 câu (101-130)"
                        : "TOEIC Reading chuẩn: 100 câu (101-200)"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 mt-1.5 leading-relaxed">
                    {isPart5Exceeding && !hasListeningQuestions && !isOver100Questions
                      ? `Đề thi TOEIC Part 5 chuẩn ETS chỉ gồm 30 câu điền câu đơn (từ Câu 101 đến 130). Danh sách hiện tại đang có ${parsedQuestions.length} câu (gồm cả Part 6 và Part 7). Bạn có thể bấm tách nhanh thành 3 chuyên đề độc lập hoặc lọc riêng Part 5:`
                      : `Bài tập TOEIC Reading chuẩn gồm tối đa 100 câu (từ Câu 101 đến 200). Nội dung hiện tại đang bao gồm cả phần Listening hoặc câu đơn không thuộc Reading. Hãy chọn cách xử lý nhanh bên dưới:`}
                  </p>
                </div>
              </div>

              {/* Action Toolbar Row */}
              <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Hero / Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAllThreeParts}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                    title="Tự động bóc tách thành 3 chuyên đề độc lập chuẩn ETS: Part 5 (30 câu), Part 6 (16 câu), Part 7 (54 câu) và lưu ngay vào kho"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>⚡ Tự động tách &amp; Lưu cả 3 Part</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wide">
                      Khuyên dùng
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFilterOnlyReading}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5 transition"
                    title="Lọc chỉ giữ lại các câu hỏi từ 101 đến 200 và loại bỏ phần Listening"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Chỉ lấy Reading (101 - 200)</span>
                  </button>
                </div>

                {/* Slicing Group Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <span className="text-[11px] font-bold text-amber-800/80 mr-1 hidden lg:inline">
                    Lọc riêng:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFilterPart("part5")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300/90 text-xs font-bold cursor-pointer transition shadow-2xs hover:shadow-xs flex items-center gap-1"
                    title="Chỉ lấy 30 câu Part 5 (Câu 101 - 130)"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Part 5 (101-130)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterPart("part6")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-purple-100/70 text-purple-900 border border-purple-300/90 text-xs font-bold cursor-pointer transition shadow-2xs hover:shadow-xs flex items-center gap-1"
                    title="Chỉ lấy 16 câu Part 6 (Câu 131 - 146)"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span>Part 6 (131-146)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterPart("part7")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-blue-100/70 text-blue-900 border border-blue-300/90 text-xs font-bold cursor-pointer transition shadow-2xs hover:shadow-xs flex items-center gap-1"
                    title="Chỉ lấy 54 câu Part 7 (Câu 147 - 200)"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span>Part 7 (147-200)</span>
                  </button>
                  {hasListeningQuestions && (
                    <button
                      type="button"
                      onClick={handleDeleteAllListening}
                      className="px-2.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300/80 text-xs font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                      title="Xóa nhanh các câu 1-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Xóa câu 1-100</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vocabulary Extractor Panel */}
          {parsedQuestions.length > 0 && (
            <ReadingVocabExtractorPanel
              passageText={passageText}
              questions={parsedQuestions}
              existingWords={existingVocabWords}
              onApplyVocab={handleApplyExtractedVocab}
            />
          )}

          {/* BẢNG CHỈNH SỬA / THÊM CÂU HỎI TRỰC TIẾP */}
          {(editingQuestionIndex !== null || isAddingQuestion) && (
            <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/70 border-2 border-blue-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {isAddingQuestion ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isAddingQuestion ? "Thêm câu hỏi mới vào bài đọc" : `Chỉnh sửa nội dung Câu ${questionForm.questionNum}`}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Chỉnh sửa trực quan nội dung câu hỏi, 4 phương án, đáp án đúng và lời giải chi tiết
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestionIndex(null);
                    setIsAddingQuestion(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-blue-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số thứ tự câu</label>
                  <input
                    type="text"
                    value={questionForm.questionNum || ""}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionNum: e.target.value })}
                    placeholder="VD: 101"
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đề bài tiếng Anh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    placeholder="VD: The marketing team will review the proposal ------- next Monday."
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bản dịch tiếng Việt (Bilingual)</label>
                <input
                  type="text"
                  value={questionForm.bilingual || ""}
                  onChange={(e) => setQuestionForm({ ...questionForm, bilingual: e.target.value })}
                  placeholder="VD: Nhóm tiếp thị sẽ xem xét đề xuất vào thứ Hai tới."
                  className="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* 4 Options & Correct Answer Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  4 Phương án trả lời &amp; Chọn đáp án đúng:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(["A", "B", "C", "D"] as const).map((letter, optIdx) => {
                    const isCorrect = questionForm.correctIndex === optIdx;
                    return (
                      <div
                        key={letter}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/30"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setQuestionForm({ ...questionForm, correctIndex: optIdx })}
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition ${
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title={`Chọn (${letter}) làm đáp án đúng`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={questionForm.options[optIdx] || ""}
                          onChange={(e) => {
                            const newOpts = [...(questionForm.options || ["", "", "", ""])];
                            newOpts[optIdx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOpts });
                          }}
                          placeholder={`Phương án (${letter})`}
                          className="flex-1 text-xs font-medium text-slate-900 bg-transparent focus:outline-none"
                        />
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                            Đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giải thích chi tiết phương án đúng</label>
                <textarea
                  rows={2}
                  value={questionForm.explanation || ""}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Giải thích vì sao chọn đáp án này, dấu hiệu nhận biết ngữ pháp hoặc từ loại..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestionIndex(null);
                    setIsAddingQuestion(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestionForm}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAddingQuestion ? "Thêm câu hỏi này" : "Lưu thay đổi câu hỏi"}</span>
                </button>
              </div>
            </div>
          )}

          {/* BẢNG XEM TRƯỚC VÀ THAO TÁC CÂU HỎI */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Bảng xem trước câu hỏi đã nhận diện ({parsedQuestions.length} câu)
                  </h3>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {parsedVocabCount} từ vựng
                  </span>
                  {(passageText || parsedQuestions[0]?.passageText) && (
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      Có đoạn văn đọc hiểu
                    </span>
                  )}
                </div>

                {/* Question Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddQuestion}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu hỏi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRenumberQuestions(101)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                    title="Đánh lại số thứ tự từ 101"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đánh lại STT (101..)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xóa tất cả câu hỏi vừa nhận diện không?")) {
                        setParsedQuestions([]);
                        setCardVocabList([]);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                    title="Xóa toàn bộ câu hỏi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewPartFilter("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      previewPartFilter === "all"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tất cả ({parsedQuestions.length})
                  </button>
                  {hasListeningQuestions && (
                    <button
                      type="button"
                      onClick={() => setPreviewPartFilter("listening")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        previewPartFilter === "listening"
                          ? "bg-amber-500 text-white shadow-2xs"
                          : "text-amber-800 hover:bg-amber-100/60"
                      }`}
                    >
                      Listening 1-100 ({listeningQuestions.length})
                    </button>
                  )}
                  {part5Questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewPartFilter("part5")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        previewPartFilter === "part5"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Part 5 ({part5Questions.length})
                    </button>
                  )}
                  {part6Questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewPartFilter("part6")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        previewPartFilter === "part6"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Part 6 ({part6Questions.length})
                    </button>
                  )}
                  {part7Questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewPartFilter("part7")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        previewPartFilter === "part7"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Part 7 ({part7Questions.length})
                    </button>
                  )}
                </div>

                <div className="relative min-w-[200px] sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    placeholder="Tìm câu hỏi, từ khóa..."
                    className="w-full h-8 pl-8 pr-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Từ vựng chung toàn bài */}
              {cardVocabList.length > 0 && (
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <div className="text-[11px] font-bold text-indigo-900">
                    Từ vựng chung toàn bài ({cardVocabList.length} từ)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cardVocabList.map((v, vIdx) => (
                      <div
                        key={`${v.word}-${vIdx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-[11px] shadow-2xs"
                      >
                        <span className="font-bold text-indigo-800">{v.word}</span>
                        {v.pos && <span className="text-slate-500">({v.pos})</span>}
                        {v.ipa && <span className="font-mono text-slate-400 text-[10px]">{v.ipa}</span>}
                        <span className="text-slate-700 font-medium">: {v.meaning}</span>
                        <button
                          type="button"
                          onClick={() => playPreviewWord(v.word)}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCardVocab(vIdx)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Xóa từ này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question list (Spacious & Roomy) */}
              <div
                className={`overflow-y-auto space-y-3 rounded-2xl border border-slate-200 p-3.5 bg-slate-50/60 transition-all ${
                  isMaximized ? "max-h-[calc(100vh-420px)] min-h-[460px]" : "max-h-[520px] sm:max-h-[600px]"
                }`}
              >
                {filteredParsedQuestions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc tìm kiếm hiện tại.
                  </div>
                ) : (
                  filteredParsedQuestions.map(({ q, originalIndex }) => {
                    const letters = ["A", "B", "C", "D"];
                    const qNum = parseInt(q.questionNum || "0", 10);
                    const isListeningQ = !isNaN(qNum) && qNum >= 1 && qNum <= 100;

                    return (
                      <div
                        key={originalIndex}
                        className={`p-4 rounded-2xl bg-white border shadow-2xs space-y-2.5 transition ${
                          isListeningQ
                            ? "border-amber-300 bg-amber-50/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold ${
                                isListeningQ
                                  ? "bg-amber-500 text-white"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              Câu {q.questionNum}
                            </span>
                            {isListeningQ && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                Listening (1-100)
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {q.question || (q as any).questionEn || (q as any).questionText || "---"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                              Đáp án: ({letters[q.correctIndex]})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(originalIndex)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                              title="Chỉnh sửa câu hỏi này"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(originalIndex)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {(q.bilingual || (q as any).questionVi) && (
                          <p className="text-[11px] text-slate-600 italic pl-1 bg-slate-50/60 p-1.5 rounded-lg border border-slate-100">
                            Dịch: {q.bilingual || (q as any).questionVi}
                          </p>
                        )}

                        {/* Options grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {normalizeOptions(q.options).map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 px-3 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
                                oIdx === q.correctIndex
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-2xs"
                                  : "bg-slate-50/80 border-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="font-bold text-xs shrink-0">({letters[oIdx]})</span>
                              <span className="truncate">{opt || "---"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <p className="text-[11px] text-slate-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                            <strong className="text-amber-900">💡 Lời giải:</strong> {q.explanation}
                          </p>
                        )}

                        {/* Question Vocab List */}
                        {q.vocabList && q.vocabList.length > 0 && (
                          <div className="pt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 mr-0.5">
                              Từ vựng ({q.vocabList.length}):
                            </span>
                            {q.vocabList.map((v, vIdx) => (
                              <span
                                key={`${v.word}-${vIdx}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-slate-800"
                              >
                                <strong className="text-blue-700">{v.word}</strong>
                                {v.pos && <span className="text-slate-500">({v.pos})</span>}
                                {v.ipa && <span className="font-mono text-slate-400 text-[10px]">{v.ipa}</span>}
                                <span>: {v.meaning}</span>
                                <button
                                  type="button"
                                  onClick={() => playPreviewWord(v.word)}
                                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                  title="Nghe phát âm"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestionVocab(originalIndex, vIdx)}
                                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Xóa từ này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Error / Action Alert Banner (luôn hiển thị rõ ràng ngay sát trên thanh nút bấm) */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 my-2.5 p-4 rounded-2xl bg-gradient-to-br from-rose-50/95 via-rose-50/60 to-orange-50/40 border border-rose-300 text-rose-950 text-xs shadow-md space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 ring-4 ring-rose-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-rose-950 text-xs sm:text-sm">
                    Cảnh báo cấu trúc trước khi lưu chuyên đề:
                  </p>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100/60 transition cursor-pointer"
                    title="Đóng thông báo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-rose-800 text-xs mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>

            {parsedQuestions.length > 30 && (
              <div className="pt-2.5 border-t border-rose-200/70 flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-[11px] font-bold text-rose-800">
                  Lựa chọn xử lý tự động:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAllThreeParts}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Tự động bóc tách thành 3 chuyên đề độc lập chuẩn ETS: Part 5 (30 câu), Part 6 (16 câu), Part 7 (54 câu)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>⚡ Tự động tách &amp; Lưu cả 3 Part</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterPart("part5")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    Chỉ lấy Part 5 (30 câu)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterPart("part6")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    Chỉ lấy Part 6 (16 câu)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFilterPart("part7")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    Chỉ lấy Part 7 (54 câu)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Mỗi câu đúng tương đương 5 điểm TOEIC. Đề lưu ở trạng thái <strong>{importStatus === "draft" ? "Bản nháp" : "Đã phát hành"}</strong>.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveToBank}
              disabled={parsedQuestions.length === 0}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-md whitespace-nowrap ${
                parsedQuestions.length > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>
                {parsedQuestions.length > 54
                  ? `⚡ Tách & Lưu cả 3 Part (${parsedQuestions.length} câu)`
                  : `Lưu ${parsedQuestions.length} câu vào Kho (${importStatus === "draft" ? "Bản nháp" : "Phát hành"})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
