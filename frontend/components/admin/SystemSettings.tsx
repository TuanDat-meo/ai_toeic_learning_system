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
  Mail,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { ApiRequestError } from "@/lib/api/client";
import {
  getSystemSettings,
  updateSystemSettings,
  type SystemSettings,
  type SystemSettingsUpdate,
} from "@/lib/api/system-settings";

type EditableSettings = Omit<SystemSettings, "version" | "updatedAt">;

const DEFAULT_SETTINGS: EditableSettings = {
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

const STUDY_DURATIONS = [15, 30, 45, 60, 90];

function editableSettings(settings: SystemSettings): EditableSettings {
  return {
    systemName: settings.systemName,
    supportEmail: settings.supportEmail,
    dailyStudyMinutes: settings.dailyStudyMinutes,
    reminderTime: settings.reminderTime,
    notifications: settings.notifications,
    aiModerationEnabled: settings.aiModerationEnabled,
  };
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
  icon,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)] transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-start gap-3.5 border-b border-slate-100 pb-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function ToggleSetting({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function SystemSettings() {
  const [savedSettings, setSavedSettings] = useState<SystemSettings | null>(null);
  const [draft, setDraft] = useState<EditableSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isConfigurationMissing, setIsConfigurationMissing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    let active = true;
    getSystemSettings()
      .then((settings) => {
        if (!active) return;
        if (!isSystemSettings(settings)) {
          setError("Máy chủ trả về cấu hình không hợp lệ. Vui lòng thử tải lại.");
          return;
        }
        setSavedSettings(settings);
        setDraft(editableSettings(settings));
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
      setDraft(editableSettings(settings));
    } catch (loadError) {
      setIsConfigurationMissing(loadError instanceof ApiRequestError && loadError.status === 404);
      setError(loadError instanceof Error
        ? loadError.message
        : "Không thể tải cài đặt. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(update: (current: EditableSettings) => EditableSettings) {
    setDraft((current) => current ? update(current) : current);
    setFeedback("Bạn có thay đổi chưa được lưu.");
    setFeedbackIsError(false);
    setHasConflict(false);
  }

  function validateDraft(settings: EditableSettings) {
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
      setSavedSettings(updated);
      setDraft(editableSettings(updated));
      setFeedback("Đã lưu cấu hình hệ thống.");
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
      ...DEFAULT_SETTINGS,
      notifications: { ...DEFAULT_SETTINGS.notifications },
    });
    setFeedback("Đã khôi phục giá trị mặc định trong biểu mẫu. Nhấn “Lưu cài đặt” để áp dụng.");
    setFeedbackIsError(false);
    setHasConflict(false);
  }

  const hasUnsavedChanges = Boolean(
    draft && savedSettings &&
    JSON.stringify(draft) !== JSON.stringify(editableSettings(savedSettings)),
  );

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
    <div className="space-y-6 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(120deg,#101f46_0%,#183b78_58%,#2864c8_100%)] p-5 text-white shadow-[0_18px_40px_rgba(22,55,112,0.16)] sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/[0.06]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-32 h-64 w-64 rounded-full border-[1px] border-white/[0.10]" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">
              <Settings2 aria-hidden="true" className="h-3.5 w-3.5" />
              Trung tâm cấu hình
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Thiết lập vận hành</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/90">
              Quản lý thông tin hệ thống, trải nghiệm học tập mặc định và các tùy chọn vận hành tại một nơi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-semibold ${hasUnsavedChanges ? "border-amber-200/30 bg-amber-300/15 text-amber-100" : "border-emerald-200/25 bg-emerald-300/15 text-emerald-100"}`}>
              {hasUnsavedChanges ? <AlertCircle aria-hidden="true" className="h-4 w-4" /> : <CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
              {hasUnsavedChanges ? "Có thay đổi chưa lưu" : "Cấu hình đã đồng bộ"}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 font-medium text-white/90">
              Phiên bản {savedSettings.version}
            </span>
          </div>
        </div>
      </section>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <nav aria-label="Đi đến nhóm cài đặt" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-4">
        {[
          { href: "#general-settings", label: "Thông tin chung", icon: Settings2 },
          { href: "#study-settings", label: "Mục tiêu học", icon: BookOpen },
          { href: "#event-settings", label: "Theo dõi sự kiện", icon: Bell },
          { href: "#ai-settings", label: "Kiểm duyệt AI", icon: Bot },
        ].map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="group flex min-h-12 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-4 sm:text-sm"
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <SettingsSection
          id="general-settings"
          eyebrow="Nền tảng"
          title="Thông tin chung"
          description="Tên hiển thị và kênh liên hệ hỗ trợ của hệ thống."
          icon={<Settings2 aria-hidden="true" className="h-5 w-5" />}
        >
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Tên hệ thống</span>
            <span className="relative mt-2 block">
              <Settings2 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={draft.systemName}
                onChange={(event) => updateDraft((current) => ({ ...current, systemName: event.target.value }))}
                maxLength={80}
                required
                aria-label="Tên hệ thống"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </span>
            <span className="mt-1.5 block text-right text-[11px] text-slate-400">{draft.systemName.length}/80 ký tự</span>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Email hỗ trợ</span>
            <span className="relative mt-2 block">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={draft.supportEmail}
                onChange={(event) => updateDraft((current) => ({ ...current, supportEmail: event.target.value }))}
                maxLength={254}
                required
                aria-label="Email hỗ trợ"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </span>
            <span className="mt-1.5 block text-xs text-slate-500">Địa chỉ học viên sử dụng khi cần liên hệ.</span>
          </label>
        </SettingsSection>

        <SettingsSection
          id="study-settings"
          eyebrow="Trải nghiệm học viên"
          title="Mục tiêu học tập mặc định"
          description="Giá trị gợi ý cho học viên mới khi thiết lập kế hoạch học."
          icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
        >
          <div>
            <span className="text-xs font-semibold text-slate-700">Thời lượng mục tiêu mỗi ngày</span>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STUDY_DURATIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={draft.dailyStudyMinutes === minutes}
                  onClick={() => updateDraft((current) => ({ ...current, dailyStudyMinutes: minutes }))}
                  className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${draft.dailyStudyMinutes === minutes ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}
                >
                  {minutes} phút
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Giờ nhắc học mặc định</span>
            <span className="relative mt-2 block">
              <Clock3 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                value={draft.reminderTime}
                onChange={(event) => updateDraft((current) => ({ ...current, reminderTime: event.target.value }))}
                aria-label="Giờ nhắc học mặc định"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:w-48"
              />
            </span>
            <span className="mt-2 block rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
              Lưu thời điểm mặc định; lịch gửi nhắc tự động chưa được tích hợp.
            </span>
          </label>
        </SettingsSection>

        <SettingsSection
          id="event-settings"
          eyebrow="Quản trị"
          title="Theo dõi sự kiện"
          description="Chọn nhóm sự kiện cần theo dõi trong cấu hình quản trị."
          icon={<Activity aria-hidden="true" className="h-5 w-5" />}
        >
          <ToggleSetting
            title="Tài khoản đăng ký mới"
            description="Theo dõi nhóm sự kiện đăng ký tài khoản."
            checked={draft.notifications.newRegistrations}
            onChange={(checked) =>
              updateDraft((current) => ({
                ...current,
                notifications: { ...current.notifications, newRegistrations: checked },
              }))
            }
          />
          <ToggleSetting
            title="Yêu cầu hỗ trợ"
            description="Theo dõi các yêu cầu cần đội ngũ hỗ trợ xử lý."
            checked={draft.notifications.supportRequests}
            onChange={(checked) =>
              updateDraft((current) => ({
                ...current,
                notifications: { ...current.notifications, supportRequests: checked },
              }))
            }
          />
          <ToggleSetting
            title="Báo lỗi nội dung"
            description="Theo dõi phản hồi lỗi từ nội dung học tập."
            checked={draft.notifications.contentReports}
            onChange={(checked) =>
              updateDraft((current) => ({
                ...current,
                notifications: { ...current.notifications, contentReports: checked },
              }))
            }
          />
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-5 text-slate-600">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>Các lựa chọn được lưu trong hệ thống, chưa gửi email hoặc thông báo đẩy vì kênh gửi chưa được nối.</p>
          </div>
        </SettingsSection>

        <SettingsSection
          id="ai-settings"
          eyebrow="An toàn nội dung"
          title="Kiểm duyệt AI"
          description="Cấu hình vận hành kiểm duyệt nội dung được tạo bởi AI."
          icon={<ShieldCheck aria-hidden="true" className="h-5 w-5" />}
        >
          <ToggleSetting
            title="Bật kiểm duyệt AI"
            description="Lưu lựa chọn kiểm duyệt nội dung AI dùng chung toàn hệ thống."
            checked={draft.aiModerationEnabled}
            onChange={(checked) =>
              updateDraft((current) => ({ ...current, aiModerationEnabled: checked }))
            }
          />
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs leading-5 text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              Tự động đưa nội dung từ dịch vụ sinh AI vào hàng chờ chưa được tích hợp. Nội dung đã có trong hàng chờ được xử lý tại trang Kiểm duyệt AI.
            </p>
          </div>
        </SettingsSection>
      </div>

      <section className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges
                ? <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-600" />
                : <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-600" />}
              <p className={`text-sm font-semibold ${hasUnsavedChanges ? "text-amber-800" : "text-slate-800"}`}>
                {hasUnsavedChanges ? "Bạn có thay đổi chưa lưu" : "Mọi cài đặt đã được lưu"}
              </p>
            </div>
            <p className="mt-1 pl-6 text-[11px] text-slate-500">
              Phiên bản {savedSettings.version} · Cập nhật lần cuối{" "}
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(savedSettings.updatedAt))}
            </p>
            {feedback ? (
              <p
                role={feedbackIsError ? "alert" : "status"}
                aria-live="polite"
                className={`mt-1 pl-6 text-xs ${feedbackIsError ? "text-red-700" : "text-slate-600"}`}
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
                Tải cấu hình mới nhất
              </button>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={resetSettings}
              disabled={isSaving || isLoading || !hasUnsavedChanges}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Khôi phục mặc định
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={isSaving || isLoading || !hasUnsavedChanges}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {isSaving ? "Đang lưu…" : "Lưu cài đặt"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
