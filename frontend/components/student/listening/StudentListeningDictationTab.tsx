"use client";

import React from "react";
import { Headphones, Languages, FileText, Layers } from "lucide-react";
import { DictationCardData } from "@/app/admin/content/listening/types";
import { StudentCardProgressAction } from "@/components/student/common/StudentCardProgressAction";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentListeningDictationTabProps {
  selectedYear: "2024" | "2023" | "2022";
  setSelectedYear: (year: "2024" | "2023" | "2022") => void;
  testsGrouped: { [testNum: number]: DictationCardData[] };
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string; example?: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenDictationPractice: (card: DictationCardData, startIndex?: number, isRedoWrong?: boolean) => void;
}

function DictationCardItem({
  card,
  handleOpenDictationPractice,
  setVocabBagModalData,
  setTheoryModalData,
}: {
  card: DictationCardData;
  handleOpenDictationPractice: (card: DictationCardData, startIndex?: number, isRedoWrong?: boolean) => void;
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string; example?: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
}) {
  const cardTitle = `Test ${card.testNumber} - ${card.part}`;
  const cardDesc = `Luyện nghe chép chính tả ${card.totalQuestions} câu hỏi chuẩn format đề thi TOEIC.`;
  const progress = useItemProgress(`listening-dictation-${card.id}`, card.totalQuestions);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
      <div>
        {/* Badge Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {card.part}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            ETS {card.year}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 mt-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {cardTitle}
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {cardDesc}
        </p>

        {/* Thống kê và cụm nút thao tác chuẩn Ảnh 2 */}
        <div className="pt-2">
          <StudentCardProgressAction
            progressKey={`listening-dictation-${card.id}`}
            totalQuestions={card.totalQuestions}
            savedCount={card.vocabItems?.length || 2}
            actionLabel="Luyện nghe"
            onStart={(nextIdx) => handleOpenDictationPractice(card, nextIdx, false)}
            onRedoWrong={() => handleOpenDictationPractice(card, 0, true)}
            onOpenSaved={() =>
              setVocabBagModalData({
                title: `Túi từ vựng: ${cardTitle}`,
                items: card.vocabItems || [],
              })
            }
            onOpenTheory={() =>
              setTheoryModalData({
                title: `Mẹo nghe: ${cardTitle}`,
                summary: cardDesc,
                rules: [
                  "Tập trung bắt từ khóa (Keywords): Danh từ, Động từ chính.",
                  "Lưu ý hiện tượng nối âm (Linking sounds) và nuốt âm (Elision).",
                  "Gõ từ theo nhịp câu, nghe lại 2-3 lần nếu chưa bắt kịp âm đuôi.",
                ],
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export const StudentListeningDictationTab: React.FC<StudentListeningDictationTabProps> = ({
  selectedYear,
  setSelectedYear,
  testsGrouped,
  setVocabBagModalData,
  setTheoryModalData,
  handleOpenDictationPractice,
}) => {
  return (
    <div className="space-y-6">
      {/* Thanh lọc theo Năm */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Bộ đề năm:</span>
          {(["2024", "2023", "2022"] as const).map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedYear === year
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ETS {year}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách các bài Chép chính tả gom theo Test */}
      {Object.keys(testsGrouped).length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
          Chưa có bài chép chính tả nào cho năm {selectedYear}.
        </div>
      ) : (
        Object.entries(testsGrouped).map(([testNumStr, cardsInTest]) => (
          <div key={testNumStr} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                ETS {selectedYear} • Test {testNumStr}
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {cardsInTest.length} bài luyện
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cardsInTest.map((card) => (
                <DictationCardItem
                  key={card.id}
                  card={card}
                  handleOpenDictationPractice={handleOpenDictationPractice}
                  setVocabBagModalData={setVocabBagModalData}
                  setTheoryModalData={setTheoryModalData}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
