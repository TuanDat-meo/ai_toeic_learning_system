"use client";

import React from "react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { PracticeProgressBar } from "@/components/common/PracticeProgressBar";
import { useItemProgress } from "@/lib/practiceProgress";

interface ReadingCardGridProps {
  cards: ExerciseCardData[];
  viewMode: "table" | "grid";
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
}

function ReadingTableRow({
  card,
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
}: {
  card: ExerciseCardData;
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
}) {
  const fallbackTotal = card.totalQuestions || 10;
  const progress = useItemProgress(`reading-${card.id}`, fallbackTotal);
  const completed = Math.max(card.studiedQuestions || 0, progress.completedQuestions);

  return (
    <tr className="hover:bg-slate-50/70 transition">
      <td className="py-3.5 px-4">
        <p className="font-bold text-slate-900 leading-snug">{card.title}</p>
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
        {card.totalQuestions} câu
      </td>

      <td className="py-3.5 px-4 min-w-[210px]">
        <div className="space-y-1">
          <PracticeProgressBar
            completed={completed}
            total={fallbackTotal}
            compact
            unit="câu"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="text-emerald-600 font-bold">✓ {card.correctAnswers} đúng</span>
            <span className="text-rose-500 font-bold">✕ {card.wrongAnswers} sai</span>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Đã phát hành</span>
        </span>
      </td>

      <td className="py-3.5 px-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onOpenTheory(card)}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Xem lý thuyết chuyên đề"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onStartPractice(card)}
            className="p-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
            title="Xem trước bài tập"
          >
            <Eye className="w-3.5 h-3.5" />
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
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
}: {
  card: ExerciseCardData;
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
}) {
  const fallbackTotal = card.totalQuestions || 10;
  const progress = useItemProgress(`reading-${card.id}`, fallbackTotal);
  const completed = Math.max(card.studiedQuestions || 0, progress.completedQuestions);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {card.category}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {card.totalQuestions} câu
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {card.title}
          </h4>
          {card.tag && (
            <p className="text-xs text-slate-400 mt-0.5">{card.tag}</p>
          )}
        </div>

        {/* Quy mô bài học (Admin chỉ hiển thị tổng số câu) */}
        <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Tổng số câu hỏi:</span>
            <strong className="text-blue-700 font-mono font-bold">{fallbackTotal} câu</strong>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Thời gian chuẩn:</span>
            <span className="font-mono text-slate-800 font-semibold">{(card as any).timeMinutes || 20} phút</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Phần thi:</span>
            <span className="text-slate-800 font-semibold">{(card as any).part || "Part 7"}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenTheory(card)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Xem lý thuyết"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Lý thuyết</span>
          </button>
          <button
            type="button"
            onClick={() => onStartPractice(card)}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Xem trước bài tập"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Luyện tập</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
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
  onStartPractice,
  onOpenTheory,
  onOpenEditCard,
  onOpenDeleteConfirm,
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
                  <th className="py-3.5 px-4 min-w-[220px]">Tiến độ học (Đã học / Chưa học)</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {items.map((card) => (
                  <ReadingTableRow
                    key={card.id}
                    card={card}
                    onStartPractice={onStartPractice}
                    onOpenTheory={onOpenTheory}
                    onOpenEditCard={onOpenEditCard}
                    onOpenDeleteConfirm={onOpenDeleteConfirm}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((card) => (
          <ReadingGridItem
            key={card.id}
            card={card}
            onStartPractice={onStartPractice}
            onOpenTheory={onOpenTheory}
            onOpenEditCard={onOpenEditCard}
            onOpenDeleteConfirm={onOpenDeleteConfirm}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
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
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🎯 Luyện Đọc Theo 4 Cấp Độ Điểm Target</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold font-mono">
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
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚡ Chuyên Đề &amp; Dạng Bài Tập Trọng Tâm</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold font-mono">
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
