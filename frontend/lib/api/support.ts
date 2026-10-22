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

export const initialReports: SupportReport[] = [
  {
    id: "rep-101",
    ticketCode: "TK-9081",
    userName: "Nguyen Van An",
    userEmail: "an.nguyen@gmail.com",
    category: "QUESTION_ERROR",
    title: "Đáp án câu 104 Part 5 bị sai ngữ pháp",
    description: "Câu hỏi yêu cầu điền trạng từ nhưng đáp án đúng hiển thị lại là tính từ. Nhờ ban quản trị kiểm tra lại giải thích AI.",
    relatedContent: "Part 5 - Question #1042 (Verb Form)",
    priority: "HIGH",
    status: "PENDING",
    createdAt: "2026-10-04T14:30:00Z",
    updatedAt: "2026-10-04T14:30:00Z",
  },
  {
    id: "rep-102",
    ticketCode: "TK-9082",
    userName: "Tran Thi Mai",
    userEmail: "mai.tran@yahoo.com",
    category: "SYSTEM_BUG",
    title: "Lỗi không phát được Audio trong Part 1 Listening",
    description: "Khi bấm play bài nghe Part 1 câu 3 thì trình duyệt báo lỗi HTML5 Audio Error 404.",
    relatedContent: "Part 1 Listening - ETS Test 02",
    priority: "URGENT",
    status: "IN_PROGRESS",
    adminReply: "Đội ngũ kỹ thuật đang kiểm tra CDN lưu trữ tệp mp3. Dự kiến khắc phục trong 1 giờ.",
    repliedAt: "2026-10-04T16:00:00Z",
    createdAt: "2026-10-04T15:10:00Z",
    updatedAt: "2026-10-04T16:00:00Z",
  },
  {
    id: "rep-103",
    ticketCode: "TK-9083",
    userName: "Le Hoang Nam",
    userEmail: "nam.lh@outlook.com",
    category: "UI_FEEDBACK",
    title: "Đề xuất chế độ Dark Mode cho giao diện làm bài Full Test",
    description: "Làm bài thi 2 tiếng nhìn màn hình trắng khá mỏi mắt. Hi vọng hệ thống bổ sung theme tối.",
    priority: "MEDIUM",
    status: "RESOLVED",
    adminReply: "Cảm ơn đóng góp của bạn! Chức năng Dark mode đã được đưa vào roadmap phiên bản v2.1.",
    repliedAt: "2026-10-03T10:20:00Z",
    createdAt: "2026-10-02T09:15:00Z",
    updatedAt: "2026-10-03T10:20:00Z",
  },
  {
    id: "rep-104",
    ticketCode: "TK-9084",
    userName: "Pham Quoc Bao",
    userEmail: "baopq@toeic.edu.vn",
    category: "ACCOUNT_ISSUE",
    title: "Không nhận được email kích hoạt VIP sau khi chuyển khoản",
    description: "Tôi đã chuyển khoản gói 6 tháng mã đơn HD-8821 nhưng tài khoản vẫn báo Free.",
    relatedContent: "Giao dịch #HD-8821",
    priority: "HIGH",
    status: "RESOLVED",
    adminReply: "Đã xác minh thanh toán thành công và kích hoạt gói VIP 6 tháng cho tài khoản baopq@toeic.edu.vn.",
    repliedAt: "2026-10-04T11:45:00Z",
    createdAt: "2026-10-04T10:00:00Z",
    updatedAt: "2026-10-04T11:45:00Z",
  },
  {
    id: "rep-105",
    ticketCode: "TK-9085",
    userName: "Vo Tuyet Nhi",
    userEmail: "nhi.vt@gmail.com",
    category: "QUESTION_ERROR",
    title: "Bản dịch tiếng Việt bài đọc Part 7 thiếu đoạn cuối",
    description: "Bài đọc 3 đoạn văn email phản hồi khách hàng bị mất 2 câu cuối ở phần dịch nghĩa AI.",
    relatedContent: "Part 7 Passage #409",
    priority: "LOW",
    status: "PENDING",
    createdAt: "2026-10-05T08:00:00Z",
    updatedAt: "2026-10-05T08:00:00Z",
  }
];

export const LOCAL_REPORTS_KEY = "toeic_support_reports";

function getLocalReports(): SupportReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: SupportReport[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent("toeic-support-report-updated", { detail: reports }));
  } catch (e) {
    console.warn("Could not save support reports to localStorage:", e);
  }
}

export async function getReports(): Promise<SupportReport[]> {
  const localList = getLocalReports();
  try {
    const serverList = await apiRequest<SupportReport[]>("/api/admin/support/reports");
    if (Array.isArray(serverList) && serverList.length > 0) {
      const map = new Map<string, SupportReport>();
      localList.forEach((r) => map.set(r.id, r));
      serverList.forEach((r) => map.set(r.id, r));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalReports(merged);
      return merged;
    }
  } catch (error) {
    console.warn("Failed to fetch reports from API, using local/initial reports:", error);
  }

  if (localList.length > 0) {
    return localList;
  }
  saveLocalReports(initialReports);
  return initialReports;
}

export async function createSupportReport(report: SupportReportCreate): Promise<SupportReport> {
  const localReport: SupportReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ticketCode: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
    userName: "Học viên (Bạn)",
    userEmail: "learner@toeic.edu.vn",
    category: report.category,
    title: report.title,
    description: report.description,
    relatedContent: report.relatedContent,
    priority: report.category === "QUESTION_ERROR" || report.category === "SYSTEM_BUG" ? "HIGH" : "MEDIUM",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: report.source,
    questionRef: report.questionRef,
    questionSnapshot: report.questionSnapshot || null,
  };

  try {
    const serverCreated = await writeAuthRequest<SupportReport>("POST", "/api/support-reports", report);
    if (serverCreated && serverCreated.id) {
      const merged = { ...localReport, ...serverCreated };
      const current = getLocalReports();
      saveLocalReports([merged, ...current.filter((r) => r.id !== merged.id)]);
      return merged;
    }
  } catch (error) {
    console.warn("Backend support report submission offline, saved to localStorage:", error);
  }

  const current = getLocalReports().length > 0 ? getLocalReports() : [...initialReports];
  const updatedList = [localReport, ...current.filter((r) => r.id !== localReport.id)];
  saveLocalReports(updatedList);
  return localReport;
}

export async function updateSupportReport(id: string, update: SupportReportUpdate): Promise<SupportReport> {
  let updatedReport: SupportReport | null = null;
  try {
    const serverResult = await writeAuthRequest<SupportReport>("PATCH", `/api/admin/support/reports/${id}`, update);
    if (serverResult && serverResult.id) {
      updatedReport = serverResult;
    }
  } catch (error) {
    console.warn("Backend updateSupportReport offline, updating localStorage:", error);
  }

  const current = getLocalReports().length > 0 ? getLocalReports() : [...initialReports];
  const updatedList = current.map((r) => {
    if (r.id === id) {
      const item: SupportReport = {
        ...r,
        status: update.status,
        adminReply: update.adminReply !== undefined ? update.adminReply : r.adminReply,
        repliedAt: update.adminReply ? new Date().toISOString() : r.repliedAt,
        correction: update.correction !== undefined ? update.correction : r.correction,
        updatedAt: new Date().toISOString(),
      };
      if (!updatedReport) updatedReport = item;
      return item;
    }
    return r;
  });

  saveLocalReports(updatedList);
  return updatedReport || {
    id,
    ticketCode: `TK-${id.slice(-4)}`,
    userName: "Học viên",
    userEmail: "learner@toeic.edu.vn",
    category: "QUESTION_ERROR",
    title: "Báo lỗi",
    description: "",
    priority: "MEDIUM",
    status: update.status,
    adminReply: update.adminReply,
    repliedAt: update.adminReply ? new Date().toISOString() : undefined,
    correction: update.correction,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getMySupportReports(): Promise<SupportReport[]> {
  try {
    return await apiRequest<SupportReport[]>("/api/support-reports/mine");
  } catch {
    const list = getLocalReports();
    return list.filter((r) => r.userEmail === "learner@toeic.edu.vn" || r.userName.includes("Bạn"));
  }
}

export async function deleteSupportReport(id: string): Promise<void> {
  try {
    await writeAuthRequest<void>("DELETE", `/api/admin/support/reports/${id}`);
  } catch (error) {
    console.warn("Backend deleteSupportReport offline, removing from localStorage:", error);
  }

  const current = getLocalReports();
  const updated = current.filter((r) => r.id !== id);
  saveLocalReports(updated);
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
