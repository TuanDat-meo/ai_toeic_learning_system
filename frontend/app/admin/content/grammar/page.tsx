"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { GrammarTopicItem, GrammarQuestionItem } from "./types";
import { INITIAL_GRAMMAR_TOPICS } from "./mockData";
import {
  getAdminGrammarTopics,
  createGrammarTopic,
  updateGrammarTopic,
  deleteGrammarTopic,
  addGrammarQuestion,
  updateGrammarQuestion,
  deleteGrammarQuestion,
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
import { GrammarContentReviewView } from "@/components/admin/content/grammar/GrammarContentReviewView";
import {
  GrammarTopicDetailModal,
  GrammarTopicEditModal,
  GrammarDeleteModal,
  GrammarAddQuestionModal,
} from "@/components/admin/content/grammar/GrammarModals";

const LOCAL_GRAMMAR_TOPICS_KEY = "toeic_grammar_topics";

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
  const [actionError, setActionError] = useState<string | null>(null);

  // Keep the admin cache in sync only after the backend confirms a change.
  const updateTopicsState = (updater: (prev: GrammarTopicItem[]) => GrammarTopicItem[]) => {
    setTopics((prev) => {
      const next = updater(prev);
      saveLocalGrammarTopics(next);
      return next;
    });
  };

  // Dialog state
  const [theoryTopic, setTheoryTopic] = useState<GrammarTopicItem | null>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editTopicItem, setEditTopicItem] = useState<GrammarTopicItem | null>(null);
  const [questionModal, setQuestionModal] = useState<{
    topic: GrammarTopicItem | null;
    question: GrammarQuestionItem | null;
  } | null>(null);
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<GrammarTopicItem | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      // Luôn ưu tiên gọi API backend để lấy dữ liệu mới nhất từ database
      const data = await getAdminGrammarTopics();
      if (data && data.length > 0) {
        setTopics(data);
        saveLocalGrammarTopics(data);
        return;
      }
      // Fallback về localStorage hoặc mock nếu API trả về rỗng
      const local = getLocalGrammarTopics();
      if (local && local.length > 0) {
        setTopics(local);
      } else {
        setTopics(INITIAL_GRAMMAR_TOPICS);
        saveLocalGrammarTopics(INITIAL_GRAMMAR_TOPICS);
      }
    } catch (err) {
      console.warn("Could not load grammar topics from API, falling back:", err);
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

    // Lắng nghe sự kiện khi có dữ liệu mới được publish từ Content Import
    const handleTopicsUpdated = () => {
      loadTopics();
    };
    window.addEventListener("toeic-grammar-topics-updated", handleTopicsUpdated);
    return () => window.removeEventListener("toeic-grammar-topics-updated", handleTopicsUpdated);
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

  const handleSaveTopic = async (topicData: Partial<GrammarTopicItem>) => {
    setActionError(null);
    if (editTopicItem) {
      try {
        const updated = await updateGrammarTopic(editTopicItem.id, topicData);
        updateTopicsState((prev) =>
          prev.map((t) => (t.id === editTopicItem.id ? updated : t))
        );
      } catch (err) {
        console.error("Lỗi khi cập nhật chuyên đề:", err);
        setActionError(err instanceof Error ? `Không thể lưu chuyên đề: ${err.message}` : "Không thể lưu chuyên đề.");
        throw err;
      }
    } else {
      try {
        const created = await createGrammarTopic(topicData);
        updateTopicsState((prev) => [created, ...prev]);
      } catch (err) {
        console.error("Lỗi khi tạo chuyên đề:", err);
        setActionError(err instanceof Error ? `Không thể tạo chuyên đề: ${err.message}` : "Không thể tạo chuyên đề.");
        throw err;
      }
    }
  };

  const handleSaveQuestion = async (
    topicId: string,
    question: GrammarQuestionItem,
    originalQuestionId?: string
  ) => {
    setActionError(null);
    try {
      const updated = originalQuestionId
        ? await updateGrammarQuestion(topicId, originalQuestionId, question)
        : await addGrammarQuestion(topicId, question);
      updateTopicsState((prev) =>
        prev.map((t) => (t.id === topicId ? updated : t))
      );
    } catch (err) {
      const action = originalQuestionId ? "cập nhật" : "thêm";
      console.error(`Lỗi khi ${action} câu hỏi:`, err);
      const message = err instanceof Error ? `Không thể ${action} câu hỏi: ${err.message}` : `Không thể ${action} câu hỏi.`;
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDeleteQuestion = async (topic: GrammarTopicItem, question: GrammarQuestionItem) => {
    if (!window.confirm(`Xóa câu hỏi "${question.questionText}"? Thao tác này không thể hoàn tác.`)) return;
    setActionError(null);
    try {
      const updated = await deleteGrammarQuestion(topic.id, String(question.id));
      updateTopicsState((prev) => prev.map((item) => (item.id === topic.id ? updated : item)));
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      setActionError(err instanceof Error ? `Không thể xóa câu hỏi: ${err.message}` : "Không thể xóa câu hỏi.");
    }
  };

  const handleReviewStatusChange = async (topic: GrammarTopicItem, status: "DRAFT" | "PUBLISHED") => {
    setActionError(null);
    try {
      const updated = await updateGrammarTopic(topic.id, { ...topic, status });
      updateTopicsState((prev) => prev.map((item) => (item.id === topic.id ? updated : item)));
    } catch (err) {
      console.error("Lỗi khi đổi trạng thái chuyên đề từ rà soát:", err);
      setActionError(err instanceof Error ? `Không thể đổi trạng thái chuyên đề: ${err.message}` : "Không thể đổi trạng thái chuyên đề.");
    }
  };

  const confirmDeleteTopic = async () => {
    if (!deleteConfirmTopic) return;
    setActionError(null);
    try {
      await deleteGrammarTopic(deleteConfirmTopic.id);
    } catch (err) {
      console.error("Lỗi khi xóa chuyên đề:", err);
      setActionError(err instanceof Error ? `Không thể xóa chuyên đề: ${err.message}` : "Không thể xóa chuyên đề.");
      return;
    }
    updateTopicsState((prev) => prev.filter((t) => t.id !== deleteConfirmTopic.id));
    setSelectedTopicIds((prev) => prev.filter((id) => id !== deleteConfirmTopic.id));
    setDeleteConfirmTopic(null);
  };

  // Bulk operations
  const handleBulkPublish = async () => {
    setActionError(null);
    try {
      await bulkUpdateGrammarStatus(selectedTopicIds, "PUBLISHED");
    } catch (err) {
      console.error("Lỗi khi bulk publish:", err);
      setActionError(err instanceof Error ? `Không thể phát hành chuyên đề: ${err.message}` : "Không thể phát hành chuyên đề.");
      return;
    }
    updateTopicsState((prev) =>
      prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, status: "PUBLISHED" } : t))
    );
    setSelectedTopicIds([]);
  };

  const handleBulkDraft = async () => {
    setActionError(null);
    try {
      await bulkUpdateGrammarStatus(selectedTopicIds, "DRAFT");
    } catch (err) {
      console.error("Lỗi khi bulk draft:", err);
      setActionError(err instanceof Error ? `Không thể chuyển chuyên đề về bản nháp: ${err.message}` : "Không thể chuyển chuyên đề về bản nháp.");
      return;
    }
    updateTopicsState((prev) =>
      prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, status: "DRAFT" } : t))
    );
    setSelectedTopicIds([]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Xóa ${selectedTopicIds.length} chuyên đề đã chọn? Thao tác này không thể hoàn tác.`)) return;
    setActionError(null);
    try {
      await bulkDeleteGrammarTopics(selectedTopicIds);
    } catch (err) {
      console.error("Lỗi khi bulk delete:", err);
      setActionError(err instanceof Error ? `Không thể xóa chuyên đề: ${err.message}` : "Không thể xóa chuyên đề.");
      return;
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
      {actionError ? (
        <div role="alert" className="fixed right-5 top-5 z-[70] max-w-lg rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg">
          {actionError}
        </div>
      ) : null}
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
      {loading ? (
        <p role="status" className="text-sm text-slate-500">Đang tải dữ liệu ngữ pháp…</p>
      ) : null}

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
          onOpenEditTopic={setEditTopicItem}
          onOpenAddQuestion={(topic) => setQuestionModal({ topic, question: null })}
          onOpenDeleteTopic={setDeleteConfirmTopic}
        />
      )}

      {activeMainTab === "questions" && (
        <GrammarQuestionBankView
          topics={topics}
          onAddQuestion={() => setQuestionModal({ topic: null, question: null })}
          onEditQuestion={(topic, question) => setQuestionModal({ topic, question })}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}

      {activeMainTab === "review" && (
        <GrammarContentReviewView
          topics={topics}
          onEditTopic={(topic) => {
            setActiveMainTab("topics");
            setEditTopicItem(topic);
          }}
          onChangeStatus={handleReviewStatusChange}
        />
      )}

      {activeMainTab === "traps_matrix" && (
        <GrammarTrapsMatrixView topics={topics} />
      )}

      {activeMainTab === "curriculum" && (
        <GrammarCurriculumConfigView topicsCount={totalTopicsCount} topics={topics} />
      )}

      {/* Modals */}
      <GrammarTopicDetailModal
        topic={theoryTopic}
        onClose={() => setTheoryTopic(null)}
        audience="admin"
      />

      <GrammarTopicEditModal
        key={editTopicItem?.id ?? (showCreateModal ? "create-topic" : "closed")}
        isOpen={showCreateModal || !!editTopicItem}
        editTopic={editTopicItem}
        availableTopics={topics}
        onClose={() => {
          setShowCreateModal(false);
          setEditTopicItem(null);
        }}
        onSave={handleSaveTopic}
      />

      <GrammarAddQuestionModal
        key={questionModal ? `${questionModal.topic?.id || "choose-topic"}-${questionModal.question?.id || "new"}` : "closed-question"}
        isOpen={!!questionModal}
        topic={questionModal?.topic || null}
        topics={topics}
        question={questionModal?.question || null}
        onClose={() => setQuestionModal(null)}
        onSaveQuestion={handleSaveQuestion}
      />

      <GrammarDeleteModal
        deleteConfirmTopic={deleteConfirmTopic}
        onClose={() => setDeleteConfirmTopic(null)}
        onConfirm={confirmDeleteTopic}
      />

    </div>
  );
}
