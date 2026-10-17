"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Play,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentGrammarGridProps {
  topics: GrammarTopicItem[];
  onOpenTheory: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem) => void;
}

function StudentGrammarCardItem({
  topic,
  onOpenTheory,
  onStartQuiz,
}: {
  topic: GrammarTopicItem;
  onOpenTheory: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem) => void;
}) {
  const totalQ = topic.questions.length;
  const trapsCount = topic.traps.length;
  const progress = useItemProgress(`grammar-${topic.id}`, totalQ);

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
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Target {topic.targetScore}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700">
            <Sparkles className="w-3 h-3 text-sky-600" />
            TOEIC Core
          </span>
        </div>

        {/* Title & Info */}
        <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors line-clamp-1">
          {topic.title}
        </h3>
        <p className="text-xs text-slate-400 italic mt-0.5">{topic.englishTitle}</p>

        {/* Formula Callout */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Công thức trọng tâm
          </span>
          <p className="text-xs font-mono font-bold text-slate-800 line-clamp-2">
            {topic.formula}
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

        {/* Tiến độ câu hoàn thành */}
        <div className="mt-3.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
          <PracticeProgressBar
            completed={progress.completedQuestions}
            total={totalQ}
            unit="câu"
          />
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Đã làm: <strong className="text-slate-800 font-mono">{progress.completedQuestions}</strong> câu
            </span>
            <span className="font-mono text-slate-400">
              Còn lại: <strong className="text-slate-600 font-mono">{Math.max(0, totalQ - progress.completedQuestions)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenTheory(topic)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          title="Xem chi tiết công thức, dấu hiệu và bẫy đề"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          Lý thuyết
        </button>

        <button
          type="button"
          onClick={() => onStartQuiz(topic)}
          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          title="Bắt đầu làm bài trắc nghiệm chuyên đề"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Luyện tập
        </button>
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
  const [filterScore, setFilterScore] = useState<string>("ALL");

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.englishTitle.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.formula.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.targetScore.toLowerCase().includes(q);

      const matchPart = filterPart === "ALL" || t.part === filterPart;

      const matchScore =
        filterScore === "ALL" ||
        t.targetScore === filterScore ||
        (filterScore === "350-500" && (t.targetScore.includes("350") || t.targetScore.includes("500"))) ||
        (filterScore === "500-750" && (t.targetScore.includes("500") || t.targetScore.includes("750"))) ||
        (filterScore === "750+" && (t.targetScore.includes("750") || t.targetScore.includes("800") || t.targetScore.includes("900")));

      return matchSearch && matchPart && matchScore;
    });
  }, [topics, searchQuery, filterPart, filterScore]);

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm và bộ lọc học viên */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tìm kiếm */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, mã, target, công thức..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Lọc theo Phần thi & Band điểm */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Lọc phần thi */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
            {["ALL", "Part 5", "Part 6", "Part 7"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPart(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  filterPart === p
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p === "ALL" ? "Tất cả phần" : p}
              </button>
            ))}
          </div>

          {/* Lọc band điểm chuẩn hóa theo Target có trong bài */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
            {[
              { id: "ALL", label: "Mọi Band" },
              { id: "350-500", label: "Target 350-500" },
              { id: "500-750", label: "Target 500-750" },
              { id: "750+", label: "Target 750+" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilterScore(s.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  filterScore === s.id
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
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
