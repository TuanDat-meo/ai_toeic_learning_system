"use client";

import React from "react";
import { Headphones, Languages, FileText, Layers } from "lucide-react";
import { LevelCategoryCardData } from "@/app/admin/content/listening/types";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentListeningPartTabProps {
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  levels: LevelCategoryCardData[];
  categories: LevelCategoryCardData[];
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenQuizPractice: (card: LevelCategoryCardData) => void;
}

function ListeningCardItem({
  card,
  tagLabel,
  tagColor,
  borderColor,
  btnColor,
  setVocabBagModalData,
  setTheoryModalData,
  handleOpenQuizPractice,
}: {
  card: LevelCategoryCardData;
  tagLabel: string;
  tagColor: string;
  borderColor: string;
  btnColor: string;
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenQuizPractice: (card: LevelCategoryCardData) => void;
}) {
  const totalQ = card.questions?.length || card.totalQuestions || 10;
  const progress = useItemProgress(`listening-quiz-${card.id}`, totalQ);

  return (
    <div
      className={`bg-white rounded-2xl border-t-[3.5px] ${borderColor} border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${tagColor}`}>
            {tagLabel}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalQ} câu
          </span>
        </div>
        <h4 className="text-base font-bold text-slate-900">{card.title}</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {card.theorySummary || "Luyện nghe câu hỏi & nhận diện bẫy đề thi."}
        </p>

        {/* Thanh tiến độ & Số câu hoàn thành */}
        <div className="mt-3.5 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
          <PracticeProgressBar
            completed={progress.completedQuestions}
            total={totalQ}
            unit="câu"
          />
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Đã làm: <strong className="text-slate-800 font-mono">{progress.completedQuestions}</strong> câu
            </span>
            <span className="font-mono text-slate-400">
              Còn lại: <strong className="text-slate-600 font-mono">{Math.max(0, totalQ - progress.completedQuestions)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={() => handleOpenQuizPractice(card)}
          className={`w-full py-2.5 px-3 rounded-xl ${btnColor} text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs`}
        >
          <Headphones className="w-3.5 h-3.5" />
          Bắt đầu làm bài ({totalQ} câu)
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setVocabBagModalData({
                title: `Túi từ vựng: ${card.title}`,
                items: card.vocabBag || [],
              })
            }
            className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Languages className="w-3 h-3 text-blue-600" />
            Túi từ ({card.vocabBag?.length || 0})
          </button>
          <button
            type="button"
            onClick={() =>
              setTheoryModalData({
                title: `Lý thuyết & Mẹo: ${card.title}`,
                summary: card.theorySummary || "Mẹo nghe chuẩn TOEIC",
                rules: card.rules?.length ? card.rules : [
                  "Quan sát kỹ hình ảnh hoặc từ khóa câu hỏi trước khi audio phát.",
                  "Không để bị phân tâm bởi các từ đồng âm hoặc bẫy lặp từ.",
                  "Tô đáp án ngay khi câu hỏi kết thúc để chuẩn bị cho câu kế tiếp.",
                ],
              })
            }
            className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3 text-amber-600" />
            Mẹo thi
          </button>
        </div>
      </div>
    </div>
  );
}

export const StudentListeningPartTab: React.FC<StudentListeningPartTabProps> = ({
  part,
  levels,
  categories,
  categorySectionTitle,
  categorySectionSubtitle,
  setVocabBagModalData,
  setTheoryModalData,
  handleOpenQuizPractice,
}) => {
  return (
    <div className="space-y-8">
      {/* SECTION 1: THEO CẤP ĐỘ ĐIỂM */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Luyện nghe theo 4 cấp độ điểm Target</h3>
          <p className="text-xs text-slate-500">Phân cấp độ chuẩn xác từ cơ bản đến nâng cao cho {part}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {levels.map((lvl) => (
            <ListeningCardItem
              key={lvl.id}
              card={lvl}
              tagLabel={`Mục tiêu ${lvl.targetLevel || "Mọi Band"}`}
              tagColor="text-blue-700 bg-blue-50 border-blue-100"
              borderColor="border-t-blue-600"
              btnColor="bg-blue-600 hover:bg-blue-700"
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenQuizPractice={handleOpenQuizPractice}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: THEO CHỦ ĐỀ / TÌNH HUỐNG THỰC TẾ */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{categorySectionTitle}</h3>
          <p className="text-xs text-slate-500">{categorySectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <ListeningCardItem
              key={cat.id}
              card={cat}
              tagLabel="Chuyên đề"
              tagColor="text-emerald-700 bg-emerald-50 border-emerald-100"
              borderColor="border-t-emerald-600"
              btnColor="bg-emerald-600 hover:bg-emerald-700"
              setVocabBagModalData={setVocabBagModalData}
              setTheoryModalData={setTheoryModalData}
              handleOpenQuizPractice={handleOpenQuizPractice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
