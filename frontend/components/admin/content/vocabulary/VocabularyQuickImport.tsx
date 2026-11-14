"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
} from "lucide-react";
import type { VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import { addVocabularyWordsBulk } from "@/lib/api/vocabulary";
import { parseVocabularyQuickImportFile } from "@/lib/api/content-import";
import { normalizeVocabularyPartOfSpeech } from "@/lib/vocabulary-part-of-speech";

type VocabularyField =
  | "word"
  | "meaning"
  | "partOfSpeech"
  | "ipa"
  | "example"
  | "exampleMeaning"
  | "level"
  | "audioUrl"
  | "wordFamily";

type ImportRow = Record<string, string>;
type ImportStep = "source" | "mapping" | "preview";

const fieldOptions: Array<{ value: VocabularyField; label: string }> = [
  { value: "word", label: "Từ tiếng Anh" },
  { value: "meaning", label: "Nghĩa tiếng Việt" },
  { value: "partOfSpeech", label: "Từ loại" },
  { value: "ipa", label: "Phiên âm IPA" },
  { value: "example", label: "Câu ví dụ tiếng Anh" },
  { value: "exampleMeaning", label: "Dịch câu ví dụ" },
  { value: "level", label: "Cấp độ CEFR" },
  { value: "audioUrl", label: "Link audio" },
  { value: "wordFamily", label: "Họ từ" },
];

const ignoredField = "__ignore__";

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function inferField(header: string): VocabularyField | undefined {
  const key = normalizeHeader(header);
  const aliases: Record<VocabularyField, string[]> = {
    word: ["word", "englishword", "english", "term", "tuvung", "tuvungtienganh", "tu", "tuanh", "vocabulary"],
    meaning: ["meaning", "meaningvi", "vietnamese", "translation", "nghia", "nghiatiengviet", "dich", "definition"],
    partOfSpeech: ["pos", "partofspeech", "typeofword", "tuloai", "loaitu"],
    ipa: ["ipa", "phonetic", "pronunciation", "phienam"],
    example: ["example", "exampleen", "sentence", "exampleenglish", "cauvidu"],
    exampleMeaning: ["examplevi", "exampletranslation", "sentencevi", "dichvidu"],
    level: ["level", "cefr", "cefrlevel", "capdo"],
    audioUrl: ["audiourl", "audio", "linkaudio", "audiolink"],
    wordFamily: ["wordfamily", "family", "hofrom"],
  };
  return fieldOptions.find(({ value }) => aliases[value].includes(key))?.value;
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function parsePastedRows(text: string): { rows: ImportRow[]; columns: string[]; hasHeader: boolean } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { rows: [], columns: [], hasHeader: false };
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t"
    : firstLine.includes("|") ? "|"
      : firstLine.includes(";") ? ";"
        : firstLine.includes(",") ? ","
          : firstLine.includes(":") ? ":"
          : "";
  const values = delimiter ? lines.map((line) => splitDelimitedLine(line, delimiter)) : lines.map((line) => [line.trim()]);
  const headerCells = values[0] ?? [];
  const hasHeader = headerCells.some((cell) => inferField(cell) !== undefined);
  const columns = hasHeader
    ? headerCells.map((cell, index) => cell.trim() || `Cột ${index + 1}`)
    : (values.reduce((max, row) => Math.max(max, row.length), 0) > 1
      ? Array.from({ length: values.reduce((max, row) => Math.max(max, row.length), 0) }, (_, index) => `Cột ${index + 1}`)
      : ["Từ vựng"]);
  const bodyRows = hasHeader ? values.slice(1) : values;
  const rows = bodyRows.map((valuesInRow) => Object.fromEntries(
    columns.map((column, index) => [column, valuesInRow[index] ?? ""]),
  ));
  return { rows, columns, hasHeader };
}

function getDefaultMapping(columns: string[], hasHeader: boolean): Record<string, string> {
  const positionalFields: VocabularyField[] = [
    "word", "meaning", "partOfSpeech", "ipa", "example", "exampleMeaning", "level", "audioUrl", "wordFamily",
  ];
  return Object.fromEntries(columns.map((column, index) => [
    column,
    (hasHeader ? inferField(column) : positionalFields[index]) ?? "",
  ]));
}

function rowIsEmpty(row: ImportRow): boolean {
  return Object.values(row).every((value) => !value.trim());
}

function mappedRow(row: ImportRow, mapping: Record<string, string>): Partial<Record<VocabularyField, string>> {
  const result: Partial<Record<VocabularyField, string>> = {};
  for (const [column, field] of Object.entries(mapping)) {
    if (!field || field === ignoredField || result[field as VocabularyField]) continue;
    const value = row[column]?.trim();
    if (value) result[field as VocabularyField] = value;
  }
  return result;
}

interface VocabularyQuickImportProps {
  sets: VocabularyTestSet[];
  onImported: () => void;
}

export function VocabularyQuickImport({ sets, onImported }: VocabularyQuickImportProps) {
  const [activeSourceTab, setActiveSourceTab] = useState<"paste" | "file">("paste");
  const [step, setStep] = useState<ImportStep>("source");
  const [text, setText] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [targetSetId, setTargetSetId] = useState(sets[0]?.id ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nonEmptyRows = useMemo(() => rows.filter((row) => !rowIsEmpty(row)), [rows]);
  const previewRows = useMemo(
    () => nonEmptyRows.map((row) => mappedRow(row, mapping)),
    [nonEmptyRows, mapping],
  );
  const invalidRows = useMemo(
    () => previewRows.flatMap((row, index) => !row.word || !row.meaning ? [index + 1] : []),
    [previewRows],
  );
  const unmappedColumns = columns.filter((column) => !mapping[column]);

  function loadRows(nextRows: ImportRow[], nextColumns: string[], hasHeader: boolean) {
    if (!nextRows.length) {
      setError("Không tìm thấy dòng dữ liệu trong nội dung đã nhập.");
      return;
    }
    setRows(nextRows);
    setColumns(nextColumns);
    setMapping(getDefaultMapping(nextColumns, hasHeader));
    setError("");
    setNotice("");
    setStep("mapping");
  }

  function parseText() {
    const parsed = parsePastedRows(text);
    loadRows(parsed.rows, parsed.columns, parsed.hasHeader);
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "txt" || extension === "csv") {
        const parsed = parsePastedRows(await file.text());
        loadRows(parsed.rows, parsed.columns, parsed.hasHeader);
      } else if (extension === "xlsx" || extension === "xls") {
        const parsed = await parseVocabularyQuickImportFile(file);
        const parsedRows = parsed.map(({ data }) =>
          Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value ?? "")])),
        );
        const parsedColumns = [...new Set(parsedRows.flatMap((row) => Object.keys(row)))];
        loadRows(parsedRows, parsedColumns, true);
      } else if (extension === "doc" || extension === "docx") {
        const parsed = await parseVocabularyQuickImportFile(file);
        const extractedText = parsed[0]?.data.extractedText;
        if (typeof extractedText !== "string" || !extractedText.trim()) {
          setError("Không trích xuất được nội dung từ file Word.");
          return;
        }
        const extracted = parsePastedRows(extractedText);
        loadRows(extracted.rows, extracted.columns, extracted.hasHeader);
      } else {
        setError("Chỉ hỗ trợ file .txt, .csv, .xls, .xlsx, .doc hoặc .docx.");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không đọc được file. Vui lòng kiểm tra định dạng.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function importWords() {
    if (!targetSetId) {
      setError("Hãy chọn bộ từ vựng cần thêm dữ liệu.");
      return;
    }
    if (unmappedColumns.length) {
      setError(`Hãy chọn trường hoặc bỏ qua các cột chưa nhận diện: ${unmappedColumns.join(", ")}.`);
      return;
    }
    if (invalidRows.length) {
      setError(`Cần gán đủ cột từ tiếng Anh và nghĩa tiếng Việt. Dòng thiếu: ${invalidRows.slice(0, 10).join(", ")}${invalidRows.length > 10 ? "…" : ""}.`);
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await addVocabularyWordsBulk(targetSetId, previewRows.map((word) => ({
        word: word.word!,
        meaning: word.meaning!,
        partOfSpeech: normalizeVocabularyPartOfSpeech(word.partOfSpeech || "Noun"),
        ipa: word.ipa,
        example: word.example,
        exampleMeaning: word.exampleMeaning,
        level: word.level || "B1",
        audioUrl: word.audioUrl,
        wordFamily: word.wordFamily,
      })));
      onImported();
      setNotice(`Đã thêm ${previewRows.length} từ vào bộ "${sets.find((set) => set.id === targetSetId)?.title || "đã chọn"}". Từ thiếu audio sẽ dùng phát âm tự động.`);
      setStep("source");
      setText("");
      setRows([]);
      setColumns([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể lưu dữ liệu nhập nhanh.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5 animate-in fade-in duration-150">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Nhập nhanh · Từ vựng</p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Thêm nhiều từ cùng lúc</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
          Dán danh sách hoặc tải file TXT, Word, CSV, Excel. Hệ thống tự nhận diện cột; bạn có thể gán lại cột lạ trước khi lưu.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="mb-5 grid gap-2 sm:grid-cols-2" role="tablist" aria-label="Nguồn nhập từ vựng">
          <button
            type="button"
            role="tab"
            aria-selected={activeSourceTab === "paste"}
            onClick={() => { setActiveSourceTab("paste"); setStep("source"); setError(""); }}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
              activeSourceTab === "paste" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ClipboardPaste className="h-4 w-4" /> Dán text từ vựng
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSourceTab === "file"}
            onClick={() => { setActiveSourceTab("file"); setStep("source"); setError(""); }}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
              activeSourceTab === "file" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" /> Tải TXT / Word / CSV / Excel
          </button>
        </div>

        <label className="mb-5 block max-w-xl">
          <span className="mb-1.5 block text-xs font-bold text-slate-700">Thêm vào bộ từ vựng</span>
          <select
            value={targetSetId}
            onChange={(event) => setTargetSetId(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Chọn bộ từ vựng</option>
            {sets.map((set) => <option key={set.id} value={set.id}>{set.title || set.nameVi || set.id}</option>)}
          </select>
        </label>

        {step === "source" && activeSourceTab === "paste" ? (
          <div className="space-y-3">
            <label htmlFor="vocabulary-quick-import-text" className="block text-xs font-bold text-slate-700">
              Dán dữ liệu (mỗi dòng một từ; phân tách cột bằng tab, dấu |, dấu phẩy hoặc dấu chấm phẩy)
            </label>
            <textarea
              id="vocabulary-quick-import-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={9}
              placeholder={"word\tmeaning\tpos\tipa\texample\nschedule\tlịch trình\tnoun\t/ˈskedʒuːl/\tCheck the schedule."}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            />
            <button type="button" onClick={parseText} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">
              Nhận diện các cột <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {step === "source" && activeSourceTab === "file" ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.xlsx,.xls,.doc,.docx,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              aria-label="Chọn file từ vựng"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            <Upload className="mx-auto h-8 w-8 text-blue-600" />
            <p className="mt-3 text-sm font-bold text-slate-800">Chọn file TXT, CSV, Excel hoặc Word</p>
            <p className="mt-1 text-xs text-slate-500">Excel cần có hàng tiêu đề ở dòng đầu tiên.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Chọn tệp
            </button>
          </div>
        ) : null}

        {step === "mapping" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>{nonEmptyRows.length} dòng dữ liệu.</strong> Kiểm tra cột đã nhận diện; chọn trường cho cột chưa rõ hoặc bỏ qua cột không dùng.
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr><th className="px-4 py-3">Tên cột nguồn</th><th className="px-4 py-3">Đưa dữ liệu vào</th><th className="px-4 py-3">Giá trị mẫu</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {columns.map((column) => (
                    <tr key={column}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{column}</td>
                      <td className="px-4 py-3">
                        <select
                          value={mapping[column] ?? ""}
                          onChange={(event) => setMapping((current) => ({ ...current, [column]: event.target.value }))}
                          aria-label={`Chọn trường cho cột ${column}`}
                          className={`min-h-10 w-full rounded-lg border px-3 text-sm ${mapping[column] ? "border-slate-200 bg-white" : "border-amber-300 bg-amber-50"}`}
                        >
                          <option value="">Chọn trường…</option>
                          {fieldOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          <option value={ignoredField}>Bỏ qua cột này</option>
                        </select>
                      </td>
                      <td className="max-w-72 truncate px-4 py-3 text-xs text-slate-500">{rows[0]?.[column] || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep("source")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  if (unmappedColumns.length) {
                    setError(`Hãy chọn trường hoặc bỏ qua các cột chưa nhận diện: ${unmappedColumns.join(", ")}.`);
                    return;
                  }
                  setError("");
                  setStep("preview");
                }}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
              >
                Xem trước dữ liệu <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {step === "preview" ? (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 text-sm ${invalidRows.length ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
              {invalidRows.length
                ? `${invalidRows.length} dòng thiếu từ tiếng Anh hoặc nghĩa tiếng Việt. Hãy quay lại và kiểm tra cột.`
                : `${previewRows.length} dòng đã sẵn sàng để thêm vào bộ từ vựng.`}
            </div>
            <div className="max-h-[28rem] overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr><th className="px-3 py-3">Từ</th><th className="px-3 py-3">Nghĩa</th><th className="px-3 py-3">Từ loại</th><th className="px-3 py-3">IPA</th><th className="px-3 py-3">Ví dụ</th><th className="px-3 py-3">Trạng thái</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row, index) => (
                    <tr key={`${row.word || "row"}-${index}`}>
                      <td className="px-3 py-3 font-bold text-slate-900">{row.word || "—"}</td>
                      <td className="px-3 py-3 text-slate-700">{row.meaning || "—"}</td>
                      <td className="px-3 py-3 text-slate-600">{row.partOfSpeech || "Noun"}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-500">{row.ipa || "—"}</td>
                      <td className="max-w-72 truncate px-3 py-3 text-slate-600">{row.example || "—"}</td>
                      <td className="px-3 py-3">
                        {row.word && row.meaning
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Đủ dữ liệu</span>
                          : <span className="text-xs font-semibold text-rose-700">Thiếu từ hoặc nghĩa</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {busy ? <p className="text-sm font-semibold text-blue-700">Đang lưu {previewRows.length} dòng trong một giao dịch…</p> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep("mapping")} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                <ArrowLeft className="h-4 w-4" /> Sửa ghép cột
              </button>
              <button type="button" onClick={() => void importWords()} disabled={busy || invalidRows.length > 0 || !targetSetId} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Thêm {previewRows.length} từ vào bộ
              </button>
            </div>
          </div>
        ) : null}

        {error ? <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
        {notice ? <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div> : null}
      </div>
    </section>
  );
}
