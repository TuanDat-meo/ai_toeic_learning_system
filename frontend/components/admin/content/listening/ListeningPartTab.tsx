"use client";

import React from "react";
import { Plus, Pencil, Trash2, ShoppingBag, FileText, Eye } from "lucide-react";
import { LevelCategoryCardData } from "@/app/admin/content/listening/types";

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

  return (
    <div className="bg-white rounded-2xl border-t-[3.5px] border-t-blue-600 border-x border-b border-slate-200/90 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{card.title}</h3>
        <p className="text-xs text-slate-500 mb-3">
          {card.part} · {totalQ} câu
        </p>

        {/* Thông tin quy mô quản trị (Admin chỉ hiển thị số câu & dạng bài) */}
        <div className="mb-4 p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Số câu luyện tập:</span>
            <strong className="text-blue-700 font-mono font-bold">{totalQ} câu</strong>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Phân loại đề:</span>
            <span className="font-semibold text-slate-800">{card.part}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Trạng thái:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              {card.status || "Đã xuất bản"}
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
        </div>

        <button
          type="button"
          onClick={onPractice}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer shadow-2xs"
          title="Xem trước bài tập của học viên"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Xem trước</span>
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
