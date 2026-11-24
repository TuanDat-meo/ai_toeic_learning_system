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
  source?: "READING" | "LISTENING" | "MOCK_TEST" | "QUESTION_BANK" | "GRAMMAR" | "OTHER";
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

export type ActionDestination = {
  label: string;
  url: string;
  description: string;
  buttonText: string;
};

export const PRESET_ACTION_DESTINATIONS: ActionDestination[] = [
  {
    label: "🎯 Đề thi thử Full Test (ETS)",
    url: "/mock-tests",
    description: "Chuyển học viên đến phòng thi thử 200 câu chuẩn ETS 2026",
    buttonText: "Vào thi thử ngay",
  },
  {
    label: "📖 Luyện đọc Reading (Part 5, 6, 7)",
    url: "/reading",
    description: "Chuyển học viên đến danh sách bài luyện đọc và giải thích chi tiết",
    buttonText: "Luyện đọc ngay",
  },
  {
    label: "🎧 Luyện nghe Listening (Part 1, 2, 3, 4)",
    url: "/listening",
    description: "Chuyển học viên đến kho luyện nghe Audio chuẩn giọng ETS",
    buttonText: "Luyện nghe ngay",
  },
  {
    label: "📚 Học Từ vựng & Flashcards",
    url: "/vocabulary",
    description: "Chuyển học viên đến bộ từ vựng 3000 từ và minigame ôn tập",
    buttonText: "Học từ vựng ngay",
  },
  {
    label: "📝 Ngữ pháp TOEIC trọng tâm",
    url: "/grammar",
    description: "Chuyển học viên đến chuyên đề ngữ pháp và bẫy thi thường gặp",
    buttonText: "Học ngữ pháp ngay",
  },
  {
    label: "💎 Nâng cấp Gói học VIP & Khuyến mãi",
    url: "/billing/subscriptions",
    description: "Chuyển học viên đến bảng giá và cổng đăng ký tài khoản VIP",
    buttonText: "Xem ưu đãi ngay",
  },
  {
    label: "👥 Cộng đồng & Thảo luận TOEIC",
    url: "/community",
    description: "Chuyển học viên đến không gian hỏi đáp và chia sẻ kinh nghiệm",
    buttonText: "Vào cộng đồng ngay",
  },
  {
    label: "🏠 Bảng điều khiển học tập (Trang chủ)",
    url: "/dashboard",
    description: "Chuyển học viên về trang tổng quan tiến độ học tập cá nhân",
    buttonText: "Xem bảng điều khiển",
  },
];

export function resolveStudentActionUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '/dashboard';
  const trimmed = url.trim();
  if (!trimmed || trimmed === '/') return '/dashboard';

  // Điều hướng an toàn nếu admin nhập đường dẫn quản trị hoặc đường dẫn cũ
  if (trimmed.startsWith('/admin/content/mock-tests')) return '/mock-tests';
  if (trimmed.startsWith('/admin/content/reading')) return '/reading';
  if (trimmed.startsWith('/admin/content/listening')) return '/listening';
  if (trimmed.startsWith('/admin/content/grammar')) return '/grammar';
  if (trimmed.startsWith('/admin/content/vocabulary')) return '/vocabulary';
  if (trimmed.startsWith('/admin/content/questions')) return '/questions';
  if (trimmed.startsWith('/admin')) return '/dashboard';
  if (trimmed.startsWith('/practice/reading')) return '/reading';
  if (trimmed.startsWith('/practice/listening')) return '/listening';
  if (trimmed.startsWith('/practice/mock-tests')) return '/mock-tests';

  return trimmed;
}

export function getActionUrlLabel(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return 'Khám phá ngay';
  const target = resolveStudentActionUrl(url);
  const matched = PRESET_ACTION_DESTINATIONS.find((d) => d.url === target);
  if (matched) return matched.buttonText;
  if (target.startsWith('/billing')) return 'Xem ưu đãi ngay';
  if (target.startsWith('/mock-tests')) return 'Vào thi thử ngay';
  if (target.startsWith('/reading')) return 'Luyện đọc ngay';
  if (target.startsWith('/listening')) return 'Luyện nghe ngay';
  if (target.startsWith('/vocabulary')) return 'Học từ vựng ngay';
  if (target.startsWith('/grammar')) return 'Học ngữ pháp ngay';
  if (target.startsWith('/community')) return 'Vào cộng đồng ngay';
  return 'Khám phá ngay';
}

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

export function sanitizeNotification(item: AppNotification): AppNotification {
  return {
    ...item,
    title: normalizeLineBreaks(item.title).trim(),
    message: normalizeLineBreaks(item.message).trim(),
  };
}

export async function getNotifications(limit = 30): Promise<AppNotification[]> {
  const list = await apiRequest<AppNotification[]>(`/api/notifications?limit=${limit}`);
  return Array.isArray(list) ? list.map(sanitizeNotification) : [];
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

export function normalizeLineBreaks(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, " ");
}

export function sanitizeAnnouncement(item: Announcement): Announcement {
  return {
    ...item,
    title: normalizeLineBreaks(item.title).trim(),
    summary: normalizeLineBreaks(item.summary),
    content: normalizeLineBreaks(item.content),
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const list = await apiRequest<Announcement[]>("/api/admin/announcements");
  return Array.isArray(list) ? list.map(sanitizeAnnouncement) : [];
}

export function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  const sanitized = {
    ...input,
    title: normalizeLineBreaks(input.title).trim(),
    summary: normalizeLineBreaks(input.summary),
    content: normalizeLineBreaks(input.content),
  };
  return writeAuthRequest<Announcement>("POST", "/api/admin/announcements", sanitized);
}

export function updateAnnouncement(id: string, input: AnnouncementInput): Promise<Announcement> {
  const sanitized = {
    ...input,
    title: normalizeLineBreaks(input.title).trim(),
    summary: normalizeLineBreaks(input.summary),
    content: normalizeLineBreaks(input.content),
  };
  return writeAuthRequest<Announcement>("PUT", `/api/admin/announcements/${id}`, sanitized);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await writeAuthRequest<void>("DELETE", `/api/admin/announcements/${id}`);
}

export async function getStudentAnnouncements(): Promise<Announcement[]> {
  const list = await apiRequest<Announcement[]>("/api/announcements");
  return Array.isArray(list) ? list.map(sanitizeAnnouncement) : [];
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
