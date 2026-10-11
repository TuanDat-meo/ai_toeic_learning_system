"use client";

import React from "react";
import {
  Headphones,
  Plus,
  Download,
  BookOpen,
  FileAudio,
  Globe,
  Sliders,
} from "lucide-react";

export type ListeningAdminTab = "listening_units" | "audio_assets" | "accent_matrix";

interface ListeningHeaderProps {
  activeAdminTab: ListeningAdminTab;
  setActiveAdminTab: (tab: ListeningAdminTab) => void;
  activePartTab: "dictation" | "part1" | "part2" | "part3" | "part4";
  setActivePartTab: (tab: "dictation" | "part1" | "part2" | "part3" | "part4") => void;
  onOpenCreate?: () => void;
  onExportCsv: () => void;
}

export const ListeningHeader: React.FC<ListeningHeaderProps> = ({
  activeAdminTab,
  setActiveAdminTab,
  activePartTab,
  setActivePartTab,
  onOpenCreate,
  onExportCsv,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner - Image 1 Clean Layout */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Quản lý nội dung <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Quản lý kho bài nghe TOEIC</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">
            Quản lý kho bài tập TOEIC Listening
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
            Hệ thống quản lý audio đề thi Part 1–4, kiểm duyệt chép chính tả Dictation, quản lý transcript và giọng đọc bản xứ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition"
          >
            <Download size={16} className="text-slate-500" aria-hidden="true" />
            <span>Xuất file CSV</span>
          </button>
          {onOpenCreate && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 cursor-pointer transition"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Thêm bài nghe mới</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Admin Feature Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <button
          type="button"
          onClick={() => setActiveAdminTab("listening_units")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeAdminTab === "listening_units"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Danh sách bài nghe &amp; Chép chính tả</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab("audio_assets")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeAdminTab === "audio_assets"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileAudio className="w-4 h-4" />
          <span>Quản lý tệp Audio &amp; Giọng đọc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab("accent_matrix")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeAdminTab === "accent_matrix"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Ma trận ngữ âm &amp; Giọng đọc bản xứ</span>
        </button>
      </div>

      {/* Sub Part Filter (When tab === "listening_units") */}
      {activeAdminTab === "listening_units" && (
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl max-w-full overflow-x-auto no-scrollbar shadow-2xs">
          {[
            { id: "dictation", label: "Chép chính tả (Dictation)" },
            { id: "part1", label: "Part 1 (Mô tả tranh)" },
            { id: "part2", label: "Part 2 (Hỏi - Đáp)" },
            { id: "part3", label: "Part 3 (Hội thoại)" },
            { id: "part4", label: "Part 4 (Bài nói ngắn)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActivePartTab(
                  tab.id as "dictation" | "part1" | "part2" | "part3" | "part4"
                )
              }
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activePartTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
