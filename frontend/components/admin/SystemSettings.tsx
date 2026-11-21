"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  Bell,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock3,
  FileCheck,
  Globe,
  Mail,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";
import { ApiRequestError } from "@/lib/api/client";
import {
  getSystemSettings,
  updateSystemSettings,
  type SystemSettings,
  type SystemSettingsUpdate,
} from "@/lib/api/system-settings";

export type EditableBackendSettings = Omit<SystemSettings, "version" | "updatedAt">;

export type ExtendedSettings = {
  defaultTargetScore: number;
  aiDailyChatLimitFree: number;
  showExplanationImmediately: boolean;
  preventCopyingExam: boolean;
  maintenanceMode: boolean;
};

const DEFAULT_BACKEND_SETTINGS: EditableBackendSettings = {
  systemName: "TOEIC AI Learning",
  supportEmail: "support@example.com",
  dailyStudyMinutes: 30,
  reminderTime: "19:00",
  notifications: {
    newRegistrations: true,
    supportRequests: true,
    contentReports: false,
  },
  aiModerationEnabled: true,
};

const DEFAULT_EXTENDED_SETTINGS: ExtendedSettings = {
  defaultTargetScore: 650,
  aiDailyChatLimitFree: 20,
  showExplanationImmediately: true,
  preventCopyingExam: false,
  maintenanceMode: false,
};

const STUDY_DURATIONS = [15, 30, 45, 60, 90];
const TARGET_SCORES = [
  { score: 450, tier: "Cơ bản", label: "450+ (Cơ bản)" },
  { score: 600, tier: "Phổ biến", label: "600+ (Phổ biến)" },
  { score: 750, tier: "Nâng cao", label: "750+ (Nâng cao)" },
  { score: 850, tier: "Chuyên sâu", label: "850+ (Chuyên sâu)" },
];
const AI_CHAT_LIMITS = [
  { limit: 10, title: "10 câu", subtitle: "Mỗi ngày", badge: "Tiết kiệm" },
  { limit: 20, title: "20 câu", subtitle: "Mỗi ngày", badge: "Khuyên dùng" },
  { limit: 50, title: "50 câu", subtitle: "Mỗi ngày", badge: "Nâng cao" },
  { limit: 0, title: "Không giới hạn", subtitle: "Tất cả học viên", badge: "VIP Pro" },
];

const TIME_PRESETS = [
  { time: "07:00", label: "07:00 Sáng" },
  { time: "12:00", label: "12:00 Trưa" },
  { time: "19:00", label: "19:00 Tối (Chuẩn)" },
  { time: "21:30", label: "21:30 Đêm" },
];

const BRANDING_STORAGE_KEY = "toeic_system_branding";
const EXTENDED_SETTINGS_STORAGE_KEY = "toeic_system_extended_settings";

function editableBackendSettings(settings: SystemSettings): EditableBackendSettings {
  return {
    systemName: settings.systemName,
    supportEmail: settings.supportEmail,
    dailyStudyMinutes: settings.dailyStudyMinutes,
    reminderTime: settings.reminderTime,
    notifications: settings.notifications,
    aiModerationEnabled: settings.aiModerationEnabled,
  };
}

function loadSavedExtendedSettings(): ExtendedSettings {
  if (typeof window === "undefined") return DEFAULT_EXTENDED_SETTINGS;
  try {
    const raw = localStorage.getItem(EXTENDED_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_EXTENDED_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      defaultTargetScore: typeof parsed.defaultTargetScore === "number" ? parsed.defaultTargetScore : DEFAULT_EXTENDED_SETTINGS.defaultTargetScore,
      aiDailyChatLimitFree: typeof parsed.aiDailyChatLimitFree === "number" ? parsed.aiDailyChatLimitFree : DEFAULT_EXTENDED_SETTINGS.aiDailyChatLimitFree,
      showExplanationImmediately: typeof parsed.showExplanationImmediately === "boolean" ? parsed.showExplanationImmediately : DEFAULT_EXTENDED_SETTINGS.showExplanationImmediately,
      preventCopyingExam: typeof parsed.preventCopyingExam === "boolean" ? parsed.preventCopyingExam : DEFAULT_EXTENDED_SETTINGS.preventCopyingExam,
      maintenanceMode: typeof parsed.maintenanceMode === "boolean" ? parsed.maintenanceMode : DEFAULT_EXTENDED_SETTINGS.maintenanceMode,
    };
  } catch {
    return DEFAULT_EXTENDED_SETTINGS;
  }
}

function isSystemSettings(value: unknown): value is SystemSettings {
  if (typeof value !== "object" || value === null) return false;
  const settings = value as Record<string, unknown>;
  const notifications = settings.notifications;
  if (typeof notifications !== "object" || notifications === null) return false;
  const notificationValues = notifications as Record<string, unknown>;

  return (
    typeof settings.systemName === "string" &&
    typeof settings.supportEmail === "string" &&
    typeof settings.dailyStudyMinutes === "number" &&
    STUDY_DURATIONS.includes(settings.dailyStudyMinutes) &&
    typeof settings.reminderTime === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings.reminderTime) &&
    typeof settings.version === "number" &&
    Number.isInteger(settings.version) &&
    settings.version >= 0 &&
    typeof settings.updatedAt === "string" &&
    Number.isFinite(Date.parse(settings.updatedAt)) &&
    typeof notificationValues.newRegistrations === "boolean" &&
    typeof notificationValues.supportRequests === "boolean" &&
    typeof notificationValues.contentReports === "boolean" &&
    typeof settings.aiModerationEnabled === "boolean"
  );
}

function SettingsSection({
  id,
  eyebrow,
  title,
  description,
  badgeText,
  badgeColor = "blue",
  icon,
  className = "",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  badgeText?: string;
  badgeColor?: "blue" | "emerald" | "amber" | "purple";
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const badgeClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }[badgeColor];

  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-6 shadow-[0_8px_24px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
          <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
            <h2 className="mt-0.5 sm:mt-1 text-sm sm:text-base font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-0.5 sm:mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{description}</p>
          </div>
        </div>
        {badgeText && (
          <span className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${badgeClasses}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-4.5 sm:mt-5 space-y-4.5 sm:space-y-5">{children}</div>
    </section>
  );
}

function ImpactNotice({
  adminImpact,
  userImpact,
  categoryLabel,
}: {
  adminImpact: React.ReactNode;
  userImpact: React.ReactNode;
  categoryLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 sm:p-3.5 text-xs transition-all duration-150">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>Cơ chế &amp; Phạm vi tác động thực tế:</span>
        </div>
        {categoryLabel && (
          <span className="rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            {categoryLabel}
          </span>
        )}
      </div>
      <div className="mt-2.5 grid gap-2.5 grid-cols-1 md:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-blue-100 bg-white p-2.5 shadow-2xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Trong không gian Admin
          </span>
          <div className="mt-1 leading-relaxed text-slate-600 break-words">{adminImpact}</div>
        </div>
        <div className="min-w-0 rounded-lg border border-emerald-100 bg-white p-2.5 shadow-2xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Đối với Học viên (User)
          </span>
          <div className="mt-1 leading-relaxed text-slate-600 break-words">{userImpact}</div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`group flex cursor-pointer items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 select-none transition ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:border-blue-200 hover:bg-blue-50/20"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center pt-0.5 sm:pt-0">
        <input
          type="checkbox"
          role="switch"
          disabled={disabled}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-xs transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function SystemSettings() {
  const [savedSettings, setSavedSettings] = useState<SystemSettings | null>(null);
  const [draft, setDraft] = useState<EditableBackendSettings | null>(null);
  const [extendedDraft, setExtendedDraft] = useState<ExtendedSettings>(DEFAULT_EXTENDED_SETTINGS);
  const [savedExtended, setSavedExtended] = useState<ExtendedSettings>(DEFAULT_EXTENDED_SETTINGS);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isConfigurationMissing, setIsConfigurationMissing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    let active = true;
    const initialExtended = loadSavedExtendedSettings();
    setExtendedDraft(initialExtended);
    setSavedExtended(initialExtended);

    getSystemSettings()
      .then((settings) => {
        if (!active) return;
        if (!isSystemSettings(settings)) {
          setError("Máy chủ trả về cấu hình không hợp lệ. Vui lòng thử tải lại.");
          return;
        }
        setSavedSettings(settings);
        setDraft(editableBackendSettings(settings));
        setError("");
      })
      .catch((loadError: unknown) => {
        if (active) {
          setIsConfigurationMissing(loadError instanceof ApiRequestError && loadError.status === 404);
          setError(loadError instanceof Error
            ? loadError.message
            : "Không thể tải cài đặt. Vui lòng thử lại.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reloadSettings() {
    setIsLoading(true);
    setError("");
    setIsConfigurationMissing(false);
    setFeedback("");
    setHasConflict(false);
    try {
      const settings = await getSystemSettings();
      if (!isSystemSettings(settings)) {
        setError("Máy chủ trả về cấu hình không hợp lệ. Vui lòng thử tải lại.");
        return;
      }
      setSavedSettings(settings);
      setDraft(editableBackendSettings(settings));
      const ext = loadSavedExtendedSettings();
      setExtendedDraft(ext);
      setSavedExtended(ext);
    } catch (loadError) {
      setIsConfigurationMissing(loadError instanceof ApiRequestError && loadError.status === 404);
      setError(loadError instanceof Error
        ? loadError.message
        : "Không thể tải cài đặt. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(update: (current: EditableBackendSettings) => EditableBackendSettings) {
    setDraft((current) => current ? update(current) : current);
    setFeedback("Bạn có thay đổi chưa được lưu.");
    setFeedbackIsError(false);
    setHasConflict(false);
  }

  function updateExtendedDraft(update: (current: ExtendedSettings) => ExtendedSettings) {
    setExtendedDraft((current) => update(current));
    setFeedback("Bạn có thay đổi chưa được lưu.");
    setFeedbackIsError(false);
    setHasConflict(false);
  }

  function validateDraft(settings: EditableBackendSettings) {
    if (!settings.systemName.trim()) return "Tên hệ thống không được để trống.";
    if (settings.systemName.trim().length > 80) return "Tên hệ thống không được vượt quá 80 ký tự.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail.trim())) {
      return "Vui lòng nhập địa chỉ email hỗ trợ hợp lệ.";
    }
    if (!STUDY_DURATIONS.includes(settings.dailyStudyMinutes)) {
      return "Thời lượng học phải là 15, 30, 45, 60 hoặc 90 phút.";
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings.reminderTime)) {
      return "Vui lòng chọn giờ nhắc học hợp lệ.";
    }
    return "";
  }

  async function saveSettings() {
    if (!draft || !savedSettings) return;
    const validationError = validateDraft(draft);
    if (validationError) {
      setFeedback(validationError);
      setFeedbackIsError(true);
      return;
    }

    setIsSaving(true);
    setFeedback("");
    setFeedbackIsError(false);
    setHasConflict(false);
    const update: SystemSettingsUpdate = {
      ...draft,
      systemName: draft.systemName.trim(),
      supportEmail: draft.supportEmail.trim(),
      expectedVersion: savedSettings.version,
    };

    try {
      const updated = await updateSystemSettings(update);
      if (!isSystemSettings(updated)) {
        setFeedback("Máy chủ đã nhận yêu cầu nhưng trả về cấu hình không hợp lệ. Hãy tải lại để xác nhận trạng thái.");
        setFeedbackIsError(true);
        return;
      }

      // Persist branding & extended settings to localStorage and notify app
      try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify({
          systemName: updated.systemName,
          supportEmail: updated.supportEmail,
          dailyStudyMinutes: updated.dailyStudyMinutes,
          reminderTime: updated.reminderTime,
        }));
        localStorage.setItem(EXTENDED_SETTINGS_STORAGE_KEY, JSON.stringify(extendedDraft));
        window.dispatchEvent(new CustomEvent("toeic:system-settings-changed", {
          detail: {
            systemName: updated.systemName,
            supportEmail: updated.supportEmail,
            dailyStudyMinutes: updated.dailyStudyMinutes,
            reminderTime: updated.reminderTime,
            ...extendedDraft,
          },
        }));
      } catch {
        // Ignore localStorage errors
      }

      setSavedSettings(updated);
      setDraft(editableBackendSettings(updated));
      setSavedExtended(extendedDraft);
      setFeedback("Đã lưu thành công cấu hình hệ thống và đồng bộ toàn diện.");
    } catch (saveError) {
      setFeedback(saveError instanceof Error
        ? saveError.message
        : "Không thể lưu cài đặt. Vui lòng thử lại.");
      setFeedbackIsError(true);
      setHasConflict(saveError instanceof ApiRequestError && saveError.status === 409);
    } finally {
      setIsSaving(false);
    }
  }

  function resetSettings() {
    setDraft({
      ...DEFAULT_BACKEND_SETTINGS,
      notifications: { ...DEFAULT_BACKEND_SETTINGS.notifications },
    });
    setExtendedDraft(DEFAULT_EXTENDED_SETTINGS);
    setFeedback("Đã khôi phục các giá trị chuẩn mặc định. Bạn có thể nhấn “Lưu cài đặt ngay” để áp dụng xuống hệ thống.");
    setFeedbackIsError(false);
    setHasConflict(false);
  }

  async function handleSaveClick() {
    if (!hasUnsavedChanges) {
      setFeedback("Cấu hình hiện tại đã được đồng bộ mới nhất trên hệ thống. Bạn chưa có chỉnh sửa nào cần lưu thêm.");
      setFeedbackIsError(false);
      return;
    }
    await saveSettings();
  }

  const hasBackendChanges = Boolean(
    draft && savedSettings &&
    JSON.stringify(draft) !== JSON.stringify(editableBackendSettings(savedSettings)),
  );

  const hasExtendedChanges = Boolean(
    JSON.stringify(extendedDraft) !== JSON.stringify(savedExtended),
  );

  const hasUnsavedChanges = hasBackendChanges || hasExtendedChanges;

  if (isLoading && !draft) {
    return (
      <div
        role="status"
        className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-600"
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
        Đang tải cấu hình hệ thống…
      </div>
    );
  }

  if (isConfigurationMissing && !draft) {
    return (
      <section role="alert" className="rounded-2xl border border-amber-200 bg-white p-6">
        <h2 className="font-semibold text-amber-900">Cấu hình chưa được khởi tạo</h2>
        <p className="mt-2 text-sm text-amber-800">
          Không có cấu hình mặc định trong cơ sở dữ liệu. Hãy chạy migration hệ thống rồi thử tải lại.
        </p>
        <button
          type="button"
          onClick={reloadSettings}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Thử tải lại
        </button>
      </section>
    );
  }

  if (error && !draft) {
    return (
      <section role="alert" className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="font-semibold text-red-800">Không thể tải cài đặt</h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={reloadSettings}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Thử tải lại
        </button>
      </section>
    );
  }

  if (!draft || !savedSettings) {
    return (
      <section role="alert" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Chưa có cấu hình hệ thống</h2>
        <p className="mt-2 text-sm text-slate-600">
          Hệ thống chưa khởi tạo cấu hình mặc định. Hãy kiểm tra migration cơ sở dữ liệu.
        </p>
      </section>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6 pb-28">
      {/* Responsive Navigation Pills */}
      <nav
        aria-label="Đi đến nhóm cài đặt"
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xs"
      >
        {[
          { href: "#general-settings", label: "Thông tin chung & Thương hiệu", icon: Settings2 },
          { href: "#study-settings", label: "Mục tiêu & Lộ trình", icon: BookOpen },
          { href: "#ai-settings", label: "Trợ lý AI & Kiểm duyệt", icon: Bot },
          { href: "#practice-settings", label: "Luyện đề & Thi thử", icon: FileCheck },
          { href: "#event-settings", label: "Theo dõi & Vận hành", icon: Bell },
          { href: "#impact-matrix", label: "Ma trận tác động", icon: Sparkles },
        ].map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 whitespace-nowrap"
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      {/* Balanced 2-Column Responsive Layout - Zero Height Gaps */}
      <div className="flex flex-col gap-5 sm:gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 xl:gap-7">
        {/* Track 1: General (Order 1 on mobile) & AI (Order 3 on mobile) */}
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          {/* SECTION 1: Thông tin chung & Thương hiệu */}
          <div className="order-1 lg:order-none">
            <SettingsSection
              id="general-settings"
              eyebrow="Nền tảng &amp; Thương hiệu"
              title="Thông tin chung"
              description="Định danh tên thương hiệu và địa chỉ tiếp nhận hỗ trợ của nền tảng."
              badgeText="🌍 Toàn hệ thống"
              badgeColor="blue"
              icon={<Globe aria-hidden="true" className="h-5 w-5" />}
            >
              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Tên hệ thống hiển thị</span>
                <span className="relative mt-1.5 block">
                  <Settings2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={draft.systemName}
                    onChange={(event) => updateDraft((current) => ({ ...current, systemName: event.target.value }))}
                    maxLength={80}
                    required
                    aria-label="Tên hệ thống"
                    placeholder="Ví dụ: TOEIC Master AI, TOEIC AI Learning..."
                    className="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </span>
                <span className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate pr-2">Hiển thị ở Header học viên, trang Marketing và email.</span>
                  <span className="shrink-0">{draft.systemName.length}/80</span>
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Email hỗ trợ &amp; CSKH</span>
                <span className="relative mt-1.5 block">
                  <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={draft.supportEmail}
                    onChange={(event) => updateDraft((current) => ({ ...current, supportEmail: event.target.value }))}
                    maxLength={254}
                    required
                    aria-label="Email hỗ trợ"
                    placeholder="support@toeicmaster.vn"
                    className="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 font-mono"
                  />
                </span>
                <span className="mt-1.5 block text-[11px] text-slate-500">
                  Xuất hiện trong cửa sổ “Góp ý &amp; Báo lỗi” của học viên để liên hệ khẩn cấp.
                </span>
              </label>

              <ImpactNotice
                categoryLabel="Đồng bộ Thương hiệu & CSKH"
                adminImpact={
                  <p>
                    Đồng bộ tên định danh <strong className="font-bold text-blue-700 break-words">{draft.systemName || "TOEIC AI Learning"}</strong> trong Header quản trị và nhật ký kiểm toán.
                  </p>
                }
                userImpact={
                  <p>
                    Học viên nhìn thấy tên hệ thống mới <strong className="font-bold text-emerald-700 break-words">{draft.systemName || "TOEIC AI Learning"}</strong> ở góc trái Header và email hỗ trợ <strong className="font-mono text-emerald-700 break-all">{draft.supportEmail || "support@example.com"}</strong> khi gửi ticket phản hồi.
                  </p>
                }
              />
            </SettingsSection>
          </div>

          {/* SECTION 3: An toàn nội dung & Trợ lý AI */}
          <div className="order-3 lg:order-none">
            <SettingsSection
              id="ai-settings"
              eyebrow="Công nghệ &amp; Kiểm duyệt"
              title="Trợ lý AI &amp; Kiểm duyệt nội dung"
              description="Kiểm soát chất lượng nội dung sinh bởi AI và hạn mức tương tác của học viên."
              badgeText="🤖 Kiểm soát AI"
              badgeColor="purple"
              icon={<Bot aria-hidden="true" className="h-5 w-5" />}
            >
              <ToggleSetting
                title="Bật chế độ Kiểm duyệt AI (Bắt buộc duyệt trước khi xuất bản)"
                description="Khi bật: Mọi câu hỏi, bài đọc AI tạo sẽ vào hàng chờ tại /admin/ai-review để Admin duyệt. Khi tắt: AI phát hành thẳng vào kho học viên."
                checked={draft.aiModerationEnabled}
                onChange={(checked) =>
                  updateDraft((current) => ({ ...current, aiModerationEnabled: checked }))
                }
              />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">Hạn mức hỏi Trợ lý Gia sư AI (Tài khoản Free)</span>
                  <span className="text-[11px] font-bold text-purple-600 shrink-0">
                    {extendedDraft.aiDailyChatLimitFree === 0 ? "Không giới hạn" : `${extendedDraft.aiDailyChatLimitFree} câu/ngày`}
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:gap-2.5">
                  {AI_CHAT_LIMITS.map(({ limit, title, subtitle, badge }) => {
                    const isSelected = extendedDraft.aiDailyChatLimitFree === limit;
                    return (
                      <button
                        key={limit}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => updateExtendedDraft((current) => ({ ...current, aiDailyChatLimitFree: limit }))}
                        className={`flex flex-col items-start justify-between rounded-xl border p-2.5 sm:p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-100 ${
                          isSelected
                            ? "border-purple-600 bg-purple-600 text-white shadow-xs shadow-purple-600/20"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-purple-200 hover:bg-purple-50/40"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span className={`text-xs sm:text-sm font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {title}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {badge}
                          </span>
                        </div>
                        <span className={`mt-1 text-[11px] ${isSelected ? "text-purple-100" : "text-slate-500"}`}>
                          {subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <span className="mt-1.5 block text-[11px] text-slate-500">
                  Giúp kiểm soát chi phí API Gemini và khuyến khích học viên nâng cấp gói VIP Pro.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-3.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="font-semibold text-slate-700">Mô hình AI:</span>
                  <code className="rounded bg-white px-2 py-0.5 font-mono text-[11px] text-blue-700 border border-slate-200 truncate">
                    gemini-2.5-flash
                  </code>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng hoạt động
                </span>
              </div>

              <ImpactNotice
                categoryLabel="Kiểm duyệt & Giới hạn AI"
                adminImpact="BẬT giúp Admin chặn triệt để câu hỏi AI lỗi; TẮT giúp tự động hóa kho đề mà không tốn công duyệt."
                userImpact={`Học viên luôn được học nội dung chuẩn; tài khoản Free có định mức hỏi gia sư AI ${extendedDraft.aiDailyChatLimitFree === 0 ? "không giới hạn" : `${extendedDraft.aiDailyChatLimitFree} câu/ngày`}.`}
              />
            </SettingsSection>
          </div>
        </div>

        {/* Track 2: Study (Order 2 on mobile) & Practice (Order 4 on mobile) */}
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          {/* SECTION 2: Mục tiêu học tập & Lộ trình */}
          <div className="order-2 lg:order-none">
            <SettingsSection
              id="study-settings"
              eyebrow="Trải nghiệm học tập"
              title="Mục tiêu &amp; Lộ trình học"
              description="Thiết lập các mốc gợi ý sẵn khi học viên mới bắt đầu khảo sát lộ trình."
              badgeText="🎓 Học viên mới"
              badgeColor="emerald"
              icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">Thời lượng học mục tiêu mỗi ngày</span>
                  <span className="text-[11px] font-bold text-blue-600 shrink-0">{draft.dailyStudyMinutes} phút / ngày</span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {STUDY_DURATIONS.map((minutes) => {
                    const isSelected = draft.dailyStudyMinutes === minutes;
                    return (
                      <button
                        key={minutes}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => updateDraft((current) => ({ ...current, dailyStudyMinutes: minutes }))}
                        className={`h-10 rounded-xl border text-xs sm:text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white shadow-xs shadow-blue-600/20 font-bold"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
                        }`}
                      >
                        {minutes}p
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">Điểm TOEIC mục tiêu mặc định</span>
                  <span className="text-[11px] font-bold text-emerald-600 shrink-0">{extendedDraft.defaultTargetScore}+ điểm</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:gap-2.5">
                  {TARGET_SCORES.map(({ score, tier }) => {
                    const isSelected = extendedDraft.defaultTargetScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => updateExtendedDraft((current) => ({ ...current, defaultTargetScore: score }))}
                        className={`flex flex-col items-start justify-center rounded-xl border p-2.5 sm:p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-800"
                        }`}
                      >
                        <span className={`text-sm sm:text-base font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                          {score}+
                        </span>
                        <span className={`text-[11px] ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
                          {tier}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700">Giờ nhắc học gợi ý mặc định</span>
                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative min-w-0 sm:w-44">
                    <Clock3 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={draft.reminderTime}
                      onChange={(event) => updateDraft((current) => ({ ...current, reminderTime: event.target.value }))}
                      aria-label="Giờ nhắc học mặc định"
                      className="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.time}
                        type="button"
                        onClick={() => updateDraft((current) => ({ ...current, reminderTime: preset.time }))}
                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                          draft.reminderTime === preset.time
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ImpactNotice
                categoryLabel="Mục tiêu & Khảo sát ban đầu"
                adminImpact={
                  <p>
                    Chuẩn hóa thời lượng học <strong className="font-bold text-blue-700">{draft.dailyStudyMinutes} phút/ngày</strong> và điểm mục tiêu <strong className="font-bold text-blue-700">{extendedDraft.defaultTargetScore}+ điểm</strong> cho quy trình đo lường.
                  </p>
                }
                userImpact={
                  <p>
                    Học viên mới khi vào Onboarding được tự động điền sẵn <strong className="font-bold text-emerald-700">{draft.dailyStudyMinutes} phút/ngày</strong>, mục tiêu <strong className="font-bold text-emerald-700">{extendedDraft.defaultTargetScore}+ điểm</strong> và nhắc lúc <strong className="font-bold text-emerald-700">{draft.reminderTime || "19:00"}</strong>.
                  </p>
                }
              />
            </SettingsSection>
          </div>

          {/* SECTION 4: Chế độ Luyện đề & Thi thử */}
          <div className="order-4 lg:order-none">
            <SettingsSection
              id="practice-settings"
              eyebrow="Phương pháp sư phạm"
              title="Chế độ Luyện đề &amp; Thi thử"
              description="Quy định cách hiển thị đáp án, lời giải và tính bảo mật của phòng thi."
              badgeText="📝 Phòng thi ETS"
              badgeColor="amber"
              icon={<FileCheck aria-hidden="true" className="h-5 w-5" />}
            >
              <ToggleSetting
                title="Cho phép xem giải thích ngay sau khi chọn đáp án (Luyện tập)"
                description="BẬT: Học viên biết đúng/sai và xem giải thích ngữ pháp ngay khi chọn. TẮT: Bắt buộc nộp bài mới được xem đáp án (chuẩn thi thật)."
                checked={extendedDraft.showExplanationImmediately}
                onChange={(checked) =>
                  updateExtendedDraft((current) => ({ ...current, showExplanationImmediately: checked }))
                }
              />

              <ToggleSetting
                title="Chống sao chép nội dung đề thi (Chặn Copy đề)"
                description="Ngăn học viên bôi đen sao chép văn bản câu hỏi trong phòng thi thử để bảo vệ ngân hàng đề thi nội bộ."
                checked={extendedDraft.preventCopyingExam}
                onChange={(checked) =>
                  updateExtendedDraft((current) => ({ ...current, preventCopyingExam: checked }))
                }
              />

              <ImpactNotice
                categoryLabel="Phương pháp sư phạm"
                adminImpact="Bảo vệ bản quyền ngân hàng câu hỏi và điều chỉnh độ khó của chế độ ôn luyện."
                userImpact="Học viên nhận được phản hồi kiến thức tức thì khi tự học hoặc trải nghiệm áp lực thi thật."
              />
            </SettingsSection>
          </div>
        </div>
      </div>

      {/* SECTION 5: Theo dõi sự kiện & Quản trị vận hành (Full Width) */}
      <SettingsSection
        id="event-settings"
        eyebrow="Vận hành &amp; Giám sát"
        title="Theo dõi sự kiện &amp; Vận hành hệ thống"
        description="Thiết lập các nhóm sự kiện cần theo dõi và quản lý chế độ bảo trì máy chủ."
        badgeText="🛡️ Giám sát vận hành"
        badgeColor="blue"
        icon={<Activity aria-hidden="true" className="h-5 w-5" />}
      >
        <div className="grid gap-5 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nhóm sự kiện hệ thống cần theo dõi
            </span>
            <ToggleSetting
              title="Sự kiện Tài khoản đăng ký mới"
              description="Ghi nhận thông báo quản trị khi có học viên mới gia nhập hệ thống."
              checked={draft.notifications.newRegistrations}
              onChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  notifications: { ...current.notifications, newRegistrations: checked },
                }))
              }
            />
            <ToggleSetting
              title="Sự kiện Yêu cầu hỗ trợ (Support Tickets)"
              description="Cảnh báo quản trị viên khi học viên gửi phiếu phản hồi hoặc báo lỗi."
              checked={draft.notifications.supportRequests}
              onChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  notifications: { ...current.notifications, supportRequests: checked },
                }))
              }
            />
            <ToggleSetting
              title="Sự kiện Báo lỗi nội dung câu hỏi"
              description="Cảnh báo khi người học báo cáo câu hỏi sai đáp án hoặc âm thanh rè."
              checked={draft.notifications.contentReports}
              onChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  notifications: { ...current.notifications, contentReports: checked },
                }))
              }
            />
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Trạng thái bảo trì &amp; Thông báo toàn sàn
              </span>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 sm:p-4">
                <ToggleSetting
                  title="Chế độ bảo trì hệ thống (Maintenance Mode)"
                  description="Hiển thị banner thông báo tới toàn bộ học viên khi Admin đang nâng cấp dữ liệu."
                  checked={extendedDraft.maintenanceMode}
                  onChange={(checked) =>
                    updateExtendedDraft((current) => ({ ...current, maintenanceMode: checked }))
                  }
                />
                <p className="mt-2 text-[11px] leading-relaxed text-amber-800">
                  💡 Khi bật cờ này, học viên khi truy cập các phòng thi thử sẽ nhìn thấy thông báo nhắc nhở để tránh nộp bài thi dở dang.
                </p>
              </div>
            </div>

            <ImpactNotice
              categoryLabel="Vận hành & Giám sát"
              adminImpact="Giúp đội ngũ quản trị nhận thông báo đúng trọng tâm mà không bị spam sự kiện."
              userImpact="Học viên nhận thông báo bảo trì kịp thời, tránh việc đang làm bài thi thử bị gián đoạn kết nối."
            />
          </div>
        </div>
      </SettingsSection>

      {/* SECTION 6: Ma trận tác động toàn diện */}
      <section id="impact-matrix" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Bảng Ma trận Tác động Cấu hình Hệ thống</h2>
            <p className="text-xs text-slate-500">Tổng hợp trực quan cơ chế hoạt động và phạm vi ảnh hưởng khi Admin thay đổi thiết lập.</p>
          </div>
        </div>

        {/* Desktop & Tablet Table (sm screens and above) */}
        <div className="mt-4 hidden sm:block overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
          <table className="min-w-[820px] w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3.5 py-3">Thiết lập</th>
                <th className="px-3.5 py-3">Giá trị áp dụng</th>
                <th className="px-3.5 py-3">Phạm vi</th>
                <th className="px-3.5 py-3">Trong Admin thay đổi gì?</th>
                <th className="px-3.5 py-3">Học viên (User) thấy gì?</th>
                <th className="px-3.5 py-3 text-right">Hiệu lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Tên hệ thống</td>
                <td className="px-3.5 py-3 font-mono text-blue-700 font-medium whitespace-nowrap">{draft.systemName}</td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">Toàn sàn</span></td>
                <td className="px-3.5 py-3">Cập nhật Header quản trị &amp; Audit Log</td>
                <td className="px-3.5 py-3">Đổi tên thương hiệu ở Header, Chân trang, Đăng nhập</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Ngay lập tức</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Email hỗ trợ</td>
                <td className="px-3.5 py-3 font-mono text-blue-700 font-medium whitespace-nowrap">{draft.supportEmail}</td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">CSKH</span></td>
                <td className="px-3.5 py-3">Tiếp nhận phản hồi từ học viên</td>
                <td className="px-3.5 py-3">Hiển thị trong hộp thoại &quot;Góp ý &amp; Báo lỗi&quot;</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Ngay lập tức</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Thời lượng học ngày</td>
                <td className="px-3.5 py-3 font-mono text-emerald-700 font-medium whitespace-nowrap">{draft.dailyStudyMinutes} phút</td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Học viên mới</span></td>
                <td className="px-3.5 py-3">Định chuẩn thời lượng học viên cho báo cáo</td>
                <td className="px-3.5 py-3">Tự động chọn sẵn {draft.dailyStudyMinutes} phút khi khảo sát Onboarding</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Khi đăng ký</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Điểm TOEIC mục tiêu</td>
                <td className="px-3.5 py-3 font-mono text-emerald-700 font-medium whitespace-nowrap">{extendedDraft.defaultTargetScore}+ điểm</td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Lộ trình học</span></td>
                <td className="px-3.5 py-3">Chuẩn hóa mốc điểm cho thuật toán gợi ý</td>
                <td className="px-3.5 py-3">Gợi ý mốc điểm mục tiêu ban đầu cho học viên mới</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Khi đăng ký</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Kiểm duyệt AI</td>
                <td className="px-3.5 py-3 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${draft.aiModerationEnabled ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                    {draft.aiModerationEnabled ? "BẮT BUỘC DUYỆT" : "TỰ ĐỘNG PHÁT HÀNH"}
                  </span>
                </td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">Sinh nội dung</span></td>
                <td className="px-3.5 py-3">{draft.aiModerationEnabled ? "Phải duyệt tại /admin/ai-review" : "Tự động đẩy thẳng vào kho đề"}</td>
                <td className="px-3.5 py-3">{draft.aiModerationEnabled ? "Nội dung chuẩn chỉ, không lỗi" : "Có ngay đề mới liên tục"}</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Lần sinh tiếp theo</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Hạn mức hỏi Gia sư AI</td>
                <td className="px-3.5 py-3 font-mono text-purple-700 font-medium whitespace-nowrap">{extendedDraft.aiDailyChatLimitFree === 0 ? "Không giới hạn" : `${extendedDraft.aiDailyChatLimitFree} câu/ngày`}</td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">Chat AI</span></td>
                <td className="px-3.5 py-3">Kiểm soát chặt ngân sách Token Gemini</td>
                <td className="px-3.5 py-3">Học viên Free bị giới hạn câu hỏi; nhắc nâng cấp VIP</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Ngay lập tức</td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">Xem giải thích tức thì</td>
                <td className="px-3.5 py-3 font-medium text-slate-700 whitespace-nowrap">{extendedDraft.showExplanationImmediately ? "Cho phép xem ngay" : "Chỉ xem khi nộp bài"}</td>
                <td className="px-3.5 py-3 whitespace-nowrap"><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">Luyện tập</span></td>
                <td className="px-3.5 py-3">Theo dõi tỷ lệ hoàn thành đề thi</td>
                <td className="px-3.5 py-3">{extendedDraft.showExplanationImmediately ? "Thấy đáp án + giải thích sau mỗi câu" : "Phải nộp bài thi mới xem được giải thích"}</td>
                <td className="px-3.5 py-3 text-right font-medium text-emerald-600 whitespace-nowrap">Khi làm bài</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile-Friendly Responsive Card List (screens < 640px) */}
        <div className="mt-4 sm:hidden space-y-3">
          {[
            {
              name: "Tên hệ thống",
              value: draft.systemName,
              scope: "Toàn sàn",
              scopeColor: "bg-blue-50 text-blue-700 border-blue-200",
              admin: "Cập nhật Header quản trị & Audit Log",
              user: "Đổi tên thương hiệu ở Header, Chân trang, Đăng nhập",
              effective: "Ngay lập tức",
            },
            {
              name: "Email hỗ trợ",
              value: draft.supportEmail,
              scope: "CSKH",
              scopeColor: "bg-blue-50 text-blue-700 border-blue-200",
              admin: "Tiếp nhận phản hồi từ học viên",
              user: "Hiển thị trong hộp thoại “Góp ý & Báo lỗi”",
              effective: "Ngay lập tức",
            },
            {
              name: "Thời lượng học ngày",
              value: `${draft.dailyStudyMinutes} phút`,
              scope: "Học viên mới",
              scopeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
              admin: "Định chuẩn thời lượng học viên cho báo cáo",
              user: `Tự động chọn sẵn ${draft.dailyStudyMinutes} phút khi khảo sát Onboarding`,
              effective: "Khi đăng ký",
            },
            {
              name: "Điểm TOEIC mục tiêu",
              value: `${extendedDraft.defaultTargetScore}+ điểm`,
              scope: "Lộ trình học",
              scopeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
              admin: "Chuẩn hóa mốc điểm cho thuật toán gợi ý",
              user: "Gợi ý mốc điểm mục tiêu ban đầu cho học viên mới",
              effective: "Khi đăng ký",
            },
            {
              name: "Kiểm duyệt AI",
              value: draft.aiModerationEnabled ? "Bắt buộc duyệt" : "Tự động phát hành",
              scope: "Sinh nội dung",
              scopeColor: "bg-purple-50 text-purple-700 border-purple-200",
              admin: draft.aiModerationEnabled ? "Phải duyệt tại /admin/ai-review" : "Tự động đẩy thẳng vào kho đề",
              user: draft.aiModerationEnabled ? "Nội dung chuẩn chỉ, không lỗi" : "Có ngay đề mới liên tục",
              effective: "Lần sinh tiếp theo",
            },
            {
              name: "Hạn mức hỏi Gia sư AI",
              value: extendedDraft.aiDailyChatLimitFree === 0 ? "Không giới hạn" : `${extendedDraft.aiDailyChatLimitFree} câu/ngày`,
              scope: "Chat AI",
              scopeColor: "bg-purple-50 text-purple-700 border-purple-200",
              admin: "Kiểm soát chặt ngân sách Token Gemini",
              user: "Học viên Free bị giới hạn câu hỏi; nhắc nâng cấp VIP",
              effective: "Ngay lập tức",
            },
            {
              name: "Xem giải thích tức thì",
              value: extendedDraft.showExplanationImmediately ? "Cho phép xem ngay" : "Chỉ xem khi nộp bài",
              scope: "Luyện tập",
              scopeColor: "bg-amber-50 text-amber-700 border-amber-200",
              admin: "Theo dõi tỷ lệ hoàn thành đề thi",
              user: extendedDraft.showExplanationImmediately ? "Thấy đáp án + giải thích sau mỗi câu" : "Phải nộp bài thi mới xem được",
              effective: "Khi làm bài",
            },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-900">{item.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.scopeColor}`}>
                  {item.scope}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Giá trị:</span>
                <span className="font-semibold text-blue-700 font-mono truncate max-w-[200px]">{item.value}</span>
              </div>
              <div className="text-[11px] leading-relaxed text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70">
                <p><strong className="text-blue-700">Admin:</strong> {item.admin}</p>
                <p className="mt-1"><strong className="text-emerald-700">User:</strong> {item.user}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400">
                <span>Hiệu lực:</span>
                <span className="font-semibold text-emerald-600">{item.effective}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Sticky Bar - Responsive on all devices */}
      <section className="sticky bottom-3 sm:bottom-4 z-30 rounded-2xl border border-slate-200/90 bg-white/95 p-3 sm:p-4 shadow-[0_12px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges
                ? <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-600" />
                : <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-600" />}
              <p className={`text-xs sm:text-sm font-semibold truncate ${hasUnsavedChanges ? "text-amber-800" : "text-slate-800"}`}>
                {hasUnsavedChanges ? "Bạn có thay đổi cấu hình chưa lưu" : "Mọi cài đặt đã được lưu & đồng bộ"}
              </p>
            </div>
            <p className="mt-1 pl-6 text-[10px] sm:text-[11px] text-slate-500 truncate">
              Phiên bản {savedSettings.version} · Cập nhật{" "}
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(savedSettings.updatedAt))}
            </p>
            {feedback ? (
              <p
                role={feedbackIsError ? "alert" : "status"}
                aria-live="polite"
                className={`mt-1 pl-6 text-xs font-medium truncate ${feedbackIsError ? "text-red-700" : "text-emerald-700"}`}
              >
                {feedback}
              </p>
            ) : null}
            {hasConflict ? (
              <button
                type="button"
                onClick={reloadSettings}
                disabled={isLoading}
                className="mt-1 pl-6 text-xs font-semibold text-blue-700 underline underline-offset-2 disabled:opacity-50"
              >
                Tải cấu hình mới nhất từ máy chủ
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 sm:flex sm:shrink-0 gap-2">
            <button
              type="button"
              onClick={resetSettings}
              disabled={isSaving || isLoading}
              className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm cursor-pointer"
              title="Khôi phục toàn bộ biểu mẫu về cấu hình chuẩn ban đầu"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 shrink-0" />
              <span className="truncate">Khôi phục</span>
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving || isLoading}
              className={`inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-4 sm:px-5 text-xs font-semibold transition sm:text-sm cursor-pointer ${
                hasUnsavedChanges
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 ring-2 ring-blue-500/20 font-bold"
                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/80"
              }`}
              title={hasUnsavedChanges ? "Nhấn để lưu ngay các thay đổi mới" : "Chưa có thay đổi nào mới để lưu"}
            >
              <Save aria-hidden="true" className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${hasUnsavedChanges ? "text-white" : "text-slate-500"}`} />
              <span className="truncate">{isSaving ? "Đang lưu…" : hasUnsavedChanges ? "Lưu cài đặt ngay" : "Lưu cài đặt"}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
