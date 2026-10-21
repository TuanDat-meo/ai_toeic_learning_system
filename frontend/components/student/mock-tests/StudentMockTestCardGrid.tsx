"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  FileText,
  Languages,
  Play,
  RotateCcw,
  Layers,
  History,
} from "lucide-react";
import { TestItem } from "@/app/admin/content/mock-tests/types";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";
import { StudentCardProgressAction } from "@/components/student/common/StudentCardProgressAction";

interface StudentMockTestCardGridProps {
  tests: TestItem[];
  selectedVol: "vol1" | "vol2" | "vol3";
  setSelectedVol: (vol: "vol1" | "vol2" | "vol3") => void;
  onOpenExam: (test: TestItem) => void;
  onOpenPractice: (test: TestItem, isRedo?: boolean) => void;
  onOpenTranscript: (test: TestItem) => void;
  onOpenVocab: (test: TestItem) => void;
  onOpenHistory?: (test: TestItem) => void;
}

function StudentMockTestCardItem({
  test,
  onOpenExam,
  onOpenPractice,
  onOpenTranscript,
  onOpenVocab,
  onOpenHistory,
}: {
  test: TestItem;
  onOpenExam: (test: TestItem) => void;
  onOpenPractice: (test: TestItem, isRedo?: boolean) => void;
  onOpenTranscript: (test: TestItem) => void;
  onOpenVocab: (test: TestItem) => void;
  onOpenHistory?: (test: TestItem) => void;
}) {
  const progress = useItemProgress(`mock-test-${test.id}`, 200);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Badge */}
        <div className="flex items-center">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
            {test.volId === "vol1" || test.volId === "ets2024" ? "ETS 2024" : test.volId === "vol2" || test.volId === "ets2023" ? "ETS 2023" : "ETS 2022"}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {test.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">200 câu hỏi • 120 phút • 7 Parts</p>
        </div>

        {/* Khung thống kê và các nút điều khiển đúng chuẩn Ảnh 2 */}
        <div className="pt-2">
          <StudentCardProgressAction
            progressKey={`mock-test-${test.id}`}
            totalQuestions={200}
            savedCount={3}
            actionLabel="Luyện tập"
            onStart={() => onOpenPractice(test, false)}
            onRedoWrong={() => onOpenPractice(test, true)}
            onOpenTheory={() => onOpenTranscript(test)}
            onOpenSaved={() => onOpenVocab(test)}
            secondaryAction={{
              label: "Thi thử",
              icon: <Play className="w-3 h-3 fill-current" />,
              onClick: () => onOpenExam(test),
              className: "px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs transition shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1 shrink-0",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const StudentMockTestCardGrid: React.FC<StudentMockTestCardGridProps> = ({
  tests,
  selectedVol,
  setSelectedVol,
  onOpenExam,
  onOpenPractice,
  onOpenTranscript,
  onOpenVocab,
  onOpenHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery);

      return matchSearch;
    });
  }, [tests, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Bộ lọc theo Vol & Tìm kiếm */}
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

        {/* Chuyển Vol */}
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
              ETS 2024
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
              ETS 2023
            </button>
            <button
              type="button"
              onClick={() => setSelectedVol("vol3")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedVol === "vol3"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ETS 2022
            </button>
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
            <StudentMockTestCardItem
              key={test.id}
              test={test}
              onOpenExam={onOpenExam}
              onOpenPractice={onOpenPractice}
              onOpenTranscript={onOpenTranscript}
              onOpenVocab={onOpenVocab}
              onOpenHistory={onOpenHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
};
