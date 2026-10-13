"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { GrammarTopicItem, GrammarQuestionItem } from "./types";
import { INITIAL_GRAMMAR_TOPICS } from "./mockData";
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

export default function AdminGrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicItem[]>(INITIAL_GRAMMAR_TOPICS);
  const [activeMainTab, setActiveMainTab] = useState<GrammarAdminTab>("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPart, setFilterPart] = useState<string>("ALL");
  const [filterScore, setFilterScore] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

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

  // Filter Logic
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPart = filterPart === "ALL" || t.part === filterPart;

      const matchScore = filterScore === "ALL" || t.targetScore === filterScore;
      const matchStatus = filterStatus === "ALL" || t.status === filterStatus;

      return matchSearch && matchPart && matchScore && matchStatus;
    });
  }, [topics, searchQuery, filterPart, filterScore, filterStatus]);

  // Statistics
  const totalTopicsCount = topics.length;
  const totalQuestionsCount = useMemo(() => {
    return topics.reduce((acc, t) => acc + t.questions.length, 0);
  }, [topics]);

  const totalTrapsCount = useMemo(() => {
    return topics.reduce((acc, t) => acc + t.traps.length, 0);
  }, [topics]);

  // Preview / Student Simulation Quiz Trigger
  const startTopicQuiz = (topic: GrammarTopicItem) => {
    if (topic.questions.length === 0) return;
    setActiveTopicForQuiz(topic);
    setQuizTitle(`Xem trước bài kiểm tra: ${topic.title} (${topic.code})`);
    setQuizQuestions(topic.questions);
    setQuizActive(true);
  };

  const handleRecordResult = (topicId: string, isCorrect: boolean) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            studiedCount: t.studiedCount + 1,
            correctCount: isCorrect ? t.correctCount + 1 : t.correctCount,
            wrongCount: isCorrect ? t.wrongCount : t.wrongCount + 1,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTopic = (topicData: Partial<GrammarTopicItem>) => {
    if (editTopicItem) {
      setTopics((prev) =>
        prev.map((t) => (t.id === editTopicItem.id ? { ...t, ...topicData } : t))
      );
      setEditTopicItem(null);
    } else {
      const newTopic: GrammarTopicItem = {
        id: `g-${Date.now()}`,
        code: topicData.code || `TOPIC-${Math.floor(10 + Math.random() * 90)}`,
        title: topicData.title || "",
        englishTitle: topicData.englishTitle || "",
        part: topicData.part || "Part 5",
        targetScore: topicData.targetScore || "500-750",
        status: topicData.status || "PUBLISHED",
        summary: topicData.summary || "",
        formula: topicData.formula || "",
        signalWords: topicData.signalWords || [],
        traps: topicData.traps || [],
        examples: topicData.examples || [],
        questions: [],
        studiedCount: 0,
        correctCount: 0,
        wrongCount: 0,
      };
      setTopics((prev) => [newTopic, ...prev]);
      setShowCreateModal(false);
    }
  };

  const handleAddQuestion = (topicId: string, question: GrammarQuestionItem) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, questions: [...t.questions, question] } : t))
    );
  };

  const confirmDeleteTopic = () => {
    if (!deleteConfirmTopic) return;
    setTopics((prev) => prev.filter((t) => t.id !== deleteConfirmTopic.id));
    setSelectedTopicIds((prev) => prev.filter((id) => id !== deleteConfirmTopic.id));
    setDeleteConfirmTopic(null);
  };

  // Bulk operations
  const handleBulkPublish = () => {
    setTopics((prev) =>
      prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, status: "PUBLISHED" } : t))
    );
    setSelectedTopicIds([]);
  };

  const handleBulkDraft = () => {
    setTopics((prev) =>
      prev.map((t) => (selectedTopicIds.includes(t.id) ? { ...t, status: "DRAFT" } : t))
    );
    setSelectedTopicIds([]);
  };

  const handleBulkDelete = () => {
    setTopics((prev) => prev.filter((t) => !selectedTopicIds.includes(t.id)));
    setSelectedTopicIds([]);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Mã chuyên đề",
      "Tên tiếng Việt",
      "Tên tiếng Anh",
      "Phần thi",
      "Target Band",
      "Số câu hỏi",
      "Số bẫy đề",
      "Trạng thái",
    ];
    const rows = topics.map((t) => [
      `"${t.code}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.englishTitle.replace(/"/g, '""')}"`,
      `"${t.part}"`,
      `"${t.targetScore}"`,
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
        filterScore={filterScore}
        setFilterScore={setFilterScore}
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
