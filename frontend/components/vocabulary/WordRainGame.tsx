"use client";

/**
 * Word Rain – Vocabulary Survival
 * ================================
 * Gameplay cốt lõi Active Recall:
 *  - Giọt mưa hiển thị nghĩa tiếng Việt + các ô chữ cái trống
 *  - Nhập chữ đầu → khóa mục tiêu có đáp án bắt đầu bằng chữ đó
 *  - Tiếp tục gõ từng chữ → phá hủy giọt khi đúng toàn bộ
 *  - Backspace → bỏ khóa, chuyển mục tiêu
 *  - Giọt chạm đáy → mất 1 mạng (3 mạng/trận)
 *  - Chữ gợi ý được tiết lộ dần theo thời gian
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  Heart,
  Loader2,
  Maximize2,
  Minimize2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  ScanSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Timer,
  Shield,
  X,
  Zap,
} from "lucide-react";
import type { WordItem, VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import {
  completeVocabularyGameSession,
  getVocabularySet,
  getVocabularySets,
  recordVocabularyAnswer,
  startVocabularyGameSession,
  type VocabularyGameSession,
} from "@/lib/api/vocabulary";
import {
  selectWordsForSession,
  type StudyMode,
  type WordLevelTag,
  type QuestionCountSelection,
} from "./runner/wordSelector";
import { RUNNER_SPEED_PRESETS, type SpeedPresetKey } from "./runner/config";

// ─── Types ───────────────────────────────────────────────────────────────────

type GamePhase = "lobby" | "playing" | "paused" | "result";

interface RainDrop {
  id: string;
  word: WordItem;
  /** Tiếng Việt hiển thị trên giọt */
  meaning: string;
  /** Từ tiếng Anh cần nhập (lowercase để so sánh) */
  answer: string;
  /** Từ tiếng Anh gốc (original case để hiển thị) */
  answerDisplay: string;
  x: number;         // 0–100 (%)
  y: number;         // 0–100 (%)
  /** Số chữ cái đã nhập đúng */
  typed: number;
  /** Số chữ cái gợi ý đã tiết lộ */
  revealed: number;
  /** Thời điểm spawn (performance.now()) */
  spawnedAt: number;
  color: string;
  questionIndex: number;
}

interface PowerUp {
  id: "hint" | "freeze" | "shield";
  count: number;
}

interface FeedbackMessage {
  id: string;
  text: string;
  x: number;
  y: number;
  correct: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_LIVES = 3;
const MAX_ACTIVE_DROPS = 5;
const GAME_BOTTOM = 90;   // % of arena height

const DROP_COLORS = [
  { border: "border-cyan-400", bg: "bg-cyan-950/90", text: "text-cyan-50", glow: "shadow-cyan-500/40" },
  { border: "border-violet-400", bg: "bg-violet-950/90", text: "text-violet-50", glow: "shadow-violet-500/40" },
  { border: "border-amber-400", bg: "bg-amber-950/90", text: "text-amber-50", glow: "shadow-amber-500/40" },
  { border: "border-emerald-400", bg: "bg-emerald-950/90", text: "text-emerald-50", glow: "shadow-emerald-500/40" },
  { border: "border-rose-400", bg: "bg-rose-950/90", text: "text-rose-50", glow: "shadow-rose-500/40" },
];

const WORD_RAIN_SPEED_CONFIG: Record<
  SpeedPresetKey,
  { baseSpeed: number; milestoneSpeed: number; baseSpawn: number; minSpawn: number }
> = {
  slow: {
    baseSpeed: 0.0028,
    milestoneSpeed: 0.0006,
    baseSpawn: 3400,
    minSpawn: 1600,
  },
  medium: {
    baseSpeed: 0.0045,
    milestoneSpeed: 0.0010,
    baseSpawn: 2800,
    minSpawn: 1200,
  },
  fast: {
    baseSpeed: 0.0070,
    milestoneSpeed: 0.0014,
    baseSpawn: 2200,
    minSpawn: 900,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMeaning(word: WordItem): string {
  return (
    word.meaning?.trim() ||
    word.senses?.map((s) => s.meaning?.trim()).filter(Boolean).join("; ") ||
    word.meanings?.map((m) => m.meaning?.trim()).filter(Boolean).join("; ") ||
    word.translation?.trim() ||
    ""
  );
}

function normalizeWord(word: string): string {
  return word.toLowerCase().trim().replace(/[-\s]+/g, "");
}

function playTTS(word: WordItem): void {
  const src = word.audioUrl || word.audio;
  if (src && (/^https?:\/\//i.test(src) || src.startsWith("/"))) {
    const audio = new Audio(src);
    void audio.play().catch(() => undefined);
    return;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.word);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WordRainGame({ setId }: { setId: string }) {
  // ── Loading & data ──
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [allWords, setAllWords] = useState<WordItem[]>([]);

  // ── Game state ──
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);
  const [missedWords, setMissedWords] = useState<WordItem[]>([]);
  const [finalSession, setFinalSession] = useState<VocabularyGameSession | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { id: "hint", count: 2 },
    { id: "freeze", count: 1 },
    { id: "shield", count: 1 },
  ]);
  const [frozenUntil, setFrozenUntil] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMaximizedTab, setIsMaximizedTab] = useState(false);

  // ── Lobby settings ──
  const [studyMode, setStudyMode] = useState<StudyMode>("single_deck");
  const [selectedLevels, setSelectedLevels] = useState<WordLevelTag[]>([
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
    "unclassified",
  ]);
  const [targetQuestionCount, setTargetQuestionCount] = useState<QuestionCountSelection>(20);
  const [speedPresetKey, setSpeedPresetKey] = useState<SpeedPresetKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vocab_wordrain_speed") as SpeedPresetKey;
      if (saved && ["slow", "medium", "fast"].includes(saved)) return saved;
    }
    return "medium";
  });
  const [reviewOnly, setReviewOnly] = useState(false);
  const [selectorWarning, setSelectorWarning] = useState<string | null>(null);
  const [sessionTotalWords, setSessionTotalWords] = useState(0);

  // ── Set selection ──
  const [activeSetId, setActiveSetId] = useState<string>(setId);
  const [activeTestSet, setActiveTestSet] = useState<VocabularyTestSet | null>(null);
  const [availableSets, setAvailableSets] = useState<VocabularyTestSet[]>([]);
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const allSetsWords = availableSets
    .map((set) => ({ setId: set.id, words: set.words ?? [] }))
    .filter((set) => set.words.length > 0);
  const allDeckWords = allSetsWords.flatMap((set) => set.words);
  const availableWordPool = studyMode === "single_deck" ? allWords : allDeckWords;

  // ── Refs ──
  const dropsRef = useRef<RainDrop[]>([]);
  const livesRef = useRef(INITIAL_LIVES);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const correctRef = useRef(0);
  const missedRef = useRef(0);
  const wordQueueRef = useRef<WordItem[]>([]);
  const speedPresetRef = useRef<SpeedPresetKey>(speedPresetKey);
  const targetCountRef = useRef<QuestionCountSelection>(targetQuestionCount);

  useEffect(() => {
    speedPresetRef.current = speedPresetKey;
  }, [speedPresetKey]);

  useEffect(() => {
    targetCountRef.current = targetQuestionCount;
  }, [targetQuestionCount]);
  const nextSpawnIndexRef = useRef(0);
  const questionIndexRef = useRef(0);
  const sessionRef = useRef<VocabularyGameSession | null>(null);
  const startTimeRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lockedIdRef = useRef<string | null>(null);
  const finalizingRef = useRef(false);
  const shieldRef = useRef(false);
  const frozenUntilRef = useRef(0);
  const resolveDropRef = useRef<(drop: RainDrop, answer: string) => Promise<void>>(async () => {});

  // ── Sync refs ──
  const updateDrops = useCallback((next: RainDrop[] | ((c: RainDrop[]) => RainDrop[])) => {
    const updated = typeof next === "function" ? next(dropsRef.current) : next;
    dropsRef.current = updated;
    setDrops(updated);
  }, []);

  // ─── Load words & sets ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    void getVocabularySet(activeSetId)
      .then((set) => {
        if (!active) return;
        setActiveTestSet(set);
        const usable = (set.words ?? []).filter((w) => getMeaning(w).trim() && w.word?.trim());
        setAllWords(usable);
      })
      .catch((e: unknown) => {
        if (active) setLoadError(e instanceof Error ? e.message : "Không thể tải bộ từ.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeSetId]);

  useEffect(() => {
    let active = true;
    void getVocabularySets()
      .then((sets) => {
        if (active && Array.isArray(sets)) {
          setAvailableSets(sets);
        }
      })
      .catch((err) => {
        console.warn("Could not load all vocabulary sets", err);
      });
    return () => { active = false; };
  }, []);

  // ─── Change Deck Handler ──────────────────────────────────────────────────
  const handleSelectDeck = async (targetSet: VocabularyTestSet) => {
    if (targetSet.id === activeSetId) {
      setIsSetPickerOpen(false);
      return;
    }
    setIsLoadingSet(true);
    try {
      let fullSet = targetSet;
      if (!fullSet.words || fullSet.words.length === 0) {
        fullSet = await getVocabularySet(targetSet.id);
      }
      const usable = (fullSet.words ?? []).filter((w: WordItem) => getMeaning(w).trim() && w.word?.trim());
      setActiveSetId(fullSet.id);
      setActiveTestSet(fullSet);
      setAllWords(usable);
      setIsSetPickerOpen(false);
      setMissedWords([]);
      setReviewOnly(false);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("setId", fullSet.id);
        window.history.replaceState({}, "", url.toString());
      }

      if (phase === "result") {
        setPhase("lobby");
      }
    } catch (err) {
      console.error("Failed to load deck:", err);
    } finally {
      setIsLoadingSet(false);
    }
  };

  // ─── Session finalize ─────────────────────────────────────────────────────
  const finalizeSession = useCallback(async () => {
    if (!sessionRef.current || finalizingRef.current) return;
    finalizingRef.current = true;
    setPhase("result");
    setFinishError(null);
    try {
      const completed = await completeVocabularyGameSession(sessionRef.current.id);
      setFinalSession(completed);
    } catch (e) {
      finalizingRef.current = false;
      setFinishError(e instanceof Error ? e.message : "Không thể lưu kết quả.");
    }
  }, []);

  // ─── Save answer ──────────────────────────────────────────────────────────
  const saveDrop = useCallback(async (drop: RainDrop, answer: string) => {
    if (!sessionRef.current) return;
    try {
      await recordVocabularyAnswer({
        requestId: crypto.randomUUID(),
        wordId: drop.word.id,
        activityType: "GAME",
        questionType: "VIETNAMESE_TO_ENGLISH",
        answer,
        responseTimeMs: Math.min(performance.now() - drop.spawnedAt, 60_000),
        gameSessionId: sessionRef.current.id,
        gameQuestionIndex: drop.questionIndex,
      });
    } catch {
      // Non-blocking: continue gameplay
    }
  }, []);

  // ─── Resolve drop (correct answer) ───────────────────────────────────────
  const resolveDrop = useCallback(async (drop: RainDrop, answer: string) => {
    // Add floating feedback
    const fb: FeedbackMessage = {
      id: crypto.randomUUID(),
      text: answer ? `+${10 + Math.min(comboRef.current, 4) * 5} ✓` : `✗ ${drop.answerDisplay}`,
      x: drop.x,
      y: drop.y,
      correct: answer.length > 0,
    };
    setFeedbacks((cur) => [...cur, fb]);
    window.setTimeout(() => setFeedbacks((cur) => cur.filter((f) => f.id !== fb.id)), 900);

    // Remove drop
    updateDrops((cur) => cur.filter((d) => d.id !== drop.id));
    if (lockedIdRef.current === drop.id) {
      lockedIdRef.current = null;
      setLockedId(null);
    }

    if (answer) {
      // Correct
      const nextCombo = comboRef.current + 1;
      const pts = 10 + Math.min(nextCombo - 1, 4) * 5;
      scoreRef.current += pts;
      comboRef.current = nextCombo;
      maxComboRef.current = Math.max(maxComboRef.current, nextCombo);
      correctRef.current += 1;
      setScore(scoreRef.current);
      setCombo(nextCombo);
      setMaxCombo(maxComboRef.current);
      setCorrectCount(correctRef.current);
    } else {
      // Missed (fell to bottom)
      if (shieldRef.current) {
        shieldRef.current = false;
        setShieldActive(false);
      } else {
        const nextLives = Math.max(0, livesRef.current - 1);
        livesRef.current = nextLives;
        setLives(nextLives);
        setWrongFlash(true);
        window.setTimeout(() => setWrongFlash(false), 400);
      }
      comboRef.current = 0;
      missedRef.current += 1;
      setCombo(0);
      setMissedCount(missedRef.current);
      setMissedWords((cur) => {
        if (cur.some((w) => w.id === drop.word.id)) return cur;
        return [...cur, drop.word];
      });
      playTTS(drop.word);

      if (livesRef.current <= 0) {
        await finalizeSession();
        return;
      }
    }

    // Check game end or endless loop
    const remaining = wordQueueRef.current.length - nextSpawnIndexRef.current;
    const activeDrops = dropsRef.current.filter((d) => d.id !== drop.id).length;
    if (remaining === 0 && activeDrops === 0) {
      if (targetCountRef.current === 0 && livesRef.current > 0) {
        wordQueueRef.current = [...wordQueueRef.current].sort(() => Math.random() - 0.5);
        nextSpawnIndexRef.current = 0;
      } else {
        await finalizeSession();
        return;
      }
    }

    void saveDrop(drop, answer);
  }, [finalizeSession, saveDrop, updateDrops]);

  useEffect(() => { resolveDropRef.current = resolveDrop; }, [resolveDrop]);

  // ─── Start game ───────────────────────────────────────────────────────────
  const startGame = async () => {
    if ((reviewOnly ? missedWords : availableWordPool).length === 0) return;
    if (!reviewOnly && studyMode !== "single_deck" && availableSets.length === 0) {
      setLoadError("Không tải được danh sách bộ đề. Vui lòng thử lại trước khi chơi trộn.");
      return;
    }
    setLoadError(null);
    setFinishError(null);
    setFinalSession(null);
    finalizingRef.current = false;

    if (typeof window !== "undefined") {
      localStorage.setItem("vocab_wordrain_speed", speedPresetKey);
    }

    const pool = reviewOnly && missedWords.length > 0
      ? missedWords
      : availableWordPool;
    const selection = selectWordsForSession(pool, allSetsWords, {
      mode: reviewOnly ? "single_deck" : studyMode,
      targetCount: targetQuestionCount,
      selectedLevels,
      wrongWordsHistory: missedWords,
      seed: crypto.getRandomValues(new Uint32Array(1))[0],
    });

    setSelectorWarning(selection.warningMessage ?? null);

    let wordsToQueue = selection.selectedWords;
    if (targetQuestionCount === 0) {
      wordsToQueue = [...pool].sort(() => Math.random() - 0.5);
    }
    if (wordsToQueue.length === 0) {
      wordsToQueue = pool;
    }

    wordQueueRef.current = wordsToQueue;
    setSessionTotalWords(wordsToQueue.length);
    nextSpawnIndexRef.current = 0;
    questionIndexRef.current = 0;

    try {
      const session = await startVocabularyGameSession({
        setId: activeSetId,
        gameType: "TYPING",
        deckIds: [...new Set([
          activeSetId,
          ...(reviewOnly || studyMode === "single_deck" ? [] : availableSets.map((set) => set.id)),
          ...wordsToQueue.map((word) => word.setId).filter((id): id is string => typeof id === "string" && id.length > 0),
        ])],
      });
      sessionRef.current = session;
    } catch (reason) {
      setLoadError(reason instanceof Error ? reason.message : "Không thể tạo phiên chơi.");
      return;
      sessionRef.current = null;
    }

    // Reset state
    livesRef.current = INITIAL_LIVES;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    correctRef.current = 0;
    missedRef.current = 0;
    lockedIdRef.current = null;
    shieldRef.current = false;
    frozenUntilRef.current = 0;
    dropsRef.current = [];

    setDrops([]);
    setLives(INITIAL_LIVES);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setMissedCount(0);
    setMissedWords([]);
    setElapsedSeconds(0);
    setLockedId(null);
    setFeedbacks([]);
    setShieldActive(false);
    setFrozenUntil(0);
    setWrongFlash(false);
    setPowerUps([{ id: "hint", count: 2 }, { id: "freeze", count: 1 }, { id: "shield", count: 1 }]);

    startTimeRef.current = Date.now();
    lastSpawnRef.current = performance.now() - 2500;
    setPhase("playing");
  };

  // ─── Game loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;

    const TICK = 50; // ms
    const interval = window.setInterval(() => {
      const now = performance.now();
      const isFrozen = now < frozenUntilRef.current;
      const milestone = Math.floor(correctRef.current / 5);
      const sp = WORD_RAIN_SPEED_CONFIG[speedPresetRef.current];
      const speed = isFrozen ? 0 : (sp.baseSpeed + milestone * sp.milestoneSpeed);
      const spawnInterval = Math.max(sp.minSpawn, sp.baseSpawn - milestone * 180);
      const revealInterval = 4000; // ms between each letter reveal

      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));

      // Move drops
      let updated = dropsRef.current.map((d) => {
        const elapsed = now - d.spawnedAt;
        const newRevealed = Math.min(
          d.answer.length,
          Math.floor(elapsed / revealInterval)
        );
        return { ...d, y: d.y + speed * 50, revealed: newRevealed };
      });

      // Check escaped drops
      const escaped = updated.find((d) => d.y >= GAME_BOTTOM);
      if (escaped) {
        updated = updated.filter((d) => d.id !== escaped.id);
        dropsRef.current = updated;
        setDrops([...updated]);
        void resolveDropRef.current(escaped, "");
        return;
      }

      // If endless and exhausted queue, loop queue
      if (
        targetCountRef.current === 0 &&
        nextSpawnIndexRef.current >= wordQueueRef.current.length &&
        wordQueueRef.current.length > 0
      ) {
        wordQueueRef.current = [...wordQueueRef.current].sort(() => Math.random() - 0.5);
        nextSpawnIndexRef.current = 0;
      }

      // Spawn new drops
      const canSpawn =
        updated.length < MAX_ACTIVE_DROPS &&
        nextSpawnIndexRef.current < wordQueueRef.current.length &&
        now - lastSpawnRef.current >= spawnInterval;

      if (canSpawn) {
        const word = wordQueueRef.current[nextSpawnIndexRef.current];
        const colorIdx = nextSpawnIndexRef.current % DROP_COLORS.length;
        const c = DROP_COLORS[colorIdx];
        const ans = normalizeWord(word.word);
        if (ans.length > 0) {
          const qIdx = questionIndexRef.current++;
          nextSpawnIndexRef.current++;
          const newDrop: RainDrop = {
            id: `drop-${qIdx}-${word.id}`,
            word,
            meaning: getMeaning(word),
            answer: ans,
            answerDisplay: word.word.trim(),
            x: 8 + Math.random() * 76,
            y: 4,
            typed: 0,
            revealed: 0,
            spawnedAt: now,
            color: `${c.border} ${c.bg} ${c.text} shadow-lg ${c.glow}`,
            questionIndex: qIdx,
          };
          updated = [...updated, newDrop];
          lastSpawnRef.current = now;
        } else {
          nextSpawnIndexRef.current++;
        }
      }

      dropsRef.current = updated;
      setDrops([...updated]);
    }, TICK);

    return () => window.clearInterval(interval);
  }, [phase]);

  // ─── Keyboard handler ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Pause / resume
      if (e.key === "Escape" && (phase === "playing" || phase === "paused")) {
        e.preventDefault();
        setPhase((p) => p === "playing" ? "paused" : "playing");
        return;
      }
      if (phase !== "playing") return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Power-up hotkeys
      if (e.key === "F1") { e.preventDefault(); activatePowerUp("hint"); return; }
      if (e.key === "F2") { e.preventDefault(); activatePowerUp("freeze"); return; }
      if (e.key === "F3") { e.preventDefault(); activatePowerUp("shield"); return; }

      // Backspace → unlock
      if (e.key === "Backspace") {
        e.preventDefault();
        if (lockedIdRef.current) {
          // Reset typed progress on locked drop
          updateDrops((cur) =>
            cur.map((d) => d.id === lockedIdRef.current ? { ...d, typed: 0 } : d)
          );
          lockedIdRef.current = null;
          setLockedId(null);
        }
        return;
      }

      // Single printable character input
      if (e.key.length !== 1) return;
      const ch = e.key.toLowerCase();
      e.preventDefault();

      const activeDrop = dropsRef.current.find((d) => d.id === lockedIdRef.current);

      if (activeDrop) {
        // Continue typing locked drop
        const expected = activeDrop.answer[activeDrop.typed];
        if (ch === expected) {
          const newTyped = activeDrop.typed + 1;
          if (newTyped >= activeDrop.answer.length) {
            // Word complete!
            void resolveDropRef.current(activeDrop, activeDrop.answerDisplay);
          } else {
            updateDrops((cur) =>
              cur.map((d) => d.id === activeDrop.id ? { ...d, typed: newTyped } : d)
            );
          }
        } else {
          // Wrong char – flash
          setWrongFlash(true);
          window.setTimeout(() => setWrongFlash(false), 250);
        }
        return;
      }

      // Try to lock a new target
      // Priority: drop whose answer starts with ch, lowest time-to-bottom (highest y)
      const candidates = dropsRef.current.filter((d) => d.answer[0] === ch);
      if (candidates.length === 0) return;
      const target = candidates.reduce((best, cur) => cur.y > best.y ? cur : best);

      if (target.answer.length === 1) {
        // Single-char word → immediately resolve
        void resolveDropRef.current(target, target.answerDisplay);
      } else {
        lockedIdRef.current = target.id;
        setLockedId(target.id);
        updateDrops((cur) =>
          cur.map((d) => d.id === target.id ? { ...d, typed: 1 } : d)
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, updateDrops]);

  // ─── Power-ups ────────────────────────────────────────────────────────────
  const activatePowerUp = useCallback((id: "hint" | "freeze" | "shield") => {
    setPowerUps((cur) => {
      const slot = cur.find((p) => p.id === id);
      if (!slot || slot.count <= 0) return cur;
      // Apply effect
      if (id === "hint") {
        // Reveal one more letter on locked or lowest drop
        const target = dropsRef.current.find((d) => d.id === lockedIdRef.current)
          ?? dropsRef.current.reduce<RainDrop | null>((best, d) => !best || d.y > best.y ? d : best, null);
        if (target) {
          updateDrops((c) =>
            c.map((d) => d.id === target.id
              ? { ...d, revealed: Math.min(d.answer.length, d.revealed + 1) }
              : d
            )
          );
        }
      } else if (id === "freeze") {
        const exp = performance.now() + 5000;
        frozenUntilRef.current = exp;
        setFrozenUntil(exp);
        window.setTimeout(() => setFrozenUntil(0), 5000);
      } else if (id === "shield") {
        shieldRef.current = true;
        setShieldActive(true);
      }
      return cur.map((p) => p.id === id ? { ...p, count: p.count - 1 } : p);
    });
  }, [updateDrops]);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const accuracy = Math.round((correctCount / Math.max(1, correctCount + missedCount)) * 100);
  const totalWords = allWords.length;
  const processed = correctCount + missedCount;
  const isFreezeActive = frozenUntil > 0 && performance.now() < frozenUntil;

  const filteredSets = availableSets.filter((s) => {
    if (!searchSetQuery.trim()) return true;
    const q = searchSetQuery.toLowerCase().trim();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-5xl space-y-3 px-2 pb-10 sm:px-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
        <Link
          href="/vocabulary/games"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-95 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Trung tâm trò chơi</span>
          <span className="sm:hidden">Quay lại</span>
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-right min-w-0">
            <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">Mưa Từ Vựng (Word Rain) ☔</h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Đọc nghĩa tiếng Việt → Gõ từng chữ tiếng Anh để phá giọt</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDarkMode((d) => !d)}
            aria-label={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Loading */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
          Đang tải bộ từ vựng...
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 shadow-sm">
          {loadError}
        </div>
      ) : phase === "lobby" ? (
        // ── LOBBY ──────────────────────────────────────────────────────────
        <section className={`overflow-hidden rounded-3xl p-6 text-center shadow-2xl sm:p-10 ${isDarkMode ? "border border-cyan-400/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 text-white" : "border-2 border-cyan-200 bg-gradient-to-br from-white via-cyan-50/60 to-indigo-50 text-slate-900"}`}>
          <div className="text-5xl">☔</div>
          <p className={`mt-4 text-xs font-black uppercase tracking-[0.3em] ${isDarkMode ? "text-cyan-300" : "text-cyan-700"}`}>Mưa Từ Vựng · Word Rain</p>
          <h2 className={`mt-2 text-2xl font-black sm:text-4xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>Sinh Tồn Phản Xạ Active Recall</h2>
          <p className={`mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-6 font-medium ${isDarkMode ? "text-cyan-100/90" : "text-slate-600"}`}>
            Đọc <strong>nghĩa tiếng Việt</strong> trên giọt mưa, gõ chữ cái đầu của từ tiếng Anh tương ứng để khóa mục tiêu, rồi gõ tiếp các chữ còn lại để phá hủy giọt mưa trước khi chạm đáy.
          </p>

          {/* ── LOBBY OPTIONS ── */}
          <div className="mx-auto mt-8 max-w-xl space-y-4 text-left">
            {/* 0. Bộ đề đang chọn */}
            <div className={`flex items-center justify-between rounded-2xl border p-3 sm:p-4 shadow-lg ${isDarkMode ? "border-cyan-400/30 bg-slate-900/90 shadow-cyan-950/40" : "border-cyan-200 bg-slate-50 shadow-slate-200/60"}`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-cyan-300 bg-cyan-100 text-cyan-700"}`}>
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-cyan-300" : "text-cyan-700"}`}>Bộ đề đang chọn</p>
                  <p className={`truncate text-sm font-extrabold sm:text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {activeTestSet?.title || "Đang tải bộ đề..."}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeTestSet?.category || "Từ vựng TOEIC"} · {availableWordPool.length} từ khả dụng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(true)}
                className={`ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 sm:px-4 sm:text-sm ${
                  isDarkMode
                    ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30"
                    : "border-cyan-500 bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm"
                }`}
              >
                <span>Đổi bộ đề</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* 1. Chế độ học */}
            <div>
              <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-cyan-200" : "text-slate-800"}`}>
                <BookOpen className={`h-4 w-4 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} /> Chế độ học từ vựng
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStudyMode("single_deck")}
                  className={`rounded-xl border p-3 text-left transition ${
                    studyMode === "single_deck"
                      ? isDarkMode
                        ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-sm"
                        : "border-cyan-600 bg-cyan-50 text-cyan-950 shadow-sm ring-1 ring-cyan-500"
                      : isDarkMode
                      ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold sm:text-sm">Bộ đề hiện tại</p>
                  <p className={`mt-0.5 text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Toàn bộ từ trong bộ từ vựng đã chọn</p>
                </button>
                <button
                  type="button"
                  onClick={() => setStudyMode("all_decks")}
                  className={`rounded-xl border p-3 text-left transition ${
                    studyMode === "all_decks"
                      ? isDarkMode
                        ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-sm"
                        : "border-cyan-600 bg-cyan-50 text-cyan-950 shadow-sm ring-1 ring-cyan-500"
                      : isDarkMode
                      ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold sm:text-sm">Trộn tất cả bộ đề</p>
                  <p className={`mt-0.5 text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Lấy từ mọi bộ đã phát hành</p>
                </button>
                <button
                  type="button"
                  onClick={() => setStudyMode("by_level")}
                  className={`rounded-xl border p-3 text-left transition ${
                    studyMode === "by_level"
                      ? isDarkMode
                        ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-sm"
                        : "border-cyan-600 bg-cyan-50 text-cyan-950 shadow-sm ring-1 ring-cyan-500"
                      : isDarkMode
                      ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold sm:text-sm">Theo cấp độ CEFR</p>
                  <p className={`mt-0.5 text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Chọn một hoặc nhiều cấp CEFR</p>
                </button>
              </div>

              {/* CEFR Level Multi-selector */}
              {studyMode === "by_level" && (
                <div className={`mt-2.5 rounded-2xl border p-3 space-y-2 animate-in fade-in duration-200 ${
                  isDarkMode ? "border-cyan-400/20 bg-slate-900/90" : "border-slate-200 bg-white shadow-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? "text-cyan-300" : "text-slate-800"}`}>Chọn thang cấp độ:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedLevels.length === 7) {
                          setSelectedLevels(["B1"]);
                        } else {
                          setSelectedLevels(["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"]);
                        }
                      }}
                      className={`text-xs font-bold ${isDarkMode ? "text-cyan-400 hover:text-cyan-200" : "text-cyan-700 hover:text-cyan-900"}`}
                    >
                      {selectedLevels.length === 7 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {[
                      { level: "A1" as const, desc: "Cơ bản" },
                      { level: "A2" as const, desc: "Sơ cấp" },
                      { level: "B1" as const, desc: "Trung cấp" },
                      { level: "B2" as const, desc: "Khá" },
                      { level: "C1" as const, desc: "Nâng cao" },
                      { level: "C2" as const, desc: "Thành thạo" },
                      { level: "unclassified" as const, desc: "Khác" },
                    ].map(({ level, desc }) => {
                      const isSelected = selectedLevels.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (selectedLevels.length > 1) {
                                setSelectedLevels(selectedLevels.filter((l) => l !== level));
                              }
                            } else {
                              setSelectedLevels([...selectedLevels, level]);
                            }
                          }}
                          className={`flex flex-col items-center rounded-xl border p-2 text-center transition ${
                            isSelected
                              ? isDarkMode
                                ? "border-cyan-400 bg-cyan-500/25 text-cyan-100 shadow-sm"
                                : "border-cyan-600 bg-cyan-600 text-white shadow-sm"
                              : isDarkMode
                              ? "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs font-black">{level.toUpperCase()}</span>
                          <span className={`text-[10px] ${
                            isSelected
                              ? isDarkMode ? "text-cyan-200" : "text-cyan-100"
                              : isDarkMode ? "text-slate-500" : "text-slate-500"
                          }`}>{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tốc độ rơi */}
            <div>
              <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-amber-300" : "text-amber-900"}`}>
                <Zap className={`h-4 w-4 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} /> Tốc độ rơi
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(RUNNER_SPEED_PRESETS) as SpeedPresetKey[]).map((key) => {
                  const preset = RUNNER_SPEED_PRESETS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSpeedPresetKey(key)}
                      className={`rounded-xl border p-2.5 text-left transition ${
                        speedPresetKey === key
                          ? isDarkMode
                            ? "border-amber-400 bg-amber-400/15 text-amber-200 shadow-sm"
                            : "border-amber-600 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-500"
                          : isDarkMode
                          ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <p className={`text-xs font-bold sm:text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>{preset.label}</p>
                      <p className={`mt-0.5 line-clamp-1 text-[10px] sm:text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Số câu / Số giọt mưa */}
            <div>
              <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-emerald-300" : "text-emerald-900"}`}>
                <SlidersHorizontal className={`h-4 w-4 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} /> Số giọt mưa
              </p>
              <div className="grid grid-cols-4 gap-2">
                {([10, 20, 30, 0] as QuestionCountSelection[]).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetQuestionCount(num)}
                    className={`rounded-xl border py-2.5 text-center text-xs font-bold transition sm:text-sm ${
                      targetQuestionCount === num
                        ? isDarkMode
                          ? "border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-sm"
                          : "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                        : isDarkMode
                        ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {num === 0 ? "Vô tận (∞)" : `${num} từ`}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Ôn tập từ sai (nếu có từ bỏ lỡ) */}
            {missedWords.length > 0 && (
              <div className={`flex items-center justify-between rounded-xl border p-3 ${
                isDarkMode ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-300 bg-amber-50 text-amber-950 shadow-sm"
              }`}>
                <div className={`text-xs ${isDarkMode ? "text-amber-200" : "text-amber-900"}`}>
                  <span className="font-bold">Ôn tập từ bỏ lỡ:</span> Bạn có {missedWords.length} từ đã rơi xuống đáy ở trận trước.
                </div>
                <button
                  type="button"
                  onClick={() => setReviewOnly(!reviewOnly)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    reviewOnly
                      ? "border-amber-400 bg-amber-400 text-slate-950"
                      : isDarkMode
                      ? "border-amber-400/40 text-amber-200 hover:bg-amber-400/10"
                      : "border-amber-400 bg-white text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  {reviewOnly ? "Đang bật" : "Bật ôn tập"}
                </button>
              </div>
            )}

            {selectorWarning && (
              <div className={`rounded-xl border p-2.5 text-xs ${isDarkMode ? "border-amber-500/30 bg-amber-950/40 text-amber-200" : "border-amber-300 bg-amber-50 text-amber-900"}`}>
                ⚠️ {selectorWarning}
              </div>
            )}
          </div>

          {/* Quick stats row */}
          <div className="mx-auto mt-6 max-w-xl grid grid-cols-3 gap-3 text-left">
            <div className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
              <p className={`text-xs ${isDarkMode ? "text-cyan-200" : "text-slate-600 font-bold"}`}>Từ vựng khả dụng</p>
              <p className={`mt-1 text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{availableWordPool.length} từ</p>
            </div>
            <div className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
              <p className={`text-xs ${isDarkMode ? "text-cyan-200" : "text-slate-600 font-bold"}`}>Mạng sinh tồn</p>
              <p className={`mt-1 flex gap-1 text-sm font-bold ${isDarkMode ? "text-rose-300" : "text-rose-600"}`}>
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> × {INITIAL_LIVES}
              </p>
            </div>
            <div className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
              <p className={`text-xs ${isDarkMode ? "text-cyan-200" : "text-slate-600 font-bold"}`}>Vật phẩm hỗ trợ</p>
              <p className={`mt-1 text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>3 loại (F1–F3)</p>
            </div>
          </div>

          {/* Key shortcut guide */}
          <div className={`mx-auto mt-4 max-w-xl rounded-xl border p-3 text-left text-xs space-y-1 ${
            isDarkMode ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-700 shadow-sm"
          }`}>
            <p>⌨️ <strong className={isDarkMode ? "text-white" : "text-slate-900"}>Chữ đầu tiên</strong>: Khóa giọt có từ tiếng Anh bắt đầu bằng chữ đó</p>
            <p>⌨️ <strong className={isDarkMode ? "text-white" : "text-slate-900"}>Gõ tiếp</strong>: Điền từng chữ — đúng toàn bộ sẽ phá giọt</p>
            <p>⌨️ <strong className={isDarkMode ? "text-white" : "text-slate-900"}>Backspace</strong>: Bỏ khóa mục tiêu để chọn giọt khác</p>
            <p>⌨️ <strong className={isDarkMode ? "text-white" : "text-slate-900"}>F1</strong> Gợi ý thêm chữ · <strong className={isDarkMode ? "text-white" : "text-slate-900"}>F2</strong> Đóng băng 5s · <strong className={isDarkMode ? "text-white" : "text-slate-900"}>F3</strong> Lá chắn bảo vệ</p>
          </div>

          {availableWordPool.length === 0 ? (
            <p className={`mt-5 text-sm ${isDarkMode ? "text-amber-300" : "text-amber-800 font-semibold"}`}>Bộ từ này chưa có từ hợp lệ (cần có nghĩa tiếng Việt).</p>
          ) : (
            <button
              type="button"
              onClick={() => void startGame()}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 px-8 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-cyan-950/50 transition hover:opacity-95 active:scale-95"
            >
              ☔ Bắt đầu chơi
            </button>
          )}
        </section>
      ) : phase === "result" ? (
        // ── RESULT ─────────────────────────────────────────────────────────
        <section className={`rounded-3xl p-6 text-center sm:p-10 ${isDarkMode ? "border border-slate-800 bg-slate-950" : "border-2 border-slate-200 bg-white shadow-lg"}`}>
          <div className="text-5xl">{lives > 0 ? "🏆" : "💀"}</div>
          <h2 className={`mt-4 text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {lives > 0 ? "Hoàn thành! Xuất sắc!" : "Hết mạng…"}
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {lives > 0 ? "Bạn đã phá hủy toàn bộ giọt mưa!" : "Một số giọt đã lọt qua. Luyện thêm nào!"}
          </p>

          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 sm:grid-cols-6">
            <StatCard label="Điểm" value={finalSession?.score ?? score} isDark={isDarkMode} />
            <StatCard label="Chính xác" value={`${accuracy}%`} isDark={isDarkMode} />
            <StatCard label="Combo×" value={finalSession?.maxCombo ?? maxCombo} isDark={isDarkMode} />
            <StatCard label="Đúng" value={correctCount} isDark={isDarkMode} />
            <StatCard label="Bỏ lỡ" value={missedCount} isDark={isDarkMode} />
            <StatCard label="Thời gian" value={`${elapsedSeconds}s`} isDark={isDarkMode} />
          </div>

          {finishError ? (
            <div role="alert" className={`mx-auto mt-5 max-w-xl rounded-xl border p-3 text-sm ${isDarkMode ? "border-red-800 bg-red-950/50 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>
              {finishError}
            </div>
          ) : null}

          {missedWords.length > 0 ? (
            <div className={`mx-auto mt-5 max-w-2xl rounded-2xl border p-4 text-left ${isDarkMode ? "border-amber-800/40 bg-amber-950/30" : "border-amber-200 bg-amber-50/60"}`}>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-amber-300" : "text-amber-800"}`}>
                Từ cần luyện thêm ({missedWords.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {missedWords.map((w) => (
                  <span key={w.id} className={`rounded-lg px-2 py-1 text-xs ${isDarkMode ? "bg-amber-900/40 text-amber-200" : "bg-amber-100 text-amber-900"}`}>
                    <strong>{w.word}</strong>: {getMeaning(w).slice(0, 30)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => { sessionRef.current = null; setFinalSession(null); setPhase("lobby"); }}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-cyan-600 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" /> Chơi lại
            </button>
            <button
              type="button"
              onClick={() => setIsSetPickerOpen(true)}
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition active:scale-95 ${isDarkMode ? "border-cyan-400/40 bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/60" : "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"}`}
            >
              <FolderKanban className="h-4 w-4" /> Đổi bộ đề
            </button>
            <Link href="/vocabulary/games" className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition active:scale-95 ${isDarkMode ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}>
              <ArrowLeft className="h-4 w-4" /> Về Trung tâm trò chơi
            </Link>
          </div>
        </section>
      ) : (
        // ── PLAYING / PAUSED ───────────────────────────────────────────────
        <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-950 shadow-2xl">
          {/* Top HUD */}
          <div className={`grid grid-cols-3 items-center gap-2 border-b border-white/10 bg-slate-900/90 px-3 py-2 sm:px-5 transition ${wrongFlash ? "bg-rose-950/60" : ""}`}>
            {/* Score + combo */}
            <div className="flex items-center gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Điểm</p>
                <p className="text-lg font-black text-cyan-300">{score}</p>
              </div>
              {combo > 1 && (
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-black text-violet-300">
                  ×{combo}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Tiến độ {targetQuestionCount === 0 ? "(Vô tận)" : ""}
              </p>
              <p className="text-xs font-bold text-white">
                {processed} / {targetQuestionCount === 0 ? "∞" : sessionTotalWords || totalWords}
              </p>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
                  style={{
                    width:
                      targetQuestionCount === 0
                        ? `${Math.min(100, (processed % 20) * 5)}%`
                        : `${Math.min(100, (processed / Math.max(1, sessionTotalWords || totalWords)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Lives + controls */}
            <div className="flex items-center justify-end gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: INITIAL_LIVES }, (_, i) => (
                  <Heart key={i} className={`h-4 w-4 transition ${i < lives ? "fill-rose-400 text-rose-400" : "text-slate-700"}`} />
                ))}
              </div>
              {shieldActive && <span title="Lá chắn"><Shield className="h-4 w-4 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.9)]" /></span>}
              {isFreezeActive && <span title="Đóng băng"><Timer className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]" /></span>}
              <button
                type="button"
                onClick={() => setPhase((p) => p === "paused" ? "playing" : "paused")}
                className="ml-1 rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700"
              >
                {phase === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Arena */}
          <div className="relative h-[min(65vh,580px)] min-h-[400px] overflow-hidden bg-[radial-gradient(ellipse_at_30%_80%,rgba(6,182,212,0.12),transparent_50%),radial-gradient(ellipse_at_75%_15%,rgba(99,102,241,0.15),transparent_45%),linear-gradient(180deg,#020c18,#071225_60%,#0a1a2e)]">

            {/* Animated rain streaks */}
            {Array.from({ length: 24 }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute w-px rounded-full bg-cyan-300/20 animate-rain"
                style={{
                  left: `${(i * 41 + 7) % 100}%`,
                  height: `${8 + (i % 5) * 4}px`,
                  top: `${(i * 19 + 5) % 100}%`,
                  animationDelay: `${(i * 0.17) % 1}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.4}s`,
                }}
              />
            ))}

            {/* Stars */}
            {Array.from({ length: 20 }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute h-0.5 w-0.5 rounded-full bg-white/50"
                style={{ left: `${(i * 47 + 3) % 100}%`, top: `${(i * 31 + 9) % 90}%`, opacity: 0.15 + (i % 4) * 0.1 }}
              />
            ))}

            {/* Drops */}
            {drops.map((drop) => {
              const isLocked = lockedId === drop.id;
              const letters = drop.answer.split("");
              return (
                <div
                  key={drop.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 pt-2 pb-2 text-center transition-all duration-100 ${drop.color} ${isLocked ? "scale-105 ring-2 ring-white/60 z-10" : "z-0"}`}
                  style={{ left: `${drop.x}%`, top: `${drop.y}%`, minWidth: "140px", maxWidth: "220px" }}
                >
                  {/* Direction badge */}
                  <span className="absolute -top-2 left-2 rounded-full border border-white/20 bg-slate-900 px-1.5 py-0.5 text-[8px] font-bold text-slate-400">
                    VI→EN
                  </span>

                  {/* Meaning */}
                  <p className="text-[11px] font-semibold leading-tight text-white/90 mb-1.5">
                    {drop.meaning.length > 40 ? drop.meaning.slice(0, 37) + "…" : drop.meaning}
                  </p>

                  {/* Letter boxes */}
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {letters.map((letter, li) => {
                      const isTyped = li < drop.typed;
                      const isRevealed = !isTyped && li < drop.revealed;
                      const isBlank = !isTyped && !isRevealed;
                      return (
                        <span
                          key={li}
                          className={`inline-flex h-6 min-w-[18px] items-center justify-center rounded border text-[11px] font-black transition-all px-0.5 ${
                            isTyped
                              ? "border-emerald-400 bg-emerald-500/30 text-emerald-200"
                              : isRevealed
                              ? "border-amber-400/60 bg-amber-900/30 text-amber-200/80"
                              : "border-white/20 bg-white/5 text-white/30"
                          }`}
                        >
                          {isBlank ? "_" : letter.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Floating feedback */}
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`pointer-events-none absolute -translate-x-1/2 animate-float-up text-sm font-black ${fb.correct ? "text-emerald-300" : "text-rose-300"}`}
                style={{ left: `${fb.x}%`, top: `${fb.y - 5}%` }}
              >
                {fb.text}
              </div>
            ))}

            {/* Danger zone line */}
            <div className="absolute inset-x-0 bottom-[10%] border-t border-dashed border-rose-500/60" />
            <span className="absolute bottom-[10.5%] right-2 text-[9px] font-bold text-rose-500/70">DANGER</span>

            {/* Locked target indicator */}
            {lockedId && (() => {
              const ld = drops.find((d) => d.id === lockedId);
              return ld ? (
                <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 rounded-full border border-cyan-400/30 bg-slate-950/80 px-4 py-1 text-[10px] font-bold text-cyan-300">
                  Đang nhập: {ld.answerDisplay.slice(0, ld.typed)}
                  <span className="animate-pulse">|</span>
                  {ld.answerDisplay.slice(ld.typed)}
                </div>
              ) : null;
            })()}

            {/* Paused overlay */}
            {phase === "paused" ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-center">
                  <h3 className="text-xl font-black text-white">Tạm dừng</h3>
                  <p className="mt-2 text-sm text-slate-400">Giọt mưa đang chờ bạn…</p>
                  <button
                    type="button"
                    onClick={() => setPhase("playing")}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 font-black text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-200 transition"
                  >
                    <Play className="h-4 w-4" /> Tiếp tục chơi
                  </button>
                  <button
                    type="button"
                    onClick={() => { sessionRef.current = null; setPhase("lobby"); }}
                    className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Về phòng chờ
                  </button>
                  <Link
                    href="/vocabulary/games"
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-800 py-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Về Trung tâm trò chơi
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {/* Bottom bar: power-ups + status */}
          <div className="border-t border-white/10 bg-slate-900/90 px-3 py-2 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0">Vật phẩm</span>
              <div className="flex gap-1.5">
                {powerUps.map((pu, i) => {
                  const labels = ["F1", "F2", "F3"];
                  const icons = [
                    <ScanSearch key="hint" className="h-3.5 w-3.5" />,
                    <Timer key="freeze" className="h-3.5 w-3.5" />,
                    <Shield key="shield" className="h-3.5 w-3.5" />,
                  ];
                  const names = ["Gợi ý", "Đóng băng", "Lá chắn"];
                  return (
                    <button
                      key={pu.id}
                      type="button"
                      disabled={pu.count === 0}
                      onClick={() => activatePowerUp(pu.id)}
                      title={`[${labels[i]}] ${names[i]}`}
                      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-30"
                    >
                      {icons[i]}
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white">
                        {pu.count}
                      </span>
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-500">
                        {labels[i]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-500">
                <span>⏱ {elapsedSeconds}s</span>
                <span>{accuracy}% chính xác</span>
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="text-amber-300 font-semibold">{combo > 0 ? `×${combo}` : "–"}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── MODAL CHỌN BỘ ĐỀ ── */}
      {isSetPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[85dvh] w-full max-w-md flex-col space-y-3 rounded-3xl border border-cyan-400/30 bg-slate-950 p-4 sm:p-5 shadow-2xl text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white sm:text-base">Chọn bộ đề từ vựng</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchSetQuery}
                onChange={(e) => setSearchSetQuery(e.target.value)}
                placeholder="Tìm kiếm bộ đề từ vựng..."
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-9 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition focus:border-cyan-400"
              />
            </div>

            {/* Set List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[50dvh]">
              {isLoadingSet ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  <span className="text-sm font-bold">Đang tải bộ từ vựng...</span>
                </div>
              ) : filteredSets.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Không tìm thấy bộ đề phù hợp</p>
              ) : (
                filteredSets.map((s) => {
                  const isCurrent = s.id === activeSetId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isLoadingSet}
                      onClick={() => void handleSelectDeck(s)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                        isCurrent
                          ? "border-cyan-400 bg-cyan-950/60 font-bold text-cyan-200 shadow-sm"
                          : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-slate-900"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-bold text-white">{s.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {s.category || "Từ vựng TOEIC"} · {s.wordCount ?? s.words?.length ?? 0} từ
                        </p>
                      </div>
                      {isCurrent ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                      ) : (
                        <span className="shrink-0 rounded-lg border border-cyan-400/30 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-400/10">
                          Chọn
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-white/10 pt-2">
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-10px); opacity: 0.6; }
          100% { transform: translateY(30px); opacity: 0; }
        }
        .animate-rain { animation: rain linear infinite; }
        @keyframes float-up {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px); }
        }
        .animate-float-up { animation: float-up 0.9s ease-out forwards; }
      `}</style>
    </main>
  );
}

function StatCard({ label, value, isDark = true }: { label: string; value: string | number; isDark?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-left ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
      <p className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-1 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
