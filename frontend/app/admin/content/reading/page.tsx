"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
} from "lucide-react";

import { ExerciseCardData, SampleQuestion, VocabItem } from "./types";
import { INITIAL_CARDS } from "./mockData";
import {
  createAdminReadingCard,
  deleteAdminReadingCard,
  fetchReadingCardDetails,
  fetchReadingCards,
  mergeReadingCardsWithBackend,
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
import {
  ReadingDeleteCardModal,
  ReadingDeleteAllDraftsModal,
} from "@/components/admin/content/reading/ReadingDeleteCardModal";
import { ReadingPracticeWorkspace } from "@/components/admin/content/reading/ReadingPracticeWorkspace";
import { ReadingContentAuditWorkspace } from "@/components/admin/content/reading/ReadingContentAuditWorkspace";
import { ReadingBulkImportModal } from "@/components/admin/content/reading/ReadingBulkImportModal";
import { exportToExcel } from "@/lib/exportExcel";
import { playUnifiedAnswerSound } from "@/lib/sound";
import {
  getLocalReadingCards,
  saveLocalReadingCards,
  LOCAL_READING_CARDS_KEY,
  normalizeReadingCardTitle,
} from "./readingStorage";

export { LOCAL_READING_CARDS_KEY };

export default function ReadingLearningPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>(INITIAL_CARDS);
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

  // Helper cập nhật cards và lưu localStorage (không tự kích hoạt loop listener)
  const updateCardsState = (
    updater: (prev: ExerciseCardData[]) => ExerciseCardData[],
    emitEvent = true
  ) => {
    const base = cardsRef.current;
    const next = updater(base);
    cardsRef.current = next;
    saveLocalReadingCards(next, emitEvent);
    setCards(next);
  };

  useEffect(() => {
    let active = true;

    const loadAndSync = async (skipBackend = false) => {
      const local = getLocalReadingCards();
      if (local && local.length > 0) {
        cardsRef.current = local;
        if (active) setCards(local);
      } else {
        saveLocalReadingCards(INITIAL_CARDS, false);
      }
      if (skipBackend) return;
      const backendCards = await fetchReadingCards();
      if (!active || backendCards.length === 0) return;
      const baseline = getLocalReadingCards();
      const merged = mergeReadingCardsWithBackend(
        backendCards,
        baseline.length > 0 ? baseline : cardsRef.current
      );
      cardsRef.current = merged;
      saveLocalReadingCards(merged, false);
      setCards(merged);
    };

    void loadAndSync(false);

    const handleUpdated = (ev: Event) => {
      const customEv = ev as CustomEvent<{ source?: string }>;
      if (customEv.detail?.source === "local-storage") {
        const local = getLocalReadingCards();
        cardsRef.current = local;
        setCards(local);
        return;
      }
      void loadAndSync(false);
    };

    const handleStorage = () => {
      const local = getLocalReadingCards();
      cardsRef.current = local;
      setCards(local);
    };

    window.addEventListener("toeic-reading-cards-updated", handleUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("toeic-reading-cards-updated", handleUpdated);
      window.removeEventListener("storage", handleStorage);
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
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [deleteAllDraftsList, setDeleteAllDraftsList] = useState<ExerciseCardData[] | null>(null);

  const handleToggleCardStatus = async (card: ExerciseCardData) => {
    const nextStatus: "draft" | "published" = card.status === "draft" ? "published" : "draft";
    const updatedCard: ExerciseCardData = {
      ...card,
      status: nextStatus,
    };
    updateCardsState((prev) => prev.map((c) => (c.id === card.id ? updatedCard : c)));
    try {
      await updateAdminReadingCard(card.id, updatedCard);
    } catch (err) {
      console.warn("Could not sync status change to backend:", err);
    }
    showToast(
      nextStatus === "published"
        ? `Đã phát hành "${card.title}" thành công! 🎉`
        : `Đã chuyển "${card.title}" về Bản nháp! 📝`
    );
  };

  const handleOpenDeleteAllDrafts = (draftCards: ExerciseCardData[]) => {
    setDeleteAllDraftsList(draftCards);
  };

  const handleConfirmDeleteAllDrafts = async () => {
    if (!deleteAllDraftsList || deleteAllDraftsList.length === 0) return;
    const targets = [...deleteAllDraftsList];
    const targetIds = new Set(targets.map((c) => c.id));

    for (const card of targets) {
      try {
        await deleteAdminReadingCard(card.id);
      } catch (err) {
        console.warn(`Deleted reading card ${card.id} locally:`, err);
      }
    }

    updateCardsState((prev) => prev.filter((c) => !targetIds.has(c.id)));
    setDeleteAllDraftsList(null);
    showToast(`Đã dọn sạch toàn bộ ${targets.length} bài đọc bản nháp! 🗑️`);
  };

  const handlePublishAllDrafts = async (draftCards: ExerciseCardData[]) => {
    if (draftCards.length === 0) return;
    const targetIds = new Set(draftCards.map((c) => c.id));
    const updated = cards.map((c) => {
      if (targetIds.has(c.id)) {
        return { ...c, status: "published" as const };
      }
      return c;
    });

    for (const card of draftCards) {
      try {
        await updateAdminReadingCard(card.id, { ...card, status: "published" });
      } catch (err) {
        console.warn(`Published reading card ${card.id} locally:`, err);
      }
    }

    updateCardsState(() => updated);
    showToast(`Đã phát hành thành công toàn bộ ${draftCards.length} bài đọc cho học viên! 🎉`);
  };

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
  const [cardFormTotalQuestions, setCardFormTotalQuestions] = useState(30);
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
    setCardFormTotalQuestions(
      initialCategory === "part6" ? 4 : initialCategory === "part7" ? 2 : 30
    );
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
        correctIndex: 0,
        explanation: "",
        steps: [
          { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
          { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
        ],
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
    const cleanInitialTitle = normalizeReadingCardTitle(resolved.title, resolved.category, resolved.totalQuestions);
    setCardFormTitle(cleanInitialTitle);
    setCardFormCategory(resolved.category);
    setCardFormSubCategory(resolved.subCategory || "word_types");
    setCardFormTag(resolved.tag || "");
    setCardFormTotalQuestions(resolved.totalQuestions);
    setCardFormTheorySummary(resolved.theory?.summary || "");
    setCardFormTheoryRules(resolved.theory?.rules?.join("\n") || "");
    setCardFormTheoryExample(resolved.theory?.example || "");
    const firstQPassage = resolved.sampleQuestions?.find((q) => q.passageText?.trim())?.passageText?.trim() || "";
    const firstQPassageVi = resolved.sampleQuestions?.find((q) => q.passageTextVi?.trim())?.passageTextVi?.trim() || "";
    const initialPassage = (resolved.passageText && resolved.passageText.trim()) || firstQPassage;
    const initialPassageVi = (resolved.passageTextVi && resolved.passageTextVi.trim()) || firstQPassageVi;
    setCardFormPassageText(initialPassage);
    setCardFormPassageTextVi(initialPassageVi);
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
              correctIndex: 0,
              explanation: "",
              steps: [
                { title: "Bước 1: Phân tích ngữ cảnh", desc: "Xác định từ loại hoặc ý nghĩa cần điền." },
                { title: "Bước 2: Đối chiếu & chọn đáp án", desc: "So sánh các phương án để chọn đáp án chuẩn xác nhất." },
              ],
              vocabList: [],
            },
          ]
    );
    setShowCreateCardModal(true);
  };

  const handleSaveCard = async (e: React.FormEvent, overwriteTargetId?: string) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) {
      showToast("Vui lòng nhập tên chủ điểm đọc! ⚠️");
      return;
    }

    const rulesArr = cardFormTheoryRules
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    // Kiểm tra câu hỏi & đầy đủ 4 đáp án A/B/C/D
    if (!cardFormSampleQuestions || cardFormSampleQuestions.length === 0) {
      showToast("Vui lòng nhập ít nhất 1 câu hỏi ở tab 'Bộ câu hỏi & Đáp án'! ⚠️");
      return;
    }

    for (let i = 0; i < cardFormSampleQuestions.length; i++) {
      const q = cardFormSampleQuestions[i];
      const qNumStr = q.questionNum ? ` (#${q.questionNum})` : ` ${i + 1}`;
      if (!q.question.trim()) {
        showToast(`Câu${qNumStr} chưa có nội dung câu hỏi tiếng Anh! ⚠️`);
        return;
      }
      if (!q.bilingual?.trim()) {
        showToast(`Câu${qNumStr} chưa có bản dịch tiếng Việt! ⚠️`);
        return;
      }
      const missingOpts = [0, 1, 2, 3].filter((idx) => !(q.options?.[idx] || "").trim());
      if (missingOpts.length > 0) {
        const letters = missingOpts.map((idx) => ["A", "B", "C", "D"][idx]).join(", ");
        showToast(`Câu${qNumStr} chưa điền đủ 4 đáp án (đang thiếu: ${letters})! ⚠️`);
        return;
      }
      const missingMeanings = [0, 1, 2, 3].filter((idx) => !(q.optionMeanings?.[idx] || "").trim());
      if (missingMeanings.length > 0) {
        const letters = missingMeanings.map((idx) => ["A", "B", "C", "D"][idx]).join(", ");
        showToast(`Câu${qNumStr} chưa nhập nghĩa tiếng Việt cho phương án (${letters})! ⚠️`);
        return;
      }
    }

    // Kiểm tra từ vựng
    const totalVocab =
      cardFormVocabList.length +
      cardFormSampleQuestions.reduce((acc, q) => acc + (q.vocabList?.length || 0), 0);
    if (totalVocab === 0) {
      showToast("Vui lòng thêm ít nhất 1 từ vựng trọng tâm ở tab 'Từ vựng cần học' trước khi lưu! ⚠️");
      return;
    }

    const validQuestions = cardFormSampleQuestions;

    // KIỂM TRA ĐỊNH DẠNG THEO CHUẨN TOEIC (PART NÀO ĐI VỚI NỘI DUNG ĐÓ)
    const hasAnyPassage = !!cardFormPassageText.trim() || validQuestions.some((q) => !!q.passageText);

    // 1. Nếu là Part 6 hoặc Part 7: BẮT BUỘC phải có Đoạn văn/Bài đọc (Passage)
    if (cardFormCategory === "part6" || cardFormCategory === "part7") {
      if (!hasAnyPassage) {
        const partLabel = cardFormCategory === "part6" ? "Part 6 (Điền đoạn văn)" : "Part 7 (Đọc hiểu văn bản)";
        showToast(`❌ Không thể lưu: Bài đọc ${partLabel} bắt buộc phải có Đoạn văn/Bài đọc (Passage). Bạn không thể đưa câu đơn của Part 5 vào ${partLabel}!`);
        return;
      }
    }

    // 2. Nếu là Part 5: Bắt buộc là câu đơn, tự động dọn dẹp đoạn văn cũ (nếu có)
    const isPart5 = cardFormCategory === "part5";
    const totalCount = validQuestions.length;
    let finalTitle = normalizeReadingCardTitle(cardFormTitle.trim(), cardFormCategory, totalCount);
    if (isPart5) {
      if (validQuestions.length !== 30 && (finalTitle.includes("101 - 130") || finalTitle.includes("101-130"))) {
        finalTitle = finalTitle
          .replace(/\(Câu 101\s*-\s*130\)/gi, `(${validQuestions.length} câu luyện tập)`)
          .replace(/101\s*-\s*130/gi, `${validQuestions.length} câu`);
      }
    }

    const finalQuestions = validQuestions.map((q, idx) => ({
      ...q,
      questionNum:
        isPart5 && Number(validQuestions[0]?.questionNum) > 130
          ? String(101 + idx)
          : q.questionNum?.trim() || String(idx + 1),
      passageText: isPart5 ? undefined : (q.passageText || cardFormPassageText.trim() || undefined),
      passageTextVi: isPart5 ? undefined : (q.passageTextVi || cardFormPassageTextVi.trim() || undefined),
    }));

    // totalCount was initialized above

    const cleanVocab = cardFormVocabList.length > 0 ? cardFormVocabList : undefined;

    const targetId = editingCard?.id || overwriteTargetId;
    const targetCard = targetId ? cards.find((c) => c.id === targetId) : null;

    if (targetCard) {
      const updatedCandidate: ExerciseCardData = {
        ...targetCard,
        title: finalTitle,
        category: cardFormCategory,
        subCategory: cardFormSubCategory,
        tag: cardFormTag.trim() || undefined,
        totalQuestions: totalCount,
        passageText: isPart5 ? undefined : (cardFormPassageText.trim() || undefined),
        passageTextVi: isPart5 ? undefined : (cardFormPassageTextVi.trim() || undefined),
        vocabList: cleanVocab,
        detailsLoaded: true,
        theory: {
          summary: cardFormTheorySummary.trim() || targetCard.theory?.summary || "",
          rules: rulesArr.length > 0 ? rulesArr : targetCard.theory?.rules || [],
          example: cardFormTheoryExample.trim() || targetCard.theory?.example || "",
        },
        sampleQuestions: finalQuestions,
      };
      let savedCard = updatedCandidate;
      let syncedBackend = false;
      try {
        savedCard = await updateAdminReadingCard(targetCard.id, updatedCandidate);
        syncedBackend = true;
      } catch (err) {
        console.warn("Saved reading card locally (backend sync skipped):", err);
      }
      updateCardsState((prev) =>
        prev.map((c) => (c.id === targetCard.id ? { ...savedCard, detailsLoaded: true } : c))
      );
      showToast(
        syncedBackend
          ? `Đã cập nhật & ghi đè chuyên đề "${savedCard.title}" (${finalQuestions.length} câu hỏi)! 💾`
          : `Đã cập nhật cục bộ chuyên đề "${savedCard.title}" (${finalQuestions.length} câu hỏi)! 💾`
      );
    } else {
      const newId = `reading-${cards.length + 1}-${Date.now().toString().slice(-4)}`;
      const newCard: ExerciseCardData = {
        id: newId,
        title: finalTitle,
        category: cardFormCategory,
        subCategory: cardFormSubCategory,
        tag: cardFormTag.trim() || undefined,
        totalQuestions: totalCount,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        passageText: isPart5 ? undefined : (cardFormPassageText.trim() || undefined),
        passageTextVi: isPart5 ? undefined : (cardFormPassageTextVi.trim() || undefined),
        vocabList: cleanVocab,
        detailsLoaded: true,
        theory: {
          summary: cardFormTheorySummary.trim() || "Tóm tắt ngữ pháp và mẹo thi TOEIC Reading.",
          rules: rulesArr.length > 0 ? rulesArr : ["Nắm chắc dấu hiệu nhận biết."],
          example: cardFormTheoryExample.trim() || "Example sentence for TOEIC reading practice.",
        },
        sampleQuestions: finalQuestions,
      };
      let savedCard = newCard;
      let syncedBackend = false;
      try {
        savedCard = await createAdminReadingCard(newCard);
        syncedBackend = true;
      } catch (err) {
        console.warn("Created reading card locally (backend sync skipped):", err);
      }
      updateCardsState((prev) => [
        { ...savedCard, detailsLoaded: true },
        ...prev.filter((c) => c.id !== savedCard.id),
      ]);
      showToast(
        syncedBackend
          ? `Đã thêm & lưu chuyên đề "${savedCard.title}" (${finalQuestions.length} câu hỏi) lên hệ thống! 🎉`
          : `Đã thêm cục bộ chuyên đề "${savedCard.title}" (${finalQuestions.length} câu hỏi)! 🎉`
      );
    }
    setShowCreateCardModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCardConfirm) return;
    const target = deleteCardConfirm;
    let deletedBackend = false;
    try {
      await deleteAdminReadingCard(target.id);
      deletedBackend = true;
    } catch (err) {
      console.warn("Deleted reading card locally (backend delete skipped):", err);
    }
    updateCardsState((prev) => prev.filter((c) => c.id !== target.id));
    showToast(
      deletedBackend
        ? `Đã xóa chuyên đề "${target.title}" khỏi hệ thống`
        : `Đã xóa chuyên đề "${target.title}"`
    );
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
      {/* Toast notification (chỉ hiển thị ở góc màn hình ngoài khi KHÔNG mở modal tạo/sửa để tránh hiển thị lạc lõng bên ngoài popup) */}
      {toastMessage && !showCreateCardModal && !showImportModal && !theoryCard && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-blue-600 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce max-w-md sm:max-w-lg">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="font-semibold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

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
          highlightedCardId={highlightedCardId}
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
          onToggleCardStatus={handleToggleCardStatus}
          onDeleteAllDrafts={handleOpenDeleteAllDrafts}
          onPublishAllDrafts={handlePublishAllDrafts}
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

      {deleteAllDraftsList && (
        <ReadingDeleteAllDraftsModal
          count={deleteAllDraftsList.length}
          onClose={() => setDeleteAllDraftsList(null)}
          onConfirmDelete={handleConfirmDeleteAllDrafts}
        />
      )}

      <ReadingBulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingCards={cards}
        onImportSuccess={async (imported) => {
          const cardList = Array.isArray(imported) ? imported : [imported];
          const savedCards: ExerciseCardData[] = [];
          let syncedCount = 0;

          for (const card of cardList) {
            const cardWithFlag: ExerciseCardData = { ...card, detailsLoaded: true };
            let saved = cardWithFlag;
            try {
              saved = await createAdminReadingCard(cardWithFlag);
              syncedCount++;
            } catch (err) {
              console.warn("Imported reading card locally (backend sync skipped):", err);
            }
            savedCards.push(saved);
          }

          updateCardsState((prev) => {
            let next = [...prev];
            for (const sc of savedCards) {
              const existingIdx = next.findIndex((c) => c.id === sc.id);
              if (existingIdx >= 0) {
                next[existingIdx] = { ...sc, detailsLoaded: true };
              } else {
                next = [{ ...sc, detailsLoaded: true }, ...next];
              }
            }
            return next;
          });

          if (savedCards.length > 0) {
            setHighlightedCardId(savedCards[0].id);
            setTimeout(() => {
              setHighlightedCardId((current) => (savedCards.some((c) => c.id === current) ? null : current));
            }, 8000);
          }

          if (savedCards.length === 1) {
            const savedCard = savedCards[0];
            const isExisting = cards.some((c) => c.id === savedCard.id);
            showToast(
              isExisting
                ? `Đã cập nhật & ghi đè chuyên đề "${savedCard.title}" (${savedCard.totalQuestions} câu)! ✨`
                : syncedCount > 0
                ? `Đã import & lưu "${savedCard.title}" (${savedCard.totalQuestions} câu) dưới dạng ${savedCard.status === "draft" ? "Bản nháp" : "Đã phát hành"}! 🎉`
                : `Đã import cục bộ "${savedCard.title}" (${savedCard.totalQuestions} câu) dưới dạng ${savedCard.status === "draft" ? "Bản nháp" : "Đã phát hành"}! 🎉`
            );
          } else {
            showToast(
              `Đã import & lưu thành công trọn bộ ${savedCards.length} phần thi (Part 5: 30 câu, Part 6: 16 câu, Part 7: 54 câu)! 🎉`
            );
          }
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
          cardFormTotalQuestions={cardFormTotalQuestions}
          setCardFormTotalQuestions={setCardFormTotalQuestions}
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
          existingCards={cards}
          onSaveCard={handleSaveCard}
          onClose={() => setShowCreateCardModal(false)}
          externalToast={toastMessage}
          onClearToast={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
