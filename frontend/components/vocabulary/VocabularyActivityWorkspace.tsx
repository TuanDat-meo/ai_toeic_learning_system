"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowLeft,
  AudioLines,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  ChevronDown,
  Flame,
  FolderKanban,
  Gamepad2,
  Heart,
  HelpCircle,
  LayoutGrid,
  Loader2,
  Moon,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Swords,
  Trophy,
  Volume2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import type { VocabularyTestSet, WordItem } from "@/app/admin/content/vocabulary/types";
import { normalizeVocabularyPartOfSpeech } from "@/lib/vocabulary-part-of-speech";
import {
  getDueVocabularyWords,
  getWeakVocabularyWords,
  getVocabularySet,
  getVocabularySets,
  completeVocabularyGameSession,
  recordVocabularyAnswer,
  recordMatchingAttempt,
  startVocabularyGameSession,
  type VocabularyActivityType,
  type VocabularyGameSession,
  type VocabularyGameType,
  type VocabularyQuestionType,
  type VocabularySrsRating,
} from "@/lib/api/vocabulary";
import VocabularyRunnerGame from "@/components/vocabulary/VocabularyRunnerGame";
import { shuffleArray } from "@/components/vocabulary/runner/spacedRepetition";
import { getWordLevel, type WordLevelTag } from "./runner/wordSelector";

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
  weakWordIds?: string[];
  weakReview?: boolean;
}

type SentenceDifficulty = "ALL" | "EASY" | "MEDIUM" | "HARD";
const SENTENCE_HINT_WRONG_ANSWER_THRESHOLD = 3;

export interface MatchingDifficultyOption {
  id: string;
  name: string;
  gridText: string;
  pairs: number;
  badge?: string;
  desc: string;
}

export const MATCHING_DIFFICULTIES: MatchingDifficultyOption[] = [
  { id: "easy", name: "Dễ (2×4)", gridText: "Lưới 2×4 (8 thẻ)", pairs: 4, desc: "4 cặp từ · Làm quen & nhớ nhanh" },
  { id: "medium", name: "Vừa (3×4)", gridText: "Lưới 3×4 (12 thẻ)", pairs: 6, desc: "6 cặp từ · Rèn luyện phản xạ" },
  { id: "standard", name: "Chuẩn (4×4)", gridText: "Lưới 4×4 (16 thẻ)", pairs: 8, badge: "Kinh điển", desc: "8 cặp từ · Cân bằng hoàn hảo" },
  { id: "challenge", name: "Thử thách (4×5)", gridText: "Lưới 4×5 (20 thẻ)", pairs: 10, badge: "Tối đa", desc: "10 cặp từ · Giới hạn thử thách cao nhất" },
];

export interface MatchingBoardCard {
  id: string;
  wordId: string;
  side: "word" | "meaning";
  word: WordItem;
}

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
  const rawLevel = (word.sourceLevel ?? word.cefrLevel ?? word.level ?? "").trim().toUpperCase();
  if (!rawLevel) return false;
  const mappedLevel = rawLevel === "EASY" ? "A1" : rawLevel === "MEDIUM" ? "B1" : rawLevel === "HARD" ? "B2" : rawLevel;
  const level = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(mappedLevel) ? mappedLevel : "B1";
  if (difficulty === "EASY") return level === "A1" || level === "A2";
  if (difficulty === "HARD") return level === "C1" || level === "C2";
  return level === "B1" || level === "B2";
}

function normalizeSentenceSynonym(value: string): string {
  return value.trim().toLowerCase().replace(/\p{P}+$/gu, "").replace(/\s+/g, " ");
}

function sentenceSynonyms(word: WordItem): Set<string> {
  return new Set((word.senses ?? [])
    .map((sense) => sense.synonyms ?? "")
    .filter(Boolean)
    .flatMap((value) => value.split(/[,;|\n]/))
    .map(normalizeSentenceSynonym)
    .filter(Boolean));
}

function getWordCefrLevel(word: WordItem): WordLevelTag {
  const custom = (word.sourceLevel ?? word.cefrLevel ?? word.level ?? "").toUpperCase().trim();
  const normalized = custom === "EASY" ? "A1" : custom === "MEDIUM" ? "B1" : custom === "HARD" ? "B2" : custom;
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(normalized)) {
    return normalized as WordLevelTag;
  }
  return getWordLevel(word);
}

/** Keep the lobby pool aligned with the backend's sentence-question plan. */
function getSentenceEligibleWords(
  words: WordItem[],
  filterByLevel: boolean,
  selectedLevels: WordLevelTag[],
  difficulty: SentenceDifficulty,
): WordItem[] {
  const getSourceLevel = (word: WordItem) => (word.sourceLevel ?? word.cefrLevel ?? word.level ?? "").trim();
  const getPartOfSpeech = (word: WordItem) => normalizeVocabularyPartOfSpeech(
    word.sourcePartOfSpeech ?? word.partOfSpeech ?? word.pos ?? "",
  );
  const targets = words.filter((word) =>
    word.example?.trim()
    && exampleContainsWord(word.example, word.word)
    && getPartOfSpeech(word)
    && getSourceLevel(word)
    && (!filterByLevel || selectedLevels.includes(getWordCefrLevel(word)))
    && (filterByLevel || matchesSentenceDifficulty(word, difficulty))
  );

  return targets.filter((target) => {
    const targetPos = getPartOfSpeech(target).toLowerCase();
    const targetLevel = getSourceLevel(target).toLowerCase();
    const targetFamily = (target.wordFamily || "").trim().toLowerCase();
    const targetSynonyms = sentenceSynonyms(target);
    const targetWord = normalizeSentenceSynonym(target.word);
    let distractorCount = 0;

    for (const candidate of words) {
      if (candidate.id === target.id) continue;
      if (getPartOfSpeech(candidate).toLowerCase() !== targetPos) continue;
      if (getSourceLevel(candidate).toLowerCase() !== targetLevel) continue;
      const candidateFamily = (candidate.wordFamily || "").trim().toLowerCase();
      if (targetFamily && targetFamily === candidateFamily) continue;

      const candidateSynonyms = sentenceSynonyms(candidate);
      const candidateWord = normalizeSentenceSynonym(candidate.word);
      const sharesSynonym = targetSynonyms.has(candidateWord)
        || candidateSynonyms.has(targetWord)
        || [...targetSynonyms].some((synonym) => candidateSynonyms.has(synonym));
      if (sharesSynonym) continue;

      distractorCount += 1;
      if (distractorCount >= 3) return true;
    }
    return false;
  });
}

function getMeaning(word: WordItem): string {
  const sense = word.senses?.find((item) => item.meaning?.trim()) ?? word.senses?.[0];
  return sense?.meaning || sense?.definitionEn || word.meaning || "";
}

function questionFor(mode: ActivityMode, game: GameMode | undefined, index: number, word: WordItem, forceChoice = false): QuestionSpec {
  if (forceChoice) {
    return { type: "ENGLISH_TO_VIETNAMESE", prompt: word.word, expectsEnglish: false };
  }
  if (mode === "review") {
    return { type: "FLASHCARD_RATING", prompt: word.word, expectsEnglish: false };
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

export function VocabularyActivityWorkspace({ mode, setId, game, wordId, weakWordIds, weakReview = false }: VocabularyActivityWorkspaceProps) {
  const weakWordIdKey = weakWordIds?.join(",") ?? "";
  const isWeakWordSession = weakReview || Boolean(weakWordIdKey);
  const [testSet, setTestSet] = useState<VocabularyTestSet | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [loadedWeakWordIds, setLoadedWeakWordIds] = useState<string[]>([]);
  const [selectedSetId, setSelectedSetId] = useState(setId ?? "");
  const [availableSets, setAvailableSets] = useState<VocabularyTestSet[]>([]);
  const [deckScope, setDeckScope] = useState<"single_deck" | "all_decks">("single_deck");
  const [mixAllSets, setMixAllSets] = useState(false);
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
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [searchSetQuery, setSearchSetQuery] = useState("");
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestedCount, setRequestedCount] = useState<5 | 10 | 20 | "all">(10);
  const [gameQuestionCount, setGameQuestionCount] = useState<10 | 20 | "all">(
    isWeakWordSession ? "all" : 10,
  );
  const [sentenceQuestionCount, setSentenceQuestionCount] = useState<10 | 20 | 30 | "full" | "all">(20);
  const [matchingWordCount, setMatchingWordCount] = useState<number>(8);
  const [sentenceMode, setSentenceMode] = useState<"CLASSIC" | "TIME_ATTACK">("CLASSIC");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<30 | 60 | 90 | 120>(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [questionTimedOut, setQuestionTimedOut] = useState(false);
  const [timedOutSubmissionFailed, setTimedOutSubmissionFailed] = useState(false);
  const [started, setStarted] = useState(mode === "review" || mode === "practice");
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isCardDragging, setIsCardDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [ratingMenuOpen, setRatingMenuOpen] = useState(false);
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
  const [matchFlipped, setMatchFlipped] = useState<Array<{ wordId: string; side: "word" | "meaning" }>>([]);
  const [matchMatched, setMatchMatched] = useState<Set<string>>(new Set());
  const [matchAttempts, setMatchAttempts] = useState(0);
  const [matchCombo, setMatchCombo] = useState(0);
  const [matchBestCombo, setMatchBestCombo] = useState(0);
  const [matchShakingCards, setMatchShakingCards] = useState<string[]>([]);
  const [matchingMeaningWords, setMatchingMeaningWords] = useState<WordItem[]>([]);
  const [matchingSessionWords, setMatchingSessionWords] = useState<WordItem[]>([]);
  const [matchingBoardCards, setMatchingBoardCards] = useState<MatchingBoardCard[]>([]);
  const [matchViewMode, setMatchViewMode] = useState<"grid" | "split">("grid");
  const matchFlipTimerRef = useRef<number | null>(null);
  const matchQueueRef = useRef<Promise<void>>(Promise.resolve());
  const matchStartTimeRef = useRef<number>(0);
  const matchRequestIdsRef = useRef(new Map<number, string>());
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [gameSession, setGameSession] = useState<VocabularyGameSession | null>(null);
  const [gameResult, setGameResult] = useState<VocabularyGameSession | null>(null);
  const completionStarted = useRef<string | null>(null);
  const gameAnswerRequestIds = useRef(new Map<number, string>());
  const ratingInFlight = useRef(false);
  const swipeStart = useRef<{ x: number; y: number; time: number; pointerId: number } | null>(null);
  const nextQuestionRef = useRef<() => void>(() => undefined);
  const ratingTransitionTimeout = useRef<number | null>(null);
  const timedOutQuestionIndex = useRef<number | null>(null);
  const [completionRetry, setCompletionRetry] = useState(0);
  const [isGameDarkMode, setIsGameDarkMode] = useState(false);

  useEffect(() => {
    let active = true;
    const weakIds = new Set(weakWordIdKey.split(",").filter(Boolean));
    const load = isWeakWordSession
      ? getWeakVocabularyWords(500).then(async (weakWords) => {
          const currentWeakWords = weakWords.filter((word) => weakReview || weakIds.has(word.wordId));
          const setIds = [...new Set(currentWeakWords.map((word) => word.setId))];
          const sets = await Promise.all(setIds.map((id) => getVocabularySet(id)));
          const allSetWords = [...new Map(
            sets.flatMap((set) => set.words ?? []).map((word) => [word.id, word]),
          ).values()];
          const weakOrder = new Map(currentWeakWords.map((word, index) => [word.wordId, index]));
          const selectedWeakIds = new Set(
            weakReview ? currentWeakWords.map((word) => word.wordId) : weakIds,
          );
          const selectedWords = allSetWords
            .filter((word) => selectedWeakIds.has(word.id))
            .sort((left, right) => (weakOrder.get(left.id) ?? 0) - (weakOrder.get(right.id) ?? 0));
          return {
            words: allSetWords,
            set: sets[0] ?? null,
            weakIds: selectedWords.map((word) => word.id),
          };
        })
      : mode === "review"
      ? getDueVocabularyWords(setId, 100).then((due) => ({ words: due, set: null, weakIds: [] as string[] }))
      : setId
        ? getVocabularySet(setId).then((set) => ({ words: set.words || [], set, weakIds: [] as string[] }))
        : Promise.reject(new Error("Chọn một bộ từ vựng để bắt đầu."));
    void load.then((result) => {
      if (!active) return;
      setTestSet(result.set);
      setWords(result.words);
      setLoadedWeakWordIds(result.weakIds);
      setLoadError(null);
    }).catch((reason: unknown) => {
      if (active) setLoadError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu từ vựng.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [isWeakWordSession, mode, setId, weakReview, weakWordIdKey]);

  const sentenceDifficulty: SentenceDifficulty = useMemo(() => {
    if (!filterByLevel) return "ALL";
    const hasA = selectedLevels.some((l) => l === "A1" || l === "A2");
    const hasB = selectedLevels.some((l) => l === "B1" || l === "B2");
    const hasC = selectedLevels.some((l) => l === "C1" || l === "C2");
    if (hasA && !hasB && !hasC) return "EASY";
    if (!hasA && hasB && !hasC) return "MEDIUM";
    if (!hasA && !hasB && hasC) return "HARD";
    return "ALL";
  }, [filterByLevel, selectedLevels]);

  useEffect(() => {
    if (mode !== "game" || (game !== "sentence" && game !== "matching")) return;
    let active = true;
    void getVocabularySets().then(async (sets) => {
      if (!active || !Array.isArray(sets)) return;
      setAvailableSets(sets);
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
      if (active) setAvailableSets(detailedSets);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Không thể tải danh sách bộ từ vựng.");
    });
    return () => { active = false; };
  }, [game, mode]);

  const allDeckWords = useMemo(() => {
    const mixedWords = availableSets.flatMap((set) => set.words ?? []);
    const seen = new Set<string>();
    const list: WordItem[] = [];
    for (const w of [...mixedWords, ...words]) {
      const key = (w.word || "").toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(w);
    }
    return list;
  }, [availableSets, words]);

  const isAllDecksSelected = deckScope === "all_decks" || selectedSetId === "ALL" || mixAllSets;
  const baseSentencePool = isAllDecksSelected
    ? (allDeckWords.length > 0 ? allDeckWords : words)
    : words;
  const totalAllWordsCount = allDeckWords.length > 0 ? allDeckWords.length : words.length;

  const handleSelectVocabularySet = async (targetSet: VocabularyTestSet) => {
    if (targetSet.id === "ALL") {
      setSelectedSetId("ALL");
      setDeckScope("all_decks");
      setMixAllSets(true);
      setTestSet({
        id: "ALL",
        title: "Tất cả bộ đề (Toàn bộ kho từ)",
        category: "Kho từ vựng tổng hợp",
        wordCount: totalAllWordsCount,
        words: allDeckWords,
      } as VocabularyTestSet);
      setWords(allDeckWords);
      setIndex(0);
      setIsSetPickerOpen(false);
      return;
    }
    if (targetSet.id === selectedSetId && selectedSetId !== "ALL") {
      setIsSetPickerOpen(false);
      return;
    }
    setIsLoadingSet(true);
    setError(null);
    try {
      const fullSet = await getVocabularySet(targetSet.id);
      setSelectedSetId(fullSet.id);
      setDeckScope("single_deck");
      setMixAllSets(false);
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

  const sentenceEligibleWords = useMemo(() => {
    if (mode !== "game" || game !== "sentence") return [];
    const weakWordSet = new Set(loadedWeakWordIds);
    const sourceWords = isWeakWordSession
      ? baseSentencePool.filter((word) => weakWordSet.has(word.id))
      : baseSentencePool;
    const scopedWords = wordId ? sourceWords.filter((word) => word.id === wordId) : sourceWords;
    return getSentenceEligibleWords(scopedWords, filterByLevel, selectedLevels, sentenceDifficulty);
  }, [baseSentencePool, filterByLevel, game, isWeakWordSession, loadedWeakWordIds, mode, selectedLevels, sentenceDifficulty, wordId]);

  const matchingEligibleWords = useMemo(() => {
    if (mode !== "game" || game !== "matching") return [];
    const weakWordSet = new Set(loadedWeakWordIds);
    const sourceWords = isWeakWordSession
      ? baseSentencePool.filter((word) => weakWordSet.has(word.id))
      : baseSentencePool;
    const scopedWords = wordId ? sourceWords.filter((word) => word.id === wordId) : sourceWords;
    const filtered = scopedWords.filter((w) => w.word?.trim() && getMeaning(w).trim());
    if (!filterByLevel) return filtered;
    return filtered.filter((w) => selectedLevels.includes(getWordCefrLevel(w)));
  }, [baseSentencePool, filterByLevel, game, isWeakWordSession, loadedWeakWordIds, mode, selectedLevels, wordId]);

  const sessionWords = useMemo(() => {
    const weakWordSet = new Set(loadedWeakWordIds);
    const sourceWords = isWeakWordSession
      ? baseSentencePool.filter((word) => weakWordSet.has(word.id))
      : baseSentencePool;
    const scopedWords = wordId ? sourceWords.filter((word) => word.id === wordId) : sourceWords;
    const available = mode === "learn" ? scopedWords.filter((word) => word.progressStatus !== "MASTERED") : scopedWords;
    const playable = mode === "game" && game === "sentence"
      ? sentenceEligibleWords
      : mode === "game" && game === "matching"
      ? matchingEligibleWords
      : available;
    if (mode === "game") {
      if (game === "sentence" && gameSession?.questions?.length) {
        const wordsById = new Map(allDeckWords.map((word) => [word.id, word]));
        const planned = gameSession.questions
          .map((questionPlan) => wordsById.get(questionPlan.wordId))
          .filter((word): word is WordItem => Boolean(word));
        if (sentenceMode === "CLASSIC" && typeof sentenceQuestionCount === "number") {
          return planned.slice(0, sentenceQuestionCount);
        }
        return planned;
      }
      if (game === "sentence" && sentenceMode === "TIME_ATTACK") return playable;
      if (game === "sentence") {
        if (sentenceQuestionCount === "full" || sentenceQuestionCount === "all") return playable;
        return playable.slice(0, sentenceQuestionCount);
      }
      if (game === "matching") {
        if (matchingSessionWords.length > 0) return matchingSessionWords;
        return matchingEligibleWords.slice(0, typeof matchingWordCount === "number" ? matchingWordCount : 8);
      }
      const limit = gameQuestionCount === "all" ? playable.length : gameQuestionCount;
      return playable.slice(0, limit);
    }
    return mode === "learn" && requestedCount !== "all"
      ? available.slice(0, requestedCount)
      : available;
  }, [allDeckWords, baseSentencePool, game, gameQuestionCount, gameSession, isWeakWordSession, loadedWeakWordIds, matchingEligibleWords, matchingSessionWords, matchingWordCount, mode, requestedCount, sentenceEligibleWords, sentenceMode, sentenceQuestionCount, wordId]);

  const currentWord = sessionWords[index];
  const question = currentWord
    ? questionFor(mode, game, index, currentWord, isWeakWordSession)
    : null;

  const choiceWords = useMemo(() => {
    if (!currentWord) return [];
    const plannedQuestion = gameSession?.questions?.[index];
    let options: WordItem[];
    if (mode === "game" && game === "sentence" && plannedQuestion) {
      const wordsById = new Map(allDeckWords.map((word) => [word.id, word]));
      options = plannedQuestion.optionWordIds
        .map((id) => wordsById.get(id))
        .filter((word): word is WordItem => Boolean(word));
    } else {
      const others = allDeckWords.filter((word) => word.id !== currentWord.id);
      const offset = index % Math.max(1, others.length);
      const rotated = [...others.slice(offset), ...others.slice(0, offset)];
      options = [...rotated.slice(0, 3), currentWord];
    }
    return shuffleArray(options);
  }, [allDeckWords, currentWord, game, gameSession, index, mode]);

  const isMatching = mode === "game" && game === "matching";
  const isReview = mode === "review";

  const effectiveMeaningWords = useMemo(() => {
    if (!isMatching || sessionWords.length === 0) return [];
    if (matchingMeaningWords.length === sessionWords.length) return matchingMeaningWords;
    return sessionWords;
  }, [isMatching, matchingMeaningWords, sessionWords]);

  const effectiveBoardCards = useMemo(() => {
    if (!isMatching || sessionWords.length === 0) return [];
    if (matchingBoardCards.length === sessionWords.length * 2) {
      return matchingBoardCards;
    }
    const eng = sessionWords.map((w) => ({ id: `word:${w.id}`, wordId: w.id, side: "word" as const, word: w }));
    const vie = effectiveMeaningWords.map((w) => ({ id: `meaning:${w.id}`, wordId: w.id, side: "meaning" as const, word: w }));
    const result: MatchingBoardCard[] = [];
    for (let i = 0; i < eng.length; i++) {
      if (eng[i]) result.push(eng[i]);
      if (vie[i]) result.push(vie[i]);
    }
    return result;
  }, [effectiveMeaningWords, isMatching, matchingBoardCards, sessionWords]);

  const unifiedGridColsClass = useMemo(() => {
    const total = sessionWords.length * 2;
    if (total <= 8) return "grid-cols-2 sm:grid-cols-4";
    if (total <= 12) return "grid-cols-3 sm:grid-cols-4";
    if (total <= 16) return "grid-cols-2 sm:grid-cols-4";
    if (total <= 20) return "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5";
    return "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6";
  }, [sessionWords.length]);

  const splitSubGridColsClass = useMemo(() => {
    const n = sessionWords.length;
    if (n <= 4) return "grid-cols-2";
    if (n <= 6) return "grid-cols-2 sm:grid-cols-3";
    if (n <= 8) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4";
    if (n <= 10) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-5";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  }, [sessionWords.length]);

  const isFinished = started && sessionWords.length > 0 && (
    (isMatching ? matchMatched.size >= sessionWords.length : index >= sessionWords.length)
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
    const completeFn = () =>
      completeVocabularyGameSession(gameSession.id)
        .then(setGameResult)
        .catch((reason: unknown) => {
          completionStarted.current = null;
          setError(reason instanceof Error ? reason.message : "Không thể lưu kết quả trò chơi.");
        });

    if (isMatching) {
      void matchQueueRef.current.then(completeFn).catch(completeFn);
    } else {
      void completeFn();
    }
  }, [completionRetry, gameResult, gameSession, isFinished, isMatching]);

  const submitAnswer = useCallback(async (answer: string, rating?: VocabularySrsRating, timedOut = false) => {
    if (!currentWord || !question || submitting || answerResult) return;
    if (rating && ratingInFlight.current) return;
    if (rating) ratingInFlight.current = true;
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
      if (rating) {
        setRatingMenuOpen(false);
        ratingTransitionTimeout.current = window.setTimeout(() => {
          nextQuestionRef.current();
        }, 320);
      }
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
      if (rating) {
        ratingInFlight.current = false;
        setSwipeDirection(null);
        setSwipeOffset(0);
      }
      setError(reason instanceof Error ? reason.message : "Không thể lưu câu trả lời.");
      if (timedOut) setTimedOutSubmissionFailed(true);
    } finally {
      setSubmitting(false);
    }
  }, [activity, answerResult, comboCount, currentWord, game, gameSession, index, question, seconds, submitting]);

  const onMatchCardClick = useCallback((word: WordItem, side: "word" | "meaning") => {
    if (!gameSession) return;

    // 1. Chạm thẻ đã ghép: bỏ qua
    if (matchMatched.has(word.id)) return;

    // 2. Nếu đang chờ úp cặp sai mà người chơi chạm thẻ khác:
    // úp ngay 2 thẻ cũ (clear timeout), thẻ mới thành thẻ đầu.
    if (matchFlipped.length === 2) {
      if (matchFlipTimerRef.current !== null) {
        window.clearTimeout(matchFlipTimerRef.current);
        matchFlipTimerRef.current = null;
      }
      setMatchShakingCards([]);
      setMatchFlipped([{ wordId: word.id, side }]);
      return;
    }

    // 3. Nếu chưa có thẻ nào lật:
    if (matchFlipped.length === 0) {
      setMatchFlipped([{ wordId: word.id, side }]);
      return;
    }

    // 4. Đang có đúng 1 thẻ lật: matchFlipped.length === 1
    const first = matchFlipped[0];

    // Chạm lại đúng thẻ đang lật: bỏ qua
    if (first.wordId === word.id && first.side === side) {
      return;
    }

    // Chạm thẻ thứ hai cùng side với thẻ đầu: chỉ đổi thẻ đầu, KHÔNG tính lượt
    if (first.side === side) {
      setMatchFlipped([{ wordId: word.id, side }]);
      return;
    }

    // Hai thẻ khác side: Thực hiện 1 lượt (attempt)!
    const second = { wordId: word.id, side };
    const currentAttempt = matchAttempts;
    setMatchAttempts((prev) => prev + 1);

    const isCorrect = first.wordId === second.wordId;
    const firstWordId = first.side === "word" ? first.wordId : second.wordId;
    const secondWordId = first.side === "meaning" ? first.wordId : second.wordId;

    if (isCorrect) {
      // Đúng: chỉ khi lật đúng 1 cặp hoàn chỉnh mới phát âm từ
      playWord(word);
      // Đúng: thẻ giữ mặt ngửa + dấu tích, combo +1
      setMatchFlipped([]);
      setMatchMatched((prev) => new Set([...prev, first.wordId]));
      const nextCombo = matchCombo + 1;
      setMatchCombo(nextCombo);
      setMatchBestCombo((best) => Math.max(best, nextCombo));
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 100 + Math.min(nextCombo - 1, 5) * 10);
    } else {
      // Sai: rung nhẹ, tự úp lại sau 800ms, combo về 0
      setMatchFlipped([first, second]);
      setMatchCombo(0);
      setWrongCount((prev) => prev + 1);
      setWrongMatches((prev) => prev + 1);
      setMatchShakingCards([`${first.side}:${first.wordId}`, `${second.side}:${second.wordId}`]);

      if (matchFlipTimerRef.current !== null) {
        window.clearTimeout(matchFlipTimerRef.current);
      }
      matchFlipTimerRef.current = window.setTimeout(() => {
        setMatchFlipped([]);
        setMatchShakingCards([]);
        matchFlipTimerRef.current = null;
      }, 800);
    }

    // Gửi backend tuần tự qua promise queue
    const attemptIndex = currentAttempt;
    let reqId = matchRequestIdsRef.current.get(attemptIndex);
    if (!reqId) {
      reqId = crypto.randomUUID();
      matchRequestIdsRef.current.set(attemptIndex, reqId);
    }
    const now = Date.now();
    const responseTimeMs = Math.min(Math.max(100, matchStartTimeRef.current > 0 ? now - matchStartTimeRef.current : 1000), 600_000);
    matchStartTimeRef.current = now;

    const sendAttempt = async (retry = false): Promise<void> => {
      try {
        await recordMatchingAttempt({
          sessionId: gameSession.id,
          attemptIndex,
          requestId: reqId,
          firstWordId,
          secondWordId,
          responseTimeMs,
        });
      } catch (err) {
        if (!retry) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
          return sendAttempt(true);
        }
        console.error("Lỗi ghi nhận lượt ghép cặp:", err);
      }
    };

    matchQueueRef.current = matchQueueRef.current.then(() => sendAttempt()).catch((e) => {
      console.error("Lỗi hàng đợi ghép cặp:", e);
    });
  }, [gameSession, matchAttempts, matchCombo, matchFlipped, matchMatched]);

  const nextQuestion = useCallback(() => {
    ratingInFlight.current = false;
    setSwipeDirection(null);
    setSwipeOffset(0);
    setRatingMenuOpen(false);
    setIndex((value) => value + 1);
    setInput("");
    setAnswerResult(null);
    setFlipped(false);
    setSeconds(0);
    setQuestionTimeLeft(15);
    setQuestionTimedOut(false);
    setTimedOutSubmissionFailed(false);
    timedOutQuestionIndex.current = null;
    if (game === "battle" && enemyHealth === 0) {
      setEnemyHealth(100);
      setBattleEnemy((value) => value + 1);
    }
  }, [enemyHealth, game]);
  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  }, [nextQuestion]);

  useEffect(() => () => {
    if (ratingTransitionTimeout.current !== null) {
      window.clearTimeout(ratingTransitionTimeout.current);
    }
  }, []);

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

  const submitRating = (rating: VocabularySrsRating, direction: "left" | "right") => {
    if (!isReview || !flipped || submitting || answerResult || ratingInFlight.current) return;
    setRatingMenuOpen(false);
    setSwipeDirection(direction);
    setSwipeOffset(direction === "left" ? -280 : 280);
    void submitAnswer(rating, rating);
  };

  const handleFlashcardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isReview || !flipped || submitting || answerResult || ratingMenuOpen) return;
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, select, textarea, [role='menu']")) return;
    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
    };
    setIsCardDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    setSwipeOffset(0);
  };

  const handleFlashcardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && Math.abs(deltaY) > 24) {
      swipeStart.current = null;
      setIsCardDragging(false);
      setSwipeOffset(0);
      return;
    }
    setSwipeOffset(Math.max(-280, Math.min(280, deltaX)));
  };

  const handleFlashcardPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    swipeStart.current = null;
    setIsCardDragging(false);
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const elapsed = Math.max(1, performance.now() - start.time);
    const velocity = Math.abs(deltaX) / elapsed;
    const crossedThreshold = Math.abs(deltaX) >= 90 || (Math.abs(deltaX) >= 48 && velocity >= 0.65);
    if (Math.abs(deltaY) > Math.abs(deltaX) || !crossedThreshold) {
      setSwipeOffset(0);
      return;
    }
    submitRating(deltaX < 0 ? "AGAIN" : "GOOD", deltaX < 0 ? "left" : "right");
  };

  const handleFlashcardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, select, textarea, [role='menu']")) return;
    if (event.key === " " || event.key === "Enter") {
      if (!flipped) {
        event.preventDefault();
        setFlipped(true);
      }
      return;
    }
    if (!flipped || submitting || answerResult) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      submitRating("AGAIN", "left");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      submitRating("GOOD", "right");
    }
  };

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
    setMatchFlipped([]);
    setMatchMatched(new Set());
    setMatchAttempts(0);
    setMatchCombo(0);
    setMatchBestCombo(0);
    setMatchShakingCards([]);
    if (matchFlipTimerRef.current !== null) {
      window.clearTimeout(matchFlipTimerRef.current);
      matchFlipTimerRef.current = null;
    }
    matchQueueRef.current = Promise.resolve();
    matchStartTimeRef.current = Date.now();
    const targetCount = typeof matchingWordCount === "number" ? matchingWordCount : 8;
    const randomPool = shuffleArray([...matchingEligibleWords]);
    const sampledWords = randomPool.slice(0, Math.min(targetCount, randomPool.length));
    setMatchingSessionWords(sampledWords);
    const eng = sampledWords.map((w) => ({ id: `word:${w.id}`, wordId: w.id, side: "word" as const, word: w }));
    const vie = sampledWords.map((w) => ({ id: `meaning:${w.id}`, wordId: w.id, side: "meaning" as const, word: w }));
    setMatchingBoardCards(shuffleArray([...eng, ...vie]));
    setMatchingMeaningWords(shuffleArray([...sampledWords]));
    gameAnswerRequestIds.current.clear();
    matchRequestIdsRef.current.clear();
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
      const primarySetId = selectedSetId === "ALL" ? (availableSets[0]?.id || "set-01") : selectedSetId;
      const isAllDecks = deckScope === "all_decks" || selectedSetId === "ALL" || mixAllSets;
      const deckIds = isAllDecks
        ? [...new Set([
            primarySetId,
            ...availableSets.map((set) => set.id),
            ...allDeckWords.map((word) => word.setId).filter((id): id is string => typeof id === "string" && id.length > 0),
          ])]
        : [primarySetId];

      const questionCountForBackend =
        game === "sentence"
          ? sentenceMode === "CLASSIC" && (sentenceQuestionCount === 10 || sentenceQuestionCount === 20)
            ? sentenceQuestionCount
            : undefined
          : undefined;

      const session = await startVocabularyGameSession({
        setId: primarySetId,
        gameType: gameTypeByMode[game],
        ...((game === "sentence" || game === "matching") && (isAllDecks || isWeakWordSession)
          ? { deckIds }
          : {}),
        ...(game === "sentence" ? {
          mode: sentenceMode,
          difficulty: sentenceDifficulty,
          ...(sentenceMode === "TIME_ATTACK" ? { timeLimitSeconds } : {}),
          ...(sentenceMode === "CLASSIC" && questionCountForBackend ? { questionCount: questionCountForBackend } : {}),
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
      setMatchFlipped([]);
      setMatchMatched(new Set());
      setMatchAttempts(0);
      setMatchCombo(0);
      setMatchBestCombo(0);
      setMatchShakingCards([]);
      if (matchFlipTimerRef.current !== null) {
        window.clearTimeout(matchFlipTimerRef.current);
        matchFlipTimerRef.current = null;
      }
      matchQueueRef.current = Promise.resolve();
      matchStartTimeRef.current = Date.now();
      const targetCount = typeof matchingWordCount === "number" ? matchingWordCount : 8;
      const randomPool = shuffleArray([...matchingEligibleWords]);
      const sampledWords = randomPool.slice(0, Math.min(targetCount, randomPool.length));
      setMatchingSessionWords(sampledWords);
      const eng = sampledWords.map((w) => ({ id: `word:${w.id}`, wordId: w.id, side: "word" as const, word: w }));
      const vie = sampledWords.map((w) => ({ id: `meaning:${w.id}`, wordId: w.id, side: "meaning" as const, word: w }));
      setMatchingBoardCards(shuffleArray([...eng, ...vie]));
      setMatchingMeaningWords(shuffleArray([...sampledWords]));
      gameAnswerRequestIds.current.clear();
      matchRequestIdsRef.current.clear();
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
        words={words}
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
    const progressPercent = sessionWords.length > 0
      ? isMatching
        ? Math.min(100, Math.round((matchMatched.size / sessionWords.length) * 100))
        : Math.min(100, Math.round(((index + (answerResult ? 1 : 0)) / sessionWords.length) * 100))
      : 0;
    const resultCorrectCount = gameResult?.correctCount ?? (isMatching ? matchMatched.size : correctCount);
    const resultWrongCount = gameResult?.wrongCount ?? (isMatching ? Math.max(0, matchAttempts - matchMatched.size) : wrongCount);
    const resultAccuracy = Math.round((resultCorrectCount / (resultCorrectCount + resultWrongCount || 1)) * 100);
    const resultDurationSeconds = gameResult?.durationSeconds ?? totalSeconds;

    return (
      <main className={`mx-auto max-w-5xl space-y-3 sm:space-y-4 px-2 sm:px-4 pb-10 ${isGameDarkMode ? "bg-slate-950 min-h-screen rounded-2xl" : ""}`}>
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
          <section className={`overflow-hidden rounded-3xl p-6 sm:p-10 shadow-2xl text-center ${
            isSentence
              ? isGameDarkMode
                ? "border border-indigo-400/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white"
                : "border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50/60 to-violet-50 text-slate-900"
              : isGameDarkMode
              ? "border border-emerald-400/20 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 text-white"
              : "border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50 text-slate-900"
          }`}>
            <div className={`mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl shadow-sm ${
              isSentence
                ? isGameDarkMode ? "bg-indigo-900/60 border-2 border-indigo-700 text-indigo-300" : "bg-indigo-50 border-2 border-indigo-200 text-indigo-600"
                : isGameDarkMode ? "bg-emerald-900/60 border-2 border-emerald-700 text-emerald-300" : "bg-emerald-50 border-2 border-emerald-200 text-emerald-600"
            }`}>
              <GameIcon className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <p className={`mt-5 text-xs font-black uppercase tracking-[0.3em] ${
              isSentence
                ? isGameDarkMode ? "text-indigo-300" : "text-indigo-700"
                : isGameDarkMode ? "text-emerald-300" : "text-emerald-700"
            }`}>
              {isSentence ? "Sentence Master · Thử Thách Ngữ Cảnh TOEIC" : "Ghép Cặp Từ Vựng · Nối Từ Và Ý Nghĩa"}
            </p>

            <h2 className={`mt-2 text-2xl font-black sm:text-4xl ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>
              {isSentence ? "Điền Từ Vào Câu Ngữ Cảnh" : "Kết Nối Từ Vựng & Ý Nghĩa"}
            </h2>
            <p className={`mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-6 font-medium ${
              isSentence
                ? isGameDarkMode ? "text-indigo-100/90" : "text-slate-600"
                : isGameDarkMode ? "text-emerald-100/90" : "text-slate-600"
            }`}>
              {isSentence
                ? "Đọc câu tiếng Anh ngữ cảnh TOEIC thực tế, chọn từ vựng chính xác để hoàn thiện câu hoàn chỉnh. Luyện chắc phản xạ hiểu ngữ cảnh sâu."
                : "Lật mở và ghép cặp từ tiếng Anh với nghĩa tiếng Việt tương ứng. Ghi điểm combo liên tiếp và rèn luyện tốc độ phản xạ trí nhớ."}
            </p>

            {/* Deck & Settings Card */}
            <div className="mx-auto mt-8 max-w-xl space-y-4 text-left">
              {/* 0. Bộ đề đang chọn */}
              <div className={`flex items-center justify-between rounded-2xl border p-3 sm:p-4 shadow-lg ${
                isGameDarkMode
                  ? isSentence
                    ? "border-indigo-400/30 bg-slate-900/90 shadow-indigo-950/40"
                    : "border-emerald-400/30 bg-slate-900/90 shadow-emerald-950/40"
                  : isSentence
                  ? "border-indigo-200 bg-slate-50 shadow-slate-200/60"
                  : "border-emerald-200 bg-slate-50 shadow-slate-200/60"
              }`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    isGameDarkMode
                      ? isSentence
                        ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-300"
                        : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : isSentence
                      ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                      : "border-emerald-300 bg-emerald-100 text-emerald-700"
                  }`}>
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      isGameDarkMode
                        ? isSentence ? "text-indigo-300" : "text-emerald-300"
                        : isSentence ? "text-indigo-700" : "text-emerald-700"
                    }`}>
                      Bộ đề đang chọn
                    </p>
                    <p className={`truncate text-sm font-extrabold sm:text-base ${
                      isGameDarkMode ? "text-white" : "text-slate-900"
                    }`}>
                      {testSet?.title || "Đang tải bộ đề..."}
                    </p>
                    <p className="text-xs text-slate-400">
                      {testSet?.category || "Từ vựng TOEIC"} · {isSentence ? sentenceEligibleWords.length : isMatching ? matchingEligibleWords.length : (testSet?.words?.length || testSet?.wordCount || sessionWords.length)} từ khả dụng
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSetPickerOpen(true)}
                  className={`ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 sm:px-4 sm:text-sm ${
                    isGameDarkMode
                      ? isSentence
                        ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
                        : "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                      : isSentence
                      ? "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      : "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  }`}
                >
                  <span>Đổi bộ đề</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* 1. Phạm vi từ vựng */}
              <div>
                <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isGameDarkMode ? "text-indigo-200" : "text-slate-800"}`}>
                  <BookOpen className={`h-4 w-4 ${isGameDarkMode ? "text-indigo-400" : "text-indigo-600"}`} /> Phạm vi từ vựng
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setDeckScope("single_deck");
                      setMixAllSets(false);
                      if (selectedSetId === "ALL") {
                        const fallbackId = availableSets[0]?.id || "set-01";
                        setSelectedSetId(fallbackId);
                        try {
                          const full = await getVocabularySet(fallbackId);
                          setTestSet(full);
                          setWords(full.words || []);
                        } catch {
                          // ignore
                        }
                      }
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      deckScope === "single_deck"
                        ? isGameDarkMode
                          ? isSentence
                            ? "border-indigo-400 bg-indigo-400/15 text-indigo-200 shadow-sm ring-1 ring-indigo-400"
                            : "border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400"
                          : isSentence
                          ? "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                          : "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                        : isGameDarkMode
                        ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold sm:text-sm">📚 Bộ đề hiện tại</p>
                    <p className={`mt-0.5 line-clamp-1 text-[11px] ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {words.length} từ trong bộ đã chọn
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={availableSets.length === 0}
                    onClick={() => {
                      setDeckScope("all_decks");
                      setMixAllSets(true);
                    }}
                    className={`rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      deckScope === "all_decks"
                        ? isGameDarkMode
                          ? isSentence
                            ? "border-indigo-400 bg-indigo-400/15 text-indigo-200 shadow-sm ring-1 ring-indigo-400"
                            : "border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400"
                          : isSentence
                          ? "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                          : "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                        : isGameDarkMode
                        ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-bold sm:text-sm">🗂 Trộn tất cả bộ đề</p>
                    <p className={`mt-0.5 line-clamp-1 text-[11px] ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {totalAllWordsCount} từ từ mọi bộ đề
                    </p>
                  </button>
                </div>
              </div>

              {/* 1b. Lọc theo cấp độ CEFR */}
              {(isSentence || isMatching) ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setFilterByLevel((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                      filterByLevel
                        ? isGameDarkMode
                          ? "border-violet-400 bg-violet-400/15 text-violet-200 shadow-sm ring-1 ring-violet-400"
                          : "border-violet-600 bg-violet-50 text-violet-950 shadow-sm ring-1 ring-violet-500"
                        : isGameDarkMode
                        ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold sm:text-sm">🎯 Lọc theo cấp độ CEFR</p>
                      <p className={`mt-0.5 text-[11px] ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        {filterByLevel
                          ? `Áp dụng trên ${deckScope === "all_decks" ? "toàn bộ kho từ" : "bộ đề đã chọn"}`
                          : "Bấm để bật lọc theo cấp CEFR"}
                      </p>
                    </div>
                    <span className={`ml-3 shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${
                      filterByLevel
                        ? isGameDarkMode ? "border-violet-400 bg-violet-500 text-white" : "border-violet-600 bg-violet-600 text-white"
                        : isGameDarkMode ? "border-slate-700 text-slate-400" : "border-slate-300 text-slate-500"
                    }`}>
                      {filterByLevel ? "Đang bật" : "Tắt"}
                    </span>
                  </button>

                  {/* CEFR Level Multi-selector */}
                  {filterByLevel && (
                    <div className={`mt-2.5 rounded-2xl border p-3 space-y-2 animate-in fade-in duration-200 ${
                      isGameDarkMode ? "border-violet-400/20 bg-slate-900/90" : "border-slate-200 bg-white shadow-sm"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isGameDarkMode ? "text-violet-300" : "text-slate-800"}`}>
                          Chọn thang cấp độ:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedLevels.length === 7) {
                              setSelectedLevels(["B1"]);
                            } else {
                              setSelectedLevels(["A1", "A2", "B1", "B2", "C1", "C2", "unclassified"]);
                            }
                          }}
                          className={`text-xs font-bold ${isGameDarkMode ? "text-violet-400 hover:text-violet-200" : "text-violet-700 hover:text-violet-900"}`}
                        >
                          {selectedLevels.length === 7 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
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
                                  ? isGameDarkMode
                                    ? "border-violet-400 bg-violet-500/25 text-violet-100 shadow-sm"
                                    : "border-violet-600 bg-violet-600 text-white shadow-sm"
                                  : isGameDarkMode
                                  ? "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <span className="text-xs font-black">{level === "unclassified" ? "Khác" : level}</span>
                              <span className={`text-[9px] ${
                                isSelected
                                  ? isGameDarkMode ? "text-violet-200" : "text-violet-100"
                                  : isGameDarkMode ? "text-slate-500" : "text-slate-500"
                              }`}>
                                {level === "unclassified" ? "Mở rộng" : desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* 2. Chế độ chơi (Sentence) */}
              {isSentence ? (
                <div>
                  <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isGameDarkMode ? "text-amber-300" : "text-amber-900"}`}>
                    <Zap className={`h-4 w-4 ${isGameDarkMode ? "text-amber-400" : "text-amber-600"}`} /> Chế độ chơi
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([
                      { id: "CLASSIC", title: "Classic", detail: "Không giới hạn giờ · luyện tập từng câu vững vàng" },
                      { id: "TIME_ATTACK", title: "Time Attack", detail: "Chạy đua thời gian · 15 giây mỗi câu hỏi" },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSentenceMode(option.id)}
                        aria-pressed={sentenceMode === option.id}
                        className={`rounded-xl border p-3 text-left transition ${
                          sentenceMode === option.id
                            ? isGameDarkMode
                              ? "border-indigo-400 bg-indigo-400/15 text-indigo-200 shadow-sm ring-1 ring-indigo-400"
                              : "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm ring-1 ring-indigo-500"
                            : isGameDarkMode
                            ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <span className="block text-xs font-bold sm:text-sm">{option.title}</span>
                        <span className={`mt-0.5 line-clamp-1 text-[11px] ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {option.detail}
                        </span>
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
                            className={`rounded-xl border py-2 text-center text-xs font-bold transition sm:text-sm ${
                              timeLimitSeconds === duration
                                ? isGameDarkMode
                                  ? "border-indigo-400 bg-indigo-400/20 text-indigo-200 shadow-sm ring-1 ring-indigo-400"
                                  : "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-500"
                                : isGameDarkMode
                                ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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

              {/* 3. Số câu hỏi (Sentence Classic) */}
              {isSentence && sentenceMode === "CLASSIC" && (
                <div>
                  <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isGameDarkMode ? "text-emerald-300" : "text-emerald-900"}`}>
                    <SlidersHorizontal className={`h-4 w-4 ${isGameDarkMode ? "text-emerald-400" : "text-emerald-600"}`} /> Số câu hỏi
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {([10, 20, 30] as const).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSentenceQuestionCount(num)}
                        className={`rounded-xl border py-2.5 text-center text-xs font-bold transition sm:text-sm ${
                          sentenceQuestionCount === num
                            ? isGameDarkMode
                              ? "border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400"
                              : "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                            : isGameDarkMode
                            ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {num} câu
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSentenceQuestionCount("full")}
                      className={`rounded-xl border py-2 px-1 text-center text-xs font-bold transition ${
                        sentenceQuestionCount === "full"
                          ? isGameDarkMode
                            ? "border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400"
                            : "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                          : isGameDarkMode
                          ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span className="block">Full bộ đề</span>
                      <span className={`block text-[10px] font-normal ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                        ({sentenceEligibleWords.length} câu)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSentenceQuestionCount("all")}
                      className={`rounded-xl border py-2.5 text-center text-xs font-bold transition sm:text-sm ${
                        sentenceQuestionCount === "all"
                          ? isGameDarkMode
                            ? "border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400"
                            : "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500"
                          : isGameDarkMode
                          ? "border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      ♾ Vô tận
                    </button>
                  </div>
                </div>
              )}

              {/* Matching specific options: Cấp độ & Lưới lật thẻ */}
              {!isSentence && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isGameDarkMode ? "text-emerald-300" : "text-emerald-900"}`}>
                      <SlidersHorizontal className={`h-4 w-4 ${isGameDarkMode ? "text-emerald-400" : "text-emerald-600"}`} /> Số thẻ ghép cặp (Trộn ngẫu nhiên)
                    </p>
                    <span className={`text-[11px] font-semibold ${isGameDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Giới hạn tối đa 10 cặp để đảm bảo khả năng ghi nhớ tốt nhất
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {MATCHING_DIFFICULTIES.map((diff) => {
                      const isSelected = matchingWordCount === diff.pairs;
                      const count = diff.pairs;
                      const cardTotal = count * 2;
                      return (
                        <button
                          key={diff.id}
                          type="button"
                          onClick={() => setMatchingWordCount(diff.pairs)}
                          className={`relative rounded-2xl border p-3 text-left transition-all ${
                            isSelected
                              ? isGameDarkMode
                                ? "border-emerald-400 bg-emerald-400/15 text-emerald-200 ring-2 ring-emerald-400 shadow-md scale-[1.02]"
                                : "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 shadow-md scale-[1.02]"
                              : isGameDarkMode
                              ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs sm:text-sm font-black ${isSelected ? (isGameDarkMode ? "text-white" : "text-emerald-950") : (isGameDarkMode ? "text-white" : "text-slate-950")}`}>
                              {diff.name}
                            </span>
                            {diff.badge && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                                isSelected
                                  ? isGameDarkMode ? "bg-emerald-500/30 text-emerald-200" : "bg-emerald-200 text-emerald-950 border border-emerald-300"
                                  : isGameDarkMode ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}>
                                {diff.badge}
                              </span>
                            )}
                          </div>
                          <p className={`mt-1 text-[11px] line-clamp-1 font-medium ${isSelected ? (isGameDarkMode ? "text-emerald-200" : "text-emerald-900") : (isGameDarkMode ? "text-slate-300" : "text-slate-600")}`}>
                            {diff.desc}
                          </p>
                          <div className={`mt-2 flex items-center justify-between border-t pt-1.5 text-[10px] font-bold ${isGameDarkMode ? "border-slate-800" : "border-slate-200"}`}>
                            <span className={isGameDarkMode ? "text-slate-400" : "text-slate-600"}>
                              {cardTotal} thẻ ({diff.gridText})
                            </span>
                            <span className={isSelected ? (isGameDarkMode ? "text-emerald-300 font-black" : "text-emerald-800 font-black") : (isGameDarkMode ? "text-slate-400" : "text-slate-600")}>
                              {count} cặp
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {((isSentence && sentenceEligibleWords.length === 0) || (!isSentence && matchingEligibleWords.length === 0)) ? (
              <div className={`mx-auto mt-4 max-w-xl rounded-2xl border p-4 text-xs font-semibold text-left ${isGameDarkMode ? "border-amber-700/50 bg-amber-900/30 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                Chưa có từ vựng phù hợp với lựa chọn cấp độ này. Hãy chọn cấp độ khác hoặc đổi phạm vi bộ đề.
              </div>
            ) : null}

            {error ? (
              <div role="alert" className={`mx-auto mt-4 max-w-xl rounded-2xl border p-3 text-xs font-semibold ${isGameDarkMode ? "border-red-700/50 bg-red-900/30 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
                {error}
              </div>
            ) : null}

            {/* Quick stats row */}
            <div className="mx-auto mt-6 max-w-xl grid grid-cols-3 gap-3 text-left">
              <div className={`rounded-xl border p-3 ${isGameDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <p className={`text-xs ${isGameDarkMode ? (isSentence ? "text-indigo-300" : "text-emerald-300") : "text-slate-600 font-bold"}`}>Từ vựng khả dụng</p>
                <p className={`mt-1 text-sm font-bold ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>
                  {isSentence ? sentenceEligibleWords.length : matchingEligibleWords.length} {isSentence ? "câu" : "từ"}
                </p>
              </div>
              <div className={`rounded-xl border p-3 ${isGameDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <p className={`text-xs ${isGameDarkMode ? (isSentence ? "text-indigo-300" : "text-emerald-300") : "text-slate-600 font-bold"}`}>Chế độ chơi</p>
                <p className={`mt-1 text-sm font-bold ${isGameDarkMode ? "text-white" : "text-slate-900"}`}>
                  {isSentence
                    ? (sentenceMode === "TIME_ATTACK" ? `Time Attack (${timeLimitSeconds}s)` : "Cổ điển")
                    : (MATCHING_DIFFICULTIES.find((d) => d.pairs === matchingWordCount)?.gridText ?? `Lưới ${matchingWordCount} cặp`)}
                </p>
              </div>
              <div className={`rounded-xl border p-3 ${isGameDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <p className={`text-xs ${isGameDarkMode ? (isSentence ? "text-indigo-300" : "text-emerald-300") : "text-slate-600 font-bold"}`}>Mục tiêu {isSentence ? "câu" : "từ"}</p>
                <p className={`mt-1 text-sm font-bold ${isGameDarkMode ? "text-amber-300" : "text-amber-600"}`}>
                  {isSentence
                    ? sentenceMode === "TIME_ATTACK"
                      ? `${timeLimitSeconds} giây`
                      : sentenceQuestionCount === "full" || sentenceQuestionCount === "all"
                      ? `${sentenceEligibleWords.length} câu`
                      : `${sentenceQuestionCount} câu`
                    : `${Math.min(typeof matchingWordCount === "number" ? matchingWordCount : 8, matchingEligibleWords.length)} cặp (${Math.min(typeof matchingWordCount === "number" ? matchingWordCount : 8, matchingEligibleWords.length) * 2} thẻ)`}
                </p>
              </div>
            </div>

            {/* Keyboard shortcut / Gameplay guide */}
            {isSentence ? (
              <div className={`mx-auto mt-4 max-w-xl rounded-xl border p-3 text-left text-xs space-y-1 ${
                isGameDarkMode ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-700 shadow-sm"
              }`}>
                <p>⌨️ <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>1 / 2 / 3 / 4 hoặc A / B / C / D</strong>: Chọn phương án trả lời tương ứng</p>
                <p>⌨️ <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>Enter / Phím cách</strong>: Nộp câu hoặc chuyển sang câu hỏi tiếp theo</p>
                <p>⌨️ <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>Esc</strong>: Tạm dừng hoặc thoát phiên chơi</p>
              </div>
            ) : (
              <div className={`mx-auto mt-4 max-w-xl rounded-xl border p-3 text-left text-xs space-y-1 ${
                isGameDarkMode ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-700 shadow-sm"
              }`}>
                <p>🃏 <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>Lật thẻ</strong>: Bấm vào thẻ từ tiếng Anh hoặc thẻ nghĩa tiếng Việt để mở thẻ</p>
                <p>🔗 <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>Nối cặp</strong>: Bấm tiếp thẻ tương ứng để ghép cặp từ với nghĩa chính xác</p>
                <p>🔄 <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>Chưa khớp</strong>: Hai thẻ sẽ tự động úp lại sau 0.7 giây để bạn ghi nhớ vị trí</p>
                <p>⚡ <strong className={isGameDarkMode ? "text-white" : "text-slate-900"}>Chuỗi combo</strong>: Ghép đúng liên tiếp nhận thêm điểm thưởng cấp số cộng</p>
              </div>
            )}

            {/* Start Button & Back */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/vocabulary/games"
                className={`inline-flex items-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-sm sm:text-base font-extrabold shadow-sm transition hover:scale-105 active:scale-95 ${
                  isGameDarkMode ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại chọn game
              </Link>
              <button
                type="button"
                disabled={submitting || (isSentence ? sentenceEligibleWords.length === 0 : matchingEligibleWords.length === 0)}
                onClick={() => void startGame()}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm sm:text-base font-black text-white shadow-lg transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 ${
                  isSentence
                    ? "bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 shadow-indigo-600/25"
                    : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 shadow-teal-500/25"
                }`}
              >
                {isSentence ? <Zap className="h-5 w-5" /> : <span>🧩</span>}
                <span>{submitting ? "Đang chuẩn bị phòng đấu..." : isSentence ? "🎮 Bắt đầu chơi" : "🧩 Bắt đầu chơi"}</span>
              </button>
            </div>
          </section>
        )}

            {(isSentence || isMatching) && isSetPickerOpen ? (
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
                    {/* Item đặc biệt: Tất cả bộ đề */}
                    <button
                      type="button"
                      disabled={isLoadingSet}
                      onClick={() => void handleSelectVocabularySet({
                        id: "ALL",
                        title: "Tất cả bộ đề (Toàn bộ kho từ)",
                        category: "Kho từ vựng tổng hợp",
                      } as VocabularyTestSet)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                        isAllDecksSelected
                          ? "border-indigo-500 bg-indigo-50/90 font-bold text-indigo-950 ring-1 ring-indigo-500"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0 pr-2">
                        <span className="block truncate text-sm font-bold text-indigo-950">🗂 Tất cả bộ đề (Toàn bộ kho từ)</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Kho từ vựng tổng hợp · {totalAllWordsCount} từ từ mọi bộ đề
                        </span>
                      </span>
                      {isAllDecksSelected ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                      ) : (
                        <span className="shrink-0 text-xs font-bold text-indigo-600">Chọn</span>
                      )}
                    </button>

                    {isLoadingSet ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm font-bold text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                        Đang tải bộ đề...
                      </div>
                    ) : filteredSets.length === 0 ? (
                      <p className="py-6 text-center text-sm text-slate-400">Không tìm thấy bộ đề phù hợp.</p>
                    ) : filteredSets.map((set) => {
                      const isSelected = !isAllDecksSelected && set.id === selectedSetId;
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
                              {set.category || "Từ vựng TOEIC"} · {set.words?.length || set.wordCount || 0} từ
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

            {/* Stars Rating Display */}
            {gameResult?.stars != null && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 transition-all ${
                      star <= (gameResult.stars ?? 0)
                        ? "fill-amber-400 text-amber-400 drop-shadow-md scale-110"
                        : "fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600"
                    }`}
                  />
                ))}
              </div>
            )}

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
                  {gameResult?.maxCombo ?? (isMatching ? matchBestCombo : maxCombo)}
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
                <ArrowLeft className="h-4 w-4" /> Về trung tâm trò chơi
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
                <span>{isSentence ? `Câu hỏi ${index + 1} / ${sessionWords.length}` : `Tiến độ ghép cặp: ${matchMatched.size} / ${sessionWords.length} từ`}</span>
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

                {/* Answer Feedback Banner & Explanation */}
                {answerResult && (
                  <div className="space-y-3">
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

                    {/* Detailed Explanation & Context Translation Box */}
                    <div className={`rounded-2xl border p-4 text-left space-y-2.5 ${
                      isGameDarkMode ? "border-indigo-800/50 bg-slate-800/80 text-slate-200" : "border-indigo-100 bg-indigo-50/70 text-slate-800"
                    }`}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Giải thích ngữ cảnh & Dịch nghĩa
                        </span>
                      </div>

                      {/* Dịch câu hoàn chỉnh */}
                      {(currentWord.exampleVi || currentWord.exampleMeaning || currentWord.senses?.find((s) => s.exampleMeaning)?.exampleMeaning) ? (
                        <div className="text-xs sm:text-sm">
                          <span className="font-bold text-slate-500 dark:text-slate-400">Dịch câu: </span>
                          <span className="font-semibold italic">
                            &ldquo;{currentWord.exampleVi || currentWord.exampleMeaning || currentWord.senses?.find((s) => s.exampleMeaning)?.exampleMeaning}&rdquo;
                          </span>
                        </div>
                      ) : null}

                      {/* Phân tích từ vựng & từ loại */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-indigo-200/40 dark:border-slate-700">
                        <span className="font-bold text-slate-900 dark:text-white">{currentWord.word}</span>
                        {currentWord.ipa ? <span className="text-slate-500">/{currentWord.ipa}/</span> : null}
                        {(currentWord.partOfSpeech || currentWord.pos) ? (
                          <span className="rounded-md bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                            {normalizeVocabularyPartOfSpeech(currentWord.partOfSpeech || currentWord.pos || "")}
                          </span>
                        ) : null}
                        <span className="text-slate-600 dark:text-slate-300">Nghĩa: <strong>{getMeaning(currentWord)}</strong></span>
                      </div>

                      {/* Ý nghĩa các phương án A, B, C, D */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        {choiceWords.map((word, idx) => (
                          <div key={word.id} className={`rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                            word.id === currentWord.id
                              ? isGameDarkMode ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isGameDarkMode ? "bg-slate-900/60 text-slate-400" : "bg-white text-slate-600 border border-slate-200"
                          }`}>
                            <span className="font-bold shrink-0">{["A", "B", "C", "D"][idx]}. {word.word}:</span>
                            <span className="truncate text-right">{getMeaning(word)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── WORD MATCHING ARENA ── */}
            {isMatching && (
              <div className={`rounded-3xl border-2 p-4 sm:p-6 shadow-md space-y-4 ${isGameDarkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
                {/* Arena Header */}
                <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3.5 ${isGameDarkMode ? "border-slate-800" : "border-slate-200"}`}>
                  <div>
                    <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${isGameDarkMode ? "text-white" : "text-slate-950"}`}>
                      <span>🧩</span> Ghép cặp thẻ Từ vựng & Ý nghĩa
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${isGameDarkMode ? "bg-indigo-900/80 text-indigo-200 border border-indigo-700" : "bg-indigo-100 text-indigo-950 border border-indigo-300"}`}>
                        {sessionWords.length <= 4 ? "Lưới 2×4 (8 thẻ)" : sessionWords.length <= 6 ? "Lưới 3×4 (12 thẻ)" : sessionWords.length <= 8 ? "Lưới 4×4 (16 thẻ)" : sessionWords.length <= 10 ? "Lưới 4×5 (20 thẻ)" : `${sessionWords.length} cặp (${sessionWords.length * 2} thẻ)`}
                      </span>
                    </h2>
                    <p className={`text-xs font-bold mt-1 ${isGameDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                      Lượt đã lật: <span className={isGameDarkMode ? "text-white font-black" : "text-slate-950 font-black"}>{matchAttempts}</span> · Đã ghép thành công: <span className={isGameDarkMode ? "text-emerald-300 font-black" : "text-emerald-800 font-black"}>{matchMatched.size}/{sessionWords.length} cặp</span> ({sessionWords.length * 2} thẻ)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className={`flex items-center rounded-xl p-1 border ${isGameDarkMode ? "border-slate-800 bg-slate-800/80" : "border-slate-200 bg-slate-100"}`}>
                      <button
                        type="button"
                        onClick={() => setMatchViewMode("grid")}
                        title="Lưới tập trung (Chuẩn Lật Hình 4x4)"
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black transition ${
                          matchViewMode === "grid"
                            ? isGameDarkMode ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-indigo-950 shadow-sm"
                            : isGameDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950"
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" /> Lưới 4×4
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchViewMode("split")}
                        title="Tách 2 cột Anh - Việt"
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black transition ${
                          matchViewMode === "split"
                            ? isGameDarkMode ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-emerald-950 shadow-sm"
                            : isGameDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950"
                        }`}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" /> Chia 2 cột
                      </button>
                    </div>

                    {matchCombo > 1 && (
                      <span className={`rounded-full border px-3 py-1 text-xs font-black animate-bounce ${
                        isGameDarkMode ? "border-amber-700 bg-amber-950/80 text-amber-300" : "border-amber-300 bg-amber-100 text-amber-950 shadow-xs"
                      }`}>
                        🔥 Combo x{matchCombo}
                      </span>
                    )}
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${
                      isGameDarkMode ? "border-emerald-700/60 bg-emerald-950/80 text-emerald-300" : "border-emerald-300 bg-emerald-100 text-emerald-950 shadow-xs"
                    }`}>
                      Đúng {matchMatched.size} · Lỗi {wrongMatches}
                    </span>
                  </div>
                </div>

                {/* View Mode 1: Unified Grid (Lưới Lật Hình Tập Trung 4x4) */}
                {matchViewMode === "grid" ? (
                  <div className={`grid gap-3 sm:gap-3.5 ${unifiedGridColsClass}`}>
                    {effectiveBoardCards.map((card) => {
                      const isMatched = matchMatched.has(card.wordId);
                      const isFlipped = isMatched || matchFlipped.some((c) => c.side === card.side && c.wordId === card.wordId);
                      const isShaking = matchShakingCards.includes(`${card.side}:${card.wordId}`);
                      const isSelected = !isMatched && matchFlipped.some((c) => c.side === card.side && c.wordId === card.wordId);
                      const isEnglish = card.side === "word";

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            if (isMatched) {
                              if (isEnglish) playWord(card.word);
                              return;
                            }
                            onMatchCardClick(card.word, card.side);
                          }}
                          className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 sm:p-4 text-left transition-all active:scale-[0.98] select-none min-h-[96px] sm:min-h-[112px] shadow-sm ${
                            isMatched
                              ? isGameDarkMode
                                ? "border-emerald-600 bg-emerald-950/60 text-emerald-100 opacity-95 cursor-pointer shadow-sm"
                                : "border-emerald-500 bg-emerald-50 text-emerald-950 opacity-95 cursor-pointer shadow-sm"
                              : isShaking
                              ? isGameDarkMode
                                ? "border-red-500 bg-red-950/80 text-red-100 animate-shake shadow-md"
                                : "border-red-500 bg-red-50 text-red-950 animate-shake shadow-md"
                              : isSelected
                              ? isEnglish
                                ? isGameDarkMode
                                  ? "border-indigo-400 bg-indigo-950/90 text-white ring-2 ring-indigo-400 shadow-lg scale-[1.02]"
                                  : "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500 shadow-lg scale-[1.02]"
                                : isGameDarkMode
                                  ? "border-emerald-400 bg-emerald-950/90 text-white ring-2 ring-emerald-400 shadow-lg scale-[1.02]"
                                  : "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 shadow-lg scale-[1.02]"
                              : isGameDarkMode
                              ? isEnglish
                                ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-indigo-500 hover:bg-slate-750 hover:shadow-md"
                                : "border-slate-700 bg-slate-800 text-slate-100 hover:border-emerald-500 hover:bg-slate-750 hover:shadow-md"
                              : isEnglish
                              ? "border-indigo-200 bg-white text-slate-900 hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md"
                              : "border-emerald-200 bg-white text-slate-900 hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-md"
                          }`}
                        >
                          {isFlipped ? (
                            <div className="flex h-full w-full flex-col justify-between">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="min-w-0 flex-1">
                                  {isEnglish ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`text-base sm:text-xl font-black tracking-wide truncate ${
                                        isMatched
                                          ? isGameDarkMode ? "text-emerald-200" : "text-emerald-950"
                                          : isSelected
                                          ? isGameDarkMode ? "text-white" : "text-indigo-950"
                                          : isGameDarkMode ? "text-white" : "text-slate-950"
                                      }`}>
                                        {card.word.word}
                                      </span>
                                      {card.word.partOfSpeech && (
                                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-black uppercase ${
                                          isMatched
                                            ? isGameDarkMode
                                              ? "bg-emerald-900 text-emerald-200 border border-emerald-700"
                                              : "bg-emerald-200 text-emerald-950 border border-emerald-300"
                                            : isGameDarkMode
                                              ? "bg-indigo-900 text-indigo-200 border border-indigo-700"
                                              : "bg-indigo-100 text-indigo-950 border border-indigo-300"
                                        }`}>
                                          {card.word.partOfSpeech}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <p className={`text-sm sm:text-base font-black leading-snug line-clamp-2 ${
                                      isMatched
                                        ? isGameDarkMode ? "text-emerald-200" : "text-emerald-950"
                                        : isSelected
                                        ? isGameDarkMode ? "text-white" : "text-emerald-950"
                                        : isGameDarkMode ? "text-white" : "text-slate-950"
                                    }`}>
                                      {getMeaning(card.word)}
                                    </p>
                                  )}
                                </div>

                                {isMatched ? (
                                  <span className="shrink-0 rounded-full bg-emerald-600 text-white p-1 text-xs font-black shadow-sm">
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                ) : isEnglish ? (
                                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-black ${
                                    isGameDarkMode ? "bg-indigo-900/80 text-indigo-200 border border-indigo-700" : "bg-indigo-100 text-indigo-950 border border-indigo-300"
                                  }`}>
                                    🔤 EN
                                  </span>
                                ) : (
                                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-black ${
                                    isGameDarkMode ? "bg-emerald-900/80 text-emerald-200 border border-emerald-700" : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                  }`}>
                                    🇻🇳 VI
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs mt-1.5">
                                {isEnglish ? (
                                  <>
                                    {(card.word.phonetic || card.word.pronunciation) ? (
                                      <span className={`font-bold truncate text-xs sm:text-sm ${
                                        isMatched
                                          ? isGameDarkMode ? "text-emerald-300 font-extrabold" : "text-emerald-800 font-extrabold"
                                          : isGameDarkMode ? "text-indigo-300 font-extrabold" : "text-indigo-800 font-extrabold"
                                      }`}>
                                        /{card.word.phonetic || card.word.pronunciation}/
                                      </span>
                                    ) : <span />}
                                    {isMatched && (
                                      <Volume2 className={`h-4 w-4 shrink-0 ml-1 hover:scale-110 transition ${
                                        isGameDarkMode ? "text-emerald-300" : "text-emerald-700"
                                      }`} />
                                    )}
                                  </>
                                ) : (
                                  card.word.partOfSpeech ? (
                                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-black uppercase ${
                                      isMatched
                                        ? isGameDarkMode ? "text-emerald-300" : "text-emerald-800"
                                        : isGameDarkMode ? "text-emerald-300" : "text-emerald-800"
                                    }`}>
                                      {card.word.partOfSpeech}
                                    </span>
                                  ) : <span />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center py-1">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-black shadow-xs ${
                                isEnglish
                                  ? isGameDarkMode
                                    ? "bg-indigo-900/90 text-indigo-200 border border-indigo-700"
                                    : "bg-indigo-100 text-indigo-950 border border-indigo-300"
                                  : isGameDarkMode
                                    ? "bg-emerald-900/90 text-emerald-200 border border-emerald-700"
                                    : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                              }`}>
                                <span>{isEnglish ? "🔤" : "🇻🇳"}</span>
                                <span>{isEnglish ? "Thẻ từ tiếng Anh" : "Thẻ nghĩa tiếng Việt"}</span>
                              </span>
                              <span className={`text-[11px] sm:text-xs font-bold ${
                                isGameDarkMode ? "text-slate-400" : "text-slate-600"
                              }`}>
                                Chạm để mở thẻ
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* View Mode 2: Split Dual-Grid (Thẻ Anh bên trái, Thẻ Việt bên phải - Dạng Lưới Compact) */
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Left: English Cards Compact Grid */}
                    <div className={`space-y-2.5 rounded-2xl border p-3.5 ${isGameDarkMode ? "border-indigo-900/50 bg-slate-900/70" : "border-indigo-200 bg-indigo-50/50"}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isGameDarkMode ? "text-indigo-300" : "text-indigo-900"}`}>
                          <span>🔤</span> Thẻ từ tiếng Anh
                        </p>
                        <span className={`text-[11px] font-bold ${isGameDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                          {sessionWords.length - matchMatched.size} thẻ còn lại
                        </span>
                      </div>
                      <div className={`grid gap-2 sm:gap-2.5 ${splitSubGridColsClass}`}>
                        {sessionWords.map((word) => {
                          const isMatched = matchMatched.has(word.id);
                          const isFlipped = isMatched || matchFlipped.some((c) => c.side === "word" && c.wordId === word.id);
                          const isShaking = matchShakingCards.includes(`word:${word.id}`);
                          const isSelected = !isMatched && matchFlipped.some((c) => c.side === "word" && c.wordId === word.id);

                          return (
                            <button
                              key={`word-${word.id}`}
                              type="button"
                              onClick={() => {
                                if (isMatched) {
                                  playWord(word);
                                  return;
                                }
                                onMatchCardClick(word, "word");
                              }}
                              className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 sm:p-3.5 text-left transition-all active:scale-[0.98] select-none min-h-[96px] sm:min-h-[112px] ${
                                isMatched
                                  ? isGameDarkMode
                                    ? "border-emerald-600 bg-emerald-950/60 text-emerald-100 opacity-95 cursor-pointer shadow-sm"
                                    : "border-emerald-500 bg-emerald-50 text-emerald-950 opacity-95 cursor-pointer shadow-sm"
                                  : isShaking
                                  ? isGameDarkMode
                                    ? "border-red-500 bg-red-950/80 text-red-100 animate-shake shadow-md"
                                    : "border-red-500 bg-red-50 text-red-950 animate-shake shadow-md"
                                  : isSelected
                                  ? isGameDarkMode
                                    ? "border-indigo-400 bg-indigo-950/90 text-white ring-2 ring-indigo-400 shadow-lg scale-[1.02]"
                                    : "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500 shadow-lg scale-[1.02]"
                                  : isGameDarkMode
                                  ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-indigo-500 hover:bg-slate-750 hover:shadow-md"
                                  : "border-indigo-200 bg-white text-slate-900 hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md"
                              }`}
                            >
                              {isFlipped ? (
                                <div className="flex h-full w-full flex-col justify-between">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-base sm:text-xl font-black tracking-wide truncate ${
                                          isMatched
                                            ? isGameDarkMode ? "text-emerald-200" : "text-emerald-950"
                                            : isSelected
                                            ? isGameDarkMode ? "text-white" : "text-indigo-950"
                                            : isGameDarkMode ? "text-white" : "text-slate-950"
                                        }`}>
                                          {word.word}
                                        </span>
                                        {word.partOfSpeech && (
                                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-black uppercase ${
                                            isMatched
                                              ? isGameDarkMode
                                                ? "bg-emerald-900 text-emerald-200 border border-emerald-700"
                                                : "bg-emerald-200 text-emerald-950 border border-emerald-300"
                                              : isGameDarkMode
                                                ? "bg-indigo-900 text-indigo-200 border border-indigo-700"
                                                : "bg-indigo-100 text-indigo-950 border border-indigo-300"
                                          }`}>
                                            {word.partOfSpeech}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {isMatched ? (
                                      <span className="shrink-0 rounded-full bg-emerald-600 text-white p-1 text-xs font-black shadow-sm">
                                        <Check className="h-3.5 w-3.5" />
                                      </span>
                                    ) : (
                                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-black ${
                                        isGameDarkMode ? "bg-indigo-900/80 text-indigo-200 border border-indigo-700" : "bg-indigo-100 text-indigo-950 border border-indigo-300"
                                      }`}>
                                        🔤 EN
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-xs mt-1.5">
                                    {(word.phonetic || word.pronunciation) ? (
                                      <span className={`font-bold truncate text-xs sm:text-sm ${
                                        isMatched
                                          ? isGameDarkMode ? "text-emerald-300 font-extrabold" : "text-emerald-800 font-extrabold"
                                          : isGameDarkMode ? "text-indigo-300 font-extrabold" : "text-indigo-800 font-extrabold"
                                      }`}>
                                        /{word.phonetic || word.pronunciation}/
                                      </span>
                                    ) : <span />}
                                    {isMatched && (
                                      <Volume2 className={`h-4 w-4 shrink-0 ml-1 hover:scale-110 transition ${
                                        isGameDarkMode ? "text-emerald-300" : "text-emerald-700"
                                      }`} />
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center py-1">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:text-sm font-black shadow-xs ${
                                    isGameDarkMode ? "bg-indigo-900/90 text-indigo-200 border border-indigo-700" : "bg-indigo-100 text-indigo-950 border border-indigo-300"
                                  }`}>
                                    <span>🔤</span>
                                    <span>Thẻ từ tiếng Anh</span>
                                  </span>
                                  <span className={`text-[11px] sm:text-xs font-bold ${
                                    isGameDarkMode ? "text-slate-400" : "text-slate-600"
                                  }`}>
                                    Chạm để mở thẻ
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Vietnamese Meanings Compact Grid */}
                    <div className={`space-y-2.5 rounded-2xl border p-3.5 ${isGameDarkMode ? "border-emerald-900/50 bg-slate-900/70" : "border-emerald-200 bg-emerald-50/50"}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isGameDarkMode ? "text-emerald-300" : "text-emerald-900"}`}>
                          <span>🇻🇳</span> Thẻ nghĩa tiếng Việt
                        </p>
                        <span className={`text-[11px] font-bold ${isGameDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                          {sessionWords.length - matchMatched.size} thẻ còn lại
                        </span>
                      </div>
                      <div className={`grid gap-2 sm:gap-2.5 ${splitSubGridColsClass}`}>
                        {effectiveMeaningWords.map((word) => {
                          const isMatched = matchMatched.has(word.id);
                          const isFlipped = isMatched || matchFlipped.some((c) => c.side === "meaning" && c.wordId === word.id);
                          const isShaking = matchShakingCards.includes(`meaning:${word.id}`);
                          const isSelected = !isMatched && matchFlipped.some((c) => c.side === "meaning" && c.wordId === word.id);

                          return (
                            <button
                              key={`meaning-${word.id}`}
                              type="button"
                              onClick={() => {
                                if (isMatched) return;
                                onMatchCardClick(word, "meaning");
                              }}
                              className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 sm:p-3.5 text-left transition-all active:scale-[0.98] select-none min-h-[96px] sm:min-h-[112px] ${
                                isMatched
                                  ? isGameDarkMode
                                    ? "border-emerald-600 bg-emerald-950/60 text-emerald-100 opacity-95 cursor-default shadow-sm"
                                    : "border-emerald-500 bg-emerald-50 text-emerald-950 opacity-95 cursor-default shadow-sm"
                                  : isShaking
                                  ? isGameDarkMode
                                    ? "border-red-500 bg-red-950/80 text-red-100 animate-shake shadow-md"
                                    : "border-red-500 bg-red-50 text-red-950 animate-shake shadow-md"
                                  : isSelected
                                  ? isGameDarkMode
                                    ? "border-emerald-400 bg-emerald-950/90 text-white ring-2 ring-emerald-400 shadow-lg scale-[1.02]"
                                    : "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 shadow-lg scale-[1.02]"
                                  : isGameDarkMode
                                  ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-emerald-500 hover:bg-slate-750 hover:shadow-md"
                                  : "border-emerald-200 bg-white text-slate-900 hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-md"
                              }`}
                            >
                              {isFlipped ? (
                                <div className="flex h-full w-full flex-col justify-between">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-sm sm:text-base font-black leading-snug line-clamp-2 ${
                                        isMatched
                                          ? isGameDarkMode ? "text-emerald-200" : "text-emerald-950"
                                          : isSelected
                                          ? isGameDarkMode ? "text-white" : "text-emerald-950"
                                          : isGameDarkMode ? "text-white" : "text-slate-950"
                                      }`}>
                                        {getMeaning(word)}
                                      </p>
                                    </div>
                                    {isMatched ? (
                                      <span className="shrink-0 rounded-full bg-emerald-600 text-white p-1 text-xs font-black shadow-sm">
                                        <Check className="h-3.5 w-3.5" />
                                      </span>
                                    ) : (
                                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-black ${
                                        isGameDarkMode ? "bg-emerald-900/80 text-emerald-200 border border-emerald-700" : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                      }`}>
                                        🇻🇳 VI
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between text-xs mt-1.5">
                                    {word.partOfSpeech ? (
                                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-black uppercase ${
                                        isMatched
                                          ? isGameDarkMode ? "text-emerald-300 font-extrabold" : "text-emerald-800 font-extrabold"
                                          : isGameDarkMode ? "text-emerald-300 font-extrabold" : "text-emerald-800 font-extrabold"
                                      }`}>
                                        {word.partOfSpeech}
                                      </span>
                                    ) : <span />}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center py-1">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs sm:text-sm font-black shadow-xs ${
                                    isGameDarkMode ? "bg-emerald-900/90 text-emerald-200 border border-emerald-700" : "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                  }`}>
                                    <span>🇻🇳</span>
                                    <span>Thẻ nghĩa tiếng Việt</span>
                                  </span>
                                  <span className={`text-[11px] sm:text-xs font-bold ${
                                    isGameDarkMode ? "text-slate-400" : "text-slate-600"
                                  }`}>
                                    Chạm để mở thẻ
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
      : isReview ? isWeakWordSession ? "Ôn từ cần củng cố" : "Ôn tập SRS"
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
          <div
            tabIndex={isReview ? 0 : undefined}
            onPointerDown={handleFlashcardPointerDown}
            onPointerMove={handleFlashcardPointerMove}
            onPointerUp={handleFlashcardPointerUp}
            onPointerCancel={() => {
              swipeStart.current = null;
              setIsCardDragging(false);
              setSwipeOffset(0);
            }}
            onKeyDown={isReview ? handleFlashcardKeyDown : undefined}
            style={isReview ? { transform: `translateX(${swipeOffset}px) rotate(${swipeOffset / 28}deg)` } : undefined}
            className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm touch-pan-y ${isCardDragging ? "transition-none" : "transition-transform duration-300"} sm:p-8 ${isReview ? "outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" : ""} ${swipeDirection === "left" ? "border-rose-300 bg-rose-50" : swipeDirection === "right" ? "border-emerald-300 bg-emerald-50" : ""}`}
          >
            {isReview && flipped && swipeOffset !== 0 ? (
              <div className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-2xl font-black uppercase tracking-widest ${
                swipeOffset < 0 ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
              }`}>
                {swipeOffset < 0 ? "Chưa nhớ" : "Đã nhớ"}
              </div>
            ) : null}
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
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-center text-sm font-semibold text-slate-500">
                  Vuốt trái nếu chưa nhớ · vuốt phải nếu đã nhớ
                </p>
                <div className="flex w-full items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => submitRating("AGAIN", "left")}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    ← Chưa nhớ
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => submitRating("GOOD", "right")}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    Đã nhớ →
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={submitting}
                      aria-expanded={ratingMenuOpen}
                      onClick={() => setRatingMenuOpen((open) => !open)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Khác <ChevronDown className="h-4 w-4" />
                    </button>
                    {ratingMenuOpen ? (
                      <div role="menu" className="absolute bottom-full right-0 z-20 mb-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                        <button
                          type="button"
                          role="menuitem"
                          disabled={submitting}
                          onClick={() => submitRating("HARD", "left")}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-amber-50"
                        >
                          Khó nhớ
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={submitting}
                          onClick={() => submitRating("EASY", "right")}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-emerald-50"
                        >
                          Rất dễ
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
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
