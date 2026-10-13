"use client";

import React from "react";
import {
  BookOpen,
  Eye,
  Pencil,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";

interface GrammarTopicListProps {
  topics: GrammarTopicItem[];
  viewMode: "table" | "grid";
  selectedTopicIds: string[];
  onToggleSelectTopic: (id: string) => void;
  onSelectAllTopics: () => void;
  onOpenTheoryModal: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem) => void;
  onOpenEditTopic: (topic: GrammarTopicItem) => void;
  onOpenAddQuestion: (topic: GrammarTopicItem) => void;
  onOpenDeleteTopic: (topic: GrammarTopicItem) => void;
}

export const GrammarTopicList: React.FC<GrammarTopicListProps> = ({
  topics,
  viewMode,
  selectedTopicIds,
  onToggleSelectTopic,
  onSelectAllTopics,
  onOpenTheoryModal,
  onStartQuiz,
  onOpenEditTopic,
  onOpenAddQuestion,
  onOpenDeleteTopic,
}) => {
  if (topics.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
        Không tìm thấy chuyên đề ngữ pháp nào phù hợp với bộ lọc tìm kiếm.
      </div>
    );
  }

  const isAllSelected = topics.length > 0 && topics.every((t) => selectedTopicIds.includes(t.id));

  return (
    <div className="space-y-4">
      {/* Selection Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAllTopics}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Chọn tất cả ({topics.length} chuyên đề)</span>
        </label>
        <span className="text-slate-400 font-normal">
          Hiển thị dạng {viewMode === "table" ? "Bảng dữ liệu quản trị" : "Thẻ chi tiết"}
        </span>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  <th className="py-3.5 px-4 w-10"></th>
                  <th className="py-3.5 px-4 min-w-[240px]">Mã &amp; Chuyên đề</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Phần thi</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Mục tiêu Band</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Số câu &amp; Bẫy</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Độ hiểu bài học viên</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {topics.map((topic) => {
                  const isSelected = selectedTopicIds.includes(topic.id);
                  const isStudied = topic.studiedCount > 0;
                  const accuracy = isStudied
                    ? Math.round((topic.correctCount / topic.studiedCount) * 100)
                    : 75; // Default estimate baseline

                  return (
                    <tr
                      key={topic.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectTopic(topic.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0 whitespace-nowrap">
                            {topic.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{topic.title}</p>
                            <p className="text-[11px] text-slate-400 italic">{topic.englishTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 whitespace-nowrap inline-flex items-center">
                          {topic.part}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap inline-flex items-center ${
                            topic.targetScore === "750+"
                              ? "bg-purple-100 text-purple-800"
                              : topic.targetScore === "500-750"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Target {topic.targetScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {topic.questions.length} câu hỏi
                          </span>
                          <span className="text-amber-600 font-medium">
                            {topic.traps.length} bẫy đề
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-500">
                              {topic.studiedCount > 0 ? `${topic.studiedCount} lượt` : "Mới phát hành"}
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
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            topic.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {topic.status === "PUBLISHED" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Phát hành</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-slate-400" />
                              <span>Bản nháp</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenTheoryModal(topic)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            title="Xem chi tiết lý thuyết & công thức"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onStartQuiz(topic)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                            title="Xem trước bài test học viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenAddQuestion(topic)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-indigo-50 text-indigo-600 transition cursor-pointer"
                            title="Thêm câu hỏi mới"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditTopic(topic)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                            title="Chỉnh sửa chuyên đề"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDeleteTopic(topic)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="Xóa chuyên đề"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {topics.map((topic) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            const totalQ = topic.questions.length;
            const isStudied = topic.studiedCount > 0;
            const accuracy = isStudied
              ? Math.round((topic.correctCount / topic.studiedCount) * 100)
              : 75;

            return (
              <div
                key={topic.id}
                className={`p-5 rounded-3xl bg-white border transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20"
                    : "border-slate-200/80"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectTopic(topic.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {topic.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        {topic.part}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          topic.targetScore === "750+"
                            ? "bg-purple-100 text-purple-800"
                            : topic.targetScore === "500-750"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        Target {topic.targetScore}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        topic.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {topic.status === "PUBLISHED" ? "Phát hành" : "Bản nháp"}
                    </span>
                  </div>

                  {/* Title & English Title */}
                  <div>
                    <h3
                      onClick={() => onOpenTheoryModal(topic)}
                      className="text-base font-extrabold text-slate-900 hover:text-blue-600 transition cursor-pointer leading-snug"
                    >
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium italic">{topic.englishTitle}</p>
                  </div>

                  {/* Formula Box */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-mono text-[11px] font-bold text-slate-800 leading-relaxed overflow-x-auto">
                    {topic.formula}
                  </div>

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {topic.summary}
                  </p>

                  {/* Content Stats */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                    <span>Ngân hàng: {totalQ} câu</span>
                    <span className="text-amber-600">{topic.traps.length} bẫy đề</span>
                    <span className="text-emerald-600">{accuracy}% đúng</span>
                  </div>
                </div>

                {/* Card Admin Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenTheoryModal(topic)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      title="Xem lý thuyết & bẫy đề"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartQuiz(topic)}
                      className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      title="Xem trước bài test học viên"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Xem trước</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenAddQuestion(topic)}
                      className="p-1.5 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="Thêm câu hỏi mới"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenEditTopic(topic)}
                      className="p-1.5 rounded-xl border border-slate-200 text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                      title="Chỉnh sửa chuyên đề"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDeleteTopic(topic)}
                      className="p-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa chuyên đề"
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
