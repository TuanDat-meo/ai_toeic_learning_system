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
import { StudentCardProgressAction } from "@/components/student/common/StudentCardProgressAction";
import { useItemProgress } from "@/lib/practiceProgress";

interface StudentReadingCardGridProps {
  cards: ExerciseCardData[];
  onStartPractice: (card: ExerciseCardData, startIndex?: number, isRedoWrong?: boolean) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
}

function StudentReadingCardItem({
  card,
  onStartPractice,
  onOpenTheory,
}: {
  card: ExerciseCardData;
  onStartPractice: (card: ExerciseCardData, startIndex?: number, isRedoWrong?: boolean) => void;
  onOpenTheory: (card: ExerciseCardData) => void;
}) {
  const fallbackTotal = card.totalQuestions || 10;
  const progress = useItemProgress(`reading-${card.id}`, fallbackTotal);
  const completed = Math.max(progress.completedQuestions, card.studiedQuestions || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
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

        {/* Khung thống kê và các nút điều khiển đúng chuẩn Ảnh 2 */}
        <div className="pt-2">
          <StudentCardProgressAction
            progressKey={`reading-${card.id}`}
            totalQuestions={card.totalQuestions || 30}
            savedCount={(card as any).savedVocabCount || 2}
            actionLabel="Học ngay"
            onStart={(nextIdx) => onStartPractice(card, nextIdx, false)}
            onRedoWrong={() => onStartPractice(card, 0, true)}
            onOpenTheory={() => onOpenTheory(card)}
          />
        </div>
      </div>
    </div>
  );
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
  const [selectedSeries, setSelectedSeries] = useState<"all" | "2024" | "2023" | "2022">("all");

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
  // 1. Kho Bộ đề ETS 2024, 2023, 2022 (Full Test Part 5, 6, 7)
  const testCards = filteredCards.filter((c) => {
    const isTest =
      c.id.includes("-test-") ||
      (c.tag && c.tag.includes("Test")) ||
      c.title.includes("Test") ||
      c.title.includes("Bộ đề");
    if (!isTest) return false;
    if (selectedSeries === "all") return true;
    if (selectedSeries === "2024") return c.title.includes("2024") || c.id.includes("2024") || (c.tag && c.tag.includes("2024"));
    if (selectedSeries === "2023") return c.title.includes("2023") || c.id.includes("2023") || (c.tag && c.tag.includes("2023"));
    if (selectedSeries === "2022") return c.title.includes("2022") || c.id.includes("2022") || (c.tag && c.tag.includes("2022"));
    return true;
  });

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
        {items.map((card) => (
          <StudentReadingCardItem
            key={card.id}
            card={card}
            onStartPractice={onStartPractice}
            onOpenTheory={onOpenTheory}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm & lọc thể loại */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tìm kiếm */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, dạng bài, thẻ tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Lọc thể loại */}
        <div className="flex-1 min-w-0 max-w-full flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar">
        {/* Lọc Năm / Bộ đề ETS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Tất cả năm" },
            { id: "2024", label: "ETS 2024" },
            { id: "2023", label: "ETS 2023" },
            { id: "2022", label: "ETS 2022" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSeries(s.id as "all" | "2024" | "2023" | "2022")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedSeries === s.id
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            {[
            { id: "all", label: "Tất cả dạng bài" },
            { id: "part5", label: "Part 5 (Điền từ)" },
            { id: "part6", label: "Part 6 (Điền đoạn)" },
            { id: "part7", label: "Part 7 (Đọc hiểu)" },
            { id: "grammar", label: "Chuyên đề ngữ pháp" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as "all" | "grammar" | "part5" | "part6" | "part7")}
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
      </div>

      {/* DANH SÁCH BÀI LÀM PHÂN THEO NHÓM */}
      <div className="space-y-8">
        {/* NHÓM 1: 10 BỘ ĐỀ ETS 2024 (ẨN KHI KHÔNG CÓ ĐỀ) */}
        {testCards.length > 0 && (
          <section className="space-y-3.5">
            {renderCardGrid(testCards)}
          </section>
        )}

        {/* NHÓM 2: THEO CẤP ĐỘ ĐIỂM (LEVELS) */}
        {levelCards.length > 0 && (
          <section className="space-y-3.5">
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
          <section className="space-y-3.5">
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
    </div>
  );
};
