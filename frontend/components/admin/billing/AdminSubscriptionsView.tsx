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
import {
  getSubscriptionPlans,
  getLearningFeatures,
  getUserSubscriptions,
  createSubscriptionPlan,
  createSubscriptionPlanReplacingActive,
  updateSubscriptionPlan,
  updateSubscriptionPlanReplacingActive,
  deleteSubscriptionPlan,
  cancelUserSubscription,
  extendUserSubscription,
  type PlanInput,
  type LearningPlanCategory,
  type LearningFeature,
  type PlanEntitlement,
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

type PlanField = "code" | "name" | "badgeTag" | "originalPrice" | "discountPercent" | "durationDays" | "offerStartsAt" | "offerEndsAt" | "planCategory";
const planCategoryLabels: Record<LearningPlanCategory, string> = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
  PROMOTION: "Ưu đãi",
};

export function AdminSubscriptionsView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>([]);
  const [featureCatalog, setFeatureCatalog] = useState<LearningFeature[]>([]);
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
  const [featureErrors, setFeatureErrors] = useState<Record<string, string>>({});
  const [confirmPlanReplacement, setConfirmPlanReplacement] = useState(false);
  const [pendingPlanActivation, setPendingPlanActivation] = useState<SubscriptionPlan | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
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
      const [plansData, subsData, featuresData] = await Promise.all([
        getSubscriptionPlans(),
        getUserSubscriptions(),
        getLearningFeatures(),
      ]);
      setPlans(plansData);
      setUserSubs(subsData);
      setFeatureCatalog(featuresData);
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
    const matchesSearch = !query || [plan.name, plan.code, plan.badgeTag ?? "", ...Object.entries(plan.entitlements ?? {})
      .filter(([, entitlement]) => entitlement.enabled)
      .map(([key]) => featureCatalog.find((item) => item.key === key)?.name ?? key)]
      .some((value) => value.toLocaleLowerCase("vi-VN").includes(query));
    return matchesSearch && (planStatusFilter === "ALL" || plan.status === planStatusFilter)
      && (planCategoryFilter === "ALL" || plan.planCategory === planCategoryFilter);
  });
  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagePlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const conflictingActivePlan = editingPlan?.planCategory
    ? plans.find((plan) => plan.planCategory === editingPlan.planCategory
      && plan.status === "ACTIVE"
      && plan.id !== editingPlan.id)
    : undefined;
  const activeCategoryWarning = conflictingActivePlan
    ? `Đã có gói ${planCategoryLabels[conflictingActivePlan.planCategory]} "${conflictingActivePlan.name}" đang phát hành. Chuyển gói hiện tại sang bản nháp hoặc lưu trữ trước khi phát hành gói này.`
    : "";
  const pendingActivationConflict = pendingPlanActivation
    ? plans.find((plan) => plan.id !== pendingPlanActivation.id
      && plan.planCategory === pendingPlanActivation.planCategory
      && plan.status === "ACTIVE")
    : undefined;

  function openCreatePlanModal() {
    setErrorMsg("");
    setFieldErrors({});
    setFeatureErrors({});
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
      entitlements: Object.fromEntries(featureCatalog.map((feature) => [feature.key, {
        enabled: false,
        limit: feature.controlType === "METERED" ? 1 : null,
        unit: feature.allowedUnits[0] ?? null,
        period: feature.allowedPeriods.includes("DAY") ? "DAY" : feature.allowedPeriods[0] ?? null,
        config: {},
      }])),
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
    setFeatureErrors({});
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
    const badgeTag = plan.badgeTag?.trim() ?? "";

    if (!code) errors.code = "Vui lòng nhập mã gói học.";
    else if (code.length > 80 || !/^[A-Za-z0-9_-]+$/.test(code)) errors.code = "Mã chỉ gồm chữ không dấu, số, dấu gạch ngang hoặc gạch dưới (tối đa 80 ký tự).";
    if (!name) errors.name = "Vui lòng nhập tên gói học.";
    else if (name.length > 160) errors.name = "Tên gói học không được vượt quá 160 ký tự.";
    if (badgeTag.length > 100) errors.badgeTag = "Nhãn Badge không được vượt quá 100 ký tự.";
    if (!Number.isInteger(originalPrice) || originalPrice < 0) errors.originalPrice = "Giá gốc phải là số nguyên từ 0 trở lên.";
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) errors.discountPercent = "Phần trăm giảm giá phải từ 0% đến 100%.";
    if (!Number.isInteger(promotionalPrice) || promotionalPrice < 0) errors.discountPercent = "Không tính được giá sau giảm hợp lệ.";
    if (plan.billingCycle !== "LIFETIME" && (!Number.isInteger(durationDays) || durationDays < 1)) errors.durationDays = "Thời hạn sử dụng phải từ 1 ngày trở lên.";
    if (plan.planCategory === "PROMOTION") {
      if (!plan.offerStartsAt) errors.offerStartsAt = "Vui lòng chọn thời điểm bắt đầu phát hành.";
      if (!plan.offerEndsAt) errors.offerEndsAt = "Vui lòng chọn thời điểm kết thúc phát hành.";
      if (plan.offerStartsAt && plan.offerEndsAt && new Date(plan.offerStartsAt) >= new Date(plan.offerEndsAt)) {
        errors.offerEndsAt = "Thời điểm kết thúc phải sau thời điểm bắt đầu.";
      }
    }
    const nextFeatureErrors: Record<string, string> = {};
    for (const [key, entitlement] of Object.entries(plan.entitlements ?? {})) {
      const feature = featureCatalog.find((item) => item.key === key);
      if (!feature) continue;
      const prefix = `${key}.`;
      if (feature.controlType === "METERED") {
        if (entitlement.enabled && entitlement.limit !== null
          && (!Number.isInteger(entitlement.limit) || entitlement.limit < 1)) {
          nextFeatureErrors[`${prefix}limit`] = key === "READING_AI_ASK"
            ? "Hạn mức của Hỏi AI về Reading phải lớn hơn 0 hoặc để trống để không giới hạn."
            : `Hạn mức của ${feature.name} phải lớn hơn 0 hoặc để trống để không giới hạn.`;
        }
        if (entitlement.unit !== null && !feature.allowedUnits.includes(entitlement.unit)) {
          nextFeatureErrors[`${prefix}unit`] = `Đơn vị hạn mức không hợp lệ cho ${feature.name}.`;
        }
        if (entitlement.period !== null && !feature.allowedPeriods.includes(entitlement.period)) {
          nextFeatureErrors[`${prefix}period`] = `Chu kỳ hạn mức không hợp lệ cho ${feature.name}.`;
        }
        if (entitlement.enabled && (entitlement.unit === null || entitlement.period === null)) {
          if (entitlement.unit === null) nextFeatureErrors[`${prefix}unit`] = `Vui lòng chọn đơn vị cho ${feature.name}.`;
          if (entitlement.period === null) nextFeatureErrors[`${prefix}period`] = `Vui lòng chọn chu kỳ cho ${feature.name}.`;
        }
      } else if (entitlement.limit !== null || entitlement.unit !== null || entitlement.period !== null) {
        nextFeatureErrors[`${prefix}settings`] = `${feature.name} chỉ hỗ trợ bật hoặc tắt.`;
      }

      const config = entitlement.config ?? {};
      const fields = new Map(feature.configFields.map((field) => [field.key, field]));
      for (const configKey of Object.keys(config)) {
        if (!fields.has(configKey)) {
          nextFeatureErrors[`${prefix}config.${configKey}`] = `Tham số ${configKey} không được hỗ trợ bởi ${feature.name}.`;
        }
      }
      for (const field of feature.configFields) {
        const value = config[field.key];
        const errorKey = `${prefix}config.${field.key}`;
        if (value === undefined || value === null) {
          if (entitlement.enabled && field.required) {
            nextFeatureErrors[errorKey] = `Vui lòng nhập ${field.label} của ${feature.name}.`;
          }
          continue;
        }
        if (value === "" && entitlement.enabled && field.required) {
          nextFeatureErrors[errorKey] = `Vui lòng nhập ${field.label} của ${feature.name}.`;
          continue;
        }
        const valid = field.type === "STRING" ? typeof value === "string"
          : field.type === "INTEGER" ? typeof value === "number" && Number.isInteger(value)
            : field.type === "NUMBER" ? typeof value === "number" && Number.isFinite(value)
              : field.type === "BOOLEAN" ? typeof value === "boolean"
                : field.type === "SELECT" ? typeof value === "string" && field.options.includes(value)
                  : false;
        if (!valid) nextFeatureErrors[errorKey] = `Giá trị ${field.label} không hợp lệ.`;
      }
    }

    setFieldErrors(errors);
    setFeatureErrors(nextFeatureErrors);
    return Object.keys(errors).length === 0 && Object.keys(nextFeatureErrors).length === 0;
  }

  function clearFieldError(field: PlanField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function clearFeatureError(key: string) {
    setFeatureErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSavePlan(replaceActive = false) {
    if (!editingPlan) return;
    if (!replaceActive && editingPlan.status === "ACTIVE" && conflictingActivePlan) {
      setConfirmPlanReplacement(true);
      return;
    }
    if (!validatePlan(editingPlan)) {
      if (replaceActive) setConfirmPlanReplacement(false);
      return;
    }

    let nextList: SubscriptionPlan[];
    if (editingPlan.id) {
      const payload = toPlanInput(editingPlan);
      const saved = replaceActive
        ? await updateSubscriptionPlanReplacingActive(editingPlan.id, payload)
        : await updateSubscriptionPlan(editingPlan.id, payload);
      nextList = plans.map((p) => p.id === saved.id ? saved : p);
      showFeedback(`Đã cập nhật gói học "${saved.name}"`);
    } else {
      const payload = toPlanInput(editingPlan);
      const newPlan = replaceActive
        ? await createSubscriptionPlanReplacingActive(payload)
        : await createSubscriptionPlan(payload);
      nextList = [...plans, newPlan];
      showFeedback(`Đã tạo gói học "${newPlan.name}"`);
    }

    setPlans(nextList);
    setConfirmPlanReplacement(false);
    setEditingPlan(null);
    await loadData();
  }

  async function togglePlanStatus(plan: SubscriptionPlan) {
    const nextStatus: SubscriptionPlanStatus = plan.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    const conflictingPlan = plans.find((existingPlan) =>
      existingPlan.id !== plan.id
      && existingPlan.planCategory === plan.planCategory
      && existingPlan.status === "ACTIVE");
    if (nextStatus === "ACTIVE" && conflictingPlan) {
      setPendingPlanActivation(plan);
      return;
    }
    const updated = await updateSubscriptionPlan(plan.id, toPlanInput({ ...plan, status: nextStatus }));
    setPlans(plans.map((p) => p.id === plan.id ? updated : p));
    showFeedback(nextStatus === "ACTIVE" ? "Đã phát hành gói học" : "Đã tạm dừng gói học");
  }

  async function confirmPlanActivation() {
    if (!pendingPlanActivation) return;
    setErrorMsg("");
    setIsSavingPlan(true);
    try {
      const updated = await updateSubscriptionPlanReplacingActive(
        pendingPlanActivation.id,
        toPlanInput({ ...pendingPlanActivation, status: "ACTIVE" }),
      );
      setPlans((current) => current.map((plan) => plan.id === updated.id
        ? updated
        : plan.planCategory === updated.planCategory && plan.status === "ACTIVE"
          ? { ...plan, status: "DRAFT" }
          : plan));
      showFeedback(`Đã tạm dừng gói cùng nhóm và kích hoạt "${updated.name}".`);
      setPendingPlanActivation(null);
      await loadData();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Không thể kích hoạt gói học.");
    } finally {
      setIsSavingPlan(false);
    }
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
    const entitlements = plan.entitlements ?? {};
    const enabledCapabilityKeys = Object.entries(entitlements)
      .filter(([key, entitlement]) => entitlement.enabled && featureCatalog.find((feature) => feature.key === key)?.category.toUpperCase() !== "AI")
      .map(([key]) => key);
    const aiEntitlement = entitlements.AI_ASSISTANT;
    const legacyAiMode = !aiEntitlement?.enabled
      ? "DISABLED"
      : aiEntitlement.limit == null || aiEntitlement.period !== "DAY" || aiEntitlement.unit !== "requests"
        ? "UNLIMITED"
        : "LIMITED";
    return {
      code: plan.code?.trim() || "",
      name: plan.name?.trim() || "",
      originalPrice: Number(plan.originalPrice ?? 0),
      promotionalPrice: Number(plan.promotionalPrice ?? 0),
      billingCycle: plan.billingCycle || "QUARTERLY",
      durationDays: Number(plan.durationDays ?? 90),
      badgeTag: plan.badgeTag || "",
      isPopular: Boolean(plan.isPopular),
      features: plan.features ?? [],
      capabilityKeys: enabledCapabilityKeys,
      maxAiQueriesPerDay: legacyAiMode === "LIMITED" ? Number(aiEntitlement.limit) : 0,
      aiAccessMode: legacyAiMode,
      status: plan.status || "DRAFT",
      planCategory: plan.planCategory || "PRO",
      offerStartsAt: plan.planCategory === "PROMOTION" ? plan.offerStartsAt ?? null : null,
      offerEndsAt: plan.planCategory === "PROMOTION" ? plan.offerEndsAt ?? null : null,
      entitlements,
    };
  }

  function updateFeatureEntitlement(key: string, updates: Partial<PlanEntitlement>) {
    if (!editingPlan) return;
    const feature = featureCatalog.find((item) => item.key === key);
    const current = editingPlan.entitlements?.[key] ?? {
      enabled: false,
      limit: feature?.controlType === "METERED" ? 1 : null,
      unit: feature?.allowedUnits[0] ?? null,
      period: feature?.allowedPeriods.includes("DAY") ? "DAY" : feature?.allowedPeriods[0] ?? null,
      config: {},
    };
    setEditingPlan({
      ...editingPlan,
      entitlements: {
        ...editingPlan.entitlements,
        [key]: { ...current, ...updates },
      },
    });
  }

  function setAllFeatureEntitlements(enabled: boolean) {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      entitlements: {
        ...editingPlan.entitlements,
        ...Object.fromEntries(featureCatalog.map((feature) => {
          const current = editingPlan.entitlements?.[feature.key] ?? {
            enabled: false,
            limit: feature.controlType === "METERED" ? 1 : null,
            unit: feature.allowedUnits[0] ?? null,
            period: feature.allowedPeriods.includes("DAY") ? "DAY" : feature.allowedPeriods[0] ?? null,
            config: {},
          };
          return [feature.key, { ...current, enabled }];
        })),
      },
    });
    setFeatureErrors({});
  }

  function updateFeatureConfig(key: string, field: string, value: string | number | boolean | undefined) {
    if (!editingPlan) return;
    const current = editingPlan.entitlements?.[key] ?? {
      enabled: false,
      limit: null,
      unit: null,
      period: null,
      config: {},
    };
    const config = { ...current.config };
    if (value === undefined) delete config[field];
    else config[field] = value;
    updateFeatureEntitlement(key, { config });
    clearFeatureError(`${key}.config.${field}`);
  }

  async function runAction(action: () => Promise<void>) {
    setErrorMsg("");
    try { await action(); }
    catch (error) { setErrorMsg(error instanceof Error ? error.message : "Thao tác chưa thể hoàn tất."); }
  }

  async function runPlanSave(replaceActive = false) {
    setErrorMsg("");
    setIsSavingPlan(true);
    try {
      await handleSavePlan(replaceActive);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu gói học.";
      if (/mã gói/i.test(message)) setFieldErrors((current) => ({ ...current, code: message }));
      else if (/thời hạn/i.test(message)) setFieldErrors((current) => ({ ...current, durationDays: message }));
      else if (/giá/i.test(message)) setFieldErrors((current) => ({ ...current, discountPercent: message }));
      else if (/đã có.*đang phát hành|gói.*đang phát hành/i.test(message)) setFieldErrors((current) => ({ ...current, planCategory: message }));
      else if (/phát hành|ưu đãi/i.test(message)) setFieldErrors((current) => ({ ...current, offerEndsAt: message }));
      else setErrorMsg(message);
    } finally {
      setIsSavingPlan(false);
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
          {activeTab === "PLANS" ? <>
            <button type="button" onClick={openCreatePlanModal} className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"><span aria-hidden="true">+</span>Tạo gói học</button>
          </> : null}
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
                        <td className="px-4 py-4"><ul className="max-w-xs space-y-1 text-xs text-slate-600">{Object.entries(plan.entitlements ?? {}).filter(([, entitlement]) => entitlement.enabled).slice(0, 3).map(([key, entitlement]) => { const item = featureCatalog.find((feature) => feature.key === key); const usage = entitlement.limit == null ? "" : ` · ${entitlement.limit} ${entitlement.unit ?? ""}/${entitlement.period ?? ""}`; return <li key={`${plan.id}-${key}`} className="flex gap-1.5"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" /><span className="line-clamp-2">{item?.name ?? key}{usage}</span></li>; })}</ul>{Object.values(plan.entitlements ?? {}).filter((entitlement) => entitlement.enabled).length > 3 ? <span className="mt-1 block text-[11px] text-slate-400">+{Object.values(plan.entitlements ?? {}).filter((entitlement) => entitlement.enabled).length - 3} quyền lợi khác</span> : null}{Object.values(plan.entitlements ?? {}).every((entitlement) => !entitlement.enabled) ? <span className="text-xs text-slate-400">Chưa cấp quyền lợi</span> : null}</td>
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
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingPlan.id ? "Chỉnh sửa gói học" : "Tạo gói học"}
              </h3>
              <button type="button" onClick={() => setEditingPlan(null)} disabled={isSavingPlan} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-xs">
              {errorMsg ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800">{errorMsg}</div> : null}
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
                    maxLength={100}
                    value={editingPlan.badgeTag || ""}
                    onChange={(e) => { setEditingPlan({ ...editingPlan, badgeTag: e.target.value }); clearFieldError("badgeTag"); }}
                    aria-invalid={Boolean(fieldErrors.badgeTag)}
                    aria-describedby={fieldErrors.badgeTag ? "plan-badge-error" : undefined}
                    placeholder="Tiết kiệm 30%"
                    className={`h-9 w-full rounded-xl border px-3 text-xs outline-none focus:border-blue-500 ${fieldErrors.badgeTag ? "border-red-400" : "border-slate-200"}`}
                  />
                  <p id="plan-badge-error" role={fieldErrors.badgeTag ? "alert" : undefined} className="mt-1.5 min-h-4 text-[11px] text-red-600">{fieldErrors.badgeTag ?? ""}</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tên gói học *</label>
                <input
                  type="text"
                  value={editingPlan.name || ""}
                  maxLength={160}
                  onChange={(e) => { const name = e.target.value; setEditingPlan({ ...editingPlan, name, ...(editingPlan.id ? {} : { code: generatePlanCode(name, plans) }) }); clearFieldError("name"); clearFieldError("code"); }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "plan-name-error" : undefined}
                  placeholder="Gói TOEIC VIP 3 Tháng"
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-slate-800 outline-none focus:border-blue-500 ${fieldErrors.name ? "border-red-400" : "border-slate-200"}`}
                />
                <p id="plan-name-error" role={fieldErrors.name ? "alert" : undefined} className="mt-1.5 min-h-4 text-[11px] text-red-600">{fieldErrors.name ?? ""}</p>
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
                    <input type="radio" name="planCategory" value={category} checked={editingPlan.planCategory === category} onChange={() => { setEditingPlan({ ...editingPlan, planCategory: category, offerStartsAt: category === "PROMOTION" ? editingPlan.offerStartsAt ?? null : null, offerEndsAt: category === "PROMOTION" ? editingPlan.offerEndsAt ?? null : null }); clearFieldError("offerStartsAt"); clearFieldError("offerEndsAt"); clearFieldError("planCategory"); }} className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <span><span className="block text-xs font-semibold text-slate-900">{title}</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{description}</span></span>
                  </label>)}
                </div>
                {editingPlan.planCategory === "PROMOTION" ? <p className="mt-2 text-[11px] leading-4 text-violet-700">Thời gian phát hành chỉ quyết định khi nào được mua; thời hạn sử dụng tính từ lúc mua thành công.</p> : null}
                {activeCategoryWarning ? <p role="status" className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800">{activeCategoryWarning}</p> : null}
                {fieldErrors.planCategory ? <p role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-4 text-red-700">{fieldErrors.planCategory}</p> : null}
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
                      clearFieldError("durationDays");
                    }}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="MONTHLY">30 ngày</option>
                    <option value="QUARTERLY">90 ngày</option>
                    <option value="YEARLY">365 ngày</option>
                    <option value="LIFETIME">Không hết hạn</option>
                  </select>
                </div>

              </div>

              <fieldset>
                <legend className="mb-2 font-bold text-slate-800">Quyền lợi theo chức năng học viên</legend>
                <p className="mb-3 text-[11px] leading-4 text-slate-500">Danh sách lấy từ các chức năng đã đăng ký trong ứng dụng; Admin chỉ bật/tắt và đặt hạn mức. Tính năng chưa sẵn sàng không thể sử dụng dù đã cấu hình ở đây.</p>
                <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={featureCatalog.length > 0 && featureCatalog.every((feature) => editingPlan.entitlements?.[feature.key]?.enabled)}
                    ref={(element) => {
                      if (element) {
                        const selectedCount = featureCatalog.filter((feature) => editingPlan.entitlements?.[feature.key]?.enabled).length;
                        element.indeterminate = selectedCount > 0 && selectedCount < featureCatalog.length;
                      }
                    }}
                    onChange={(event) => setAllFeatureEntitlements(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Chọn tất cả quyền lợi
                </label>
                <div className="max-h-[28rem] space-y-3 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 p-3">
                  {featureCatalog.map((feature) => {
                    const parentFeature = feature.parentFeatureKey
                      ? featureCatalog.find((item) => item.key === feature.parentFeatureKey)
                      : null;
                    const parentEntitlement = parentFeature
                      ? editingPlan.entitlements?.[parentFeature.key]
                      : null;
                    const entitlement = editingPlan.entitlements?.[feature.key] ?? {
                      enabled: false,
                      limit: feature.controlType === "METERED" ? 1 : null,
                      unit: feature.allowedUnits[0] ?? null,
                      period: feature.allowedPeriods.includes("DAY") ? "DAY" : feature.allowedPeriods[0] ?? null,
                      config: {},
                    };
                    const statusLabel = {
                      AVAILABLE: "Sẵn sàng",
                      IN_DEVELOPMENT: "Đang phát triển",
                      PLANNED: "Đã lên kế hoạch",
                      DISABLED: "Đã vô hiệu hóa",
                    }[feature.lifecycleStatus];
                    return (
                      <div key={feature.key} className={`rounded-lg border border-slate-100 p-3 ${parentFeature ? "ml-4 border-l-2 border-l-blue-100" : ""}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <label className="flex min-w-0 items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={entitlement.enabled}
                              onChange={(event) => {
                                updateFeatureEntitlement(feature.key, { enabled: event.target.checked });
                                clearFeatureError(`${feature.key}.settings`);
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                            <span>
                              <span className="block text-xs font-semibold text-slate-800">{feature.name}</span>
                              <span className="mt-0.5 block text-[11px] text-slate-500">{feature.description}</span>
                              {parentFeature ? <span className="mt-1 block text-[10px] font-medium text-blue-700">Thuộc nhóm {parentFeature.name}</span> : null}
                              {parentFeature && entitlement.enabled && !parentEntitlement?.enabled
                                ? <span className="mt-1 block text-[10px] font-medium text-amber-700">Cần bật quyền {parentFeature.name} để học viên sử dụng chức năng này.</span>
                                : null}
                            </span>
                          </label>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${feature.lifecycleStatus === "AVAILABLE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {statusLabel}
                          </span>
                        </div>
                        {featureErrors[`${feature.key}.settings`] ? <p role="alert" className="mt-2 text-[11px] text-red-600">{featureErrors[`${feature.key}.settings`]}</p> : null}
                        {feature.controlType === "METERED" ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            <div className="flex min-w-0 flex-col">
                              <label htmlFor={`feature-${feature.key}-limit`} className="min-h-8 text-[11px] font-semibold text-slate-600">
                                Hạn mức <span className="font-normal">(để trống = không giới hạn)</span>
                              </label>
                              <input
                                id={`feature-${feature.key}-limit`}
                                type="number"
                                min={1}
                                value={entitlement.limit ?? ""}
                                onChange={(event) => {
                                  updateFeatureEntitlement(feature.key, {
                                    limit: event.target.value === "" ? null : event.target.valueAsNumber,
                                  });
                                  clearFeatureError(`${feature.key}.limit`);
                                }}
                                aria-invalid={Boolean(featureErrors[`${feature.key}.limit`])}
                                aria-describedby={`feature-${feature.key}-limit-error`}
                                className={`h-9 w-full rounded-lg border px-2 text-xs font-normal ${featureErrors[`${feature.key}.limit`] ? "border-red-400" : "border-slate-200"}`}
                              />
                              <p id={`feature-${feature.key}-limit-error`} role={featureErrors[`${feature.key}.limit`] ? "alert" : undefined} className="mt-1 min-h-8 text-[11px] leading-4 text-red-600">
                                {featureErrors[`${feature.key}.limit`] ?? ""}
                              </p>
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <label htmlFor={`feature-${feature.key}-unit`} className="min-h-8 text-[11px] font-semibold text-slate-600">Đơn vị</label>
                              <select
                                id={`feature-${feature.key}-unit`}
                                value={entitlement.unit ?? ""}
                                onChange={(event) => {
                                  updateFeatureEntitlement(feature.key, { unit: event.target.value || null });
                                  clearFeatureError(`${feature.key}.unit`);
                                }}
                                aria-invalid={Boolean(featureErrors[`${feature.key}.unit`])}
                                aria-describedby={`feature-${feature.key}-unit-error`}
                                className={`h-9 w-full rounded-lg border bg-white px-2 text-xs font-normal ${featureErrors[`${feature.key}.unit`] ? "border-red-400" : "border-slate-200"}`}
                              >
                                <option value="">Chọn đơn vị</option>
                                {feature.allowedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                              </select>
                              <p id={`feature-${feature.key}-unit-error`} role={featureErrors[`${feature.key}.unit`] ? "alert" : undefined} className="mt-1 min-h-8 text-[11px] leading-4 text-red-600">
                                {featureErrors[`${feature.key}.unit`] ?? ""}
                              </p>
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <label htmlFor={`feature-${feature.key}-period`} className="min-h-8 text-[11px] font-semibold text-slate-600">Chu kỳ</label>
                              <select
                                id={`feature-${feature.key}-period`}
                                value={entitlement.period ?? ""}
                                onChange={(event) => {
                                  updateFeatureEntitlement(feature.key, { period: (event.target.value || null) as PlanEntitlement["period"] });
                                  clearFeatureError(`${feature.key}.period`);
                                }}
                                aria-invalid={Boolean(featureErrors[`${feature.key}.period`])}
                                aria-describedby={`feature-${feature.key}-period-error`}
                                className={`h-9 w-full rounded-lg border bg-white px-2 text-xs font-normal ${featureErrors[`${feature.key}.period`] ? "border-red-400" : "border-slate-200"}`}
                              >
                                <option value="">Chọn chu kỳ</option>
                                {feature.allowedPeriods.map((period) => <option key={period} value={period}>
                                  {period === "DAY" ? "Ngày" : period === "WEEK" ? "Tuần" : period === "MONTH" ? "Tháng" : "Thời hạn gói"}
                                </option>)}
                              </select>
                              <p id={`feature-${feature.key}-period-error`} role={featureErrors[`${feature.key}.period`] ? "alert" : undefined} className="mt-1 min-h-8 text-[11px] leading-4 text-red-600">
                                {featureErrors[`${feature.key}.period`] ?? ""}
                              </p>
                            </div>
                          </div>
                        ) : null}
                        {feature.configFields.length > 0 ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {feature.configFields.map((field) => {
                              const value = entitlement.config?.[field.key];
                              const errorKey = `${feature.key}.config.${field.key}`;
                              return <div key={field.key} className="flex min-w-0 flex-col">
                                <label htmlFor={`feature-${feature.key}-config-${field.key}`} className="min-h-8 text-[11px] font-semibold text-slate-600">
                                  {field.label}{field.required ? " *" : ""}
                                </label>
                                {field.type === "BOOLEAN" ? (
                                  <input id={`feature-${feature.key}-config-${field.key}`} type="checkbox" checked={Boolean(value)} onChange={(event) => updateFeatureConfig(feature.key, field.key, event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                                ) : field.type === "SELECT" ? (
                                  <select id={`feature-${feature.key}-config-${field.key}`} value={typeof value === "string" ? value : ""} onChange={(event) => updateFeatureConfig(feature.key, field.key, event.target.value || undefined)} aria-invalid={Boolean(featureErrors[errorKey])} aria-describedby={`feature-${feature.key}-config-${field.key}-error`} className={`h-9 w-full rounded-lg border bg-white px-2 text-xs font-normal ${featureErrors[errorKey] ? "border-red-400" : "border-slate-200"}`}>
                                    <option value="">Chọn giá trị</option>
                                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                  </select>
                                ) : (
                                  <input
                                    id={`feature-${feature.key}-config-${field.key}`}
                                    type={field.type === "INTEGER" || field.type === "NUMBER" ? "number" : "text"}
                                    step={field.type === "INTEGER" ? 1 : "any"}
                                    value={typeof value === "boolean" ? "" : value ?? ""}
                                    onChange={(event) => updateFeatureConfig(
                                      feature.key,
                                      field.key,
                                      event.target.value === "" ? undefined : field.type === "INTEGER" || field.type === "NUMBER" ? Number(event.target.value) : event.target.value,
                                    )}
                                    aria-invalid={Boolean(featureErrors[errorKey])}
                                    aria-describedby={`feature-${feature.key}-config-${field.key}-error`}
                                    className={`h-9 w-full rounded-lg border px-2 text-xs font-normal ${featureErrors[errorKey] ? "border-red-400" : "border-slate-200"}`}
                                  />
                                )}
                                <p id={`feature-${feature.key}-config-${field.key}-error`} role={featureErrors[errorKey] ? "alert" : undefined} className="mt-1 min-h-8 text-[11px] leading-4 text-red-600">
                                  {featureErrors[errorKey] ?? ""}
                                </p>
                              </div>;
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {featureCatalog.length === 0 ? <p className="p-3 text-xs text-slate-500">Danh mục tính năng chưa tải được.</p> : null}
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
                  <select value={editingPlan.status || "DRAFT"} onChange={(e) => {
                    const status = e.target.value as SubscriptionPlanStatus;
                    setEditingPlan({ ...editingPlan, status });
                    clearFieldError("planCategory");
                    if (status === "ACTIVE" && conflictingActivePlan) setConfirmPlanReplacement(true);
                  }} className="h-9 rounded-lg border border-slate-200 bg-white px-2">
                    <option value="DRAFT">Bản nháp</option>
                    <option value="ACTIVE">Đang phát hành</option>
                    <option value="ARCHIVED">Đã lưu trữ</option>
                  </select>
                </label>
              </div>

            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={() => setEditingPlan(null)} className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                Hủy
              </button>
              <button type="button" disabled={isSavingPlan} onClick={() => void runPlanSave()} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
                {isSavingPlan ? "Đang lưu..." : editingPlan.id ? "Lưu thay đổi" : "Tạo gói học"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmPlanReplacement && editingPlan && conflictingActivePlan ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="replace-active-plan-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 id="replace-active-plan-title" className="text-base font-bold text-slate-900">
              Tạm dừng gói đang phát hành?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gói {planCategoryLabels[conflictingActivePlan.planCategory]} <strong className="text-slate-900">&quot;{conflictingActivePlan.name}&quot;</strong> đang phát hành.
              Bạn có muốn tạm dừng gói này để phát hành gói <strong className="text-slate-900">&quot;{editingPlan.name || "mới"}&quot;</strong> không?
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Gói cũ sẽ chuyển sang bản nháp. Các lượt đăng ký hiện có của học viên không bị thu hồi.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isSavingPlan}
                onClick={() => setConfirmPlanReplacement(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Không, quay lại
              </button>
              <button
                type="button"
                disabled={isSavingPlan}
                onClick={() => void runPlanSave(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isSavingPlan ? "Đang xử lý..." : "Tạm dừng và phát hành"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {pendingPlanActivation && pendingActivationConflict ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="activate-existing-plan-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 id="activate-existing-plan-title" className="text-base font-bold text-slate-900">
              Tạm dừng gói đang phát hành?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gói {planCategoryLabels[pendingActivationConflict.planCategory]} <strong className="text-slate-900">&quot;{pendingActivationConflict.name}&quot;</strong> đang phát hành.
              Bạn có muốn tạm dừng gói này để kích hoạt <strong className="text-slate-900">&quot;{pendingPlanActivation.name}&quot;</strong> không?
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Gói hiện tại sẽ chuyển sang bản nháp. Các lượt đăng ký hiện có của học viên không bị thu hồi.
            </p>
            {errorMsg ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{errorMsg}</p> : null}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={isSavingPlan}
                onClick={() => { setPendingPlanActivation(null); setErrorMsg(""); }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Không, giữ nguyên
              </button>
              <button
                type="button"
                disabled={isSavingPlan}
                onClick={() => void confirmPlanActivation()}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isSavingPlan ? "Đang xử lý..." : "Tạm dừng và kích hoạt"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

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
