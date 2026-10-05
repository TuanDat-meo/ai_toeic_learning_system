"use client";

import React from "react";
import { Headphones, Sparkles } from "lucide-react";

interface ListeningHeaderProps {
  activeTab: "dictation" | "part1" | "part2" | "part3" | "part4";
  setActiveTab: (tab: "dictation" | "part1" | "part2" | "part3" | "part4") => void;
}

export const ListeningHeader: React.FC<ListeningHeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="space-y-7">
      {/* HEADER BANNER CHINH PHỤC TOEIC LISTENING */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Luyện nghe TOEIC
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">TOEIC Listening</span> từ dễ đến khó
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Nghe chép chính tả và luyện Part 1–4 theo 4 cấp độ.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* THANH TAB CHÍNH (NGHE CHÉP, PART 1, PART 2, PART 3, PART 4) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("dictation")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "dictation"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Nghe chép
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part1")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part1"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 1
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part2")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part2"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 2
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part3")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part3"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 3
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("part4")}
          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "part4"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          Part 4
        </button>
      </div>
    </div>
  );
};
