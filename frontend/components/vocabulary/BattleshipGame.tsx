"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BookOpen, Check, CheckCircle2, ChevronDown, Crosshair, Flame, FolderKanban, Heart, HelpCircle, Layers, Loader2, Maximize2, Minimize2,
  Pause, Play, RotateCcw, Search, Shield, Sparkles, Volume2, VolumeX, X, Zap,
} from "lucide-react";
import type { VocabularyTestSet, WordItem } from "@/app/admin/content/vocabulary/types";
import {
  completeVocabularyGameSession,
  getVocabularySet,
  getVocabularySets,
  getVocabularySetSummaries,
  recordVocabularyAnswer,
  startVocabularyGameSession,
  type VocabularyGameSession,
} from "@/lib/api/vocabulary";
import {
  BATTLESHIP_CONFIG,
  type BattleAnswerResult,
  type BattleDifficulty,
  type BattleSetup,
  type BattleShip,
} from "./battleship/config";
import {
  calculateStars,
  compareLetters,
  generateFleet,
  questionTypeForWave,
  reinsertWrongWord,
  selectBattleWords,
  type BattleState,
} from "./battleship/engine";
import {
  buildBattleQuestion,
  type BattleQuestion,
} from "./battleship/questionGenerator";
import { ShipSvg } from "./battleship/ShipSvg";
import { soundEffects } from "./battleship/soundEffects";
import { getWordLevel, type WordLevelTag } from "./runner/wordSelector";

// CEFR Level options
const CEFR_LEVEL_OPTIONS: { level: WordLevelTag; label: string; desc: string }[] = [
  { level: "A1", label: "A1", desc: "Cơ bản" },
  { level: "A2", label: "A2", desc: "Sơ cấp" },
  { level: "B1", label: "B1", desc: "Trung cấp" },
  { level: "B2", label: "B2", desc: "Khá" },
  { level: "C1", label: "C1", desc: "Nâng cao" },
  { level: "C2", label: "C2", desc: "Thành thạo" },
  { level: "unclassified", label: "Khác", desc: "Mở rộng" },
];

interface BattleSessionRuntime {
  id: string;
  sessionId: string;
  state: BattleState;
  words: WordItem[];
  ships: BattleShip[];
  activeShipIndex: number;
  activeWave: number;
  playerHp: number;
  counterCharge: number;
  combo: number;
  maxCombo: number;
  score: number;
  correctCount: number;
  nearCount: number;
  wrongCount: number;
  questionIndex: number;
  timeRemaining: number;
  usedHintThisQuestion: boolean;
  hintsRemaining: number;
  currentQuestion: BattleQuestion | null;
  userInput: string;
  lastResult: {
    result: BattleAnswerResult;
    damage: number;
    isCritical: boolean;
    counterFired: boolean;
    studentAnswer: string;
    correctAnswer: string;
  } | null;
  wrongWords: WordItem[];
  startedAt: number;
  finishedSession: VocabularyGameSession | null;
}

export default function BattleshipGame({ setId }: { setId: string }) {
  // Navigation & Container refs
  const containerRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitAnswerRef = useRef<((answerToSubmit?: string, isTimeout?: boolean) => Promise<void>) | null>(null);
  const sessionRef = useRef<BattleSessionRuntime | null>(null);

  // General App State
  const [activeSetId, setActiveSetId] = useState<string>(setId);
  const [selectedSetId, setSelectedSetId] = useState<string>(setId);
  const [activeTestSet, setActiveTestSet] = useState<VocabularyTestSet | null>(null);
  const [availableSets, setAvailableSets] = useState<VocabularyTestSet[]>([]);
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [primaryWords, setPrimaryWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Preference Settings
  const [difficulty, setDifficulty] = useState<BattleDifficulty>("medium");
  const [deckScope, setDeckScope] = useState<"single_deck" | "all_decks">("single_deck");
  const [filterByLevel, setFilterByLevel] = useState<boolean>(false);
  const [selectedLevels, setSelectedLevels] = useState<WordLevelTag[]>([
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
    "unclassified",
  ]);
  const [soundMuted, setSoundMuted] = useState(false);
  const [tabMaximized, setTabMaximized] = useState(false);

  // Computed Word Pools
  const allSetsWords = useMemo(() => {
    return availableSets
      .map((set) => ({
        setId: set.id,
        words: (set.words ?? []).filter((w) => w.word?.trim()),
      }))
      .filter((set) => set.words.length > 0);
  }, [availableSets]);

  const allDeckWords = useMemo(() => {
    const list = allSetsWords.flatMap((set) => set.words);
    const seen = new Set<string>();
    return list.filter((w) => {
      const key = (w.word || "").toLowerCase().trim().replace(/[-\s]+/g, "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allSetsWords]);

  const isAllDecksSelected = deckScope === "all_decks" || activeSetId === "ALL";
  const baseWordPool = isAllDecksSelected
    ? (allDeckWords.length > 0 ? allDeckWords : primaryWords)
    : primaryWords;

  const availableWordPool = useMemo(() => {
    if (!filterByLevel) return baseWordPool;
    return baseWordPool.filter((w) => selectedLevels.includes(getWordLevel(w)));
  }, [baseWordPool, filterByLevel, selectedLevels]);

  const totalAllWordsCount = allDeckWords.length > 0 ? allDeckWords.length : primaryWords.length;

  // Game Runtime State
  const [session, setSession] = useState<BattleSessionRuntime | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [weakWordsReviewOpen, setWeakWordsReviewOpen] = useState(false);
  const [reviewWordIndex, setReviewWordIndex] = useState(0);

  // Visual Effects State
  const [firingProjectile, setFiringProjectile] = useState<"player" | "enemy" | null>(null);
  const [impactEffect, setImpactEffect] = useState<"hit" | "crit" | "miss" | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  // Filtered sets for picker modal
  const filteredSets = useMemo(() => {
    return availableSets.filter((s) => {
      if (!searchSetQuery.trim()) return true;
      const q = searchSetQuery.toLowerCase().trim();
      return (
        s.title?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    });
  }, [availableSets, searchSetQuery]);

  // 1. Load active set details
  useEffect(() => {
    if (activeSetId === "ALL") return;
    let active = true;
    setLoading(true);
    setSetupError(null);
    void getVocabularySet(activeSetId)
      .then((set) => {
        if (!active) return;
        setActiveTestSet(set);
        const usable = (set.words ?? []).filter((w) => w.word?.trim());
        setPrimaryWords(usable);
      })
      .catch((err) => {
        if (active) setSetupError(err instanceof Error ? err.message : "Không thể tải bộ từ vựng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [activeSetId]);

  // 2. Load all available sets & their details
  useEffect(() => {
    let active = true;
    soundEffects.setEnabled(!soundMuted);

    void getVocabularySets()
      .then(async (sets) => {
        if (!active || !Array.isArray(sets)) return;
        setAvailableSets(sets);

        // Load detailed sets to get full word list for all-decks mix
        const detailedSets = await Promise.all(
          sets.map(async (s) => {
            if (s.words && s.words.length > 0) return s;
            try {
              return await getVocabularySet(s.id);
            } catch {
              return s;
            }
          })
        );

        if (active) {
          setAvailableSets(detailedSets);
          if (activeSetId === "ALL") {
            const allWordsList = detailedSets
              .flatMap((s) => s.words ?? [])
              .filter((w) => w.word?.trim());
            setPrimaryWords(allWordsList);
            setActiveTestSet({
              id: "ALL",
              title: "Tất cả bộ đề (Toàn bộ kho từ)",
              category: "Kho từ vựng tổng hợp",
              wordCount: allWordsList.length,
              words: allWordsList,
            } as VocabularyTestSet);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load all vocabulary sets", err);
      });

    return () => { active = false; };
  }, [activeSetId, soundMuted]);

  // Deck change handler
  const handleSelectDeck = async (targetSet: VocabularyTestSet) => {
    if (targetSet.id === activeSetId) {
      setIsSetPickerOpen(false);
      return;
    }
    setIsLoadingSet(true);
    try {
      if (targetSet.id === "ALL") {
        const allWordsList = allDeckWords.length > 0
          ? allDeckWords
          : (primaryWords.length > 0 ? primaryWords : []);
        setActiveSetId("ALL");
        setSelectedSetId("ALL");
        setDeckScope("all_decks");
        setActiveTestSet({
          id: "ALL",
          title: "Tất cả bộ đề (Toàn bộ kho từ)",
          category: "Kho từ vựng tổng hợp",
          wordCount: allWordsList.length,
          words: allWordsList,
        } as VocabularyTestSet);
        setPrimaryWords(allWordsList);
        setIsSetPickerOpen(false);

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("setId", "ALL");
          window.history.replaceState({}, "", url.toString());
        }
        return;
      }

      let fullSet = targetSet;
      if (!fullSet.words || fullSet.words.length === 0) {
        fullSet = await getVocabularySet(targetSet.id);
      }
      const usable = (fullSet.words ?? []).filter((w: WordItem) => w.word?.trim());
      setActiveSetId(fullSet.id);
      setSelectedSetId(fullSet.id);
      setActiveTestSet(fullSet);
      setPrimaryWords(usable);
      setIsSetPickerOpen(false);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("setId", fullSet.id);
        window.history.replaceState({}, "", url.toString());
      }
    } catch (err) {
      console.error("Failed to load deck:", err);
    } finally {
      setIsLoadingSet(false);
    }
  };

  // Sync mute state with sound effects synthesizer
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundEffects.setEnabled(!next);
  };

  // Keyboard shortcut handlers (1..4 for Easy options, Enter for Submit, Esc for exit/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!session || session.state === "LOBBY" || session.state === "RESULT") return;

      if (e.key === "Escape") {
        setConfirmExitOpen(true);
      } else if (e.key === "p" || e.key === "P") {
        if (session.state === "AIMING" || session.state === "QUESTION") {
          setIsPaused((prev) => !prev);
        }
      } else if (e.key === "f" || e.key === "F") {
        // Toggle tab maximize
        if (document.activeElement?.tagName !== "INPUT") {
          setTabMaximized((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session]);

  const currentGameState = session?.state;
  const currentQuestionIndex = session?.questionIndex;
  const currentHintState = session?.usedHintThisQuestion;

  // Soft Timer countdown effect (20 seconds soft timer per question)
  useEffect(() => {
    if (isPaused || currentGameState !== "QUESTION") return;

    const timer = setInterval(() => {
      const current = sessionRef.current;
      if (!current || current.state !== "QUESTION") return;
      if (current.timeRemaining <= 1) {
        void submitAnswerRef.current?.("__TIMEOUT__", true);
        return;
      }
      setSession((prev) => prev?.state === "QUESTION"
        ? { ...prev, timeRemaining: prev.timeRemaining - 1 }
        : prev);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentGameState, currentHintState, currentQuestionIndex, isPaused]);

  // Active target ship
  const activeShip = useMemo(() => {
    if (!session) return null;
    return session.ships[session.activeShipIndex] ?? null;
  }, [session]);

  // Total Fleet HP Remaining
  const fleetHpRemaining = useMemo(() => {
    if (!session) return 12;
    return session.ships.reduce((sum, s) => sum + Math.max(0, s.hp), 0);
  }, [session]);

  // Start a new Battle Session
  const startBattle = async () => {
    if (availableWordPool.length === 0) return;
    if (isAllDecksSelected && availableSets.length === 0) {
      setSetupError("Không tải được danh sách bộ đề. Vui lòng thử lại trước khi chơi trộn.");
      return;
    }
    setLoading(true);
    setSetupError(null);
    setCompletionError(null);
    setSubmissionError(null);

    try {
      // 1. Gather word candidates based on deckScope
      let decks: { id: string; words: WordItem[] }[] = [];

      if (!isAllDecksSelected) {
        decks = [{ id: activeSetId, words: primaryWords }];
      } else {
        decks = availableSets.map((deck) => ({
          id: deck.id,
          words: deck.words ?? [],
        }));
        if (decks.length === 0) {
          decks = [{ id: "all", words: availableWordPool }];
        }
      }

      const selectedWords = selectBattleWords({
        decks,
        primaryDeckId: activeSetId === "ALL" ? (availableSets[0]?.id || "ALL") : activeSetId,
        setup: {
          mode: isAllDecksSelected ? "all_decks" : "single_deck",
          deckScope,
          filterByLevel,
          selectedLevels,
          difficulty,
          questionCount: BATTLESHIP_CONFIG.MAX_QUESTIONS_PER_SESSION,
          challenge: "mixed",
          seed: crypto.getRandomValues(new Uint32Array(1))[0],
        },
      }).words;

      if (selectedWords.length === 0) {
        throw new Error("Không có từ vựng nào phù hợp với bộ lọc đã chọn.");
      }

      const wordPool = isAllDecksSelected ? allDeckWords : primaryWords;
      const deckIds = new Set(
        isAllDecksSelected
          ? [activeSetId, ...availableSets.map((d) => d.id), ...selectedWords.map((w) => w.setId).filter((id): id is string => !!id)]
          : [activeSetId, ...selectedWords.map((w) => w.setId).filter((id): id is string => !!id)]
      );

      // 2. Initialize fleet: 3 waves (3 Patrol, 2 Destroyer, 1 Boss)
      const ships = generateFleet(20);

      // 3. Request backend game session
      const backendSession = await startVocabularyGameSession({
        setId: activeSetId === "ALL" ? (availableSets[0]?.id || "unknown") : activeSetId,
        gameType: "BATTLE",
        deckIds: [...deckIds],
      });

      // 4. Generate first question
      const firstQType = questionTypeForWave(1, 0);
      const firstQuestion = buildBattleQuestion(selectedWords[0], 0, firstQType, difficulty, wordPool);

      const runtime: BattleSessionRuntime = {
        id: crypto.randomUUID(),
        sessionId: backendSession.id,
        state: "QUESTION",
        words: selectedWords,
        ships,
        activeShipIndex: 0,
        activeWave: 1,
        playerHp: BATTLESHIP_CONFIG.PLAYER_START_HP,
        counterCharge: 0,
        combo: 0,
        maxCombo: 0,
        score: 0,
        correctCount: 0,
        nearCount: 0,
        wrongCount: 0,
        questionIndex: 0,
        timeRemaining: BATTLESHIP_CONFIG.SOFT_TIME_LIMIT_SECONDS,
        usedHintThisQuestion: false,
        hintsRemaining: BATTLESHIP_CONFIG.HINT_USES,
        currentQuestion: firstQuestion,
        userInput: "",
        lastResult: null,
        wrongWords: [],
        startedAt: Date.parse(backendSession.startedAt),
        finishedSession: null,
      };

      setSession(runtime);
      setIsPaused(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Không thể bắt đầu trận đấu.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeBattle = async (sessionId: string) => {
    setIsFinalizing(true);
    setCompletionError(null);
    try {
      const finalized = await completeVocabularyGameSession(sessionId);
      setSession((prev) => (prev ? { ...prev, finishedSession: finalized, state: "RESULT" } : null));
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : "Không thể lưu kết quả trận đấu.");
      setSession((prev) => (prev ? { ...prev, state: "RESULT" } : null));
    } finally {
      setIsFinalizing(false);
    }
  };

  // Submit Answer (with authoritative server call)
  const handleAnswerSubmit = async (answerToSubmit?: string, isTimeout = false) => {
    if (!session || session.state !== "QUESTION") return;
    const currentQ = session.currentQuestion;
    if (!currentQ) return;

    const answer = isTimeout ? "" : (answerToSubmit ?? session.userInput).trim();
    if (!isTimeout && !answer) return;

    setSubmissionError(null);
    setSession((prev) => (prev ? { ...prev, state: "SUBMITTING" } : null));

    try {
      // 1. Visual trigger: Player cannon fire
      setFiringProjectile("player");
      soundEffects.playCannon(session.combo >= 4);

      // 2. Post answer to authoritative server endpoint
      const response = await recordVocabularyAnswer({
        requestId: crypto.randomUUID(),
        wordId: currentQ.wordId,
        activityType: "GAME",
        questionType: currentQ.type === "blank" || currentQ.type === "context"
          ? "FILL_IN_BLANK"
          : currentQ.type === "audio"
          ? "AUDIO"
          : currentQ.type === "definition"
          ? "TYPE_WORD"
          : "VIETNAMESE_TO_ENGLISH",
        answer: isTimeout ? undefined : answer,
        result: isTimeout ? "timeout" : undefined,
        responseTimeMs: isTimeout
          ? BATTLESHIP_CONFIG.SOFT_TIME_LIMIT_SECONDS * 1000
          : (BATTLESHIP_CONFIG.SOFT_TIME_LIMIT_SECONDS - session.timeRemaining) * 1000,
        gameSessionId: session.sessionId,
        gameQuestionIndex: session.questionIndex,
        usedHint: session.usedHintThisQuestion,
        enemyType: activeShip?.type ?? "patrol",
      });

      // Server returns authoritative results
      const damage = response.damage ?? 0;
      const isCritical = response.isCritical ?? false;
      const isCorrect = response.correct && response.result === "correct";
      const isNear = response.result === "near";
      const isWrong = !isCorrect && !isNear;
      const serverPlayerHp = response.playerHp ?? session.playerHp;
      const serverFleetHp = response.enemyHp ?? fleetHpRemaining;
      const counterFired = (response.counterCharge ?? 0) === 0 && (response.playerHp ?? session.playerHp) < session.playerHp;

      // 3. Trigger Impact & SFX
      setTimeout(() => {
        setFiringProjectile(null);
        if (damage > 0) {
          setImpactEffect(isCritical ? "crit" : "hit");
          soundEffects.playHit(isCritical);
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 300);
        } else if (isNear) {
          setImpactEffect("miss");
          soundEffects.playSplash();
        } else {
          setImpactEffect("miss");
          soundEffects.playSplash();
        }

        if (counterFired) {
          setTimeout(() => {
            setFiringProjectile("enemy");
            soundEffects.playCounterWarning();
            setScreenShake(true);
            setTimeout(() => {
              setFiringProjectile(null);
              setScreenShake(false);
            }, 400);
          }, 400);
        }
      }, 350);

      // 4. Update Ships HP & Wave Progression
      const updatedShips = [...session.ships];
      let remainingDmg = damage;
      let activeIndex = session.activeShipIndex;

      while (remainingDmg > 0 && activeIndex < updatedShips.length) {
        const cur = updatedShips[activeIndex];
        const absorb = Math.min(cur.hp, remainingDmg);
        updatedShips[activeIndex] = { ...cur, hp: cur.hp - absorb };
        remainingDmg -= absorb;
        if (updatedShips[activeIndex].hp <= 0 && activeIndex + 1 < updatedShips.length) {
          activeIndex++;
        }
      }

      // Determine active wave
      const activeShipAfterDmg = updatedShips[activeIndex];
      const activeWave = activeShipAfterDmg ? activeShipAfterDmg.waveNumber : 3;

      // Track wrong words for spaced review & reinsertion
      let updatedWords = [...session.words];
      const updatedWrongWords = [...session.wrongWords];
      if (isWrong || isTimeout) {
        updatedWrongWords.push(currentQ.word);
        updatedWords = reinsertWrongWord(updatedWords, session.questionIndex, currentQ.word);
      }

      const nextQuestionIndex = session.questionIndex + 1;
      const isFleetDefeated = serverFleetHp <= 0 || updatedShips.every((s) => s.hp <= 0);
      const isPlayerDefeated = serverPlayerHp <= 0 || nextQuestionIndex >= BATTLESHIP_CONFIG.MAX_QUESTIONS_PER_SESSION;
      const isMatchOver = isFleetDefeated || isPlayerDefeated;

      // Update state to RESOLVE
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          state: isMatchOver ? (isFleetDefeated ? "VICTORY" : "DEFEAT") : "RESOLVE",
          ships: updatedShips,
          activeShipIndex: activeIndex,
          activeWave,
          playerHp: serverPlayerHp,
          counterCharge: response.counterCharge ?? 0,
          combo: response.combo ?? 0,
          maxCombo: Math.max(prev.maxCombo, response.combo ?? 0),
          score: response.score ?? prev.score,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          nearCount: prev.nearCount + (isNear ? 1 : 0),
          wrongCount: prev.wrongCount + (isWrong || isTimeout ? 1 : 0),
          words: updatedWords,
          wrongWords: updatedWrongWords,
          lastResult: {
            result: isCorrect ? "correct" : isNear ? "near" : isTimeout ? "timeout" : "wrong",
            damage,
            isCritical,
            counterFired,
            studentAnswer: answer,
            correctAnswer: response.correctAnswer,
          },
        };
      });

      // 5. Finalize Session if match is over
      if (isMatchOver) {
        if (isFleetDefeated) {
          soundEffects.playVictory();
        } else {
          soundEffects.playDefeat();
        }
        await finalizeBattle(session.sessionId);
      } else {
        // Advance to next question after 1.1s feedback
        setTimeout(() => {
          setSession((prev) => {
            if (!prev || prev.state !== "RESOLVE") return prev;
            const nextWord = prev.words[nextQuestionIndex];
            if (!nextWord) return prev;

            const nextQType = questionTypeForWave(activeWave, nextQuestionIndex);
            const nextQ = buildBattleQuestion(nextWord, nextQuestionIndex, nextQType, difficulty, prev.words);

            return {
              ...prev,
              state: "QUESTION",
              questionIndex: nextQuestionIndex,
              timeRemaining: BATTLESHIP_CONFIG.SOFT_TIME_LIMIT_SECONDS,
              usedHintThisQuestion: false,
              currentQuestion: nextQ,
              userInput: "",
              lastResult: null,
            };
          });
          setTimeout(() => inputRef.current?.focus(), 80);
        }, 1100);
      }
    } catch (err) {
      console.error("Answer submission failed", err);
      setSession((prev) => (prev ? { ...prev, state: "QUESTION" } : null));
      setSubmissionError(err instanceof Error ? err.message : "Không thể gửi câu trả lời lên máy chủ.");
    }
  };

  const retryBattleFinalization = () => {
    if (session) void finalizeBattle(session.sessionId);
  };

  useEffect(() => {
    sessionRef.current = session;
    submitAnswerRef.current = handleAnswerSubmit;
  });

  // Hint activation
  const handleUseHint = () => {
    if (!session || session.hintsRemaining <= 0 || session.usedHintThisQuestion) return;
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        hintsRemaining: prev.hintsRemaining - 1,
        usedHintThisQuestion: true,
      };
    });
  };

  // Exit match confirmation
  const handleExitMatch = () => {
    setConfirmExitOpen(false);
    setSession(null);
    setIsPaused(false);
  };

  // Letter diff visualizer for wrong answers
  const renderLetterDiff = (student: string, expected: string) => {
    const diff = compareLetters(student, expected);
    const expectedChars = [...expected];
    return (
      <div className="flex items-center gap-1 font-mono text-sm tracking-wider mt-1.5 flex-wrap justify-center">
        {diff.map((status, idx) => (
          <span
            key={idx}
            className={`px-1.5 py-0.5 rounded text-xs font-bold ${
              status === "match"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-red-500/20 text-red-400 border border-red-500/40"
            }`}
          >
            {expectedChars[idx] || "·"}
          </span>
        ))}
        <span className="text-slate-400 text-xs mx-1">→</span>
        <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
          {expected}
        </span>
      </div>
    );
  };

  // RENDER: Loading or Error
  if (loading && !session) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-slate-950 text-slate-100 rounded-3xl p-8 border border-slate-800">
        <Crosshair className="w-12 h-12 text-sky-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-wide">Đang chuẩn bị chiến hạm...</h2>
        <p className="text-sm text-slate-400 mt-2">Đang tải kho từ vựng và thiết lập hạm đội</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-slate-950 text-slate-100 transition-all duration-300 overflow-hidden ${
        tabMaximized
          ? "fixed inset-0 z-50 rounded-none w-screen h-screen"
          : "w-full max-w-5xl mx-auto rounded-3xl border border-slate-800 shadow-2xl min-h-[640px]"
      }`}
    >
      {/* Background Naval Radar / Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Top Universal Navbar */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (session && session.state !== "LOBBY" && session.state !== "RESULT") {
                setConfirmExitOpen(true);
              } else {
                setSession(null);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors text-xs font-semibold border border-slate-700"
            title="Thoát trận đấu"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Thoát</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="font-bold text-sm sm:text-base tracking-wide bg-gradient-to-r from-sky-400 to-cyan-200 bg-clip-text text-transparent">
              BATTLESHIP VOCABULARY
            </h1>
            <span className="hidden md:inline-block text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800">
              ĐẠI CHIẾN CHIẾN HẠM
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {session && session.state !== "LOBBY" && session.state !== "RESULT" && (
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title={isPaused ? "Tiếp tục" : "Tạm dừng"}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={soundMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            onClick={() => setTabMaximized((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={tabMaximized ? "Thu nhỏ về khung" : "Phóng to vừa tab trình duyệt"}
          >
            {tabMaximized ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Exit Confirmation Modal */}
      {confirmExitOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <Shield className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-100">Rời khỏi trận chiến?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Tiến trình của lượt chơi hiện tại chưa hoàn thành sẽ kết thúc và không thể tiếp tục.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setConfirmExitOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
              >
                Tiếp tục chơi
              </button>
              <button
                onClick={handleExitMatch}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-900/40"
              >
                Thoát trận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Surface */}
      <main className="relative flex-1 flex flex-col justify-between overflow-y-auto">
        {/* =======================================================
            VIEW 1: LOBBY & DECK SELECTION
            ======================================================= */}
        {!session || session.state === "LOBBY" ? (
          <div className="max-w-3xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-6 my-auto">
            {/* Hero Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/80 text-sky-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Hải Trình Từ Vựng TOEIC
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Chiến Hạm Từ Vựng – Sẵn Sàng Khai Hỏa
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-lg mx-auto">
                Hạ gục 3 đợt hạm đội địch bằng vốn từ vựng chuẩn xác. Mỗi câu trả lời đúng là một phát đại bác uy lực!
              </p>
            </div>

            {setupError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs text-center font-medium">
                {setupError}
              </div>
            )}

            {/* 0. Bộ đề đang chọn */}
            <div className="flex items-center justify-between rounded-2xl border border-sky-500/30 bg-slate-900/90 p-3 sm:p-4 shadow-lg shadow-sky-950/40">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 text-sky-300">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Bộ đề đang chọn</p>
                  <p className="truncate text-sm font-extrabold sm:text-base text-white">
                    {activeTestSet?.title || "Đang tải bộ đề..."}
                  </p>
                  <p className="text-xs text-slate-400">
                    {activeTestSet?.category || "Từ vựng TOEIC"} · {activeTestSet?.words?.length || activeTestSet?.wordCount || primaryWords.length} từ khả dụng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(true)}
                className="ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/20 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/30 transition active:scale-95 sm:px-4 sm:text-sm"
              >
                <span>Đổi bộ đề</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Mode & Deck Selection */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
              {/* 1. Phạm vi từ vựng */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <BookOpen className="h-4 w-4 text-sky-400" /> Phạm vi từ vựng
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeckScope("single_deck")}
                    className={`rounded-xl border p-3 text-left transition ${
                      deckScope === "single_deck"
                        ? "border-sky-400 bg-sky-500/15 text-sky-200 shadow-sm"
                        : "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <p className="text-xs font-bold sm:text-sm">📚 Bộ đề hiện tại</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {primaryWords.length} từ trong bộ đã chọn
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeckScope("all_decks")}
                    className={`rounded-xl border p-3 text-left transition ${
                      deckScope === "all_decks"
                        ? "border-sky-400 bg-sky-500/15 text-sky-200 shadow-sm"
                        : "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <p className="text-xs font-bold sm:text-sm">🗂 Trộn tất cả bộ đề</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {totalAllWordsCount} từ từ mọi bộ đề
                    </p>
                  </button>
                </div>
              </div>

              {/* 1b. Lọc theo cấp độ CEFR (độc lập với phạm vi) */}
              <div>
                <button
                  type="button"
                  onClick={() => setFilterByLevel((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                    filterByLevel
                      ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-sm"
                      : "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold sm:text-sm">🎯 Lọc theo cấp độ CEFR</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {filterByLevel
                        ? `Áp dụng trên ${deckScope === "all_decks" ? "toàn bộ kho từ" : "bộ đề đã chọn"}`
                        : "Bấm để bật lọc theo cấp CEFR"}
                    </p>
                  </div>
                  <span className={`ml-3 shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                    filterByLevel
                      ? "border-cyan-400 bg-cyan-500 text-slate-950 font-black"
                      : "border-slate-700 text-slate-400"
                  }`}>
                    {filterByLevel ? "Đang bật" : "Tắt"}
                  </span>
                </button>

                {/* CEFR Level Multi-selector */}
                {filterByLevel && (
                  <div className="mt-2.5 rounded-2xl border border-cyan-400/20 bg-slate-900/90 p-3 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">Chọn thang cấp độ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedLevels.length === 7) {
                            setSelectedLevels(["B1"]);
                          } else {
                            setSelectedLevels(["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"]);
                          }
                        }}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-200"
                      >
                        {selectedLevels.length === 7 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                      {CEFR_LEVEL_OPTIONS.map(({ level, label, desc }) => {
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
                                ? "border-cyan-400 bg-cyan-500/25 text-cyan-100 shadow-sm"
                                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span className="text-xs font-black">{label}</span>
                            <span className={`text-[9px] ${isSelected ? "text-cyan-200" : "text-slate-500"}`}>
                              {desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty Selection */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Chọn Độ Khó Chiến Đấu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "easy", label: "Dễ (Trắc nghiệm)", desc: "4 lựa chọn A, B, C, D" },
                    { key: "medium", label: "Vừa (Điền từ)", desc: "Gợi ý chữ cái đầu & số ký tự" },
                    { key: "hard", label: "Khó (Chuyên sâu)", desc: "Gõ từ tự do không gợi ý" },
                  ].map((diff) => (
                    <button
                      key={diff.key}
                      onClick={() => setDifficulty(diff.key as BattleDifficulty)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                        difficulty === diff.key
                          ? "bg-sky-950/80 border-sky-400 text-slate-100 shadow-md shadow-sky-900/30"
                          : "bg-slate-800/50 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-xs font-bold">{diff.label}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{diff.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fleet Rules Card & Quick Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-left">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-sky-300 font-bold">Từ vựng khả dụng</p>
                  <p className="mt-1 text-sm font-black text-white">{availableWordPool.length} từ</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-sky-300 font-bold">Máu chiến hạm</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-black text-rose-400">
                    <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> 5 HP
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-sky-300 font-bold">Quy mô hạm đội</p>
                  <p className="mt-1 text-sm font-black text-white">12 HP (3 đợt)</p>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>
                    Chiến hạm: <strong className="text-slate-200">5 HP</strong> · Hạm đội: <strong className="text-slate-200">12 HP (3 đợt)</strong> · Tối đa <strong className="text-slate-200">20 câu</strong>
                  </span>
                </div>
                <button
                  onClick={() => setTutorialOpen(true)}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 text-xs font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Hướng dẫn
                </button>
              </div>

              {availableWordPool.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs text-center font-medium">
                  ⚠️ Không tìm thấy từ vựng nào khớp với bộ đề và cấp độ CEFR đã chọn. Vui lòng chọn thêm cấp độ hoặc đổi bộ đề.
                </div>
              ) : (
                /* Start Button */
                <button
                  onClick={startBattle}
                  className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Crosshair className="w-4 h-4" />
                  VÀO TRẬN CHIẾN HẠM
                </button>
              )}
            </div>
          </div>
        ) : session.state === "RESULT" ? (
          /* =======================================================
              VIEW 2: RESULT & STAR RATING
              ======================================================= */
          <div className="max-w-2xl mx-auto w-full p-4 sm:p-8 flex flex-col items-center justify-center my-auto text-center animate-in zoom-in-95">
            {(session.finishedSession?.won ?? fleetHpRemaining <= 0) ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-4 text-emerald-400 shadow-xl shadow-emerald-950/50">
                <Sparkles className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mb-4 text-red-400 shadow-xl shadow-red-950/50">
                <X className="w-8 h-8" />
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {(session.finishedSession?.won ?? fleetHpRemaining <= 0) ? "CHIẾN HẠM TOÀN THẮNG!" : "CHIẾN HẠM THẤT THỦ!"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
              {(session.finishedSession?.won ?? fleetHpRemaining <= 0)
                ? "Toàn bộ hạm đội địch đã bị bắn chìm! Bạn đã làm chủ kho từ vựng xuất sắc."
                : (session.finishedSession?.playerHpRemaining ?? session.playerHp) <= 0
                ? "Chiến hạm của bạn đã bị hạm đội địch đánh chìm. Hãy củng cố từ vựng để phục thù!"
                : "Hết 20 câu hỏi nhưng hạm đội địch vẫn chưa bị tiêu diệt hết. Cố gắng nâng cao độ chính xác!"}
            </p>

            {/* Star Rating Badge */}
            <div className="flex items-center gap-2 my-5">
              {(() => {
                const totalQuestions = session.finishedSession?.totalQuestions ?? session.questionIndex + 1;
                const accuracy = (session.correctCount / Math.max(1, totalQuestions)) * 100;
                const won = session.finishedSession?.won ?? fleetHpRemaining <= 0;
                const starCount = session.finishedSession?.stars ?? (won ? calculateStars(accuracy, session.playerHp) : 0);
                return Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-3xl transition-all duration-300 ${
                      i < starCount
                        ? "text-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                        : "text-slate-700"
                    }`}
                  >
                    ★
                  </span>
                ));
              })()}
            </div>

            {completionError && (
              <div role="alert" className="mb-4 w-full rounded-xl border border-red-800 bg-red-950/60 p-3 text-left text-xs text-red-300">
                <p>{completionError}</p>
                <button
                  type="button"
                  disabled={isFinalizing}
                  onClick={retryBattleFinalization}
                  className="mt-2 rounded-lg bg-red-900/70 px-3 py-1.5 font-semibold text-red-100 disabled:opacity-50"
                >
                  {isFinalizing ? "Đang lưu kết quả..." : "Thử lưu kết quả lại"}
                </button>
              </div>
            )}

            {/* Match Stats Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left mb-6 shadow-xl">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">ĐIỂM SỐ</span>
                <p className="text-lg font-bold text-sky-400">{session.finishedSession?.score ?? session.score}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">ĐỘ CHÍNH XÁC</span>
                <p className="text-lg font-bold text-emerald-400">
                  {Math.round((session.correctCount / Math.max(1, session.finishedSession?.totalQuestions ?? session.questionIndex + 1)) * 100)}%
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">COMBO TỐI ĐA</span>
                <p className="text-lg font-bold text-amber-400">{session.finishedSession?.maxCombo ?? session.maxCombo}x</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono">HP CÒN LẠI</span>
                <p className="text-lg font-bold text-red-400">{session.finishedSession?.playerHpRemaining ?? session.playerHp}/5</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 w-full max-w-lg">
              {session.wrongWords.length > 0 && (
                <button
                  onClick={() => {
                    setReviewWordIndex(0);
                    setWeakWordsReviewOpen(true);
                  }}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ôn từ sai ngay ({session.wrongWords.length})
                </button>
              )}
              <button
                onClick={startBattle}
                className="w-full sm:flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-950 flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Chơi lại trận này
              </button>
              <button
                type="button"
                onClick={() => setIsSetPickerOpen(true)}
                className="w-full sm:flex-1 py-3 rounded-xl border border-sky-500/40 bg-sky-950/60 hover:bg-sky-900/60 text-sky-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                Đổi bộ đề
              </button>
              <button
                type="button"
                onClick={() => setSession(null)}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors text-center"
              >
                Phòng chờ
              </button>
              <Link
                href="/vocabulary/games"
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors text-center"
              >
                Game Center
              </Link>
            </div>
          </div>
        ) : (
          /* =======================================================
              VIEW 3: 2D TOP-DOWN NAVAL BATTLE ARENA
              ======================================================= */
          <div className="relative flex-1 flex flex-col justify-between p-3 sm:p-5">
            {/* Top Battle HUD */}
            <div className="relative z-10 flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-lg">
              {/* Left: Wave & Question Index */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {session.activeWave === 1
                      ? "ĐỢT 1: TUẦN TRA"
                      : session.activeWave === 2
                      ? "ĐỢT 2: KHU TRỤC"
                      : "ĐỢT 3: BOSS HẠM"}
                  </span>
                  <span className="text-xs font-bold text-sky-400">
                    Câu {session.questionIndex + 1}/{BATTLESHIP_CONFIG.MAX_QUESTIONS_PER_SESSION}
                  </span>
                </div>
              </div>

              {/* Center: Soft Timer Circular Ring */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="16" cy="16" r="13" stroke="#1e293b" strokeWidth="2.5" fill="none" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      stroke={
                        session.timeRemaining <= 5
                          ? "#ef4444"
                          : session.timeRemaining <= 10
                          ? "#f59e0b"
                          : "#38bdf8"
                      }
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray={81.68}
                      strokeDashoffset={
                        81.68 - (81.68 * session.timeRemaining) / BATTLESHIP_CONFIG.SOFT_TIME_LIMIT_SECONDS
                      }
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span
                    className={`absolute text-[10px] font-mono font-bold ${
                      session.timeRemaining <= 5 ? "text-red-400 animate-pulse" : "text-slate-300"
                    }`}
                  >
                    {session.timeRemaining}
                  </span>
                </div>
              </div>

              {/* Right: Streak & Score */}
              <div className="flex items-center gap-4">
                {session.combo > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{session.combo}x</span>
                  </div>
                )}
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">ĐIỂM</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-100">{session.score}</span>
                </div>
              </div>
            </div>

            {/* Naval Combat Waters Area */}
            <div
              className={`relative flex-1 flex flex-col justify-between my-2 rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950/90 border border-slate-800/60 p-4 overflow-hidden transition-transform ${
                screenShake ? "translate-x-1 translate-y-1" : ""
              }`}
            >
              {/* 1. TOP ZONE: ENEMY FLEET */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-6 sm:gap-10 my-2">
                  {session.ships
                    .filter((ship) => ship.waveNumber === session.activeWave)
                    .map((ship) => (
                      <ShipSvg
                        key={ship.id}
                        type={ship.type}
                        hp={ship.hp}
                        maxHp={ship.maxHp}
                        isTarget={activeShip?.id === ship.id}
                        isHit={impactEffect === "hit" && activeShip?.id === ship.id}
                        isDestroyed={ship.hp <= 0}
                      />
                    ))}
                </div>

                {/* Enemy Counter-Attack Gauge (2 Cells) */}
                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-xs mt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Nạp đạn địch:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3 h-3 rounded border transition-all ${
                        session.counterCharge >= 1
                          ? "bg-red-500 border-red-400 shadow-sm shadow-red-500 animate-pulse"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    />
                    <span
                      className={`w-3 h-3 rounded border transition-all ${
                        session.counterCharge >= 2
                          ? "bg-red-500 border-red-400 shadow-sm shadow-red-500 animate-pulse"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 2. MIDFIELD: PROJECTILE & COMBAT EFFECTS */}
              <div className="relative flex-1 min-h-[90px] flex items-center justify-center pointer-events-none">
                {/* Aiming Laser Reticle from Player to Target */}
                {session.state === "QUESTION" && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-0.5 h-full bg-gradient-to-b from-red-500 via-sky-400 to-transparent border-dashed" />
                  </div>
                )}

                {/* Player Shell Shooting Upwards */}
                {firingProjectile === "player" && (
                  <div className="absolute w-3 h-8 bg-sky-300 rounded-full blur-[1px] shadow-[0_0_15px_#38bdf8] animate-in fade-in slide-in-from-bottom duration-300" />
                )}

                {/* Enemy Torpedo Shooting Downwards */}
                {firingProjectile === "enemy" && (
                  <div className="absolute w-3 h-8 bg-red-500 rounded-full blur-[1px] shadow-[0_0_15px_#ef4444] animate-in fade-in slide-in-from-top duration-300" />
                )}

                {/* Hit / Critical Strike Banner */}
                {impactEffect && (
                  <div className="absolute z-30 flex flex-col items-center animate-in zoom-in-75 duration-200">
                    {impactEffect === "crit" && (
                      <span className="px-4 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/50">
                        ⚡ BẮN CHÍ MẠNG! -2 HP ⚡
                      </span>
                    )}
                    {impactEffect === "hit" && (
                      <span className="px-3 py-1 rounded-full bg-sky-500 text-slate-950 font-bold text-xs uppercase shadow-lg shadow-sky-500/50">
                        BẮN TRÚNG! -1 HP
                      </span>
                    )}
                    {impactEffect === "miss" && (
                      <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 font-bold text-xs uppercase">
                        BẮN TRƯỢT / GẦN ĐÚNG
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3. BOTTOM ZONE: PLAYER WARSHIP */}
              <div className="flex flex-col items-center">
                <ShipSvg
                  type="player"
                  isHit={firingProjectile === "enemy"}
                />

                {/* Player Hull HP Indicators (5 HP) */}
                <div className="flex items-center gap-1.5 mt-2 bg-slate-950/90 px-3 py-1 rounded-full border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Vỏ tàu:</span>
                  {Array.from({ length: BATTLESHIP_CONFIG.PLAYER_START_HP }).map((_, idx) => (
                    <Heart
                      key={idx}
                      className={`w-3.5 h-3.5 transition-colors ${
                        idx < session.playerHp ? "text-red-500 fill-red-500" : "text-slate-700"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono font-bold text-red-400 ml-1">{session.playerHp}/5</span>
                </div>
              </div>
            </div>

            {/* Bottom Question Interaction Box (Thumb Zone) */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
              {/* Question Header & Type Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 uppercase tracking-wider">
                  {session.currentQuestion?.type === "meaning"
                    ? "Nghĩa tiếng Việt"
                    : session.currentQuestion?.type === "definition"
                    ? "Định nghĩa tiếng Anh"
                    : session.currentQuestion?.type === "blank"
                    ? "Điền vào chỗ trống"
                    : session.currentQuestion?.type === "audio"
                    ? "Thử thách phát âm"
                    : "Tình huống TOEIC"}
                </span>

                {/* Hint Button */}
                <button
                  onClick={handleUseHint}
                  disabled={session.hintsRemaining <= 0 || session.usedHintThisQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gợi ý (-5đ) ({session.hintsRemaining}/3)
                </button>
              </div>

              {/* Prompt Text */}
              <div className="text-center my-2">
                <p className="text-sm sm:text-base md:text-lg font-bold text-slate-100">
                  {session.currentQuestion?.prompt}
                </p>
                {session.currentQuestion?.promptMeta.contextNote && (
                  <p className="text-xs text-slate-400 mt-1">
                    {session.currentQuestion.promptMeta.contextNote}
                  </p>
                )}

                {/* Revealed Hint (If hint used) */}
                {session.usedHintThisQuestion && (
                  <p className="text-xs font-mono text-amber-400 font-bold mt-1.5 animate-in fade-in">
                    Chữ cái đầu: &quot;{session.currentQuestion?.promptMeta.firstLetter}&quot; ({session.currentQuestion?.promptMeta.wordLength} ký tự)
                  </p>
                )}

                {/* Audio Button in Audio Challenge Mode */}
                {session.currentQuestion?.type === "audio" && session.currentQuestion.audioUrl && (
                  <div className="mt-2">
                    <audio ref={audioPlayerRef} src={session.currentQuestion.audioUrl} autoPlay />
                    <button
                      onClick={() => audioPlayerRef.current?.play()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/40 hover:bg-sky-500/30 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      Phát lại âm thanh
                    </button>
                  </div>
                )}
              </div>

              {submissionError && (
                <p role="alert" className="my-2 rounded-xl border border-red-800 bg-red-950/60 p-2.5 text-center text-xs text-red-300">
                  {submissionError}
                </p>
              )}

              {/* Feedback Overlay during RESOLVE */}
              {session.state === "RESOLVE" && session.lastResult && (
                <div className="my-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center animate-in fade-in">
                  <div className="text-xs font-bold">
                    {session.lastResult.result === "correct" ? (
                      <span className="text-emerald-400">CHÍNH XÁC! Phát bắn trúng đích.</span>
                    ) : session.lastResult.result === "near" ? (
                      <span className="text-amber-400">GẦN ĐÚNG! Sai 1 ký tự, không gây sát thương.</span>
                    ) : (
                      <span className="text-red-400">BẮN TRƯỢT! Địch đã nạp đạn phản công.</span>
                    )}
                  </div>
                  {session.lastResult.result !== "correct" && (
                    <div className="mt-1">
                      {renderLetterDiff(session.lastResult.studentAnswer, session.lastResult.correctAnswer)}
                    </div>
                  )}
                </div>
              )}

              {/* User Input: Easy (4 options) vs Medium/Hard (Typing) */}
              {session.state === "QUESTION" && (
                <div className="mt-3">
                  {difficulty === "easy" && session.currentQuestion?.options ? (
                    <div className="grid grid-cols-2 gap-2">
                      {session.currentQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSubmit(opt)}
                          className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-sky-600/90 border border-slate-700 hover:border-sky-400 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all text-left flex items-center justify-between group shadow"
                        >
                          <span>{opt}</span>
                          <span className="text-[10px] font-mono text-slate-500 group-hover:text-white px-1.5 py-0.5 rounded bg-slate-900/50">
                            {idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleAnswerSubmit();
                      }}
                      className="flex items-center gap-2"
                    >
                      {difficulty === "medium" && (
                        <div className="hidden sm:block font-mono text-xs text-sky-400/80 px-2.5 py-2 bg-slate-950 rounded-xl border border-slate-800 whitespace-nowrap">
                          {session.currentQuestion?.promptMeta.hintMask}
                        </div>
                      )}
                      <input
                        ref={inputRef}
                        type="text"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        value={session.userInput}
                        onChange={(e) => setSession((prev) => (prev ? { ...prev, userInput: e.target.value } : null))}
                        placeholder={
                          difficulty === "medium"
                            ? `Gợi ý: ${session.currentQuestion?.promptMeta.hintMask}`
                            : "Nhập từ vựng tiếng Anh..."
                        }
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!session.userInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-sky-900/30 flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Crosshair className="w-4 h-4" />
                        Bắn
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Tutorial Modal */}
      {tutorialOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                Hướng Dẫn Thao Tác Chiến Hạm (Bước {tutorialStep}/3)
              </h3>
              <button onClick={() => setTutorialOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tutorialStep === 1 && (
              <div className="text-xs text-slate-300 flex flex-col gap-3">
                <p>
                  <strong>Quy tắc hỏa lực:</strong> Mỗi khi bạn trả lời chính xác từ vựng, chiến hạm sẽ bắn trúng tàu địch và gây <strong>1 sát thương</strong>.
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</div>
                  <span>Chuỗi trả lời đúng sẽ tích lũy Combo thưởng điểm (tối đa +20 điểm/câu).</span>
                </div>
              </div>
            )}

            {tutorialStep === 2 && (
              <div className="text-xs text-slate-300 flex flex-col gap-3">
                <p>
                  <strong>Bắn Chí Mạng & Gần Đúng:</strong>
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <Flame className="w-6 h-6 text-amber-400" />
                  <span>Ở chuỗi đúng thứ <strong>5, 10, 15 liên tiếp</strong>, bạn kích hoạt <strong>Bắn Chí Mạng (2 sát thương)</strong>!</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-sky-400" />
                  <span>Từ $\ge 6$ ký tự nếu chỉ gõ sai 1 chữ sẽ được tính <strong>Gần đúng</strong> (bảo toàn chuỗi combo, không bị địch nạp đạn).</span>
                </div>
              </div>
            )}

            {tutorialStep === 3 && (
              <div className="text-xs text-slate-300 flex flex-col gap-3">
                <p>
                  <strong>Phản công của hạm đội địch:</strong>
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-red-400" />
                  <span>Mỗi khi bạn bắn trượt hoặc hết 20s, địch nạp +1. Đạt <strong>2 lần sai $\rightarrow$ Địch phản công trừ 1 HP</strong> của bạn!</span>
                </div>
                <p className="text-slate-400">
                  Trận đấu có tối đa 20 câu. Tiêu diệt toàn bộ 3 đợt hạm đội (kể cả Boss) để giành chiến thắng vinh quang!
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
              {tutorialStep > 1 ? (
                <button
                  onClick={() => setTutorialStep((prev) => prev - 1)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Quay lại
                </button>
              ) : <div />}

              {tutorialStep < 3 ? (
                <button
                  onClick={() => setTutorialStep((prev) => prev + 1)}
                  className="px-4 py-1.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  onClick={() => setTutorialOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                >
                  Đã hiểu, vào trận ngay!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weak Words Instant Review Drawer */}
      {weakWordsReviewOpen && session && session.wrongWords.length > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Ôn Từ Sai Trong Trận ({reviewWordIndex + 1}/{session.wrongWords.length})
              </span>
              <button onClick={() => setWeakWordsReviewOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const currentWeak = session.wrongWords[reviewWordIndex];
              return (
                <div className="flex flex-col gap-3 py-2">
                  <h4 className="text-2xl font-black text-slate-100">{currentWeak.word}</h4>
                  <p className="text-xs text-sky-400 font-mono">
                    ({currentWeak.partOfSpeech || "Từ vựng"}) {currentWeak.ipa ? `/${currentWeak.ipa}/` : ""}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    {currentWeak.meaning}
                  </div>
                  {currentWeak.example && (
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 text-left">
                      <p className="italic text-slate-300">&quot;{currentWeak.example}&quot;</p>
                      {currentWeak.exampleMeaning && <p className="mt-1">{currentWeak.exampleMeaning}</p>}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                disabled={reviewWordIndex === 0}
                onClick={() => setReviewWordIndex((prev) => Math.max(0, prev - 1))}
                className="flex-1 py-2 rounded-xl bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-semibold"
              >
                Từ trước
              </button>
              <button
                disabled={reviewWordIndex >= session.wrongWords.length - 1}
                onClick={() => setReviewWordIndex((prev) => Math.min(session.wrongWords.length - 1, prev + 1))}
                className="flex-1 py-2 rounded-xl bg-sky-500 disabled:opacity-40 text-slate-950 text-xs font-bold"
              >
                Từ tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CHỌN BỘ ĐỀ ── */}
      {isSetPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[85dvh] w-full max-w-md flex-col space-y-3 rounded-3xl border border-sky-400/30 bg-slate-950 p-4 sm:p-5 shadow-2xl text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-sky-400" />
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
                className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2.5 pl-9 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition focus:border-sky-400"
              />
            </div>

            {/* Set List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[50dvh]">
              {isLoadingSet ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                  <span className="text-sm font-bold">Đang tải bộ từ vựng...</span>
                </div>
              ) : filteredSets.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Không tìm thấy bộ đề phù hợp</p>
              ) : (
                <>
                  {!searchSetQuery.trim() && (
                    <button
                      type="button"
                      disabled={isLoadingSet}
                      onClick={() => void handleSelectDeck({
                        id: "ALL",
                        title: "Tất cả bộ đề",
                        category: "Kho từ vựng tổng hợp",
                        wordCount: totalAllWordsCount,
                        words: allDeckWords,
                      } as VocabularyTestSet)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                        activeSetId === "ALL"
                          ? "border-sky-400 bg-sky-950/60 font-bold text-sky-200 shadow-sm"
                          : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-slate-900"
                      }`}
                    >
                      <div className="min-w-0 pr-2 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-sky-400 shrink-0" />
                        <div>
                          <p className="truncate text-sm font-bold text-white">🗂 Tất cả bộ đề (Toàn kho từ)</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Kho từ vựng tổng hợp · {totalAllWordsCount} từ
                          </p>
                        </div>
                      </div>
                      {activeSetId === "ALL" ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-400" />
                      ) : (
                        <span className="shrink-0 rounded-lg border border-sky-400/30 px-2.5 py-1 text-xs font-bold text-sky-300 hover:bg-sky-400/10">
                          Chọn
                        </span>
                      )}
                    </button>
                  )}
                  {filteredSets.map((s) => {
                    const isCurrent = s.id === activeSetId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isLoadingSet}
                        onClick={() => void handleSelectDeck(s)}
                        className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                          isCurrent
                            ? "border-sky-400 bg-sky-950/60 font-bold text-sky-200 shadow-sm"
                            : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-slate-900"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-sm font-bold text-white">{s.title}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {s.category || "Từ vựng TOEIC"} · {s.words?.length || s.wordCount || 0} từ
                          </p>
                        </div>
                        {isCurrent ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-400" />
                        ) : (
                          <span className="shrink-0 rounded-lg border border-sky-400/30 px-2.5 py-1 text-xs font-bold text-sky-300 hover:bg-sky-400/10">
                            Chọn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
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
    </div>
  );
}
