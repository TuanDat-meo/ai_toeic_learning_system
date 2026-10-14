"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Play,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { ExerciseCardData } from "@/app/admin/content/reading/types";

interface StudentReadingCardGridProps {
  cards: ExerciseCardData[];
  onStartPractice: (card: ExerciseCardData) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
}

export const StudentReadingCardGrid: React.FC<StudentReadingCardGridProps> = ({
  cards,
  onStartPractice,
  onOpenTheory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "grammar" | "part5" | "part6" | "part7"
  >("all");

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const matchCategory =
        selectedCategory === "all" || c.category === selectedCategory;
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tag && c.tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [cards, selectedCategory, searchQuery]);

  // Phân chia thành 3 nhóm chuẩn:
  // 1. 10 Bộ đề ETS 2024 (Full Test Part 5, 6, 7)
  const testCards = filteredCards.filter(
    (c) =>
      c.id.includes("-test-") ||
      (c.tag && c.tag.includes("Test")) ||
      c.title.includes("Test") ||
      c.title.includes("Bộ đề")
  );

  // 2. Theo các Level điểm (Lv.1 Dưới 200 -> Lv.4 750-990+)
  const levelCards = filteredCards.filter(
    (c) =>
      !testCards.some((tc) => tc.id === c.id) &&
      (c.subCategory === "levels" ||
        c.id.includes("-level-") ||
        c.title.startsWith("Lv.") ||
        c.title.includes("Level"))
  );

  // 3. Từ loại, Các thì & Dạng câu hỏi (Trọng tâm Ngữ pháp Reading)
  const topicAndGrammarCards = filteredCards.filter(
    (c) =>
      !testCards.some((tc) => tc.id === c.id) &&
      !levelCards.some((lc) => lc.id === c.id)
  );

  const renderCardGrid = (items: ExerciseCardData[]) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                    {card.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Sẵn sàng luyện
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h4>
                  {card.tag && (
                    <p className="text-xs text-slate-400 mt-0.5">{card.tag}</p>
                  )}
                </div>

                {/* Khung chỉ số bài học */}
                <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Quy mô bài làm:</span>
                    <span className="font-mono font-extrabold text-blue-600">
                      {card.totalQuestions} câu hỏi
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Đã làm: {card.studiedQuestions || 0} câu
                    </span>
                    <span className="font-mono text-slate-400">
                      Còn lại: {Math.max(0, card.totalQuestions - (card.studiedQuestions || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút hành động học viên */}
              <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => onOpenTheory(card)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Xem tóm tắt lý thuyết"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Lý thuyết
                </button>
                <button
                  type="button"
                  onClick={() => onStartPractice(card)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Bắt đầu luyện tập bài đọc"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Luyện tập
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm & lọc thể loại */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Tìm kiếm */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bài đọc, Test, từ loại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Lọc danh mục Part */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: `Tất cả (${cards.length})` },
            { id: "part5", label: "Part 5 (Điền câu)" },
            { id: "part6", label: "Part 6 (Điền đoạn)" },
            { id: "part7", label: "Part 7 (Đọc hiểu)" },
            { id: "grammar", label: "Ngữ pháp Reading" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* KHUNG 1: BỘ ĐỀ ETS 2024 FULL READING (ẨN ĐI NẾU KHÔNG CÓ BÀI) */}
      {testCards.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Bộ đề ETS 2024 Thực chiến (Test 1 – 10)
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Full Part 5, 6, 7
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Đầy đủ câu hỏi trắc nghiệm, bài đọc đơn/đôi/ba và tính năng tra từ điển nhanh.
              </p>
            </div>
          </div>
          {renderCardGrid(testCards)}
        </section>
      )}

      {/* KHUNG 2: THEO CẤP ĐỘ BAND ĐIỂM (ẨN ĐI NẾU KHÔNG CÓ BÀI) */}
      {levelCards.length > 0 && (
        <section className="space-y-3 pt-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Phân loại theo Cấp độ điểm Target
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Lv.1 - Lv.4
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Lộ trình bài đọc thiết kế từng bước từ cơ bản đến chinh phục điểm cao 800+.
            </p>
          </div>
          {renderCardGrid(levelCards)}
        </section>
      )}

      {/* KHUNG 3: THEO CHỦ ĐỀ TỪ LOẠI, THÌ & DẠNG VĂN BẢN (ẨN ĐI NẾU KHÔNG CÓ BÀI) */}
      {topicAndGrammarCards.length > 0 && (
        <section className="space-y-3 pt-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Chuyên đề Từ loại, Thì &amp; Dạng câu hỏi
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                Trọng tâm ngữ pháp
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Tập trung giải quyết các lỗi sai phổ biến về danh từ, tính từ, mệnh đề và thì động từ.
            </p>
          </div>
          {renderCardGrid(topicAndGrammarCards)}
        </section>
      )}

      {/* THÔNG BÁO KHI TẤT CẢ ĐỀU KHÔNG CÓ KẾT QUẢ */}
      {filteredCards.length === 0 && (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 text-xs">
          Không tìm thấy bài học nào phù hợp với bộ lọc tìm kiếm hiện tại.
        </div>
      )}
    </div>
  );
};
