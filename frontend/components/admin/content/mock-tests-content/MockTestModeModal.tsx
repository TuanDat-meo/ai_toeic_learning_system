"use client";

import React from "react";
import { TestItem } from "@/app/admin/content/mock-tests-content/types";
import {
  X,
  FileText,
  Target,
  Play,
  Clock,
  Headphones,
  BookOpen,
} from "lucide-react";

interface MockTestModeModalProps {
  test: TestItem;
  selectedModeTab: "exam" | "practice";
  setSelectedModeTab: (tab: "exam" | "practice") => void;
  selectedParts: string[];
  setSelectedParts: (parts: string[]) => void;
  onClose: () => void;
  onStartFullTest: () => void;
  onStartListeningTest: () => void;
  onStartReadingTest: () => void;
  onStartPartTest: (parts: string[]) => void;
  onStartPractice: (part: string) => void;
}

export const MockTestModeModal: React.FC<MockTestModeModalProps> = ({
  test,
  selectedModeTab,
  setSelectedModeTab,
  selectedParts,
  setSelectedParts,
  onClose,
  onStartFullTest,
  onStartListeningTest,
  onStartReadingTest,
  onStartPartTest,
  onStartPractice,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Chọn chế độ</h2>
            <p className="text-sm font-bold text-slate-500 mt-0.5">{test.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto bg-slate-50/50 flex-1">
          {/* Mode Switcher Tabs */}
          <div className="p-1.5 bg-slate-200/70 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedModeTab("exam")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedModeTab === "exam"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Luyện thi</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedModeTab("practice")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedModeTab === "practice"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Target className="w-4 h-4 text-blue-600" />
              <span>Luyện tập</span>
            </button>
          </div>

          {/* CONTENT FOR EXAM MODE */}
          {selectedModeTab === "exam" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full Test */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Full Test</h3>
                        <p className="text-xs text-slate-500 font-medium">Làm như thi thật</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onStartFullTest}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      <span>Bắt đầu</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      <Clock className="w-3 h-3" /> 120 phút
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      <FileText className="w-3 h-3" /> 200 câu
                    </span>
                  </div>
                </div>

                {/* Listening */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Thi Listening</h3>
                        <p className="text-xs text-slate-500 font-medium">Thi riêng phần nghe</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onStartListeningTest}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      <span>Bắt đầu</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      <Clock className="w-3 h-3" /> 45 phút
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      <FileText className="w-3 h-3" /> 100 câu
                    </span>
                  </div>
                </div>

                {/* Reading */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Thi Reading</h3>
                        <p className="text-xs text-slate-500 font-medium">Thi riêng phần đọc</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onStartReadingTest}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      <span>Bắt đầu</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-[11px] pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      <Clock className="w-3 h-3" /> 75 phút
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      <FileText className="w-3 h-3" /> 100 câu
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card: Thi theo Part */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Thi theo Part</h3>
                      <p className="text-xs text-slate-500">Chọn Part cụ thể để thi thử</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartPartTest(selectedParts.length > 0 ? selectedParts : ["Part 1"])}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Bắt đầu</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Listening</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: "Part 1", count: "6 câu" },
                        { id: "Part 2", count: "25 câu" },
                        { id: "Part 3", count: "39 câu" },
                        { id: "Part 4", count: "30 câu" },
                      ].map((p) => {
                        const isSelected = selectedParts.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedParts(selectedParts.filter((item) => item !== p.id));
                              } else {
                                setSelectedParts([...selectedParts, p.id]);
                              }
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? "border-blue-600 bg-white" : "border-slate-300"
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                              </div>
                              <span className="text-xs sm:text-sm font-medium">{p.id}</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Reading</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: "Part 5", count: "30 câu" },
                        { id: "Part 6", count: "16 câu" },
                        { id: "Part 7", count: "54 câu" },
                      ].map((p) => {
                        const isSelected = selectedParts.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedParts(selectedParts.filter((item) => item !== p.id));
                              } else {
                                setSelectedParts([...selectedParts, p.id]);
                              }
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? "bg-blue-50/70 border-blue-500 text-blue-900 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? "border-blue-600 bg-white" : "border-slate-300"
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                              </div>
                              <span className="text-xs sm:text-sm font-medium">{p.id}</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">{p.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT FOR PRACTICE MODE */}
          {selectedModeTab === "practice" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn Part để bắt đầu luyện tập tự do</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: "ALL", title: "Tất cả các Part", count: "Đầy đủ 7 Part" },
                  { id: "Part 1", title: "Part 1: Photographs", count: "Mô tả hình ảnh" },
                  { id: "Part 2", title: "Part 2: Question-Response", count: "Hỏi & Đáp ngắn" },
                  { id: "Part 3", title: "Part 3: Conversations", count: "Hội thoại ngắn" },
                  { id: "Part 4", title: "Part 4: Short Talks", count: "Bài nói ngắn" },
                  { id: "Part 5", title: "Part 5: Incomplete Sentences", count: "Điền câu" },
                  { id: "Part 6", title: "Part 6: Text Completion", count: "Điền đoạn văn" },
                  { id: "Part 7", title: "Part 7: Reading Comprehension", count: "Đọc hiểu đoạn văn" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onStartPractice(item.id)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 text-left transition shadow-2xs group cursor-pointer"
                  >
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.count}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
