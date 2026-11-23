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
    description: "Đọc nghĩa tiếng Việt rồi gõ từng chữ cái tiếng Anh để phá giọt mưa trước khi chạm đáy.",
    category: "speed",
    tag: "Gợi nhớ chủ động",
    badge: "Nổi bật 🔥",
    icon: CloudRain,
    accentColor: "cyan",
    features: ["Khóa mục tiêu thông minh", "Trợ thủ đóng băng & khiên", "Gõ từng ký tự tiếng Anh"],
  },
  {
    id: "runner",
    title: "Đường Đua Từ Vựng",
    description: "Điều khiển nhân vật chạy đua, vượt chướng ngại vật bằng cách gõ từ vựng tiếng Anh chính xác.",
    category: "speed",
    tag: "Phản xạ tốc độ",
    badge: "Phổ biến",
    icon: Zap,
    accentColor: "amber",
    features: ["Nhịp độ kịch tính", "Tránh né quái thú truy đuổi", "Hộp quà ngẫu nhiên & combo"],
  },
  {
    id: "battle",
    title: "Chiến Hạm Từ Vựng",
    description: "Tác chiến hạm đội: Trả lời trắc nghiệm hoặc nhập từ để tiêu diệt chiến hạm đang tiến xuống.",
    category: "speed",
    tag: "Đấu trí chiến thuật",
    badge: "Chiến đấu",
    icon: Swords,
    accentColor: "violet",
    features: ["Hai chiều Anh→Việt / Việt→Anh", "Kho vũ khí & lá chắn", "Tự động cân bằng tốc độ"],
  },
  {
    id: "sentence",
    title: "Điền Từ Vào Câu",
    description: "Hoàn thành câu với từ vựng đúng ngữ cảnh. Chọn chế độ Cổ điển để luyện chắc hoặc Đua tốc độ để thử phản xạ.",
    category: "context",
    tag: "Tư duy ngữ cảnh",
    badge: "Chuẩn thi",
    icon: Gamepad2,
    accentColor: "indigo",
    features: ["Câu hỏi từ dữ liệu bộ từ thực tế", "Hai chế độ: Cổ điển & Đua tốc độ", "Điểm do máy chủ xác nhận"],
  },
  {
    id: "matching",
    title: "Ghép Cặp Từ Vựng",
    description: "Thử thách trí nhớ và tốc độ: Ghép từ tiếng Anh với nghĩa tiếng Việt tương ứng trên bảng thẻ.",
    category: "context",
    tag: "Kết nối trí nhớ",
    badge: "Trí nhớ",
    icon: Brain,
    accentColor: "emerald",
    features: ["Ghi nhớ nhanh mặt chữ", "Bảng thẻ trực quan", "Chuỗi điểm liên hoàn"],
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
    return () => { active = false; };
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
    return () => { active = false; };
  }, [selectedSetId]);

  const selectedSet = useMemo(() => sets.find((item) => item.id === selectedSetId), [sets, selectedSetId]);

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

  const totalCompletedPlays = useMemo(() => {
    if (!scores?.scores) return 0;
    return scores.scores.reduce((acc, curr) => acc + (curr.completedPlays || 0), 0);
  }, [scores]);

  const highestScore = useMemo(() => {
    if (!scores?.scores || scores.scores.length === 0) return 0;
    return Math.max(...scores.scores.map((s) => s.bestScore || 0));
  }, [scores]);

  const wordCount = selectedSet
    ? (selectedSet.words?.length || selectedSet.wordCount || 0)
    : 0;

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-3 py-3 sm:px-6 sm:py-5 pb-16">

      {/* ── Thanh điều hướng ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Kho từ vựng
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
          🎮 Trung tâm trò chơi
        </span>
      </div>

      {/* ── Tiêu đề ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 px-6 py-6 shadow-lg text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-[11px] font-black uppercase tracking-widest text-cyan-200">Đấu trường học tập tương tác</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
            Trung Tâm Trò Chơi Từ Vựng
          </h1>
          <p className="mt-1.5 text-sm text-indigo-100 max-w-xl">
            Nâng cao phản xạ nhớ từ qua các mini-game. Hệ thống tự động áp dụng phương pháp gợi nhớ chủ động và lặp lại ngắt quãng.
          </p>
        </div>
      </section>

      {/* ── Bộ đề áp dụng + Thống kê ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card bộ đề — chiếm 2 cột trên lg */}
        <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-600 shadow-sm">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Bộ đề đang chọn</p>
              {loading ? (
                <p className="mt-0.5 text-sm font-bold text-slate-400 animate-pulse">Đang tải...</p>
              ) : selectedSet ? (
                <>
                  <p className="mt-0.5 truncate text-sm font-extrabold text-slate-900" title={selectedSet.title}>
                    {selectedSet.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedSet.category || "Từ vựng"} ·{" "}
                    <span className="font-bold text-emerald-600">{wordCount} từ</span>
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-sm text-slate-400">Chưa chọn bộ đề</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSetPickerOpen(true)}
            disabled={loading || sets.length === 0}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white px-3.5 py-2 text-xs font-extrabold text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-95 disabled:opacity-50"
          >
            Đổi bộ đề <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stat: số từ trong bộ đề */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Từ trong bộ đề trên</p>
          <p className="mt-1.5 text-2xl font-black text-amber-500">
            {loading ? "—" : wordCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {selectedSet ? `"${(selectedSet.title ?? "").slice(0, 20)}${(selectedSet.title ?? "").length > 20 ? "…" : ""}"` : "Chưa chọn bộ đề"}
          </p>
        </div>

        {/* Stat: lượt chơi */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lượt chơi hoàn thành</p>
          <p className="mt-1.5 text-2xl font-black text-indigo-600">{totalCompletedPlays}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {selectedSet ? `Trên bộ đề đang chọn` : "—"}
          </p>
        </div>
      </section>

      {/* Điểm kỷ lục theo từng trò chơi */}
      {scores?.setId === selectedSetId && scores.scores.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-700">Kỷ lục cao nhất theo trò chơi</p>
            {selectedSet && (
              <span className="ml-auto text-xs text-slate-400">Bộ đề: {(selectedSet.title ?? "").slice(0, 30)}{(selectedSet.title ?? "").length > 30 ? "…" : ""}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {GAMES_LIST.map((game) => {
              const validTypes = gameTypeByGame[game.id];
              const best = scores.scores.find((s) => validTypes.includes(s.gameType));
              const style = ACCENT_STYLES[game.accentColor];
              const Icon = game.icon;
              return (
                <div key={game.id} className={`flex flex-col items-center rounded-xl border p-3 text-center ${style.iconBg}`}>
                  <Icon className={`h-5 w-5 ${style.iconColor}`} />
                  <p className="mt-1.5 text-[11px] font-bold text-slate-700 leading-tight">{game.title}</p>
                  <p className={`mt-1 text-base font-black ${best && best.bestScore > 0 ? "text-amber-600" : "text-slate-300"}`}>
                    {best && best.bestScore > 0 ? best.bestScore : "—"}
                  </p>
                  <p className="text-[9px] text-slate-400">{best && best.bestScore > 0 ? "điểm" : "chưa chơi"}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Thông báo lỗi ── */}
      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold shadow-sm">
          {error}
        </div>
      )}
      {scoresError?.setId === selectedSetId && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 font-semibold shadow-sm">
          Không thể tải dữ liệu điểm cao: {scoresError.message}
        </div>
      )}

      {/* ── Lọc theo loại ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `Tất cả (${GAMES_LIST.length} trò chơi)` },
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
        <p className="text-xs font-bold text-slate-400">
          {filteredGames.length} trò chơi
        </p>
      </div>

      {/* ── Lưới trò chơi ── */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Danh sách trò chơi">
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
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${style.cardBorder} ${style.cardGlow}`}
            >
              {/* Phần đầu card */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex rounded-xl p-3 shadow-sm ${style.iconBg} ${style.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    {game.badge && (
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${style.badgeBg} ${style.badgeText}`}>
                        {game.badge}
                      </span>
                    )}
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${style.tagBg} ${style.tagColor}`}>
                      {game.tag}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {game.description}
                  </p>
                </div>

                {/* Điểm nổi bật */}
                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                  {game.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phần chân card */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-500">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    Kỷ lục cá nhân:
                  </span>
                  <span>
                    {bestScore ? (
                      <span className="font-black text-amber-600">{bestScore.bestScore} điểm</span>
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
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-black shadow-sm transition-all active:scale-[0.98] ${style.buttonBg} ${style.buttonHover}`}
                >
                  <span>
                    {selectedSetId ? "Vào chơi" : loading ? "Đang tải..." : "Chọn bộ đề để chơi"}
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {!loading && !selectedSet && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Chưa có bộ từ vựng được phát hành. Hãy thêm bộ từ trong Kho từ để bắt đầu chơi.
        </div>
      )}

      {/* ── Tại sao học qua trò chơi? ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
            Tại sao học từ vựng qua trò chơi mang lại hiệu quả vượt trội?
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              num: "1",
              color: "bg-cyan-100 text-cyan-800",
              title: "Gợi nhớ chủ động",
              desc: "Buộc não bộ phải tìm kiếm và tự gõ chữ cái thay vì chỉ nhìn nhận diện thụ động, giúp tăng độ bền trí nhớ.",
            },
            {
              num: "2",
              color: "bg-amber-100 text-amber-800",
              title: "Luyện phản xạ dưới áp lực",
              desc: "Thử thách tốc độ giúp loại bỏ thói quen dịch nhẩm, nâng cao phản xạ đọc hiểu khi làm bài thi thật.",
            },
            {
              num: "3",
              color: "bg-emerald-100 text-emerald-800",
              title: "Lặp lại ngắt quãng (SRS)",
              desc: "Mọi câu trả lời đúng sai đều cập nhật vào thuật toán bộ nhớ ngắt quãng để phân bổ lịch ôn tập tối ưu.",
            },
          ].map(({ num, color, title, desc }) => (
            <div key={num} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl font-black text-sm ${color}`}>
                {num}
              </div>
              <h4 className="mt-3 font-extrabold text-slate-900 text-sm">{title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modal chọn bộ đề ── */}
      {isSetPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSetPickerOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tiêu đề modal */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Chọn Bộ Từ Vựng</h3>
                  <p className="text-xs text-slate-500">Chọn bộ từ bạn muốn luyện tập</p>
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

            {/* Tìm kiếm */}
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

            {/* Danh sách bộ đề */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSets.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  Không tìm thấy bộ từ vựng nào khớp.
                </div>
              ) : (
                filteredSets.map((set) => {
                  const isSelected = set.id === selectedSetId;
                  const wc = set.words?.length || set.wordCount || 0;
                  return (
                    <button
                      key={set.id}
                      type="button"
                      onClick={() => { setSelectedSetId(set.id); setIsSetPickerOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-2xl border-2 p-3.5 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-extrabold text-sm text-slate-900">{set.title}</p>
                          {isSelected && (
                            <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                          <span>{set.category || "Từ vựng"}</span>
                          <span>·</span>
                          <span className="font-extrabold text-emerald-600">{wc} từ</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Nút đóng */}
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
