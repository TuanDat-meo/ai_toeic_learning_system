'use client';

import { LoaderCircle, X } from 'lucide-react';
import type { ManagedUser } from '@/lib/api/auth';

export function UserStatusConfirmModal({
  user,
  saving,
  onClose,
  onConfirm,
}: {
  user: ManagedUser;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isActive = user.status === 'ACTIVE';
  const action = isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="user-status-title" aria-describedby="user-status-description" className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div><h2 id="user-status-title" className="text-lg font-semibold text-on-surface">{action}?</h2><p id="user-status-description" className="mt-2 text-sm leading-6 text-on-surface-variant">{isActive ? <>Tài khoản <strong className="font-semibold text-on-surface">{user.email}</strong> sẽ không thể đăng nhập. Lịch sử và dữ liệu học tập vẫn được giữ lại.</> : <>Cho phép tài khoản <strong className="font-semibold text-on-surface">{user.email}</strong> đăng nhập trở lại.</>}</p></div>
          <button type="button" disabled={saving} onClick={onClose} aria-label="Đóng cửa sổ" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container disabled:opacity-50"><X size={18} /></button>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5 pt-6">
          <button type="button" disabled={saving} onClick={onClose} className="h-10 rounded-lg border border-outline-variant/70 px-4 text-sm font-medium text-on-surface hover:bg-surface-container disabled:opacity-50">Hủy</button>
          <button type="button" disabled={saving} onClick={onConfirm} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70 ${isActive ? 'bg-red-700 hover:bg-red-800' : 'bg-primary hover:brightness-110'}`}>{saving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : null}{saving ? 'Đang cập nhật...' : action}</button>
        </div>
      </section>
    </div>
  );
}