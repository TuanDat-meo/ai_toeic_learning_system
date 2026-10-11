import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ArrowLeft } from 'lucide-react';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const token = typeof query.token === 'string' ? query.token : '';

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Unified Stepper Card Container */}
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl sm:p-8">
        {/* Integrated Top Header */}
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Về trang giới thiệu</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white">
              <span className="material-symbols-outlined text-[15px]">school</span>
            </span>
            <span className="text-xs font-bold tracking-tight text-on-surface">TOEIC AI</span>
          </div>
        </div>

        <ForgotPasswordForm initialToken={token} />
      </div>
    </div>
  );
}