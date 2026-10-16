"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileUp,
  RotateCcw,
  Upload,
} from "lucide-react";
import { AdminPageFrame } from "@/components/admin/AdminPageFrame";

type DatasetType = "vocabulary" | "questions";
type DataRecord = Record<string, unknown>;
type ImportMode = "merge" | "replace";

type ValidationIssue = {
  row: number;
  message: string;
};

type DatasetDefinition = {
  label: string;
  description: string;
  headers: string[];
  required: string[];
  uniqueKey: (record: DataRecord) => string;
  example: DataRecord;
};

const STORAGE_KEY = "toeic-admin-imported-data-v1";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 10_000;
const PREVIEW_LIMIT = 8;

const DATASETS: Record<DatasetType, DatasetDefinition> = {
  vocabulary: {
    label: "Từ vựng",
    description: "Danh sách từ TOEIC và thông tin giải nghĩa.",
    headers: ["word", "meaning", "ipa", "partOfSpeech", "level", "example"],
    required: ["word", "meaning"],
    uniqueKey: (record) => String(record.word ?? "").trim().toLocaleLowerCase("en"),
    example: {
      word: "encourage",
      meaning: "khuyến khích",
      ipa: "/ɪnˈkɜːrɪdʒ/",
      partOfSpeech: "verb",
      level: "B1",
      example: "Our manager encourages teamwork.",
    },
  },
  questions: {
    label: "Ngân hàng câu hỏi",
    description: "Câu hỏi trắc nghiệm TOEIC với đáp án và lựa chọn.",
    headers: ["id", "part", "questionText", "options", "correctAnswer", "difficulty", "explanation"],
    required: ["id", "part", "questionText", "options", "correctAnswer"],
    uniqueKey: (record) => String(record.id ?? "").trim().toLocaleLowerCase("en"),
    example: {
      id: "q-example-001",
      part: "Part 5",
      questionText: "The new policy will take effect _____ Monday.",
      options: ["at", "on", "in", "by"],
      correctAnswer: "B",
      difficulty: "Easy",
      explanation: "Dùng giới từ on trước ngày trong tuần.",
    },
  },
};

function parseCsv(source: string): { headers: string[]; rows: string[][] } {
  const text = source.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("File CSV có dấu ngoặc kép chưa được đóng.");
  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (rows.length === 0) throw new Error("File CSV không có dữ liệu.");

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("Tên cột trong CSV không được để trống.");
  if (new Set(headers).size !== headers.length) throw new Error("File CSV có tên cột bị trùng.");

  return { headers, rows: rows.slice(1) };
}

function parseJson(source: string): DataRecord[] {
  const parsed: unknown = JSON.parse(source);
  const records = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as { records?: unknown; items?: unknown }).records ??
        (parsed as { items?: unknown }).items
      : null;

  if (!Array.isArray(records)) {
    throw new Error("JSON phải là một mảng hoặc một object chứa mảng `records` / `items`.");
  }
  if (records.some((record) => !record || typeof record !== "object" || Array.isArray(record))) {
    throw new Error("Mỗi phần tử trong JSON phải là một object.");
  }
  return records as DataRecord[];
}

function parseFileContent(
  fileName: string,
  source: string,
  dataset: DatasetDefinition,
): DataRecord[] {
  const extension = fileName.split(".").pop()?.toLocaleLowerCase("en");
  if (extension === "json") return parseJson(source);
  if (extension !== "csv") throw new Error("Chỉ hỗ trợ file .csv hoặc .json.");

  const { headers, rows } = parseCsv(source);
  const extraHeaders = headers.filter((header) => !dataset.headers.includes(header));
  if (extraHeaders.length > 0) {
    throw new Error(`Cột CSV không được hỗ trợ: ${extraHeaders.join(", ")}.`);
  }
  const oversizedRow = rows.findIndex((values) => values.length > headers.length);
  if (oversizedRow >= 0) {
    throw new Error(`Dòng ${oversizedRow + 2} có nhiều giá trị hơn số cột trong tiêu đề.`);
  }
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""])),
  );
}

function validateRecords(
  records: DataRecord[],
  dataset: DatasetDefinition,
): { validRecords: DataRecord[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();

  if (records.length === 0) {
    return { validRecords: [], issues: [{ row: 0, message: "File không có bản ghi để nhập." }] };
  }
  if (records.length > MAX_ROWS) {
    return {
      validRecords: [],
      issues: [{ row: 0, message: `Chỉ hỗ trợ tối đa ${MAX_ROWS.toLocaleString("vi-VN")} bản ghi mỗi lần.` }],
    };
  }

  const validRecords = records.filter((record, index) => {
    const rowNumber = index + 1;
    let isValid = true;

    const unsupportedFields = Object.keys(record).filter(
      (field) => !dataset.headers.includes(field),
    );
    if (unsupportedFields.length > 0) {
      issues.push({
        row: rowNumber,
        message: `Trường không được hỗ trợ: ${unsupportedFields.join(", ")}.`,
      });
      isValid = false;
    }

    for (const field of dataset.required) {
      const value = record[field];
      if (value === undefined || value === null || String(value).trim() === "") {
        issues.push({ row: rowNumber, message: `Thiếu trường bắt buộc “${field}”.` });
        isValid = false;
      }
    }

    if (record.options !== undefined && typeof record.options === "string") {
      try {
        record.options = JSON.parse(record.options);
      } catch {
        issues.push({ row: rowNumber, message: "Trường “options” phải là JSON array hợp lệ." });
        isValid = false;
      }
    }

    if (record.options !== undefined && !Array.isArray(record.options)) {
      issues.push({ row: rowNumber, message: "Trường “options” phải là một mảng." });
      isValid = false;
    }

    if (dataset === DATASETS.questions && Array.isArray(record.options)) {
      const invalidOption = record.options.some((option) => {
        if (typeof option === "string") return option.trim() === "";
        return (
          !option ||
          typeof option !== "object" ||
          !("id" in option) ||
          !("text" in option) ||
          String(option.id).trim() === "" ||
          String(option.text).trim() === ""
        );
      });
      const optionIds = record.options.map((option, optionIndex) =>
        option && typeof option === "object" && "id" in option
          ? String(option.id).toLocaleUpperCase("en")
          : String.fromCharCode(65 + optionIndex),
      );
      if (invalidOption) {
        issues.push({ row: rowNumber, message: "Mỗi lựa chọn phải là nội dung hoặc object có “id” và “text”." });
        isValid = false;
      }
      if (record.options.length < 2 || record.options.length > 4) {
        issues.push({ row: rowNumber, message: "Câu hỏi cần có từ 2 đến 4 lựa chọn." });
        isValid = false;
      }
      if (!optionIds.includes(String(record.correctAnswer ?? "").trim().toLocaleUpperCase("en"))) {
        issues.push({ row: rowNumber, message: "“correctAnswer” phải khớp ID của một lựa chọn." });
        isValid = false;
      }
    }

    const key = dataset.uniqueKey(record);
    if (key) {
      if (seen.has(key)) {
        issues.push({ row: rowNumber, message: `Bản ghi trùng khóa “${key}” trong file.` });
        isValid = false;
      }
      seen.add(key);
    }

    return isValid;
  });

  return { validRecords, issues };
}

function downloadFile(fileName: string, contents: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function toCsv(records: DataRecord[], headers: string[]) {
  const escape = (value: unknown) => {
    const text = value && typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers, ...records.map((record) => headers.map((header) => record[header]))]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}

export default function AdminDataImportPage() {
  const [datasetType, setDatasetType] = useState<DatasetType>("vocabulary");
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [recordsByType, setRecordsByType] = useState<Record<DatasetType, DataRecord[]>>({
    vocabulary: [],
    questions: [],
  });
  const [preview, setPreview] = useState<DataRecord[]>([]);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const definition = DATASETS[datasetType];
  const currentRecords = recordsByType[datasetType];
  const validRecordCount = preview.length;
  const isImportReady = preview.length > 0 && issues.length === 0 && !isReading;

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Dữ liệu đã lưu không đúng định dạng.");
        }
        const value = parsed as Partial<Record<DatasetType, unknown>>;
        const vocabulary = Array.isArray(value.vocabulary) ? value.vocabulary : [];
        const questions = Array.isArray(value.questions) ? value.questions : [];
        setRecordsByType({ vocabulary, questions });
      } catch (error) {
        setStorageError(
          error instanceof Error
            ? `Không thể đọc dữ liệu đã lưu: ${error.message}`
            : "Không thể đọc dữ liệu đã lưu trong trình duyệt.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const previewRows = useMemo(() => preview.slice(0, PREVIEW_LIMIT), [preview]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setMessage("");
    setIssues([]);
    setPreview([]);
    setFileName("");
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setIssues([{ row: 0, message: "File vượt quá giới hạn 5 MB." }]);
      return;
    }

    setIsReading(true);
    setFileName(file.name);
    try {
      const parsed = parseFileContent(file.name, await file.text(), definition);
      const result = validateRecords(parsed, definition);
      setPreview(result.validRecords);
      setIssues(result.issues);
      if (result.issues.length === 0) {
        setMessage(`Đã kiểm tra ${parsed.length.toLocaleString("vi-VN")} bản ghi. File hợp lệ.`);
      }
    } catch (error) {
      setIssues([
        {
          row: 0,
          message: error instanceof Error ? error.message : "Không thể đọc nội dung file.",
        },
      ]);
    } finally {
      setIsReading(false);
    }
  }

  function importRecords() {
    if (!isImportReady) return;

    const existing = recordsByType[datasetType];
    const nextRecords =
      importMode === "replace"
        ? preview
        : (() => {
            const merged = new Map(
              existing.map((record) => [definition.uniqueKey(record), record]),
            );
            preview.forEach((record) => merged.set(definition.uniqueKey(record), record));
            return Array.from(merged.values());
          })();
    const nextState = { ...recordsByType, [datasetType]: nextRecords };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      setRecordsByType(nextState);
      setMessage(
        `Đã ${importMode === "replace" ? "thay thế" : "gộp"} dữ liệu ${definition.label.toLocaleLowerCase("vi")} (${preview.length.toLocaleString("vi-VN")} bản ghi).`,
      );
      setPreview([]);
      setIssues([]);
      setFileName("");
      setStorageError("");
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Không thể lưu dữ liệu: ${error.message}`
          : "Không thể lưu dữ liệu vào trình duyệt.",
      );
    }
  }

  function exportRecords(format: "csv" | "json") {
    if (currentRecords.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    if (format === "json") {
      downloadFile(
        `${datasetType}-${date}.json`,
        JSON.stringify(currentRecords, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }
    downloadFile(
      `${datasetType}-${date}.csv`,
      `\uFEFF${toCsv(currentRecords, definition.headers)}`,
      "text/csv;charset=utf-8",
    );
  }

  function downloadTemplate(format: "csv" | "json") {
    if (format === "json") {
      downloadFile(
        `mau-${datasetType}.json`,
        JSON.stringify([definition.example], null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }
    downloadFile(
      `mau-${datasetType}.csv`,
      `\uFEFF${toCsv([definition.example], definition.headers)}`,
      "text/csv;charset=utf-8",
    );
  }

  function clearPreview() {
    setPreview([]);
    setIssues([]);
    setFileName("");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <AdminPageFrame
      title="Quản lý dữ liệu"
      subtitle="Nhập, kiểm tra và xuất dữ liệu học TOEIC bằng CSV hoặc JSON."
      metrics={[
        {
          label: `Bản ghi ${definition.label.toLocaleLowerCase("vi")}`,
          value: currentRecords.length.toLocaleString("vi-VN"),
          trend: "Đã lưu trên trình duyệt này",
          tone: "primary",
          icon: <Database className="h-5 w-5" aria-hidden="true" />,
        },
        {
          label: "File đang xem trước",
          value: preview.length.toLocaleString("vi-VN"),
          trend: issues.length ? `${issues.length} lỗi cần xử lý` : "Chưa ghi vào kho dữ liệu",
          tone: issues.length ? "neutral" : "secondary",
          icon: <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />,
        },
      ]}
      actions={
        <>
          <button
            type="button"
            onClick={() => exportRecords("csv")}
            disabled={currentRecords.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Xuất CSV
          </button>
          <button
            type="button"
            onClick={() => exportRecords("json")}
            disabled={currentRecords.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileJson className="h-4 w-4" aria-hidden="true" />
            Xuất JSON
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nhập dữ liệu</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chọn loại dữ liệu, tải file lên và kiểm tra bản xem trước trước khi lưu.
            </p>
          </div>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="dataset-type">
            Loại dữ liệu
          </label>
          <select
            id="dataset-type"
            value={datasetType}
                  disabled={isReading}
                  onChange={(event) => {
              setDatasetType(event.target.value as DatasetType);
              clearPreview();
            }}
            className="-mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {Object.entries(DATASETS).map(([value, dataset]) => (
              <option key={value} value={value}>{dataset.label}</option>
            ))}
          </select>
          <p className="-mt-3 text-xs text-slate-500">{definition.description}</p>

          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
            <span className="mr-1 text-xs font-semibold text-slate-600">Tải file mẫu:</span>
            <button type="button" onClick={() => downloadTemplate("csv")} className="text-xs font-semibold text-primary hover:underline">
              CSV
            </button>
            <span className="text-slate-300">|</span>
            <button type="button" onClick={() => downloadTemplate("json")} className="text-xs font-semibold text-primary hover:underline">
              JSON
            </button>
            <span className="ml-auto text-xs text-slate-500">Tối đa 5 MB / 10.000 bản ghi</span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <FileUp className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">Chọn file CSV hoặc JSON</p>
            <p className="mt-1 text-xs text-slate-500">File sẽ được kiểm tra trước khi nhập.</p>
            <input
              ref={fileInputRef}
              type="file"
              disabled={isReading}
              accept=".csv,.json,application/json,text/csv"
              onChange={handleFileChange}
              className="sr-only"
              id="data-file"
            />
            <label
              htmlFor="data-file"
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Chọn file
            </label>
            {fileName ? <p className="mt-3 truncate text-xs text-slate-600">{fileName}</p> : null}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-700">Cách nhập dữ liệu</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm">
              <input
                type="radio"
                name="import-mode"
                value="merge"
                checked={importMode === "merge"}
                onChange={() => setImportMode("merge")}
                className="mt-1 accent-blue-600"
              />
              <span><strong className="text-slate-800">Gộp dữ liệu</strong><span className="mt-0.5 block text-xs text-slate-500">Cập nhật bản ghi trùng khóa, giữ lại bản ghi chưa có.</span></span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm">
              <input
                type="radio"
                name="import-mode"
                value="replace"
                checked={importMode === "replace"}
                onChange={() => setImportMode("replace")}
                className="mt-1 accent-blue-600"
              />
              <span><strong className="text-slate-800">Thay thế toàn bộ</strong><span className="mt-0.5 block text-xs text-slate-500">Xóa dữ liệu {definition.label.toLocaleLowerCase("vi")} đã lưu trong trình duyệt này.</span></span>
            </label>
          </fieldset>

          {message ? (
            <p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {message}
            </p>
          ) : null}
          {storageError ? (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {storageError}
            </p>
          ) : null}

          {issues.length > 0 ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-red-800">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                File có {issues.length} lỗi — chưa thể nhập
              </p>
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {issues.slice(0, 8).map((issue, index) => (
                  <li key={`${issue.row}-${index}`}>
                    {issue.row ? `Dòng ${issue.row}: ` : ""}{issue.message}
                  </li>
                ))}
                {issues.length > 8 ? <li>… và {issues.length - 8} lỗi khác.</li> : null}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={clearPreview}
              disabled={!fileName && preview.length === 0 && issues.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa bản xem trước
            </button>
            <button
              type="button"
              onClick={importRecords}
              disabled={!isImportReady}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Database className="h-4 w-4" aria-hidden="true" />
              {isReading ? "Đang kiểm tra…" : "Nhập dữ liệu"}
            </button>
          </div>
        </section>

        <section className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bản xem trước</h2>
              <p className="mt-1 text-sm text-slate-500">
                {validRecordCount
                  ? `${validRecordCount.toLocaleString("vi-VN")} bản ghi hợp lệ`
                  : "Chưa có dữ liệu để hiển thị"}
              </p>
            </div>
            {validRecordCount > 0 && issues.length === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Hợp lệ
              </span>
            ) : null}
          </div>

          {previewRows.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {definition.headers.slice(0, 4).map((header) => (
                      <th key={header} className="whitespace-nowrap px-3 py-2.5 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((record, index) => (
                    <tr key={index} className="align-top text-slate-700">
                      {definition.headers.slice(0, 4).map((header) => {
                        const value = record[header];
                        const display = value && typeof value === "object" ? JSON.stringify(value) : String(value ?? "—");
                        return (
                          <td key={header} className="max-w-48 px-3 py-2.5">
                            <span className="line-clamp-3 break-words">{display}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > PREVIEW_LIMIT ? (
                <p className="border-t border-slate-100 px-3 py-2 text-center text-xs text-slate-500">
                  Hiển thị {PREVIEW_LIMIT} / {preview.length.toLocaleString("vi-VN")} bản ghi
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">
              <FileSpreadsheet className="h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-600">Dữ liệu sẽ hiện ở đây</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Chọn file để xem trước và kiểm tra cấu trúc.</p>
            </div>
          )}

          <div className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <p className="font-bold">Lưu ý về nơi lưu dữ liệu</p>
            <p className="mt-1">
              Dữ liệu nhập được lưu trong bộ nhớ trình duyệt này và có thể xuất lại. Hiện chưa đồng bộ với nội dung học trên máy chủ.
            </p>
          </div>
        </section>
      </div>
    </AdminPageFrame>
  );
}
