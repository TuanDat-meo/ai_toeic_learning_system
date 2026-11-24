/**
 * BATTLESHIP VOCABULARY - BẢNG CẤU HÌNH TRẬN ĐẤU TẬP TRUNG
 * Tất cả hằng số cân bằng game, luật chơi và thông số hệ thống được định nghĩa tại đây.
 * Kế thừa toàn vẹn và nâng cấp cho cơ chế 2D Space Shooter & Neon Cyberpunk.
 */

export const BATTLESHIP_CONFIG = {
  // === 1. THÔNG SỐ CHIẾN HẠM NGƯỜI CHƠI ===
  PLAYER_MAX_HP: 5,
  PLAYER_START_HP: 5,
  INITIAL_LIVES: 3, // 3 mạng chiến đấu khởi đầu theo mục 8

  // === 2. GIỚI HẠN VÀ TIẾN ĐỘ TRẬN ĐẤU ===
  MAX_QUESTIONS_PER_MATCH: 20, // Trần 20 câu/trận
  DEFAULT_QUESTION_COUNT: 20,
  AVAILABLE_QUESTION_COUNTS: [20] as const,
  BOSS_SPAWN_INTERVAL: 10, // Boss xuất hiện sau mỗi 10 câu hỏi đã xử lý (mục 5)

  // === 3. HẠM ĐỘI ĐỊCH (3 ĐỢT CỐ ĐỊNH, TỔNG 12 HP) ===
  TOTAL_FLEET_HP: 12,
  WAVES: [
    {
      waveNumber: 1,
      name: "Tuần tra",
      description: "3 tàu tuần tra cơ động",
      shipType: "patrol" as const,
      shipCount: 3,
      hpPerShip: 1,
      totalWaveHp: 3,
      difficultyTier: "easy" as const,
      allowedQuestionTypes: ["meaning", "definition"] as const,
    },
    {
      waveNumber: 2,
      name: "Khu trục",
      description: "2 tàu khu trục hỏa lực trung bình",
      shipType: "destroyer" as const,
      shipCount: 2,
      hpPerShip: 2,
      totalWaveHp: 4,
      difficultyTier: "medium" as const,
      allowedQuestionTypes: ["blank", "audio"] as const,
    },
    {
      waveNumber: 3,
      name: "Boss Chiến hạm",
      description: "1 Thiết giáp hạm chỉ huy hạm đội (MVP: 1 giai đoạn)",
      shipType: "boss" as const,
      shipCount: 1,
      hpPerShip: 5,
      totalWaveHp: 5,
      difficultyTier: "hard" as const,
      allowedQuestionTypes: ["meaning", "definition", "blank", "audio", "context"] as const,
    },
  ] as const,

  ENEMY_TYPES: {
    patrol: { label: "Tàu tuần tra", hp: 1, shape: "patrol", code: "PT", level: "A1" },
    destroyer: { label: "Tàu khu trục", hp: 2, shape: "destroyer", code: "DD", level: "B1" },
    boss: { label: "Thiết giáp hạm Boss", hp: 5, shape: "boss", code: "BB", level: "mixed" },
  } as const,

  // === 4. HỆ THỐNG KẺ ĐỊCH KHÔNG GIAN (MỤC 4) ===
  SPACE_ENEMY_TYPES: {
    scout: {
      id: "scout" as const,
      name: "Tàu do thám",
      label: "Scout Interceptor",
      baseHp: 1,
      speedFactor: 1.4,
      description: "Tốc độ nhanh, 1 phát hạ gục, xuất hiện thường xuyên",
      points: 10,
    },
    armored: {
      id: "armored" as const,
      name: "Tàu thiết giáp",
      label: "Armored Cruiser",
      baseHp: 2,
      speedFactor: 0.85,
      description: "Có 2–3 lớp giáp, cần hoàn thành nhiều lần bắn",
      points: 25,
    },
    stealth: {
      id: "stealth" as const,
      name: "Tàu tàng hình",
      label: "Stealth Phantom",
      baseHp: 1,
      speedFactor: 1.0,
      cloakDelayMs: 2200, // Ẩn thông tin sau 2.2 giây
      description: "Ẩn thông tin từ vựng sau khoảng thời gian ngắn",
      points: 20,
    },
    bomb: {
      id: "bomb" as const,
      name: "Bom không gian",
      label: "Space Bomb Core",
      baseHp: 1,
      speedFactor: 0.6,
      fuseSeconds: 8, // Đếm ngược 8 giây
      description: "Có thời gian đếm ngược, nổ tung nếu bỏ lỡ",
      points: 15,
    },
    boss: {
      id: "boss" as const,
      name: "Chiến hạm Boss",
      label: "Dreadnought Flagship",
      baseHp: 5,
      speedFactor: 0.4,
      description: "Thanh máu riêng, đa giai đoạn, xuất hiện chu kỳ 10 câu",
      points: 100,
    },
  },

  // === 5. SÁT THƯƠNG & CHIẾN ĐẤU ===
  BASE_DAMAGE: 1, // Sát thương phát bắn trúng cơ bản
  CRITICAL_STREAKS: [5, 10, 15] as const, // Phát đúng thứ 5, 10, 15 liên tiếp
  CRITICAL_DAMAGE: 2, // Sát thương phát bắn chí mạng (x2)
  NEAR_MISS_DAMAGE: 0, // Bắn trúng nhưng 0 sát thương (Levenshtein = 1 với từ >= 6 ký tự)
  NEAR_MISS_MIN_WORD_LENGTH: 6,

  // === 6. PHẢN CÔNG CỦA ĐỊCH ===
  ENEMY_SHOTS_TO_FIRE: 2, // Bộ đếm tích lũy 2 lần sai -> Địch phản công
  ENEMY_DAMAGE: 1, // Mỗi lần phản công trừ 1 HP/mạng người chơi
  SOFT_TIME_LIMIT_SECONDS: 20, // Thời gian mềm mỗi câu (15 - 20s)
  SOFT_TIME_ENEMY_CHARGE: 1,

  // === 7. TÍNH ĐIỂM & COMBO (MỤC 7) ===
  BASE_QUESTION_SCORE: 10, // Điểm câu đúng cơ bản
  COMBO_BONUS_TABLE: {
    0: 0,
    1: 0,
    2: 5,
    3: 10,
    4: 15,
    5: 20, // Trần thưởng combo +20 từ chuỗi 5 trở lên
  } as Record<number, number>,
  MAX_COMBO_BONUS: 20,
  NEAR_MISS_SCORE: 5,
  PERFECT_HIT_BONUS: 5, // Trả lời nhanh trong 3 giây đầu: +5 điểm
  MISSION_COMPLETE_BONUS: 30, // Hoàn thành nhiệm vụ: +30 điểm
  BOSS_DEFEAT_BONUS: 100, // Đánh bại Boss: +100 điểm
  NO_LIVES_LOST_BONUS: 50, // Hoàn thành trận không mất mạng: +50 điểm

  // === 8. HỆ THỐNG GỢI Ý & VẬT PHẨM (MỤC 6) ===
  HINT_MAX_USES: 3,
  HINT_SCORE_PENALTY: 5,
  MAX_ACTIVE_INVENTORY_SLOTS: 3, // Tối đa 3 ô trang bị chủ động

  // === 9. TÁI NẠP TỪ SAI ===
  WRONG_WORD_REINSERT_GAP_MIN: 3,
  WRONG_WORD_REINSERT_GAP_MAX: 4,
  WRONG_WORD_MIX_RATIO: 0.25,

  // === 10. ĐÁNH GIÁ KẾT QUẢ (SAO CHIẾN DỊCH) ===
  STARS: {
    THREE_STAR: { minAccuracy: 90, minRemainingHp: 4 },
    TWO_STAR: { minAccuracy: 70, minRemainingHp: 2 },
    ONE_STAR: { minAccuracy: 0, minRemainingHp: 1 },
  },

  // === 11. LƯU TRỮ VÀ THỜI GIAN ===
  STORAGE_KEY: "toeic-battleship-session-v2",
  SETTINGS_KEY: "toeic-battleship-settings-v2",
  FEEDBACK_DURATION_MS: 850,
  COUNTER_ANIMATION_DURATION_MS: 1200,

  // === 12. HẰNG SỐ TƯƠNG THÍCH NGƯỢC ===
  INITIAL_QUESTION_COUNT: 20,
  QUESTION_COUNTS: [10, 20] as const,
  MAX_QUESTIONS_PER_SESSION: 20,
  HINT_USES: 3,
  SHIELD_USES: 0,
  REPAIR_USES: 0,
  DOUBLE_SHOT_USES: 0,
  TUTORIAL_SHOTS: 3,
  RESULT_CARD_DURATION_MS: 850,
  ANSWER_CHOICES: 4,
  ANSWER_TIMEOUT_SECONDS: 20,
  DISTRACTOR_REMOVAL_COUNT: 2,
  FLEET_HP_PER_QUESTION: 0.6,
  BOSS_HP: 5,
  BOSS_PHASES: 1,
  DOUBLE_SHOT_DAMAGE: 2,
  CRITICAL_COMBO: 5,
  WRONG_WORD_REINSERT_AFTER: 3,
  REPAIR_HP: 1,
} as const;

// Types suy dẫn từ Config
export type BattleShipType = keyof typeof BATTLESHIP_CONFIG.ENEMY_TYPES;
export type SpaceEnemyType = keyof typeof BATTLESHIP_CONFIG.SPACE_ENEMY_TYPES;
export type BattleDifficulty = "easy" | "medium" | "hard";
export type BattleQuestionType = "meaning" | "definition" | "blank" | "audio" | "context";
export type BattleAnswerResult = "correct" | "near" | "wrong" | "timeout";

// Hai chiều học từ vựng (Mục 3)
export type LearningDirection = "en-vi" | "vi-en" | "mixed";
export type AnswerInputMode = "choice" | "typing" | "hybrid";

export interface BattleShip {
  id: string;
  type: BattleShipType;
  waveNumber: number;
  hp: number;
  maxHp: number;
  label: string;
  phase?: number;
}

export interface SpaceEnemyShip {
  id: string;
  type: SpaceEnemyType;
  wordId: string;
  label: string;
  subLabel?: string;
  hp: number;
  maxHp: number;
  speed: number;
  x: number;
  y: number;
  isCloaked?: boolean;
  bombFuse?: number;
  isBoss?: boolean;
  bossPhase?: number;
}

// 10 Power-ups Catalog (Mục 6)
export type PowerUpId =
  | "scanner"
  | "elimination"
  | "freeze"
  | "repair"
  | "multishot"
  | "shield"
  | "double-score"
  | "magnet"
  | "mystery-box"
  | "phoenix";

export interface PowerUpItem {
  id: PowerUpId;
  name: string;
  nameVi: string;
  description: string;
  category: "support" | "combat" | "special";
  hotkey: string;
  durationSeconds?: number;
  cooldownSeconds?: number;
  maxUses?: number;
  iconName: string;
}

// Nhiệm vụ ngẫu nhiên trong trận (Mục 9)
export interface BattleMission {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  rewardScore: number;
  rewardCoins: number;
}

export interface BattleFleetState {
  currentWave: number;
  ships: BattleShip[];
  currentTargetIndex: number;
}

export interface BattleSetup {
  mode: "single_deck" | "all_decks" | "by_level";
  deckScope?: "single_deck" | "all_decks";
  filterByLevel?: boolean;
  selectedLevels: string[];
  difficulty: BattleDifficulty;
  questionCount: 10 | 20;
  challenge: "mixed" | BattleQuestionType;
  direction?: LearningDirection;
  answerMode?: AnswerInputMode;
  seed?: number;
  primaryDeckId?: string;
  offlinePractice?: boolean;
}
