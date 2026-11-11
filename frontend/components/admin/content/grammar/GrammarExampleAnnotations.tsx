"use client";

import React, { useState } from "react";
import type { GrammarExampleAnnotation } from "@/app/admin/content/grammar/types";

const ANNOTATION_COLORS = [
  { value: "blue", label: "Xanh dương", className: "bg-blue-100 text-blue-950 ring-blue-300" },
  { value: "emerald", label: "Xanh lá", className: "bg-emerald-100 text-emerald-950 ring-emerald-300" },
  { value: "amber", label: "Vàng", className: "bg-amber-100 text-amber-950 ring-amber-300" },
  { value: "violet", label: "Tím", className: "bg-violet-100 text-violet-950 ring-violet-300" },
  { value: "rose", label: "Hồng", className: "bg-rose-100 text-rose-950 ring-rose-300" },
] as const;

const getAnnotationColor = (color?: string) =>
  ANNOTATION_COLORS.find((item) => item.value === color) || ANNOTATION_COLORS[0];

export const AnnotatedGrammarSentence: React.FC<{
  sentence: string;
  annotations?: GrammarExampleAnnotation[];
}> = ({ sentence, annotations = [] }) => {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const validAnnotations = annotations.filter((annotation) =>
    Number.isInteger(annotation.start)
    && Number.isInteger(annotation.end)
    && annotation.start >= 0
    && annotation.end <= sentence.length
    && annotation.end > annotation.start
    && sentence.slice(annotation.start, annotation.end) === annotation.selectedText,
  );
  const boundaries = [...new Set([
    0,
    sentence.length,
    ...validAnnotations.flatMap(({ start, end }) => [start, end]),
  ])].sort((left, right) => left - right);

  return (
    <span className="whitespace-pre-wrap">
      {boundaries.slice(0, -1).map((start, index) => {
        const end = boundaries[index + 1];
        const segment = sentence.slice(start, end);
        const covering = validAnnotations.filter((annotation) => annotation.start <= start && annotation.end >= end);
        if (!covering.length) return <React.Fragment key={`${start}-${end}`}>{segment}</React.Fragment>;

        const mostSpecific = [...covering].sort((left, right) =>
          (left.end - left.start) - (right.end - right.start),
        )[0];
        const color = getAnnotationColor(mostSpecific.color);
        const segmentKey = `${start}-${end}`;
        const description = covering.map((annotation) =>
          [annotation.label, annotation.explanation].filter(Boolean).join(" — "),
        ).filter(Boolean).join(" | ");

        return (
          <span
            key={segmentKey}
            role="button"
            tabIndex={0}
            title={description}
            aria-label={`${segment}: ${description}`}
            aria-expanded={activeSegment === segmentKey}
            onClick={() => setActiveSegment((previous) => previous === segmentKey ? null : segmentKey)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveSegment((previous) => previous === segmentKey ? null : segmentKey);
              }
            }}
            className={`relative cursor-help rounded-sm px-0.5 ring-1 ring-inset ${color.className} ${
              mostSpecific.kind === "highlight" ? "decoration-2 underline" : "decoration-2 underline decoration-dotted"
            }`}
          >
            {segment}
            {activeSegment === segmentKey ? (
              <span role="tooltip" className="absolute left-0 top-full z-20 mt-1 block min-w-48 max-w-72 rounded-lg border border-slate-200 bg-white p-2 text-left text-[11px] font-medium leading-relaxed text-slate-700 shadow-lg">
                {covering.map((annotation, annotationIndex) => (
                  <span key={`${annotation.start}-${annotation.end}-${annotationIndex}`} className="block">
                    <strong className="text-slate-900">{annotation.label}</strong>
                    {annotation.phraseType ? <span> · {annotation.phraseType}</span> : null}
                    {annotation.partOfSpeech && annotation.partOfSpeech !== annotation.label ? <span> · {annotation.partOfSpeech}</span> : null}
                    {annotation.number ? <span> · {annotation.number}</span> : null}
                    {annotation.countability ? <span> · {annotation.countability}</span> : null}
                    {annotation.role ? <span> · {annotation.role}</span> : null}
                    {annotation.explanation ? <span className="block">{annotation.explanation}</span> : null}
                  </span>
                ))}
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
};

interface GrammarExampleAnnotationsProps {
  sentence: string;
  annotations: GrammarExampleAnnotation[];
  sentenceError?: string;
  annotationError?: string;
  onSentenceChange: (sentence: string) => void;
  onAnnotationsChange: (annotations: GrammarExampleAnnotation[]) => void;
}

export const GrammarExampleAnnotations: React.FC<GrammarExampleAnnotationsProps> = ({
  sentence,
  annotations,
  sentenceError,
  annotationError,
  onSentenceChange,
  onAnnotationsChange,
}) => {
  const [selection, setSelection] = useState<{ start: number; end: number; selectedText: string } | null>(null);
  const [annotationKind, setAnnotationKind] = useState<GrammarExampleAnnotation["kind"] | null>(null);
  const [partOfSpeech, setPartOfSpeech] = useState("Danh từ");
  const [number, setNumber] = useState("Số ít");
  const [countability, setCountability] = useState("Đếm được");
  const [role, setRole] = useState("Không xác định");
  const [phraseType, setPhraseType] = useState("Cụm danh từ");
  const [color, setColor] = useState("blue");
  const [label, setLabel] = useState("");
  const [explanation, setExplanation] = useState("");
  const [editingAnnotationIndex, setEditingAnnotationIndex] = useState<number | null>(null);

  const closeAnnotationForm = () => {
    setAnnotationKind(null);
    setLabel("");
    setExplanation("");
    setEditingAnnotationIndex(null);
  };

  const saveAnnotation = () => {
    if (!selection || !annotationKind) return;
    const defaultLabel = annotationKind === "grammar"
      ? partOfSpeech === "Cụm từ" ? phraseType : partOfSpeech
      : annotationKind === "highlight" ? "Tô sáng" : "Ghi chú";
    const newAnnotation: GrammarExampleAnnotation = {
      ...selection,
      kind: annotationKind,
      label: label.trim() || defaultLabel,
      color,
      ...(annotationKind === "grammar" ? {
        partOfSpeech,
        number: partOfSpeech === "Danh từ" ? number : undefined,
        countability: partOfSpeech === "Danh từ" ? countability : undefined,
        role,
        phraseType: partOfSpeech === "Cụm từ" ? phraseType : undefined,
      } : {}),
      ...(explanation.trim() ? { explanation: explanation.trim() } : {}),
    };
    onAnnotationsChange(editingAnnotationIndex === null
      ? [...annotations, newAnnotation]
      : annotations.map((annotation, index) => index === editingAnnotationIndex ? newAnnotation : annotation));
    setSelection(null);
    closeAnnotationForm();
  };

  const editAnnotation = (annotation: GrammarExampleAnnotation, index: number) => {
    setSelection({
      start: annotation.start,
      end: annotation.end,
      selectedText: annotation.selectedText,
    });
    setAnnotationKind(annotation.kind);
    setPartOfSpeech(annotation.partOfSpeech || "Danh từ");
    setNumber(annotation.number || "Số ít");
    setCountability(annotation.countability || "Đếm được");
    setRole(annotation.role || "Không xác định");
    setPhraseType(annotation.phraseType || "Cụm danh từ");
    setColor(annotation.color || "blue");
    setLabel(annotation.label);
    setExplanation(annotation.explanation || "");
    setEditingAnnotationIndex(index);
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block font-bold text-slate-700">Câu tiếng Anh</span>
        <textarea
          rows={2}
          value={sentence}
          maxLength={1000}
          onSelect={(event) => {
            const { selectionStart, selectionEnd } = event.currentTarget;
            const rawText = sentence.slice(selectionStart, selectionEnd);
            const text = rawText.trim();
            const leadingWhitespace = rawText.length - rawText.trimStart().length;
            setSelection(text ? {
              start: selectionStart + leadingWhitespace,
              end: selectionStart + leadingWhitespace + text.length,
              selectedText: text,
            } : null);
            closeAnnotationForm();
          }}
          onChange={(event) => {
            if (annotations.length && !window.confirm("Sửa câu sẽ xóa các chú giải đang gắn với câu. Bạn có muốn tiếp tục không?")) {
              return;
            }
            onSentenceChange(event.target.value);
            onAnnotationsChange([]);
            setSelection(null);
            closeAnnotationForm();
          }}
          placeholder="Nhập câu tiếng Anh, sau đó bôi chọn từ hoặc cụm từ cần chú giải"
          aria-invalid={Boolean(sentenceError)}
          className={`w-full rounded-xl border bg-white p-2.5 ${sentenceError ? "border-rose-400 bg-rose-50/40" : "border-slate-200"}`}
        />
        {sentenceError ? <span role="alert" className="mt-1 block text-[11px] font-semibold text-rose-700">{sentenceError}</span> : null}
      </label>

      <p className="text-[11px] text-slate-500">
        Bôi chọn một từ hoặc cụm từ trong câu để thêm chú giải ngữ pháp, tô sáng hoặc ghi chú. Có thể chú giải cả từ và cụm bao quanh.
      </p>

      {selection ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3" aria-live="polite">
          <span className="mr-1 text-[11px] font-semibold text-blue-950">Đã chọn: “{selection.selectedText}”</span>
          <button type="button" disabled={annotations.length >= 100} onClick={() => setAnnotationKind("grammar")} className="rounded-lg bg-white px-3 py-1.5 font-bold text-blue-800 ring-1 ring-blue-200 hover:bg-blue-100 disabled:opacity-50">
            Chú giải ngữ pháp
          </button>
          <button type="button" disabled={annotations.length >= 100} onClick={() => setAnnotationKind("highlight")} className="rounded-lg bg-white px-3 py-1.5 font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 disabled:opacity-50">
            Tô sáng
          </button>
          <button type="button" disabled={annotations.length >= 100} onClick={() => setAnnotationKind("note")} className="rounded-lg bg-white px-3 py-1.5 font-bold text-violet-800 ring-1 ring-violet-200 hover:bg-violet-100 disabled:opacity-50">
            Thêm ghi chú
          </button>
          <button type="button" onClick={() => setSelection(null)} className="rounded-lg px-2 py-1.5 font-semibold text-slate-600 hover:bg-white">
            Bỏ chọn
          </button>
        </div>
      ) : null}

      {annotationKind ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-slate-900">
              {editingAnnotationIndex !== null ? "Chỉnh sửa chú giải" : annotationKind === "grammar" ? "Chú giải ngữ pháp" : annotationKind === "highlight" ? "Tô sáng đoạn chọn" : "Ghi chú cho đoạn chọn"}
            </h4>
            <button type="button" onClick={closeAnnotationForm} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Đóng</button>
          </div>

          <label className="block">
            <span className="mb-1 block font-semibold text-slate-700">Đoạn được áp dụng (tự điền từ vùng bôi chọn)</span>
            <input
              value={selection?.selectedText || ""}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-blue-200 bg-blue-50 p-2 font-semibold text-blue-950"
            />
          </label>

          {annotationKind === "grammar" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-semibold text-slate-700">Loại từ / cụm</span>
                <select value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                  {["Danh từ", "Động từ", "Tính từ", "Trạng từ", "Hạn định từ", "Mạo từ", "Đại từ", "Giới từ", "Liên từ", "Cụm từ", "Khác"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              {partOfSpeech === "Danh từ" ? (
                <>
                  <label className="block">
                    <span className="mb-1 block font-semibold text-slate-700">Số</span>
                    <select value={number} onChange={(event) => setNumber(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                      {["Số ít", "Số nhiều", "Không áp dụng"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-semibold text-slate-700">Khả năng đếm</span>
                    <select value={countability} onChange={(event) => setCountability(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                      {["Đếm được", "Không đếm được", "Chưa xác định"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </>
              ) : null}
              <label className="block">
                <span className="mb-1 block font-semibold text-slate-700">Chức năng trong câu</span>
                <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                  {["Không xác định", "Chủ ngữ", "Tân ngữ trực tiếp", "Tân ngữ của giới từ", "Bổ ngữ", "Từ hạn định trong cụm", "Từ bổ nghĩa", "Khác"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              {partOfSpeech === "Cụm từ" ? (
                <label className="block">
                  <span className="mb-1 block font-semibold text-slate-700">Loại cụm</span>
                  <select value={phraseType} onChange={(event) => setPhraseType(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                    {["Cụm danh từ", "Cụm động từ", "Cụm tính từ", "Cụm trạng từ", "Cụm giới từ"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}

          {annotationKind !== "grammar" ? (
            <label className="block">
              <span className="mb-1 block font-semibold text-slate-700">{annotationKind === "highlight" ? "Nhãn (không bắt buộc)" : "Tiêu đề ghi chú"}</span>
              <input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} placeholder={annotationKind === "highlight" ? "Ví dụ: Chủ điểm cần lưu ý" : "Ví dụ: Danh từ chính trong cụm"} className="w-full rounded-lg border border-slate-200 p-2" />
            </label>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-semibold text-slate-700">Màu đánh dấu</span>
              <select value={color} onChange={(event) => setColor(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2">
                {ANNOTATION_COLORS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold text-slate-700">Giải thích (không bắt buộc)</span>
              <input value={explanation} onChange={(event) => setExplanation(event.target.value)} maxLength={500} placeholder="Ví dụ: Danh từ chính của cụm danh từ làm chủ ngữ." className="w-full rounded-lg border border-slate-200 p-2" />
            </label>
          </div>
          <button type="button" onClick={saveAnnotation} className="rounded-lg bg-blue-700 px-3 py-2 font-bold text-white hover:bg-blue-800">
            Lưu chú giải
          </button>
        </div>
      ) : null}

      {annotations.length ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="font-bold text-slate-800">Xem trước câu đã đánh dấu</div>
          <p className="text-sm leading-7 text-slate-900"><AnnotatedGrammarSentence sentence={sentence} annotations={annotations} /></p>
          <ul className="space-y-1">
            {annotations.map((annotation, index) => (
              <li key={`${annotation.start}-${annotation.end}-${index}`} className="flex items-start justify-between gap-2 text-[11px]">
                <span>
                  <strong className="text-slate-900">{annotation.selectedText}</strong>
                  <span className="text-slate-600"> — {annotation.label}</span>
                  {annotation.phraseType ? <span className="text-slate-500"> · {annotation.phraseType}</span> : null}
                  {annotation.partOfSpeech && annotation.partOfSpeech !== annotation.label ? <span className="text-slate-500"> · {annotation.partOfSpeech}</span> : null}
                  {annotation.number ? <span className="text-slate-500"> · {annotation.number}</span> : null}
                  {annotation.countability ? <span className="text-slate-500"> · {annotation.countability}</span> : null}
                  {annotation.role ? <span className="text-slate-500"> · {annotation.role}</span> : null}
                  {annotation.explanation ? <span className="block text-slate-500">{annotation.explanation}</span> : null}
                </span>
                <span className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => editAnnotation(annotation, index)} className="font-semibold text-blue-700 hover:text-blue-800">
                    Sửa
                  </button>
                  <button type="button" onClick={() => onAnnotationsChange(annotations.filter((_, itemIndex) => itemIndex !== index))} className="font-semibold text-rose-600 hover:text-rose-700">
                    Xóa
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {annotationError ? <p role="alert" className="text-[11px] font-semibold text-rose-700">{annotationError}</p> : null}
    </div>
  );
};
