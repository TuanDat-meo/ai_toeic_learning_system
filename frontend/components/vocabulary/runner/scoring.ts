import { RUNNER_CONFIG } from "./config.ts";

// ─── LEVENSHTEIN DISTANCE ────────────────────────────────────────────────────
// Tính khoảng cách sửa đổi Levenshtein giữa 2 chuỗi để xác định dung sai chính tả.
// Tối ưu thuật toán O(min(m, n)) không cấp phát mảng 2 chiều lớn.

export function levenshteinDistance(s1: string, s2: string): number {
  const a = s1.trim().toLowerCase();
  const b = s2.trim().toLowerCase();

  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prevRow = new Array(b.length + 1);
  let currRow = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i;
    const charA = a[i - 1];

    for (let j = 1; j <= b.length; j++) {
      const charB = b[j - 1];
      const cost = charA === charB ? 0 : 1;

      currRow[j] = Math.min(
        currRow[j - 1] + 1,       // Chèn
        prevRow[j] + 1,           // Xóa
        prevRow[j - 1] + cost     // Thay thế
      );
    }

    // Hoán đổi hàng
    for (let j = 0; j <= b.length; j++) {
      prevRow[j] = currRow[j];
    }
  }

  return currRow[b.length];
}

// ─── WORD VARIANTS CHECKER ───────────────────────────────────────────────────
// Kiểm tra biến thể từ phổ biến trong tiếng Anh (số nhiều, chia thì -ed, -ing, -s, -es)
export function isWordVariant(input: string, baseWord: string): boolean {
  const i = input.trim().toLowerCase();
  const b = baseWord.trim().toLowerCase();

  if (i === b) return true;

  // Số nhiều & Ngôi thứ 3 số ít: -s, -es, -ies
  if (b + "s" === i) return true;
  if (b + "es" === i) return true;
  if (b.endsWith("y") && b.slice(0, -1) + "ies" === i) return true;

  // Quá khứ & Phân từ: -d, -ed, -ied
  if (b + "d" === i) return true;
  if (b + "ed" === i) return true;
  if (b.endsWith("e") && b + "d" === i) return true;
  if (b.endsWith("y") && b.slice(0, -1) + "ied" === i) return true;
  // Nhân đôi phụ âm cuối + ed (e.g. stop -> stopped)
  if (b.length >= 3 && b + b[b.length - 1] + "ed" === i) return true;

  // Tiếp diễn: -ing
  if (b + "ing" === i) return true;
  if (b.endsWith("e") && b.slice(0, -1) + "ing" === i) return true;
  // Nhân đôi phụ âm cuối + ing (e.g. run -> running)
  if (b.length >= 3 && b + b[b.length - 1] + "ing" === i) return true;

  return false;
}

// ─── ANSWER EVALUATOR ────────────────────────────────────────────────────────

export interface AnswerEvaluationInput {
  userInput: string;
  correctWord: string;
  usedHint: boolean;
  currentCombo: number;
}

export interface AnswerEvaluationResult {
  isAccepted: boolean;         // Được tính là đúng (vượt qua thử thách)
  isExact: boolean;            // Đúng chính xác 100%
  isTypo: boolean;             // Đúng nhưng sai 1 ký tự (Levenshtein = 1)
  isVariant: boolean;          // Đúng dạng biến thể từ
  pointsAwarded: number;       // Số điểm nhận được
  newCombo: number;            // Combo mới (có tính trần và trừ khi dùng hint)
  message: string;             // Thông điệp phản hồi
}

export function evaluateAnswer({
  userInput,
  correctWord,
  usedHint,
  currentCombo,
}: AnswerEvaluationInput): AnswerEvaluationResult {
  const trimmedInput = userInput.trim().toLowerCase();
  const trimmedCorrect = correctWord.trim().toLowerCase();

  // 1. Trường hợp đúng tuyệt đối
  if (trimmedInput === trimmedCorrect) {
    const nextCombo = usedHint ? currentCombo : Math.min(RUNNER_CONFIG.COMBO_CAP, currentCombo + 1);
    const comboBonus = Math.min(nextCombo * RUNNER_CONFIG.COMBO_BONUS_MULTIPLIER, 20);
    const penalty = usedHint ? RUNNER_CONFIG.HINT_PENALTY_SCORE : 0;
    const points = Math.max(1, RUNNER_CONFIG.BASE_SCORE_PER_QUESTION + comboBonus - penalty);

    return {
      isAccepted: true,
      isExact: true,
      isTypo: false,
      isVariant: false,
      pointsAwarded: points,
      newCombo: nextCombo,
      message: usedHint ? `Đúng (Dùng gợi ý: -${penalty}đ, giữ combo)` : `Chính xác! +${points} điểm`,
    };
  }

  // 2. Trường hợp biến thể từ hợp lệ (chia thì / số nhiều)
  if (isWordVariant(trimmedInput, trimmedCorrect)) {
    const nextCombo = usedHint ? currentCombo : Math.min(RUNNER_CONFIG.COMBO_CAP, currentCombo + 1);
    const comboBonus = Math.min(nextCombo * RUNNER_CONFIG.COMBO_BONUS_MULTIPLIER, 20);
    const penalty = usedHint ? RUNNER_CONFIG.HINT_PENALTY_SCORE : 0;
    const points = Math.max(1, RUNNER_CONFIG.BASE_SCORE_PER_QUESTION + comboBonus - penalty);

    return {
      isAccepted: true,
      isExact: false,
      isTypo: false,
      isVariant: true,
      pointsAwarded: points,
      newCombo: nextCombo,
      message: `Chấp nhận biến thể từ (${trimmedInput})! +${points} điểm`,
    };
  }

  // 3. Trường hợp dung sai chính tả (Levenshtein distance = 1 cho từ >= 4 ký tự)
  if (trimmedCorrect.length >= 4 && levenshteinDistance(trimmedInput, trimmedCorrect) === 1) {
    // Sai 1 ký tự: tính đúng nhưng trừ điểm nhẹ, không mất tim, không tăng combo
    const penalty = RUNNER_CONFIG.TYPO_TOLERANCE_PENALTY_SCORE;
    const points = Math.max(1, RUNNER_CONFIG.BASE_SCORE_PER_QUESTION - penalty);

    return {
      isAccepted: true,
      isExact: false,
      isTypo: true,
      isVariant: false,
      pointsAwarded: points,
      newCombo: currentCombo, // Giữ nguyên combo, không reset và không tăng
      message: `Gần đúng! Nhầm 1 ký tự (${trimmedCorrect}): +${points}đ, không mất tim`,
    };
  }

  // 4. Trường hợp sai hoàn toàn
  return {
    isAccepted: false,
    isExact: false,
    isTypo: false,
    isVariant: false,
    pointsAwarded: 0,
    newCombo: 0, // Reset combo
    message: `Chưa chính xác! Đáp án đúng: ${correctWord}`,
  };
}
