'use client';

import { Ban, Check, LoaderCircle, Pencil, UsersRound } from 'lucide-react';
import type { ManagedUser } from '@/lib/api/auth';
import { formatUserDate } from './userManagement';

export function UserManagementTable({
  users,
  loading,
  hasError,
  hasAnyUsers,
  currentUserId,
  workingUserId,
  currentPage,
  pageSize,
  totalCount,
  pageCount,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onChangeStatus,
}: {
  users: ManagedUser[];
  loading: boolean;
  hasError: boolean;
  hasAnyUsers: boolean;
  currentUserId: string | null;
  workingUserId: string | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (user: ManagedUser) => void;
  onChangeStatus: (user: ManagedUser) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left [&_th]:border-b [&_th]:border-r [&_th]:border-slate-200 [&_th:last-child]:border-r-0 [&_td]:border-b [&_td]:border-r [&_td]:border-slate-100 [&_td:last-child]:border-r-0 [&_tbody_tr:last-child_td]:border-b-0">
          <thead className="bg-slate-50 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-4">Thành viên</th>
              <th scope="col" className="px-4 py-4">Vai trò &amp; quyền</th>
              <th scope="col" className="px-4 py-4">Trạng thái</th>
              <th scope="col" className="px-4 py-4">Ngày tạo</th>
              <th scope="col" className="px-5 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array.from({ length: 4 }, (_, index) => (
              <tr key={index}><td colSpan={5} className="px-4 py-5"><div className="h-4 max-w-sm animate-pulse rounded bg-surface-container" /></td></tr>
            )) : users.map((user) => {
              const isSelf = currentUserId === user.id;
              const isWorking = workingUserId === user.id;
              return (
                <tr key={user.id} className="transition hover:bg-blue-50/30">
                  <td className="px-5 py-5"><div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-xs font-bold text-blue-700">{user.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]?.toLocaleUpperCase()).join('')}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{user.fullName}{isSelf ? ' (Bạn)' : ''}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{user.email}</span><span className="mt-1 block font-mono text-[10px] text-slate-400">ID: {user.id.slice(0, 8).toUpperCase()}</span></span></div></td>
                  <td className="px-4 py-5"><span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${user.role === 'ADMIN' ? 'border-blue-200 bg-blue-50 text-blue-700' : user.role === 'TEACHER' ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'TEACHER' ? 'Giáo viên' : 'Học viên'}</span><p className="mt-2 text-xs text-slate-400">{user.role === 'ADMIN' ? 'Quyền quản trị hệ thống' : user.role === 'TEACHER' ? 'Tài khoản giảng dạy' : 'Tài khoản học viên'}</p></td>
                  <td className="px-4 py-5"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${user.status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-400'}`} />{user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                  <td className="px-4 py-5 text-sm text-slate-500">{formatUserDate(user.createdAt)}</td>
                  <td className="px-5 py-5"><div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => onEdit(user)} title="Chỉnh sửa tài khoản" aria-label={`Chỉnh sửa tài khoản ${user.email}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"><Pencil size={16} aria-hidden="true" /></button>
                    <button type="button" disabled={isSelf || isWorking} onClick={() => onChangeStatus(user)} title={isSelf ? 'Không thể tự khóa tài khoản' : user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} aria-label={user.status === 'ACTIVE' ? `Khóa tài khoản ${user.email}` : `Mở khóa tài khoản ${user.email}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">{isWorking ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : user.status === 'ACTIVE' ? <Ban size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}</button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {loading ? <p role="status" className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-4 text-sm text-on-surface-variant"><LoaderCircle size={16} className="animate-spin" /> Đang tải tài khoản...</p> : null}
      {!loading && !hasError && users.length === 0 ? <div className="px-6 py-14 text-center"><UsersRound size={28} className="mx-auto text-on-surface-variant/60" aria-hidden="true" /><h2 className="mt-3 text-sm font-semibold text-on-surface">{hasAnyUsers ? 'Không tìm thấy tài khoản phù hợp' : 'Chưa có tài khoản nào'}</h2><p className="mt-1 text-sm text-on-surface-variant">{hasAnyUsers ? 'Thử đổi từ khóa tìm kiếm hoặc điều kiện lọc.' : 'Thêm tài khoản đầu tiên để bắt đầu quản lý.'}</p></div> : null}
      {!loading && !hasError && totalCount > 0 ? (
        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>Hiển thị <strong className="font-semibold text-slate-700">{((currentPage - 1) * pageSize + 1).toLocaleString('vi-VN')}–{Math.min(currentPage * pageSize, totalCount).toLocaleString('vi-VN')}</strong> trên {totalCount.toLocaleString('vi-VN')} tài khoản</span>
            <label className="inline-flex items-center gap-2">Số dòng
              <select aria-label="Số dòng mỗi trang" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-blue-500">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
            </label>
          </div>
          <nav aria-label="Chuyển trang danh sách người dùng" className="flex items-center gap-2 self-end sm:self-auto">
            <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
            <span aria-live="polite" className="min-w-20 text-center text-xs text-slate-500">Trang {currentPage} / {pageCount}</span>
            <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= pageCount} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
          </nav>
        </footer>
      ) : null}
    </section>
  );
}
