"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { WordItem, VocabularyTestSet, TestItem } from "./types";
import { CONTENT_STATUS_LABEL } from "@/lib/types/domain";
import { SAMPLE_WORDS, INITIAL_TESTS } from "./mockData";
import {
  getAdminVocabularySets,
  createVocabularySet,
  updateVocabularySet,
  deleteVocabularySet,
  addVocabularyWord,
  updateVocabularyWord,
  deleteVocabularyWord,
} from "@/lib/api/vocabulary";
import { VocabularyHeader } from "@/components/admin/content/vocabulary/VocabularyHeader";
import { VocabularyTestGrid } from "@/components/admin/content/vocabulary/VocabularyTestGrid";
import {
  VocabularyAllWordsView,
  VocabularyAlgorithmConfigView,
  VocabularyAnalyticsView,
} from "@/components/admin/content/vocabulary/VocabularyViews";
import { VocabularyModals } from "@/components/admin/content/vocabulary/VocabularyModals";

export default function VocabularyLearningPage() {
  const [activeMainTab, setActiveMainTab] = useState<"topics" | "all_words" | "algorithm" | "analytics">("topics");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>(INITIAL_TESTS);
  const [loading, setLoading] = useState<boolean>(true);

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
  const [editingTest, setEditingTest] = useState<VocabularyTestSet | null>(null);
  const [deleteTestConfirm, setDeleteTestConfirm] = useState<VocabularyTestSet | null>(null);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [deleteWordConfirm, setDeleteWordConfirm] = useState<WordItem | null>(null);

  const loadSets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminVocabularySets();
      if (data && data.length > 0) {
        setTests(data);
      } else {
        setTests(INITIAL_TESTS);
      }
    } catch (err) {
      console.warn("Could not load vocabulary sets from server, using fallback:", err);
      setTests(INITIAL_TESTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  // Audio synthesis
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

  const allWordsCombined = React.useMemo(() => {
    const map = new Map<string, WordItem>();
    tests.forEach((t) => {
      t.words?.forEach((w) => {
        const key = w.word.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, w);
        }
      });
    });
    return Array.from(map.values());
  }, [tests]);

  const existingCategories = React.useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tests]);

  const totalWordsCount = allWordsCombined.length;

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ["ID", "Tên bộ từ", "Năm / Danh mục", "Số lượng từ", "Trạng thái"],
      ...tests.map((t) => [
        t.id,
        `"${(t.nameVi || t.title || "").replace(/"/g, '""')}"`,
        t.year ?? t.category,
        t.wordCount,
        (t.status && (CONTENT_STATUS_LABEL as Record<string, string>)[t.status]) ?? t.status ?? "DRAFT",
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh_sach_bo_tu_vung_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất danh sách bộ từ vựng ra file CSV thành công! 📊");
  };

  // Test CRUD
  const handleSaveTestForm = async (nameVi: string, year: string, category: any) => {
    if (editingTest) {
      try {
        const updated = await updateVocabularySet(editingTest.id, { title: nameVi, year, category });
        setTests((prev) =>
          prev.map((t) => (t.id === editingTest.id ? { ...t, ...updated, words: t.words } : t))
        );
        showToast(`Đã cập nhật bộ từ vựng "${nameVi}"! 💾`);
      } catch (err) {
        console.error("Lỗi cập nhật bộ từ:", err);
        setTests((prev) =>
          prev.map((t) => (t.id === editingTest.id ? { ...t, nameVi, title: nameVi, year: parseInt(year) || undefined, category } : t))
        );
      }
      setEditingTest(null);
    } else {
      try {
        const created = await createVocabularySet({ title: nameVi, year, category });
        setTests((prev) => [created, ...prev]);
        showToast(`Đã thêm bộ từ vựng "${nameVi}" thành công! 🎉`);
      } catch (err) {
        console.error("Lỗi tạo bộ từ:", err);
        const newTest: VocabularyTestSet = {
          id: `test-${Date.now()}`,
          code: `CUSTOM_${Date.now()}`,
          nameVi,
          nameEn: nameVi,
          title: nameVi,
          year: parseInt(year) || undefined,
          category,
          status: 'DRAFT',
          wordCount: 0,
          words: [],
        };
        setTests((prev) => [newTest, ...prev]);
      }
      setShowCreateTestModal(false);
    }
  };

  const handleConfirmDeleteTest = async () => {
    if (!deleteTestConfirm) return;
    try {
      await deleteVocabularySet(deleteTestConfirm.id);
    } catch (err) {
      console.error("Lỗi xóa bộ từ:", err);
    }
    setTests((prev) => prev.filter((t) => t.id !== deleteTestConfirm.id));
    showToast(`Đã xóa bộ từ vựng "${deleteTestConfirm.title || deleteTestConfirm.nameVi}"! 🗑️`);
    setDeleteTestConfirm(null);
  };

  // Word CRUD
  const handleSaveWordForm = async (w: {
    word: string;
    ipa: string;
    partOfSpeech: string;
    meaning: string;
    example: string;
    level: string;
  }) => {
    if (!wordListModalTest) return;

    if (editingWord) {
      try {
        const updatedWord = await updateVocabularyWord(editingWord.id, {
          word: w.word,
          ipa: w.ipa,
          partOfSpeech: w.partOfSpeech,
          meaning: w.meaning,
          example: w.example,
          level: w.level,
        });
        const updatedWords = (wordListModalTest.words || []).map((item: any) =>
          item.id === editingWord.id ? updatedWord : item
        );
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
        showToast(`Đã cập nhật từ vựng "${w.word}"! 💾`);
      } catch (err) {
        console.error("Lỗi cập nhật từ:", err);
        const updatedWords = (wordListModalTest.words || []).map((item: any) =>
          item.id === editingWord.id ? { ...item, ...w } : item
        );
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
      }
      setEditingWord(null);
    } else {
      try {
        const createdWord = await addVocabularyWord(wordListModalTest.id, {
          word: w.word,
          ipa: w.ipa,
          partOfSpeech: w.partOfSpeech,
          meaning: w.meaning,
          example: w.example,
          level: w.level,
        });
        const updatedWords = [createdWord, ...(wordListModalTest.words || [])];
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
        showToast(`Đã thêm từ vựng "${w.word}" vào bộ! 🎉`);
      } catch (err) {
        console.error("Lỗi thêm từ:", err);
        const newWord: WordItem = {
          id: `w-${Date.now()}`,
          ...w,
        };
        const updatedWords = [newWord, ...(wordListModalTest.words || [])];
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
      }
    }
    setShowAddWordModal(false);
  };

  const handleConfirmDeleteWord = async () => {
    if (!deleteWordConfirm || !wordListModalTest) return;
    try {
      await deleteVocabularyWord(deleteWordConfirm.id);
    } catch (err) {
      console.error("Lỗi xóa từ:", err);
    }
    const updatedWords = (wordListModalTest.words || []).filter((w: any) => w.id !== deleteWordConfirm.id);
    const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
    setWordListModalTest(updatedTest);
    setTests((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
    showToast(`Đã xóa từ "${deleteWordConfirm.word}" khỏi bộ! 🗑️`);
    setDeleteWordConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <VocabularyHeader
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        totalTests={tests.length}
        totalWords={totalWordsCount}
        onOpenCreateTest={() => setShowCreateTestModal(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Tab 1: Danh sách bộ từ vựng */}
      {activeMainTab === "topics" && (
        <VocabularyTestGrid
          tests={tests}
          activeSubCategory={activeSubCategory}
          setActiveSubCategory={setActiveSubCategory}
          onOpenEditTest={(t, e) => {
            if (e) e.stopPropagation();
            setEditingTest(t);
          }}
          onOpenDeleteTest={(t, e) => {
            if (e) e.stopPropagation();
            setDeleteTestConfirm(t);
          }}
          onOpenWordList={setWordListModalTest}
          onOpenPreview={setFlashcardModalTest}
        />
      )}

      {/* Tab 2: Ngân hàng toàn bộ từ vựng */}
      {activeMainTab === "all_words" && (
        <VocabularyAllWordsView
          words={allWordsCombined}
          playAudio={playAudio}
          onOpenAddWord={() => {
            setEditingWord(null);
            setShowAddWordModal(true);
          }}
          onOpenEditWord={(w) => {
            setEditingWord(w);
            setShowAddWordModal(true);
          }}
          onDeleteWord={setDeleteWordConfirm}
        />
      )}

      {/* Tab 3: Cấu hình thuật toán SRS */}
      {activeMainTab === "algorithm" && <VocabularyAlgorithmConfigView />}

      {/* Tab 4: Báo cáo & Tương tác học viên */}
      {activeMainTab === "analytics" && <VocabularyAnalyticsView />}

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
        existingCategories={existingCategories}
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
