"use client";

import React, { useState, useMemo } from "react";
import { ExerciseCardData, ReadingSubPassage, SampleQuestion, VocabItem } from "@/app/admin/content/reading/types";
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
  Flag,
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
} from "lucide-react";
import { lookupWordDetail, WordDetail } from "./richDictionaryData";

interface ReadingPracticeWorkspaceProps {
  card: ExerciseCardData;
  onClose: () => void;
  playSfx: (type?: "correct" | "wrong" | "click") => void;
  showToast: (msg: string) => void;
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
}) => {
  // Group questions by passage (for Part 6, Part 7) or individual questions (for Part 5)
  const passageGroups: PassageGroup[] = useMemo(() => {
    const hasPassages =
      card.sampleQuestions.some((q) => !!q.passageText || (q.passages && q.passages.length > 0)) ||
      !!card.passageText ||
      (card.passages && card.passages.length > 0);
    if (!hasPassages) {
      return card.sampleQuestions.map((q, idx) => ({
        id: `q-${idx}`,
        startIndex: idx,
        questions: [{ question: q, globalIndex: idx }],
      }));
    }

    const groups: PassageGroup[] = [];
    let curr: PassageGroup | null = null;

    card.sampleQuestions.forEach((q, idx) => {
      const pKey =
        q.passageTitle ||
        q.passageText ||
        (q.passages ? q.passages.map((p) => p.label).join("-") : "") ||
        card.passageText ||
        `single-${idx}`;

      if (!curr || curr.id !== pKey) {
        if (curr) groups.push(curr);
        curr = {
          id: pKey,
          passageTitle: q.passageTitle,
          passageText: q.passageText || card.passageText,
          passageTextVi: q.passageTextVi || card.passageTextVi,
          passages: q.passages || card.passages,
          startIndex: idx,
          questions: [{ question: q, globalIndex: idx }],
        };
      } else {
        curr.questions.push({ question: q, globalIndex: idx });
      }
    });

    if (curr) groups.push(curr);
    return groups;
  }, [card]);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const currentGroup = passageGroups[currentGroupIndex] || passageGroups[0];
  const isMultiQuestionGroup = currentGroup && currentGroup.questions.length > 1;

  // Deduplicated vocabulary across all questions in the current passage group
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
    return Array.from(map.values());
  }, [currentGroup]);

  // Track user selections: globalIndex -> selected option index
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Track checked state: groupIndex -> boolean
  const [checkedGroups, setCheckedGroups] = useState<Record<number, boolean>>({});
  const isCurrentGroupChecked = !!checkedGroups[currentGroupIndex];

  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [sessionWrongCount, setSessionWrongCount] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [energyScore, setEnergyScore] = useState(0);

  // Mode toggles
  const [isBilingual, setIsBilingual] = useState(false);
  const [showPassageTranslation, setShowPassageTranslation] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  // Modals state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [practiceUserNotes, setPracticeUserNotes] = useState<{ [qKey: string]: string }>({});
  const [activeNoteTab, setActiveNoteTab] = useState<"current" | "tips" | "vocab">("current");
  const [selectedNoteQKey, setSelectedNoteQKey] = useState<string>("");
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState<"yellow" | "green" | "pink" | "blue">("yellow");
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);

  // Vocabulary Expansion States
  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({});
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState<SampleQuestion | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportQuestion, setReportQuestion] = useState<SampleQuestion | null>(null);
  const [reportCategory, setReportCategory] = useState("Sai đáp án");
  const [reportText, setReportText] = useState("");
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
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeCardTab, setActiveCardTab] = useState<string>("word");
  const [disableDoubleClick, setDisableDoubleClick] = useState(false);
  const [isAddingCustomMeaning, setIsAddingCustomMeaning] = useState(false);
  const [customUserMeanings, setCustomUserMeanings] = useState<Record<string, string>>({});
  const [customMeaningInput, setCustomMeaningInput] = useState("");

  // Timer effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalQuestionsCount = card.sampleQuestions.length;

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

  const handleSelectOption = (globalIndex: number, optIdx: number, correctIdx: number) => {
    if (checkedGroups[currentGroupIndex]) return;

    if (isMultiQuestionGroup) {
      // For multi-question passages (Part 6/7): record choice without revealing answer
      setUserAnswers((prev) => ({ ...prev, [globalIndex]: optIdx }));
      if (isSfxEnabled) playSfx("click");
    } else {
      // For single-question items (Part 5): select and check immediately
      setUserAnswers((prev) => ({ ...prev, [globalIndex]: optIdx }));
      setCheckedGroups((prev) => ({ ...prev, [currentGroupIndex]: true }));

      const correct = optIdx === correctIdx;
      if (correct) {
        if (isSfxEnabled) playSfx("correct");
        setSessionCorrectCount((prev) => prev + 1);
        setEnergyScore((prev) => prev + 10);
        showToast("Chính xác! +10 Năng lượng ⚡");
      } else {
        if (isSfxEnabled) playSfx("wrong");
        setSessionWrongCount((prev) => prev + 1);
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

    setCheckedGroups((prev) => ({ ...prev, [currentGroupIndex]: true }));

    let correctCount = 0;
    currentGroup.questions.forEach((item) => {
      const selected = userAnswers[item.globalIndex];
      if (selected === item.question.correctIndex) {
        correctCount++;
      }
    });

    const addedScore = correctCount * 10;
    setEnergyScore((prev) => prev + addedScore);
    setSessionCorrectCount((prev) => prev + correctCount);
    setSessionWrongCount((prev) => prev + (currentGroup.questions.length - correctCount));

    if (correctCount === currentGroup.questions.length) {
      if (isSfxEnabled) playSfx("correct");
      showToast(`Xuất sắc! Bạn làm đúng cả ${correctCount}/${currentGroup.questions.length} câu! 🎉 +${addedScore} Năng lượng ⚡`);
    } else {
      if (isSfxEnabled) playSfx("wrong");
      showToast(`Đúng ${correctCount}/${currentGroup.questions.length} câu. Hãy xem giải thích chi tiết ở dưới nhé!`);
    }
  };

  const handleResetCurrentGroup = () => {
    if (!currentGroup) return;
    setCheckedGroups((prev) => ({ ...prev, [currentGroupIndex]: false }));
    setUserAnswers((prev) => {
      const next = { ...prev };
      currentGroup.questions.forEach((item) => {
        delete next[item.globalIndex];
      });
      return next;
    });
    showToast("Đã đặt lại để bạn làm lại bài tập đoạn này! ↺");
  };

  const jumpToQuestion = (targetGlobalIndex: number) => {
    const groupIdx = passageGroups.findIndex((g) =>
      g.questions.some((item) => item.globalIndex === targetGlobalIndex)
    );
    if (groupIdx !== -1) {
      setCurrentGroupIndex(groupIdx);
    }
    setIsQuestionGridOpen(false);
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

  const handleTriggerLookup = (wordToLookup?: string) => {
    const target = wordToLookup || selectedLookupWord;
    if (!target) return;
    const detail = lookupWordDetail(target);
    setRichWordData(detail);
    setIsCardFlipped(false);
    setActiveCardTab("word");
    setShowLookupTooltip(false);
    setShowRichLookupModal(true);
    if (isSfxEnabled) playSfx("click");
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
      <header className="h-14 bg-[#1e60f0] text-white px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (isSfxEnabled) playSfx("click");
              onClose();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
            {card.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-mono font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
              {formatTimer(timerSeconds)}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-extrabold shadow-2xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
              {energyScore}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-extrabold shadow-2xs">
              ✓ {sessionCorrectCount}/{totalQuestionsCount}
            </span>
            <button
              type="button"
              onClick={() => setIsQuestionGridOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-2xs font-mono transition cursor-pointer"
            >
              {isMultiQuestionGroup
                ? `Đoạn ${currentGroupIndex + 1}/${passageGroups.length}`
                : `Câu ${currentGroup.startIndex + 1}/${totalQuestionsCount}`}
            </button>
          </div>
        </div>
      </header>

      {/* ANNOTATOR BAR */}
      {isAnnotatorActive && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center justify-between shadow-xs select-none text-xs">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-amber-700" />
              Công cụ Annotator:
            </span>
            <div className="flex items-center gap-1.5">
              {(["yellow", "green", "pink", "blue"] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAnnotatorColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                    color === "yellow"
                      ? "bg-yellow-400 border-yellow-500"
                      : color === "green"
                      ? "bg-emerald-400 border-emerald-500"
                      : color === "pink"
                      ? "bg-pink-400 border-pink-500"
                      : "bg-sky-400 border-sky-500"
                  } ${annotatorColor === color ? "scale-110 ring-2 ring-slate-800" : "opacity-70"}`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnnotatorActive(false)}
            className="p-1 rounded-full text-amber-900 hover:bg-amber-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN DUAL PANE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
        {/* LEFT PANE - PASSAGE DISPLAY */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-[#fafafa] border-r border-slate-200/80 flex flex-col justify-between space-y-6">
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

            <h2 className="text-sm font-bold text-slate-800 leading-relaxed">
              Read the passage and answer questions{" "}
              {currentGroup.questions.map((q) => q.question.questionNum).join(", ")}.
            </h2>

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

              if (subPassages.length === 0) return null;

              const isMultiPassage = subPassages.length > 1;

              return (
                <div className="space-y-6">
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
                    {subPassages.some((p) => !!p.textVi) && (
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
                    const hasTranslation = !!sub.textVi;
                    const showThisTranslation =
                      hasTranslation && (showPassageTranslation || isBilingual || isCurrentGroupChecked);

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

                        {/* Đoạn văn tiếng Anh: canh chữ to, khoảng cách dòng thoáng, không bị rớt chữ cụt */}
                        <div className="text-base sm:text-lg font-normal sm:font-medium font-sans whitespace-pre-line text-slate-900 leading-relaxed sm:leading-loose select-text">
                          {sub.text}
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
                              {sub.textVi}
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
        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                          showToast(isQuestionBookmarked ? "Đã bỏ bookmark câu này" : "Đã bookmark câu này ⭐");
                        }}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                          isQuestionBookmarked
                            ? "border-amber-300 bg-amber-50 text-amber-500"
                            : "border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isQuestionBookmarked ? "fill-amber-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* QUESTION TITLE (Bỏ đoạn hướng dẫn câu hỏi đối với Part 6) */}
                  {card.category !== "part6" &&
                    !card.tag?.toLowerCase().includes("part 6") &&
                    !q.question.includes("điền vào vị trí") && (
                      <div className="text-base font-extrabold text-slate-900 leading-relaxed select-text">
                        {q.question}
                      </div>
                    )}

                  {/* BILINGUAL SENTENCE TRANSLATION (Chỉ cho Part 5 không có bài đọc) */}
                  {!currentGroup.passageText && !card.passageText && (isCardChecked || isBilingual) && q.bilingual && (
                    <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200/90 text-blue-900 shadow-xs space-y-1.5">
                      <div className="font-bold text-blue-700 flex items-center gap-1.5 text-xs sm:text-sm">
                        <Languages className="w-4 h-4 text-blue-600" />
                        <span>Bản dịch câu hỏi:</span>
                      </div>
                      <p className="text-blue-950 font-medium text-sm sm:text-base leading-relaxed">{q.bilingual}</p>
                    </div>
                  )}

                  {/* OPTIONS LIST */}
                  <div className="space-y-3">
                    {q.options.map((optVal, optIdx) => {
                      const optLetter = String.fromCharCode(65 + optIdx);
                      const isChosen = userChosen === optIdx;
                      const isCorrectOpt = optIdx === q.correctIndex;

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
                          {(isCardChecked || isBilingual) && q.optionMeanings && q.optionMeanings[optIdx] && (
                            <p className="text-xs text-slate-500 font-normal pl-8">
                              {q.optionMeanings[optIdx]}
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

                          <div className="p-3.5 rounded-xl bg-white/90 border border-blue-200 text-slate-900 leading-relaxed text-xs sm:text-sm">
                            <span className="font-extrabold text-blue-700">Phân tích: </span>
                            {q.explanation}
                          </div>
                        </div>
                      </div>

                      {/* VOCABULARY SECTION (Chỉ hiện trong từng câu nếu là câu đơn lẻ Part 5) */}
                      {!isMultiQuestionGroup && q.vocabList && q.vocabList.length > 0 && (
                        <div className="rounded-3xl border border-amber-200/90 bg-amber-50/40 p-5 space-y-4 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                              <Sparkles className="w-4 h-4 text-amber-600" />
                              <span>Từ vựng trọng tâm ({q.vocabList.length} từ)</span>
                            </div>
                          </div>

                          <div className="space-y-3 pt-1 border-t border-amber-100">
                            {q.vocabList.map((v, vIdx) => {
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

                                  {isExpanded && (
                                    <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in">
                                      {v.example && (
                                        <div className="space-y-1">
                                          <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Ví dụ câu:</div>
                                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
                                            <p className="font-semibold text-slate-900">&quot;{v.example.en}&quot;</p>
                                            <p className="text-slate-600 italic">{v.example.vi}</p>
                                          </div>
                                        </div>
                                      )}
                                      {v.collocations && v.collocations.length > 0 && (
                                        <div className="space-y-1">
                                          <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Cụm từ hay gặp:</div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {v.collocations.map((col, cIdx) => (
                                              <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                                <strong>{col.en}</strong>: {col.vi}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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

                        {isExpanded && (
                          <div className="pt-2 border-t border-slate-100 space-y-3 animate-in fade-in">
                            {v.example && (
                              <div className="space-y-1">
                                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Ví dụ câu:</div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
                                  <p className="font-semibold text-slate-900">&quot;{v.example.en}&quot;</p>
                                  <p className="text-slate-600 italic">{v.example.vi}</p>
                                </div>
                              </div>
                            )}
                            {v.collocations && v.collocations.length > 0 && (
                              <div className="space-y-1">
                                <div className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Cụm từ hay gặp:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {v.collocations.map((col, cIdx) => (
                                    <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                                      <strong>{col.en}</strong>: {col.vi}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASSAGE ACTION SUBMIT / CHECK BUTTON */}
            {isMultiQuestionGroup && (
              <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 shadow-sm space-y-4">
                {!isCurrentGroupChecked ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Tiến độ đoạn này:</span>
                      <span className={isAllAnsweredInGroup ? "text-emerald-600" : "text-amber-600"}>
                        Đã chọn {answeredInGroupCount}/{currentGroup.questions.length} câu
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{
                          width: `${(answeredInGroupCount / currentGroup.questions.length) * 100}%`,
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckCurrentGroup}
                      disabled={!isAllAnsweredInGroup}
                      className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        isAllAnsweredInGroup
                          ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-lg active:scale-[0.99]"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {isAllAnsweredInGroup
                          ? "Kiểm tra đáp án cả đoạn"
                          : `Vui lòng chọn đủ ${currentGroup.questions.length} câu để kiểm tra (${answeredInGroupCount}/${currentGroup.questions.length})`}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-800">
                          Đoạn {currentGroupIndex + 1} đã hoàn thành!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetCurrentGroup}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Làm lại đoạn này</span>
                      </button>
                    </div>

                    {currentGroupIndex < passageGroups.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextGroup}
                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                      >
                        <span>Chuyển sang đoạn tiếp theo ({currentGroupIndex + 2}/{passageGroups.length})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                      >
                        <span>Hoàn thành toàn bộ bài luyện tập! 🎉</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <footer className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setReportQuestion(currentGroup.questions[0].question);
              setShowReportModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Báo lỗi</span>
          </button>

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
              {isMultiQuestionGroup
                ? `Đoạn ${currentGroupIndex + 1}/${passageGroups.length}`
                : `Câu ${currentGroup.startIndex + 1}/${totalQuestionsCount}`}
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

      {/* QUESTION GRID MODAL */}
      {isQuestionGridOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Bảng danh sách câu hỏi</h3>
                  <p className="text-xs text-slate-500">
                    Tổng số {totalQuestionsCount} câu ({passageGroups.length} đoạn)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {passageGroups.map((group, grpIdx) => (
                <div key={grpIdx} className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>
                      Đoạn {grpIdx + 1}: Câu {group.questions[0].question.questionNum} - {group.questions[group.questions.length - 1].question.questionNum}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        checkedGroups[grpIdx]
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : "bg-slate-200 text-slate-600 font-medium"
                      }`}
                    >
                      {checkedGroups[grpIdx] ? "Đã kiểm tra ✓" : "Chưa kiểm tra"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {group.questions.map((item) => {
                      const gIdx = item.globalIndex;
                      const qn = item.question.questionNum || String(gIdx + 1);
                      const isAns = userAnswers[gIdx] !== undefined;
                      const isGrpChecked = checkedGroups[grpIdx];
                      const isCorrect = userAnswers[gIdx] === item.question.correctIndex;

                      let btnStyle = "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50";
                      if (isGrpChecked) {
                        btnStyle = isCorrect
                          ? "border-emerald-500 bg-emerald-500 text-white font-extrabold"
                          : "border-rose-500 bg-rose-500 text-white font-extrabold";
                      } else if (isAns) {
                        btnStyle = "border-blue-500 bg-blue-100 text-blue-900 font-bold";
                      }

                      return (
                        <button
                          key={gIdx}
                          type="button"
                          onClick={() => jumpToQuestion(gIdx)}
                          className={`h-11 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shadow-2xs ${btnStyle}`}
                        >
                          {qn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" /> Đúng
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" /> Sai
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500" /> Đã chọn
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionGridOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
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

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Báo lỗi câu hỏi</h3>
                  <p className="text-xs text-slate-500">Báo cáo sự cố cho đoạn {currentGroupIndex + 1}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Loại sự cố:</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="Sai đáp án">Sai đáp án</option>
                <option value="Lỗi dịch nghĩa">Lỗi dịch nghĩa Tiếng Việt</option>
                <option value="Nội dung không rõ ràng">Nội dung không rõ ràng</option>
                <option value="Lỗi chính tả / Ngữ pháp">Lỗi chính tả / Ngữ pháp</option>
                <option value="Khác">Khác</option>
              </select>

              <label className="block text-xs font-bold text-slate-700">Mô tả chi tiết:</label>
              <textarea
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Nhập chi tiết lỗi bạn gặp phải..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!reportText.trim()) {
                    showToast("Vui lòng nhập mô tả lỗi!");
                    return;
                  }
                  setShowReportModal(false);
                  setReportText("");
                  showToast("Cảm ơn bạn! Báo cáo sự cố đã được gửi tới đội ngũ học thuật. 🛡️");
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Gửi báo cáo
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
              <div className="flex-1 overflow-y-auto space-y-2 p-1">
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
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
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
          className="pointer-events-auto no-lookup-select animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleTriggerLookup();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e60f0] hover:bg-blue-700 text-white text-xs font-bold shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer select-none"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Tra</span>
          </button>
        </div>
      )}

      {/* RICH DICTIONARY MODAL (Image 5) */}
      {showRichLookupModal && richWordData && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans no-lookup-select animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/90 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
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

            {/* Subtitle */}
            <div className="text-sm font-bold text-blue-600">
              Nghĩa trong câu này · {richWordData.pos}
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
                    className="py-5 px-3 rounded-2xl bg-gradient-to-b from-blue-50/30 to-slate-50/60 border border-blue-100/80 text-center cursor-pointer hover:border-blue-300 transition-all select-none space-y-1.5"
                  >
                    {!isCardFlipped ? (
                      <>
                        <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {currentTabItem.en}
                        </div>
                        <div className="text-xs text-slate-500 font-mono italic">
                          {richWordData.pos} · {richWordData.usIpa}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-base font-bold text-blue-700">
                          {currentTabItem.vi}
                        </div>
                        <div className="text-xs text-slate-500 italic">
                          {richWordData.contextMeaning}
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

            {/* Synonyms */}
            {richWordData.synonyms && richWordData.synonyms.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">Đồng nghĩa</h4>
                <div className="flex flex-wrap gap-2">
                  {richWordData.synonyms.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
                    >
                      <strong className="text-slate-900">{s.word}</strong>
                      <span className="font-normal text-slate-500">· {s.meaning}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trái nghĩa (Antonyms - Hình 1) */}
            {richWordData.antonyms && richWordData.antonyms.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800">Trái nghĩa</h4>
                <div className="flex flex-wrap gap-2">
                  {richWordData.antonyms.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
                    >
                      <strong className="text-slate-900">{a.word}</strong>
                      <span className="font-normal text-slate-500">· {a.meaning}</span>
                    </span>
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
    </div>
  );
};
