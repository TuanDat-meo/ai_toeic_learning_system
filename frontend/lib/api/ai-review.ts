import { apiRequest, postAuthRequest } from "./client";

export type AiReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export type AiReviewItem = {
  id: string;
  contentType: "QUESTION" | "READING" | "EXERCISE";
  payload: Record<string, unknown> | unknown[];
  status: Exclude<AiReviewStatus, "ALL">;
  interactionType: string;
  model: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type AiReviewQueue = {
  items: AiReviewItem[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
};

export function getAiReviewQueue(status: AiReviewStatus = "PENDING", limit = 50) {
  const params = new URLSearchParams({ status, limit: String(limit) });
  return apiRequest<AiReviewQueue>(`/api/admin/ai-review?${params.toString()}`);
}

export function approveAiContent(contentId: string) {
  return postAuthRequest<AiReviewItem>(
    `/api/admin/ai-review/${encodeURIComponent(contentId)}/approve`,
  );
}

export function rejectAiContent(contentId: string) {
  return postAuthRequest<AiReviewItem>(
    `/api/admin/ai-review/${encodeURIComponent(contentId)}/reject`,
  );
}
