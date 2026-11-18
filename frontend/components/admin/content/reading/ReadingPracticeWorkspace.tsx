"use client";

import { recordQuestionAnswer, getItemProgress, getRedoWrongQuestions, saveItemProgress, resetItemProgress } from "@/lib/practiceProgress";
import { getPassageFingerprint, isPlaceholderPassageText } from "@/lib/readingPassageUtils";
import { getQuestionTranslation, getOptionMeaning, getSmartPassageTranslation, getEnrichedExplanation } from "@/lib/readingTranslationResolver";
import { autoExtractVocabListForReading } from "@/lib/readingVocabExtractor";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ExerciseCardData, ReadingSubPassage, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
import { normalizeOptions, saveReadingProgress } from "@/lib/api/reading";
import {
  ArrowLeft,
  Languages,
  FileText,
  Pencil,
  Clock,
  Zap,
  Sparkles,
  HelpCircle,
  Star,
  Plus,
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Bookmark,
  BookOpen,
  Volume2,
  FolderPlus,
  Info,
  Loader2,
} from "lucide-react";
import { lookupWordDetail, WordDetail } from "./richDictionaryData";
import { lookupEnglishDictionary } from "@/lib/api/english-dictionary";
import { getEnrichedVocabDetail } from "@/lib/toeicVocabDetailEnricher";
import { QuestionErrorReportButton } from "@/components/support/QuestionErrorReportButton";
import { getQuestionCorrection, type QuestionCorrection } from "@/lib/api/support";
import { formatExplanation } from "@/lib/utils/formatExplanation";

interface ReadingPracticeWorkspaceProps {
  initialQuestionIndex?: number;
  isRedoWrongOnly?: boolean;
  card: ExerciseCardData;
  onClose: () => void;
  playSfx: (type?: "correct" | "wrong" | "click") => void;
  showToast: (msg: string) => void;
  showTimer?: boolean;
}

interface PassageQuestionItem {
  question: SampleQuestion;
  globalIndex: number;
}

interface PassageGroup {
  id: string;
  passageTitle?: string;
  passageText?: string;
  passageTextVi?: string;
  passages?: ReadingSubPassage[];
  startIndex: number;
  questions: PassageQuestionItem[];
}

export const ReadingPracticeWorkspace: React.FC<ReadingPracticeWorkspaceProps> = ({
  card,
  onClose,
  playSfx,
  showToast,
  initialQuestionIndex = 0,
  isRedoWrongOnly = false,
  showTimer = true,
}) => {
  const fullQuestions = useMemo(() => {
    return card.sampleQuestions || [];
  }, [card]);

  // Gom nhóm câu hỏi và xử lý chế độ Luyện tập / Làm lại câu sai:
  // - Part 5 / Grammar: Câu đơn độc lập -> Làm lại câu sai chỉ chọn đúng các câu sai.
  // - Part 6 / Part 7: Có đoạn văn -> Nếu trong đoạn văn có bất kỳ câu nào sai, GIỮ NGUYÊN TOÀN BỘ ĐOẠN VĂN
  //   kèm TẤT CẢ các câu hỏi của đoạn đó (cả 4 câu ở Part 6, hoặc 2-5 câu ở Part 7) để đảm bảo ngữ cảnh đọc hiểu!
  const { activeQuestions, passageGroups } = useMemo(() => {
    const isStandaloneSentenceMode = card.category === "part5" || card.category === "grammar";
    const cardPassagesValid = (card.passages || []).filter((p) => !isPlaceholderPassageText(p.text));
    const cardTextValid = !isPlaceholderPassageText(card.passageText) ? card.passageText : undefined;
    const cardTextViValid = !isPlaceholderPassageText(card.passageTextVi) ? card.passageTextVi : undefined;

    const hasPassages =
      !isStandaloneSentenceMode &&
      (fullQuestions.some(
        (q) =>
          !isPlaceholderPassageText(q.passageText) ||
          Boolean(q.passages && q.passages.some((p) => !isPlaceholderPassageText(p.text)))
      ) ||
        Boolean(cardTextValid) ||
        cardPassagesValid.length > 0);

    // Trường hợp 1: Part 5 hoặc câu đơn không có đoạn văn
    if (!hasPassages) {
      const qList = isRedoWrongOnly
        ? getRedoWrongQuestions(fullQuestions, `reading-${card.id}`, card.totalQuestions || fullQuestions.length)
        : fullQuestions;

      const pGroups: PassageGroup[] = qList.map((q, idx) => ({
        id: `q-${idx}`,
        startIndex: idx,
        questions: [{ question: q, globalIndex: idx }],
      }));

      return {
        activeQuestions: qList,
        passageGroups: pGroups,
      };
    }

    // Trường hợp 2: Part 6 hoặc Part 7 có đoạn văn (Reading Passage)
    // Gom tất cả fullQuestions thành các đoạn văn hoàn chỉnh
    const allGroups: PassageGroup[] = [];
    let curr: PassageGroup | null = null;

    fullQuestions.forEach((q, idx) => {
      const qPassagesValid = (q.passages || []).filter((p) => !isPlaceholderPassageText(p.text));
      const validPassages = qPassagesValid.length > 0 ? qPassagesValid : cardPassagesValid;
      const validText = !isPlaceholderPassageText(q.passageText) ? q.passageText : cardTextValid;
      const validTextVi = !isPlaceholderPassageText(q.passageTextVi) ? q.passageTextVi : cardTextViValid;
      const fp = getPassageFingerprint(
        { passageTitle: q.passageTitle, passageText: validText, passages: validPassages },
        validText
      );
      const pKey = fp && fp !== "__title__:" ? fp : `single-${idx}`;

      if (!curr || curr.id !== pKey) {
        if (curr) allGroups.push(curr);
        curr = {
          id: pKey,
          passageTitle: q.passageTitle,
          passageText: validText,
          passageTextVi: validTextVi,
          passages: validPassages.length > 0 ? validPassages : undefined,
          startIndex: idx,
          questions: [{ question: q, globalIndex: idx }],
        };
      } else {
        curr.questions.push({ question: q, globalIndex: idx });
      }
    });
    if (curr) allGroups.push(curr);

    // Nếu không phải chế độ làm lại câu sai -> hiển thị toàn bộ
    if (!isRedoWrongOnly) {
      return {
        activeQuestions: fullQuestions,
        passageGroups: allGroups,
      };
    }

    // Trong chế độ làm lại câu sai cho Part 6 / Part 7:
    // Kiểm tra đoạn văn nào có câu sai thì GIỮ NGUYÊN TOÀN BỘ ĐOẠN ĐÓ (tất cả các câu trong đoạn)
    const prog = getItemProgress(`reading-${card.id}`, card.totalQuestions || fullQuestions.length);
    const wrongIds = (prog.wrongQuestionIds || []).map(String);
    const targetWrongCount = Math.max(prog.wrongAnswers || 0, wrongIds.length);

    let keptGroups = allGroups.filter((group) => {
      return group.questions.some((item) => {
        const q = item.question;
        const qIdRaw = (q as { id?: string | number }).id;
        const qIdStr = qIdRaw !== undefined && qIdRaw !== null ? String(qIdRaw) : "";
        const qNumStr = q.questionNum !== undefined && q.questionNum !== null ? String(q.questionNum) : "";
        const idx1Str = String(item.globalIndex + 1);
        const idx0Str = String(item.globalIndex);

        return wrongIds.some(
          (wid) =>
            wid === qIdStr ||
            wid === qNumStr ||
            wid === idx1Str ||
            wid === idx0Str ||
            (qIdStr && (qIdStr.endsWith(`-${wid}`) || qIdStr.endsWith(`_${wid}`)))
        );
      });
    });

    // Fallback: nếu wrongIds rỗng nhưng targetWrongCount > 0
    if (keptGroups.length === 0 && targetWrongCount > 0) {
      let accQuestions = 0;
      for (const grp of allGroups) {
        keptGroups.push(grp);
        accQuestions += grp.questions.length;
        if (accQuestions >= targetWrongCount) break;
      }
    }

    if (keptGroups.length === 0) {
      keptGroups = allGroups;
    }

    // Tái cấu trúc lại activeQuestions và globalIndex tuần tự cho từng câu trong các đoạn được giữ
    const reindexedQuestions: SampleQuestion[] = [];
    const reindexedGroups: PassageGroup[] = [];
    let startIdx = 0;

    keptGroups.forEach((grp, gIdx) => {
      const grpQuestions: { question: SampleQuestion; globalIndex: number }[] = [];
      grp.questions.forEach((item) => {
        const gIdxSeq = reindexedQuestions.length;
        reindexedQuestions.push(item.question);
        grpQuestions.push({ question: item.question, globalIndex: gIdxSeq });
      });

      reindexedGroups.push({
        ...grp,
        id: grp.id || `passage-group-${gIdx}`,
        startIndex: startIdx,
        questions: grpQuestions,
      });

      startIdx += grpQuestions.length;
    });

    return {
      activeQuestions: reindexedQuestions,
      passageGroups: reindexedGroups,
    };
  }, [fullQuestions, isRedoWrongOnly, card]);

  const leftPaneRef = useRef<HTMLDivElement | null>(null);
  const rightPaneRef = useRef<HTMLDivElement | null>(null);

  const findFirstUnansweredGroup = (
    answersMap: Record<number, number>,
    checkedMap: Record<number, boolean>
  ): number => {
    return passageGroups.findIndex((grp, gIdx) => {
      if (!checkedMap[gIdx]) return true;
      return grp.questions.some((item) => answersMap[item.globalIndex] === undefined);
    });
  };

  const [initialSnapshot] = useState<{
    answers: Record<number, number>;
    checkedGroups: Record<number, boolean>;
    correctCount: number;
    wrongCount: number;
    answeredCount: number;
    firstUnansweredGroup: number;
    allCompleted: boolean;
    hasSavedLog: boolean;
  }>(() => {
    if (isRedoWrongOnly || typeof window === "undefined") {
      return {
        answers: {},
        checkedGroups: {},
        correctCount: 0,
        wrongCount: 0,
        answeredCount: 0,
        firstUnansweredGroup: 0,
        allCompleted: false,
        hasSavedLog: false,
      };
    }
    try {
      const prog = getItemProgress(`reading-${card.id}`, card.totalQuestions || fullQuestions.length || 0);
      const savedRaw = localStorage.getItem(`toeic_reading_answers_${card.id}`);
      let answers: Record<number, number> = {};
      let checkedMap: Record<number, boolean> = {};

      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        answers = parsed?.answers && typeof parsed.answers === "object" ? parsed.answers : {};
        checkedMap = parsed?.checkedGroups && typeof parsed.checkedGroups === "object" ? parsed.checkedGroups : {};
      }

      // Nếu người dùng đã xóa sạch lịch sử ngoài thẻ (cả completed và answered đều = 0) thì xóa luôn log đáp án cũ bị sót
      if (
        (prog.completedQuestions || 0) === 0 &&
        (prog.answeredQuestionIds?.length || 0) === 0 &&
        Object.keys(answers).length > 0
      ) {
        answers = {};
        checkedMap = {};
        try {
          localStorage.removeItem(`toeic_reading_answers_${card.id}`);
        } catch {}
      }

      // Tính chính xác số câu đã làm, đúng, sai từ answers + checkedGroups thực tế
      let correctCount = 0;
      let wrongCount = 0;
      let checkedAnsweredCount = 0;
      let totalSelectedCount = 0;

      passageGroups.forEach((grp, gIdx) => {
        const allInGrpAnswered = grp.questions.every((item) => answers[item.globalIndex] !== undefined);
        // Với câu đơn Part 5: nếu đã chọn đáp án thì mặc định đã chấm
        if (grp.questions.length === 1 && allInGrpAnswered) {
          checkedMap[gIdx] = true;
        }
        grp.questions.forEach((item) => {
          const chosen = answers[item.globalIndex];
          if (chosen !== undefined) {
            totalSelectedCount++;
            if (checkedMap[gIdx]) {
              checkedAnsweredCount++;
              if (chosen === item.question.correctIndex) correctCount++;
              else wrongCount++;
            }
          }
        });
      });

      const answeredCount = Math.max(checkedAnsweredCount, totalSelectedCount);
      const firstUnanswered = passageGroups.findIndex((grp, gIdx) => {
        if (!checkedMap[gIdx]) return true;
        return grp.questions.some((item) => answers[item.globalIndex] === undefined);
      });
      const allCompleted = passageGroups.length > 0 && firstUnanswered === -1;

      return {
        answers,
        checkedGroups: checkedMap,
        correctCount,
        wrongCount,
        answeredCount,
        firstUnansweredGroup: firstUnanswered !== -1 ? firstUnanswered : 0,
        allCompleted,
        hasSavedLog: answeredCount > 0,
      };
    } catch {
      return {
        answers: {},
        checkedGroups: {},
        correctCount: 0,
        wrongCount: 0,
        answeredCount: 0,
        firstUnansweredGroup: 0,
        allCompleted: false,
        hasSavedLog: false,
      };
    }
  });

  const [savedLogSummary, setSavedLogSummary] = useState<{
    hasSavedLog: boolean;
    answeredCount: number;
    firstUncheckedGroup: number;
    allCompleted: boolean;
  }>(() => ({
    hasSavedLog: initialSnapshot.hasSavedLog,
    answeredCount: initialSnapshot.answeredCount,
    firstUncheckedGroup: initialSnapshot.firstUnansweredGroup,
    allCompleted: initialSnapshot.allCompleted,
  }));

  const [showResumePromptModal, setShowResumePromptModal] = useState<boolean>(
    () => !isRedoWrongOnly && initialSnapshot.hasSavedLog
  );

  const [currentGroupIndex, setCurrentGroupIndex] = useState(() => {
    if (isRedoWrongOnly) return 0;
    // Luôn ưu tiên nhảy thẳng vào câu / đoạn CHƯA LÀM ĐẦU TIÊN (cho cả Part 5, 6, 7)
    if (initialSnapshot.hasSavedLog) {
      return Math.min(initialSnapshot.firstUnansweredGroup, Math.max(0, passageGroups.length - 1));
    }
    // Nếu chưa có log câu trả lời mà có initialQuestionIndex -> ánh xạ chỉ số CÂU HỎI sang chỉ số ĐOẠN VĂN chuẩn xác
    if (initialQuestionIndex !== undefined && initialQuestionIndex > 0) {
      const targetGrp = passageGroups.findIndex((g) =>
        g.questions.some((item) => item.globalIndex === initialQuestionIndex)
      );
      if (targetGrp !== -1) return targetGrp;
    }
    return 0;
  });
  const currentGroup = passageGroups[currentGroupIndex] || passageGroups[0];
  const isMultiQuestionGroup = currentGroup && currentGroup.questions.length > 1;

  // Deduplicated vocabulary across all questions in the current passage group + card-level vocab
  const combinedGroupVocab = useMemo(() => {
    const map = new Map<string, VocabItem>();
    currentGroup.questions.forEach((item) => {
      (item.question.vocabList || []).forEach((v) => {
        const key = v.word.trim().toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, v);
        }
      });
    });
    (card.vocabList || []).forEach((v) => {
      const key = v.word.trim().toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, v);
      }
    });

    // Tự động bổ sung từ vựng trọng tâm cho bài đọc Part 6 & Part 7 nếu danh sách bị thiếu
    if (map.size === 0) {
      const autoVocabs = autoExtractVocabListForReading({
        passageText: currentGroup.passageText || card.passageText || "",
        questions: currentGroup.questions.map((item) => item.question),
        maxCandidates: 6,
      });
      autoVocabs.forEach((v) => {
        const key = v.word.trim().toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, v);
        }
      });
    }

    return Array.from(map.values());
  }, [currentGroup, card.vocabList, card.passageText]);

  // Track user selections: globalIndex -> selected option index
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>(
    () => (isRedoWrongOnly ? {} : initialSnapshot.answers)
  );

  // Track checked state: groupIndex -> boolean
  const [checkedGroups, setCheckedGroups] = useState<Record<number, boolean>>(
    () => (isRedoWrongOnly ? {} : initialSnapshot.checkedGroups)
  );
  const isCurrentGroupChecked = !!checkedGroups[currentGroupIndex];

  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(
    () => (isRedoWrongOnly ? 0 : initialSnapshot.correctCount)
  );

  const [sessionWrongCount, setSessionWrongCount] = useState<number>(
    () => (isRedoWrongOnly ? 0 : initialSnapshot.wrongCount)
  );

  // Tự động đồng bộ ngược giữa log đáp án đã lưu và thẻ tiến độ bên ngoài (tránh lệch kiểu ngoài 8/30 trong 19/30)
  useEffect(() => {
    if (isRedoWrongOnly || !initialSnapshot.hasSavedLog) return;
    const total = card.totalQuestions || fullQuestions.length;
    const answeredIds: (number | string)[] = [];
    const wrongIds: (number | string)[] = [];
    let correct = 0;
    let wrong = 0;

    passageGroups.forEach((grp, gIdx) => {
      if (!initialSnapshot.checkedGroups[gIdx]) return;
      grp.questions.forEach((item) => {
        const chosen = initialSnapshot.answers[item.globalIndex];
        if (chosen === undefined) return;
        const qId = item.question.questionNum || item.globalIndex + 1;
        answeredIds.push(qId);
        if (chosen === item.question.correctIndex) correct++;
        else {
          wrong++;
          wrongIds.push(qId);
        }
      });
    });

    const prog = getItemProgress(`reading-${card.id}`, total);
    if (
      answeredIds.length > 0 &&
      (prog.completedQuestions !== answeredIds.length ||
        prog.correctAnswers !== correct ||
        prog.wrongAnswers !== wrong)
    ) {
      saveItemProgress(
        `reading-${card.id}`,
        answeredIds.length,
        total,
        undefined,
        correct,
        wrong,
        wrongIds,
        prog.savedCount,
        answeredIds,
        true
      );
    }
  }, [isRedoWrongOnly, initialSnapshot, card.id, card.totalQuestions, fullQuestions.length, passageGroups]);

  // Cuộn mượt lên đầu 2 khung khi chuyển sang câu / đoạn mới
  useEffect(() => {
    if (rightPaneRef.current) rightPaneRef.current.scrollTop = 0;
    if (leftPaneRef.current) leftPaneRef.current.scrollTop = 0;
  }, [currentGroupIndex]);

  useEffect(() => {
    if (isRedoWrongOnly) {
      setCurrentGroupIndex(0);
      setUserAnswers({});
      setCheckedGroups({});
      setSessionCorrectCount(0);
      setSessionWrongCount(0);
    }
  }, [isRedoWrongOnly]);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [energyScore, setEnergyScore] = useState(0);

  // Mode toggles
  const [isBilingual, setIsBilingual] = useState(false);
  const [readingConfig, setReadingConfig] = useState<{
    part5Minutes: number;
    part6Minutes: number;
    part7SingleMinutes: number;
    part7MultiMinutes: number;
    targetWpm: number;
    enableBilingualByDefault: boolean;
    enablePacingTimer: boolean;
    enableTimeoutAlert: boolean;
    speedDrillMode: boolean;
  } | null>(null);

  useEffect(() => {
    const handleConfigSync = (e?: any) => {
      try {
        const raw = localStorage.getItem("toeic_reading_time_config");
        if (raw) {
          const parsed = JSON.parse(raw);
          setReadingConfig(parsed);
          if (parsed.enableBilingualByDefault) {
            setIsBilingual(true);
          }
        }
      } catch {}
    };

    handleConfigSync();

    window.addEventListener("toeic-reading-config-updated", handleConfigSync);
    window.addEventListener("storage", handleConfigSync);

    return () => {
      window.removeEventListener("toeic-reading-config-updated", handleConfigSync);
      window.removeEventListener("storage", handleConfigSync);
    };
  }, []);

  const [showPassageTranslation, setShowPassageTranslation] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  // Modals state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qKey: string]: string }>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`toeic_reading_notes_${card.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeNoteTab, setActiveNoteTab] = useState<"current" | "tips" | "vocab">("current");
  const [selectedNoteQKey, setSelectedNoteQKey] = useState<string>("");
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);

  // Vocabulary Expansion States
  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({});
  const [savedWords, setSavedWords] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("toeic_user_word_basket");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tự động lưu ghi chú học tập vào localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`toeic_reading_notes_${card.id}`, JSON.stringify(practiceUserNotes));
    } catch {}
  }, [practiceUserNotes, card.id]);

  // Tự động lưu giỏ từ vựng vào localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("toeic_user_word_basket", JSON.stringify(savedWords));
    } catch {}
  }, [savedWords]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState<SampleQuestion | null>(null);
  const [showWordBasketModal, setShowWordBasketModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictQuery, setDictQuery] = useState("");
  const [dictResult, setDictResult] = useState<{ word: string; meaning: string; ipa: string; pos: string } | null>(null);

  // Word Selection & Rich Lookup States (Images 4 & 5)
  const [showLookupTooltip, setShowLookupTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedLookupWord, setSelectedLookupWord] = useState<string>("");
  const [showRichLookupModal, setShowRichLookupModal] = useState(false);
  const [richWordData, setRichWordData] = useState<WordDetail | null>(null);
  const [isDictLoading, setIsDictLoading] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<string>("word");
  const [disableDoubleClick, setDisableDoubleClick] = useState(false);
  const [isAddingCustomMeaning, setIsAddingCustomMeaning] = useState(false);
  const [customUserMeanings, setCustomUserMeanings] = useState<Record<string, string>>({});
  const [customMeaningInput, setCustomMeaningInput] = useState("");

  // Standard TOEIC Part Detection & Directions
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  const workspacePart: "PART 5" | "PART 6" | "PART 7" = useMemo(() => {
    if (card.category === "part5") return "PART 5";
    if (card.category === "part6") return "PART 6";
    if (card.category === "part7") return "PART 7";
    const titleUpper = (card.title || "").toUpperCase();
    if (titleUpper.includes("PART 5") || titleUpper.includes("PART-5") || titleUpper.includes("P5")) return "PART 5";
    if (titleUpper.includes("PART 6") || titleUpper.includes("PART-6") || titleUpper.includes("P6")) return "PART 6";
    if (titleUpper.includes("PART 7") || titleUpper.includes("PART-7") || titleUpper.includes("P7")) return "PART 7";
    return "PART 5";
  }, [card]);

  const partDirections = useMemo(() => {
    const configs = {
      "PART 5": {
        title: "PART 5: INCOMPLETE SENTENCES",
        partNum: "PART 5",
        subtitle: "Hoàn thành câu đơn",
        scope: "Questions 101 – 130 (30 questions)",
        directionsEn:
          "Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.",
        directionsVi:
          "Hướng dẫn: Mỗi câu dưới đây bị khuyết một từ hoặc cụm từ. Bốn phương án trả lời được cung cấp bên dưới mỗi câu. Chọn đáp án thích hợp nhất để hoàn thành câu và đánh dấu vào chữ cái (A), (B), (C) hoặc (D) trên phiếu trả lời của bạn.",
        timing: "Thời gian đề xuất: 10 – 12 phút (tối đa 30s/câu)",
        tips: [
          "Xác định từ loại xung quanh chỗ trống (danh từ, động từ, tính từ, trạng từ).",
          "Phân biệt câu hỏi ngữ pháp (nhìn dấu hiệu) và từ vựng (cần dịch nghĩa).",
          "Nếu là ngữ pháp thuần túy, chọn nhanh không cần dịch cả câu để tiết kiệm thời gian cho Part 7.",
        ],
      },
      "PART 6": {
        title: "PART 6: TEXT COMPLETION",
        partNum: "PART 6",
        subtitle: "Điền từ vào đoạn văn",
        scope: "Questions 131 – 146 (16 questions / 4 passages)",
        directionsEn:
          "Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text. Then mark the letter (A), (B), (C), or (D) on your answer sheet.",
        directionsVi:
          "Hướng dẫn: Đọc các đoạn văn sau. Một từ, cụm từ hoặc câu bị khuyết ở các phần của mỗi đoạn văn. Bốn lựa chọn trả lời cho mỗi câu hỏi được đưa ra bên dưới đoạn văn. Chọn câu trả lời tốt nhất để hoàn thành đoạn văn. Sau đó đánh dấu vào chữ cái (A), (B), (C) hoặc (D) trên phiếu trả lời của bạn.",
        timing: "Thời gian đề xuất: 8 – 10 phút (khoảng 2 phút/đoạn văn)",
        tips: [
          "Mỗi đoạn gồm 4 câu khuyết, trong đó có 3 câu điền từ/ngữ pháp và 1 câu điền nguyên câu văn.",
          "Với câu điền cả câu (sentence insertion), luôn đọc kỹ câu phía trước và câu phía sau để đảm bảo mạch liên kết ngữ nghĩa.",
          "Chú ý các từ nối và liên từ chuyển ý (However, Therefore, In addition, Consequently).",
        ],
      },
      "PART 7": {
        title: "PART 7: READING COMPREHENSION",
        partNum: "PART 7",
        subtitle: "Đọc hiểu văn bản",
        scope: "Questions 147 – 200 (54 questions)",
        directionsEn:
          "Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, letters, and advertisements. Each text is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D) on your answer sheet.",
        directionsVi:
          "Hướng dẫn: Trong phần này bạn sẽ đọc tuyển tập các văn bản, chẳng hạn như bài báo, thư từ, quảng cáo, email, tin nhắn trực tuyến và hoá đơn. Mỗi bài đọc có một số câu hỏi đi kèm. Chọn phương án trả lời chính xác nhất cho mỗi câu hỏi và đánh dấu vào chữ cái (A), (B), (C) hoặc (D) trên phiếu trả lời của bạn.",
        timing: "Thời gian đề xuất: 50 – 55 phút (~1 phút/câu)",
        tips: [
          "Bao gồm đoạn đơn (147-175), đoạn kép (176-185) và đoạn ba (186-200).",
          "Đọc lướt tiêu đề, đối tượng người gửi/nhận trước khi đọc câu hỏi.",
          "Ở đoạn kép và đoạn ba, câu 4 & 5 thường là câu hỏi liên kết thông tin đa văn bản (cross-text reference).",
        ],
      },
    };
    return configs[workspacePart] || configs["PART 5"];
  }, [workspacePart]);

  // Timer effect (pauses while Resume/Restart confirmation dialog is visible or when timer is hidden)
  React.useEffect(() => {
    if (!showTimer || showResumePromptModal) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showTimer, showResumePromptModal]);

  const totalQuestionsCount = isRedoWrongOnly
    ? activeQuestions.length
    : (card.totalQuestions || fullQuestions.length);

  const currentSessionCorrect = useMemo(() => {
    let count = 0;
    passageGroups.forEach((group, gIdx) => {
      if (checkedGroups[gIdx]) {
        group.questions.forEach((item) => {
          const ans = userAnswers[item.globalIndex];
          if (ans !== undefined && ans === item.question.correctIndex) {
            count++;
          }
        });
      }
    });
    return count;
  }, [passageGroups, checkedGroups, userAnswers]);
  // Thống kê trạng thái câu hỏi cho Modal danh sách
  const questionGridStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let bookmarked = 0;
    let answered = 0;
    let unanswered = 0;

    activeQuestions.forEach((q, gIdx) => {
      const isBookmarked = !!bookmarkedQuestions[`${card.id}-${gIdx}`];
      if (isBookmarked) bookmarked++;

      const grpIdx = passageGroups.findIndex((g) =>
        g.questions.some((item) => item.globalIndex === gIdx)
      );
      const isGrpChecked = grpIdx !== -1 ? !!checkedGroups[grpIdx] : false;
      const ans = userAnswers[gIdx];

      if (ans !== undefined) {
        answered++;
        if (isGrpChecked) {
          if (ans === q.correctIndex) {
            correct++;
          } else {
            wrong++;
          }
        }
      } else {
        unanswered++;
      }
    });

    return { correct, wrong, bookmarked, answered, unanswered, total: activeQuestions.length };
  }, [activeQuestions, bookmarkedQuestions, card.id, passageGroups, checkedGroups, userAnswers]);

  // Nhóm câu hỏi theo từng Part (Part 5, Part 6, Part 7) để hiển thị lưới tròn gọn gàng
  const groupedPartSections = useMemo(() => {
    interface PartSectionItem {
      partKey: string;
      partTitle: string;
      items: {
        question: SampleQuestion;
        globalIndex: number;
        passageGroupIndex: number;
        questionNumDisplay: string;
        isBookmarked: boolean;
        isGrpChecked: boolean;
        isAnswered: boolean;
        isCorrect: boolean;
        isCurrent: boolean;
      }[];
    }

    const sectionsMap = new Map<string, PartSectionItem>();

    activeQuestions.forEach((q, gIdx) => {
      const grpIdx = passageGroups.findIndex((g) =>
        g.questions.some((item) => item.globalIndex === gIdx)
      );

      let partKey = "part5";
      let partTitle = "Part 5: Hoàn thành câu (Incomplete Sentences)";

      const rawNum = q.questionNum ? parseInt(q.questionNum.replace(/\D/g, ""), 10) : null;
      if (rawNum !== null && !isNaN(rawNum)) {
        if (rawNum >= 1 && rawNum <= 6) {
          partKey = "part1";
          partTitle = "Part 1: Mô tả tranh (Photographs)";
        } else if (rawNum >= 7 && rawNum <= 31) {
          partKey = "part2";
          partTitle = "Part 2: Hỏi & Đáp (Question - Response)";
        } else if (rawNum >= 32 && rawNum <= 70) {
          partKey = "part3";
          partTitle = "Part 3: Đoạn hội thoại (Conversations)";
        } else if (rawNum >= 71 && rawNum <= 100) {
          partKey = "part4";
          partTitle = "Part 4: Bài nói ngắn (Short Talks)";
        } else if (rawNum >= 101 && rawNum <= 130) {
          partKey = "part5";
          partTitle = "Part 5: Hoàn thành câu (Incomplete Sentences)";
        } else if (rawNum >= 131 && rawNum <= 146) {
          partKey = "part6";
          partTitle = "Part 6: Điền đoạn văn (Text Completion)";
        } else if (rawNum >= 147 && rawNum <= 200) {
          partKey = "part7";
          partTitle = "Part 7: Đọc hiểu văn bản (Reading Comprehension)";
        }
      } else if (card.category === "part6") {
        partKey = "part6";
        partTitle = "Part 6: Điền đoạn văn (Text Completion)";
      } else if (card.category === "part7") {
        partKey = "part7";
        partTitle = "Part 7: Đọc hiểu văn bản (Reading Comprehension)";
      } else if (card.category === "grammar") {
        partKey = "part5-grammar";
        partTitle = "Ngữ pháp trọng điểm TOEIC (Part 5)";
      }

      if (!sectionsMap.has(partKey)) {
        sectionsMap.set(partKey, {
          partKey,
          partTitle,
          items: [],
        });
      }

      const isBookmarked = !!bookmarkedQuestions[`${card.id}-${gIdx}`];
      const isGrpChecked = grpIdx !== -1 ? !!checkedGroups[grpIdx] : false;
      const isAnswered = userAnswers[gIdx] !== undefined;
      const isCorrect = isAnswered && userAnswers[gIdx] === q.correctIndex;
      const isCurrent = currentGroup?.questions.some((item) => item.globalIndex === gIdx) || false;
      const questionNumDisplay = q.questionNum || String(gIdx + 1);

      sectionsMap.get(partKey)!.items.push({
        question: q,
        globalIndex: gIdx,
        passageGroupIndex: grpIdx,
        questionNumDisplay,
        isBookmarked,
        isGrpChecked,
        isAnswered,
        isCorrect,
        isCurrent,
      });
    });

    return Array.from(sectionsMap.values());
  }, [activeQuestions, passageGroups, card, bookmarkedQuestions, checkedGroups, userAnswers, currentGroup]);

  const currentGroupFirstQuestion: SampleQuestion = currentGroup?.questions?.[0]?.question || card.sampleQuestions[0];
  const questionRef = `READING-${card.id}-${currentGroupFirstQuestion?.questionNum || currentGroupIndex + 1}`;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const answeredInGroupCount = currentGroup
    ? currentGroup.questions.filter((item) => userAnswers[item.globalIndex] !== undefined).length
    : 0;
  const isAllAnsweredInGroup = currentGroup
    ? answeredInGroupCount === currentGroup.questions.length
    : false;

  const syncProgressFromState = (
    nextAnswers: Record<number, number>,
    nextChecked: Record<number, boolean>
  ) => {
    let correctCount = 0;
    let wrongCount = 0;
    const wrongIds: (number | string)[] = [];
    const answeredIds: (number | string)[] = [];

    passageGroups.forEach((grp, grpIdx) => {
      if (!nextChecked[grpIdx]) return;
      grp.questions.forEach((item) => {
        const chosen = nextAnswers[item.globalIndex];
        if (chosen === undefined) return;
        const origIdx = fullQuestions.findIndex(
          (q) => (q.questionNum && q.questionNum === item.question.questionNum) || q.question === item.question.question
        );
        const qId = item.question.questionNum || (origIdx !== -1 ? origIdx + 1 : item.globalIndex + 1);
        answeredIds.push(qId);
        if (chosen === item.question.correctIndex) {
          correctCount++;
        } else {
          wrongCount++;
          wrongIds.push(qId);
        }
      });
    });

    setSessionCorrectCount(correctCount);
    setSessionWrongCount(wrongCount);

    const total = card.totalQuestions || fullQuestions.length;
    if (!isRedoWrongOnly) {
      if (Object.keys(nextAnswers).length === 0 && answeredIds.length === 0) {
        resetItemProgress(`reading-${card.id}`, total);
        void saveReadingProgress(card.id, 0, 0, 0);
      } else {
        saveItemProgress(
          `reading-${card.id}`,
          answeredIds.length,
          total,
          undefined,
          correctCount,
          wrongCount,
          wrongIds,
          undefined,
          answeredIds
        );
        void saveReadingProgress(card.id, answeredIds.length, correctCount, wrongCount);
        try {
          localStorage.setItem(
            `toeic_reading_answers_${card.id}`,
            JSON.stringify({
              answers: nextAnswers,
              checkedGroups: nextChecked,
              correctCount,
              wrongCount,
            })
          );
        } catch {}
      }

      const nextUnanswered = findFirstUnansweredGroup(nextAnswers, nextChecked);
      setSavedLogSummary({
        hasSavedLog: Object.keys(nextAnswers).length > 0,
        answeredCount: Math.max(answeredIds.length, Object.keys(nextAnswers).length),
        firstUncheckedGroup: nextUnanswered !== -1 ? nextUnanswered : 0,
        allCompleted: passageGroups.length > 0 && nextUnanswered === -1,
      });
    }
  };

  const syncRedoAnswersToSavedLog = (nextAnswers: Record<number, number>) => {
    try {
      const saved = localStorage.getItem(`toeic_reading_answers_${card.id}`);
      const parsed = saved ? JSON.parse(saved) : { answers: {}, checkedGroups: {} };
      const updatedAnswers: Record<number, number> = { ...(parsed.answers || {}) };
      currentGroup.questions.forEach((item) => {
        const origIdx = fullQuestions.findIndex(
          (q) => (q.questionNum && q.questionNum === item.question.questionNum) || q.question === item.question.question
        );
        if (origIdx !== -1 && nextAnswers[item.globalIndex] !== undefined) {
          updatedAnswers[origIdx] = nextAnswers[item.globalIndex];
        }
      });

      let recalculatedCorrect = 0;
      let recalculatedWrong = 0;
      fullQuestions.forEach((q, idx) => {
        const ans = updatedAnswers[idx];
        if (ans !== undefined) {
          if (ans === q.correctIndex) recalculatedCorrect++;
          else recalculatedWrong++;
        }
      });

      localStorage.setItem(
        `toeic_reading_answers_${card.id}`,
        JSON.stringify({
          ...parsed,
          answers: updatedAnswers,
          correctCount: recalculatedCorrect,
          wrongCount: recalculatedWrong,
        })
      );
      const updatedProg = getItemProgress(`reading-${card.id}`, card.totalQuestions || fullQuestions.length);
      void saveReadingProgress(
        card.id,
        updatedProg.completedQuestions || 0,
        updatedProg.correctAnswers || 0,
        updatedProg.wrongAnswers || 0
      );
    } catch {}
  };

  const handleSelectOption = (globalIndex: number, optIdx: number, correctIdx: number) => {
    if (checkedGroups[currentGroupIndex]) return;

    if (isMultiQuestionGroup) {
      // For multi-question passages (Part 6/7): record choice and auto-check when all questions are answered
      const nextAnswers = { ...userAnswers, [globalIndex]: optIdx };
      setUserAnswers(nextAnswers);
      if (isSfxEnabled) playSfx("click");

      const allDone = currentGroup.questions.every(
        (item) => nextAnswers[item.globalIndex] !== undefined
      );

      const nextChecked = { ...checkedGroups };

      if (allDone) {
        nextChecked[currentGroupIndex] = true;
        setCheckedGroups(nextChecked);

        let groupCorrect = 0;
        currentGroup.questions.forEach((item) => {
          const selected = nextAnswers[item.globalIndex];
          if (selected === item.question.correctIndex) {
            groupCorrect++;
          }
        });

        const addedScore = groupCorrect * 10;
        setEnergyScore((prev) => prev + addedScore);

        if (isRedoWrongOnly) {
          currentGroup.questions.forEach((item) => {
            const selected = nextAnswers[item.globalIndex] !== undefined ? nextAnswers[item.globalIndex] : userAnswers[item.globalIndex];
            const isItemCorrect = selected === item.question.correctIndex;
            const origIdx = fullQuestions.findIndex(
              (q) => (q.questionNum && q.questionNum === item.question.questionNum) || q.question === item.question.question
            );
            const qIdentifier = item.question.questionNum || (origIdx !== -1 ? origIdx + 1 : item.globalIndex + 1);
            recordQuestionAnswer(
              `reading-${card.id}`,
              qIdentifier,
              isItemCorrect,
              card.totalQuestions || fullQuestions.length
            );
          });
          setSessionCorrectCount((prev) => prev + groupCorrect);
          setSessionWrongCount((prev) => prev + (currentGroup.questions.length - groupCorrect));
          syncRedoAnswersToSavedLog(nextAnswers);
        } else {
          syncProgressFromState(nextAnswers, nextChecked);
        }

        if (groupCorrect === currentGroup.questions.length) {
          if (isSfxEnabled) playSfx("correct");
          showToast(`Xuất sắc! Đúng cả ${groupCorrect}/${currentGroup.questions.length} câu! 🎉 +${addedScore} Năng lượng ⚡`);
        } else {
          if (isSfxEnabled) playSfx("wrong");
          showToast(`Đúng ${groupCorrect}/${currentGroup.questions.length} câu. Đã hiển thị giải thích chi tiết ở dưới!`);
        }
      } else if (!isRedoWrongOnly) {
        // Lưu tạm các câu đã chọn dở trong đoạn Part 6/7 để không mất khi thoát ra
        try {
          localStorage.setItem(
            `toeic_reading_answers_${card.id}`,
            JSON.stringify({
              answers: nextAnswers,
              checkedGroups: nextChecked,
              correctCount: sessionCorrectCount,
              wrongCount: sessionWrongCount,
            })
          );
        } catch {}
      }
    } else {
      // For single-question items (Part 5): select and check immediately
      const correct = optIdx === correctIdx;
      const nextAnswers = { ...userAnswers, [globalIndex]: optIdx };
      const nextChecked = { ...checkedGroups, [currentGroupIndex]: true };

      setUserAnswers(nextAnswers);
      setCheckedGroups(nextChecked);

      if (isRedoWrongOnly) {
        const singleItem = currentGroup.questions[0]?.question;
        const origIdx = fullQuestions.findIndex(
          (q) => (q.questionNum && q.questionNum === singleItem?.questionNum) || q.question === singleItem?.question
        );
        const qIdentifier = singleItem?.questionNum || (origIdx !== -1 ? origIdx + 1 : globalIndex + 1);
        recordQuestionAnswer(
          `reading-${card.id}`,
          qIdentifier,
          correct,
          card.totalQuestions || fullQuestions.length
        );
        if (correct) setSessionCorrectCount((prev) => prev + 1);
        else setSessionWrongCount((prev) => prev + 1);
        syncRedoAnswersToSavedLog(nextAnswers);
      } else {
        syncProgressFromState(nextAnswers, nextChecked);
      }

      if (correct) {
        if (isSfxEnabled) playSfx("correct");
        setEnergyScore((prev) => prev + 10);
        showToast("Chính xác! +10 Năng lượng ⚡");
      } else {
        if (isSfxEnabled) playSfx("wrong");
        showToast("Chưa đúng rồi! Hãy xem giải thích chi tiết ở dưới.");
      }
    }
  };

  const handleCheckCurrentGroup = () => {
    if (!currentGroup) return;
    if (!isAllAnsweredInGroup) {
      showToast(`Vui lòng chọn đáp án cho cả ${currentGroup.questions.length} câu hỏi trước khi kiểm tra! 📝`);
      return;
    }

    const nextChecked = { ...checkedGroups, [currentGroupIndex]: true };
    setCheckedGroups(nextChecked);

    let groupCorrect = 0;
    currentGroup.questions.forEach((item) => {
      const selected = userAnswers[item.globalIndex];
      if (selected === item.question.correctIndex) {
        groupCorrect++;
      }
    });

    const addedScore = groupCorrect * 10;
    setEnergyScore((prev) => prev + addedScore);

    if (isRedoWrongOnly) {
      currentGroup.questions.forEach((item) => {
        const selected = userAnswers[item.globalIndex];
        const isItemCorrect = selected === item.question.correctIndex;
        const origIdx = fullQuestions.findIndex(
          (q) => (q.questionNum && q.questionNum === item.question.questionNum) || q.question === item.question.question
        );
        const qIdentifier = item.question.questionNum || (origIdx !== -1 ? origIdx + 1 : item.globalIndex + 1);
        recordQuestionAnswer(
          `reading-${card.id}`,
          qIdentifier,
          isItemCorrect,
          card.totalQuestions || fullQuestions.length
        );
      });
      setSessionCorrectCount((prev) => prev + groupCorrect);
      setSessionWrongCount((prev) => prev + (currentGroup.questions.length - groupCorrect));
      syncRedoAnswersToSavedLog(userAnswers);
    } else {
      syncProgressFromState(userAnswers, nextChecked);
    }

    if (groupCorrect === currentGroup.questions.length) {
      if (isSfxEnabled) playSfx("correct");
      showToast(`Xuất sắc! Bạn làm đúng cả ${groupCorrect}/${currentGroup.questions.length} câu! 🎉 +${addedScore} Năng lượng ⚡`);
    } else {
      if (isSfxEnabled) playSfx("wrong");
      showToast(`Đúng ${groupCorrect}/${currentGroup.questions.length} câu. Hãy xem giải thích chi tiết ở dưới nhé!`);
    }
  };

  const handleContinueUnanswered = () => {
    if (isSfxEnabled) playSfx("click");
    const nextUnanswered = findFirstUnansweredGroup(userAnswers, checkedGroups);
    if (nextUnanswered !== -1) {
      setCurrentGroupIndex(nextUnanswered);
      const firstQNum = passageGroups[nextUnanswered]?.questions?.[0]?.question?.questionNum;
      showToast(
        passageGroups[nextUnanswered]?.questions?.length > 1
          ? `Đang tiếp tục tại Đoạn ${nextUnanswered + 1} (chưa hoàn thành)`
          : `Đang tiếp tục tại Câu ${firstQNum || nextUnanswered + 1} (chưa làm)`
      );
    } else {
      setCurrentGroupIndex(0);
      showToast("Bạn đã hoàn thành tất cả các câu — đang mở chế độ xem lại bài!");
    }
    setShowResumePromptModal(false);
  };

  const handleRestartAll = () => {
    setUserAnswers({});
    setCheckedGroups({});
    setSessionCorrectCount(0);
    setSessionWrongCount(0);
    setEnergyScore(0);
    setTimerSeconds(0);
    setCurrentGroupIndex(0);
    setShowResumePromptModal(false);
    setSavedLogSummary({
      hasSavedLog: false,
      answeredCount: 0,
      firstUncheckedGroup: 0,
      allCompleted: false,
    });

    if (!isRedoWrongOnly) {
      try {
        localStorage.removeItem(`toeic_reading_answers_${card.id}`);
      } catch {}
      resetItemProgress(`reading-${card.id}`, totalQuestionsCount);
      void saveReadingProgress(card.id, 0, 0, 0);
    }
    showToast("Đã xoá kết quả cũ — bắt đầu làm lại từ đầu! ↺");
  };

  const handleResetCurrentGroup = () => {
    if (!currentGroup) return;
    const nextChecked = { ...checkedGroups, [currentGroupIndex]: false };
    const nextAnswers = { ...userAnswers };
    currentGroup.questions.forEach((item) => {
      delete nextAnswers[item.globalIndex];
    });

    setCheckedGroups(nextChecked);
    setUserAnswers(nextAnswers);
    syncProgressFromState(nextAnswers, nextChecked);
    showToast("Đã đặt lại để bạn làm lại câu / đoạn này! ↺");
  };

  const jumpToQuestion = (targetGlobalIndex: number) => {
    const groupIdx = passageGroups.findIndex((g) =>
      g.questions.some((item) => item.globalIndex === targetGlobalIndex)
    );
    if (groupIdx !== -1) {
      setCurrentGroupIndex(groupIdx);
    }
    setIsQuestionGridOpen(false);
    const qNum = activeQuestions[targetGlobalIndex]?.questionNum;
    if (qNum) {
      setTimeout(() => {
        const el = document.getElementById(`question-card-${qNum}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 120);
    }
  };

  const handleNextGroup = () => {
    if (currentGroupIndex < passageGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
    }
  };

  const handlePrevGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
    }
  };

  const handleSearchDict = () => {
    if (!dictQuery.trim()) return;
    handleTriggerLookup(dictQuery.trim());
  };

  const highlightSelection = (color: "yellow" | "green" | "pink" | "blue" = annotatorColor) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      showToast("Vui lòng bôi đen từ hoặc câu cần highlight trước!");
      return;
    }
    const rawText = sel.toString().trim();
    if (!rawText) return;

    try {
      const range = sel.getRangeAt(0);
      const mark = document.createElement("mark");
      const colorMap: Record<string, string> = {
        yellow: "bg-yellow-200 text-slate-900 px-0.5 rounded",
        green: "bg-emerald-200 text-slate-900 px-0.5 rounded",
        pink: "bg-pink-200 text-slate-900 px-0.5 rounded",
        blue: "bg-sky-200 text-slate-900 px-0.5 rounded",
      };
      mark.className = `toeic-user-highlight ${colorMap[color] || colorMap.yellow}`;
      mark.title = "Đoạn đã highlight";
      range.surroundContents(mark);
      sel.removeAllRanges();
      setShowLookupTooltip(false);
      showToast("Đã highlight đoạn văn bản! ✏️");
    } catch {
      try {
        const hexMap: Record<string, string> = {
          yellow: "#fef08a",
          green: "#a7f3d0",
          pink: "#fbcfe8",
          blue: "#bae6fd",
        };
        document.execCommand("hiliteColor", false, hexMap[color] || "#fef08a");
        setShowLookupTooltip(false);
        showToast("Đã highlight đoạn văn bản! ✏️");
      } catch {
        showToast("Vui lòng bôi đen trọn vẹn văn bản trong cùng một đoạn.");
      }
    }
  };

  const handleClearAllHighlights = () => {
    const highlights = document.querySelectorAll(".toeic-user-highlight");
    highlights.forEach((el) => {
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
    });
    showToast("Đã xóa tất cả highlight trên bài đọc!");
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".no-lookup-select")) return;

    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setShowLookupTooltip(false);
        return;
      }
      const rawText = sel.toString().trim();
      if (!rawText || rawText.length < 1 || rawText.length > 50) {
        setShowLookupTooltip(false);
        return;
      }

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8,
          });
          setSelectedLookupWord(rawText);
          setShowLookupTooltip(true);
        }
      } catch (err) {
        setShowLookupTooltip(false);
      }
    }, 15);
  };

  const formatPosBadge = (pos?: string) => {
    if (!pos) return { label: "Từ vựng", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" };
    const p = pos.toLowerCase().trim();
    if (p === "n" || p === "noun") return { label: "Danh từ (Noun)", badgeClass: "bg-blue-100 text-blue-800 border-blue-200" };
    if (p === "v" || p === "verb") return { label: "Động từ (Verb)", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (p === "adj" || p === "adjective") return { label: "Tính từ (Adjective)", badgeClass: "bg-amber-100 text-amber-800 border-amber-200" };
    if (p === "adv" || p === "adverb") return { label: "Trạng từ (Adverb)", badgeClass: "bg-purple-100 text-purple-800 border-purple-200" };
    if (p === "prep" || p === "preposition") return { label: "Giới từ (Preposition)", badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200" };
    if (p === "conj" || p === "conjunction") return { label: "Liên từ (Conjunction)", badgeClass: "bg-pink-100 text-pink-800 border-pink-200" };
    if (p === "pron" || p === "pronoun") return { label: "Đại từ (Pronoun)", badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200" };
    if (p === "phrase" || p === "phr") return { label: "Cụm từ (Phrase)", badgeClass: "bg-teal-100 text-teal-800 border-teal-200" };
    return { label: pos.toUpperCase(), badgeClass: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  const handleTriggerLookup = async (wordToLookup?: string) => {
    const rawTarget = (wordToLookup || selectedLookupWord || "").trim();
    if (!rawTarget) return;

    // Clean up punctuation (e.g. "(morning," -> "morning")
    const cleanWord = rawTarget.replace(/^[^\w]+|[^\w]+$/g, "");
    if (!cleanWord) return;

    // Find in passage/card vocabulary for instant fallback
    const vocabMatch = Array.from(combinedGroupVocab.values()).find(
      (v) => (v.word || "").toLowerCase() === cleanWord.toLowerCase()
    );

    // Initial sync lookup so modal opens immediately with no delay
    const initialDetail = lookupWordDetail(
      cleanWord,
      vocabMatch
        ? {
            meaning: vocabMatch.meaning,
            pos: vocabMatch.pos || "n",
            ipa: vocabMatch.ipa,
            exampleEn: vocabMatch.example?.en,
            exampleVi: vocabMatch.example?.vi,
            synonyms: (vocabMatch.synonyms || []).map((s) => ({ word: s.en, meaning: s.vi })),
            antonyms: (vocabMatch.antonyms || []).map((a) => ({ word: a.en, meaning: a.vi })),
          }
        : undefined
    );
    setRichWordData(initialDetail);
    setIsCardFlipped(false);
    setActiveCardTab("word");
    setShowLookupTooltip(false);
    setShowRichLookupModal(true);
    if (isSfxEnabled) playSfx("click");

    // Live online dictionary lookup (meanings, part of speech, synonyms, antonyms)
    setIsDictLoading(true);
    try {
      const liveDict = await lookupEnglishDictionary(cleanWord);
      if (liveDict) {
        setRichWordData((prev) => {
          if (!prev || prev.word.toLowerCase() !== cleanWord.toLowerCase()) return prev;

          const posVal = liveDict.meanings?.[0]?.partOfSpeech || prev.pos || "n";
          const primaryDef = liveDict.meanings?.[0]?.definition || prev.contextMeaning;
          const ipaVal = liveDict.phonetic || prev.usIpa;

          // Process synonyms
          const syns: { word: string; meaning: string }[] = [];
          if (liveDict.synonyms && liveDict.synonyms.length > 0) {
            liveDict.synonyms.forEach((s) => {
              syns.push({ word: s, meaning: "đồng nghĩa" });
            });
          }
          const finalSynonyms = syns.length > 0 ? syns : prev.synonyms;

          // Process antonyms
          const ants: { word: string; meaning: string }[] = [];
          if (liveDict.antonyms && liveDict.antonyms.length > 0) {
            liveDict.antonyms.forEach((a) => {
              ants.push({ word: a, meaning: "trái nghĩa" });
            });
          }
          const finalAntonyms = ants.length > 0 ? ants : (prev.antonyms || []);

          const extraMeanings = (liveDict.meanings || []).map((m) => ({
            partOfSpeech: m.partOfSpeech || posVal,
            definition: m.definition,
            example: m.example,
          }));

          const updatedTabs = [
            { id: "word", label: "Từ", en: prev.word, vi: primaryDef },
            ...(prev.cardTabs?.filter((t) => t.id !== "word") || []),
          ];

          return {
            ...prev,
            usIpa: ipaVal,
            ukIpa: ipaVal,
            pos: posVal,
            contextMeaning: primaryDef,
            extraMeanings,
            synonyms: finalSynonyms,
            antonyms: finalAntonyms,
            cardTabs: updatedTabs,
            exampleEn: prev.exampleEn || liveDict.meanings?.[0]?.example,
          };
        });
      }
    } catch {
      // Keep static curated / fallback data if network request fails
    } finally {
      setIsDictLoading(false);
    }
  };

  const speakWord = (text: string, lang: "en-US" | "en-GB" = "en-US") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      onMouseUp={handleMouseUp}
      className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900 animate-in fade-in duration-150"
    >
      {/* HEADER */}
      <header className="min-h-14 bg-[#1e60f0] text-white px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md shrink-0 select-none">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (isSfxEnabled) playSfx("click");
              onClose();
            }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate max-w-[160px] sm:max-w-xs lg:max-w-md">
            {card.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsBilingual(!isBilingual);
              if (isSfxEnabled) playSfx("click");
              showToast(isBilingual ? "Đã tắt hiển thị song ngữ" : "Đã bật dịch song ngữ Tiếng Việt 👑");
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isBilingual
                ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Song ngữ 👑</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDirectionsModal(true);
              if (isSfxEnabled) playSfx("click");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-white/20"
            title="Xem hướng dẫn làm bài chuẩn ETS TOEIC (Directions)"
          >
            <Info className="w-3.5 h-3.5 text-blue-200" />
            <span>{partDirections.partNum} Directions</span>
          </button>

          {!isRedoWrongOnly && (
            <button
              type="button"
              onClick={() => {
                if (isSfxEnabled) playSfx("click");
                if (Object.keys(userAnswers).length > 0) {
                  setShowResumePromptModal(true);
                } else {
                  handleRestartAll();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-white/25"
              title="Xoá kết quả cũ và làm lại bài từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm lại từ đầu</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (currentGroup && currentGroup.questions.length > 0) {
                const firstQ = currentGroup.questions[0].question;
                setSelectedNoteQKey(firstQ.questionNum || String(currentGroup.questions[0].globalIndex + 1));
              }
              setIsNotesModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all cursor-pointer relative"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Ghi chú</span>
            {Object.keys(practiceUserNotes).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute -top-0.5 -right-0.5"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAnnotatorActive(!isAnnotatorActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isAnnotatorActive ? "bg-amber-400 text-slate-950 font-bold" : "bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Annotator</span>
          </button>

          <div className="flex items-center gap-1.5">
            {showTimer && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                {formatTimer(timerSeconds)}
              </span>
            )}
            {readingConfig?.speedDrillMode && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-bold">
                ⚡ Speed Drill
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
              {energyScore}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
              ✓ {currentSessionCorrect}/{totalQuestionsCount}
            </span>
          </div>
        </div>
      </header>

      {/* ANNOTATOR BAR */}
      {isAnnotatorActive && (
        <div className="bg-amber-100/95 border-b border-amber-300 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs select-none text-xs animate-in slide-in-from-top-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-amber-700" />
              Công cụ Annotator:
            </span>
            <span className="text-amber-900 text-[11px] hidden sm:inline">Bôi đen văn bản rồi bấm màu để highlight:</span>
            <div className="flex items-center gap-1.5">
              {(["yellow", "green", "pink", "blue"] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  title={`Tô highlight màu ${color}`}
                  onClick={() => {
                    setAnnotatorColor(color);
                    highlightSelection(color);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                    color === "yellow"
                      ? "bg-yellow-400 border-yellow-500"
                      : color === "green"
                      ? "bg-emerald-400 border-emerald-500"
                      : color === "pink"
                      ? "bg-pink-400 border-pink-500"
                      : "bg-sky-400 border-sky-500"
                  } ${annotatorColor === color ? "scale-115 ring-2 ring-slate-800" : "opacity-75 hover:opacity-100"}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleClearAllHighlights}
              className="px-2.5 py-1 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold text-[11px] transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Xóa highlight
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsAnnotatorActive(false)}
            className="p-1 rounded-full text-amber-900 hover:bg-amber-200 transition cursor-pointer"
            title="Đóng Annotator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN DUAL PANE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-100">
        {/* LEFT PANE - PASSAGE DISPLAY */}
        <div
          ref={leftPaneRef}
          className="w-full md:w-1/2 p-4 sm:p-6 md:overflow-y-auto custom-scrollbar bg-[#fafafa] md:border-r border-b md:border-b-0 border-slate-200/80 flex flex-col justify-between space-y-6 shrink-0 md:shrink"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Yêu cầu bài tập (Instruction)</span>
              </div>
              {isMultiQuestionGroup && (
                <span className="text-xs font-extrabold text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full">
                  Đoạn {currentGroupIndex + 1} / {passageGroups.length} ({currentGroup.questions.length} câu hỏi)
                </span>
              )}
            </div>

            {(() => {
              const subPassages: ReadingSubPassage[] =
                currentGroup.passages && currentGroup.passages.length > 0
                  ? currentGroup.passages
                  : (currentGroup.passageText || card.passageText)
                  ? [
                      {
                        label: "Bài đọc",
                        text: currentGroup.passageText || card.passageText || "",
                        textVi: currentGroup.passageTextVi || card.passageTextVi,
                      },
                    ]
                  : [];

              if (subPassages.length === 0 || workspacePart === "PART 5") {
                return (
                  <div className="space-y-5">
                    {/* KHUNG ETS PART 5 DIRECTIONS CHUẨN ĐỀ THI */}
                    <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 sm:p-7 shadow-xs border-l-4 border-l-emerald-600 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black tracking-wider uppercase">
                            {partDirections.partNum}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {partDirections.subtitle}
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {partDirections.scope}
                        </span>
                      </div>

                      {/* DIRECTIONS FORMULATION */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 font-sans">
                        <p className="text-[13px] text-slate-900 leading-relaxed">
                          <strong className="font-extrabold text-slate-950 uppercase tracking-wide">Directions: </strong>
                          A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.
                        </p>

                        {(isBilingual || showPassageTranslation) && (
                          <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 leading-relaxed">
                            <strong className="text-emerald-800 block mb-0.5">Hướng dẫn tiếng Việt:</strong>
                            {partDirections.directionsVi}
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-emerald-950">
                          <span>⏱️ {partDirections.timing}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {partDirections.tips.map((tip, idx) => (
                            <li key={idx} className="leading-relaxed">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              }

              const isMultiPassage = subPassages.length > 1;

              return (
                <div className="space-y-6">
                  {/* THANH DIRECTIONS BÀI THI CHUẨN ETS CHO PART 6 & PART 7 */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 tracking-wide uppercase">
                        {partDirections.partNum} • DIRECTIONS
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {partDirections.timing}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {isBilingual ? partDirections.directionsVi : partDirections.directionsEn}
                    </p>
                  </div>

                  {currentGroup.passageTitle && (
                    <div className="p-3.5 rounded-xl bg-slate-100/90 text-sm font-bold text-slate-800 border border-slate-200 shadow-2xs">
                      {currentGroup.passageTitle}
                    </div>
                  )}

                  {/* Thanh điều khiển phụ cho đoạn văn */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isMultiPassage
                        ? `Bộ ${subPassages.length} văn bản đọc liên kết (Passage 1 -> ${subPassages.length})`
                        : "Văn bản đọc (Reading Passage)"}
                    </span>
                    {subPassages.some((p) => Boolean(p.textVi || (subPassages.length === 1 && (currentGroup.passageTextVi || card.passageTextVi)) || getSmartPassageTranslation(p.text))) && (
                      <button
                        type="button"
                        onClick={() => setShowPassageTranslation((prev) => !prev)}
                        className="px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                      >
                        <Languages className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{showPassageTranslation ? "Ẩn bản dịch tiếng Việt" : "Hiện bản dịch tiếng Việt"}</span>
                      </button>
                    )}
                  </div>

                  {/* DANH SÁCH CÁC ĐOẠN VĂN: Đoạn 1 kết thúc hoàn toàn rồi mới tới Đoạn 2 */}
                  {subPassages.map((sub, pIdx) => {
                    const resolvedTextVi =
                      sub.textVi ||
                      (subPassages.length === 1 ? (currentGroup.passageTextVi || card.passageTextVi) : undefined) ||
                      getSmartPassageTranslation(sub.text);
                    const hasTranslation = Boolean(resolvedTextVi);
                    const showThisTranslation =
                      hasTranslation && (showPassageTranslation || (isBilingual && isCurrentGroupChecked) || isCurrentGroupChecked);

                    return (
                      <div
                        key={pIdx}
                        className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 sm:p-7 shadow-xs border-l-4 border-l-blue-600 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
                              {isMultiPassage ? `📄 Văn bản ${pIdx + 1} / ${subPassages.length}` : "📄 Reading Passage"}
                            </span>
                            {sub.label && sub.label !== "Bài đọc" && sub.label !== "Văn bản đọc" && (
                              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {sub.label}
                              </span>
                            )}
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            English
                          </span>
                        </div>

                        {/* Đoạn văn tiếng Anh: hỗ trợ bấm trực tiếp các ô trống [131]-[146] trong Part 6 */}
                        <div className="text-base sm:text-lg font-normal sm:font-medium font-sans whitespace-pre-line text-slate-900 leading-relaxed sm:leading-loose select-text">
                          {(() => {
                            const questionByNum = new Map<string, PassageQuestionItem>();
                            currentGroup.questions.forEach((item) => {
                              const num = String(item.question.questionNum || "").replace(/\D/g, "");
                              if (num) questionByNum.set(num, item);
                            });
                            const blankRegex = /((?:[-_]{3,}\s*)?\[\s*(\d{3})\s*\](?:\s*[-_]{3,})?|\(\s*(\d{3})\s*\)\s*[-_]{2,})/g;
                            if (!blankRegex.test(sub.text)) {
                              return sub.text;
                            }
                            const parts: React.ReactNode[] = [];
                            let lastIdx = 0;
                            blankRegex.lastIndex = 0;
                            let match: RegExpExecArray | null;
                            while ((match = blankRegex.exec(sub.text)) !== null) {
                              if (match.index > lastIdx) {
                                parts.push(sub.text.slice(lastIdx, match.index));
                              }
                              const qNum = match[2] || match[3];
                              const matchedItem = qNum ? questionByNum.get(qNum) : undefined;
                              if (matchedItem) {
                                const ansIdx = userAnswers[matchedItem.globalIndex];
                                const letter = ansIdx !== undefined ? String.fromCharCode(65 + ansIdx) : null;
                                const isRight = ansIdx !== undefined && ansIdx === matchedItem.question.correctIndex;
                                const pillStyle = isCurrentGroupChecked
                                  ? isRight
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                                    : "bg-rose-100 text-rose-800 border-rose-400"
                                  : letter
                                  ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-400 border-dashed hover:bg-indigo-100";
                                parts.push(
                                  <button
                                    key={`blank-${qNum}-${match.index}`}
                                    type="button"
                                    onClick={() => {
                                      const el = document.getElementById(`question-card-${qNum}`);
                                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                                    }}
                                    className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg border text-sm font-extrabold align-baseline transition cursor-pointer ${pillStyle}`}
                                    title={`Nhảy đến câu ${qNum}`}
                                  >
                                    <span>[{qNum}]</span>
                                    <span>{letter ? `• ${letter}` : "______"}</span>
                                  </button>
                                );
                              } else {
                                parts.push(match[0]);
                              }
                              lastIdx = blankRegex.lastIndex;
                            }
                            if (lastIdx < sub.text.length) {
                              parts.push(sub.text.slice(lastIdx));
                            }
                            return parts;
                          })()}
                        </div>

                        {/* Phần dịch tiếng Việt đặt ngay phía dưới đoạn văn tương ứng */}
                        {showThisTranslation && (
                          <div className="pt-5 mt-4 border-t-2 border-slate-100 space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-blue-900 flex items-center gap-2 text-sm sm:text-base">
                                <Languages className="w-4.5 h-4.5 text-blue-600" />
                                <span>
                                  {isMultiPassage
                                    ? `Bản dịch tiếng Việt (Văn bản ${pIdx + 1}):`
                                    : "Bản dịch tiếng Việt đoạn văn:"}
                                </span>
                              </p>
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                Tiếng Việt
                              </span>
                            </div>
                            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-base sm:text-lg font-normal font-sans whitespace-pre-line text-blue-950 leading-relaxed sm:leading-loose select-text italic">
                              {resolvedTextVi}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* RIGHT PANE - ALL QUESTIONS IN PASSAGE DISPLAYED TOGETHER */}
        <div
          ref={rightPaneRef}
          className="w-full md:w-1/2 p-4 sm:p-6 md:overflow-y-auto custom-scrollbar bg-white flex flex-col justify-between space-y-6"
        >
          <div className="space-y-6">
            {/* RENDER EVERY QUESTION IN CURRENT GROUP */}
            {currentGroup.questions.map((item, qIdxInGroup) => {
              const q = item.question;
              const gIdx = item.globalIndex;
              const userChosen = userAnswers[gIdx];
              const isAnswered = userChosen !== undefined;
              const isRight = userChosen === q.correctIndex;
              const isCardChecked = isCurrentGroupChecked;
              const isQuestionBookmarked = !!bookmarkedQuestions[`${card.id}-${gIdx}`];

              return (
                <div
                  key={gIdx}
                  id={`question-card-${q.questionNum}`}
                  className={`p-6 rounded-3xl border-2 transition-all shadow-xs relative space-y-5 ${
                    isCardChecked
                      ? isRight
                        ? "border-emerald-300 bg-emerald-50/20"
                        : "border-rose-300 bg-rose-50/20"
                      : isAnswered
                      ? "border-blue-400 bg-white ring-2 ring-blue-400/10"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* QUESTION HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-extrabold tracking-wide shadow-2xs">
                        Câu {q.questionNum || gIdx + 1}
                      </span>
                      {isCardChecked && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isRight ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isRight ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng ✓
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Chưa đúng ✕
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const qKey = q.questionNum || String(gIdx + 1);
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNoteQKey(qKey);
                              setActiveNoteTab("current");
                              setIsNotesModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                              practiceUserNotes[qKey]
                                ? "border-blue-400 bg-blue-100/80 text-blue-800"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                            title="Ghi chú cho câu này"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ghi chú {practiceUserNotes[qKey] ? "•" : ""}</span>
                          </button>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => {
                          setHelpQuestion(q);
                          setShowHelpModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Hỏi bài</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const key = `${card.id}-${gIdx}`;
                          setBookmarkedQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
                          showToast(isQuestionBookmarked ? "Đã bỏ đánh dấu câu này" : "Đã đánh dấu cần check lại (màu vàng) ⭐");
                        }}
                        title={isQuestionBookmarked ? "Bỏ đánh dấu cần check lại" : "Đánh dấu cần check lại (hiển thị màu vàng ở bảng câu hỏi) ⭐"}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                          isQuestionBookmarked
                            ? "border-amber-400 bg-amber-100 text-amber-700 ring-2 ring-amber-300 shadow-xs"
                            : "border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isQuestionBookmarked ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* QUESTION TITLE (Bỏ đoạn hướng dẫn câu hỏi đối với Part 6) */}
                  {card.category !== "part6" &&
                    !card.tag?.toLowerCase().includes("part 6") &&
                    !(q.question || (q as any).questionEn || "").includes("điền vào vị trí") && (
                      <div className="text-base font-extrabold text-slate-900 leading-relaxed select-text">
                        {q.question || (q as any).questionEn || (q as any).questionText || ""}
                      </div>
                    )}

                  {/* BILINGUAL SENTENCE TRANSLATION (Chỉ hiển thị khi đã chọn/kiểm tra đáp án) */}
                  {isCardChecked && (() => {
                    const qTranslation = getQuestionTranslation(q, card);
                    if (!qTranslation) return null;
                    return (
                      <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 shadow-xs space-y-1.5 animate-in fade-in">
                        <div className="font-bold text-blue-700 flex items-center gap-1.5 text-xs sm:text-sm">
                          <Languages className="w-4 h-4 text-blue-600" />
                          <span>Bản dịch câu hỏi:</span>
                        </div>
                        <p className="text-blue-950 font-medium text-sm sm:text-base leading-relaxed">
                          {qTranslation}
                        </p>
                      </div>
                    );
                  })()}

                  {/* OPTIONS LIST */}
                  <div className="space-y-3">
                    {normalizeOptions(q.options).map((optVal, optIdx) => {
                      const optLetter = String.fromCharCode(65 + optIdx);
                      const isChosen = userChosen === optIdx;
                      const isCorrectOpt = optIdx === q.correctIndex;
                      const optMeaning = isCardChecked
                        ? getOptionMeaning(q, optIdx, optVal, card.vocabList)
                        : null;

                      let cardStyle = "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800";
                      let iconNode = (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                          {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                      );

                      if (isCardChecked) {
                        if (isCorrectOpt) {
                          cardStyle = "bg-emerald-50/90 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                          iconNode = (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                              ✓
                            </div>
                          );
                        } else if (isChosen) {
                          cardStyle = "bg-rose-50/90 border-rose-400 text-rose-950 font-bold ring-2 ring-rose-400/20";
                          iconNode = (
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-xs font-black">
                              ✕
                            </div>
                          );
                        }
                      } else if (isChosen) {
                        cardStyle = "bg-blue-50/70 border-blue-600 text-blue-950 font-bold ring-2 ring-blue-500/20";
                        iconNode = (
                          <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(gIdx, optIdx, q.correctIndex)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${cardStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            {iconNode}
                            <span className="text-sm font-semibold">
                              ({optLetter}) {optVal}
                            </span>
                          </div>
                          {optMeaning && (
                            <p className="text-xs text-blue-700 font-medium pl-8 animate-in fade-in">
                              | {optMeaning}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* DETAILED EXPLANATION BOX (Revealed after check) */}
                  {isCardChecked && (
                    <div className="space-y-4 pt-2 border-t border-slate-200">
                      <div className="rounded-3xl border border-blue-200/90 bg-blue-50/40 p-5 space-y-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm sm:text-base">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span>Giải thích chi tiết</span>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pt-1 border-t border-blue-100">
                          {q.steps && q.steps.length > 0 && (
                            <div className="space-y-2">
                              {q.steps.map((step, sIdx) => (
                                <div key={sIdx} className="bg-white/80 p-3 rounded-xl border border-blue-100/90">
                                  <div className="font-bold text-blue-800 text-xs mb-1">{step.title}</div>
                                  <p className="text-slate-700 text-xs leading-relaxed">{step.desc}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="p-3.5 rounded-xl bg-white/90 border border-blue-200 text-slate-900 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                            <span className="font-extrabold text-blue-700">Phân tích: </span>
                            {getEnrichedExplanation(q, card)}
                          </div>
                        </div>
                      </div>

                      {/* VOCABULARY SECTION (Chỉ hiện trong từng câu nếu là câu đơn lẻ Part 5) */}
                      {!isMultiQuestionGroup && (() => {
                        const singleVocabMap = new Map<string, VocabItem>();
                        (q.vocabList || []).forEach((v) => {
                          const key = v.word.trim().toLowerCase();
                          if (key && !singleVocabMap.has(key)) singleVocabMap.set(key, v);
                        });
                        if (gIdx === 0) {
                          (card.vocabList || []).forEach((v) => {
                            const key = v.word.trim().toLowerCase();
                            if (key && !singleVocabMap.has(key)) singleVocabMap.set(key, v);
                          });
                        }

                        // Tự động làm giàu từ vựng trọng tâm cho Part 5 từ 4 phương án và câu hỏi nếu danh sách bị thiếu
                        if (singleVocabMap.size < 2) {
                          const candidateWords: string[] = [];
                          (q.options || []).forEach((opt) => {
                            const clean = opt.trim().replace(/^[\(\[]?[A-Da-d][\)\].:]\s*/, "").replace(/[^a-zA-Z]/g, "").toLowerCase();
                            if (clean && clean.length > 2 && !candidateWords.includes(clean)) {
                              candidateWords.push(clean);
                            }
                          });
                          const qWords = (q.question || "")
                            .split(/\s+/)
                            .map((w) => w.replace(/[^a-zA-Z]/g, "").toLowerCase())
                            .filter((w) => w.length > 3 && !["this", "that", "with", "from", "have", "will", "been", "were"].includes(w));
                          for (const qw of qWords) {
                            if (!candidateWords.includes(qw) && candidateWords.length < 5) {
                              candidateWords.push(qw);
                            }
                          }

                          candidateWords.forEach((word) => {
                            if (singleVocabMap.has(word)) return;
                            const detail = lookupWordDetail(word);
                            const optMeaning = getOptionMeaning(q, 0, word, card.vocabList);
                            const meaning = optMeaning
                              ? optMeaning.replace(/^\([^)]+\):\s*/, "")
                              : (detail.contextMeaning && !detail.contextMeaning.includes("Chưa có") ? detail.contextMeaning : "");
                            if (meaning) {
                              singleVocabMap.set(word, {
                                word,
                                pos: detail.pos || "n",
                                level: "Level 2: 200 - 300 đ",
                                ipa: detail.usIpa || detail.ukIpa || `/${word}/`,
                                meaning,
                                example: {
                                  en: q.question || "",
                                  vi: q.bilingual || ""
                                }
                              });
                            }
                          });
                        }

                        const singleVocabList = Array.from(singleVocabMap.values());
                        if (singleVocabList.length === 0) return null;
                        return (
                        <div className="rounded-3xl border border-amber-200/90 bg-amber-50/40 p-5 space-y-4 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>Từ vựng trọng tâm ({singleVocabList.length} từ)</span>
                            </div>
                          </div>

                          <div className="space-y-3 pt-1 border-t border-amber-100">
                            {singleVocabList.map((v, vIdx) => {
                              const isSaved = savedWords.includes(v.word);
                              const wordKey = `${gIdx}-${v.word}`;
                              const isExpanded = !!expandedWords[wordKey];

                              return (
                                <div
                                  key={vIdx}
                                  className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 text-xs"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-extrabold text-sm text-slate-900">{v.word}</span>
                                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                                      {v.level && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{v.level}</span>}
                                      {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedWords((prev) => ({ ...prev, [wordKey]: !prev[wordKey] }))}
                                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                                      >
                                        <Search className="w-3 h-3" />
                                        <span>{isExpanded ? "Thu gọn" : "Chi tiết"}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isSaved) {
                                            setSavedWords((prev) => prev.filter((w) => w !== v.word));
                                            showToast(`Đã xóa "${v.word}" khỏi giỏ từ`);
                                          } else {
                                            setSavedWords((prev) => [...prev, v.word]);
                                            showToast(`Đã lưu "${v.word}" vào giỏ từ! 🛍️`);
                                          }
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                          isSaved
                                            ? "bg-amber-500 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                      >
                                        {isSaved ? "Đã lưu ✓" : "+ Lưu từ"}
                                      </button>
                                    </div>
                                  </div>

                                  <p className="font-bold text-slate-800 text-xs sm:text-sm">{v.meaning}</p>

                                  {isExpanded && (() => {
                                    const detail = getEnrichedVocabDetail(v, q.question || currentGroup.passageText || card.passageText || "");
                                    return (
                                      <div className="pt-3 border-t border-amber-200/70 space-y-3 animate-in fade-in">
                                        {/* 1. Lời giải thích chi tiết & ngữ cảnh */}
                                        <div className="space-y-1">
                                          <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                            <span>💡 Giải thích chi tiết &amp; Ngữ cảnh bài thi:</span>
                                          </div>
                                          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 leading-relaxed text-xs">
                                            {detail.explanation}
                                          </div>
                                        </div>

                                        {/* 2. Ví dụ câu thực tế */}
                                        {detail.example && (
                                          <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                              <span>📝 Ví dụ câu trong đề thi:</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1 text-xs">
                                              <p className="font-semibold text-slate-900">&quot;{typeof detail.example === "string" ? detail.example : detail.example.en}&quot;</p>
                                              {typeof detail.example === "object" && detail.example.vi && (
                                                <p className="text-slate-600 italic">👉 {detail.example.vi}</p>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* 3. Cụm từ hay gặp */}
                                        {detail.collocations && detail.collocations.length > 0 && (
                                          <div className="space-y-1">
                                            <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                              <span>🔗 Cụm từ hay gặp (Collocations):</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                              {detail.collocations.map((col: any, cIdx: number) => (
                                                <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                                  <strong>{col.en}</strong>: {col.vi}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}

            {/* CONSOLIDATED VOCABULARY SECTION FOR MULTI-QUESTION PASSAGE (CHỈ 1 KHUNG DUY NHẤT CHO TOÀN BỘ ĐOẠN) */}
            {isMultiQuestionGroup && isCurrentGroupChecked && combinedGroupVocab.length > 0 && (
              <div className="rounded-3xl border border-amber-200/90 bg-amber-50/40 p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                    <Sparkles className="w-4.5 h-4.5 text-amber-600" />
                    <span>Từ vựng trọng tâm bài đọc ({combinedGroupVocab.length} từ)</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1 border-t border-amber-100">
                  {combinedGroupVocab.map((v, vIdx) => {
                    const isSaved = savedWords.includes(v.word);
                    const wordKey = `group-${currentGroupIndex}-${v.word}`;
                    const isExpanded = !!expandedWords[wordKey];

                    return (
                      <div
                        key={vIdx}
                        className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900">{v.word}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">{v.pos}</span>
                            {v.level && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">{v.level}</span>}
                            {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedWords((prev) => ({ ...prev, [wordKey]: !prev[wordKey] }))}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border border-blue-200"
                            >
                              <Search className="w-3 h-3" />
                              <span>{isExpanded ? "Thu gọn" : "Chi tiết"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isSaved) {
                                  setSavedWords((prev) => prev.filter((w) => w !== v.word));
                                  showToast(`Đã xóa "${v.word}" khỏi giỏ từ`);
                                } else {
                                  setSavedWords((prev) => [...prev, v.word]);
                                  showToast(`Đã lưu "${v.word}" vào giỏ từ! 🛍️`);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                isSaved
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {isSaved ? "Đã lưu ✓" : "+ Lưu từ"}
                            </button>
                          </div>
                        </div>

                        <p className="font-bold text-slate-800 text-sm leading-relaxed">{v.meaning}</p>

                        {isExpanded && (() => {
                          const detail = getEnrichedVocabDetail(v, currentGroup.passageText || card.passageText || "");
                          return (
                            <div className="pt-3 border-t border-amber-200/70 space-y-3 animate-in fade-in">
                              {/* 1. Lời giải thích chi tiết & ngữ cảnh */}
                              <div className="space-y-1">
                                <div className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                  <span>💡 Giải thích chi tiết &amp; Ngữ cảnh bài thi:</span>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 leading-relaxed text-xs">
                                  {detail.explanation}
                                </div>
                              </div>

                              {/* 2. Ví dụ câu thực tế */}
                              {detail.example && (
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📝 Ví dụ câu trong đề thi:</span>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1 text-xs">
                                    <p className="font-semibold text-slate-900">&quot;{typeof detail.example === "string" ? detail.example : detail.example.en}&quot;</p>
                                    {typeof detail.example === "object" && detail.example.vi && (
                                      <p className="text-slate-600 italic">👉 {detail.example.vi}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 3. Cụm từ hay gặp */}
                              {detail.collocations && detail.collocations.length > 0 && (
                                <div className="space-y-1">
                                  <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <span>🔗 Cụm từ hay gặp (Collocations):</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {detail.collocations.map((col: any, cIdx: number) => (
                                      <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                        <strong>{col.en}</strong>: {col.vi}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTION BAR SAU KHI HOÀN THÀNH CÂU (PART 5) HOẶC ĐOẠN (PART 6 & PART 7) */}
            {isCurrentGroupChecked && (() => {
              const nextUnansweredIdx = findFirstUnansweredGroup(userAnswers, checkedGroups);
              const hasRemainingUnanswered = nextUnansweredIdx !== -1;
              return (
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-sm text-slate-800">
                        {isMultiQuestionGroup
                          ? `Đoạn ${currentGroupIndex + 1} đã hoàn thành!`
                          : `Câu ${currentGroupFirstQuestion?.questionNum || currentGroupIndex + 1} đã chấm xong!`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetCurrentGroup}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isMultiQuestionGroup ? "Làm lại đoạn này" : "Làm lại câu này"}</span>
                    </button>
                  </div>

                  {currentGroupIndex < passageGroups.length - 1 ? (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={handleNextGroup}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>
                          {isMultiQuestionGroup
                            ? `Đoạn tiếp theo (${currentGroupIndex + 2}/${passageGroups.length})`
                            : `Câu tiếp theo (${currentGroupIndex + 2}/${passageGroups.length})`}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {hasRemainingUnanswered && nextUnansweredIdx !== currentGroupIndex + 1 && (
                        <button
                          type="button"
                          onClick={() => setCurrentGroupIndex(nextUnansweredIdx)}
                          className="px-4 py-3.5 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                        >
                          Tới {isMultiQuestionGroup ? `đoạn chưa làm (#${nextUnansweredIdx + 1})` : `câu chưa làm (#${nextUnansweredIdx + 1})`}
                        </button>
                      )}
                    </div>
                  ) : hasRemainingUnanswered ? (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCurrentGroupIndex(nextUnansweredIdx)}
                        className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>
                          Còn {questionGridStats.unanswered} câu chưa làm — Chuyển tới ngay
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        Tạm thoát
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Hoàn thành toàn bộ bài luyện tập! 🎉</span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <QuestionErrorReportButton source="READING"
            questionRef={questionRef}
            relatedContent={`${card.title} · Đoạn ${currentGroupIndex + 1} (Câu ${currentGroupFirstQuestion?.questionNum || currentGroupIndex + 1})`}
            questionSnapshot={{ questionText: currentGroupFirstQuestion?.question || "", options: currentGroupFirstQuestion?.options || [], correctAnswer: String.fromCharCode(65 + (currentGroupFirstQuestion?.correctIndex ?? 0)), explanation: currentGroupFirstQuestion?.explanation, passage: currentGroup.passageText || card.passageText, passageTextVi: currentGroup.passageTextVi || card.passageTextVi, passageTitle: currentGroup.passageTitle || card.title, passages: currentGroup.passages || card.passages, part: card.category }}
            compact onSubmitted={(ticket) => showToast(`Đã gửi báo cáo ${ticket} đến ban quản trị.`)} />

          <button
            type="button"
            onClick={() => setShowWordBasketModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Giỏ từ ({savedWords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDictionaryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Tra từ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentGroupIndex === 0}
            onClick={handlePrevGroup}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionGridOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-xs cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>
              Câu {currentGroup.startIndex + currentGroup.questions.length}/{totalQuestionsCount}
            </span>
          </button>

          <button
            type="button"
            disabled={currentGroupIndex === passageGroups.length - 1}
            onClick={handleNextGroup}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* QUESTION GRID MODAL (Thiết kế tinh gọn theo Part và hình tròn: Đỏ sai, Xanh đúng, Vàng cần check lại) */}
      {isQuestionGridOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full max-h-[88vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">Bảng danh sách câu hỏi</h3>
                  <p className="text-xs text-slate-500">
                    Tổng số <strong className="text-slate-800 font-bold">{questionGridStats.total} câu</strong> • Đã làm <strong className="text-blue-600 font-bold">{questionGridStats.answered}/{questionGridStats.total}</strong> câu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Đóng bảng câu hỏi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend Bar (Chuẩn màu: Đỏ là sai, Xanh là đúng, Vàng là cần check lại) */}
            <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs font-semibold">
              <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 sm:gap-x-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 inline-block shadow-2xs" />
                  <span className="text-slate-800">Xanh: Đúng <strong className="text-emerald-700 font-extrabold">({questionGridStats.correct})</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-600 inline-block shadow-2xs" />
                  <span className="text-slate-800">Đỏ: Sai <strong className="text-rose-700 font-extrabold">({questionGridStats.wrong})</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 inline-block shadow-2xs" />
                  <span className="text-slate-800">Vàng: Cần check lại <strong className="text-amber-800 font-extrabold">({questionGridStats.bookmarked})</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-400 inline-block shadow-2xs" />
                  <span className="text-slate-700">Đã chọn ({questionGridStats.answered})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 inline-block shadow-2xs" />
                  <span className="text-slate-500">Chưa làm ({questionGridStats.unanswered})</span>
                </div>
              </div>
            </div>

            {/* Circular Question Grid Grouped by Part */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 max-h-[55vh]">
              {groupedPartSections.map((section) => (
                <div key={section.partKey} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900">{section.partTitle}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        {section.items.length} câu
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      Câu {section.items[0].questionNumDisplay} - {section.items[section.items.length - 1].questionNumDisplay}
                    </div>
                  </div>

                  {/* Circular number buttons grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2.5 sm:gap-3 py-1 justify-items-center">
                    {section.items.map((item) => {
                      let btnStyle = "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200";
                      let statusText = "Chưa làm";

                      if (item.isBookmarked) {
                        btnStyle = "bg-amber-400 text-amber-950 border-2 border-amber-500 font-black shadow-xs hover:bg-amber-300";
                        statusText = "Cần check lại";
                      } else if (item.isGrpChecked) {
                        if (item.isCorrect) {
                          btnStyle = "bg-emerald-500 text-white border-2 border-emerald-600 font-extrabold shadow-xs hover:bg-emerald-600";
                          statusText = "Đúng";
                        } else {
                          btnStyle = "bg-rose-500 text-white border-2 border-rose-600 font-extrabold shadow-xs hover:bg-rose-600";
                          statusText = "Sai";
                        }
                      } else if (item.isAnswered) {
                        btnStyle = "bg-blue-100 text-blue-900 border-2 border-blue-400 font-bold hover:bg-blue-200";
                        statusText = "Đã chọn";
                      }

                      return (
                        <button
                          key={item.globalIndex}
                          type="button"
                          title={`Câu ${item.questionNumDisplay}: ${statusText}${item.isBookmarked ? " (Đã đánh dấu cần check lại)" : ""}`}
                          onClick={() => jumpToQuestion(item.globalIndex)}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer relative active:scale-95 ${
                            item.isCurrent ? "ring-3 ring-blue-600 ring-offset-2 scale-110 z-10 font-black" : ""
                          } ${btnStyle}`}
                        >
                          <span>{item.questionNumDisplay}</span>

                          {/* Corner indicator when bookmarked & graded */}
                          {item.isBookmarked && item.isGrpChecked && (
                            <span
                              className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white shadow-xs ${
                                item.isCorrect ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                              title={item.isCorrect ? "Đã kiểm tra: Đúng" : "Đã kiểm tra: Sai"}
                            />
                          )}
                          {/* Star icon when bookmarked and not graded */}
                          {item.isBookmarked && !item.isGrpChecked && (
                            <span className="absolute -top-1 -right-1 text-amber-800 text-[10px] leading-none select-none">
                              ⭐
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer with Quick Jump Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                {questionGridStats.bookmarked > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = activeQuestions.findIndex((_, i) => !!bookmarkedQuestions[`${card.id}-${i}`]);
                      if (idx !== -1) jumpToQuestion(idx);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>⭐</span>
                    <span>Đến câu cần check ({questionGridStats.bookmarked})</span>
                  </button>
                )}
                {questionGridStats.wrong > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = activeQuestions.findIndex((q, i) => {
                        const grpIdx = passageGroups.findIndex((g) => g.questions.some((item) => item.globalIndex === i));
                        return checkedGroups[grpIdx] && userAnswers[i] !== q.correctIndex;
                      });
                      if (idx !== -1) jumpToQuestion(idx);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>🔴</span>
                    <span>Đến câu sai ({questionGridStats.wrong})</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer ml-auto"
              >
                Đóng danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Trợ lý giải bài TOEIC</h3>
                  <p className="text-xs text-slate-500">Mẹo làm bài đọc hiểu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-800">Gợi ý từ Trợ lý AI:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Đọc lướt cả đoạn văn trên cột trái để nắm chắc mạch nội dung trước khi chọn.</li>
                <li>Với câu điền từ loại: Xác định từ đứng trước và sau vị trí cần điền.</li>
                <li>Với câu điền cả câu: Chú ý liên kết ngữ nghĩa giữa câu trước và câu sau chỗ trống.</li>
                <li>Chọn xong tất cả các câu trong đoạn rồi nhấn nút &quot;Kiểm tra đáp án cả đoạn&quot; nhé!</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}


      {/* WORD BASKET MODAL */}
      {showWordBasketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Giỏ từ vựng cá nhân</h3>
                  <p className="text-xs text-slate-500">Đã lưu {savedWords.length} từ vựng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWordBasketModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedWords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs font-semibold">Giỏ từ vựng của bạn đang trống.</p>
                <p className="text-[11px] text-slate-400">Hãy nhấn &quot;+ Lưu từ&quot; ở các câu hỏi để ôn tập lại sau.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-1">
                {savedWords.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-bold text-slate-800 text-sm">{w}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedWords((prev) => prev.filter((item) => item !== w));
                        showToast(`Đã xóa "${w}" khỏi giỏ từ`);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {savedWords.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSavedWords([]);
                    showToast("Đã Xóa tất cả từ vựng trong giỏ!");
                  }}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowWordBasketModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DICTIONARY MODAL */}
      {showDictionaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tra từ điển nhanh</h3>
                  <p className="text-xs text-slate-500">Tra cứu từ vựng Tiếng Anh - Tiếng Việt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDictionaryModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dictQuery}
                onChange={(e) => setDictQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchDict()}
                placeholder="Nhập từ cần tra (ví dụ: applicant, schedule...)"
                className="flex-1 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchDict}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Tra từ
              </button>
            </div>

            {dictResult && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-blue-950">{dictResult.word}</span>
                  <span className="text-slate-500 font-mono">{dictResult.ipa}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">{dictResult.pos}</span>
                </div>
                <p className="font-semibold text-slate-800">{dictResult.meaning}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDictionaryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RICH GHI CHÚ (NOTES & STUDY HUB) MODAL */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    Sổ tay ghi chú học tập
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {card.tag || card.category.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {card.title} • {currentGroup.questions.length > 1 ? `Đoạn ${currentGroupIndex + 1} (${currentGroup.questions.length} câu)` : `Câu hỏi ${currentGroup.questions[0]?.question.questionNum || 1}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 pt-3 pb-1 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setActiveNoteTab("current")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeNoteTab === "current"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Ghi chú cá nhân</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNoteTab("tips")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeNoteTab === "tips"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Chiến thuật & Bí kíp TOEIC</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveNoteTab("vocab")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeNoteTab === "vocab"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Từ vựng trọng điểm ({combinedGroupVocab.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-4 pr-1">
              {activeNoteTab === "current" && (
                <div className="space-y-4">
                  {/* Selector for multi questions */}
                  {currentGroup.questions.length > 1 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Chọn câu hỏi để ghi chú:</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {currentGroup.questions.map((item) => {
                          const qKey = item.question.questionNum || String(item.globalIndex + 1);
                          const isSelected = (selectedNoteQKey || (currentGroup.questions[0].question.questionNum || String(currentGroup.questions[0].globalIndex + 1))) === qKey;
                          const hasNote = !!practiceUserNotes[qKey];
                          return (
                            <button
                              key={qKey}
                              type="button"
                              onClick={() => setSelectedNoteQKey(qKey)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : hasNote
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <span>Câu {item.question.questionNum || item.globalIndex + 1}</span>
                              {hasNote && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(() => {
                    const fallbackKey = currentGroup.questions[0]?.question.questionNum || String(currentGroup.questions[0]?.globalIndex + 1) || "1";
                    const currentKey = selectedNoteQKey || fallbackKey;
                    const activeItem = currentGroup.questions.find(
                      (item) => (item.question.questionNum || String(item.globalIndex + 1)) === currentKey
                    ) || currentGroup.questions[0];

                    if (!activeItem) return null;
                    const activeQ = activeItem.question;

                    return (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            Nội dung câu {activeQ.questionNum || activeItem.globalIndex + 1}:
                          </span>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                            {activeQ.question}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>Nội dung ghi chú của bạn:</span>
                            <span className="text-[11px] font-normal text-slate-400">
                              {(practiceUserNotes[currentKey] || "").length} ký tự
                            </span>
                          </label>
                          <textarea
                            rows={5}
                            value={practiceUserNotes[currentKey] || ""}
                            onChange={(e) =>
                              setPracticeUserNotes({
                                ...practiceUserNotes,
                                [currentKey]: e.target.value,
                              })
                            }
                            placeholder="Ghi chú lại công thức, từ mới, bẫy thường gặp hoặc lý do chọn sai để ôn lại..."
                            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-800 outline-none resize-none placeholder:text-slate-400"
                          />
                        </div>

                        {/* Quick tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 font-medium">Gợi ý chèn nhanh:</span>
                          {["Cần xem lại từ vựng", "Bẫy ngữ pháp Part 5", "Từ đồng nghĩa Paraphrase", "Bẫy thông tin nhiễu"].map(
                            (tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const currentVal = practiceUserNotes[currentKey] || "";
                                  const separator = currentVal.trim() ? " | " : "";
                                  setPracticeUserNotes({
                                    ...practiceUserNotes,
                                    [currentKey]: currentVal + separator + tag,
                                  });
                                }}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition cursor-pointer"
                              >
                                + {tag}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeNoteTab === "tips" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Chiến lược làm bài {card.tag || card.category.toUpperCase()} (ETS TOEIC)</span>
                    </div>
                    <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
                      {card.category === "part5" && (
                        <>
                          <li>Xác định nhanh loại câu hỏi: Ngữ pháp (chọn từ loại/thì) hay Từ vựng (dịch nghĩa).</li>
                          <li>Với câu ngữ pháp, nhìn kỹ trước và sau chỗ trống để xác định thành phần câu thiếu.</li>
                          <li>Mỗi câu Part 5 tối đa dành 30 giây để tiết kiệm thời gian cho Part 7.</li>
                        </>
                      )}
                      {card.category === "part6" && (
                        <>
                          <li>Đọc câu trước và sau chỗ trống để hiểu ngữ cảnh logic trước khi điền.</li>
                          <li>Với câu điền nguyên cả câu văn, chú ý các từ liên kết (Therefore, However, In addition).</li>
                          <li>Để ý thì của toàn đoạn văn để tránh chọn sai thì động từ.</li>
                        </>
                      )}
                      {card.category === "part7" && (
                        <>
                          <li>Đọc lướt tiêu đề văn bản (Email, Invoice, Notice) để nắm nhanh chủ đề và người gửi/người nhận.</li>
                          <li>Đọc câu hỏi trước để định vị từ khóa cần tìm trong bài đọc (Skimming & Scanning).</li>
                          <li>Cảnh giác bẫy Paraphrase: đáp án đúng thường diễn đạt lại bằng từ đồng nghĩa thay vì lặp từ y hệt trong bài.</li>
                        </>
                      )}
                      {card.category === "grammar" && (
                        <>
                          <li>Phân tích cấu trúc câu: Chủ ngữ chính (S), Động từ chính (V), Tân ngữ (O).</li>
                          <li>Xem xét sự hòa hợp Chủ ngữ - Động từ số ít/số nhiều.</li>
                          <li>Xác định thì của câu dựa vào các trạng từ chỉ thời gian (yesterday, since, already).</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Phân bổ thời gian khuyến nghị</span>
                    </div>
                    <p className="text-xs text-blue-950 leading-relaxed font-medium">
                      Tổng thời gian làm bài Reading là 75 phút cho 100 câu: Part 5 (10-12 phút) • Part 6 (8-10 phút) • Part 7 (50-55 phút).
                    </p>
                  </div>
                </div>
              )}

              {activeNoteTab === "vocab" && (
                <div className="space-y-2">
                  {combinedGroupVocab.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-1.5">
                      <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-xs font-semibold">Chưa có danh sách từ vựng riêng cho đoạn này.</p>
                      <p className="text-[11px] text-slate-400">Bạn có thể dùng công cụ &quot;Tra từ&quot; hoặc tự gõ vào tab Ghi chú cá nhân.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium">
                        Các từ vựng quan trọng xuất hiện trong phần bài làm này:
                      </p>
                      <div className="space-y-2">
                        {combinedGroupVocab.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{v.word}</span>
                                {v.ipa && <span className="text-slate-400 font-mono text-[11px]">{v.ipa}</span>}
                                {v.pos && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                                    {v.pos}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 font-medium">{v.meaning}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!savedWords.includes(v.word)) {
                                  setSavedWords((prev) => [...prev, v.word]);
                                  showToast(`Đã thêm "${v.word}" vào giỏ từ vựng! 🛍️`);
                                } else {
                                  showToast(`"${v.word}" đã có trong giỏ từ vựng!`);
                                }
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 font-bold text-[11px] transition cursor-pointer shrink-0"
                            >
                              + Lưu từ
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {activeNoteTab === "current" && (
                <button
                  type="button"
                  onClick={() => {
                    const fallbackKey = currentGroup.questions[0]?.question.questionNum || String(currentGroup.questions[0]?.globalIndex + 1) || "1";
                    const currentKey = selectedNoteQKey || fallbackKey;
                    if (practiceUserNotes[currentKey]) {
                      const updated = { ...practiceUserNotes };
                      delete updated[currentKey];
                      setPracticeUserNotes(updated);
                      showToast(`Đã xóa ghi chú của câu ${currentKey}!`);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Xóa ghi chú câu này
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Đóng
                </button>
                {activeNoteTab === "current" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotesModalOpen(false);
                      showToast("Đã lưu ghi chú học tập thành công! 💾");
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    💾 Lưu ghi chú
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING LOOKUP TOOLTIP (Image 4) */}
      {showLookupTooltip && tooltipPos && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, 0)",
            zIndex: 9999,
          }}
          className="pointer-events-auto no-lookup-select animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-full shadow-2xl border border-slate-200"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleTriggerLookup();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e60f0] hover:bg-blue-700 text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer select-none"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Tra</span>
          </button>
          {isAnnotatorActive && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                highlightSelection(annotatorColor);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer select-none"
            >
              <Pencil className="w-3 h-3 text-white" />
              <span>Tô màu</span>
            </button>
          )}
        </div>
      )}

      {/* RICH DICTIONARY MODAL (Image 5) */}
      {showRichLookupModal && richWordData && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans no-lookup-select animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/90 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {richWordData.word}
                  </h2>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => speakWord(richWordData.word, "en-US")}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer group"
                    title="Phát âm giọng Mỹ (US)"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>US <strong className="font-mono text-slate-700">{richWordData.usIpa}</strong></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => speakWord(richWordData.word, "en-GB")}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer group"
                    title="Phát âm giọng Anh (UK)"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>UK <strong className="font-mono text-slate-700">{richWordData.ukIpa}</strong></span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRichLookupModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KHUNG DỊCH NGHĨA & PHÂN LOẠI TỪ CHÍNH */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-slate-50 to-white border border-blue-200/90 p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Loại từ:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${formatPosBadge(richWordData.pos).badgeClass}`}>
                    {formatPosBadge(richWordData.pos).label}
                  </span>
                </div>
                {isDictLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang nạp nghĩa...</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                    ✓ Từ điển Anh - Việt
                  </span>
                )}
              </div>

              {/* Nghĩa tiếng Việt hiển thị trực diện */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-700">Dịch nghĩa:</div>
                <div className="text-base font-extrabold text-slate-900 leading-snug">
                  {richWordData.contextMeaning || (isDictLoading ? "Đang tra cứu từ điển..." : "Chưa có bản dịch")}
                </div>
              </div>

              {/* Các nét nghĩa bổ sung nếu có */}
              {richWordData.extraMeanings && richWordData.extraMeanings.length > 1 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                  <div className="font-bold text-slate-600">Các nét nghĩa khác:</div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-700">
                    {richWordData.extraMeanings.slice(1, 4).map((em, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-slate-900">{em.definition}</span>
                        {em.partOfSpeech && (
                          <span className="text-slate-400 text-[11px] ml-1">({em.partOfSpeech})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Flashcard Box */}
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-xs space-y-4">
              {/* Card Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-0.5 rounded-xl">
                  {(richWordData.cardTabs || [
                    { id: "word", label: "Từ", en: richWordData.word, vi: richWordData.contextMeaning },
                    { id: "colloc1", label: "Cụm", en: richWordData.collocations[0]?.phrase || richWordData.word, vi: richWordData.collocations[0]?.meaning || richWordData.contextMeaning },
                    { id: "colloc2", label: "Cụm", en: richWordData.collocations[1]?.phrase || richWordData.word, vi: richWordData.collocations[1]?.meaning || richWordData.contextMeaning },
                    { id: "sentence", label: "Câu", en: richWordData.exampleEn || richWordData.word, vi: richWordData.exampleVi || richWordData.contextMeaning },
                  ]).map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveCardTab(t.id);
                        setIsCardFlipped(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeCardTab === t.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 italic">Bấm thẻ để lật</span>
              </div>

              {/* Card Body - Flippable */}
              {(() => {
                const currentTabItem = (richWordData.cardTabs || []).find((t) => t.id === activeCardTab) || (richWordData.cardTabs ? richWordData.cardTabs[0] : { en: richWordData.word, vi: richWordData.contextMeaning });
                return (
                  <div
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    className="py-4 px-3 rounded-2xl bg-gradient-to-b from-blue-50/40 to-slate-50/70 border border-blue-100/90 text-center cursor-pointer hover:border-blue-300 hover:shadow-xs transition-all select-none space-y-2"
                  >
                    {!isCardFlipped ? (
                      <>
                        <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {currentTabItem.en}
                        </div>
                        <div className="text-xs text-slate-500 font-mono italic">
                          {formatPosBadge(richWordData.pos).label} · {richWordData.usIpa}
                        </div>
                        <div className="text-sm font-bold text-blue-700 pt-1.5 border-t border-blue-100/80">
                          {currentTabItem.vi || richWordData.contextMeaning}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-0.5">
                          <span>🔄</span>
                          <span>Bấm để xem câu ví dụ & ngữ cảnh</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Ví dụ & Ngữ cảnh
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {richWordData.exampleEn || currentTabItem.en}
                        </div>
                        <div className="text-xs text-blue-700 italic">
                          {richWordData.exampleVi || currentTabItem.vi || richWordData.contextMeaning}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1">
                          <span>🔄</span>
                          <span>Bấm để quay lại mặt trước</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Card Bottom Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => speakWord(richWordData.word)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-blue-600 hover:bg-blue-50 text-xs font-bold transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!savedWords.includes(richWordData.word)) {
                      setSavedWords((prev) => [...prev, richWordData.word]);
                      showToast(`Đã thêm "${richWordData.word}" vào giỏ từ vựng! 🛍️`);
                    } else {
                      showToast(`"${richWordData.word}" đã có trong giỏ từ!`);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                    savedWords.includes(richWordData.word)
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {savedWords.includes(richWordData.word) ? (
                    <>✓ Đã có trong giỏ</>
                  ) : (
                    <>+ Thêm thẻ vào giỏ</>
                  )}
                </button>
              </div>
            </div>

            {/* Collocations */}
            {richWordData.collocations && richWordData.collocations.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">Cụm từ</h4>
                <div className="space-y-1">
                  {richWordData.collocations.map((c, i) => (
                    <div key={i} className="text-xs text-slate-800">
                      <strong className="font-bold text-slate-900">{c.phrase}</strong> – <span className="text-slate-600">{c.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synonyms (Từ đồng nghĩa) */}
            {richWordData.synonyms && richWordData.synonyms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Từ đồng nghĩa (Synonyms)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {richWordData.synonyms.length} từ
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {richWordData.synonyms.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleTriggerLookup(s.word)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border border-emerald-200/80 text-xs font-bold transition cursor-pointer group"
                      title={`Bấm để tra cứu "${s.word}"`}
                    >
                      <strong className="text-emerald-900 group-hover:text-emerald-700">{s.word}</strong>
                      {s.meaning && s.meaning !== "đồng nghĩa" && (
                        <span className="font-normal text-emerald-700 text-[11px]">· {s.meaning}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms (Từ trái nghĩa) */}
            {richWordData.antonyms && richWordData.antonyms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Từ trái nghĩa (Antonyms)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {richWordData.antonyms.length} từ
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {richWordData.antonyms.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleTriggerLookup(a.word)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-950 hover:bg-rose-100 border border-rose-200/80 text-xs font-bold transition cursor-pointer group"
                      title={`Bấm để tra cứu "${a.word}"`}
                    >
                      <strong className="text-rose-900 group-hover:text-rose-700">{a.word}</strong>
                      {a.meaning && a.meaning !== "trái nghĩa" && (
                        <span className="font-normal text-rose-700 text-[11px]">· {a.meaning}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mẹo TOEIC (Hình 1) */}
            {richWordData.toeicTip && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
                <span className="text-base select-none shrink-0">💡</span>
                <p className="leading-relaxed">
                  <strong className="text-amber-900 font-bold">Mẹo TOEIC: </strong>
                  {richWordData.toeicTip}
                </p>
              </div>
            )}

            {/* Thêm nghĩa riêng (Hình 1) */}
            <div className="space-y-2">
              {customUserMeanings[richWordData.word] && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-700">Nghĩa riêng của bạn: </span>
                    <span>{customUserMeanings[richWordData.word]}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...customUserMeanings };
                      delete updated[richWordData.word];
                      setCustomUserMeanings(updated);
                    }}
                    className="text-slate-400 hover:text-rose-600 ml-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!isAddingCustomMeaning ? (
                <button
                  type="button"
                  onClick={() => {
                    setCustomMeaningInput(customUserMeanings[richWordData.word] || "");
                    setIsAddingCustomMeaning(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{customUserMeanings[richWordData.word] ? "Sửa nghĩa riêng" : "Thêm nghĩa riêng"}</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Ghi chú nghĩa riêng của bạn:</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomMeaning(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customMeaningInput}
                    onChange={(e) => setCustomMeaningInput(e.target.value)}
                    placeholder="Nhập nghĩa hoặc mẹo nhớ cá nhân..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customMeaningInput.trim()) {
                        setCustomUserMeanings((prev) => ({
                          ...prev,
                          [richWordData.word]: customMeaningInput.trim(),
                        }));
                        showToast(`Đã lưu nghĩa riêng cho "${richWordData.word}"! 💾`);
                        setIsAddingCustomMeaning(false);
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomMeaning(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (customMeaningInput.trim()) {
                          setCustomUserMeanings((prev) => ({
                            ...prev,
                            [richWordData.word]: customMeaningInput.trim(),
                          }));
                          showToast(`Đã lưu nghĩa riêng cho "${richWordData.word}"! 💾`);
                          setIsAddingCustomMeaning(false);
                        }
                      }}
                      className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Lưu nghĩa
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Phân cách */}
            <hr className="border-slate-100" />

            {/* Họ từ (Word Family - Hình 1) */}
            {richWordData.wordFamily && richWordData.wordFamily.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">Họ từ</h4>
                <div className="flex flex-wrap gap-2">
                  {richWordData.wordFamily.map((wf, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
                    >
                      <strong className="text-slate-900">{wf.word}</strong>
                      <span className="text-slate-500 font-medium text-[11px]">· {wf.pos} ·</span>
                      <span className="font-normal text-slate-600">{wf.meaning}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => showToast(`Đã thêm "${richWordData.word}" vào Luyện theo độ khó! 📁`)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <span>Thêm vào <strong className="text-slate-800 font-bold">Luyện theo độ khó</strong></span>
              </button>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-500 select-none">
                <input
                  type="checkbox"
                  checked={disableDoubleClick}
                  onChange={(e) => setDisableDoubleClick(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Tắt tra khi bấm đúp</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* RESUME VS RESTART MODAL WHEN PRIOR LOG EXISTS */}
      {showResumePromptModal && !isRedoWrongOnly && (() => {
        const nextUnansweredIdx = findFirstUnansweredGroup(userAnswers, checkedGroups);
        const liveAnswered = Math.min(totalQuestionsCount, Object.keys(userAnswers).length || savedLogSummary.answeredCount);
        const remainingCount = Math.max(0, totalQuestionsCount - liveAnswered);
        const isAllDone = nextUnansweredIdx === -1 || remainingCount === 0;
        const nextTargetGroup = nextUnansweredIdx !== -1 ? passageGroups[nextUnansweredIdx] : null;
        const nextTargetLabel = nextTargetGroup
          ? nextTargetGroup.questions.length > 1
            ? `Đoạn ${nextUnansweredIdx + 1} (Câu ${nextTargetGroup.questions[0]?.question?.questionNum || nextTargetGroup.startIndex + 1})`
            : `Câu ${nextTargetGroup.questions[0]?.question?.questionNum || nextUnansweredIdx + 1}`
          : "";

        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200">
                    Phát hiện lịch sử bài làm trước đó
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                    {isAllDone
                      ? "Bạn đã hoàn thành bài này!"
                      : "Bạn muốn tiếp tục hay làm mới từ đầu?"}
                  </h3>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <p>
                  Hệ thống ghi nhận bạn đã làm{" "}
                  <strong className="text-blue-700">
                    {liveAnswered}/{totalQuestionsCount} câu
                  </strong>{" "}
                  trong bài <strong className="text-slate-900">{card.title}</strong>
                  {!isAllDone && (
                    <>
                      {" "}(còn <strong className="text-emerald-700">{remainingCount} câu chưa làm</strong>).
                    </>
                  )}
                </p>
                <p className="text-slate-500">
                  {isAllDone ? (
                    <>
                      Chọn <strong>Xem lại bài đã làm</strong> để xem đáp án &amp; giải thích, hoặc{" "}
                      <strong>Làm mới từ đầu</strong> để xóa kết quả cũ và luyện lại.
                    </>
                  ) : (
                    <>
                      Chọn <strong>Tiếp tục câu chưa làm</strong> để chuyển thẳng tới{" "}
                      <strong className="text-slate-800">{nextTargetLabel}</strong>, hoặc{" "}
                      <strong>Làm mới từ đầu</strong> để xóa toàn bộ kết quả cũ.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleContinueUnanswered}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs transition cursor-pointer"
                >
                  {isAllDone ? "Xem lại bài đã làm" : "Tiếp tục câu chưa làm"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isSfxEnabled) playSfx("click");
                    handleRestartAll();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm mới từ đầu</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ETS TOEIC DIRECTIONS MODAL */}
      {showDirectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black tracking-wider">
                  {partDirections.partNum}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {partDirections.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[13px] text-slate-900 leading-relaxed font-sans">
                  <strong className="font-extrabold text-slate-950 uppercase tracking-wide">Directions: </strong>
                  {partDirections.directionsEn.replace(/^Directions:\s*/i, "")}
                </div>

                <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-blue-800 block mb-0.5">Bản dịch hướng dẫn tiếng Việt:</strong>
                  {partDirections.directionsVi.replace(/^Hướng dẫn:\s*/i, "")}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-blue-950">
                  <span>Chiến thuật &amp; Thời gian làm bài:</span>
                  <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                    ⏱️ {partDirections.timing}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {partDirections.tips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Đã hiểu hướng dẫn • Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
