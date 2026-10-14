"use client";

import React from "react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";
import {
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface ReadingCardGridProps {
  cards: ExerciseCardData[];
  viewMode: "table" | "grid";
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
  onOpenEditCard: (card: ExerciseCardData, e?: React.MouseEvent) => void;
  onOpenDeleteConfirm: (card: ExerciseCardData) => void;
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

  // Phân chia dữ liệu thành 3 khung rõ ràng theo yêu cầu:
  // 1. 10 Bộ đề ETS 2024 (Full Test Part 5, 6, 7)
  // 2. Theo các Level điểm (Lv.1 Dưới 200 -> Lv.4 750-990+)
  // 3. Từ loại, Các thì & Dạng câu hỏi / Thể loại văn bản
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
                  <th className="py-3.5 px-4 min-w-[200px]">Tiến độ học (Đã học / Chưa học)</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {items.map((card) => {
                  return (
                    <tr key={card.id} className="hover:bg-slate-50/70 transition">
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

                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span className="text-emerald-600 text-sm">
                              {card.studiedQuestions}/{card.totalQuestions}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600 font-bold">✓ {card.correctAnswers}</span>
                              <span className="text-rose-500 font-bold">✕ {card.wrongAnswers}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Chưa làm: {Math.max(0, card.totalQuestions - card.studiedQuestions)}</span>
                            <span>{Math.round(((card.studiedQuestions || 0) / card.totalQuestions) * 100)}%</span>
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
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            title="Xem lý thuyết & cấu trúc bài đọc"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onStartPractice(card)}
                            className="p-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                            title="Xem trước bài tập học viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => onOpenEditCard(card, e)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                            title="Chỉnh sửa chuyên đề đọc"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDeleteConfirm(card)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="Xóa chuyên đề này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((card) => {
          const accuracy =
            card.studiedQuestions > 0
              ? Math.round((card.correctAnswers / card.studiedQuestions) * 100)
              : 74;

          return (
            <div
              key={card.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {card.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Đã phát hành
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {card.title}
                  </h3>
                  {card.tag && (
                    <p className="text-xs text-slate-400 mt-0.5">{card.tag}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tiến độ bài làm:</span>
                    <div className="flex items-center gap-2 font-mono font-bold">
                      {/* Số câu đã làm (xanh ngọc) / Tổng số câu */}
                      <span className="text-emerald-600 text-sm">
                        {card.studiedQuestions > 0 ? card.studiedQuestions : 0}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-400">
                        {card.totalQuestions}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {/* Đã làm đúng (xanh lá cây ✓) */}
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold font-mono">
                        ✓ {card.correctAnswers}
                      </span>
                      {/* Đã làm sai (đỏ ✕) */}
                      <span className="inline-flex items-center gap-0.5 text-rose-500 font-bold font-mono">
                        ✕ {card.wrongAnswers}
                      </span>
                    </div>

                    {/* Chưa học / Chưa làm (xám) */}
                    <span className="text-slate-400 font-medium font-mono">
                      Chưa làm: {Math.max(0, card.totalQuestions - card.studiedQuestions)}
                    </span>
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
                    title="Sửa bài đọc"
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
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* KHUNG 1: 10 BỘ ĐỀ ETS 2024 */}
      {testCards.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1">
                <span>Khung 1</span>
                <span>•</span>
                <span>Chuẩn format ETS 2024</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>📚 10 Bộ Đề Thi Chuẩn ETS 2024</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {testCards.length} đề
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Toàn bộ đề thi thực chiến theo từng Test từ Test 1 đến Test 10 (đầy đủ Part 5, Part 6 và Part 7).
              </p>
            </div>
          </div>
          {renderCardGrid(testCards)}
        </section>
      )}

      {/* KHUNG 2: THEO CÁC LEVEL ĐIỂM */}
      {levelCards.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-1">
                <span>Khung 2</span>
                <span>•</span>
                <span>Phân tầng trình độ</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>🎯 Luyện Tập Theo Cấp Độ Điểm (Levels)</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {levelCards.length} cấp độ
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Phân loại bài đọc theo thang điểm mục tiêu: Lv.1 (Dưới 200 điểm) đến Lv.4 (750 - 990+ điểm).
              </p>
            </div>
          </div>
          {renderCardGrid(levelCards)}
        </section>
      )}

      {/* KHUNG 3: TỪ LOẠI, THÌ ĐỘNG TỪ & CHUYÊN ĐỀ NGỮ PHÁP / THỂ LOẠI */}
      {topicAndGrammarCards.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1">
                <span>Khung 3</span>
                <span>•</span>
                <span>Từ loại &amp; Các thì ngữ pháp</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>🧩 Từ Loại, Các Thì &amp; Chuyên Đề Trọng Điểm</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {topicAndGrammarCards.length} chủ điểm
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Luyện chuyên sâu theo Danh từ, Tính từ, Trạng từ, Thì động từ, Bị động, Mệnh đề quan hệ, Liên từ - Giới từ...
              </p>
            </div>
          </div>
          {renderCardGrid(topicAndGrammarCards)}
        </section>
      )}
    </div>
  );
};
