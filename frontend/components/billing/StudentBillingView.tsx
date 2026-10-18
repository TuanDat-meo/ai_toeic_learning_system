"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Flame,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import {
  createStudentPaymentOrder,
  describePlanEntitlements,
  getAvailableLearningFeatures,
  getAvailableLearningPlans,
  getStudentBillingOverview,
  refreshStudentPaymentQr,
  type LearningFeature,
  type StudentBillingOverview,
  type StudentCheckoutResponse,
  type StudentPaymentTransaction,
  type SubscriptionPlan,
} from "@/lib/api/billing";

type BillingTab = "PLANS" | "PAYMENT" | "HISTORY";

const planColors: Record<SubscriptionPlan["planCategory"], {
  card: string;
  badge: string;
  price: string;
  benefit: string;
  button: string;
  checkout: string;
}> = {
  FREE: {
    card: "border-outline-variant/50 bg-surface-container-lowest",
    badge: "bg-surface-container text-on-surface-variant",
    price: "text-on-surface",
    benefit: "text-emerald-600",
    button: "border-outline-variant text-on-surface-variant hover:bg-surface-container",
    checkout: "bg-surface-container-low",
  },
  PRO: {
    card: "border-blue-300 bg-gradient-to-br from-blue-100 via-white to-sky-50 shadow-blue-200/60",
    badge: "bg-blue-100 text-blue-800",
    price: "text-blue-700",
    benefit: "text-blue-600",
    button: "border-blue-500 bg-blue-600 text-white shadow-sm hover:bg-blue-700",
    checkout: "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50",
  },
  PREMIUM: {
    card: "border-violet-400 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-white shadow-violet-200/70",
    badge: "bg-violet-200 text-violet-900",
    price: "text-violet-800",
    benefit: "text-violet-700",
    button: "border-violet-500 bg-violet-700 text-white shadow-sm hover:bg-violet-800",
    checkout: "border-violet-300 bg-gradient-to-br from-violet-100 to-fuchsia-50",
  },
  PROMOTION: {
    card: "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-amber-100/70",
    badge: "bg-amber-200 text-amber-900",
    price: "text-orange-800",
    benefit: "text-amber-700",
    button: "border-amber-400 bg-amber-600 text-white hover:bg-amber-700",
    checkout: "bg-gradient-to-br from-amber-50 to-orange-50",
  },
};

const formatVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDate = (value: string | null) => {
  if (!value) return "Không hết hạn";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
};

const transactionStatus: Record<StudentPaymentTransaction["status"], { label: string; style: string }> = {
  SUCCESS: { label: "Thành công", style: "bg-emerald-50 text-emerald-700" },
  PENDING: { label: "Đang chờ thanh toán", style: "bg-amber-50 text-amber-700" },
  FAILED: { label: "Thanh toán thất bại", style: "bg-rose-50 text-rose-700" },
  REFUNDED: { label: "Đã hoàn tiền", style: "bg-violet-50 text-violet-700" },
  EXPIRED: { label: "Đăng ký thất bại — hóa đơn quá hạn", style: "bg-slate-100 text-slate-700" },
  REVIEW_REQUIRED: { label: "Đang kiểm tra giao dịch", style: "bg-orange-50 text-orange-800" },
};

const paymentMethod: Record<string, string> = {
  MOMO: "MoMo",
  VNPAY: "VNPAY",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CREDIT_CARD: "Thẻ thanh toán",
};

function getRemainingSeconds(expiresAt: string) {
  const expiresAtMs = new Date(expiresAt).getTime();
  return Number.isFinite(expiresAtMs) ? Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)) : 0;
}

export function StudentBillingView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<LearningFeature[]>([]);
  const [overview, setOverview] = useState<StudentBillingOverview | null>(null);
  const [plansError, setPlansError] = useState("");
  const [featuresError, setFeaturesError] = useState("");
  const [billingError, setBillingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BillingTab>("PLANS");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkout, setCheckout] = useState<StudentCheckoutResponse | null>(null);
  const [resumingTransactionId, setResumingTransactionId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [refreshingQr, setRefreshingQr] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const qrRefreshInProgress = useRef(false);
  const notifiedPaymentTransactionIds = useRef(new Set<string>());

  const notifyPaymentSuccess = useCallback((transaction: Pick<StudentPaymentTransaction, "id" | "amount" | "planName">) => {
    if (notifiedPaymentTransactionIds.current.has(transaction.id)) return;
    notifiedPaymentTransactionIds.current.add(transaction.id);
    setPaymentSuccessNotice(
      `Thanh toán ${formatVnd(transaction.amount)} cho gói ${transaction.planName} thành công.`,
    );
    window.setTimeout(() => setPaymentSuccessNotice(null), 10000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setPlansError("");
    setFeaturesError("");
    setBillingError("");
    const [plansResult, billingResult, featuresResult] = await Promise.allSettled([
      getAvailableLearningPlans(),
      getStudentBillingOverview(),
      getAvailableLearningFeatures(),
    ]);

    if (plansResult.status === "fulfilled") setPlans(plansResult.value);
    else setPlansError(plansResult.reason instanceof Error ? plansResult.reason.message : "Không tải được danh sách gói học.");
    if (billingResult.status === "fulfilled") {
      setOverview(billingResult.value);
      const now = Date.now();
      const recentSuccessfulPayment = billingResult.value.transactions.find((transaction) => {
        if (transaction.status !== "SUCCESS" || transaction.paymentMethod !== "BANK_TRANSFER" || !transaction.paidAt) {
          return false;
        }
        const paidAt = new Date(transaction.paidAt).getTime();
        return Number.isFinite(paidAt) && paidAt <= now && now - paidAt <= 10 * 60 * 1000;
      });
      if (recentSuccessfulPayment) notifyPaymentSuccess(recentSuccessfulPayment);
    } else {
      setBillingError(billingResult.reason instanceof Error ? billingResult.reason.message : "Không tải được thông tin thanh toán.");
    }
    if (featuresResult.status === "fulfilled") setFeatureCatalog(featuresResult.value);
    else setFeaturesError(featuresResult.reason instanceof Error ? featuresResult.reason.message : "Không tải được danh mục quyền lợi.");
    setLoading(false);
  }, [notifyPaymentSuccess]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const currentSubscription = overview?.currentSubscription ?? null;
  const promotionalPlan = plans.find((plan) => plan.planCategory === "PROMOTION");
  const standardPlans = plans.filter((plan) => plan.planCategory !== "PROMOTION");

  const selectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckout(null);
    setCheckoutError("");
    setActiveTab("PAYMENT");
  };

  const startPayment = async () => {
    if (!selectedPlan || creatingOrder) return;
    setCreatingOrder(true);
    setCheckoutError("");
    try {
      const result = await createStudentPaymentOrder(selectedPlan.id);
      setCheckout(result);
      setResumingTransactionId(null);
      setRemainingSeconds(getRemainingSeconds(result.expiresAt));
      setIsCheckoutModalOpen(true);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Không thể tạo đơn thanh toán. Vui lòng thử lại.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const refreshQr = useCallback(async (transactionId: string) => {
    if (qrRefreshInProgress.current) return;
    qrRefreshInProgress.current = true;
    setRefreshingQr(true);
    setCheckoutError("");
    try {
      const result = await refreshStudentPaymentQr(transactionId);
      setCheckout(result);
      setResumingTransactionId(null);
      setRemainingSeconds(getRemainingSeconds(result.expiresAt));
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Không thể tạo lại mã QR. Vui lòng thử lại.");
    } finally {
      qrRefreshInProgress.current = false;
      setRefreshingQr(false);
    }
  }, []);

  const resumePayment = (transaction: StudentPaymentTransaction) => {
    setSelectedPlan(plans.find((plan) => plan.id === transaction.planId) ?? null);
    setCheckout(null);
    setResumingTransactionId(transaction.id);
    setCheckoutError("");
    setIsCheckoutModalOpen(true);
    setActiveTab("PAYMENT");
    void refreshQr(transaction.id);
  };

  useEffect(() => {
    if (!isCheckoutModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCheckoutModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isCheckoutModalOpen]);

  useEffect(() => {
    if (!checkout || checkout.status !== "PENDING") return;
    const timer = window.setInterval(() => {
      const seconds = getRemainingSeconds(checkout.expiresAt);
      setRemainingSeconds(seconds);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [checkout]);

  const checkoutTransactionId = checkout?.transactionId;
  const pendingBankTransactionIds = new Set(
    (overview?.transactions ?? [])
    .filter((transaction) => (
      (transaction.status === "PENDING" || transaction.status === "REVIEW_REQUIRED")
      && transaction.paymentMethod === "BANK_TRANSFER"
    ))
    .map((transaction) => transaction.id),
  );
  if (checkout?.status === "PENDING" || checkout?.status === "REVIEW_REQUIRED") {
    pendingBankTransactionIds.add(checkout.transactionId);
  }
  const pendingBankTransactionKey = [...pendingBankTransactionIds].join(",");

  useEffect(() => {
    if (!checkout) return;
    const paidTransaction = overview?.transactions.find((transaction) =>
      transaction.id === checkout.transactionId && transaction.status === "SUCCESS");
    if (checkout.status !== "SUCCESS" && !paidTransaction) return;
    notifyPaymentSuccess(paidTransaction ?? {
      id: checkout.transactionId,
      amount: checkout.amount,
      planName: checkout.planName,
    });
  }, [checkout, overview, notifyPaymentSuccess]);

  useEffect(() => {
    if (!pendingBankTransactionKey) return;

    const pendingIds = new Set(pendingBankTransactionKey.split(","));
    let checking = false;
    const checkPaymentStatus = async () => {
      if (checking) return;
      checking = true;
      try {
        const latest = await getStudentBillingOverview();
        setOverview(latest);
        const paidTransaction = latest.transactions.find((transaction) =>
          pendingIds.has(transaction.id)
          && transaction.status === "SUCCESS"
          && !notifiedPaymentTransactionIds.current.has(transaction.id));

        if (paidTransaction) {
          notifyPaymentSuccess(paidTransaction);
        }

        const completedCheckout = latest.transactions.find((transaction) =>
          transaction.id === checkoutTransactionId && transaction.status !== "PENDING");
        if (completedCheckout) {
          setCheckout((current) => current?.transactionId === completedCheckout.id
            ? { ...current, status: completedCheckout.status }
            : current);
        }
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : "Không thể kiểm tra trạng thái thanh toán.");
      } finally {
        checking = false;
      }
    };

    void checkPaymentStatus();
    const timer = window.setInterval(checkPaymentStatus, 8000);
    window.addEventListener("focus", checkPaymentStatus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", checkPaymentStatus);
    };
  }, [pendingBankTransactionKey, checkoutTransactionId, notifyPaymentSuccess]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {paymentSuccessNotice ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-lg sm:right-6 sm:top-6"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <span className="font-semibold">{paymentSuccessNotice}</span>
          <button
            type="button"
            onClick={() => setPaymentSuccessNotice(null)}
            aria-label="Đóng thông báo thanh toán"
            className="ml-1 rounded p-0.5 text-emerald-700 hover:bg-emerald-50"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-on-surface-variant">
            Cá nhân <span className="px-1.5">/</span> Gói học &amp; thanh toán
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-on-surface md:text-3xl">Gói học &amp; thanh toán</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Xem quyền lợi hiện tại, chọn gói học và theo dõi thanh toán.</p>
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

      <nav aria-label="Gói học và thanh toán" className="flex gap-2 overflow-x-auto border-b border-outline-variant/50">
        <TabButton active={activeTab === "PLANS"} onClick={() => setActiveTab("PLANS")}>Gói học hiện tại</TabButton>
        <TabButton active={activeTab === "PAYMENT"} onClick={() => setActiveTab("PAYMENT")}>
          Thanh toán{checkout?.status === "PENDING" ? <span className="ml-2 h-2 w-2 rounded-full bg-amber-500" /> : null}
        </TabButton>
        <TabButton active={activeTab === "HISTORY"} onClick={() => setActiveTab("HISTORY")}>Lịch sử thanh toán</TabButton>
      </nav>

      {billingError ? <LoadError message={billingError} onRetry={() => void loadData()} /> : null}
      {plansError ? <LoadError message={plansError} onRetry={() => void loadData()} /> : null}
      {featuresError ? <LoadError message={featuresError} onRetry={() => void loadData()} /> : null}

      {activeTab === "PLANS" ? (
        <div className="space-y-8">
          <CurrentPlanSection
            currentSubscription={currentSubscription}
            upcomingSubscriptions={overview?.upcomingSubscriptions ?? []}
            loading={loading && !overview}
            billingError={billingError}
          />

          <section aria-labelledby="available-plans-title" className="space-y-4">
            <div>
              <h2 id="available-plans-title" className="text-xl font-semibold text-on-surface">Các gói học đang phát hành</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Chọn gói phù hợp để xem hướng dẫn thanh toán an toàn bằng VietQR.</p>
            </div>
            {promotionalPlan ? (
              <PromotionBanner
                plan={promotionalPlan}
                featureCatalog={featureCatalog}
                isCurrent={currentSubscription?.planId === promotionalPlan.id}
                onChoose={() => selectPlan(promotionalPlan)}
              />
            ) : null}
            {loading && plans.length === 0 ? (
              <p role="status" className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 text-sm text-on-surface-variant">Đang tải gói học…</p>
            ) : plans.length === 0 && !plansError ? (
              <p className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 text-sm text-on-surface-variant">Hiện chưa có gói học được phát hành.</p>
            ) : standardPlans.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {standardPlans.map((plan) => (
                  <LearningPlanCard
                    key={plan.id}
                    plan={plan}
                    featureCatalog={featureCatalog}
                    isCurrent={currentSubscription?.planId === plan.id}
                    onChoose={() => selectPlan(plan)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : activeTab === "PAYMENT" ? (
        <section aria-labelledby="checkout-title" className="mx-auto w-full max-w-5xl">
          <div className="mb-6 flex flex-col gap-4 border-b border-outline-variant/40 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Đăng ký gói học</p>
              <h2 id="checkout-title" className="mt-1 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Xác nhận lựa chọn</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">Kiểm tra quyền lợi và số tiền trước khi tạo đơn thanh toán.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("PLANS")}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3.5 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Chọn gói khác
            </button>
          </div>

          {selectedPlan || checkout ? (
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
              <article className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest">
                <div className={`border-b border-outline-variant/30 px-5 py-5 sm:px-7 ${selectedPlan ? planColors[selectedPlan.planCategory].checkout : "bg-surface-container-low"}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">Gói bạn đã chọn</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <h3 className="break-words text-xl font-bold text-on-surface sm:text-2xl">{selectedPlan?.name ?? checkout?.planName}</h3>
                    {selectedPlan?.planCategory === "PROMOTION" ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Ưu đãi</span> : null}
                  </div>
                  {selectedPlan ? (
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {selectedPlan.billingCycle === "LIFETIME" ? "Quyền lợi trọn đời" : `Có hiệu lực ${selectedPlan.durationDays} ngày kể từ khi kích hoạt`}
                    </p>
                  ) : null}
                </div>

                <div className="px-5 py-5 sm:px-7 sm:py-6">
                  <h4 className="text-sm font-semibold text-on-surface">Quyền lợi trong gói</h4>
                  {selectedPlan ? (
                    <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {describePlanEntitlements(selectedPlan, featureCatalog).map((benefit) => (
                        <li key={benefit} className="flex min-w-0 items-start gap-2.5 text-sm leading-5 text-on-surface-variant">
                          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                          <span className="min-w-0 break-words">{benefit}</span>
                        </li>
                      ))}
                      {describePlanEntitlements(selectedPlan, featureCatalog).length === 0 ? (
                        <li className="text-sm text-on-surface-variant">Quyền lợi sẽ hiển thị khi danh mục tính năng sẵn sàng.</li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-on-surface-variant">Thông tin quyền lợi của đơn hàng đang chờ thanh toán.</p>
                  )}
                </div>
              </article>

              <aside className="min-w-0 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6 lg:sticky lg:top-28">
                <h3 className="text-sm font-semibold text-on-surface">Tóm tắt thanh toán</h3>
                <div className="mt-4 space-y-3 border-b border-dashed border-outline-variant/60 pb-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 text-on-surface-variant">{selectedPlan?.name ?? checkout?.planName}</span>
                    <span className="shrink-0 font-medium text-on-surface">
                      {selectedPlan ? formatVnd(selectedPlan.originalPrice) : checkout ? formatVnd(checkout.amount) : ""}
                    </span>
                  </div>
                  {selectedPlan && selectedPlan.originalPrice > selectedPlan.promotionalPrice ? (
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-on-surface-variant">Ưu đãi</span>
                      <span className="shrink-0 font-medium text-emerald-700">−{formatVnd(selectedPlan.originalPrice - selectedPlan.promotionalPrice)}</span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <span className="text-sm font-semibold text-on-surface">Tổng thanh toán</span>
                  <span className={`text-right text-xl font-bold ${selectedPlan ? planColors[selectedPlan.planCategory].price : "text-primary"}`}>
                    {selectedPlan ? (selectedPlan.promotionalPrice === 0 ? "Miễn phí" : formatVnd(selectedPlan.promotionalPrice)) : checkout ? formatVnd(checkout.amount) : ""}
                  </span>
                </div>
                {checkout ? (
                  <div className="mt-5 rounded-xl bg-surface-container-low p-3.5">
                    <div className="flex items-center gap-2">
                      {checkout.status === "SUCCESS"
                        ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                        : <Clock3 className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />}
                      <p className="text-sm font-semibold text-on-surface">{transactionStatus[checkout.status].label}</p>
                    </div>
                    <p className="mt-2 break-words text-xs text-on-surface-variant">Mã đơn {checkout.orderCode}</p>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutModalOpen(true)}
                      className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white ${selectedPlan ? planColors[selectedPlan.planCategory].button : "bg-primary hover:bg-primary/90"}`}
                    >
                      {checkout.status === "SUCCESS" ? "Xem trạng thái" : "Xem hóa đơn"}
                    </button>
                  </div>
                ) : selectedPlan ? (
                  <>
                    {checkoutError ? <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{checkoutError}</p> : null}
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutError("");
                        setIsCheckoutModalOpen(true);
                      }}
                      disabled={selectedPlan.promotionalPrice <= 0}
                      className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${planColors[selectedPlan.planCategory].button}`}
                    >
                      <CreditCard size={17} aria-hidden="true" />
                      {selectedPlan.promotionalPrice <= 0 ? "Gói miễn phí" : "Tiếp tục thanh toán"}
                    </button>
                    <p className="mt-3 text-center text-xs leading-5 text-on-surface-variant">Thanh toán an toàn qua VietQR. Đơn hàng chỉ được tạo khi bạn xác nhận.</p>
                  </>
                ) : null}
              </aside>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-outline-variant/70 bg-surface-container-lowest px-5 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard size={22} aria-hidden="true" />
              </span>
              <p className="mt-4 font-semibold text-on-surface">Chưa có gói học được chọn</p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-on-surface-variant">Xem các gói đang phát hành để so sánh quyền lợi và chọn gói phù hợp với mục tiêu của bạn.</p>
              <button type="button" onClick={() => setActiveTab("PLANS")} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">
                Khám phá các gói học
              </button>
            </div>
          )}
        </section>
      ) : (
        <section aria-labelledby="payment-history-title" className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest">
          <div className="border-b border-outline-variant/40 px-5 py-4">
            <h2 id="payment-history-title" className="font-semibold text-on-surface">Lịch sử thanh toán</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Các đơn hàng và trạng thái giao dịch của bạn.</p>
          </div>
          {loading && !overview ? (
            <p role="status" className="px-5 py-8 text-center text-sm text-on-surface-variant">Đang tải lịch sử…</p>
          ) : overview?.transactions.length ? (
            <PaymentHistory transactions={overview.transactions} onResume={resumePayment} />
          ) : (
            <p className="px-5 py-8 text-center text-sm text-on-surface-variant">
              {billingError ? "Chưa thể tải lịch sử thanh toán." : "Chưa có giao dịch nào được ghi nhận."}
            </p>
          )}
        </section>
      )}
      {isCheckoutModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCheckoutModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-qr-modal-title"
            className="relative max-h-[92dvh] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-2xl bg-surface-container-lowest p-4 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-outline-variant/40 pb-4">
              <div>
                <h2 id="checkout-qr-modal-title" className="text-lg font-bold text-on-surface">
                  {checkout ? "Thanh toán gói học" : "Thông tin thanh toán"}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">{checkout?.planName ?? selectedPlan?.name ?? "Đơn hàng đang chờ"}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                aria-label="Đóng cửa sổ mã QR"
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {checkout ? (
              <CheckoutQr
                checkout={checkout}
                remainingSeconds={remainingSeconds}
                refreshing={refreshingQr}
                error={checkoutError}
                onRefresh={() => void refreshQr(checkout.transactionId)}
              />
            ) : !resumingTransactionId ? (
              <div className="space-y-5">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-on-surface">Thanh toán bằng VietQR</p>
                      <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                        Sau khi tạo đơn, bạn có 30 phút để thanh toán. Mã tham chiếu được giữ cố định cho hóa đơn này.
                      </p>
                    </div>
                  </div>
                </div>
                {selectedPlan ? (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{selectedPlan.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">Số tiền thanh toán</p>
                    </div>
                    <p className={`text-lg font-bold ${planColors[selectedPlan.planCategory].price}`}>
                      {formatVnd(selectedPlan.promotionalPrice)}
                    </p>
                  </div>
                ) : null}
                {checkoutError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{checkoutError}</p> : null}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    disabled={creatingOrder}
                    className="h-11 rounded-lg border border-outline-variant/60 px-4 text-sm font-semibold text-on-surface-variant hover:bg-surface-container disabled:opacity-60"
                  >
                    Để sau
                  </button>
                  <button
                    type="button"
                    onClick={() => void startPayment()}
                    disabled={creatingOrder || !selectedPlan || (selectedPlan?.promotionalPrice ?? 0) <= 0}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${selectedPlan ? planColors[selectedPlan.planCategory].button : "bg-primary hover:bg-primary/90"}`}
                  >
                    {creatingOrder ? <RefreshCw size={16} className="animate-spin" aria-hidden="true" /> : <CreditCard size={16} aria-hidden="true" />}
                    {creatingOrder ? "Đang tạo đơn…" : "Tạo đơn và hiển thị mã QR"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                {refreshingQr ? <RefreshCw className="h-8 w-8 animate-spin text-primary" aria-hidden="true" /> : null}
                <p className="mt-3 font-semibold text-on-surface">{refreshingQr ? "Đang tải mã thanh toán…" : "Chưa tải được mã thanh toán"}</p>
                {checkoutError ? <p role="alert" className="mt-2 text-sm text-rose-700">{checkoutError}</p> : null}
                {!refreshingQr && resumingTransactionId ? (
                  <button
                    type="button"
                    onClick={() => void refreshQr(resumingTransactionId)}
                    className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    Thử tải lại mã QR
                  </button>
                ) : null}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`-mb-px inline-flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${
        active ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function CurrentPlanSection({ currentSubscription, upcomingSubscriptions, loading, billingError }: {
  currentSubscription: StudentBillingOverview["currentSubscription"];
  upcomingSubscriptions: StudentBillingOverview["upcomingSubscriptions"];
  loading: boolean;
  billingError: string;
}) {
  return (
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
      {loading ? (
        <p role="status" className="mt-5 text-sm text-on-surface-variant">Đang tải thông tin gói học…</p>
      ) : currentSubscription ? (
        <div className="mt-5 grid gap-4 rounded-xl bg-surface-container-low p-4 sm:grid-cols-3 sm:p-5">
          <div><p className="text-xs text-on-surface-variant">Tên gói</p><p className="mt-1 font-semibold text-on-surface">{currentSubscription.planName}</p></div>
          <div><p className="text-xs text-on-surface-variant">Bắt đầu</p><p className="mt-1 font-medium text-on-surface">{formatDate(currentSubscription.startDate)}</p></div>
          <div><p className="text-xs text-on-surface-variant">Hết hạn</p><p className="mt-1 font-medium text-on-surface">{formatDate(currentSubscription.endDate)}</p></div>
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
      {upcomingSubscriptions.length > 0 ? (
        <div className="mt-6 border-t border-outline-variant/40 pt-5">
          <h3 className="font-semibold text-on-surface">Gói đã mua đang chờ kích hoạt</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Các gói sẽ tự nối tiếp và có hiệu lực theo thứ tự thanh toán.</p>
          <ol className="mt-4 space-y-3">
            {upcomingSubscriptions.map((subscription, index) => (
              <li key={subscription.id} className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{index + 1}. {subscription.planName}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Bắt đầu {formatDate(subscription.startDate)} · Kết thúc {formatDate(subscription.endDate)}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Đang xếp lịch
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function PromotionBanner({ plan, featureCatalog, isCurrent, onChoose }: {
  plan: SubscriptionPlan;
  featureCatalog: LearningFeature[];
  isCurrent: boolean;
  onChoose: () => void;
}) {
  const discount = plan.originalPrice > 0
    ? Math.max(0, Math.round((1 - plan.promotionalPrice / plan.originalPrice) * 100))
    : 0;
  const benefits = describePlanEntitlements(plan, featureCatalog).slice(0, 3);
  return (
    <article className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-5 shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-6 -top-10 opacity-[0.08]"><Sparkles size={190} aria-hidden="true" /></div>
      <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-amber-950"><Flame size={14} aria-hidden="true" /> ƯU ĐÃI CÓ THỜI HẠN</span>
            {discount > 0 ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">Giảm {discount}%</span> : null}
          </div>
          <h3 className="mt-3 text-xl font-extrabold text-amber-950 sm:text-2xl">{plan.badgeTag || plan.name}</h3>
          <p className="mt-1 text-sm text-amber-950/70">Đăng ký gói {plan.name} trong thời gian ưu đãi để mở khóa lộ trình học đầy đủ.</p>
          {benefits.length > 0 ? <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-amber-900">{benefits.map((item) => <li key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} aria-hidden="true" />{item}</li>)}</ul> : null}
        </div>
        <div className="relative flex flex-wrap items-center gap-4 md:flex-col md:items-end">
          <div className="md:text-right">
            <p className="text-2xl font-black text-orange-800">{formatVnd(plan.promotionalPrice)}</p>
            {plan.originalPrice > plan.promotionalPrice ? <p className="text-sm text-amber-900/60 line-through">{formatVnd(plan.originalPrice)}</p> : null}
          </div>
          <button
            type="button"
            onClick={onChoose}
            disabled={isCurrent || plan.promotionalPrice <= 0}
            className="rounded-lg bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCurrent ? "Gói hiện tại" : "Đăng ký ưu đãi"}
          </button>
        </div>
      </div>
    </article>
  );
}

function LearningPlanCard({ plan, featureCatalog, isCurrent, onChoose }: {
  plan: SubscriptionPlan;
  featureCatalog: LearningFeature[];
  isCurrent: boolean;
  onChoose: () => void;
}) {
  const benefits = describePlanEntitlements(plan, featureCatalog);
  const categoryLabel = plan.planCategory === "PREMIUM" ? "Premium" : plan.planCategory === "FREE" ? "Free" : "Pro";
  const colors = planColors[plan.planCategory];

  return (
    <article className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 shadow-sm ${colors.card}`}>
    {plan.planCategory === "PRO" || plan.planCategory === "PREMIUM" ? (
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${plan.planCategory === "PRO" ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-gradient-to-r from-violet-600 to-fuchsia-500"}`} />
    ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}>{categoryLabel}</span>
        {plan.isPopular ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}>{plan.badgeTag || "Phổ biến"}</span> : null}
        {isCurrent ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Gói hiện tại</span> : null}
      </div>
      <h3 className="mt-4 text-lg font-bold text-on-surface">{plan.name}</h3>
      <p className={`mt-3 text-2xl font-bold ${colors.price}`}>{plan.promotionalPrice === 0 ? "Miễn phí" : formatVnd(plan.promotionalPrice)}</p>
      {plan.originalPrice > plan.promotionalPrice ? <p className="mt-1 text-sm text-on-surface-variant line-through">{formatVnd(plan.originalPrice)}</p> : null}
      <p className="mt-3 text-sm text-on-surface-variant">{plan.billingCycle === "LIFETIME" ? "Trọn đời" : `${plan.durationDays} ngày kể từ khi kích hoạt`}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm text-on-surface-variant">
        {benefits.map((benefit) => <li key={benefit} className="flex gap-2"><CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${colors.benefit}`} aria-hidden="true" />{benefit}</li>)}
        {benefits.length === 0 ? <li>Quyền lợi sẽ hiển thị khi danh mục tính năng sẵn sàng.</li> : null}
      </ul>
      <button
        type="button"
        onClick={onChoose}
        disabled={isCurrent || plan.promotionalPrice <= 0}
        className={`mt-6 inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:border-outline-variant disabled:bg-surface-container disabled:text-on-surface-variant ${colors.button}`}
      >
        {isCurrent ? "Đang sử dụng" : plan.promotionalPrice <= 0 ? "Gói miễn phí" : "Chọn gói"}
      </button>
    </article>
  );
}

function CheckoutQr({ checkout, remainingSeconds, refreshing, error, onRefresh }: {
  checkout: StudentCheckoutResponse;
  remainingSeconds: number;
  refreshing: boolean;
  error: string;
  onRefresh: () => void;
}) {
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
  const expired = remainingSeconds <= 0;

  if (checkout.status === "SUCCESS") {
    return (
      <div role="status" className="flex min-h-64 flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold text-on-surface">Thanh toán thành công</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Gói học đã được kích hoạt cho tài khoản của bạn.</p>
      </div>
    );
  }

  if (checkout.status === "EXPIRED" || (checkout.status === "PENDING" && expired)) {
    return (
      <div role="status" className="flex min-h-64 flex-col items-center justify-center text-center">
        <Clock3 className="h-12 w-12 text-slate-500" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold text-on-surface">Đăng ký thất bại — hóa đơn đã hết hạn</h3>
        <p className="mt-1 max-w-sm text-sm leading-6 text-on-surface-variant">
          Mã thanh toán đã đóng vì hệ thống chưa ghi nhận thanh toán trong 30 phút. Nếu bạn đã chuyển khoản, vui lòng liên hệ quản trị viên để đối soát trước khi tạo đơn mới.
        </p>
      </div>
    );
  }

  if (checkout.status === "REVIEW_REQUIRED") {
    return (
      <div role="status" className="flex min-h-64 flex-col items-center justify-center text-center">
        <Clock3 className="h-12 w-12 text-orange-600" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold text-on-surface">Giao dịch đang được kiểm tra</h3>
        <p className="mt-1 max-w-sm text-sm leading-6 text-on-surface-variant">
          Hệ thống đã nhận giao dịch nhưng chưa thể xác minh thời điểm thanh toán. Quản trị viên sẽ kiểm tra trước khi kích hoạt gói học.
        </p>
      </div>
    );
  }

  if (checkout.status === "FAILED" || checkout.status === "REFUNDED") {
    return (
      <div role="status" className="flex min-h-64 flex-col items-center justify-center text-center">
        <h3 className="text-lg font-bold text-on-surface">{transactionStatus[checkout.status].label}</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-outline-variant/50 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="font-semibold text-on-surface">Quét mã để chuyển khoản</p><p className="mt-1 text-xs text-on-surface-variant">Đơn hàng {checkout.orderCode}</p></div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${expired ? "bg-amber-100 text-amber-800" : "bg-surface-container text-on-surface-variant"}`}>
          <Clock3 size={13} aria-hidden="true" /> {expired ? "Đang đóng hóa đơn" : `${minutes}:${seconds}`}
        </span>
      </div>
      <div className="mx-auto mt-4 w-full max-w-64 rounded-xl border border-outline-variant/50 bg-white p-2">
        {!expired ? (
          <VietQrImage
            key={checkout.qrImageUrl}
            src={checkout.qrImageUrl}
            alt={`Mã QR thanh toán ${formatVnd(checkout.amount)}`}
          />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-surface-container-low text-center">
            <Clock3 className="h-7 w-7 text-slate-500" aria-hidden="true" />
            <p className="px-5 text-sm text-on-surface-variant">Mã thanh toán đã hết hạn.</p>
          </div>
        )}
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3"><dt className="min-w-0 text-on-surface-variant">Ngân hàng</dt><dd className="min-w-0 break-words text-right font-semibold text-on-surface">{checkout.bankCode}</dd></div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3"><dt className="min-w-0 text-on-surface-variant">Số tài khoản</dt><dd className="min-w-0 break-all text-right font-mono font-semibold text-on-surface">{checkout.accountNumber}</dd></div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3"><dt className="min-w-0 text-on-surface-variant">Chủ tài khoản</dt><dd className="min-w-0 break-words text-right font-semibold text-on-surface">{checkout.accountName}</dd></div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3"><dt className="min-w-0 text-on-surface-variant">Số tiền</dt><dd className="min-w-0 break-words text-right font-bold text-primary">{formatVnd(checkout.amount)}</dd></div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3"><dt className="min-w-0 text-on-surface-variant">Nội dung chuyển khoản</dt><dd className="min-w-0 break-all text-right font-mono font-bold text-on-surface">{checkout.paymentContent}</dd></div>
      </dl>
      <p className="mt-4 rounded-lg bg-sky-50 p-3 text-xs leading-5 text-sky-900">
        Hóa đơn hết hạn sau 30 phút kể từ khi tạo. Hãy chuyển đúng số tiền và nội dung thanh toán hiển thị.
      </p>
      {error ? <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing || expired}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/60 text-sm font-semibold text-on-surface-variant hover:bg-surface-container disabled:opacity-60"
      >
        <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
        {refreshing ? "Đang tải mã QR…" : expired ? "Hóa đơn đã hết hạn" : "Tải lại mã QR"}
      </button>
    </div>
  );
}

function VietQrImage({ src, alt }: { src: string; alt: string }) {
  const [imageLoadError, setImageLoadError] = useState(false);
  if (imageLoadError) {
    return (
      <div role="alert" className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-surface-container-low px-6 text-center">
        <p className="font-semibold text-on-surface">Chưa tải được ảnh mã QR</p>
        <p className="text-xs leading-5 text-on-surface-variant">Bạn vẫn có thể chuyển khoản thủ công theo số tiền và nội dung bên dưới.</p>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={260}
      height={260}
      unoptimized
      onError={() => setImageLoadError(true)}
      className="aspect-square h-auto w-full"
    />
  );
}

function PaymentHistory({ transactions, onResume }: {
  transactions: StudentPaymentTransaction[];
  onResume: (transaction: StudentPaymentTransaction) => void;
}) {
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
            <th scope="col" className="px-5 py-3 font-semibold">Thao tác</th>
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
                <td className="px-5 py-4">
                  {transaction.status === "PENDING" && transaction.paymentMethod === "BANK_TRANSFER" ? (
                    <button type="button" onClick={() => onResume(transaction)} className="whitespace-nowrap font-semibold text-primary hover:underline">
                      Tiếp tục thanh toán
                    </button>
                  ) : <span className="text-on-surface-variant">—</span>}
                </td>
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
