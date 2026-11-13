"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
} from "lucide-react";

import { ExerciseCardData, SampleQuestion, VocabItem } from "./types";
import {
  createAdminReadingCard,
  deleteAdminReadingCard,
  fetchReadingCardDetails,
  fetchReadingCards,
  updateAdminReadingCard,
} from "@/lib/api/reading";

import {
  ReadingHeader,
  ReadingAdminTab,
} from "@/components/admin/content/reading/ReadingHeader";
import { ReadingCardGrid } from "@/components/admin/content/reading/ReadingCardGrid";
import {
  ReadingPassageBankView,
  ReadingAnalyticsView,
  ReadingCurriculumView,
} from "@/components/admin/content/reading/ReadingViews";
import { ReadingTheoryModal } from "@/components/admin/content/reading/ReadingTheoryModal";
import { ReadingCreateCardModal } from "@/components/admin/content/reading/ReadingCreateCardModal";
import { ReadingDeleteCardModal } from "@/components/admin/content/reading/ReadingDeleteCardModal";
import { ReadingPracticeWorkspace } from "@/components/admin/content/reading/ReadingPracticeWorkspace";
import { ReadingContentAuditWorkspace } from "@/components/admin/content/reading/ReadingContentAuditWorkspace";
import { ReadingBulkImportModal } from "@/components/admin/content/reading/ReadingBulkImportModal";
import { exportToExcel } from "@/lib/exportExcel";
import { playUnifiedAnswerSound } from "@/lib/sound";

export default function ReadingLearningPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<ReadingAdminTab>("reading_units");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "grammar" | "part5" | "part6" | "part7"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const cardsRef = React.useRef<ExerciseCardData[]>(cards);
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  // Notify student views after backend-backed content changes.
  const updateCardsState = (
    updater: (prev: ExerciseCardData[]) => ExerciseCardData[],
    emitEvent = true
  ) => {
    const base = cardsRef.current;
    const next = updater(base);
    cardsRef.current = next;
    setCards(next);
    if (emitEvent) {
      window.dispatchEvent(new CustomEvent("toeic-reading-cards-updated"));
    }
  };

  useEffect(() => {
    let active = true;

    const loadCards = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const backendCards = await fetchReadingCards();
        if (!active) return;
        cardsRef.current = backendCards;
        setCards(backendCards);
      } catch (error) {
        if (!active) return;
        cardsRef.current = [];
        setCards([]);
        setLoadError(error instanceof Error ? error.message : "Không thể tải nội dung Reading từ máy chủ.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCards();
    const handleUpdated = () => { void loadCards(); };

    window.addEventListener("toeic-reading-cards-updated", handleUpdated);
    return () => {
      active = false;
      window.removeEventListener("toeic-reading-cards-updated", handleUpdated);
    };
  }, []);

  const ensureCardDetails = async (card: ExerciseCardData): Promise<ExerciseCardData> => {
    if (card.detailsLoaded || (card.sampleQuestions && card.sampleQuestions.length > 0)) {
      return card;
    }
    const detailed = await fetchReadingCardDetails(card.id);
    if (!detailed) return card;
    const mergedCard: ExerciseCardData = { ...card, ...detailed, detailsLoaded: true };
    updateCardsState(
      (prev) => prev.map((c) => (c.id === mergedCard.id ? mergedCard : c)),
      false
    );
    return mergedCard;
  };

  // State Workspace
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);
  const [auditCard, setAuditCard] = useState<ExerciseCardData | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // State Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Web Audio Sound Effects Synthesizer
  const playSfx = (_type?: string) => {
    playUnifiedAnswerSound();
  };

  // Modals state
  const [theoryCard, setTheoryCard] = useState<ExerciseCardData | null>(null);
  const [deleteCardConfirm, setDeleteCardConfirm] = useState<ExerciseCardData | null>(null);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<ExerciseCardData | null>(null);

  // Form State
  const [cardFormTitle, setCardFormTitle] = useState("");
  const [cardFormCategory, setCardFormCategory] = useState<"grammar" | "part5" | "part6" | "part7">("grammar");
  const [cardFormSubCategory, setCardFormSubCategory] = useState<
    "word_types" | "verbs" | "other_grammar" | "by_topic" | "levels" | "text_types"
  >("word_types");
  const [cardFormTag, setCardFormTag] = useState("");
  const [cardFormTheorySummary, setCardFormTheorySummary] = useState("");
  const [cardFormTheoryRules, setCardFormTheoryRules] = useState("");
  const [cardFormTheoryExample, setCardFormTheoryExample] = useState("");
  const [cardFormPassageText, setCardFormPassageText] = useState("");
  const [cardFormPassageTextVi, setCardFormPassageTextVi] = useState("");
  const [cardFormSampleQuestions, setCardFormSampleQuestions] = useState<SampleQuestion[]>([]);
  const [cardFormVocabList, setCardFormVocabList] = useState<VocabItem[]>([]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchCategory =
        selectedCategory === "all" || c.category === selectedCategory;
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tag && c.tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [cards, selectedCategory, searchQuery]);

  // Handlers
  const openCreateCardModal = (
    initialCategory: "grammar" | "part5" | "part6" | "part7" = "grammar"
  ) => {
    setEditingCard(null);
    setCardFormTitle("");
    setCardFormCategory(initialCategory);
    setCardFormSubCategory(
      initialCategory === "part6"
        ? "text_types"
        : initialCategory === "part7"
        ? "levels"
        : "word_types"
    );
    setCardFormTag("");
    setCardFormTheorySummary("");
    setCardFormTheoryRules("");
    setCardFormTheoryExample("");
    setCardFormPassageText("");
    setCardFormPassageTextVi("");
    setCardFormVocabList([]);
    setCardFormSampleQuestions([
      {
        questionNum: "101",
        question: "",
        bilingual: "",
        options: ["", "", "", ""],
        optionMeanings: ["", "", "", ""],
        correctIndex: -1,
        explanation: "",
        steps: [],
        vocabList: [],
      },
    ]);
    setShowCreateCardModal(true);
  };

  const handleOpenCreateCard = () => {
    openCreateCardModal(selectedCategory === "all" ? "grammar" : selectedCategory);
  };

  const handleOpenEditCard = async (card: ExerciseCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const resolved = await ensureCardDetails(card);
    setEditingCard(resolved);
    setCardFormTitle(resolved.title);
    setCardFormCategory(resolved.category);
    setCardFormSubCategory(resolved.subCategory || "word_types");
    setCardFormTag(resolved.tag || "");
    setCardFormTheorySummary(resolved.theory?.summary || "");
    setCardFormTheoryRules(resolved.theory?.rules?.join("\n") || "");
    setCardFormTheoryExample(resolved.theory?.example || "");
    setCardFormPassageText(resolved.passageText || resolved.sampleQuestions?.[0]?.passageText || "");
    setCardFormPassageTextVi(resolved.passageTextVi || resolved.sampleQuestions?.[0]?.passageTextVi || "");
    setCardFormVocabList(
      resolved.vocabList && resolved.vocabList.length > 0
        ? JSON.parse(JSON.stringify(resolved.vocabList))
        : []
    );
    setCardFormSampleQuestions(
      resolved.sampleQuestions && resolved.sampleQuestions.length > 0
        ? JSON.parse(JSON.stringify(resolved.sampleQuestions))
        : [
            {
              questionNum: "101",
              question: "",
              bilingual: "",
              options: ["", "", "", ""],
              optionMeanings: ["", "", "", ""],
              correctIndex: -1,
              explanation: "",
              steps: [],
              vocabList: [],
            },
          ]
    );
    setShowCreateCardModal(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) {
      showToast("Vui lòng nhập tên chủ điểm đọc! ⚠️");
      return;
    }

    const rulesArr = cardFormTheoryRules
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    // Filter valid questions
    const validQuestions = cardFormSampleQuestions.filter(
      (q) => q.question.trim().length > 0 || q.options.some((opt) => opt.trim().length > 0)
    );

    if (validQuestions.length === 0) {
      showToast("Vui lòng nhập ít nhất 1 câu hỏi có nội dung và đáp án! ⚠️");
      return;
    }

    // KIỂM TRA ĐỊNH DẠNG THEO CHUẨN TOEIC (PART NÀO ĐI VỚI NỘI DUNG ĐÓ)
    const hasAnyPassage = !!cardFormPassageText.trim() || validQuestions.some((q) => !!q.passageText);

    // 1. Nếu là Part 6 hoặc Part 7: BẮT BUỘC phải có Đoạn văn/Bài đọc (Passage)
    if (cardFormCategory === "part6" || cardFormCategory === "part7") {
      if (!hasAnyPassage) {
        const partLabel = cardFormCategory === "part6" ? "Part 6 (Điền đoạn văn)" : "Part 7 (Đọc hiểu văn bản)";
        showToast(`❌ Không thể lưu: Đề thi ${partLabel} bắt buộc phải có Đoạn văn/Bài đọc (Passage). Bạn không thể đưa câu đơn của Part 5 vào ${partLabel}!`);
        return;
      }
    }

    // 2. Nếu là Part 5: Bắt buộc là câu đơn, KHÔNG được có đoạn văn dài
    if (cardFormCategory === "part5" && cardFormPassageText.trim().length > 0) {
      showToast("❌ Không thể lưu: Part 5 là phần thi câu đơn độc lập (Incomplete Sentences), không chứa đoạn văn. Vui lòng chuyển sang Part 6 hoặc Part 7 nếu bạn có bài đọc!");
      return;
    }

    const finalQuestions = validQuestions.map((q, idx) => ({
      ...q,
      questionNum: q.questionNum?.trim() || String(idx + 1),
      passageText: q.passageText || cardFormPassageText.trim() || undefined,
      passageTextVi: q.passageTextVi || cardFormPassageTextVi.trim() || undefined,
    }));

    const totalCount = finalQuestions.length;

    const cleanVocab = cardFormVocabList.length > 0 ? cardFormVocabList : undefined;

    if (editingCard) {
      const updatedCandidate: ExerciseCardData = {
        ...editingCard,
        title: cardFormTitle.trim(),
        category: cardFormCategory,
        subCategory: cardFormSubCategory,
        tag: cardFormTag.trim() || undefined,
        totalQuestions: totalCount,
        passageText: cardFormPassageText.trim() || undefined,
        passageTextVi: cardFormPassageTextVi.trim() || undefined,
        vocabList: cleanVocab,
        detailsLoaded: true,
        theory: {
          summary: cardFormTheorySummary.trim() || editingCard.theory?.summary || "",
          rules: rulesArr.length > 0 ? rulesArr : editingCard.theory?.rules || [],
          example: cardFormTheoryExample.trim() || editingCard.theory?.example || "",
        },
        sampleQuestions: finalQuestions,
      };
      let savedCard: ExerciseCardData;
      try {
        savedCard = await updateAdminReadingCard(editingCard.id, updatedCandidate);
      } catch (err) {
        showToast(err instanceof Error ? `Không thể cập nhật Reading: ${err.message}` : "Không thể cập nhật Reading.");
        return;
      }
      updateCardsState((prev) =>
        prev.map((c) => (c.id === editingCard.id ? { ...savedCard, detailsLoaded: true } : c))
      );
      showToast(`Đã cập nhật chuyên đề "${savedCard.title}" (${finalQuestions.length} câu hỏi)! 💾`);
    } else {
      const newCard: ExerciseCardData = {
        id: "",
        title: cardFormTitle.trim(),
        category: cardFormCategory,
        subCategory: cardFormSubCategory,
        tag: cardFormTag.trim() || undefined,
        totalQuestions: totalCount,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        passageText: cardFormPassageText.trim() || undefined,
        passageTextVi: cardFormPassageTextVi.trim() || undefined,
        vocabList: cleanVocab,
        detailsLoaded: true,
        theory: {
          summary: cardFormTheorySummary.trim(),
          rules: rulesArr,
          example: cardFormTheoryExample.trim(),
        },
        sampleQuestions: finalQuestions,
      };
      let savedCard: ExerciseCardData;
      try {
        savedCard = await createAdminReadingCard(newCard);
      } catch (err) {
        showToast(err instanceof Error ? `Không thể tạo Reading: ${err.message}` : "Không thể tạo Reading.");
        return;
      }
      updateCardsState((prev) => [
        { ...savedCard, detailsLoaded: true },
        ...prev.filter((c) => c.id !== savedCard.id),
      ]);
      showToast(`Đã thêm chuyên đề "${savedCard.title}" (${finalQuestions.length} câu hỏi) vào hệ thống! 🎉`);
    }
    setShowCreateCardModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCardConfirm) return;
    const target = deleteCardConfirm;
    try {
      await deleteAdminReadingCard(target.id);
    } catch (err) {
      showToast(err instanceof Error ? `Không thể xóa Reading: ${err.message}` : "Không thể xóa Reading.");
      return;
    }
    updateCardsState((prev) => prev.filter((c) => c.id !== target.id));
    showToast(`Đã xóa chuyên đề "${target.title}" khỏi hệ thống`);
    setDeleteCardConfirm(null);
  };

  const handleExportCsv = () => {
    const dataToExport = cards.map((c, index) => ({
      stt: index + 1,
      id: c.id,
      title: c.title,
      part: c.category.toUpperCase(),
      category: c.tag || c.subtitle || c.category,
      questionsCount: c.totalQuestions,
      time: "20 phút",
      status: "PUBLISHED",
    }));

    exportToExcel({
      filename: `chuong_trinh_reading_toeic_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Reading TOEIC",
      title: "HỆ THỐNG QUẢN LÝ BÀI LUYỆN TOEIC READING COMPREHENSION",
      metadata: [
        { label: "Ngày xuất báo cáo", value: new Date().toLocaleDateString("vi-VN") },
        { label: "Tổng số bài học", value: cards.length },
      ],
      columns: [
        { header: "STT", key: "stt", width: 50, align: "center" },
        { header: "Mã bài", key: "id", width: 100, align: "center" },
        { header: "Tên bài đọc / Chuyên đề", key: "title", width: 240, align: "left" },
        { header: "Phần thi", key: "part", width: 90, align: "center" },
        { header: "Phân loại / Thẻ", key: "category", width: 140, align: "center" },
        { header: "Số câu hỏi", key: "questionsCount", width: 90, align: "center" },
        { header: "Thời gian làm bài", key: "time", width: 120, align: "center" },
        { header: "Trạng thái", key: "status", width: 110, align: "center" },
      ],
      data: dataToExport,
    });
    showToast("Đã xuất chương trình Reading ra file Excel (.xls) có cấu trúc cột rõ ràng! 📊");
  };

  // Render Full Screen Workspace if Student View Mode Started
  if (activePracticeCard) {
    return (
      <ReadingPracticeWorkspace
        card={activePracticeCard}
        onClose={() => setActivePracticeCard(null)}
        playSfx={playSfx}
        showToast={showToast}
      />
    );
  }

  // Render Full Screen Workspace if Admin Content Audit Mode Active
  if (auditCard) {
    return (
      <ReadingContentAuditWorkspace
        card={auditCard}
        onClose={() => setAuditCard(null)}
        onOpenEditCard={(card) => {
          setAuditCard(null);
          handleOpenEditCard(card);
        }}
        onSwitchToStudentView={(card) => {
          setActivePracticeCard(card);
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-blue-600 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce max-w-md sm:max-w-lg">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="font-semibold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}
      {loading ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Đang tải nội dung Reading từ backend…
        </div>
      ) : null}
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không thể tải nội dung Reading từ backend: {loadError}
        </div>
      ) : null}
      {!loading && !loadError && cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Chưa có nội dung Reading trong hệ thống.
        </div>
      ) : null}

      {/* Header & Sub-filters */}
      <ReadingHeader
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCardsCount={cards.length}
        onOpenCreateCard={handleOpenCreateCard}
        onOpenImportModal={() => setShowImportModal(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Tab Content Switching */}
      {activeMainTab === "reading_units" && (
        <ReadingCardGrid
          cards={filteredCards}
          viewMode={viewMode}
          onStartPractice={(card) => {
            void ensureCardDetails(card).then((hydrated) => setAuditCard(hydrated));
          }}
          onOpenTheory={(card) => {
            void ensureCardDetails(card).then((hydrated) => setTheoryCard(hydrated));
          }}
          onOpenEditCard={(card, e) => {
            void handleOpenEditCard(card, e);
          }}
          onOpenDeleteConfirm={(card) => setDeleteCardConfirm(card)}
        />
      )}

      {activeMainTab === "passages" && (
        <ReadingPassageBankView
          cards={cards}
          onStartPractice={(card) => {
            void ensureCardDetails(card).then((hydrated) => setAuditCard(hydrated));
          }}
          onOpenEditCard={(card, e) => {
            void handleOpenEditCard(card, e);
          }}
          onOpenDeleteConfirm={(card) => setDeleteCardConfirm(card)}
          onEnsureCardDetails={ensureCardDetails}
          onOpenCreatePassage={() => {
            openCreateCardModal("part7");

          }}
        />
      )}

      {activeMainTab === "reading_analytics" && (
        <ReadingAnalyticsView />
      )}

      {activeMainTab === "curriculum" && (
        <ReadingCurriculumView />
      )}

      {/* Modals */}
      {theoryCard && (
        <ReadingTheoryModal
          card={theoryCard}
          onClose={() => setTheoryCard(null)}
          onStartPractice={(card) => setActivePracticeCard(card)}
          onEditCard={(card) => {
            setTheoryCard(null);
            void handleOpenEditCard(card);
          }}
        />
      )}

      {deleteCardConfirm && (
        <ReadingDeleteCardModal
          card={deleteCardConfirm}
          onClose={() => setDeleteCardConfirm(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      <ReadingBulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={async (newCard) => {
          const cardWithFlag: ExerciseCardData = { ...newCard, detailsLoaded: true };
          let savedCard: ExerciseCardData;
          try {
            savedCard = await createAdminReadingCard(cardWithFlag);
          } catch (err) {
            showToast(err instanceof Error ? `Không thể lưu nội dung đã import: ${err.message}` : "Không thể lưu nội dung đã import.");
            return;
          }
          updateCardsState((prev) => [
            { ...savedCard, detailsLoaded: true },
            ...prev.filter((c) => c.id !== savedCard.id),
          ]);
          showToast(`Đã import "${savedCard.title}" (${savedCard.totalQuestions} câu hỏi) vào hệ thống! 🎉`);
        }}
      />

      {showCreateCardModal && (
        <ReadingCreateCardModal
          editingCard={editingCard}
          cardFormTitle={cardFormTitle}
          setCardFormTitle={setCardFormTitle}
          cardFormCategory={cardFormCategory}
          setCardFormCategory={setCardFormCategory}
          cardFormSubCategory={cardFormSubCategory}
          setCardFormSubCategory={setCardFormSubCategory}
          cardFormTag={cardFormTag}
          setCardFormTag={setCardFormTag}
          cardFormTheorySummary={cardFormTheorySummary}
          setCardFormTheorySummary={setCardFormTheorySummary}
          cardFormTheoryRules={cardFormTheoryRules}
          setCardFormTheoryRules={setCardFormTheoryRules}
          cardFormTheoryExample={cardFormTheoryExample}
          setCardFormTheoryExample={setCardFormTheoryExample}
          cardFormPassageText={cardFormPassageText}
          setCardFormPassageText={setCardFormPassageText}
          cardFormPassageTextVi={cardFormPassageTextVi}
          setCardFormPassageTextVi={setCardFormPassageTextVi}
          cardFormSampleQuestions={cardFormSampleQuestions}
          setCardFormSampleQuestions={setCardFormSampleQuestions}
          cardFormVocabList={cardFormVocabList}
          setCardFormVocabList={setCardFormVocabList}
          onSaveCard={handleSaveCard}
          onClose={() => setShowCreateCardModal(false)}
        />
      )}
    </div>
  );
}
