import type { AuthUser, ManagedUser } from '@/lib/api/auth';

export type UserDraft = {
  fullName: string;
  email: string;
  password: string;
  role: AuthUser['role'];
  status: ManagedUser['status'];
};

export type UserFieldErrors = Partial<Record<keyof UserDraft, string>>;
export type UserRoleFilter = 'ALL' | AuthUser['role'];
export type UserStatusFilter = 'ALL' | ManagedUser['status'];

export const emptyUserDraft: UserDraft = {
  fullName: '',
  email: '',
  password: 'abc@1234',
  role: 'STUDENT',
  status: 'ACTIVE',
};

export function validateUserDraft(draft: UserDraft, isEditing: boolean): UserFieldErrors {
  const errors: UserFieldErrors = {};
  const fullName = draft.fullName.trim();
  const email = draft.email.trim();
  const password = draft.password;

  if (!fullName) errors.fullName = 'Vui lòng nhập họ và tên.';
  else if (fullName.length < 2) errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
  else if (fullName.length > 100) errors.fullName = 'Họ và tên không được vượt quá 100 ký tự.';

  if (!email) errors.email = 'Vui lòng nhập địa chỉ email.';
  else if (email.length > 255) errors.email = 'Email không được vượt quá 255 ký tự.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)) errors.email = 'Vui lòng nhập email đúng định dạng, ví dụ ten@vidu.com.';

  if (!isEditing && !password) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (password && password.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
  else if (password && password.length > 72) errors.password = 'Mật khẩu không được vượt quá 72 ký tự.';

  if (draft.role !== 'ADMIN' && draft.role !== 'STUDENT' && draft.role !== 'TEACHER') errors.role = 'Vui lòng chọn vai trò hợp lệ.';
  if (draft.status !== 'ACTIVE' && draft.status !== 'DISABLED') errors.status = 'Vui lòng chọn trạng thái hợp lệ.';

  return errors;
}

export function normalizeUserSearch(value: string) {
  return value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function filterManagedUsers(
  users: ManagedUser[],
  search: string,
  role: UserRoleFilter,
  status: UserStatusFilter,
) {
  const query = normalizeUserSearch(search.trim());
  return users.filter((user) => {
    const matchesSearch = !query || normalizeUserSearch(`${user.fullName} ${user.email}`).includes(query);
    const matchesRole = role === 'ALL' || user.role === role;
    const matchesStatus = status === 'ALL' || user.status === status;
    return matchesSearch && matchesRole && matchesStatus;
  });
}

export function formatUserDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không xác định';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

function escapeCsvCell(value: string) {
  const safeValue = /^[=+@\-\t\r]/u.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function exportManagedUsersCsv(users: ManagedUser[]) {
  const rows = [
    ['Họ và tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo'],
    ...users.map((user) => [
      user.fullName,
      user.email,
      user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'TEACHER' ? 'Giáo viên' : 'Học viên',
      user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa',
      formatUserDate(user.createdAt),
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `danh-sach-tai-khoan-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function getUserRequestError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
