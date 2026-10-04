"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { WordItem, TestItem } from "./types";
import { SAMPLE_WORDS, INITIAL_TESTS } from "./mockData";
import { VocabularyHeader } from "./components/VocabularyHeader";
import { VocabularyTestGrid } from "./components/VocabularyTestGrid";
import { VocabularyProgressView, VocabularyStarredView, VocabularyAlgorithmView } from "./components/VocabularyViews";
import { VocabularyModals } from "./components/VocabularyModals";

export default function VocabularyLearningPage() {
  const [activeMainTab, setActiveMainTab] = useState<"study" | "progress" | "my_words" | "algorithm">("study");
  const [activeSubCategory, setActiveSubCategory] = useState<"2026" | "600_essential" | "2023">("2026");
  const [tests, setTests] = useState<TestItem[]>(INITIAL_TESTS);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals State
  const [wordListModalTest, setWordListModalTest] = useState<TestItem | null>(null);
  const [flashcardModalTest, setFlashcardModalTest] = useState<TestItem | null>(null);
  const [gameModalTest, setGameModalTest] = useState<TestItem | null>(null);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);
  const [deleteTestConfirm, setDeleteTestConfirm] = useState<TestItem | null>(null);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [deleteWordConfirm, setDeleteWordConfirm] = useState<WordItem | null>(null);

  // Audio synthesis
  const playAudio = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text.trim()) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const starredWords = SAMPLE_WORDS.filter((w) => w.starred);

  // Test CRUD
  const handleSaveTestForm = (title: string, year: string, category: "2026" | "600_essential" | "2023") => {
    if (editingTest) {
      setTests((prev) =>
        prev.map((t) => (t.id === editingTest.id ? { ...t, title, year, category } : t))
      );
      showToast(`Đã cập nhật bộ từ vựng "${title}"! 💾`);
      setEditingTest(null);
    } else {
      const newTest: TestItem = {
        id: `test-${Date.now()}`,
        title,
        year: year || "2026",
        category,
        wordCount: SAMPLE_WORDS.length,
        words: [...SAMPLE_WORDS],
      };
      setTests((prev) => [newTest, ...prev]);
      showToast(`Đã thêm bộ từ vựng "${title}" thành công! 🎉`);
      setShowCreateTestModal(false);
    }
  };

  const handleConfirmDeleteTest = () => {
    if (!deleteTestConfirm) return;
    setTests((prev) => prev.filter((t) => t.id !== deleteTestConfirm.id));
    showToast(`Đã xóa bộ từ vựng "${deleteTestConfirm.title}"! 🗑️`);
    setDeleteTestConfirm(null);
  };

  // Word CRUD
  const handleSaveWordForm = (w: {
    word: string;
    ipa: string;
    partOfSpeech: string;
    meaning: string;
    example: string;
    level: string;
  }) => {
    if (!wordListModalTest) return;

    if (editingWord) {
      const updatedWords = wordListModalTest.words.map((item) =>
        item.id === editingWord.id ? { ...item, ...w } : item
      );
      const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
      setWordListModalTest(updatedTest);
      setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
      showToast(`Đã cập nhật từ "${w.word}"! 💾`);
    } else {
      const newWord: WordItem = {
        id: `w-${Date.now()}`,
        ...w,
        ipa: w.ipa || `/${w.word.toLowerCase()}/`,
      };
      const updatedWords = [newWord, ...wordListModalTest.words];
      const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
      setWordListModalTest(updatedTest);
      setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
      showToast(`Đã thêm từ "${newWord.word}" vào bộ từ vựng! 🎉`);
    }
    setShowAddWordModal(false);
  };

  const handleConfirmDeleteWord = () => {
    if (!deleteWordConfirm || !wordListModalTest) return;
    const updatedWords = wordListModalTest.words.filter((w) => w.id !== deleteWordConfirm.id);
    const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
    setWordListModalTest(updatedTest);
    setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
    showToast(`Đã xóa từ "${deleteWordConfirm.word}" khỏi bộ! 🗑️`);
    setDeleteWordConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      <VocabularyHeader activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />

      {activeMainTab === "study" && (
        <VocabularyTestGrid
          tests={tests}
          activeSubCategory={activeSubCategory}
          setActiveSubCategory={setActiveSubCategory}
          onOpenCreateTest={() => setShowCreateTestModal(true)}
          onOpenEditTest={(t, e) => {
            if (e) e.stopPropagation();
            setEditingTest(t);
          }}
          onOpenDeleteTest={(t, e) => {
            if (e) e.stopPropagation();
            setDeleteTestConfirm(t);
          }}
          onOpenWordList={setWordListModalTest}
          onOpenFlashcards={setFlashcardModalTest}
          onOpenGame={setGameModalTest}
        />
      )}

      {activeMainTab === "progress" && <VocabularyProgressView />}

      {activeMainTab === "my_words" && (
        <VocabularyStarredView words={starredWords} playAudio={playAudio} />
      )}

      {activeMainTab === "algorithm" && <VocabularyAlgorithmView />}

      {/* Modals Container */}
      <VocabularyModals
        wordListModalTest={wordListModalTest}
        onCloseWordList={() => setWordListModalTest(null)}
        playAudio={playAudio}
        onOpenAddWord={() => {
          setEditingWord(null);
          setShowAddWordModal(true);
        }}
        onOpenEditWord={(w) => {
          setEditingWord(w);
          setShowAddWordModal(true);
        }}
        onDeleteWordClick={setDeleteWordConfirm}
        onStartFlashcardsFromList={(target) => {
          setWordListModalTest(null);
          setFlashcardModalTest(target);
        }}
        flashcardModalTest={flashcardModalTest}
        onCloseFlashcards={() => setFlashcardModalTest(null)}
        gameModalTest={gameModalTest}
        onCloseGame={() => setGameModalTest(null)}
        showCreateTestModal={showCreateTestModal}
        editingTest={editingTest}
        onCloseTestForm={() => {
          setShowCreateTestModal(false);
          setEditingTest(null);
        }}
        onSaveTestForm={handleSaveTestForm}
        deleteTestConfirm={deleteTestConfirm}
        onCloseDeleteTest={() => setDeleteTestConfirm(null)}
        onConfirmDeleteTest={handleConfirmDeleteTest}
        showAddWordModal={showAddWordModal}
        editingWord={editingWord}
        onCloseWordForm={() => setShowAddWordModal(false)}
        onSaveWordForm={handleSaveWordForm}
        deleteWordConfirm={deleteWordConfirm}
        onCloseDeleteWord={() => setDeleteWordConfirm(null)}
        onConfirmDeleteWord={handleConfirmDeleteWord}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
