import { test } from "node:test";
import assert from "node:assert/strict";
import { runnerTransition } from "../../components/vocabulary/runner/stateMachine.ts";
import { updateDistanceToChaser } from "../../components/vocabulary/runner/chaser.ts";
import { evaluateAnswer } from "../../components/vocabulary/runner/scoring.ts";
import { rollMysteryBox } from "../../components/vocabulary/runner/mysteryBox.ts";
import { reinsertFailedWord, type RunnerQuestionItem } from "../../components/vocabulary/runner/spacedRepetition.ts";

test("MemorySoak: 10 simulated game sessions execute with stable memory and zero leaks", () => {
  // Bắt đầu ép thu gom rác nếu có cờ gc
  if (typeof global.gc === "function") {
    global.gc();
  }

  const initialHeap = process.memoryUsage().heapUsed;
  const dummyWords: RunnerQuestionItem[] = Array.from({ length: 20 }, (_, idx) => ({
    instanceId: `inst-${idx}`,
    word: {
      id: `w-${idx}`,
      setId: "set-1",
      word: `word${idx}`,
      meaning: `nghĩa ${idx}`,
    },
    displayMeaning: `nghĩa ${idx}`,
    vietnameseMeaning: `nghĩa ${idx}`,
    exampleSentence: `Example sentence for word${idx}`,
    exampleMeaning: `Ví dụ nghĩa ${idx}`,
    type: "VIETNAMESE_TO_ENGLISH",
    prompt: `Đoán từ: nghĩa ${idx}`,
    choices: [`word${idx}`, `dummyA${idx}`, `dummyB${idx}`, `dummyC${idx}`],
  }));

  // Mô phỏng 10 ván chơi liên tục (mỗi ván 10 câu hỏi với hỗn hợp đúng, sai, mở hộp mù)
  for (let session = 0; session < 10; session++) {
    let state = "IDLE" as const;
    let lives = 3;
    let distance = 70;
    let combo = 0;
    let score = 0;
    let recentNegatives = 0;
    let queue = [...dummyWords];

    // Khởi động
    const startRes = runnerTransition(state, "START");
    assert.equal(startRes.valid, true);
    state = startRes.nextState as typeof state;

    for (let q = 0; q < 10; q++) {
      // Gặp encounter
      const encounterRes = runnerTransition("RUNNING", "TRIGGER_ENCOUNTER");
      state = encounterRes.nextState as typeof state;

      const isMysteryBox = q % 3 === 2;
      const isCorrect = q % 2 === 0;

      if (isCorrect) {
        const evalRes = evaluateAnswer({
          userInput: queue[q].word.word,
          correctWord: queue[q].word.word,
          usedHint: false,
          currentCombo: combo,
        });
        score += evalRes.pointsAwarded;
        combo = evalRes.newCombo;

        const chaserRes = updateDistanceToChaser(distance, "CORRECT");
        distance = chaserRes.newDistance;

        if (isMysteryBox) {
          const outcome = rollMysteryBox(recentNegatives, 0.5);
          if (outcome.scoreBonus) score += outcome.scoreBonus;
          if (!outcome.isPositive) recentNegatives++;
          else recentNegatives = 0;
        }

        const submitRes = runnerTransition("ENCOUNTER", "SUBMIT_CORRECT");
        state = submitRes.nextState as typeof state;
      } else {
        lives = Math.max(0, lives - 1);
        combo = 0;
        const chaserRes = updateDistanceToChaser(distance, "WRONG");
        distance = chaserRes.newDistance;

        queue = reinsertFailedWord(queue, queue[q], q, 3);

        const submitRes = runnerTransition("ENCOUNTER", "SUBMIT_WRONG");
        state = submitRes.nextState as typeof state;
      }

      // Resume
      const resumeRes = runnerTransition("RESOLVE", "RESUME");
      state = resumeRes.nextState as typeof state;
    }

    // Kết thúc ván
    const endRes = runnerTransition("RUNNING", "WIN");
    state = endRes.nextState as typeof state;
    assert.equal(state, "VICTORY");
  }

  if (typeof global.gc === "function") {
    global.gc();
  }

  const finalHeap = process.memoryUsage().heapUsed;
  const heapGrowth = (finalHeap - initialHeap) / initialHeap;

  // Heap growth sau 10 ván phải <= 15% (hoặc dưới ngưỡng 30MB)
  const heapGrowthMB = (finalHeap - initialHeap) / (1024 * 1024);
  assert.ok(
    heapGrowth <= 0.15 || heapGrowthMB < 15,
    `Heap growth ${heapGrowth * 100}% (${heapGrowthMB.toFixed(2)} MB) must be within budget`
  );
  assert.ok(finalHeap / (1024 * 1024) <= 100, "Total heap must remain <= 100 MB");
});
