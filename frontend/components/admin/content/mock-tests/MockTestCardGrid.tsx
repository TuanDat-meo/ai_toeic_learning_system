"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests/types";
import {
  Pencil,
  Trash2,
  FileText,
  Languages,
  Signal,
  Trophy,
  Eye,
  Headphones,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

interface MockTestCardGridProps {
  tests: TestItem[];
  viewMode: "table" | "grid";
  onEditTest: (test: TestItem, e?: React.MouseEvent) => void;
  onConfirmDeleteTest: (test: TestItem) => void;
  onOpenTranscript: (test: TestItem) => void;
  onOpenVocab: (test: TestItem) => void;
  onSelectMode: (test: TestItem, mode: "exam" | "practice") => void;
}

export const MockTestCardGrid: React.FC<MockTestCardGridProps> = ({
  tests,
  viewMode,
  onEditTest,
  onConfirmDeleteTest,
  onOpenTranscript,
  onOpenVocab,
  onSelectMode,
}) => {
  if (tests.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
        Không tìm thấy đề thi TOEIC nào phù hợp với bộ lọc tìm kiếm.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  <th className="py-3.5 px-4 min-w-[200px]">Tên đề thi</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Bộ sưu tập</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Cấu trúc bài thi</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Độ khó ETS</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Học viên thi thử</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center min-w-[180px]">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tests.map((test) => {
                  const attemptsCount = test.historyAttempts ? test.historyAttempts.length : 0;
                  const estimatedScore = test.score || 650;

                  return (
                    <tr key={test.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                            #{test.id}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{test.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              TOEIC-FULL-200Q
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap inline-flex items-center">
                          {test.volId === "vol1" ? "Crack Vol 1" : "Crack Vol 2"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold text-slate-800">200 câu • 7 Parts</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Headphones className="w-3 h-3 text-blue-500" />
                            Audio LC 45 phút
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap inline-flex items-center ${
                            test.difficulty === "Khó"
                              ? "bg-rose-100 text-rose-800"
                              : test.difficulty === "Trung bình"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {test.difficulty}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block">
                            Điểm TB: {estimatedScore} / 990
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {attemptsCount > 0 ? `${attemptsCount} lượt hoàn thành` : "Lượt thi mẫu"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã phát hành</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectMode(test, "exam")}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            title="Xem trước chế độ thi thử (Exam Simulation)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTranscript(test)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                            title="Xem đáp án & Transcript chi tiết"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenVocab(test)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-indigo-50 text-indigo-600 transition cursor-pointer"
                            title="Xem từ vựng trọng tâm"
                          >
                            <Languages className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => onEditTest(test, e)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                            title="Chỉnh sửa thông tin đề thi"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onConfirmDeleteTest(test)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="Xóa đề thi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {test.volId === "vol1" ? "Crack Vol 1" : "Crack Vol 2"}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      test.difficulty === "Khó"
                        ? "bg-rose-50 text-rose-700"
                        : test.difficulty === "Trung bình"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {test.difficulty}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">200 câu • 120 phút • 7 Parts</p>
                </div>

                {/* Metrics */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Điểm TB học viên:</span>
                    <strong className="text-slate-900 font-mono">
                      {test.score ? `${test.score} / 990` : "645 / 990"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Trạng thái:</span>
                    <span className="text-emerald-600 font-bold">Đã xuất bản</span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-4">
                <button
                  type="button"
                  onClick={() => onSelectMode(test, "exam")}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Xem trước mô phỏng đề thi"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTranscript(test)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                  title="Transcript & Audio"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => onEditTest(test, e)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                  title="Sửa đề thi"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onConfirmDeleteTest(test)}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                  title="Xóa đề thi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
