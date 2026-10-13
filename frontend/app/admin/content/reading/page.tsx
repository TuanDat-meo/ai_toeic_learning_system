"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Layers,
} from "lucide-react";

import { ExerciseCardData } from "./types";
import { INITIAL_CARDS } from "./mockData";

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

export default function ReadingLearningPage() {
  const [cards, setCards] = useState<ExerciseCardData[]>(INITIAL_CARDS);
  const [activeMainTab, setActiveMainTab] = useState<ReadingAdminTab>("reading_units");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "grammar" | "part5" | "part6" | "part7"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // State Workspace
  const [activePracticeCard, setActivePracticeCard] = useState<ExerciseCardData | null>(null);

  // State Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Web Audio Sound Effects Synthesizer
  const playSfx = (type?: "correct" | "wrong" | "click") => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    } catch {
      // Fallback
    }
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
  const [cardFormTotalQuestions, setCardFormTotalQuestions] = useState(50);
  const [cardFormTheorySummary, setCardFormTheorySummary] = useState("");
  const [cardFormTheoryRules, setCardFormTheoryRules] = useState("");
  const [cardFormTheoryExample, setCardFormTheoryExample] = useState("");

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
  const handleOpenCreateCard = () => {
    setEditingCard(null);
    setCardFormTitle("");
    setCardFormCategory("grammar");
    setCardFormSubCategory("word_types");
    setCardFormTag("");
    setCardFormTotalQuestions(50);
    setCardFormTheorySummary("");
    setCardFormTheoryRules("");
    setCardFormTheoryExample("");
    setShowCreateCardModal(true);
  };

  const handleOpenEditCard = (card: ExerciseCardData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCard(card);
    setCardFormTitle(card.title);
    setCardFormCategory(card.category);
    setCardFormSubCategory(card.subCategory || "word_types");
    setCardFormTag(card.tag || "");
    setCardFormTotalQuestions(card.totalQuestions);
    setCardFormTheorySummary(card.theory?.summary || "");
    setCardFormTheoryRules(card.theory?.rules?.join("\n") || "");
    setCardFormTheoryExample(card.theory?.example || "");
    setShowCreateCardModal(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFormTitle.trim()) return;

    const rulesArr = cardFormTheoryRules
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (editingCard) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === editingCard.id
            ? {
                ...c,
                title: cardFormTitle.trim(),
                category: cardFormCategory,
                subCategory: cardFormSubCategory,
                tag: cardFormTag.trim() || undefined,
                totalQuestions: cardFormTotalQuestions,
                theory: {
                  summary: cardFormTheorySummary.trim() || c.theory?.summary || "",
                  rules: rulesArr.length > 0 ? rulesArr : c.theory?.rules || [],
                  example: cardFormTheoryExample.trim() || c.theory?.example || "",
                },
              }
            : c
        )
      );
      showToast(`Đã cập nhật chuyên đề "${cardFormTitle}"! 💾`);
    } else {
      const newId = `reading-${cards.length + 1}-${Date.now().toString().slice(-4)}`;
      const newCard: ExerciseCardData = {
        id: newId,
        title: cardFormTitle.trim(),
        category: cardFormCategory,
        subCategory: cardFormSubCategory,
        tag: cardFormTag.trim() || undefined,
        totalQuestions: cardFormTotalQuestions,
        studiedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        theory: {
          summary: cardFormTheorySummary.trim() || "Tóm tắt ngữ pháp và mẹo thi TOEIC Reading.",
          rules: rulesArr.length > 0 ? rulesArr : ["Nắm chắc dấu hiệu nhận biết."],
          example: cardFormTheoryExample.trim() || "Example sentence for TOEIC reading practice.",
        },
        sampleQuestions: [
          {
            questionNum: "101",
            question: "The director approved the proposal after a ______ review of the budget.",
            bilingual: "Giám đốc đã phê duyệt đề xuất sau khi xem xét kỹ lưỡng ngân sách.",
            options: ["thorough", "thoroughly", "thoroughness", "more thorough"],
            optionMeanings: ["(adj): kỹ lưỡng", "(adv): một cách kỹ lưỡng", "(n): sự kỹ lưỡng", "(adj-er): kỹ lưỡng hơn"],
            correctIndex: 0,
            explanation: "Trước danh từ 'review' cần một tính từ ('thorough').",
            steps: [
              { title: "Bước 1: Phân tích cú pháp", desc: "Mạo từ 'a' + [Tính từ] + Danh từ 'review'." },
              { title: "Bước 2: Chọn từ loại", desc: "Thorough là tính từ chỉ sự kỹ lưỡng, thấu đáo." },
            ],
            vocabList: [
              { word: "thorough", pos: "adj", level: "B2", ipa: "/ˈθɜːrəʊ/", meaning: "kỹ lưỡng, thấu đáo" },
            ],
          },
        ],
      };
      setCards((prev) => [newCard, ...prev]);
      showToast(`Đã thêm chuyên đề "${newCard.title}" thành công! 🎉`);
    }
    setShowCreateCardModal(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteCardConfirm) return;
    setCards((prev) => prev.filter((c) => c.id !== deleteCardConfirm.id));
    showToast(`Đã xóa chuyên đề "${deleteCardConfirm.title}"`);
    setDeleteCardConfirm(null);
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Tên chuyên đề", "Phần thi", "Thẻ gắn", "Số câu hỏi", "Trạng thái"];
    const rows = cards.map((c) => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.tag || ""}"`,
      c.totalQuestions,
      `"PUBLISHED"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toeic_reading_curriculum_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Full Screen Workspace if Practice Started (Preview Mode)
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

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="font-semibold text-sm">{toastMessage}</span>
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
        onExportCsv={handleExportCsv}
      />

      {/* Main Tab Content Switching */}
      {activeMainTab === "reading_units" && (
        <ReadingCardGrid
          cards={filteredCards}
          viewMode={viewMode}
          onStartPractice={(card) => setActivePracticeCard(card)}
          onOpenTheory={(card) => setTheoryCard(card)}
          onOpenEditCard={handleOpenEditCard}
          onOpenDeleteConfirm={(card) => setDeleteCardConfirm(card)}
        />
      )}

      {activeMainTab === "passages" && (
        <ReadingPassageBankView />
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
        />
      )}

      {deleteCardConfirm && (
        <ReadingDeleteCardModal
          card={deleteCardConfirm}
          onClose={() => setDeleteCardConfirm(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

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
          onSaveCard={handleSaveCard}
          onClose={() => setShowCreateCardModal(false)}
        />
      )}
    </div>
  );
}
