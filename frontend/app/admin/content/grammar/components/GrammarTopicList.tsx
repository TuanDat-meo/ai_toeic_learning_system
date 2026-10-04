"use client";

import React from "react";
import { Star, BookOpen, Play, Pencil, Plus, Trash2, HelpCircle, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { GrammarTopicItem } from "../types";

interface GrammarTopicListProps {
  topics: GrammarTopicItem[];
  selectedTopicIds: string[];
  onToggleSelectTopic: (id: string) => void;
  onSelectAllTopics: () => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onOpenTheoryModal: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem) => void;
  onOpenEditTopic: (topic: GrammarTopicItem) => void;
  onOpenAddQuestion: (topic: GrammarTopicItem) => void;
  onOpenDeleteTopic: (topic: GrammarTopicItem) => void;
}

export const GrammarTopicList: React.FC<GrammarTopicListProps> = ({
  topics,
  selectedTopicIds,
  onToggleSelectTopic,
  onSelectAllTopics,
  onToggleBookmark,
  onOpenTheoryModal,
  onStartQuiz,
  onOpenEditTopic,
  onOpenAddQuestion,
  onOpenDeleteTopic,
}) => {
  if (topics.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
        Không tìm thấy chủ điểm ngữ pháp nào phù hợp với bộ lọc.
      </div>
    );
  }

  const isAllSelected = topics.length > 0 && topics.every((t) => selectedTopicIds.includes(t.id));

  return (
    <div className="space-y-4">
      {/* Select All Checkbox Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-600">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAllTopics}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Chọn tất cả ({topics.length} chủ điểm)</span>
        </label>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => {
          const isSelected = selectedTopicIds.includes(topic.id);
          const totalQ = topic.questions.length;
          const isStudied = topic.studiedCount > 0;
          const accuracy =
            isStudied && topic.studiedCount > 0
              ? Math.round((topic.correctCount / topic.studiedCount) * 100)
              : 0;

          return (
            <div
              key={topic.id}
              className={`p-5 rounded-3xl bg-white border transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md ${
                isSelected ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20" : "border-slate-200/80"
              }`}
            >
              <div className="space-y-3">
                {/* Topic Header Badge & Star */}
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

                  <button
                    type="button"
                    onClick={(e) => onToggleBookmark(topic.id, e)}
                    className="p-1.5 rounded-xl border border-slate-100 hover:bg-slate-100 transition cursor-pointer text-amber-400"
                    title={topic.bookmarked ? "Bỏ ghim" : "Ghim vào danh sách yêu thích"}
                  >
                    <Star className={`w-4 h-4 ${topic.bookmarked ? "fill-amber-400" : ""}`} />
                  </button>
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

                {/* Formula Highlight Box */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 font-mono text-[11px] font-bold text-slate-800 leading-relaxed overflow-x-auto">
                  {topic.formula}
                </div>

                {/* Summary Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {topic.summary}
                </p>

                {/* Practice Progress Bar if studied */}
                {isStudied && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Đã làm: {topic.studiedCount} câu</span>
                      <span className={accuracy >= 70 ? "text-emerald-600" : "text-amber-600"}>
                        Độ chính xác: {accuracy}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          accuracy >= 70 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenTheoryModal(topic)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Xem lý thuyết"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lý thuyết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartQuiz(topic)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Luyện tập trắc nghiệm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Luyện ({totalQ})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenAddQuestion(topic)}
                    className="p-1.5 rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    title="Thêm câu hỏi vào chủ điểm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenEditTopic(topic)}
                    className="p-1.5 rounded-xl border border-slate-200 text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                    title="Chỉnh sửa chủ điểm"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDeleteTopic(topic)}
                    className="p-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Xóa chủ điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
