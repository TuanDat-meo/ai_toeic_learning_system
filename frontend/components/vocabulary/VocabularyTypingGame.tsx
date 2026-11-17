"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  Heart,
  Keyboard,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Timer,
  Zap,
  ScanSearch,
  Crosshair,
  X,
  Sun,
  Moon,
} from "lucide-react";
import type { WordItem, VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import {
  completeVocabularyGameSession,
  getVocabularySet,
  getVocabularySets,
  recordVocabularyAnswer,
  startVocabularyGameSession,
  type VocabularyAnswerResult,
  type VocabularyGameSession,
} from "@/lib/api/vocabulary";
import { selectVocabularyGameWords } from "./battleship/engine";
import { getWordLevel, type WordLevelTag } from "./runner/wordSelector";
import { BATTLESHIP_CONFIG } from "./battleship/config";
import {
  buildBidirectionalQuestion,
  evaluateBidirectionalAnswer,
  type BidirectionalQuestion,
} from "./battleship/questionGenerator";
import {
  createInitialInventory,
  consumeInventoryItem,
  POWER_UP_CATALOG,
  type InventorySlot,
} from "./battleship/powerUps";
import type { PowerUpId } from "./battleship/config";

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
type GamePhase = "lobby" | "playing" | "paused" | "result";
type AnswerMode = "choice" | "typing";
type LearningDirection = "en-vi" | "vi-en" | "mixed";
type BattleSpeedMode = "auto" | "slow" | "normal" | "fast";
type QuestionCount = 10 | 20 | "all";

function getCurrentTimestamp(): number {
  return Date.now();
}

function getMonotonicTimestamp(): number {
  return performance.now();
}

const BATTLE_SPEED_OPTIONS: {
  id: BattleSpeedMode;
  label: string;
  description: string;
}[] = [
  { id: "auto", label: "Tự động", description: "Điều chỉnh theo 5 câu gần nhất" },
  { id: "slow", label: "Chậm", description: "Dễ làm quen" },
  { id: "normal", label: "Vừa", description: "Tốc độ cân bằng" },
  { id: "fast", label: "Nhanh", description: "Thử thách cao" },
];

const BATTLE_SPEED_MULTIPLIERS: Record<Exclude<BattleSpeedMode, "auto">, number> = {
  slow: 0.7,
  normal: 1,
  fast: 1.35,
};

interface FallingWord {
  id: string;
  word: WordItem;
  /** Display text shown on the target chip */
  displayText: string;
  x: number;
  y: number;
  /** For typing mode: how many chars have been typed correctly */
  progress: number;
  color: string;
  question: BidirectionalQuestion;
  /** Current player input buffer (typing mode) */
  inputBuffer: string;
  /** True while the elimination power-up is active on this target */
  eliminatedOptions?: Set<number>;
}

interface PendingAnswer {
  target: FallingWord;
  answer: string;
  requestId: string;
  questionIndex: number;
  responseTimeMs: number;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  launched: boolean;
}

interface ActiveEffect {
  type: "freeze" | "shield" | "double-score";
  expiresAt: number;
}

// ───────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────
const WORD_COLORS = [
  "border-fuchsia-400 bg-fuchsia-950/90 text-fuchsia-50",
  "border-cyan-400 bg-cyan-950/90 text-cyan-50",
  "border-amber-400 bg-amber-950/90 text-amber-50",
  "border-emerald-400 bg-emerald-950/90 text-emerald-50",
  "border-rose-400 bg-rose-950/90 text-rose-50",
];

const INITIAL_LIVES = BATTLESHIP_CONFIG.INITIAL_LIVES;
const MAX_ACTIVE_WORDS = 4;
const GAME_BOTTOM = 86;

// ───────────────────────────────────────────────
// Power-up icon mapping
// ───────────────────────────────────────────────
const POWERUP_ICONS: Record<string, React.ReactNode> = {
  scanner: <ScanSearch className="h-4 w-4" />,
  elimination: <Crosshair className="h-4 w-4" />,
  freeze: <Timer className="h-4 w-4" />,
  repair: <Heart className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  multishot: <Zap className="h-4 w-4" />,
  "double-score": <Sparkles className="h-4 w-4" />,
  magnet: <Zap className="h-4 w-4" />,
  "mystery-box": <Sparkles className="h-4 w-4" />,
  phoenix: <Sparkles className="h-4 w-4" />,
};

// ───────────────────────────────────────────────
// Main component
// ───────────────────────────────────────────────
export default function VocabularyTypingGame({ setId }: { setId: string }) {
  // ── Game meta state ──
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [finalSession, setFinalSession] = useState<VocabularyGameSession | null>(null);

  // ── Set selection ──
  const [activeSetId, setActiveSetId] = useState<string>(setId);
  const [activeTestSet, setActiveTestSet] = useState<VocabularyTestSet | null>(null);
  const [availableSets, setAvailableSets] = useState<VocabularyTestSet[]>([]);
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);

  // ── Lobby settings ──
  const [answerMode, setAnswerMode] = useState<AnswerMode>("choice");
  const [direction, setDirection] = useState<LearningDirection>("mixed");
  const [speedMode, setSpeedMode] = useState<BattleSpeedMode>("auto");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [studyMode, setStudyMode] = useState<"single_deck" | "all_decks" | "by_level">("single_deck");
  const [selectedLevels, setSelectedLevels] = useState<WordLevelTag[]>([
    "A1", "A2", "B1", "B2", "C1", "C2", "unclassified",
  ]);
  const [reviewOnly, setReviewOnly] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<Exclude<BattleSpeedMode, "auto">>("normal");
  const [isMaximizedTab, setIsMaximizedTab] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mixedWords = availableSets.flatMap((set) => set.words ?? []);
  const knownWordIds = new Set(mixedWords.map((word) => word.id));
  const allDeckWords: WordItem[] = [
    ...mixedWords,
    ...words.filter((word) => !knownWordIds.has(word.id)),
  ];

  // ── Game loop state ──
  const [targets, setTargets] = useState<FallingWord[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [lockedTargetId, setLockedTargetId] = useState<string | null>(null);
  const [lives, setLives] = useState<number>(INITIAL_LIVES);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedWords, setMissedWords] = useState<WordItem[]>([]);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);
  const [typedAnswerSubmission, setTypedAnswerSubmission] = useState<{ target: FallingWord; answer: string } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastShotId, setLastShotId] = useState<string | null>(null);
  const [hitFeedback, setHitFeedback] = useState<{ id: string; correct: boolean } | null>(null);
  const [shieldActive, setShieldActive] = useState(false);

  // ── Power-up state ──
  const [inventory, setInventory] = useState<InventorySlot[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [frozenUntil, setFrozenUntil] = useState(0);

  // ── Refs (mutable, not causing re-render) ──
  const targetsRef = useRef<FallingWord[]>([]);
  const wordsRef = useRef<WordItem[]>([]);
  const nextWordIndexRef = useRef(0);
  const questionIndexRef = useRef(0);
  const resolvedCountRef = useRef(0);
  const livesRef = useRef<number>(INITIAL_LIVES);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const correctCountRef = useRef(0);
  const missedWordsRef = useRef<WordItem[]>([]);
  const sessionRef = useRef<VocabularyGameSession | null>(null);
  const startTimeRef = useRef(0);
  const lastSpawnTimeRef = useRef(0);
  const pendingAnswerRef = useRef<PendingAnswer | null>(null);
  const savingRef = useRef(false);
  const finalizingRef = useRef(false);
  const resolveTargetRef = useRef<(target: FallingWord, answer: string) => Promise<void>>(async () => {});
  const shieldRef = useRef(false);
  const frozenUntilRef = useRef(0);
  const doubleScoreUntilRef = useRef(0);
  const directionRef = useRef<LearningDirection>("mixed");
  const answerModeRef = useRef<AnswerMode>("choice");
  const inventoryRef = useRef<InventorySlot[]>([]);
  const speedModeRef = useRef<BattleSpeedMode>("auto");
  const activeSpeedRef = useRef<Exclude<BattleSpeedMode, "auto">>("normal");
  const recentAnswersRef = useRef<boolean[]>([]);

  // Keep refs in sync
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { answerModeRef.current = answerMode; }, [answerMode]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { speedModeRef.current = speedMode; }, [speedMode]);
  useEffect(() => { activeSpeedRef.current = activeSpeed; }, [activeSpeed]);

  // ───────────────────────────────────────────────
  // Load vocabulary set & available sets
  // ───────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void getVocabularySet(activeSetId)
      .then((set) => {
        if (active) {
          setActiveTestSet(set);
          setWords(set.words ?? []);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Không thể tải bộ từ vựng.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeSetId]);

  useEffect(() => {
    let active = true;
    void getVocabularySets()
      .then((sets) => {
        if (active && Array.isArray(sets)) setAvailableSets(sets);
      })
      .catch((err) => console.warn("Could not load all vocabulary sets", err));
    return () => { active = false; };
  }, []);

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
      setActiveSetId(fullSet.id);
      setActiveTestSet(fullSet);
      setWords(fullSet.words ?? []);
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

  // ───────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────
  const updateTargets = useCallback((next: FallingWord[] | ((c: FallingWord[]) => FallingWord[])) => {
    const updated = typeof next === "function" ? next(targetsRef.current) : next;
    targetsRef.current = updated;
    setTargets(updated);
  }, []);

  const toggleMaximizeTab = useCallback(() => {
    setIsMaximizedTab((current) => !current);
  }, []);

  const fireProjectile = useCallback((target: FallingWord) => {
    const id = crypto.randomUUID();
    setProjectiles((cur) => [...cur, { id, x: 50, y: 89, targetX: target.x, targetY: target.y, launched: false }]);
    window.requestAnimationFrame(() => {
      setProjectiles((cur) => cur.map((p) => p.id === id ? { ...p, launched: true } : p));
    });
    window.setTimeout(() => {
      setProjectiles((cur) => cur.filter((p) => p.id !== id));
    }, 500);
    setLastShotId(target.id);
    window.setTimeout(() => setLastShotId((cur) => cur === target.id ? null : cur), 450);
  }, []);

  // ───────────────────────────────────────────────
  // Session finalization
  // ───────────────────────────────────────────────
  const finalizeSession = useCallback(async () => {
    const activeSession = sessionRef.current;
    if (!activeSession || finalizingRef.current) return;
    finalizingRef.current = true;
    setFinalizing(true);
    setPhase("result");
    setFinishError(null);
    try {
      const completed = await completeVocabularyGameSession(activeSession.id);
      setFinalSession(completed);
    } catch (reason) {
      finalizingRef.current = false;
      setFinishError(reason instanceof Error ? reason.message : "Không thể lưu kết quả phiên chơi.");
    } finally {
      setFinalizing(false);
    }
  }, []);

  // ───────────────────────────────────────────────
  // Core answer resolution
  // ───────────────────────────────────────────────
  const saveResolvedWord = useCallback(async (target: FallingWord, answer: string) => {
    if (savingRef.current || !sessionRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);

    const isDoubleScore = Date.now() < doubleScoreUntilRef.current;
    const pending = pendingAnswerRef.current ?? {
      target,
      answer,
      requestId: crypto.randomUUID(),
      questionIndex: questionIndexRef.current,
      responseTimeMs: Math.min(Date.now() - startTimeRef.current, 600_000),
    };
    pendingAnswerRef.current = pending;

    // Determine backend questionType from direction
    const qType = pending.target.question.direction === "en-vi"
      ? "ENGLISH_TO_VIETNAMESE"
      : "VIETNAMESE_TO_ENGLISH";

    try {
      const response: VocabularyAnswerResult = await recordVocabularyAnswer({
        requestId: pending.requestId,
        wordId: pending.target.word.id,
        activityType: "GAME",
        questionType: qType,
        answer: pending.answer,
        responseTimeMs: pending.responseTimeMs,
        gameSessionId: sessionRef.current.id,
        gameQuestionIndex: pending.questionIndex,
      });

      const recentAnswers = [...recentAnswersRef.current, response.correct].slice(-5);
      recentAnswersRef.current = recentAnswers;
      if (speedModeRef.current === "auto" && recentAnswers.length === 5) {
        const correctInWindow = recentAnswers.filter(Boolean).length;
        const nextSpeed = correctInWindow >= 4 ? "fast" : correctInWindow <= 2 ? "slow" : "normal";
        activeSpeedRef.current = nextSpeed;
        setActiveSpeed(nextSpeed);
      }

      pendingAnswerRef.current = null;
      questionIndexRef.current += 1;
      const nextResolved = resolvedCountRef.current + 1;
      resolvedCountRef.current = nextResolved;
      setResolvedCount(nextResolved);
      updateTargets((cur) => cur.filter((t) => t.id !== pending.target.id));
      setLockedTargetId((cur) => cur === pending.target.id ? null : cur);

      setHitFeedback({ id: pending.target.id, correct: response.correct });
      window.setTimeout(() => setHitFeedback(null), 700);

      if (response.correct) {
        const nextCombo = comboRef.current + 1;
        const baseScore = BATTLESHIP_CONFIG.BASE_QUESTION_SCORE + Math.min(nextCombo - 1, 4) * 5;
        const nextScore = scoreRef.current + (isDoubleScore ? baseScore * 2 : baseScore);
        comboRef.current = nextCombo;
        scoreRef.current = nextScore;
        correctCountRef.current += 1;
        maxComboRef.current = Math.max(maxComboRef.current, nextCombo);
        setCombo(nextCombo);
        setScore(nextScore);
        setCorrectCount(correctCountRef.current);
        setMaxCombo(maxComboRef.current);
        fireProjectile(pending.target);
      } else {
        if (!reviewOnly) {
          // Shield absorbs one hit
          if (shieldRef.current) {
            shieldRef.current = false;
            setShieldActive(false);
          } else {
            const nextLives = Math.max(0, livesRef.current - 1);
            livesRef.current = nextLives;
            setLives(nextLives);
          }
        }
        comboRef.current = 0;
        if (!missedWordsRef.current.some((word) => word.id === pending.target.word.id)) {
          missedWordsRef.current = [...missedWordsRef.current, pending.target.word];
          setMissedWords(missedWordsRef.current);
        }
        setCombo(0);
      }

      if (nextResolved >= wordsRef.current.length || livesRef.current <= 0) {
        await finalizeSession();
      } else {
        setPhase("playing");
      }
    } catch (reason) {
      setPhase("paused");
      setSaveError(reason instanceof Error ? reason.message : "Không thể đồng bộ lượt chơi với máy chủ.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [finalizeSession, fireProjectile, reviewOnly, setLockedTargetId, updateTargets]);

  useEffect(() => { resolveTargetRef.current = saveResolvedWord; }, [saveResolvedWord]);
  useEffect(() => {
    if (typedAnswerSubmission) {
      void resolveTargetRef.current(typedAnswerSubmission.target, typedAnswerSubmission.answer);
    }
  }, [typedAnswerSubmission]);

  // ───────────────────────────────────────────────
  // Start game
  // ───────────────────────────────────────────────
  const startGame = async () => {
    setStarting(true);
    setError(null);
    setSaveError(null);
    setFinishError(null);
    setFinalSession(null);
    finalizingRef.current = false;
    try {
      if (!reviewOnly && studyMode !== "single_deck" && availableSets.length === 0) {
        throw new Error("Không tải được danh sách bộ đề. Vui lòng thử lại trước khi chơi trộn.");
      }
      const sourceWords = reviewOnly
        ? missedWords
        : studyMode === "single_deck"
          ? words
          : allDeckWords.filter((word) => studyMode !== "by_level" || selectedLevels.includes(getWordLevel(word)));
      const selectedWords = selectVocabularyGameWords(
        sourceWords,
        reviewOnly ? "all" : questionCount,
        crypto.getRandomValues(new Uint32Array(1))[0],
      );
      if (selectedWords.length === 0) {
        throw new Error(reviewOnly ? "Chưa có từ sai để ôn tập." : "Bộ từ vựng này chưa có từ để luyện.");
      }

      const createdSession = await startVocabularyGameSession({
        setId: activeSetId,
        gameType: "TYPING",
        deckIds: [...new Set([
          activeSetId,
          ...(reviewOnly || studyMode === "single_deck"
            ? []
            : availableSets.map((set) => set.id)),
          ...selectedWords.map((word) => word.setId).filter((id): id is string => typeof id === "string" && id.length > 0),
        ])],
      });

      // Reset all state
      sessionRef.current = createdSession;
      wordsRef.current = selectedWords;
      setSessionQuestionCount(selectedWords.length);
      nextWordIndexRef.current = 0;
      questionIndexRef.current = 0;
      resolvedCountRef.current = 0;
      livesRef.current = INITIAL_LIVES;
      scoreRef.current = 0;
      comboRef.current = 0;
      maxComboRef.current = 0;
      correctCountRef.current = 0;
      missedWordsRef.current = [];
      pendingAnswerRef.current = null;
      targetsRef.current = [];
      shieldRef.current = false;
      frozenUntilRef.current = 0;
      doubleScoreUntilRef.current = 0;
      recentAnswersRef.current = [];
      const startingSpeed = speedMode === "auto" ? "normal" : speedMode;
      activeSpeedRef.current = startingSpeed;
      setActiveSpeed(startingSpeed);

      setTargets([]);
      setProjectiles([]);
      setLockedTargetId(null);
      setLives(INITIAL_LIVES);
      setResolvedCount(0);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setCorrectCount(0);
      setMissedWords([]);
      setElapsedSeconds(0);
      setShieldActive(false);
      setActiveEffects([]);
      setFrozenUntil(0);
      const initInv = createInitialInventory();
      setInventory(initInv);
      inventoryRef.current = initInv;

      startTimeRef.current = getCurrentTimestamp();
      lastSpawnTimeRef.current = getMonotonicTimestamp() - 1500;
      setPhase("playing");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể bắt đầu phiên chơi.");
    } finally {
      setStarting(false);
    }
  };

  // ───────────────────────────────────────────────
  // Game loop (falling words + spawn)
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || saveError) return;
    const interval = window.setInterval(() => {
      const now = performance.now();
      const milestone = Math.floor(resolvedCountRef.current / 5);
      const isFrozen = now < frozenUntilRef.current;
      const selectedSpeed = speedModeRef.current === "auto" ? activeSpeedRef.current : speedModeRef.current;
      const speedMultiplier = BATTLE_SPEED_MULTIPLIERS[selectedSpeed];
      const speed = isFrozen ? 0 : (0.004 + milestone * 0.001) * speedMultiplier;
      const spawnInterval = Math.max(700, (1800 - milestone * 180) / speedMultiplier);
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      let updated = targetsRef.current.map((t) => ({ ...t, y: t.y + speed * 50 }));
      const escaped = updated.find((t) => t.y >= GAME_BOTTOM);
      if (escaped) {
        updated = updated.filter((t) => t.id !== escaped.id);
        updateTargets(updated);
        void resolveTargetRef.current(escaped, "");
        return;
      }

      if (
        updated.length < MAX_ACTIVE_WORDS
        && nextWordIndexRef.current < wordsRef.current.length
        && now - lastSpawnTimeRef.current >= spawnInterval
      ) {
        const index = nextWordIndexRef.current++;
        const word = wordsRef.current[index];
        const question = buildBidirectionalQuestion(
          word,
          index,
          directionRef.current,
          wordsRef.current,
        );
        updated = [
          ...updated,
          {
            id: `${index}-${word.id}`,
            word,
            displayText: question.displayTerm,
            x: 8 + Math.random() * 76,
            y: 5,
            progress: 0,
            color: WORD_COLORS[index % WORD_COLORS.length],
            question,
            inputBuffer: "",
          },
        ];
        lastSpawnTimeRef.current = now;
      }
      updateTargets(updated);
    }, 50);
    return () => window.clearInterval(interval);
  }, [phase, saveError, updateTargets]);

  // ───────────────────────────────────────────────
  // Power-up activation
  // ───────────────────────────────────────────────
  const activatePowerUp = useCallback((id: PowerUpId) => {
    const { updated, consumed } = consumeInventoryItem(inventoryRef.current, id);
    if (!consumed) return;
    setInventory(updated);
    inventoryRef.current = updated;

    const now = Date.now();
    switch (id) {
      case "freeze": {
        const exp = performance.now() + 5000;
        frozenUntilRef.current = exp;
        setFrozenUntil(exp);
        setActiveEffects((cur) => [...cur.filter((e) => e.type !== "freeze"), { type: "freeze", expiresAt: now + 5000 }]);
        window.setTimeout(() => setActiveEffects((cur) => cur.filter((e) => e.type !== "freeze")), 5000);
        break;
      }
      case "shield": {
        shieldRef.current = true;
        setShieldActive(true);
        setActiveEffects((cur) => [...cur.filter((e) => e.type !== "shield"), { type: "shield", expiresAt: now + 15000 }]);
        break;
      }
      case "repair": {
        const next = Math.min(INITIAL_LIVES, livesRef.current + 1);
        livesRef.current = next;
        setLives(next);
        break;
      }
      case "double-score": {
        doubleScoreUntilRef.current = now + 10000;
        setActiveEffects((cur) => [...cur.filter((e) => e.type !== "double-score"), { type: "double-score", expiresAt: now + 10000 }]);
        window.setTimeout(() => setActiveEffects((cur) => cur.filter((e) => e.type !== "double-score")), 10000);
        break;
      }
      case "scanner": {
        // Show hint on the locked/nearest target — handled via UI state
        break;
      }
      case "elimination": {
        // Eliminate 2 wrong options on locked/top target
        const topTarget = targetsRef.current.length > 0
          ? targetsRef.current.reduce((a, b) => (b.y > a.y ? b : a))
          : null;
        if (topTarget) {
          const wrongIndices: number[] = [];
          topTarget.question.options.forEach((_, i) => {
            if (i !== topTarget.question.correctOptionIndex) wrongIndices.push(i);
          });
          // Randomly pick 2 wrong indices to eliminate
          for (let i = wrongIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
          }
          const toElim = new Set(wrongIndices.slice(0, 2));
          updateTargets((cur) =>
            cur.map((t) =>
              t.id === topTarget.id ? { ...t, eliminatedOptions: toElim } : t
            )
          );
        }
        break;
      }
      default:
        break;
    }
  }, [updateTargets]);

  // ───────────────────────────────────────────────
  // Keyboard handler
  // ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if ((phase !== "playing" || answerModeRef.current !== "typing") && (event.key === "f" || event.key === "F")) {
        event.preventDefault();
        toggleMaximizeTab();
        return;
      }
      if (event.key === "Escape" && isMaximizedTab) {
        event.preventDefault();
        setIsMaximizedTab(false);
        return;
      }
      // Escape = pause/resume
      if (event.key === "Escape" && (phase === "playing" || phase === "paused") && !savingRef.current) {
        event.preventDefault();
        setPhase((cur) => cur === "playing" ? "paused" : "playing");
        return;
      }
      if (phase !== "playing" || savingRef.current || saveError) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      // ── Power-up hotkeys (1-5 for inventory slots) ──
      const slotIndex = ["1", "2", "3", "4", "5"].indexOf(event.key);
      if (slotIndex !== -1) {
        const slot = inventoryRef.current[slotIndex];
        if (slot) {
          event.preventDefault();
          activatePowerUp(slot.id);
          return;
        }
      }

      // ── Multiple choice hotkeys A/B/C/D ──
      if (answerModeRef.current === "choice") {
        const choiceIdx = ["a", "b", "c", "d"].indexOf(event.key.toLowerCase());
        if (choiceIdx !== -1) {
          // Apply to nearest (bottom-most) target
          const topTarget = targetsRef.current.length > 0
            ? targetsRef.current.reduce((a, b) => (b.y > a.y ? b : a))
            : null;
          if (topTarget && topTarget.question.options[choiceIdx] !== undefined) {
            event.preventDefault();
            void resolveTargetRef.current(topTarget, topTarget.question.options[choiceIdx]);
            return;
          }
        }
      }

      // ── Typing mode ──
      if (answerModeRef.current === "typing") {
        const activeTarget = targetsRef.current.find((t) => t.id === lockedTargetId);

        if (event.key === "Enter" && activeTarget) {
          event.preventDefault();
          const buf = activeTarget.inputBuffer.trim();
          if (buf) {
            setLockedTargetId(null);
            void resolveTargetRef.current(activeTarget, buf);
          }
          return;
        }

        if (event.key === "Backspace" && activeTarget) {
          event.preventDefault();
          updateTargets((cur) =>
            cur.map((t) =>
              t.id === activeTarget.id
                ? { ...t, inputBuffer: t.inputBuffer.slice(0, -1) }
                : t
            )
          );
          return;
        }

        if (event.key.length === 1) {
          if (activeTarget) {
            event.preventDefault();
            updateTargets((cur) =>
              cur.map((t) =>
                t.id === activeTarget.id
                  ? { ...t, inputBuffer: t.inputBuffer + event.key }
                  : t
              )
            );
          } else {
            // Lock on first keypress to nearest target
            const nearest = targetsRef.current.length > 0
              ? targetsRef.current.reduce((a, b) => (b.y > a.y ? b : a))
              : null;
            if (nearest) {
              event.preventDefault();
              setLockedTargetId(nearest.id);
              updateTargets((cur) =>
                cur.map((t) =>
                  t.id === nearest.id
                    ? { ...t, inputBuffer: event.key }
                    : t
                )
              );
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMaximizedTab, lockedTargetId, phase, saveError, activatePowerUp, toggleMaximizeTab, updateTargets]);

  // ───────────────────────────────────────────────
  // Derived values
  // ───────────────────────────────────────────────
  const progressPercent = Math.min(100, (resolvedCount / Math.max(1, sessionQuestionCount)) * 100);
  const selectableWords = reviewOnly
    ? missedWords
    : studyMode === "single_deck"
      ? words
      : allDeckWords.filter((word) => studyMode !== "by_level" || selectedLevels.includes(getWordLevel(word)));
  const availableWordCount = selectVocabularyGameWords(selectableWords, "all", 1).length;
  const reviewWordCount = selectVocabularyGameWords(missedWords, "all", 1).length;
  const plannedQuestionCount = reviewOnly
    ? reviewWordCount
    : questionCount === "all" ? availableWordCount : Math.min(questionCount, availableWordCount);
  const accuracy = Math.round((correctCount / Math.max(1, resolvedCount)) * 100);
  const isDoubleScoreActive = activeEffects.some((e) => e.type === "double-score");
  const isFreezeActive = activeEffects.some((e) => e.type === "freeze");

  const filteredSets = availableSets.filter((s) => {
    if (!searchSetQuery.trim()) return true;
    const q = searchSetQuery.toLowerCase().trim();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  const retryPendingAnswer = () => {
    const pending = pendingAnswerRef.current;
    if (pending) {
      setPhase("playing");
      void resolveTargetRef.current(pending.target, pending.answer);
    }
  };
  const retryFinalization = () => {
    finalizingRef.current = false;
    void finalizeSession();
  };

  // ───────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────
  return (
    <main className={`mx-auto max-w-5xl space-y-3 px-2 pb-10 sm:px-4 ${
      isMaximizedTab
        ? "fixed inset-0 z-[60] h-dvh max-w-none overflow-y-auto rounded-none bg-slate-950 px-3 pt-3 sm:px-6"
        : ""
    }`}>
      {/* ── Top Header ── */}
      <header className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
        <Link
          href="/vocabulary/games"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Trung tâm trò chơi</span>
          <span className="sm:hidden">Thoát</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-2">
          <div className="min-w-0 text-right">
            <h1 className="text-base sm:text-xl font-black text-slate-900 truncate">Chiến Hạm Từ Vựng ⚔️</h1>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">Vocabulary Battleship · Bắn hạ mục tiêu đa chiều</p>
          </div>
          <button
            type="button"
            onClick={toggleMaximizeTab}
            aria-label={isMaximizedTab ? "Thu nhỏ khung game" : "Phóng to khung game"}
            title={isMaximizedTab ? "Thu nhỏ (F hoặc Esc)" : "Phóng to vừa tab (F)"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 sm:px-3 shadow-sm"
          >
            {isMaximizedTab ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isMaximizedTab ? "Thu nhỏ" : "Phóng to"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDarkMode((d) => !d)}
            aria-label={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Loading / Error ── */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">
          Đang tải bộ từ vựng...
        </div>
      ) : error && phase === "lobby" ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 shadow-sm">
          {error}
        </div>
      ) : phase === "lobby" ? (
        // ── LOBBY ──
        <section className={`overflow-hidden rounded-3xl p-6 text-center shadow-2xl sm:p-10 ${isDarkMode ? "border border-indigo-400/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white" : "border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50 text-slate-900"}`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-300">
            <Keyboard className="h-8 w-8" />
          </div>
          <p className={`mt-5 text-xs font-black uppercase tracking-[0.3em] ${isDarkMode ? "text-cyan-300" : "text-indigo-700"}`}>
            Chiến Hạm Từ Vựng · Battleship
          </p>
          <h2 className={`mt-2 text-2xl font-black sm:text-4xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>Chọn Từ Đúng. Bảo Vệ Hạm Đội.</h2>
          <p className={`mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-6 font-medium ${isDarkMode ? "text-indigo-100/90" : "text-slate-600"}`}>
            Trả lời câu hỏi Anh–Việt hoặc Việt–Anh để phóng ngư lôi bắn hạ mục tiêu. Hỗ trợ trắc nghiệm (A/B/C/D) hoặc gõ phím trực tiếp.
          </p>

          {/* Settings */}
          <div className="mx-auto mt-8 max-w-lg space-y-4 text-left">
            {/* Bộ đề đang chọn & Đổi bộ đề */}
            <div className={`flex items-center justify-between rounded-2xl border p-3 sm:p-4 shadow-lg ${isDarkMode ? "border-indigo-400/30 bg-slate-900/90 shadow-indigo-950/40" : "border-indigo-200 bg-slate-50 shadow-slate-200/60"}`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isDarkMode ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-300" : "border-indigo-300 bg-indigo-100 text-indigo-700"}`}>
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>Bộ đề đang chọn</p>
                  <p className={`truncate text-sm font-extrabold sm:text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {activeTestSet?.title || "Đang tải bộ đề..."}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeTestSet?.category || "Từ vựng TOEIC"} · {words.length} từ khả dụng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(true)}
                className={`ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 sm:px-4 sm:text-sm ${
                  isDarkMode
                    ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
                    : "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                }`}
              >
                <span>Đổi bộ đề</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-800"}`}>Phạm vi từ vựng</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "single_deck", label: "Bộ đề hiện tại" },
                  { id: "all_decks", label: "Trộn tất cả bộ đề" },
                  { id: "by_level", label: "Theo cấp độ" },
                ] as const).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={studyMode === option.id}
                    onClick={() => setStudyMode(option.id)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                      studyMode === option.id
                        ? isDarkMode ? "border-cyan-400 bg-cyan-400/15 text-cyan-200" : "border-indigo-600 bg-indigo-50 text-indigo-950"
                        : isDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {studyMode === "by_level" ? (
                <div className={`mt-2 rounded-xl border p-3 ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Cấp độ CEFR</span>
                    <button
                      type="button"
                      onClick={() => setSelectedLevels(selectedLevels.length === 7 ? ["B1"] : ["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"])}
                      className="text-xs font-bold text-indigo-600"
                    >
                      {selectedLevels.length === 7 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"] as WordLevelTag[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={selectedLevels.includes(level)}
                        onClick={() => setSelectedLevels((current) => current.includes(level)
                          ? current.length > 1 ? current.filter((item) => item !== level) : current
                          : [...current, level])}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-bold ${
                          selectedLevels.includes(level)
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : isDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {level === "unclassified" ? "Khác" : level}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Direction */}
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-800"}`}>Hướng luyện tập</p>
              <div className="grid grid-cols-3 gap-2">
                {(["mixed", "en-vi", "vi-en"] as LearningDirection[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDirection(d)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                      direction === d
                        ? isDarkMode
                          ? "border-cyan-400 bg-cyan-400/15 text-cyan-300 shadow-sm"
                          : "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                        : isDarkMode
                        ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {d === "mixed" ? "Trộn hai chiều" : d === "en-vi" ? "Anh → Việt" : "Việt → Anh"}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer mode */}
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-800"}`}>Hình thức trả lời</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnswerMode("choice")}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    answerMode === "choice"
                      ? isDarkMode
                        ? "border-violet-400 bg-violet-400/15 text-violet-300 shadow-sm"
                        : "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                      : isDarkMode
                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  Trắc nghiệm (A–D)
                </button>
                <button
                  type="button"
                  onClick={() => setAnswerMode("typing")}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    answerMode === "typing"
                      ? isDarkMode
                        ? "border-violet-400 bg-violet-400/15 text-violet-300 shadow-sm"
                        : "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                      : isDarkMode
                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  Nhập câu trả lời
                </button>
              </div>
            </div>

            {/* Target speed */}
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-800"}`}>Tốc độ mục tiêu</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BATTLE_SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={speedMode === option.id}
                    onClick={() => {
                      speedModeRef.current = option.id;
                      setSpeedMode(option.id);
                      if (option.id !== "auto") {
                        activeSpeedRef.current = option.id;
                        setActiveSpeed(option.id);
                      }
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                      speedMode === option.id
                        ? isDarkMode
                          ? "border-amber-400 bg-amber-400/15 text-amber-200 shadow-sm"
                          : "border-amber-600 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-500"
                        : isDarkMode
                        ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className={`mt-2 text-[11px] leading-5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`} aria-live="polite">
                {speedMode === "auto"
                  ? "Tự động dựa trên 5 câu gần nhất: từ 4 câu đúng sẽ tăng tốc; tối đa 2 câu đúng sẽ giảm tốc."
                  : `Tốc độ ${BATTLE_SPEED_OPTIONS.find((option) => option.id === speedMode)?.label.toLocaleLowerCase()}: ${BATTLE_SPEED_OPTIONS.find((option) => option.id === speedMode)?.description}.`}
              </p>
            </div>

            {/* Question count */}
            <div>
              <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-800"}`}>Số câu trong trận</p>
              {reviewOnly ? (
                <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  isDarkMode ? "border-amber-400/30 bg-amber-400/10" : "border-amber-300 bg-amber-50 shadow-sm"
                }`}>
                  <p className={`text-sm font-semibold ${isDarkMode ? "text-amber-100" : "text-amber-950"}`}>
                    Ôn tập {reviewWordCount} từ đã trả lời sai
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewOnly(false)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      isDarkMode
                        ? "border-amber-300/30 text-amber-100 hover:bg-amber-300/10"
                        : "border-amber-400 bg-white text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    Đổi lựa chọn
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 10, label: "10 câu" },
                    { value: 20, label: "20 câu" },
                    { value: "all", label: "Toàn bộ" },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={questionCount === option.value}
                      onClick={() => setQuestionCount(option.value)}
                      disabled={availableWordCount === 0}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                        questionCount === option.value
                          ? isDarkMode
                            ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-sm"
                            : "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                          : isDarkMode
                          ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                      } disabled:opacity-50`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              <p className={`mt-2 text-[11px] leading-5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {reviewOnly
                  ? "Tất cả từ sai được ôn trong cùng một phiên; chế độ ôn không giới hạn mạng và vẫn ghi kết quả lên hệ thống."
                  : `Trận này có ${plannedQuestionCount} từ duy nhất. Các từ sai được gom thành một danh sách để ôn tập cùng lúc sau trận.`}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <p className={`text-xs ${isDarkMode ? "text-indigo-200" : "text-slate-600 font-bold"}`}>Bộ từ vựng</p>
                <p className={`mt-1 text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{words.length} từ</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <p className={`text-xs ${isDarkMode ? "text-indigo-200" : "text-slate-600 font-bold"}`}>Số câu</p>
                <p className={`mt-1 text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{plannedQuestionCount} câu</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <p className={`text-xs ${isDarkMode ? "text-indigo-200" : "text-slate-600 font-bold"}`}>Mạng khởi đầu</p>
                <p className={`mt-1 flex gap-1 text-sm font-bold ${isDarkMode ? "text-rose-300" : "text-rose-600"}`}>
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> × {INITIAL_LIVES}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={starting || plannedQuestionCount === 0}
            onClick={() => void startGame()}
            className={`mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3 font-black shadow-lg transition active:scale-95 disabled:opacity-50 ${
              isDarkMode
                ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200 shadow-cyan-950/50"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
            }`}
          >
            <Rocket className="h-5 w-5" />
            {starting
              ? "Đang chuẩn bị trận đấu..."
              : reviewOnly ? "Bắt đầu ôn tập từ sai" : "Bắt đầu trận đấu"}
          </button>
        </section>
      ) : phase === "result" ? (
        // ── RESULT ──
        <section className={`rounded-3xl p-6 text-center sm:p-10 ${isDarkMode ? "border border-slate-800 bg-slate-950" : "border-2 border-slate-200 bg-white shadow-lg"}`}>
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${isDarkMode ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-indigo-200 bg-indigo-50 text-indigo-600"}`}>
            {lives > 0 ? <Sparkles className="h-8 w-8" /> : <Heart className="h-8 w-8 fill-rose-500 text-rose-400" />}
          </div>
          <h2 className={`mt-4 text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {lives > 0 ? "Hoàn thành nhiệm vụ" : "Nhiệm vụ thất bại"}
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {lives > 0
              ? "Bạn đã xử lý toàn bộ mục tiêu trong trận đấu."
              : "Mạng đã hết. Hãy luyện lại các từ đã bỏ lỡ để cải thiện kết quả."}
          </p>
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Điểm" value={finalSession?.score ?? score} isDark={isDarkMode} />
            <Stat label="Tổng câu trả lời" value={finalSession?.totalQuestions ?? resolvedCount} isDark={isDarkMode} />
            <Stat label="Trả lời đúng" value={finalSession?.correctCount ?? correctCount} isDark={isDarkMode} />
            <Stat label="Trả lời sai" value={finalSession?.wrongCount ?? Math.max(0, resolvedCount - correctCount)} isDark={isDarkMode} />
            <Stat
              label="Độ chính xác"
              value={`${finalSession
                ? Math.round((finalSession.correctCount / Math.max(1, finalSession.totalQuestions)) * 100)
                : accuracy}%`}
              isDark={isDarkMode}
            />
            <Stat label="Combo tốt nhất" value={`${finalSession?.maxCombo ?? maxCombo}×`} isDark={isDarkMode} />
            <Stat label="Thời gian chơi" value={`${elapsedSeconds}s`} isDark={isDarkMode} />
          </div>
          <p className={`mt-3 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
            Tốc độ đã chọn: {BATTLE_SPEED_OPTIONS.find((option) => option.id === speedMode)?.label}
            {speedMode === "auto" ? ` · Tốc độ cuối trận: ${BATTLE_SPEED_OPTIONS.find((option) => option.id === activeSpeed)?.label}` : ""}
          </p>
          {finishError ? (
            <div role="alert" className={`mx-auto mt-5 max-w-xl rounded-xl border p-3 text-left text-sm ${isDarkMode ? "border-red-800 bg-red-950/50 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>
              <p>{finishError}</p>
              <button type="button" disabled={finalizing} onClick={retryFinalization} className="mt-2 rounded-lg bg-red-900 px-3 py-1.5 font-bold text-white disabled:opacity-50">
                Thử lưu lại
              </button>
            </div>
          ) : null}
          {missedWords.length > 0 ? (
            <div className={`mx-auto mt-5 max-w-2xl rounded-xl border p-4 text-left ${isDarkMode ? "border-amber-400/20 bg-amber-400/5" : "border-amber-200 bg-amber-50"}`}>
              <p className={`text-sm font-bold ${isDarkMode ? "text-amber-200" : "text-amber-900"}`}>
                Danh sách từ sai cần ôn ({missedWords.length}) — đã lưu vào tiến độ học tập
              </p>
              <ul className={`mt-2 grid gap-1 text-sm sm:grid-cols-2 ${isDarkMode ? "text-amber-100/80" : "text-amber-950"}`}>
                {missedWords.map((word) => (
                  <li key={word.id}>
                    <span className="font-semibold">{word.word}</span>
                    {word.meaning ? ` — ${word.meaning}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {missedWords.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  sessionRef.current = null;
                  setFinalSession(null);
                  setReviewOnly(true);
                  setPhase("lobby");
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition active:scale-95 ${isDarkMode ? "border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20" : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
              >
                <RotateCcw className="h-4 w-4" /> Ôn tập từ sai
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                sessionRef.current = null;
                setFinalSession(null);
                setReviewOnly(false);
                setPhase("lobby");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" /> Chơi lại
            </button>
            <button
              type="button"
              onClick={() => setIsSetPickerOpen(true)}
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition active:scale-95 ${isDarkMode ? "border-indigo-400/40 bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900/60" : "border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"}`}
            >
              <FolderKanban className="h-4 w-4" /> Đổi bộ đề
            </button>
            <Link
              href="/vocabulary/games"
              className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-bold transition active:scale-95 ${isDarkMode ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <ArrowLeft className="h-4 w-4" /> Về Trung tâm trò chơi
            </Link>
          </div>
        </section>
      ) : (
        // ── PLAYING / PAUSED ──
        <section className="overflow-hidden rounded-3xl border border-indigo-400/20 bg-slate-950 shadow-2xl">
          {/* Top bar */}
          <div className="grid grid-cols-3 items-center gap-2 border-b border-white/10 bg-slate-900/90 px-3 py-2 sm:px-5">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Điểm</p>
                <p className={`text-lg font-black ${isDoubleScoreActive ? "text-yellow-300" : "text-cyan-300"}`}>
                  {score}
                  {isDoubleScoreActive ? " ×2" : ""}
                </p>
              </div>
              {combo > 1 && (
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-black text-violet-300">
                  ×{combo}
                </span>
              )}
            </div>

            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Tiến độ</p>
              <p className="text-xs font-bold text-white">{resolvedCount}/{sessionQuestionCount}</p>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] font-semibold text-amber-200/80">
                Tốc độ {BATTLE_SPEED_OPTIONS.find((option) => option.id === activeSpeed)?.label.toLocaleLowerCase()}
                {speedMode === "auto" ? " · tự động" : ""}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              {/* Lives */}
              <div className="flex gap-0.5" aria-label={`${lives} mạng`}>
                {Array.from({ length: INITIAL_LIVES }, (_, i) => (
                  <Heart
                    key={i}
                    className={`h-4 w-4 transition ${i < lives ? "fill-rose-400 text-rose-400" : "text-slate-700"}`}
                  />
                ))}
              </div>
              {shieldActive && (
                <span title="Lá chắn đang hoạt động">
                  <Shield className="h-4 w-4 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.9)]" />
                </span>
              )}
              {isFreezeActive && (
                <span title="Thời gian bị đóng băng">
                  <Timer className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                </span>
              )}
              {/* Pause / exit */}
              <button
                type="button"
                onClick={() => setPhase((p) => p === "paused" ? "playing" : "paused")}
                disabled={Boolean(saveError) || saving}
                className="ml-1 rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                {phase === "paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Arena */}
          <div className="relative h-[min(60vh,560px)] min-h-[380px] overflow-hidden bg-[radial-gradient(ellipse_at_22%_80%,rgba(88,28,135,0.42),transparent_48%),radial-gradient(ellipse_at_80%_12%,rgba(30,64,175,0.25),transparent_42%),linear-gradient(180deg,#0b102b,#161038_65%,#21113e)]">
            {/* Stars */}
            {Array.from({ length: 36 }, (_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute h-0.5 w-0.5 rounded-full bg-white/60"
                style={{
                  left: `${(i * 37 + 11) % 100}%`,
                  top: `${(i * 53 + 7) % 95}%`,
                  opacity: 0.2 + (i % 5) * 0.12,
                }}
              />
            ))}

            {/* Targets */}
            {targets.map((target) => (
              <TargetChip
                key={target.id}
                target={target}
                isLocked={lockedTargetId === target.id}
                isShot={lastShotId === target.id}
                hitFeedback={hitFeedback?.id === target.id ? hitFeedback.correct : null}
                answerMode={answerMode}
                onChoiceSelect={(option) => void resolveTargetRef.current(target, option)}
                onLock={() => setLockedTargetId(target.id)}
              />
            ))}

            {/* Projectiles */}
            {projectiles.map((p) => (
              <span
                key={p.id}
                aria-hidden="true"
                className="pointer-events-none absolute z-10 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_10px_4px_rgba(34,211,238,0.9)] transition-[left,top] duration-500 ease-out"
                style={{
                  left: `${p.launched ? p.targetX : p.x}%`,
                  top: `${p.launched ? p.targetY : p.y}%`,
                }}
              />
            ))}

            {/* Danger line */}
            <div className="absolute inset-x-0 bottom-[14%] border-t border-dashed border-rose-500/60" />

            {/* Player ship */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 text-center">
              <Rocket className="mx-auto h-8 w-8 rotate-[-90deg] fill-cyan-300 text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
            </div>

            {/* Paused overlay */}
            {phase === "paused" ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-center">
                  <h3 className="text-xl font-black text-white">
                    {saveError ? "Lỗi đồng bộ" : "Tạm dừng"}
                  </h3>
                  {saveError ? (
                    <>
                      <p role="alert" className="mt-2 text-sm text-rose-200">{saveError}</p>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={retryPendingAnswer}
                        className="mt-4 rounded-xl bg-cyan-300 px-5 py-2.5 font-bold text-slate-950 disabled:opacity-50"
                      >
                        Thử lại
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-slate-400">Trận đấu đang chờ bạn.</p>
                      <button
                        type="button"
                        onClick={() => setPhase("playing")}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 font-black text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-200 transition"
                      >
                        <Play className="h-4 w-4" /> Tiếp tục chiến đấu
                      </button>
                    </>
                  )}
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

          {/* Bottom: power-up bar + typing input */}
          <div className="border-t border-white/10 bg-slate-900/90 px-3 py-3 sm:px-5">
            {/* Power-up bar */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Vật phẩm</span>
              <div className="flex gap-1.5">
                {inventory.length === 0 ? (
                  <span className="text-[10px] text-slate-600">Không có vật phẩm</span>
                ) : (
                  inventory.map((slot, i) => {
                    const def = POWER_UP_CATALOG[slot.id];
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        title={`[${i + 1}] ${def?.nameVi ?? slot.id}: ${def?.description ?? ""}`}
                        onClick={() => activatePowerUp(slot.id)}
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300 active:scale-90"
                      >
                        {POWERUP_ICONS[slot.id] ?? <Sparkles className="h-4 w-4" />}
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white">
                          {slot.count}
                        </span>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-500">
                          {i + 1}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
                <span>⏱ {elapsedSeconds}s</span>
                <span className="font-semibold text-slate-400">{accuracy}% chính xác</span>
              </div>
            </div>

            {/* Typing input area (shown in typing mode) */}
            {answerMode === "typing" && (() => {
              const locked = targets.find((t) => t.id === lockedTargetId);
              const nearest = targets.length > 0
                ? targets.reduce((a, b) => (b.y > a.y ? b : a))
                : null;
              const active = locked ?? nearest;
              return active ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
                  <span className="text-xs text-slate-400 shrink-0">
                    {active.question.direction === "en-vi" ? "Nhập nghĩa tiếng Việt:" : "Nhập từ tiếng Anh:"}
                  </span>
                  <span className="flex-1 font-mono text-sm text-white">
                    {active.inputBuffer || <span className="text-slate-600">_</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (active.inputBuffer.trim()) {
                        setLockedTargetId(null);
                        setTypedAnswerSubmission({
                          target: active,
                          answer: active.inputBuffer.trim(),
                        });
                      }
                    }}
                    className="rounded-lg bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950 hover:bg-cyan-300"
                  >
                    Bắn ↵
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-600">Gõ để khóa mục tiêu gần nhất · Enter để bắn</p>
              );
            })()}

            {answerMode === "choice" && (
              <p className="text-[10px] text-slate-500">
                Nhấn <kbd className="rounded bg-slate-700 px-1 py-0.5 font-mono text-slate-300">A</kbd>
                <kbd className="rounded bg-slate-700 px-1 py-0.5 font-mono text-slate-300">B</kbd>
                <kbd className="rounded bg-slate-700 px-1 py-0.5 font-mono text-slate-300">C</kbd>
                <kbd className="rounded bg-slate-700 px-1 py-0.5 font-mono text-slate-300">D</kbd>
                {" "}hoặc bấm đáp án trên mục tiêu để bắn hạ
              </p>
            )}
          </div>
        </section>
      )}
      {/* ── MODAL CHỌN BỘ ĐỀ ── */}
      {isSetPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[85dvh] w-full max-w-md flex-col space-y-3 rounded-3xl border border-indigo-400/30 bg-slate-950 p-4 sm:p-5 shadow-2xl text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-indigo-400" />
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
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-9 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition focus:border-indigo-400"
              />
            </div>

            {/* Set List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[50dvh]">
              {isLoadingSet ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
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
                          ? "border-indigo-400 bg-indigo-950/60 font-bold text-indigo-200 shadow-sm"
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
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-400" />
                      ) : (
                        <span className="shrink-0 rounded-lg border border-indigo-400/30 px-2.5 py-1 text-xs font-bold text-indigo-300 hover:bg-indigo-400/10">
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
    </main>
  );
}

// ───────────────────────────────────────────────
// TargetChip sub-component
// ───────────────────────────────────────────────
interface TargetChipProps {
  target: FallingWord;
  isLocked: boolean;
  isShot: boolean;
  hitFeedback: boolean | null;
  answerMode: AnswerMode;
  onChoiceSelect: (option: string) => void;
  onLock: () => void;
}

function TargetChip({ target, isLocked, isShot, hitFeedback, answerMode, onChoiceSelect, onLock }: TargetChipProps) {
  const q = target.question;
  const feedbackClass =
    hitFeedback === true ? "ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" :
    hitFeedback === false ? "ring-2 ring-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.6)]" : "";
  const choiceLabels = ["A", "B", "C", "D"];

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-xl transition-all duration-200 ${target.color} ${isLocked ? "scale-105 ring-2 ring-white/60 z-10" : "z-0"} ${isShot ? "opacity-0 scale-150" : "opacity-100"} ${feedbackClass}`}
      style={{ left: `${target.x}%`, top: `${target.y}%`, minWidth: "160px", maxWidth: "240px" }}
    >
      {/* Direction badge */}
      <div className="absolute -top-2 left-2 rounded-full border border-white/20 bg-slate-900 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-400">
        {q.direction === "en-vi" ? "EN→VI" : "VI→EN"}
      </div>

      <div className="px-3 pt-3 pb-2 text-center">
        {/* Display term */}
        <p className="text-sm font-black leading-tight text-white">
          {q.displayTerm}
        </p>
        {q.phonetic && (
          <p className="text-[9px] text-white/50">{q.phonetic}</p>
        )}
        {q.partOfSpeech && (
          <p className="text-[9px] text-white/40 italic">{q.partOfSpeech}</p>
        )}
      </div>

      {/* Answer choices */}
      {answerMode === "choice" && (
        <div className="grid grid-cols-2 gap-1 px-2 pb-2">
          {q.options.map((option, i) => {
            const isEliminated = target.eliminatedOptions?.has(i) ?? false;
            return (
              <button
                key={i}
                type="button"
                disabled={isEliminated}
                onClick={() => onChoiceSelect(option)}
                className={`flex items-start gap-1 rounded-lg border px-1.5 py-1 text-left text-[10px] font-semibold transition active:scale-95 ${
                  isEliminated
                    ? "border-slate-700 bg-slate-800/50 text-slate-600 line-through cursor-not-allowed"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/25 hover:border-white/50"
                }`}
              >
                <span className="shrink-0 font-black opacity-70">{choiceLabels[i]}.</span>
                <span className="leading-tight">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Typing mode: show input buffer */}
      {answerMode === "typing" && (
        <div
          className="mx-2 mb-2 cursor-text rounded-lg border border-white/20 bg-black/30 px-2 py-1 text-center text-xs text-white/90 font-mono min-h-[26px]"
          onClick={onLock}
        >
          {target.inputBuffer || <span className="text-white/30">{isLocked ? "|" : "nhấn để gõ"}</span>}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
// Stat card
// ───────────────────────────────────────────────
function Stat({ label, value, isDark = true }: { label: string; value: string | number; isDark?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 text-left ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
      <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>{label}</p>
      <p className={`mt-1 text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
