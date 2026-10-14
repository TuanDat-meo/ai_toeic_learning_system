"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CreditCard, RefreshCw } from "lucide-react";
import {
  getAvailableLearningPlans,
  getStudentBillingOverview,
  type StudentBillingOverview,
  type StudentPaymentTransaction,
  type SubscriptionPlan,
} from "@/lib/api/billing";
import { LEARNING_CAPABILITIES } from "@/lib/learning-capabilities";

const formatVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (value: string | null) => {
  if (!value) return "Không hết hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
};

const transactionStatus: Record<StudentPaymentTransaction["status"], { label: string; style: string }> = {
  SUCCESS: { label: "Thành công", style: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Đang xử lý", style: "bg-amber-50 text-amber-700" },
  FAILED: { label: "Thất bại", style: "bg-rose-50 text-rose-700" },
  REFUNDED: { label: "Đã hoàn tiền", style: "bg-violet-50 text-violet-700" },
};

const paymentMethod: Record<string, string> = {
  MOMO: "MoMo",
  VNPAY: "VNPAY",
  BANK_TRANSFER: "Chuyển khoản",
  CREDIT_CARD: "Thẻ thanh toán",
};

export function StudentBillingView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [overview, setOverview] = useState<StudentBillingOverview | null>(null);
  const [plansError, setPlansError] = useState("");
  const [billingError, setBillingError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setPlansError("");
    setBillingError("");
    const [plansResult, billingResult] = await Promise.allSettled([
      getAvailableLearningPlans(),
      getStudentBillingOverview(),
    ]);

    if (plansResult.status === "fulfilled") {
      setPlans(plansResult.value);
    } else {
      setPlansError(plansResult.reason instanceof Error ? plansResult.reason.message : "Không tải được danh sách gói học.");
    }
    if (billingResult.status === "fulfilled") {
      setOverview(billingResult.value);
    } else {
      setBillingError(billingResult.reason instanceof Error ? billingResult.reason.message : "Không tải được thông tin thanh toán.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const currentSubscription = overview?.currentSubscription ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-on-surface-variant">
            Cá nhân <span className="px-1.5">/</span> Gói học &amp; thanh toán
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-on-surface md:text-3xl">Gói học &amp; thanh toán</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Theo dõi quyền học hiện tại, các gói đang mở bán và lịch sử giao dịch.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-outline-variant/60 px-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Làm mới
        </button>
      </header>

      {billingError ? <LoadError message={billingError} onRetry={() => void loadData()} /> : null}
      {plansError ? <LoadError message={plansError} onRetry={() => void loadData()} /> : null}

      <section aria-labelledby="current-plan-title" className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="current-plan-title" className="font-semibold text-on-surface">Gói học hiện tại</h2>
            <p className="text-sm text-on-surface-variant">Quyền lợi đang được ghi nhận cho tài khoản của bạn.</p>
          </div>
        </div>
        {loading && !overview ? (
          <p role="status" className="mt-5 text-sm text-on-surface-variant">Đang tải thông tin gói học…</p>
        ) : currentSubscription ? (
          <div className="mt-5 grid gap-4 rounded-xl bg-surface-container-low p-4 sm:grid-cols-3 sm:p-5">
            <div>
              <p className="text-xs text-on-surface-variant">Tên gói</p>
              <p className="mt-1 font-semibold text-on-surface">{currentSubscription.planName}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Bắt đầu</p>
              <p className="mt-1 font-medium text-on-surface">{formatDate(currentSubscription.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Hết hạn</p>
              <p className="mt-1 font-medium text-on-surface">{formatDate(currentSubscription.endDate)}</p>
            </div>
            <p className="sm:col-span-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} aria-hidden="true" /> Đang hoạt động
              </span>
              {currentSubscription.autoRenew ? <span className="ml-2 text-xs text-on-surface-variant">Tự động gia hạn</span> : null}
            </p>
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
            {billingError ? "Chưa thể xác định gói học hiện tại." : "Tài khoản chưa có gói học đang hoạt động."}
          </p>
        )}
      </section>

      <section aria-labelledby="available-plans-title">
        <div className="mb-4">
          <h2 id="available-plans-title" className="text-xl font-semibold text-on-surface">Gói học đang phát hành</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Danh sách được tải trực tiếp từ hệ thống.</p>
        </div>
        {loading && plans.length === 0 ? (
          <p role="status" className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 text-sm text-on-surface-variant">Đang tải gói học…</p>
        ) : plans.length === 0 && !plansError ? (
          <p className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 text-sm text-on-surface-variant">Hiện chưa có gói học được phát hành.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <LearningPlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentSubscription?.planId === plan.id}
              />
            ))}
          </div>
        )}
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Thanh toán trực tuyến và tự đăng ký gói chưa được tích hợp. Giao dịch chỉ xuất hiện trong lịch sử sau khi được hệ thống ghi nhận; trang này không tạo thanh toán giả.
        </p>
      </section>

      <section aria-labelledby="payment-history-title" className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest">
        <div className="border-b border-outline-variant/40 px-5 py-4">
          <h2 id="payment-history-title" className="font-semibold text-on-surface">Lịch sử thanh toán</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Chỉ hiển thị giao dịch thuộc tài khoản đang đăng nhập.</p>
        </div>
        {loading && !overview ? (
          <p role="status" className="px-5 py-8 text-center text-sm text-on-surface-variant">Đang tải lịch sử…</p>
        ) : overview?.transactions.length ? (
          <PaymentHistory transactions={overview.transactions} />
        ) : (
          <p className="px-5 py-8 text-center text-sm text-on-surface-variant">
            {billingError ? "Chưa thể tải lịch sử thanh toán." : "Chưa có giao dịch nào được ghi nhận."}
          </p>
        )}
      </section>
    </div>
  );
}

function LearningPlanCard({ plan, isCurrent }: { plan: SubscriptionPlan; isCurrent: boolean }) {
  const categoryLabel = plan.planCategory === "PROMOTION"
    ? "Ưu đãi"
    : plan.planCategory === "PREMIUM"
      ? "Premium"
      : plan.planCategory === "FREE"
        ? "Free"
        : "Pro";

  return (
    <article className="flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold text-on-surface-variant">{categoryLabel}</span>
        {plan.isPopular ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{plan.badgeTag || "Phổ biến"}</span> : null}
        {isCurrent ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Gói hiện tại</span> : null}
      </div>
      <h3 className="mt-4 text-lg font-bold text-on-surface">{plan.name}</h3>
      <p className="mt-3 text-2xl font-bold text-primary">{plan.promotionalPrice === 0 ? "Miễn phí" : formatVnd(plan.promotionalPrice)}</p>
      {plan.originalPrice > plan.promotionalPrice ? (
        <p className="mt-1 text-sm text-on-surface-variant line-through">{formatVnd(plan.originalPrice)}</p>
      ) : null}
      <p className="mt-3 text-sm text-on-surface-variant">
        {plan.billingCycle === "LIFETIME" ? "Không hết hạn" : `${plan.durationDays} ngày kể từ khi kích hoạt`}
      </p>
      <ul className="mt-5 flex-1 space-y-2 text-sm text-on-surface-variant">
        {plan.capabilityKeys.map((key) => {
          const capability = LEARNING_CAPABILITIES.find((item) => item.key === key);
          return <li key={key} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{capability?.label ?? key}</li>;
        })}
        {plan.capabilityKeys.length === 0 ? <li>Quyền lợi sẽ được cập nhật theo thông tin gói.</li> : null}
      </ul>
      <p className="mt-5 border-t border-outline-variant/40 pt-4 text-xs text-on-surface-variant">
        {plan.aiAccessMode === "UNLIMITED" ? "Không giới hạn lượt AI" : plan.aiAccessMode === "LIMITED" ? `${plan.maxAiQueriesPerDay} lượt AI mỗi ngày` : "Không bao gồm lượt AI"}
      </p>
    </article>
  );
}

function PaymentHistory({ transactions }: { transactions: StudentPaymentTransaction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-surface-container-low text-xs text-on-surface-variant">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Giao dịch</th>
            <th scope="col" className="px-5 py-3 font-semibold">Gói học</th>
            <th scope="col" className="px-5 py-3 font-semibold">Số tiền</th>
            <th scope="col" className="px-5 py-3 font-semibold">Phương thức</th>
            <th scope="col" className="px-5 py-3 font-semibold">Trạng thái</th>
            <th scope="col" className="px-5 py-3 font-semibold">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const status = transactionStatus[transaction.status];
            return (
              <tr key={transaction.id} className="border-t border-outline-variant/30">
                <td className="px-5 py-4">
                  <span className="block font-mono text-xs font-semibold text-primary">{transaction.transactionCode}</span>
                  <span className="mt-1 block text-xs text-on-surface-variant">Đơn #{transaction.orderCode}</span>
                </td>
                <td className="px-5 py-4 font-medium text-on-surface">{transaction.planName}</td>
                <td className="px-5 py-4 font-semibold text-on-surface">{formatVnd(transaction.amount)}</td>
                <td className="px-5 py-4 text-on-surface-variant">{paymentMethod[transaction.paymentMethod] ?? transaction.paymentMethod}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.style}`}>{status.label}</span></td>
                <td className="px-5 py-4 text-on-surface-variant">{formatDate(transaction.paidAt ?? transaction.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      <button type="button" onClick={onRetry} className="font-semibold underline">Thử tải lại</button>
    </div>
  );
}
