import test from "node:test";
import assert from "node:assert/strict";
import { runnerTransition, isLoopActive, isQuestionPromptActive } from "../../components/vocabulary/runner/stateMachine.ts";
import { updateDistanceToChaser } from "../../components/vocabulary/runner/chaser.ts";
import { RUNNER_CONFIG } from "../../components/vocabulary/runner/config.ts";

test("StateMachine: valid core game flow IDLE -> RUNNING -> ENCOUNTER -> RESOLVE -> RUNNING", () => {
  // 1. Start from IDLE
  let result = runnerTransition("IDLE", "START");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nextState, "RUNNING");

  // 2. Encounter obstacle
  result = runnerTransition(result.nextState, "TRIGGER_ENCOUNTER");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nextState, "ENCOUNTER");

  // 3. Submit correct answer
  result = runnerTransition(result.nextState, "SUBMIT_CORRECT");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nextState, "RESOLVE");

  // 4. Resume running
  result = runnerTransition(result.nextState, "RESUME");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nextState, "RUNNING");
});

test("StateMachine: invalid transitions are rejected without crashing", () => {
  // Cannot submit answer while in IDLE
  const result = runnerTransition("IDLE", "SUBMIT_CORRECT");
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.nextState, "IDLE");

  // Cannot trigger tsunami while in ENCOUNTER
  const badEncounter = runnerTransition("ENCOUNTER", "TRIGGER_TSUNAMI");
  assert.strictEqual(badEncounter.valid, false);
  assert.strictEqual(badEncounter.nextState, "ENCOUNTER");
});

test("StateMachine: pause and unpause preserves loop correctly", () => {
  let result = runnerTransition("RUNNING", "PAUSE");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nextState, "PAUSED");
  assert.strictEqual(isLoopActive(result.nextState), false);

  result = runnerTransition(result.nextState, "UNPAUSE");
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nextState, "RUNNING");
  assert.strictEqual(isLoopActive(result.nextState), true);
});

test("Chaser: correct answer increases distance up to ceiling", () => {
  const initial = 80;
  const res = updateDistanceToChaser(initial, "CORRECT");
  assert.strictEqual(res.newDistance, Math.min(RUNNER_CONFIG.MAX_DISTANCE_TO_CHASER, initial + RUNNER_CONFIG.DISTANCE_GAIN_CORRECT));
  assert.strictEqual(res.isCaught, 0);

  // Near ceiling
  const capped = updateDistanceToChaser(95, "CORRECT");
  assert.strictEqual(capped.newDistance, RUNNER_CONFIG.MAX_DISTANCE_TO_CHASER);
});

test("Chaser: wrong answer decreases distance and triggers catch at <= 0", () => {
  // Normal wrong
  const res = updateDistanceToChaser(50, "WRONG");
  assert.strictEqual(res.newDistance, 50 - RUNNER_CONFIG.DISTANCE_LOSS_WRONG);
  assert.strictEqual(res.isCaught, 0);

  // Critical near chaser (e.g. distance = 10, penalty = 22 -> <= 0)
  const caught = updateDistanceToChaser(10, "WRONG");
  assert.strictEqual(caught.isCaught, 1);
  assert.strictEqual(caught.penaltyLives, RUNNER_CONFIG.CHASER_CATCH_PENALTY_LIVES);
  assert.strictEqual(caught.newDistance, RUNNER_CONFIG.DISTANCE_RESET_AFTER_CATCH);
});
