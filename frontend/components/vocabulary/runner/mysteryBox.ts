import type { MysteryBoxEffect } from "./types";

export interface MysteryBoxOutcome {
  effect: MysteryBoxEffect;
  name: string;
  description: string;
  isPositive: boolean;
  scoreBonus?: number;
  heartsAdded?: number;
  chaserDistanceDelta?: number;
  grantShield?: boolean;
  hintCountAdded?: number;
  durationSec?: number;
}

// ─── BẢNG HỘP MÙ (WEIGHTED TABLE) ──────────────────────────────────────────
export const MYSTERY_BOX_TABLE: Array<{
  outcome: MysteryBoxOutcome;
  weight: number;
}> = [
  // ── TÍCH CỰC (~70% Tổng Trọng Số) ──
  {
    weight: 20,
    outcome: {
      effect: "BONUS_POINTS_SMALL",
      name: "Ngôi sao may mắn nhỏ",
      description: "+15 điểm thưởng ngay!",
      isPositive: true,
      scoreBonus: 15,
    },
  },
  {
    weight: 15,
    outcome: {
      effect: "BONUS_POINTS_MEDIUM",
      name: "Ngôi sao vàng rực rỡ",
      description: "+35 điểm thưởng lớn!",
      isPositive: true,
      scoreBonus: 35,
    },
  },
  {
    weight: 15,
    outcome: {
      effect: "HINT_BOOST",
      name: "Túi thần thông",
      description: "+1 lượt dùng gợi ý miễn phí!",
      isPositive: true,
      hintCountAdded: 1,
    },
  },
  {
    weight: 10,
    outcome: {
      effect: "SHIELD",
      name: "Khiên Năng Lượng",
      description: "Bảo vệ bạn khỏi 1 lần sai lầm kế tiếp!",
      isPositive: true,
      grantShield: true,
    },
  },
  {
    weight: 10,
    outcome: {
      effect: "SPEED_BOOST",
      name: "Giày Bay Siêu Tốc",
      description: "Bứt phá bỏ xa kẻ đuổi (+20% khoảng cách)!",
      isPositive: true,
      chaserDistanceDelta: 20,
    },
  },
  {
    weight: 5,
    outcome: {
      effect: "EXTRA_HEART",
      name: "Trái Tim Thần Kỳ",
      description: "Hồi sinh +1 mạng ❤️!",
      isPositive: true,
      heartsAdded: 1,
    },
  },

  // ── TIÊU CỰC (~30% Tổng Trọng Số) ──
  {
    weight: 10,
    outcome: {
      effect: "SLOW_DOWN",
      name: "Bùn lầy ngáng chân",
      description: "Kẻ đuổi rút ngắn khoảng cách (-15%)!",
      isPositive: false,
      chaserDistanceDelta: -15,
      scoreBonus: 10, // Kèm điểm bù đắp
    },
  },
  {
    weight: 8,
    outcome: {
      effect: "TSUNAMI_RUSH",
      name: "Cơn Sóng Thần 🌊",
      description: "Sóng dữ dâng cao! Câu hỏi nhanh trong 8-10 giây!",
      isPositive: false,
      durationSec: 9,
      scoreBonus: 30, // Thưởng điểm rất cao nếu vượt qua
    },
  },
  {
    weight: 7,
    outcome: {
      effect: "TRAFFIC_HAZARD",
      name: "Xe cộ lao tới 🚗",
      description: "Chuỗi câu hỏi nhanh liên tiếp!",
      isPositive: false,
      scoreBonus: 25,
    },
  },
  {
    weight: 5,
    outcome: {
      effect: "EARTHQUAKE_SHAKE",
      name: "Địa chấn rung chuyển 🌋",
      description: "Mặt đất rung giật! Giữ vững tinh thần!",
      isPositive: false,
      durationSec: 5,
      scoreBonus: 20,
    },
  },
];

/**
 * Rút thăm kết quả hộp mù dựa trên trọng số và quy tắc Pity Timer.
 * Quy tắc: Không quá 1 hiệu ứng tiêu cực trong mỗi 3 điểm chạm gần nhất.
 *
 * @param recentNegativeCount Số lần đã gặp hiệu ứng tiêu cực trong 2 điểm chạm gần nhất
 * @param randomValue Hàm cung cấp giá trị ngẫu nhiên từ 0 đến 1 (để hỗ trợ unit test xác định trước)
 */
export function rollMysteryBox(
  recentNegativeCount: number,
  randomValue: number = Math.random()
): MysteryBoxOutcome {
  // PITY TIMER: Nếu đã có >= 1 sự kiện tiêu cực trong 2 lượt chạm gần nhất -> Chỉ cho phép kết quả tích cực
  const eligibleItems = recentNegativeCount >= 1
    ? MYSTERY_BOX_TABLE.filter((item) => item.outcome.isPositive)
    : MYSTERY_BOX_TABLE;

  const totalWeight = eligibleItems.reduce((acc, curr) => acc + curr.weight, 0);
  let threshold = randomValue * totalWeight;

  for (const item of eligibleItems) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.outcome;
    }
  }

  return eligibleItems[0].outcome;
}
