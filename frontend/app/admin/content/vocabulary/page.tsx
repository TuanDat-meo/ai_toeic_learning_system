"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { WordItem, VocabularyTestSet, TestItem, type VocabularyRelatedForm, type VocabularySense } from "./types";
import { CONTENT_STATUS_LABEL } from "@/lib/types/domain";
import { exportToExcel } from "@/lib/exportExcel";
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
import { deduplicateVocabularySenses } from "@/lib/vocabulary-part-of-speech";
import { playVocabularyAudio } from "@/lib/vocabulary-pronunciation";

export default function VocabularyLearningPage() {
  const [activeMainTab, setActiveMainTab] = useState<"topics" | "all_words" | "algorithm" | "analytics">("topics");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("all");
  const [tests, setTests] = useState<VocabularyTestSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Notify student views after the backend confirms a change.
  const updateTestsState = (updater: (prev: VocabularyTestSet[]) => VocabularyTestSet[]) => {
    setTests((prev) => {
      const next = updater(prev);
      window.dispatchEvent(new CustomEvent("toeic-vocab-tests-updated", { detail: next }));
      return next;
    });
  };

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals State
  const [wordListModalTest, setWordListModalTest] = useState<TestItem | null>(null);
  const [previewTest, setPreviewTest] = useState<TestItem | null>(null);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<VocabularyTestSet | null>(null);
  const [deleteTestConfirm, setDeleteTestConfirm] = useState<VocabularyTestSet | null>(null);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [wordDetails, setWordDetails] = useState<WordItem | null>(null);
  const [deleteWordConfirm, setDeleteWordConfirm] = useState<WordItem | null>(null);

  const loadSets = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getAdminVocabularySets();
      setTests(data);
    } catch (err) {
      setTests([]);
      setLoadError(err instanceof Error ? err.message : "Không thể tải dữ liệu từ vựng từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  // Audio synthesis & native MP3 playback
  const playAudio = (audioUrl: string, word: string) => {
    playVocabularyAudio(audioUrl, word, showToast);
  };

  const allWordsCombined = React.useMemo(() => {
    const map = new Map<string, WordItem>();
    tests.forEach((t) => {
      t.words?.forEach((w) => {
        const key = w.word.toLowerCase().trim();
        const existing = map.get(key);
        const wordSenses = w.senses?.length
          ? w.senses
          : [{
              partOfSpeech: w.partOfSpeech || w.pos || "Noun",
              meaning: w.meaning || "",
              example: w.example || "",
            }];
        if (!existing) {
          map.set(key, { ...w, senses: deduplicateVocabularySenses(wordSenses) });
        } else {
          existing.senses = deduplicateVocabularySenses([
            ...(existing.senses || []),
            ...wordSenses,
          ]);
          existing.relatedForms = [...new Map([
            ...(existing.relatedForms || []),
            ...(w.relatedForms || []),
          ].map((form) => [form.id, form])).values()];
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
  const handleToggleTestStatus = async (test: VocabularyTestSet, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = test.status === "DRAFT" || test.status === "ARCHIVED" ? "PUBLISHED" : "DRAFT";
    try {
      const updated = await updateVocabularySet(test.id, {
        title: test.title || test.nameVi || "",
        year: test.year,
        category: test.category,
        status: newStatus,
        releaseAt: test.releaseAt,
      });
      updateTestsState((prev) => prev.map((item) => item.id === test.id ? { ...item, ...updated, words: item.words } : item));
      showToast(newStatus === "PUBLISHED"
        ? `Đã xuất bản bộ từ "${test.title || test.nameVi}" cho học viên!`
        : `Đã chuyển bộ từ "${test.title || test.nameVi}" về bản nháp.`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái bộ từ:", error);
      showToast("Không thể cập nhật trạng thái bộ từ. Vui lòng thử lại.");
    }
  };

  // Test CRUD
  const handleSaveTestForm = async (
    nameVi: string,
    year: string,
    category: string,
    status: string = "PUBLISHED",
    releaseAt?: string,
  ) => {
    const normalizedReleaseAt = releaseAt
      ? (releaseAt.length === 16 ? `${releaseAt}:00` : releaseAt)
      : null;
    if (editingTest) {
      try {
        const updated = await updateVocabularySet(editingTest.id, {
          title: nameVi, year, category, status, releaseAt: normalizedReleaseAt,
        });
        updateTestsState((prev) =>
          prev.map((t) => (t.id === editingTest.id ? { ...t, ...updated, words: t.words } : t))
        );
        showToast(`Đã cập nhật bộ từ vựng "${nameVi}".`);
        setEditingTest(null);
      } catch (err) {
        console.error("Lỗi cập nhật bộ từ:", err);
        showToast("Không thể cập nhật bộ từ. Vui lòng kiểm tra kết nối và thử lại.");
        return;
      }
    } else {
      try {
        const created = await createVocabularySet({ title: nameVi, year, category, status, releaseAt: normalizedReleaseAt });
        updateTestsState((prev) => [created, ...prev]);
        showToast(`Đã thêm bộ từ vựng "${nameVi}".`);
      } catch (err) {
        console.error("Lỗi tạo bộ từ:", err);
        showToast("Không thể tạo bộ từ. Vui lòng kiểm tra kết nối và thử lại.");
        return;
      }
      setShowCreateTestModal(false);
    }
  };

  const handleConfirmDeleteTest = async (action: "DELETE" | "UNPUBLISH") => {
    if (!deleteTestConfirm) return;
    try {
      if (action === "DELETE") {
        await deleteVocabularySet(deleteTestConfirm.id);
        updateTestsState((prev) => prev.filter((t) => t.id !== deleteTestConfirm.id));
        showToast(`Đã xóa vĩnh viễn bộ từ "${deleteTestConfirm.title || deleteTestConfirm.nameVi}".`);
      } else {
        const updated = await updateVocabularySet(deleteTestConfirm.id, {
          title: deleteTestConfirm.title || deleteTestConfirm.nameVi || "",
          year: deleteTestConfirm.year,
          category: deleteTestConfirm.category,
          status: "ARCHIVED",
          releaseAt: deleteTestConfirm.releaseAt,
        });
        updateTestsState((prev) => prev.map((t) => t.id === deleteTestConfirm.id
          ? { ...t, ...updated, words: t.words }
          : t));
        showToast(`Đã ngưng xuất bản bộ từ "${deleteTestConfirm.title || deleteTestConfirm.nameVi}".`);
      }
      setDeleteTestConfirm(null);
    } catch (err) {
      console.error(action === "DELETE" ? "Lỗi xóa bộ từ:" : "Lỗi ngưng xuất bản bộ từ:", err);
      showToast(action === "DELETE"
        ? "Không thể xóa bộ từ. Vui lòng thử lại."
        : "Không thể ngưng xuất bản bộ từ. Vui lòng thử lại.");
    }
  };

  // Word CRUD
  const handleSaveWordForm = async (w: {
    word: string;
    ipa: string;
    partOfSpeech: string;
    meaning: string;
    example: string;
    exampleMeaning: string;
    level: string;
    audioUrl: string;
    audioRegion: string;
    subCategory: string;
    wordFamily: string;
    senses: VocabularySense[];
    relatedForms: VocabularyRelatedForm[];
    targetSetId?: string;
    existingWordId?: string;
    duplicateAction?: "add-current-sense" | "update-missing-audio" | "add-separately" | "merge-other-senses";
    duplicateSenses?: VocabularySense[];
  }) => {
    if (!wordListModalTest) {
      try {
        if (!editingWord) {
          if (!w.targetSetId) {
            showToast("Vui lòng chọn bộ từ vựng để lưu mục từ mới.");
            return;
          }
          const createdWord = await addVocabularyWord(w.targetSetId, {
            word: w.word,
            ipa: w.ipa,
            partOfSpeech: w.partOfSpeech,
            meaning: w.meaning,
            example: w.example,
            exampleMeaning: w.exampleMeaning,
            level: w.level,
            audioUrl: w.audioUrl,
            audioRegion: w.audioRegion,
            wordFamily: w.wordFamily,
            senses: w.duplicateAction === "merge-other-senses"
              ? deduplicateVocabularySenses([...w.senses, ...(w.duplicateSenses || [])])
              : w.senses,
            relatedForms: w.relatedForms,
          });
          updateTestsState((prev) => prev.map((test) => test.id === w.targetSetId
            ? {
                ...test,
                words: [createdWord, ...(test.words || [])],
                wordCount: (test.wordCount || test.words?.length || 0) + 1,
              }
            : test));
          showToast(`Đã thêm từ/cụm từ "${w.word}" vào bộ từ vựng.`);
          setShowAddWordModal(false);
          return;
        }
        const updatedWord = await updateVocabularyWord(editingWord.id, {
          word: w.word,
          ipa: w.ipa,
          partOfSpeech: w.partOfSpeech,
          meaning: w.meaning,
          example: w.example,
          exampleMeaning: w.exampleMeaning,
          level: w.level,
          audioUrl: w.audioUrl,
          audioRegion: w.audioRegion,
          wordFamily: w.wordFamily,
          senses: w.senses,
          relatedForms: w.relatedForms,
        });
        updateTestsState((prev) => prev.map((test) => ({
          ...test,
          words: test.words?.map((word) => word.id === editingWord.id ? updatedWord : word),
        })));
        showToast(`Đã cập nhật từ vựng "${w.word}".`);
        setEditingWord(null);
        setShowAddWordModal(false);
      } catch (error) {
        console.error(editingWord ? "Lỗi cập nhật từ trong ngân hàng:" : "Lỗi thêm từ vào ngân hàng:", error);
        showToast(editingWord
          ? "Không thể cập nhật từ vựng. Vui lòng thử lại."
          : "Không thể thêm từ vựng vào bộ đã chọn. Vui lòng thử lại.");
      }
      return;
    }

    if (editingWord) {
      try {
        const updatedWord = await updateVocabularyWord(editingWord.id, {
          word: w.word,
          ipa: w.ipa,
          partOfSpeech: w.partOfSpeech,
          meaning: w.meaning,
          example: w.example,
          exampleMeaning: w.exampleMeaning,
          level: w.level,
          audioUrl: w.audioUrl,
          audioRegion: w.audioRegion,
          wordFamily: w.wordFamily,
          senses: w.senses,
          relatedForms: w.relatedForms,
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
        showToast("Không thể cập nhật từ vựng. Vui lòng thử lại.");
        return;
      }
      setEditingWord(null);
    } else if (w.existingWordId) {
      const existingWord = wordListModalTest.words?.find((item) => item.id === w.existingWordId);
      if (!existingWord) {
        showToast("Không tìm thấy từ trùng trong bộ hiện tại. Vui lòng tải lại danh sách và thử lại.");
        return;
      }

      const existingSenses: VocabularySense[] = existingWord.senses?.length
        ? existingWord.senses
        : [{
            partOfSpeech: existingWord.partOfSpeech || existingWord.pos || "",
            meaning: existingWord.meaning || existingWord.meanings?.[0]?.meaning || "",
            example: existingWord.example || existingWord.meanings?.[0]?.example || "",
            exampleMeaning: existingWord.exampleMeaning || existingWord.exampleVi || "",
          }];
      const sensesToSave = w.duplicateAction === "add-current-sense"
        ? deduplicateVocabularySenses([...existingSenses, ...w.senses])
        : existingSenses;
      try {
        const updatedWord = await updateVocabularyWord(existingWord.id, {
          word: existingWord.word,
          ipa: existingWord.ipa || w.ipa,
          partOfSpeech: existingSenses[0]?.partOfSpeech || w.partOfSpeech,
          meaning: existingSenses[0]?.meaning || w.meaning,
          example: existingSenses[0]?.example || w.example,
          exampleMeaning: existingWord.exampleMeaning || existingWord.exampleVi || w.exampleMeaning,
          level: existingWord.level || w.level,
          audioUrl: existingWord.audioUrl || existingWord.audio || w.audioUrl,
          audioRegion: existingWord.audioRegion || w.audioRegion,
          wordFamily: existingWord.wordFamily || w.wordFamily,
          senses: sensesToSave,
          relatedForms: [...new Map([
            ...(existingWord.relatedForms || []),
            ...w.relatedForms,
          ].map((form) => [form.id, form])).values()],
        });
        const updatedWords = (wordListModalTest.words || []).map((item) =>
          item.id === existingWord.id ? updatedWord : item
        );
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
        showToast(w.duplicateAction === "add-current-sense"
          ? `Đã bổ sung nghĩa "${w.meaning}" (${w.partOfSpeech}) cho từ "${w.word}".`
          : `Đã cập nhật thông tin còn thiếu cho từ "${w.word}".`);
      } catch (error) {
        console.error("Lỗi bổ sung nghĩa cho từ đã có:", error);
        showToast("Không thể bổ sung nghĩa cho từ đã có. Vui lòng thử lại.");
        return;
      }
    } else {
      try {
        const senses = w.duplicateAction === "merge-other-senses"
          ? deduplicateVocabularySenses([...w.senses, ...(w.duplicateSenses || [])])
          : w.senses;
        const createdWord = await addVocabularyWord(wordListModalTest.id, {
          word: w.word,
          ipa: w.ipa,
          partOfSpeech: w.partOfSpeech,
          meaning: w.meaning,
          example: w.example,
          exampleMeaning: w.exampleMeaning,
          level: w.level,
          audioUrl: w.audioUrl,
          audioRegion: w.audioRegion,
          wordFamily: w.wordFamily,
          senses,
          relatedForms: w.relatedForms,
        });
        const updatedWords = [createdWord, ...(wordListModalTest.words || [])];
        const updatedTest = { ...wordListModalTest, words: updatedWords, wordCount: updatedWords.length };
        setWordListModalTest(updatedTest);
        updateTestsState((prev) => prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)));
        showToast(w.duplicateAction === "merge-other-senses"
          ? `Đã thêm "${w.word}" và ghép nghĩa/từ loại từ bộ khác.`
          : `Đã thêm từ vựng "${w.word}" vào bộ! 🎉`);
      } catch (err) {
        console.error("Lỗi thêm từ:", err);
        showToast("Không thể thêm từ vựng. Vui lòng thử lại.");
        return;
      }
    }
    setShowAddWordModal(false);
  };

  const handleConfirmDeleteWord = async () => {
    if (!deleteWordConfirm) return;
    try {
      await deleteVocabularyWord(deleteWordConfirm.id);
    } catch (err) {
      console.error("Lỗi xóa từ:", err);
      showToast("Không thể xóa từ vựng. Vui lòng thử lại.");
      return;
    }
    if (!wordListModalTest) {
      updateTestsState((prev) => prev.map((test) => {
        const words = (test.words || []).filter((word) => word.id !== deleteWordConfirm.id);
        return words.length === (test.words || []).length
          ? test
          : { ...test, words, wordCount: words.length };
      }));
      showToast(`Đã xóa từ "${deleteWordConfirm.word}" khỏi ngân hàng từ vựng.`);
      setDeleteWordConfirm(null);
      return;
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
      />
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải dữ liệu từ vựng từ backend: {loadError}
        </div>
      ) : null}
      {!loading && !loadError && tests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Chưa có bộ từ vựng trong hệ thống.
        </div>
      ) : null}

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
          onOpenPreview={setPreviewTest}
          onToggleStatus={handleToggleTestStatus}
        />
      )}

      {/* Tab 2: Ngân hàng toàn bộ từ vựng */}
      {activeMainTab === "all_words" && (
        <VocabularyAllWordsView
          words={allWordsCombined}
          playAudio={playAudio}
          onOpenWordDetails={setWordDetails}
          onOpenAddWord={() => {
            setEditingWord(null);
            setShowAddWordModal(true);
          }}
          onOpenEditWord={(w) => {
            const sourceWord = tests.flatMap((test) => test.words || []).find((word) => word.id === w.id);
            setEditingWord(sourceWord || w);
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
        vocabularySets={tests}
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
        onOpenWordDetails={setWordDetails}
        onDeleteWordClick={setDeleteWordConfirm}
        previewTest={previewTest}
        onClosePreview={() => setPreviewTest(null)}
        wordDetails={wordDetails}
        onCloseWordDetails={() => setWordDetails(null)}
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
