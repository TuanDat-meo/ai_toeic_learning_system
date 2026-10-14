"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Edit,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { LEARNING_CAPABILITIES } from "@/lib/learning-capabilities";
import {
  getSubscriptionPlans,
  getUserSubscriptions,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  cancelUserSubscription,
  extendUserSubscription,
  type PlanInput,
  type AiAccessMode,
  type LearningPlanCategory,
  type SubscriptionBillingCycle,
  type SubscriptionPlan,
  type SubscriptionPlanStatus,
  type UserSubscription,
} from "@/lib/api/billing";

const formatVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const dateTimeLocalToIso = (value: string) => value ? new Date(value).toISOString() : null;
const calculateDiscountPercent = (originalPrice: number, promotionalPrice: number) =>
  originalPrice > 0 ? Math.round(((originalPrice - promotionalPrice) / originalPrice) * 1_000_000_000) / 10_000_000 : 0;
const calculatePromotionalPrice = (originalPrice: number, discountPercent: number) =>
  Math.round(originalPrice * (1 - discountPercent / 100));

const generatePlanCode = (name: string, plans: SubscriptionPlan[]) => {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/Đ/g, "D")
    .replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80).replace(/_+$/g, "") || "GOI_HOC";
  const existingCodes = new Set(plans.map((plan) => plan.code.toUpperCase()));
  let candidate = base;
  let suffix = 2;
  while (existingCodes.has(candidate)) {
    const suffixText = `_${suffix++}`;
    candidate = `${base.slice(0, 80 - suffixText.length).replace(/_+$/g, "")}${suffixText}`;
  }
  return candidate;
};

type PlanField = "code" | "name" | "originalPrice" | "discountPercent" | "durationDays" | "offerStartsAt" | "offerEndsAt" | "maxAiQueriesPerDay";
const planCategoryLabels: Record<LearningPlanCategory, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
  PROMOTION: "Ưu đãi",
};

export function AdminSubscriptionsView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PLANS" | "SUBSCRIBERS">("PLANS");
  const [planSearch, setPlanSearch] = useState("");
  const [planStatusFilter, setPlanStatusFilter] = useState<"ALL" | SubscriptionPlanStatus>("ALL");
  const [planCategoryFilter, setPlanCategoryFilter] = useState<"ALL" | LearningPlanCategory>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PlanField, string>>>({});
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setErrorMsg("");
    try {
      const [plansData, subsData] = await Promise.all([getSubscriptionPlans(), getUserSubscriptions()]);
      setPlans(plansData);
      setUserSubs(subsData);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Không tải được dữ liệu lượt mua gói học.");
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(msg: string) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  const filteredPlans = plans.filter((plan) => {
    const query = planSearch.trim().toLocaleLowerCase("vi-VN");
    const matchesSearch = !query || [plan.name, plan.code, plan.badgeTag ?? "", ...plan.capabilityKeys.map((key) => LEARNING_CAPABILITIES.find((item) => item.key === key)?.label ?? key)].some((value) => value.toLocaleLowerCase("vi-VN").includes(query));
    return matchesSearch && (planStatusFilter === "ALL" || plan.status === planStatusFilter)
      && (planCategoryFilter === "ALL" || plan.planCategory === planCategoryFilter);
  });
  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagePlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function openCreatePlanModal() {
    setErrorMsg("");
    setFieldErrors({});
    setDiscountPercent(0);
    setEditingPlan({
      code: "",
      name: "",
      originalPrice: 0,
      promotionalPrice: 0,
      billingCycle: "QUARTERLY",
      durationDays: 90,
      badgeTag: "",
      isPopular: false,
      features: [],
      capabilityKeys: [],
      planCategory: "PRO",
      aiAccessMode: "DISABLED",
      offerStartsAt: null,
      offerEndsAt: null,
      maxAiQueriesPerDay: 0,
      status: "DRAFT",
      purchaseCount: 0,
    });
  }

  function openEditPlanModal(plan: SubscriptionPlan) {
    setErrorMsg("");
    setFieldErrors({});
    setDiscountPercent(calculateDiscountPercent(plan.originalPrice, plan.promotionalPrice));
    setEditingPlan(plan);
  }

  function validatePlan(plan: Partial<SubscriptionPlan>) {
    const errors: Partial<Record<PlanField, string>> = {};
    const code = plan.code?.trim() ?? "";
    const name = plan.name?.trim() ?? "";
    const originalPrice = Number(plan.originalPrice);
    const promotionalPrice = calculatePromotionalPrice(originalPrice, discountPercent);
    const durationDays = Number(plan.durationDays);
    const aiLimit = Number(plan.maxAiQueriesPerDay);

    if (!code) errors.code = "Vui lòng nhập mã gói học.";
    else if (code.length > 80 || !/^[A-Za-z0-9_-]+$/.test(code)) errors.code = "Mã chỉ gồm chữ không dấu, số, dấu gạch ngang hoặc gạch dưới (tối đa 80 ký tự).";
    if (!name) errors.name = "Vui lòng nhập tên gói học.";
    else if (name.length > 160) errors.name = "Tên gói học không được vượt quá 160 ký tự.";
    if (!Number.isInteger(originalPrice) || originalPrice < 0) errors.originalPrice = "Giá gốc phải là số nguyên từ 0 trở lên.";
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) errors.discountPercent = "Phần trăm giảm giá phải từ 0% đến 100%.";
    if (!Number.isInteger(promotionalPrice) || promotionalPrice < 0) errors.discountPercent = "Không tính được giá sau giảm hợp lệ.";
    if (plan.billingCycle !== "LIFETIME" && (!Number.isInteger(durationDays) || durationDays < 1)) errors.durationDays = "Thời hạn sử dụng phải từ 1 ngày trở lên.";
    if (plan.aiAccessMode === "LIMITED" && (!Number.isInteger(aiLimit) || aiLimit < 1)) errors.maxAiQueriesPerDay = "Hạn mức AI phải từ 1 lượt mỗi ngày trở lên.";
    if (plan.planCategory === "PROMOTION") {
      if (!plan.offerStartsAt) errors.offerStartsAt = "Vui lòng chọn thời điểm bắt đầu phát hành.";
      if (!plan.offerEndsAt) errors.offerEndsAt = "Vui lòng chọn thời điểm kết thúc phát hành.";
      if (plan.offerStartsAt && plan.offerEndsAt && new Date(plan.offerStartsAt) >= new Date(plan.offerEndsAt)) {
        errors.offerEndsAt = "Thời điểm kết thúc phải sau thời điểm bắt đầu.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function clearFieldError(field: PlanField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSavePlan() {
    if (!editingPlan || !validatePlan(editingPlan)) return;

    let nextList: SubscriptionPlan[];
    if (editingPlan.id) {
      const payload = toPlanInput(editingPlan);
      const saved = await updateSubscriptionPlan(editingPlan.id, payload);
      nextList = plans.map((p) => p.id === saved.id ? saved : p);
      showFeedback(`Đã cập nhật gói học "${saved.name}"`);
    } else {
      const newPlan = await createSubscriptionPlan(toPlanInput(editingPlan));
      nextList = [...plans, newPlan];
      showFeedback(`Đã tạo gói học "${newPlan.name}"`);
    }

    setPlans(nextList);
    setEditingPlan(null);
    await loadData();
  }

  async function togglePlanStatus(plan: SubscriptionPlan) {
    const nextStatus: SubscriptionPlanStatus = plan.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    const updated = await updateSubscriptionPlan(plan.id, toPlanInput({ ...plan, status: nextStatus }));
    setPlans(plans.map((p) => p.id === plan.id ? updated : p));
    showFeedback(nextStatus === "ACTIVE" ? "Đã phát hành gói học" : "Đã tạm dừng gói học");
  }

  async function handleDeletePlanConfirm() {
    if (!deletingPlan) return;
    await deleteSubscriptionPlan(deletingPlan.id);
    setPlans(plans.filter((p) => p.id !== deletingPlan.id));
    setDeletingPlan(null);
    showFeedback(`Đã xóa gói học "${deletingPlan.name}"`);
  }

  async function handleExtendSubscription(sub: UserSubscription) {
    await extendUserSubscription(sub.id);
    showFeedback(`Đã cộng thêm 30 ngày sử dụng cho ${sub.userEmail}.`);
    await loadData();
  }

  async function handleCancelSubscription(sub: UserSubscription) {
    if (!window.confirm(`Thu hồi quyền học của ${sub.userEmail}?`)) return;
    await cancelUserSubscription(sub.id);
    showFeedback(`Đã thu hồi quyền học của ${sub.userEmail}.`);
    await loadData();
  }

  function toPlanInput(plan: Partial<SubscriptionPlan>): PlanInput {
    const aiAccessMode = plan.aiAccessMode || "DISABLED";
    return { code: plan.code?.trim() || "", name: plan.name?.trim() || "", originalPrice: Number(plan.originalPrice ?? 0), promotionalPrice: Number(plan.promotionalPrice ?? 0), billingCycle: plan.billingCycle || "QUARTERLY", durationDays: Number(plan.durationDays ?? 90), badgeTag: plan.badgeTag || "", isPopular: Boolean(plan.isPopular), features: plan.features ?? [], capabilityKeys: plan.capabilityKeys ?? [], maxAiQueriesPerDay: aiAccessMode === "LIMITED" ? Number(plan.maxAiQueriesPerDay ?? 0) : 0, aiAccessMode, status: plan.status || "DRAFT", planCategory: plan.planCategory || "PRO", offerStartsAt: plan.planCategory === "PROMOTION" ? plan.offerStartsAt ?? null : null, offerEndsAt: plan.planCategory === "PROMOTION" ? plan.offerEndsAt ?? null : null };
  }

  async function runAction(action: () => Promise<void>) {
    setErrorMsg("");
    try { await action(); }
    catch (error) { setErrorMsg(error instanceof Error ? error.message : "Thao tác chưa thể hoàn tất."); }
  }

  async function runPlanSave() {
    setErrorMsg("");
    try {
      await handleSavePlan();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu gói học.";
      if (/mã gói/i.test(message)) setFieldErrors((current) => ({ ...current, code: message }));
      else if (/thời hạn/i.test(message)) setFieldErrors((current) => ({ ...current, durationDays: message }));
      else if (/giá/i.test(message)) setFieldErrors((current) => ({ ...current, discountPercent: message }));
      else if (/phát hành|ưu đãi/i.test(message)) setFieldErrors((current) => ({ ...current, offerEndsAt: message }));
      else setErrorMsg(message);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">Trang chủ <span className="px-1.5">/</span> Hệ thống <span className="px-1.5">/</span> <span className="font-semibold text-blue-700">Quản lý gói học</span></p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">Quản lý gói học</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">Cấu hình quyền học, ưu đãi và thời hạn truy cập.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">{loading ? "Đang tải..." : `${plans.length.toLocaleString("vi-VN")} gói học`}</span>
          {activeTab === "PLANS" ? <button type="button" onClick={openCreatePlanModal} className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"><span aria-hidden="true">+</span>Tạo gói học</button> : null}
        </div>
      </header>

      <div className="space-y-6">
        <section aria-label="Điều hướng và bộ lọc gói học" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Danh sách quản lý" className="inline-flex w-fit max-w-full gap-1 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setActiveTab("PLANS")} aria-current={activeTab === "PLANS" ? "page" : undefined} className={"inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition " + (activeTab === "PLANS" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800")}>Gói học <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{plans.length.toLocaleString("vi-VN")}</span></button>
              <button type="button" onClick={() => setActiveTab("SUBSCRIBERS")} aria-current={activeTab === "SUBSCRIBERS" ? "page" : undefined} className={"inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition " + (activeTab === "SUBSCRIBERS" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800")}>Lượt mua <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-500">{userSubs.length.toLocaleString("vi-VN")}</span></button>
            </nav>
            <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:self-auto"><RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin text-blue-600" : "")} />Làm mới</button>
          </div>
          {activeTab === "PLANS" && <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 lg:grid-cols-[auto_minmax(200px,1fr)_180px_auto] lg:items-center">
            <nav aria-label="Lọc theo nhóm gói học" className="flex gap-1.5 overflow-x-auto pb-0.5">
              {(["ALL", "FREE", "PRO", "PREMIUM", "PROMOTION"] as const).map((category) => {
                const label = category === "ALL" ? "Tất cả gói học" : planCategoryLabels[category];
                const count = category === "ALL" ? plans.length : plans.filter((plan) => plan.planCategory === category).length;
                const selected = planCategoryFilter === category;
                return <button key={category} type="button" onClick={() => { setPlanCategoryFilter(category); setPlanStatusFilter("ALL"); setPage(1); }} aria-pressed={selected} className={"inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition " + (selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50")}>{label}<span className="text-[10px] opacity-70">{count.toLocaleString("vi-VN")}</span></button>;
              })}
            </nav>
            <label className="relative min-w-0"><span className="sr-only">Tìm theo tên, mã hoặc quyền học</span><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="search" value={planSearch} onChange={(event) => { setPlanSearch(event.target.value); setPage(1); }} placeholder="Tìm tên, mã gói, quyền học..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <label><span className="sr-only">Lọc theo trạng thái gói</span><select value={planStatusFilter} onChange={(event) => { setPlanStatusFilter(event.target.value as "ALL" | SubscriptionPlanStatus); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="ALL">Mọi trạng thái</option><option value="ACTIVE">Đang phát hành</option><option value="DRAFT">Bản nháp</option><option value="ARCHIVED">Đã lưu trữ</option></select></label>
            <p aria-live="polite" className="text-right text-xs text-slate-500 lg:whitespace-nowrap">{filteredPlans.length.toLocaleString("vi-VN")} / {plans.length.toLocaleString("vi-VN")} gói</p>
          </div>}
        </section>

        {activeTab === "PLANS" && (
          <>            {feedbackMsg ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{feedbackMsg}</div> : null}
            {errorMsg ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">{errorMsg}</div> : null}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-left [&_th]:border-b [&_th]:border-r [&_th]:border-slate-200 [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-slate-100 [&_td:last-child]:border-r-0 [&_tbody_tr:last-child_td]:border-b-0">
                  <thead className="bg-slate-50 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th scope="col" className="px-5 py-4">Gói học</th><th scope="col" className="px-4 py-4">Giá</th><th scope="col" className="px-4 py-4">Thời hạn &amp; phát hành</th><th scope="col" className="px-4 py-4">Quyền học</th><th scope="col" className="px-4 py-4">Lượt mua</th><th scope="col" className="px-4 py-4">Trạng thái</th><th scope="col" className="px-5 py-4">Thao tác</th></tr></thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }, (_, index) => <tr key={index}><td colSpan={7} className="px-4 py-5"><div className="h-4 max-w-sm animate-pulse rounded bg-slate-100" /></td></tr>) : pagePlans.map((plan) => (
                      <tr key={plan.id} className="transition hover:bg-blue-50/30">
                        <td className="px-5 py-4"><div className="flex min-w-0 items-start gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${plan.isPopular ? "bg-blue-600" : "bg-slate-300"}`} /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{plan.name}{plan.isPopular ? <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Phổ biến</span> : null}</span><span className="mt-1 block font-mono text-xs text-slate-500">{plan.code}</span><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${plan.planCategory === "PROMOTION" ? "bg-violet-50 text-violet-700" : plan.planCategory === "PREMIUM" ? "bg-amber-50 text-amber-700" : plan.planCategory === "PRO" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{planCategoryLabels[plan.planCategory]}</span>{plan.badgeTag ? <span className="mt-1 block text-xs text-slate-500">{plan.badgeTag}</span> : null}</span></div></td>
                        <td className="px-4 py-4"><span className="block text-sm font-semibold text-slate-900">{formatVnd(plan.promotionalPrice)}</span>{plan.originalPrice > plan.promotionalPrice ? <span className="mt-1 block text-xs text-slate-400 line-through">{formatVnd(plan.originalPrice)}</span> : null}</td>
                        <td className="px-4 py-4"><span className="block text-sm text-slate-800">Thời hạn sử dụng</span><span className="mt-1 block text-xs text-slate-500">{plan.billingCycle === "LIFETIME" ? "Không hết hạn" : `${plan.durationDays} ngày từ lúc mua thành công`}</span>{plan.planCategory === "PROMOTION" && plan.offerStartsAt && plan.offerEndsAt ? <span className="mt-2 block max-w-[170px] text-[11px] leading-4 text-violet-700">Phát hành: {new Date(plan.offerStartsAt).toLocaleString("vi-VN")} – {new Date(plan.offerEndsAt).toLocaleString("vi-VN")}</span> : null}</td>
                        <td className="px-4 py-4"><ul className="max-w-xs space-y-1 text-xs text-slate-600">{(plan.capabilityKeys ?? []).slice(0, 3).map((key) => { const item = LEARNING_CAPABILITIES.find((capability) => capability.key === key); return <li key={`${plan.id}-${key}`} className="flex gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" /><span className="line-clamp-2">{item?.label ?? key}</span></li>; })}</ul>{plan.capabilityKeys.length > 3 ? <span className="mt-1 block text-[11px] text-slate-400">+{plan.capabilityKeys.length - 3} mục học khác</span> : null}{plan.capabilityKeys.length === 0 ? <span className="text-xs text-slate-400">Chưa chọn mục học</span> : null}<span className="mt-2 block text-xs font-medium text-slate-500">AI: {plan.aiAccessMode === "UNLIMITED" ? "Không giới hạn" : plan.aiAccessMode === "LIMITED" ? `${plan.maxAiQueriesPerDay} lượt/ngày` : "Không được dùng"}</span></td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-800">{plan.purchaseCount.toLocaleString("vi-VN")}</td>
                        <td className="px-4 py-4 text-center"><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${plan.status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : plan.status === "ARCHIVED" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{plan.status === "ACTIVE" ? "Đang phát hành" : plan.status === "ARCHIVED" ? "Đã lưu trữ" : "Bản nháp"}</span></td>
                        <td className="px-5 py-4"><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => openEditPlanModal(plan)} title="Chỉnh sửa gói" aria-label={`Chỉnh sửa gói ${plan.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"><Edit size={16} aria-hidden="true" /></button><button type="button" disabled={plan.purchaseCount > 0} onClick={() => setDeletingPlan(plan)} title={plan.purchaseCount > 0 ? "Gói đã có lượt mua, không thể xóa" : "Xóa gói"} aria-label={`Xóa gói ${plan.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={16} aria-hidden="true" /></button><button type="button" disabled={plan.status === "ARCHIVED"} onClick={() => void runAction(() => togglePlanStatus(plan))} className="ml-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">{plan.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loading ? <p role="status" className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-4 text-sm text-slate-500"><LoaderCircle size={16} className="animate-pulse" /> Đang tải gói học...</p> : null}
              {!loading && filteredPlans.length === 0 ? <div className="px-6 py-14 text-center"><CreditCard size={28} className="mx-auto text-slate-400" aria-hidden="true" /><h2 className="mt-3 text-sm font-semibold text-slate-800">{errorMsg ? "Chưa thể tải danh sách gói học" : plans.length ? "Không tìm thấy gói phù hợp" : "Chưa có gói học nào"}</h2><p className="mt-1 text-sm text-slate-500">{errorMsg || (plans.length ? "Thử đổi từ khóa hoặc trạng thái lọc." : "Tạo gói học đầu tiên để bắt đầu quản lý.")}</p></div> : null}
              {!loading && filteredPlans.length > 0 ? <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500"><span>Hiển thị <strong className="font-semibold text-slate-700">{((currentPage - 1) * pageSize + 1).toLocaleString("vi-VN")}–{Math.min(currentPage * pageSize, filteredPlans.length).toLocaleString("vi-VN")}</strong> trên {filteredPlans.length.toLocaleString("vi-VN")} gói</span><label className="inline-flex items-center gap-2">Số dòng<select aria-label="Số gói mỗi trang" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label></div><nav aria-label="Chuyển trang danh sách gói" className="flex items-center gap-2 self-end sm:self-auto"><button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Trước</button><span aria-live="polite" className="min-w-20 text-center text-xs text-slate-500">Trang {currentPage} / {pageCount}</span><button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sau</button></nav></footer> : null}
            </section>
          </>
        )}

        {activeTab === "SUBSCRIBERS" && (
          <>
          {feedbackMsg ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{feedbackMsg}</div> : null}
          {errorMsg ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">{errorMsg}</div> : null}
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải lượt mua gói học…</div> : userSubs.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Chưa có dữ liệu mua gói học.</div> : <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Người mua gói</th>
                    <th className="px-4 py-3.5">Gói học</th>
                    <th className="px-4 py-3.5">Cổng thanh toán</th>
                    <th className="px-4 py-3.5">Ngày kích hoạt</th>
                    <th className="px-4 py-3.5">Hạn sử dụng</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{sub.userName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{sub.userEmail}</p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-blue-700">{sub.planName}</span>
                        {sub.autoRenew && (
                          <span className="block text-[10px] text-emerald-600 font-medium">Tự động gia hạn</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">{sub.paymentMethod}</td>

                      <td className="px-4 py-3.5 text-slate-500">
                        {new Date(sub.startDate).toLocaleDateString("vi-VN")}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString("vi-VN") : "Trọn đời"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : sub.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {sub.status === "ACTIVE" ? "Đang có hiệu lực" : sub.status === "CANCELLED" ? "Đã thu hồi" : "Đã hết hạn"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {(sub.status === "ACTIVE" || sub.status === "EXPIRED") && sub.endDate && <button type="button" onClick={() => void runAction(() => handleExtendSubscription(sub))} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100">Cộng 30 ngày</button>}
                          {sub.status === "ACTIVE" && <button type="button" onClick={() => void runAction(() => handleCancelSubscription(sub))} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">Thu hồi quyền</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}
          </>
        )}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingPlan.id ? "Chỉnh sửa gói học" : "Tạo gói học"}
              </h3>
              <button type="button" onClick={() => setEditingPlan(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mã gói học *</label>
                  <input
                    type="text"
                    value={editingPlan.code || ""}
                    readOnly
                    placeholder="Tự tạo từ tên gói học"
                    className="h-9 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-500 outline-none"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">Mã được tự tạo từ tên gói và không thể chỉnh sửa.</p>
                  {fieldErrors.code ? <p role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.code}</p> : null}
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nhãn Badge (tùy chọn)</label>
                  <input
                    type="text"
                    value={editingPlan.badgeTag || ""}
                    onChange={(e) => setEditingPlan({ ...editingPlan, badgeTag: e.target.value })}
                    placeholder="Tiết kiệm 30%"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tên gói học *</label>
                <input
                  type="text"
                  value={editingPlan.name || ""}
                  onChange={(e) => { const name = e.target.value; setEditingPlan({ ...editingPlan, name, ...(editingPlan.id ? {} : { code: generatePlanCode(name, plans) }) }); clearFieldError("name"); }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "plan-name-error" : undefined}
                  placeholder="Gói TOEIC VIP 3 Tháng"
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none focus:border-blue-500 ${fieldErrors.name ? "border-red-400" : "border-slate-200"}`}
                />
                {fieldErrors.name ? <p id="plan-name-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.name}</p> : null}
              </div>

              <fieldset>
                <legend className="mb-2 font-bold text-slate-800">Nhóm gói học</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([
                    ["FREE", "Free", "Gói cơ bản, thường giữ ổn định; vẫn có thể cập nhật khi cần."],
                    ["PRO", "Pro", "Gói nâng cao, quyền học và thời hạn có thể cấu hình."],
                    ["PREMIUM", "Premium", "Gói cao cấp, quyền học có thể cấu hình."],
                    ["PROMOTION", "Ưu đãi", "Gói theo chương trình, có thời gian phát hành riêng."],
                  ] as const).map(([category, title, description]) => <label key={category} className={`flex cursor-pointer gap-2.5 rounded-xl border p-3 transition ${editingPlan.planCategory === category ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="planCategory" value={category} checked={editingPlan.planCategory === category} onChange={() => setEditingPlan({ ...editingPlan, planCategory: category, offerStartsAt: category === "PROMOTION" ? editingPlan.offerStartsAt ?? null : null, offerEndsAt: category === "PROMOTION" ? editingPlan.offerEndsAt ?? null : null })} className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span><span className="block text-xs font-semibold text-slate-900">{title}</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{description}</span></span>
                  </label>)}
                </div>
                {editingPlan.planCategory === "PROMOTION" ? <p className="mt-2 text-[11px] leading-4 text-violet-700">Thời gian phát hành chỉ quyết định khi nào được mua; thời hạn sử dụng tính từ lúc mua thành công.</p> : null}
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPlan.originalPrice ?? 0}
                    onChange={(e) => { const originalPrice = Number(e.target.value); setEditingPlan({ ...editingPlan, originalPrice, promotionalPrice: calculatePromotionalPrice(originalPrice, discountPercent) }); clearFieldError("originalPrice"); clearFieldError("discountPercent"); }}
                    aria-invalid={Boolean(fieldErrors.originalPrice)}
                    aria-describedby={fieldErrors.originalPrice ? "plan-original-price-error" : undefined}
                    className={`h-9 w-full rounded-xl border px-3 text-xs outline-none focus:border-blue-500 font-mono ${fieldErrors.originalPrice ? "border-red-400" : "border-slate-200"}`}
                  />
                  {fieldErrors.originalPrice ? <p id="plan-original-price-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.originalPrice}</p> : null}
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phần trăm giảm giá</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.00000001"
                      value={discountPercent}
                      onChange={(e) => { const nextPercent = Number(e.target.value); setDiscountPercent(nextPercent); setEditingPlan({ ...editingPlan, promotionalPrice: calculatePromotionalPrice(Number(editingPlan.originalPrice ?? 0), nextPercent) }); clearFieldError("discountPercent"); }}
                      aria-invalid={Boolean(fieldErrors.discountPercent)}
                      aria-describedby={fieldErrors.discountPercent ? "plan-discount-error" : undefined}
                      className={`h-9 w-full rounded-xl border px-3 pr-9 text-xs outline-none focus:border-blue-500 font-mono text-blue-700 font-bold ${fieldErrors.discountPercent ? "border-red-400" : "border-slate-200"}`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                  </div>
                  {fieldErrors.discountPercent ? <p id="plan-discount-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.discountPercent}</p> : null}
                  <p className="mt-2 text-xs text-slate-600">Giá sau giảm: <strong className="font-mono text-sm text-blue-700">{formatVnd(calculatePromotionalPrice(Number(editingPlan.originalPrice ?? 0), discountPercent))}</strong></p>
                </div>
              </div>

              {editingPlan.planCategory === "PROMOTION" ? <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="mb-1 block font-bold text-slate-800">Bắt đầu phát hành *</label><input type="datetime-local" aria-invalid={Boolean(fieldErrors.offerStartsAt)} aria-describedby={fieldErrors.offerStartsAt ? "plan-offer-start-error" : undefined} value={formatDateTimeLocal(editingPlan.offerStartsAt)} onChange={(e) => { setEditingPlan({ ...editingPlan, offerStartsAt: dateTimeLocalToIso(e.target.value) }); clearFieldError("offerStartsAt"); }} className={`h-9 w-full rounded-xl border px-3 text-xs outline-none focus:border-blue-500 ${fieldErrors.offerStartsAt ? "border-red-400" : "border-slate-200"}`} />{fieldErrors.offerStartsAt ? <p id="plan-offer-start-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.offerStartsAt}</p> : null}</div>
                <div><label className="mb-1 block font-bold text-slate-800">Kết thúc phát hành *</label><input type="datetime-local" aria-invalid={Boolean(fieldErrors.offerEndsAt)} aria-describedby={fieldErrors.offerEndsAt ? "plan-offer-end-error" : undefined} value={formatDateTimeLocal(editingPlan.offerEndsAt)} onChange={(e) => { setEditingPlan({ ...editingPlan, offerEndsAt: dateTimeLocalToIso(e.target.value) }); clearFieldError("offerEndsAt"); }} className={`h-9 w-full rounded-xl border px-3 text-xs outline-none focus:border-blue-500 ${fieldErrors.offerEndsAt ? "border-red-400" : "border-slate-200"}`} />{fieldErrors.offerEndsAt ? <p id="plan-offer-end-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.offerEndsAt}</p> : null}</div>
              </div> : null}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Thời hạn sử dụng (ngày){editingPlan.billingCycle === "LIFETIME" ? " — không hết hạn" : " *"}</label>
                <input
                  type="number"
                  min={editingPlan.billingCycle === "LIFETIME" ? 0 : 1}
                  disabled={editingPlan.billingCycle === "LIFETIME"}
                  value={editingPlan.billingCycle === "LIFETIME" ? 0 : editingPlan.durationDays ?? 1}
                  onChange={(e) => { setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) }); clearFieldError("durationDays"); }}
                  aria-invalid={Boolean(fieldErrors.durationDays)}
                  aria-describedby={fieldErrors.durationDays ? "plan-duration-error" : undefined}
                  className={`h-9 w-full rounded-xl border px-3 text-xs outline-none focus:border-blue-500 disabled:bg-slate-100 ${fieldErrors.durationDays ? "border-red-400" : "border-slate-200"}`}
                />
                {fieldErrors.durationDays ? <p id="plan-duration-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.durationDays}</p> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Cách tính thời hạn</label>
                  <select
                    value={editingPlan.billingCycle || "QUARTERLY"}
                    onChange={(e) => {
                      const billingCycle = e.target.value as SubscriptionBillingCycle;
                      setEditingPlan({ ...editingPlan, billingCycle, durationDays: billingCycle === "LIFETIME" ? 0 : billingCycle === "MONTHLY" ? 30 : billingCycle === "QUARTERLY" ? 90 : 365 });
                    }}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="MONTHLY">30 ngày</option>
                    <option value="QUARTERLY">90 ngày</option>
                    <option value="YEARLY">365 ngày</option>
                    <option value="LIFETIME">Không hết hạn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Quyền sử dụng AI Gemini</label>
                  <select
                    value={editingPlan.aiAccessMode || "DISABLED"}
                    onChange={(e) => {
                      const aiAccessMode = e.target.value as AiAccessMode;
                      setEditingPlan({ ...editingPlan, aiAccessMode, maxAiQueriesPerDay: aiAccessMode === "LIMITED" ? Math.max(1, Number(editingPlan.maxAiQueriesPerDay ?? 0)) : editingPlan.maxAiQueriesPerDay ?? 0 });
                      clearFieldError("maxAiQueriesPerDay");
                    }}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="DISABLED">Không được sử dụng AI</option>
                    <option value="LIMITED">Có giới hạn lượt dùng mỗi ngày</option>
                    <option value="UNLIMITED">Không giới hạn lượt dùng</option>
                  </select>
                  {editingPlan.aiAccessMode === "LIMITED" ? (
                    <div className="mt-3">
                      <label htmlFor="plan-ai-limit" className="mb-1 block font-bold text-slate-800">Số lượt AI tối đa mỗi ngày</label>
                      <input
                        id="plan-ai-limit"
                        type="number"
                        min={1}
                        value={editingPlan.maxAiQueriesPerDay ?? 1}
                        onChange={(e) => { setEditingPlan({ ...editingPlan, maxAiQueriesPerDay: Number(e.target.value) }); clearFieldError("maxAiQueriesPerDay"); }}
                        aria-invalid={Boolean(fieldErrors.maxAiQueriesPerDay)}
                        aria-describedby={fieldErrors.maxAiQueriesPerDay ? "plan-ai-limit-error" : undefined}
                        className={`h-9 w-full rounded-xl border px-3 text-xs font-mono outline-none focus:border-blue-500 ${fieldErrors.maxAiQueriesPerDay ? "border-red-400" : "border-slate-200"}`}
                      />
                      {fieldErrors.maxAiQueriesPerDay ? <p id="plan-ai-limit-error" role="alert" className="mt-1.5 text-[11px] text-red-600">{fieldErrors.maxAiQueriesPerDay}</p> : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 font-bold text-slate-800">Quyền học được mở</legend>
                <p className="mb-3 text-[11px] leading-4 text-slate-500">Danh sách lấy từ các mục học viên. Trạng thái “Đang phát triển” cho biết mục học chưa được hoàn thiện ở khu vực học viên.</p>
                <div className="h-56 space-y-2 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 p-3">
                  {LEARNING_CAPABILITIES.map((capability) => <label key={capability.key} className="flex cursor-pointer items-start justify-between gap-3 rounded-lg p-2 hover:bg-slate-50">
                    <span className="flex items-start gap-2.5"><input type="checkbox" checked={(editingPlan.capabilityKeys ?? []).includes(capability.key)} onChange={(e) => { const current = editingPlan.capabilityKeys ?? []; setEditingPlan({ ...editingPlan, capabilityKeys: e.target.checked ? [...current, capability.key] : current.filter((key) => key !== capability.key) }); }} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600" /><span><span className="block text-xs font-semibold text-slate-800">{capability.label}</span><span className="mt-0.5 block text-[11px] text-slate-500">{capability.description}</span></span></span>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">{capability.availability === "IN_DEVELOPMENT" ? "Đang phát triển" : "Đang hoạt động"}</span>
                  </label>)}
                </div>
              </fieldset>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPlan.isPopular)}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Đánh dấu là gói &quot;Phổ biến nhất&quot;
                </label>

                <label className="flex items-center gap-2 font-semibold text-slate-700">
                  Trạng thái
                  <select value={editingPlan.status || "DRAFT"} onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value as SubscriptionPlanStatus })} className="h-9 rounded-lg border border-slate-200 bg-white px-2">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="ACTIVE">Đang phát hành</option>
                    <option value="ARCHIVED">Đã lưu trữ</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setEditingPlan(null)} className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                  Hủy
                </button>
                <button type="button" onClick={() => void runPlanSave()} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  {editingPlan.id ? "Lưu thay đổi" : "Tạo gói học"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Xóa gói học?</h3>
            <p className="mt-2 text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa gói <span className="font-bold text-slate-900">&quot;{deletingPlan.name}&quot;</span>?
            </p>
            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setDeletingPlan(null)} className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                Hủy
              </button>
              <button type="button" onClick={() => void runAction(handleDeletePlanConfirm)} className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
