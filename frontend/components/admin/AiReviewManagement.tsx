"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert, RefreshCw, ShieldCheck, X } from "lucide-react";
import {
  approveAiContent,
  getAiReviewQueue,
  rejectAiContent,
  type AiReviewQueue,
  type AiReviewStatus,
} from "@/lib/api/ai-review";

const FILTERS: { value: AiReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "ALL", label: "Tất cả" },
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  QUESTION: "Câu hỏi",
  READING: "Bài đọc",
  EXERCISE: "Bài tập",
};

const STATUS_LABELS: Record<Exclude<AiReviewStatus, "ALL">, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AiReviewManagement() {
  const [status, setStatus] = useState<AiReviewStatus>("PENDING");
  const [queue, setQueue] = useState<AiReviewQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [confirmation, setConfirmation] = useState<{
    id: string;
    decision: "approve" | "reject";
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAiReviewQueue(status)
      .then((result) => {
        if (active) setQueue(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải danh sách kiểm duyệt.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, reloadKey]);

  function refreshQueue() {
    setLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  }

  function selectStatus(nextStatus: AiReviewStatus) {
    setLoadError("");
    if (nextStatus === status) {
      refreshQueue();
      return;
    }
    setLoading(true);
    setStatus(nextStatus);
  }

  async function applyDecision() {
    if (!confirmation) return;
    const current = confirmation;
    setSavingId(current.id);
    setActionError("");
    try {
      if (current.decision === "approve") {
        await approveAiContent(current.id);
      } else {
        await rejectAiContent(current.id);
      }
      setConfirmation(null);
      refreshQueue();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể cập nhật trạng thái kiểm duyệt.");
    } finally {
      setSavingId("");
    }
  }

  const countForStatus = (current: AiReviewStatus) => {
    if (!queue) return 0;
    if (current === "ALL") return queue.counts.pending + queue.counts.approved + queue.counts.rejected;
    return current === "PENDING"
      ? queue.counts.pending
      : current === "APPROVED" ? queue.counts.approved : queue.counts.rejected;
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        {([
          ["Chờ duyệt", queue?.counts.pending ?? 0, "text-amber-800"],
          ["Đã duyệt", queue?.counts.approved ?? 0, "text-emerald-800"],
          ["Đã từ chối", queue?.counts.rejected ?? 0, "text-rose-800"],
        ] as const).map(([label, value, tone]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <p className="flex items-start gap-2">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          Duyệt nội dung AI trước khi chấp nhận hoặc từ chối. Quyết định đã lưu không thể thay đổi từ queue này.
        </p>
        <button
          type="button"
          onClick={refreshQueue}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Tải lại
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc nội dung kiểm duyệt">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={status === filter.value}
            onClick={() => selectStatus(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === filter.value
                ? "bg-blue-700 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {filter.label} {!loading && queue ? `(${countForStatus(filter.value)})` : ""}
          </button>
        ))}
      </div>

      {loadError ? (
        <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <div className="flex items-start gap-3">
            <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Không thể tải queue kiểm duyệt</h2>
              <p className="mt-1 text-sm">{loadError}</p>
              <button
                type="button"
                onClick={refreshQueue}
                className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold hover:bg-red-100"
              >
                Thử lại
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {actionError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div role="status" className="flex min-h-40 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
          Đang tải nội dung…
        </div>
      ) : null}

      {!loading && !loadError && queue?.items.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <ShieldCheck aria-hidden="true" className="mx-auto h-9 w-9 text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-900">Không có nội dung trong danh sách này</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nội dung do AI tạo sẽ xuất hiện ở đây khi được ghi vào workflow kiểm duyệt.
          </p>
        </section>
      ) : null}

      {!loading && !loadError ? queue?.items.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900">
                  {CONTENT_TYPE_LABELS[item.contentType] ?? item.contentType}
                </h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.status === "PENDING"
                    ? "bg-amber-100 text-amber-900"
                    : item.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-rose-100 text-rose-900"
                }`}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {item.interactionType.replaceAll("_", " ")}
                {item.model ? ` · ${item.model}` : ""}
                {" · "}{formatDate(item.createdAt)}
              </p>
            </div>
            {item.status === "PENDING" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmation({ id: item.id, decision: "approve" })}
                  disabled={savingId === item.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  <Check aria-hidden="true" className="h-4 w-4" />
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmation({ id: item.id, decision: "reject" })}
                  disabled={savingId === item.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                  Từ chối
                </button>
              </div>
            ) : null}
          </header>
          <div className="p-5">
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              {JSON.stringify(item.payload, null, 2)}
            </pre>
            {item.reviewedAt ? (
              <p className="mt-3 text-xs text-slate-500">Đã xử lý: {formatDate(item.reviewedAt)}</p>
            ) : null}
          </div>
        </article>
      )) : null}

      {confirmation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-review-confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="ai-review-confirm-title" className="text-lg font-semibold text-slate-900">
              {confirmation.decision === "approve" ? "Duyệt nội dung này?" : "Từ chối nội dung này?"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Quyết định sẽ được lưu và không thể đổi từ danh sách kiểm duyệt.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={savingId !== ""}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={applyDecision}
                disabled={savingId !== ""}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                  confirmation.decision === "approve"
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-rose-700 hover:bg-rose-800"
                }`}
              >
                {savingId ? "Đang lưu…" : "Xác nhận"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
