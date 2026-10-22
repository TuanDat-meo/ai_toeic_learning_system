"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { GrammarTopicItem, GrammarQuestionItem } from "./types";
import { PART_LABEL } from "@/lib/types/domain";
import { INITIAL_GRAMMAR_TOPICS } from "./mockData";
import {
  getAdminGrammarTopics,
  createGrammarTopic,
  updateGrammarTopic,
  deleteGrammarTopic,
  addGrammarQuestion,
  bulkUpdateGrammarStatus,
  bulkDeleteGrammarTopics,
} from "@/lib/api/grammar";
import {
  GrammarFilterBar,
  GrammarAdminTab,
} from "@/components/admin/content/grammar/GrammarFilterBar";
import { GrammarTopicList } from "@/components/admin/content/grammar/GrammarTopicList";
import {
  GrammarQuestionBankView,
  GrammarTrapsMatrixView,
  GrammarCurriculumConfigView,
} from "@/components/admin/content/grammar/GrammarViews";
import {
  GrammarTopicDetailModal,
  GrammarTopicEditModal,
  GrammarDeleteModal,
  GrammarQuizModal,
  GrammarAddQuestionModal,
} from "@/components/admin/content/grammar/GrammarModals";

export const LOCAL_GRAMMAR_TOPICS_KEY = "toeic_grammar_topics";

function getLocalGrammarTopics(): GrammarTopicItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_GRAMMAR_TOPICS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocalGrammarTopics(data: GrammarTopicItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_GRAMMAR_TOPICS_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("toeic-grammar-topics-updated", { detail: data }));
  } catch (err) {
    console.warn("Could not save grammar topics to localStorage:", err);
  }
}

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>(INITIAL_GRAMMAR_TOPICS);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMainTab, setActiveMainTab] = useState<GrammarAdminTab>("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPart, setFilterPart] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Helper cập nhật state và đồng bộ localStorage
  const updateTopicsState = (updater: (prev: GrammarTopicItem[]) => GrammarTopicItem[]) => {
    setTopics((prev) => {
      const next = updater(prev);
      saveLocalGrammarTopics(next);
      return next;
    });
  };

  // Modals state
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<GrammarQuestionItem[]>([]);
  const [activeTopicForQuiz, setActiveTopicForQuiz] = useState<GrammarTopicItem | null>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editTopicItem, setEditTopicItem] = useState<GrammarTopicItem | null>(null);
  const [addQuestionTopic, setAddQuestionTopic] = useState<GrammarTopicItem | null>(null);
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<GrammarTopicItem | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      const local = getLocalGrammarTopics();
      if (local && local.length > 0) {
        setTopics(local);
        setLoading(false);
        return;
      }
      const data = await getAdminGrammarTopics();
      if (data && data.length > 0) {
        setTopics(data);
        saveLocalGrammarTopics(data);
      } else {
        setTopics(INITIAL_GRAMMAR_TOPICS);
        saveLocalGrammarTopics(INITIAL_GRAMMAR_TOPICS);
      }
    } catch (err) {
      console.warn("Could not load grammar topics from API:", err);
      const local = getLocalGrammarTopics();
      if (local && local.length > 0) {
        setTopics(local);
      } else {
        setTopics(INITIAL_GRAMMAR_TOPICS);
        saveLocalGrammarTopics(INITIAL_GRAMMAR_TOPICS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // Filter Logic
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const titleVi = t.titleVi || t.title || "";
      const titleEn = t.titleEn || t.englishTitle || "";
      const matchSearch =
        titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.formula && t.formula.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPart = filterPart === "ALL" || t.part === filterPart;

      const matchStatus = filterStatus === "ALL" || t.status === filterStatus;

      return matchSearch && matchPart && matchStatus;
    });
  }, [topics, searchQuery, filterPart, filterStatus]);

  // Statistics
  const totalTopicsCount = topics.length;
  const totalQuestionsCount = useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.questions ? t.questions.length : 0), 0);
  }, [topics]);

  // Preview / Student Simulation Quiz Trigger
  const startTopicQuiz = (topic: GrammarTopicItem) => {
    if (!topic.questions || topic.questions.length === 0) return;
    setActiveTopicForQuiz(topic);
    setQuizTitle(`Xem trước bài kiểm tra: ${topic.titleVi || topic.title} (${topic.code})`);
    setQuizQuestions(topic.questions);
    setQuizActive(true);
  };

  // handleRecordResult: Không cập nhật counter trên topic.
  // Kết quả đúng/sai ghi vào question_attempts (server-side) và
  // được tính động khi cần hiển thị.
  const handleRecordResult = (_topicId: string, _isCorrect: boolean) => {
    // TODO: POST /api/practice/sessions/{id}/answers
  };

  const handleSaveTopic = async (topicData: Partial<GrammarTopicItem>) => {
    if (editTopicItem) {
      try {
        const updated = await updateGrammarTopic(editTopicItem.id, topicData);
        updateTopicsState((prev) =>
          prev.map((t) => (t.id === editTopicItem.id ? updated : t))
        );
      } catch (err) {
        console.error("Lỗi khi cập nhật chuyên đề:", err);
        updateTopicsState((prev) =>
          prev.map((t) => (t.id === editTopicItem.id ? { ...t, ...topicData } : t))
        );
      }
      setEditTopicItem(null);
    } else {
      try {
        const created = await createGrammarTopic(topicData);
        updateTopicsState((prev) => [created, ...prev]);
      } catch (err) {
        console.error("Lỗi khi tạo chuyên đề:", err);
        const newTopic: GrammarTopicItem = {
          id: `g-${Date.now()}`,
          code: topicData.code || `GT-${Math.floor(100 + Math.random() * 900)}`,
          titleVi: topicData.titleVi || topicData.title || "",
          titleEn: topicData.titleEn || topicData.englishTitle || "",
          title: topicData.titleVi || topicData.title || "",
          englishTitle: topicData.titleEn || topicData.englishTitle || "",
          part: topicData.part || "PART_5",
          targetScore: topicData.targetScore || "500_750",
          status: topicData.status || "DRAFT",
          summary: topicData.summary || "",
          formula: topicData.formula || "",
          signalWords: topicData.signalWords || [],
          traps: topicData.traps || [],
          examples: topicData.examples || [],
          questions: [],
          orderIndex: topicData.orderIndex || 0,
        };
        updateTopicsState((prev) => [newTopic, ...prev]);
      }
      setShowCreateModal(false);
    }
  };

  const handleAddQuestion = async (topicId: string, question: GrammarQuestionItem) => {
    try {
      const updated = await addGrammarQuestion(topicId, question);
      updateTopicsState((prev) =>
        prev.map((t) => (t.id === topicId ? updated : t))
      );
    } catch (err) {
      console.error("Lỗi khi thêm câu hỏi:", err);
      updateTopicsState((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, questions: [...t.questions, question] } : t))
      );
    }
  };

  const confirmDeleteTopic = async () => {
    if (!deleteConfirmTopic) return;
    try {
      await deleteGrammarTopic(deleteConfirmTopic.id);
    } catch (err) {
      console.error("Lỗi khi xóa chuyên đề:", err);
    }
    updateTopicsState((prev) => prev.filter((t) => t.id !== deleteConfirmTopic.id));
    setSelectedTopicIds((prev) => prev.filter((id) => id !== deleteConfirmTopic.id));
    setDeleteConfirmTopic(null);
  };

  // Bulk operations
  const handleBulkPublish = async () => {
    try {
      await bulkUpdateGrammarStatus(selectedTopicIds, "PUBLISHED");
    } catch (err) {
      console.error("Lỗi khi bulk publish:", err);
    }
    updateTopicsState((prev) =>
      prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, status: "PUBLISHED" } : t))
    );
    setSelectedTopicIds([]);
  };

  const handleBulkDraft = async () => {
    try {
      await bulkUpdateGrammarStatus(selectedTopicIds, "DRAFT");
    } catch (err) {
      console.error("Lỗi khi bulk draft:", err);
    }
    updateTopicsState((prev) =>
      prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, status: "DRAFT" } : t))
    );
    setSelectedTopicIds([]);
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteGrammarTopics(selectedTopicIds);
    } catch (err) {
      console.error("Lỗi khi bulk delete:", err);
    }
    updateTopicsState((prev) => prev.filter((t) => !selectedTopicIds.includes(t.id)));
    setSelectedTopicIds([]);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Mã chuyên đề",
      "Tên tiếng Việt",
      "Tên tiếng Anh",
      "Phần thi",
      "Số câu hỏi",
      "Số bẫy đề",
      "Trạng thái",
    ];
    const rows = topics.map((t) => [
      `"${t.code}"`,
      `"${(t.titleVi || t.title || "").replace(/"/g, '""')}"`,
      `"${(t.titleEn || t.englishTitle || "").replace(/"/g, '""')}"`,
      `"${t.part}"`,
      t.questions.length,
      t.traps.length,
      `"${t.status}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toeic_grammar_curriculum_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <GrammarFilterBar
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterPart={filterPart}
        setFilterPart={setFilterPart}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalTopicsCount={totalTopicsCount}
        totalQuestionsCount={totalQuestionsCount}
        selectedTopicIds={selectedTopicIds}
        onOpenCreateModal={() => {
          setEditTopicItem(null);
          setShowCreateModal(true);
        }}
        onExportCsv={handleExportCsv}
        onBulkPublish={handleBulkPublish}
        onBulkDraft={handleBulkDraft}
        onBulkDelete={handleBulkDelete}
      />

      {/* Main Tab Content Switching */}
      {activeMainTab === "topics" && (
        <GrammarTopicList
          topics={filteredTopics}
          viewMode={viewMode}
          selectedTopicIds={selectedTopicIds}
          onToggleSelectTopic={(id) =>
            setSelectedTopicIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            )
          }
          onSelectAllTopics={() =>
            setSelectedTopicIds(
              selectedTopicIds.length === filteredTopics.length
                ? []
                : filteredTopics.map((t) => t.id)
            )
          }
          onOpenTheoryModal={setTheoryTopic}
          onStartQuiz={startTopicQuiz}
          onOpenEditTopic={setEditTopicItem}
          onOpenAddQuestion={setAddQuestionTopic}
          onOpenDeleteTopic={setDeleteConfirmTopic}
        />
      )}

      {activeMainTab === "questions" && (
        <GrammarQuestionBankView topics={topics} />
      )}

      {activeMainTab === "traps_matrix" && (
        <GrammarTrapsMatrixView topics={topics} />
      )}

      {activeMainTab === "curriculum" && (
        <GrammarCurriculumConfigView topicsCount={totalTopicsCount} />
      )}

      {/* Modals */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        onClose={() => setTheoryTopic(null)}
        onStartQuiz={startTopicQuiz}
      />

      <GrammarTopicEditModal
        isOpen={showCreateModal || !!editTopicItem}
        editTopic={editTopicItem}
        onClose={() => {
          setShowCreateModal(false);
          setEditTopicItem(null);
        }}
        onSave={handleSaveTopic}
      />

      <GrammarAddQuestionModal
        isOpen={!!addQuestionTopic}
        topic={addQuestionTopic}
        onClose={() => setAddQuestionTopic(null)}
        onAddQuestion={handleAddQuestion}
      />

      <GrammarDeleteModal
        deleteConfirmTopic={deleteConfirmTopic}
        onClose={() => setDeleteConfirmTopic(null)}
        onConfirm={confirmDeleteTopic}
      />

      <GrammarQuizModal
        isOpen={quizActive}
        title={quizTitle}
        questions={quizQuestions}
        onClose={() => setQuizActive(false)}
        activeTopic={activeTopicForQuiz}
        onRecordResult={handleRecordResult}
      />
    </div>
  );
}
