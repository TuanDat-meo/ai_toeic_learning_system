"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  AudioLines,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  FolderKanban,
  Gamepad2,
  Heart,
  HelpCircle,
  Loader2,
  Moon,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Swords,
  Trophy,
  Volume2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import type { VocabularyTestSet, WordItem } from "@/app/admin/content/vocabulary/types";
import {
  getDueVocabularyWords,
  getVocabularySet,
  getVocabularySets,
  completeVocabularyGameSession,
  recordVocabularyAnswer,
  startVocabularyGameSession,
  type VocabularyActivityType,
  type VocabularyGameSession,
  type VocabularyGameType,
  type VocabularyQuestionType,
  type VocabularySrsRating,
} from "@/lib/api/vocabulary";
import VocabularyRunnerGame from "@/components/vocabulary/VocabularyRunnerGame";

type ActivityMode = "learn" | "practice" | "review" | "game";
type GameMode = "flashcard" | "runner" | "matching" | "battle" | "sentence";
const gameTypeByMode: Record<GameMode, VocabularyGameType> = {
  flashcard: "FLASHCARD",
  runner: "RUNNER",
  matching: "MATCHING",
  battle: "BATTLE",
  sentence: "SENTENCE",
};

interface VocabularyActivityWorkspaceProps {
  mode: ActivityMode;
  setId?: string;
  game?: GameMode;
  wordId?: string;
}

type SentenceDifficulty = "ALL" | "EASY" | "MEDIUM" | "HARD";
const SENTENCE_HINT_WRONG_ANSWER_THRESHOLD = 3;

interface QuestionSpec {
  type: VocabularyQuestionType;
  prompt: string;
  expectsEnglish: boolean;
  audio?: boolean;
}

function exampleContainsWord(example: string, word: string): boolean {
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escapedWord}\\b`, "i").test(example);
}

function matchesSentenceDifficulty(word: WordItem, difficulty: SentenceDifficulty): boolean {
  if (difficulty === "ALL") return true;
  const rawLevel = (word.cefrLevel || word.level || "").trim().toUpperCase();
  if (!rawLevel) return false;
  const mappedLevel = rawLevel === "EASY" ? "A1" : rawLevel === "MEDIUM" ? "B1" : rawLevel === "HARD" ? "B2" : rawLevel;
  const level = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(mappedLevel) ? mappedLevel : "B1";
  if (difficulty === "EASY") return level === "A1" || level === "A2";
  if (difficulty === "HARD") return level === "C1" || level === "C2";
  return level === "B1" || level === "B2";
}

function getMeaning(word: WordItem): string {
  const sense = word.senses?.find((item) => item.meaning?.trim()) ?? word.senses?.[0];
  return sense?.meaning || sense?.definitionEn || word.meaning || "";
}

function questionFor(mode: ActivityMode, game: GameMode | undefined, index: number, word: WordItem): QuestionSpec {
  if (mode === "review") {
    return { type: "FLASHCARD_RATING", prompt: "Gợi nhớ nghĩa của từ này", expectsEnglish: false };
  }
  if (game === "flashcard") {
    return { type: "FLASHCARD_RATING", prompt: word.word, expectsEnglish: false };
  }
  if (game === "matching") {
    return { type: "ENGLISH_TO_VIETNAMESE", prompt: word.word, expectsEnglish: false };
  }
  if (game === "sentence") {
    const example = word.example ?? "";
    return {
      type: "FILL_IN_BLANK",
      prompt: example.replace(new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______"),
      expectsEnglish: true,
    };
  }
  if (mode === "learn" || game === "runner" || game === "battle") {
    if ((game === "runner" || game === "battle") && word.example && exampleContainsWord(word.example, word.word)) {
      return {
        type: "FILL_IN_BLANK",
        prompt: word.example.replace(new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______"),
        expectsEnglish: true,
      };
    }
    return { type: "VIETNAMESE_TO_ENGLISH", prompt: getMeaning(word), expectsEnglish: true };
  }
  if (index % 4 === 1) {
    return { type: "TYPE_WORD", prompt: getMeaning(word), expectsEnglish: true };
  }
  if (index % 4 === 2) {
    const example = word.example || "";
    const hasWord = exampleContainsWord(example, word.word);
    return {
      type: "FILL_IN_BLANK",
      prompt: hasWord ? example.replace(new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______") : getMeaning(word),
      expectsEnglish: true,
    };
  }
  if (index % 4 === 3) {
    return { type: "AUDIO", prompt: "Nghe phát âm và chọn từ phù hợp", expectsEnglish: true, audio: true };
  }
  return { type: "ENGLISH_TO_VIETNAMESE", prompt: word.word, expectsEnglish: false };
}

function playWord(word: WordItem): void {
  const source = word.audioUrl || word.audio;
  if (source && (/^https?:\/\//i.test(source) || source.startsWith("/"))) {
    const audio = new Audio(source);
    void audio.play().catch(() => undefined);
    return;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
}

export function VocabularyActivityWorkspace({ mode, setId, game, wordId }: VocabularyActivityWorkspaceProps) {
  const [testSet, setTestSet] = useState<VocabularyTestSet | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [selectedSetId, setSelectedSetId] = useState(setId ?? "");
  const [availableSets, setAvailableSets] = useState<VocabularyTestSet[]>([]);
  const [mixAllSets, setMixAllSets] = useState(false);
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestedCount, setRequestedCount] = useState<5 | 10 | 20 | "all">(10);
  const [gameQuestionCount, setGameQuestionCount] = useState<10 | 20 | "all">(10);
  const [sentenceMode, setSentenceMode] = useState<"CLASSIC" | "TIME_ATTACK">("CLASSIC");
  const [sentenceDifficulty, setSentenceDifficulty] = useState<SentenceDifficulty>("MEDIUM");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<30 | 60 | 90 | 120>(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [questionTimedOut, setQuestionTimedOut] = useState(false);
  const [timedOutSubmissionFailed, setTimedOutSubmissionFailed] = useState(false);
  const [started, setStarted] = useState(mode === "review" || mode === "practice");
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [missedWords, setMissedWords] = useState<WordItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [battleEnemy, setBattleEnemy] = useState(1);
  const [wrongMatches, setWrongMatches] = useState(0);
  const [selectedMatchWordId, setSelectedMatchWordId] = useState<string | null>(null);
  const [selectedMatchMeaningId, setSelectedMatchMeaningId] = useState<string | null>(null);
  const [resolvedMatchIds, setResolvedMatchIds] = useState<Set<string>>(new Set());
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [gameSession, setGameSession] = useState<VocabularyGameSession | null>(null);
  const [gameResult, setGameResult] = useState<VocabularyGameSession | null>(null);
  const completionStarted = useRef<string | null>(null);
  const matchingRequestIds = useRef(new Map<number, string>());
  const gameAnswerRequestIds = useRef(new Map<number, string>());
  const timedOutQuestionIndex = useRef<number | null>(null);
  const [completionRetry, setCompletionRetry] = useState(0);
  const [isGameDarkMode, setIsGameDarkMode] = useState(false);

  useEffect(() => {
    let active = true;
    const load = mode === "review"
      ? getDueVocabularyWords(setId, 100).then((due) => ({ words: due, set: null }))
      : setId
        ? getVocabularySet(setId).then((set) => ({ words: set.words || [], set }))
        : Promise.reject(new Error("Chọn một bộ từ vựng để bắt đầu."));
    void load.then((result) => {
      if (!active) return;
      setTestSet(result.set);
      setWords(result.words);
      setLoadError(null);
    }).catch((reason: unknown) => {
      if (active) setLoadError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu từ vựng.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [mode, setId]);

  useEffect(() => {
    if (mode !== "game" || (game !== "sentence" && game !== "matching")) return;
    let active = true;
    void getVocabularySets().then((sets) => {
      if (active) setAvailableSets(sets);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Không thể tải danh sách bộ từ vựng.");
    });
    return () => { active = false; };
  }, [game, mode]);

  const handleSelectVocabularySet = async (targetSet: VocabularyTestSet) => {
    if (targetSet.id === selectedSetId) {
      setIsSetPickerOpen(false);
      return;
    }
    setIsLoadingSet(true);
    setError(null);
    try {
      const fullSet = await getVocabularySet(targetSet.id);
      setSelectedSetId(fullSet.id);
      setTestSet(fullSet);
      setWords(fullSet.words || []);
      setIndex(0);
      setIsSetPickerOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải bộ từ vựng đã chọn.");
    } finally {
      setIsLoadingSet(false);
    }
  };

  const allDeckWords = useMemo(() => {
    if (!mixAllSets || mode !== "game" || (game !== "sentence" && game !== "matching")) return words;
    const mixedWords = availableSets.flatMap((set) => set.words ?? []);
    const knownIds = new Set(mixedWords.map((word) => word.id));
    return [...mixedWords, ...words.filter((word) => !knownIds.has(word.id))];
  }, [availableSets, game, mixAllSets, mode, words]);

  const sessionWords = useMemo(() => {
    const scopedWords = wordId ? allDeckWords.filter((word) => word.id === wordId) : allDeckWords;
    const available = mode === "learn" ? scopedWords.filter((word) => word.progressStatus !== "MASTERED") : scopedWords;
    const playable = mode === "game" && game === "sentence"
      ? available.filter((word) => word.example?.trim() && exampleContainsWord(word.example, word.word)
        && matchesSentenceDifficulty(word, sentenceDifficulty))
      : available;
    if (mode === "game") {
      if (game === "sentence" && gameSession?.questions?.length) {
        const wordsById = new Map(playable.map((word) => [word.id, word]));
        return gameSession.questions
          .map((questionPlan) => wordsById.get(questionPlan.wordId))
          .filter((word): word is WordItem => Boolean(word));
      }
      if (game === "sentence" && sentenceMode === "TIME_ATTACK") return playable;
      const limit = gameQuestionCount === "all" ? playable.length : gameQuestionCount;
      return playable.slice(0, limit);
    }
    return mode === "learn" && requestedCount !== "all"
      ? available.slice(0, requestedCount)
      : available;
  }, [allDeckWords, game, gameQuestionCount, gameSession, mode, requestedCount, sentenceDifficulty, sentenceMode, wordId]);

  const currentWord = sessionWords[index];
  const question = currentWord ? questionFor(mode, game, index, currentWord) : null;

  const choiceWords = useMemo(() => {
    if (!currentWord) return [];
    const plannedQuestion = gameSession?.questions?.[index];
    if (mode === "game" && game === "sentence" && plannedQuestion) {
      const wordsById = new Map(allDeckWords.map((word) => [word.id, word]));
      return plannedQuestion.optionWordIds
        .map((id) => wordsById.get(id))
        .filter((word): word is WordItem => Boolean(word));
    }
    const others = sessionWords.filter((word) => word.id !== currentWord.id);
    const offset = index % Math.max(1, others.length);
    const rotated = [...others.slice(offset), ...others.slice(0, offset)];
    const picks = [...rotated.slice(0, 3), currentWord];
    return picks.sort((a, b) => a.word.localeCompare(b.word));
  }, [allDeckWords, currentWord, game, gameSession, index, mode, sessionWords]);

  const matchingGroup = useMemo(() => {
    const groupStart = Math.floor(index / 4) * 4;
    return sessionWords.slice(groupStart, groupStart + 4).filter((word) => !resolvedMatchIds.has(word.id));
  }, [index, resolvedMatchIds, sessionWords]);

  const matchingMeanings = useMemo(() => {
    if (matchingGroup.length < 2) return matchingGroup;
    const offset = (Math.floor(index / 4) + 1) % matchingGroup.length || 1;
    return [...matchingGroup.slice(offset), ...matchingGroup.slice(0, offset)];
  }, [index, matchingGroup]);

  const isMatching = mode === "game" && game === "matching";
  const isReview = mode === "review";
  const isFinished = started && sessionWords.length > 0 && (
    index >= sessionWords.length
    || ((game === "runner" || game === "battle") && lives <= 0)
    || (mode === "game" && game === "sentence" && sentenceMode === "TIME_ATTACK" && timeLeft <= 0)
  );
  const activity: VocabularyActivityType = mode === "game" ? "GAME" : mode === "review" ? "REVIEW" : mode === "learn" ? "LEARN" : "PRACTICE";
  const setsToDisplay = availableSets.length > 0
    ? availableSets.some((set) => set.id === testSet?.id) || !testSet
      ? availableSets
      : [testSet, ...availableSets]
    : testSet ? [testSet] : [];
  const filteredSets = setsToDisplay.filter((set) => {
    const query = searchSetQuery.trim().toLowerCase();
    return !query
      || (set.title || set.name || "").toLowerCase().includes(query)
      || (set.category || "").toLowerCase().includes(query);
  });

  useEffect(() => {
    if (!started || isFinished) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1);
      setTotalSeconds((value) => value + 1);
      if (mode === "game" && game === "sentence" && sentenceMode === "TIME_ATTACK") {
        setTimeLeft((value) => Math.max(0, value - 1));
        if (!answerResult) setQuestionTimeLeft((value) => Math.max(0, value - 1));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [answerResult, game, isFinished, mode, sentenceMode, started]);

  useEffect(() => {
    if (!isFinished || !gameSession || gameResult || completionStarted.current === gameSession.id) return;
    completionStarted.current = gameSession.id;
    void completeVocabularyGameSession(gameSession.id).then(setGameResult).catch((reason: unknown) => {
      completionStarted.current = null;
      setError(reason instanceof Error ? reason.message : "Không thể lưu kết quả trò chơi.");
    });
  }, [completionRetry, gameResult, gameSession, isFinished]);

  const submitAnswer = useCallback(async (answer: string, rating?: VocabularySrsRating, timedOut = false) => {
    if (!currentWord || !question || submitting || answerResult) return;
    setSubmitting(true);
    setError(null);
    if (timedOut) setTimedOutSubmissionFailed(false);
    let requestId = gameAnswerRequestIds.current.get(index);
    if (!requestId) {
      requestId = crypto.randomUUID();
      gameAnswerRequestIds.current.set(index, requestId);
    }
    try {
      const result = await recordVocabularyAnswer({
        requestId,
        wordId: currentWord.id,
        activityType: activity,
        questionType: rating ? "FLASHCARD_RATING" : question.type,
        ...(rating ? { rating } : timedOut ? { result: "timeout" } : { answer }),
        responseTimeMs: Math.min(seconds * 1000, 600_000),
        ...(gameSession ? { gameSessionId: gameSession.id, gameQuestionIndex: index } : {}),
      });
      gameAnswerRequestIds.current.delete(index);
      setAnswerResult({ correct: result.correct, correctAnswer: result.correctAnswer });
      if (result.correct) {
        setCorrectCount((value) => value + 1);
        const nextCombo = comboCount + 1;
        setComboCount(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));
        setScore((scoreValue) => scoreValue + (game === "battle" ? 20 : 10) + Math.min(nextCombo - 1, 4) * 5);
        if (game === "battle") setEnemyHealth((health) => Math.max(0, health - (25 + Math.min(nextCombo - 1, 3) * 5)));
      } else {
        setWrongCount((value) => value + 1);
        setComboCount(0);
        setMissedWords((prev) => prev.some((w) => w.id === currentWord.id) ? prev : [...prev, currentWord]);
        if (game === "runner" || game === "battle") setLives((value) => Math.max(0, value - 1));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu câu trả lời.");
      if (timedOut) setTimedOutSubmissionFailed(true);
    } finally {
      setSubmitting(false);
    }
  }, [activity, answerResult, comboCount, currentWord, game, gameSession, index, question, seconds, submitting]);

  const submitMatchingPair = async (englishWord: WordItem, meaningWord: WordItem) => {
    if (!gameSession || submitting) return;
    setSubmitting(true);
    setError(null);
    setMatchFeedback(null);
    const isDifferentPair = englishWord.id !== meaningWord.id;
    const pair = isDifferentPair ? [englishWord, meaningWord] : [englishWord];
    const questionStart = index;
    try {
      const results = [];
      for (let pairIndex = 0; pairIndex < pair.length; pairIndex++) {
        const answerWord = pair[pairIndex];
        const chosenMeaning = isDifferentPair
          ? pair[pairIndex === 0 ? 1 : 0]
          : englishWord;
        const questionIndex = questionStart + pairIndex;
        let requestId = matchingRequestIds.current.get(questionIndex);
        if (!requestId) {
          requestId = crypto.randomUUID();
          matchingRequestIds.current.set(questionIndex, requestId);
        }
        results.push(await recordVocabularyAnswer({
          requestId,
          wordId: answerWord.id,
          activityType: "GAME",
          questionType: "ENGLISH_TO_VIETNAMESE",
          answer: getMeaning(chosenMeaning),
          responseTimeMs: Math.min(seconds * 1000, 600_000),
          gameSessionId: gameSession.id,
          gameQuestionIndex: questionIndex,
        }));
      }

      const resolvedIds = pair.map((word) => word.id);
      setResolvedMatchIds((previous) => new Set([...previous, ...resolvedIds]));
      const correctAnswers = results.filter((result) => result.correct).length;
      const incorrectAnswers = results.length - correctAnswers;
      setCorrectCount((value) => value + correctAnswers);
      setWrongCount((value) => value + incorrectAnswers);
      if (isDifferentPair) {
        setWrongMatches((value) => value + 1);
        setMissedWords((prev) => {
          const next = [...prev];
          if (!next.some((w) => w.id === englishWord.id)) next.push(englishWord);
          if (!next.some((w) => w.id === meaningWord.id)) next.push(meaningWord);
          return next;
        });
      }
      setIndex((value) => value + results.length);
      setSeconds(0);
      let combo = comboCount;
      let scoreDelta = 0;
      for (const result of results) {
        if (result.correct) {
          combo++;
          scoreDelta += 10 + Math.min(combo - 1, 4) * 5;
        } else {
          combo = 0;
        }
      }
      setComboCount(combo);
      setMaxCombo((prev) => Math.max(prev, combo));
      setScore((value) => value + scoreDelta);
      if (incorrectAnswers > 0) {
        setMatchFeedback(isDifferentPair
          ? `Cặp chưa khớp (-0đ). Đã kiểm tra các thẻ liên quan.`
          : "Cặp từ và nghĩa chưa chính xác.");
      } else {
        setMatchFeedback("Chính xác! Ghép thành công cặp từ.");
      }
      setSelectedMatchWordId(null);
      setSelectedMatchMeaningId(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể lưu kết quả ghép cặp.");
    } finally {
      setSubmitting(false);
    }
  };

  const chooseMatchWord = (wordId: string) => {
    setSelectedMatchWordId(wordId);
    setMatchFeedback(null);
    if (selectedMatchMeaningId) {
      const englishWord = matchingGroup.find((word) => word.id === wordId);
      const meaningWord = matchingGroup.find((word) => word.id === selectedMatchMeaningId);
      if (englishWord && meaningWord) void submitMatchingPair(englishWord, meaningWord);
    }
  };

  const chooseMatchMeaning = (wordId: string) => {
    setSelectedMatchMeaningId(wordId);
    setMatchFeedback(null);
    if (selectedMatchWordId) {
      const englishWord = matchingGroup.find((word) => word.id === selectedMatchWordId);
      const meaningWord = matchingGroup.find((word) => word.id === wordId);
      if (englishWord && meaningWord) void submitMatchingPair(englishWord, meaningWord);
    }
  };

  const nextQuestion = useCallback(() => {
    setIndex((value) => value + 1);
    setInput("");
    setAnswerResult(null);
    setFlipped(false);
    setSeconds(0);
    setQuestionTimeLeft(15);
    setQuestionTimedOut(false);
    setTimedOutSubmissionFailed(false);
    timedOutQuestionIndex.current = null;
    setMatchFeedback(null);
    if (game === "battle" && enemyHealth === 0) {
      setEnemyHealth(100);
      setBattleEnemy((value) => value + 1);
    }
  }, [enemyHealth, game]);

  useEffect(() => {
    if (
      mode !== "game"
      || game !== "sentence"
      || sentenceMode !== "TIME_ATTACK"
      || !started
      || isFinished
      || answerResult
      || submitting
      || questionTimeLeft > 0
      || timedOutQuestionIndex.current === index
    ) return;
    timedOutQuestionIndex.current = index;
    setQuestionTimedOut(true);
    void submitAnswer("", undefined, true);
  }, [answerResult, game, index, isFinished, mode, questionTimeLeft, sentenceMode, started, submitAnswer, submitting]);

  useEffect(() => {
    if (
      mode !== "game"
      || game !== "sentence"
      || sentenceMode !== "TIME_ATTACK"
      || !answerResult
      || isFinished
    ) return;
    const advanceTimer = window.setTimeout(nextQuestion, 700);
    return () => window.clearTimeout(advanceTimer);
  }, [answerResult, game, isFinished, mode, nextQuestion, sentenceMode]);

  // Keyboard navigation for Sentence Challenge (A/B/C/D or 1/2/3/4 & Enter)
  useEffect(() => {
    if (mode !== "game" || game !== "sentence" || !started || isFinished || questionTimedOut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (answerResult) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextQuestion();
        }
        return;
      }

      if (submitting) return;

      const key = e.key.toUpperCase();
      let selectedIdx = -1;
      if (key === "1" || key === "A") selectedIdx = 0;
      else if (key === "2" || key === "B") selectedIdx = 1;
      else if (key === "3" || key === "C") selectedIdx = 2;
      else if (key === "4" || key === "D") selectedIdx = 3;

      if (selectedIdx !== -1 && choiceWords[selectedIdx]) {
        e.preventDefault();
        void submitAnswer(choiceWords[selectedIdx].word);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answerResult, choiceWords, game, isFinished, mode, nextQuestion, questionTimedOut, started, submitAnswer, submitting]);

  const restart = () => {
    setIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setMissedWords([]);
    setLives(3);
    setEnemyHealth(100);
    setScore(0);
    setComboCount(0);
    setMaxCombo(0);
    setBattleEnemy(1);
    setWrongMatches(0);
    setSelectedMatchWordId(null);
    setSelectedMatchMeaningId(null);
    setResolvedMatchIds(new Set());
    setMatchFeedback(null);
    matchingRequestIds.current.clear();
    gameAnswerRequestIds.current.clear();
    setSeconds(0);
    setTotalSeconds(0);
    setTimeLeft(timeLimitSeconds);
    setQuestionTimeLeft(15);
    setQuestionTimedOut(false);
    setTimedOutSubmissionFailed(false);
    timedOutQuestionIndex.current = null;
    setInput("");
    setAnswerResult(null);
    setStarted(true);
  };

  const startGame = async () => {
    if (!selectedSetId || !game) return;
    setError(null);
    setSubmitting(true);
    try {
      const session = await startVocabularyGameSession({
        setId: selectedSetId,
        gameType: gameTypeByMode[game],
        ...((game === "sentence" || game === "matching") && mixAllSets
          ? {
            deckIds: [...new Set([
              selectedSetId,
              ...availableSets.map((set) => set.id),
              ...allDeckWords.map((word) => word.setId).filter((id): id is string => typeof id === "string" && id.length > 0),
            ])],
          }
          : {}),
        ...(game === "sentence" ? {
          mode: sentenceMode,
          difficulty: sentenceDifficulty,
          ...(sentenceMode === "TIME_ATTACK" ? { timeLimitSeconds } : {}),
          ...(sentenceMode === "CLASSIC" && gameQuestionCount !== "all"
            ? { questionCount: gameQuestionCount }
            : {}),
        } : {}),
      });
      setGameSession(session);
      setGameResult(null);
      completionStarted.current = null;
      setIndex(0);
      setCorrectCount(0);
      setWrongCount(0);
      setMissedWords([]);
      setLives(3);
      setEnemyHealth(100);
      setScore(0);
      setComboCount(0);
      setMaxCombo(0);
      setBattleEnemy(1);
      setWrongMatches(0);
      setSelectedMatchWordId(null);
      setSelectedMatchMeaningId(null);
      setResolvedMatchIds(new Set());
      setMatchFeedback(null);
      matchingRequestIds.current.clear();
      gameAnswerRequestIds.current.clear();
      setSeconds(0);
      setTotalSeconds(0);
      setTimeLeft(timeLimitSeconds);
      setQuestionTimeLeft(15);
      setQuestionTimedOut(false);
      setTimedOutSubmissionFailed(false);
      timedOutQuestionIndex.current = null;
      setInput("");
      setAnswerResult(null);
      setStarted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể bắt đầu trò chơi.");
    } finally {
      setSubmitting(false);
    }
  };

  const retryGameCompletion = () => {
    if (!gameSession) return;
    completionStarted.current = null;
    setError(null);
    setCompletionRetry((retry) => retry + 1);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-3 py-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 px-3 py-6">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 shadow-sm">
          {loadError}
        </div>
        <Link
          href={mode === "game" ? "/vocabulary/games" : "/vocabulary"}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
      </main>
    );
  }

  // ── Vocabulary Runner: dedicated full-screen game ─────────────────────────
  if (mode === "game" && game === "runner" && testSet) {
    return (
      <VocabularyRunnerGame
        key={setId ?? "runner"}
        setId={setId ?? ""}
        testSet={testSet}
        words={sessionWords}
        initialSession={gameSession}
        onComplete={(result) => {
          setGameResult(result);
        }}
        onBackToCenter={() => {
          if (typeof window !== "undefined") window.location.href = "/vocabulary/games";
        }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEDICATED MODERN GAME UI FOR SENTENCE CHALLENGE & WORD MATCHING
  // (Crafted with crisp light/dark contrasts suitable for white/light dashboard)
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "game") {
    const isSentence = game === "sentence";
    const gameTitle = isSentence ? "SENTENCE MASTER" : "Ghép Cặp Từ Vựng 🧩";
    const gameSubtitle = isSentence
      ? "Complete. Think. Master. · Luyện từ vựng trong ngữ cảnh TOEIC"
      : "Rèn luyện trí nhớ và phản xạ kết nối từ Anh - Việt";
    const GameIcon = isSentence ? Gamepad2 : Brain;
    const progressPercent = sessionWords.length > 0 ? Math.min(100, Math.round(((index + (answerResult ? 1 : 0)) / sessionWords.length) * 100)) : 0;
    const resultCorrectCount = gameResult?.correctCount ?? correctCount;
    const resultWrongCount = gameResult?.wrongCount ?? wrongCount;
    const resultAccuracy = Math.round((resultCorrectCount / (resultCorrectCount + resultWrongCount || 1)) * 100);
    const resultDurationSeconds = gameResult?.durationSeconds ?? totalSeconds;

    return (
      <main className={`mx-auto max-w-5xl space-y-6 px-3 py-2 sm:px-6 sm:py-4 pb-16 ${isGameDarkMode ? "bg-slate-950 min-h-screen rounded-2xl" : ""}`}>
        {/* ── Game Top Bar (Clean White Card) ── */}
        <header className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 shadow-sm ${isGameDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-3">
            <Link
              href="/vocabulary/games"
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-extrabold shadow-sm transition hover:border-slate-300 active:scale-95 ${isGameDarkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trung tâm trò chơi</span>
              <span className="sm:hidden">Thoát</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex rounded-xl p-2.5 ${isSentence ? (isGameDarkMode ? "bg-indigo-900/60 text-indigo-300 border border-indigo-700" : "bg-indigo-50 text-indigo-700 border border-indigo-200") : (isGameDarkMode ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700" : "bg-emerald-50 text-emerald-700 border border-emerald-200")}`}>
                <GameIcon className="h-5 w-5" />
              </span>
              <div>
                <h1 className={`text-sm sm:text-base font-black ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>{gameTitle}</h1>
                <p className={`text-[11px] font-bold truncate max-w-[180px] sm:max-w-xs ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>{testSet?.title}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* In-game HUD */}
            {started && !isFinished && (
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black">
                <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 shadow-sm ${isGameDarkMode ? "border-amber-700 bg-amber-900/40 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span title="Điểm tạm tính; kết quả cuối được máy chủ xác nhận">{score}</span>
                </div>
                <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 shadow-sm ${isGameDarkMode ? "border-rose-700 bg-rose-900/40 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
                  <Flame className="h-4 w-4 text-rose-500 animate-pulse" />
                  <span>x{comboCount}</span>
                </div>
                <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 shadow-sm ${isGameDarkMode ? "border-blue-700 bg-blue-900/40 text-blue-300" : "border-blue-200 bg-blue-50 text-blue-800"}`}>
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{isSentence && sentenceMode === "TIME_ATTACK" ? `${timeLeft}s` : `${seconds}s`}</span>
                </div>
                {isSentence && sentenceMode === "TIME_ATTACK" && answerResult === null ? (
                  <div className={`rounded-xl border px-2.5 py-1.5 font-black ${isGameDarkMode ? "border-indigo-700 bg-indigo-900/40 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-800"}`}>
                    Câu: {questionTimeLeft}s
                  </div>
                ) : null}
              </div>
            )}

            {/* Dark/Light toggle */}
            <button
              type="button"
              onClick={() => setIsGameDarkMode((d) => !d)}
              aria-label={isGameDarkMode ? "Chế độ sáng" : "Chế độ tối"}
              title={isGameDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              className={`shrink-0 rounded-xl border p-2 shadow-sm transition hover:scale-105 active:scale-95 ${isGameDarkMode ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              {isGameDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ── LOBBY SCREEN (Not Started) ── */}
        {!started && (
          <section className={`overflow-hidden rounded-3xl p-6 sm:p-10 shadow-lg text-center ${isGameDarkMode ? "border border-slate-700 bg-slate-900 text-white" : "border-2 border-slate-200 bg-white text-slate-900"}`}>
            <div className={`mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl shadow-sm ${isSentence ? (isGameDarkMode ? "bg-indigo-900/60 border-2 border-indigo-700 text-indigo-300" : "bg-indigo-50 border-2 border-indigo-200 text-indigo-600") : (isGameDarkMode ? "bg-emerald-900/60 border-2 border-emerald-700 text-emerald-300" : "bg-emerald-50 border-2 border-emerald-200 text-emerald-600")}`}>
              <GameIcon className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <span className={`mt-4 inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isSentence ? (isGameDarkMode ? "bg-indigo-900/80 text-indigo-300" : "bg-indigo-100 text-indigo-800") : (isGameDarkMode ? "bg-emerald-900/80 text-emerald-300" : "bg-emerald-100 text-emerald-800")}`}>
              {isSentence ? "COMPLETE. THINK. MASTER." : "VOCABULARY PAIRING"}
            </span>

            <h2 className={`mt-3 text-2xl sm:text-4xl font-black ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>{gameTitle}</h2>
            <p className={`mx-auto mt-2 max-w-xl text-sm leading-relaxed font-medium ${isGameDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              {gameSubtitle}
            </p>

            {/* Deck & Settings Card */}
            <div className="mx-auto mt-6 max-w-lg space-y-4 text-left">
              {/* Deck info */}
              <div className={`rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50/80"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>Bộ đề áp dụng</p>
                  {isSentence || isMatching ? (
                    <button
                      type="button"
                      onClick={() => setIsSetPickerOpen(true)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${isGameDarkMode ? "border-indigo-700 bg-indigo-900/50 text-indigo-200 hover:bg-indigo-900" : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"}`}
                    >
                      <FolderKanban className="h-3.5 w-3.5" />
                      Chọn bộ đề
                    </button>
                  ) : null}
                </div>
                <p className={`truncate text-base font-black mt-0.5 ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>{testSet?.title || "Bộ từ vựng"}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className={`rounded-md px-2 py-0.5 font-bold ${isGameDarkMode ? "bg-indigo-900/80 text-indigo-300" : "bg-indigo-100 text-indigo-800"}`}>
                    {sessionWords.length} câu hỏi khả dụng
                  </span>
                  {isSentence && (
                    <span className={`text-[11px] font-medium ${isGameDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                      (Câu được lọc theo từ loại, trình độ và dữ liệu từ vựng)
                    </span>
                  )}
                </div>
                {isSentence || isMatching ? (
                  <button
                    type="button"
                    aria-pressed={mixAllSets}
                    disabled={availableSets.length === 0}
                    onClick={() => setMixAllSets((current) => !current)}
                    className={`mt-3 w-full rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      mixAllSets
                        ? isGameDarkMode ? "border-indigo-500 bg-indigo-900/60 text-indigo-200" : "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {mixAllSets
                      ? `Đang trộn ${availableSets.length} bộ đề · tất cả cấp độ`
                      : "Chỉ dùng bộ đề này · tất cả cấp độ"}
                  </button>
                ) : null}
                {isSentence ? (
                  <p className={`mt-2 text-xs font-semibold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Gợi ý nghĩa sẽ mở sau {SENTENCE_HINT_WRONG_ANSWER_THRESHOLD} câu trả lời sai trong ván.
                  </p>
                ) : null}
              </div>

              {isSentence ? (
                <div>
                  <p className={`mb-2 text-xs font-black uppercase tracking-wider ${isGameDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Cấp độ khó
                  </p>
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {([
                      { value: "ALL", label: "Tất cả", levels: "CEFR A1–C2" },
                      { value: "EASY", label: "Dễ", levels: "CEFR A1–A2" },
                      { value: "MEDIUM", label: "Trung bình", levels: "CEFR B1–B2" },
                      { value: "HARD", label: "Khó", levels: "CEFR C1–C2" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSentenceDifficulty(option.value)}
                        aria-pressed={sentenceDifficulty === option.value}
                        className={`rounded-xl border-2 p-2 text-left transition ${
                          sentenceDifficulty === option.value
                            ? isGameDarkMode ? "border-indigo-500 bg-indigo-900/50 text-indigo-200" : "border-indigo-600 bg-indigo-50 text-indigo-950"
                            : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <span className="block text-xs font-black sm:text-sm">{option.label}</span>
                        <span className="mt-1 block text-[10px] font-semibold">{option.levels}</span>
                      </button>
                    ))}
                  </div>
                  <p className={`mb-2 text-xs font-black uppercase tracking-wider ${isGameDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    Chọn chế độ chơi
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([
                      { id: "CLASSIC", title: "Classic", detail: "Không giới hạn giờ · chọn 10, 20 hoặc tất cả câu" },
                      { id: "TIME_ATTACK", title: "Time Attack", detail: "30–120 giây · mỗi câu tối đa 15 giây" },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSentenceMode(option.id)}
                        aria-pressed={sentenceMode === option.id}
                        className={`rounded-xl border-2 p-3 text-left transition ${
                          sentenceMode === option.id
                            ? isGameDarkMode ? "border-indigo-500 bg-indigo-900/50 text-indigo-200" : "border-indigo-600 bg-indigo-50 text-indigo-950"
                            : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <span className="block text-sm font-black">{option.title}</span>
                        <span className="mt-1 block text-[11px] font-semibold">{option.detail}</span>
                      </button>
                    ))}
                  </div>
                  {sentenceMode === "TIME_ATTACK" ? (
                    <div className="mt-3">
                      <p className={`mb-2 text-xs font-bold ${isGameDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                        Thời lượng trận
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {([30, 60, 90, 120] as const).map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => setTimeLimitSeconds(duration)}
                            aria-pressed={timeLimitSeconds === duration}
                            className={`rounded-lg border px-3 py-2 text-sm font-black ${
                              timeLimitSeconds === duration
                                ? isGameDarkMode ? "border-indigo-500 bg-indigo-900/70 text-indigo-200" : "border-indigo-600 bg-indigo-50 text-indigo-900"
                                : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {duration}s
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Question Count Selection */}
              {(!isSentence || sentenceMode === "CLASSIC") ? (
              <div>
                <label className={`text-xs font-black uppercase tracking-wider block mb-2 ${isGameDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Số lượng câu trong lượt chơi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([10, 20, "all"] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGameQuestionCount(cnt)}
                      className={`rounded-xl border-2 py-2.5 text-xs sm:text-sm font-black transition ${
                        gameQuestionCount === cnt
                          ? isGameDarkMode ? "border-indigo-500 bg-indigo-900/80 text-indigo-200 shadow-sm" : "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm"
                          : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {cnt === "all" ? `Tất cả (${sessionWords.length})` : `${cnt} câu`}
                    </button>
                  ))}
                </div>
              </div>
              ) : null}
            </div>

            {isSentence && sessionWords.length === 0 ? (
              <div className={`mx-auto mt-4 max-w-lg rounded-2xl border p-4 text-xs font-semibold text-left ${isGameDarkMode ? "border-amber-700/50 bg-amber-900/30 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                Chưa có câu hỏi phù hợp với lựa chọn cấp độ này. Hãy chọn cấp độ khác hoặc đổi phạm vi bộ đề.
              </div>
            ) : null}

            {error ? (
              <div role="alert" className={`mx-auto mt-4 max-w-lg rounded-2xl border p-3 text-xs font-semibold ${isGameDarkMode ? "border-red-700/50 bg-red-900/30 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/vocabulary/games"
                className={`inline-flex items-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-sm sm:text-base font-extrabold shadow-sm transition hover:scale-105 active:scale-95 ${isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại chọn game
              </Link>
              <button
                type="button"
                disabled={submitting || sessionWords.length === 0}
                onClick={() => void startGame()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 px-8 py-3.5 text-sm sm:text-base font-black text-white shadow-lg shadow-indigo-600/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
              >
                <Zap className="h-5 w-5" />
                <span>{submitting ? "Đang chuẩn bị phòng đấu..." : "Bắt đầu trò chơi ngay"}</span>
              </button>
            </div>

            {isSentence && isSetPickerOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
                <div className="flex max-h-[85dvh] w-full max-w-md flex-col space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl sm:rounded-3xl sm:p-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-sm font-extrabold text-slate-900 sm:text-base">Chọn bộ đề từ vựng</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSetPickerOpen(false)}
                      aria-label="Đóng danh sách bộ đề"
                      className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchSetQuery}
                      onChange={(event) => setSearchSetQuery(event.target.value)}
                      placeholder="Tìm bộ đề..."
                      aria-label="Tìm bộ đề"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-500"
                    />
                  </div>
                  <div className="max-h-[50dvh] flex-1 space-y-1.5 overflow-y-auto pr-1">
                    {isLoadingSet ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm font-bold text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        Đang tải bộ đề...
                      </div>
                    ) : filteredSets.length === 0 ? (
                      <p className="py-6 text-center text-sm text-slate-400">Không tìm thấy bộ đề phù hợp.</p>
                    ) : filteredSets.map((set) => {
                      const isSelected = set.id === selectedSetId;
                      return (
                        <button
                          key={set.id}
                          type="button"
                          disabled={isLoadingSet}
                          onClick={() => void handleSelectVocabularySet(set)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50/90 font-bold text-indigo-950"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="min-w-0 pr-2">
                            <span className="block truncate text-sm font-bold">{set.title || set.name || set.id}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {set.category || "Từ vựng TOEIC"} · {set.wordCount ?? set.words?.length ?? 0} từ
                            </span>
                          </span>
                          {isSelected
                            ? <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                            : <span className="shrink-0 text-xs font-bold text-indigo-600">Chọn</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSetPickerOpen(false)}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* ── FINISHED SCREEN (Results) ── */}
        {started && isFinished && (
          <section className={`overflow-hidden rounded-3xl border-2 p-6 sm:p-10 shadow-xl text-center ${isGameDarkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-2 shadow-md ${isGameDarkMode ? "border-amber-500 bg-amber-900/40 text-amber-400" : "border-amber-300 bg-amber-50 text-amber-600"}`}>
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>

            <h2 className={`mt-4 text-2xl sm:text-4xl font-black ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>Hoàn Thành Thử Thách! 🎉</h2>
            <p className={`mt-1 text-sm font-medium ${isGameDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            {gameResult
              ? "Kết quả đã được máy chủ xác nhận và cập nhật tiến độ ôn tập SRS."
              : error
                ? "Chưa xác nhận được kết quả. Hãy thử lưu lại trước khi rời màn hình."
                : "Đang xác nhận điểm và đồng bộ tiến độ ôn tập SRS..."}
            </p>

            {/* Performance Rating Badge */}
            <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-black shadow-sm ${isGameDarkMode ? "border-amber-600/50 bg-amber-900/40 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-800"}`}>
              {!gameResult ? (
                <>ĐANG CHỜ XÁC NHẬN</>
              ) : resultAccuracy >= 90 ? (
                <>🏆 XUẤT SẮC - S TIER</>
              ) : resultAccuracy >= 80 ? (
                <>⭐ RẤT TỐT - A TIER</>
              ) : resultAccuracy >= 70 ? (
                <>👍 HOÀN THÀNH - B TIER</>
              ) : (
                <>📘 CẦN LUYỆN THÊM - C TIER</>
              )}
            </div>

            {/* Stats Grid */}
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left">
              <div className={`rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-[11px] font-bold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {gameResult ? "Điểm đã xác nhận" : "Điểm tạm tính"}
                </p>
                <p className={`mt-1 text-xl sm:text-2xl font-black ${isGameDarkMode ? "text-amber-400" : "text-amber-600"}`}>
                  {gameResult?.score ?? score}
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-[11px] font-bold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {gameResult ? "Độ chính xác" : "Độ chính xác tạm tính"}
                </p>
                <p className={`mt-1 text-xl sm:text-2xl font-black ${isGameDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                  {resultAccuracy}%
                </p>
                <p className={`mt-1 text-[10px] font-semibold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Đúng {resultCorrectCount} · Sai {resultWrongCount}
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-[11px] font-bold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>Chuỗi Combo max</p>
                <p className={`mt-1 text-xl sm:text-2xl font-black ${isGameDarkMode ? "text-rose-400" : "text-rose-600"}`}>
                  {gameResult?.maxCombo ?? maxCombo}
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-[11px] font-bold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>Thời gian</p>
                <p className={`mt-1 text-xl sm:text-2xl font-black ${isGameDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                  {Math.floor(resultDurationSeconds / 60)}:{String(resultDurationSeconds % 60).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* Missed Words Review List */}
            {missedWords.length > 0 && (
              <div className={`mx-auto mt-6 max-w-xl text-left rounded-2xl border p-4 ${isGameDarkMode ? "border-rose-800/50 bg-rose-900/20" : "border-rose-200 bg-rose-50/40"}`}>
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isGameDarkMode ? "text-rose-400" : "text-rose-800"}`}>
                  <XCircle className="h-4 w-4" /> Từ cần củng cố lại ({missedWords.length} từ):
                </h3>
                <div className="mt-3 divide-y divide-rose-100/20 max-h-48 overflow-y-auto">
                  {missedWords.map((w) => (
                    <div key={w.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className={`font-black text-sm ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>{w.word}</span>
                        {w.ipa && <span className={`ml-2 font-medium ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>/{w.ipa}/</span>}
                        <p className={`font-medium mt-0.5 ${isGameDarkMode ? "text-slate-300" : "text-slate-700"}`}>{getMeaning(w)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playWord(w)}
                        className={`rounded-lg p-1.5 transition ${isGameDarkMode ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-900/40" : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"}`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && !gameResult && (
              <div role="alert" className={`mx-auto mt-4 max-w-lg rounded-2xl border p-3 text-xs font-semibold ${isGameDarkMode ? "border-red-700/50 bg-red-900/30 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
                {error}
                <button
                  type="button"
                  onClick={retryGameCompletion}
                  className="ml-2 underline font-bold"
                >
                  Thử lưu lại
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                disabled={!gameResult}
                onClick={() => {
                  setStarted(false);
                  setGameSession(null);
                  setGameResult(null);
                  completionStarted.current = null;
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" /> Chơi lại ván mới
              </button>
              <Link
                href="/vocabulary/games"
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold shadow-sm transition active:scale-95 ${isGameDarkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <ArrowLeft className="h-4 w-4" /> Về Game Center
              </Link>
            </div>
          </section>
        )}

        {/* ── IN-GAME PLAYING ARENA ── */}
        {started && currentWord && question && !isFinished && (
          <section className="space-y-4">
            {/* Progress Bar & Question Info */}
            <div className={`rounded-2xl border p-3.5 shadow-sm ${isGameDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <div className={`flex items-center justify-between text-xs font-black mb-2 ${isGameDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                <span>Câu hỏi {index + 1} / {sessionWords.length}</span>
                <span>{progressPercent}% hoàn thành</span>
              </div>
              <div className={`h-2.5 w-full rounded-full overflow-hidden ${isGameDarkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                <div
                  className={`h-full transition-all duration-300 ${isSentence ? "bg-indigo-500" : "bg-emerald-500"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* ── SENTENCE CHALLENGE ARENA ── */}
            {isSentence && (
              <div className={`rounded-3xl border-2 p-6 sm:p-8 shadow-md space-y-6 ${isGameDarkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${isGameDarkMode ? "bg-indigo-900/60 border-indigo-700 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700"}`}>
                    Điền từ thích hợp vào chỗ trống
                  </span>
                  <button
                    type="button"
                    onClick={() => playWord(currentWord)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${isGameDarkMode ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-indigo-300" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-indigo-600"}`}
                    title="Phát âm từ vựng"
                  >
                    <Volume2 className="h-4 w-4 text-indigo-500" /> Nghe từ đích
                  </button>
                </div>

                {/* Sentence Display Card */}
                <div className={`rounded-2xl border-2 p-6 sm:p-8 shadow-inner text-left ${isGameDarkMode ? "border-indigo-800/60 bg-indigo-950/40" : "border-indigo-100 bg-indigo-50/40"}`}>
                  <p className={`text-lg sm:text-2xl font-extrabold leading-relaxed ${isGameDarkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {question.prompt.split("______").map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className={`mx-1.5 inline-block rounded-xl border-2 px-3.5 py-0.5 font-black shadow-sm ${isGameDarkMode ? "border-indigo-500 bg-slate-800 text-indigo-300" : "border-indigo-400 bg-white text-indigo-700"}`}>
                            {answerResult ? answerResult.correctAnswer : "______"}
                          </span>
                        )}
                      </span>
                    ))}
                  </p>

                  {wrongCount >= SENTENCE_HINT_WRONG_ANSWER_THRESHOLD ? (
                    <p className={`mt-3 text-xs sm:text-sm font-semibold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Gợi ý nghĩa: <span className={`font-extrabold ${isGameDarkMode ? "text-slate-200" : "text-slate-800"}`}>{getMeaning(currentWord)}</span>
                    </p>
                  ) : null}
                </div>

                {/* 4 Choices Grid */}
                {!answerResult && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {choiceWords.map((word, idx) => {
                      const letters = ["A", "B", "C", "D"];
                      return (
                        <button
                          key={word.id}
                          type="button"
                          disabled={submitting || questionTimedOut}
                          onClick={() => void submitAnswer(word.word)}
                          className={`group flex items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:scale-[0.98] disabled:opacity-50 ${isGameDarkMode ? "border-slate-700 bg-slate-800 hover:border-indigo-500 hover:bg-indigo-900/40" : "border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/40"}`}
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-colors group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white ${isGameDarkMode ? "border-slate-600 bg-slate-700 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}>
                            {letters[idx]}
                          </span>
                          <span className={`text-base font-black ${isGameDarkMode ? "text-slate-100 group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
                            {word.word}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {error ? (
                  <div role="alert" className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm ${isGameDarkMode ? "border-red-700/50 bg-red-900/30 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
                    <span>{error}</span>
                    {timedOutSubmissionFailed && !submitting ? (
                      <button
                        type="button"
                        onClick={() => void submitAnswer("", undefined, true)}
                        className="rounded-lg bg-red-700 px-3 py-1.5 font-bold text-white"
                      >
                        Thử lưu lại
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {/* Answer Feedback Banner */}
                {answerResult && (
                  <div
                    className={`rounded-2xl border-2 p-5 transition-all shadow-sm ${
                      answerResult.correct
                        ? isGameDarkMode ? "border-emerald-700 bg-emerald-900/30 text-emerald-100" : "border-emerald-300 bg-emerald-50 text-emerald-950"
                        : isGameDarkMode ? "border-rose-700 bg-rose-900/30 text-rose-100" : "border-rose-300 bg-rose-50 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        {answerResult.correct ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-6 w-6 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-black text-base">
                            {answerResult.correct ? "Chính xác! Xuất sắc." : "Chưa chính xác!"}
                          </p>
                          <p className={`text-xs font-semibold mt-0.5 ${isGameDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                            Đáp án đúng: <strong className={`font-black ${isGameDarkMode ? "text-white" : "text-slate-950"}`}>{answerResult.correctAnswer}</strong>
                            {" · "}{getMeaning(currentWord)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        autoFocus
                        onClick={nextQuestion}
                        className={`rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black shadow-md transition hover:opacity-90 active:scale-95 ${isGameDarkMode ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                      >
                        {index + 1 >= sessionWords.length ? "Xem tổng kết" : "Tiếp tục (Enter ↵)"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── WORD MATCHING ARENA ── */}
            {isMatching && (
              <div className={`rounded-3xl border-2 p-6 sm:p-8 shadow-md space-y-6 ${isGameDarkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}>
                <div>
                  <h2 className={`text-base sm:text-lg font-black ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>
                    Chọn một từ tiếng Anh và ghép với thẻ nghĩa tương ứng
                  </h2>
                  <p className={`text-xs font-semibold mt-1 ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Bấm thẻ từ tiếng Anh trước hoặc thẻ nghĩa tiếng Việt trước đều được.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Left Column: English Words */}
                  <div className={`space-y-3 rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50/70"}`}>
                    <p className={`text-xs font-black uppercase tracking-wider ${isGameDarkMode ? "text-indigo-400" : "text-indigo-700"}`}>Từ tiếng Anh</p>
                    <div className="space-y-2.5">
                      {matchingGroup.map((word) => {
                        const isSelected = selectedMatchWordId === word.id;
                        return (
                          <button
                            key={word.id}
                            type="button"
                            disabled={submitting}
                            onClick={() => chooseMatchWord(word.id)}
                            className={`w-full rounded-2xl border-2 p-3.5 text-left font-black transition active:scale-[0.98] ${
                              isSelected
                                ? isGameDarkMode ? "border-indigo-500 bg-indigo-900/60 text-indigo-200 ring-2 ring-indigo-500/50 shadow-md" : "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/50 shadow-md"
                                : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-indigo-500 hover:bg-indigo-900/30 shadow-sm" : "border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/20 shadow-sm"
                            }`}
                          >
                            <span className="text-base">{word.word}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Vietnamese Meanings */}
                  <div className={`space-y-3 rounded-2xl border p-4 ${isGameDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50/70"}`}>
                    <p className={`text-xs font-black uppercase tracking-wider ${isGameDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>Nghĩa tiếng Việt</p>
                    <div className="space-y-2.5">
                      {matchingMeanings.map((word) => {
                        const isSelected = selectedMatchMeaningId === word.id;
                        return (
                          <button
                            key={word.id}
                            type="button"
                            disabled={submitting}
                            onClick={() => chooseMatchMeaning(word.id)}
                            className={`w-full rounded-2xl border-2 p-3.5 text-left text-sm font-bold transition active:scale-[0.98] ${
                              isSelected
                                ? isGameDarkMode ? "border-emerald-500 bg-emerald-900/60 text-emerald-200 ring-2 ring-emerald-500/50 shadow-md" : "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/50 shadow-md"
                                : isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-emerald-500 hover:bg-emerald-900/30 shadow-sm" : "border-slate-200 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/20 shadow-sm"
                            }`}
                          >
                            <span>{getMeaning(word)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Match Feedback message */}
                {matchFeedback && (
                  <div
                    role="status"
                    className={`rounded-2xl border-2 p-4 text-xs sm:text-sm font-bold shadow-sm ${
                      matchFeedback.startsWith("Chính xác")
                        ? isGameDarkMode ? "border-emerald-700 bg-emerald-900/30 text-emerald-300" : "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : isGameDarkMode ? "border-amber-700 bg-amber-900/30 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-900"
                    }`}
                  >
                    {matchFeedback}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEFAULT WORKSPACE (LEARN / PRACTICE / REVIEW SRS)
  // ══════════════════════════════════════════════════════════════════════════
  const title = mode === "learn" ? "Học từ mới"
    : mode === "practice" ? "Luyện tập từ vựng"
      : isReview ? "Ôn tập SRS"
        : "Hoạt động từ vựng";

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-3 py-4 sm:px-6 sm:py-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link href="/vocabulary" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700">
            <ArrowLeft className="h-4 w-4" /> Kho từ vựng
          </Link>
          <h1 className="mt-2 text-2xl font-black text-slate-950">{title}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{testSet?.title || "Từ vựng đến hạn"}{currentWord ? ` · ${Math.min(index + 1, sessionWords.length)}/${sessionWords.length}` : ""}</p>
        </div>
        {started && !isFinished ? (
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <span>{seconds}s</span>
          </div>
        ) : null}
      </header>

      {mode === "learn" && !started ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Chọn số từ trong phiên học</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{words.filter((word) => word.progressStatus !== "MASTERED").length} từ chưa ghi nhớ tốt trong bộ này.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {([5, 10, 20, "all"] as const).map((count) => (
              <button key={count} type="button" onClick={() => setRequestedCount(count)} className={`rounded-xl border px-4 py-2 text-sm font-bold ${requestedCount === count ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 text-slate-700"}`}>
                {count === "all" ? "Tất cả từ chưa học" : `${count} từ`}
              </button>
            ))}
          </div>
          <button type="button" disabled={sessionWords.length === 0} onClick={() => setStarted(true)} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Bắt đầu phiên</button>
        </section>
      ) : null}

      {started && isFinished ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Sparkles className="mx-auto h-10 w-10 text-amber-500" />
          <h2 className="mt-3 text-2xl font-black text-slate-900">Hoàn thành phiên học</h2>
          <p className="mt-2 font-semibold text-slate-600">Đúng {correctCount} · Sai {wrongCount} · Thời gian {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, "0")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"><RotateCcw className="h-4 w-4" />Làm lại</button>
            {selectedSetId ? <Link href={`/vocabulary/${selectedSetId}/practice`} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Luyện tập tiếp</Link> : null}
            <Link href="/vocabulary" className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">Về kho từ</Link>
          </div>
        </section>
      ) : null}

      {started && sessionWords.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <AudioLines className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-bold text-slate-800">{isReview ? "Không có từ nào đến hạn ôn." : "Không còn từ mới trong bộ từ này."}</p>
        </section>
      ) : null}

      {started && currentWord && question && !isFinished ? (
        <section className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-700">{isReview ? "Tự đánh giá khả năng ghi nhớ" : question.type === "FILL_IN_BLANK" ? "Điền từ còn thiếu" : question.audio ? "Thử thách nghe" : question.expectsEnglish ? "Gợi ý nghĩa tiếng Việt" : "Chọn nghĩa tiếng Việt đúng"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black text-slate-950">{question.audio ? "•••" : question.prompt}</h2>
              {question.audio ? <button type="button" onClick={() => playWord(currentWord)} className="rounded-full bg-indigo-600 p-3 text-white" aria-label="Phát âm"><Volume2 className="h-5 w-5" /></button> : null}
              {isReview && !flipped ? <button type="button" onClick={() => setFlipped(true)} className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">Lật thẻ · hiện đáp án</button> : null}
            </div>
            {(isReview && flipped) || mode === "learn" ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-black text-slate-900">{currentWord.word} <span className="font-normal text-slate-500">{currentWord.ipa}</span></p>
                <p className="mt-1 font-semibold text-slate-700">{getMeaning(currentWord)}</p>
                {currentWord.example ? <p className="mt-2 text-sm italic text-slate-600">{currentWord.example}</p> : null}
              </div>
            ) : null}

            {question.expectsEnglish && !answerResult ? (
              <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void submitAnswer(input); }}>
                <input value={input} onChange={(event) => setInput(event.target.value)} disabled={submitting} autoComplete="off" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500" placeholder="Nhập từ tiếng Anh" aria-label="Câu trả lời" />
                <button disabled={submitting || !input.trim()} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{submitting ? "Đang kiểm tra..." : "Kiểm tra"}</button>
              </form>
            ) : null}
            {!question.expectsEnglish && !isReview && !answerResult ? (
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {choiceWords.map((word) => (
                  <button key={word.id} type="button" disabled={submitting} onClick={() => void submitAnswer(getMeaning(word))} className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-bold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50">{getMeaning(word)}</button>
                ))}
              </div>
            ) : null}
            {isReview && flipped && !answerResult ? (
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["AGAIN", "HARD", "GOOD", "EASY"] as const).map((rating) => (
                  <button key={rating} type="button" disabled={submitting} onClick={() => void submitAnswer(rating, rating)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 hover:bg-indigo-50 disabled:opacity-50">{rating}</button>
                ))}
              </div>
            ) : null}
            {answerResult ? (
              <div className={`mt-5 rounded-xl border p-4 ${answerResult.correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                <p className="flex items-center gap-2 font-bold">{answerResult.correct ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-rose-600" />}{answerResult.correct ? "Chính xác!" : "Cần ôn lại"} <span className="font-normal text-slate-700">Đáp án: {answerResult.correctAnswer}</span></p>
                <button type="button" onClick={nextQuestion} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{index + 1 >= sessionWords.length ? "Xem kết quả" : "Tiếp tục"}</button>
              </div>
            ) : null}
            {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500 font-semibold">
            <span>Đúng {correctCount} · Sai {wrongCount}</span>
            <span>{sessionWords.length - index} câu còn lại</span>
          </div>
        </section>
      ) : null}

      {!started && mode !== "learn" && words.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <AudioLines className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-bold text-slate-800">{isReview ? "Không có từ nào đến hạn ôn." : "Bộ từ vựng chưa có từ để học."}</p>
        </section>
      ) : null}
    </main>
  );
}
