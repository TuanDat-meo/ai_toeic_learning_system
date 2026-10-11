'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { resetPassword } from '@/lib/api/auth';
import { AuthHeading, AuthSubmitButton, PasswordField } from './AuthFormParts';

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmation?: string }>({});
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const errors: typeof fieldErrors = {};
    if (!password) errors.password = 'Vui lòng nhập mật khẩu mới.';
    else if (password.length < 8) errors.password = 'Mật khẩu cần tối thiểu 8 ký tự.';
    else if (password.length > 72) errors.password = 'Mật khẩu không được vượt quá 72 ký tự.';

    if (!confirmation) errors.confirmation = 'Vui lòng nhập lại mật khẩu mới.';
    else if (password !== confirmation) errors.confirmation = 'Mật khẩu xác nhận chưa trùng khớp.';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Liên kết không hợp lệ hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AuthHeading title="Đặt lại mật khẩu" description="Chọn mật khẩu mới để tiếp tục sử dụng tài khoản TOEIC AI." />
      {submitted ? (
        <div role="status" aria-live="polite" className="space-y-4 rounded-md border border-tertiary/30 bg-tertiary/10 p-4 text-sm text-on-surface">
          <p>Mật khẩu đã được cập nhật.</p>
          <Link href="/login" className="inline-flex font-semibold text-primary underline underline-offset-4">Đăng nhập</Link>
        </div>
      ) : !token ? (
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p role="alert">Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <Link href="/forgot-password" className="inline-flex font-semibold text-primary underline underline-offset-4">Yêu cầu liên kết mới</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField id="new-password" label="Mật khẩu mới" value={password} onChange={(value) => { setPassword(value); setFieldErrors((prev) => ({ ...prev, password: undefined })); setError(''); }} minLength={8} maxLength={72} autoComplete="new-password" error={fieldErrors.password} />
          <PasswordField id="confirm-password" label="Nhập lại mật khẩu mới" value={confirmation} onChange={(value) => { setConfirmation(value); setFieldErrors((prev) => ({ ...prev, confirmation: undefined })); setError(''); }} minLength={8} maxLength={72} autoComplete="new-password" error={fieldErrors.confirmation} />
          <p className="text-xs text-on-surface-variant">Mật khẩu cần từ 8 đến 72 ký tự.</p>
          {error ? <p role="alert" aria-live="polite" className="text-sm font-medium text-error">{error}</p> : null}
          <AuthSubmitButton disabled={submitting}>{submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</AuthSubmitButton>
        </form>
      )}
    </div>
  );
}
