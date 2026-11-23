// ─── RUNNER BALANCING CONFIGURATION (MỤC 6A CÂN CHỈNH TỐC ĐỘ) ────────────────
// Toàn bộ hằng số cân bằng trò chơi (thời gian, xác suất, tốc độ, khoảng cách)
// được quản lý tập trung tại file này.

export const RUNNER_SPEED_PRESETS = {
  slow: {
    label: "Chậm",
    description: "Nhịp điệu thư thái, phù hợp làm quen và học từ mới",
    baseSpeed: 95, // px/s
    maxSpeed: 165,
    accelPerStep: 0.12,
  },
  medium: {
    label: "Vừa",
    description: "Tốc độ tiêu chuẩn, cân bằng giữa phản xạ và ghi nhớ",
    baseSpeed: 125, // px/s
    maxSpeed: 220,
    accelPerStep: 0.15,
  },
  fast: {
    label: "Nhanh",
    description: "Tốc độ cao, thách thức phản xạ đỉnh cao",
    baseSpeed: 175, // px/s
    maxSpeed: 300,
    accelPerStep: 0.18,
  },
} as const;

export type SpeedPresetKey = keyof typeof RUNNER_SPEED_PRESETS;

export const RUNNER_CONFIG = {
  // ── Sinh mệnh (Lives) ──
  INITIAL_LIVES: 3,
  MAX_LIVES: 3,

  // ── Kẻ đuổi & Khoảng cách (Khởi động êm) ──
  INITIAL_DISTANCE_TO_CHASER: 88,      // Khoảng cách khởi đầu an toàn (88%)
  MAX_DISTANCE_TO_CHASER: 100,         // Trần khoảng cách tối đa
  MIN_DISTANCE_TO_CHASER: 0,           // Mốc nguy hiểm (<= 0 sẽ phạt mạng)
  DISTANCE_GAIN_CORRECT: 12,           // Tăng khoảng cách khi trả lời đúng
  DISTANCE_LOSS_WRONG: 20,             // Rút ngắn khoảng cách khi sai/hết giờ
  DISTANCE_LOSS_TIMEOUT_WARNING: 6,    // Kẻ đuổi áp sát thêm mỗi giây trong 5 giây cuối
  CHASER_CATCH_PENALTY_LIVES: 1,       // Mất tim khi kẻ đuổi bắt kịp
  DISTANCE_RESET_AFTER_CATCH: 45,      // Đẩy lùi kẻ đuổi sau khi bị bắt

  // ── Tốc độ & Đường cong gia tốc bậc (Mục 6A.B) ──
  DEFAULT_SPEED_PRESET: "medium" as SpeedPresetKey,
  WARMUP_ENCOUNTERS_COUNT: 3,          // 3 điểm chạm đầu ở tốc độ thấp nhất (khởi động êm)
  STEP_COMBO_STREAK: 5,                // Mỗi 5 câu đúng liên tiếp tăng 1 bậc tốc độ
  MAX_SPEED_TIER: 5,                   // Tối đa 5 bậc tăng tốc
  MAX_SPEED_MULTIPLIER: 1.75,          // Trần tốc độ tối đa ~1.75x tốc độ gốc
  MISTAKE_STREAK_TO_DOWNGRADE: 2,      // Sai 2 lần liên tiếp tự động giảm 1 bậc tốc độ

  // ── Khoảng cách giữa các chướng ngại TÍNH THEO THỜI GIAN NGHỈ ──
  REST_TIME_BETWEEN_ENCOUNTERS_SEC: 3.2, // Đủ thời gian quan sát cảnh và chuẩn bị
  TRIGGER_ENCOUNTER_DISTANCE_PX: 130,   // Cảnh báo sớm trước chướng ngại

  // ── Thời gian trả lời (Timers) ──
  DEFAULT_QUESTION_TIMEOUT_SEC: 15,    // Thời gian tiêu chuẩn từng câu
  TSUNAMI_QUESTION_TIMEOUT_SEC: 9,     // Thời gian sóng thần (8-10 giây)
  TOAST_FEEDBACK_DURATION_MS: 1600,    // Đủ thời gian nhìn hành động nhảy/trượt
  STUNNED_DURATION_MS: 900,            // Thời gian vấp ngã

  // ── Chấm điểm & Combo ──
  BASE_SCORE_PER_QUESTION: 10,
  COMBO_BONUS_MULTIPLIER: 5,
  COMBO_CAP: 5,                        // Trần combo tối đa x5
  HINT_PENALTY_SCORE: 3,
  TYPO_TOLERANCE_PENALTY_SCORE: 2,

  // ── Hộp mù (Mystery Box Probability) ──
  MYSTERY_BOX_SPAWN_CHANCE: 0.35,
  POSITIVE_BOX_WEIGHT: 70,
  NEGATIVE_BOX_WEIGHT: 30,
  PITY_TIMER_NEGATIVE_STREAK: 3,       // <= 1 hiệu ứng tiêu cực trong 3 điểm chạm

  // ── Spaced Repetition (Lặp lại ngắt quãng) ──
  SPACED_REPETITION_OFFSET: 3,         // Chèn lại từ sai sau 3 câu
  WRONG_WORDS_MIX_RATIO: 0.25,         // Trộn 25% từ từng sai vào ván mới

  // ── Hiệu năng & Trợ năng ──
  TARGET_FPS: 60,
  ADAPTIVE_QUALITY_FPS_THRESHOLD: 40,
} as const;

export type RunnerConfig = typeof RUNNER_CONFIG;
