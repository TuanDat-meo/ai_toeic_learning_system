import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateDynamicSpeed } from "../../components/vocabulary/runner/speedCalculator.ts";
import {
  selectWordsForSession,
  ShuffleBag,
  getWordLevel,
  createSeededRandom,
} from "../../components/vocabulary/runner/wordSelector.ts";
import type { WordItem } from "../../app/admin/content/vocabulary/types.ts";

test("SpeedCalculator: 3 warmup questions remain at base speed and tier 0", () => {
  for (let q = 0; q < 3; q++) {
    const res = calculateDynamicSpeed({
      preset: "medium",
      questionIndex: q,
      correctStreak: 10,
      wrongStreak: 0,
    });
    assert.equal(res.tier, 0, `Warmup question ${q} must remain at tier 0`);
    assert.equal(res.isWarmup, true);
    assert.equal(res.effectiveSpeed, 165); // Mặc định medium
  }
});

test("SpeedCalculator: 5 correct streak increases tier by 1; 2 wrong streak decreases tier", () => {
  const normalSpeed = calculateDynamicSpeed({
    preset: "medium",
    questionIndex: 4,
    correctStreak: 5,
    wrongStreak: 0,
  });
  assert.equal(normalSpeed.tier, 1, "5 correct streak should yield tier 1");
  assert.ok(normalSpeed.effectiveSpeed > 165, "Speed should increase at tier 1");

  const demotedSpeed = calculateDynamicSpeed({
    preset: "medium",
    questionIndex: 4,
    correctStreak: 5,
    wrongStreak: 2,
  });
  assert.equal(demotedSpeed.tier, 0, "2 wrong streak should reduce tier back to 0");
});

test("SpeedCalculator: Distance between obstacles scales with speed to guarantee >= 1.6s rest", () => {
  const slowRes = calculateDynamicSpeed({
    preset: "slow",
    questionIndex: 5,
    correctStreak: 0,
    wrongStreak: 0,
  });
  const fastRes = calculateDynamicSpeed({
    preset: "fast",
    questionIndex: 5,
    correctStreak: 15,
    wrongStreak: 0,
  });

  // Quãng đường khi chạy nhanh phải lớn hơn chạy chậm
  assert.ok(
    fastRes.nextEncounterDistancePx > slowRes.nextEncounterDistancePx,
    "Fast speed must have longer distance to keep rest time constant"
  );

  // Thời gian chạy qua quãng đường (trừ vùng kích hoạt) phải xấp xỉ 1.6 giây
  const restTimeSlow = (slowRes.nextEncounterDistancePx - 95) / slowRes.effectiveSpeed;
  const restTimeFast = (fastRes.nextEncounterDistancePx - 95) / fastRes.effectiveSpeed;
  assert.ok(Math.abs(restTimeSlow - 1.6) < 0.1, "Slow rest time must be ~1.6s");
  assert.ok(Math.abs(restTimeFast - 1.6) < 0.1, "Fast rest time must be ~1.6s");
});

test("WordSelector: ShuffleBag extracts each item before repeating", () => {
  const items = ["A", "B", "C", "D"];
  const bag = new ShuffleBag(items, createSeededRandom(42));
  const seenFirstRound = new Set<string>();

  for (let i = 0; i < 4; i++) {
    seenFirstRound.add(bag.next()!);
  }
  assert.equal(seenFirstRound.size, 4, "First 4 extractions must contain all unique items");
});

test("WordSelector: Correctly mixes 20-30% failed words from history", () => {
  const words: WordItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: `w-${i}`,
    setId: "set-1",
    word: `vocab${i}`,
    meaning: `nghĩa ${i}`,
    level: i < 10 ? "B1" : "B2",
  }));

  const wrongHistory: WordItem[] = [words[1], words[3], words[5]];

  const result = selectWordsForSession(words, [], {
    mode: "single_deck",
    targetCount: 10,
    wrongWordsHistory: wrongHistory,
    mixWrongRatio: 0.25,
    seed: 12345,
  });

  assert.equal(result.selectedWords.length, 10);
  const includedWrongs = result.selectedWords.filter((w) =>
    wrongHistory.some((wh) => wh.id === w.id)
  );
  assert.ok(
    includedWrongs.length >= 2,
    `Must include ~25% failed words (got ${includedWrongs.length})`
  );
});

test("WordSelector: by_level filters vocabulary accurately", () => {
  const words: WordItem[] = [
    { id: "1", setId: "s", word: "cat", meaning: "mèo", level: "A1" },
    { id: "2", setId: "s", word: "dog", meaning: "chó", level: "A1" },
    { id: "3", setId: "s", word: "ubiquitous", meaning: "khắp nơi", level: "C1" },
    { id: "4", setId: "s", word: "ephemeral", meaning: "phù du", level: "C1" },
  ];

  const result = selectWordsForSession(words, [], {
    mode: "by_level",
    targetCount: 10,
    selectedLevels: ["C1"],
    seed: 999,
  });

  // Toàn bộ từ được chọn phải có cấp độ C1
  for (const w of result.selectedWords) {
    assert.equal(getWordLevel(w), "C1");
  }
});

test("WordSelector: recognizes C2 words from the CEFR field", () => {
  assert.equal(getWordLevel({
    id: "c2",
    word: "perspicacious",
    cefrLevel: "C2",
  }), "C2");
});

test("WordSelector: all_decks includes words beyond the former 200-word cap", () => {
  const firstDeck = Array.from({ length: 205 }, (_, index) => ({
    id: `a-${index}`,
    setId: "deck-a",
    word: `word-a-${index}`,
    meaning: `meaning-a-${index}`,
    level: "A1",
  }));
  const secondDeck = Array.from({ length: 205 }, (_, index) => ({
    id: `b-${index}`,
    setId: "deck-b",
    word: `word-b-${index}`,
    meaning: `meaning-b-${index}`,
    level: "C2",
  }));
  const result = selectWordsForSession(firstDeck, [
    { setId: "deck-a", words: firstDeck },
    { setId: "deck-b", words: secondDeck },
  ], {
    mode: "all_decks",
    targetCount: 20,
    seed: 42,
  });

  assert.equal(result.distractorPool.length, 410);
  assert.ok(result.selectedWords.some((word) => word.setId === "deck-a"));
  assert.ok(result.selectedWords.some((word) => word.setId === "deck-b"));
});
