"use client";

import React from "react";
import {
  Search,
  Plus,
  BookOpen,
  Users,
  Sliders,
  Layers,
  Download,
  List,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";

export type MockTestAdminTab = "tests" | "submissions" | "score_conversion" | "collections";

interface MockTestHeaderProps {
  activeMainTab: MockTestAdminTab;
  setActiveMainTab: (tab: MockTestAdminTab) => void;
  selectedVol: "all" | "vol1" | "vol2" | "vol3";
  setSelectedVol: (vol: "all" | "vol1" | "vol2" | "vol3") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterDifficulty?: string;
  setFilterDifficulty?: (d: string) => void;
  viewMode: "table" | "grid";
  setViewMode: (v: "table" | "grid") => void;
  vol1Count: number;
  vol2Count: number;
  vol3Count?: number;
  onOpenCreateTest: () => void;
  onExportCsv: () => void;
  onSyncData?: () => void;
}

export const MockTestHeader: React.FC<MockTestHeaderProps> = ({
  activeMainTab,
  setActiveMainTab,
  selectedVol,
  setSelectedVol,
  searchQuery,
  setSearchQuery,
  filterDifficulty,
  setFilterDifficulty,
  viewMode,
  setViewMode,
  vol1Count,
  vol2Count,
  vol3Count = 0,
  onOpenCreateTest,
  onExportCsv,
  onSyncData,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner - Image 1 Clean Layout */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Quản lý nội dung <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Quản lý đề thi thử TOEIC</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">
            Quản lý ngân hàng đề thi thử TOEIC
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
            Hệ thống kiểm duyệt 200 câu hỏi Listening &amp; Reading, quản lý audio bài thi, thống kê nộp bài và thang điểm quy đổi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onSyncData && (
            <button
              type="button"
              onClick={onSyncData}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer shadow-xs transition"
              title="Đồng bộ danh sách 29 đề thi từ E:\Data và làm mới bộ nhớ cache"
            >
              <RefreshCw size={16} className="text-emerald-700" aria-hidden="true" />
              <span>Đồng bộ từ Data</span>
            </button>
          )}
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
            onClick={onOpenCreateTest}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 cursor-pointer transition"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Thêm đề thi mới</span>
          </button>
        </div>
      </header>

      {/* Main Admin Feature Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        <button
          type="button"
          onClick={() => setActiveMainTab("tests")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "tests"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ngân hàng đề thi ({vol1Count + vol2Count + (vol3Count || 0)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("submissions")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "submissions"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Nhật ký nộp bài học viên (1,842 bài)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("score_conversion")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "score_conversion"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Thang quy đổi điểm (Raw to 990)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("collections")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "collections"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Quản lý bộ sưu tập</span>
        </button>
      </div>

      {/* Filter Toolbar (When tab === "tests") */}
      {activeMainTab === "tests" && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full lg:w-72 xl:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên đề thi, từ khóa..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Collection Tabs & Difficulty & View Mode */}
            <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto no-scrollbar w-full lg:w-auto">
              {/* Collection switcher */}
              <div className="shrink-0 flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedVol("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedVol === "all"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả ({vol1Count + vol2Count + (vol3Count || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVol("vol1")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedVol === "vol1"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ETS 2024 ({vol1Count})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVol("vol2")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedVol === "vol2"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ETS 2023 ({vol2Count})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVol("vol3")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedVol === "vol3"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ETS 2022 ({vol3Count || 0})
                </button>
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
