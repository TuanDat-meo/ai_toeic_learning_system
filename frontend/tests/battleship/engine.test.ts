import assert from "node:assert/strict";
import { test } from "node:test";
import type { WordItem } from "@/app/admin/content/vocabulary/types";
import {
  applyDamageToFleet,
  applyEnemyCharge,
  calculateDamage,
  calculateScoreForAnswer,
  calculateStars,
  compareLetters,
  evaluateBattleAnswer,
  generateFleet,
  getActiveTarget,
  isCriticalStreak,
  reinsertWrongWord,
  selectBattleWords,
  selectVocabularyGameWords,
  transitionBattle,
  updateStreakAndCombo,
} from "../../components/vocabulary/battleship/engine.ts";
import { BATTLESHIP_CONFIG } from "../../components/vocabulary/battleship/config.ts";

const sampleWord: WordItem = {
  id: "w-colour",
  word: "colour",
  meaning: "màu sắc",
  senses: [{ partOfSpeech: "noun", meaning: "màu sắc", synonyms: "color; hue" }],
  relatedForms: [{ id: "rf-1", relationType: "WORD_FAMILY", word: "colourful", partOfSpeech: "adj" }],
};

const shortWord: WordItem = {
  id: "w-cat",
  word: "cat",
  meaning: "con mèo",
};

test("FSM: Valid core gameplay transitions and rejected invalid transitions", () => {
  // Invalid transition
  assert.deepEqual(transitionBattle("LOBBY", "SUBMIT"), { state: "LOBBY", valid: false });

  // Valid flow
  assert.deepEqual(transitionBattle("LOBBY", "CREATE_SESSION"), { state: "CREATING_SESSION", valid: true });
  assert.deepEqual(transitionBattle("CREATING_SESSION", "SESSION_READY"), { state: "AIMING", valid: true });
  assert.deepEqual(transitionBattle("AIMING", "START_QUESTION"), { state: "QUESTION", valid: true });
  assert.deepEqual(transitionBattle("QUESTION", "SUBMIT"), { state: "SUBMITTING", valid: true });
  assert.deepEqual(transitionBattle("SUBMITTING", "RESOLVE"), { state: "RESOLVE", valid: true });
  assert.deepEqual(transitionBattle("RESOLVE", "TRIGGER_COUNTER"), { state: "ENEMY_COUNTER", valid: true });
  assert.deepEqual(transitionBattle("ENEMY_COUNTER", "COUNTER_RESOLVED"), { state: "NEXT_TARGET", valid: true });
  assert.deepEqual(transitionBattle("NEXT_TARGET", "AIM_READY"), { state: "AIMING", valid: true });
  assert.deepEqual(transitionBattle("RESOLVE", "TRIGGER_VICTORY"), { state: "VICTORY", valid: true });
  assert.deepEqual(transitionBattle("VICTORY", "SHOW_RESULT"), { state: "RESULT", valid: true });
  assert.deepEqual(transitionBattle("RESULT", "RESTART"), { state: "LOBBY", valid: true });
});

test("FSM: Pause and Resume correctly restores previous state", () => {
  assert.deepEqual(transitionBattle("QUESTION", "PAUSE"), { state: "PAUSED", valid: true });
  assert.deepEqual(transitionBattle("PAUSED", "RESUME", "QUESTION"), { state: "QUESTION", valid: true });
  assert.deepEqual(transitionBattle("PAUSED", "RESUME"), { state: "AIMING", valid: true }); // Fallback default
});

test("Answer Evaluation: Normalization, synonyms, near misses (>=6 chars), and short word rejections", () => {
  // Normalization and synonyms
  assert.equal(evaluateBattleAnswer({ answer: "  CoLoR  ", word: sampleWord }), "correct");
  assert.equal(evaluateBattleAnswer({ answer: "colourful", word: sampleWord }), "correct");
  assert.equal(evaluateBattleAnswer({ answer: "hue", word: sampleWord }), "correct");

  // Near miss: length("colour") = 6 >= 6, 1 typo -> near
  assert.equal(evaluateBattleAnswer({ answer: "colouur", word: sampleWord }), "near");

  // Short word: length("cat") = 3 < 6, 1 typo -> wrong (NOT near!)
  assert.equal(evaluateBattleAnswer({ answer: "car", word: shortWord }), "wrong");
  assert.equal(evaluateBattleAnswer({ answer: "dog", word: shortWord }), "wrong");

  // Letter by letter diff
  assert.deepEqual(compareLetters("colouur", "colour"), ["match", "match", "match", "match", "match", "miss"]);
});

test("Combat & Damage: Critical hit strictly at streaks 5, 10, 15 (2 damage); otherwise 1 damage", () => {
  assert.equal(isCriticalStreak(4), false);
  assert.equal(isCriticalStreak(5), true);
  assert.equal(isCriticalStreak(6), false);
  assert.equal(isCriticalStreak(10), true);
  assert.equal(isCriticalStreak(15), true);
  assert.equal(isCriticalStreak(20), false);

  assert.deepEqual(calculateDamage("correct", 1), { damage: 1, isCritical: false });
  assert.deepEqual(calculateDamage("correct", 4), { damage: 1, isCritical: false });
  assert.deepEqual(calculateDamage("correct", 5), { damage: 2, isCritical: true });
  assert.deepEqual(calculateDamage("correct", 10), { damage: 2, isCritical: true });
  assert.deepEqual(calculateDamage("near", 5), { damage: 0, isCritical: false });
  assert.deepEqual(calculateDamage("wrong", 5), { damage: 0, isCritical: false });
});

test("Combat & Scoring: Combo bonus table (capped at +20) and hint penalty (-5 points)", () => {
  // Combo 1: 10 + 0 = 10
  assert.deepEqual(calculateScoreForAnswer("correct", 1, false), { points: 10, hintDeduction: 0 });
  // Combo 2: 10 + 5 = 15
  assert.deepEqual(calculateScoreForAnswer("correct", 2, false), { points: 15, hintDeduction: 0 });
  // Combo 3: 10 + 10 = 20
  assert.deepEqual(calculateScoreForAnswer("correct", 3, false), { points: 20, hintDeduction: 0 });
  // Combo 4: 10 + 15 = 25
  assert.deepEqual(calculateScoreForAnswer("correct", 4, false), { points: 25, hintDeduction: 0 });
  // Combo >= 5: 10 + 20 = 30 (cap)
  assert.deepEqual(calculateScoreForAnswer("correct", 5, false), { points: 30, hintDeduction: 0 });
  assert.deepEqual(calculateScoreForAnswer("correct", 8, false), { points: 30, hintDeduction: 0 });

  // Hint deduction: 30 - 5 = 25
  assert.deepEqual(calculateScoreForAnswer("correct", 5, true), { points: 25, hintDeduction: 5 });

  // Near miss score
  assert.deepEqual(calculateScoreForAnswer("near", 3, false), { points: 5, hintDeduction: 0 });
});

test("Streak & Combo state updates: Near miss preserves, hint preserves combo, wrong resets", () => {
  // Correct normal
  assert.deepEqual(updateStreakAndCombo(3, 3, "correct", false), { nextStreak: 4, nextCombo: 4 });
  // Correct with hint: streak increments, but combo does NOT increment (preserved)
  assert.deepEqual(updateStreakAndCombo(3, 3, "correct", true), { nextStreak: 4, nextCombo: 3 });
  // Near miss: preserves both streak and combo
  assert.deepEqual(updateStreakAndCombo(3, 3, "near", false), { nextStreak: 3, nextCombo: 3 });
  // Wrong: resets both
  assert.deepEqual(updateStreakAndCombo(3, 3, "wrong", false), { nextStreak: 0, nextCombo: 0 });
});

test("Enemy Charge: Correct does NOT reset charge; 2 wrong triggers counterattack", () => {
  // 1st wrong: charge = 1, no counter
  assert.deepEqual(applyEnemyCharge(0, "wrong"), { charge: 1, nextCharge: 1, triggersCounter: false, damage: 0 });
  // Correct answer: charge remains 1 (does NOT reset)
  assert.deepEqual(applyEnemyCharge(1, "correct"), { charge: 1, nextCharge: 1, triggersCounter: false, damage: 0 });
  // Near miss: charge remains 1 (does NOT reset)
  assert.deepEqual(applyEnemyCharge(1, "near"), { charge: 1, nextCharge: 1, triggersCounter: false, damage: 0 });
  // 2nd wrong: counterattack triggers! Charge resets to 0, deals 1 damage
  assert.deepEqual(applyEnemyCharge(1, "timeout"), { charge: 0, nextCharge: 0, triggersCounter: true, damage: 1 });
});

test("Fleet & Waves: 3 fixed waves totaling 12 HP; sequential target elimination", () => {
  const fleet = generateFleet();
  assert.equal(fleet.length, 6); // 3 patrol + 2 destroyer + 1 boss

  const totalHp = fleet.reduce((sum, s) => sum + s.hp, 0);
  assert.equal(totalHp, 12); // Exactly 12 HP as specified in Section 2

  // Initial target is patrol-1 (1 HP)
  const initial = getActiveTarget(fleet);
  assert.equal(initial.target?.id, "patrol-1");
  assert.equal(initial.currentWave, 1);

  // Deal 1 damage -> patrol-1 destroyed, next target is patrol-2
  const step1 = applyDamageToFleet(fleet, 1);
  assert.equal(step1.isTargetDestroyed, true);
  assert.equal(step1.nextTarget?.id, "patrol-2");
  assert.equal(step1.isWaveCleared, false);

  // Clear wave 1 (patrol-2 and patrol-3)
  const step2 = applyDamageToFleet(step1.updatedFleet, 1);
  const step3 = applyDamageToFleet(step2.updatedFleet, 1);
  assert.equal(step3.isWaveCleared, true);
  assert.equal(step3.nextTarget?.id, "destroyer-1");
  assert.equal(step3.nextTarget?.waveNumber, 2);
});

test("Wrong Word Reinsertion: replaces future slot 3-4 questions ahead without exceeding 20 cap", () => {
  const words: WordItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: `w-${i}`,
    word: `word${i}`,
    meaning: `nghĩa ${i}`,
  }));

  const failedWord: WordItem = { id: "failed-w", word: "fail", meaning: "thất bại" };
  const updated = reinsertWrongWord(words, 2, failedWord);

  assert.equal(updated.length, 20); // Cannot exceed 20
  // Gap is 3 -> index 2 + 3 = 5 should now be the failed word
  assert.equal(updated[5].id, "failed-w");
});

test("Battle word selection fills the 20-question session when the deck is small", () => {
  const selection = selectBattleWords({
    decks: [{ id: "deck-1", words: [sampleWord] }],
    primaryDeckId: "deck-1",
    setup: {
      mode: "single_deck",
      selectedLevels: ["B1"],
      difficulty: "medium",
      questionCount: 20,
      challenge: "mixed",
      seed: 1,
    },
  });

  assert.equal(selection.words.length, BATTLESHIP_CONFIG.MAX_QUESTIONS_PER_SESSION);
  assert.ok(selection.words.every((word) => word.id === sampleWord.id));
});

test("Vocabulary game selection supports fixed sizes and all unique words", () => {
  const words: WordItem[] = [
    sampleWord,
    shortWord,
    { ...sampleWord, id: "duplicate-id", word: "COLOUR" },
    { id: "w-dog", word: "dog", meaning: "chó" },
  ];

  const tenWordDeck = Array.from({ length: 12 }, (_, index) => ({
    id: `w-${index}`,
    word: `word${index}`,
    meaning: `nghĩa ${index}`,
  }));
  const tenSelection = selectVocabularyGameWords(tenWordDeck, 10, 42);
  assert.equal(tenSelection.length, 10);
  assert.equal(new Set(tenSelection.map((word) => word.id)).size, 10);

  const twentySelection = selectVocabularyGameWords(tenWordDeck, 20, 42);
  assert.equal(twentySelection.length, 12);

  const allSelection = selectVocabularyGameWords(words, "all", 42);
  assert.deepEqual(new Set(allSelection.map((word) => word.id)), new Set(["w-colour", "w-cat", "w-dog"]));
});

test("Star rating calculation follows rules", () => {
  assert.equal(calculateStars(95, 5), 3);
  assert.equal(calculateStars(90, 4), 3);
  assert.equal(calculateStars(75, 3), 2);
  assert.equal(calculateStars(70, 2), 2);
  assert.equal(calculateStars(95, 1), 1);
  assert.equal(calculateStars(60, 5), 1);
});
