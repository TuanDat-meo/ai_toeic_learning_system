"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  Filter,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { AdminPageFrame, type AdminMetric } from "@/components/admin/AdminPageFrame";
import {
  getTransactions,
  saveTransactions,
  type PaymentMethod,
  type Transaction,
  type TransactionStatus,
} from "@/lib/api/billing";

const formatVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const statusBadges: Record<TransactionStatus, { label: string; className: string }> = {
  SUCCESS: { label: "Thành công", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border-amber-200" },
  FAILED: { label: "Thất bại", className: "bg-rose-50 text-rose-700 border-rose-200" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-purple-50 text-purple-700 border-purple-200" },
};

const methodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  MOMO: { label: "Ví MoMo", icon: "MoMo" },
  VNPAY: { label: "VNPAY QR", icon: "VNPAY" },
  BANK_TRANSFER: { label: "Chuyển khoản VietQR", icon: "Bank" },
  CREDIT_CARD: { label: "Thẻ Visa/Mastercard", icon: "Card" },
};

export function AdminTransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | PaymentMethod>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TransactionStatus>("ALL");

  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      setTransactions(await getTransactions());
    } finally {
      setLoading(false);
    }
  }

  function showFeedback(msg: string) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 4000);
  }

  const filtered = transactions.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.transactionCode.toLowerCase().includes(q) ||
      t.orderCode.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q) ||
      t.planName.toLowerCase().includes(q);

    const matchesMethod = methodFilter === "ALL" || t.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalRevenue = transactions
    .filter((t) => t.status === "SUCCESS")
    .reduce((acc, t) => acc + t.amount, 0);

  const successCount = transactions.filter((t) => t.status === "SUCCESS").length;
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const successRate = Math.round((successCount / (transactions.length || 1)) * 100);

  const metrics: AdminMetric[] = [
    {
      label: "Tổng doanh thu thực nhận",
      value: formatVnd(totalRevenue),
      trend: "Giao dịch đã khớp",
      tone: "tertiary",
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
    },
    {
      label: "Giao dịch thành công",
      value: successCount.toString(),
      trend: `${successRate}% tỷ lệ thành công`,
      tone: "secondary",
      icon: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Giao dịch chờ xử lý",
      value: pendingCount.toString(),
      trend: pendingCount > 0 ? "Cần đối soát" : "Đã sạch",
      tone: pendingCount > 0 ? "primary" : "neutral",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
    },
    {
      label: "Tổng lượt giao dịch",
      value: transactions.length.toString(),
      trend: "Lịch sử đơn hàng",
      tone: "neutral",
      icon: <Receipt className="h-5 w-5 text-slate-600" />,
    },
  ];

  async function handleConfirmPayment(tx: Transaction) {
    const updated = transactions.map((t) =>
      t.id === tx.id
        ? ({
            ...t,
            status: "SUCCESS" as const,
            paidAt: new Date().toISOString(),
            note: "Xác nhận thanh toán thủ công bởi Admin",
          })
        : t
    );
    setTransactions(updated);
    await saveTransactions(updated);
    showFeedback(`Đã xác nhận thanh toán thành công cho đơn ${tx.orderCode}`);
  }

  async function handleRefund(tx: Transaction) {
    if (!confirm(`Xác nhận hoàn tiền cho giao dịch ${tx.transactionCode} (${formatVnd(tx.amount)})?`)) return;
    const updated = transactions.map((t) =>
      t.id === tx.id
        ? ({
            ...t,
            status: "REFUNDED" as const,
            note: "Đã hoàn tiền theo yêu cầu khách hàng",
          })
        : t
    );
    setTransactions(updated);
    await saveTransactions(updated);
    showFeedback(`Đã hoàn tiền cho giao dịch ${tx.transactionCode}`);
  }

  function exportCsv() {
    const escapeCsv = (val: string) => `"${val.replaceAll('"', '""')}"`;
    const rows = [
      ["Mã GD", "Mã Đơn hàng", "Học viên", "Email", "Gói cước", "Số tiền (VND)", "Phương thức", "Trạng thái", "Ngày tạo", "Ngày thanh toán"],
      ...filtered.map((t) => [
        t.transactionCode,
        t.orderCode,
        t.userName,
        t.userEmail,
        t.planName,
        t.amount.toString(),
        methodLabels[t.paymentMethod]?.label || t.paymentMethod,
        statusBadges[t.status]?.label || t.status,
        new Date(t.createdAt).toLocaleString("vi-VN"),
        t.paidAt ? new Date(t.paidAt).toLocaleString("vi-VN") : "",
      ]),
    ];

    const csvContent = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giao-dich-thanh-toan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminPageFrame
      title="Lịch sử Giao dịch & Nhật ký Thanh toán"
      subtitle="Theo dõi chi tiết các đơn đặt hàng gói cước VIP, tra cứu mã giao dịch, cổng thanh toán và xác nhận thủ công."
      metrics={metrics}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách Giao dịch</h2>
            <p className="text-xs text-slate-500">Hiển thị {filtered.length} trên tổng số {transactions.length} giao dịch</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 shadow-xs"
            >
              <Download className="h-4 w-4" /> Xuất CSV
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} /> Làm mới
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã TX, HD, tên, email..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả cổng thanh toán</option>
            <option value="MOMO">Ví MoMo</option>
            <option value="VNPAY">VNPAY QR</option>
            <option value="BANK_TRANSFER">Chuyển khoản VietQR</option>
            <option value="CREDIT_CARD">Thẻ ATM / Visa</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
        </div>

        {feedbackMsg && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            {feedbackMsg}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Mã Giao dịch & Đơn hàng</th>
                <th className="px-4 py-3.5">Khách hàng / Học viên</th>
                <th className="px-4 py-3.5">Gói cước</th>
                <th className="px-4 py-3.5">Số tiền</th>
                <th className="px-4 py-3.5">Cổng thanh toán</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => {
                const st = statusBadges[t.status] || statusBadges.PENDING;
                const pm = methodLabels[t.paymentMethod] || { label: t.paymentMethod };

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-blue-700 block">{t.transactionCode}</span>
                      <span className="font-mono text-[11px] text-slate-400">Đơn: #{t.orderCode}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{t.userName}</p>
                      <p className="text-[11px] text-slate-400">{t.userEmail}</p>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-800">{t.planName}</td>

                    <td className="px-4 py-3.5 font-mono font-extrabold text-blue-700">
                      {formatVnd(t.amount)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                        {pm.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${st.className}`}>
                        {st.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(t)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 font-semibold text-blue-700 hover:bg-blue-100 transition"
                          title="Xem hóa đơn chi tiết"
                        >
                          <Eye className="h-3.5 w-3.5" /> Hóa đơn
                        </button>

                        {t.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => void handleConfirmPayment(t)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 font-semibold text-white hover:bg-emerald-700 transition"
                            title="Xác nhận thanh toán thành công"
                          >
                            <FileCheck className="h-3.5 w-3.5" /> Duyệt
                          </button>
                        )}

                        {t.status === "SUCCESS" && (
                          <button
                            type="button"
                            onClick={() => void handleRefund(t)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Hoàn tiền"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-500">
                    Không tìm thấy lịch sử giao dịch phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveReceipt(null);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
                  TOEIC
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Hóa đơn Thanh toán</h3>
                  <p className="text-[11px] font-mono text-slate-400">TOEIC Master Billing System</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mã giao dịch:</span>
                <span className="font-mono font-bold text-blue-700">{activeReceipt.transactionCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-slate-800">#{activeReceipt.orderCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-900">{activeReceipt.userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email nhận gói:</span>
                <span className="font-mono text-slate-700">{activeReceipt.userEmail}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Gói dịch vụ đăng ký:</span>
                <span className="font-bold text-slate-900">{activeReceipt.planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cổng thanh toán:</span>
                <span className="font-mono font-bold text-slate-800">{methodLabels[activeReceipt.paymentMethod]?.label}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="font-mono font-black text-blue-700 text-base">{formatVnd(activeReceipt.amount)}</span>
              </div>
            </div>

            {activeReceipt.note && (
              <p className="text-[11px] text-slate-500 italic bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                Ghi chú: {activeReceipt.note}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${statusBadges[activeReceipt.status]?.className}`}>
                {statusBadges[activeReceipt.status]?.label}
              </span>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Đóng hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageFrame>
  );
}
