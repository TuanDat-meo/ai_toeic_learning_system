"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  Flame,
  Crown,
  Volume2,
  RotateCcw,
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Send,
  Sparkles,
  BookOpen,
  Pause,
  Play,
  AlertTriangle,
  Keyboard,
  CheckSquare,
  Shield,
  Eye,
  EyeOff,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Zap,
  ChevronDown,
  Search,
  FolderKanban,
  X,
  Loader2,
  LogOut,
} from "lucide-react";
import {
  recordVocabularyAnswer,
  completeVocabularyGameSession,
  startVocabularyGameSession,
  getVocabularySets,
  getVocabularySet,
  type VocabularyGameSession,
} from "@/lib/api/vocabulary";
import type {
  VocabularyTestSet,
  WordItem,
} from "@/app/admin/content/vocabulary/types";
import {
  RUNNER_CONFIG,
  RUNNER_SPEED_PRESETS,
  type SpeedPresetKey,
} from "./runner/config";
import type { GameState, RunnerToast, ObstacleKind, EncounterType } from "./runner/types";
import { runnerTransition, isLoopActive } from "./runner/stateMachine";
import { updateDistanceToChaser } from "./runner/chaser";
import { evaluateAnswer } from "./runner/scoring";
import {
  generateQuestionChoices,
  reinsertFailedWord,
  type RunnerQuestionItem,
} from "./runner/spacedRepetition";
import { ParallaxTrack } from "./runner/ParallaxTrack";
import { BoyCharacter, type BoyAction } from "./runner/BoyCharacter";
import { rollMysteryBox } from "./runner/mysteryBox";
import {
  calculateDynamicSpeed,
  type DynamicSpeedState,
} from "./runner/speedCalculator";
import {
  selectWordsForSession,
  type StudyMode,
  type WordLevelTag,
  type QuestionCountSelection,
} from "./runner/wordSelector";

// ─── Props & Types ──────────────────────────────────────────────────────────

interface VocabularyRunnerGameProps {
  setId: string;
  testSet: VocabularyTestSet;
  words: WordItem[];
  allSetsWords?: { setId: string; words: WordItem[] }[];
  initialSession?: VocabularyGameSession | null;
  onComplete?: (result: VocabularyGameSession) => void;
  onBackToCenter: () => void;
}

interface RunnerQuestionWithMeta extends RunnerQuestionItem {
  obstacleKind: ObstacleKind;
  encounterType: EncounterType;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getVietnameseMeaning(word: WordItem): string {
  if (word.meaning?.trim()) return word.meaning;
  if (word.senses && word.senses.length > 0) {
    for (const sense of word.senses) {
      if (sense.meaning?.trim()) return sense.meaning;
    }
  }
  return "Nghĩa của từ";
}

function getEnglishOrVietnameseMeaning(word: WordItem): string {
  if (word.senses && word.senses.length > 0) {
    for (const s of word.senses) {
      if (s.definitionEn?.trim()) return s.definitionEn;
    }
  }
  return getVietnameseMeaning(word);
}

function createRuntimeId(): string {
  return crypto.randomUUID();
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function buildQuestionItem(
  word: WordItem,
  index: number,
  allWords: WordItem[]
): RunnerQuestionWithMeta {
  const viMeaning = getVietnameseMeaning(word);
  const displayMeaning = getEnglishOrVietnameseMeaning(word);
  const example = word.example?.trim() || "";
  const exampleVi = word.exampleMeaning || word.exampleVi || "";

  const hasExampleWithWord =
    example &&
    new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(example);

  const choices = generateQuestionChoices(word, allWords);

  // Phân bố Điểm Chạm: Cứ mỗi 4 câu sẽ có 1 Hộp Mù (Mystery Box) thưởng may rủi
  const isMysteryBox = index > 0 && index % 4 === 3;
  if (isMysteryBox) {
    return {
      instanceId: crypto.randomUUID(),
      word,
      displayMeaning,
      vietnameseMeaning: viMeaning,
      exampleSentence: example || `She can ${word.word.toLowerCase()} her feelings.`,
      exampleMeaning: exampleVi || "",
      type: "VIETNAMESE_TO_ENGLISH",
      prompt: `🎁 Hộp Mù May Rủi: Đoán nghĩa từ "${word.word}"`,
      choices,
      obstacleKind: "mystery_box",
      encounterType: "mystery_box",
    };
  }

  // Boss đặc biệt ở các mốc câu 10, 20
  if (index === 9 || index === 19) {
    return {
      instanceId: crypto.randomUUID(),
      word,
      displayMeaning,
      vietnameseMeaning: viMeaning,
      exampleSentence: example,
      exampleMeaning: exampleVi,
      type: "VIETNAMESE_TO_ENGLISH",
      prompt: `👹 TRÙM CUỐI: Giải nghĩa từ "${word.word}"`,
      choices,
      obstacleKind: "boss",
      encounterType: "obstacle",
    };
  }

  // Chướng ngại 1: Hố sâu -> Nghe phát âm và chọn từ
  if (index % 4 === 2 && (word.audioUrl || word.audio)) {
    return {
      instanceId: crypto.randomUUID(),
      word,
      displayMeaning: "Nghe phát âm và chọn/gõ từ vựng",
      vietnameseMeaning: viMeaning,
      exampleSentence: example,
      exampleMeaning: exampleVi,
      type: "AUDIO",
      prompt: "🔊 Hố sâu: Nghe âm thanh và vượt qua",
      choices,
      obstacleKind: "pit",
      encounterType: "obstacle",
    };
  }

  // Chướng ngại 2: Cành cây thấp -> Trượt người và điền vào chỗ trống
  if (hasExampleWithWord && index % 3 === 1) {
    const prompt = example.replace(
      new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
      "______"
    );
    return {
      instanceId: crypto.randomUUID(),
      word,
      displayMeaning,
      vietnameseMeaning: viMeaning,
      exampleSentence: example,
      exampleMeaning: exampleVi,
      type: "FILL_IN_BLANK",
      prompt: `🌿 Cành cây thấp (Trượt qua): ${prompt}`,
      choices,
      obstacleKind: "low_branch",
      encounterType: "obstacle",
    };
  }

  // Chướng ngại 3: Tảng đá -> Bật nhảy qua tảng đá
  return {
    instanceId: crypto.randomUUID(),
    word,
    displayMeaning,
    vietnameseMeaning: viMeaning,
    exampleSentence: example || `She can ${word.word.toLowerCase()} her feelings.`,
    exampleMeaning: exampleVi || "",
    type: "VIETNAMESE_TO_ENGLISH",
    prompt: `🪨 Tảng đá: ${displayMeaning}`,
    choices,
    obstacleKind: "rock",
    encounterType: "obstacle",
  };
}

function playWord(word: WordItem, soundMuted = false): void {
  if (soundMuted) return;
  const src = word.audioUrl || word.audio;
  if (src) {
    const audio = new Audio(src);
    audio.play().catch(() => speakWord(word.word));
    return;
  }
  speakWord(word.word);
}

function speakWord(text: string): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Component Chính ─────────────────────────────────────────────────────────

export default function VocabularyRunnerGame({
  setId,
  testSet,
  words,
  allSetsWords = [],
  initialSession,
  onComplete,
  onBackToCenter,
}: VocabularyRunnerGameProps) {
  // ── 0. Quản lý Bộ Đề Chọn Trực Tiếp Trong Game ──
  const [activeSetId, setActiveSetId] = useState<string>(setId);
  const [activeTestSet, setActiveTestSet] = useState<VocabularyTestSet>(testSet);
  const [activeWords, setActiveWords] = useState<WordItem[]>(words);
  const [availableSets, setAvailableSets] = useState<VocabularyTestSet[]>([]);
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);

  // ── 1. Cấu hình Chế Độ Học & Tốc Độ (Mục 6A) ──
  const [speedPreset, setSpeedPreset] = useState<SpeedPresetKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vocab_runner_speed") as SpeedPresetKey;
      if (saved && RUNNER_SPEED_PRESETS[saved]) return saved;
    }
    return RUNNER_CONFIG.DEFAULT_SPEED_PRESET;
  });

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
  const [targetQuestionCount, setTargetQuestionCount] =
    useState<QuestionCountSelection>(20);
  const [selectorWarning, setSelectorWarning] = useState<string | null>(null);

  // ── 2. Danh sách câu hỏi ──
  const [questions, setQuestions] = useState<RunnerQuestionWithMeta[]>(() => {
    const sel = selectWordsForSession(words, allSetsWords, {
      mode: "single_deck",
      targetCount: 20,
    });
    return sel.selectedWords.map((w, idx) => buildQuestionItem(w, idx, sel.distractorPool));
  });

  // ── 3. State Machine & Game Flow ──
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [session, setSession] = useState<VocabularyGameSession | null>(
    initialSession ?? null
  );

  // ── 4. Sinh mệnh, Khiên & Kẻ đuổi ──
  const [lives, setLives] = useState<number>(RUNNER_CONFIG.INITIAL_LIVES);
  const [hasShield, setHasShield] = useState(false);
  const [distanceToChaser, setDistanceToChaser] = useState<number>(
    RUNNER_CONFIG.INITIAL_DISTANCE_TO_CHASER
  );
  const [recentNegativeCount, setRecentNegativeCount] = useState(0);

  // ── 5. Chuỗi đúng/sai để tính gia tốc bậc (Mục 6A.B) ──
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [currentSpeedTier, setCurrentSpeedTier] = useState(0);

  // ── 6. Điểm & Combo ──
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongWords, setWrongWords] = useState<WordItem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  // ── 7. Game Loop & Parallax Motion ──
  const [trackOffset, setTrackOffset] = useState(0);
  const [distanceToNextEncounter, setDistanceToNextEncounter] = useState<number>(360);

  // ── 8. Timer câu hỏi & Thời gian ván đấu ──
  const [questionTimer, setQuestionTimer] = useState<number>(
    RUNNER_CONFIG.DEFAULT_QUESTION_TIMEOUT_SEC
  );
  const [elapsed, setElapsed] = useState(0);

  // ── 9. Toast Phản Hồi Nhanh ──
  const [toast, setToast] = useState<RunnerToast | null>(null);

  // ── 10. Input & Chế độ trả lời (Gõ từ vs Trắc nghiệm) ──
  const [inputMode, setInputMode] = useState<"choice" | "type">("choice");
  const [userInput, setUserInput] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [bonusHints, setBonusHints] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // ── 11. Phóng To Vừa Đủ 1 Tab & Thoát Game & Trợ Năng ──
  const [isMaximizedTab, setIsMaximizedTab] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [viewportOffset, setViewportOffset] = useState(0);

  // ── 12. Kết quả hoàn tất từ Backend ──
  const [finalSession, setFinalSession] = useState<VocabularyGameSession | null>(null);

  // Refs
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const questionTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lowFpsFramesRef = useRef(0);
  const gameLoopRef = useRef<(time: number) => void>(() => {});
  const handleTimeoutRef = useRef<() => void>(() => {});

  const currentQuestion = questions[questionIndex];

  // Tải danh sách bộ đề đầy đủ từ backend
  useEffect(() => {
    let mounted = true;
    getVocabularySets()
      .then((sets) => {
        if (mounted && Array.isArray(sets) && sets.length > 0) {
          setAvailableSets(sets);
        }
      })
      .catch((err) => {
        console.warn("Could not load all vocabulary sets", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Xử lý chuyển đổi bộ đề trực tiếp
  const handleSelectDeck = async (targetSet: VocabularyTestSet) => {
    setIsLoadingSet(true);
    try {
      let fullSet = targetSet;
      if (!fullSet.words || fullSet.words.length === 0) {
        fullSet = await getVocabularySet(targetSet.id);
      }
      const newWords = fullSet.words || [];
      setActiveSetId(fullSet.id);
      setActiveTestSet(fullSet);
      setActiveWords(newWords);
      setIsSetPickerOpen(false);

      const allPool = availableSets.length > 0
        ? availableSets.map((s) => ({ setId: s.id, words: s.words || [] }))
        : allSetsWords;

      const selection = selectWordsForSession(newWords, allPool, {
        mode: studyMode,
        targetCount: targetQuestionCount,
        selectedLevels,
        wrongWordsHistory: wrongWords,
      });
      setSelectorWarning(selection.warningMessage || null);
      setQuestions(selection.selectedWords.map((w, idx) => buildQuestionItem(w, idx, selection.distractorPool)));

      // Nếu đang ở màn kết quả, đưa về Start để bắt đầu ván mới
      if (gameState === "VICTORY" || gameState === "GAME_OVER") {
        setGameState("IDLE");
      }
    } catch (err) {
      console.error("Error switching vocabulary set:", err);
    } finally {
      setIsLoadingSet(false);
    }
  };

  // Quyết định hành động hiển thị của nhân vật BoyRunner
  let boyAction: BoyAction = "idle";
  if (gameState === "GAME_OVER") {
    boyAction = "defeated";
  } else if (gameState === "VICTORY") {
    boyAction = "victory";
  } else if (toast?.type === "wrong") {
    boyAction = "stumble";
  } else if (isJumping) {
    boyAction = currentQuestion?.obstacleKind === "low_branch" ? "sliding" : "jumping";
  } else if (combo >= RUNNER_CONFIG.COMBO_CAP) {
    boyAction = "dashing";
  } else if (gameState === "RUNNING") {
    boyAction = "running";
  } else {
    boyAction = "idle";
  }

  // ── Phóng To Vừa Đủ 1 Tab (Không chiếm toàn bộ màn hình hệ điều hành) ──
  const toggleMaximizeTab = useCallback(() => {
    setIsMaximizedTab((prev) => !prev);
  }, []);

  // Phím tắt: F để phóng to vừa 1 tab, Esc để thoát chế độ phóng to
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleMaximizeTab();
      } else if (e.key === "Escape" && isMaximizedTab) {
        e.preventDefault();
        setIsMaximizedTab(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleMaximizeTab, isMaximizedTab]);

  // Visual Viewport: Giúp bàn phím ảo di động không che mất câu hỏi
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const handleViewportResize = () => {
      const keyboardHeight = window.innerHeight - vv.height;
      setViewportOffset(keyboardHeight > 80 ? Math.min(keyboardHeight * 0.45, 120) : 0);
    };
    vv.addEventListener("resize", handleViewportResize);
    vv.addEventListener("scroll", handleViewportResize);
    return () => {
      vv.removeEventListener("resize", handleViewportResize);
      vv.removeEventListener("scroll", handleViewportResize);
    };
  }, []);

  // Tự động focus ô input khi ở chế độ gõ
  useEffect(() => {
    if (gameState === "ENCOUNTER" && inputMode === "type" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, inputMode, questionIndex]);

  // Tự động dừng loop khi ẩn tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setGameState((prev) => {
          if (prev === "RUNNING" || prev === "ENCOUNTER") {
            const res = runnerTransition(prev, "PAUSE");
            return res.valid ? res.nextState : prev;
          }
          return prev;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Timer đếm tổng thời gian
  useEffect(() => {
    if (
      gameState === "RUNNING" ||
      gameState === "ENCOUNTER" ||
      gameState === "RESOLVE" ||
      gameState === "EVENT_TSUNAMI" ||
      gameState === "EVENT_TRAFFIC" ||
      gameState === "EVENT_SHAKE"
    ) {
      elapsedTimerIntervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      if (elapsedTimerIntervalRef.current) {
        clearInterval(elapsedTimerIntervalRef.current);
        elapsedTimerIntervalRef.current = null;
      }
    }
    return () => {
      if (elapsedTimerIntervalRef.current) clearInterval(elapsedTimerIntervalRef.current);
    };
  }, [gameState]);

  // Countdown Timer từng câu
  useEffect(() => {
    if (gameState === "ENCOUNTER" || gameState === "EVENT_TSUNAMI") {
      const initialTimer =
        gameState === "EVENT_TSUNAMI"
          ? 9
          : RUNNER_CONFIG.DEFAULT_QUESTION_TIMEOUT_SEC;
      setQuestionTimer(initialTimer);

      questionTimerIntervalRef.current = setInterval(() => {
        setQuestionTimer((time) => {
          if (time <= 1) {
            handleTimeoutRef.current();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (questionTimerIntervalRef.current) {
        clearInterval(questionTimerIntervalRef.current);
        questionTimerIntervalRef.current = null;
      }
    }
    return () => {
      if (questionTimerIntervalRef.current) clearInterval(questionTimerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, questionIndex]);

  // ── Game Loop 60 FPS (RAF + Dynamic Speed + Adaptive Quality) ──
  const gameLoop = useCallback(
    (time: number) => {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);

        // Adaptive Quality: Giảm tải hiệu ứng nếu phát hiện giật khung hình FPS < 30 kéo dài ~3 giây
        if (dt > 0.033) {
          lowFpsFramesRef.current += 1;
          if (lowFpsFramesRef.current >= 90) {
            setReducedMotion(true);
          }
        } else {
          lowFpsFramesRef.current = Math.max(0, lowFpsFramesRef.current - 1);
        }

        setGameState((currentState) => {
          if (currentState === "RUNNING") {
            const dynamicSpeed = calculateDynamicSpeed({
              preset: speedPreset,
              questionIndex,
              correctStreak,
              wrongStreak,
            });

            setCurrentSpeedTier(dynamicSpeed.tier);
            const currentSpeed = dynamicSpeed.effectiveSpeed;

            setTrackOffset((prev) => prev + currentSpeed * dt);

            setDistanceToNextEncounter((dist) => {
              const nextDist = dist - currentSpeed * dt;
              if (nextDist <= RUNNER_CONFIG.TRIGGER_ENCOUNTER_DISTANCE_PX) {
                const transitionResult = runnerTransition("RUNNING", "TRIGGER_ENCOUNTER");
                return transitionResult.nextState === "ENCOUNTER"
                  ? RUNNER_CONFIG.TRIGGER_ENCOUNTER_DISTANCE_PX
                  : nextDist;
              }
              return nextDist;
            });
          }
          return currentState;
        });
      }

      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame((nextTime) => gameLoopRef.current(nextTime));
    },
    [questionIndex, speedPreset, correctStreak, wrongStreak]
  );

  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  useEffect(() => {
    if (isLoopActive(gameState)) {
      lastTimeRef.current = null;
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  // Kiểm tra chuyển ENCOUNTER
  useEffect(() => {
    if (
      gameState === "RUNNING" &&
      distanceToNextEncounter <= RUNNER_CONFIG.TRIGGER_ENCOUNTER_DISTANCE_PX
    ) {
      setGameState((prev) => {
        const res = runnerTransition(prev, "TRIGGER_ENCOUNTER");
        return res.valid ? res.nextState : prev;
      });
    }
  }, [gameState, distanceToNextEncounter]);

  // Lưu cấu hình tốc độ
  const handleSelectSpeedPreset = (preset: SpeedPresetKey) => {
    setSpeedPreset(preset);
    if (typeof window !== "undefined") {
      localStorage.setItem("vocab_runner_speed", preset);
    }
  };

  // Khởi tạo câu hỏi dựa trên các chế độ học (Mục 6A.C)
  const initializeQuestions = () => {
    const allPool = availableSets.length > 0
      ? availableSets.map((s) => ({ setId: s.id, words: s.words || [] }))
      : allSetsWords;

    const selection = selectWordsForSession(activeWords, allPool, {
      mode: studyMode,
      targetCount: targetQuestionCount,
      selectedLevels,
      wrongWordsHistory: wrongWords,
    });
    setSelectorWarning(selection.warningMessage || null);
    const preparedQuestions = selection.selectedWords.map((w, idx) =>
      buildQuestionItem(w, idx, selection.distractorPool)
    );
    setQuestions(preparedQuestions);
    return preparedQuestions;
  };

  // Chọn chế độ học và cập nhật câu hỏi xem trước
  const handleSelectStudyMode = (mode: StudyMode) => {
    setStudyMode(mode);
    const allPool = availableSets.length > 0
      ? availableSets.map((s) => ({ setId: s.id, words: s.words || [] }))
      : allSetsWords;
    const sel = selectWordsForSession(activeWords, allPool, {
      mode,
      targetCount: targetQuestionCount,
      selectedLevels,
      wrongWordsHistory: wrongWords,
    });
    setSelectorWarning(sel.warningMessage || null);
    setQuestions(sel.selectedWords.map((w, idx) => buildQuestionItem(w, idx, sel.distractorPool)));
  };

  // Bật/tắt từng cấp độ CEFR khi chọn "Theo cấp độ"
  const handleToggleLevel = (level: WordLevelTag) => {
    setSelectedLevels((prev) => {
      const isSelected = prev.includes(level);
      const next = isSelected ? prev.filter((l) => l !== level) : [...prev, level];
      const validNext = next.length === 0 ? [level] : next;

      const allPool = availableSets.length > 0
        ? availableSets.map((s) => ({ setId: s.id, words: s.words || [] }))
        : allSetsWords;
      const sel = selectWordsForSession(activeWords, allPool, {
        mode: "by_level",
        targetCount: targetQuestionCount,
        selectedLevels: validNext,
        wrongWordsHistory: wrongWords,
      });
      setSelectorWarning(sel.warningMessage || null);
      setQuestions(sel.selectedWords.map((w, idx) => buildQuestionItem(w, idx, sel.distractorPool)));
      return validNext;
    });
  };

  // Bắt đầu game
  const handleStart = async () => {
    setIsChecking(true);
    if (studyMode !== "single_deck" && availableSets.length === 0) {
      setSelectorWarning("Không tải được danh sách bộ đề. Vui lòng thử lại trước khi chơi trộn.");
      setIsChecking(false);
      return;
    }
    try {
      const activeQuestions = initializeQuestions();

      let activeSession = session;
      if (!activeSession) {
        activeSession = await startVocabularyGameSession({
          setId: activeSetId,
          gameType: "RUNNER",
          deckIds: [...new Set([
            activeSetId,
            ...(studyMode === "single_deck"
              ? []
              : availableSets.map((set) => set.id)),
            ...activeQuestions.map((question) => question.word.setId)
              .filter((id): id is string => typeof id === "string" && id.length > 0),
          ])],
        });
        setSession(activeSession);
      }
      setLives(RUNNER_CONFIG.INITIAL_LIVES);
      setHasShield(false);
      setRecentNegativeCount(0);
      setBonusHints(0);
      setCorrectStreak(0);
      setWrongStreak(0);
      setCurrentSpeedTier(0);
      setDistanceToChaser(RUNNER_CONFIG.INITIAL_DISTANCE_TO_CHASER);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setCorrectCount(0);
      setWrongCount(0);
      setWrongWords([]);
      setQuestionIndex(0);
      setElapsed(0);
      setUserInput("");
      setHintVisible(false);
      setIsShaking(false);
      setTrackOffset(0);

      // Khoảng cách khởi đầu dựa trên thời gian nghỉ
      const initialSpeed = calculateDynamicSpeed({
        preset: speedPreset,
        questionIndex: 0,
        correctStreak: 0,
        wrongStreak: 0,
      });
      setDistanceToNextEncounter(initialSpeed.nextEncounterDistancePx);

      const res = runnerTransition("IDLE", "START");
      setGameState(res.nextState);
    } catch {
      const res = runnerTransition("IDLE", "START");
      setGameState(res.nextState);
    } finally {
      setIsChecking(false);
    }
  };

  // Hoàn tất game
  const handleFinish = useCallback(
    async (
      isVictory: boolean,
      finalScore: number,
      finalMaxCombo: number,
      finalCorrect: number,
      finalWrong: number,
      finalLives: number
    ) => {
      const activeSessionId = session?.id;
      if (activeSessionId) {
        try {
          const completed = await completeVocabularyGameSession(activeSessionId);
          setFinalSession(completed);
          if (onComplete) onComplete(completed);
        } catch {
          const fallback: VocabularyGameSession = {
            id: activeSessionId,
            setId: activeSetId,
            gameType: "RUNNER",
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            score: finalScore,
            correctCount: finalCorrect,
            wrongCount: finalWrong,
            totalQuestions: questions.length,
            durationSeconds: elapsed,
            maxCombo: finalMaxCombo,
            mode: studyMode,
            speedPreset,
          };
          setFinalSession(fallback);
          if (onComplete) onComplete(fallback);
        }
      }
      setGameState(isVictory ? "VICTORY" : "GAME_OVER");
    },
    [session, activeSetId, questions.length, elapsed, studyMode, speedPreset, onComplete]
  );

  // ── Xử lý nộp câu trả lời ──
  const handleSubmitAnswer = async (submittedText?: string) => {
    if (!currentQuestion || isChecking) return;
    const answerToEval = (submittedText ?? userInput).trim();
    if (!answerToEval) return;

    setIsChecking(true);

    const isBox = currentQuestion.encounterType === "mystery_box";

    // 1. Chấm điểm thông minh với Dung sai chính tả & Biến thể từ
    const evalResult = evaluateAnswer({
      userInput: answerToEval,
      correctWord: currentQuestion.word.word,
      usedHint: hintVisible,
      currentCombo: combo,
    });

    const activeSessionId = session?.id;

    // 2. Gửi API backend bảo toàn cơ chế hiện có + thêm metadata
    try {
      if (activeSessionId) {
        await recordVocabularyAnswer({
          requestId: currentQuestion.instanceId || createRuntimeId(),
          wordId: currentQuestion.word.id,
          activityType: "GAME",
          questionType: currentQuestion.type,
          answer: answerToEval,
          responseTimeMs: Math.min(elapsed * 1000, 600_000),
          gameSessionId: activeSessionId,
          gameQuestionIndex: questionIndex,
          encounterType: currentQuestion.encounterType,
        });
      }
    } catch {
      // Offline fallback: game vẫn tiếp tục mượt mà
    } finally {
      setIsChecking(false);
    }

    if (evalResult.isAccepted) {
      // TRẢ LỜI ĐÚNG:
      setCorrectStreak((s) => s + 1);
      setWrongStreak(0);

      let pointsGained = evalResult.pointsAwarded;
      let toastMsg = evalResult.message;
      let toastSub = evalResult.newCombo > 1 ? `Combo x${evalResult.newCombo} 🔥` : undefined;

      // Kéo giãn khoảng cách kẻ đuổi
      const chaserResult = updateDistanceToChaser(distanceToChaser, "CORRECT");
      let nextDistance = chaserResult.newDistance;

      // Xử lý mở Hộp Mù khi trả lời đúng
      if (isBox) {
        const boxOutcome = rollMysteryBox(recentNegativeCount);
        toastMsg = `🎁 Mở hộp: ${boxOutcome.name}!`;
        toastSub = boxOutcome.description;

        if (boxOutcome.scoreBonus) pointsGained += boxOutcome.scoreBonus;
        if (boxOutcome.grantShield) setHasShield(true);
        if (boxOutcome.hintCountAdded) setBonusHints((h) => h + (boxOutcome.hintCountAdded || 1));
        if (boxOutcome.heartsAdded) setLives((l) => Math.min(3, l + (boxOutcome.heartsAdded || 1)));
        if (boxOutcome.chaserDistanceDelta) {
          nextDistance = Math.max(0, Math.min(100, nextDistance + boxOutcome.chaserDistanceDelta));
        }

        if (boxOutcome.effect === "EARTHQUAKE_SHAKE" && !reducedMotion) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), (boxOutcome.durationSec || 4) * 1000);
        }

        if (!boxOutcome.isPositive) {
          setRecentNegativeCount((prev) => prev + 1);
        } else {
          setRecentNegativeCount(0);
        }
      }

      const nextScore = score + pointsGained;
      const nextCorrect = correctCount + 1;
      const newMaxCombo = Math.max(maxCombo, evalResult.newCombo);

      setDistanceToChaser(nextDistance);
      setCombo(evalResult.newCombo);
      setMaxCombo(newMaxCombo);
      setScore(nextScore);
      setCorrectCount(nextCorrect);
      setUserInput("");
      setHintVisible(false);
      setIsJumping(true);

      setToast({
        id: createRuntimeId(),
        type: evalResult.isTypo ? "typo_correct" : "correct",
        message: toastMsg,
        subMessage: toastSub,
        timestamp: getCurrentTimestamp(),
      });

      const resolveState = runnerTransition(gameState, "SUBMIT_CORRECT");
      setGameState(resolveState.nextState);

      setTimeout(() => {
        setIsJumping(false);
        setToast(null);

        const nextIndex = questionIndex + 1;
        if (nextIndex >= questions.length && targetQuestionCount !== 0) {
          void handleFinish(true, nextScore, newMaxCombo, nextCorrect, wrongCount, lives);
        } else {
          setQuestionIndex(nextIndex);

          // Tính toán khoảng cách chướng ngại tiếp theo theo THỜI GIAN NGHỈ 1.6s
          const nextSpeed = calculateDynamicSpeed({
            preset: speedPreset,
            questionIndex: nextIndex,
            correctStreak: correctStreak + 1,
            wrongStreak: 0,
          });
          setDistanceToNextEncounter(nextSpeed.nextEncounterDistancePx);

          const resumeState = runnerTransition(resolveState.nextState, "RESUME");
          setGameState(resumeState.nextState);
        }
      }, RUNNER_CONFIG.TOAST_FEEDBACK_DURATION_MS);
    } else {
      // TRẢ LỜI SAI:
      setWrongStreak((w) => w + 1);
      setCorrectStreak(0);
      void handleFailure(currentQuestion.word.word, isBox);
    }
  };

  // ── Xử lý khi sai hoặc hết giờ ──
  const handleFailure = (correctWord: string, isMysteryBox = false) => {
    // Quy tắc hộp mù: Sai ở hộp mù thì hộp biến mất, KHÔNG mất tim
    if (isMysteryBox) {
      setToast({
        id: createRuntimeId(),
        type: "wrong",
        message: "Hộp mù đã biến mất!",
        subMessage: `Đáp án là: ${correctWord} · Nghĩa: ${currentQuestion?.vietnameseMeaning}`,
        timestamp: getCurrentTimestamp(),
      });

      const resolveState = runnerTransition(gameState, "SUBMIT_WRONG");
      setGameState(resolveState.nextState);

      setTimeout(() => {
        setToast(null);
        setUserInput("");
        setHintVisible(false);

        const nextIndex = questionIndex + 1;
        if (nextIndex >= questions.length && targetQuestionCount !== 0) {
          void handleFinish(true, score, maxCombo, correctCount, wrongCount, lives);
        } else {
          setQuestionIndex(nextIndex);
          const nextSpeed = calculateDynamicSpeed({
            preset: speedPreset,
            questionIndex: nextIndex,
            correctStreak: 0,
            wrongStreak: wrongStreak + 1,
          });
          setDistanceToNextEncounter(nextSpeed.nextEncounterDistancePx);
          const resumeState = runnerTransition(resolveState.nextState, "RESUME");
          setGameState(resumeState.nextState);
        }
      }, RUNNER_CONFIG.TOAST_FEEDBACK_DURATION_MS);
      return;
    }

    // Nếu người chơi đang có Khiên bảo vệ: Tiêu thụ khiên và miễn trừ mất tim
    if (hasShield) {
      setHasShield(false);
      setToast({
        id: createRuntimeId(),
        type: "typo_correct",
        message: "🛡️ Khiên đã chặn 1 lần va chạm!",
        subMessage: `Không mất tim! Đáp án đúng: ${correctWord}`,
        timestamp: getCurrentTimestamp(),
      });

      const resolveState = runnerTransition(gameState, "SUBMIT_CORRECT");
      setGameState(resolveState.nextState);

      setTimeout(() => {
        setToast(null);
        setUserInput("");
        setHintVisible(false);

        const nextIndex = questionIndex + 1;
        if (nextIndex >= questions.length && targetQuestionCount !== 0) {
          void handleFinish(true, score, maxCombo, correctCount, wrongCount, lives);
        } else {
          setQuestionIndex(nextIndex);
          const nextSpeed = calculateDynamicSpeed({
            preset: speedPreset,
            questionIndex: nextIndex,
            correctStreak: 0,
            wrongStreak: wrongStreak + 1,
          });
          setDistanceToNextEncounter(nextSpeed.nextEncounterDistancePx);
          const resumeState = runnerTransition(resolveState.nextState, "RESUME");
          setGameState(resumeState.nextState);
        }
      }, RUNNER_CONFIG.TOAST_FEEDBACK_DURATION_MS);
      return;
    }

    // Mất tim bình thường
    const nextLives = Math.max(0, lives - 1);
    const nextWrong = wrongCount + 1;

    // Kẻ đuổi tiến sát
    const chaserResult = updateDistanceToChaser(distanceToChaser, "WRONG");
    const caught = chaserResult.isCaught === 1;
    const finalCalculatedLives = caught
      ? Math.max(0, nextLives - chaserResult.penaltyLives)
      : nextLives;

    setLives(finalCalculatedLives);
    setDistanceToChaser(chaserResult.newDistance);
    setCombo(0);
    setWrongCount(nextWrong);

    // Lưu danh sách từ sai
    if (currentQuestion) {
      setWrongWords((prev) => {
        const exists = prev.some((w) => w.id === currentQuestion.word.id);
        return exists ? prev : [...prev, currentQuestion.word];
      });

      // Spaced Repetition trong ván: Chèn lại từ sai sau 3 câu
      setQuestions((prevQueue) =>
        reinsertFailedWord(prevQueue, currentQuestion, questionIndex, RUNNER_CONFIG.SPACED_REPETITION_OFFSET)
      );
    }

    setToast({
      id: createRuntimeId(),
      type: "wrong",
      message: `Chưa chính xác! (-1 ❤️)`,
      subMessage: `Đáp án: ${correctWord} · Nghĩa: ${currentQuestion?.vietnameseMeaning}`,
      timestamp: getCurrentTimestamp(),
    });

    const resolveState = runnerTransition(gameState, "SUBMIT_WRONG");
    setGameState(resolveState.nextState);

    setTimeout(() => {
      setToast(null);
      setUserInput("");
      setHintVisible(false);

      if (finalCalculatedLives <= 0) {
        void handleFinish(false, score, maxCombo, correctCount, nextWrong, finalCalculatedLives);
      } else {
        const nextIndex = questionIndex + 1;
        if (nextIndex >= questions.length && targetQuestionCount !== 0) {
          void handleFinish(true, score, maxCombo, correctCount, nextWrong, finalCalculatedLives);
        } else {
          setQuestionIndex(nextIndex);
          const nextSpeed = calculateDynamicSpeed({
            preset: speedPreset,
            questionIndex: nextIndex,
            correctStreak: 0,
            wrongStreak: wrongStreak + 1,
          });
          setDistanceToNextEncounter(nextSpeed.nextEncounterDistancePx);
          const resumeState = runnerTransition(resolveState.nextState, "RESUME");
          setGameState(resumeState.nextState);
        }
      }
    }, RUNNER_CONFIG.TOAST_FEEDBACK_DURATION_MS + 600);
  };

  // Hết giờ
  const handleTimeout = () => {
    if (gameState !== "ENCOUNTER" || !currentQuestion) return;
    const isBox = currentQuestion.encounterType === "mystery_box";
    handleFailure(currentQuestion.word.word, isBox);
  };

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  // Pause toggle
  const togglePause = () => {
    if (gameState === "PAUSED") {
      const res = runnerTransition("PAUSED", "UNPAUSE");
      setGameState(res.nextState);
    } else if (gameState === "RUNNING" || gameState === "ENCOUNTER") {
      const res = runnerTransition(gameState, "PAUSE");
      setGameState(res.nextState);
    }
  };

  // Chơi lại
  const handleRestart = () => {
    void handleStart();
  };

  // Luyện tập từ sai
  const handlePracticeWrong = () => {
    if (wrongWords.length === 0) return;
    setQuestions(wrongWords.map((w, idx) => buildQuestionItem(w, idx, activeWords)));
    void handleStart();
  };

  // Accuracy
  const totalAttempted = correctCount + wrongCount;
  const accuracy =
    totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  // Lọc danh sách bộ đề khi tìm kiếm trong popup
  const setsToDisplay = availableSets.length > 0 ? availableSets : [activeTestSet];
  const filteredSets = setsToDisplay.filter((s) => {
    const q = searchSetQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (s.title || "").toLowerCase().includes(q);
    const categoryMatch = (s.category || "").toLowerCase().includes(q);
    return titleMatch || categoryMatch;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // MÀN HÌNH BẮT ĐẦU (IDLE) - RESPONSIVE HOÀN CHỈNH
  // ══════════════════════════════════════════════════════════════════════════
  if (gameState === "IDLE") {
    return (
      <div
        className={`relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 select-none flex flex-col transition-all ${
          isMaximizedTab
            ? "fixed inset-0 z-[60] h-dvh min-h-0 w-full max-w-none rounded-none border-0 overflow-y-auto"
            : "min-h-[min(680px,calc(100dvh-5rem))]"
        } ${
          highContrast
            ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-indigo-600/40 text-white"
            : "bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 border-indigo-200 text-slate-900"
        }`}
      >
        {/* Nền trang trí vector tinh tế */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="startBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#startBg)" />
            <circle cx="85%" cy="15%" r="80" fill="#FDE047" opacity="0.15" />
            <circle cx="85%" cy="15%" r="45" fill="#FDE047" opacity="0.25" />
          </svg>
        </div>

        {/* ── Header Bar ── */}
        <div className="relative z-10 flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight truncate">
              <span className={highContrast ? "text-amber-400" : "text-amber-600"}>Đường Đua</span>
              <span className={`ml-1 ${highContrast ? "text-white" : "text-slate-900"}`}>Từ Vựng 🏃‍♂️</span>
            </h1>
            <span className={`text-xs font-bold hidden md:inline ${highContrast ? "text-amber-200/80" : "text-slate-500"}`}>(Vocabulary Runner)</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button type="button" onClick={() => setHighContrast((h) => !h)}
              className={`p-1.5 sm:p-2 rounded-lg transition-all ${highContrast ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
              title={highContrast ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}>
              {highContrast ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button type="button" onClick={toggleMaximizeTab}
              className={`p-1.5 sm:p-2 rounded-lg transition-all ${highContrast ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
              title={isMaximizedTab ? "Thu nhỏ (F)" : "Phóng to tab (F)"}>
              {isMaximizedTab ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button type="button" onClick={onBackToCenter}
              className={`inline-flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${highContrast ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`} title="Về Trung tâm trò chơi">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trung tâm trò chơi</span>
              <span className="sm:hidden">Thoát</span>
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 overflow-y-auto">

          {/* Cột trái: Preview nhân vật (ẩn trên mobile) */}
          <div className={`hidden lg:flex lg:w-[280px] xl:w-[320px] shrink-0 flex-col items-center justify-center rounded-2xl p-5 border backdrop-blur-sm ${
            highContrast ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-md"
          }`}>
            <BoyCharacter action="idle" />
            <div className="flex items-center gap-3 text-2xl mt-4">
              <span title="Tảng đá">🪨</span>
              <span title="Cành cây">🌿</span>
              <span title="Hố sâu">🕳️</span>
              <span title="Hộp mù">🎁</span>
            </div>
            <p className={`text-xs font-medium mt-3 text-center leading-relaxed ${
              highContrast ? "text-white/60" : "text-slate-600"
            }`}>
              Nhân vật tự chạy liên tục. Trả lời đúng để nhảy qua chướng ngại vật!
            </p>
          </div>

          {/* Cột phải: Form cấu hình */}
          <div className="flex-1 min-w-0 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 lg:p-5 shadow-xl border border-white/60 space-y-3 text-slate-800 overflow-y-auto">

            {/* 0. Bộ đề đang chọn */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-xl p-2.5 sm:p-3">
              <div className="flex items-center gap-2 min-w-0">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block leading-none">
                    Bộ đề:
                  </span>
                  <p className="font-black text-sm sm:text-base text-indigo-950 truncate mt-0.5">
                    {activeTestSet.title}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsSetPickerOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 ml-2">
                <span>Đổi bộ đề</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Chế độ học */}
            <div>
              <label className="font-extrabold text-sm text-indigo-950 flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Chế độ học:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { key: "single_deck" as const, label: "Bộ đề hiện tại", sub: activeTestSet.title },
                  { key: "all_decks" as const, label: "Toàn bộ từ", sub: "Cân bằng các bộ" },
                  { key: "by_level" as const, label: "Theo cấp độ", sub: "Chọn cấp CEFR" },
                ].map((item) => (
                  <button key={item.key} type="button" onClick={() => handleSelectStudyMode(item.key)}
                    className={`p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all ${
                      studyMode === item.key
                        ? "bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}>
                    <p className="font-bold text-xs sm:text-sm leading-tight">{item.label}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5">{item.sub}</p>
                  </button>
                ))}
              </div>

              {/* CEFR Level Selector */}
              {studyMode === "by_level" && (
                <div className="mt-2 bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 sm:p-3 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-indigo-950">Chọn cấp độ:</span>
                    <button type="button"
                      onClick={() => {
                        if (selectedLevels.length === 7) { setSelectedLevels(["B1"]); }
                        else { setSelectedLevels(["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"]); }
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                      {selectedLevels.length === 7 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
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
                        <button key={level} type="button" onClick={() => handleToggleLevel(level)}
                          className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center flex flex-col items-center gap-0.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                          }`}>
                          <span className="font-black">{level.toUpperCase()}</span>
                          <span className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tốc độ chạy */}
            <div>
              <label className="font-extrabold text-sm text-indigo-950 flex items-center gap-1.5 mb-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Tốc độ chạy:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(Object.keys(RUNNER_SPEED_PRESETS) as SpeedPresetKey[]).map((key) => {
                  const preset = RUNNER_SPEED_PRESETS[key];
                  return (
                    <button key={key} type="button" onClick={() => handleSelectSpeedPreset(key)}
                      className={`p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all ${
                        speedPreset === key
                          ? "bg-amber-50 border-amber-500 text-amber-950 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}>
                      <p className="font-bold text-xs sm:text-sm flex items-center justify-between gap-1">
                        <span>{preset.label}</span>
                        <span className="font-mono text-[10px] sm:text-xs text-slate-400">{preset.baseSpeed}</span>
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Số câu */}
            <div>
              <label className="font-extrabold text-sm text-indigo-950 flex items-center gap-1.5 mb-1.5">
                🎯 Số câu hỏi:
              </label>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[10, 20, 30, 0].map((num) => (
                  <button key={num} type="button"
                    onClick={() => setTargetQuestionCount(num as QuestionCountSelection)}
                    className={`py-2 sm:py-2.5 px-2 rounded-xl border-2 font-black text-xs sm:text-sm text-center transition-all ${
                      targetQuestionCount === num
                        ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}>
                    {num === 0 ? "Vô tận" : `${num} câu`}
                  </button>
                ))}
              </div>
            </div>

            {selectorWarning && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ {selectorWarning}
              </p>
            )}
          </div>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className={`relative z-10 flex items-center justify-between gap-3 p-3 sm:p-4 border-t ${
          highContrast ? "border-white/10" : "border-slate-200 bg-white/70 backdrop-blur-sm"
        }`}>
          <button type="button" onClick={onBackToCenter}
            className={`text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
              highContrast
                ? "text-white/80 hover:text-white bg-white/10 hover:bg-white/15"
                : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm"
            }`}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Trung tâm trò chơi</span>
            <span className="sm:hidden">Thoát</span>
          </button>

          <button type="button" disabled={isChecking} onClick={handleStart}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 active:scale-95 text-slate-950 font-black text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl shadow-xl shadow-amber-500/30 transition-all flex items-center gap-2 border-2 border-amber-300">
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Bắt đầu chạy</span>
          </button>
        </div>

        {/* ── MODAL CHỌN BỘ ĐỀ ── */}
        {isSetPickerOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 max-h-[85dvh] flex flex-col space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Chọn bộ đề từ vựng</h3>
                </div>
                <button type="button" onClick={() => setIsSetPickerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchSetQuery}
                  onChange={(e) => setSearchSetQuery(e.target.value)}
                  placeholder="Tìm kiếm bộ đề..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50dvh]">
                {isLoadingSet ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-sm font-bold">Đang tải...</span>
                  </div>
                ) : filteredSets.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">Không tìm thấy bộ đề phù hợp</p>
                ) : (
                  filteredSets.map((s) => {
                    const isCurrent = s.id === activeSetId;
                    return (
                      <button key={s.id} type="button" disabled={isLoadingSet}
                        onClick={() => void handleSelectDeck(s)}
                        className={`w-full p-3 rounded-xl sm:rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isCurrent
                            ? "bg-indigo-50/90 border-indigo-500 text-indigo-950 font-bold shadow-sm"
                            : "hover:bg-slate-50 border-slate-200 text-slate-700"
                        }`}>
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-sm truncate">{s.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {s.category || "Từ vựng TOEIC"} · {s.wordCount ?? s.words?.length ?? 0} từ
                          </p>
                        </div>
                        {isCurrent ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                        ) : (
                          <span className="text-xs font-bold text-indigo-600 shrink-0">Chọn</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button type="button" onClick={() => setIsSetPickerOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MÀN HÌNH KẾT QUẢ (VICTORY / GAME_OVER) - RESPONSIVE HOÀN CHỈNH
  // ══════════════════════════════════════════════════════════════════════════
  if (gameState === "VICTORY" || gameState === "GAME_OVER") {
    const isWin = gameState === "VICTORY";
    const finalScoreDisplay = finalSession?.score ?? score;
    const finalMaxComboDisplay = finalSession?.maxCombo ?? maxCombo;

    return (
      <div
        className={`relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 select-none flex flex-col transition-all ${
          isMaximizedTab
            ? "fixed inset-0 z-[60] h-dvh min-h-0 w-full max-w-none rounded-none border-0 overflow-y-auto"
            : "min-h-[min(680px,calc(100dvh-5rem))]"
        } ${
          highContrast
            ? isWin
              ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-emerald-950 border-emerald-600/40 text-white"
              : "bg-gradient-to-b from-indigo-950 via-slate-900 to-rose-950 border-rose-600/40 text-white"
            : isWin
            ? "bg-gradient-to-b from-white via-emerald-50/50 to-teal-50 border-emerald-300 text-slate-900"
            : "bg-gradient-to-b from-white via-rose-50/40 to-slate-50 border-rose-200 text-slate-900"
        }`}
      >
        {/* ── Header Kết Quả ── */}
        <div className="relative z-10 text-center p-4 sm:p-5 pb-2 sm:pb-3">
          <div
            className={`inline-block text-lg sm:text-2xl lg:text-3xl font-black text-white px-5 sm:px-8 py-2 sm:py-3 rounded-2xl shadow-xl border-2 sm:border-4 ${
              isWin
                ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-amber-300"
                : "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 border-rose-300"
            }`}
          >
            {isWin ? "🏆 Hoàn thành đường chạy!" : "💀 Đã bị bắt kịp!"}
          </div>
          <p className={`text-xs sm:text-sm font-semibold mt-2 px-4 ${
            highContrast ? "text-white/70" : "text-slate-600"
          }`}>
            {activeTestSet.title} · {studyMode === "single_deck" ? "Bộ đề" : studyMode === "all_decks" ? "Toàn bộ" : "Cấp độ"} · {RUNNER_SPEED_PRESETS[speedPreset].label}
          </p>
        </div>

        {/* ── Content Grid ── */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 overflow-y-auto">

          {/* Cột trái: Nhân vật */}
          <div className="hidden lg:flex lg:w-[240px] shrink-0 flex-col items-center justify-center">
            <BoyCharacter action={isWin ? "victory" : "defeated"} />
          </div>

          {/* Cột phải: Thống kê & Hành động */}
          <div className="flex-1 min-w-0 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 lg:p-5 shadow-xl border border-white/60 space-y-3 text-slate-800 overflow-y-auto">

            {/* Bảng thống kê 2 cột */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />, label: "Câu đúng", value: correctCount, bg: "bg-emerald-50 text-emerald-900 border-emerald-100" },
                { icon: <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />, label: "Tổng điểm", value: finalScoreDisplay, bg: "bg-amber-50 text-amber-900 border-amber-100" },
                { icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0" />, label: "Câu sai", value: wrongCount, bg: "bg-rose-50 text-rose-900 border-rose-100" },
                { icon: <Crown className="w-4 h-4 text-amber-500 shrink-0" />, label: "Combo max", value: `x${finalMaxComboDisplay}`, bg: "bg-orange-50 text-orange-900 border-orange-100" },
                { icon: <span className="text-blue-600 shrink-0">🎯</span>, label: "Chính xác", value: `${accuracy}%`, bg: "bg-blue-50 text-blue-900 border-blue-100" },
                { icon: <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />, label: "Mạng còn", value: lives, bg: "bg-pink-50 text-pink-900 border-pink-100" },
                { icon: <span className="text-purple-600 shrink-0">⏱️</span>, label: "Thời gian", value: formatTime(elapsed), bg: "bg-purple-50 text-purple-900 border-purple-100" },
                { icon: <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />, label: "Tổng lượt", value: totalAttempted, bg: "bg-indigo-50 text-indigo-900 border-indigo-100" },
              ].map(({ icon, label, value, bg }, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2.5 sm:py-3 rounded-xl border ${bg}`}>
                  <span className="flex items-center gap-1.5 sm:gap-2 font-medium text-xs sm:text-sm">
                    {icon} {label}
                  </span>
                  <strong className="font-black text-sm sm:text-base">{value}</strong>
                </div>
              ))}
            </div>

            {/* Danh sách từ sai */}
            {wrongWords.length > 0 && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 max-h-44 sm:max-h-52 overflow-y-auto space-y-2">
                <p className="font-black text-rose-900 text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wider">
                  📖 Ôn tập {wrongWords.length} từ cần lưu ý:
                </p>
                <div className="space-y-1.5">
                  {wrongWords.map((w) => (
                    <div key={w.id} className="bg-white p-2 sm:p-2.5 rounded-xl border border-rose-100 flex items-center justify-between gap-2 text-xs sm:text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-slate-900 font-bold">{w.word}</strong>
                          {w.phonetic && <span className="text-slate-400 italic font-mono text-xs">{w.phonetic}</span>}
                          <span className="text-emerald-700 font-semibold text-xs">• {getVietnameseMeaning(w)}</span>
                        </div>
                        {w.example && (
                          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">&ldquo;{w.example}&rdquo;</p>
                        )}
                      </div>
                      <button type="button" onClick={() => playWord(w, soundMuted)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0" title="Phát âm">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nút hành động */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-2.5 pt-1">
              <button type="button" onClick={handleRestart}
                className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm border border-amber-300 sm:flex-1">
                <RotateCcw className="w-4 h-4" /> Chơi lại
              </button>
              <button type="button" onClick={() => setIsSetPickerOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm">
                <FolderKanban className="w-4 h-4" /> Đổi đề
              </button>
              {wrongWords.length > 0 && (
                <button type="button" onClick={handlePracticeWrong}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm sm:flex-1">
                  <BookOpen className="w-4 h-4" /> Luyện từ sai
                </button>
              )}
              <button type="button" onClick={onBackToCenter}
                className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm border border-slate-200">
                <ArrowLeft className="w-4 h-4" /> Về Trung tâm trò chơi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MÀN HÌNH CHƠI (RUNNING / ENCOUNTER / RESOLVE / PAUSED)
  // ══════════════════════════════════════════════════════════════════════════
  const progressPct =
    questions.length > 0 ? (questionIndex / questions.length) * 100 : 0;
  const isEncounter = gameState === "ENCOUNTER";

  return (
    <div
      className={`relative min-h-[min(760px,calc(100dvh-6rem))] w-full max-w-7xl mx-auto overflow-hidden rounded-3xl p-4 sm:p-5 lg:p-7 shadow-2xl border-4 select-none flex flex-col justify-between transition-all ${
        isMaximizedTab
          ? "fixed inset-0 z-[60] h-dvh min-h-0 w-full max-w-none rounded-none border-0 overflow-y-auto"
          : ""
      } ${
        highContrast
          ? "bg-slate-950 border-amber-400 text-white"
          : "bg-gradient-to-b from-sky-400 via-sky-300 to-indigo-500 border-sky-200"
      } ${isShaking && !reducedMotion ? "animate-shake" : ""}`}
      style={{
        transform: viewportOffset > 0 ? `translateY(-${viewportOffset}px)` : undefined,
      }}
    >
      {/* ── Top HUD Bar ── */}
      <div className="relative z-30">
        <div className="flex items-center justify-between mb-2">
          {/* Thanh Khoảng cách Kẻ đuổi */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/20">
            <span className="font-bold text-amber-300">Kẻ đuổi:</span>
            <div className="w-24 bg-white/20 rounded-full h-2 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 ${
                  distanceToChaser < 30 ? "bg-red-500 animate-pulse" : "bg-emerald-400"
                }`}
                style={{ width: `${distanceToChaser}%` }}
              />
            </div>
            <span className="font-mono font-bold">{Math.round(distanceToChaser)}%</span>
            {distanceToChaser < 30 && (
              <span className="text-red-400 font-black animate-ping text-[10px]">⚠️ GẦN!</span>
            )}
          </div>

          {/* Quick Settings & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Huy hiệu Bậc tốc độ hiện tại */}
            <div className="hidden sm:flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-300/40 px-2 py-0.5 rounded-full text-[10px] font-black">
              <span>⚡ Bậc {currentSpeedTier}</span>
            </div>

            <button
              type="button"
              onClick={() => setHighContrast((h) => !h)}
              className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              title="Tương phản cao"
            >
              {highContrast ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setSoundMuted((m) => !m)}
              className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              title={soundMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setReducedMotion((r) => !r)}
              className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              title={reducedMotion ? "Bật hoạt ảnh đầy đủ" : "Giảm chuyển động"}
            >
              {reducedMotion ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMaximizeTab}
              className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              title={isMaximizedTab ? "Thu nhỏ về khung thường (F hoặc Esc)" : "Phóng to vừa tab (F)"}
            >
              {isMaximizedTab ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={togglePause}
              className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              title={gameState === "PAUSED" ? "Tiếp tục" : "Tạm dừng"}
            >
              {gameState === "PAUSED" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                if (gameState === "RUNNING" || gameState === "ENCOUNTER") {
                  const res = runnerTransition(gameState, "PAUSE");
                  if (res.valid) setGameState(res.nextState);
                }
                setShowExitConfirm(true);
              }}
              className="bg-rose-500/80 hover:bg-rose-600 active:scale-95 text-white p-1.5 rounded-full backdrop-blur-md transition-colors shadow-sm flex items-center gap-1 px-2 text-xs font-bold"
              title="Thoát game"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
            <span className="text-white text-xs font-mono font-bold drop-shadow">
              ⏱️ {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* HUD Badges */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-3.5 py-1.5 rounded-2xl shadow-lg border border-white/20">
            <span className="text-amber-400 text-base">⭐</span>
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider leading-none">
                Điểm
              </p>
              <p className="text-base font-black leading-none mt-0.5">{score}</p>
            </div>
          </div>

          <div className="flex-1 min-w-[140px] max-w-xs bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span className="text-blue-200">Câu:</span>
              <span>
                {questionIndex + 1} / {targetQuestionCount === 0 ? "∞" : questions.length}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-amber-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Tim sinh mệnh */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-900 to-red-900 text-white px-3.5 py-2 rounded-2xl shadow-lg border border-white/20">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="text-sm font-black">{lives}</span>
          </div>

          {/* Khiên Năng Lượng */}
          {hasShield && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-300 px-3 py-2 rounded-2xl shadow-lg border border-cyan-400 animate-pulse">
              <Shield className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <span className="text-xs font-black">Khiên</span>
            </div>
          )}

          {/* Combo Multiplier */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-900 to-orange-900 text-white px-3.5 py-2 rounded-2xl shadow-lg border border-white/20">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-sm font-black">x{combo}</span>
          </div>

          {/* Max Combo */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-3.5 py-2 rounded-2xl shadow-lg border border-white/20">
            <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-sm font-black">x{maxCombo}</span>
          </div>
        </div>
      </div>

      {/* ── Toast Phản Hồi Nhanh ── */}
      {toast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl border-2 text-center text-white ${
              toast.type === "correct"
                ? "bg-emerald-600/95 border-emerald-300"
                : toast.type === "typo_correct"
                ? "bg-amber-600/95 border-amber-300"
                : "bg-rose-600/95 border-rose-300"
            }`}
          >
            <p className="font-black text-base">{toast.message}</p>
            {toast.subMessage && (
              <p className="text-xs text-white/90 font-medium mt-0.5">{toast.subMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Overlay Tạm Dừng (PAUSED) ── */}
      {gameState === "PAUSED" && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white space-y-4">
          <h2 className="text-3xl font-black">⏸️ Tạm Dừng</h2>
          <p className="text-sm text-slate-300">Game đang tạm dừng để bảo toàn tiến trình và pin thiết bị</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePause}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5" /> Tiếp tục chơi
            </button>
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" /> Thoát game
            </button>
          </div>
        </div>
      )}

      {/* ── Thẻ Câu Hỏi Nổi (ENCOUNTER) ── */}
      {isEncounter && currentQuestion && (
        <div className="relative z-30 my-auto max-w-2xl w-full mx-auto transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-white/80 space-y-3 text-slate-800">
            {/* Header Thẻ: Timer + Chế độ trả lời */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Thời gian:
                </span>
                <span
                  className={`font-mono font-black text-sm ${
                    questionTimer <= 5 ? "text-red-600 animate-pulse font-extrabold" : "text-indigo-900"
                  }`}
                >
                  ⏳ {questionTimer}s
                </span>
              </div>

              {/* Toggle Chế độ Trắc nghiệm / Gõ từ */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setInputMode("choice")}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                    inputMode === "choice"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Trắc nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("type")}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                    inputMode === "type"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" /> Bàn phím
                </button>
              </div>
            </div>

            {/* Prompt row */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => playWord(currentQuestion.word, soundMuted)}
                className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center shrink-0 transition-transform active:scale-95"
                aria-label="Phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full mr-2">
                  {currentQuestion.encounterType === "mystery_box"
                    ? "Hộp mù"
                    : currentQuestion.type === "FILL_IN_BLANK"
                    ? "Điền từ"
                    : currentQuestion.type === "AUDIO"
                    ? "Nghe"
                    : "Đoán nghĩa"}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800">
                  {currentQuestion.prompt}
                </span>
              </div>
            </div>

            {/* Chế độ 1: 4 Nút Trắc Nghiệm Lớn (>= 44px theo tiêu chuẩn WCAG) */}
            {inputMode === "choice" ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {currentQuestion.choices.map((choice, idx) => (
                  <button
                    key={`${currentQuestion.instanceId}-choice-${idx}`}
                    type="button"
                    disabled={isChecking}
                    onClick={() => void handleSubmitAnswer(choice)}
                    className="min-h-[44px] bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 border-2 border-slate-200 hover:border-indigo-400 rounded-2xl px-4 py-3 text-sm sm:text-base font-bold text-slate-800 transition-all text-left flex items-center justify-between shadow-xs disabled:opacity-50"
                  >
                    <span>{choice}</span>
                    <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Chế độ 2: Ô Nhập Bàn Phím Gõ */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmitAnswer();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Nhập từ tiếng Anh (sai 1 ký tự vẫn tính đúng)..."
                  disabled={isChecking}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 bg-slate-50 border-2 border-slate-200 focus:border-purple-500 rounded-2xl px-4 py-3 text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isChecking || !userInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold px-5 sm:px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span>{isChecking ? "..." : "Kiểm tra"}</span>
                </button>
              </form>
            )}

            {/* Sub Actions: Gợi ý + Phát âm */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => setHintVisible(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-amber-200"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Gợi ý ({currentQuestion.word.word[0]?.toUpperCase()}*)
                  {bonusHints > 0 && ` (+${bonusHints})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => playWord(currentQuestion.word, soundMuted)}
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-sky-200"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Phát âm</span>
              </button>

              {hintVisible && (
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                  Gợi ý: {currentQuestion.word.word[0]?.toUpperCase()}
                  {"*".repeat(Math.max(1, currentQuestion.word.word.length - 1))}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Parallax 4 Layers Track Scene ── */}
      <ParallaxTrack
        trackOffset={trackOffset}
        distanceToChaser={distanceToChaser}
        distanceToNextEncounter={distanceToNextEncounter}
        obstacleKind={currentQuestion?.obstacleKind}
        encounterType={currentQuestion?.encounterType}
        boyAction={boyAction}
        hasShield={hasShield}
        reducedMotion={reducedMotion}
        highContrast={highContrast}
      />

      {/* ── HỘP THOẠI XÁC NHẬN THOÁT GAME (EXIT CONFIRM MODAL) ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
              🚪
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">Thoát khỏi game?</h3>
              <p className="text-xs text-slate-500">
                Tiến trình ván chơi hiện tại sẽ dừng lại và bạn sẽ quay về trung tâm trò chơi.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  if (gameState === "PAUSED") {
                    const res = runnerTransition("PAUSED", "UNPAUSE");
                    if (res.valid) setGameState(res.nextState);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Chơi tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onBackToCenter();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-black text-xs sm:text-sm text-white shadow-md transition-colors"
              >
                Thoát ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe Styles cho Parallax và Animation */}
      <style>{`
        @keyframes runnerBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes legLeft {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes legRight {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }
        @keyframes screenShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px) translateY(2px); }
          40%, 80% { transform: translateX(5px) translateY(-2px); }
        }
        .animate-runner-bob {
          animation: runnerBob 0.35s ease-in-out infinite;
        }
        .animate-leg-left {
          transform-origin: 60px 88px;
          animation: legLeft 0.35s ease-in-out infinite;
        }
        .animate-leg-right {
          transform-origin: 78px 88px;
          animation: legRight 0.35s ease-in-out infinite;
        }
        .animate-shake {
          animation: screenShake 0.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
