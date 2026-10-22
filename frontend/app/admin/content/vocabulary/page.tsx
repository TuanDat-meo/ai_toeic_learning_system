"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { WordItem, VocabularyTestSet, TestItem } from "./types";
import { CONTENT_STATUS_LABEL } from "@/lib/types/domain";
import { exportToExcel } from "@/lib/exportExcel";
import { SAMPLE_WORDS, INITIAL_TESTS, VOCAB_AUDIO_MAP } from "./mockData";
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

export const LOCAL_VOCAB_TESTS_KEY = "toeic_vocab_tests";
export const LOCAL_VOCAB_VERSION_KEY = "toeic_vocab_sync_ver";
export const CURRENT_VOCAB_VERSION = "2026_10_22_real_data_v2";

function getLocalVocabTests(): VocabularyTestSet[] | null {
  if (typeof window === "undefined") return null;
  try {
    const ver = localStorage.getItem(LOCAL_VOCAB_VERSION_KEY);
    if (ver !== CURRENT_VOCAB_VERSION) return null;
    const raw = localStorage.getItem(LOCAL_VOCAB_TESTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocalVocabTests(data: VocabularyTestSet[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_VOCAB_VERSION_KEY, CURRENT_VOCAB_VERSION);
    localStorage.setItem(LOCAL_VOCAB_TESTS_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("toeic-vocab-tests-updated", { detail: data }));
  } catch (e) {
    console.warn("Could not save vocab tests to localStorage:", e);
  }
}

export default function VocabularyLearningPage() {
  const [activeMainTab, setActiveMainTab] = useState<"topics" | "all_words" | "algorithm" | "analytics">("topics");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>(INITIAL_TESTS);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper cập nhật tests và lưu vào localStorage để đồng bộ với học viên
  const updateTestsState = (updater: (prev: VocabularyTestSet[]) => VocabularyTestSet[]) => {
    setTests((prev) => {
      const next = updater(prev);
      saveLocalVocabTests(next);
      return next;
    });
  };

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSyncVocabData = () => {
    setTests(INITIAL_TESTS);
    saveLocalVocabTests(INITIAL_TESTS);
    showToast("Đã đồng bộ thành công toàn bộ 20 bộ từ vựng (4.000 từ) từ E:\\Data! 🔄");
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
      const local = getLocalVocabTests();
      if (local && local.length > 0) {
        setTests(local);
        setLoading(false);
        return;
      }
      const data = await getAdminVocabularySets();
      if (data && data.length > 0) {
        const merged = data.map((d) => {
          const l = INITIAL_TESTS.find((it) => it.id === d.id || it.code === d.code);
          const words = (d.words && d.words.length > 0) ? d.words : (l?.words || []);
          return {
            ...d,
            words,
            wordCount: words.length > 0 ? words.length : (d.wordCount || l?.wordCount || 200),
          };
        });
        setTests(merged);
        saveLocalVocabTests(merged);
      } else {
        setTests(INITIAL_TESTS);
        saveLocalVocabTests(INITIAL_TESTS);
      }
    } catch (err) {
      console.warn("Could not load vocabulary sets from server, using fallback:", err);
      const local = getLocalVocabTests();
      if (local && local.length > 0) {
        setTests(local);
      } else {
        setTests(INITIAL_TESTS);
        saveLocalVocabTests(INITIAL_TESTS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  // Audio synthesis & native MP3 playback
  const playAudio = (textOrUrl: string) => {
    if (!textOrUrl?.trim()) return;
    if (textOrUrl.startsWith("/") || textOrUrl.startsWith("http://") || textOrUrl.startsWith("https://")) {
      const audio = new Audio(textOrUrl);
      audio.play().catch(() => {});
      return;
    }
    const mapped = VOCAB_AUDIO_MAP[textOrUrl.toLowerCase().trim()];
    if (mapped) {
      const audio = new Audio(mapped);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textOrUrl);
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
    const wordsToExport: Array<Record<string, any>> = [];
    let stt = 1;

    tests.forEach((t) => {
      const setName = t.nameVi || t.title || t.name || "Bộ từ vựng";
      const setCategory = t.year ? `ETS ${t.year}` : t.category || "Cơ bản";
      const setStatus = (t.status && (CONTENT_STATUS_LABEL as Record<string, string>)[t.status]) ?? t.status ?? "PUBLISHED";

      if (t.words && t.words.length > 0) {
        t.words.forEach((w) => {
          wordsToExport.push({
            stt: stt++,
            setName: setName,
            category: setCategory,
            word: w.word,
            ipa: w.ipa || "",
            pos: w.partOfSpeech || w.pos || "",
            level: w.cefrLevel || w.level || "B1",
            meaning: w.meaning || (w.meanings && w.meanings[0]?.meaning) || "",
            example: w.example || (w.meanings && w.meanings[0]?.example) || "",
            exampleVi: w.exampleVi || (w.meanings && w.meanings[0]?.exampleVi) || "",
            status: setStatus,
          });
        });
      } else {
        wordsToExport.push({
          stt: stt++,
          setName: setName,
          category: setCategory,
          word: "(Chưa có từ con)",
          ipa: "",
          pos: "",
          level: "",
          meaning: `Bộ từ gồm ${t.wordCount || 0} từ vựng`,
          example: "",
          exampleVi: "",
          status: setStatus,
        });
      }
    });

    exportToExcel({
      filename: `danh_sach_tu_vung_toeic_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Từ vựng TOEIC",
      title: "HỆ THỐNG QUẢN LÝ TỪ VỰNG TIẾNG ANH TOEIC AI",
      metadata: [
        { label: "Ngày xuất báo cáo", value: new Date().toLocaleDateString("vi-VN") },
        { label: "Tổng số bộ từ", value: tests.length },
        { label: "Tổng số từ vựng", value: wordsToExport.length },
      ],
      columns: [
        { header: "STT", key: "stt", width: 50, align: "center" },
        { header: "Bộ từ vựng", key: "setName", width: 180, align: "left" },
        { header: "Danh mục", key: "category", width: 110, align: "center" },
        { header: "Từ vựng (Word)", key: "word", width: 140, align: "left" },
        { header: "Phiên âm (IPA)", key: "ipa", width: 120, align: "center" },
        { header: "Từ loại", key: "pos", width: 80, align: "center" },
        { header: "Cấp độ", key: "level", width: 70, align: "center" },
        { header: "Nghĩa tiếng Việt", key: "meaning", width: 220, align: "left" },
        { header: "Câu ví dụ tiếng Anh", key: "example", width: 280, align: "left" },
        { header: "Dịch ví dụ", key: "exampleVi", width: 250, align: "left" },
        { header: "Trạng thái", key: "status", width: 110, align: "center" },
      ],
      data: wordsToExport,
    });
    showToast("Đã xuất danh sách từ vựng ra file Excel (.xls) có cấu trúc cột rõ ràng! 📊");
  };

  // Toggle nhanh trạng thái Xuất bản / Bản nháp
  const handleToggleTestStatus = (test: VocabularyTestSet, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = test.status === "DRAFT" ? "PUBLISHED" : "DRAFT";
    updateTestsState((prev) =>
      prev.map((t) => (t.id === test.id ? { ...t, status: newStatus } : t))
    );
    showToast(
      newStatus === "PUBLISHED"
        ? `Đã xuất bản bộ từ "${test.title || test.nameVi}" cho học viên! 🚀`
        : `Đã chuyển bộ từ "${test.title || test.nameVi}" về bản nháp. Học viên sẽ không thấy bộ này. 📝`
    );
  };

  // Test CRUD
  const handleSaveTestForm = async (nameVi: string, year: string, category: any, status: string = "PUBLISHED") => {
    if (editingTest) {
      try {
        const updated = await updateVocabularySet(editingTest.id, { title: nameVi, year, category, status });
        updateTestsState((prev) =>
          prev.map((t) => (t.id === editingTest.id ? { ...t, ...updated, words: t.words, status: status || updated.status } : t))
        );
        showToast(`Đã cập nhật bộ từ vựng "${nameVi}" (${status === "DRAFT" ? "Bản nháp" : "Đã xuất bản"})! 💾`);
      } catch (err) {
        console.error("Lỗi cập nhật bộ từ:", err);
        updateTestsState((prev) =>
          prev.map((t) => (t.id === editingTest.id ? { ...t, nameVi, title: nameVi, year: parseInt(year) || undefined, category, status } : t))
        );
      }
      setEditingTest(null);
    } else {
      try {
        const created = await createVocabularySet({ title: nameVi, year, category, status });
        updateTestsState((prev) => [created, ...prev]);
        showToast(`Đã thêm bộ từ vựng "${nameVi}" (${status === "DRAFT" ? "Bản nháp" : "Đã xuất bản"})! 🎉`);
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
          status: status || 'PUBLISHED',
          wordCount: 0,
          words: [],
        };
        updateTestsState((prev) => [newTest, ...prev]);
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
    updateTestsState((prev) => prev.filter((t) => t.id !== deleteTestConfirm.id));
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
        updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
        showToast(`Đã cập nhật từ vựng "${w.word}"! 💾`);
      } catch (err) {
        console.error("Lỗi cập nhật từ:", err);
        const updatedWords = (wordListModalTest.words || []).map((item: any) =>
          item.id === editingWord.id ? { ...item, ...w } : item
        );
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
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
        updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
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
        updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
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
    updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
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
        onSyncData={handleSyncVocabData}
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
          onToggleStatus={handleToggleTestStatus}
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
