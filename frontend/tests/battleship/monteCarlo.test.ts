import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyDamageToFleet,
  applyEnemyCharge,
  calculateDamage,
  generateFleet,
  getActiveTarget,
} from "../../components/vocabulary/battleship/engine.ts";
import { BATTLESHIP_CONFIG } from "../../components/vocabulary/battleship/config.ts";

interface SimulationResult {
  accuracy: number;
  totalMatches: number;
  wins: number;
  winRate: number;
  averageRemainingHp: number;
  averageQuestionsUsed: number;
  lossesByHpZero: number;
  lossesByExhaustion: number;
}

// PRNG LCG tuyến tính để tái lập chính xác 100% kết quả mô phỏng
function createPrng(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Mô phỏng 1 trận đấu 20 câu
 * @param accuracy Tỷ lệ am hiểu từ vựng (0.50 -> 0.90)
 * @param nearMissRatio Tỷ lệ lỗi gõ nhẹ 1 ký tự ở từ dài (0 sát thương per Section 2.3, thực tế ~6%)
 */
function simulateMatch(accuracy: number, prng: () => number, nearMissRatio = 0.06) {
  let playerHp: number = BATTLESHIP_CONFIG.PLAYER_START_HP; // 5 HP
  let fleet = generateFleet(); // 12 HP tổng cộng (3 wave: 3, 4, 5)
  let enemyCharge = 0;
  let streak = 0;
  let questionsUsed = 0;

  for (let q = 1; q <= BATTLESHIP_CONFIG.MAX_QUESTIONS_PER_MATCH; q++) {
    questionsUsed = q;
    const roll = prng();

    // Phân loại kết quả câu trả lời
    const pCorrectExact = accuracy * (1 - nearMissRatio);
    const pNearMiss = accuracy;

    if (roll < pCorrectExact) {
      // Đúng hoàn toàn
      streak++;
      const { damage } = calculateDamage("correct", streak);
      const fleetResult = applyDamageToFleet(fleet, damage);
      fleet = fleetResult.updatedFleet;

      if (fleetResult.isFleetDefeated) {
        return {
          won: true,
          remainingHp: playerHp,
          questionsUsed,
          reason: "FLEET_DESTROYED",
        };
      }
    } else if (roll < pNearMiss) {
      // Gần đúng (sai 1 ký tự): 0 sát thương, giữ combo, không tăng nạp địch
      const { damage } = calculateDamage("near", streak);
      assert.equal(damage, 0);
      // streak giữ nguyên, enemyCharge giữ nguyên
    } else {
      // Sai hoặc Quá giờ (timeout): đứt combo, nạp đạn cho địch
      streak = 0;
      const chargeResult = applyEnemyCharge(enemyCharge, "wrong");
      enemyCharge = chargeResult.nextCharge;

      if (chargeResult.triggersCounter) {
        playerHp = Math.max(0, playerHp - chargeResult.damage);
        if (playerHp === 0) {
          return {
            won: false,
            remainingHp: 0,
            questionsUsed,
            reason: "HP_ZERO",
          };
        }
      }
    }
  }

  // Hết 20 câu: Kiểm tra toàn bộ hạm đội địch đã bị tiêu diệt chưa
  const { isFleetDefeated } = getActiveTarget(fleet);
  return {
    won: isFleetDefeated,
    remainingHp: playerHp,
    questionsUsed,
    reason: isFleetDefeated ? "FLEET_DESTROYED" : "OUT_OF_AMMO",
  };
}

function runMonteCarlo(
  accuracy: number,
  matchCount = 10000,
  seed = 20261116,
  nearMissRatio = 0.06,
): SimulationResult {
  const prng = createPrng(seed);
  let wins = 0;
  let totalRemainingHp = 0;
  let totalQuestionsUsed = 0;
  let lossesByHpZero = 0;
  let lossesByExhaustion = 0;

  for (let i = 0; i < matchCount; i++) {
    const res = simulateMatch(accuracy, prng, nearMissRatio);
    if (res.won) {
      wins++;
    } else if (res.reason === "HP_ZERO") {
      lossesByHpZero++;
    } else {
      lossesByExhaustion++;
    }
    totalRemainingHp += res.remainingHp;
    totalQuestionsUsed += res.questionsUsed;
  }

  return {
    accuracy,
    totalMatches: matchCount,
    wins,
    winRate: Number(((wins / matchCount) * 100).toFixed(2)),
    averageRemainingHp: Number((totalRemainingHp / matchCount).toFixed(2)),
    averageQuestionsUsed: Number((totalQuestionsUsed / matchCount).toFixed(2)),
    lossesByHpZero,
    lossesByExhaustion,
  };
}

test("Monte Carlo: 10,000 matches simulation validates game balance monotonicity and targets", () => {
  const accuracies = [0.50, 0.60, 0.65, 0.70, 0.80, 0.85, 0.90];
  const results = accuracies.map((acc) => runMonteCarlo(acc, 10000));

  // In bảng kết quả để phục vụ báo cáo Giai đoạn 2
  console.log("\n=================== BẢNG MÔ PHỎNG MONTE CARLO (10.000 TRẬN) ===================");
  console.log("Độ chính xác | Tỷ lệ Thắng (%) | HP còn lại TB | Số câu TB | Thua do HP=0 | Thua do Hết câu");
  console.log("----------------------------------------------------------------------------------");
  for (const r of results) {
    console.log(
      `${(r.accuracy * 100).toFixed(0).padStart(11)}% | ` +
      `${r.winRate.toFixed(2).padStart(14)}% | ` +
      `${r.averageRemainingHp.toFixed(2).padStart(13)} | ` +
      `${r.averageQuestionsUsed.toFixed(2).padStart(9)} | ` +
      `${r.lossesByHpZero.toString().padStart(12)} | ` +
      `${r.lossesByExhaustion.toString().padStart(15)}`,
    );
  }
  console.log("==================================================================================\n");

  // Kiểm chứng 1: Tỷ lệ thắng tăng ĐƠN ĐIỆU theo độ chính xác
  for (let i = 1; i < results.length; i++) {
    assert.ok(
      results[i].winRate > results[i - 1].winRate,
      `Tỷ lệ thắng phải tăng đơn điệu: ${results[i].winRate}% > ${results[i - 1].winRate}%`,
    );
  }

  // Kiểm chứng 2: Người chơi 60% độ chính xác đạt xấp xỉ ~50% tỷ lệ thắng (yêu cầu mục 2.8: 60-65% xấp xỉ 50%)
  const res60 = results.find((r) => r.accuracy === 0.60)!;
  assert.ok(
    res60.winRate >= 45 && res60.winRate <= 58,
    `Tỷ lệ thắng ở 60% phải xấp xỉ 50%, thực tế: ${res60.winRate}%`,
  );

  // Kiểm chứng 3: Người chơi 50% độ chính xác (đoán mò) có tỷ lệ thắng thấp (< 30%)
  const res50 = results.find((r) => r.accuracy === 0.50)!;
  assert.ok(
    res50.winRate < 30,
    `Người chơi 50% đoán mò phải có win rate thấp (< 30%), thực tế: ${res50.winRate}%`,
  );

  // Kiểm chứng 4: Người chơi >= 85% độ chính xác thắng hầu hết các trận (>= 98%)
  const res85 = results.find((r) => r.accuracy === 0.85)!;
  const res90 = results.find((r) => r.accuracy === 0.90)!;
  assert.ok(
    res85.winRate >= 98,
    `Người chơi 85% phải có win rate >= 98%, thực tế: ${res85.winRate}%`,
  );
  assert.ok(
    res90.winRate >= 99,
    `Người chơi 90% phải có win rate >= 99%, thực tế: ${res90.winRate}%`,
  );
});
