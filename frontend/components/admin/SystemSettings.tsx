"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bell, BookOpen, Bot, RotateCcw, Save, Settings2 } from "lucide-react";
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
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
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
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-slate-800">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-9 shrink-0 cursor-pointer accent-blue-600"
      />
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
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Settings2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Cấu hình được lưu dùng chung cho toàn hệ thống. Thay đổi mục tiêu học áp dụng làm mặc
          định cho học viên chưa chọn thời lượng; không ghi đè hồ sơ hiện có.
        </p>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <SettingsSection
          title="Thông tin chung"
          description="Tên hiển thị và địa chỉ liên hệ hỗ trợ của hệ thống."
          icon={<Settings2 aria-hidden="true" className="h-5 w-5" />}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tên hệ thống</span>
            <input
              value={draft.systemName}
              onChange={(event) => updateDraft((current) => ({ ...current, systemName: event.target.value }))}
              maxLength={80}
              required
              aria-label="Tên hệ thống"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email hỗ trợ</span>
            <input
              type="email"
              value={draft.supportEmail}
              onChange={(event) => updateDraft((current) => ({ ...current, supportEmail: event.target.value }))}
              maxLength={254}
              required
              aria-label="Email hỗ trợ"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </SettingsSection>

        <SettingsSection
          title="Mục tiêu học tập mặc định"
          description="Được chọn sẵn cho học viên mới trong bước thiết lập kế hoạch học tập."
          icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Thời lượng mục tiêu mỗi ngày</span>
            <select
              value={draft.dailyStudyMinutes}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, dailyStudyMinutes: Number(event.target.value) }))
              }
              aria-label="Thời lượng mục tiêu mỗi ngày"
              className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {STUDY_DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} phút mỗi ngày</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Giờ nhắc học mặc định</span>
            <input
              type="time"
              value={draft.reminderTime}
              onChange={(event) => updateDraft((current) => ({ ...current, reminderTime: event.target.value }))}
              aria-label="Giờ nhắc học mặc định"
              className="mt-2 block rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Lưu thời điểm mặc định; lịch gửi nhắc tự động chưa được tích hợp.
            </span>
          </label>
        </SettingsSection>

        <SettingsSection
          title="Tùy chọn theo dõi vận hành"
          description="Lưu lựa chọn theo dõi các nhóm sự kiện quản trị."
          icon={<Bell aria-hidden="true" className="h-5 w-5" />}
        >
          <ToggleSetting
            title="Tài khoản đăng ký mới"
            description="Bật hoặc tắt nhóm sự kiện đăng ký mới trong cấu hình."
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
            description="Bật hoặc tắt nhóm sự kiện yêu cầu hỗ trợ trong cấu hình."
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
            description="Bật hoặc tắt nhóm sự kiện báo lỗi nội dung trong cấu hình."
            checked={draft.notifications.contentReports}
            onChange={(checked) =>
              updateDraft((current) => ({
                ...current,
                notifications: { ...current.notifications, contentReports: checked },
              }))
            }
          />
          <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            Các lựa chọn sự kiện được lưu trong hệ thống; chúng chưa kích hoạt email hoặc thông báo
            đẩy vì kênh gửi chưa được nối.
          </p>
        </SettingsSection>

        <SettingsSection
          title="Kiểm duyệt AI"
          description="Cấu hình bật hoặc tắt kiểm duyệt nội dung AI."
          icon={<Bot aria-hidden="true" className="h-5 w-5" />}
        >
          <ToggleSetting
            title="Bật kiểm duyệt AI"
            description="Lưu lựa chọn vận hành kiểm duyệt nội dung do AI tạo."
            checked={draft.aiModerationEnabled}
            onChange={(checked) =>
              updateDraft((current) => ({ ...current, aiModerationEnabled: checked }))
            }
          />
          <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            Cấu hình được lưu dùng chung. Việc tự động đưa nội dung từ dịch vụ sinh AI vào queue
            chưa được tích hợp; nội dung đã có trong queue được xử lý tại trang Kiểm duyệt AI.
          </p>
        </SettingsSection>

        <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Lưu thay đổi</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Phiên bản {savedSettings.version} · Cập nhật lần cuối{" "}
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(savedSettings.updatedAt))}
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetSettings}
              disabled={isSaving || isLoading || !hasUnsavedChanges}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Khôi phục mặc định
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={isSaving || isLoading || !hasUnsavedChanges}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {isSaving ? "Đang lưu…" : "Lưu cài đặt"}
            </button>
          </div>
          {hasConflict ? (
            <button
              type="button"
              onClick={reloadSettings}
              disabled={isLoading}
              className="mt-4 self-start text-sm font-semibold text-blue-700 underline underline-offset-2 disabled:opacity-50"
            >
              Tải cấu hình mới nhất
            </button>
          ) : null}
          <p
            role={feedbackIsError ? "alert" : "status"}
            aria-live="polite"
            className={`mt-4 min-h-5 text-sm ${feedbackIsError ? "text-red-700" : "text-slate-600"}`}
          >
            {feedback}
          </p>
        </section>
      </div>
    </div>
  );
}
