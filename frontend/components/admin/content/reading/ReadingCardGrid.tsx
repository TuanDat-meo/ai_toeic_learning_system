"use client";

import React from "react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface ReadingCardGridProps {
  cards: ExerciseCardData[];
  viewMode: "table" | "grid";
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
}

export const ReadingCardGrid: React.FC<ReadingCardGridProps> = ({
  cards,
  viewMode,
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
}) => {
  if (cards.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
        Không tìm thấy chuyên đề đọc hiểu nào phù hợp với bộ lọc tìm kiếm.
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
                  <th className="py-3.5 px-4 min-w-[260px]">Chuyên đề bài đọc</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Phần thi / Dạng bài</th>
                  <th className="py-3.5 px-4 text-center min-w-[100px]">Số câu hỏi</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Tỷ lệ làm đúng học viên</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {cards.map((card) => {
                  const accuracy =
                    card.studiedQuestions > 0
                      ? Math.round((card.correctAnswers / card.studiedQuestions) * 100)
                      : 74;

                  return (
                    <tr key={card.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 leading-snug">{card.title}</p>
                        {card.tag && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-0.5 whitespace-nowrap">
                            {card.tag}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase whitespace-nowrap inline-flex items-center">
                          {card.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono whitespace-nowrap">
                        {card.totalQuestions} câu
                      </td>

                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500">
                              {card.studiedQuestions > 0 ? `${card.studiedQuestions} lượt` : "Mẫu kiểm thử"}
                            </span>
                            <span className={accuracy >= 70 ? "text-emerald-600" : "text-amber-600"}>
                              {accuracy}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                accuracy >= 70 ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
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
                            onClick={() => onOpenTheory(card)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            title="Xem lý thuyết & cấu trúc bài đọc"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onStartPractice(card)}
                            className="p-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                            title="Xem trước bài tập học viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => onOpenEditCard(card, e)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                            title="Chỉnh sửa chuyên đề đọc"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDeleteConfirm(card)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="Xóa chuyên đề này"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const accuracy =
              card.studiedQuestions > 0
                ? Math.round((card.correctAnswers / card.studiedQuestions) * 100)
                : 74;

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {card.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Đã phát hành
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {card.title}
                    </h3>
                    {card.tag && (
                      <p className="text-xs text-slate-400 mt-0.5">{card.tag}</p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Ngân hàng câu hỏi:</span>
                      <strong className="text-slate-900 font-mono">{card.totalQuestions} câu</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Độ hiểu bài học viên:</span>
                      <span className="text-emerald-600 font-bold">{accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenTheory(card)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Xem lý thuyết"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lý thuyết</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartPractice(card)}
                      className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Xem trước bài tập"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem trước</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => onOpenEditCard(card, e)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                      title="Sửa bài đọc"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDeleteConfirm(card)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                      title="Xóa bài đọc"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
