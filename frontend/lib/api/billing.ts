export type SubscriptionBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
export type SubscriptionPlanStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  originalPrice: number;
  promotionalPrice: number;
  billingCycle: SubscriptionBillingCycle;
  durationDays: number;
  badgeTag?: string;
  isPopular?: boolean;
  features: string[];
  maxAiQueriesPerDay: number;
  status: SubscriptionPlanStatus;
  activeSubscriberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UserSubscription = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  paymentMethod: string;
};

export type PaymentMethod = "MOMO" | "VNPAY" | "BANK_TRANSFER" | "CREDIT_CARD";
export type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";

export type Transaction = {
  id: string;
  transactionCode: string;
  orderCode: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paidAt?: string;
  note?: string;
  createdAt: string;
};

const PLANS_KEY = "toeic_admin_subscription_plans";
const SUBSCRIBERS_KEY = "toeic_admin_user_subscriptions";
const TRANSACTIONS_KEY = "toeic_admin_transactions";

const initialPlans: SubscriptionPlan[] = [
  {
    id: "plan-free",
    code: "FREE_STANDARD",
    name: "Gói Miễn Phí (Standard)",
    originalPrice: 0,
    promotionalPrice: 0,
    billingCycle: "MONTHLY",
    durationDays: 30,
    features: [
      "Luyện tập Từ vựng & Reading cơ bản",
      "Tối đa 5 lượt giải thích Gemini AI / ngày",
      "Theo dõi lịch sử học tập 7 ngày gần nhất",
      "Làm 1 bài Thi thử (Part 5) / tháng"
    ],
    maxAiQueriesPerDay: 5,
    status: "ACTIVE",
    activeSubscriberCount: 3840,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "plan-vip-3m",
    code: "VIP_3MONTHS",
    name: "Gói TOEIC VIP 3 Tháng",
    originalPrice: 590000,
    promotionalPrice: 399000,
    billingCycle: "QUARTERLY",
    durationDays: 90,
    badgeTag: "Bán chạy nhất",
    isPopular: true,
    features: [
      "Mở khóa toàn bộ kho đề ETS Part 1 - Part 7",
      "Gemini 1.5 Pro AI Chat & Phân tích lỗi sai 24/7",
      "Không giới hạn câu hỏi thích ứng BKT",
      "Báo cáo phân tích điểm yếu & Lộ trình 650+",
      "Tải tài liệu PDF & Transcript Listening"
    ],
    maxAiQueriesPerDay: 9999,
    status: "ACTIVE",
    activeSubscriberCount: 680,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "plan-vip-12m",
    code: "VIP_1YEAR",
    name: "Gói TOEIC Master VIP 1 Năm",
    originalPrice: 1890000,
    promotionalPrice: 999000,
    billingCycle: "YEARLY",
    durationDays: 365,
    badgeTag: "Tiết kiệm 47%",
    features: [
      "Toàn bộ quyền lợi gói VIP Pro 12 Tháng",
      "Cam kết tăng 150+ điểm TOEIC sau 3 tháng",
      "Gợi ý bài tập AI tối ưu theo lịch thi cá nhân",
      "Hỗ trợ giải đáp 1-1 từ giảng viên chuyên môn",
      "Tặng kho tàng 50+ đề thi dự đoán Part 7"
    ],
    maxAiQueriesPerDay: 9999,
    status: "ACTIVE",
    activeSubscriberCount: 420,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "plan-combo-ai",
    code: "COMBO_AI_INTENSIVE",
    name: "Gói Combo AI SpeedUp (6 Tháng)",
    originalPrice: 1200000,
    promotionalPrice: 699000,
    billingCycle: "QUARTERLY",
    durationDays: 180,
    badgeTag: "Chuyên sâu AI",
    features: [
      "Thuật toán BKT & SAKT dự đoán điểm chính xác 98%",
      "Gemini AI tự tạo bài tập riêng theo từng dạng lỗi",
      "Không giới hạn nghe Audio chất lượng cao",
      "Hỗ trợ ưu tiên 24/7 từ ban quản trị"
    ],
    maxAiQueriesPerDay: 9999,
    status: "ACTIVE",
    activeSubscriberCount: 210,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-08-20T00:00:00Z",
  }
];

const initialUserSubscriptions: UserSubscription[] = [
  {
    id: "us-1",
    userId: "u-101",
    userName: "Nguyen Van An",
    userEmail: "an.nguyen@gmail.com",
    planId: "plan-vip-3m",
    planName: "Gói TOEIC VIP 3 Tháng",
    startDate: "2026-09-01T10:00:00Z",
    endDate: "2026-11-30T23:59:59Z",
    autoRenew: true,
    status: "ACTIVE",
    paymentMethod: "MOMO",
  },
  {
    id: "us-2",
    userId: "u-102",
    userName: "Tran Thi Mai",
    userEmail: "mai.tran@yahoo.com",
    planId: "plan-vip-12m",
    planName: "Gói TOEIC Master VIP 1 Năm",
    startDate: "2026-01-10T08:00:00Z",
    endDate: "2027-01-10T23:59:59Z",
    autoRenew: true,
    status: "ACTIVE",
    paymentMethod: "BANK_TRANSFER",
  },
  {
    id: "us-3",
    userId: "u-103",
    userName: "Pham Quoc Bao",
    userEmail: "baopq@toeic.edu.vn",
    planId: "plan-combo-ai",
    planName: "Gói Combo AI SpeedUp (6 Tháng)",
    startDate: "2026-10-04T11:45:00Z",
    endDate: "2027-04-04T23:59:59Z",
    autoRenew: false,
    status: "ACTIVE",
    paymentMethod: "VNPAY",
  }
];

const initialTransactions: Transaction[] = [
  {
    id: "tx-7001",
    transactionCode: "TX-990812",
    orderCode: "HD-8821",
    userName: "Pham Quoc Bao",
    userEmail: "baopq@toeic.edu.vn",
    planName: "Gói Combo AI SpeedUp (6 Tháng)",
    amount: 699000,
    paymentMethod: "VNPAY",
    status: "SUCCESS",
    paidAt: "2026-10-04T11:45:00Z",
    note: "Thanh toán thành công qua cổng VNPAY-QR",
    createdAt: "2026-10-04T11:40:00Z",
  },
  {
    id: "tx-7002",
    transactionCode: "TX-990813",
    orderCode: "HD-8822",
    userName: "Le Hoang Nam",
    userEmail: "nam.lh@outlook.com",
    planName: "Gói TOEIC VIP 3 Tháng",
    amount: 399000,
    paymentMethod: "MOMO",
    status: "SUCCESS",
    paidAt: "2026-10-04T14:10:00Z",
    note: "Thanh toán thành công qua MoMo e-Wallet",
    createdAt: "2026-10-04T14:05:00Z",
  },
  {
    id: "tx-7003",
    transactionCode: "TX-990814",
    orderCode: "HD-8823",
    userName: "Dang Minh Quan",
    userEmail: "quan.dm@gmail.com",
    planName: "Gói TOEIC Master VIP 1 Năm",
    amount: 999000,
    paymentMethod: "BANK_TRANSFER",
    status: "PENDING",
    note: "Chờ đối soát ngân hàng Vietcombank",
    createdAt: "2026-10-05T08:30:00Z",
  },
  {
    id: "tx-7004",
    transactionCode: "TX-990815",
    orderCode: "HD-8824",
    userName: "Bui Thi Ha",
    userEmail: "ha.bt@gmail.com",
    planName: "Gói TOEIC VIP 3 Tháng",
    amount: 399000,
    paymentMethod: "CREDIT_CARD",
    status: "FAILED",
    note: "Thẻ ngân hàng từ chối giao dịch (Insufficient Funds)",
    createdAt: "2026-10-05T09:00:00Z",
  },
  {
    id: "tx-7005",
    transactionCode: "TX-990816",
    orderCode: "HD-8825",
    userName: "Vo Tuyet Nhi",
    userEmail: "nhi.vt@gmail.com",
    planName: "Gói Combo AI SpeedUp (6 Tháng)",
    amount: 699000,
    paymentMethod: "BANK_TRANSFER",
    status: "SUCCESS",
    paidAt: "2026-10-05T09:20:00Z",
    note: "Chuyển khoản VietQR thành công",
    createdAt: "2026-10-05T09:15:00Z",
  }
];

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  if (typeof window === "undefined") return initialPlans;
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    if (!raw) {
      localStorage.setItem(PLANS_KEY, JSON.stringify(initialPlans));
      return initialPlans;
    }
    return JSON.parse(raw);
  } catch {
    return initialPlans;
  }
}

export async function saveSubscriptionPlans(plans: SubscriptionPlan[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  }
}

export async function getUserSubscriptions(): Promise<UserSubscription[]> {
  if (typeof window === "undefined") return initialUserSubscriptions;
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_KEY);
    if (!raw) {
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(initialUserSubscriptions));
      return initialUserSubscriptions;
    }
    return JSON.parse(raw);
  } catch {
    return initialUserSubscriptions;
  }
}

export async function saveUserSubscriptions(subscriptions: UserSubscription[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscriptions));
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  if (typeof window === "undefined") return initialTransactions;
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialTransactions));
      return initialTransactions;
    }
    return JSON.parse(raw);
  } catch {
    return initialTransactions;
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
}
