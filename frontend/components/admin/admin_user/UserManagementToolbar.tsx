'use client';

import { Search } from 'lucide-react';
import type { UserRoleFilter, UserStatusFilter } from './userManagement';

export function UserManagementToolbar({
  search,
  role,
  status,
  resultCount,
  totalCount,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: {
  search: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: UserRoleFilter) => void;
  onStatusChange: (value: UserStatusFilter) => void;
}) {
  return (
    <section aria-label="Tìm kiếm và thao tác tài khoản" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_4px_rgba(15,23,42,0.03)] sm:p-4">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(220px,1fr)_repeat(2,minmax(150px,auto))] xl:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Tìm theo họ tên hoặc email</span>
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm theo tên hoặc email" className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" />
        </label>
        <label>
          <span className="sr-only">Lọc theo vai trò</span>
          <select value={role} onChange={(event) => onRoleChange(event.target.value as UserRoleFilter)} className="h-11 w-full min-w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 sm:w-auto">
            <option value="ALL">Tất cả vai trò</option>
            <option value="STUDENT">Học viên</option>
            <option value="TEACHER">Giáo viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo trạng thái</span>
          <select value={status} onChange={(event) => onStatusChange(event.target.value as UserStatusFilter)} className="h-11 w-full min-w-40 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 sm:w-auto">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="DISABLED">Đã khóa</option>
          </select>
        </label>
      </div>
      <p aria-live="polite" className="px-1 text-xs text-slate-500">Hiển thị <strong className="font-semibold text-slate-700">{resultCount.toLocaleString('vi-VN')}</strong> trên tổng số <strong className="font-semibold text-slate-700">{totalCount.toLocaleString('vi-VN')}</strong> tài khoản</p>
    </section>
  );
}
