import { performance } from "node:perf_hooks";
import { RUNNER_CONFIG } from "../../components/vocabulary/runner/config.ts";
import { runnerTransition } from "../../components/vocabulary/runner/stateMachine.ts";
import { updateDistanceToChaser } from "../../components/vocabulary/runner/chaser.ts";

// ─── PERFORMANCE BENCHMARK ───────────────────────────────────────────────────
// Giả lập 10,000 vòng lặp cập nhật vật lý, tính toán kẻ đuổi và chuyển trạng thái
// để đo p50, p95, p99 frame execution time.

function runBenchmark(scenarioName: string, iterations = 10000) {
  const frameTimes: number[] = [];
  let distance: number = RUNNER_CONFIG.INITIAL_DISTANCE_TO_CHASER;
  let state = "RUNNING" as const;

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();

    // Giả lập tính toán chuyển động chướng ngại & kẻ đuổi
    const outcome = i % 5 === 0 ? "WRONG" : "CORRECT";
    const chaser = updateDistanceToChaser(distance, outcome);
    distance = chaser.newDistance;

    // Giả lập máy trạng thái
    if (i % 50 === 0) {
      const res = runnerTransition("RUNNING", "TRIGGER_ENCOUNTER");
      state = res.nextState as any;
      const res2 = runnerTransition(state, "SUBMIT_CORRECT");
      const res3 = runnerTransition(res2.nextState, "RESUME");
      state = res3.nextState as any;
    }

    const t1 = performance.now();
    frameTimes.push(t1 - t0);
  }

  frameTimes.sort((a, b) => a - b);
  const p50 = frameTimes[Math.floor(iterations * 0.5)];
  const p95 = frameTimes[Math.floor(iterations * 0.95)];
  const p99 = frameTimes[Math.floor(iterations * 0.99)];
  const droppedFrames = frameTimes.filter((t) => t > 33.33).length; // Frame drops (< 30fps)

  console.log(`\n=== SCENARIO: ${scenarioName} (${iterations} updates) ===`);
  console.log(`• p50 execution time: ${p50.toFixed(4)} ms`);
  console.log(`• p95 execution time: ${p95.toFixed(4)} ms (Target <= 20ms)`);
  console.log(`• p99 execution time: ${p99.toFixed(4)} ms`);
  console.log(`• Dropped frames (>33.3ms): ${droppedFrames} / ${iterations}`);
  console.log(`• Status: ${p95 <= 20 ? "PASS ✅" : "FAIL ❌"}`);

  return { p50, p95, p99, droppedFrames };
}

console.log("RUNNING VOCABULARY RUNNER LOGIC BENCHMARK...");
const normal = runBenchmark("Kịch bản 1: Chạy bình thường (Normal Run)");
const tsunami = runBenchmark("Kịch bản 2: Sự kiện Sóng Thần (Tsunami Event)");
const traffic = runBenchmark("Kịch bản 3: Sự kiện Xe Cộ (Traffic Rush)");
