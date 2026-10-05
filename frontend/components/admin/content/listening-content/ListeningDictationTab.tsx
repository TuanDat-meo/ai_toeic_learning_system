"use client";

import React from "react";
import { Plus, Bookmark, Pencil, Trash2, Languages, FileText, Headphones, ChevronRight } from "lucide-react";
import { DictationCardData } from "@/app/admin/content/listening-content/types";

interface ListeningDictationTabProps {
  selectedYear: "2026" | "2024" | "2023" | "2022";
  setSelectedYear: (year: "2026" | "2024" | "2023" | "2022") => void;
  flaggedReviewIds: number[];
  testsGrouped: { [testNum: number]: DictationCardData[] };
  handleOpenAddDictation: () => void;
  handleOpenEditDictation: (card: DictationCardData, e?: React.MouseEvent) => void;
  setDeleteDictationConfirm: (card: DictationCardData | null) => void;
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string; example?: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenDictationPractice: (card: DictationCardData) => void;
  setShowReviewQuestionsModal: (show: boolean) => void;
}

export const ListeningDictationTab: React.FC<ListeningDictationTabProps> = ({
  selectedYear,
  setSelectedYear,
  flaggedReviewIds,
  testsGrouped,
  handleOpenAddDictation,
  handleOpenEditDictation,
  setDeleteDictationConfirm,
  setVocabBagModalData,
  setTheoryModalData,
  handleOpenDictationPractice,
  setShowReviewQuestionsModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Thanh lọc theo Năm & Nút "Câu cần luyện lại" & Thêm bài */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Lọc Năm */}
        <div className="flex items-center gap-2">
          {(["2026", "2024", "2023", "2022"] as const).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedYear === year
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddDictation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm bài nghe chép
          </button>

          <button
            type="button"
            onClick={() => setShowReviewQuestionsModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Bookmark className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
            Câu cần luyện lại ({flaggedReviewIds.length})
          </button>
        </div>
      </div>

      {/* Danh sách các phần Test: Test 1, Test 2, Test 3 */}
      {[1, 2, 3].map((testNum) => {
        const cardsInTest = testsGrouped[testNum] || [];
        if (cardsInTest.length === 0) return null;

        return (
          <div key={testNum} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600 rounded-full" />
              <h3 className="text-base font-extrabold text-slate-900">
                Test {testNum}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cardsInTest.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                        {card.part}
                      </span>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditDictation(card, e)}
                          title="Sửa bài nghe"
                          className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDictationConfirm(card);
                          }}
                          title="Xóa bài nghe"
                          className="p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setVocabBagModalData({
                              title: `Từ vựng ${card.part} - Test ${card.testNumber}`,
                              items: card.vocabItems,
                            })
                          }
                          title="Xem từ vựng của Part"
                          className="p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                        >
                          <Languages className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setTheoryModalData({
                              title: `Ghi chú & Transcript ${card.part} - Test ${card.testNumber}`,
                              summary: `Tổng hợp ${card.totalQuestions} câu nghe chép của ${card.part} Test ${card.testNumber}.`,
                              rules: [
                                "Nghe trọn vẹn câu trước khi gõ.",
                                "Chú ý âm nối và trọng âm câu.",
                              ],
                            })
                          }
                          title="Transcript & Ghi chú"
                          className="flex items-center gap-1 text-[11px] p-1 rounded-md hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{card.notesCount}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      <Headphones className="w-5 h-5 text-blue-600" />
                      <span className="text-base font-extrabold text-slate-900">
                        {card.totalQuestions} câu
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {card.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenDictationPractice(card)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Luyện tập
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
