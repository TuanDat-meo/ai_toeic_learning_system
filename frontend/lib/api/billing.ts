import { apiRequest, writeAuthRequest } from "./client";

export type SubscriptionBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
export type SubscriptionPlanStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
export type LearningPlanCategory = "FREE" | "PRO" | "PREMIUM" | "PROMOTION";
export type AiAccessMode = "DISABLED" | "LIMITED" | "UNLIMITED";

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
  capabilityKeys: string[];
  planCategory: LearningPlanCategory;
  aiAccessMode: AiAccessMode;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  maxAiQueriesPerDay: number;
  status: SubscriptionPlanStatus;
  purchaseCount: number;
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
  endDate: string | null;
  autoRenew: boolean;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  paymentMethod: string | null;
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
  paidAt?: string | null;
  note?: string | null;
  createdAt: string;
};

export type TransactionInput = {
  transactionCode: string;
  orderCode: string;
  userId: string;
  planId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paidAt?: string | null;
  note?: string | null;
};

export type StudentSubscription = {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  status: "ACTIVE";
  paymentMethod: string | null;
};

export type StudentPaymentTransaction = {
  id: string;
  transactionCode: string;
  orderCode: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paidAt: string | null;
  createdAt: string;
};

export type StudentBillingOverview = {
  currentSubscription: StudentSubscription | null;
  transactions: StudentPaymentTransaction[];
};

export type PlanInput = Omit<SubscriptionPlan, "id" | "purchaseCount" | "createdAt" | "updatedAt">;

export function getSubscriptionPlans() {
  return apiRequest<SubscriptionPlan[]>("/api/admin/billing/plans");
}

export function getAvailableLearningPlans() {
  return apiRequest<SubscriptionPlan[]>("/api/learning-plans");
}

export function getStudentBillingOverview() {
  return apiRequest<StudentBillingOverview>("/api/billing/me");
}

export function createSubscriptionPlan(plan: PlanInput) {
  return writeAuthRequest<SubscriptionPlan>("POST", "/api/admin/billing/plans", plan);
}

export function updateSubscriptionPlan(id: string, plan: PlanInput) {
  return writeAuthRequest<SubscriptionPlan>("PATCH", `/api/admin/billing/plans/${id}`, plan);
}

export function deleteSubscriptionPlan(id: string) {
  return writeAuthRequest<void>("DELETE", `/api/admin/billing/plans/${id}`);
}

export function getUserSubscriptions() {
  return apiRequest<UserSubscription[]>("/api/admin/billing/subscriptions");
}

export function cancelUserSubscription(id: string) {
  return writeAuthRequest<void>("PATCH", `/api/admin/billing/subscriptions/${id}/cancel`);
}

export function extendUserSubscription(id: string) {
  return writeAuthRequest<void>("POST", `/api/admin/billing/subscriptions/${id}/extend`);
}

export function getTransactions() {
  return apiRequest<Transaction[]>("/api/admin/billing/transactions");
}

export function createTransaction(transaction: TransactionInput) {
  return writeAuthRequest<Transaction>("POST", "/api/admin/billing/transactions", transaction);
}

export function confirmTransaction(id: string) {
  return writeAuthRequest<Transaction>("PATCH", `/api/admin/billing/transactions/${id}/confirm`);
}

export function refundTransaction(id: string) {
  return writeAuthRequest<Transaction>("PATCH", `/api/admin/billing/transactions/${id}/refund`);
}
