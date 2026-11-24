"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  FileCheck2,
  FileQuestion,
  Filter,
  History,
  Pencil,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  approveAiContent,
  generateAiContent,
  getAiReviewAudit,
  getAiReviewQueue,
  rejectAiContent,
  updateAiContentPayload,
  type AiAuditOverview,
  type AiReviewItem,
  type AiReviewQueue,
  type AiReviewStatus,
} from "@/lib/api/ai-review";
import {
  getSystemSettings,
  updateSystemSettings,
  type SystemSettings,
} from "@/lib/api/system-settings";

type ContentTypeFilter = "ALL" | "QUESTION" | "READING" | "EXERCISE";

const STATUS_FILTERS: { value: AiReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đạt chuẩn" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "ALL", label: "Tất cả" },
];

const CONTENT_TYPE_FILTERS: { value: ContentTypeFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả loại" },
  { value: "QUESTION", label: "Câu hỏi" },
  { value: "READING", label: "Bài đọc" },
  { value: "EXERCISE", label: "Bài tập" },
];

const CONTENT_TYPE_META: Record<
  AiReviewItem["contentType"],
  {
    label: string;
    destinationLabel: string;
    destinationHref: string;
  }
> = {
  QUESTION: {
    label: "Câu hỏi TOEIC",
    destinationLabel: "Ngân hàng câu hỏi",
    destinationHref: "/admin/content/questions",
  },
  READING: {
    label: "Bài đọc Reading",
    destinationLabel: "Trang Học Reading",
    destinationHref: "/reading",
  },
  EXERCISE: {
    label: "Bài tập Ngữ pháp",
    destinationLabel: "Trang Ngữ pháp",
    destinationHref: "/grammar",
  },
};

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  GENERATE_QUESTION: "AI sinh câu hỏi",
  GENERATE_READING: "AI sinh bài đọc",
  GENERATE_EXERCISE: "AI sinh bài tập",
  EXPLAIN_ANSWER: "AI giải thích đáp án",
  ANALYZE_MISTAKE: "AI phân tích lỗi sai",
  EXPLAIN_VOCAB: "AI giải thích từ vựng",
};

const STATUS_META: Record<
  Exclude<AiReviewStatus, "ALL">,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  APPROVED: {
    label: "Đạt chuẩn",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REJECTED: {
    label: "Đã từ chối",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

const QA_CRITERIA = [
  { id: "accuracy", label: "Đáp án & giải thích chính xác" },
  { id: "language", label: "Ngôn ngữ đúng, không lỗi chính tả" },
  { id: "format", label: "Đúng chuẩn TOEIC" },
] as const;

const REJECTION_CATEGORIES = [
  "Sai đáp án",
  "Giải thích mâu thuẫn",
  "Lỗi ngữ pháp / chính tả",
  "Không đúng chuẩn TOEIC",
  "Nội dung không phù hợp",
] as const;

const AUDIT_ACTION_META: Record<string, { label: string; badgeClass: string }> = {
  APPROVE_AI_CONTENT: {
    label: "Duyệt đạt chuẩn",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  REJECT_AI_CONTENT: {
    label: "Từ chối đầu ra",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
  },
  EDIT_AI_CONTENT: {
    label: "Hiệu chỉnh",
    badgeClass: "border-blue-200 bg-blue-50 text-[#1b41ae]",
  },
  GENERATE_AI_CONTENT: {
    label: "AI sinh mới",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
  },
  AUTO_PUBLISH_AI_CONTENT: {
    label: "Tự động áp dụng",
    badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
};

type ParsedPayload = {
  title: string;
  part: string;
  difficulty: string;
  skill: string;
  passage: string;
  passageTextVi: string;
  formula: string;
  summary: string;
  question: string;
  correctAnswer: string;
  explanation: string;
  signalWords: string[];
  traps: string[];
  options: Array<{ key: string; text: string }>;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function parsePayload(payload: AiReviewItem["payload"]): ParsedPayload {
  const obj =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  const rawOptions = obj.options ?? obj.choices;
  const options: Array<{ key: string; text: string }> = [];
  if (Array.isArray(rawOptions)) {
    const letters = ["A", "B", "C", "D"];
    rawOptions.forEach((opt, idx) => {
      if (typeof opt === "string") {
        options.push({ key: letters[idx] ?? String(idx + 1), text: opt });
      } else if (opt && typeof opt === "object") {
        const rec = opt as Record<string, unknown>;
        const k = asString(rec.label) || asString(rec.key) || letters[idx] || String(idx + 1);
        const t = asString(rec.text) || asString(rec.content) || JSON.stringify(opt);
        options.push({ key: k.toUpperCase(), text: t });
      }
    });
  } else if (rawOptions && typeof rawOptions === "object") {
    Object.entries(rawOptions as Record<string, unknown>).forEach(([k, v]) => {
      options.push({ key: k.toUpperCase(), text: typeof v === "string" ? v : JSON.stringify(v) });
    });
  }

  return {
    title: asString(obj.title) || asString(obj.topic) || asString(obj.heading),
    part: asString(obj.part) || asString(obj.section),
    difficulty: asString(obj.difficulty) || asString(obj.level),
    skill: asString(obj.skill),
    passage: asString(obj.passage) || asString(obj.passageText) || asString(obj.content) || asString(obj.text),
    passageTextVi: asString(obj.passageTextVi) || asString(obj.translation),
    formula: asString(obj.formula),
    summary: asString(obj.summary),
    question: asString(obj.question) || asString(obj.questionText) || asString(obj.stem),
    correctAnswer: (
      asString(obj.correctAnswer) ||
      asString(obj.answer) ||
      asString(obj.correctOption)
    ).toUpperCase(),
    explanation: asString(obj.explanation) || asString(obj.analysis) || asString(obj.rationale),
    signalWords: asStringArray(obj.signalWords),
    traps: asStringArray(obj.traps),
    options,
  };
}

function evaluateAutoQa(item: AiReviewItem, parsed: ParsedPayload) {
  const hasOptions =
    parsed.options.length >= 4 &&
    parsed.options.every((opt) => opt.text.trim().length > 0) &&
    parsed.options.some((opt) => opt.key.toUpperCase() === parsed.correctAnswer);
  const hasExplanation = parsed.explanation.length >= 15;
  const hasContext =
    item.contentType === "READING"
      ? parsed.passage.length >= 40
      : item.contentType === "EXERCISE"
      ? parsed.formula.length >= 5 || parsed.summary.length >= 10
      : parsed.question.length >= 10;

  const passed = [hasOptions, hasExplanation, hasContext].filter(Boolean).length;
  return { passed, total: 3, allOk: passed === 3 };
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function AiReviewManagement() {
  const [status, setStatus] = useState<AiReviewStatus>("PENDING");
  const [activeView, setActiveView] = useState<"QUEUE" | "AUDIT">("QUEUE");
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [queue, setQueue] = useState<AiReviewQueue | null>(null);
  const [auditOverview, setAuditOverview] = useState<AiAuditOverview | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState<{ message: string; linkHref?: string; linkLabel?: string } | null>(null);
  const [savingId, setSavingId] = useState("");
  const [savingDecision, setSavingDecision] = useState<"approve" | "reject" | "">("");
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [rejectCategory, setRejectCategory] = useState<string>(REJECTION_CATEGORIES[0]);
  const [rejectReason, setRejectReason] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Live moderation policy synced from /api/admin/settings
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [togglingModeration, setTogglingModeration] = useState(false);

  // Per-item view toggles (Vietnamese translation, inline QA checks)
  const [viToggleIds, setViToggleIds] = useState<Record<string, boolean>>({});
  const [criteriaByItem, setCriteriaByItem] = useState<Record<string, Record<string, boolean>>>({});

  // Inline editing state (persists to PostgreSQL via PUT /api/admin/ai-review/{id})
  const [editedIds, setEditedIds] = useState<Record<string, boolean>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState("");
  const [editDraft, setEditDraft] = useState<{
    title: string;
    passage: string;
    formula: string;
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
    explanation: string;
  } | null>(null);

  // Compact secondary modal for running an on-demand AI sample test
  const [showTestModal, setShowTestModal] = useState(false);
  const [genType, setGenType] = useState<"QUESTION" | "READING" | "EXERCISE">("QUESTION");
  const [genTopic, setGenTopic] = useState("");
  const [genPart, setGenPart] = useState("Part 5");
  const [genDifficulty, setGenDifficulty] = useState("650-750");
  const [generating, setGenerating] = useState(false);

  const showToast = useCallback((message: string, linkHref?: string, linkLabel?: string) => {
    setToast({ message, linkHref, linkLabel });
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  // Load queue from /api/admin/ai-review
  useEffect(() => {
    let active = true;
    getAiReviewQueue(status)
      .then((result) => {
        if (active) {
          setQueue(result);
          setLastSyncedAt(new Date());
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const errMsg = error instanceof Error ? error.message : "Không thể tải danh sách kiểm duyệt AI.";
          setLoadError(errMsg);
          // Auto-retry once after 3 seconds if initial load failed (e.g. backend container is still starting up)
          if (!errMsg.includes("quyền") && !errMsg.includes("hết hạn")) {
            window.setTimeout(() => {
              if (active) setReloadKey((k) => k + 1);
            }, 3000);
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, reloadKey]);

  // Load live moderation policy from /api/admin/settings
  useEffect(() => {
    let active = true;
    getSystemSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch(() => {
        // Keep null if unavailable
      });
    return () => {
      active = false;
    };
  }, []);

  // Load audit overview & AI telemetry when viewing AUDIT tab or refreshing
  useEffect(() => {
    if (activeView !== "AUDIT") return;
    let active = true;
    getAiReviewAudit(30)
      .then((data) => {
        if (active) {
          setAuditOverview(data);
          setLastSyncedAt(new Date());
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setActionError(
            error instanceof Error ? error.message : "Không thể tải nhật ký kiểm duyệt AI.",
          );
        }
      })
      .finally(() => {
        if (active) setAuditLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeView, reloadKey]);

  function openAuditView() {
    setActiveView("AUDIT");
    setAuditLoading(true);
    setActionError("");
    if (activeView === "AUDIT") {
      setReloadKey((key) => key + 1);
    }
  }

  function refreshQueue() {
    if (activeView === "AUDIT") {
      setAuditLoading(true);
    } else {
      setLoading(true);
    }
    setLoadError("");
    setReloadKey((key) => key + 1);
  }

  function selectStatus(nextStatus: AiReviewStatus) {
    setActiveView("QUEUE");
    setLoadError("");
    setConfirmRejectId(null);
    setRejectReason("");
    setEditingItemId(null);
    setEditDraft(null);
    if (nextStatus === status && activeView === "QUEUE") {
      refreshQueue();
      return;
    }
    setLoading(true);
    setStatus(nextStatus);
  }

  function getItemCriteria(itemId: string) {
    return (
      criteriaByItem[itemId] ?? {
        accuracy: true,
        language: true,
        format: true,
      }
    );
  }

  function toggleCriterion(itemId: string, criterionId: string, checked: boolean) {
    setCriteriaByItem((prev) => ({
      ...prev,
      [itemId]: {
        ...getItemCriteria(itemId),
        [criterionId]: checked,
      },
    }));
  }

  function startEditingItem(item: AiReviewItem) {
    const parsed = parsePayload(item.payload);
    const normalizedOptions: Record<string, string> = {};
    parsed.options.forEach((opt) => {
      normalizedOptions[opt.key] = opt.text;
    });
    if (Object.keys(normalizedOptions).length === 0) {
      normalizedOptions.A = "";
      normalizedOptions.B = "";
      normalizedOptions.C = "";
      normalizedOptions.D = "";
    }
    setConfirmRejectId(null);
    setEditingItemId(item.id);
    setEditDraft({
      title: parsed.title,
      passage: parsed.passage,
      formula: parsed.formula,
      question: parsed.question,
      options: normalizedOptions,
      correctAnswer: parsed.correctAnswer || "A",
      explanation: parsed.explanation,
    });
  }

  function cancelEditingItem() {
    setEditingItemId(null);
    setEditDraft(null);
  }

  async function saveEditedItem(item: AiReviewItem) {
    if (!editDraft || savingEditId) return;
    const baseObj =
      item.payload && typeof item.payload === "object" && !Array.isArray(item.payload)
        ? { ...(item.payload as Record<string, unknown>) }
        : {};

    if (editDraft.title.trim()) baseObj.title = editDraft.title.trim();
    if (editDraft.passage.trim() || "passage" in baseObj) {
      baseObj.passage = editDraft.passage.trim();
    }
    if (editDraft.formula.trim() || "formula" in baseObj) {
      baseObj.formula = editDraft.formula.trim();
    }
    if (editDraft.question.trim()) baseObj.question = editDraft.question.trim();
    if (Object.keys(editDraft.options).length > 0) {
      baseObj.options = editDraft.options;
    }
    if (editDraft.correctAnswer.trim()) {
      baseObj.correctAnswer = editDraft.correctAnswer.trim().toUpperCase();
    }
    if (editDraft.explanation.trim() || "explanation" in baseObj) {
      baseObj.explanation = editDraft.explanation.trim();
    }

    setSavingEditId(item.id);
    setActionError("");
    try {
      const updated = await updateAiContentPayload(item.id, baseObj);
      setQueue((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((row) => (row.id === updated.id ? updated : row)),
            }
          : prev,
      );
      setEditedIds((prev) => ({ ...prev, [updated.id]: true }));
      setEditingItemId(null);
      setEditDraft(null);
      showToast("Đã lưu bản hiệu chỉnh vào hệ thống. Bạn có thể bấm Duyệt ngay.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể lưu chỉnh sửa nội dung AI.",
      );
    } finally {
      setSavingEditId("");
    }
  }

  async function handleToggleModeration() {
    if (!settings || togglingModeration) return;
    setTogglingModeration(true);
    setActionError("");
    try {
      const nextEnabled = !settings.aiModerationEnabled;
      const updated = await updateSystemSettings({
        systemName: settings.systemName,
        supportEmail: settings.supportEmail,
        dailyStudyMinutes: settings.dailyStudyMinutes,
        reminderTime: settings.reminderTime,
        notifications: settings.notifications,
        aiModerationEnabled: nextEnabled,
        expectedVersion: settings.version,
      });
      setSettings(updated);
      showToast(
        nextEnabled
          ? "Đã bật Kiểm duyệt AI: đầu ra AI mới phải chờ Admin đánh giá trước khi đưa vào hệ thống."
          : "Đã tắt Kiểm duyệt AI: đầu ra AI mới sẽ được áp dụng tự động không qua hàng đợi.",
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật chính sách kiểm duyệt AI.",
      );
    } finally {
      setTogglingModeration(false);
    }
  }

  async function applyDecision(item: AiReviewItem, decision: "approve" | "reject") {
    if (savingId) return;
    setSavingId(item.id);
    setSavingDecision(decision);
    setActionError("");

    try {
      let updatedItem: AiReviewItem;
      if (decision === "approve") {
        updatedItem = await approveAiContent(item.id);
        const meta = CONTENT_TYPE_META[item.contentType];
        const targetLabel = updatedItem.publishedTarget?.targetLabel ?? meta.destinationLabel;
        showToast(
          `Đã duyệt đạt chuẩn — đồng bộ tới ${targetLabel}`,
          updatedItem.publishedTarget?.userUrl ?? meta.destinationHref,
          `Mở ${meta.destinationLabel}`,
        );
      } else {
        updatedItem = await rejectAiContent(item.id, {
          category: rejectCategory,
          reason: rejectReason.trim() || undefined,
        });
        showToast(`Đã từ chối đầu ra AI (${rejectCategory}) và ghi nhật ký kiểm toán.`);
      }

      setConfirmRejectId(null);
      setRejectReason("");
      setQueue((prev) => {
        if (!prev) return prev;
        const nextCounts = {
          pending: Math.max(0, prev.counts.pending - 1),
          approved: prev.counts.approved + (decision === "approve" ? 1 : 0),
          rejected: prev.counts.rejected + (decision === "reject" ? 1 : 0),
        };
        const nextItems =
          status === "PENDING"
            ? prev.items.filter((row) => row.id !== item.id)
            : prev.items.map((row) => (row.id === item.id ? updatedItem : row));
        return { items: nextItems, counts: nextCounts };
      });
      setLastSyncedAt(new Date());
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Không thể cập nhật quyết định kiểm duyệt.";
      setActionError(msg);
      if (msg.includes("409") || msg.toLowerCase().includes("trước đó")) {
        setConfirmRejectId(null);
        refreshQueue();
      }
    } finally {
      setSavingId("");
      setSavingDecision("");
    }
  }

  async function handleGenerateTestSample(e: React.FormEvent) {
    e.preventDefault();
    if (generating) return;
    const trimmedTopic = genTopic.trim();
    if (!trimmedTopic) {
      setActionError("Vui lòng nhập chủ đề để kiểm thử AI.");
      return;
    }
    setGenerating(true);
    setActionError("");
    try {
      const result = await generateAiContent({
        contentType: genType,
        topic: trimmedTopic,
        part: genPart,
        difficulty: genDifficulty,
      });
      setGenTopic("");
      setShowTestModal(false);

      const meta = CONTENT_TYPE_META[result.item.contentType];
      if (result.moderationRequired) {
        showToast("AI đã trả về đầu ra mới và đưa vào hàng đợi Chờ duyệt.");
      } else {
        showToast(
          result.message,
          result.publishedTarget?.userUrl ?? meta.destinationHref,
          `Mở ${meta.destinationLabel}`,
        );
      }

      const targetStatus: AiReviewStatus = result.moderationRequired ? "PENDING" : "APPROVED";
      if (status === targetStatus) {
        refreshQueue();
      } else {
        setLoading(true);
        setStatus(targetStatus);
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể kết nối Gemini AI lúc này.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const countForStatus = (current: AiReviewStatus) => {
    if (!queue) return 0;
    if (current === "ALL") {
      return queue.counts.pending + queue.counts.approved + queue.counts.rejected;
    }
    return current === "PENDING"
      ? queue.counts.pending
      : current === "APPROVED"
      ? queue.counts.approved
      : queue.counts.rejected;
  };

  const reviewedTotal = (queue?.counts.approved ?? 0) + (queue?.counts.rejected ?? 0);
  const approvalRate =
    reviewedTotal > 0 ? Math.round(((queue?.counts.approved ?? 0) / reviewedTotal) * 100) : null;

  const filteredItems = useMemo(() => {
    const base = queue?.items ?? [];
    const keyword = searchQuery.trim().toLowerCase();
    return base.filter((item) => {
      if (contentTypeFilter !== "ALL" && item.contentType !== contentTypeFilter) {
        return false;
      }
      if (!keyword) return true;
      const hay = [
        item.id,
        item.contentType,
        CONTENT_TYPE_META[item.contentType]?.label ?? "",
        item.interactionType,
        item.model ?? "",
        JSON.stringify(item.payload),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(keyword);
    });
  }, [queue, contentTypeFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-2xl"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="leading-relaxed">{toast.message}</span>
          {toast.linkHref && toast.linkLabel && (
            <Link
              href={toast.linkHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-500"
            >
              <span>{toast.linkLabel}</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* 1. 4 KPI Cards (bố cục co giãn linh hoạt cho màn hình nhỏ & lớn) */}
      <section className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => selectStatus("PENDING")}
          className={`rounded-2xl border bg-white p-3.5 sm:p-4 text-left shadow-2xs transition cursor-pointer flex flex-col justify-between h-full ${
            status === "PENDING"
              ? "border-amber-300 ring-1 ring-amber-200"
              : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 truncate">Chờ kiểm duyệt</span>
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-amber-800 tabular-nums">
              {queue?.counts.pending ?? 0}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">Đầu ra AI đang chờ Admin đánh giá</p>
        </button>

        <button
          type="button"
          onClick={() => selectStatus("APPROVED")}
          className={`rounded-2xl border bg-white p-3.5 sm:p-4 text-left shadow-2xs transition cursor-pointer flex flex-col justify-between h-full ${
            status === "APPROVED"
              ? "border-emerald-300 ring-1 ring-emerald-200"
              : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 truncate">Đạt chuẩn</span>
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <FileCheck2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {queue?.counts.approved ?? 0}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">Đã kiểm định &amp; áp dụng cho học viên</p>
        </button>

        <button
          type="button"
          onClick={() => selectStatus("REJECTED")}
          className={`rounded-2xl border bg-white p-3.5 sm:p-4 text-left shadow-2xs transition cursor-pointer flex flex-col justify-between h-full ${
            status === "REJECTED"
              ? "border-rose-300 ring-1 ring-rose-200"
              : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 truncate">Đã từ chối</span>
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <XCircle className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-rose-700 tabular-nums">
              {queue?.counts.rejected ?? 0}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">Bị chặn do sai lệch hoặc chưa đạt</p>
        </button>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 truncate">Tỷ lệ AI đạt chuẩn</span>
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1b41ae]">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {approvalRate !== null ? `${approvalRate}%` : "—"}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 tabular-nums leading-snug">
            {reviewedTotal > 0
              ? `${queue?.counts.approved ?? 0}/${reviewedTotal} mục đạt chuẩn`
              : "Tự động tính sau khi xử lý"}
          </p>
        </div>
      </section>

      {/* 2. Moderation Gate Policy Bar (tập trung kiểm soát AI, co giãn mượt mà theo kích thước màn hình) */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:px-5 sm:py-4 shadow-2xs">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            className={`mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${
              settings?.aiModerationEnabled !== false
                ? "bg-blue-50 text-[#1b41ae]"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Cơ chế kiểm soát đầu ra AI
              </h2>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  settings?.aiModerationEnabled !== false
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {settings === null
                  ? "Đang đồng bộ..."
                  : settings.aiModerationEnabled
                  ? "Bắt buộc kiểm duyệt"
                  : "Tự động bỏ qua duyệt"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {settings?.aiModerationEnabled === false
                ? "Đang tắt: đầu ra AI mới được áp dụng trực tiếp cho hệ thống học tập mà không dừng ở hàng chờ."
                : "Đang bật: mọi đầu ra AI mới đều bị giữ tại đây để Admin thẩm định và ghi nhật ký kiểm toán trước khi tới học viên."}
              {lastSyncedAt ? ` · Đồng bộ lúc ${formatClock(lastSyncedAt)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2.5 lg:pt-0 border-t border-slate-100 lg:border-0 w-full lg:w-auto justify-start lg:justify-end">
          {settings && (
            <button
              type="button"
              role="switch"
              aria-checked={settings.aiModerationEnabled}
              disabled={togglingModeration}
              onClick={() => void handleToggleModeration()}
              className="inline-flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              <span>Kiểm duyệt AI</span>
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  settings.aiModerationEnabled ? "bg-[#1b41ae]" : "bg-slate-300"
                }`}
              >
                <span
                  style={{ backgroundColor: "#ffffff" }}
                  className={`absolute top-0.5 size-4 rounded-full shadow-sm transition-all ${
                    settings.aiModerationEnabled ? "left-4.5" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setActionError("");
              setShowTestModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Bot aria-hidden="true" className="h-3.5 w-3.5 text-[#1b41ae]" />
            <span>Kiểm thử AI</span>
          </button>

          <button
            type="button"
            onClick={refreshQueue}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Tải lại</span>
          </button>
        </div>
      </section>

      {/* 3. Filter & Search Toolbar (Thanh công cụ co giãn thông minh không lo tràn vỡ) */}
      <section className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-3 sm:gap-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 2xl:pb-0 scrollbar-none max-w-full" role="tablist" aria-label="Lọc trạng thái kiểm duyệt">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={activeView === "QUEUE" && status === filter.value}
              onClick={() => selectStatus(filter.value)}
              className={`whitespace-nowrap shrink-0 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold transition cursor-pointer ${
                activeView === "QUEUE" && status === filter.value
                  ? "bg-[#1b41ae] text-white shadow-2xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {filter.label}{" "}
              {!loading && queue ? (
                <span className="ml-0.5 opacity-85 tabular-nums">({countForStatus(filter.value)})</span>
              ) : null}
            </button>
          ))}

          <button
            type="button"
            role="tab"
            aria-selected={activeView === "AUDIT"}
            onClick={openAuditView}
            className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold transition cursor-pointer ${
              activeView === "AUDIT"
                ? "bg-slate-900 text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Nhật ký &amp; Giám sát</span>
          </button>
        </div>

        {activeView === "QUEUE" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 2xl:pt-0 border-t border-slate-100 2xl:border-0 w-full 2xl:w-auto">
            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 p-1 overflow-x-auto max-w-full shrink-0 scrollbar-none">
              <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
              {CONTENT_TYPE_FILTERS.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setContentTypeFilter(ct.value)}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    contentTypeFilter === ct.value
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-0 w-full sm:w-64 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nội dung, model, ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-[#1b41ae] focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Error alerts */}
      {loadError ? (
        <section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <div className="flex items-start gap-3">
            <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold">Không thể tải danh sách kiểm duyệt</h2>
              <p className="mt-1 text-xs">{loadError}</p>
              <div className="mt-3 flex items-center gap-2">
                {loadError.includes("quyền") || loadError.includes("hết hạn") ? (
                  <Link
                    href="/login"
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition"
                  >
                    Đăng nhập lại với quyền Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={refreshQueue}
                  className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {actionError ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="rounded p-1 hover:bg-rose-100 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* Audit & AI Telemetry View */}
      {activeView === "AUDIT" ? (
        auditLoading && !auditOverview ? (
          <div
            role="status"
            className="flex min-h-44 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-500"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#1b41ae]" />
            <span>Đang tải nhật ký &amp; dữ liệu giám sát AI…</span>
          </div>
        ) : (
          <section className="space-y-4">
            {/* AI Telemetry Strip */}
            <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Tổng lượt AI hoạt động</span>
                    <Activity className="h-4 w-4 text-[#1b41ae]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
                    {auditOverview?.stats.total ?? 0}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Ghi nhận trong bảng <code>ai_interactions</code>
                </p>
              </div>

              <div className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Phản hồi thành công</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
                    {auditOverview && auditOverview.stats.total > 0
                      ? `${Math.round((auditOverview.stats.successCount / auditOverview.stats.total) * 100)}%`
                      : "—"}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-500 tabular-nums">
                  {auditOverview?.stats.successCount ?? 0} thành công · {auditOverview?.stats.failedCount ?? 0} lỗi
                </p>
              </div>

              <div className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>AI sinh học liệu</span>
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
                    {auditOverview?.stats.contentGenerationCount ?? 0}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Câu hỏi, Bài đọc, Bài tập</p>
              </div>

              <div className="flex flex-col justify-between h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Gia sư Chat AI học viên</span>
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
                    {auditOverview?.stats.tutorChatCount ?? 0}
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Lượt học viên hỏi đáp trực tiếp</p>
              </div>
            </div>

            {/* Rejection Error Breakdown */}
            {auditOverview && auditOverview.rejectionBreakdown.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Thống kê lỗi AI thường gặp (từ các mục đã từ chối)
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {auditOverview.rejectionBreakdown.map((entry) => (
                    <span
                      key={entry.category}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-900"
                    >
                      <span>{entry.category}</span>
                      <span className="rounded-md bg-rose-200/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                        {entry.count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Log Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nhật ký kiểm toán kiểm duyệt AI
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Truy vết đầy đủ mọi quyết định Duyệt, Từ chối (kèm lý do lỗi) và Hiệu chỉnh của Admin.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                  {auditOverview?.logs.length ?? 0} bản ghi gần nhất
                </span>
              </div>

              {!auditOverview || auditOverview.logs.length === 0 ? (
                <div className="px-6 py-10 text-center text-xs text-slate-500">
                  Chưa có thao tác kiểm duyệt nào được ghi nhận. Khi bạn bấm Hiệu chỉnh, Duyệt hoặc Từ chối, lịch sử sẽ hiện tại đây ngay lập tức.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {auditOverview.logs.map((entry) => {
                    const meta = AUDIT_ACTION_META[entry.action] ?? {
                      label: entry.action,
                      badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
                    };
                    return (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.badgeClass}`}
                            >
                              {meta.label}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                              <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                              {entry.actorName}
                            </span>
                            {entry.category && (
                              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                Lỗi: {entry.category}
                              </span>
                            )}
                            {entry.entityId && (
                              <code className="text-[10px] text-slate-400">
                                #{entry.entityId.slice(0, 8)}
                              </code>
                            )}
                          </div>
                          <p className="text-slate-600">{entry.summary}</p>
                          {entry.reason && (
                            <p className="text-[11px] italic text-rose-700">
                              Ghi chú: “{entry.reason}”
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )
      ) : null}

      {/* Loading state */}
      {activeView === "QUEUE" && loading ? (
        <div
          role="status"
          className="flex min-h-44 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-500"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-[#1b41ae]" />
          <span>Đang tải hàng đợi kiểm duyệt AI…</span>
        </div>
      ) : null}

      {/* Empty state */}
      {activeView === "QUEUE" && !loading && !loadError && filteredItems.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ShieldCheck aria-hidden="true" className="h-6 w-6" />
          </span>
          <h2 className="mt-3.5 text-base font-bold text-slate-900">
            {searchQuery || contentTypeFilter !== "ALL"
              ? "Không có mục nào khớp với bộ lọc hiện tại"
              : status === "PENDING"
              ? "Hàng đợi kiểm duyệt AI hiện đã sạch"
              : "Chưa có bản ghi lịch sử trong mục này"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-slate-500">
            {searchQuery || contentTypeFilter !== "ALL"
              ? "Hãy xóa từ khóa hoặc chuyển bộ lọc loại về Tất cả loại để xem lại danh sách."
              : "Mọi đầu ra AI mới sẽ tự động đổ về hàng đợi này khi bật Kiểm duyệt AI. Bạn có thể bấm Kiểm thử AI để gọi Gemini và kiểm chứng quy trình ngay."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {(searchQuery || contentTypeFilter !== "ALL") ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setContentTypeFilter("ALL");
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5 text-[#1b41ae]" />
                <span>Chạy kiểm thử đầu ra AI</span>
              </button>
            )}
          </div>
        </section>
      ) : null}

      {/* 4. Seamless AI Moderation Review Cards */}
      {activeView === "QUEUE" && !loading && !loadError && filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const parsed = parsePayload(item.payload);
            const qa = evaluateAutoQa(item, parsed);
            const statusMeta = STATUS_META[item.status];
            const typeMeta = CONTENT_TYPE_META[item.contentType];
            const isEditing = editingItemId === item.id;
            const isSavingThis = savingId === item.id;
            const criteria = getItemCriteria(item.id);
            const allChecked = QA_CRITERIA.every((c) => criteria[c.id]);

            const TypeIcon =
              item.contentType === "READING"
                ? BookOpen
                : item.contentType === "QUESTION"
                ? FileQuestion
                : Sparkles;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition hover:border-slate-300"
              >
                {/* Card Header: AI Audit Metadata + View Switcher */}
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1b41ae]">
                      <TypeIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">
                          {parsed.title || typeMeta.label}
                        </h2>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            qa.allOk
                              ? "border-emerald-200 bg-emerald-50/70 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {qa.allOk ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          <span>
                            {qa.passed}/{qa.total} kiểm tra cấu trúc
                          </span>
                        </span>
                        {editedIds[item.id] && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#1b41ae]">
                            Đã hiệu chỉnh
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <Bot className="h-3 w-3 text-[#1b41ae]" />
                          {item.model ?? "AI"}
                        </span>
                        <span>·</span>
                        <span>{INTERACTION_TYPE_LABELS[item.interactionType] ?? item.interactionType}</span>
                        {parsed.part && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-slate-700">{parsed.part}</span>
                          </>
                        )}
                        {parsed.difficulty && (
                          <>
                            <span>·</span>
                            <span>{parsed.difficulty}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDate(item.createdAt)}</span>
                        <span>·</span>
                        <code className="text-[10px] text-slate-500">#{item.id.slice(0, 8)}</code>
                      </div>
                    </div>
                  </div>

                  {/* Edit action */}
                  <div className="flex items-center gap-1.5">
                    {item.status === "PENDING" && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startEditingItem(item)}
                        disabled={isSavingThis}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Hiệu chỉnh</span>
                      </button>
                    )}
                  </div>
                </header>

                {/* Card Body */}
                <div className="p-5">
                  {isEditing && editDraft ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Tiêu đề
                        </label>
                        <input
                          type="text"
                          value={editDraft.title}
                          onChange={(e) =>
                            setEditDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#1b41ae] focus:outline-none"
                        />
                      </div>

                      {(editDraft.passage || item.contentType === "READING") && (
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Đoạn văn / Ngữ cảnh
                          </label>
                          <textarea
                            rows={4}
                            value={editDraft.passage}
                            onChange={(e) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, passage: e.target.value } : prev,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs leading-relaxed text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                          />
                        </div>
                      )}

                      {(editDraft.formula || item.contentType === "EXERCISE") && (
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Công thức / Cấu trúc
                          </label>
                          <textarea
                            rows={2}
                            value={editDraft.formula}
                            onChange={(e) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, formula: e.target.value } : prev,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs leading-relaxed text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Nội dung câu hỏi
                        </label>
                        <textarea
                          rows={2}
                          value={editDraft.question}
                          onChange={(e) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, question: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#1b41ae] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            4 đáp án (bấm A/B/C/D để đổi đáp án đúng)
                          </label>
                          <span className="text-[11px] font-bold text-emerald-700">
                            Đáp án đúng: {editDraft.correctAnswer || "—"}
                          </span>
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {Object.entries(editDraft.options).map(([key, val]) => {
                            const isSelected =
                              editDraft.correctAnswer.toUpperCase() === key.toUpperCase();
                            return (
                              <div
                                key={key}
                                className={`flex items-center gap-2 rounded-xl border p-2 ${
                                  isSelected
                                    ? "border-emerald-300 bg-emerald-50/60"
                                    : "border-slate-200 bg-slate-50/40"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditDraft((prev) =>
                                      prev ? { ...prev, correctAnswer: key.toUpperCase() } : prev,
                                    )
                                  }
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                                    isSelected
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                  }`}
                                >
                                  {key}
                                </button>
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) =>
                                    setEditDraft((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            options: { ...prev.options, [key]: e.target.value },
                                          }
                                        : prev,
                                    )
                                  }
                                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Giải thích đáp án
                        </label>
                        <textarea
                          rows={3}
                          value={editDraft.explanation}
                          onChange={(e) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, explanation: e.target.value } : prev,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs leading-relaxed text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditingItem}
                          disabled={savingEditId === item.id}
                          className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Hủy sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => void saveEditedItem(item)}
                          disabled={savingEditId === item.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] disabled:opacity-50 cursor-pointer"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>{savingEditId === item.id ? "Đang lưu..." : "Lưu hiệu chỉnh"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {parsed.summary && (
                        <p className="text-xs leading-relaxed text-slate-600">{parsed.summary}</p>
                      )}

                      {parsed.formula && (
                        <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 p-3.5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-700">
                            Công thức / Cấu trúc
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-xs font-medium leading-relaxed text-slate-900">
                            {parsed.formula}
                          </p>
                          {(parsed.signalWords.length > 0 || parsed.traps.length > 0) && (
                            <div className="mt-2.5 grid gap-2 border-t border-indigo-200/50 pt-2.5 sm:grid-cols-2">
                              {parsed.signalWords.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase text-indigo-600">
                                    Dấu hiệu nhận biết
                                  </p>
                                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-700">
                                    {parsed.signalWords.map((w) => (
                                      <li key={w}>{w}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {parsed.traps.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase text-rose-600">
                                    Bẫy thường gặp
                                  </p>
                                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-slate-700">
                                    {parsed.traps.map((t) => (
                                      <li key={t}>{t}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {parsed.passage && (
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                              Đoạn văn Reading
                            </p>
                            {parsed.passageTextVi && (
                              <button
                                type="button"
                                onClick={() =>
                                  setViToggleIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#1b41ae] cursor-pointer"
                              >
                                {viToggleIds[item.id] ? "Ẩn bản dịch" : "Xem bản dịch Việt"}
                              </button>
                            )}
                          </div>
                          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                            {parsed.passage}
                          </p>
                          {viToggleIds[item.id] && parsed.passageTextVi && (
                            <p className="mt-3 border-t border-slate-200/80 pt-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                              {parsed.passageTextVi}
                            </p>
                          )}
                        </div>
                      )}

                      {parsed.question && (
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Câu hỏi
                            </p>
                            {parsed.skill && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {parsed.skill}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">
                            {parsed.question}
                          </p>

                          {parsed.options.length > 0 && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {parsed.options.map((opt) => {
                                const isCorrect =
                                  parsed.correctAnswer &&
                                  opt.key.toUpperCase() === parsed.correctAnswer.toUpperCase();
                                return (
                                  <div
                                    key={opt.key}
                                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                                      isCorrect
                                        ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-950"
                                        : "border-slate-200 bg-slate-50/50 text-slate-700"
                                    }`}
                                  >
                                    <span
                                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                                        isCorrect
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-200/80 text-slate-700"
                                      }`}
                                    >
                                      {opt.key}
                                    </span>
                                    <span className="leading-relaxed">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {parsed.explanation && (
                        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3.5">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                            Giải thích đáp án
                            {parsed.correctAnswer ? ` · Đáp án đúng: ${parsed.correctAnswer}` : ""}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                            {parsed.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Seamless Inline Decision Bar with Rejection Reason Taxonomy */}
                <footer className="border-t border-slate-100 bg-slate-50/70 p-3.5 sm:px-5 sm:py-3">
                  {item.status === "PENDING" ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">Thẩm định:</span>
                          {QA_CRITERIA.map((criterion) => {
                            const checked = Boolean(criteria[criterion.id]);
                            return (
                              <label
                                key={criterion.id}
                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                                  checked
                                    ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) =>
                                    toggleCriterion(item.id, criterion.id, e.target.checked)
                                  }
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                                />
                                <span>{criterion.label}</span>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-200/60 lg:border-0 w-full lg:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmRejectId(confirmRejectId === item.id ? null : item.id);
                              setRejectCategory(REJECTION_CATEGORIES[0]);
                              setRejectReason("");
                            }}
                            disabled={isSavingThis || isEditing}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-45 cursor-pointer ${
                              confirmRejectId === item.id
                                ? "border-rose-300 bg-rose-50 text-rose-800"
                                : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Từ chối</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void applyDecision(item, "approve")}
                            disabled={isSavingThis || isEditing || !allChecked}
                            title={
                              isEditing
                                ? "Hãy lưu hiệu chỉnh trước khi duyệt"
                                : !allChecked
                                ? "Đánh dấu đủ 3 tiêu chí thẩm định để duyệt"
                                : `Xác nhận đạt chuẩn và đồng bộ vào ${typeMeta.destinationLabel}`
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>
                              {isSavingThis && savingDecision === "approve"
                                ? "Đang duyệt..."
                                : "Xác nhận đạt chuẩn"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Inline Rejection Reason Drawer (gắn nhãn lỗi AI để cải thiện chất lượng) */}
                      {confirmRejectId === item.id && (
                        <div className="space-y-2.5 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-rose-900">
                              Chọn lý do từ chối đầu ra AI (lưu vào nhật ký kiểm toán):
                            </span>
                            <button
                              type="button"
                              onClick={() => setConfirmRejectId(null)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              Đóng
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {REJECTION_CATEGORIES.map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setRejectCategory(category)}
                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                                  rejectCategory === category
                                    ? "border-rose-600 bg-rose-700 text-white"
                                    : "border-rose-200 bg-white text-rose-800 hover:bg-rose-100/60"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Ghi chú thêm (tùy chọn, VD: Đáp án C mới khớp thì động từ)..."
                              className="min-w-0 flex-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => void applyDecision(item, "reject")}
                              disabled={isSavingThis}
                              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>
                                {isSavingThis && savingDecision === "reject"
                                  ? "Đang từ chối..."
                                  : "Xác nhận từ chối"}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : item.status === "APPROVED" ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="inline-flex flex-wrap items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>
                          Đã duyệt đạt chuẩn
                          {item.reviewerName ? (
                            <>
                              {" "}bởi <strong>{item.reviewerName}</strong>
                            </>
                          ) : null}
                          {item.reviewedAt ? ` lúc ${formatDate(item.reviewedAt)}` : ""} · đã đồng bộ vào{" "}
                          <strong>{typeMeta.destinationLabel}</strong>.
                        </span>
                      </span>
                      <Link
                        href={typeMeta.destinationHref}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 font-semibold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        <span>Xem tại {typeMeta.destinationLabel}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1 text-[11px] text-rose-800">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                        <span>
                          Đã từ chối
                          {item.reviewerName ? (
                            <>
                              {" "}bởi <strong>{item.reviewerName}</strong>
                            </>
                          ) : null}
                          {item.reviewedAt ? ` lúc ${formatDate(item.reviewedAt)}` : ""} — bị chặn, không đưa tới học viên.
                        </span>
                        {item.reviewCategory && (
                          <span className="rounded-md border border-rose-200 bg-rose-100/70 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                            Lý do: {item.reviewCategory}
                          </span>
                        )}
                      </div>
                      {item.reviewNote && (
                        <p className="pl-5 text-rose-700 italic">Ghi chú: “{item.reviewNote}”</p>
                      )}
                    </div>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      ) : null}

      {/* 5. Secondary Modal: On-Demand AI Pipeline Test (tách riêng, không làm loãng màn hình kiểm duyệt) */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3.5 sm:p-4 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-test-modal-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1b41ae]">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="ai-test-modal-title" className="text-sm font-bold text-slate-900">
                    Kiểm thử đầu ra Gemini AI
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Gọi AI tạo 1 mẫu thực tế để kiểm chứng cơ chế kiểm duyệt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                disabled={generating}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleGenerateTestSample(e)} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              <div
                className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
                  settings?.aiModerationEnabled === false
                    ? "border-amber-200 bg-amber-50/70 text-amber-900"
                    : "border-blue-200 bg-blue-50/60 text-slate-700"
                }`}
              >
                {settings?.aiModerationEnabled === false
                  ? "Chế độ Kiểm duyệt AI đang TẮT: kết quả AI trả về sẽ tự động đánh dấu Đạt chuẩn và đồng bộ thẳng vào kho học tập."
                  : "Chế độ Kiểm duyệt AI đang BẬT: kết quả AI trả về sẽ nằm ở mục Chờ duyệt để Admin kiểm tra trước."}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Loại đầu ra
                  </label>
                  <select
                    value={genType}
                    onChange={(e) => {
                      const next = e.target.value as "QUESTION" | "READING" | "EXERCISE";
                      setGenType(next);
                      setGenPart(next === "READING" ? "Part 7" : "Part 5");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                  >
                    <option value="QUESTION">Câu hỏi TOEIC</option>
                    <option value="READING">Bài đọc Reading</option>
                    <option value="EXERCISE">Bài tập Ngữ pháp</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Part</label>
                    <select
                      value={genPart}
                      onChange={(e) => setGenPart(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                    >
                      <option value="Part 5">Part 5</option>
                      <option value="Part 6">Part 6</option>
                      <option value="Part 7">Part 7</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Mức điểm</label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-[#1b41ae] focus:outline-none"
                    >
                      <option value="450-550">450-550</option>
                      <option value="550-650">550-650</option>
                      <option value="650-750">650-750</option>
                      <option value="750-850">750-850</option>
                      <option value="850-900+">850-900+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Chủ đề kiểm thử
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="VD: Email thông báo đổi lịch họp, Mệnh đề quan hệ..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#1b41ae] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  disabled={generating}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={generating || !genTopic.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b41ae] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#15348f] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${generating ? "animate-pulse" : ""}`} />
                  <span>{generating ? "Đang gọi Gemini..." : "Chạy kiểm thử"}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
