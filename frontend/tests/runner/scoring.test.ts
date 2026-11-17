import test from "node:test";
import assert from "node:assert/strict";
import { levenshteinDistance, isWordVariant, evaluateAnswer } from "../../components/vocabulary/runner/scoring.ts";
import { reinsertFailedWord, type RunnerQuestionItem } from "../../components/vocabulary/runner/spacedRepetition.ts";
import { RUNNER_CONFIG } from "../../components/vocabulary/runner/config.ts";

test("Scoring: Levenshtein distance calculations", () => {
  assert.strictEqual(levenshteinDistance("express", "express"), 0);
  assert.strictEqual(levenshteinDistance("expres", "express"), 1); // Thiếu 1 chữ s
  assert.strictEqual(levenshteinDistance("exppress", "express"), 1); // Thừa 1 chữ p
  assert.strictEqual(levenshteinDistance("expross", "express"), 1); // Đổi 1 chữ o
  assert.strictEqual(levenshteinDistance("apple", "orange"), 5);
});

test("Scoring: English word variants detection", () => {
  // Plural / 3rd person
  assert.strictEqual(isWordVariant("expresses", "express"), true);
  assert.strictEqual(isWordVariant("parties", "party"), true);
  assert.strictEqual(isWordVariant("cats", "cat"), true);

  // Past / Participle
  assert.strictEqual(isWordVariant("expressed", "express"), true);
  assert.strictEqual(isWordVariant("stopped", "stop"), true);
  assert.strictEqual(isWordVariant("hurried", "hurry"), true);

  // Continuous
  assert.strictEqual(isWordVariant("expressing", "express"), true);
  assert.strictEqual(isWordVariant("running", "run"), true);

  // Non-variant
  assert.strictEqual(isWordVariant("expressive", "express"), false);
});

test("Scoring: Exact answer awards points and advances combo up to cap", () => {
  // Combo 0 -> 1
  let res = evaluateAnswer({
    userInput: "express",
    correctWord: "express",
    usedHint: false,
    currentCombo: 0,
  });
  assert.strictEqual(res.isAccepted, true);
  assert.strictEqual(res.isExact, true);
  assert.strictEqual(res.newCombo, 1);
  assert.strictEqual(res.pointsAwarded, 15); // 10 base + 5 combo

  // Combo at cap (5) should not exceed 5
  res = evaluateAnswer({
    userInput: "express",
    correctWord: "express",
    usedHint: false,
    currentCombo: 5,
  });
  assert.strictEqual(res.newCombo, RUNNER_CONFIG.COMBO_CAP);
});

test("Scoring: Typo tolerance (Levenshtein = 1) accepted with penalty, combo preserved", () => {
  const res = evaluateAnswer({
    userInput: "expres", // typo: 1 char off
    correctWord: "express",
    usedHint: false,
    currentCombo: 3,
  });
  assert.strictEqual(res.isAccepted, true);
  assert.strictEqual(res.isTypo, true);
  assert.strictEqual(res.newCombo, 3); // Giữ nguyên combo, không reset
  assert.strictEqual(res.pointsAwarded, RUNNER_CONFIG.BASE_SCORE_PER_QUESTION - RUNNER_CONFIG.TYPO_TOLERANCE_PENALTY_SCORE);
});

test("Scoring: Used hint deducts points and preserves combo without increasing", () => {
  const res = evaluateAnswer({
    userInput: "express",
    correctWord: "express",
    usedHint: true,
    currentCombo: 2,
  });
  assert.strictEqual(res.isAccepted, true);
  assert.strictEqual(res.newCombo, 2); // Không tăng combo
  assert.strictEqual(res.pointsAwarded, 10 + 10 - RUNNER_CONFIG.HINT_PENALTY_SCORE); // 17
});

test("Scoring: Completely wrong answer resets combo and awards 0 points", () => {
  const res = evaluateAnswer({
    userInput: "airplane",
    correctWord: "express",
    usedHint: false,
    currentCombo: 4,
  });
  assert.strictEqual(res.isAccepted, false);
  assert.strictEqual(res.newCombo, 0); // Reset combo
  assert.strictEqual(res.pointsAwarded, 0);
});

test("SpacedRepetition: Failed word reinserted with unique instance ID", () => {
  const dummyItem: RunnerQuestionItem = {
    instanceId: "inst-1",
    word: { id: "w-1", word: "express" },
    displayMeaning: "express",
    vietnameseMeaning: "thể hiện",
    exampleSentence: "",
    exampleMeaning: "",
    type: "VIETNAMESE_TO_ENGLISH",
    prompt: "thể hiện",
    choices: ["express", "banana", "cat", "dog"],
  };

  const queue: RunnerQuestionItem[] = [
    dummyItem,
    { ...dummyItem, instanceId: "inst-2" },
    { ...dummyItem, instanceId: "inst-3" },
    { ...dummyItem, instanceId: "inst-4" },
  ];

  const updated = reinsertFailedWord(queue, dummyItem, 0, 2);
  assert.strictEqual(updated.length, 5);
  // Reinserted at index 2
  assert.strictEqual(updated[2].word.id, "w-1");
  assert.strictEqual(updated[2].isReviewInstance, true);
  assert.notStrictEqual(updated[2].instanceId, dummyItem.instanceId);
});
