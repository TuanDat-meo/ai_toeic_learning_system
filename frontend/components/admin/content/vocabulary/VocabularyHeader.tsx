"use client";

import React from "react";
import {
  Download,
  Plus,
  FolderKanban,
  BookOpen,
  Sliders,
  BarChart3,
} from "lucide-react";

interface VocabularyHeaderProps {
  activeMainTab: "topics" | "all_words" | "algorithm" | "analytics";
  setActiveMainTab: (tab: "topics" | "all_words" | "algorithm" | "analytics") => void;
  totalTests?: number;
  totalWords?: number;
  onOpenCreateTest?: () => void;
  onExportCsv?: () => void;
}

export const VocabularyHeader: React.FC<VocabularyHeaderProps> = ({
  activeMainTab,
  setActiveMainTab,
  totalTests = 20,
  totalWords = 3200,
  onOpenCreateTest,
  onExportCsv,
}) => {
  return (
    <div className="space-y-6">
      {/* Header - Image 1 Clean Admin Style */}
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Quản lý nội dung <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Quản lý kho từ vựng</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">
            Quản lý kho từ vựng TOEIC
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
            Hệ thống quản trị danh mục bộ từ vựng, biên soạn ngân hàng từ, theo dõi tần suất tương tác học viên và cấu hình thuật toán Spaced Repetition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {totalTests} bộ đề ({totalWords.toLocaleString("vi-VN")} từ vựng)
          </span>

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <Download size={16} className="text-slate-500" aria-hidden="true" />
              Xuất CSV
            </button>
          )}

          {onOpenCreateTest && (
            <button
              type="button"
              onClick={onOpenCreateTest}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 cursor-pointer"
            >
              <Plus size={16} aria-hidden="true" />
              Thêm bộ từ vựng mới
            </button>
          )}
        </div>
      </header>

      {/* Admin Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: "topics", label: "Danh sách bộ từ vựng", icon: FolderKanban, count: totalTests },
          { id: "all_words", label: "Ngân hàng toàn bộ từ vựng", icon: BookOpen, count: totalWords },
          { id: "algorithm", label: "Cấu hình thuật toán SRS", icon: Sliders },
          { id: "analytics", label: "Báo cáo & Tương tác học viên", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMainTab(tab.id as "topics" | "all_words" | "algorithm" | "analytics")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
