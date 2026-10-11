export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page relative min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(27,65,174,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(0,112,102,0.12),transparent_24%),linear-gradient(180deg,#f8f9ff_0%,#eef3ff_100%)] font-sans antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,0.8),transparent_22%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
