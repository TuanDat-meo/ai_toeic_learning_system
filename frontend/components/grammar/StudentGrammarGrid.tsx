"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  AlertTriangle,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  X,
  Target,
  ArrowUpDown,
  BookOpen,
  Play,
  RotateCcw,
} from "lucide-react";
import { GrammarTopicItem } from "@/app/admin/content/grammar/types";
import { StudentCardProgressAction } from "@/components/common/StudentCardProgressAction";
import { searchGrammar, setGrammarBookmark, removeGrammarBookmark } from "@/lib/api/grammar";

interface StudentGrammarGridProps {
  topics: GrammarTopicItem[];
  onOpenTheory: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem, startIndex?: number, isRedoWrong?: boolean) => void;
}

function StudentGrammarCardItem({
  topic,
  onOpenTheory,
  onStartQuiz,
  isBookmarked,
  onToggleBookmark,
}: {
  topic: GrammarTopicItem;
  onOpenTheory: (topic: GrammarTopicItem) => void;
  onStartQuiz: (topic: GrammarTopicItem, startIndex?: number, isRedoWrong?: boolean) => void;
  isBookmarked: boolean;
  onToggleBookmark: (topicId: string, currentState: boolean) => void;
}) {
  const router = useRouter();
  const totalQ = topic.questions?.length || topic.totalQuestions || 0;
  const trapsCount = topic.traps?.length || 0;
  const completedQ = topic.completedQuestions ?? 0;
  const progressPercent = totalQ ? Math.min(100, Math.round((completedQ / totalQ) * 100)) : 0;

  // Format Target Score
  const scoreLabel = useMemo(() => {
    if (!topic.targetScore) return null;
    const raw = String(topic.targetScore).trim();
    if (raw.includes("350")) return "Target 350+";
    if (raw.includes("500")) return "Target 500+";
    if (raw.includes("650")) return "Target 650+";
    if (raw.includes("750")) return "Target 750+";
    if (raw.includes("900")) return "Target 900+";
    return `Band ${raw}`;
  }, [topic.targetScore]);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        {/* Card Top: Code, Part, Target Score, Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {topic.code}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
              {topic.part || "Part 5-6"}
            </span>
            {scoreLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Target className="w-2.5 h-2.5 text-amber-600" />
                {scoreLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(topic.id, isBookmarked);
              }}
              title={isBookmarked ? "Đã lưu vào sổ tay (Nhấn để hủy)" : "Lưu vào sổ tay"}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                isBookmarked
                  ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title & Info */}
        <div>
          <h4
            onClick={() => onOpenTheory(topic)}
            className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
          >
            {topic.titleVi || topic.title}
          </h4>
          <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
            {topic.titleEn || topic.englishTitle || "TOEIC Grammar Topic"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {topic.learningStatus && (
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {topic.learningStatus}
              </span>
            )}
            {(topic.dueCount ?? 0) > 0 && (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {topic.dueCount} câu đến hạn
              </span>
            )}
          </div>

          {topic.lockedSoft && topic.prerequisiteNames?.length ? (
            <p className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-50/80 rounded-md p-1.5 border border-amber-200">
              💡 Khuyên học trước: {topic.prerequisiteNames.join(", ")}
            </p>
          ) : null}
        </div>

        {/* Badges / Metrics */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {totalQ} câu bài tập
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {trapsCount} bẫy đề thi
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Tiến độ</span>
            <span>
              {completedQ}/{totalQ} câu ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent >= 100
                  ? "bg-emerald-500"
                  : progressPercent > 0
                  ? "bg-blue-600"
                  : "bg-slate-200"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2">
          <StudentCardProgressAction
            progressKey={`grammar-${topic.id}`}
            totalQuestions={totalQ}
            savedCount={topic.savedCount ?? (isBookmarked ? 1 : 0)}
            completedCount={completedQ}
            wrongCountOverride={topic.wrongCount ?? 0}
            actionLabel={completedQ > 0 ? "Tiếp tục" : "Luyện tập"}
            onStart={(nextIdx) => onStartQuiz(topic, nextIdx, false)}
            onRedoWrong={() => onStartQuiz(topic, 0, true)}
            onOpenTheory={() => onOpenTheory(topic)}
            onOpenSaved={() => router.push(`/grammar/notebook?topicId=${encodeURIComponent(topic.id)}`)}
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
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterScore, setFilterScore] = useState<string>("ALL");
  const [sortMode, setSortMode] = useState<string>("DEFAULT");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [serverTopicIds, setServerTopicIds] = useState<string[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<Set<string>>(new Set());

  // Debounced server search
  useEffect(() => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      setServerTopicIds(null);
      setSearchError(null);
      return;
    }
    const timeout = window.setTimeout(() => {
      void searchGrammar(keyword)
        .then((result) => {
          setServerTopicIds(
            (result.topics || [])
              .map((topic) => String(topic.id ?? ""))
              .filter(Boolean),
          );
          setSearchError(null);
        })
        .catch((error) => {
          setServerTopicIds(null);
          setSearchError(error instanceof Error ? error.message : "Tìm kiếm ngữ pháp không khả dụng.");
        });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  // Handle bookmark toggle
  const handleToggleBookmark = async (topicId: string, currentState: boolean) => {
    try {
      if (currentState) {
        await removeGrammarBookmark("TOPIC", topicId);
        setBookmarkedTopicIds((prev) => {
          const next = new Set(prev);
          next.delete(topicId);
          return next;
        });
      } else {
        await setGrammarBookmark("TOPIC", topicId, "Đánh dấu từ danh sách chuyên đề");
        setBookmarkedTopicIds((prev) => new Set(prev).add(topicId));
      }
    } catch (err) {
      console.warn("Không thể cập nhật dấu trang:", err);
    }
  };

  const partCounts = useMemo(() => {
    return {
      ALL: topics.length,
      "Part 5": topics.filter((t) => (t.part || "").includes("5")).length,
      "Part 6": topics.filter((t) => (t.part || "").includes("6")).length,
      "Part 7": topics.filter((t) => (t.part || "").includes("7")).length,
    };
  }, [topics]);

  const hasActiveFilters =
    filterPart !== "ALL" ||
    filterStatus !== "ALL" ||
    filterDifficulty !== "ALL" ||
    filterScore !== "ALL" ||
    sortMode !== "DEFAULT" ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSearchQuery("");
    setFilterPart("ALL");
    setFilterStatus("ALL");
    setFilterDifficulty("ALL");
    setFilterScore("ALL");
    setSortMode("DEFAULT");
    setServerTopicIds(null);
  };

  const filteredTopics = useMemo(() => {
    const base = topics.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      if (q && serverTopicIds) {
        if (!serverTopicIds.includes(t.id)) return false;
      }
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

      const matchStatus =
        filterStatus === "ALL" ||
        (filterStatus === "CHƯA HỌC" && (!t.learningStatus || t.learningStatus === "CHƯA HỌC")) ||
        t.learningStatus === filterStatus;

      const matchDifficulty =
        filterDifficulty === "ALL" ||
        String(t.difficulty || "").toUpperCase() === filterDifficulty;

      const matchScore =
        filterScore === "ALL" ||
        (filterScore === "350_500" && String(t.targetScore || "").includes("350")) ||
        (filterScore === "500_750" && (String(t.targetScore || "").includes("500") || String(t.targetScore || "").includes("650"))) ||
        (filterScore === "750_PLUS" && (String(t.targetScore || "").includes("750") || String(t.targetScore || "").includes("900")));

      return matchSearch && matchPart && matchStatus && matchDifficulty && matchScore;
    });

    if (sortMode === "NEW") {
      return [...base].sort((a, b) => (b.orderIndex ?? 0) - (a.orderIndex ?? 0));
    }
    if (sortMode === "PRIORITY") {
      return [...base].sort((a, b) => (b.dueCount ?? 0) - (a.dueCount ?? 0));
    }
    return base;
  }, [topics, searchQuery, serverTopicIds, filterPart, filterStatus, filterDifficulty, filterScore, sortMode]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên chuyên đề, công thức, mã..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Part Chips & Filter Drawer Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{part === "ALL" ? "Tất cả Part" : part}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-blue-500/50 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                showFilters
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Bộ lọc nâng cao
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showFilters && (
          <div className="grid gap-2.5 pt-3 border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-150">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Trạng thái học</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="CHƯA HỌC">Chưa học</option>
                <option value="ĐANG HỌC">Đang học</option>
                <option value="CẦN ÔN LẠI">Cần ôn lại</option>
                <option value="ĐÃ ĐẠT">Đã đạt</option>
                <option value="ĐÃ GHI NHỚ">Đã ghi nhớ</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Mục tiêu điểm (Target)</label>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Mọi mục tiêu điểm</option>
                <option value="350_500">Nền tảng (350–500)</option>
                <option value="500_750">Trung cấp (500–750)</option>
                <option value="750_PLUS">Nâng cao (750+)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Độ khó</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Mọi độ khó</option>
                <option value="EASY">Dễ (Basic)</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Sắp xếp</label>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="DEFAULT">Thứ tự mặc định</option>
                <option value="PRIORITY">Cần ôn gấp (SRS cao nhất)</option>
                <option value="NEW">Mới thêm gần đây</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Summary & Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <span>
            Hiển thị <strong className="text-slate-800">{filteredTopics.length}</strong> / {topics.length} chuyên đề
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {searchError && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Tìm kiếm máy chủ không khả dụng: {searchError}. Danh sách chuyên đề vẫn được giữ nguyên.
        </div>
      )}

      {/* Grid danh sách chuyên đề Ngữ pháp */}
      {filteredTopics.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">Không tìm thấy chuyên đề ngữ pháp phù hợp</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Hãy thử tìm bằng từ khóa khác hoặc bấm nút đặt lại bộ lọc để xem toàn bộ chuyên đề.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <StudentGrammarCardItem
              key={topic.id}
              topic={topic}
              onOpenTheory={onOpenTheory}
              onStartQuiz={onStartQuiz}
              isBookmarked={bookmarkedTopicIds.has(topic.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
