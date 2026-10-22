"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import { StudentCardProgressAction } from "@/components/student/common/StudentCardProgressAction";

interface StudentGrammarGridProps {
  topics: GrammarTopicItem[];
  onOpenTheory: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem, startIndex?: number, isRedoWrong?: boolean) => void;
}

function StudentGrammarCardItem({
  topic,
  onOpenTheory,
  onStartQuiz,
}: {
  topic: GrammarTopicItem;
  onOpenTheory: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem, startIndex?: number, isRedoWrong?: boolean) => void;
}) {
  const totalQ = topic.questions?.length || 0;
  const trapsCount = topic.traps?.length || 0;

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Card Header (Đã loại bỏ khung Target 350-750+) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {topic.code}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
              {topic.part}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700">
            <Sparkles className="w-3 h-3 text-sky-600" />
            TOEIC Core
          </span>
        </div>

        {/* Title & Info */}
        <div>
          <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
            {topic.titleVi || topic.title}
          </h4>
          <p className="text-xs text-slate-400 italic mt-0.5">{topic.titleEn || topic.englishTitle}</p>
        </div>

        {/* Badges / Metrics */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {totalQ} câu bài tập
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {trapsCount} bẫy đề thi
          </span>
        </div>

        {/* Khung thống kê và các nút điều khiển đúng chuẩn 100% như Đọc và Nghe */}
        <div className="pt-2">
          <StudentCardProgressAction
            progressKey={`grammar-${topic.id}`}
            totalQuestions={totalQ || 10}
            savedCount={trapsCount || 1}
            actionLabel="Luyện tập"
            onStart={(nextIdx) => onStartQuiz(topic, nextIdx, false)}
            onRedoWrong={() => onStartQuiz(topic, 0, true)}
            onOpenTheory={() => onOpenTheory(topic)}
          />
        </div>
      </div>
    </div>
  );
}

export const StudentGrammarGrid: React.FC<StudentGrammarGridProps> = ({
  topics,
  onOpenTheory,
  onStartQuiz,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPart, setFilterPart] = useState<string>("ALL");

  const partCounts = useMemo(() => {
    return {
      ALL: topics.length,
      "Part 5": topics.filter((t) => (t.part || "").includes("5")).length,
      "Part 6": topics.filter((t) => (t.part || "").includes("6")).length,
      "Part 7": topics.filter((t) => (t.part || "").includes("7")).length,
    };
  }, [topics]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const topicTitle = (t.title || t.titleVi || "").toLowerCase();
      const topicEnTitle = (t.englishTitle || t.titleEn || "").toLowerCase();
      const matchSearch =
        !q ||
        topicTitle.includes(q) ||
        topicEnTitle.includes(q) ||
        (t.code || "").toLowerCase().includes(q) ||
        (t.formula || "").toLowerCase().includes(q) ||
        (t.summary || "").toLowerCase().includes(q);

      const partStr = t.part || "";
      const matchPart =
        filterPart === "ALL" ||
        partStr.toLowerCase() === filterPart.toLowerCase() ||
        (filterPart === "Part 5" && partStr.includes("5")) ||
        (filterPart === "Part 6" && partStr.includes("6")) ||
        (filterPart === "Part 7" && partStr.includes("7"));

      return matchSearch && matchPart;
    });
  }, [topics, searchQuery, filterPart]);

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm và bộ lọc học viên */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tìm kiếm */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chuyên đề, công thức, mã..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Bộ lọc theo Part */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(["ALL", "Part 5", "Part 6", "Part 7"] as const).map((part) => {
            const count = partCounts[part] || 0;
            const isActive = filterPart === part;
            return (
              <button
                key={part}
                type="button"
                onClick={() => setFilterPart(part)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span>{part === "ALL" ? "Tất cả" : part}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid danh sách chuyên đề Ngữ pháp */}
      {filteredTopics.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
          Không tìm thấy chuyên đề ngữ pháp nào phù hợp với bộ lọc tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <StudentGrammarCardItem
              key={topic.id}
              topic={topic}
              onOpenTheory={onOpenTheory}
              onStartQuiz={onStartQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
};
