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
  startDate: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
};

const REPORTS_KEY = "toeic_admin_support_reports";
const ANNOUNCEMENTS_KEY = "toeic_admin_announcements";

const initialReports: SupportReport[] = [
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

const initialAnnouncements: Announcement[] = [
  {
    id: "anc-1",
    title: "Cập nhật ngân hàng 500+ câu hỏi TOEIC ETS 2026 mới nhất",
    summary: "Hệ thống bổ sung đầy đủ bộ đề ETS 2026 kèm giải thích chi tiết từ Gemini AI.",
    content: "Chào các học viên TOEIC Master!\n\nHệ thống vừa hoàn tất cập nhật 500 câu hỏi thi thật chuẩn ETS 2026 cho Part 5, Part 6 và Part 7.\nTất cả các câu hỏi đều có phân tích ngữ pháp, từ vựng trọng tâm và lý do chọn đáp án do mô hình Gemini AI kiểm duyệt.\n\nChúc các bạn ôn tập hiệu quả!",
    type: "FEATURE_UPDATE",
    target: "ALL",
    status: "ACTIVE",
    isPinned: true,
    actionUrl: "/mock-tests",
    readCount: 1420,
    startDate: "2026-10-01T00:00:00Z",
    createdAt: "2026-10-01T08:00:00Z",
    createdBy: "Admin TOEIC",
  },
  {
    id: "anc-2",
    title: "Ưu đãi 30% gói cước TOEIC VIP Pro dành cho mùa thi tháng 10",
    summary: "Nâng cấp tài khoản VIP ngay hôm nay để mở khóa không giới hạn gợi ý AI & Mock Test.",
    content: "Nhân dịp mở rộng kho dữ liệu, TOEIC Master giảm ngay 30% cho tất cả các gói cước VIP 3 tháng và 12 tháng.\nSử dụng mã khuyến mãi: TOEICAI2026 khi thanh toán.",
    type: "PROMOTION",
    target: "FREE_USERS",
    status: "ACTIVE",
    isPinned: false,
    actionUrl: "/billing/subscriptions",
    readCount: 890,
    startDate: "2026-10-03T00:00:00Z",
    endDate: "2026-10-15T23:59:59Z",
    createdAt: "2026-10-03T09:30:00Z",
    createdBy: "Admin Marketing",
  },
  {
    id: "anc-3",
    title: "Thông báo bảo trì máy chủ định kỳ đêm ngày 08/10",
    summary: "Hệ thống sẽ tạm ngưng dịch vụ trong 30 phút từ 02:00 AM đến 02:30 AM để nâng cấp cơ sở dữ liệu vector.",
    content: "Để nâng cao tốc độ phản hồi khuyến nghị cá nhân hóa BKT và tìm kiếm ngữ nghĩa pgvector, chúng tôi sẽ tiến hành bảo trì hạ tầng hệ thống.\n\nThời gian dự kiến: 02:00 - 02:30 ngày 08/10/2026.\nRất mong quý học viên thông cảm cho sự bất tiện này.",
    type: "SYSTEM",
    target: "ALL",
    status: "ACTIVE",
    isPinned: false,
    readCount: 650,
    startDate: "2026-10-04T00:00:00Z",
    createdAt: "2026-10-04T10:00:00Z",
    createdBy: "DevOps Team",
  },
];

export async function getReports(): Promise<SupportReport[]> {
  if (typeof window === "undefined") return initialReports;
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(initialReports));
      return initialReports;
    }
    return JSON.parse(raw);
  } catch {
    return initialReports;
  }
}

export async function saveReports(reports: SupportReport[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (typeof window === "undefined") return initialAnnouncements;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(initialAnnouncements));
      return initialAnnouncements;
    }
    return JSON.parse(raw);
  } catch {
    return initialAnnouncements;
  }
}

export async function saveAnnouncements(announcements: Announcement[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }
}
