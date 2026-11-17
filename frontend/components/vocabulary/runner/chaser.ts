import { RUNNER_CONFIG } from "./config.ts";

export interface ChaserCalculationResult {
  newDistance: number;
  delta: number;
  isCaught: number; // 0: không bị bắt, 1: bị bắt
  penaltyLives: number;
}

/**
 * Tính toán thay đổi khoảng cách với kẻ đuổi khi có kết quả trả lời.
 */
export function updateDistanceToChaser(
  currentDistance: number,
  outcome: "CORRECT" | "WRONG" | "TIMEOUT" | "SPEED_BOOST" | "SLOW_DOWN"
): ChaserCalculationResult {
  let delta = 0;

  switch (outcome) {
    case "CORRECT":
      delta = RUNNER_CONFIG.DISTANCE_GAIN_CORRECT;
      break;
    case "SPEED_BOOST":
      delta = RUNNER_CONFIG.DISTANCE_GAIN_CORRECT * 1.5;
      break;
    case "WRONG":
    case "TIMEOUT":
      delta = -RUNNER_CONFIG.DISTANCE_LOSS_WRONG;
      break;
    case "SLOW_DOWN":
      delta = -RUNNER_CONFIG.DISTANCE_LOSS_WRONG * 1.2;
      break;
  }

  let newDistance = Math.min(
    RUNNER_CONFIG.MAX_DISTANCE_TO_CHASER,
    currentDistance + delta
  );

  let isCaught = 0;
  let penaltyLives = 0;

  if (newDistance <= RUNNER_CONFIG.MIN_DISTANCE_TO_CHASER) {
    isCaught = 1;
    penaltyLives = RUNNER_CONFIG.CHASER_CATCH_PENALTY_LIVES;
    // Hồi phục lại một khoảng cách tối thiểu để người chơi có cơ hội lật ngược tình thế nếu còn mạng
    newDistance = RUNNER_CONFIG.DISTANCE_RESET_AFTER_CATCH;
  }

  return {
    newDistance,
    delta,
    isCaught,
    penaltyLives,
  };
}
