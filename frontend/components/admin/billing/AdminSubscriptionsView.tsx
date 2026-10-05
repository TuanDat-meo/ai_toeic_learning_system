"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Flame,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AdminPageFrame, type AdminMetric } from "@/components/admin/AdminPageFrame";
import {
  getSubscriptionPlans,
  getUserSubscriptions,
  saveSubscriptionPlans,
  saveUserSubscriptions,
  type SubscriptionBillingCycle,
  type SubscriptionPlan,
  type SubscriptionPlanStatus,
  type UserSubscription,
} from "@/lib/api/billing";

const formatVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const cycleLabels: Record<SubscriptionBillingCycle, string> = {
  MONTHLY: "Hàng tháng (30 ngày)",
  QUARTERLY: "3 Tháng (90 ngày)",
  YEARLY: "1 Năm (365 ngày)",
  LIFETIME: "Trọn đời",
};

export function AdminSubscriptionsView() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PLANS" | "SUBSCRIBERS">("PLANS");
  const [search, setSearch] = useState("");

  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [featureInput, setFeatureInput] = useState("");
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [plansData, subsData] = await Promise.all([getSubscriptionPlans(), getUserSubscriptions()]);
      setPlans(plansData);
      setUserSubs(subsData);
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(msg: string) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  const activePlans = plans.filter((p) => p.status === "ACTIVE").length;
  const totalSubscribers = userSubs.filter((s) => s.status === "ACTIVE").length;
  const estimatedRevenue = userSubs.reduce((acc, s) => {
    const matchedPlan = plans.find((p) => p.id === s.planId);
    return acc + (matchedPlan?.promotionalPrice || 0);
  }, 0);

  const metrics: AdminMetric[] = [
    {
      label: "Tổng gói cước",
      value: plans.length.toString(),
      trend: `${activePlans} đang phát hành`,
      tone: "neutral",
      icon: <CreditCard className="h-5 w-5 text-slate-600" />,
    },
    {
      label: "Học viên VIP đang học",
      value: totalSubscribers.toLocaleString("vi-VN"),
      trend: "Gói trả phí active",
      tone: "primary",
      icon: <Users className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Gói nổi bật nhất",
      value: plans.find((p) => p.isPopular)?.name || "Gói VIP 3M",
      trend: "Bán chạy nhất",
      tone: "secondary",
      icon: <Flame className="h-5 w-5 text-amber-500" />,
    },
    {
      label: "Doanh thu ước tính",
      value: formatVnd(estimatedRevenue),
      trend: "Từ học viên VIP",
      tone: "tertiary",
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
    },
  ];

  function openCreatePlanModal() {
    setEditingPlan({
      code: `VIP_${Date.now().toString().slice(-4)}`,
      name: "",
      originalPrice: 499000,
      promotionalPrice: 299000,
      billingCycle: "QUARTERLY",
      durationDays: 90,
      badgeTag: "Ưu đãi mới",
      isPopular: false,
      features: [
        "Mở khóa toàn bộ kho đề thi thử ETS",
        "Không giới hạn câu hỏi Gemini AI",
        "Báo cáo phân tích BKT cá nhân hóa",
      ],
      maxAiQueriesPerDay: 9999,
      status: "ACTIVE",
      activeSubscriberCount: 0,
    });
    setFeatureInput("Mở khóa toàn bộ kho đề thi thử ETS\nKhông giới hạn câu hỏi Gemini AI\nBáo cáo phân tích BKT cá nhân hóa");
  }

  function openEditPlanModal(plan: SubscriptionPlan) {
    setEditingPlan(plan);
    setFeatureInput(plan.features.join("\n"));
  }

  async function handleSavePlan() {
    if (!editingPlan || !editingPlan.name?.trim() || !editingPlan.code?.trim()) {
      alert("Vui lòng điền Tên gói cước và Mã nhận diện!");
      return;
    }

    const featureList = featureInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    let nextList: SubscriptionPlan[];
    if (editingPlan.id) {
      nextList = plans.map((p) =>
        p.id === editingPlan.id
          ? ({
              ...p,
              ...editingPlan,
              features: featureList,
              updatedAt: new Date().toISOString(),
            } as SubscriptionPlan)
          : p
      );
      showFeedback(`Đã cập nhật gói cước "${editingPlan.name}"`);
    } else {
      const newPlan: SubscriptionPlan = {
        id: `plan-${Date.now()}`,
        code: editingPlan.code || `VIP_${Date.now()}`,
        name: editingPlan.name || "",
        originalPrice: Number(editingPlan.originalPrice) || 0,
        promotionalPrice: Number(editingPlan.promotionalPrice) || 0,
        billingCycle: editingPlan.billingCycle || "QUARTERLY",
        durationDays: Number(editingPlan.durationDays) || 90,
        badgeTag: editingPlan.badgeTag || "",
        isPopular: Boolean(editingPlan.isPopular),
        features: featureList,
        maxAiQueriesPerDay: Number(editingPlan.maxAiQueriesPerDay) || 9999,
        status: editingPlan.status || "ACTIVE",
        activeSubscriberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      nextList = [...plans, newPlan];
      showFeedback(`Đã tạo thành công gói cước mới "${newPlan.name}"`);
    }

    setPlans(nextList);
    await saveSubscriptionPlans(nextList);
    setEditingPlan(null);
  }

  async function togglePlanStatus(plan: SubscriptionPlan) {
    const nextStatus: SubscriptionPlanStatus = plan.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    const updated = plans.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p));
    setPlans(updated);
    await saveSubscriptionPlans(updated);
    showFeedback(nextStatus === "ACTIVE" ? "Đã kích hoạt gói cước" : "Đã tạm dừng phát hành gói cước");
  }

  async function handleDeletePlanConfirm() {
    if (!deletingPlan) return;
    const updated = plans.filter((p) => p.id !== deletingPlan.id);
    setPlans(updated);
    await saveSubscriptionPlans(updated);
    setDeletingPlan(null);
    showFeedback(`Đã xóa gói cước "${deletingPlan.name}"`);
  }

  async function extendUserSubscription(sub: UserSubscription) {
    const currentEnd = new Date(sub.endDate);
    currentEnd.setDate(currentEnd.getDate() + 30);
    const updated = userSubs.map((s) => (s.id === sub.id ? { ...s, endDate: currentEnd.toISOString() } : s));
    setUserSubs(updated);
    await saveUserSubscriptions(updated);
    showFeedback(`Đã gia hạn thêm +30 ngày cho tài khoản ${sub.userEmail}`);
  }

  return (
    <AdminPageFrame
      title="Quản lý Gói cước Dịch vụ & Đăng ký VIP"
      subtitle="Thiết lập các gói dịch vụ TOEIC VIP, định giá khuyến mãi, hạn ngạch AI và danh sách học viên VIP."
      metrics={metrics}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("PLANS")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "PLANS"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Cấu hình Gói cước ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SUBSCRIBERS")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "SUBSCRIBERS"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Học viên VIP ({userSubs.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "PLANS" && (
              <button
                type="button"
                onClick={openCreatePlanModal}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" /> Tạo gói cước mới
              </button>
            )}
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} /> làm mới
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            {feedbackMsg}
          </div>
        )}

        {activeTab === "PLANS" && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-xs transition-all hover:shadow-lg ${
                  plan.isPopular
                    ? "border-blue-500 ring-2 ring-blue-400/20"
                    : "border-slate-200/80"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 rounded-bl-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-md">
                    Phổ biến nhất
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {plan.code}
                    </span>
                    {plan.badgeTag && !plan.isPopular && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        {plan.badgeTag}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-base font-extrabold text-slate-900">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{cycleLabels[plan.billingCycle]}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-blue-700">{formatVnd(plan.promotionalPrice)}</span>
                    {plan.originalPrice > plan.promotionalPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatVnd(plan.originalPrice)}</span>
                    )}
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    {plan.maxAiQueriesPerDay > 900 ? "AI Chat Không giới hạn" : `${plan.maxAiQueriesPerDay} lượt AI Gemini / ngày`}
                  </div>

                  <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>Đang đăng ký:</span>
                    <span className="font-bold text-slate-800">{plan.activeSubscriberCount} học viên</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void togglePlanStatus(plan)}
                      className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                        plan.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {plan.status === "ACTIVE" ? "Đang phát hành" : "Đã ẩn (Bản nháp)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditPlanModal(plan)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
                      title="Sửa gói cước"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingPlan(plan)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                      title="Xóa gói cước"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "SUBSCRIBERS" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Học viên</th>
                    <th className="px-4 py-3.5">Gói VIP sử dụng</th>
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
                        {new Date(sub.endDate).toLocaleDateString("vi-VN")}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {sub.status === "ACTIVE" ? "Đang hoạt động" : "Đã hết hạn"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => void extendUserSubscription(sub)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Plus className="h-3.5 w-3.5" /> Gia hạn +30 ngày
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingPlan.id ? "Chỉnh sửa Gói cước" : "Tạo Gói cước VIP mới"}
              </h3>
              <button type="button" onClick={() => setEditingPlan(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mã gói cước *</label>
                  <input
                    type="text"
                    value={editingPlan.code || ""}
                    onChange={(e) => setEditingPlan({ ...editingPlan, code: e.target.value })}
                    placeholder="VIP_3MONTHS"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono text-xs outline-none focus:border-blue-500"
                  />
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
                <label className="block font-bold text-slate-800 mb-1">Tên gói cước *</label>
                <input
                  type="text"
                  value={editingPlan.name || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  placeholder="Gói TOEIC VIP 3 Tháng"
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.originalPrice || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, originalPrice: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Giá ưu đãi (VNĐ) *</label>
                  <input
                    type="number"
                    value={editingPlan.promotionalPrice || 0}
                    onChange={(e) => setEditingPlan({ ...editingPlan, promotionalPrice: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 font-mono text-blue-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Chu kỳ thanh toán</label>
                  <select
                    value={editingPlan.billingCycle || "QUARTERLY"}
                    onChange={(e) => setEditingPlan({ ...editingPlan, billingCycle: e.target.value as SubscriptionBillingCycle })}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="MONTHLY">Hàng tháng (30 ngày)</option>
                    <option value="QUARTERLY">3 Tháng (90 ngày)</option>
                    <option value="YEARLY">1 Năm (365 ngày)</option>
                    <option value="LIFETIME">Trọn đời</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hạn ngạch AI Gemini / ngày</label>
                  <input
                    type="number"
                    value={editingPlan.maxAiQueriesPerDay || 9999}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxAiQueriesPerDay: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Danh sách tính năng đi kèm (Mỗi dòng 1 tính năng)</label>
                <textarea
                  rows={4}
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Mở khóa kho đề ETS 2026&#10;Không giới hạn AI Chat&#10;Báo cáo phân tích BKT"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(editingPlan.isPopular)}
                    onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Đánh dấu là gói "Phổ biến nhất"
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingPlan.status === "ACTIVE"}
                    onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.checked ? "ACTIVE" : "DRAFT" })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Phát hành ngay (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setEditingPlan(null)} className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                  Hủy
                </button>
                <button type="button" onClick={() => void handleSavePlan()} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  {editingPlan.id ? "Lưu thay đổi" : "Tạo gói cước"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Xóa gói cước?</h3>
            <p className="mt-2 text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa gói <span className="font-bold text-slate-900">"{deletingPlan.name}"</span>?
            </p>
            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button type="button" onClick={() => setDeletingPlan(null)} className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                Hủy
              </button>
              <button type="button" onClick={() => void handleDeletePlanConfirm()} className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageFrame>
  );
}
