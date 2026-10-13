"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Languages,
  Headphones,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { TestItem } from "@/app/admin/content/mock-tests/types";

interface StudentMockTestCardGridProps {
  tests: TestItem[];
  selectedVol: "vol1" | "vol2";
  setSelectedVol: (vol: "vol1" | "vol2") => void;
  onOpenExam: (test: TestItem) => void;
  onOpenPractice: (test: TestItem) => void;
  onOpenTranscript: (test: TestItem) => void;
  onOpenVocab: (test: TestItem) => void;
}

export const StudentMockTestCardGrid: React.FC<StudentMockTestCardGridProps> = ({
  tests,
  selectedVol,
  setSelectedVol,
  onOpenExam,
  onOpenPractice,
  onOpenTranscript,
  onOpenVocab,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery);

      const matchDifficulty =
        filterDifficulty === "ALL" || t.difficulty === filterDifficulty;

      return matchSearch && matchDifficulty;
    });
  }, [tests, searchQuery, filterDifficulty]);

  return (
    <div className="space-y-6">
      {/* Bộ lọc theo Vol, độ khó & Tìm kiếm */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tìm kiếm */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo số đề, tên bài thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Chuyển Vol & Độ khó */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vol Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedVol("vol1")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedVol === "vol1"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ETS Crack Vol 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedVol("vol2")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedVol === "vol2"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ETS Crack Vol 2
            </button>
          </div>

          {/* Độ khó */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {["ALL", "Dễ", "Trung bình", "Khó"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilterDifficulty(d)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterDifficulty === d
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {d === "ALL" ? "Mọi độ khó" : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid danh sách đề thi */}
      {filteredTests.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
          Không tìm thấy đề thi TOEIC nào phù hợp với bộ lọc tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {test.volId === "vol1" ? "Crack Vol 1" : "Crack Vol 2"}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      test.difficulty === "Khó"
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : test.difficulty === "Trung bình"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}
                  >
                    Độ khó: {test.difficulty}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">200 câu hỏi • 120 phút • 7 Parts</p>
                </div>

                {/* Info Card */}
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Cấu trúc:</span>
                    <strong className="text-slate-900 font-bold">100 LC + 100 RC</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/50">
                    <span>Thang điểm:</span>
                    <span className="text-blue-600 font-extrabold font-mono">10 - 990 Điểm</span>
                  </div>
                </div>
              </div>

              {/* Nút hành động học viên */}
              <div className="pt-3.5 border-t border-slate-100 space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenExam(test)}
                    className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    title="Bắt đầu thi thử tính giờ (Exam Mode)"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Thi thử
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenPractice(test)}
                    className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    title="Luyện tập từng phần (Practice Mode)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Luyện tập
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenTranscript(test)}
                    className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Xem Transcript bài nghe & Dịch nghĩa"
                  >
                    <FileText className="w-3 h-3 text-blue-600" />
                    Transcript
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenVocab(test)}
                    className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Xem từ vựng trọng tâm trong đề"
                  >
                    <Languages className="w-3 h-3 text-emerald-600" />
                    Từ vựng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
