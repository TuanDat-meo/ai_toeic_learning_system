import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(27,65,174,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(0,112,102,0.12),transparent_24%),linear-gradient(180deg,#f8f9ff_0%,#eef3ff_100%)] font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,0.8),transparent_22%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1100px] items-center overflow-hidden px-4 py-6 sm:px-6 lg:px-0 lg:py-10">
      <div className="grid items-stretch overflow-hidden rounded-xl border border-outline-variant/40 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.1)] backdrop-blur-sm lg:min-h-[620px] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#edf3ff_0%,#e6efff_52%,#dce9ff_100%)] p-7 text-on-surface lg:flex lg:h-full lg:min-h-[620px] lg:flex-col lg:gap-6 xl:p-8">
          <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-tertiary/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),transparent_26%)]" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-on-surface-variant"><span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-white"><span className="material-symbols-outlined text-[15px]">school</span></span>TOEIC AI</span>
            <h1 className="mt-5 max-w-md text-[25px] font-bold leading-tight text-on-surface">Tài khoản học tập TOEIC của bạn</h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-on-surface-variant">Tạo tài khoản bằng họ tên, email và mật khẩu. Hồ sơ học tập được quản lý riêng với thông tin tài khoản.</p>
            <div className="mt-5 space-y-3">
              <div className="flex gap-3 rounded-sm border border-white/70 bg-white/75 p-3 shadow-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><span className="material-symbols-outlined text-[18px]">person</span></span><div><strong className="block text-[13px]">Thông tin tài khoản</strong><p className="mt-0.5 text-[12px] leading-tight text-on-surface-variant">Họ tên và email dùng để nhận diện tài khoản học viên.</p></div></div>
              <div className="flex gap-3 rounded-sm border border-white/70 bg-white/75 p-3 shadow-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><span className="material-symbols-outlined text-[18px]">lock</span></span><div><strong className="block text-[13px]">Thông tin đăng nhập</strong><p className="mt-0.5 text-[12px] leading-tight text-on-surface-variant">Dùng email và mật khẩu để truy cập tài khoản TOEIC AI.</p></div></div>
            </div>
          </div>
          <div className="relative z-10 rounded-sm border border-white/70 bg-white/80 p-3 text-[12px] leading-relaxed text-on-surface-variant shadow-sm"><strong className="block text-on-surface">Hồ sơ học tập riêng</strong><span>Mô hình dữ liệu tách thông tin học tập khỏi thông tin đăng nhập.</span></div>
        </aside>

        <main className="relative flex flex-col items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(237,242,255,0.96))] px-4 py-7 sm:px-10 sm:py-10 lg:px-12 xl:px-14">
          <div className="mb-6 flex w-full max-w-[440px] items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 lg:hidden" aria-label="Về trang chủ TOEIC AI"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20 transition group-hover:scale-105"><span className="material-symbols-outlined">school</span></span><span className="font-headline-sm text-headline-sm font-bold">TOEIC AI</span></Link>
            <Link href="/" className="ml-auto font-label-md text-label-md font-semibold text-on-surface-variant transition hover:text-primary">Về trang chủ</Link>
          </div>
          <div className="auth-card w-full max-w-[440px] rounded-[24px] border border-outline-variant/60 bg-white/80 p-5 shadow-[0_16px_30px_rgba(27,65,174,0.08)] backdrop-blur-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}
