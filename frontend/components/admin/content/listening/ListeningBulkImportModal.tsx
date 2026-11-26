"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  FileJson2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Headphones,
} from "lucide-react";
import {
  previewContentImport,
  publishContentImport,
  type ImportBatchDetails,
} from "@/lib/api/content-import";

interface ListeningBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  triggerToast: (msg: string) => void;
  alsoSyncQuestionsToQuestionBank?: boolean;
}

const SAMPLE_DICTATION_JSON = [
  {
    recordType: "DICTATION",
    title: "ETS 2024 - Test 1 - Part 1",
    part: "Part 1",
    testNumber: 1,
    year: "2024",
    totalQuestions: 2,
    audioUrl: "/ets_2024_lc/test_1/q1.mp3",
    transcript: "She's eating in a picnic area.",
    vietnameseTranslation: "Cô ấy đang ăn ở một khu vực dã ngoại.",
    questions: [
      {
        id: 101,
        part: "Part 1",
        audioUrl: "/ets_2024_lc/test_1/q1.mp3",
        imageUrl: "/ets_2024_lc/test_1/q1.jpg",
        fullTranscript: "She's eating in a picnic area.",
        vietnameseTranslation: "Cô ấy đang ăn ở một khu vực dã ngoại.",
        options: {
          A: "She's eating in a picnic area.",
          B: "She's waiting in line at a food truck.",
          C: "She's wiping off a bench.",
          D: "She's throwing away a plate.",
        },
        correctAnswer: "A",
        explanation: "Người phụ nữ đang ngồi ăn tại bàn đá dã ngoại ngoài trời.",
        trapNote: "Bẫy danh từ liên quan: food truck không xuất hiện trong tranh.",
      },
      {
        id: 102,
        part: "Part 1",
        audioUrl: "/ets_2024_lc/test_1/q2.mp3",
        imageUrl: "/ets_2024_lc/test_1/q2.jpg",
        fullTranscript: "The man is standing in the snow beside a car.",
        vietnameseTranslation: "Người đàn ông đang đứng trong tuyết cạnh xe ô tô.",
        options: {
          A: "The man is brushing snow off the roof of a car.",
          B: "The man is standing in the snow beside a car.",
          C: "The man is shoveling a driveway.",
          D: "The man is putting on a winter coat.",
        },
        correctAnswer: "B",
        explanation: "Người đàn ông đang đứng cạnh xe, xung quanh phủ tuyết.",
      },
    ],
  },
];

const SAMPLE_UNIT_JSON = [
  {
    recordType: "UNIT",
    unitType: "level",
    part: "Part 2",
    title: "Level 2 – Cơ bản (450–600+)",
    targetLevel: "450-600+",
    totalQuestions: 2,
    theorySummary: "Nắm chắc từ để hỏi Wh- (Who, Where, When, How) và loại trừ bẫy đồng âm.",
    rules: [
      "Nghe thật kỹ 1–2 từ đầu tiên của câu hỏi.",
      "Loại ngay phương án Yes/No nếu câu hỏi bắt đầu bằng từ để hỏi Wh-.",
    ],
    vocabBag: [
      { word: "schedule", ipa: "/ˈʃedjuːl/", meaning: "Lên lịch, lịch trình" },
    ],
    audioUrl: "/ets_2024_lc/test_1/q7.mp3",
    transcript: "How old is this building? (A) To ship some materials. (B) About 10 years old. (C) Company offices I think.",
    questions: [
      {
        id: 107,
        part: "Part 2",
        question: "How old is this building?",
        audioUrl: "/ets_2024_lc/test_1/q7.mp3",
        fullTranscript: "How old is this building? (A) To ship some materials. (B) About 10 years old. (C) Company offices I think.",
        vietnameseTranslation: "Tòa nhà này bao nhiêu tuổi? (A) Để vận chuyển một số vật liệu. (B) Khoảng 10 tuổi. (C) Tôi nghĩ là văn phòng công ty.",
        options: {
          A: "To ship some materials.",
          B: "About 10 years old.",
          C: "Company offices I think.",
        },
        correctAnswer: "B",
        explanation: "Câu hỏi How old hỏi tuổi thọ công trình -> About 10 years old.",
      },
    ],
  },
];

const SAMPLE_CSV = `recordType,unitType,title,part,testNumber,year,targetLevel,audioUrl,imageUrl,question,transcript,vietnameseTranslation,optionA,optionB,optionC,optionD,correctAnswer,explanation,trapNote
"DICTATION","","ETS 2024 - Test 1 - Part 1","Part 1","1","2024","","/ets_2024_lc/test_1/q1.mp3","/ets_2024_lc/test_1/q1.jpg","","She's eating in a picnic area.","Cô ấy đang ăn ở một khu vực dã ngoại.","She's eating in a picnic area.","She's waiting in line at a food truck.","She's wiping off a bench.","She's throwing away a plate.","A","Người phụ nữ đang ngồi ăn đồ ăn tại bàn đá ngoài trời.","Bẫy danh từ liên quan"
"UNIT","category","Câu hỏi Thời gian & Địa điểm (When / Where)","Part 2","1","2024","450-650+","/ets_2024_lc/test_1/q7.mp3","","How old is this building?","How old is this building? (A) To ship some materials. (B) About 10 years old. (C) Company offices I think.","Tòa nhà này bao nhiêu tuổi?","To ship some materials.","About 10 years old.","Company offices I think.","","B","Câu hỏi How old -> About 10 years old.","Bẫy từ đồng âm"`;

export const ListeningBulkImportModal: React.FC<ListeningBulkImportModalProps> = ({
  isOpen,
  onClose,
  onImported,
  triggerToast,
  alsoSyncQuestionsToQuestionBank = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportBatchDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectFile = async (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    setError(null);
    setLoading(true);
    try {
      const details = await previewContentImport("LISTENING", selected);
      setPreview(details);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "Không thể phân tích file import.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!preview) return;
    setPublishing(true);
    setError(null);
    try {
      const summary = await publishContentImport(preview.batch.id, {
        alsoSyncListeningQuestionsToBank: alsoSyncQuestionsToQuestionBank,
      });
      triggerToast(alsoSyncQuestionsToQuestionBank
        ? `🎉 Đã import ${summary.publishedCount} mục Listening và đồng bộ câu hỏi vào ngân hàng!`
        : `🎉 Đã import & xuất bản thành công ${summary.publishedCount} mục bài nghe vào PostgreSQL!`);
      onImported();
      setFile(null);
      setPreview(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể publish dữ liệu.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Import Hàng Loạt Dữ Liệu Listening (CSV / XLSX / JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ nhập cả Bài nghe chép chính tả (Dictation) và Chủ điểm luyện kỹ năng Part 1–4 vào PostgreSQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sample Templates Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-800">Tải file mẫu chuẩn (Template):</p>
            <p>Có thể import 1 file chứa cả Dictation (`recordType: DICTATION`) và Chủ điểm Part 1–4 (`recordType: UNIT`).</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadFile(
                  "mau-listening-dictation.json",
                  JSON.stringify(SAMPLE_DICTATION_JSON, null, 2),
                  "application/json"
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <FileJson2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Mẫu JSON Dictation</span>
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFile(
                  "mau-listening-part-unit.json",
                  JSON.stringify(SAMPLE_UNIT_JSON, null, 2),
                  "application/json"
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <FileJson2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mẫu JSON Chủ điểm Part 1–4</span>
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFile("mau-listening-import.csv", "\uFEFF" + SAMPLE_CSV, "text/csv;charset=utf-8")
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mẫu CSV Tổng hợp</span>
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={(e) => void handleSelectFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || publishing}
            className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50/80 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-blue-700">Đang kiểm tra &amp; chuẩn hóa dữ liệu...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {file ? `Đã chọn: ${file.name} (Bấm để đổi file khác)` : "Bấm để chọn file CSV, XLSX hoặc JSON (ví dụ: data/ets_2024_listening_import.json)"}
                </span>
                <span className="text-[11px] text-slate-500">
                  Tối đa 256 MB • Tự động kiểm tra cấu trúc, phát hiện trùng lặp và đồng bộ sang PostgreSQL
                </span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview Summary & Rows */}
        {preview && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100/80 px-4 py-2.5 rounded-2xl text-xs font-bold">
              <div className="flex items-center gap-4">
                <span className="text-slate-700">
                  Tổng số mục: <strong className="text-slate-950">{preview.batch.totalRecords}</strong>
                </span>
                <span className="text-emerald-700">
                  Hợp lệ: <strong>{preview.batch.validCount}</strong>
                </span>
                <span className="text-amber-700">
                  Trùng lặp: <strong>{preview.batch.duplicateCount}</strong>
                </span>
                <span className="text-rose-700">
                  Lỗi: <strong>{preview.batch.invalidCount}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Hiển thị {preview.items.length} dòng xem trước
              </span>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Phân loại</th>
                    <th className="py-2.5 px-3">Tiêu đề</th>
                    <th className="py-2.5 px-3">Part</th>
                    <th className="py-2.5 px-3">Số câu / Nội dung</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.items.map((item) => {
                    const norm = item.normalizedData || {};
                    const isUnit =
                      String(norm.recordType || "").toUpperCase() === "UNIT" ||
                      Boolean(norm.unitType) ||
                      Boolean(norm.theorySummary);
                    const qList = Array.isArray(norm.questions) ? norm.questions : [];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{item.rowNumber}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isUnit
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isUnit ? `Chủ điểm (${String(norm.unitType || "category")})` : "Dictation"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {String(norm.title || "Chưa có tiêu đề")}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {String(norm.part || "")}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-600">
                          {qList.length > 0 ? `${qList.length} câu hỏi • ` : ""}
                          {String(norm.transcript || norm.theorySummary || "")}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.status === "VALID" ? (
                            <span className="text-emerald-700 font-bold">Hợp lệ</span>
                          ) : item.status === "DUPLICATE" ? (
                            <span className="text-amber-700 font-bold">Đã có (Cập nhật)</span>
                          ) : (
                            <span className="text-rose-600 font-bold" title={(item.errors || []).join(", ")}>
                              Lỗi: {(item.errors || [])[0] || "Không hợp lệ"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            Đóng
          </button>
          {preview && preview.batch.validCount > 0 && (
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-60"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xuất bản vào DB...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận Import ({preview.batch.validCount} mục hợp lệ)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

