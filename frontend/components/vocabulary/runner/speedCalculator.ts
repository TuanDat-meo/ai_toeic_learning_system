import {
  RUNNER_CONFIG,
  RUNNER_SPEED_PRESETS,
  type SpeedPresetKey,
} from "./config.ts";

export interface DynamicSpeedState {
  preset: SpeedPresetKey;
  questionIndex: number;
  correctStreak: number;
  wrongStreak: number;
}

export interface SpeedCalculationResult {
  tier: number;                // Bậc tốc độ hiện tại (0 - 5)
  effectiveSpeed: number;      // Tốc độ thực tế (px/s)
  nextEncounterDistancePx: number; // Khoảng cách tới chướng ngại tiếp theo tương ứng thời gian nghỉ >= 1.6s
  isWarmup: boolean;           // Đang trong 3 câu khởi động êm
}

/**
 * Tính toán tốc độ chạy và khoảng cách chướng ngại dựa trên:
 * - Preset tốc độ (Chậm / Vừa / Nhanh)
 * - 3 câu đầu khởi động êm ở tốc độ thấp nhất
 * - Tăng tốc theo bậc mỗi 5 câu đúng liên tiếp
 * - Tự động giảm bậc khi sai 2 câu liên tiếp
 * - Khoảng cách chướng ngại tính theo THỜI GIAN NGHỈ (1.6s)
 */
export function calculateDynamicSpeed(state: DynamicSpeedState): SpeedCalculationResult {
  const presetConfig = RUNNER_SPEED_PRESETS[state.preset] || RUNNER_SPEED_PRESETS.medium;
  const isWarmup = state.questionIndex < RUNNER_CONFIG.WARMUP_ENCOUNTERS_COUNT;

  if (isWarmup) {
    const effectiveSpeed = presetConfig.baseSpeed;
    const nextEncounterDistancePx = Math.round(
      effectiveSpeed * RUNNER_CONFIG.REST_TIME_BETWEEN_ENCOUNTERS_SEC +
        RUNNER_CONFIG.TRIGGER_ENCOUNTER_DISTANCE_PX
    );
    return {
      tier: 0,
      effectiveSpeed,
      nextEncounterDistancePx,
      isWarmup: true,
    };
  }

  // Tính bậc tăng / giảm
  const bonusTiers = Math.floor(state.correctStreak / RUNNER_CONFIG.STEP_COMBO_STREAK);
  const penaltyTiers = Math.floor(state.wrongStreak / RUNNER_CONFIG.MISTAKE_STREAK_TO_DOWNGRADE);
  const rawTier = bonusTiers - penaltyTiers;
  const tier = Math.max(0, Math.min(RUNNER_CONFIG.MAX_SPEED_TIER, rawTier));

  // Tốc độ thực tế với trần tối đa
  const speedMultiplier = Math.min(
    RUNNER_CONFIG.MAX_SPEED_MULTIPLIER,
    1 + tier * presetConfig.accelPerStep
  );
  const effectiveSpeed = Math.min(
    presetConfig.maxSpeed,
    Math.round(presetConfig.baseSpeed * speedMultiplier)
  );

  // Khoảng cách giữa 2 chướng ngại vật đảm bảo thời gian nghỉ cố định >= 1.6 giây
  const nextEncounterDistancePx = Math.round(
    effectiveSpeed * RUNNER_CONFIG.REST_TIME_BETWEEN_ENCOUNTERS_SEC +
      RUNNER_CONFIG.TRIGGER_ENCOUNTER_DISTANCE_PX
  );

  return {
    tier,
    effectiveSpeed,
    nextEncounterDistancePx,
    isWarmup: false,
  };
}
