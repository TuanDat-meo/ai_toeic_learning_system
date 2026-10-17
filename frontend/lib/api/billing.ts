import { apiRequest, writeAuthRequest } from "./client";

export type SubscriptionBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
export type SubscriptionPlanStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
export type LearningPlanCategory = "FREE" | "PRO" | "PREMIUM" | "PROMOTION";
export type AiAccessMode = "DISABLED" | "LIMITED" | "UNLIMITED";

export type FeatureConfigField = {
  key: string;
  label: string;
  type: "STRING" | "INTEGER" | "NUMBER" | "BOOLEAN" | "SELECT";
  required: boolean;
  options: string[];
};

export type LearningFeature = {
  key: string;
  parentFeatureKey: string | null;
  name: string;
  category: string;
  description: string;
  lifecycleStatus: "AVAILABLE" | "IN_DEVELOPMENT" | "PLANNED" | "DISABLED";
  controlType: "TOGGLE" | "METERED";
  allowedUnits: string[];
  allowedPeriods: Array<NonNullable<PlanEntitlement["period"]>>;
  configFields: FeatureConfigField[];
};

export type PlanEntitlement = {
  enabled: boolean;
  limit: number | null;
  unit: string | null;
  period: "DAY" | "WEEK" | "MONTH" | "PLAN_TERM" | null;
  config: Record<string, string | number | boolean>;
};

export type FeatureQuotaUsage = {
  featureKey: string;
  name: string;
  used: number;
  limit: number | null;
  period: "DAY" | "WEEK" | "MONTH" | "PLAN_TERM";
  periodEndsAt: string;
};

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
  entitlements: Record<string, PlanEntitlement>;
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
  planId: string;
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

export type StudentCheckoutResponse = {
  transactionId: string;
  orderCode: string;
  planName: string;
  amount: number;
  status: TransactionStatus;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  paymentContent: string;
  qrImageUrl: string;
  qrExpiresAt: string;
};

export type PlanInput = Omit<SubscriptionPlan, "id" | "purchaseCount" | "createdAt" | "updatedAt">;

export function getSubscriptionPlans() {
  return apiRequest<SubscriptionPlan[]>("/api/admin/billing/plans");
}

export function getLearningFeatures() {
  return apiRequest<LearningFeature[]>("/api/admin/billing/features");
}

export async function consumeLearningFeature(featureKey: string, operationId = crypto.randomUUID()) {
  const result = await writeAuthRequest<{ used: number }>("POST", "/api/billing/entitlements/use", { featureKey, operationId });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("learning-quota-updated"));
  return result;
}

export function getStudentFeatureUsage() {
  return apiRequest<FeatureQuotaUsage[]>("/api/billing/entitlements/usage");
}

export function getAvailableLearningPlans() {
  return apiRequest<SubscriptionPlan[]>("/api/learning-plans");
}

export function getAvailableLearningFeatures() {
  return apiRequest<LearningFeature[]>("/api/learning-features");
}

export function describePlanEntitlements(plan: SubscriptionPlan, catalog: LearningFeature[]) {
  const periodLabels: Record<NonNullable<PlanEntitlement["period"]>, string> = {
    DAY: "ngày",
    WEEK: "tuần",
    MONTH: "tháng",
    PLAN_TERM: "thời hạn gói",
  };
  return Object.entries(plan.entitlements ?? {}).flatMap(([key, entitlement]) => {
    const feature = catalog.find((item) => item.key === key && item.lifecycleStatus === "AVAILABLE");
    if (!entitlement.enabled || !feature) return [];
    if (feature.controlType === "TOGGLE") return [feature.name];
    const quota = entitlement.limit == null
      ? "không giới hạn"
      : `${entitlement.limit} ${entitlement.unit ?? feature.allowedUnits[0] ?? "lượt"} / ${entitlement.period ? periodLabels[entitlement.period] : "chu kỳ"}`;
    return [`${feature.name}: ${quota}`];
  });
}

export function getStudentBillingOverview() {
  return apiRequest<StudentBillingOverview>("/api/billing/me");
}

export function createStudentPaymentOrder(planId: string) {
  return writeAuthRequest<StudentCheckoutResponse>("POST", "/api/billing/orders", { planId });
}

export function refreshStudentPaymentQr(transactionId: string) {
  return writeAuthRequest<StudentCheckoutResponse>("POST", `/api/billing/orders/${transactionId}/qr`);
}

export function createSubscriptionPlan(plan: PlanInput) {
  return writeAuthRequest<SubscriptionPlan>("POST", "/api/admin/billing/plans", plan);
}

export function updateSubscriptionPlan(id: string, plan: PlanInput) {
  return writeAuthRequest<SubscriptionPlan>("PATCH", `/api/admin/billing/plans/${id}`, plan);
}

export function createSubscriptionPlanReplacingActive(plan: PlanInput) {
  return writeAuthRequest<SubscriptionPlan>("POST", "/api/admin/billing/plans/replace-active", plan);
}

export function updateSubscriptionPlanReplacingActive(id: string, plan: PlanInput) {
  return writeAuthRequest<SubscriptionPlan>("PATCH", `/api/admin/billing/plans/${id}/replace-active`, plan);
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
