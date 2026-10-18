"use client";

import React from "react";
import { Headphones, Languages, FileText, Layers } from "lucide-react";
import { DictationCardData } from "@/app/admin/content/listening/types";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentListeningDictationTabProps {
  selectedYear: "2026" | "2024" | "2023" | "2022";
  setSelectedYear: (year: "2026" | "2024" | "2023" | "2022") => void;
  testsGrouped: { [testNum: number]: DictationCardData[] };
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string; example?: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenDictationPractice: (card: DictationCardData) => void;
}

function DictationCardItem({
  card,
  handleOpenDictationPractice,
  setVocabBagModalData,
  setTheoryModalData,
}: {
  card: DictationCardData;
  handleOpenDictationPractice: (card: DictationCardData) => void;
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

        {/* Tiến độ & Số câu hoàn thành */}
        <div className="mt-3.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
          <PracticeProgressBar
            completed={progress.completedQuestions}
            total={card.totalQuestions}
            unit="câu"
          />
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Đã làm: <strong className="text-slate-800 font-mono">{progress.completedQuestions}</strong> câu
            </span>
            <span className="font-mono text-slate-400">
              Còn lại: <strong className="text-slate-600 font-mono">{Math.max(0, card.totalQuestions - progress.completedQuestions)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Nút thao tác học viên */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => handleOpenDictationPractice(card)}
          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Headphones className="w-3.5 h-3.5" />
          Luyện nghe chép ({card.totalQuestions} câu)
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setVocabBagModalData({
                title: `Túi từ vựng: ${cardTitle}`,
                items: card.vocabItems || [],
              })
            }
            className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Languages className="w-3 h-3 text-blue-600" />
            Túi từ ({card.vocabItems?.length || 0})
          </button>
          <button
            type="button"
            onClick={() =>
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
            className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-amber-600" />
            Mẹo nghe
          </button>
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Bộ đề năm:</span>
          {(["2026", "2024", "2023", "2022"] as const).map((year) => (
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

        <span className="text-xs text-slate-400 font-medium">
          Phương pháp Chép chính tả cải thiện phản xạ tai nghe vượt trội
        </span>
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
