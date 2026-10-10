'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  LoaderCircle,
  Mail,
  User,
  X,
  UserPlus,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Power,
  RefreshCw,
  Phone,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import type { ManagedUser } from '@/lib/api/auth';
import { emptyUserDraft, validateUserDraft, type UserDraft, type UserFieldErrors } from './userManagement';

export function UserFormModal({
  user,
  currentUserId,
  saving,
  serverError,
  onClose,
  onSubmit,
  onClearServerError,
}: {
  user: ManagedUser | null;
  currentUserId: string | null;
  saving: boolean;
  serverError: string;
  onClose: () => void;
  onSubmit: (draft: UserDraft) => Promise<void>;
  onClearServerError: () => void;
}) {
  const idPrefix = useId();
  const formId = `${idPrefix}-form`;
  const isEditing = user !== null;
  const isSelf = user?.id === currentUserId;

  const [draft, setDraft] = useState<UserDraft>(() =>
    user
      ? { fullName: user.fullName, email: user.email, password: '', role: user.role, status: user.status }
      : emptyUserDraft
  );
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // UI-only states matching preview
  const [phone, setPhone] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, saving]);

  function updateDraft<K extends keyof UserDraft>(field: K, value: UserDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    onClearServerError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateUserDraft(draft, isEditing);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    await onSubmit({ ...draft, fullName: draft.fullName.trim(), email: draft.email.trim() });
  }

  function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateDraft('password', newPassword);
  }

  function renderError(field: keyof UserDraft) {
    if (!fieldErrors[field]) return null;
    return (
      <p id={`${idPrefix}-${field}-error`} className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
        <AlertCircle size={12} className="shrink-0" />
        <span>{fieldErrors[field]}</span>
      </p>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-200 ${
        isVisible ? 'bg-slate-950/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${idPrefix}-title`}
        className={`relative flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-98 opacity-0 translate-y-2'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={20} strokeWidth={2.2} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={`${idPrefix}-title`} className="text-base font-bold text-slate-900 sm:text-lg">
                  {isEditing ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                </h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                  Nội bộ
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                {isEditing
                  ? 'Cập nhật thông tin chi tiết và quyền truy cập của người dùng'
                  : 'Tạo tài khoản thành viên mới và thiết lập phân quyền truy cập hệ thống'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
        >
          <div className="space-y-5">
            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                  1
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Thông tin cơ bản
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${idPrefix}-fullName`} className="mb-1 block text-xs font-semibold text-slate-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={`${idPrefix}-fullName`}
                      autoComplete="name"
                      placeholder="Nguyễn Văn A"
                      maxLength={100}
                      value={draft.fullName}
                      onChange={(e) => updateDraft('fullName', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      className={`h-9.5 w-full rounded-lg border pl-9 pr-3 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 ${
                        fieldErrors.fullName
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                      }`}
                    />
                  </div>
                  {renderError('fullName')}
                </div>

                <div>
                  <label htmlFor={`${idPrefix}-email`} className="mb-1 block text-xs font-semibold text-slate-700">
                    Email đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={`${idPrefix}-email`}
                      disabled={isSelf}
                      type="email"
                      autoComplete="email"
                      placeholder="nguyenvana@example.com"
                      maxLength={255}
                      value={draft.email}
                      onChange={(e) => updateDraft('email', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.email)}
                      className={`h-9.5 w-full rounded-lg border pl-9 pr-3 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                        fieldErrors.email
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                      }`}
                    />
                  </div>
                  {renderError('email')}
                </div>

                <div className="sm:col-span-2">
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor={`${idPrefix}-phone`} className="block text-xs font-semibold text-slate-700">
                      Số điện thoại liên hệ
                    </label>
                    <span className="text-[11px] text-slate-400">Không bắt buộc</span>
                  </div>
                  <div className="relative">
                    <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={`${idPrefix}-phone`}
                      type="tel"
                      placeholder="0912 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9.5 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PHÂN QUYỀN & TRẠNG THÁI */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                  2
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Phân quyền & Trạng thái
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Vai trò hệ thống <span className="text-red-500">*</span>
                  </label>
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {/* Role: Học viên */}
                    <label
                      className={`relative flex cursor-pointer flex-col rounded-xl border p-2.5 transition-all ${
                        draft.role === 'STUDENT'
                          ? 'border-blue-600 bg-blue-50/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      } ${isSelf && draft.role !== 'STUDENT' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="STUDENT"
                        disabled={isSelf}
                        checked={draft.role === 'STUDENT'}
                        onChange={(e) => updateDraft('role', e.target.value as UserDraft['role'])}
                        className="sr-only"
                      />
                      <div className="mb-1.5 flex items-start justify-between">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md ${
                            draft.role === 'STUDENT' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <GraduationCap size={15} />
                        </div>
                        {draft.role === 'STUDENT' ? (
                          <CheckCircle2 size={16} className="text-blue-600" />
                        ) : (
                          <Circle size={16} className="text-slate-300" />
                        )}
                      </div>
                      <h4 className={`text-xs font-bold ${draft.role === 'STUDENT' ? 'text-blue-900' : 'text-slate-700'}`}>
                        Học viên
                      </h4>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">
                        Truy cập khóa học & làm bài luyện thi
                      </p>
                    </label>

                    {/* Role: Giảng viên */}
                    <label
                      className={`relative flex cursor-pointer flex-col rounded-xl border p-2.5 transition-all ${
                        draft.role === 'TEACHER'
                          ? 'border-emerald-500 bg-emerald-50/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      } ${isSelf && draft.role !== 'TEACHER' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="TEACHER"
                        disabled={isSelf}
                        checked={draft.role === 'TEACHER'}
                        onChange={(e) => updateDraft('role', e.target.value as UserDraft['role'])}
                        className="sr-only"
                      />
                      <div className="mb-1.5 flex items-start justify-between">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md ${
                            draft.role === 'TEACHER' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <BookOpen size={15} />
                        </div>
                        {draft.role === 'TEACHER' ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <Circle size={16} className="text-slate-300" />
                        )}
                      </div>
                      <h4 className={`text-xs font-bold ${draft.role === 'TEACHER' ? 'text-emerald-900' : 'text-slate-700'}`}>
                        Giảng viên
                      </h4>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">
                        Soạn đề thi, chấm điểm học viên
                      </p>
                    </label>

                    {/* Role: Quản trị viên */}
                    <label
                      className={`relative flex cursor-pointer flex-col rounded-xl border p-2.5 transition-all ${
                        draft.role === 'ADMIN'
                          ? 'border-purple-500 bg-purple-50/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      } ${isSelf && draft.role !== 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="ADMIN"
                        disabled={isSelf}
                        checked={draft.role === 'ADMIN'}
                        onChange={(e) => updateDraft('role', e.target.value as UserDraft['role'])}
                        className="sr-only"
                      />
                      <div className="mb-1.5 flex items-start justify-between">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md ${
                            draft.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <ShieldCheck size={15} />
                        </div>
                        {draft.role === 'ADMIN' ? (
                          <CheckCircle2 size={16} className="text-purple-500" />
                        ) : (
                          <Circle size={16} className="text-slate-300" />
                        )}
                      </div>
                      <h4 className={`text-xs font-bold ${draft.role === 'ADMIN' ? 'text-purple-900' : 'text-slate-700'}`}>
                        Quản trị viên
                      </h4>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">
                        Toàn quyền cấu hình và báo cáo
                      </p>
                    </label>
                  </div>
                  {renderError('role')}
                </div>

                {/* Status Toggle Card */}
                <div className="flex items-center justify-between rounded-xl border border-slate-150 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        draft.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Power size={17} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Trạng thái kích hoạt</h4>
                      <p className="text-[11px] text-slate-500">Cho phép đăng nhập ngay lập tức sau khi tạo</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSelf}
                    role="switch"
                    aria-checked={draft.status === 'ACTIVE'}
                    onClick={() => updateDraft('status', draft.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
                    className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                      draft.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        draft.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                {renderError('status')}
              </div>
            </div>

            {/* 3. BẢO MẬT & CẤP PHÁT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
                    3
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Bảo mật & Cấp phát
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  <RefreshCw size={12} />
                  <span>Tạo mật khẩu ngẫu nhiên</span>
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label htmlFor={`${idPrefix}-password`} className="mb-1 block text-xs font-semibold text-slate-700">
                    Mật khẩu khởi tạo {!isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <KeyRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id={`${idPrefix}-password`}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={isEditing ? 'Để trống nếu không muốn đổi' : 'Nhập mật khẩu...'}
                      maxLength={72}
                      value={draft.password}
                      onChange={(e) => updateDraft('password', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.password)}
                      className={`h-9.5 w-full rounded-lg border pl-9 pr-10 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                        fieldErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {renderError('password')}
                </div>

                {!isEditing && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-xs text-blue-900">
                    <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                    <p className="leading-relaxed">
                      Mật khẩu mặc định:{' '}
                      <span className="rounded border border-blue-200 bg-white px-1.5 py-0.5 font-mono font-medium text-blue-700">
                        abc@1234
                      </span>{' '}
                      đã được điền sẵn. Người dùng có thể đổi mật khẩu sau lần đăng nhập đầu tiên.
                    </p>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Gửi thông tin đăng nhập qua email</span>
                </label>
              </div>
            </div>

            {/* Alert messages */}
            {isSelf && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="leading-relaxed">
                  Bạn đang chỉnh sửa tài khoản chính mình. Vì lý do an toàn, các thông tin về Email, Vai trò và Trạng thái không thể tự thay đổi.
                </p>
              </div>
            )}

            {serverError && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <p className="leading-relaxed">{serverError}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-6">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <LoaderCircle size={14} className="animate-spin" />}
            <span>{saving ? 'Đang lưu...' : isEditing ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
