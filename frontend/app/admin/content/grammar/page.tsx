"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { GrammarTopicItem, GrammarQuestionItem } from "./types";
import { INITIAL_GRAMMAR_TOPICS } from "./mockData";
import {
  getAdminGrammarTopics,
  createGrammarTopic,
  createGrammarTopicWithNewParent,
  updateGrammarTopic,
  deleteGrammarTopicWithChildren,
  archiveGrammarTopic,
  restoreGrammarTopic,
  addGrammarQuestion,
  updateGrammarQuestion,
  deleteGrammarQuestion,
  bulkUpdateGrammarStatus,
  bulkDeleteGrammarTopics,
  getGrammarTopicLifecycleImpact,
  type DeleteGrammarTopicRequest,
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
  GrammarArchiveModal,
  GrammarAddQuestionModal,
} from "@/components/admin/content/grammar/GrammarModals";

const LOCAL_GRAMMAR_TOPICS_KEY = "toeic_grammar_topics";

function getLocalGrammarTopics(): GrammarTopicItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_GRAMMAR_TOPICS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
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
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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
  const [createParentTopicId, setCreateParentTopicId] = useState<string | undefined>();
  const [questionModal, setQuestionModal] = useState<{
    topic: GrammarTopicItem | null;
    question: GrammarQuestionItem | null;
  } | null>(null);
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<GrammarTopicItem | null>(null);
  const [archiveConfirmTopic, setArchiveConfirmTopic] = useState<GrammarTopicItem | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminGrammarTopics();
      if (data !== null) {
        setTopics(data);
        saveLocalGrammarTopics(data);
        return;
      }
      const local = getLocalGrammarTopics();
      if (local !== null) {
        setTopics(local);
      } else {
        setTopics(INITIAL_GRAMMAR_TOPICS);
        saveLocalGrammarTopics(INITIAL_GRAMMAR_TOPICS);
      }
    } catch (err) {
      console.warn("Could not load grammar topics from API, falling back:", err);
      const local = getLocalGrammarTopics();
      if (local !== null) {
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
  const activeTopics = useMemo(() => topics.filter((topic) => topic.status !== "ARCHIVED"), [topics]);
  const archivedTopics = useMemo(() => topics.filter((topic) => topic.status === "ARCHIVED"), [topics]);

  const filteredTopics = useMemo(() => {
    return activeTopics.filter((t) => {
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
  }, [activeTopics, searchQuery, filterPart, filterStatus]);

  // Statistics
  const totalTopicsCount = activeTopics.length;
  const totalQuestionsCount = useMemo(() => {
    return activeTopics.reduce((acc, t) => acc + (t.questions ? t.questions.length : 0), 0);
  }, [activeTopics]);

  const handleSaveTopic = async (
    topicData: Partial<GrammarTopicItem>,
    newParent?: { titleVi: string; titleEn: string },
  ) => {
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
        if (newParent) {
          const created = await createGrammarTopicWithNewParent(
            newParent.titleVi,
            newParent.titleEn,
            topicData,
          );
          updateTopicsState((prev) => [created.child, created.parent, ...prev]);
          return;
        }
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

  const confirmDeleteTopic = async (request: DeleteGrammarTopicRequest) => {
    if (!deleteConfirmTopic) return;
    setActionError(null);
    setActionNotice(null);
    try {
      await deleteGrammarTopicWithChildren(deleteConfirmTopic.id, request);
    } catch (err) {
      console.error("Lỗi khi xóa chuyên đề:", err);
      setActionError(err instanceof Error ? `Không thể xóa chuyên đề: ${err.message}` : "Không thể xóa chuyên đề.");
      throw err;
    }
    const deletedId = deleteConfirmTopic.id;
    updateTopicsState((prev) =>
      prev
        .filter((t) => t.id !== deletedId)
        .map((t) => t.parentTopicId === deletedId
          ? { ...t, parentTopicId: request.childAction === "MOVE" ? request.targetParentId || undefined : undefined }
          : t)
    );
    setSelectedTopicIds((prev) => prev.filter((id) => id !== deletedId));
    setActionNotice("Đã xóa chủ điểm; dữ liệu con đã được chuyển theo lựa chọn.");
  };

  const confirmArchiveTopic = async () => {
    if (!archiveConfirmTopic) return;
    setActionError(null);
    setActionNotice(null);
    try {
      await archiveGrammarTopic(archiveConfirmTopic.id);
    } catch (err) {
      console.error("Lỗi khi lưu trữ chủ điểm:", err);
      setActionError(err instanceof Error ? `Không thể lưu trữ chủ điểm: ${err.message}` : "Không thể lưu trữ chủ điểm.");
      throw err;
    }
    const archivedId = archiveConfirmTopic.id;
    const archivedAt = new Date().toISOString();
    updateTopicsState((prev) => prev.map((topic) => {
      if (topic.id === archivedId) {
        return { ...topic, archivedAt, status: "ARCHIVED" };
      }
      if (topic.parentTopicId === archivedId) {
        return { ...topic, parentTopicId: undefined };
      }
      return topic;
    }));
    setSelectedTopicIds((prev) => prev.filter((id) => id !== archivedId));
    setActionNotice("Đã lưu trữ chủ điểm. Các chủ điểm con vẫn hoạt động ở cấp gốc.");
  };

  const handleRestoreTopic = async (topic: GrammarTopicItem) => {
    setActionError(null);
    setActionNotice(null);
    try {
      const restored = await restoreGrammarTopic(topic.id);
      updateTopicsState((prev) => prev.map((item) => item.id === topic.id ? restored : item));
      setActionNotice(`Đã khôi phục “${restored.titleVi || restored.title}”.`);
    } catch (err) {
      console.error("Lỗi khi khôi phục chủ điểm:", err);
      setActionError(err instanceof Error ? `Không thể khôi phục chủ điểm: ${err.message}` : "Không thể khôi phục chủ điểm.");
    }
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
    setActionError(null);
    setActionNotice(null);
    let impacts;
    try {
      impacts = await Promise.all(selectedTopicIds.map((id) => getGrammarTopicLifecycleImpact(id)));
    } catch (err) {
      setActionError(err instanceof Error ? `Không thể kiểm tra dữ liệu trước khi xóa: ${err.message}` : "Không thể kiểm tra dữ liệu trước khi xóa.");
      return;
    }
    const blockedTopics = impacts.filter((impact) =>
      impact.childCount > 0
      || impact.userProgressCount > 0
      || impact.wordFamilyLinkCount > 0
      || impact.toeicQuestionLinkCount > 0
      || impact.learningPathLinkCount > 0);
    if (blockedTopics.length > 0) {
      setActionError(`Không thể xóa hàng loạt vì các mục sau còn chủ điểm con hoặc dữ liệu liên kết: ${blockedTopics.map((item) => `${item.title} (con: ${item.childCount}, tiến độ: ${item.userProgressCount}, Word Family: ${item.wordFamilyLinkCount}, câu hỏi TOEIC: ${item.toeicQuestionLinkCount})`).join("; ")}. Hãy dùng thao tác xóa riêng để chuyển con hoặc lưu trữ để bảo toàn dữ liệu.`);
      return;
    }
    const impactSummary = impacts.map((item) =>
      `${item.title}: ${item.questionCount} câu hỏi, ${item.exampleCount} ví dụ, ${item.theoryFieldCount} mục lý thuyết`).join("\n");
    if (!window.confirm(`Xóa ${selectedTopicIds.length} chủ điểm? Nội dung trực tiếp sau đây sẽ bị xóa; dữ liệu liên kết được kiểm tra và giữ an toàn.\n\n${impactSummary}\n\nThao tác này không thể hoàn tác.`)) return;
    try {
      await bulkDeleteGrammarTopics(selectedTopicIds);
    } catch (err) {
      console.error("Lỗi khi bulk delete:", err);
      setActionError(err instanceof Error ? `Không thể xóa chuyên đề: ${err.message}` : "Không thể xóa chuyên đề.");
      return;
    }
    const deletedIds = new Set(selectedTopicIds);
    updateTopicsState((prev) => prev.filter((t) => !deletedIds.has(t.id)));
    setSelectedTopicIds([]);
    setActionNotice("Đã xóa các chủ điểm đã chọn.");
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
      {actionNotice ? (
        <div role="status" className="fixed right-5 top-5 z-[69] max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg">
          {actionNotice}
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
        archivedTopicsCount={archivedTopics.length}
        totalQuestionsCount={totalQuestionsCount}
        selectedTopicIds={selectedTopicIds}
        onOpenCreateModal={() => {
          setEditTopicItem(null);
          setCreateParentTopicId(undefined);
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
          allTopics={activeTopics}
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
          onCreateChildTopic={(parentTopic) => {
            setEditTopicItem(null);
            setCreateParentTopicId(parentTopic.id);
            setShowCreateModal(true);
          }}
          onOpenAddQuestion={(topic) => setQuestionModal({ topic, question: null })}
          onOpenDeleteTopic={setDeleteConfirmTopic}
          onArchiveTopic={setArchiveConfirmTopic}
        />
      )}

      {activeMainTab === "archived" && (
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Chủ điểm đã lưu trữ</h2>
            <p className="mt-1 text-xs text-slate-500">Nội dung vẫn được giữ nguyên trong cơ sở dữ liệu và không xuất hiện với học viên cho đến khi khôi phục.</p>
          </div>
          {archivedTopics.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-500">Chưa có chủ điểm nào được lưu trữ.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {archivedTopics.map((topic) => (
                <article key={topic.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold text-slate-700">{topic.code}</span>
                      <span className="text-xs font-bold text-slate-900">{topic.titleVi || topic.title}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {topic.archivedAt ? `Lưu trữ ${new Date(topic.archivedAt).toLocaleString("vi-VN")}` : "Đã lưu trữ"}
                      {" · "}{topic.questions.length} câu hỏi · {topic.examples.length} ví dụ · {topic.wordFamilyWords?.length || 0} từ Word Family
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestoreTopic(topic)}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    Khôi phục
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
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
        topics={activeTopics}
        onClose={() => setTheoryTopic(null)}
        audience="admin"
      />

      <GrammarTopicEditModal
        key={editTopicItem?.id ?? (showCreateModal ? `create-topic-${createParentTopicId || "root"}` : "closed")}
        isOpen={showCreateModal || !!editTopicItem}
        editTopic={editTopicItem}
        initialParentTopicId={createParentTopicId}
        availableTopics={topics}
        onClose={() => {
          setShowCreateModal(false);
          setEditTopicItem(null);
          setCreateParentTopicId(undefined);
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
        key={deleteConfirmTopic?.id || "no-delete-topic"}
        deleteConfirmTopic={deleteConfirmTopic}
        topics={topics}
        onClose={() => setDeleteConfirmTopic(null)}
        onConfirm={confirmDeleteTopic}
      />

      <GrammarArchiveModal
        key={archiveConfirmTopic?.id || "no-archive-topic"}
        topic={archiveConfirmTopic}
        onClose={() => setArchiveConfirmTopic(null)}
        onConfirm={confirmArchiveTopic}
      />
    </div>
  );
}
