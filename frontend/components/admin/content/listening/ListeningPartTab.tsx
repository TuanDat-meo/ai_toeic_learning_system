"use client";

import React from "react";
import { Plus, Pencil, Trash2, ShoppingBag, FileText, Eye } from "lucide-react";
import { LevelCategoryCardData } from "@/app/admin/content/listening/types";

interface ListeningPartTabProps {
  part: "Part 1" | "Part 2" | "Part 3" | "Part 4";
  levels: LevelCategoryCardData[];
  categories: LevelCategoryCardData[];
  statusFilter?: "ALL" | "PUBLISHED" | "DRAFT";
  setStatusFilter?: (status: "ALL" | "PUBLISHED" | "DRAFT") => void;
  categorySectionTitle: string;
  categorySectionSubtitle: string;
  handleOpenAddLevel: (part: "Part 1" | "Part 2" | "Part 3" | "Part 4", type?: "level" | "category") => void;
  handleOpenEditLevel: (card: LevelCategoryCardData, e?: React.MouseEvent) => void;
  handleToggleLevelStatus?: (card: LevelCategoryCardData, e?: React.MouseEvent) => void;
  setDeleteLevelConfirm: (card: LevelCategoryCardData | null) => void;
  setVocabBagModalData: (data: { title: string; items: { word: string; ipa: string; meaning: string }[] } | null) => void;
  setTheoryModalData: (data: { title: string; summary: string; rules: string[] } | null) => void;
  handleOpenQuizPractice: (card: LevelCategoryCardData) => void;
}

function AdminListeningCardItem({
  card,
  onEdit,
  onToggleStatus,
  onDelete,
  onVocab,
  onTheory,
  onPractice,
}: {
  card: LevelCategoryCardData;
  onEdit: (e: React.MouseEvent) => void;
  onToggleStatus?: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onVocab: () => void;
  onTheory: () => void;
  onPractice: () => void;
}) {
  const totalQ = card.questions?.length || card.totalQuestions || 0;
  const isDraft = card.contentStatus === "DRAFT";

  return (
    <div
      className={`bg-white rounded-2xl border-t-[3.5px] border-x border-b p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
        isDraft
          ? "border-t-amber-500 border-amber-300/80 bg-amber-50/10"
          : "border-t-blue-600 border-slate-200/90"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
          <button
            type="button"
            onClick={onToggleStatus}
            title={isDraft ? "Nhấn để Xuất bản ngay" : "Nhấn để chuyển về Bản nháp"}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer shrink-0 ${
              isDraft
                ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {isDraft ? "🟡 Bản nháp" : "🟢 Đã xuất bản"}
          </button>
        </div>
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
            <span className="font-medium">Thao tác nhanh:</span>
            <button
              type="button"
              onClick={onToggleStatus}
              className={`font-bold hover:underline cursor-pointer text-[11px] ${
                isDraft ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isDraft ? "🚀 Xuất bản ngay" : "📝 Chuyển về nháp"}
            </button>
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
  statusFilter = "ALL",
  setStatusFilter,
  categorySectionTitle,
  categorySectionSubtitle,
  handleOpenAddLevel,
  handleOpenEditLevel,
  handleToggleLevelStatus,
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
        <div className="flex flex-wrap items-center gap-2">
          {setStatusFilter && (
            <div className="flex items-center gap-1 mr-2">
              {([
                { id: "ALL", label: "Tất cả" },
                { id: "PUBLISHED", label: "🟢 Đã xuất bản" },
                { id: "DRAFT", label: "🟡 Bản nháp" },
              ] as const).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-slate-800 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => handleOpenAddLevel(part, "level")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm cấp độ
          </button>
        </div>
      </div>

      {levels.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
          Chưa có cấp độ luyện nghe nào trong cơ sở dữ liệu.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {levels.map((lvl) => (
          <AdminListeningCardItem
            key={lvl.id}
            card={lvl}
            onEdit={(e) => handleOpenEditLevel(lvl, e)}
            onToggleStatus={(e) => handleToggleLevelStatus?.(lvl, e)}
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
      )}

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

        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
            Chưa có chuyên đề luyện nghe nào trong cơ sở dữ liệu.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
            <AdminListeningCardItem
              key={cat.id}
              card={cat}
              onEdit={(e) => handleOpenEditLevel(cat, e)}
              onToggleStatus={(e) => handleToggleLevelStatus?.(cat, e)}
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
        )}
      </div>
    </div>
  );
};
