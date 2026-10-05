"use client";

import React from "react";
import { Sparkles, ClipboardCheck, BookOpen, BarChart2, Plus } from "lucide-react";

interface MockTestHeaderProps {
  activeMainTab: "study" | "progress";
  setActiveMainTab: (tab: "study" | "progress") => void;
  selectedVol: "vol1" | "vol2";
  setSelectedVol: (vol: "vol1" | "vol2") => void;
  vol1Count: number;
  vol2Count: number;
  onOpenCreateTest: () => void;
}

export const MockTestHeader: React.FC<MockTestHeaderProps> = ({
  activeMainTab,
  setActiveMainTab,
  selectedVol,
  setSelectedVol,
  vol1Count,
  vol2Count,
  onOpenCreateTest,
}) => {
  return (
    <div className="space-y-6">
      {/* HEADER BANNER LUYỆN ĐỀ THI TOEIC THỰC TẾ */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Đề thi TOEIC mô phỏng sát đề thi thật
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Luyện đề thi <span className="text-blue-600">TOEIC thực tế</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Nghe chép chính tả, đọc song ngữ Anh–Việt, thêm từ vào giỏ từ vựng, xem dẫn chứng và giải thích chi tiết từng câu.
          </p>
        </div>

        {/* Icon Clipboard xanh lớn góc phải */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* THANH TAB CHUYỂN CHẾ ĐỘ CHÍNH: HỌC vs TIẾN ĐỘ */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveMainTab("study")}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "study"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Học
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("progress")}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeMainTab === "progress"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Tiến độ
        </button>
      </div>

      {/* THANH CHỌN BỘ ĐỀ (VOL 1, VOL 2) & THÊM ĐỀ KHI ĐANG Ở TAB "HỌC" */}
      {activeMainTab === "study" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedVol("vol1")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedVol === "vol1"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Crack TOEIC Vol 1 ({vol1Count})
            </button>

            <button
              type="button"
              onClick={() => setSelectedVol("vol2")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedVol === "vol2"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Crack TOEIC Vol 2 ({vol2Count})
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCreateTest}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm đề thi mới
          </button>
        </div>
      )}
    </div>
  );
};
