"use client";

import React from "react";
import {
  Search,
  Plus,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Sliders,
  Download,
  LayoutGrid,
  List,
  CheckCircle2,
} from "lucide-react";

export type GrammarAdminTab = "topics" | "questions" | "traps_matrix" | "curriculum";

interface GrammarFilterBarProps {
  activeMainTab: GrammarAdminTab;
  setActiveMainTab: (tab: GrammarAdminTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPart: string;
  setFilterPart: (p: string) => void;
  filterStatus: string;
  setFilterStatus: (st: string) => void;
  viewMode: "table" | "grid";
  setViewMode: (vm: "table" | "grid") => void;
  totalTopicsCount: number;
  totalQuestionsCount: number;
  selectedTopicIds: string[];
  onOpenCreateModal: () => void;
  onExportCsv: () => void;
  onBulkPublish: () => void;
  onBulkDraft: () => void;
  onBulkDelete: () => void;
}

export const GrammarFilterBar: React.FC<GrammarFilterBarProps> = ({
  activeMainTab,
  setActiveMainTab,
  searchQuery,
  setSearchQuery,
  filterPart,
  setFilterPart,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
  totalTopicsCount,
  totalQuestionsCount,
  selectedTopicIds,
  onOpenCreateModal,
  onExportCsv,
  onBulkPublish,
  onBulkDraft,
  onBulkDelete,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner - Image 1 Clean Layout */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Quản lý nội dung <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Quản lý chuyên đề ngữ pháp</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">
            Quản lý chuyên đề ngữ pháp TOEIC
          </h1>
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
            onClick={onOpenCreateModal}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 cursor-pointer transition"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Thêm chuyên đề mới</span>
          </button>
        </div>
      </header>

      {/* Main Admin Feature Tabs */}
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
          <span>Danh mục chuyên đề ({totalTopicsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("questions")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "questions"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ngân hàng câu hỏi trắc nghiệm ({totalQuestionsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("traps_matrix")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
            activeMainTab === "traps_matrix"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Phân tích bẫy đề &amp; Độ khó</span>
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
          <span>Cấu hình lộ trình &amp; Xuất bản</span>
        </button>
      </div>

      {/* Filter Toolbar (Only when activeMainTab === "topics") */}
      {activeMainTab === "topics" && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full lg:w-72 xl:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm công thức, tên chuyên đề, mã..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Filter Dropdowns & View Mode Switcher */}
            <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto no-scrollbar w-full lg:w-auto">
              <select
                value={filterPart}
                onChange={(e) => setFilterPart(e.target.value)}
                className="shrink-0 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả phần thi</option>
                <option value="Part 5">Part 5 (Câu đơn)</option>
                <option value="Part 6">Part 6 (Điền đoạn)</option>
                <option value="Part 7">Part 7 (Đọc hiểu & Cấu trúc câu)</option>
              </select>


              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="shrink-0 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PUBLISHED">Đã phát hành</option>
                <option value="DRAFT">Bản nháp</option>
              </select>

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

          {/* Selected Batch Actions */}
          {selectedTopicIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-200 animate-in fade-in">
              <span className="text-xs font-bold text-blue-900">
                Đã chọn <strong className="text-blue-700">{selectedTopicIds.length}</strong> chuyên đề
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBulkPublish}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Phát hành</span>
                </button>
                <button
                  type="button"
                  onClick={onBulkDraft}
                  className="px-3 py-1.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Chuyển nháp</span>
                </button>
                <button
                  type="button"
                  onClick={onBulkDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

