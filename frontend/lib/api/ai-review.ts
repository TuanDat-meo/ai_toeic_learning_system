import { apiRequest, postAuthRequest, writeAuthRequest } from "./client";

export type AiReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export type PublishedTarget = {
  targetType: "QUESTION_BANK" | "READING_CARD" | "GRAMMAR_TOPIC" | string;
  targetId: string;
  targetLabel: string;
  userUrl: string;
  adminUrl: string;
};

export type AiReviewItem = {
  id: string;
  contentType: "QUESTION" | "READING" | "EXERCISE";
  payload: Record<string, unknown> | unknown[];
  status: Exclude<AiReviewStatus, "ALL">;
  interactionType: string;
  model: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewerName?: string | null;
  reviewCategory?: string | null;
  reviewNote?: string | null;
  publishedTarget?: PublishedTarget | null;
};

export type AiReviewQueue = {
  items: AiReviewItem[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
};

export type AiAuditOverview = {
  stats: {
    total: number;
    successCount: number;
    failedCount: number;
    contentGenerationCount: number;
    tutorChatCount: number;
  };
  logs: Array<{
    id: string;
    action: string;
    entityId: string | null;
    actorName: string;
    summary: string;
    category: string | null;
    reason: string | null;
    createdAt: string;
  }>;
  rejectionBreakdown: Array<{
    category: string;
    count: number;
  }>;
};

export type GenerateAiContentRequest = {
  contentType: "QUESTION" | "READING" | "EXERCISE";
  topic: string;
  part: string;
  difficulty: string;
};

export type GenerateAiContentResult = {
  item: AiReviewItem;
  moderationRequired: boolean;
  publishedTarget: PublishedTarget | null;
  message: string;
};

export function getAiReviewQueue(status: AiReviewStatus = "PENDING", limit = 50) {
  const params = new URLSearchParams({ status, limit: String(limit) });
  return apiRequest<AiReviewQueue>(`/api/admin/ai-review?${params.toString()}`);
}

export function getAiReviewAudit(limit = 30) {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiRequest<AiAuditOverview>(`/api/admin/ai-review/audit?${params.toString()}`);
}

export function generateAiContent(request: GenerateAiContentRequest) {
  return postAuthRequest<GenerateAiContentResult>("/api/admin/ai-review/generate", request);
}

export function updateAiContentPayload(contentId: string, payload: Record<string, unknown>) {
  return writeAuthRequest<AiReviewItem>(
    "PUT",
    `/api/admin/ai-review/${encodeURIComponent(contentId)}`,
    payload,
  );
}

export function approveAiContent(contentId: string) {
  return postAuthRequest<AiReviewItem>(
    `/api/admin/ai-review/${encodeURIComponent(contentId)}/approve`,
  );
}

export function rejectAiContent(
  contentId: string,
  details?: { category?: string; reason?: string },
) {
  return postAuthRequest<AiReviewItem>(
    `/api/admin/ai-review/${encodeURIComponent(contentId)}/reject`,
    details ?? {},
  );
}
