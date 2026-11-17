import type { GameState, GameEvent } from "./types";

// ─── TRANSITION MATRIX ───────────────────────────────────────────────────────
// Ma trận chuyển đổi trạng thái nghiêm ngặt, đảm bảo không có trạng thái "treo".

const VALID_TRANSITIONS: Record<GameState, Partial<Record<GameEvent, GameState>>> = {
  IDLE: {
    START: "RUNNING",
  },
  RUNNING: {
    TRIGGER_ENCOUNTER: "ENCOUNTER",
    TRIGGER_TSUNAMI: "EVENT_TSUNAMI",
    TRIGGER_TRAFFIC: "EVENT_TRAFFIC",
    TRIGGER_SHAKE: "EVENT_SHAKE",
    PAUSE: "PAUSED",
    LOSE: "GAME_OVER",
    WIN: "VICTORY",
  },
  ENCOUNTER: {
    SUBMIT_CORRECT: "RESOLVE",
    SUBMIT_WRONG: "RESOLVE",
    TIMEOUT: "RESOLVE",
    PAUSE: "PAUSED",
    LOSE: "GAME_OVER",
  },
  RESOLVE: {
    RESUME: "RUNNING",
    TRIGGER_ENCOUNTER: "ENCOUNTER", // Dành cho chuỗi sự kiện giao thông (traffic mini-combo)
    LOSE: "GAME_OVER",
    WIN: "VICTORY",
    PAUSE: "PAUSED",
  },
  EVENT_TSUNAMI: {
    TRIGGER_ENCOUNTER: "ENCOUNTER",
    EVENT_RESOLVED: "RUNNING",
    PAUSE: "PAUSED",
    LOSE: "GAME_OVER",
  },
  EVENT_TRAFFIC: {
    TRIGGER_ENCOUNTER: "ENCOUNTER",
    EVENT_RESOLVED: "RUNNING",
    PAUSE: "PAUSED",
    LOSE: "GAME_OVER",
  },
  EVENT_SHAKE: {
    TRIGGER_ENCOUNTER: "ENCOUNTER",
    EVENT_RESOLVED: "RUNNING",
    PAUSE: "PAUSED",
    LOSE: "GAME_OVER",
  },
  PAUSED: {
    UNPAUSE: "RUNNING",
    RESTART: "IDLE",
    LOSE: "GAME_OVER",
  },
  GAME_OVER: {
    RESTART: "IDLE",
    START: "RUNNING",
  },
  VICTORY: {
    RESTART: "IDLE",
    START: "RUNNING",
  },
};

/**
 * Thực hiện chuyển đổi trạng thái với bảo vệ nghiêm ngặt (State Guard).
 * Nếu sự kiện không hợp lệ đối với trạng thái hiện tại, giữ nguyên trạng thái
 * và ghi nhận cảnh báo để tránh sập luồng game.
 */
export function runnerTransition(
  currentState: GameState,
  event: GameEvent
): { nextState: GameState; valid: boolean } {
  const allowed = VALID_TRANSITIONS[currentState];
  const nextState = allowed?.[event];

  if (!nextState) {
    return { nextState: currentState, valid: false };
  }

  return { nextState, valid: true };
}

/**
 * Kiểm tra xem trạng thái có đang cho phép game loop chuyển động hay không.
 */
export function isLoopActive(state: GameState): boolean {
  return state === "RUNNING" || state === "RESOLVE";
}

/**
 * Kiểm tra xem có đang tạm dừng nhập liệu hay không.
 */
export function isQuestionPromptActive(state: GameState): boolean {
  return (
    state === "ENCOUNTER" ||
    state === "EVENT_TSUNAMI" ||
    state === "EVENT_TRAFFIC" ||
    state === "EVENT_SHAKE"
  );
}
