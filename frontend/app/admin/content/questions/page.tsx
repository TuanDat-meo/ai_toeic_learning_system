"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionItem, QuestionPart, QuestionDifficulty } from "./types";
import { QuestionFilterBar } from "@/components/admin/content/questions/QuestionFilterBar";
import { QuestionTableView } from "@/components/admin/content/questions/QuestionTableView";
import { QuestionCardGridView } from "@/components/admin/content/questions/QuestionCardGridView";
import { QuestionPreviewModal } from "@/components/admin/content/questions/QuestionPreviewModal";
import { QuestionEditModal } from "@/components/admin/content/questions/QuestionEditModal";
import { QuestionDeleteModal } from "@/components/admin/content/questions/QuestionDeleteModal";
import { exportToExcel } from "@/lib/exportExcel";
import { playUnifiedAnswerSound } from "@/lib/sound";
import {
  createQuestionBankQuestion,
  deleteQuestionBankQuestion,
  deleteQuestionBankQuestions,
  getQuestionBankQuestions,
  updateQuestionBankQuestion,
  type QuestionBankWrite,
} from "@/lib/api/questionBank";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && text[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      setQuestions(await getQuestionBankQuestions());
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải ngân hàng câu hỏi.";
      setLoadError(message);
      showToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let active = true;
    getQuestionBankQuestions()
      .then((result) => {
        if (active) {
          setQuestions(result);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const message = error instanceof Error ? error.message : "Không thể tải ngân hàng câu hỏi.";
          setLoadError(message);
          showToast(message);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showToast]);

  // Web Audio SFX
  const playSfx = (type?: string) => {
    void type;
    playUnifiedAnswerSound();
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

  const handleSaveModal = async (formData: {
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
    const request: QuestionBankWrite = {
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
    };
    setIsSaving(true);
    try {
      if (editingQuestion) {
        const updated = await updateQuestionBankQuestion(editingQuestion.id, request);
        setQuestions((current) => current.map((question) => question.id === updated.id ? updated : question));
        setLoadError(null);
        showToast("Đã lưu thay đổi câu hỏi.");
      } else {
        const created = await createQuestionBankQuestion(request);
        setQuestions((current) => [created, ...current]);
        setLoadError(null);
        showToast("Đã thêm câu hỏi vào ngân hàng.");
      }
      setEditModalOpen(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu câu hỏi.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteSingle = async () => {
    if (!deleteConfirmQuestion) return;
    try {
      await deleteQuestionBankQuestion(deleteConfirmQuestion.id);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteConfirmQuestion.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmQuestion.id));
      setDeleteConfirmQuestion(null);
      showToast("Đã xóa câu hỏi.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa câu hỏi.");
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const result = await deleteQuestionBankQuestions(selectedIds);
      setQuestions((prev) => prev.filter((q) => !selectedIds.includes(q.id)));
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
      showToast(`Đã xóa ${result.deletedCount} câu hỏi.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể xóa các câu hỏi đã chọn.");
    }
  };

  const handleExportCsv = () => {
    const dataToExport = questions.map((q, index) => {
      const optA = q.options?.find(o => o.id === "A")?.text || "";
      const optB = q.options?.find(o => o.id === "B")?.text || "";
      const optC = q.options?.find(o => o.id === "C")?.text || "";
      const optD = q.options?.find(o => o.id === "D")?.text || "";

      return {
        stt: index + 1,
        code: q.code || `Q-${q.id}`,
        part: q.part,
        skill: q.skill,
        difficulty: q.difficulty,
        questionText: q.questionText,
        optA,
        optB,
        optC,
        optD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
        status: q.status || "PUBLISHED",
      };
    });

    exportToExcel({
      filename: `ngan_hang_cau_hoi_toeic_${new Date().toISOString().slice(0, 10)}`,
      sheetName: "Ngân hàng câu hỏi",
      title: "NGÂN HÀNG CÂU HỎI LUYỆN THI TOEIC CHUẨN ETS",
      metadata: [
        { label: "Ngày xuất báo cáo", value: new Date().toLocaleDateString("vi-VN") },
        { label: "Tổng số câu hỏi", value: questions.length },
      ],
      columns: [
        { header: "STT", key: "stt", width: 50, align: "center" },
        { header: "Mã câu", key: "code", width: 90, align: "center" },
        { header: "Phần thi", key: "part", width: 80, align: "center" },
        { header: "Kỹ năng", key: "skill", width: 90, align: "center" },
        { header: "Độ khó", key: "difficulty", width: 80, align: "center" },
        { header: "Nội dung câu hỏi", key: "questionText", width: 280, align: "left" },
        { header: "Lựa chọn A", key: "optA", width: 160, align: "left" },
        { header: "Lựa chọn B", key: "optB", width: 160, align: "left" },
        { header: "Lựa chọn C", key: "optC", width: 160, align: "left" },
        { header: "Lựa chọn D", key: "optD", width: 160, align: "left" },
        { header: "Đáp án đúng", key: "correctAnswer", width: 90, align: "center" },
        { header: "Lời giải & Phân tích bẫy", key: "explanation", width: 280, align: "left" },
        { header: "Trạng thái", key: "status", width: 100, align: "center" },
      ],
      data: dataToExport,
    });
    showToast("Đã xuất ngân hàng câu hỏi ra file Excel (.xls) có cấu trúc cột rõ ràng! 📊");
  };

  const handleImportCsvClick = () => {
    fileInputRef.current?.click();
  };

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    let addedCount = 0;
    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new Error("File CSV không có dòng dữ liệu.");
      const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase());
      const column = (...names: string[]) => headers.findIndex((header) => names.includes(header));
      const requiredColumns = {
        part: column("part", "phần thi"),
        skill: column("skill", "kỹ năng"),
        difficulty: column("difficulty", "độ khó"),
        questionText: column("questiontext", "question text", "nội dung câu hỏi"),
        optA: column("opta", "option a", "lựa chọn a"),
        optB: column("optb", "option b", "lựa chọn b"),
        correctAnswer: column("correctanswer", "correct answer", "đáp án đúng"),
      };
      if (Object.values(requiredColumns).some((index) => index < 0)) {
        throw new Error("CSV cần các cột Part, Skill, Difficulty, QuestionText, OptA, OptB và CorrectAnswer.");
      }

      const optionalColumn = (name: string, alternate: string) => column(name, alternate);
      const codeColumn = optionalColumn("code", "mã câu");
      const optCColumn = column("optc", "option c", "lựa chọn c");
      const optDColumn = column("optd", "option d", "lựa chọn d");
      const explanationColumn = column("explanation", "giải thích");
      const statusColumn = column("status", "trạng thái");
      const passageColumn = column("passage", "đoạn văn");
      const imageColumn = column("imageurl", "image url");
      const audioColumn = column("audiourl", "audio url");
      const imported: QuestionBankWrite[] = rows.slice(1).map((cells, index) => {
        const get = (columnIndex: number) => columnIndex < 0 ? "" : (cells[columnIndex] ?? "").trim();
        const part = get(requiredColumns.part) as QuestionPart;
        const difficulty = get(requiredColumns.difficulty) as QuestionDifficulty;
        const status = (get(statusColumn) || "DRAFT").toUpperCase();
        const correctAnswer = get(requiredColumns.correctAnswer).toUpperCase();
        if (!/^Part [1-7]$/.test(part) || !["Easy", "Medium", "Hard"].includes(difficulty)
          || !["DRAFT", "PUBLISHED"].includes(status)) {
          throw new Error(`Dòng ${index + 2}: phần thi, độ khó hoặc trạng thái không hợp lệ.`);
        }
        const options = [
          { id: "A", text: get(requiredColumns.optA), isCorrect: correctAnswer === "A" },
          { id: "B", text: get(requiredColumns.optB), isCorrect: correctAnswer === "B" },
          { id: "C", text: get(optCColumn), isCorrect: correctAnswer === "C" },
          { id: "D", text: get(optDColumn), isCorrect: correctAnswer === "D" },
        ].filter((option) => option.text !== "");
        if (!get(requiredColumns.questionText) || !options.some((option) => option.id === correctAnswer)) {
          throw new Error(`Dòng ${index + 2}: câu hỏi, đáp án đúng và nội dung phương án phải hợp lệ.`);
        }
        return {
          code: get(codeColumn) || undefined,
          part,
          skill: get(requiredColumns.skill),
          difficulty,
          questionText: get(requiredColumns.questionText),
          passage: get(passageColumn) || undefined,
          imageUrl: get(imageColumn) || undefined,
          audioUrl: get(audioColumn) || undefined,
          options,
          correctAnswer,
          explanation: get(explanationColumn),
          status: status as "PUBLISHED" | "DRAFT",
        };
      });

      for (const question of imported) {
        await createQuestionBankQuestion(question);
        addedCount += 1;
      }
      await loadQuestions();
      showToast(`Đã nhập ${addedCount} câu hỏi vào ngân hàng.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi khi đọc hoặc lưu tệp CSV.";
      if (addedCount > 0) {
        await loadQuestions();
        showToast(`Đã lưu ${addedCount} câu hỏi trước khi gặp lỗi: ${message}`);
      } else {
        showToast(message);
      }
    }
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

      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Đang tải ngân hàng câu hỏi...
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-sm font-semibold text-rose-800">{loadError}</p>
          <button type="button" onClick={() => { setIsLoading(true); void loadQuestions(); }} className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
            Thử tải lại
          </button>
        </div>
      ) : viewMode === "table" ? (
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
        isSaving={isSaving}
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
