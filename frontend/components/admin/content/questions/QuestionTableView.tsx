"use client";

import React from "react";
import { Eye, Pencil, Trash2, Volume2, Image as ImageIcon } from "lucide-react";
import { QuestionItem } from "@/app/admin/content/questions/types";

interface QuestionTableViewProps {
  questions: QuestionItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selectAll: boolean) => void;
  onPreview: (q: QuestionItem) => void;
  onEdit: (q: QuestionItem) => void;
  onDelete: (q: QuestionItem) => void;
  playSfx?: (sound: string) => void;
}

export const QuestionTableView: React.FC<QuestionTableViewProps> = ({
  questions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onPreview,
  onEdit,
  onDelete,
  playSfx = () => {},
}) => {
  const isAllSelected =
    questions.length > 0 && questions.every((q) => selectedIds.includes(q.id));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider select-none">
            <tr>
              <th className="py-4 px-4 text-center w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 w-24">Mã câu</th>
              <th className="py-4 px-4 w-24">Part</th>
              <th className="py-4 px-6">Nội dung câu hỏi</th>
              <th className="py-4 px-4 w-32">Kỹ năng</th>
              <th className="py-4 px-4 w-24">Độ khó</th>
              <th className="py-4 px-4 w-28">Trạng thái</th>
              <th className="py-4 px-4 text-right w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-slate-700">
            {questions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              questions.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <tr
                    key={q.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isSelected ? "bg-blue-50/60" : ""
                    }`}
                  >
                    {/* Select Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(q.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Question Code */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      {q.code || q.id}
                    </td>

                    {/* Part Badge */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-extrabold border border-slate-200">
                        {q.part}
                      </span>
                    </td>

                    {/* Question Content Snippet */}
                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {q.questionText}
                          </p>
                          {q.imageUrl && (
                            <span title="Có hình ảnh">
                              <ImageIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            </span>
                          )}
                          {q.audioUrl && (
                            <span title="Có file âm thanh">
                              <Volume2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        {q.passage && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                            {q.passage}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Skill Badge */}
                    <td className="py-4 px-4">
                      <span className="text-slate-600 font-semibold text-[11px]">
                        {q.skill}
                      </span>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-100 text-emerald-800"
                            : q.difficulty === "Hard"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          q.status === "PUBLISHED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {q.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            onPreview(q);
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Xem trước câu hỏi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            onEdit(q);
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playSfx("click");
                            onDelete(q);
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
