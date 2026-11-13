"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { DictationCardData, DictationQuestion, LevelCategoryCardData } from "./types";
import {
  createListeningCard,
  createListeningUnit,
  deleteListeningCard,
  deleteListeningUnit,
  fetchAdminListeningCards,
  fetchAdminListeningUnits,
  updateListeningCard,
  updateListeningUnit,
} from "@/lib/api/listening";
import { ListeningHeader, ListeningAdminTab } from "@/components/admin/content/listening/ListeningHeader";
import {
  ListeningAudioAssetsView,
  ListeningAccentMatrixView,
} from "@/components/admin/content/listening/ListeningViews";
import { ListeningDictationTab } from "@/components/admin/content/listening/ListeningDictationTab";
import { ListeningPartTab } from "@/components/admin/content/listening/ListeningPartTab";
import { ListeningDictationModal } from "@/components/admin/content/listening/ListeningDictationModal";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { ListeningQuizModal } from "@/components/admin/content/listening/ListeningQuizModal";
import { exportToExcel } from "@/lib/exportExcel";
import {
  VocabBagModal,
  TheoryModal,
  DeleteProgressModal,
  ReviewQuestionsModal,
  DictationFormModal,
  DeleteDictationModal,
  LevelFormModal,
  DeleteLevelModal,
} from "@/components/admin/content/listening/ListeningModals";

const EMPTY_LISTENING_QUESTION: DictationQuestion = {
  id: 0,
  part: "Part 1",
  audioUrl: "",
  fullTranscript: "",
  vietnameseTranslation: "",
  options: { A: "", B: "", C: "", D: "" },
  correctAnswer: "A",
  explanation: "",
};

export default function ListeningPage() {
  // --- STATES CHÍNH ---
  const [activeAdminTab, setActiveAdminTab] = useState<ListeningAdminTab>("listening_units");
  const [activeTab, setActiveTab] = useState<"dictation" | "part1" | "part2" | "part3" | "part4">("dictation");
  const [selectedYear, setSelectedYear] = useState<"2024" | "2023" | "2022">("2024");

  // Dữ liệu cards
  const [dictationCards, setDictationCards] = useState<DictationCardData[]>([]);
  const [part1Levels, setPart1Levels] = useState<LevelCategoryCardData[]>([]);
  const [part1Categories, setPart1Categories] = useState<LevelCategoryCardData[]>([]);
  const [part2Levels, setPart2Levels] = useState<LevelCategoryCardData[]>([]);
  const [part2Categories, setPart2Categories] = useState<LevelCategoryCardData[]>([]);
  const [part3Levels, setPart3Levels] = useState<LevelCategoryCardData[]>([]);
  const [part3Categories, setPart3Categories] = useState<LevelCategoryCardData[]>([]);
  const [part4Levels, setPart4Levels] = useState<LevelCategoryCardData[]>([]);
  const [part4Categories, setPart4Categories] = useState<LevelCategoryCardData[]>([]);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchAdminListeningCards(), fetchAdminListeningUnits()])
      .then(([cards, units]) => {
        if (!active) return;
        setDictationCards(cards);
        const byPart = (part: LevelCategoryCardData["part"], type: "level" | "category") =>
          units.filter((unit) => unit.part === part && unit.type === type);
        setPart1Levels(byPart("Part 1", "level"));
        setPart1Categories(byPart("Part 1", "category"));
        setPart2Levels(byPart("Part 2", "level"));
        setPart2Categories(byPart("Part 2", "category"));
        setPart3Levels(byPart("Part 3", "level"));
        setPart3Categories(byPart("Part 3", "category"));
        setPart4Levels(byPart("Part 4", "level"));
        setPart4Categories(byPart("Part 4", "category"));
        setDataLoadError(null);
      })
      .catch((error: unknown) => {
        if (active) setDataLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu nghe.");
      });
    return () => { active = false; };
  }, []);

  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);
  const [flaggedReviewIds, setFlaggedReviewIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal 1: Dictation Practice Studio
  const [dictationModalCard, setDictationModalCard] = useState<DictationCardData | null>(null);
  const [activeDictationQIndex, setActiveDictationQIndex] = useState(0);
  const [dictationUserInputs, setDictationUserInputs] = useState<{ [qId: number]: string }>({});
  const [dictationChecked, setDictationChecked] = useState<{ [qId: number]: boolean }>({});
  const [dictationSubTab, setDictationSubTab] = useState<"chep" | "check" | "full">("check");
  const [fillPercentage, setFillPercentage] = useState<30 | 50 | 100>(50);
  const [revealedWordCount, setRevealedWordCount] = useState<number>(0);
  const [replayCount, setReplayCount] = useState<number>(1);
  const [audioSpeed, setAudioSpeed] = useState<"0.8" | "1.0" | "1.2">("1.0");

  // Modal 2: Quiz Practice
  const [quizModalCard, setQuizModalCard] = useState<LevelCategoryCardData | null>(null);
  const [activeQuizQIndex, setActiveQuizQIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<{ [qId: number]: string }>({});
  const [quizAnswerChecked, setQuizAnswerChecked] = useState<{ [qId: number]: boolean }>({});
  const [showBilingualQuiz, setShowBilingualQuiz] = useState(false);
  const [, setIsQuestionGridOpen] = useState(false);
  const [, setIsNotesModalOpen] = useState(false);

  // Audio & SFX
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const playAudio = (text: string) => {
    if (!isSfxEnabled || !text.trim()) return;
    if (text.startsWith("http://") || text.startsWith("https://")) {
      const audio = new Audio(text);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSfx = (_type?: string) => {
    if (!isSfxEnabled) return;
    playUnifiedAnswerSound();
  };

  // Popup modals states
  const [vocabBagModalData, setVocabBagModalData] = useState<{
    title: string;
    items: { word: string; ipa: string; meaning: string; example?: string }[];
  } | null>(null);

  const [theoryModalData, setTheoryModalData] = useState<{
    title: string;
    summary: string;
    rules: string[];
  } | null>(null);

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "dictation" | "level";
    id: string;
    title: string;
  } | null>(null);

  const [showReviewQuestionsModal, setShowReviewQuestionsModal] = useState(false);

  // CRUD Dictation
  const [showDictationModal, setShowDictationModal] = useState(false);
  const [editingDictationCard, setEditingDictationCard] = useState<DictationCardData | null>(null);
  const [dictationFormTitle, setDictationFormTitle] = useState("");
  const [dictationFormAudioUrl, setDictationFormAudioUrl] = useState("");
  const [dictationFormTranscript, setDictationFormTranscript] = useState("");
  const [dictationFormTranslation, setDictationFormTranslation] = useState("");
  const [dictationFormTestNum, setDictationFormTestNum] = useState(1);
  const [dictationFormPart, setDictationFormPart] = useState<"Part 1" | "Part 2" | "Part 3" | "Part 4">("Part 1");
  const [dictationFormYear, setDictationFormYear] = useState<"2026" | "2024" | "2023" | "2022">("2024");
  const [dictationFormQuestions, setDictationFormQuestions] = useState(10);
  const [deleteDictationConfirm, setDeleteDictationConfirm] = useState<DictationCardData | null>(null);

  // CRUD Level / Category
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevelCard, setEditingLevelCard] = useState<LevelCategoryCardData | null>(null);
  const [levelFormPart, setLevelFormPart] = useState<"Part 1" | "Part 2" | "Part 3" | "Part 4">("Part 1");
  const [levelFormType, setLevelFormType] = useState<"level" | "category">("level");
  const [levelFormTitle, setLevelFormTitle] = useState("");
  const [levelFormQuestions, setLevelFormQuestions] = useState(30);
  const [levelFormTheory, setLevelFormTheory] = useState("");
  const [levelFormRules, setLevelFormRules] = useState("");
  const [levelFormQuestion, setLevelFormQuestion] = useState<DictationQuestion>(EMPTY_LISTENING_QUESTION);
  const [deleteLevelConfirm, setDeleteLevelConfirm] = useState<LevelCategoryCardData | null>(null);

  // Handlers
  const handleOpenAddDictation = () => {
    setEditingDictationCard(null);
    setDictationFormTitle("");
    setDictationFormAudioUrl("");
    setDictationFormTranscript("");
    setDictationFormTranslation("");
    setDictationFormTestNum(1);
    setDictationFormPart("Part 1");
    setDictationFormYear(selectedYear);
    setDictationFormQuestions(10);
    setShowDictationModal(true);
  };

  const handleOpenEditDictation = (card: DictationCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDictationCard(card);
    const q1 = card.questions?.[0];
    setDictationFormTitle(card.title || `Test ${card.testNumber} - ${card.part}`);
    setDictationFormAudioUrl(q1?.audioUrl || "");
    setDictationFormTranscript(q1?.fullTranscript || "");
    setDictationFormTranslation(q1?.vietnameseTranslation || "");
    setDictationFormTestNum(card.testNumber);
    setDictationFormPart(card.part);
    setDictationFormYear(card.year);
    setDictationFormQuestions(card.totalQuestions);
    setShowDictationModal(true);
  };

  const handleSaveDictation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictationFormTitle.trim()) {
      triggerToast("Vui lòng nhập tiêu đề bài nghe chép! ⚠️");
      return;
    }
    if (!dictationFormTranscript.trim()) {
      triggerToast("Vui lòng nhập transcript đoạn nghe! ⚠️");
      return;
    }
    if (!dictationFormAudioUrl.trim()) {
      triggerToast("Vui lòng nhập đường dẫn Audio MP3! ⚠️");
      return;
    }

    const request = {
        title: dictationFormTitle.trim(),
        testNumber: dictationFormTestNum,
        part: dictationFormPart,
        year: dictationFormYear,
        totalQuestions: dictationFormQuestions,
        audioUrl: dictationFormAudioUrl.trim(),
        fullTranscript: dictationFormTranscript.trim(),
        vietnameseTranslation: dictationFormTranslation.trim(),
    };
    try {
      const savedCard = editingDictationCard
        ? await updateListeningCard(editingDictationCard.id, request)
        : await createListeningCard(request);
      setDictationCards((prev) => editingDictationCard
        ? prev.map((card) => card.id === savedCard.id ? savedCard : card)
        : [savedCard, ...prev]);
      triggerToast(editingDictationCard
        ? `Đã cập nhật bài nghe "${dictationFormTitle}"! 💾`
        : `Đã thêm bài nghe "${dictationFormTitle}" thành công! 🎉`);
      setShowDictationModal(false);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể lưu bài nghe.");
    }
  };

  const handleConfirmDeleteDictationCard = async () => {
    if (!deleteDictationConfirm) return;
    try {
      await deleteListeningCard(deleteDictationConfirm.id);
      setDictationCards((prev) => prev.filter((c) => c.id !== deleteDictationConfirm.id));
      triggerToast(`Đã xóa bài nghe ${deleteDictationConfirm.part} - Test ${deleteDictationConfirm.testNumber}! 🗑️`);
      setDeleteDictationConfirm(null);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể xóa bài nghe.");
    }
  };

  const handleOpenAddLevel = (part: "Part 1" | "Part 2" | "Part 3" | "Part 4", type: "level" | "category" = "level") => {
    setEditingLevelCard(null);
    setLevelFormPart(part);
    setLevelFormType(type);
    setLevelFormTitle("");
    setLevelFormQuestions(30);
    setLevelFormTheory("");
    setLevelFormRules("");
    setLevelFormQuestion({ ...EMPTY_LISTENING_QUESTION, part });
    setShowLevelModal(true);
  };

  const handleOpenEditLevel = (card: LevelCategoryCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingLevelCard(card);
    setLevelFormPart(card.part);
    setLevelFormType(card.type);
    setLevelFormTitle(card.title);
    setLevelFormQuestions(card.totalQuestions);
    setLevelFormTheory(card.theorySummary);
    setLevelFormRules(card.rules.join("\n"));
    setLevelFormQuestion(card.questions[0] || { ...EMPTY_LISTENING_QUESTION, part: card.part });
    setShowLevelModal(true);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormTitle.trim()) {
      triggerToast("Vui lòng nhập tên chủ điểm!");
      return;
    }
    const options = levelFormQuestion.options || {};
    if (!levelFormQuestion.audioUrl.trim() || !levelFormQuestion.fullTranscript.trim()
      || !["A", "B", "C", "D"].every((key) => options[key]?.trim())
      || !levelFormQuestion.correctAnswer) {
      triggerToast("Vui lòng nhập audio, transcript, đủ 4 lựa chọn và đáp án đúng.");
      return;
    }
    const rulesArray = levelFormRules.split("\n").map((r) => r.trim()).filter(Boolean);
    const part = editingLevelCard?.part || levelFormPart;
    const savedQuestion: DictationQuestion = {
      ...levelFormQuestion,
      id: editingLevelCard?.questions[0]?.id || Date.now(),
      part,
      options: {
        A: options.A || "",
        B: options.B || "",
        C: options.C || "",
        D: options.D || "",
      },
    };
    const request = {
      part,
      type: editingLevelCard?.type || levelFormType,
      title: levelFormTitle.trim(),
      targetLevel: editingLevelCard?.targetLevel,
      totalQuestions: levelFormQuestions,
      theorySummary: levelFormTheory.trim(),
      rules: rulesArray.length > 0 ? rulesArray : editingLevelCard?.rules || [],
      vocabBag: editingLevelCard?.vocabBag || [],
      questions: editingLevelCard
        ? [savedQuestion, ...editingLevelCard.questions.slice(1)]
        : [savedQuestion],
    };
    try {
      const savedUnit = editingLevelCard
        ? await updateListeningUnit(editingLevelCard.id, request)
        : await createListeningUnit(request);
      const setUnitList = (
        part: LevelCategoryCardData["part"],
        type: "level" | "category",
        updater: React.Dispatch<React.SetStateAction<LevelCategoryCardData[]>>
      ) => {
        if (savedUnit.part !== part || savedUnit.type !== type) return;
        updater((prev) => editingLevelCard
          ? prev.map((unit) => unit.id === savedUnit.id ? savedUnit : unit)
          : [savedUnit, ...prev]);
      };
      setUnitList("Part 1", "level", setPart1Levels);
      setUnitList("Part 1", "category", setPart1Categories);
      setUnitList("Part 2", "level", setPart2Levels);
      setUnitList("Part 2", "category", setPart2Categories);
      setUnitList("Part 3", "level", setPart3Levels);
      setUnitList("Part 3", "category", setPart3Categories);
      setUnitList("Part 4", "level", setPart4Levels);
      setUnitList("Part 4", "category", setPart4Categories);
      triggerToast(editingLevelCard
        ? `Đã cập nhật chủ điểm "${levelFormTitle}"! 💾`
        : `Đã thêm chủ điểm "${savedUnit.title}"! 🎉`);
      setShowLevelModal(false);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể lưu chủ điểm nghe.");
    }
  };

  const handleConfirmDeleteLevelCard = async () => {
    if (!deleteLevelConfirm) return;
    const filterOut = (list: LevelCategoryCardData[]) => list.filter((c) => c.id !== deleteLevelConfirm.id);
    try {
      await deleteListeningUnit(deleteLevelConfirm.id);
      if (deleteLevelConfirm.part === "Part 1") {
        if (deleteLevelConfirm.type === "level") setPart1Levels(filterOut);
        else setPart1Categories(filterOut);
      } else if (deleteLevelConfirm.part === "Part 2") {
        if (deleteLevelConfirm.type === "level") setPart2Levels(filterOut);
        else setPart2Categories(filterOut);
      } else if (deleteLevelConfirm.part === "Part 3") {
        if (deleteLevelConfirm.type === "level") setPart3Levels(filterOut);
        else setPart3Categories(filterOut);
      } else if (deleteLevelConfirm.part === "Part 4") {
        if (deleteLevelConfirm.type === "level") setPart4Levels(filterOut);
        else setPart4Categories(filterOut);
      }
      triggerToast(`Đã xóa chủ điểm "${deleteLevelConfirm.title}"! 🗑️`);
      setDeleteLevelConfirm(null);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Không thể xóa chủ điểm nghe.");
    }
  };

  const handleOpenDictationPractice = (card: DictationCardData) => {
    setDictationModalCard(card);
    setActiveDictationQIndex(0);
    setDictationUserInputs({});
    setDictationChecked({});
    setIsPlayingAudio(false);
  };

  const handleOpenQuizPractice = (card: LevelCategoryCardData) => {
    setQuizModalCard(card);
    setActiveQuizQIndex(0);
    setQuizSelectedOption({});
    setQuizAnswerChecked({});
    setIsPlayingAudio(false);
  };

  const handleToggleSaveWord = (word: string) => {
    if (savedVocabBag.includes(word)) {
      setSavedVocabBag((prev) => prev.filter((w) => w !== word));
      triggerToast(`Đã bỏ từ "${word}" khỏi giỏ từ.`);
    } else {
      setSavedVocabBag((prev) => [...prev, word]);
      triggerToast(`✨ Đã lưu từ "${word}" vào giỏ từ vựng cá nhân!`);
    }
  };

  const handleToggleFlagReview = (qId: number) => {
    if (flaggedReviewIds.includes(qId)) {
      setFlaggedReviewIds((prev) => prev.filter((id) => id !== qId));
      triggerToast(`Đã gỡ câu ${qId} khỏi danh sách cần luyện lại.`);
    } else {
      setFlaggedReviewIds((prev) => [...prev, qId]);
      triggerToast(`Đã thêm câu ${qId} vào "Câu cần luyện lại"!`);
    }
  };

  const handleConfirmDeleteProgress = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === "dictation") {
      setDictationCards((prev) =>
        prev.map((c) => (c.id === deleteConfirmTarget.id ? { ...c, completedQuestions: 0, status: "Chưa bắt đầu" } : c))
      );
    } else {
      const reset = (c: LevelCategoryCardData) =>
        c.id === deleteConfirmTarget.id
          ? { ...c, completedQuestions: 0, correctCount: 0, wrongCount: 0, status: "Chưa luyện tập" as const }
          : c;
      setPart1Levels((prev) => prev.map(reset));
      setPart1Categories((prev) => prev.map(reset));
      setPart2Levels((prev) => prev.map(reset));
      setPart2Categories((prev) => prev.map(reset));
      setPart3Levels((prev) => prev.map(reset));
      setPart3Categories((prev) => prev.map(reset));
      setPart4Levels((prev) => prev.map(reset));
      setPart4Categories((prev) => prev.map(reset));
    }
    triggerToast(`Đã đặt lại tiến độ cho ${deleteConfirmTarget.title}!`);
    setDeleteConfirmTarget(null);
  };

  const filteredDictationCards = useMemo(() => {
    return dictationCards.filter((c) => c.year === selectedYear);
  }, [dictationCards, selectedYear]);

  const testsGrouped = useMemo(() => {
    const groups: { [testNum: number]: DictationCardData[] } = {};
    filteredDictationCards.forEach((c) => {
      if (!groups[c.testNumber]) groups[c.testNumber] = [];
      groups[c.testNumber].push(c);
    });
    return groups;
  }, [filteredDictationCards]);

  const handleExportCsv = () => {
    let stt = 1;
    const dataToExport = [
      ...dictationCards.map((c) => ({
        stt: stt++,
        type: "Nghe chép chính tả",
        part: c.part,
        title: `Test ${c.testNumber} - ${c.part} (${c.year})`,
        year: c.year,
        questionsCount: c.totalQuestions,
        status: "PUBLISHED",
      })),
      ...part1Levels.map((l) => ({
        stt: stt++,
        type: "Luyện nghe Part 1 theo cấp độ",
        part: l.part,
        title: l.title,
        year: l.targetLevel || "Mọi cấp độ",
        questionsCount: l.totalQuestions,
        status: "PUBLISHED",
      })),
      ...part2Levels.map((l) => ({
        stt: stt++,
        type: "Luyện nghe Part 2 theo cấp độ",
        part: l.part,
        title: l.title,
        year: l.targetLevel || "Mọi cấp độ",
        questionsCount: l.totalQuestions,
        status: "PUBLISHED",
      })),
      ...part3Levels.map((l) => ({
        stt: stt++,
        type: "Luyện nghe Part 3 theo cấp độ",
        part: l.part,
        title: l.title,
        year: l.targetLevel || "Mọi cấp độ",
        questionsCount: l.totalQuestions,
        status: "PUBLISHED",
      })),
      ...part4Levels.map((l) => ({
        stt: stt++,
        type: "Luyện nghe Part 4 theo cấp độ",
        part: l.part,
        title: l.title,
        year: l.targetLevel || "Mọi cấp độ",
        questionsCount: l.totalQuestions,
        status: "PUBLISHED",
      })),
    ];

    exportToExcel({
      filename: `chuong_trinh_listening_toeic_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Listening TOEIC",
      title: "HỆ THỐNG QUẢN LÝ BÀI LUYỆN TOEIC LISTENING COMPREHENSION",
      metadata: [
        { label: "Ngày xuất báo cáo", value: new Date().toLocaleDateString("vi-VN") },
        { label: "Năm lọc hiện tại", value: selectedYear },
        { label: "Tổng số bài học & chủ điểm", value: dataToExport.length },
      ],
      columns: [
        { header: "STT", key: "stt", width: 50, align: "center" },
        { header: "Hình thức luyện tập", key: "type", width: 180, align: "left" },
        { header: "Phần thi", key: "part", width: 90, align: "center" },
        { header: "Tên bài luyện / Chủ điểm", key: "title", width: 250, align: "left" },
        { header: "Năm / Target Level", key: "year", width: 140, align: "center" },
        { header: "Số câu hỏi", key: "questionsCount", width: 90, align: "center" },
        { header: "Trạng thái", key: "status", width: 110, align: "center" },
      ],
      data: dataToExport,
    });
    triggerToast("Đã xuất chương trình Listening ra file Excel (.xls) có cấu trúc cột rõ ràng! 📊");
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}
      {dataLoadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dataLoadError}
        </div>
      ) : null}

      {/* HEADER BANNER & MAIN TABS */}
      <ListeningHeader
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
        activePartTab={activeTab}
        setActivePartTab={setActiveTab}
        onOpenCreate={() => {
          if (activeTab === "dictation") {
            handleOpenAddDictation();
          } else if (activeTab === "part1") {
            handleOpenAddLevel("Part 1");
          } else if (activeTab === "part2") {
            handleOpenAddLevel("Part 2");
          } else if (activeTab === "part3") {
            handleOpenAddLevel("Part 3");
          } else if (activeTab === "part4") {
            handleOpenAddLevel("Part 4");
          }
        }}
        onExportCsv={handleExportCsv}
      />

      {/* ADMIN TABS ROUTING */}
      {activeAdminTab === "listening_units" && (
        <>
          {/* TAB CONTENT 1: NGHE CHÉP */}
          {activeTab === "dictation" && (
            <ListeningDictationTab
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              flaggedReviewIds={flaggedReviewIds}
              testsGrouped={testsGrouped}
              handleOpenAddDictation={handleOpenAddDictation}
              handleOpenEditDictation={handleOpenEditDictation}
              setDeleteDictationConfirm={setDeleteDictationConfirm}
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenDictationPractice={handleOpenDictationPractice}
              setShowReviewQuestionsModal={setShowReviewQuestionsModal}
            />
          )}

          {/* TAB CONTENT 2: PART 1 */}
          {activeTab === "part1" && (
            <ListeningPartTab
              part="Part 1"
              levels={part1Levels}
              categories={part1Categories}
              categorySectionTitle="Theo dạng tranh"
              categorySectionSubtitle="Cùng bộ câu ở trên, chia theo bức tranh mô tả gì."
              handleOpenAddLevel={handleOpenAddLevel}
              handleOpenEditLevel={handleOpenEditLevel}
              setDeleteLevelConfirm={setDeleteLevelConfirm}
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenQuizPractice={handleOpenQuizPractice}
            />
          )}

          {/* TAB CONTENT 3: PART 2 */}
          {activeTab === "part2" && (
            <ListeningPartTab
              part="Part 2"
              levels={part2Levels}
              categories={part2Categories}
              categorySectionTitle="Theo dạng câu hỏi"
              categorySectionSubtitle="Phân loại câu hỏi Wh-, Yes/No, Lựa chọn và bẫy gián tiếp."
              handleOpenAddLevel={handleOpenAddLevel}
              handleOpenEditLevel={handleOpenEditLevel}
              setDeleteLevelConfirm={setDeleteLevelConfirm}
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenQuizPractice={handleOpenQuizPractice}
            />
          )}

          {/* TAB CONTENT 4: PART 3 */}
          {activeTab === "part3" && (
            <ListeningPartTab
              part="Part 3"
              levels={part3Levels}
              categories={part3Categories}
              categorySectionTitle="Theo chủ đề hội thoại"
              categorySectionSubtitle="Công sở, dịch vụ, hội thoại 3 người và bài đọc kèm sơ đồ."
              handleOpenAddLevel={handleOpenAddLevel}
              handleOpenEditLevel={handleOpenEditLevel}
              setDeleteLevelConfirm={setDeleteLevelConfirm}
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenQuizPractice={handleOpenQuizPractice}
            />
          )}

          {/* TAB CONTENT 5: PART 4 */}
          {activeTab === "part4" && (
            <ListeningPartTab
              part="Part 4"
              levels={part4Levels}
              categories={part4Categories}
              categorySectionTitle="Theo dạng bài nói"
              categorySectionSubtitle="Thông báo ga tàu, hộp thư thoại, bản tin thời tiết & bài phát biểu."
              handleOpenAddLevel={handleOpenAddLevel}
              handleOpenEditLevel={handleOpenEditLevel}
              setDeleteLevelConfirm={setDeleteLevelConfirm}
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenQuizPractice={handleOpenQuizPractice}
            />
          )}
        </>
      )}

      {activeAdminTab === "audio_assets" && (
        <ListeningAudioAssetsView />
      )}

      {activeAdminTab === "accent_matrix" && (
        <ListeningAccentMatrixView />
      )}

      {/* WORKSPACE MODALS */}
      {dictationModalCard && (
        <ListeningDictationModal
          dictationModalCard={dictationModalCard}
          setDictationModalCard={setDictationModalCard}
          activeDictationQIndex={activeDictationQIndex}
          setActiveDictationQIndex={setActiveDictationQIndex}
          dictationUserInputs={dictationUserInputs}
          dictationChecked={dictationChecked}
          dictationSubTab={dictationSubTab}
          setDictationSubTab={setDictationSubTab}
          fillPercentage={fillPercentage}
          setFillPercentage={setFillPercentage}
          revealedWordCount={revealedWordCount}
          setRevealedWordCount={setRevealedWordCount}
          replayCount={replayCount}
          setReplayCount={setReplayCount}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          audioSpeed={audioSpeed}
          setAudioSpeed={setAudioSpeed}
          flaggedReviewIds={flaggedReviewIds}
          handleToggleFlagReview={handleToggleFlagReview}
          setIsNotesModalOpen={setIsNotesModalOpen}
          setIsQuestionGridOpen={setIsQuestionGridOpen}
          playSfx={playSfx}
          playAudio={playAudio}
          triggerToast={triggerToast}
        />
      )}

      {quizModalCard && (
        <ListeningQuizModal
          quizModalCard={quizModalCard}
          setQuizModalCard={setQuizModalCard}
          activeQuizQIndex={activeQuizQIndex}
          setActiveQuizQIndex={setActiveQuizQIndex}
          quizSelectedOption={quizSelectedOption}
          setQuizSelectedOption={setQuizSelectedOption}
          quizAnswerChecked={quizAnswerChecked}
          setQuizAnswerChecked={setQuizAnswerChecked}
          showBilingualQuiz={showBilingualQuiz}
          setShowBilingualQuiz={setShowBilingualQuiz}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
          isSfxEnabled={isSfxEnabled}
          setIsSfxEnabled={setIsSfxEnabled}
          flaggedReviewIds={flaggedReviewIds}
          handleToggleFlagReview={handleToggleFlagReview}
          playSfx={playSfx}
          playAudio={playAudio}
          triggerToast={triggerToast}
          setPart1Levels={setPart1Levels}
          setPart1Categories={setPart1Categories}
          setPart2Levels={setPart2Levels}
          setPart2Categories={setPart2Categories}
          setPart3Levels={setPart3Levels}
          setPart3Categories={setPart3Categories}
          setPart4Levels={setPart4Levels}
          setPart4Categories={setPart4Categories}
        />
      )}

      {/* POPUP MODALS */}
      <VocabBagModal
        vocabBagModalData={vocabBagModalData}
        setVocabBagModalData={setVocabBagModalData}
        savedVocabBag={savedVocabBag}
        handleToggleSaveWord={handleToggleSaveWord}
      />

      <TheoryModal
        theoryModalData={theoryModalData}
        setTheoryModalData={setTheoryModalData}
      />

      <DeleteProgressModal
        deleteConfirmTarget={deleteConfirmTarget}
        setDeleteConfirmTarget={setDeleteConfirmTarget}
        handleConfirmDeleteProgress={handleConfirmDeleteProgress}
      />

      <ReviewQuestionsModal
        showReviewQuestionsModal={showReviewQuestionsModal}
        setShowReviewQuestionsModal={setShowReviewQuestionsModal}
        flaggedReviewIds={flaggedReviewIds}
        questions={dictationCards.flatMap((card) => card.questions || [])}
        handleToggleFlagReview={handleToggleFlagReview}
      />

      <DictationFormModal
        showDictationModal={showDictationModal}
        setShowDictationModal={setShowDictationModal}
        editingDictationCard={editingDictationCard}
        dictationFormTitle={dictationFormTitle}
        setDictationFormTitle={setDictationFormTitle}
        dictationFormAudioUrl={dictationFormAudioUrl}
        setDictationFormAudioUrl={setDictationFormAudioUrl}
        dictationFormTranscript={dictationFormTranscript}
        setDictationFormTranscript={setDictationFormTranscript}
        dictationFormTranslation={dictationFormTranslation}
        setDictationFormTranslation={setDictationFormTranslation}
        dictationFormTestNum={dictationFormTestNum}
        setDictationFormTestNum={setDictationFormTestNum}
        dictationFormPart={dictationFormPart}
        setDictationFormPart={setDictationFormPart}
        dictationFormYear={dictationFormYear}
        setDictationFormYear={setDictationFormYear}
        dictationFormQuestions={dictationFormQuestions}
        setDictationFormQuestions={setDictationFormQuestions}
        handleSaveDictation={handleSaveDictation}
      />

      <DeleteDictationModal
        deleteDictationConfirm={deleteDictationConfirm}
        setDeleteDictationConfirm={setDeleteDictationConfirm}
        handleConfirmDeleteDictationCard={handleConfirmDeleteDictationCard}
      />

      <LevelFormModal
        showLevelModal={showLevelModal}
        setShowLevelModal={setShowLevelModal}
        editingLevelCard={editingLevelCard}
        levelFormPart={levelFormPart}
        setLevelFormPart={setLevelFormPart}
        levelFormTitle={levelFormTitle}
        setLevelFormTitle={setLevelFormTitle}
        levelFormQuestions={levelFormQuestions}
        setLevelFormQuestions={setLevelFormQuestions}
        levelFormTheory={levelFormTheory}
        setLevelFormTheory={setLevelFormTheory}
        levelFormRules={levelFormRules}
        setLevelFormRules={setLevelFormRules}
        levelFormQuestion={levelFormQuestion}
        setLevelFormQuestion={setLevelFormQuestion}
        handleSaveLevel={handleSaveLevel}
      />

      <DeleteLevelModal
        deleteLevelConfirm={deleteLevelConfirm}
        setDeleteLevelConfirm={setDeleteLevelConfirm}
        handleConfirmDeleteLevelCard={handleConfirmDeleteLevelCard}
      />
    </div>
  );
}
