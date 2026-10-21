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
      <div>
        {/* Card Header */}
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
        <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors line-clamp-1">
          {topic.titleVi || topic.title}
        </h3>
        <p className="text-xs text-slate-400 italic mt-0.5">{topic.titleEn || topic.englishTitle}</p>

        {/* Formula Callout */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Công thức trọng tâm
          </span>
          <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">
            {(topic.formula || "")
              .replace(/###\s+\d+\.\s*/g, "")
              .replace(/###\s+/g, "")
              .replace(/\*\*/g, "")
              .replace(/`([^`]+)`/g, "$1")
              .replace(/\n+/g, " • ")
              .trim()}
          </p>
        </div>

        {/* Badges / Metrics */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {totalQ} câu bài tập
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {trapsCount} bẫy đề thi
          </span>
        </div>

        {/* Khung thống kê và các nút điều khiển học tập */}
        <div className="pt-2">
          <StudentCardProgressAction
            progressKey={`grammar-${topic.id}`}
            totalQuestions={totalQ || 30}
            savedCount={trapsCount || 1}
            actionLabel="Học ngay"
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
            placeholder="Tìm theo chủ đề, mã, công thức..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Lọc theo Phần thi */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "Tất cả phần", count: partCounts.ALL },
            { id: "Part 5", label: "Part 5", count: partCounts["Part 5"] },
            { id: "Part 6", label: "Part 6", count: partCounts["Part 6"] },
            { id: "Part 7", label: "Part 7", count: partCounts["Part 7"] },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilterPart(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                filterPart === p.id
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{p.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  filterPart === p.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {p.count}
              </span>
            </button>
          ))}
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
