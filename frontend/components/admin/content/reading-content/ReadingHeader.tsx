"use client";

import React from "react";
import { Sparkles, BookOpen, Plus } from "lucide-react";

interface ReadingHeaderProps {
  activeMainTab: "grammar" | "part5" | "part6" | "part7";
  setActiveMainTab: (tab: "grammar" | "part5" | "part6" | "part7") => void;
  activeSubFilter: "all" | "word_types" | "verbs" | "other_grammar";
  setActiveSubFilter: (filter: "all" | "word_types" | "verbs" | "other_grammar") => void;
  onOpenCreateCard: () => void;
}

export const ReadingHeader: React.FC<ReadingHeaderProps> = ({
  activeMainTab,
  setActiveMainTab,
  activeSubFilter,
  setActiveSubFilter,
  onOpenCreateCard,
}) => {
  return (
    <div className="space-y-6">
      {/* HEADER BANNER LUYỆN ĐỌC TOEIC */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Luyện đọc TOEIC Part 5, 6, 7 & Ngữ pháp trọng tâm
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kho bài tập <span className="text-blue-600">TOEIC Reading</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Học song ngữ Anh–Việt, phân tích câu theo 3 bước chi tiết, tra từ điển tức thì và ôn luyện câu sai dễ dàng.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* MAIN TABS SWITCHER & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Main Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: "grammar", label: "Ngữ pháp" },
            { id: "part5", label: "Part 5" },
            { id: "part6", label: "Part 6" },
            { id: "part7", label: "Part 7" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveMainTab(tab.id as any);
                if (tab.id === "grammar") setActiveSubFilter("all");
              }}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeMainTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Card Button */}
        <button
          type="button"
          onClick={onOpenCreateCard}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm chủ điểm mới
        </button>
      </div>

      {/* SUBCATEGORY FILTERS FOR GRAMMAR TAB */}
      {activeMainTab === "grammar" && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {[
            { id: "all", label: "Tất cả ngữ pháp" },
            { id: "word_types", label: "Từ loại (Noun/Adj/Adv)" },
            { id: "verbs", label: "Động từ & Thì" },
            { id: "other_grammar", label: "Mệnh đề & Từ nối" },
          ].map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubFilter(sub.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubFilter === sub.id
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
