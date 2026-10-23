import { Header } from "@/components/layout/Header";
import { StudentChatBubble } from "@/components/layout/StudentChatBubble";
import { StudentStudyTracker } from "@/components/layout/StudentStudyTracker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1 bg-surface px-4 py-6 pt-24 sm:px-6 lg:px-8">
        {children}
      </main>
      <StudentChatBubble />
      <StudentStudyTracker />
    </div>
  );
}
