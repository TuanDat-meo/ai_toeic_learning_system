"use client";

import React from "react";
import {
  Search,
  Plus,
  FileDown,
  FileUp,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { QuestionPart } from "@/app/admin/content/questions-content/types";
import { DEFAULT_PARTS, DEFAULT_SKILLS } from "@/app/admin/content/questions-content/mockData";

interface QuestionFilterBarProps {
  selectedPartTab: QuestionPart | "ALL";
  setSelectedPartTab: (part: QuestionPart | "ALL") => void;
  keyword: string;
  setKeyword: (kw: string) => void;
  selectedSkill: string;
  setSelectedSkill: (sk: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  selectedStatus: string;
  setSelectedStatus: (st: string) => void;
  viewMode: "table" | "cards";
  setViewMode: (vm: "table" | "cards") => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onOpenCreateModal: () => void;
  onExportCsv?: () => void;
  playSfx?: (sound: string) => void;
  showToast?: (msg: string) => void;
}

export const QuestionFilterBar: React.FC<QuestionFilterBarProps> = ({
  selectedPartTab,
  setSelectedPartTab,
  keyword,
  setKeyword,
  selectedSkill,
  setSelectedSkill,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  selectedCount,
  onBulkDelete,
  onOpenCreateModal,
  onExportCsv = () => {},
  playSfx = () => {},
  showToast = () => {},
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Ngân Hàng Câu Hỏi TOEIC
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700">
              ETS Standard
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Quản lý toàn bộ câu hỏi Part 1 - Part 7, lời giải thích chi tiết, bộ từ vựng và xem trước tương tác.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              showToast("Vui lòng chọn tệp CSV để nhập dữ liệu câu hỏi!");
            }}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
          >
            <FileUp className="w-4 h-4 text-slate-500" />
            <span>Nhập CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onExportCsv();
            }}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenCreateModal();
            }}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo câu hỏi</span>
          </button>
        </div>
      </div>

      {/* Part Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {DEFAULT_PARTS.map((p) => {
          const isActive = selectedPartTab === p.part;
          return (
            <button
              key={p.part}
              type="button"
              onClick={() => {
                playSfx("click");
                setSelectedPartTab(p.part);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm câu hỏi, mã P1-001, từ khóa..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Skill Select */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Tất cả kỹ năng</option>
              {DEFAULT_SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Tất cả độ khó</option>
              <option value="Easy">Lv.1 Dễ (Easy)</option>
              <option value="Medium">Lv.2 Trung bình (Medium)</option>
              <option value="Hard">Lv.3 Khó (Hard)</option>
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setViewMode("table");
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "table" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Dạng bảng"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playSfx("click");
                  setViewMode("cards");
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  viewMode === "cards" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Dạng thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar if Selected */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-200 animate-in fade-in">
            <span className="text-xs font-bold text-blue-900">
              Đã chọn <strong className="text-blue-700">{selectedCount}</strong> câu hỏi
            </span>
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onBulkDelete();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa các mục đã chọn</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
