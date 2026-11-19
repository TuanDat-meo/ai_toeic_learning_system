import type { WordItem, VocabularyTestSet } from "@/app/admin/content/vocabulary/types";
import type { VocabularyGameSession } from "@/lib/api/vocabulary";

// ─── GAME STATE MACHINE TYPES ────────────────────────────────────────────────

export type GameState =
  | "IDLE"           // Đang ở màn hình chờ (Start Screen)
  | "RUNNING"        // Nhân vật tự chạy, nền cuộn liên tục
  | "ENCOUNTER"      // Dừng cuộn, hiện thẻ câu hỏi tại chướng ngại/hộp mù
  | "RESOLVE"        // Hiển thị phản hồi tức thì (toast/hoạt ảnh vượt qua hoặc va chạm)
  | "EVENT_TSUNAMI"  // Sự kiện đặc biệt: Sóng thần dồn ép thời gian (8-10s)
  | "EVENT_TRAFFIC"  // Sự kiện đặc biệt: Xe cộ lao tới, câu hỏi chuỗi mini-combo
  | "EVENT_SHAKE"    // Sự kiện đặc biệt: Rung lắc màn hình
  | "PAUSED"         // Tạm dừng (rời tab, bấm pause, khóa máy)
  | "GAME_OVER"      // Thua cuộc (hết mạng hoặc bị kẻ đuổi bắt kịp)
  | "VICTORY";       // Hoàn thành xuất sắc tất cả câu hỏi

export type GameEvent =
  | "START"
  | "TRIGGER_ENCOUNTER"
  | "SUBMIT_CORRECT"
  | "SUBMIT_WRONG"
  | "TIMEOUT"
  | "RESUME"
  | "PAUSE"
  | "UNPAUSE"
  | "TRIGGER_TSUNAMI"
  | "TRIGGER_TRAFFIC"
  | "TRIGGER_SHAKE"
  | "EVENT_RESOLVED"
  | "LOSE"
  | "WIN"
  | "RESTART";

// ─── ENCOUNTERS & OBSTACLES ──────────────────────────────────────────────────

export type EncounterType = "obstacle" | "mystery_box";

export type ObstacleKind =
  | "rock"        // Tảng đá (nhảy qua) ➔ đoán từ qua nghĩa
  | "low_branch"  // Cành cây thấp (trượt qua) ➔ điền chỗ trống
  | "pit"         // Hố sâu (nhảy vượt) ➔ nghe và gõ lại (audio)
  | "boss"        // Boss mỗi 10 câu ➔ thử thách nâng cao
  | "mystery_box"; // Hộp mù thưởng may rủi

export type MysteryBoxEffect =
  // Tích cực (~70%)
  | "BONUS_POINTS_SMALL"
  | "BONUS_POINTS_MEDIUM"
  | "HINT_BOOST"
  | "SHIELD"
  | "SPEED_BOOST"
  | "EXTRA_HEART"
  // Tiêu cực (~30%)
  | "SLOW_DOWN"
  | "TSUNAMI_RUSH"
  | "TRAFFIC_HAZARD"
  | "EARTHQUAKE_SHAKE";

export type BoxEffect = MysteryBoxEffect;

export interface ActiveEncounter {
  id: string;
  type: EncounterType;
  obstacleKind?: ObstacleKind;
  boxEffect?: BoxEffect;
  isNegativeBox?: boolean;
  questionIndex: number;
  word: WordItem;
  prompt: string;
  questionType: "VIETNAMESE_TO_ENGLISH" | "FILL_IN_BLANK" | "AUDIO";
  choices?: string[]; // 4 phương án cho chế độ di động hoặc chọn nhanh
  timeoutSec: number;
}

// ─── PLAYER & ANIMATION ──────────────────────────────────────────────────────

export type PlayerAnimation =
  | "idle"
  | "running"
  | "anticipate"
  | "jump"
  | "slide"
  | "dash"       // Kích hoạt khi combo >= 5 (vệt lửa)
  | "stumble"    // Vấp ngã / va chạm
  | "shielded"   // Khiên bảo vệ đang hoạt động
  | "cheer"      // Ăn mừng chuỗi đúng
  | "faint";     // Gục ngã khi thua

export type ChaserTheme = "monster" | "tsunami" | "truck";

// ─── RUNNER TOAST FEEDBACK ───────────────────────────────────────────────────

export interface RunnerToast {
  id: string;
  type: "correct" | "typo_correct" | "wrong" | "box_positive" | "box_negative";
  message: string;
  subMessage?: string;
  timestamp: number;
}

// ─── COMPONENT PROPS ─────────────────────────────────────────────────────────

export interface VocabularyRunnerGameProps {
  setId: string;
  testSet: VocabularyTestSet;
  words: WordItem[];
  initialSession?: VocabularyGameSession | null;
  onComplete?: (result: VocabularyGameSession) => void;
  onBackToCenter: () => void;
}
