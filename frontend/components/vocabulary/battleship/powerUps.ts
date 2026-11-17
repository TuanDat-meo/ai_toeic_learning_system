/**
 * BATTLESHIP VOCABULARY - POWER-UPS & INVENTORY MODULE
 * Quản lý danh mục 10 vật phẩm hỗ trợ & chiến đấu theo Mục 6 của đặc tả.
 */

import { type PowerUpId, type PowerUpItem } from "./config.ts";

export const POWER_UP_CATALOG: Record<PowerUpId, PowerUpItem> = {
  scanner: {
    id: "scanner",
    name: "Hint Scanner",
    nameVi: "Máy quét gợi ý",
    description: "Hiển thị từ loại & định nghĩa gợi ý mà không làm lộ đáp án.",
    category: "support",
    hotkey: "1",
    cooldownSeconds: 5,
    iconName: "ScanSearch",
  },
  elimination: {
    id: "elimination",
    name: "50/50 Elimination",
    nameVi: "Triệt tiêu đáp án",
    description: "Loại bỏ ngay 2 phương án sai trong chế độ trắc nghiệm.",
    category: "support",
    hotkey: "2",
    cooldownSeconds: 8,
    iconName: "Crosshair",
  },
  freeze: {
    id: "freeze",
    name: "Time Freeze",
    nameVi: "Ngưng đọng thời gian",
    description: "Đóng băng tốc độ di chuyển của toàn bộ phi thuyền địch trong 5 giây.",
    category: "support",
    hotkey: "3",
    durationSeconds: 5,
    cooldownSeconds: 15,
    iconName: "Timer",
  },
  repair: {
    id: "repair",
    name: "Emergency Repair",
    nameVi: "Sửa chữa khẩn cấp",
    description: "Hồi phục 1 mạng chiến đấu (không vượt quá 3 mạng tối đa).",
    category: "support",
    hotkey: "4",
    cooldownSeconds: 20,
    iconName: "Heart",
  },
  multishot: {
    id: "multishot",
    name: "Multi-Shot Plasma",
    nameVi: "Hỏa lực đa mục tiêu",
    description: "Khai hỏa chùm laser phân nhánh tiêu diệt tối đa 3 mục tiêu thường.",
    category: "combat",
    hotkey: "5",
    cooldownSeconds: 12,
    iconName: "Bolt",
  },
  shield: {
    id: "shield",
    name: "Energy Shield",
    nameVi: "Lá chắn năng lượng",
    description: "Kích hoạt lồng năng lượng hấp thụ hoàn toàn 1 lần sát thương.",
    category: "combat",
    hotkey: "6",
    durationSeconds: 15,
    cooldownSeconds: 20,
    iconName: "Shield",
  },
  "double-score": {
    id: "double-score",
    name: "Double Score",
    nameVi: "Nhân đôi điểm số",
    description: "Nhân 2 tất cả điểm số nhận được trong vòng 10 giây.",
    category: "combat",
    hotkey: "7",
    durationSeconds: 10,
    cooldownSeconds: 25,
    iconName: "Medal",
  },
  magnet: {
    id: "magnet",
    name: "Graviton Magnet",
    nameVi: "Nam châm hút đồ",
    description: "Tự động thu hút mọi vật phẩm và coin rơi trên chiến trường trong 10 giây.",
    category: "combat",
    hotkey: "8",
    durationSeconds: 10,
    cooldownSeconds: 20,
    iconName: "Zap",
  },
  "mystery-box": {
    id: "mystery-box",
    name: "Mystery Box",
    nameVi: "Hộp quà bí ẩn",
    description: "Nhận ngẫu nhiên 1 vật phẩm hỗ trợ hoặc 50 điểm thưởng.",
    category: "special",
    hotkey: "9",
    cooldownSeconds: 15,
    iconName: "PackageOpen",
  },
  phoenix: {
    id: "phoenix",
    name: "Phoenix Core",
    nameVi: "Lõi Phượng Hoàng",
    description: "Tự động hồi sinh với 1 mạng khi chiến hạm cạn kiệt HP (dùng 1 lần/trận).",
    category: "special",
    hotkey: "0",
    maxUses: 1,
    iconName: "Sparkles",
  },
};

export interface InventorySlot {
  id: PowerUpId;
  count: number;
  lastUsedAt?: number;
}

export function createInitialInventory(): InventorySlot[] {
  return [
    { id: "scanner", count: 2 },
    { id: "elimination", count: 2 },
    { id: "shield", count: 1 },
  ];
}

export function addToInventory(
  inventory: InventorySlot[],
  id: PowerUpId,
  quantity = 1,
  maxSlots = 3
): InventorySlot[] {
  const existing = inventory.find((slot) => slot.id === id);
  if (existing) {
    return inventory.map((slot) =>
      slot.id === id ? { ...slot, count: slot.count + quantity } : slot
    );
  }
  if (inventory.length < maxSlots) {
    return [...inventory, { id, count: quantity }];
  }
  // Nếu đã đầy 3 ô, thay vào ô có count thấp nhất
  return inventory;
}

export function consumeInventoryItem(
  inventory: InventorySlot[],
  id: PowerUpId
): { updated: InventorySlot[]; consumed: boolean } {
  const item = inventory.find((slot) => slot.id === id);
  if (!item || item.count <= 0) {
    return { updated: inventory, consumed: false };
  }
  const next = inventory
    .map((slot) => (slot.id === id ? { ...slot, count: slot.count - 1 } : slot))
    .filter((slot) => slot.count > 0);
  return { updated: next, consumed: true };
}

export function getRandomPowerUpDrop(isBoss = false): PowerUpId {
  const pool: PowerUpId[] = isBoss
    ? ["phoenix", "multishot", "double-score", "mystery-box", "repair"]
    : ["scanner", "elimination", "freeze", "shield", "mystery-box"];
  const randIdx = Math.floor(Math.random() * pool.length);
  return pool[randIdx];
}
