/**
 * BATTLESHIP VOCABULARY - CORE ENGINE & GAME LOGIC
 * Server-mirrorable turn-based battle engine for TOEIC vocabulary learning.
 * Triển khai đầy đủ: FSM, Combat, Scoring, Fleet Waves, Word Selection.
 */

import type { WordItem } from "@/app/admin/content/vocabulary/types";
import {
  BATTLESHIP_CONFIG,
  type BattleAnswerResult,
  type BattleDifficulty,
  type BattleFleetState,
  type BattleQuestionType,
  type BattleSetup,
  type BattleShip,
  type BattleShipType,
} from "./config.ts";

// ==========================================
// 1. FINITE STATE MACHINE (FSM)
// ==========================================

export type BattleState =
  | "LOBBY"
  | "SETUP" // Alias tương thích ngược cho LOBBY
  | "CREATING_SESSION"
  | "TUTORIAL"
  | "AIMING"
  | "QUESTION"
  | "SUBMITTING"
  | "RESOLVE"
  | "ENEMY_COUNTER"
  | "ENEMY_TURN" // Alias tương thích ngược cho ENEMY_COUNTER
  | "NEXT_TARGET"
  | "NEXT_WAVE"
  | "BOSS"
  | "BOSS_PHASE" // Alias tương thích ngược cho BOSS
  | "VICTORY"
  | "DEFEAT"
  | "RESULT"
  | "PAUSED"
  | "RECONNECTING";

export type BattleEvent =
  | "CREATE_SESSION"
  | "START" // Alias cho CREATE_SESSION
  | "START_TUTORIAL"
  | "TUTORIAL_DONE"
  | "SKIP_TUTORIAL"
  | "SESSION_READY"
  | "AIM_READY"
  | "AIM" // Alias cho AIM_READY
  | "START_QUESTION"
  | "FIRE" // Alias cho START_QUESTION
  | "SUBMIT"
  | "RESOLVE"
  | "TIMEOUT"
  | "TRIGGER_COUNTER"
  | "ENEMY_FIRE" // Alias cho TRIGGER_COUNTER
  | "COUNTER_RESOLVED"
  | "ENEMY_DONE" // Alias cho COUNTER_RESOLVED
  | "ADVANCE_TARGET"
  | "ADVANCE_WAVE"
  | "ENCOUNTER_BOSS"
  | "BOSS_ADVANCE" // Alias cho ENCOUNTER_BOSS
  | "BOSS_INTRO_DONE"
  | "WAVE_INTRO_DONE"
  | "SOFT_CHARGE" // Alias
  | "TRIGGER_VICTORY"
  | "WIN" // Alias cho TRIGGER_VICTORY
  | "TRIGGER_DEFEAT"
  | "LOSE" // Alias cho TRIGGER_DEFEAT
  | "SHOW_RESULT"
  | "RESTART"
  | "PAUSE"
  | "RESUME"
  | "DISCONNECT"
  | "RECONNECTED"
  | "QUIT_TO_LOBBY"
  | "SURRENDER"
  | "ERROR";

const TRANSITIONS: Record<BattleState, Partial<Record<BattleEvent, BattleState>>> = {
  LOBBY: {
    CREATE_SESSION: "CREATING_SESSION",
    START: "AIMING",
    START_TUTORIAL: "TUTORIAL",
  },
  SETUP: {
    START: "AIMING",
    CREATE_SESSION: "CREATING_SESSION",
    START_TUTORIAL: "TUTORIAL",
  },
  CREATING_SESSION: {
    SESSION_READY: "AIMING",
    ERROR: "LOBBY",
    QUIT_TO_LOBBY: "LOBBY",
  },
  TUTORIAL: {
    TUTORIAL_DONE: "AIMING",
    SKIP_TUTORIAL: "LOBBY",
    PAUSE: "PAUSED",
  },
  AIMING: {
    START_QUESTION: "QUESTION",
    FIRE: "QUESTION",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
    SURRENDER: "DEFEAT",
    TRIGGER_VICTORY: "VICTORY",
    WIN: "VICTORY",
    TRIGGER_DEFEAT: "DEFEAT",
    LOSE: "DEFEAT",
  },
  QUESTION: {
    SUBMIT: "SUBMITTING",
    RESOLVE: "RESOLVE",
    TIMEOUT: "SUBMITTING",
    SOFT_CHARGE: "ENEMY_COUNTER",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
  },
  SUBMITTING: {
    RESOLVE: "RESOLVE",
    TIMEOUT: "RESOLVE",
    DISCONNECT: "RECONNECTING",
  },
  RESOLVE: {
    TRIGGER_COUNTER: "ENEMY_COUNTER",
    ENEMY_FIRE: "ENEMY_COUNTER",
    ADVANCE_TARGET: "NEXT_TARGET",
    ADVANCE_WAVE: "NEXT_WAVE",
    ENCOUNTER_BOSS: "BOSS",
    BOSS_ADVANCE: "BOSS",
    TRIGGER_VICTORY: "VICTORY",
    WIN: "VICTORY",
    TRIGGER_DEFEAT: "DEFEAT",
    LOSE: "DEFEAT",
    AIM_READY: "AIMING",
    AIM: "AIMING",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
  },
  ENEMY_COUNTER: {
    COUNTER_RESOLVED: "NEXT_TARGET",
    ENEMY_DONE: "AIMING",
    ADVANCE_TARGET: "NEXT_TARGET",
    ADVANCE_WAVE: "NEXT_WAVE",
    ENCOUNTER_BOSS: "BOSS",
    AIM_READY: "AIMING",
    TRIGGER_DEFEAT: "DEFEAT",
    LOSE: "DEFEAT",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
  },
  ENEMY_TURN: {
    ENEMY_DONE: "AIMING",
    COUNTER_RESOLVED: "NEXT_TARGET",
    LOSE: "DEFEAT",
    PAUSE: "PAUSED",
  },
  NEXT_TARGET: {
    AIM_READY: "AIMING",
    AIM: "AIMING",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
  },
  NEXT_WAVE: {
    WAVE_INTRO_DONE: "AIMING",
    ENCOUNTER_BOSS: "BOSS",
    AIM_READY: "AIMING",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
  },
  BOSS: {
    BOSS_INTRO_DONE: "AIMING",
    AIM_READY: "AIMING",
    PAUSE: "PAUSED",
    DISCONNECT: "RECONNECTING",
  },
  BOSS_PHASE: {
    AIM: "AIMING",
    WIN: "VICTORY",
    PAUSE: "PAUSED",
  },
  VICTORY: {
    SHOW_RESULT: "RESULT",
    RESTART: "LOBBY",
    QUIT_TO_LOBBY: "LOBBY",
  },
  DEFEAT: {
    SHOW_RESULT: "RESULT",
    RESTART: "LOBBY",
    QUIT_TO_LOBBY: "LOBBY",
  },
  RESULT: {
    RESTART: "LOBBY",
    QUIT_TO_LOBBY: "LOBBY",
  },
  PAUSED: {
    RESUME: "AIMING", // Sẽ phục hồi theo previousState nếu được cung cấp
    RESTART: "LOBBY",
    QUIT_TO_LOBBY: "LOBBY",
    SURRENDER: "DEFEAT",
    LOSE: "DEFEAT",
  },
  RECONNECTING: {
    RECONNECTED: "AIMING", // Sẽ phục hồi theo previousState nếu được cung cấp
    QUIT_TO_LOBBY: "LOBBY",
    TRIGGER_DEFEAT: "DEFEAT",
  },
};

export function transitionBattle(
  state: BattleState,
  event: BattleEvent,
  previousState?: BattleState,
): { state: BattleState; valid: boolean } {
  // Xử lý phục hồi đặc biệt cho PAUSED và RECONNECTING
  if (state === "PAUSED" && event === "RESUME") {
    const target = previousState && previousState !== "PAUSED" ? previousState : "AIMING";
    return { state: target, valid: true };
  }
  if (state === "RECONNECTING" && event === "RECONNECTED") {
    const target = previousState && previousState !== "RECONNECTING" ? previousState : "AIMING";
    return { state: target, valid: true };
  }

  const nextState = TRANSITIONS[state]?.[event];
  if (nextState) {
    return { state: nextState, valid: true };
  }
  return { state, valid: false };
}

// ==========================================
// 2. FLEET INITIALIZATION (3 CỐ ĐỊNH, 12 HP)
// ==========================================

export function generateFleet(questionCount?: number): BattleShip[] {
  const fleet: BattleShip[] = [];

  // Đợt 1: 3 tàu tuần tra x 1 HP = 3 HP
  for (let i = 1; i <= 3; i++) {
    fleet.push({
      id: `patrol-${i}`,
      type: "patrol",
      waveNumber: 1,
      hp: 1,
      maxHp: 1,
      label: `Tuần tra #${i}`,
      phase: 1,
    });
  }

  // Đợt 2: 2 tàu khu trục x 2 HP = 4 HP
  for (let i = 1; i <= 2; i++) {
    fleet.push({
      id: `destroyer-${i}`,
      type: "destroyer",
      waveNumber: 2,
      hp: 2,
      maxHp: 2,
      label: `Khu trục #${i}`,
      phase: 1,
    });
  }

  // Đợt 3: 1 Boss chiến hạm x 5 HP = 5 HP
  fleet.push({
    id: "boss-flagship",
    type: "boss",
    waveNumber: 3,
    hp: 5,
    maxHp: 5,
    label: "Hạm trưởng Thiết giáp hạm",
    phase: 1,
  });

  return fleet;
}

export function getActiveTarget(fleet: BattleShip[]): {
  target: BattleShip | null;
  targetIndex: number;
  currentWave: number;
  isFleetDefeated: boolean;
} {
  const targetIndex = fleet.findIndex((ship) => ship.hp > 0);
  if (targetIndex === -1) {
    return { target: null, targetIndex: -1, currentWave: 3, isFleetDefeated: true };
  }
  const target = fleet[targetIndex];
  return {
    target,
    targetIndex,
    currentWave: target.waveNumber,
    isFleetDefeated: false,
  };
}

// ==========================================
// 3. ANSWER EVALUATION & STRING NORMALIZATION
// ==========================================

export function normalizeAnswer(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function levenshteinDistance(a: string, b: string): number {
  const s1 = [...normalizeAnswer(a)];
  const s2 = [...normalizeAnswer(b)];
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;
  if (s1.length > s2.length) return levenshteinDistance(b, a);

  let prevRow = Array.from({ length: s1.length + 1 }, (_, i) => i);
  for (let j = 1; j <= s2.length; j++) {
    const currRow = [j];
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[i] = Math.min(
        currRow[i - 1] + 1,
        prevRow[i] + 1,
        prevRow[i - 1] + cost,
      );
    }
    prevRow = currRow;
  }
  return prevRow[s1.length];
}

export function acceptedWordAnswers(word: WordItem): string[] {
  const set = new Set<string>();
  if (word.word) set.add(normalizeAnswer(word.word));

  // Tách từ đồng nghĩa
  if (word.senses) {
    for (const sense of word.senses) {
      if (sense.synonyms) {
        for (const syn of sense.synonyms.split(/[,;|]/)) {
          const norm = normalizeAnswer(syn);
          if (norm) set.add(norm);
        }
      }
    }
  }

  // Các dạng biến thể (relatedForms)
  if (word.relatedForms) {
    for (const form of word.relatedForms) {
      const norm = normalizeAnswer(form.word);
      if (norm) set.add(norm);
    }
  }

  return [...set];
}

export function evaluateBattleAnswer(input: {
  answer: string;
  word: WordItem;
}): BattleAnswerResult {
  const normalized = normalizeAnswer(input.answer);
  if (!normalized) return "wrong";

  const accepted = acceptedWordAnswers(input.word);
  if (accepted.includes(normalized)) {
    return "correct";
  }

  // Kiểm tra gần đúng: Chỉ áp dụng khi từ đích có độ dài >= 6 ký tự và sai khác 1 ký tự
  const primaryWordNorm = normalizeAnswer(input.word.word);
  if ([...primaryWordNorm].length >= BATTLESHIP_CONFIG.NEAR_MISS_MIN_WORD_LENGTH) {
    const isNear = accepted.some(
      (exp) => levenshteinDistance(normalized, exp) === 1,
    );
    if (isNear) return "near";
  }

  return "wrong";
}

export function compareLetters(
  answer: string,
  correct: string,
): ("match" | "miss" | "empty")[] {
  const expectedChars = [...normalizeAnswer(correct)];
  const actualChars = [...normalizeAnswer(answer)];

  return expectedChars.map((char, idx) => {
    if (actualChars[idx] == null) return "empty";
    return actualChars[idx] === char ? "match" : "miss";
  });
}

// ==========================================
// 4. COMBAT, DAMAGE, COMBO & SCORING
// ==========================================

export function isCriticalStreak(streak: number): boolean {
  return (BATTLESHIP_CONFIG.CRITICAL_STREAKS as readonly number[]).includes(streak);
}

export function calculateDamage(
  result: BattleAnswerResult,
  streakAfterAnswer: number,
): { damage: number; isCritical: boolean } {
  if (result === "wrong" || result === "timeout" || result === "near") {
    return { damage: BATTLESHIP_CONFIG.NEAR_MISS_DAMAGE, isCritical: false };
  }

  // Phát bắn đúng thứ 5, 10, 15 của chuỗi liên tiếp gây 2 sát thương
  if (isCriticalStreak(streakAfterAnswer)) {
    return { damage: BATTLESHIP_CONFIG.CRITICAL_DAMAGE, isCritical: true };
  }

  return { damage: BATTLESHIP_CONFIG.BASE_DAMAGE, isCritical: false };
}

export function calculateComboBonus(combo: number): number {
  if (combo <= 1) return 0;
  if (combo === 2) return 5;
  if (combo === 3) return 10;
  if (combo === 4) return 15;
  return BATTLESHIP_CONFIG.MAX_COMBO_BONUS; // combo >= 5 -> +20
}

export function calculateScoreForAnswer(
  result: BattleAnswerResult,
  combo: number,
  usedHint: boolean,
): { points: number; hintDeduction: number } {
  let points = 0;
  let hintDeduction = 0;

  if (result === "correct") {
    const base = BATTLESHIP_CONFIG.BASE_QUESTION_SCORE;
    const bonus = calculateComboBonus(combo);
    points = base + bonus;
    if (usedHint) {
      hintDeduction = BATTLESHIP_CONFIG.HINT_SCORE_PENALTY;
      points = Math.max(0, points - hintDeduction);
    }
  } else if (result === "near") {
    points = BATTLESHIP_CONFIG.NEAR_MISS_SCORE;
  }

  return { points, hintDeduction };
}

export function updateStreakAndCombo(
  currentStreak: number,
  currentCombo: number,
  result: BattleAnswerResult,
  usedHint: boolean,
): { nextStreak: number; nextCombo: number } {
  if (result === "wrong" || result === "timeout") {
    return { nextStreak: 0, nextCombo: 0 };
  }

  if (result === "near") {
    // Gần đúng không tăng combo, không reset combo
    return { nextStreak: currentStreak, nextCombo: currentCombo };
  }

  // Kết quả Đúng
  const nextStreak = currentStreak + 1;
  // Dùng gợi ý: không tăng combo cho câu đó (bảo toàn combo cũ)
  const nextCombo = usedHint ? currentCombo : currentCombo + 1;

  return { nextStreak, nextCombo };
}

export function applyEnemyCharge(
  currentCharge: number,
  result: BattleAnswerResult,
  _enemyType?: BattleShipType,
): {
  charge: number;
  nextCharge: number;
  triggersCounter: boolean;
  damage: number;
} {
  // Đúng hoặc Gần đúng: KHÔNG reset bộ đếm nạp của địch!
  if (result === "correct" || result === "near") {
    return {
      charge: currentCharge,
      nextCharge: currentCharge,
      triggersCounter: false,
      damage: 0,
    };
  }

  // Sai hoặc Quá giờ (timeout): Tăng bộ đếm nạp +1
  const nextCharge = currentCharge + 1;
  if (nextCharge >= BATTLESHIP_CONFIG.ENEMY_SHOTS_TO_FIRE) {
    return {
      charge: 0,
      nextCharge: 0, // Reset về 0 sau khi phản công
      triggersCounter: true,
      damage: BATTLESHIP_CONFIG.ENEMY_DAMAGE,
    };
  }

  return {
    charge: nextCharge,
    nextCharge,
    triggersCounter: false,
    damage: 0,
  };
}

export function applyDamageToFleet(
  fleet: BattleShip[],
  damage: number,
): {
  updatedFleet: BattleShip[];
  damagedShipId: string | null;
  actualDamage: number;
  isTargetDestroyed: boolean;
  isWaveCleared: boolean;
  isFleetDefeated: boolean;
  nextTarget: BattleShip | null;
} {
  const { target, targetIndex } = getActiveTarget(fleet);
  if (!target || damage <= 0) {
    return {
      updatedFleet: [...fleet],
      damagedShipId: null,
      actualDamage: 0,
      isTargetDestroyed: false,
      isWaveCleared: false,
      isFleetDefeated: !target,
      nextTarget: target,
    };
  }

  const updatedFleet = fleet.map((s, idx) => {
    if (idx !== targetIndex) return s;
    return { ...s, hp: Math.max(0, s.hp - damage) };
  });

  const damagedShip = updatedFleet[targetIndex];
  const isTargetDestroyed = damagedShip.hp === 0;

  // Kiểm tra xem đợt hiện tại đã bị dọn sạch chưa
  const currentWave = target.waveNumber;
  const remainingInWave = updatedFleet.filter(
    (s) => s.waveNumber === currentWave && s.hp > 0,
  );
  const isWaveCleared = remainingInWave.length === 0;

  // Lấy mục tiêu tiếp theo
  const { target: nextTarget, isFleetDefeated } = getActiveTarget(updatedFleet);

  return {
    updatedFleet,
    damagedShipId: target.id,
    actualDamage: damage,
    isTargetDestroyed,
    isWaveCleared,
    isFleetDefeated,
    nextTarget,
  };
}

// ==========================================
// 5. WORD SELECTION & WRONG WORD REINSERTION
// ==========================================

export function questionTypeForWave(waveNumber: number, index: number): BattleQuestionType {
  if (waveNumber === 1) {
    return index % 2 === 0 ? "meaning" : "definition";
  }
  if (waveNumber === 2) {
    return index % 2 === 0 ? "blank" : "audio";
  }
  // Wave 3 (Boss): Trộn các dạng, ưu tiên situation / definition
  const bossTypes: BattleQuestionType[] = ["context", "definition", "blank", "meaning", "audio"];
  return bossTypes[index % bossTypes.length];
}

export function reinsertWrongWord(
  words: WordItem[],
  currentIndex: number,
  wrongWord: WordItem,
): WordItem[] {
  // Thay thế vào một vị trí tương lai (sau 3 đến 4 câu), không thêm phần tử mới vượt quá 20
  const targetIndex = currentIndex + BATTLESHIP_CONFIG.WRONG_WORD_REINSERT_GAP_MIN;
  if (targetIndex >= words.length) {
    // Nếu quá sát cuối trận (ví dụ câu 18, 19), thử thay vào câu cuối cùng nếu chưa phải là nó
    const lastIndex = words.length - 1;
    if (lastIndex > currentIndex && words[lastIndex].id !== wrongWord.id) {
      const copy = [...words];
      copy[lastIndex] = wrongWord;
      return copy;
    }
    return words;
  }

  const copy = [...words];
  copy[targetIndex] = wrongWord;
  return copy;
}

export function selectBattleWords(input: {
  decks: { id: string; words: WordItem[] }[];
  primaryDeckId: string;
  setup: BattleSetup;
  previouslyWrongIds?: string[];
}): { words: WordItem[]; warning?: string } {
  let seed = input.setup.seed ?? 123456789;
  const random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };

  const shuffle = <T,>(arr: T[]): T[] => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const isSingleDeck = input.setup.deckScope
    ? input.setup.deckScope === "single_deck"
    : input.setup.mode === "single_deck";
  const primary = input.decks.find((d) => d.id === input.primaryDeckId) ?? input.decks[0];
  const allowedDecks = isSingleDeck ? (primary ? [primary] : []) : input.decks;

  const targetCount = BATTLESHIP_CONFIG.MAX_QUESTIONS_PER_MATCH; // Luôn cố định 20 câu
  const shouldFilterByLevel = input.setup.filterByLevel !== undefined
    ? input.setup.filterByLevel
    : input.setup.mode === "by_level";
  const levels = new Set((input.setup.selectedLevels ?? []).map((l) => l.toUpperCase()));
  const seenWords = new Set<string>();

  const filteredDecks = allowedDecks.map((deck) => ({
    id: deck.id,
    words: shuffle(
      deck.words.filter((w) => {
        const key = normalizeAnswer(w.word);
        if (!key || seenWords.has(key)) return false;
        if (shouldFilterByLevel) {
          const rawLevel = (w.cefrLevel || w.level || "").toUpperCase().trim();
          const normalizedLevel = rawLevel === "EASY" ? "A1" : rawLevel === "MEDIUM" ? "B1" : rawLevel === "HARD" ? "B2" : rawLevel;
          const wLevel = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(normalizedLevel) ? normalizedLevel : "UNCLASSIFIED";
          if (!levels.has(wLevel)) return false;
        }
        seenWords.add(key);
        return true;
      }),
    ),
  }));

  const candidates: WordItem[] = [];
  for (let round = 0; candidates.length < targetCount; round++) {
    let added = false;
    for (const d of filteredDecks) {
      if (d.words[round]) {
        candidates.push(d.words[round]);
        added = true;
        if (candidates.length >= targetCount) break;
      }
    }
    if (!added) break;
  }

  if (candidates.length === 0) {
    return { words: [], warning: "Không tìm thấy từ vựng phù hợp với thiết lập." };
  }

  // Pha trộn 20-30% từ sai trong quá khứ nếu có
  const wrongIds = new Set(input.previouslyWrongIds ?? []);
  const wrongCandidates = shuffle(candidates.filter((w) => wrongIds.has(w.id)));
  const wrongToMixCount = Math.min(
    wrongCandidates.length,
    Math.floor(targetCount * BATTLESHIP_CONFIG.WRONG_WORD_MIX_RATIO),
  );

  const selected: WordItem[] = wrongCandidates.slice(0, wrongToMixCount);
  const selectedIds = new Set(selected.map((w) => w.id));

  for (const w of candidates) {
    if (selected.length >= targetCount) break;
    if (!selectedIds.has(w.id)) {
      selectedIds.add(w.id);
      selected.push(w);
    }
  }

  // Nếu số từ trong bộ ít hơn 20 câu, tuần hoàn qua danh sách có sẵn
  const repeatPool = shuffle(candidates);
  let repeatIdx = 0;
  while (selected.length < targetCount) {
    selected.push(repeatPool[repeatIdx % repeatPool.length]);
    repeatIdx++;
  }

  return {
    words: selected,
    ...(input.setup.mode === "single_deck" && (primary?.words.length ?? 0) < 10
      ? { warning: `Bộ từ có ${primary?.words.length ?? 0} từ; một số từ sẽ được lặp lại.` }
      : candidates.length < targetCount
        ? { warning: `Chỉ có ${candidates.length} từ khả dụng; hệ thống sẽ phân bổ lặp lại hợp lý.` }
        : {}),
  };
}

export function selectVocabularyGameWords(
  words: WordItem[],
  questionCount: 10 | 20 | "all",
  seed = Date.now(),
): WordItem[] {
  const seenIds = new Set<string>();
  const seenWords = new Set<string>();
  const candidates = words.filter((word) => {
    const wordKey = normalizeAnswer(word.word);
    if (!word.id || !wordKey || seenIds.has(word.id) || seenWords.has(wordKey)) return false;
    seenIds.add(word.id);
    seenWords.add(wordKey);
    return true;
  });

  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  for (let index = candidates.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }

  return candidates.slice(0, questionCount === "all" ? candidates.length : questionCount);
}

export function calculateStars(accuracy: number, remainingHp: number): number {
  if (
    accuracy >= BATTLESHIP_CONFIG.STARS.THREE_STAR.minAccuracy &&
    remainingHp >= BATTLESHIP_CONFIG.STARS.THREE_STAR.minRemainingHp
  ) {
    return 3;
  }
  if (
    accuracy >= BATTLESHIP_CONFIG.STARS.TWO_STAR.minAccuracy &&
    remainingHp >= BATTLESHIP_CONFIG.STARS.TWO_STAR.minRemainingHp
  ) {
    return 2;
  }
  return 1;
}

// ==========================================
// 6. BACKWARD-COMPATIBLE ALIASES
// ==========================================

export function scoreForAnswer(combo: number, usedHint: boolean): number {
  return calculateScoreForAnswer("correct", combo, usedHint).points;
}

export function nextCombo(combo: number, result: BattleAnswerResult, usedHint: boolean): number {
  return updateStreakAndCombo(combo, combo, result, usedHint).nextCombo;
}

export function damageForAnswer(result: BattleAnswerResult, criticalReady = false): number {
  return calculateDamage(result, criticalReady ? 5 : 1).damage;
}

export function questionTypeForShip(
  type: BattleShipType,
  questionIndex: number,
  bossPhase = 1,
): BattleQuestionType {
  if (type === "patrol") return "meaning";
  if (type === "destroyer") return "blank";
  return bossPhase === 1 ? "definition" : "context";
}
