import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MYSTERY_BOX_TABLE,
  rollMysteryBox,
  type MysteryBoxOutcome,
} from "../../components/vocabulary/runner/mysteryBox.ts";

test("MysteryBox: Weighted table has valid distribution (~70% positive, ~30% negative)", () => {
  const positiveWeight = MYSTERY_BOX_TABLE.filter((i) => i.outcome.isPositive).reduce(
    (acc, curr) => acc + curr.weight,
    0
  );
  const negativeWeight = MYSTERY_BOX_TABLE.filter((i) => !i.outcome.isPositive).reduce(
    (acc, curr) => acc + curr.weight,
    0
  );
  const total = positiveWeight + negativeWeight;

  const positiveRatio = positiveWeight / total;
  const negativeRatio = negativeWeight / total;

  assert.ok(positiveRatio >= 0.65 && positiveRatio <= 0.75, `Positive ratio ${positiveRatio} should be ~70%`);
  assert.ok(negativeRatio >= 0.25 && negativeRatio <= 0.35, `Negative ratio ${negativeRatio} should be ~30%`);
});

test("MysteryBox: Pity Timer guarantees positive outcome when recentNegativeCount >= 1", () => {
  // Thử nghiệm 100 lần với các giá trị ngẫu nhiên từ 0.0 đến 0.99
  for (let i = 0; i < 100; i++) {
    const fakeRandom = i / 100;
    const outcome = rollMysteryBox(1, fakeRandom);
    assert.equal(
      outcome.isPositive,
      true,
      `Outcome ${outcome.name} must be positive when pity timer is triggered`
    );
  }
});

test("MysteryBox: Can produce negative effects when no recent negative encounters", () => {
  let sawNegative = false;
  for (let i = 0; i < 100; i++) {
    const outcome = rollMysteryBox(0, i / 100);
    if (!outcome.isPositive) {
      sawNegative = true;
      break;
    }
  }
  assert.equal(sawNegative, true, "Should be able to roll negative effects when recentNegativeCount is 0");
});
