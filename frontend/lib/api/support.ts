import { apiRequest, writeAuthRequest } from "@/lib/api/client";

export type SupportReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
export type SupportReportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SupportReportCategory = "QUESTION_ERROR" | "SYSTEM_BUG" | "UI_FEEDBACK" | "ACCOUNT_ISSUE" | "OTHER";

export type SupportReport = {
  id: string;
  ticketCode: string;
  userName: string;
  userEmail: string;
  category: SupportReportCategory;
  title: string;
  description: string;
  relatedContent?: string;
  priority: SupportReportPriority;
  status: SupportReportStatus;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  source?: "READING" | "LISTENING" | "MOCK_TEST" | "QUESTION_BANK" | "OTHER";
  questionRef?: string;
  questionSnapshot?: Record<string, unknown> | null;
  correction?: Record<string, unknown> | null;
  reporterId?: string;
};

export type SupportReportCreate = Pick<SupportReport, "category" | "title" | "description"> & {
  source: NonNullable<SupportReport["source"]>;
  questionRef?: string;
  questionSnapshot?: Record<string, unknown>;
  relatedContent?: string;
};

export type SupportReportUpdate = {
  status: SupportReportStatus;
  adminReply?: string;
  correction?: Record<string, unknown>;
  priority?: SupportReportPriority;
};

export type AnnouncementType = "SYSTEM" | "FEATURE_UPDATE" | "PROMOTION" | "EVENT";
export type AnnouncementTarget = "ALL" | "FREE_USERS" | "VIP_USERS";
export type AnnouncementStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: AnnouncementType;
  target: AnnouncementTarget;
  status: AnnouncementStatus;
  isPinned: boolean;
  actionUrl?: string;
  readCount: number;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
};

export type AnnouncementInput = Pick<Announcement, "title" | "summary" | "content" | "type" | "target" | "status" | "isPinned"> & { actionUrl?: string };

export async function getReports(): Promise<SupportReport[]> {
  const reports = await apiRequest<SupportReport[]>("/api/admin/support/reports");
  if (!Array.isArray(reports)) throw new Error("Backend returned an invalid support report list.");
  return reports;
}

export async function createSupportReport(report: SupportReportCreate): Promise<SupportReport> {
  return writeAuthRequest<SupportReport>("POST", "/api/support-reports", report);
}

export async function updateSupportReport(id: string, update: SupportReportUpdate): Promise<SupportReport> {
  return writeAuthRequest<SupportReport>("PATCH", `/api/admin/support/reports/${id}`, update);
}

export async function getMySupportReports(): Promise<SupportReport[]> {
  const reports = await apiRequest<SupportReport[]>("/api/support-reports/mine");
  if (!Array.isArray(reports)) throw new Error("Backend returned an invalid personal support report list.");
  return reports;
}

export async function deleteSupportReport(id: string): Promise<void> {
  await writeAuthRequest<void>("DELETE", `/api/admin/support/reports/${id}`);
}

export async function batchUpdateSupportReports(ids: string[], status: SupportReportStatus): Promise<void> {
  await Promise.all(ids.map((id) => updateSupportReport(id, { status })));
}

export async function batchDeleteSupportReports(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteSupportReport(id)));
}

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  referenceId?: string;
  createdAt: string;
};

export async function getNotifications(limit = 30): Promise<AppNotification[]> {
  const list = await apiRequest<AppNotification[]>(`/api/notifications?limit=${limit}`);
  return Array.isArray(list) ? list : [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const res = await apiRequest<{ unreadCount: number }>('/api/notifications/unread-count');
    return res?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await writeAuthRequest<void>("PATCH", `/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await writeAuthRequest<void>("PATCH", "/api/notifications/read-all");
}

export async function deleteNotification(id: string): Promise<void> {
  await writeAuthRequest<void>("DELETE", `/api/notifications/${id}`);
}

export type QuestionCorrection = {
  questionText?: string;
  options?: string[] | Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
  passage?: string;
};

export async function getQuestionCorrection(questionRef: string): Promise<QuestionCorrection | null> {
  return apiRequest<QuestionCorrection | null>(`/api/question-corrections/${encodeURIComponent(questionRef)}`);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return apiRequest<Announcement[]>("/api/admin/announcements");
}

export function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  return writeAuthRequest<Announcement>("POST", "/api/admin/announcements", input);
}

export function updateAnnouncement(id: string, input: AnnouncementInput): Promise<Announcement> {
  return writeAuthRequest<Announcement>("PUT", `/api/admin/announcements/${id}`, input);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await writeAuthRequest<void>("DELETE", `/api/admin/announcements/${id}`);
}

export function getStudentAnnouncements(): Promise<Announcement[]> {
  return apiRequest<Announcement[]>("/api/announcements");
}

export async function markAnnouncementRead(id: string): Promise<void> {
  await writeAuthRequest<void>("PATCH", `/api/announcements/${id}/read`);
}

export async function markAllAnnouncementsRead(): Promise<void> {
  try {
    await writeAuthRequest<void>("PATCH", "/api/announcements/read-all");
  } catch {
    // Graceful fallback for backward compatibility
    const all = await getStudentAnnouncements();
    const unread = all.filter((a) => !a.isRead);
    await Promise.all(unread.map((a) => markAnnouncementRead(a.id)));
  }
}
