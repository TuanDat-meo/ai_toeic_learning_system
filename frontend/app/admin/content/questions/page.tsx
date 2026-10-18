"use client";

import React, { useState, useMemo, useRef } from "react";
import { QuestionItem, QuestionPart, QuestionDifficulty } from "./types";
import { INITIAL_QUESTIONS } from "./mockData";
import { QuestionFilterBar } from "@/components/admin/content/questions/QuestionFilterBar";
import { QuestionTableView } from "@/components/admin/content/questions/QuestionTableView";
import { QuestionCardGridView } from "@/components/admin/content/questions/QuestionCardGridView";
import { QuestionPreviewModal } from "@/components/admin/content/questions/QuestionPreviewModal";
import { QuestionEditModal } from "@/components/admin/content/questions/QuestionEditModal";
import { QuestionDeleteModal } from "@/components/admin/content/questions/QuestionDeleteModal";


export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Web Audio SFX
  const playSfx = (type?: "correct" | "wrong" | "click" | string) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(type === "click" ? 440 : 520, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  // Audio Speech Synthesis
  const playAudio = (text: string) => {
    if (!text?.trim()) return;
    if (text.startsWith("http://") || text.startsWith("https://")) {
      const audio = new Audio(text);
      audio.play().catch(() => {});
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportCsv = () => {
    const headers = ["Mã câu", "Phần thi", "Kỹ năng", "Độ khó", "Nội dung câu hỏi", "Đáp án đúng", "Trạng thái"];
    const rows = questions.map((q) => [
      `"${q.code || q.id}"`,
      `"${q.part}"`,
      `"${q.skill}"`,
      `"${q.difficulty}"`,
      `"${q.questionText.replace(/"/g, '""')}"`,
      `"${q.correctAnswer}"`,
      `"${q.status}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `toeic_question_bank_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất danh sách câu hỏi ra tệp CSV thành công! 📊");
  };

  const handleImportCsvClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          showToast("File CSV không có dữ liệu!");
          return;
        }
        let addedCount = 0;
        const importedQuestions: QuestionItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
          if (cols.length >= 5) {
            const code = cols[0] || `IMPORT-${Math.floor(100 + Math.random() * 900)}`;
            const part = (cols[1] || "Part 5") as QuestionPart;
            const skill = cols[2] || "Grammar";
            const difficulty = (cols[3] || "Medium") as QuestionDifficulty;
            const questionText = cols[4] || "";
            const correctAnswer = cols[5] || "A";
            const status = (cols[6] === "PUBLISHED" ? "PUBLISHED" : "DRAFT") as "PUBLISHED" | "DRAFT";

            if (questionText) {
              importedQuestions.push({
                id: `q-csv-${Date.now()}-${i}`,
                code,
                part,
                skill,
                difficulty,
                questionText,
                options: [
                  { id: "A", text: "Option A", isCorrect: correctAnswer === "A" },
                  { id: "B", text: "Option B", isCorrect: correctAnswer === "B" },
                  { id: "C", text: "Option C", isCorrect: correctAnswer === "C" },
                  { id: "D", text: "Option D", isCorrect: correctAnswer === "D" },
                ],
                correctAnswer,
                explanation: "Câu hỏi được nhập tự động từ tệp CSV.",
                status,
              });
              addedCount++;
            }
          }
        }
        if (addedCount > 0) {
          setQuestions((prev) => [...importedQuestions, ...prev]);
          showToast(`Đã nhập thành công ${addedCount} câu hỏi từ CSV! 🎉`);
        } else {
          showToast("Không tìm thấy dòng dữ liệu hợp lệ trong file CSV!");
        }
      } catch {
        showToast("Lỗi khi đọc file CSV, vui lòng kiểm tra định dạng!");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Hidden file input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCsvFileChange}
        accept=".csv"
        className="hidden"
      />

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
        onExportCsv={handleExportCsv}
        onImportCsvClick={handleImportCsvClick}
        playSfx={playSfx}
        showToast={showToast}
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
          playSfx={playSfx}
        />
      ) : (
        <QuestionCardGridView
          questions={filteredQuestions}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onPreview={openPreviewModal}
          onEdit={openEditModal}
          onDelete={(q) => setDeleteConfirmQuestion(q)}
          playSfx={playSfx}
        />
      )}

      {/* Preview Fullscreen Quiz Modal */}
      <QuestionPreviewModal
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        playSfx={playSfx}
        playAudio={playAudio}
        showToast={showToast}
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
