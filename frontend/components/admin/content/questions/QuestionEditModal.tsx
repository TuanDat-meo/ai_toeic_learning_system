"use client";

import React, { useState, useEffect } from "react";
import { FileQuestion, X } from "lucide-react";
import { QuestionItem, QuestionPart, QuestionDifficulty, QUESTION_DIFFICULTY_BANDS } from "@/app/admin/content/questions/types";
import { DEFAULT_SKILLS } from "@/app/admin/content/questions/constants";
import { uploadQuestionBankMedia } from "@/lib/api/questionBank";

interface QuestionEditModalProps {
  isOpen: boolean;
  editingQuestion: QuestionItem | null;
  onClose: () => void;
  onSave: (formData: {
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
  }) => void | Promise<void>;
  isSaving: boolean;
  availableSkills?: string[];
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  editingQuestion,
  onClose,
  onSave,
  isSaving,
  availableSkills = DEFAULT_SKILLS,
}) => {
  const [formPart, setFormPart] = useState<QuestionPart>("Part 5");
  const [formSkill, setFormSkill] = useState<string>(DEFAULT_SKILLS[0]);
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>("650-750");
  const [formQuestionText, setFormQuestionText] = useState("");
  const [formPassage, setFormPassage] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formOptA, setFormOptA] = useState("");
  const [formOptB, setFormOptB] = useState("");
  const [formOptC, setFormOptC] = useState("");
  const [formOptD, setFormOptD] = useState("");
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>("A");
  const [formExplanation, setFormExplanation] = useState("");
  const [formStatus, setFormStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingQuestion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormPart(editingQuestion.part);
      setFormSkill(editingQuestion.skill || DEFAULT_SKILLS[0]);
      setFormDifficulty(editingQuestion.difficulty || "650-750");
      setFormQuestionText(editingQuestion.questionText || "");
      setFormPassage(editingQuestion.passage || "");
      setFormImageUrl(editingQuestion.imageUrl || "");
      setFormAudioUrl(editingQuestion.audioUrl || "");
      setImageFile(null);
      setAudioFile(null);
      setFormOptA(editingQuestion.options?.find((option) => option.id === "A")?.text || "");
      setFormOptB(editingQuestion.options?.find((option) => option.id === "B")?.text || "");
      setFormOptC(editingQuestion.options?.find((option) => option.id === "C")?.text || "");
      setFormOptD(editingQuestion.options?.find((option) => option.id === "D")?.text || "");
      setFormCorrectAnswer(editingQuestion.correctAnswer || "A");
      setFormExplanation(editingQuestion.explanation || "");
      setFormStatus(editingQuestion.status || "PUBLISHED");
    } else {
      setFormPart("Part 5");
      setFormSkill(DEFAULT_SKILLS[0]);
      setFormDifficulty("650-750");
      setFormQuestionText("");
      setFormPassage("");
      setFormImageUrl("");
      setFormAudioUrl("");
      setImageFile(null);
      setAudioFile(null);
      setFormOptA("");
      setFormOptB("");
      setFormOptC("");
      setFormOptD("");
      setFormCorrectAnswer("A");
      setFormExplanation("");
      setFormStatus("PUBLISHED");
    }
    setSubmitted(false);
    setTouched({});
    setUploadErrors({});
  }, [editingQuestion, isOpen]);

  const getValidationErrors = () => {
    const errors: Record<string, string> = {};
    const requiredOptions = formPart === "Part 2" ? 3 : 4;
    const optionValues = [formOptA, formOptB, formOptC, formOptD];
    const optionIds = ["A", "B", "C", "D"];
    if (!formQuestionText.trim()) errors.questionText = "Vui lòng nhập nội dung câu hỏi.";
    if (!formSkill.trim()) errors.skill = "Vui lòng chọn kỹ năng đánh giá.";
    optionValues.slice(0, requiredOptions).forEach((value, index) => {
      if (!value.trim()) errors[`opt${optionIds[index]}`] = `Vui lòng nhập phương án ${optionIds[index]}.`;
    });
    if (!optionValues[optionIds.indexOf(formCorrectAnswer)]?.trim()) {
      errors.correctAnswer = "Đáp án đúng phải trỏ đến một phương án đã nhập.";
    }
    if (["Part 3", "Part 4", "Part 6", "Part 7"].includes(formPart) && !formPassage.trim()) {
      errors.passage = "Vui lòng nhập nội dung đoạn văn hoặc lời thoại.";
    }
    if (!formExplanation.trim()) errors.explanation = "Vui lòng nhập lời giải thích.";

    const validateMediaFile = (file: File | null, kind: "image" | "audio") => {
      if (!file) return undefined;
      const extension = file.name.split(".").pop()?.toLowerCase();
      const allowed = kind === "image" ? ["jpg", "jpeg", "png", "webp"] : ["mp3", "wav", "m4a"];
      const maxSize = kind === "image" ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
      if (!extension || !allowed.includes(extension)) {
        return kind === "image" ? "Chỉ nhận ảnh JPG, PNG hoặc WEBP." : "Chỉ nhận audio MP3, WAV hoặc M4A.";
      }
      if (file.size > maxSize) return kind === "image" ? "Ảnh không được vượt quá 10 MB." : "Audio không được vượt quá 25 MB.";
      if (file.size === 0) return "File đang trống. Vui lòng chọn file khác.";
      return undefined;
    };

    const imageError = validateMediaFile(imageFile, "image");
    if (imageError) errors.imageFile = imageError;
    if (formPart === "Part 1" && !imageFile && !formImageUrl.trim()) {
      errors.imageFile = "Part 1 cần có ảnh. Vui lòng tải ảnh lên.";
    }
    const audioError = validateMediaFile(audioFile, "audio");
    if (audioError) errors.audioFile = audioError;
    if (["Part 1", "Part 2", "Part 3", "Part 4"].includes(formPart) && !audioFile && !formAudioUrl.trim()) {
      errors.audioFile = `Part ${formPart.slice(-1)} cần có audio. Vui lòng tải file lên.`;
    }
    return errors;
  };

  const validationErrors = getValidationErrors();
  const fieldError = (name: string) =>
    (submitted || touched[name] ? validationErrors[name] : undefined) || uploadErrors[name];
  const errorText = (name: string) => {
    const message = fieldError(name);
    return message ? <p id={`${name}-error`} className="text-[11px] font-medium text-red-600" role="alert">{message}</p> : null;
  };
  const touch = (name: string) => setTouched((current) => ({ ...current, [name]: true }));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setUploadErrors({});
    if (Object.keys(validationErrors).length > 0) return;
    setIsUploading(true);
    try {
      let imageUrl = formPart === "Part 1" ? formImageUrl.trim() : "";
      let audioUrl = ["Part 1", "Part 2", "Part 3", "Part 4"].includes(formPart) ? formAudioUrl.trim() : "";
      if (imageFile) {
        try {
          imageUrl = (await uploadQuestionBankMedia(imageFile)).url;
          setFormImageUrl(imageUrl);
          setImageFile(null);
        } catch (error) {
          setUploadErrors({ imageFile: error instanceof Error ? error.message : "Không tải được ảnh lên." });
          return;
        }
      }
      if (audioFile) {
        try {
          audioUrl = (await uploadQuestionBankMedia(audioFile)).url;
          setFormAudioUrl(audioUrl);
          setAudioFile(null);
        } catch (error) {
          setUploadErrors({ audioFile: error instanceof Error ? error.message : "Không tải được audio lên." });
          return;
        }
      }
      await onSave({
        part: formPart,
        skill: formSkill.trim(),
        difficulty: formDifficulty,
        questionText: formQuestionText.trim(),
        passage: formPassage.trim(),
        imageUrl,
        audioUrl,
        optA: formOptA.trim(),
        optB: formOptB.trim(),
        optC: formOptC.trim(),
        optD: formPart === "Part 2" ? "" : formOptD.trim(),
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation.trim(),
        status: formStatus,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {editingQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới Vào Ngân Hàng"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isUploading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phần thi (Part) *</label>
              <select
                value={formPart}
                onChange={(e) => {
                  const nextPart = e.target.value as QuestionPart;
                  setFormPart(nextPart);
                  if (nextPart !== "Part 1") setImageFile(null);
                  if (!["Part 1", "Part 2", "Part 3", "Part 4"].includes(nextPart)) setAudioFile(null);
                  if (nextPart === "Part 2") setFormOptD("");
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="Part 1">Part 1 (Hình ảnh)</option>
                <option value="Part 2">Part 2 (Hỏi đáp)</option>
                <option value="Part 3">Part 3 (Hội thoại)</option>
                <option value="Part 4">Part 4 (Bài nói)</option>
                <option value="Part 5">Part 5 (Câu đơn)</option>
                <option value="Part 6">Part 6 (Điền đoạn)</option>
                <option value="Part 7">Part 7 (Đoạn văn)</option>
                <option value="Grammar">Grammar (Ngữ pháp)</option>
                <option value="Vocabulary">Vocabulary (Từ vựng)</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700">Kỹ năng đánh giá</label>
              <select
                value={formSkill}
                onChange={(e) => setFormSkill(e.target.value)}
                onBlur={() => touch("skill")}
                aria-invalid={Boolean(fieldError("skill"))}
                aria-describedby={fieldError("skill") ? "skill-error" : undefined}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer ${fieldError("skill") ? "border-red-500" : "border-slate-200"}`}
              >
                {availableSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errorText("skill")}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Độ khó</label>
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                {QUESTION_DIFFICULTY_BANDS.map((band) => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngữ cảnh hoặc đoạn văn (nếu là Part 3, 4, 6, 7) */}
          {(formPart === "Part 3" || formPart === "Part 4" || formPart === "Part 6" || formPart === "Part 7") && (
            <div className="space-y-1">
                <label className="font-bold text-slate-700">Đoạn văn / Bài đọc / Lời thoại (Passage) *</label>
              <textarea
                rows={3}
                placeholder="Nhập nội dung đoạn văn hoặc bối cảnh trích dẫn..."
                value={formPassage}
                onChange={(e) => setFormPassage(e.target.value)}
                  onBlur={() => touch("passage")}
                  aria-invalid={Boolean(fieldError("passage"))}
                  aria-describedby={fieldError("passage") ? "passage-error" : undefined}
                  className={`w-full bg-slate-50 border rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 ${fieldError("passage") ? "border-red-500" : "border-slate-200"}`}
              />
                {errorText("passage")}
            </div>
          )}

          {/* Upload ảnh/audio trực tiếp thay vì nhập URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {formPart === "Part 1" && <div className="space-y-1">
              <label className="font-bold text-slate-700" htmlFor="question-image-file">Ảnh câu hỏi *</label>
              <input
                id="question-image-file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); touch("imageFile"); setUploadErrors({}); }}
                onBlur={() => touch("imageFile")}
                aria-invalid={Boolean(fieldError("imageFile"))}
                aria-describedby={fieldError("imageFile") ? "imageFile-error" : undefined}
                className={`w-full rounded-xl border bg-white px-3 py-2 text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 ${fieldError("imageFile") ? "border-red-500" : "border-slate-200"}`}
              />
              <p className="text-[11px] text-slate-500">JPG, PNG hoặc WEBP · tối đa 10 MB</p>
              {imageFile && <p className="text-[11px] text-slate-600">Đã chọn: {imageFile.name}</p>}
              {!imageFile && formImageUrl && <p className="text-[11px] text-slate-600">Đang dùng ảnh hiện tại. Chọn file mới để thay thế.</p>}
              {errorText("imageFile")}
            </div>}
            {(["Part 1", "Part 2", "Part 3", "Part 4"].includes(formPart)) && <div className="space-y-1">
              <label className="font-bold text-slate-700" htmlFor="question-audio-file">Audio câu hỏi *</label>
              <input
                id="question-audio-file"
                type="file"
                accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
                onChange={(e) => { setAudioFile(e.target.files?.[0] ?? null); touch("audioFile"); setUploadErrors({}); }}
                onBlur={() => touch("audioFile")}
                aria-invalid={Boolean(fieldError("audioFile"))}
                aria-describedby={fieldError("audioFile") ? "audioFile-error" : undefined}
                className={`w-full rounded-xl border bg-white px-3 py-2 text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 ${fieldError("audioFile") ? "border-red-500" : "border-slate-200"}`}
              />
              <p className="text-[11px] text-slate-500">MP3, WAV hoặc M4A · tối đa 25 MB</p>
              {audioFile && <p className="text-[11px] text-slate-600">Đã chọn: {audioFile.name}</p>}
              {!audioFile && formAudioUrl && <p className="text-[11px] text-slate-600">Đang dùng audio hiện tại. Chọn file mới để thay thế.</p>}
              {errorText("audioFile")}
            </div>}
          </div>

          {/* Nội dung câu hỏi */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Nội dung câu hỏi *</label>
            <textarea
              rows={2}
              placeholder="ví dụ: Look at the photograph and choose the statement... hoặc All members must submit..."
              value={formQuestionText}
              onChange={(e) => setFormQuestionText(e.target.value)}
              onBlur={() => touch("questionText")}
              aria-invalid={Boolean(fieldError("questionText"))}
              aria-describedby={fieldError("questionText") ? "questionText-error" : undefined}
              className={`w-full bg-slate-50 border rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 ${fieldError("questionText") ? "border-red-500" : "border-slate-200"}`}
            />
            {errorText("questionText")}
          </div>

          {/* 4 Phương án A, B, C, D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
                <label className="font-bold text-slate-500">Phương án A *</label>
              <input
                type="text"
                value={formOptA}
                onChange={(e) => setFormOptA(e.target.value)}
                  onBlur={() => touch("optA")}
                  aria-invalid={Boolean(fieldError("optA"))}
                  aria-describedby={fieldError("optA") ? "optA-error" : undefined}
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 ${fieldError("optA") ? "border-red-500" : "border-slate-200"}`}
              />
                {errorText("optA")}
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Phương án B *</label>
              <input
                type="text"
                value={formOptB}
                onChange={(e) => setFormOptB(e.target.value)}
                  onBlur={() => touch("optB")}
                  aria-invalid={Boolean(fieldError("optB"))}
                  aria-describedby={fieldError("optB") ? "optB-error" : undefined}
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 ${fieldError("optB") ? "border-red-500" : "border-slate-200"}`}
              />
                {errorText("optB")}
            </div>
            <div className="space-y-1">
                <label className="font-bold text-slate-500">Phương án C{formPart === "Part 2" ? " *" : ""}</label>
              <input
                type="text"
                value={formOptC}
                onChange={(e) => setFormOptC(e.target.value)}
                  onBlur={() => touch("optC")}
                  aria-invalid={Boolean(fieldError("optC"))}
                  aria-describedby={fieldError("optC") ? "optC-error" : undefined}
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 ${fieldError("optC") ? "border-red-500" : "border-slate-200"}`}
              />
                {errorText("optC")}
            </div>
            {formPart !== "Part 2" && <div className="space-y-1">
                <label className="font-bold text-slate-500">Phương án D *</label>
              <input
                type="text"
                value={formOptD}
                onChange={(e) => setFormOptD(e.target.value)}
                  onBlur={() => touch("optD")}
                  aria-invalid={Boolean(fieldError("optD"))}
                  aria-describedby={fieldError("optD") ? "optD-error" : undefined}
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 ${fieldError("optD") ? "border-red-500" : "border-slate-200"}`}
              />
                {errorText("optD")}
            </div>}
          </div>

          {/* Lựa chọn đáp án đúng */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Đáp án chính xác *</label>
            <div className="flex gap-3">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formCorrectAnswer === opt
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="formCorrectAnswer"
                    value={opt}
                    checked={formCorrectAnswer === opt}
                    onChange={() => setFormCorrectAnswer(opt)}
                    className="hidden"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {errorText("correctAnswer")}
          </div>

          {/* Lời giải thích & Nút AI Generate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Lời giải thích chi tiết *</label>
            </div>
            <textarea
              rows={2}
              placeholder="Giải thích ngữ pháp, từ vựng và lý do chọn đáp án..."
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              onBlur={() => touch("explanation")}
              aria-invalid={Boolean(fieldError("explanation"))}
              aria-describedby={fieldError("explanation") ? "explanation-error" : undefined}
              className={`w-full bg-slate-50 border rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 ${fieldError("explanation") ? "border-red-500" : "border-slate-200"}`}
            />
            {errorText("explanation")}
          </div>

          {/* Trạng thái xuất bản */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Trạng thái câu hỏi</label>
            <div className="flex gap-3">
              <label
                className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                  formStatus === "PUBLISHED"
                    ? "bg-blue-50 border-blue-500 text-blue-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="formStatus"
                  value="PUBLISHED"
                  checked={formStatus === "PUBLISHED"}
                  onChange={() => setFormStatus("PUBLISHED")}
                  className="hidden"
                />
                Xuất bản ngay
              </label>
              <label
                className={`flex-1 p-2 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                  formStatus === "DRAFT"
                    ? "bg-amber-50 border-amber-500 text-amber-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="formStatus"
                  value="DRAFT"
                  checked={formStatus === "DRAFT"}
                  onChange={() => setFormStatus("DRAFT")}
                  className="hidden"
                />
                Lưu bản nháp
              </label>
            </div>
          </div>

          {/* Form Footer */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
            >
              {isUploading ? "Đang tải file lên…" : editingQuestion ? "Cập nhật câu hỏi" : "Lưu vào ngân hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
