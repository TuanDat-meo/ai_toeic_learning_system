'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import {
  createManagedUser,
  deleteManagedUser,
  getCurrentUser,
  listManagedUsers,
  updateManagedUser,
  type AuthUser,
  type ManagedUser,
} from '@/lib/api/auth';
import { UserFormModal } from './UserFormModal';
import { UserManagementTable } from './UserManagementTable';
import { UserManagementToolbar } from './UserManagementToolbar';
import { UserStatusConfirmModal } from './UserStatusConfirmModal';
import {
  exportManagedUsersCsv,
  filterManagedUsers,
  getUserRequestError,
  type UserDraft,
  type UserRoleFilter,
  type UserStatusFilter,
} from './userManagement';

export function AdminUsersManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusUser, setStatusUser] = useState<ManagedUser | null>(null);
  const [workingUserId, setWorkingUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listManagedUsers()
      .then((result) => { if (active) setUsers(result); })
      .catch((requestError: unknown) => {
        if (active) setError(getUserRequestError(requestError, 'Không thể tải danh sách tài khoản.'));
      })
      .finally(() => { if (active) setLoading(false); });
    getCurrentUser().then((user) => { if (active) setCurrentUser(user); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const filteredUsers = filterManagedUsers(users, search, roleFilter, statusFilter);
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const studentCount = users.filter((user) => user.role === 'STUDENT').length;
  const teacherCount = users.filter((user) => user.role === 'TEACHER').length;
  const adminCount = users.filter((user) => user.role === 'ADMIN').length;
  const disabledCount = users.filter((user) => user.status === 'DISABLED').length;

  const refreshUsers = useCallback(async () => {
    try {
      setUsers(await listManagedUsers());
      setError('');
      return true;
    } catch (requestError) {
      setError(getUserRequestError(requestError, 'Không thể làm mới danh sách tài khoản.'));
      return false;
    }
  }, []);

  const closeForm = useCallback(() => {
    if (!saving) setFormOpen(false);
  }, [saving]);

  function openCreateModal() {
    setEditingUser(null);
    setFormError('');
    setNotice('');
    setFormOpen(true);
  }

  function openEditModal(user: ManagedUser) {
    setEditingUser(user);
    setFormError('');
    setNotice('');
    setFormOpen(true);
  }

  async function saveUser(draft: UserDraft) {
    setFormError('');
    setSaving(true);
    try {
      if (editingUser) {
        await updateManagedUser(editingUser.id, {
          fullName: draft.fullName,
          email: draft.email,
          ...(draft.password ? { password: draft.password } : {}),
          role: draft.role,
          status: draft.status,
        });
        setNotice(`Đã cập nhật tài khoản ${draft.email}.`);
      } else {
        await createManagedUser({ fullName: draft.fullName, email: draft.email, password: draft.password, role: draft.role });
        setNotice(`Đã tạo tài khoản ${draft.email}.`);
      }
      setFormOpen(false);
      await refreshUsers();
    } catch (requestError) {
      setFormError(getUserRequestError(requestError, 'Không thể lưu tài khoản. Vui lòng thử lại.'));
    } finally {
      setSaving(false);
    }
  }

  async function changeUserStatus() {
    if (!statusUser) return;
    const user = statusUser;
    setError('');
    setNotice('');
    setWorkingUserId(user.id);
    try {
      if (user.status === 'ACTIVE') {
        await deleteManagedUser(user.id);
        setNotice(`Đã khóa tài khoản ${user.email}. Dữ liệu học tập được giữ nguyên.`);
      } else {
        await updateManagedUser(user.id, { fullName: user.fullName, email: user.email, role: user.role, status: 'ACTIVE' });
        setNotice(`Đã mở khóa tài khoản ${user.email}.`);
      }
      setStatusUser(null);
      await refreshUsers();
    } catch (requestError) {
      setError(getUserRequestError(requestError, 'Không thể cập nhật trạng thái tài khoản.'));
      setStatusUser(null);
    } finally {
      setWorkingUserId(null);
    }
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-slate-400">Trang chủ <span className="px-1.5">/</span> Hệ thống <span className="px-1.5">/</span> <span className="font-semibold text-blue-700">Quản lý người dùng</span></p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-[30px]">Quản lý người dùng &amp; phân quyền</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">Theo dõi tài khoản, phân loại học viên và quản trị viên, kiểm soát quyền truy cập.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">{loading ? 'Đang tải...' : `${users.length.toLocaleString('vi-VN')} thành viên`}</span>
          <button type="button" disabled={loading || filteredUsers.length === 0} onClick={() => exportManagedUsersCsv(filteredUsers)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Download size={16} aria-hidden="true" />Xuất CSV</button>
          <button type="button" onClick={openCreateModal} className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"><span aria-hidden="true">+</span>Thêm tài khoản mới</button>
        </div>
      </header>

      <nav aria-label="Lọc nhanh tài khoản" className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {[
          { label: 'Tất cả tài khoản', count: users.length, selected: roleFilter === 'ALL' && statusFilter === 'ALL', apply: () => { setRoleFilter('ALL'); setStatusFilter('ALL'); setPage(1); } },
          { label: 'Học viên', count: studentCount, selected: roleFilter === 'STUDENT' && statusFilter === 'ALL', apply: () => { setRoleFilter('STUDENT'); setStatusFilter('ALL'); setPage(1); } },
          { label: 'Giáo viên', count: teacherCount, selected: roleFilter === 'TEACHER' && statusFilter === 'ALL', apply: () => { setRoleFilter('TEACHER'); setStatusFilter('ALL'); setPage(1); } },
          { label: 'Quản trị viên', count: adminCount, selected: roleFilter === 'ADMIN' && statusFilter === 'ALL', apply: () => { setRoleFilter('ADMIN'); setStatusFilter('ALL'); setPage(1); } },
          { label: 'Đã khóa', count: disabledCount, selected: statusFilter === 'DISABLED', apply: () => { setRoleFilter('ALL'); setStatusFilter('DISABLED'); setPage(1); } },
        ].map((tab) => (
          <button key={tab.label} type="button" onClick={tab.apply} aria-current={tab.selected ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition ${tab.selected ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab.label}<span className={`rounded-full px-2 py-0.5 text-[11px] ${tab.selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{tab.count.toLocaleString('vi-VN')}</span>
          </button>
        ))}
      </nav>

      <UserManagementToolbar search={search} role={roleFilter} status={statusFilter} resultCount={filteredUsers.length} totalCount={users.length} onSearchChange={(value) => { setSearch(value); setPage(1); }} onRoleChange={(value) => { setRoleFilter(value); setPage(1); }} onStatusChange={(value) => { setStatusFilter(value); setPage(1); }} />

      {notice ? <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p> : null}
      {error ? <div role="alert" className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"><p>{error}</p><button type="button" disabled={loading} onClick={() => { setLoading(true); void refreshUsers().finally(() => setLoading(false)); }} className="shrink-0 font-semibold underline underline-offset-2 disabled:opacity-50">Tải lại danh sách</button></div> : null}

      <UserManagementTable users={pageUsers} loading={loading} hasError={Boolean(error)} hasAnyUsers={users.length > 0} currentUserId={currentUser?.id ?? null} workingUserId={workingUserId} currentPage={currentPage} pageSize={pageSize} totalCount={filteredUsers.length} pageCount={pageCount} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} onEdit={openEditModal} onChangeStatus={setStatusUser} />

      {formOpen ? <UserFormModal key={editingUser?.id ?? 'new-user'} user={editingUser} currentUserId={currentUser?.id ?? null} saving={saving} serverError={formError} onClose={closeForm} onSubmit={saveUser} onClearServerError={() => setFormError('')} /> : null}
      {statusUser ? <UserStatusConfirmModal user={statusUser} saving={workingUserId === statusUser.id} onClose={() => { if (!workingUserId) setStatusUser(null); }} onConfirm={() => void changeUserStatus()} /> : null}
    </main>
  );
}
