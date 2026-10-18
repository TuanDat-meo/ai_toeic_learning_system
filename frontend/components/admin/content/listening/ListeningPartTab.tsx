"use client";

import React from "react";
import { Plus, Pencil, Trash2, ShoppingBag, FileText, RotateCcw, Layers } from "lucide-react";
import { LevelCategoryCardData } from "@/app/admin/content/listening/types";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";

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

function AdminListeningCardItem({
  card,
  onEdit,
  onDelete,
  onVocab,
  onTheory,
  onPractice,
}: {
  card: LevelCategoryCardData;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onVocab: () => void;
  onTheory: () => void;
  onPractice: () => void;
}) {
  const totalQ = card.questions?.length || card.totalQuestions || 10;
  const progress = useItemProgress(`listening-quiz-${card.id}`, totalQ);

  return (
    <div className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{card.title}</h3>
        <p className="text-xs text-slate-500 mb-3">
          {card.status} · {totalQ} câu
        </p>

        {/* Thanh tiến độ */}
        <div className="mb-4 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2">
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

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            onClick={onEdit}
            title="Sửa chủ điểm"
            className="hover:text-blue-600 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Xóa chủ điểm"
            className="hover:text-rose-500 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onVocab}
            title="Giỏ từ vựng"
            className="hover:text-blue-600 transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onTheory}
            title="Lý thuyết & Mẹo làm bài"
            className="hover:text-blue-600 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onPractice}
            title="Làm lại bộ câu này"
            className="hover:text-blue-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onPractice}
          className="px-4 py-1.5 rounded-full border border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shadow-2xs"
        >
          Học ngay
        </button>
      </div>
    </div>
  );
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {levels.map((lvl) => (
          <AdminListeningCardItem
            key={lvl.id}
            card={lvl}
            onEdit={(e) => handleOpenEditLevel(lvl, e)}
            onDelete={() => setDeleteLevelConfirm(lvl)}
            onVocab={() =>
              setVocabBagModalData({
                title: `Giỏ từ vựng - ${lvl.title}`,
                items: lvl.vocabBag,
              })
            }
            onTheory={() =>
              setTheoryModalData({
                title: `Lý thuyết kỹ năng - ${lvl.title}`,
                summary: lvl.theorySummary,
                rules: lvl.rules,
              })
            }
            onPractice={() => handleOpenQuizPractice(lvl)}
          />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <AdminListeningCardItem
              key={cat.id}
              card={cat}
              onEdit={(e) => handleOpenEditLevel(cat, e)}
              onDelete={() => setDeleteLevelConfirm(cat)}
              onVocab={() =>
                setVocabBagModalData({
                  title: `Từ vựng - ${cat.title}`,
                  items: cat.vocabBag,
                })
              }
              onTheory={() =>
                setTheoryModalData({
                  title: `Mẹo làm bài - ${cat.title}`,
                  summary: cat.theorySummary,
                  rules: cat.rules,
                })
              }
              onPractice={() => handleOpenQuizPractice(cat)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
