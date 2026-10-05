"use client";

import React, { useState, useMemo } from "react";
import { QuestionItem, QuestionPart, QuestionDifficulty } from "./types";
import { INITIAL_QUESTIONS } from "./mockData";
import { QuestionFilterBar } from "@/components/admin/content/questions-content/QuestionFilterBar";
import { QuestionTableView } from "@/components/admin/content/questions-content/QuestionTableView";
import { QuestionCardGridView } from "@/components/admin/content/questions-content/QuestionCardGridView";
import { QuestionPreviewModal } from "@/components/admin/content/questions-content/QuestionPreviewModal";
import { QuestionEditModal } from "@/components/admin/content/questions-content/QuestionEditModal";
import { QuestionDeleteModal } from "@/components/admin/content/questions-content/QuestionDeleteModal";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS);

  // Filters & Views
  const [selectedPart, setSelectedPart] = useState<QuestionPart | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<QuestionItem | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Computed Filtered List
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedPart !== "ALL" && q.part !== selectedPart) return false;
      if (selectedSkill && q.skill !== selectedSkill) return false;
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
      if (selectedStatus && q.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = q.questionText.toLowerCase().includes(query);
        const codeMatch = q.code?.toLowerCase().includes(query);
        const passageMatch = q.passage?.toLowerCase().includes(query);
        if (!textMatch && !codeMatch && !passageMatch) return false;
      }
      return true;
    });
  }, [questions, selectedPart, selectedSkill, selectedDifficulty, selectedStatus, searchQuery]);

  // Selection handlers
  const handleSelectAll = (selectAll: boolean) => {
    if (!selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Modals Actions
  const openAddModal = () => {
    setEditingQuestion(null);
    setEditModalOpen(true);
  };

  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setEditModalOpen(true);
  };

  const openPreviewModal = (q: QuestionItem) => {
    setPreviewQuestion(q);
  };

  const handleSaveModal = (formData: {
    part: QuestionPart;
    skill: string;
    difficulty: QuestionDifficulty;
    questionText: string;
    passage: string;
    imageUrl: string;
    audioUrl: string;
    optA: string;
    optB: string;
    optC: string;
    optD: string;
    correctAnswer: string;
    explanation: string;
    status: "PUBLISHED" | "DRAFT";
  }) => {
    const newOptions = [
      { id: "A", text: formData.optA, isCorrect: formData.correctAnswer === "A" },
      { id: "B", text: formData.optB, isCorrect: formData.correctAnswer === "B" },
      { id: "C", text: formData.optC, isCorrect: formData.correctAnswer === "C" },
      { id: "D", text: formData.optD, isCorrect: formData.correctAnswer === "D" },
    ].filter((o) => o.text.trim() !== "");

    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                part: formData.part,
                skill: formData.skill,
                difficulty: formData.difficulty,
                questionText: formData.questionText,
                passage: formData.passage || undefined,
                imageUrl: formData.imageUrl || undefined,
                audioUrl: formData.audioUrl || undefined,
                options: newOptions,
                correctAnswer: formData.correctAnswer,
                explanation: formData.explanation,
                status: formData.status,
              }
            : q
        )
      );
    } else {
      const newQuestion: QuestionItem = {
        id: `q-${Date.now()}`,
        code: `${formData.part.replace(" ", "")}-${Math.floor(100 + Math.random() * 900)}`,
        part: formData.part,
        questionText: formData.questionText,
        passage: formData.passage || undefined,
        imageUrl: formData.imageUrl || undefined,
        audioUrl: formData.audioUrl || undefined,
        options: newOptions,
        correctAnswer: formData.correctAnswer,
        skill: formData.skill,
        difficulty: formData.difficulty,
        explanation: formData.explanation,
        status: formData.status,
      };
      setQuestions((prev) => [newQuestion, ...prev]);
    }
    setEditModalOpen(false);
  };

  const confirmDeleteSingle = () => {
    if (!deleteConfirmQuestion) return;
    setQuestions((prev) => prev.filter((q) => q.id !== deleteConfirmQuestion.id));
    setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmQuestion.id));
    setDeleteConfirmQuestion(null);
  };

  const handleBulkDeleteConfirm = () => {
    setQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
    setSelectedIds([]);
    setBulkDeleteConfirm(false);
  };

  const handleGenerateAiHelp = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Filter Bar */}
      <QuestionFilterBar
        selectedPartTab={selectedPart}
        setSelectedPartTab={setSelectedPart}
        keyword={searchQuery}
        setKeyword={setSearchQuery}
        selectedSkill={selectedSkill}
        setSelectedSkill={setSelectedSkill}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCount={selectedIds.length}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
        onOpenCreateModal={openAddModal}
      />

      {/* Main Content View */}
      {viewMode === "table" ? (
        <QuestionTableView
          questions={filteredQuestions}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onPreview={openPreviewModal}
          onEdit={openEditModal}
          onDelete={(q) => setDeleteConfirmQuestion(q)}
        />
      ) : (
        <QuestionCardGridView
          questions={filteredQuestions}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onPreview={openPreviewModal}
          onEdit={openEditModal}
          onDelete={(q) => setDeleteConfirmQuestion(q)}
        />
      )}

      {/* Preview Fullscreen Quiz Modal */}
      <QuestionPreviewModal
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
      />

      {/* Add / Edit Question Modal */}
      <QuestionEditModal
        isOpen={editModalOpen}
        editingQuestion={editingQuestion}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveModal}
        aiGenerating={aiGenerating}
        onGenerateAiHelp={handleGenerateAiHelp}
      />

      {/* Delete Single & Bulk Confirmation Modals */}
      <QuestionDeleteModal
        deleteConfirmQuestion={deleteConfirmQuestion}
        bulkDeleteConfirm={bulkDeleteConfirm}
        selectedCount={selectedIds.length}
        onCloseSingle={() => setDeleteConfirmQuestion(null)}
        onConfirmSingle={confirmDeleteSingle}
        onCloseBulk={() => setBulkDeleteConfirm(false)}
        onConfirmBulk={handleBulkDeleteConfirm}
      />
    </div>
  );
}
