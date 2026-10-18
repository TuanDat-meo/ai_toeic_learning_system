"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Banknote,
  CircleCheck,
  Download,
  Eye,
  FileCheck,
  Hourglass,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  confirmTransaction,
  getTransactions,
  refundTransaction,
  type PaymentMethod,
  type Transaction,
  type TransactionStatus,
} from "@/lib/api/billing";

const formatVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
};

const statusBadges: Record<TransactionStatus, { label: string; className: string }> = {
  SUCCESS: { label: "Thành công", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border-amber-200" },
  FAILED: { label: "Thanh toán thất bại", className: "bg-rose-50 text-rose-700 border-rose-200" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-purple-50 text-purple-700 border-purple-200" },
  EXPIRED: { label: "Đăng ký thất bại — quá hạn", className: "bg-slate-100 text-slate-700 border-slate-200" },
  REVIEW_REQUIRED: { label: "Cần kiểm tra thanh toán", className: "bg-orange-50 text-orange-800 border-orange-200" },
};

const methodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
  MOMO: { label: "Ví MoMo", icon: "MoMo" },
  VNPAY: { label: "VNPAY QR", icon: "VNPAY" },
  BANK_TRANSFER: { label: "Chuyển khoản VietQR / SePay", icon: "Bank" },
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
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savingTransactionId, setSavingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!activeReceipt) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveReceipt(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeReceipt]);

  async function loadData() {
    setLoading(true);
    setErrorMsg("");
    try {
      setTransactions(await getTransactions());
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Không thể tải dữ liệu giao dịch.");
    } finally {
      setLoading(false);
    }
  }
  function showFeedback(msg: string) {
    setErrorMsg("");
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

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageTransactions = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const successfulTransactions = transactions.filter((transaction) => transaction.status === "SUCCESS");
  const pendingTransactions = transactions.filter((transaction) => transaction.status === "PENDING");
  const reviewRequiredTransactions = transactions.filter((transaction) => transaction.status === "REVIEW_REQUIRED");
  const refundedTransactions = transactions.filter((transaction) => transaction.status === "REFUNDED");
  const receivedAmount = successfulTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const pendingAmount = pendingTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const reviewRequiredAmount = reviewRequiredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  const refundedAmount = refundedTransactions.reduce((total, transaction) => total + transaction.amount, 0);

  async function handleConfirmPayment(tx: Transaction) {
    if (savingTransactionId) return;
    if (tx.status === "REVIEW_REQUIRED" && !confirm(
      "Chỉ xác nhận nếu bạn đã đối chiếu sao kê và xác minh khoản tiền thực sự đã vào tài khoản. Tiếp tục?",
    )) return;
    setErrorMsg("");
    setSavingTransactionId(tx.id);
    try {
      const updated = await confirmTransaction(tx.id);
      setTransactions((current) => current.map((transaction) => transaction.id === tx.id ? updated : transaction));
      setActiveReceipt((current) => current?.id === tx.id ? updated : current);
      showFeedback("Đã xác nhận thanh toán thành công cho đơn " + tx.orderCode);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Không thể lưu xác nhận thanh toán. Vui lòng thử lại.");
    } finally {
      setSavingTransactionId(null);
    }
  }

  async function handleRefund(tx: Transaction) {
    if (savingTransactionId) return;
    if (!confirm("Ghi nhận giao dịch này đã được hoàn tiền " + tx.transactionCode + " (" + formatVnd(tx.amount) + ")?")) return;
    setErrorMsg("");
    setSavingTransactionId(tx.id);
    try {
      const updated = await refundTransaction(tx.id);
      setTransactions((current) => current.map((transaction) => transaction.id === tx.id ? updated : transaction));
      setActiveReceipt((current) => current?.id === tx.id ? updated : current);
      showFeedback("Đã ghi nhận hoàn tiền cho giao dịch " + tx.transactionCode);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Không thể lưu trạng thái hoàn tiền. Vui lòng thử lại.");
    } finally {
      setSavingTransactionId(null);
    }
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
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">
            Trang chủ <span className="px-1.5">/</span> Hệ thống <span className="px-1.5">/</span>{" "}
            <span className="font-semibold text-blue-700">Giao dịch</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">Quản lý giao dịch</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
            Theo dõi thanh toán, đối soát trạng thái và tra cứu hóa đơn của học viên.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {loading ? "Đang tải..." : `${transactions.length.toLocaleString("vi-VN")} giao dịch`}
          </span>
        </div>
      </header>

      <div className="space-y-6">
        <section aria-label="Tổng quan giao dịch" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <TransactionSummary
            label="Đã thu thành công"
            value={loading ? "—" : formatVnd(receivedAmount)}
            detail={loading ? "Đang cập nhật" : `${successfulTransactions.length.toLocaleString("vi-VN")} giao dịch`}
            icon={<CircleCheck className="h-5 w-5" aria-hidden="true" />}
            tone="emerald"
          />
          <TransactionSummary
            label="Chờ thanh toán"
            value={loading ? "—" : formatVnd(pendingAmount)}
            detail={loading ? "Đang cập nhật" : `${pendingTransactions.length.toLocaleString("vi-VN")} giao dịch`}
            icon={<Hourglass className="h-5 w-5" aria-hidden="true" />}
            tone="amber"
          />
          <TransactionSummary
            label="Cần đối soát"
            value={loading ? "—" : formatVnd(reviewRequiredAmount)}
            detail={loading ? "Đang cập nhật" : `${reviewRequiredTransactions.length.toLocaleString("vi-VN")} giao dịch cần admin kiểm tra`}
            icon={<Hourglass className="h-5 w-5" aria-hidden="true" />}
            tone="amber"
          />
          <TransactionSummary
            label="Đã hoàn tiền"
            value={loading ? "—" : formatVnd(refundedAmount)}
            detail={loading ? "Đang cập nhật" : `${refundedTransactions.length.toLocaleString("vi-VN")} giao dịch`}
            icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}
            tone="violet"
          />
          <TransactionSummary
            label="Tổng số giao dịch"
            value={loading ? "—" : transactions.length.toLocaleString("vi-VN")}
            detail="Bao gồm mọi trạng thái"
            icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
            tone="blue"
          />
        </section>

        <section aria-label="Tìm kiếm và lọc giao dịch" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Danh sách giao dịch thanh toán</h2>
            <p className="mt-1 text-xs text-slate-500">Tra cứu và đối soát các khoản thanh toán của học viên.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={exportCsv} disabled={loading || filtered.length === 0} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <Download className="h-4 w-4" />
              Xuất CSV
            </button>
            <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 lg:grid-cols-[auto_minmax(200px,1fr)_220px_auto] lg:items-center">
          <nav aria-label="Lọc theo trạng thái giao dịch" className="flex gap-1.5 overflow-x-auto pb-0.5">
          {(["ALL", "SUCCESS", "PENDING", "REVIEW_REQUIRED", "EXPIRED", "FAILED", "REFUNDED"] as const).map((status) => {
            const label = status === "ALL" ? "Tất cả" : statusBadges[status].label;
            const count = status === "ALL" ? transactions.length : transactions.filter((transaction) => transaction.status === status).length;
            const selected = statusFilter === status;
            return <button key={status} type="button" onClick={() => { setStatusFilter(status); setPage(1); }} aria-pressed={selected} className={"inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition " + (selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50")}>{label}<span className="text-[10px] opacity-70">{loading ? "—" : count.toLocaleString("vi-VN")}</span></button>;
          })}
          </nav>
          <label className="relative min-w-0"><span className="sr-only">Tìm giao dịch theo mã, học viên hoặc gói học</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm mã giao dịch, đơn hàng, học viên..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
          <label><span className="sr-only">Lọc theo cổng thanh toán</span><select value={methodFilter} onChange={(event) => { setMethodFilter(event.target.value as typeof methodFilter); setPage(1); }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="ALL">Tất cả cổng thanh toán</option><option value="MOMO">Ví MoMo</option><option value="VNPAY">VNPAY QR</option><option value="BANK_TRANSFER">Chuyển khoản VietQR</option><option value="CREDIT_CARD">Thẻ ATM / Visa</option></select></label>
          <p aria-live="polite" className="text-right text-xs text-slate-500 lg:whitespace-nowrap">
            {loading ? "Đang tải..." : <><strong className="font-semibold text-slate-700">{filtered.length.toLocaleString("vi-VN")}</strong> / {transactions.length.toLocaleString("vi-VN")} giao dịch</>}
          </p>
        </div>
        {feedbackMsg && <div role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">{feedbackMsg}</div>}
        {errorMsg ? <div role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800">{errorMsg}<button type="button" onClick={() => void loadData()} className="ml-2 underline">Thử lại</button></div> : null}
      </section>
      <section aria-label="Danh sách giao dịch" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left [&_th]:border-b [&_th]:border-r [&_th]:border-slate-200 [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-slate-100 [&_td:last-child]:border-r-0 [&_tbody_tr:last-child_td]:border-b-0">
            <thead className="bg-slate-50 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-4">Mã giao dịch &amp; đơn hàng</th>
                <th scope="col" className="px-4 py-4">Khách hàng / Học viên</th>
                <th scope="col" className="px-4 py-4">Gói cước</th>
                <th scope="col" className="px-4 py-4">Số tiền</th>
                <th scope="col" className="px-4 py-4">Cổng thanh toán</th>
                <th scope="col" className="px-4 py-4">Trạng thái</th>
                <th scope="col" className="px-4 py-4">Thời gian</th>
                <th scope="col" className="px-5 py-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }, (_, index) => (
                <tr key={index}>
                  <td colSpan={8} className="px-4 py-5">
                    <div className="h-4 max-w-sm animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              )) : pageTransactions.map((t) => {
                const st = statusBadges[t.status] || statusBadges.PENDING;
                const pm = methodLabels[t.paymentMethod] || { label: t.paymentMethod };

                return (
                  <tr key={t.id} className="transition hover:bg-blue-50/30">
                    <td className="px-4 py-4">
                      <span className="block font-mono text-xs font-semibold text-blue-700">{t.transactionCode}</span>
                      <span className="mt-1 block font-mono text-xs text-slate-500">Đơn: #{t.orderCode}</span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">{t.userName}</p>
                      <p className="mt-1 text-xs text-slate-500">{t.userEmail}</p>
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-800">{t.planName}</td>

                    <td className="px-4 py-4 text-center font-mono text-sm font-semibold text-slate-900">
                      {formatVnd(t.amount)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {pm.label}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                      <p><span className="text-slate-400">Tạo:</span> {formatDateTime(t.createdAt)}</p>
                      {t.paidAt ? <p className="mt-1 text-emerald-700"><span className="text-emerald-600">Thanh toán:</span> {formatDateTime(t.paidAt)}</p> : null}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(t)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                          title="Xem hóa đơn chi tiết"
                          aria-label={`Xem hóa đơn ${t.transactionCode}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>

                        {(t.status === "PENDING" || t.status === "REVIEW_REQUIRED") && (
                          <button
                            type="button"
                            onClick={() => void handleConfirmPayment(t)}
                            disabled={savingTransactionId !== null}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60"
                            title={t.status === "REVIEW_REQUIRED" ? "Đã kiểm tra và xác nhận khoản thanh toán" : "Xác nhận thanh toán thành công"}
                          >
                            {savingTransactionId === t.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                            {savingTransactionId === t.id ? "Đang lưu" : t.status === "REVIEW_REQUIRED" ? "Xác nhận" : "Duyệt"}
                          </button>
                        )}

                        {t.status === "SUCCESS" && (
                          <button
                            type="button"
                            onClick={() => void handleRefund(t)}
                            disabled={savingTransactionId !== null}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-50"
                            title="Ghi nhận đã hoàn tiền"
                            aria-label={`Hoàn tiền giao dịch ${t.transactionCode}`}
                          >
                            {savingTransactionId === t.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !errorMsg && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <Receipt className="h-5 w-5" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-slate-800">
                        {transactions.length === 0 ? "Chưa có giao dịch nào" : "Không tìm thấy giao dịch phù hợp"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {transactions.length === 0
                          ? "Chưa có giao dịch nào được ghi nhận trong hệ thống."
                          : "Thử thay đổi từ khóa hoặc bộ lọc để xem thêm kết quả."}
                      </p>
                      {transactions.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setMethodFilter("ALL");
                            setStatusFilter("ALL");
                            setPage(1);
                          }}
                          className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Xóa bộ lọc
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 ? (
          <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span>
                Hiển thị{" "}
                <strong className="font-semibold text-slate-700">
                  {((currentPage - 1) * pageSize + 1).toLocaleString("vi-VN")}–{Math.min(currentPage * pageSize, filtered.length).toLocaleString("vi-VN")}
                </strong>{" "}
                trên {filtered.length.toLocaleString("vi-VN")} giao dịch
              </span>
              <label className="inline-flex items-center gap-2">
                Số dòng
                <select
                  aria-label="Số giao dịch mỗi trang"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
            <nav aria-label="Chuyển trang giao dịch" className="flex items-center gap-2 self-end sm:self-auto">
              <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                Trước
              </button>
              <span aria-live="polite" className="min-w-20 text-center text-xs text-slate-500">Trang {currentPage} / {pageCount}</span>
              <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                Sau
              </button>
            </nav>
          </footer>
        ) : null}
      </section>

      {activeReceipt && (
        <div
          role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveReceipt(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="transaction-receipt-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in duration-200 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
                  TOEIC
                </div>
                <div>
                  <h3 id="transaction-receipt-title" className="text-base font-extrabold text-slate-900">Chi tiết giao dịch</h3>
                  <p className="text-[11px] font-mono text-slate-400">TOEIC Master Billing System</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveReceipt(null)} aria-label="Đóng hóa đơn" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
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
                <span className="font-mono font-bold text-slate-800">{methodLabels[activeReceipt.paymentMethod]?.label ?? activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngày tạo:</span>
                <span className="text-right font-medium text-slate-700">{formatDateTime(activeReceipt.createdAt)}</span>
              </div>
              {activeReceipt.paidAt ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngày thanh toán:</span>
                  <span className="text-right font-medium text-slate-700">{formatDateTime(activeReceipt.paidAt)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Mã tham chiếu:</span>
                <span className="break-all text-right font-mono text-slate-700">{activeReceipt.id}</span>
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
      </div>
    </main>
  );
}

function TransactionSummary({ label, value, detail, icon, tone }: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "emerald" | "amber" | "violet" | "blue";
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-blue-50 text-blue-700",
  }[tone];
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles}`}>{icon}</span>
      </div>
      <p className="mt-3 break-words text-lg font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}
