"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  Pencil,
  Trash2,
  FolderOpen,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { TestItem, getTestCategoryKey, getCategoryLabel } from "@/app/admin/content/vocabulary/types";

interface VocabularyTestGridProps {
  tests: TestItem[];
  activeSubCategory: string;
  setActiveSubCategory: (cat: string) => void;
  onOpenEditTest: (test: TestItem, e?: React.MouseEvent) => void;
  onOpenDeleteTest: (test: TestItem, e?: React.MouseEvent) => void;
  onOpenWordList: (test: TestItem) => void;
  onOpenPreview: (test: TestItem) => void;
}

export const VocabularyTestGrid: React.FC<VocabularyTestGridProps> = ({
  tests,
  activeSubCategory,
  setActiveSubCategory,
  onOpenEditTest,
  onOpenDeleteTest,
  onOpenWordList,
  onOpenPreview,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const isAll = !activeSubCategory || activeSubCategory.toLowerCase() === "all";

  // Tự động gom nhóm các phân loại thực tế đang có trong danh sách tests
  const dynamicCategories = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    tests.forEach((t) => {
      const key = getTestCategoryKey(t);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { key, label: getCategoryLabel(key), count: 1 });
      }
    });
    return Array.from(map.values());
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchCat = isAll || getTestCategoryKey(t) === activeSubCategory;
      const titleStr = t.title || t.nameVi || t.nameEn || "";
      const yearStr = t.year ? String(t.year) : "";
      const matchSearch =
        searchQuery.trim() === "" ||
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        yearStr.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [tests, activeSubCategory, isAll, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Admin Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full lg:w-72 xl:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ vựng, năm phát hành..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Categories & View Switcher */}
        <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-x-auto no-scrollbar w-full lg:w-auto">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveSubCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                isAll
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({tests.length})
            </button>
            {dynamicCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveSubCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeSubCategory === cat.key
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <div className="shrink-0 flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Chế độ thẻ (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Chế độ bảng (Table)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === "grid" ? (
        <div className="grid gap-4.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {filteredTests.map((t) => (
            <div
              key={t.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {t.year}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Xuất bản
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => onOpenEditTest(t, e)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                      title="Chỉnh sửa thông tin bộ"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => onOpenDeleteTest(t, e)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      title="Xóa bộ từ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Title & Info */}
                <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">
                  {t.title}
                </h3>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">
                    Quy mô: <span className="text-blue-600 font-bold">{t.wordCount} từ vựng</span>
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    Cập nhật: Hệ thống chuẩn hóa
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenWordList(t)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Mở danh sách từ để quản lý, sửa nghĩa và thêm từ"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Quản lý từ ({t.words?.length || t.wordCount})
                </button>

                <button
                  type="button"
                  onClick={() => onOpenPreview(t)}
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  title="Xem trước giao diện học viên"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Xem trước
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tên bộ từ vựng</th>
                  <th className="py-3 px-4">Phân loại</th>
                  <th className="py-3 px-4">Năm / Bộ đề</th>
                  <th className="py-3 px-4">Số lượng từ</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {t.category === "2026"
                        ? "ETS 2026"
                        : t.category === "600_essential"
                        ? "600 Essential Words"
                        : "ETS 2023"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {t.year}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {t.wordCount} từ
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đang phát hành
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenWordList(t)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-xs transition cursor-pointer"
                        >
                          Quản lý từ
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPreview(t)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs transition cursor-pointer"
                        >
                          Xem trước
                        </button>
                        <button
                          type="button"
                          onClick={(e) => onOpenEditTest(t, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => onOpenDeleteTest(t, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
