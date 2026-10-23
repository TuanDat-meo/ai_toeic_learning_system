"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Volume2 } from "lucide-react";
import { DictationCardData, LevelCategoryCardData } from "@/app/admin/content/listening/types";
import {
  INITIAL_DICTATION_CARDS,
  INITIAL_PART1_LEVELS,
  INITIAL_PART1_CATEGORIES,
  INITIAL_PART2_LEVELS,
  INITIAL_PART2_CATEGORIES,
  INITIAL_PART3_LEVELS,
  INITIAL_PART3_CATEGORIES,
  INITIAL_PART4_LEVELS,
  INITIAL_PART4_CATEGORIES,
} from "@/app/admin/content/listening/mockData";
import { StudentListeningDictationTab } from "@/components/student/listening/StudentListeningDictationTab";
import { StudentListeningPartTab } from "@/components/student/listening/StudentListeningPartTab";
import { ListeningDictationModal } from "@/components/admin/content/listening/ListeningDictationModal";
import { ListeningQuizModal } from "@/components/admin/content/listening/ListeningQuizModal";
import { playUnifiedAnswerSound } from "@/lib/sound";
import { VocabBagModal, TheoryModal } from "@/components/admin/content/listening/ListeningModals";
import { LearningQuotaBadge } from "@/components/student/billing/LearningQuotaBadge";
import { consumeLearningFeature } from "@/lib/api/billing";
import { getItemProgress, getRedoWrongQuestions } from "@/lib/practiceProgress";

export default function StudentListeningPage() {
  const [activeTab, setActiveTab] = useState<"dictation" | "part1" | "part2" | "part3" | "part4">("dictation");
  const [selectedYear, setSelectedYear] = useState<"2024" | "2023" | "2022">("2024");
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);

  async function startActivity(featureKey: string, open: () => void) {
    try {
      await consumeLearningFeature(featureKey);
      open();
    } catch (error) {
      setQuotaMessage(error instanceof Error ? error.message : "Không thể bắt đầu hoạt động học.");
    }
  }

  const openListeningQuiz = (card: LevelCategoryCardData, startIndex = 0, isRedo = false) => {
    void startActivity("LISTENING_PART_PRACTICE", () => {
      let cardToUse = card;
      if (isRedo) {
        const filtered = getRedoWrongQuestions(
          card.questions || [],
          `listening-quiz-${card.id}`,
          card.questions?.length || card.totalQuestions || 10
        );
        cardToUse = {
          ...card,
          title: `${card.title} · Làm lại ${filtered.length} câu sai`,
          questions: filtered,
          totalQuestions: filtered.length,
          originalTotalQuestions: card.questions?.length || card.totalQuestions || 10,
        };
      }
      setQuizModalCard(cardToUse);
      setActiveQuizQIndex(isRedo ? 0 : startIndex);
      setQuizSelectedOption({});
      setQuizAnswerChecked({});
    });
  };

  // Dữ liệu Cards
  const [dictationCards] = useState<DictationCardData[]>(INITIAL_DICTATION_CARDS);
  const [part1Levels, setPart1Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART1_LEVELS);
  const [part1Categories, setPart1Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART1_CATEGORIES);
  const [part2Levels, setPart2Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART2_LEVELS);
  const [part2Categories, setPart2Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART2_CATEGORIES);
  const [part3Levels, setPart3Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART3_LEVELS);
  const [part3Categories, setPart3Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART3_CATEGORIES);
  const [part4Levels, setPart4Levels] = useState<LevelCategoryCardData[]>(INITIAL_PART4_LEVELS);
  const [part4Categories, setPart4Categories] = useState<LevelCategoryCardData[]>(INITIAL_PART4_CATEGORIES);

  // Modal 1: Dictation Studio
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

  // Modal phụ
  const [vocabBagModalData, setVocabBagModalData] = useState<{
    title: string;
    items: { word: string; ipa: string; meaning: string; example?: string }[];
  } | null>(null);
  const [theoryModalData, setTheoryModalData] = useState<{
    title: string;
    summary: string;
    rules: string[];
  } | null>(null);
  const [savedVocabBag, setSavedVocabBag] = useState<string[]>([]);
  const [flaggedReviewIds, setFlaggedReviewIds] = useState<number[]>([]);

  // ✅ FIX 1: Ghi chú & Lưới câu hỏi — có state thật, không còn hàm rỗng
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isQuestionGridOpen, setIsQuestionGridOpen] = useState(false);

  // ✅ FIX 2: Toast thông báo — có state thật, hiển thị được
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Audio synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const playAudio = (text: string) => {
    if (!text.trim()) return;
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
    playUnifiedAnswerSound();
  };

  const handleToggleFlagReview = (qId: number) => {
    setFlaggedReviewIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Gom nhóm Dictation theo Test
  const testsGrouped = useMemo(() => {
    const filtered = dictationCards.filter((c) => c.year === selectedYear);
    const groups: { [testNum: number]: DictationCardData[] } = {};
    filtered.forEach((card) => {
      const tNum = card.testNumber || 1;
      if (!groups[tNum]) groups[tNum] = [];
      groups[tNum].push(card);
    });
    return groups;
  }, [dictationCards, selectedYear]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {quotaMessage ? <div role="alert" className="fixed right-5 top-5 z-[70] max-w-sm rounded-xl bg-red-700 px-4 py-3 text-xs font-semibold text-white shadow-xl">{quotaMessage}</div> : null}
      {/* ✅ Toast thông báo — hiển thị đúng */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Header chuẩn tối giản, thanh lịch như Admin */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Lộ trình TOEIC <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Luyện nghe Listening</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
            Luyện Thi TOEIC Listening Trọng Tâm
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <LearningQuotaBadge featureKey="LISTENING" />
        </div>
      </header>

      {/* Thanh tab chuyển đổi 5 dạng bài luyện nghe */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: "dictation", label: "Chép chính tả" },
          { id: "part1", label: "Part 1 - Hình ảnh" },
          { id: "part2", label: "Part 2 - Hỏi & Đáp" },
          { id: "part3", label: "Part 3 - Hội thoại" },
          { id: "part4", label: "Part 4 - Bài nói ngắn" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nội dung từng tab */}
      {activeTab === "dictation" && (
        <StudentListeningDictationTab
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          testsGrouped={testsGrouped}
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenDictationPractice={(card, startIndex = 0, isRedo = false) => {
            void startActivity("LISTENING_DICTATION", () => {
              let cardToUse = card;
              if (isRedo) {
                const filtered = getRedoWrongQuestions(
                  card.questions || [],
                  `listening-dictation-${card.id}`,
                  card.questions?.length || card.totalQuestions || 10
                );
                cardToUse = {
                  ...card,
                  questions: filtered,
                  totalQuestions: filtered.length,
                  originalTotalQuestions: card.questions?.length || card.totalQuestions || 10,
                };
              }
              setDictationModalCard(cardToUse);
              setActiveDictationQIndex(isRedo ? 0 : startIndex);
              setDictationUserInputs({});
              setDictationChecked({});
            });
          }}
        />
      )}

      {activeTab === "part1" && (
        <StudentListeningPartTab
          part="Part 1"
          levels={part1Levels}
          categories={part1Categories}
          categorySectionTitle="Theo Chủ đề Hình ảnh thực tế"
          categorySectionSubtitle="Luyện nghe tranh theo ngữ cảnh người thao tác, đồ vật tĩnh và quang cảnh."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {activeTab === "part2" && (
        <StudentListeningPartTab
          part="Part 2"
          levels={part2Levels}
          categories={part2Categories}
          categorySectionTitle="Theo Loại câu hỏi Part 2"
          categorySectionSubtitle="Luyện phản xạ câu hỏi Wh-, Yes/No, câu hỏi lựa chọn và câu hỏi đuôi."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {activeTab === "part3" && (
        <StudentListeningPartTab
          part="Part 3"
          levels={part3Levels}
          categories={part3Categories}
          categorySectionTitle="Theo Tình huống Hội thoại Part 3"
          categorySectionSubtitle="Luyện nghe hội thoại nơi công sở, đặt hàng, đàm phán và giao tiếp hàng ngày."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {activeTab === "part4" && (
        <StudentListeningPartTab
          part="Part 4"
          levels={part4Levels}
          categories={part4Categories}
          categorySectionTitle="Theo Dạng bài nói Part 4"
          categorySectionSubtitle="Luyện nghe thông báo phát thanh, tin nhắn thoại, bản tin giao thông và bài diễn thuyết."
          setVocabBagModalData={setVocabBagModalData}
          setTheoryModalData={setTheoryModalData}
          handleOpenQuizPractice={openListeningQuiz}
        />
      )}

      {/* Modal 1: Dictation Studio */}
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

      {/* Modal 2: Quiz Practice */}
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

      {/* Modal Túi từ vựng & Lý thuyết */}
      <VocabBagModal
        vocabBagModalData={vocabBagModalData}
        setVocabBagModalData={setVocabBagModalData}
        savedVocabBag={savedVocabBag}
        handleToggleSaveWord={(w) => {
          setSavedVocabBag((prev) =>
            prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
          );
        }}
      />
      <TheoryModal
        theoryModalData={theoryModalData}
        setTheoryModalData={setTheoryModalData}
      />
    </div>
  );
}
