"use client";

import React, { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { DictationCardData, LevelCategoryCardData } from "./types";
import {
  SAMPLE_DICTATION_QUESTIONS,
  INITIAL_DICTATION_CARDS,
  INITIAL_PART1_LEVELS,
  INITIAL_PART1_CATEGORIES,
  INITIAL_PART2_LEVELS,
  INITIAL_PART2_CATEGORIES,
  INITIAL_PART3_LEVELS,
  INITIAL_PART3_CATEGORIES,
  INITIAL_PART4_LEVELS,
  INITIAL_PART4_CATEGORIES,
} from "./mockData";
import { ListeningHeader } from "@/components/admin/content/listening/ListeningHeader";
import { ListeningDictationTab } from "@/components/admin/content/listening/ListeningDictationTab";
import { ListeningPartTab } from "@/components/admin/content/listening/ListeningPartTab";
import { ListeningDictationModal } from "@/components/admin/content/listening/ListeningDictationModal";
import { ListeningQuizModal } from "@/components/admin/content/listening/ListeningQuizModal";
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

export default function ListeningPage() {
  // --- STATES CHÍNH ---
  const [activeTab, setActiveTab] = useState<"dictation" | "part1" | "part2" | "part3" | "part4">("dictation");
  const [selectedYear, setSelectedYear] = useState<"2026" | "2024" | "2023" | "2022">("2026");

  // Dữ liệu cards
  const [dictationCards, setDictationCards] = useState<DictationCardData[]>(INITIAL_DICTATION_CARDS);
  const [part1Levels, setPart1Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART1_LEVELS);
  const [part1Categories, setPart1Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART1_CATEGORIES);
  const [part2Levels, setPart2Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART2_LEVELS);
  const [part2Categories, setPart2Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART2_CATEGORIES);
  const [part3Levels, setPart3Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART3_LEVELS);
  const [part3Categories, setPart3Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART3_CATEGORIES);
  const [part4Levels, setPart4Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART4_LEVELS);
  const [part4Categories, setPart4Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART4_CATEGORIES);

  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);
  const [flaggedReviewIds, setFlaggedReviewIds] = useState<number[]>([3]);
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

  // Audio & SFX
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const playAudio = (text: string) => {
    if (!isSfxEnabled) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window && text.trim()) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSfx = (type?: "correct" | "wrong" | "click") => {
    if (!isSfxEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
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
  const [dictationFormTestNum, setDictationFormTestNum] = useState(1);
  const [dictationFormPart, setDictationFormPart] = useState<"Part 1" | "Part 2" | "Part 3" | "Part 4">("Part 1");
  const [dictationFormYear, setDictationFormYear] = useState<"2026" | "2024" | "2023" | "2022">("2026");
  const [dictationFormQuestions, setDictationFormQuestions] = useState(24);
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
  const [deleteLevelConfirm, setDeleteLevelConfirm] = useState<LevelCategoryCardData | null>(null);

  // Handlers
  const handleOpenAddDictation = () => {
    setEditingDictationCard(null);
    setDictationFormTestNum(1);
    setDictationFormPart("Part 1");
    setDictationFormYear(selectedYear);
    setDictationFormQuestions(24);
    setShowDictationModal(true);
  };

  const handleOpenEditDictation = (card: DictationCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDictationCard(card);
    setDictationFormTestNum(card.testNumber);
    setDictationFormPart(card.part);
    setDictationFormYear(card.year);
    setDictationFormQuestions(card.totalQuestions);
    setShowDictationModal(true);
  };

  const handleSaveDictation = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDictationCard) {
      setDictationCards((prev) =>
        prev.map((c) =>
          c.id === editingDictationCard.id
            ? { ...c, testNumber: dictationFormTestNum, part: dictationFormPart, year: dictationFormYear, totalQuestions: dictationFormQuestions }
            : c
        )
      );
      triggerToast(`Đã cập nhật bài nghe ${dictationFormPart} - Test ${dictationFormTestNum}! 💾`);
    } else {
      const newCard: DictationCardData = {
        id: `dict-${Date.now()}`,
        testNumber: dictationFormTestNum,
        part: dictationFormPart,
        year: dictationFormYear,
        totalQuestions: dictationFormQuestions,
        completedQuestions: 0,
        status: "Chưa bắt đầu",
        notesCount: 0,
        vocabItems: [],
        questions: [...SAMPLE_DICTATION_QUESTIONS.slice(0, 2)],
      };
      setDictationCards((prev) => [newCard, ...prev]);
      triggerToast(`Đã thêm bài nghe ${newCard.part} - Test ${newCard.testNumber}! 🎉`);
    }
    setShowDictationModal(false);
  };

  const handleConfirmDeleteDictationCard = () => {
    if (!deleteDictationConfirm) return;
    setDictationCards((prev) => prev.filter((c) => c.id !== deleteDictationConfirm.id));
    triggerToast(`Đã xóa bài nghe ${deleteDictationConfirm.part} - Test ${deleteDictationConfirm.testNumber}! 🗑️`);
    setDeleteDictationConfirm(null);
  };

  const handleOpenAddLevel = (part: "Part 1" | "Part 2" | "Part 3" | "Part 4", type: "level" | "category" = "level") => {
    setEditingLevelCard(null);
    setLevelFormPart(part);
    setLevelFormType(type);
    setLevelFormTitle("");
    setLevelFormQuestions(30);
    setLevelFormTheory("");
    setLevelFormRules("");
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
    setShowLevelModal(true);
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormTitle.trim()) {
      alert("Vui lòng nhập tên chủ điểm!");
      return;
    }
    const rulesArray = levelFormRules.split("\n").map((r) => r.trim()).filter(Boolean);
    const updateInList = (list: LevelCategoryCardData[]) =>
      list.map((c) =>
        c.id === editingLevelCard?.id
          ? { ...c, title: levelFormTitle.trim(), totalQuestions: levelFormQuestions, theorySummary: levelFormTheory.trim(), rules: rulesArray.length > 0 ? rulesArray : c.rules }
          : c
      );

    if (editingLevelCard) {
      if (editingLevelCard.part === "Part 1") {
        if (editingLevelCard.type === "level") setPart1Levels(updateInList);
        else setPart1Categories(updateInList);
      } else if (editingLevelCard.part === "Part 2") {
        if (editingLevelCard.type === "level") setPart2Levels(updateInList);
        else setPart2Categories(updateInList);
      } else if (editingLevelCard.part === "Part 3") {
        if (editingLevelCard.type === "level") setPart3Levels(updateInList);
        else setPart3Categories(updateInList);
      } else if (editingLevelCard.part === "Part 4") {
        if (editingLevelCard.type === "level") setPart4Levels(updateInList);
        else setPart4Categories(updateInList);
      }
      triggerToast(`Đã cập nhật chủ điểm "${levelFormTitle}"! 💾`);
    } else {
      const newCard: LevelCategoryCardData = {
        id: `lvl-${Date.now()}`,
        part: levelFormPart,
        type: levelFormType,
        title: levelFormTitle.trim(),
        totalQuestions: levelFormQuestions,
        completedQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        status: "Chưa luyện tập",
        theorySummary: levelFormTheory.trim() || "Chủ điểm luyện nghe chuyên sâu.",
        rules: rulesArray.length > 0 ? rulesArray : ["Lắng nghe cẩn thận các từ khóa quan trọng."],
        vocabBag: [],
        questions: [...SAMPLE_DICTATION_QUESTIONS.slice(0, 1)],
      };
      if (levelFormPart === "Part 1") {
        if (levelFormType === "level") setPart1Levels((prev) => [newCard, ...prev]);
        else setPart1Categories((prev) => [newCard, ...prev]);
      } else if (levelFormPart === "Part 2") {
        if (levelFormType === "level") setPart2Levels((prev) => [newCard, ...prev]);
        else setPart2Categories((prev) => [newCard, ...prev]);
      } else if (levelFormPart === "Part 3") {
        if (levelFormType === "level") setPart3Levels((prev) => [newCard, ...prev]);
        else setPart3Categories((prev) => [newCard, ...prev]);
      } else if (levelFormPart === "Part 4") {
        if (levelFormType === "level") setPart4Levels((prev) => [newCard, ...prev]);
        else setPart4Categories((prev) => [newCard, ...prev]);
      }
      triggerToast(`Đã thêm chủ điểm "${newCard.title}"! 🎉`);
    }
    setShowLevelModal(false);
  };

  const handleConfirmDeleteLevelCard = () => {
    if (!deleteLevelConfirm) return;
    const filterOut = (list: LevelCategoryCardData[]) => list.filter((c) => c.id !== deleteLevelConfirm.id);
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

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER & MAIN TABS */}
      <ListeningHeader activeTab={activeTab} setActiveTab={setActiveTab} />

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
        handleToggleFlagReview={handleToggleFlagReview}
      />

      <DictationFormModal
        showDictationModal={showDictationModal}
        setShowDictationModal={setShowDictationModal}
        editingDictationCard={editingDictationCard}
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
