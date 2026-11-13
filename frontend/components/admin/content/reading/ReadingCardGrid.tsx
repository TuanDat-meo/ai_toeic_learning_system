"use client";

import React from "react";
import { formatReadingPartLabel } from "@/lib/readingPassageUtils";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  CheckCircle2,
  Play,
  ClipboardCheck,
  FileEdit,
  Sparkles,
} from "lucide-react";

interface ReadingCardGridProps {
  cards: ExerciseCardData[];
  viewMode: "table" | "grid";
  highlightedCardId?: string | null;
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
  onToggleCardStatus?: (card: ExerciseCardData) => void;
  onDeleteAllDrafts?: (draftCards: ExerciseCardData[]) => void;
  onPublishAllDrafts?: (draftCards: ExerciseCardData[]) => void;
}

function ReadingTableRow({
  card,
  isHighlighted,
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
  onToggleCardStatus,
}: {
  card: ExerciseCardData;
  isHighlighted?: boolean;
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
  onToggleCardStatus?: (card: ExerciseCardData) => void;
}) {
  const fallbackTotal = card.totalQuestions || 10;
  const isDraft = card.status === "draft";

  return (
    <tr
      className={`transition-all duration-300 ${
        isHighlighted
          ? "bg-emerald-50/50 ring-2 ring-emerald-400"
          : "hover:bg-slate-50/70"
      }`}
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-900 leading-snug">{card.title}</p>
          {isHighlighted && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse whitespace-nowrap shrink-0 shadow-xs">
              ✨ Mới thêm ✨
            </span>
          )}
        </div>
        {card.tag && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-0.5 whitespace-nowrap">
            {card.tag}
          </span>
        )}
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase whitespace-nowrap inline-flex items-center">
          {card.category}
        </span>
      </td>

      <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono whitespace-nowrap">
        {fallbackTotal} câu
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        {isDraft ? (
          <button
            type="button"
            onClick={() => onToggleCardStatus?.(card)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
            title="Đang là Bản nháp (học viên chưa nhìn thấy). Bấm vào đây nếu muốn Phát hành!"
          >
            <FileEdit className="w-3 h-3 text-amber-600" />
            <span>Bản nháp</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleCardStatus?.(card)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
            title="Đã phát hành cho học viên. Bấm vào đây nếu muốn chuyển về Bản nháp!"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã phát hành</span>
          </button>
        )}
      </td>

      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onOpenTheory(card)}
            className="p-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition cursor-pointer"
            title="Xem chi tiết bài đọc & đáp án (Part 5, 6, 7)"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onStartPractice(card)}
            className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
            title="Kiểm duyệt & đối soát đề thi"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => onOpenEditCard(card, e)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
            title="Chỉnh sửa thông tin"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onOpenDeleteConfirm(card)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
            title="Xóa bài đọc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ReadingGridItem({
  card,
  isHighlighted,
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
  onToggleCardStatus,
}: {
  card: ExerciseCardData;
  isHighlighted?: boolean;
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
  onToggleCardStatus?: (card: ExerciseCardData) => void;
}) {
  const fallbackTotal = card.totalQuestions || 10;
  const isDraft = card.status === "draft";

  return (
    <div
      className={`bg-white rounded-3xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
        isHighlighted
          ? "border-emerald-400 ring-2 ring-emerald-300 bg-emerald-50/20 shadow-md"
          : "border-slate-200/80 hover:border-blue-400"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase whitespace-nowrap">
              {card.category}
            </span>
            {isDraft ? (
              <button
                type="button"
                onClick={() => onToggleCardStatus?.(card)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition inline-flex items-center gap-1 cursor-pointer"
                title="Đang là Bản nháp. Bấm để Phát hành!"
              >
                <FileEdit className="w-2.5 h-2.5 text-amber-600" />
                <span>Bản nháp</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleCardStatus?.(card)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition inline-flex items-center gap-1 cursor-pointer"
                title="Đã phát hành. Bấm để chuyển về Bản nháp!"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Đã phát hành</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isHighlighted && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse whitespace-nowrap">
                ✨ Mới thêm ✨
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
              {card.totalQuestions} câu
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {card.title}
          </h4>
          {card.tag && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{card.tag}</p>
          )}
        </div>

        {/* Quy mô bài học (Admin chỉ hiển thị tổng số câu) */}
        <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between items-center gap-2 text-slate-600">
            <span className="font-medium">Tổng số câu hỏi:</span>
            <strong className="text-blue-700 font-mono font-bold whitespace-nowrap">{fallbackTotal} câu</strong>
          </div>
          <div className="flex justify-between items-center gap-2 text-slate-600">
            <span className="font-medium">Phần thi:</span>
            <span className="text-slate-800 font-semibold whitespace-nowrap">{formatReadingPartLabel(card as any)}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenTheory(card)}
            className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Xem chi tiết bài đọc & đáp án (Part 5, 6, 7)"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Chi tiết</span>
          </button>
          <button
            type="button"
            onClick={() => onStartPractice(card)}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Kiểm duyệt & đối soát đề thi"
          >
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Kiểm duyệt</span>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={(e) => onOpenEditCard(card, e)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
            title="Chỉnh sửa bài tập"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onOpenDeleteConfirm(card)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
            title="Xóa bài tập này"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const ReadingCardGrid: React.FC<ReadingCardGridProps> = ({
  cards,
  viewMode,
  highlightedCardId,
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
  onToggleCardStatus,
  onDeleteAllDrafts,
  onPublishAllDrafts,
}) => {
  if (cards.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
        Không tìm thấy chuyên đề đọc hiểu nào phù hợp với bộ lọc tìm kiếm.
      </div>
    );
  }

  const testCards = cards.filter(
    (c) =>
      c.id.includes("-test-") ||
      (c.tag && c.tag.includes("Test")) ||
      c.title.includes("Test") ||
      c.title.includes("Bộ đề")
  );

  const levelCards = cards.filter(
    (c) =>
      !testCards.some((tc) => tc.id === c.id) &&
      (c.subCategory === "levels" ||
        c.id.includes("-level-") ||
        c.title.startsWith("Lv.") ||
        c.title.includes("Level"))
  );

  const topicAndGrammarCards = cards.filter(
    (c) => !testCards.some((tc) => tc.id === c.id) && !levelCards.some((lc) => lc.id === c.id)
  );

  const draftAndCustomCards = cards.filter(
    (c) => c.status === "draft" || c.id === highlightedCardId
  );

  const renderCardGrid = (items: ExerciseCardData[]) => {
    if (items.length === 0) {
      return (
        <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 text-xs">
          Không có bài học nào trong mục này với bộ lọc hiện tại.
        </div>
      );
    }

    if (viewMode === "table") {
      return (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  <th className="py-3.5 px-4 min-w-[260px]">Chuyên đề bài đọc</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Phần thi / Dạng bài</th>
                  <th className="py-3.5 px-4 text-center min-w-[100px]">Số câu hỏi</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {items.map((card) => (
                  <ReadingTableRow
                    key={card.id}
                    card={card}
                    isHighlighted={card.id === highlightedCardId}
                    onStartPractice={onStartPractice}
                    onOpenTheory={onOpenTheory}
                    onOpenEditCard={onOpenEditCard}
                    onOpenDeleteConfirm={onOpenDeleteConfirm}
                    onToggleCardStatus={onToggleCardStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-4">
        {items.map((card) => (
          <ReadingGridItem
            key={card.id}
            card={card}
            isHighlighted={card.id === highlightedCardId}
            onStartPractice={onStartPractice}
            onOpenTheory={onOpenTheory}
            onOpenEditCard={onOpenEditCard}
            onOpenDeleteConfirm={onOpenDeleteConfirm}
            onToggleCardStatus={onToggleCardStatus}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="@container w-full space-y-8">
      {/* NHÓM 0: BÀI ĐỌC MỚI THÊM & BẢN NHÁP (LUÔN ĐỨNG TRÊN CÙNG ĐỂ ADMIN DỄ THẤY) */}
      {draftAndCustomCards.length > 0 && (
        <section className="space-y-3 p-4 sm:p-5 rounded-3xl bg-amber-50/40 border-2 border-amber-200/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>✨ Bài Đọc Mới Thêm &amp; Bản Nháp Quản Trị</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold font-mono shadow-xs">
                  {draftAndCustomCards.length} Bài
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Các bộ đề vừa được import hoặc đang biên soạn ở trạng thái <strong>Bản nháp</strong> (học viên chưa nhìn thấy). Bạn có thể bấm vào huy hiệu trạng thái để Phát hành!
              </p>
            </div>

            {draftAndCustomCards.length >= 2 && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {onPublishAllDrafts && (
                  <button
                    type="button"
                    onClick={() => onPublishAllDrafts(draftAndCustomCards)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Phát hành toàn bộ các bài bản nháp cho học viên"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Phát hành tất cả ({draftAndCustomCards.length})</span>
                  </button>
                )}
                {onDeleteAllDrafts && (
                  <button
                    type="button"
                    onClick={() => onDeleteAllDrafts(draftAndCustomCards)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Xóa toàn bộ các bài đọc bản nháp này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa toàn bộ ({draftAndCustomCards.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>
          {renderCardGrid(draftAndCustomCards)}
        </section>
      )}

      {/* NHÓM 1: 10 BỘ ĐỀ ETS 2024 */}
      {testCards.length > 0 && (
        <section className="space-y-3">
          {renderCardGrid(testCards)}
        </section>
      )}

      {/* NHÓM 2: THEO CẤP ĐỘ ĐIỂM (LEVELS) */}
      {levelCards.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>🎯 Luyện Đọc Theo 4 Cấp Độ Điểm Target</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold font-mono whitespace-nowrap">
                {levelCards.length} Bài
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân cấp độ bài đọc từ cơ bản (Lv.1 dưới 200 điểm) đến nâng cao (Lv.4 trên 750 điểm).
            </p>
          </div>
          {renderCardGrid(levelCards)}
        </section>
      )}

      {/* NHÓM 3: CHUYÊN ĐỀ NGỮ PHÁP & TỪ LOẠI READING */}
      {topicAndGrammarCards.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>⚡ Chuyên Đề &amp; Dạng Bài Tập Trọng Tâm</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold font-mono whitespace-nowrap">
                {topicAndGrammarCards.length} Chuyên đề
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các dạng bài tập ngữ pháp, mệnh đề danh từ, thì động từ hay gặp nhất trong TOEIC Reading.
            </p>
          </div>
          {renderCardGrid(topicAndGrammarCards)}
        </section>
      )}
    </div>
  );
};
