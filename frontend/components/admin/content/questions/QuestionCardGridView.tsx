"use client";

import React from "react";
import { Eye, Pencil, Trash2, Volume2, Image as ImageIcon } from "lucide-react";
import { QuestionItem } from "@/app/admin/content/questions/types";

interface QuestionCardGridViewProps {
  questions: QuestionItem[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onPreview: (q: QuestionItem) => void;
  onEdit: (q: QuestionItem) => void;
  onDelete: (q: QuestionItem) => void;
  playSfx?: (sound: string) => void;
}

export const QuestionCardGridView: React.FC<QuestionCardGridViewProps> = ({
  questions,
  selectedIds = [],
  onToggleSelect = () => {},
  onPreview,
  onEdit,
  onDelete,
  playSfx = () => {},
}) => {
  if (questions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center text-slate-400 text-xs">
        Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map((q) => (
        <div
          key={q.id}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-extrabold border border-slate-200">
                {q.part}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {q.code || q.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    q.difficulty === "Easy"
                      ? "bg-emerald-100 text-emerald-800"
                      : q.difficulty === "Hard"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {q.difficulty}
                </span>
              </div>
            </div>

            {/* Image Preview if Part 1 */}
            {q.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video border border-slate-200/80">
                <img
                  src={q.imageUrl}
                  alt={q.code || "Question Image"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Question Text */}
            <p className="text-xs font-bold text-slate-900 leading-relaxed line-clamp-3">
              {q.questionText}
            </p>

            {/* Skill */}
            <p className="text-[11px] font-semibold text-slate-500">
              Kỹ năng: <span className="text-slate-800">{q.skill}</span>
            </p>
          </div>

          {/* Card Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                q.status === "PUBLISHED"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {q.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  onPreview(q);
                }}
                className="p-1.5 rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                title="Xem trước"
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
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
