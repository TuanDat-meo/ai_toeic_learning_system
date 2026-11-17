"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  CloudRain,
  FolderKanban,
  Gamepad2,
  Search,
  Sparkles,
  Swords,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import type { VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import { getVocabularyGameScores, getVocabularySetSummaries, type VocabularyGameScore } from "@/lib/api/vocabulary";

type GameId = "word-rain" | "runner" | "battle" | "sentence" | "matching";
type CategoryFilter = "all" | "speed" | "context";

interface GameConfig {
  id: GameId;
  title: string;
  subtitle: string;
  description: string;
  category: "speed" | "context";
  tag: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: "cyan" | "amber" | "violet" | "indigo" | "emerald";
  features: string[];
}

const GAMES_LIST: GameConfig[] = [
  {
    id: "word-rain",
    title: "Mưa Từ Vựng",
    subtitle: "Word Rain · Phản xạ Active Recall",
    description: "Đọc nghĩa tiếng Việt, nhớ và gõ từng chữ cái tiếng Anh để phá giọt mưa trước khi chạm đáy.",
    category: "speed",
    tag: "Active Recall",
    badge: "HOT 🔥",
    icon: CloudRain,
    accentColor: "cyan",
    features: ["Khóa mục tiêu thông minh", "Trợ thủ đóng băng & khiên", "Gõ từng ký tự tiếng Anh"],
  },
  {
    id: "runner",
    title: "Đường Đua Từ Vựng",
    subtitle: "Vocabulary Runner · Vượt chướng ngại vật",
    description: "Điều khiển nhân vật chạy đua, vượt chướng ngại vật bằng cách chọn hoặc gõ từ vựng tiếng Anh chính xác.",
    category: "speed",
    tag: "Phản xạ tốc độ",
    badge: "PHỔ BIẾN",
    icon: Zap,
    accentColor: "amber",
    features: ["Nhịp độ kịch tính", "Tránh né quái thú truy đuổi", "Hộp quà ngẫu nhiên & Combo"],
  },
  {
    id: "battle",
    title: "Chiến Hạm Từ Vựng",
    subtitle: "Vocabulary Battleship · Tác chiến phản xạ",
    description: "Tác chiến hạm đội: Trả lời nhanh trắc nghiệm hoặc nhập từ để tiêu diệt các chiến hạm đang tiến xuống.",
    category: "speed",
    tag: "Đấu trí chiến thuật",
    badge: "CHIẾN ĐẤU",
    icon: Swords,
    accentColor: "violet",
    features: ["Hai chiều Anh-Việt / Việt-Anh", "Kho vũ khí & lá chắn", "Tự động cân bằng tốc độ"],
  },
  {
    id: "sentence",
    title: "SENTENCE MASTER",
    subtitle: "Complete. Think. Master.",
    description: "Hoàn thành câu với từ vựng đúng ngữ cảnh. Chọn Classic để luyện chắc hoặc Time Attack để thử phản xạ.",
    category: "context",
    tag: "Tư duy ngữ cảnh",
    badge: "CHUẨN TOEIC",
    icon: Gamepad2,
    accentColor: "indigo",
    features: ["Câu hỏi và lựa chọn được kiểm tra từ dữ liệu bộ từ", "Classic và Time Attack", "Điểm cuối do máy chủ xác nhận"],
  },
  {
    id: "matching",
    title: "Ghép Cặp Từ Vựng",
    subtitle: "Word Matching · Kết nối phản xạ nhanh",
    description: "Thử thách trí nhớ và tốc độ kết nối: Ghép các từ tiếng Anh với nghĩa tiếng Việt tương ứng trên bảng thẻ.",
    category: "context",
    tag: "Kết nối trí nhớ",
    badge: "TRÍ NHỚ",
    icon: Brain,
    accentColor: "emerald",
    features: ["Ghi nhớ nhanh mặt chữ", "Bảng thẻ trực quan", "Chuỗi điểm liên hoàn (Streak)"],
  },
];

const ACCENT_STYLES: Record<GameConfig["accentColor"], {
  cardBorder: string;
  cardGlow: string;
  iconBg: string;
  iconColor: string;
  tagBg: string;
  tagColor: string;
  badgeBg: string;
  badgeText: string;
  buttonBg: string;
  buttonHover: string;
}> = {
  cyan: {
    cardBorder: "border-cyan-200 hover:border-cyan-500",
    cardGlow: "hover:shadow-cyan-500/10",
    iconBg: "bg-cyan-50 border border-cyan-200",
    iconColor: "text-cyan-700",
    tagBg: "bg-cyan-50 border border-cyan-200",
    tagColor: "text-cyan-800",
    badgeBg: "bg-rose-100 border border-rose-300",
    badgeText: "text-rose-700",
    buttonBg: "bg-cyan-600 text-white",
    buttonHover: "hover:bg-cyan-700",
  },
  amber: {
    cardBorder: "border-amber-200 hover:border-amber-500",
    cardGlow: "hover:shadow-amber-500/10",
    iconBg: "bg-amber-50 border border-amber-200",
    iconColor: "text-amber-700",
    tagBg: "bg-amber-50 border border-amber-200",
    tagColor: "text-amber-800",
    badgeBg: "bg-amber-100 border border-amber-300",
    badgeText: "text-amber-800",
    buttonBg: "bg-amber-600 text-white",
    buttonHover: "hover:bg-amber-700",
  },
  violet: {
    cardBorder: "border-violet-200 hover:border-violet-500",
    cardGlow: "hover:shadow-violet-500/10",
    iconBg: "bg-violet-50 border border-violet-200",
    iconColor: "text-violet-700",
    tagBg: "bg-violet-50 border border-violet-200",
    tagColor: "text-violet-800",
    badgeBg: "bg-violet-100 border border-violet-300",
    badgeText: "text-violet-800",
    buttonBg: "bg-violet-600 text-white",
    buttonHover: "hover:bg-violet-700",
  },
  indigo: {
    cardBorder: "border-indigo-200 hover:border-indigo-500",
    cardGlow: "hover:shadow-indigo-500/10",
    iconBg: "bg-indigo-50 border border-indigo-200",
    iconColor: "text-indigo-700",
    tagBg: "bg-indigo-50 border border-indigo-200",
    tagColor: "text-indigo-800",
    badgeBg: "bg-blue-100 border border-blue-300",
    badgeText: "text-blue-800",
    buttonBg: "bg-indigo-600 text-white",
    buttonHover: "hover:bg-indigo-700",
  },
  emerald: {
    cardBorder: "border-emerald-200 hover:border-emerald-500",
    cardGlow: "hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-50 border border-emerald-200",
    iconColor: "text-emerald-700",
    tagBg: "bg-emerald-50 border border-emerald-200",
    tagColor: "text-emerald-800",
    badgeBg: "bg-emerald-100 border border-emerald-300",
    badgeText: "text-emerald-800",
    buttonBg: "bg-emerald-600 text-white",
    buttonHover: "hover:bg-emerald-700",
  },
};

export default function VocabularyGameCenter({ initialSetId }: { initialSetId?: string }) {
  const [sets, setSets] = useState<VocabularyTestSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState(initialSetId || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<{ setId: string; scores: VocabularyGameScore[] } | null>(null);
  const [scoresError, setScoresError] = useState<{ setId: string; message: string } | null>(null);

  // Filter & Picker Modal states
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");

  useEffect(() => {
    let active = true;
    void getVocabularySetSummaries()
      .then((items) => {
        if (!active) return;
        setSets(items);
        setSelectedSetId((current) =>
          items.some((item) => item.id === current) ? current : items[0]?.id || ""
        );
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải danh sách bộ từ vựng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedSetId) return;
    let active = true;
    void getVocabularyGameScores(selectedSetId)
      .then((items) => {
        if (active) {
          setScores({ setId: selectedSetId, scores: items });
          setScoresError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setScoresError({
            setId: selectedSetId,
            message: reason instanceof Error ? reason.message : "Không thể tải điểm cao.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [selectedSetId]);

  const selectedSet = useMemo(() => {
    return sets.find((item) => item.id === selectedSetId);
  }, [sets, selectedSetId]);

  const filteredSets = useMemo(() => {
    if (!searchSetQuery.trim()) return sets;
    const q = searchSetQuery.toLowerCase().trim();
    return sets.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [sets, searchSetQuery]);

  const filteredGames = useMemo(() => {
    if (categoryFilter === "all") return GAMES_LIST;
    return GAMES_LIST.filter((g) => g.category === categoryFilter);
  }, [categoryFilter]);

  const gameTypeByGame: Record<GameId, string[]> = {
    "word-rain": ["TYPING"],
    runner: ["RUNNER"],
    battle: ["TYPING", "BATTLE"],
    sentence: ["SENTENCE"],
    matching: ["MATCHING"],
  };

  const gameUrl = (game: GameId) => `/vocabulary/games/${game}?setId=${encodeURIComponent(selectedSetId)}`;

  // Quick Stats calculations
  const totalCompletedPlays = useMemo(() => {
    if (!scores?.scores) return 0;
    return scores.scores.reduce((acc, curr) => acc + (curr.completedPlays || 0), 0);
  }, [scores]);

  const highestScore = useMemo(() => {
    if (!scores?.scores || scores.scores.length === 0) return 0;
    return Math.max(...scores.scores.map((s) => s.bestScore || 0));
  }, [scores]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-3 py-2 sm:px-6 sm:py-4 pb-16">
      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Kho từ vựng
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>TOEIC VOCABULARY ARCADE</span>
        </div>
      </div>

      {/* ── Hero Banner Section ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 p-6 sm:p-8 md:p-10 shadow-lg text-white">
        {/* Subtle Decorative Ambient Rings */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-cyan-200 backdrop-blur-sm">
              Đấu trường học tập tương tác
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">
              Trung Tâm Trò Chơi Từ Vựng
            </h1>
            <p className="text-sm leading-relaxed text-indigo-100 sm:text-base">
              Nâng cao phản xạ nhớ từ TOEIC qua các mini-game. Tự động áp dụng phương pháp gợi nhớ chủ động (Active Recall) và lặp lại ngắt quãng (Spaced Repetition) giúp nhớ từ vựng lâu gấp 3 lần.
            </p>
          </div>

          {/* Active Set Card with Switcher */}
          <div className="w-full shrink-0 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-md backdrop-blur-md lg:max-w-sm">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-cyan-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Bộ đề áp dụng</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(true)}
                disabled={loading || sets.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-2.5 py-1 text-xs font-extrabold text-white transition hover:bg-white/30 active:scale-95 disabled:opacity-50"
              >
                <span>Đổi bộ đề</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3">
              {loading ? (
                <div className="py-2 text-xs text-indigo-100 animate-pulse">Đang nạp bộ từ vựng...</div>
              ) : selectedSet ? (
                <div>
                  <h3 className="truncate font-black text-white text-base sm:text-lg" title={selectedSet.title}>
                    {selectedSet.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-white/20 px-2.5 py-0.5 font-bold text-white">
                      {selectedSet.category || "Từ vựng TOEIC"}
                    </span>
                    <span className="rounded-md bg-emerald-400/25 px-2.5 py-0.5 font-black text-emerald-200">
                      {selectedSet.wordCount ?? selectedSet.words?.length ?? 0} từ
                    </span>
                  </div>
                </div>
              ) : (
                <p className="py-2 text-xs text-rose-200">Chưa có bộ từ được phát hành.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Stats Strip ── */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 border-t border-white/20 pt-6 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-indigo-100">Trò chơi sẵn sàng</p>
            <p className="mt-1 text-xl font-black text-white">{GAMES_LIST.length} Chế độ</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-indigo-100">Từ vựng hiện tại</p>
            <p className="mt-1 text-xl font-black text-amber-300">
              {selectedSet ? selectedSet.wordCount ?? selectedSet.words?.length ?? 0 : 0} Từ
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-indigo-100">Lượt chơi hoàn thành</p>
            <p className="mt-1 text-xl font-black text-white">{totalCompletedPlays} Lượt</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-indigo-100">Điểm kỷ lục cao nhất</p>
            <p className="mt-1 text-xl font-black text-emerald-300">{highestScore > 0 ? highestScore : "---"}</p>
          </div>
        </div>
      </section>

      {/* ── Errors Alerts ── */}
      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold shadow-sm">
          {error}
        </div>
      ) : null}
      {scoresError?.setId === selectedSetId ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 font-semibold shadow-sm">
          Không thể tải dữ liệu điểm cao: {scoresError.message}
        </div>
      ) : null}

      {/* ── Category Filter Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `Tất cả (${GAMES_LIST.length})` },
              { id: "speed", label: "⚡ Tốc độ & Phản xạ" },
              { id: "context", label: "🧩 Ngữ cảnh & Trí nhớ" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition shadow-sm ${
                categoryFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-indigo-600/20"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Hiển thị {filteredGames.length} trò chơi
        </div>
      </div>

      {/* ── Games Grid (Modern Light Theme with High Contrast) ── */}
      <>
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Danh sách trò chơi">
          {filteredGames.map((game) => {
            const style = ACCENT_STYLES[game.accentColor];
            const Icon = game.icon;
            const validGameTypes = gameTypeByGame[game.id];
            const bestScore = scores?.setId === selectedSetId
              ? scores.scores.find((item) => validGameTypes.includes(item.gameType))
              : undefined;

            return (
              <div
                key={game.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.cardBorder} ${style.cardGlow}`}
              >
                {/* Header row of card */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex rounded-2xl p-3.5 shadow-sm ${style.iconBg} ${style.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </span>

                    <div className="flex flex-col items-end gap-1.5">
                      {game.badge && (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide uppercase ${style.badgeBg} ${style.badgeText}`}>
                          {game.badge}
                        </span>
                      )}
                      <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-extrabold ${style.tagBg} ${style.tagColor}`}>
                        {game.tag}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {game.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      {game.subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {game.description}
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    {game.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 font-bold" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer of card */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500 flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" /> Kỷ lục cá nhân:
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {bestScore ? (
                        <span className="text-amber-600 font-black">{bestScore.bestScore} điểm</span>
                      ) : (
                        <span className="text-slate-400">Chưa ghi nhận</span>
                      )}
                    </span>
                  </div>

                  <Link
                    href={gameUrl(game.id)}
                    aria-disabled={!selectedSetId}
                    onClick={(event) => {
                      if (selectedSetId) return;
                      event.preventDefault();
                      if (!loading && sets.length > 0) setIsSetPickerOpen(true);
                    }}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black shadow-md transition-all active:scale-[0.98] ${style.buttonBg} ${style.buttonHover}`}
                  >
                    <span>{selectedSetId ? "Vào chơi ngay" : loading ? "Đang tải bộ đề..." : "Chọn bộ đề để chơi"}</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
        {!loading && !selectedSet ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Chưa có bộ từ vựng được phát hành. Các trò chơi vẫn sẵn sàng; hãy thêm bộ từ vựng trong Kho từ để bắt đầu.
          </div>
        ) : null}
      </>

      {/* ── Gamified Learning Value Section ── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-black uppercase tracking-wider text-slate-900 sm:text-lg">
          Tại sao học từ vựng qua Game lại mang lại hiệu quả vượt trội?
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800 font-black text-base">
              1
            </div>
            <h4 className="mt-3 font-extrabold text-slate-900 text-sm sm:text-base">Gợi nhớ chủ động (Active Recall)</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Buộc não bộ phải tìm kiếm và tự gõ chữ cái thay vì chỉ nhìn nhận diện một cách thụ động, giúp tăng độ bền trí nhớ lên gấp nhiều lần.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-base">
              2
            </div>
            <h4 className="mt-3 font-extrabold text-slate-900 text-sm sm:text-base">Tập phản xạ dưới áp lực thời gian</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Các thử thách tốc độ giúp bạn loại bỏ thói quen dịch nhẩm sang tiếng Việt, nâng cao phản xạ đọc hiểu khi làm bài thi TOEIC thật.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-base">
              3
            </div>
            <h4 className="mt-3 font-extrabold text-slate-900 text-sm sm:text-base">Đồng bộ Spaced Repetition (SRS)</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Mọi câu trả lời đúng sai trong game đều tự động cập nhật vào thuật toán bộ nhớ ngắt quãng của hệ thống để phân bổ lịch ôn tập chuẩn xác.
            </p>
          </div>
        </div>
      </section>

      {/* ── Interactive Set Picker Modal (Clean Light Theme) ── */}
      {isSetPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSetPickerOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Chọn Bộ Từ Vựng Thi Đấu</h3>
                  <p className="text-xs text-slate-500">Chọn bộ từ bạn muốn luyện tập trong các trò chơi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchSetQuery}
                  onChange={(e) => setSearchSetQuery(e.target.value)}
                  placeholder="Tìm theo tên bộ từ, danh mục..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
            </div>

            {/* Sets List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSets.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Không tìm thấy bộ từ vựng nào khớp với từ khóa.
                </div>
              ) : (
                filteredSets.map((set) => {
                  const isSelected = set.id === selectedSetId;
                  const wordCount = set.wordCount ?? set.words?.length ?? 0;
                  return (
                    <button
                      key={set.id}
                      type="button"
                      onClick={() => {
                        setSelectedSetId(set.id);
                        setIsSetPickerOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border-2 p-3.5 text-left transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-extrabold text-sm sm:text-base text-slate-900">{set.title}</p>
                          {isSelected && (
                            <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                          <span>{set.category || "Từ vựng TOEIC"}</span>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-600">{wordCount} từ</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-300 hover:border-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 text-right bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
