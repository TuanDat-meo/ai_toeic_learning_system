"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  FileDown,
  FileUp,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { QuestionPart, QUESTION_DIFFICULTY_BANDS } from "@/app/admin/content/questions/types";
import { DEFAULT_PARTS, DEFAULT_SKILLS } from "@/app/admin/content/questions/constants";

interface QuestionFilterBarProps {
  selectedPartTab: QuestionPart | "ALL";
  setSelectedPartTab: (part: QuestionPart | "ALL") => void;
  keyword: string;
  setKeyword: (kw: string) => void;
  selectedSkill: string;
  setSelectedSkill: (sk: string) => void;
  availableSkills?: string[];
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
  onImportListeningClick?: () => void;
  onImportReadingClick?: () => void;
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
  availableSkills = DEFAULT_SKILLS,
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
  onImportListeningClick,
  onImportReadingClick,
  playSfx = () => {},
  showToast = () => {},
}) => {
  const [importMenuOpen, setImportMenuOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner - Image 1 Style */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Quản lý nội dung <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Ngân hàng câu hỏi</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">
            Ngân Hàng Câu Hỏi TOEIC
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
            Quản lý câu hỏi ETS theo Part, kỹ năng và band điểm 450–900+. Band mới được ánh xạ theo thứ tự từ 4 Level gốc (hai thang không tương đương); giáo viên và quản trị viên có thể chỉnh từng câu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              aria-expanded={importMenuOpen}
              aria-haspopup="true"
              onClick={() => {
                playSfx("click");
                setImportMenuOpen((open) => !open);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <FileUp size={16} className="text-slate-500" aria-hidden="true" />
              Nhập file
            </button>
            {importMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setImportMenuOpen(false);
                    onImportListeningClick?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FileUp size={16} className="text-slate-500" aria-hidden="true" />
                  Import Listening <span className="ml-auto text-xs text-slate-400">Part 1–4</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportMenuOpen(false);
                    onImportReadingClick?.();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FileDown size={16} aria-hidden="true" />
                  Import Reading <span className="ml-auto text-xs text-slate-400">Part 5–7</span>
                </button>
                <p className="px-3 pb-2 pt-1 text-[11px] leading-4 text-slate-500">
                  Mỗi luồng có mẫu file và bước xem trước riêng như trang Listening/Reading.
                </p>
                <p className="px-3 pb-2 text-[11px] leading-4 text-amber-700">
                  CSV không đính kèm được ảnh/audio; cột ImageURL và AudioURL chỉ nhận đường dẫn media đã có.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onExportCsv();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <FileDown size={16} className="text-slate-500" aria-hidden="true" />
            Xuất Excel
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("click");
              onOpenCreateModal();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 cursor-pointer"
          >
            <Plus size={16} aria-hidden="true" />
            Tạo câu hỏi
          </button>
        </div>
      </header>

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-72 xl:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm câu hỏi, mã P1-001, từ khóa..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Filter Dropdowns & View Mode */}
          <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto no-scrollbar w-full lg:w-auto">
            {/* Skill Select */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="shrink-0 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Tất cả kỹ năng</option>
              {availableSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="shrink-0 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Tất cả band điểm</option>
              {QUESTION_DIFFICULTY_BANDS.map((band) => (
                <option key={band} value={band}>{band}</option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="shrink-0 px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
            </select>

            {/* View Mode Toggle */}
            <div className="shrink-0 flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
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
