"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Eye,
  Book,
  Gamepad2,
  Volume2,
  X,
  Check,
  RotateCcw,
  Star,
  Brain,
  TrendingUp,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

interface WordItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  level: string;
  starred?: boolean;
}

interface TestItem {
  id: string;
  year: string;
  title: string;
  wordCount: number;
  category: "2026" | "600_essential" | "2023";
  words: WordItem[];
}

const SAMPLE_WORDS: WordItem[] = [
  {
    id: "w-1",
    word: "negotiate",
    ipa: "/nəˈɡoʊʃieɪt/",
    partOfSpeech: "Verb",
    meaning: "Đàm phán, thương lượng hợp đồng hoặc thỏa thuận thương mại",
    example: "The executive team successfully negotiated a lucrative distribution agreement.",
    level: "B2",
    starred: true,
  },
  {
    id: "w-2",
    word: "invoice",
    ipa: "/ˈɪnvɔɪs/",
    partOfSpeech: "Noun",
    meaning: "Hóa đơn thanh toán hàng hóa hoặc dịch vụ",
    example: "All invoices must be submitted to the finance department by the end of each month.",
    level: "B1",
  },
  {
    id: "w-3",
    word: "implement",
    ipa: "/ˈɪmplɪment/",
    partOfSpeech: "Verb",
    meaning: "Triển khai, thực thi chính sách hoặc quy trình mới",
    example: "We plan to implement the revised safety protocol starting next Monday.",
    level: "B2",
  },
  {
    id: "w-4",
    word: "itinerary",
    ipa: "/aɪˈtɪnəreri/",
    partOfSpeech: "Noun",
    meaning: "Lịch trình chi tiết chuyến đi công tác hoặc hội nghị",
    example: "The corporate travel coordinator emailed the complete flight itinerary to the delegate.",
    level: "B1",
  },
  {
    id: "w-5",
    word: "warranty",
    ipa: "/ˈwɔːrənti/",
    partOfSpeech: "Noun",
    meaning: "Phiếu bảo hành hoặc cam kết chất lượng sản phẩm",
    example: "The commercial air conditioner is covered by an extensive three-year warranty.",
    level: "B1",
    starred: true,
  },
  {
    id: "w-6",
    word: "collaborate",
    ipa: "/kəˈlæbəreɪt/",
    partOfSpeech: "Verb",
    meaning: "Hợp tác, cùng làm việc trong dự án",
    example: "Engineers from both branches collaborated on developing the AI engine.",
    level: "B2",
  },
  {
    id: "w-7",
    word: "revenue",
    ipa: "/ˈrevənuː/",
    partOfSpeech: "Noun",
    meaning: "Tổng doanh thu, nguồn thu nhập doanh nghiệp",
    example: "Online marketing efforts resulted in a 25% increase in total quarterly revenue.",
    level: "B2",
  },
  {
    id: "w-8",
    word: "recruit",
    ipa: "/rɪˈkruːt/",
    partOfSpeech: "Verb",
    meaning: "Tuyển dụng nhân sự mới cho cơ quan tổ chức",
    example: "The human resources manager hopes to recruit talented front-end developers.",
    level: "B1",
  },
];

const INITIAL_TESTS: TestItem[] = [
  // 10 Tests cho năm 2026
  { id: "test-2026-1", year: "2026", title: "Test 1", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-2", year: "2026", title: "Test 2", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-3", year: "2026", title: "Test 3", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-4", year: "2026", title: "Test 4", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-5", year: "2026", title: "Test 5", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-6", year: "2026", title: "Test 6", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-7", year: "2026", title: "Test 7", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-8", year: "2026", title: "Test 8", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-9", year: "2026", title: "Test 9", wordCount: 160, category: "2026", words: SAMPLE_WORDS },
  { id: "test-2026-10", year: "2026", title: "Test 10", wordCount: 160, category: "2026", words: SAMPLE_WORDS },

  // Bộ 600 Essential Words
  { id: "essential-1", year: "Essential", title: "Contracts (Hợp đồng)", wordCount: 12, category: "600_essential", words: SAMPLE_WORDS },
  { id: "essential-2", year: "Essential", title: "Marketing (Tiếp thị)", wordCount: 12, category: "600_essential", words: SAMPLE_WORDS },
  { id: "essential-3", year: "Essential", title: "Warranties (Bảo hành)", wordCount: 12, category: "600_essential", words: SAMPLE_WORDS },
  { id: "essential-4", year: "Essential", title: "Office Equipment", wordCount: 12, category: "600_essential", words: SAMPLE_WORDS },
  { id: "essential-5", year: "Essential", title: "Human Resources", wordCount: 12, category: "600_essential", words: SAMPLE_WORDS },
  { id: "essential-6", year: "Essential", title: "Financial Reports", wordCount: 12, category: "600_essential", words: SAMPLE_WORDS },

  // Bộ 2023
  { id: "test-2023-1", year: "2023", title: "Test 1 (ETS 2023)", wordCount: 150, category: "2023", words: SAMPLE_WORDS },
  { id: "test-2023-2", year: "2023", title: "Test 2 (ETS 2023)", wordCount: 150, category: "2023", words: SAMPLE_WORDS },
  { id: "test-2023-3", year: "2023", title: "Test 3 (ETS 2023)", wordCount: 150, category: "2023", words: SAMPLE_WORDS },
  { id: "test-2023-4", year: "2023", title: "Test 4 (ETS 2023)", wordCount: 150, category: "2023", words: SAMPLE_WORDS },
];

export default function VocabularyLearningPage() {
  const [activeMainTab, setActiveMainTab] = useState<"study" | "progress" | "my_words" | "algorithm">("study");
  const [activeSubCategory, setActiveSubCategory] = useState<"2026" | "600_essential" | "2023">("2026");

  // Modals state
  const [wordListModalTest, setWordListModalTest] = useState<TestItem | null>(null);
  const [flashcardModalTest, setFlashcardModalTest] = useState<TestItem | null>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gameModalTest, setGameModalTest] = useState<TestItem | null>(null);

  // Game state
  const [gameQuestionIndex, setGameQuestionIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameSelectedOption, setGameSelectedOption] = useState<number | null>(null);
  const [gameAnswerChecked, setGameAnswerChecked] = useState(false);

  // Audio synthesis
  const playAudio = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text.trim()) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered test items
  const currentTests = INITIAL_TESTS.filter((t) => t.category === activeSubCategory);

  // My Starred words
  const starredWords = SAMPLE_WORDS.filter((w) => w.starred);

  // Start Flashcards
  const handleOpenFlashcards = (test: TestItem) => {
    setFlashcardModalTest(test);
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  // Start Game
  const handleOpenGame = (test: TestItem) => {
    setGameModalTest(test);
    setGameQuestionIndex(0);
    setGameScore(0);
    setGameSelectedOption(null);
    setGameAnswerChecked(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* KHỐI 1: HEADER BANNER CHINH PHỤC TỪ VỰNG TOEIC */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Spaced Repetition System
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Chinh phục <span className="text-blue-600">Từ vựng TOEIC</span>
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-2xl leading-relaxed">
            Học theo phương pháp lặp lại ngắt quãng: đúng từ, đúng lúc, nhớ lâu mà tốn ít công sức.
          </p>
        </div>

        {/* Icon Sách Xanh lớn góc phải */}
        <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
        </div>
      </div>

      {/* KHỐI 2: THANH TAB CHUYỂN CHẾ ĐỘ CHÍNH */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 rounded-full w-fit">
        <button
          type="button"
          onClick={() => setActiveMainTab("study")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "study"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Book className="w-4 h-4" />
          Học
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("progress")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "progress"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Tiến độ
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("my_words")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "my_words"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Star className="w-4 h-4" />
          Từ vựng của tôi
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("algorithm")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            activeMainTab === "algorithm"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Brain className="w-4 h-4" />
          Thuật toán học từ
        </button>
      </div>

      {/* --- TAB 1: HỌC (DANH SÁCH BỘ ĐỀ / TEST CARDS) --- */}
      {activeMainTab === "study" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Sub-filter tabs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveSubCategory("2026")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubCategory === "2026"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              2026 (10)
            </button>

            <button
              type="button"
              onClick={() => setActiveSubCategory("600_essential")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubCategory === "600_essential"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              600 Essential Words (50)
            </button>

            <button
              type="button"
              onClick={() => setActiveSubCategory("2023")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeSubCategory === "2023"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              2023 (10)
            </button>
          </div>

          {/* Grid các thẻ Test */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {currentTests.map((t) => (
              <div
                key={t.id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between min-h-[145px]"
              >
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-600">
                    {t.year}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-blue-700 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {t.wordCount} từ vựng
                  </p>
                </div>

                {/* 3 Nút thao tác: Xem từ | Học | Chơi */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  {/* Xem từ */}
                  <button
                    type="button"
                    onClick={() => setWordListModalTest(t)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Xem toàn bộ danh sách từ"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    Xem từ
                  </button>

                  {/* Học */}
                  <button
                    type="button"
                    onClick={() => handleOpenFlashcards(t)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Học Flashcard lặp lại ngắt quãng"
                  >
                    <Book className="w-3.5 h-3.5 text-slate-600" />
                    Học
                  </button>

                  {/* Chơi */}
                  <button
                    type="button"
                    onClick={() => handleOpenGame(t)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Mini-game trắc nghiệm ôn từ"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-slate-600" />
                    Chơi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: TIẾN ĐỘ HỌC TẬP & ĐƯỜNG CONG QUÊN LÃNG --- */}
      {activeMainTab === "progress" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Đã nhớ vĩnh viễn
              </span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">342 từ</p>
              <span className="text-xs text-slate-500 mt-1 block">Vượt qua chu kỳ 30 ngày</span>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Đang trong chu kỳ học
              </span>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">128 từ</p>
              <span className="text-xs text-slate-500 mt-1 block">Ôn lại theo ngắt quãng</span>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cần ôn tập hôm nay
              </span>
              <p className="text-3xl font-extrabold text-amber-500 mt-2">24 từ</p>
              <span className="text-xs text-slate-500 mt-1 block">Đến thời điểm vàng ghi nhớ</span>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Chuỗi học liên tục
              </span>
              <p className="text-3xl font-extrabold text-rose-500 mt-2 flex items-center gap-1.5">
                7 ngày <Flame className="w-6 h-6 fill-rose-500 text-rose-500" />
              </p>
              <span className="text-xs text-slate-500 mt-1 block">Rất chăm chỉ!</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Đường cong quên lãng Ebbinghaus & Dự báo khả năng ghi nhớ
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Hệ thống TOEIC AI theo dõi chính xác thời điểm bạn chuẩn bị quên từ để kích hoạt thông báo ôn tập,
              giúp biến trí nhớ ngắn hạn thành trí nhớ vĩnh viễn.
            </p>
            <div className="h-44 w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold">
              📊 Biểu đồ trực quan tiến độ ghi nhớ theo thời gian thực (Real-time SRS Visualizer)
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: TỪ VỰNG CỦA TÔI (STARRED & SAVED) --- */}
      {activeMainTab === "my_words" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Từ vựng đã đánh dấu yêu thích</h2>
              <p className="text-xs text-slate-500">Các từ vựng quan trọng bạn đã lưu lại để ôn tập chuyên sâu.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              {starredWords.length} từ đã lưu
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {starredWords.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{w.word}</span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {w.ipa}
                    </span>
                    <button
                      type="button"
                      onClick={() => playAudio(w.word)}
                      className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-blue-900">{w.meaning}</p>
                  <p className="text-xs text-slate-500 italic">"{w.example}"</p>
                </div>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: THUẬT TOÁN HỌC TỪ (ALGORITHM EXPLAINER) --- */}
      {activeMainTab === "algorithm" && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Cơ chế cốt lõi
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Thuật toán lặp lại ngắt quãng (Spaced Repetition) & BKT
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-blue-950">Đúng từ cần học</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tập trung vào 600 từ xuất hiện nhiều nhất trong đề thi TOEIC thực tế thay vì học dàn trải.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-indigo-950">Đúng thời điểm vàng</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chu kỳ ngắt quãng: Lần 1 (1 ngày) ➔ Lần 2 (3 ngày) ➔ Lần 3 (7 ngày) ➔ Lần 4 (14 ngày) ➔ Lần 5 (30 ngày).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-emerald-950">Nhớ lâu tốn ít công</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chỉ dành 10 - 15 phút mỗi ngày, hệ thống sẽ tự động lọc ra các từ bạn sắp quên để nhắc học.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: XEM TỪ (WORD LIST MODAL) --- */}
      {wordListModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setWordListModalTest(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Danh sách từ vựng
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {wordListModalTest.title} ({wordListModalTest.wordCount} từ)
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {wordListModalTest.words.map((w, index) => (
                <div key={w.id} className="py-3.5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {index + 1}. {w.word}
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {w.ipa}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {w.partOfSpeech}
                      </span>
                      <button
                        type="button"
                        onClick={() => playAudio(w.word)}
                        className="w-6 h-6 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{w.meaning}</p>
                    <p className="text-xs text-slate-500 italic leading-relaxed">"{w.example}"</p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                    {w.level}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = wordListModalTest;
                  setWordListModalTest(null);
                  handleOpenFlashcards(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Bắt đầu học Flashcard
              </button>
              <button
                type="button"
                onClick={() => setWordListModalTest(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: HỌC FLASHCARD (SPACED REPETITION STUDY MODE) --- */}
      {flashcardModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setFlashcardModalTest(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Flashcard • {flashcardModalTest.title}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">
                {flashcardIndex + 1} / {flashcardModalTest.words.length}
              </span>
            </div>

            {/* Thẻ lật 3D */}
            {(() => {
              const currentWord = flashcardModalTest.words[flashcardIndex];
              if (!currentWord) return null;

              return (
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer transition-all duration-300 min-h-[250px] rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/40 via-sky-50/30 to-white p-6 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg shadow-sm"
                >
                  {!isFlipped ? (
                    /* Mặt trước */
                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                          {currentWord.word}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                          {currentWord.partOfSpeech}
                        </span>
                      </div>
                      <div className="text-sm font-mono text-slate-500 bg-white/80 border border-blue-100 px-3 py-1 rounded-lg">
                        {currentWord.ipa}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(currentWord.word);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe phát âm
                      </button>
                      <p className="text-xs text-slate-400 pt-2 font-medium">
                        👆 Chạm vào thẻ để xem nghĩa & ví dụ
                      </p>
                    </div>
                  ) : (
                    /* Mặt sau */
                    <div className="space-y-3.5 text-left py-2">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Định nghĩa tiếng Việt:
                        </span>
                        <p className="text-lg font-bold text-blue-900 mt-0.5">
                          {currentWord.meaning}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Ví dụ ngữ cảnh TOEIC:
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed mt-1 bg-white/90 p-3 rounded-xl border border-blue-100 shadow-2xs font-medium italic">
                          "{currentWord.example}"
                        </p>
                      </div>
                      <p className="text-center text-xs text-slate-400 pt-1 font-medium">
                        👆 Chạm để lật lại từ tiếng Anh
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3 Nút đánh giá Spaced Repetition */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Mức độ ghi nhớ của bạn:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < flashcardModalTest.words.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Chưa nhớ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < flashcardModalTest.words.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Tạm nhớ (3 ngày)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex((prev) =>
                      prev < flashcardModalTest.words.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="flex-1 py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Nhớ rõ (7 ngày)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CHƠI MINI-GAME (GAMIFIED PRACTICE MODE) --- */}
      {gameModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setGameModalTest(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                Mini-game Ôn Từ Nhanh
              </span>
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                Điểm: {gameScore}
              </span>
            </div>

            {(() => {
              const currentWord = gameModalTest.words[gameQuestionIndex];
              if (!currentWord) return null;

              // Tạo 3 đáp án sai giả lập
              const options = [
                currentWord.meaning,
                "Hoãn lại cuộc họp quan trọng của ban giám đốc",
                "Phân tích dữ liệu tài chính quý",
                "Chấp thuận chính sách tiền lương mới",
              ].sort(() => 0.5 - Math.random());

              const handlePickOption = (idx: number) => {
                if (gameAnswerChecked) return;
                setGameSelectedOption(idx);
                setGameAnswerChecked(true);
                if (options[idx] === currentWord.meaning) {
                  setGameScore((prev) => prev + 10);
                }
              };

              return (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white text-center space-y-1">
                    <span className="text-xs uppercase tracking-wider text-blue-100 font-bold">
                      Từ tiếng Anh:
                    </span>
                    <h3 className="text-2xl font-black">{currentWord.word}</h3>
                    <p className="text-xs font-mono text-blue-200">{currentWord.ipa}</p>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 text-center">
                    Hãy chọn định nghĩa tiếng Việt chính xác nhất:
                  </p>

                  <div className="space-y-2">
                    {options.map((opt, i) => {
                      const isCorrect = opt === currentWord.meaning;
                      const isSelected = gameSelectedOption === i;

                      let btnStyle = "bg-white border-slate-200 hover:bg-slate-50 text-slate-800";
                      if (gameAnswerChecked) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold";
                        } else {
                          btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={gameAnswerChecked}
                          onClick={() => handlePickOption(i)}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {gameAnswerChecked && (
                    <button
                      type="button"
                      onClick={() => {
                        setGameAnswerChecked(false);
                        setGameSelectedOption(null);
                        setGameQuestionIndex((prev) =>
                          prev < gameModalTest.words.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                    >
                      Từ tiếp theo →
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
