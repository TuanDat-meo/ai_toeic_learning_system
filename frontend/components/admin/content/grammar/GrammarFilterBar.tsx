"use client";

import React from "react";
import { Search, Plus, Play, BookOpen, Star, BarChart3, Sparkles } from "lucide-react";
import { PartFilter, TargetScoreFilter } from "@/app/admin/content/grammar/types";

interface GrammarFilterBarProps {
  activeMainTab: "topics" | "progress" | "starred" | "rules";
  setActiveMainTab: (tab: "topics" | "progress" | "starred" | "rules") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPart: string;
  setFilterPart: (p: string) => void;
  filterScore: string;
  setFilterScore: (s: string) => void;
  totalTopicsCount: number;
  studiedTopicsCount: number;
  starredTopicsCount: number;
  selectedTopicIds: string[];
  onOpenCreateModal: () => void;
  onStartMasterQuiz: () => void;
  onStartSelectedTopicsQuiz: () => void;
  onBulkStar: () => void;
  onBulkResetProgress: () => void;
}

export const GrammarFilterBar: React.FC<GrammarFilterBarProps> = ({
  activeMainTab,
  setActiveMainTab,
  searchQuery,
  setSearchQuery,
  filterPart,
  setFilterPart,
  filterScore,
  setFilterScore,
  totalTopicsCount,
  studiedTopicsCount,
  starredTopicsCount,
  selectedTopicIds,
  onOpenCreateModal,
  onStartMasterQuiz,
  onStartSelectedTopicsQuiz,
  onBulkStar,
  onBulkResetProgress,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Chuyên Đề Ngữ Pháp TOEIC
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700">
              Grammar Master
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Tổng hợp các cấu trúc ngữ pháp Part 5 & 6, công thức bẫy TOEIC, câu hỏi minh họa và bài luyện tập tương tác.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartMasterQuiz}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Luyện ngẫu nhiên (10 câu)</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm chủ điểm mới</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <button
          type="button"
          onClick={() => setActiveMainTab("topics")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "topics"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tất cả chủ điểm ({totalTopicsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("progress")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "progress"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Đã luyện tập ({studiedTopicsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("starred")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "starred"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>Yêu thích ({starredTopicsCount})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công thức, tên chủ điểm, mã..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={filterPart}
              onChange={(e) => setFilterPart(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả phần thi (Part 5 & 6)</option>
              <option value="Part 5">Part 5 (Câu đơn)</option>
              <option value="Part 6">Part 6 (Điền đoạn)</option>
            </select>

            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả mục tiêu điểm</option>
              <option value="350-500">Mục tiêu 350 - 500</option>
              <option value="500-750">Mục tiêu 500 - 750</option>
              <option value="750+">Mục tiêu 750+</option>
            </select>
          </div>
        </div>

        {/* Selected Batch Actions */}
        {selectedTopicIds.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-200 animate-in fade-in">
            <span className="text-xs font-bold text-blue-900">
              Đã chọn <strong className="text-blue-700">{selectedTopicIds.length}</strong> chủ điểm ngữ pháp
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onStartSelectedTopicsQuiz}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Luyện tập các mục đã chọn</span>
              </button>
              <button
                type="button"
                onClick={onBulkStar}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Ghim yêu thích</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
