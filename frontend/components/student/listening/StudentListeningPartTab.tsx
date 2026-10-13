"use client";

import React from "react";
import { Headphones, Languages, FileText } from "lucide-react";
import { LevelCategoryCardData } from "@/app/admin/content/listening/types";

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
            <div
              key={lvl.id}
              className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    Mục tiêu {lvl.targetLevel || "Mọi Band"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {lvl.questions?.length || lvl.totalQuestions || 10} câu
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{lvl.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {lvl.theorySummary || "Luyện nghe câu hỏi & nhận diện bẫy đề thi."}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenQuizPractice(lvl)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Bắt đầu làm bài ({lvl.questions?.length || lvl.totalQuestions || 10} câu)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVocabBagModalData({
                        title: `Túi từ vựng: ${lvl.title}`,
                        items: lvl.vocabBag || [],
                      })
                    }
                    className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Languages className="w-3 h-3 text-blue-600" />
                    Túi từ ({lvl.vocabBag?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTheoryModalData({
                        title: `Lý thuyết & Mẹo: ${lvl.title}`,
                        summary: lvl.theorySummary || "Mẹo nghe chuẩn TOEIC",
                        rules: lvl.rules?.length ? lvl.rules : [
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
            <div
              key={cat.id}
              className="bg-white rounded-2xl border-t-[3.5px] border-t-emerald-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    Chuyên đề
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {cat.questions?.length || cat.totalQuestions || 10} câu
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{cat.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.theorySummary || "Luyện nghe theo chuyên đề tình huống thực tế."}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenQuizPractice(cat)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Bắt đầu luyện tập ({cat.questions?.length || cat.totalQuestions || 10} câu)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVocabBagModalData({
                        title: `Túi từ vựng: ${cat.title}`,
                        items: cat.vocabBag || [],
                      })
                    }
                    className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Languages className="w-3 h-3 text-emerald-600" />
                    Túi từ ({cat.vocabBag?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTheoryModalData({
                        title: `Lý thuyết & Bẫy: ${cat.title}`,
                        summary: cat.theorySummary || "Mẹo thi nghe",
                        rules: cat.rules?.length ? cat.rules : [
                          "Nắm vững các mẫu câu và cụm từ vựng thường gặp trong ngữ cảnh công sở.",
                          "Phân biệt ngữ điệu câu hỏi thông tin Wh- (xuống giọng) và Yes/No (lên giọng).",
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
          ))}
        </div>
      </div>
    </div>
  );
};
