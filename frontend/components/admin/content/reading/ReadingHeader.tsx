"use client";

import React from "react";
import {
  Search,
  Plus,
  BookOpen,
  FileText,
  TrendingUp,
  Sliders,
  Download,
  List,
  LayoutGrid,
} from "lucide-react";

export type ReadingAdminTab = "reading_units" | "passages" | "reading_analytics" | "curriculum";

interface ReadingHeaderProps {
  activeMainTab: ReadingAdminTab;
  setActiveMainTab: (tab: ReadingAdminTab) => void;
  selectedCategory: "all" | "grammar" | "part5" | "part6" | "part7";
  setSelectedCategory: (cat: "all" | "grammar" | "part5" | "part6" | "part7") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: "table" | "grid";
  setViewMode: (v: "table" | "grid") => void;
  totalCardsCount: number;
  onOpenCreateCard: () => void;
  onExportCsv: () => void;
}

export const ReadingHeader: React.FC<ReadingHeaderProps> = ({
  activeMainTab,
  setActiveMainTab,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  totalCardsCount,
  onOpenCreateCard,
  onExportCsv,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner - Image 1 Clean Layout */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Quản lý nội dung <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Quản lý kho bài đọc TOEIC</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">
            Quản lý kho bài tập TOEIC Reading
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
            Hệ thống quản lý chuyên đề đọc hiểu Part 5, 6 &amp; 7, phân tích bài đọc song ngữ, quản lý đoạn văn và ngân hàng câu hỏi.
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
          <button
            type="button"
            onClick={onOpenCreateCard}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 cursor-pointer transition"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Thêm bài đọc mới</span>
          </button>
        </div>
      </header>

      {/* Main Admin Feature Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <button
          type="button"
          onClick={() => setActiveMainTab("reading_units")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "reading_units"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Danh sách bài đọc &amp; Chuyên đề ({totalCardsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("passages")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "passages"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kho đoạn văn Part 6 &amp; 7 (Passage Bank)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("reading_analytics")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "reading_analytics"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Phân tích tốc độ đọc &amp; Độ chính xác</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("curriculum")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "curriculum"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Cấu hình phân loại &amp; Lộ trình</span>
        </button>
      </div>

      {/* Filter Toolbar (When tab === "reading_units") */}
      {activeMainTab === "reading_units" && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full lg:w-72 xl:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên chuyên đề, từ khóa..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Part / Category Filters & View Switcher */}
            <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto no-scrollbar w-full lg:w-auto">
              <div className="shrink-0 flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "grammar", label: "Ngữ pháp" },
                  { id: "part5", label: "Part 5" },
                  { id: "part6", label: "Part 6" },
                  { id: "part7", label: "Part 7" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        item.id as "all" | "grammar" | "part5" | "part6" | "part7"
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCategory === item.id
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="shrink-0 flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Dạng bảng dữ liệu"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bảng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Dạng thẻ lưới"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
