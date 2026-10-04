import React from "react";
import { Plus, Pencil, Trash2, ShoppingBag, FileText, RotateCcw } from "lucide-react";
import { LevelCategoryCardData } from "../types";

interface ListeningPartTabProps {
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  levels: LevelCategoryCardData[];
  categories: LevelCategoryCardData[];
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  handleOpenAddLevel: (part: "Part 1" | "Part 2" | "Part 3" | "Part 4", type?: "level" | "category") => void;
  handleOpenEditLevel: (card: LevelCategoryCardData, e?: React.MouseEvent) => void;
  setDeleteLevelConfirm: (card: LevelCategoryCardData | null) => void;
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenQuizPractice: (card: LevelCategoryCardData) => void;
}

export const ListeningPartTab: React.FC<ListeningPartTabProps> = ({
  part,
  levels,
  categories,
  categorySectionTitle,
  categorySectionSubtitle,
  handleOpenAddLevel,
  handleOpenEditLevel,
  setDeleteLevelConfirm,
  setVocabBagModalData,
  setTheoryModalData,
  handleOpenQuizPractice,
}) => {
  return (
    <div className="space-y-8">
      {/* SECTION 1: THEO CẤP ĐỘ ĐIỂM */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Theo 4 Cấp độ điểm</h3>
          <p className="text-xs text-slate-500">Bộ đề luyện nghe phân cấp độ chuẩn TOEIC ({part}).</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenAddLevel(part, "level")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm cấp độ
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((lvl) => (
          <div
            key={lvl.id}
            className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{lvl.title}</h3>
              <p className="text-xs text-slate-500 mb-4">
                {lvl.status} · {lvl.totalQuestions} câu
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  type="button"
                  onClick={(e) => handleOpenEditLevel(lvl, e)}
                  title="Sửa chủ điểm"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteLevelConfirm(lvl)}
                  title="Xóa chủ điểm"
                  className="hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVocabBagModalData({
                      title: `Giỏ từ vựng - ${lvl.title}`,
                      items: lvl.vocabBag,
                    })
                  }
                  title="Giỏ từ vựng"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTheoryModalData({
                      title: `Lý thuyết kỹ năng - ${lvl.title}`,
                      summary: lvl.theorySummary,
                      rules: lvl.rules,
                    })
                  }
                  title="Lý thuyết & Mẹo làm bài"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenQuizPractice(lvl)}
                  title="Làm lại bộ câu này"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleOpenQuizPractice(lvl)}
                className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                Học ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: THEO DẠNG TRANH / CÂU HỎI / CHỦ ĐỀ / BÀI NÓI */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">{categorySectionTitle}</h3>
            <p className="text-xs text-slate-500">{categorySectionSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddLevel(part, "category")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm danh mục
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-500 mb-4">
                  {cat.status} · {cat.totalQuestions} câu
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEditLevel(cat, e)}
                    title="Sửa danh mục"
                    className="hover:text-blue-600 transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteLevelConfirm(cat)}
                    title="Xóa danh mục"
                    className="hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setVocabBagModalData({
                        title: `Từ vựng - ${cat.title}`,
                        items: cat.vocabBag,
                      })
                    }
                    title="Giỏ từ"
                    className="hover:text-blue-600 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTheoryModalData({
                        title: `Mẹo làm bài - ${cat.title}`,
                        summary: cat.theorySummary,
                        rules: cat.rules,
                      })
                    }
                    title="Lý thuyết & Mẹo"
                    className="hover:text-blue-600 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQuizPractice(cat)}
                    title="Làm lại"
                    className="hover:text-blue-600 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenQuizPractice(cat)}
                  className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  Học ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
