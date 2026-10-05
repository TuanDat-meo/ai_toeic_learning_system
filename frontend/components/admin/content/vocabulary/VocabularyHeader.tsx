"use client";

import React from "react";
import { Sparkles, BookOpen, Book, TrendingUp, Star, Brain } from "lucide-react";

interface VocabularyHeaderProps {
  activeMainTab: "study" | "progress" | "my_words" | "algorithm";
  setActiveMainTab: (tab: "study" | "progress" | "my_words" | "algorithm") => void;
}

export const VocabularyHeader: React.FC<VocabularyHeaderProps> = ({
  activeMainTab,
  setActiveMainTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Spaced Repetition System
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">Từ vựng TOEIC</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Học theo phương pháp lặp lại ngắt quãng: đúng từ, đúng lúc, nhớ lâu mà tốn ít công sức.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMainTab("study")}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeMainTab === "study"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <Book className="w-4 h-4" />
            Học
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("progress")}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeMainTab === "progress"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Tiến độ
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("my_words")}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeMainTab === "my_words"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <Star className="w-4 h-4" />
            Từ vựng của tôi
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("algorithm")}
            className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeMainTab === "algorithm"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <Brain className="w-4 h-4" />
            Thuật toán học từ
          </button>
        </div>
      </div>
    </div>
  );
};
