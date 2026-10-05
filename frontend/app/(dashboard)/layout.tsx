import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header />
        <main className="w-full flex-1 bg-surface px-4 py-6 pt-20 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
}
